// NWDB Service - TypeScript implementation based on nwdb_service.py
// Handles NWDB API calls, caching, and data fetching

export interface NameLink {
  name: string;
  link: string | null;
}

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
}

export interface PerkSearchResult {
  id: string;
  name: string;
  description: string;
  ScalingPerGearScore?: string;
}

export interface ItemSearchResult {
  id: string;
  name: string;
  description: string;
}

export interface PerkSummary {
  items: ItemSearchResult[];
  pageCount: number;
  total: number;
}

const NW_BUDDY_OBJECTIVE_TASKS_URL = "https://www.nw-buddy.de/nw-data/datatables/javelindata_objectivetasks.json";
const NW_BUDDY_GAMEMODES_URL = "https://www.nw-buddy.de/nw-data/datatables/javelindata_gamemodes.json";

const KNOWN_GAMEMODE_NAMES: Record<string, string> = {
  "DungeonAmrine": "Amrine Excavation",
  "DungeonShatteredObelisk": "Starstone Barrows",
  "DungeonRestlessShores01": "The Depths",
  "DungeonEbonscale00": "Dynasty Shipyard",
  "DungeonEdengrove00": "Garden of Genesis",
  "DungeonReekwater00": "Lazarus Instrumentality",
  "DungeonCutlassKeys00": "Barnacles and Black Powder",
  "DungeonShatterMtn00": "Tempest's Heart",
  "DungeonBrimstoneSands00": "The Ennead",
};

