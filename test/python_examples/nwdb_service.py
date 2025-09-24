from __future__ import annotations
import asyncio
from typing import Optional, List, Dict
import aiohttp
from bs4 import BeautifulSoup
from utils.cache import TTLCache
from .artifact_objective_service import build_artifact_objectives
import requests
import re
from urllib.parse import quote
import re as _re
NW_BUDDY_OBJECTIVE_TASKS_URL = "https://www.nw-buddy.de/nw-data/datatables/javelindata_objectivetasks.json"
NW_BUDDY_GAMEMODES_URL = "https://www.nw-buddy.de/nw-data/datatables/javelindata_gamemodes.json"

KNOWN_GAMEMODE_NAMES = {
    "DungeonAmrine": "Amrine Excavation",
    "DungeonShatteredObelisk": "Starstone Barrows",
    "DungeonRestlessShores01": "The Depths",
    "DungeonEbonscale00": "Dynasty Shipyard",
    "DungeonEdengrove00": "Garden of Genesis",
    "DungeonReekwater00": "Lazarus Instrumentality",
    "DungeonCutlassKeys00": "Barnacles and Black Powder",
    "DungeonShatterMtn00": "Tempest's Heart",
    "DungeonBrimstoneSands00": "The Ennead",
}

def _fallback_label(identifier: str) -> Optional[str]:
    token = (identifier or '').strip()
    if not token:
        return None
    token = re.sub(r"^(Dungeon|Activity)", "", token)
    token = re.sub(r"\d+$", "", token)
    spaced = re.sub(r"(?<!^)(?=[A-Z])", " ", token).strip()
    return spaced or None

