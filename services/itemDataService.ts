// Item Data Service - TypeScript implementation based on item_data_service.py
// Handles item data processing, perk scaling, and acquisition data

export interface PerkScaling {
  segments: Array<[number, number]>; // [gearScore, slope]
  capGS: number | null;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  link?: string;
  ScalingPerGearScore?: string;
}

export interface RandomPerkOption {
  id: string;
  name?: string;
  chance?: number;
  icon?: string;
}

export interface RandomPerkBucket {
  id: string;
  chance?: number;
  options: RandomPerkOption[];
}

export interface AcquisitionData {
  craftedAt?: Array<{ id: string; name: string; type?: string; link?: string }>;
  pvpReward?: Array<{ tags: string[]; priceDat: any }>;
  questReward?: string[];
  shop?: {
    RankCheckCategoricalProgressionId?: any;
    BuyCurrencyCost?: any;
    CategoricalProgressionId?: any;
    BuyCategoricalProgressionCost?: any;
  };
  specialSource?: string[];
  gatheredFrom?: Array<{ id: string; name: string; type?: string; link?: string }>;
  droppedFrom?: Array<{ id: string; name: string; type?: string; link?: string }>;
  droppedBy?: Array<{
    id?: string;
    type?: string;
    name: string;
    level?: number;
    area?: string;
    areaId?: string | number;
    playerLevelReq?: string;
    restrictions?: string[];
    isMutatedExpedition?: boolean;
    lootTagRestrictions?: any;
    link?: string;
  }>;
  seasonRewards?: Array<{ season: any; level: any; type: any }>;
  trialDrop?: Array<{ name: string }>;
  _counts?: Record<string, number>;
}

export interface AttributesData {
  points: number;
  source: 'magnify' | 'curve';
  gs: number;
  base?: number;
  byAttr?: Record<string, number>;
}

export interface EnhancedItem {
  id: string;
  name: string;
  link: string;
  gearScore?: number;
  type?: string;
  tier?: number;
  classes: string[];
  perks: Perk[];
  randomPerkBuckets: RandomPerkBucket[];
  acquisition?: AcquisitionData;
  attributes?: AttributesData;
  iconUrl?: string;
  description?: string;
  rarity?: string | number;
}

const ICON_CDN_PREFIX = "https://cdn.nwdb.info/db/images/live/v56/";
const GS_MIN_DEFAULT = 100;

// Known UI values at GS 700 to anchor intercepts precisely
const PERK_UI700_PERCENT: Record<string, number> = {
  "perkid_amulet_healing": 10.0,
  "perkid_weapon_cdrbasic": 2.5,
  "perkid_weapon_melee_chargedheavy_dmg": 20.0,
  "perkid_weapon_melee_chargedheavy_crit": 31.0,
};

// Optional per-perk max multiplier overrides
const PERK_MAX_MULTIPLIER: Record<string, number> = {
  "perkid_amulet_healing": 2.0,
};

