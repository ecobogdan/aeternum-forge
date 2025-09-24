from __future__ import annotations

import re
from typing import Awaitable, Callable, Dict, Iterable, List, Optional, Tuple

NameLink = Tuple[str, Optional[str]]
FetchLookup = Callable[[str], Awaitable[Optional[NameLink]]]

_TASK_PERK_RE = re.compile(r"task_perk\d+_", re.IGNORECASE)


def _coerce_int(value: object) -> Optional[int]:
    try:
        iv = int(str(value))
    except (TypeError, ValueError):
        return None
    return iv


def _extract_zone_id(poi_tag: str) -> Optional[str]:
    token = (poi_tag or "").strip()
    if not token:
        return None
    last = token.split("_")[-1]
    if last.isdigit():
        return last
    match = re.search(r"(\d+)", token)
    return match.group(1) if match else None


def _prettify_identifier(identifier: str) -> str:
    raw = (identifier or "").replace("_", " ").strip()
    if not raw:
        return ""
    spaced = re.sub(r"(?<=\w)([A-Z])", r" \1", raw)
    tokens = spaced.split()
    if not tokens:
        return spaced
    def _norm(token: str) -> str:
        return token if token.isupper() else token.capitalize()
    return " ".join(_norm(t) for t in tokens)


def _fallback_location_label(identifier: str) -> Optional[str]:
    token = (identifier or "").strip()
    if not token:
        return None
    token = re.sub(r"^(Dungeon|Activity)", "", token)
    token = re.sub(r"\d+$", "", token)
    spaced = re.sub(r"(?<!^)(?=[A-Z])", " ", token).strip()
    return spaced or None


async def _format_kill_contribution(
    entry: Dict[str, object],
    fetch_creature: FetchLookup,
    fetch_zone: FetchLookup,
    fetch_gamemode: FetchLookup,
) -> Optional[str]:
    qty = _coerce_int(entry.get("TargetQty"))
    kill_enemy = str(entry.get("KillEnemyType") or "").strip()
    target_name = None
    target_link = None
    if kill_enemy:
        lookup = await fetch_creature(kill_enemy)
        if lookup:
            target_name, target_link = lookup
        else:
            target_name = _prettify_identifier(kill_enemy)
    if not target_name:
        return None
    target = f"[{target_name}]({target_link})" if target_link else target_name

    parts = ["Defeat"]
    if qty and qty > 1:
        parts.append(str(qty))
    parts.append(target)

    zone_id = _extract_zone_id(str(entry.get("POITag") or ""))
    if not zone_id:
        territory = _coerce_int(entry.get("TerritoryID"))
        if territory and territory > 0:
            zone_id = str(territory)

    location = None
    preposition = "at"
    if zone_id:
        zone_lookup = await fetch_zone(zone_id)
        if zone_lookup and zone_lookup[0]:
            z_name, z_link = zone_lookup
            location = f"[{z_name}]({z_link})" if z_link else z_name
    if not location:
        gamemode_id = str(entry.get("GameModeID") or "").strip()
        if gamemode_id:
            gm_lookup = await fetch_gamemode(gamemode_id)
            if gm_lookup and gm_lookup[0]:
                preposition = "in"
                g_name, g_link = gm_lookup
                location = f"[{g_name}]({g_link})" if g_link else g_name
            elif gm_lookup is None:
                fallback = _fallback_location_label(gamemode_id)
                if fallback:
                    preposition = "in"
                    location = fallback

    text = " ".join(parts)
    if location:
        text += f" {preposition} {location}"
    return text


def _format_game_event(entry: Dict[str, object]) -> Optional[str]:
    qty = _coerce_int(entry.get("TargetQty"))
    if qty and qty > 1:
        return f"Capture {qty} Forts"
    return "Capture the Fort"


async def build_artifact_objectives(
    item_id: str,
    tasks: Iterable[Dict[str, object]],
    fetch_creature: FetchLookup,
    fetch_zone: FetchLookup,
    fetch_gamemode: FetchLookup,
) -> List[str]:
    if not item_id:
        return []
    iid = str(item_id).lower()
    relevant: List[Dict[str, object]] = []
    for entry in tasks or []:
        if not isinstance(entry, dict):
            continue
        task_id = str(entry.get("TaskID") or "")
        if not task_id or iid not in task_id.lower():
            continue
        if not _TASK_PERK_RE.search(task_id.lower()):
            continue
        relevant.append(entry)
    relevant.sort(key=lambda e: str(e.get("TaskID") or ""))

    results: List[str] = []
    for entry in relevant:
        task_type = str(entry.get("Type") or "").strip()
        text: Optional[str]
        if task_type == "TaskKillContribution":
            text = await _format_kill_contribution(entry, fetch_creature, fetch_zone, fetch_gamemode)
        elif task_type == "TaskGameEvent":
            text = _format_game_event(entry)
        else:
            text = None
        if text:
            results.append(text)
    return results