class NWDBService:
    BASE = "https://nwdb.info"

    def __init__(self, session: aiohttp.ClientSession, cache: TTLCache | None = None):
        self.session = session
        self.cache = cache or TTLCache(3600)
        self._lock = asyncio.Lock()

    def _build_url(self, kind: str, slug: str) -> str:
        kind = kind.strip().lower()
        slug = slug.strip()
        return f"{self.BASE}/?{kind}={slug}"

    def fetch_nwdb_all(self):
        url = "https://nwdb.info/db/search/[[all]]"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/140.0.0.0 Safari/537.36",
            "Accept": "*/*",
        }
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 304:
                return {"status": "not_modified"}
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    def _normalize_slug(self, text: str) -> str:
        """
        Fallback slugifier in case API doesn't provide one.
        """
        s = re.sub(r"\s+", "-", text.strip().lower())
        s = re.sub(r"[^a-z0-9\-]+", "", s)
        return s

    def fetch_nwdb_items(self) -> List[Dict[str, str]]:
        """
        Returns a list of dicts: [{"id": "...", "name": "...", "slug": "..."}]
        """
        data = self.fetch_nwdb_all()
        items = []
        for item in (data.get("data", []) or []):
            if item.get("type") != "item":
                continue
            name = item.get("name")
            if not name:
                continue
            item_id = item.get("id")  # <- keep the canonical id
            slug = item.get("slug") or item_id or self._normalize_slug(name)
            items.append({"id": str(item_id or ""), "name": name, "slug": str(slug)})
        return items


    # --- New: cached item search for autocomplete ---
    def _get_cached_items(self) -> List[Dict[str, str]]:
        key = "nwdb_items_all"
        cached = self.cache.get(key)
        if cached is not None:
            return cached
        items = self.fetch_nwdb_items()
        # Cache for 1 hour (TTLCache given 3600s in __init__)
        self.cache.set(key, items)
        return items

    async def search_items(self, query: str, limit: int = 25) -> List[Dict[str, str]]:
        """
        Prefix-first, then substring matches, case-insensitive.
        Returns [{"name","slug"}] up to `limit`.
        """
        q = (query or "").strip().lower()
        if not q:
            return []
        items = self._get_cached_items()

        starts, contains = [], []
        for it in items:
            nm = (it.get("name") or "").lower()
            if nm.startswith(q):
                starts.append(it)
            elif q in nm:
                contains.append(it)

        ranked = starts + contains
        return ranked[: min(limit, 25)]


    def get_item_details(self, item_id: str):
        url = f"https://nwdb.info/db/item/{item_id}.json"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/140.0.0.0 Safari/537.36",
            "Accept": "*/*",
        }
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 304:
                return {"status": "not_modified"}
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    async def get_item_details_async(self, item_id: str):
        url = f"https://nwdb.info/db/item/{item_id}.json"
        try:
            timeout = aiohttp.ClientTimeout(total=10)
            async with self.session.get(url, timeout=timeout) as resp:
                if resp.status == 304:
                    return {"status": "not_modified"}
                if resp.status >= 400:
                    return {"error": f"HTTP {resp.status}"}
                return await resp.json()
        except Exception as e:
            return {"error": str(e)}

    # ---- Perks by item type (for /item_lookup) ----
    def _clean_text(self, text: str | None) -> str:
        if not text:
            return ""
        # Replace occurrences like ${20} or ${20.5} with just 20 or 20.5
        cleaned = _re.sub(r"\$\{([^}]+)\}", r"\1", text)
        # Collapse multiple spaces
        cleaned = _re.sub(r"\s+", " ", cleaned).strip()
        return cleaned
    async def _fetch_perks_page(self, item_type: str, page: int) -> dict:
        # NWDB expects lowercase values for filter_perk_item
        safe_item = quote((item_type or "").lower(), safe="")
        # Use the generic perks listing (not /attribute) and JSON endpoint
        url = f"https://nwdb.info/db/perks/page/{page}.json?filter_perk_item={safe_item}"
        print(f"[NWDB] GET {url}")
        timeout = aiohttp.ClientTimeout(total=10)
        async with self.session.get(url, timeout=timeout) as resp:
            if resp.status >= 400:
                return {"error": f"HTTP {resp.status}"}
            return await resp.json()

    async def fetch_all_perks_for_item_type(self, item_type: str) -> List[Dict]:
        item_type = (item_type or "").lower()
        key = f"perks:{item_type}"
        cached = self.cache.get(key)
        if cached is not None:
            return cached

        first = await self._fetch_perks_page(item_type, 1)
        if not first or first.get("error"):
            return []
        page_count = int(first.get("pageCount") or 1)
        perks = list(first.get("data") or [])
        if page_count > 1:
            # Fetch remaining pages concurrently
            tasks = [self._fetch_perks_page(item_type, p) for p in range(2, page_count + 1)]
            try:
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for r in results:
                    if isinstance(r, dict):
                        perks.extend(r.get("data") or [])
            except Exception:
                pass

        # Cache condensed list for 30 minutes
        self.cache.set(key, perks, ttl=1800)
        return perks

    async def search_perks_for_item_type(self, item_type: str, query: str, limit: int = 25) -> List[Dict[str, str]]:
        q = (query or "").strip().lower()
        perks = await self.fetch_all_perks_for_item_type((item_type or "").lower())
        if not perks:
            return []
        starts, contains = [], []
        for p in perks:
            name = (p.get("name") or "").lower()
            if not name:
                continue
            if q and name.startswith(q):
                starts.append(p)
            elif q in name:
                contains.append(p)
        ranked = (starts + contains) if q else perks
        out = []
        for p in ranked[: min(limit, 25)]:
            out.append({
                "id": str(p.get("id") or ""),
                "name": p.get("name") or "",
                "description": self._clean_text(p.get("description")),
                "ScalingPerGearScore": p.get("ScalingPerGearScore"),
            })
        return out

    # ---- Items by perk id (for /item_lookup) ----
    async def fetch_items_by_perk_first_page(self, perk_id: str) -> List[Dict[str, str]]:
        # Only fetch page 1 as requested, then take first 5 entries
        safe_perk = quote(str(perk_id), safe="")
        url = f"https://nwdb.info/db/items/page/1.json?filter_perks={safe_perk}"
        print(f"[NWDB] GET {url}")
        timeout = aiohttp.ClientTimeout(total=10)
        async with self.session.get(url, timeout=timeout) as resp:
            if resp.status >= 400:
                return []
            payload = await resp.json()
        items = []
        for it in (payload.get("data") or [])[:5]:
            items.append({
                "id": str(it.get("id") or ""),
                "name": it.get("name") or "",
                "description": self._clean_text(it.get("description")),
            })
        return items

    async def fetch_items_by_perk_summary(self, perk_id: str) -> dict:
        """
        Fetch page 1 to get first 5 items and pageCount; if multiple pages, fetch last page
        to compute an exact total count without pulling every page.
        Returns: {"items": [...first5...], "pageCount": int, "total": int}
        """
        safe_perk = quote(str(perk_id), safe="")
        url1 = f"https://nwdb.info/db/items/page/1.json?filter_perks={safe_perk}"
        print(f"[NWDB] GET {url1}")
        timeout = aiohttp.ClientTimeout(total=10)
        async with self.session.get(url1, timeout=timeout) as resp:
            if resp.status >= 400:
                return {"items": [], "pageCount": 0, "total": 0}
            p1 = await resp.json()

        data1 = p1.get("data") or []
        page_count = int(p1.get("pageCount") or 1)
        per_page = len(data1)
        items = []
        for it in data1[:5]:
            items.append({
                "id": str(it.get("id") or ""),
                "name": it.get("name") or "",
                "description": self._clean_text(it.get("description")),
            })

        if page_count <= 1:
            total = per_page
            return {"items": items, "pageCount": page_count, "total": total}

        # Fetch last page just to count its entries
        urll = f"https://nwdb.info/db/items/page/{page_count}.json?filter_perks={safe_perk}"
        print(f"[NWDB] GET {urll}")
        async with self.session.get(urll, timeout=timeout) as resp2:
            if resp2.status >= 400:
                # Fall back to minimum estimate
                total = per_page * (page_count - 1)
                return {"items": items, "pageCount": page_count, "total": total}
            plast = await resp2.json()
        last_count = len(plast.get("data") or [])
        total = per_page * (page_count - 1) + last_count
        return {"items": items, "pageCount": page_count, "total": total}



    async def _fetch_objective_tasks(self) -> List[Dict]:
        key = "nwbuddy:objective_tasks"
        cached = self.cache.get(key)
        if cached is not None:
            return cached
        timeout = aiohttp.ClientTimeout(total=20)
        try:
            async with self.session.get(NW_BUDDY_OBJECTIVE_TASKS_URL, timeout=timeout) as resp:
                if resp.status >= 400:
                    self.cache.set(key, [], ttl=900)
                    return []
                payload = await resp.json()
        except Exception:
            return []
        tasks = payload.get("data") if isinstance(payload, dict) else payload
        if not isinstance(tasks, list):
            tasks = []
        self.cache.set(key, tasks, ttl=3600)
        return tasks

    async def _fetch_creature_lookup(self, creature_id: str) -> Optional[tuple[str, Optional[str]]]:
        if not creature_id:
            return None
        key = f"creature:{str(creature_id).lower()}"
        cached = self.cache.get(key)
        if cached is False:
            return None
        if cached:
            return cached
        url = f"{self.BASE}/db/creature/{creature_id}.json"
        try:
            timeout = aiohttp.ClientTimeout(total=10)
            async with self.session.get(url, timeout=timeout) as resp:
                if resp.status >= 400:
                    self.cache.set(key, False, ttl=900)
                    return None
                payload = await resp.json()
        except Exception:
            return None
        data = payload.get("data") if isinstance(payload, dict) else None
        name = None
        if isinstance(data, dict):
            name = data.get("Name") or data.get("name")
        if name:
            result = (str(name), f"{self.BASE}/db/creature/{creature_id}")
            self.cache.set(key, result, ttl=86400)
            return result
        self.cache.set(key, False, ttl=900)
        return None

    async def _fetch_zone_lookup(self, zone_id: str) -> Optional[tuple[str, Optional[str]]]:
        if not zone_id:
            return None
        zone_key = f"zone:{zone_id}"
        cached = self.cache.get(zone_key)
        if cached is False:
            return None
        if cached:
            return cached
        url = f"{self.BASE}/db/zone/{zone_id}.json"
        try:
            timeout = aiohttp.ClientTimeout(total=10)
            async with self.session.get(url, timeout=timeout) as resp:
                if resp.status >= 400:
                    self.cache.set(zone_key, False, ttl=900)
                    return None
                payload = await resp.json()
        except Exception:
            return None
        data = payload.get("data") if isinstance(payload, dict) else None
        name = None
        if isinstance(data, dict):
            name = data.get("name") or data.get("Name")
        if name:
            result = (str(name), f"{self.BASE}/db/zone/{zone_id}")
            self.cache.set(zone_key, result, ttl=86400)
            return result
        self.cache.set(zone_key, False, ttl=900)
        return None

    async def _load_gamemodes_index(self) -> List[Dict]:
        key = "nwbuddy:gamemodes"
        cached = self.cache.get(key)
        if cached is not None:
            return cached
        timeout = aiohttp.ClientTimeout(total=10)
        try:
            async with self.session.get(NW_BUDDY_GAMEMODES_URL, timeout=timeout) as resp:
                if resp.status >= 400:
                    self.cache.set(key, [], ttl=1800)
                    return []
                payload = await resp.json()
        except Exception:
            return []
        if not isinstance(payload, list):
            payload = []
        self.cache.set(key, payload, ttl=86400)
        return payload

    async def _fetch_gamemode_lookup(self, gamemode_id: str) -> Optional[tuple[str, Optional[str]]]:
        if not gamemode_id:
            return None
        gm_key = f"gamemode:{str(gamemode_id).lower()}"
        cached = self.cache.get(gm_key)
        if cached is False:
            return None
        if cached:
            return cached
        name = KNOWN_GAMEMODE_NAMES.get(gamemode_id)
        if not name:
            gamemodes = await self._load_gamemodes_index()
            entry = next((g for g in gamemodes if str(g.get("GameModeId")) == gamemode_id), None)
            if entry:
                display_key = entry.get("DisplayName")
                overrides = {
                    "@dungeon_amrine_title": "Amrine Excavation",
                    "@dungeon_everfall_title": "Starstone Barrows",
                    "@dungeon_restlessshores01_title": "The Depths",
                    "@dungeon_ebonscale00_title": "Dynasty Shipyard",
                    "@dungeon_edengrove00_title": "Garden of Genesis",
                    "@dungeon_reekwater_title": "Lazarus Instrumentality",
                    "@dungeon_cutlasskeys00_title": "Barnacles and Black Powder",
                    "@dungeon_shattermtn00_title": "Tempest''s Heart",
                    "@dungeon_brimstonesands00_title": "The Ennead",
                }
                if isinstance(display_key, str):
                    name = overrides.get(display_key)
                if not name:
                    script_name = entry.get("ScriptName")
                    if isinstance(script_name, str):
                        name = _fallback_label(script_name)
        if not name:
            name = _fallback_label(str(gamemode_id))
        result = (name, None) if name else None
        self.cache.set(gm_key, result if result else False, ttl=86400)
        return result

    async def fetch_artifact_objectives(self, item_id: str) -> List[str]:
        if not item_id:
            return []
        try:
            tasks = await self._fetch_objective_tasks()
        except Exception:
            return []
        if not tasks:
            return []

        async def _creature_lookup(creature: str) -> Optional[tuple[str, Optional[str]]]:
            return await self._fetch_creature_lookup(creature)

        async def _zone_lookup(zone: str) -> Optional[tuple[str, Optional[str]]]:
            return await self._fetch_zone_lookup(zone)

        async def _gamemode_lookup(gamemode: str) -> Optional[tuple[str, Optional[str]]]:
            return await self._fetch_gamemode_lookup(gamemode)

        try:
            return await build_artifact_objectives(item_id, tasks, _creature_lookup, _zone_lookup, _gamemode_lookup)
        except Exception:
            return []