export class ItemDataService {
  private iconUrlFromIconField(icon?: string): string | null {
    if (!icon) return null;
    const path = String(icon).replace(/^\//, '');
    const finalPath = path.endsWith('.png') ? path : `${path}.png`;
    return `${ICON_CDN_PREFIX}${finalPath}`;
  }

  private strList(v: any): string[] {
    if (Array.isArray(v)) {
      return v.filter(x => x).map(x => String(x));
    }
    return [];
  }

  private take<T>(objs: T[] | null | undefined, cap: number): T[] {
    if (!Array.isArray(objs) || !objs.length) return [];
    return objs.filter(o => o != null).slice(0, cap);
  }

  private nonEmpty<T extends Record<string, any>>(d: T): Partial<T> {
    const result: Partial<T> = {};
    for (const [k, v] of Object.entries(d)) {
      if (v || v === 0) {
        result[k as keyof T] = v;
      }
    }
    return result;
  }

  private entityLink(ent: any): string | null {
    const entType = ent?.type;
    const entId = ent?.id;
    if (entType && entId) {
      return `https://nwdb.info/db/${entType}/${entId}`;
    }
    return null;
  }

  private parseScaling(s?: string): PerkScaling {
    const segs: Array<[number, number]> = [];
    let capGS: number | null = null;

    if (!s || typeof s !== 'string') {
      return { segments: segs, capGS };
    }

    const parts = s.split(',').map(p => p.trim()).filter(p => p);
    
    // Initial slope
    if (parts.length > 0) {
      try {
        const firstSlope = parseFloat(parts[0]);
        segs.push([GS_MIN_DEFAULT, firstSlope]);
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Anchors
    for (const token of parts.slice(1)) {
      if (token.includes(':')) {
        const [left, right] = token.split(':', 2);
        try {
          const g = Math.floor(parseFloat(left));
          const slope = parseFloat(right);
          segs.push([g, slope]);
          if (capGS === null || g > capGS) {
            capGS = g;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    // Sort and dedupe
    const segsDict: Record<number, number> = {};
    for (const [g, sl] of segs) {
      segsDict[g] = sl;
    }
    const sortedSegs = Object.entries(segsDict)
      .map(([g, sl]) => [parseInt(g), sl] as [number, number])
      .sort((a, b) => a[0] - b[0]);

    return { segments: sortedSegs, capGS };
  }

  private areaToGS(segs: Array<[number, number]>, gsStart: number, gsEnd: number): number {
    if (gsEnd <= gsStart || !segs.length) return 0.0;

    let total = 0.0;
    const limit = gsEnd;

    for (let i = 0; i < segs.length; i++) {
      const [start, slope] = segs[i];
      const nextStart = i + 1 < segs.length ? segs[i + 1][0] : limit;
      const s = Math.max(gsStart, start);
      const e = Math.min(nextStart, limit);
      const span = Math.max(0, e - s);
      if (span > 0) {
        total += slope * span;
      }
    }

    return total;
  }

  public perkMultiplier(gs: number | null, scaling?: string, perkId?: string, desc?: string): number {
    const meta = this.parseScaling(scaling);
    const segs = meta.segments;
    
    if (typeof gs !== 'number' || !segs.length) return 1.0;

    const capGS = meta.capGS || 700;
    const gEff = Math.max(GS_MIN_DEFAULT, Math.min(gs, capGS));

    // Try to anchor intercept using known UI700 value
    const ui700 = PERK_UI700_PERCENT[String(perkId || '')];
    let baseX: number | null = null;

    if (typeof desc === 'string') {
      const match = desc.match(/\$\{\s*([0-9]+(?:\.[0-9]+)?)\s*\*\s*perkMultiplier\s*\}/);
      if (match) {
        try {
          baseX = parseFloat(match[1]);
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    if (typeof ui700 === 'number' && typeof baseX === 'number' && baseX !== 0) {
      const targetM700 = ui700 / baseX;
      const area100_700 = this.areaToGS(segs, GS_MIN_DEFAULT, 700);
      const intercept = targetM700 - area100_700;
      const area100_g = this.areaToGS(segs, GS_MIN_DEFAULT, gEff);
      return intercept + area100_g;
    } else {
      // Fallback to baseline of 1.0 plus accumulated area
      const total = this.areaToGS(segs, GS_MIN_DEFAULT, gEff);
      let mult = 1.0 + total;
      const maxMult = PERK_MAX_MULTIPLIER[String(perkId || '')];
      if (typeof maxMult === 'number') {
        mult = Math.min(mult, maxMult);
      }
      return mult;
    }
  }

  public evalPerkDescription(desc?: string, mult: number = 1): string {
    if (!desc || typeof desc !== 'string') return desc || '';

    const fmtNum = (val: number): string => {
      if (Math.abs(val - Math.round(val)) < 1e-9) {
        return String(Math.round(val));
      }
      return val.toFixed(2).replace(/\.?0+$/, '');
    };

    return desc.replace(/\$\{([^}]+)\}/g, (match, expr) => {
      try {
        // Simple evaluation with only perkMultiplier variable
        const allowedNames = { perkMultiplier: mult };
        const val = Function('perkMultiplier', `return ${expr}`)(mult);
        if (typeof val === 'number') {
          return fmtNum(val);
        }
        return String(val);
      } catch (e) {
        return match;
      }
    });
  }

  private nearestMagnify(gs?: number): number | null {
    if (typeof gs !== 'number') return null;
    
    const MAGNIFY_POINTS_BY_GS: Record<number, number> = {
      700: 32, 675: 30, 650: 28, 625: 25
    };
    
    const keys = Object.keys(MAGNIFY_POINTS_BY_GS).map(Number).sort((a, b) => b - a);
    const pick = keys.find(k => gs >= k) || keys[keys.length - 1];
    return MAGNIFY_POINTS_BY_GS[pick] || null;
  }

  private statPoints(gs: number, base: number = 3.0): number {
    const anchors: Record<number, number> = {
      100: 3, 150: 5, 200: 8, 250: 11, 300: 13, 350: 16,
      400: 19, 450: 21, 500: 24, 550: 27, 600: 30, 650: 33,
      700: 38, 725: 42
    };

    const keys = Object.keys(anchors).map(Number).sort((a, b) => a - b);
    
    if (gs <= keys[0]) return anchors[keys[0]];
    if (gs >= keys[keys.length - 1]) return anchors[keys[keys.length - 1]];

    // Find bounding anchors
    let lower = keys[0];
    let upper = keys[keys.length - 1];
    
    for (const k of keys) {
      if (k <= gs) lower = k;
      if (k >= gs) {
        upper = k;
        break;
      }
    }

    const v0 = anchors[lower];
    const v1 = anchors[upper];
    const span = Math.max(upper - lower, 1);
    const frac = (gs - lower) / span;
    const value = v0 + (v1 - v0) * frac;
    
    return Math.round(value * (base / 3.0));
  }

  public buildItemInfo(raw: any): EnhancedItem {
    const d = raw || {};
    const itemId = d.id;
    const gsMax = d.gearScoreMax;

    // Core fields
    const perks: Perk[] = (d.perks || []).map((p: any) => {
      if (!p || (!p.name && !p.description && !p.id)) return null;
      
      const mult = this.perkMultiplier(
        typeof gsMax === 'number' ? gsMax : null,
        p.ScalingPerGearScore,
        p.id,
        p.description
      );

      return {
        id: p.id || '',
        name: p.name || '',
        description: this.evalPerkDescription(p.description, mult),
        link: p.id ? `/new-world-database/perk/${p.id}` : undefined,
        ScalingPerGearScore: p.ScalingPerGearScore
      };
    }).filter(Boolean);

    // Process random perk buckets and add to main perks array
    const randomPerkBuckets: RandomPerkBucket[] = Array.isArray(d.perkBuckets)
      ? d.perkBuckets
          .map((bucket: any, bucketIndex: number) => {
            if (!bucket) return null;
            const bucketId = bucket.id || `bucket-${bucketIndex}`;
            const bucketChance = typeof bucket.chance === 'number' ? bucket.chance : undefined;
            const options = Array.isArray(bucket.perks)
              ? bucket.perks
                  .map((option: any, optionIndex: number) => {
                    if (!option) return null;
                    const perk = option.perk || option;
                    const optionId = perk?.id || option?.id || `${bucketId}-option-${optionIndex}`;
                    const optionName = perk?.name || option?.name || optionId;
                    const chance = typeof option?.chance === 'number' ? option.chance : undefined;
                    return {
                      id: optionId,
                      name: optionName,
                      chance,
                      icon: perk?.icon || option?.icon,
                    } as RandomPerkOption;
                  })
                  .filter((entry: RandomPerkOption | null): entry is RandomPerkOption => entry !== null)
              : [];
            if (!options.length) return null;
            return { id: bucketId, chance: bucketChance, options };
          })
          .filter((entry: RandomPerkBucket | null): entry is RandomPerkBucket => entry !== null)
      : [];

    // Add random perk entries for each perk bucket
    if (randomPerkBuckets.length > 0) {
      randomPerkBuckets.forEach((bucket, index) => {
        const bucketChance = bucket.chance || 0;
        const randomChancePercent = bucketChance <= 1 ? bucketChance * 100 : bucketChance;
        const formattedChance = Math.round(randomChancePercent * 10) / 10;
        
        perks.push({
          id: `random-perk-${bucket.id || index}`,
          name: `${formattedChance}% Random`,
          description: `Random perk with ${formattedChance}% chance`,
          link: undefined,
          ScalingPerGearScore: undefined
        });
      });
    }

    const result: EnhancedItem = {
      id: itemId || '',
      name: d.name || '',
      link: itemId ? `https://nwdb.info/db/item/${itemId}` : '',
      gearScore: gsMax,
      type: d.typeName,
      tier: d.tier,
      classes: this.strList(d.itemClass),
      perks,
      randomPerkBuckets: [], // Keep empty to maintain interface compatibility
      iconUrl: this.iconUrlFromIconField(d.icon),
      description: d.description,
      rarity: d.rarity
    };

    // Attributes section
    const perksList = d.perks || [];
    const hasMagnify = perksList.some((p: any) => 
      p && (String(p.name || '').toLowerCase() === 'magnify' || p.isMagnify)
    );

    let attrSection: AttributesData | undefined;
    if (hasMagnify) {
      const pts = this.nearestMagnify(typeof gsMax === 'number' ? gsMax : undefined);
      if (pts !== null) {
        attrSection = { points: pts, source: 'magnify', gs: gsMax };
      }
    } else {
      // Find base from attributesPMod
      let baseVal: number | undefined;
      for (const p of perksList) {
        if (p && p.attributesPMod) {
          try {
            baseVal = parseFloat(p.attributesPMod);
            break;
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }

      if (typeof gsMax === 'number') {
        const pts = this.statPoints(gsMax, baseVal || 3.0);
        attrSection = { points: pts, source: 'curve', base: baseVal || 3.0, gs: gsMax };
      }
    }

    if (attrSection) {
      // Compute per-attribute points if perk attributes list is present
      const byAttr: Record<string, number> = {};
      if (typeof gsMax === 'number') {
        for (const p of perksList) {
          const attrsList = p?.attributes;
          if (!Array.isArray(attrsList) || !attrsList.length) continue;

          for (const ent of attrsList) {
            if (!ent || typeof ent !== 'object') continue;
            
            const aid = ent.id || ent.attribute || ent.name;
            const base = ent.value || ent.base || ent.mod;
            
            if (!aid || base == null) continue;
            
            try {
              const baseF = parseFloat(base);
              const ptsEnt = this.statPoints(gsMax, baseF);
              byAttr[String(aid).toLowerCase()] = ptsEnt;
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      if (Object.keys(byAttr).length > 0) {
        attrSection.byAttr = byAttr;
      }
      
      result.attributes = attrSection;
    }

    // Acquisition sections
    const acq: AcquisitionData = {};
    const counts: Record<string, number> = {};

    // Crafted At
    const craftedSrc = d.craftingRecipesOutput;
    const crafted = this.take(craftedSrc, 10)
      .filter((x: any) => x?.id || x?.name)
      .map((x: any) => ({
        id: x.id,
        type: x.type,
        name: x.name,
        link: this.entityLink(x)
      }));
    
    if (crafted.length > 0) {
      acq.craftedAt = crafted;
    }
    if (Array.isArray(craftedSrc)) {
      counts.craftedAt = craftedSrc.length;
    }

    // PvP Reward
    const pvpRewards = this.take(d.pvpRewards, 10)
      .map((pv: any) => this.nonEmpty({
        tags: this.strList(pv.tags),
        priceDat: pv.priceData
      }))
      .filter((entry: any) => Object.keys(entry).length > 0);
    
    if (pvpRewards.length > 0) {
      acq.pvpReward = pvpRewards;
    }
    if (Array.isArray(d.pvpRewards)) {
      counts.pvpReward = d.pvpRewards.length;
    }

    // Quest Reward
    const questRewards = this.take(d.questRewards, 3)
      .map((q: any) => q?.name)
      .filter(Boolean);
    
    if (questRewards.length > 0) {
      acq.questReward = questRewards;
    }
    if (Array.isArray(d.questRewards)) {
      counts.questReward = d.questRewards.length;
    }

    // Shop
    const price = d.price || {};
    const shop = this.nonEmpty({
      RankCheckCategoricalProgressionId: price.RankCheckCategoricalProgressionId,
      BuyCurrencyCost: price.BuyCurrencyCost,
      CategoricalProgressionId: price.CategoricalProgressionId,
      BuyCategoricalProgressionCost: price.BuyCategoricalProgressionCost
    });
    
    if (Object.keys(shop).length > 0) {
      acq.shop = shop;
    }

    // Special Source
    const classes = this.strList(d.itemClass);
    const special = classes.filter((c: string) => 
      typeof c === 'string' && c.toLowerCase().startsWith('source_')
    );
    
    if (special.length > 0) {
      acq.specialSource = special;
    }

    // Gathered From
    const gathered = this.take(d.gatherablesWithItem, 3)
      .filter((x: any) => x?.id || x?.name)
      .map((x: any) => ({
        id: x.id,
        type: x.type,
        name: x.name,
        link: this.entityLink(x)
      }));
    
    if (gathered.length > 0) {
      acq.gatheredFrom = gathered;
    }
    if (Array.isArray(d.gatherablesWithItem)) {
      counts.gatheredFrom = d.gatherablesWithItem.length;
    }

    // Dropped From
    let dfSrc = d.drops_lootcontainer_from;
    // Special case: ignore single artifacts container
    if (Array.isArray(dfSrc) && dfSrc.length === 1) {
      const only = dfSrc[0];
      const onlyId = String(only?.id || '').toLowerCase();
      if (onlyId === 'artifactst5_s8') {
        dfSrc = [];
      }
    }

    const dropCont = this.take(dfSrc, 3)
      .filter((x: any) => x?.id || x?.name)
      .map((x: any) => ({
        id: x.id,
        type: x.type,
        name: x.name,
        link: this.entityLink(x)
      }));
    
    if (dropCont.length > 0) {
      acq.droppedFrom = dropCont;
    }
    if (Array.isArray(dfSrc)) {
      counts.droppedFrom = dfSrc.length;
    }

    // Dropped By
    const droppedBy = this.take(d.monstersWithDrop, 10)
      .map((m: any) => {
        const ltr = m.lootTagRestrictions || {};
        
        // Extract player level and area from loot tag restrictions
        let playerLvl: string | undefined;
        let zone: string | undefined;
        let zoneId: string | number | undefined;
        const otherTags: string[] = [];
        
        const tList = ltr.t || [];
        for (const tval of tList) {
          if (typeof tval === 'string' && tval.includes('{!plvl}')) {
            try {
              playerLvl = tval.split('}', 2)[1];
            } catch (e) {
              playerLvl = tval;
            }
            break;
          }
        }
        
        const bList = ltr.b || [];
        const flatB: string[] = [];
        for (const bval of bList) {
          if (Array.isArray(bval)) {
            flatB.push(...bval.filter(x => x != null).map(x => String(x)));
          } else if (typeof bval === 'string') {
            flatB.push(bval);
          }
        }
        
        for (const bval of flatB) {
          if (typeof bval === 'string' && bval.startsWith('{!zone}')) {
            try {
              const rest = bval.split('}', 2)[1];
              const parts = rest.split('|||');
              zone = parts[0] || rest;
              if (parts.length > 1 && parts[1]) {
                try {
                  zoneId = parseInt(parts[1]);
                } catch (e) {
                  zoneId = parts[1];
                }
              }
            } catch (e) {
              zone = bval;
            }
          } else if (typeof bval === 'string') {
            const val = bval.trim();
            if (val && !otherTags.includes(val)) {
              otherTags.push(val);
            }
          }
        }

        return this.nonEmpty({
          id: m.id,
          type: m.type,
          name: m.name,
          level: m.Level,
          area: zone,
          areaId: zoneId,
          playerLevelReq: playerLvl,
          restrictions: otherTags.length > 0 ? otherTags : undefined,
          isMutatedExpedition: otherTags.includes('Mutated Expedition') || undefined,
          lootTagRestrictions: Object.keys(ltr).length > 0 ? ltr : undefined,
          link: this.entityLink(m)
        });
      })
      .filter((entry: any) => Object.keys(entry).length > 0);
    
    if (droppedBy.length > 0) {
      acq.droppedBy = droppedBy;
    }
    if (Array.isArray(d.monstersWithDrop)) {
      counts.droppedBy = d.monstersWithDrop.length;
    }

    // Season Rewards
    const sr = d.seasonRewards;
    if (Array.isArray(sr) && sr.length > 0) {
      const lastThree = sr.slice(-3)
        .filter((x: any) => x && typeof x === 'object')
        .map((x: any) => ({
          season: x.season,
          level: x.level,
          type: x.type
        }))
        .filter((e: any) => Object.values(e).some(v => v != null));
      
      if (lastThree.length > 0) {
        acq.seasonRewards = lastThree;
      }
      counts.seasonRewards = sr.length;
    }

    // Trial Drop
    const tr = d.drops_trial;
    if (Array.isArray(tr) && tr.length > 0) {
      const lastThree = tr.slice(-3)
        .filter((x: any) => x && typeof x === 'object' && x.name)
        .map((x: any) => ({ name: x.name }));
      
      if (lastThree.length > 0) {
        acq.trialDrop = lastThree;
      }
      counts.trialDrop = tr.length;
    }

    if (Object.keys(acq).length > 0) {
      result.acquisition = acq;
    }
    if (Object.keys(counts).length > 0) {
      result.acquisition = { ...result.acquisition, _counts: counts };
    }

    return result;
  }
}

export const itemDataService = new ItemDataService();