// Simple in-memory cache
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private ttl: number;

  constructor(ttlSeconds: number = 3600) {
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: any, customTtl?: number): void {
    const ttl = customTtl ? customTtl * 1000 : this.ttl;
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export class NWDBService {
  private base = "https://nwdb.info";
  private cache = new SimpleCache(3600); // 1 hour default TTL

  private async fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
          "Accept": "*/*",
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private buildUrl(kind: string, slug: string): string {
    const cleanKind = kind.trim().toLowerCase();
    const cleanSlug = slug.trim();
    return `${this.base}/?${cleanKind}=${cleanSlug}`;
  }

  public async fetchNWDBAll(): Promise<any> {
    const url = "https://nwdb.info/db/search/[[all]]";
    
    try {
      const response = await this.fetchWithTimeout(url);
      if (response.status === 304) {
        return { status: "not_modified" };
      }
      if (response.status >= 400) {
        return { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      return await response.json();
    } catch (error) {
      return { error: String(error) };
    }
  }

  private normalizeSlug(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]+/g, '');
  }

  public async fetchNWDBItems(): Promise<SearchResult[]> {
    const data = await this.fetchNWDBAll();
    const items: SearchResult[] = [];
    
    const allItems = data.data || data;
    for (const item of allItems) {
      if (item.type !== "item" || !item.name) continue;
      
      const itemId = item.id;
      const slug = item.slug || itemId || this.normalizeSlug(item.name);
      
      items.push({
        id: String(itemId || ''),
        name: item.name,
        slug: String(slug)
      });
    }
    
    return items;
  }

  private getCachedItems(): SearchResult[] | null {
    return this.cache.get("nwdb_items_all");
  }

  private setCachedItems(items: SearchResult[]): void {
    this.cache.set("nwdb_items_all", items);
  }

  public async searchItems(query: string, limit: number = 25): Promise<SearchResult[]> {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];

    let items = this.getCachedItems();
    if (!items) {
      items = await this.fetchNWDBItems();
      this.setCachedItems(items);
    }

    const starts: SearchResult[] = [];
    const contains: SearchResult[] = [];

    for (const it of items) {
      const name = (it.name || "").toLowerCase();
      if (name.startsWith(q)) {
        starts.push(it);
      } else if (name.includes(q)) {
        contains.push(it);
      }
    }

    const ranked = [...starts, ...contains];
    return ranked.slice(0, Math.min(limit, 25));
  }

  public async getItemDetails(itemId: string): Promise<any> {
    const url = `https://nwdb.info/db/item/${itemId}.json`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      if (response.status === 304) {
        return { status: "not_modified" };
      }
      if (response.status >= 400) {
        return { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      return await response.json();
    } catch (error) {
      return { error: String(error) };
    }
  }

  private cleanText(text?: string): string {
    if (!text) return "";
    
    // Replace ${...} with just the content
    let cleaned = text.replace(/\$\{([^}]+)\}/g, "$1");
    // Collapse multiple spaces
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  }

  private async fetchPerksPage(itemType: string, page: number): Promise<any> {
    const safeItem = encodeURIComponent((itemType || "").toLowerCase());
    const url = `https://nwdb.info/db/perks/page/${page}.json?filter_perk_item=${safeItem}`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      if (response.status >= 400) {
        return { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      return await response.json();
    } catch (error) {
      return { error: String(error) };
    }
  }

  public async fetchAllPerksForItemType(itemType: string): Promise<any[]> {
    const cleanItemType = (itemType || "").toLowerCase();
    const key = `perks:${cleanItemType}`;
    
    const cached = this.cache.get(key);
    if (cached !== null) return cached;

    const first = await this.fetchPerksPage(cleanItemType, 1);
    if (!first || first.error) return [];

    const pageCount = parseInt(first.pageCount || "1");
    let perks = [...(first.data || [])];

    if (pageCount > 1) {
      // Fetch remaining pages concurrently
      const tasks = Array.from({ length: pageCount - 1 }, (_, i) => 
        this.fetchPerksPage(cleanItemType, i + 2)
      );
      
      try {
        const results = await Promise.allSettled(tasks);
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value && !result.value.error) {
            perks.push(...(result.value.data || []));
          }
        }
      } catch (error) {
        // Ignore errors and continue with what we have
      }
    }

    // Cache for 30 minutes
    this.cache.set(key, perks, 1800);
    return perks;
  }

  public async searchPerksForItemType(itemType: string, query: string, limit: number = 25): Promise<PerkSearchResult[]> {
    const q = (query || "").trim().toLowerCase();
    const perks = await this.fetchAllPerksForItemType((itemType || "").toLowerCase());
    
    if (!perks.length) return [];

    const starts: any[] = [];
    const contains: any[] = [];

    for (const p of perks) {
      const name = (p.name || "").toLowerCase();
      if (!name) continue;
      
      if (q && name.startsWith(q)) {
        starts.push(p);
      } else if (q && name.includes(q)) {
        contains.push(p);
      }
    }

    const ranked = q ? [...starts, ...contains] : perks;
    const results: PerkSearchResult[] = [];

    for (const p of ranked.slice(0, Math.min(limit, 25))) {
      results.push({
        id: String(p.id || ""),
        name: p.name || "",
        description: this.cleanText(p.description),
        ScalingPerGearScore: p.ScalingPerGearScore
      });
    }

    return results;
  }

  public async fetchItemsByPerkFirstPage(perkId: string): Promise<ItemSearchResult[]> {
    const safePerk = encodeURIComponent(String(perkId));
    const url = `https://nwdb.info/db/items/page/1.json?filter_perks=${safePerk}`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      if (response.status >= 400) return [];
      
      const payload = await response.json();
      const items: ItemSearchResult[] = [];
      
      for (const it of (payload.data || []).slice(0, 5)) {
        items.push({
          id: String(it.id || ""),
          name: it.name || "",
          description: this.cleanText(it.description)
        });
      }
      
      return items;
    } catch (error) {
      return [];
    }
  }

  public async fetchItemsByPerkSummary(perkId: string): Promise<PerkSummary> {
    const safePerk = encodeURIComponent(String(perkId));
    const url1 = `https://nwdb.info/db/items/page/1.json?filter_perks=${safePerk}`;
    
    try {
      const response1 = await this.fetchWithTimeout(url1);
      if (response1.status >= 400) {
        return { items: [], pageCount: 0, total: 0 };
      }
      
      const p1 = await response1.json();
      const data1 = p1.data || [];
      const pageCount = parseInt(p1.pageCount || "1");
      const perPage = data1.length;
      
      const items: ItemSearchResult[] = [];
      for (const it of data1.slice(0, 5)) {
        items.push({
          id: String(it.id || ""),
          name: it.name || "",
          description: this.cleanText(it.description)
        });
      }

      if (pageCount <= 1) {
        return { items, pageCount, total: perPage };
      }

      // Fetch last page to get exact count
      const urlLast = `https://nwdb.info/db/items/page/${pageCount}.json?filter_perks=${safePerk}`;
      try {
        const responseLast = await this.fetchWithTimeout(urlLast);
        if (responseLast.status >= 400) {
          // Fall back to minimum estimate
          return { items, pageCount, total: perPage * (pageCount - 1) };
        }
        
        const plast = await responseLast.json();
        const lastCount = (plast.data || []).length;
        const total = perPage * (pageCount - 1) + lastCount;
        
        return { items, pageCount, total };
      } catch (error) {
        // Fall back to minimum estimate
        return { items, pageCount, total: perPage * (pageCount - 1) };
      }
    } catch (error) {
      return { items: [], pageCount: 0, total: 0 };
    }
  }

  private async fetchObjectiveTasks(): Promise<any[]> {
    const key = "nwbuddy:objective_tasks";
    const cached = this.cache.get(key);
    if (cached !== null) return cached;

    try {
      const response = await this.fetchWithTimeout(NW_BUDDY_OBJECTIVE_TASKS_URL, 20000);
      if (response.status >= 400) {
        this.cache.set(key, [], 900);
        return [];
      }
      
      const payload = await response.json();
      const tasks = payload.data || payload;
      
      if (!Array.isArray(tasks)) {
        this.cache.set(key, [], 3600);
        return [];
      }
      
      this.cache.set(key, tasks, 3600);
      return tasks;
    } catch (error) {
      return [];
    }
  }

  private async fetchCreatureLookup(creatureId: string): Promise<NameLink | null> {
    if (!creatureId) return null;
    
    const key = `creature:${String(creatureId).toLowerCase()}`;
    const cached = this.cache.get(key);
    if (cached === false) return null;
    if (cached) return cached;

    const url = `${this.base}/db/creature/${creatureId}.json`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      if (response.status >= 400) {
        this.cache.set(key, false, 900);
        return null;
      }
      
      const payload = await response.json();
      const data = payload.data || payload;
      const name = data?.Name || data?.name;
      
      if (name) {
        const result: NameLink = {
          name: String(name),
          link: `${this.base}/db/creature/${creatureId}`
        };
        this.cache.set(key, result, 86400);
        return result;
      }
      
      this.cache.set(key, false, 900);
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchZoneLookup(zoneId: string): Promise<NameLink | null> {
    if (!zoneId) return null;
    
    const key = `zone:${zoneId}`;
    const cached = this.cache.get(key);
    if (cached === false) return null;
    if (cached) return cached;

    const url = `${this.base}/db/zone/${zoneId}.json`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      if (response.status >= 400) {
        this.cache.set(key, false, 900);
        return null;
      }
      
      const payload = await response.json();
      const data = payload.data || payload;
      const name = data?.name || data?.Name;
      
      if (name) {
        const result: NameLink = {
          name: String(name),
          link: `${this.base}/db/zone/${zoneId}`
        };
        this.cache.set(key, result, 86400);
        return result;
      }
      
      this.cache.set(key, false, 900);
      return null;
    } catch (error) {
      return null;
    }
  }

  private async loadGamemodesIndex(): Promise<any[]> {
    const key = "nwbuddy:gamemodes";
    const cached = this.cache.get(key);
    if (cached !== null) return cached;

    try {
      const response = await this.fetchWithTimeout(NW_BUDDY_GAMEMODES_URL);
      if (response.status >= 400) {
        this.cache.set(key, [], 1800);
        return [];
      }
      
      const payload = await response.json();
      const data = Array.isArray(payload) ? payload : [];
      this.cache.set(key, data, 86400);
      return data;
    } catch (error) {
      return [];
    }
  }

  private fallbackLabel(identifier: string): string | null {
    const token = (identifier || '').trim();
    if (!token) return null;
    
    let cleaned = token
      .replace(/^(Dungeon|Activity)/, '')
      .replace(/\d+$/, '');
    
    cleaned = cleaned.replace(/(?<!^)(?=[A-Z])/g, ' ').trim();
    return cleaned || null;
  }

  private async fetchGamemodeLookup(gamemodeId: string): Promise<NameLink | null> {
    if (!gamemodeId) return null;
    
    const key = `gamemode:${String(gamemodeId).toLowerCase()}`;
    const cached = this.cache.get(key);
    if (cached === false) return null;
    if (cached) return cached;

    let name = KNOWN_GAMEMODE_NAMES[gamemodeId];
    
    if (!name) {
      const gamemodes = await this.loadGamemodesIndex();
      const entry = gamemodes.find(g => String(g.GameModeId) === gamemodeId);
      
      if (entry) {
        const displayKey = entry.DisplayName;
        const overrides: Record<string, string> = {
          "@dungeon_amrine_title": "Amrine Excavation",
          "@dungeon_everfall_title": "Starstone Barrows",
          "@dungeon_restlessshores01_title": "The Depths",
          "@dungeon_ebonscale00_title": "Dynasty Shipyard",
          "@dungeon_edengrove00_title": "Garden of Genesis",
          "@dungeon_reekwater_title": "Lazarus Instrumentality",
          "@dungeon_cutlasskeys00_title": "Barnacles and Black Powder",
          "@dungeon_shattermtn00_title": "Tempest's Heart",
          "@dungeon_brimstonesands00_title": "The Ennead",
        };
        
        if (typeof displayKey === 'string') {
          name = overrides[displayKey];
        }
        
        if (!name) {
          const scriptName = entry.ScriptName;
          if (typeof scriptName === 'string') {
            name = this.fallbackLabel(scriptName);
          }
        }
      }
    }
    
    if (!name) {
      name = this.fallbackLabel(String(gamemodeId));
    }
    
    const result = name ? { name, link: null } : null;
    this.cache.set(key, result || false, 86400);
    return result;
  }

  public async fetchArtifactObjectives(itemId: string): Promise<string[]> {
    if (!itemId) return [];
    
    try {
      const tasks = await this.fetchObjectiveTasks();
      if (!tasks.length) return [];

      // Import artifact objective service
      const { buildArtifactObjectives } = await import('./artifactObjectiveService');
      
      return await buildArtifactObjectives(
        itemId,
        tasks,
        (creature: string) => this.fetchCreatureLookup(creature),
        (zone: string) => this.fetchZoneLookup(zone),
        (gamemode: string) => this.fetchGamemodeLookup(gamemode)
      );
    } catch (error) {
      return [];
    }
  }
}

export const nwdbService = new NWDBService();
