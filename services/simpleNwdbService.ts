// Simplified NWDB Service with shared entity helpers
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
          Accept: "*/*",
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private buildEntityUrl(entityType: string, entityId: string): string {
    const safeType = entityType.trim();
    const safeId = encodeURIComponent(entityId.trim());
    return `${this.base}/db/${safeType}/${safeId}.json`;
  }

  public async getEntityDetails(entityType: string, entityId: string): Promise<any> {
    try {
      const url = this.buildEntityUrl(entityType, entityId);
      const response = await this.fetchWithTimeout(url);

      if (response.status === 304) {
        return { status: "not_modified" };
      }

      if (!response.ok) {
        return { error: `HTTP ${response.status}: ${response.statusText}` };
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${entityType} details for ${entityId}:`, error);
      return { error: String(error) };
    }
  }

  public async getItemDetails(itemId: string): Promise<any> {
    return this.getEntityDetails("item", itemId);
  }

  public async getPerkDetails(perkId: string): Promise<any> {
    return this.getEntityDetails("perk", perkId);
  }

  private isArtifact(value: unknown): boolean {
    if (typeof value === "number") {
      return value === 100;
    }
    if (typeof value === "string") {
      return value.toLowerCase() === "artifact";
    }
    return false;
  }

  private toTier(value: unknown): number {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  private toGearScore(value: unknown): number {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  public async searchItems(
    query: string,
    limit: number = 25,
  ): Promise<Array<{ id: string; name: string; slug: string; icon?: string; rarity?: string | number; tier?: number | string; gearScore?: number | string }>> {
    const trimmed = (query || "").trim().toLowerCase();
    if (!trimmed) return [];

    try {
      const response = await this.fetchWithTimeout("https://nwdb.info/db/search/[[all]]");
      if (!response.ok) {
        console.error("Search API error:", response.status, response.statusText);
        return [];
      }

      const payload = await response.json();
      const allItems = payload.data || payload;

      type Ranked = {
        id: string;
        name: string;
        slug: string;
        icon?: string;
        rarity?: string | number;
        tier?: number | string;
        gearScore?: number | string;
        _priority: number;
      };

      const matches: Ranked[] = [];

      for (const item of allItems) {
        if (item.type !== "item" || !item.name || !item.id) continue;
        if (typeof item.id === "string" && item.id.startsWith("perkid_")) continue;

        const name = String(item.name || "").toLowerCase();
        let priority: number | null = null;
        if (name.startsWith(trimmed)) {
          priority = 0;
        } else if (name.includes(trimmed)) {
          priority = 1;
        }

        if (priority === null) continue;

        matches.push({
          id: String(item.id || ""),
          name: item.name,
          slug: item.slug || item.id || name.replace(/\s+/g, "-"),
          icon: item.icon,
          rarity: item.rarity,
          tier: item.tier,
          gearScore: item.gearScore,
          _priority: priority,
        });
      }

      matches.sort((a, b) => {
        if (a._priority !== b._priority) {
          return a._priority - b._priority;
        }

        const artifactDiff = Number(this.isArtifact(b.rarity)) - Number(this.isArtifact(a.rarity));
        if (artifactDiff !== 0) {
          return artifactDiff;
        }

        const tierDiff = this.toTier(b.tier) - this.toTier(a.tier);
        if (tierDiff !== 0) {
          return tierDiff;
        }

        const gsDiff = this.toGearScore(b.gearScore) - this.toGearScore(a.gearScore);
        if (gsDiff !== 0) {
          return gsDiff;
        }

        return a.name.localeCompare(b.name);
      });

      return matches.slice(0, Math.min(limit, 50)).map(({ _priority, ...rest }) => rest);
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }
}

export const simpleNwdbService = new SimpleNWDBService();
