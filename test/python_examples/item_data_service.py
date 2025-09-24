from __future__ import annotations
from typing import Any, Dict, List, Optional
import math
import re

ICON_CDN_PREFIX = "https://cdn.nwdb.info/db/images/live/v56/"


def _icon_url_from_icon_field(icon: Optional[str]) -> Optional[str]:
    if not icon:
        return None
    path = str(icon).lstrip("/")
    if not path.endswith(".png"):
        path += ".png"
    return f"{ICON_CDN_PREFIX}{path}"


def _str_list(v) -> List[str]:
    if isinstance(v, list):
        return [str(x) for x in v if x]
    return []


def _take(objs: Optional[List[dict]], cap: int) -> List[dict]:
    if not isinstance(objs, list) or not objs:
        return []
    return [o for o in objs if isinstance(o, dict)][:cap]


def _non_empty(d: Dict[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in d.items() if v or v == 0}


def _entity_link(ent: Dict[str, Any]) -> Optional[str]:
    ent_type = ent.get("type")
    ent_id = ent.get("id")
    if ent_type and ent_id:
        return f"https://nwdb.info/db/{ent_type}/{ent_id}"
    return None


def build_item_info(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build a simplified, embed-friendly JSON from NWDB item payload (expects the inner `data`).

    Output shape:
    {
      "name": str,
      "link": str,
      "gearScore": int|None,
      "type": str|None,
      "tier": int|None,
      "classes": [str],
      "perks": [{"name": str, "description": str}],
      "acquisition": {
         "craftedAt": [{"id": str, "name": str}],
         "pvpReward": [{"tags": [str], "priceDat": Any}],
         "questReward": [str],
         "shop": {"RankCheckCategoricalProgressionId": Any, "BuyCurrencyCost": Any, "CategoricalProgressionId": Any, "BuyCategoricalProgressionCost": Any},
         "specialSource": [str],
         "gatheredFrom": [{"id": str, "name": str}],
         "droppedFrom": [{"id": str, "name": str}],
         "droppedBy": [{"name": str, "lootTagRestrictions": Any}],
         "seasonRewards": [{"season": Any, "level": Any, "type": Any}],
         "trialDrop": [{"name": str}],
      }
    }
    Missing/empty sections are omitted.
    """

    d = raw or {}
    item_id = d.get("id")
    gs_max = d.get("gearScoreMax")

    # Core fields
    # Helpers: perk scaling and description evaluation
    GS_MIN_DEFAULT = 100

    def _parse_scaling(s: Optional[str]) -> Dict[str, Any]:
        """Parse ScalingPerGearScore like '0.0019,625:0.006667,700:0.00'.
        Returns {"segments": [(startGS:int, slope:float)], "capGS": int|None}.
        Interpretation: piecewise linear per-GS slope. First number is the initial
        slope starting at GS_MIN_DEFAULT. Each 'N:V' defines a new slope V starting at GS N.
        The largest N is treated as capGS (no increases beyond it when clamping GS).
        """
        segs: List[tuple] = []
        cap_gs = None
        if not s or not isinstance(s, str):
            return {"segments": segs, "capGS": cap_gs}
        parts = [p.strip() for p in s.split(",") if p is not None and p.strip() != ""]
        # initial slope
        if parts:
            try:
                first_slope = float(parts[0])
                segs.append((GS_MIN_DEFAULT, first_slope))
            except Exception:
                pass
        # anchors
        for token in parts[1:]:
            if ":" in token:
                left, right = token.split(":", 1)
                try:
                    g = int(float(left))
                except Exception:
                    continue
                try:
                    slope = float(right)
                except Exception:
                    continue
                segs.append((g, slope))
                if (cap_gs is None) or (g > cap_gs):
                    cap_gs = g
        # sort segments by start GS and dedupe by start (keep last occurrence)
        segs_dict: Dict[int, float] = {}
        for g, sl in segs:
            segs_dict[int(g)] = float(sl)
        segs = sorted(segs_dict.items(), key=lambda x: x[0])
        return {"segments": segs, "capGS": cap_gs}

    # Known UI values at GS 700 to anchor intercepts precisely (final percent numbers shown in UI).
    # Map: perkId -> final_percent_at_700 (not the multiplier; the displayed percentage).
    PERK_UI700_PERCENT: Dict[str, float] = {
        # Divine (amulet): shows 10% at GS 700
        "perkid_amulet_healing": 10.0,
        # Refreshing Move: shows 2.5% at GS 700
        "perkid_weapon_cdrbasic": 2.5,
        # Trenchant Strikes/Crits (your IDs)
        "perkid_weapon_melee_chargedheavy_dmg": 20.0,
        "perkid_weapon_melee_chargedheavy_crit": 31.0,
    }

    # Optional per-perk max multiplier overrides when no UI-700 anchor is known
    PERK_MAX_MULTIPLIER: Dict[str, float] = {
        # Keep legacy cap only as fallback when we cannot anchor via UI700
        "perkid_amulet_healing": 2.0,
    }

    def _area_to_gs(segs: List[tuple], gs_start: int, gs_end: int) -> float:
        """Sum slope*span across segments from gs_start to gs_end (exclusive of upper bound)."""
        if gs_end <= gs_start or not segs:
            return 0.0
        total = 0.0
        limit = gs_end
        for idx, (start, slope) in enumerate(segs):
            s = max(gs_start, int(start))
            next_start = segs[idx + 1][0] if idx + 1 < len(segs) else limit
            e = min(int(next_start), limit)
            span = max(0, e - s)
            if span > 0:
                total += float(slope) * span
        return total

    # Extract the constant X from a pattern like ${X * perkMultiplier}
    _PM_COEFF = re.compile(r"\$\{\s*([0-9]+(?:\.[0-9]+)?)\s*\*\s*perkMultiplier\s*\}")

    def _perk_multiplier(gs: Optional[int], scaling: Optional[str], perk_id: Optional[str], desc: Optional[str] = None) -> float:
        meta = _parse_scaling(scaling or "")
        segs = meta.get("segments") or []
        if not isinstance(gs, int) or not segs:
            return 1.0
        cap_gs = meta.get("capGS") or 700
        g_eff = max(GS_MIN_DEFAULT, min(int(gs), int(cap_gs)))
        # Try to anchor intercept using known UI700 value if available and we can extract X
        ui700 = PERK_UI700_PERCENT.get(str(perk_id or ""))
        base_x = None
        if isinstance(desc, str):
            m = _PM_COEFF.search(desc)
            if m:
                try:
                    base_x = float(m.group(1))
                except Exception:
                    base_x = None

        if isinstance(ui700, (int, float)) and isinstance(base_x, (int, float)) and base_x != 0:
            target_m700 = float(ui700) / float(base_x)
            # area from 100 to 700 based on slopes
            area_100_700 = _area_to_gs(segs, GS_MIN_DEFAULT, 700)
            intercept = target_m700 - area_100_700
            # compute area from 100 to g_eff
            area_100_g = _area_to_gs(segs, GS_MIN_DEFAULT, g_eff)
            mult = float(intercept) + area_100_g
            return mult
        else:
            # Fallback to baseline of 1.0 plus accumulated area up to g_eff
            total = _area_to_gs(segs, GS_MIN_DEFAULT, g_eff)
            mult = 1.0 + total
            max_mult = PERK_MAX_MULTIPLIER.get(str(perk_id or ""))
            if isinstance(max_mult, (int, float)):
                mult = min(mult, float(max_mult))
            return mult

    _SAFE_EXPR = re.compile(r"\$\{([^}]+)\}")

    def _eval_perk_description(desc: Optional[str], mult: float) -> str:
        """Replace ${...} with evaluated numbers using variable perkMultiplier.
        Supports basic arithmetic only. Formats numbers to at most 2 decimals, trimming zeros.
        """
        if not desc or not isinstance(desc, str):
            return desc or ""

        def _fmt_num(val: float) -> str:
            if val is None:
                return ""
            # prefer int when very close
            if abs(val - round(val)) < 1e-9:
                return str(int(round(val)))
            s = f"{val:.2f}"
            s = s.rstrip("0").rstrip(".")
            return s

        def repl(m: re.Match) -> str:
            expr = m.group(1)
            # whitelist variables and operators
            allowed_names = {"perkMultiplier": mult}
            try:
                # Evaluate with empty globals and allowed locals
                val = eval(expr, {"__builtins__": {}}, allowed_names)
                if isinstance(val, (int, float)):
                    return _fmt_num(float(val))
                return str(val)
            except Exception:
                return m.group(0)

        return _SAFE_EXPR.sub(repl, desc)

    out: Dict[str, Any] = {
        "name": d.get("name"),
        "link": f"https://nwdb.info/db/item/{item_id}" if item_id else None,
        "gearScore": gs_max,
        "type": d.get("typeName"),
        "tier": d.get("tier"),
        "classes": _str_list(d.get("itemClass")),
        "iconUrl": _icon_url_from_icon_field(d.get("icon")),
        "perks": [
            (lambda _p: {
                "id": _p.get("id"),
                "name": _p.get("name"),
                "description": _eval_perk_description(
                    _p.get("description"),
                    _perk_multiplier(
                        gs_max if isinstance(gs_max, int) else None,
                        _p.get("ScalingPerGearScore"),
                        _p.get("id"),
                        _p.get("description"),
                    ),
                ),
                "link": (f"https://nwdb.info/db/perk/{_p.get('id')}" if _p.get("id") else None),
            })(p)
            for p in (d.get("perks") or [])
            if isinstance(p, dict) and (p.get("name") or p.get("description") or p.get("id"))
        ],
    }

    # Attribute points (Magnify or stat curve)
    def _nearest_magnify(gs: Optional[int]) -> Optional[int]:
        if not isinstance(gs, int):
            return None
        MAGNIFY_POINTS_BY_GS = {700: 32, 675: 30, 650: 28, 625: 25}
        keys = sorted(MAGNIFY_POINTS_BY_GS.keys())
        # pick the greatest key <= gs, else smallest
        pick = None
        for k in keys:
            if gs >= k:
                pick = k
        if pick is None:
            pick = keys[0]
        return MAGNIFY_POINTS_BY_GS.get(pick)

    def _stat_points(gs: int, base: float = 3.0) -> int:
        anchors = {
            100: 3, 150: 5, 200: 8, 250: 11, 300: 13, 350: 16,
            400: 19, 450: 21, 500: 24, 550: 27, 600: 30, 650: 33,
            700: 38, 725: 42
        }
        keys = sorted(anchors.keys())
        if gs <= keys[0]:
            value = anchors[keys[0]]
        elif gs >= keys[-1]:
            value = anchors[keys[-1]]
        else:
            # find bounding anchors
            lower = keys[0]
            upper = keys[-1]
            for k in keys:
                if k <= gs:
                    lower = k
                if k >= gs:
                    upper = k
                    break
            v0, v1 = anchors[lower], anchors[upper]
            span = max(upper - lower, 1)
            frac = (gs - lower) / span
            value = v0 + (v1 - v0) * frac
        val = value * (base / 3.0)
        return int(round(val))

    # detect magnify
    perks_list = d.get("perks") or []
    has_magnify = any(
        isinstance(p, dict) and (
            (str(p.get("name") or "").strip().lower() == "magnify") or p.get("isMagnify")
        ) for p in perks_list
    )

    attr_section: Optional[Dict[str, Any]] = None
    if has_magnify:
        pts = _nearest_magnify(gs_max if isinstance(gs_max, int) else None)
        if pts is not None:
            attr_section = {"points": pts, "source": "magnify", "gs": gs_max}
    else:
        # find a base from attributesPMod if present; fallback 3.0
        base_val: Optional[float] = None
        for p in perks_list:
            if isinstance(p, dict) and p.get("attributesPMod"):
                try:
                    base_val = float(p["attributesPMod"])  # e.g., 2.5 or 1.25
                    break
                except Exception:
                    pass
        if isinstance(gs_max, int):
            pts = _stat_points(gs_max, base=base_val or 3.0)
            attr_section = {"points": pts, "source": "curve", "base": base_val or 3.0, "gs": gs_max}

    if attr_section:
        # Compute per-attribute points if perk attributes list is present
        by_attr: Dict[str, int] = {}
        if isinstance(gs_max, int):
            for p in perks_list:
                attrs_list = p.get("attributes") if isinstance(p, dict) else None
                if not isinstance(attrs_list, list) or not attrs_list:
                    continue
                for ent in attrs_list:
                    if not isinstance(ent, dict):
                        continue
                    aid = ent.get("id") or ent.get("attribute") or ent.get("name")
                    base = ent.get("value") or ent.get("base") or ent.get("mod")
                    if not aid or base is None:
                        continue
                    try:
                        base_f = float(base)
                    except Exception:
                        continue
                    pts_ent = _stat_points(gs_max, base=base_f)
                    by_attr[str(aid).strip().lower()] = pts_ent
        if by_attr:
            attr_section["byAttr"] = by_attr
        out["attributes"] = attr_section

    # Acquisition sections
    acq: Dict[str, Any] = {}
    counts: Dict[str, int] = {}

    # Crafted At → craftingRecipesOutput: id, name (keep all, but cap reasonable)
    crafted_src = d.get("craftingRecipesOutput")
    crafted = [
        {"id": x.get("id"), "type": x.get("type"), "name": x.get("name"), "link": _entity_link(x)}
        for x in _take(crafted_src, 10)
        if x.get("id") or x.get("name")
    ]
    if crafted:
        acq["craftedAt"] = crafted
    if isinstance(crafted_src, list):
        counts["craftedAt"] = len(crafted_src)

    # PvP Reward → pvpRewards: list tags and priceDat
    pvp_rewards = []
    pvp_src = d.get("pvpRewards")
    for pv in _take(pvp_src, 10):
        entry = {
            "tags": _str_list(pv.get("tags")),
            "priceDat": pv.get("priceData"),
        }
        entry = _non_empty(entry)
        if entry:
            pvp_rewards.append(entry)
    if pvp_rewards:
        acq["pvpReward"] = pvp_rewards
    if isinstance(pvp_src, list):
        counts["pvpReward"] = len(pvp_src)

    # Quest Reward → questRewards: up to 3 names
    qr_src = d.get("questRewards")
    quest_rewards = [q.get("name") for q in _take(qr_src, 3) if q.get("name")]
    if quest_rewards:
        acq["questReward"] = quest_rewards
    if isinstance(qr_src, list):
        counts["questReward"] = len(qr_src)

    # Shop → price: include RankCheckCategoricalProgressionId, BuyCurrencyCost, CategoricalProgressionId, BuyCategoricalProgressionCost
    price = d.get("price") or {}
    shop = {
        "RankCheckCategoricalProgressionId": price.get("RankCheckCategoricalProgressionId"),
        "BuyCurrencyCost": price.get("BuyCurrencyCost"),
        "CategoricalProgressionId": price.get("CategoricalProgressionId"),
        "BuyCategoricalProgressionCost": price.get("BuyCategoricalProgressionCost"),
    }
    shop = _non_empty(shop)
    if shop:
        acq["shop"] = shop

    # Special Source → if itemClass contains strings like "Source_twitch" or "Source_leaderboards"
    classes = _str_list(d.get("itemClass"))
    special = [c for c in classes if isinstance(c, str) and c.lower().startswith("source_")]
    if special:
        acq["specialSource"] = special

    # Gathered From → gatherablesWithItem: up to 3 (id, name)
    gf_src = d.get("gatherablesWithItem")
    gathered = [
        {"id": x.get("id"), "type": x.get("type"), "name": x.get("name"), "link": _entity_link(x)}
        for x in _take(gf_src, 3)
        if x.get("id") or x.get("name")
    ]
    if gathered:
        acq["gatheredFrom"] = gathered
    if isinstance(gf_src, list):
        counts["gatheredFrom"] = len(gf_src)

    # Dropped From → drops_lootcontainer_from: up to 3 (id, name)
    df_src = d.get("drops_lootcontainer_from")
    # Special case: ignore single artifacts container (artifactst5_s8)
    filtered_df_src = df_src
    if isinstance(df_src, list) and len(df_src) == 1:
        only = df_src[0] if isinstance(df_src[0], dict) else None
        only_id = str(only.get("id")).lower() if only and only.get("id") is not None else ""
        if only_id == "artifactst5_s8":
            filtered_df_src = []
    drop_cont = [
        {"id": x.get("id"), "type": x.get("type"), "name": x.get("name"), "link": _entity_link(x)}
        for x in _take(filtered_df_src, 3)
        if x.get("id") or x.get("name")
    ]
    if drop_cont:
        acq["droppedFrom"] = drop_cont
    if isinstance(df_src, list):
        counts["droppedFrom"] = len(filtered_df_src) if isinstance(filtered_df_src, list) else 0

    # Dropped By → monstersWithDrop: include name and lootTagRestrictions
    dropped_by = []
    m_src = d.get("monstersWithDrop")
    for m in _take(m_src, 10):
        ltr = m.get("lootTagRestrictions") or {}
        # Extract player level (from t) and area/zone (from b)
        player_lvl = None
        zone = None
        zone_id = None
        other_tags: List[str] = []
        t_list = ltr.get("t") or []
        for tval in t_list:
            if isinstance(tval, str) and "{!plvl}" in tval:
                try:
                    player_lvl = tval.split("}", 1)[1]
                except Exception:
                    player_lvl = tval
                break
        b_list = ltr.get("b") or []
        # Flatten nested lists
        flat_b: List[str] = []
        for bval in b_list:
            if isinstance(bval, list):
                flat_b.extend([str(x) for x in bval if isinstance(x, (str, int))])
            elif isinstance(bval, str):
                flat_b.append(bval)
        for bval in flat_b:
            if isinstance(bval, str) and bval.startswith("{!zone}"):
                try:
                    rest = bval.split("}", 1)[1]
                    # "Name|||12345" → (Name, 12345)
                    parts = rest.split("|||")
                    zone = parts[0] if parts else rest
                    if len(parts) > 1 and parts[1]:
                        try:
                            zone_id = int(parts[1])
                        except Exception:
                            zone_id = parts[1]
                except Exception:
                    zone = bval
                # keep scanning to also collect other tags present in b
            elif isinstance(bval, str):
                # Collect any additional textual tags from b (e.g., "Mutated Expedition")
                val = bval.strip()
                if val and val not in other_tags:
                    other_tags.append(val)

        entry = {
            "id": m.get("id"),
            "type": m.get("type"),
            "name": m.get("name"),
            "level": m.get("Level"),
            "area": zone,
            "areaId": zone_id,
            "playerLevelReq": player_lvl,
            # Expose additional restrictions/tags found alongside zone (e.g., Mutated Expedition)
            "restrictions": other_tags or None,
            # Convenience boolean for common case
            "isMutatedExpedition": ("Mutated Expedition" in other_tags) if other_tags else None,
            "lootTagRestrictions": ltr or None,
            "link": _entity_link(m),
        }
        entry = _non_empty(entry)
        if entry:
            dropped_by.append(entry)
    if dropped_by:
        acq["droppedBy"] = dropped_by
    if isinstance(m_src, list):
        counts["droppedBy"] = len(m_src)

    # Season Rewards → seasonRewards: last 3 items (season, level, type)
    sr = d.get("seasonRewards")
    if isinstance(sr, list) and sr:
        last_three = [
            {
                "season": x.get("season"),
                "level": x.get("level"),
                "type": x.get("type"),
            }
            for x in sr[-3:]
            if isinstance(x, dict)
        ]
        last_three = [e for e in last_three if any(v is not None for v in e.values())]
        if last_three:
            acq["seasonRewards"] = last_three
        counts["seasonRewards"] = len(sr)

    # Trial Drop → drops_trial: last 3 items, include name
    tr = d.get("drops_trial")
    if isinstance(tr, list) and tr:
        last_three = [{"name": x.get("name")} for x in tr[-3:] if isinstance(x, dict) and x.get("name")]
        if last_three:
            acq["trialDrop"] = last_three
        counts["trialDrop"] = len(tr)

    if acq:
        out["acquisition"] = acq
    if counts:
        out.setdefault("acquisition", {})["_counts"] = counts

    # Strip Nones / empties at top level where appropriate
    out = _non_empty(out)
    return out
