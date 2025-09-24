// Simplified NWDB Service without complex caching
export class SimpleNWDBService {
  private base = "https://nwdb.info";

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

  public async getItemDetails(itemId: string): Promise<any> {
    const url = `https://nwdb.info/db/item/${itemId}.json`;
    
    try {
      console.log('Fetching item details from:', url);
      const response = await this.fetchWithTimeout(url);
      
      if (response.status === 304) {
        return { status: "not_modified" };
      }
      
      if (response.status >= 400) {
        return { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      console.log('Item details fetched successfully');
      return data;
    } catch (error) {
      console.error('Error fetching item details:', error);
      return { error: String(error) };
    }
  }

  public async getPerkDetails(perkId: string): Promise<any> {
    const url = `https://nwdb.info/db/perk/${perkId}.json`;
    
    try {
      console.log('Fetching perk details from:', url);
      const response = await this.fetchWithTimeout(url);
      
      if (response.status === 304) {
        return { status: "not_modified" };
      }
      
      if (response.status >= 400) {
        return { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      console.log('Perk details fetched successfully');
      return data;
    } catch (error) {
      console.error('Error fetching perk details:', error);
      return { error: String(error) };
    }
  }

  public async searchItems(query: string, limit: number = 25): Promise<Array<{id: string, name: string, slug: string, icon?: string, rarity?: string, tier?: number, gearScore?: number}>> {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];

    try {
      console.log('Searching for items:', q);
      const response = await this.fetchWithTimeout("https://nwdb.info/db/search/[[all]]");
      
      if (response.status >= 400) {
        console.error('Search API error:', response.status);
        return [];
      }
      
      const data = await response.json();
      const allItems = data.data || data;
      
      const starts: any[] = [];
      const contains: any[] = [];

      for (const item of allItems) {
        if (item.type !== "item" || !item.name || !item.id) continue;
        
        // Additional check to ensure we don't include perk IDs
        if (item.id && item.id.startsWith('perkid_')) continue;
        
        const name = (item.name || "").toLowerCase();
        if (name.startsWith(q)) {
          starts.push({
            id: String(item.id || ''),
            name: item.name,
            slug: item.slug || item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
            icon: item.icon,
            rarity: item.rarity,
            tier: item.tier,
            gearScore: item.gearScore
          });
        } else if (name.includes(q)) {
          contains.push({
            id: String(item.id || ''),
            name: item.name,
            slug: item.slug || item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
            icon: item.icon,
            rarity: item.rarity,
            tier: item.tier,
            gearScore: item.gearScore
          });
        }
      }

      const ranked = [...starts, ...contains];
      console.log(`Found ${ranked.length} items for query: ${q}`);
      return ranked.slice(0, Math.min(limit, 25));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
}

export const simpleNwdbService = new SimpleNWDBService();
