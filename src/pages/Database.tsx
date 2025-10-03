import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Search,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Swords,
  ScrollText,
  Zap,
  Target,
  BookOpen,
  Shield,
  Compass,
  PawPrint,
  Pickaxe,
  Store,
  Users,
  Filter,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Map as MapIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { siteUrl } from '@/config/seo';
import { simpleNwdbService } from '@/services/simpleNwdbService';

type RawEntity = Record<string, unknown>;

interface Item {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  iconHiRes?: string;
  tier?: number;
  rarity?: number | string;
  gearScore?: number;
  gearScoreMax?: number;
  gearScoreMin?: number;
  baseDamage?: number;
  critChance?: number;
  critDamageMultiplier?: number;
  blockStaminaDamage?: number;
  blockStability?: number;
  perks: Array<{
    id: string;
    name?: string;
    description?: string;
    icon?: string;
  }>;
  itemType?: string;
  mountType?: string;
  type?: string;
  tradeskill?: string;
  category?: string;
  level?: number;
  attributes?: Array<{
    name: string;
    value: number;
    isSelectable?: boolean;
  }>;
  sockets?: Array<{
    type: string;
    description: string;
  }>;
}

interface Perk {
  id: string;
  name: string;
  description?: string;
  rarity?: number | string;
  tier?: number;
  icon?: string;
  type?: string;
  itemType?: string;
}

interface RandomPerkOption {
  id: string;
  name?: string;
  chance?: number;
  icon?: string;
}

interface RandomPerkBucket {
  id: string;
  chance?: number;
  options: RandomPerkOption[];
}

interface SearchResult {
  id: string;
  name: string;
  icon?: string;
  rarity?: number | string;
  tier?: number;
  gearScoreMax?: number;
}

interface CategoryData {
  data: RawEntity[];
  pageCount: number;
  currentPage: number;
  dynamicFilters?: Record<string, unknown>;
}

type FilterType = 'single' | 'multi';

interface FilterOption {
  value: string;
  label: string;
  hint?: string;
}

interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  getOptions: (items: RawEntity[], meta?: Record<string, unknown>) => FilterOption[];
  predicate: (entity: RawEntity, selectedValues: string[]) => boolean;
}

interface BadgeDescriptor {
  label: string;
  tone?: 'default' | 'outline' | 'muted' | 'secondary' | 'rarity';
  rarity?: string | number | undefined | unknown;
}

interface MetaDescriptor {
  label: string;
  value: string;
}

interface HighlightDescriptor {
  label: string;
  value: string;
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  endpoint: string;
  description: string;
  hoverType?: 'item' | 'perk';
  filters: FilterConfig[];
  detailRoute?: (entity: RawEntity) => string;
  externalDetailUrl?: (entity: RawEntity) => string | null;
  getSubtitle?: (entity: RawEntity) => string | undefined;
  getBadges?: (entity: RawEntity) => BadgeDescriptor[];
  getMeta?: (entity: RawEntity) => MetaDescriptor[];
  getDescription?: (entity: RawEntity) => string | undefined;
  getHighlight?: (entity: RawEntity) => HighlightDescriptor | null;
  resolveIcon?: (entity: RawEntity) => string | undefined;
  renderTooltipContent?: (entity: RawEntity) => ReactNode;
}

const CDN_BASE = 'https://cdn.nwdb.info';
const rarityColors: Record<string, string> = {
  Common: 'bg-slate-600 text-slate-100',
  Uncommon: 'bg-emerald-500 text-white',
  Rare: 'bg-blue-500 text-white',
  Epic: 'bg-purple-500 text-white',
  Legendary: 'bg-orange-500 text-white',
  Artifact: 'bg-rose-500 text-white',
  Mythic: 'bg-fuchsia-500 text-white',
  'Status Effect': 'bg-teal-500 text-white',
};

const rarityOutlineColors: Record<number, string> = {
  0: 'ring-slate-700/70 border-slate-700/70',
  1: 'ring-emerald-500/40 border-emerald-500/40',
  2: 'ring-blue-500/40 border-blue-500/40',
  3: 'ring-purple-500/40 border-purple-500/40',
  4: 'ring-amber-500/50 border-amber-500/50',
  5: 'ring-fuchsia-500/40 border-fuchsia-500/40',
  100: 'ring-rose-500/50 border-rose-500/50',
};

const rarityTextColors: Record<number, string> = {
  0: 'text-slate-200',
  1: 'text-emerald-300',
  2: 'text-blue-300',
  3: 'text-purple-300',
  4: 'text-amber-300',
  5: 'text-fuchsia-300',
  100: 'text-rose-300',
};

const rarityNameToNumeric: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '100': 100,
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  artifact: 100,
  mythic: 5,
  'status effect': 0,
  'status-effects': 0,
  status: 0,
};

const rarityValueToName: Record<number, string> = {
  0: 'Common',
  1: 'Uncommon',
  2: 'Rare',
  3: 'Epic',
  4: 'Legendary',
  5: 'Mythic',
  100: 'Artifact',
};

const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
};

const toRomanNumeral = (value?: number | string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) return undefined;
  return ROMAN_NUMERALS[Math.round(numeric)] ?? String(numeric);
};

const getRarityNumeric = (rarity?: number | string): number => {
  if (rarity === undefined || rarity === null) return 0;
  if (typeof rarity === 'number') {
    const mapped = rarityNameToNumeric[String(rarity)];
    return mapped !== undefined ? mapped : rarity;
  }
  const key = rarity.toString().toLowerCase();
  return rarityNameToNumeric[key] ?? rarityNameToNumeric[rarity.toString()] ?? 0;
};

const getRarityLabel = (rarity?: number | string): string => {
  if (rarity === undefined || rarity === null) return 'Unknown';
  if (typeof rarity === 'string') {
    const trimmed = rarity.trim();
    if (!trimmed) return 'Unknown';
    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return rarityValueToName[numeric] ?? trimmed;
    }
    const mappedNumeric = rarityNameToNumeric[trimmed.toLowerCase()];
    if (mappedNumeric !== undefined) {
      return rarityValueToName[mappedNumeric] ?? trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return rarityValueToName[rarity] ?? `Rarity ${rarity}`;
};

const getRarityOutlineClasses = (rarity?: number | string): string => {
  const numeric = getRarityNumeric(rarity);
  return rarityOutlineColors[numeric] ?? rarityOutlineColors[0];
};

const getRarityTextClasses = (rarity?: number | string): string => {
  const numeric = getRarityNumeric(rarity);
  return rarityTextColors[numeric] ?? rarityTextColors[0];
};

const getBadgeClassName = (badge: BadgeDescriptor): string => {
  switch (badge.tone) {
    case 'rarity': {
      const rarity = getRarityLabel(asStringOrNumber(badge.rarity) ?? badge.label);
      const base = rarityColors[rarity] ?? 'bg-slate-700 text-slate-100';
      return `${base} border-none`;
    }
    case 'outline':
      return 'border border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800/70';
    case 'secondary':
      return 'border-none bg-slate-700/70 text-slate-100';
    case 'muted':
      return 'border-none bg-slate-800/70 text-slate-300';
    default:
      return 'border-none bg-slate-700/80 text-slate-100';
  }
};

const formatLabel = (value: string | number | undefined | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const str = String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!str) return undefined;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const truncateText = (value?: string, length = 140): string | undefined => {
  if (!value) return undefined;
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length - 3).trim()}...`;
};

const formatNumber = (value?: number | string | null): string => {
  if (value === undefined || value === null) return '--';
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(numeric)) {
    return String(value);
  }
  return numeric.toLocaleString();
};

const formatChance = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) return '--';
  const normalized = value <= 1 ? value * 100 : value;
  const clamped = Math.min(100, Math.max(0, normalized));
  const rounded = Math.round(clamped * 10) / 10;
  return `${rounded}%`;
};

const resolveIconUrl = (icon?: string): string => {
  if (!icon) return '/placeholder.svg';
  if (icon.startsWith('http')) return icon;
  const trimmed = icon.replace(/^\/+/, '');
  const lower = trimmed.toLowerCase();
  if (
    trimmed.endsWith('.png') ||
    trimmed.endsWith('.jpg') ||
    trimmed.endsWith('.jpeg') ||
    trimmed.endsWith('.webp') ||
    trimmed.endsWith('.svg')
  ) {
    return `${CDN_BASE}/${trimmed}`;
  }
  if (lower.startsWith('lyshineui/')) {
    return `${CDN_BASE}/${trimmed}`;
  }
  if (lower.startsWith('db/')) {
    return `${CDN_BASE}/${trimmed}`;
  }
  return `${CDN_BASE}/db/images/live/v56/${trimmed}.png`;
};

const collectUniqueOptions = (
  items: RawEntity[],
  extractor: (entity: RawEntity) => string | { value: string; label?: string } | undefined | null,
): FilterOption[] => {
  const map = new Map<string, string>();
  items.forEach((entity) => {
    const result = extractor(entity);
    if (!result) return;
    let value: string;
    let label: string | undefined;
    if (typeof result === 'string') {
      value = result;
    } else {
      value = result.value;
      label = result.label;
    }
    if (!value) return;
    const normalized = value.trim();
    if (!normalized) return;
    if (!map.has(normalized)) {
      map.set(normalized, label ?? formatLabel(normalized) ?? normalized);
    }
  });
  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;
const toStringValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  return asString(value) ?? String(value);
};

// Safe type guards for unknown values
const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const asStringOrNumber = (value: unknown): string | number | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return undefined;
};

const hasProperty = (obj: unknown, prop: string): boolean => {
  return obj !== null && typeof obj === 'object' && prop in obj;
};

const getProperty = (obj: unknown, prop: string): unknown => {
  if (hasProperty(obj, prop)) {
    return (obj as Record<string, unknown>)[prop];
  }
  return undefined;
};

const getEntityId = (entity: RawEntity): string => {
  if (!entity) return '';
  const record = entity as Record<string, unknown>;
  return (
    toStringValue(record['id']) ??
    toStringValue(record['ID']) ??
    toStringValue(record['slug']) ??
    ''
  );
};

const parsePerkSummaries = (value: unknown): Array<{ id: string; name?: string }> => {
  return asArray<Record<string, unknown>>(value)
    .map((entry) => {
      const id = toStringValue(entry['id']);
      if (!id) return null;
      const name = toStringValue(entry['name']);
      return { id, name };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
};

const extractPerkIds = (entity: RawEntity): string[] => {
  const perksValue = (entity as Record<string, unknown>)['perks'];
  return asArray<Record<string, unknown>>(perksValue)
    .map((perk) => toStringValue(perk['id']) ?? '')
    .filter((id) => id.length > 0);
};
const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  items: {
    id: 'items',
    name: 'Items',
    icon: Swords,
    endpoint: 'items',
    description: 'Weapons, armor and named gear curated directly from the live NWDB feed.',
    hoverType: 'item',
    filters: [
      {
        id: 'tier',
        label: 'Tier',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const tier = entity.tier ?? entity.Tier;
            if (!tier) return undefined;
            return { value: String(tier), label: `Tier ${tier}` };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const tier = entity.tier ?? entity.Tier;
          return tier ? selected.includes(String(tier)) : false;
        },
      },
      {
        id: 'rarity',
        label: 'Rarity',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const label = getRarityLabel(asStringOrNumber(entity.rarity));
            if (label === 'Unknown') return undefined;
            return { value: label, label };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const label = getRarityLabel(asStringOrNumber(entity.rarity));
          return selected.includes(label);
        },
      },
      {
        id: 'itemType',
        label: 'Item Type',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const type = entity.itemType ?? entity.ItemType ?? entity.type;
            if (!type) return undefined;
            return { value: String(type).toLowerCase(), label: formatLabel(asString(type)) ?? String(type) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const raw = String(entity.itemType ?? entity.ItemType ?? entity.type ?? '').toLowerCase();
          if (!raw) return false;
          return selected.includes(raw);
        },
      },
      {
        id: 'perks',
        label: 'Perk',
        type: 'multi',
        getOptions: (_, meta) => {
          const perks = parsePerkSummaries(meta?.item_perks);
          return perks.map((perk) => ({
            value: perk.id,
            label: perk.name || perk.id,
          }));
        },
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const perkIds = extractPerkIds(entity);
          if (!perkIds.length) return false;
          return selected.some((value) => perkIds.includes(value));
        },
      },
    ],
    detailRoute: (entity) => `/new-world-database/item/${entity.id}`,
    getSubtitle: (entity) => formatLabel(asString(entity.itemType)),
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      if (entity.tier) {
        badges.push({ label: `Tier ${entity.tier}`, tone: 'outline' });
      }
      const rarity = getRarityLabel(asStringOrNumber(entity.rarity));
      if (rarity !== 'Unknown') {
        badges.push({ label: rarity, tone: 'rarity', rarity: asStringOrNumber(entity.rarity) });
      }
      if (entity.hasRandomPerks) {
        badges.push({ label: 'Random Perks', tone: 'secondary' });
      }
      return badges;
    },
    getMeta: (entity) => {
      const meta: MetaDescriptor[] = [];
      const min = entity.gearScoreMin ?? entity.gearScoreLow;
      const max = entity.gearScoreMax ?? entity.gearScore;
      if (min && max && min !== max) {
        meta.push({ label: 'Gear Score', value: `${min} - ${max}` });
      } else if (max) {
        meta.push({ label: 'Gear Score', value: String(max) });
      }
      const itemClass = asArray<string>(entity.itemClass);
      if (itemClass.length) {
        const classLabel = itemClass
          .slice(0, 2)
          .map((value) => formatLabel(value))
          .filter(Boolean)
          .join(', ');
        if (classLabel) {
          meta.push({ label: 'Class', value: classLabel });
        }
      }
      return meta;
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
    getHighlight: (entity) => {
      const max = entity.gearScoreMax ?? entity.gearScore;
      if (max) {
        return { label: 'Gear Score', value: String(max) };
      }
      if (entity.tier) {
        return { label: 'Tier', value: String(entity.tier) };
      }
      return null;
    },
    resolveIcon: (entity) => asString(entity.icon),
  },
  mounts: {
    id: 'mounts',
    name: 'Mounts',
    icon: PawPrint,
    endpoint: 'mounts',
    description: 'Rideable companions, skins, and unlockables from Aeternum.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/mounts/${id}` : '/new-world-database/mounts';
    },
    filters: [
      {
        id: 'mountType',
        label: 'Mount Type',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const type = entity.mountType;
            if (!type) return undefined;
            return { value: String(type), label: formatLabel(asString(type)) ?? String(type) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const type = entity.mountType;
          if (!type) return false;
          return selected.includes(String(type));
        },
      },
      {
        id: 'rarity',
        label: 'Rarity',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const label = getRarityLabel(asStringOrNumber(entity.rarity));
            if (label === 'Unknown') return undefined;
            return { value: label, label };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const label = getRarityLabel(asStringOrNumber(entity.rarity));
          return selected.includes(label);
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/mount/${entity.id}`,
    getSubtitle: (entity) => formatLabel(asString(entity.mountType)),
    getBadges: (entity) => {
      const rarity = getRarityLabel(asStringOrNumber(entity.rarity));
      return rarity !== 'Unknown'
        ? [{ label: rarity, tone: 'rarity', rarity: entity.rarity }]
        : [];
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
    resolveIcon: (entity) => asString(entity.icon),
    getHighlight: (entity) => {
      const label = formatLabel(asString(entity.mountType));
      return label ? { label: 'Type', value: label } : null;
    },
  },
  recipes: {
    id: 'recipes',
    name: 'Recipes',
    icon: ScrollText,
    endpoint: 'recipes',
    description: 'Crafting schematics, recipes and alchemical notes pulled directly from NWDB.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/recipes/${id}` : '/new-world-database/recipes';
    },
    filters: [
      {
        id: 'tradeskill',
        label: 'Tradeskill',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const skill = entity.tradeskill ?? entity.Tradeskill;
            if (!skill) return undefined;
            return { value: String(skill).toLowerCase(), label: formatLabel(asString(skill)) ?? String(skill) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const skill = String(entity.tradeskill ?? entity.Tradeskill ?? '').toLowerCase();
          if (!skill) return false;
          return selected.includes(skill);
        },
      },
      {
        id: 'category',
        label: 'Category',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const category = entity.category;
            if (!category) return undefined;
            return { value: String(category).toLowerCase(), label: formatLabel(asString(category)) ?? String(category) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const category = String(entity.category ?? '').toLowerCase();
          if (!category) return false;
          return selected.includes(category);
        },
      },
      {
        id: 'tier',
        label: 'Tier',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const tier = entity.tier;
            if (!tier) return undefined;
            return { value: String(tier), label: `Tier ${tier}` };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const tier = entity.tier;
          return tier ? selected.includes(String(tier)) : false;
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/recipe/${entity.id}`,
    getSubtitle: (entity) => formatLabel(asString(entity.tradeskill)),
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      if (entity.tier) {
        badges.push({ label: `Tier ${entity.tier}`, tone: 'outline' });
      }
      const rarity = getRarityLabel(asStringOrNumber(entity.rarity));
      if (rarity !== 'Unknown') {
        badges.push({ label: rarity, tone: 'rarity', rarity: asStringOrNumber(entity.rarity) });
      }
      return badges;
    },
    getMeta: (entity) => {
      const meta: MetaDescriptor[] = [];
      if (entity.recipeLevel) {
        meta.push({ label: 'Recipe Level', value: String(entity.recipeLevel) });
      }
      const output = getProperty(entity.output, 'name');
      if (asString(output)) {
        meta.push({ label: 'Creates', value: asString(output)! });
      }
      if (entity.recipeExp) {
        meta.push({ label: 'XP', value: formatNumber(asNumber(entity.recipeExp)) });
      }
      return meta;
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
    resolveIcon: (entity) => asString(entity.icon) || asString(getProperty(entity.output, 'icon')),
    getHighlight: (entity) => {
      if (entity.recipeLevel) {
        return { label: 'Level', value: String(entity.recipeLevel) };
      }
      return null;
    },
  },
  abilities: {
    id: 'abilities',
    name: 'Abilities',
    icon: Zap,
    endpoint: 'abilities',
    description: 'Weapon ability nodes, cooldowns and gameplay tooltips for every skill tree.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/abilities/${id}` : '/new-world-database/abilities';
    },
    filters: [
      {
        id: 'weapon',
        label: 'Weapon',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const weapon = entity.WeaponTag ?? entity.weaponTag;
            if (!weapon) return undefined;
            return { value: String(weapon).toLowerCase(), label: formatLabel(asString(weapon)) ?? String(weapon) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const weapon = String(entity.WeaponTag ?? entity.weaponTag ?? '').toLowerCase();
          if (!weapon) return false;
          return selected.includes(weapon);
        },
      },
      {
        id: 'category',
        label: 'Category',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const category = entity.UICategory ?? entity.uiCategory;
            if (!category) return undefined;
            return { value: String(category).toLowerCase(), label: formatLabel(asString(category)) ?? String(category) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const category = String(entity.UICategory ?? entity.uiCategory ?? '').toLowerCase();
          if (!category) return false;
          return selected.includes(category);
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/ability/${entity.id}`,
    getSubtitle: (entity) => formatLabel(asString(entity.WeaponTag ?? entity.weaponTag)),
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      if (entity.UICategory) {
        badges.push({ label: formatLabel(asString(entity.UICategory)) ?? asString(entity.UICategory), tone: 'muted' });
      }
      return badges;
    },
    getMeta: (entity) => {
      const meta: MetaDescriptor[] = [];
      if (entity.cooldown) {
        meta.push({ label: 'Cooldown', value: `${entity.cooldown}s` });
      }
      if (entity.skillTree) {
        meta.push({ label: 'Skill Tree', value: formatLabel(asString(entity.skillTree)) ?? asString(entity.skillTree) });
      }
      return meta;
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
    resolveIcon: (entity) => asString(entity.icon),
  },
  perks: {
    id: 'perks',
    name: 'Perks',
    icon: Target,
    endpoint: 'perks',
    description: 'Perk gems and effects for weapons, armor, and jewelry.',
    hoverType: 'perk',
    filters: [
      {
        id: 'tier',
        label: 'Tier',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const tier = entity.tier;
            if (!tier) return undefined;
            return { value: String(tier), label: `Tier ${tier}` };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const tier = entity.tier;
          return tier ? selected.includes(String(tier)) : false;
        },
      },
      {
        id: 'rarity',
        label: 'Rarity',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const label = getRarityLabel(asStringOrNumber(entity.rarity));
            if (label === 'Unknown') return undefined;
            return { value: label, label };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const label = getRarityLabel(asStringOrNumber(entity.rarity));
          return selected.includes(label);
        },
      },
      {
        id: 'perkMod',
        label: 'Gem',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const perkMod = entity.perkMod;
            const modName = asString(getProperty(perkMod, 'name'));
            const modId = asString(getProperty(perkMod, 'id'));
            const mod = modName || modId;
            if (!mod) return undefined;
            return { value: modId || mod, label: formatLabel(mod) ?? mod };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const perkMod = entity.perkMod;
          const modId = asString(getProperty(perkMod, 'id'));
          const modName = asString(getProperty(perkMod, 'name'));
          const mod = modId || modName;
          if (!mod) return false;
          return selected.includes(mod);
        },
      },
    ],
    detailRoute: (entity) => `/new-world-database/perk/${entity.id}`,
    getSubtitle: (entity) => formatLabel(asString(entity.type)),
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      if (entity.tier) {
        badges.push({ label: `Tier ${entity.tier}`, tone: 'outline' });
      }
      const rarity = getRarityLabel(asStringOrNumber(entity.rarity));
      if (rarity !== 'Unknown') {
        badges.push({ label: rarity, tone: 'rarity', rarity: asStringOrNumber(entity.rarity) });
      }
      const perkModName = asString(getProperty(entity.perkMod, 'name'));
      if (perkModName) {
        badges.push({ label: perkModName, tone: 'muted' });
      }
      return badges;
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
    resolveIcon: (entity) => asString(entity.icon) || asString(getProperty(entity.perkMod, 'icon')),
    getHighlight: (entity) => {
      const perkModName = asString(getProperty(entity.perkMod, 'name'));
      if (perkModName) {
        return { label: 'Gem', value: perkModName };
      }
      return null;
    },
  },
  'lore-books': {
    id: 'lore-books',
    name: 'Lore Books',
    icon: BookOpen,
    endpoint: 'lore-books',
    description: 'Collectible lore entries to complete your codex.',
    filters: [
      {
        id: 'itemType',
        label: 'Type',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const type = entity.itemType;
            if (!type) return undefined;
            return { value: String(type).toLowerCase(), label: formatLabel(asString(type)) ?? String(type) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const type = String(entity.itemType ?? '').toLowerCase();
          if (!type) return false;
          return selected.includes(type);
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/lore/${entity.id}`,
    getSubtitle: (entity) => formatLabel(asString(entity.itemType)),
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      if (entity.order) {
        badges.push({ label: `Order ${entity.order}`, tone: 'muted' });
      }
      return badges;
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
  },
  'status-effects': {
    id: 'status-effects',
    name: 'Status Effects',
    icon: Shield,
    endpoint: 'status-effects',
    description: 'Buffs, debuffs, and combat states.',
    filters: [
      {
        id: 'effect',
        label: 'Effect Type',
        type: 'multi',
        getOptions: (items) => {
          const set = new Set<string>();
          items.forEach((entity) => {
            const effectCategories = asArray<string>(entity.effectCategories);
            effectCategories.forEach((category: string) => {
              if (category) set.add(String(category));
            });
          });
          return Array.from(set)
            .sort((a, b) => a.localeCompare(b))
            .map((value) => ({ value, label: formatLabel(value) ?? value }));
        },
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const categories = asArray<string>(entity.effectCategories);
          if (!categories.length) return false;
          return selected.some((value) => categories.includes(value));
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/status-effect/${entity.id}`,
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      const rarity = getRarityLabel(asStringOrNumber(entity.rarity));
      if (rarity !== 'Unknown') {
        badges.push({ label: rarity, tone: 'rarity', rarity: asStringOrNumber(entity.rarity) });
      }
      const effectCategories = asArray<string>(entity.effectCategories);
      if (effectCategories.length) {
        badges.push({ label: effectCategories[0], tone: 'muted' });
      }
      return badges;
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
    resolveIcon: (entity) => asString(entity.icon),
  },
  quests: {
    id: 'quests',
    name: 'Quests',
    icon: Compass,
    endpoint: 'quests',
    description: 'Main story beats, side quests and repeatable objectives with reward previews.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/quests/${id}` : '/new-world-database/quests';
    },
    filters: [
      {
        id: 'questType',
        label: 'Quest Type',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const type = entity.itemType;
            if (!type) return undefined;
            return { value: String(type).toLowerCase(), label: formatLabel(asString(type)) ?? String(type) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const type = String(entity.itemType ?? '').toLowerCase();
          if (!type) return false;
          return selected.includes(type);
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/quest/${entity.id}`,
    getSubtitle: (entity) => formatLabel(asString(entity.itemType)),
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      const rarity = getRarityLabel(asStringOrNumber(entity.rarity));
      if (rarity !== 'Unknown') {
        badges.push({ label: rarity, tone: 'rarity', rarity: asStringOrNumber(entity.rarity) });
      }
      if (entity.DifficultyLevel) {
        badges.push({ label: `Level ${entity.DifficultyLevel}`, tone: 'outline' });
      }
      return badges;
    },
    getMeta: (entity) => {
      const meta: MetaDescriptor[] = [];
      const rewards = entity.rewards;
      const xp = asNumber(getProperty(rewards, 'xp'));
      if (xp) {
        meta.push({ label: 'XP', value: formatNumber(xp) });
      }
      const coins = asNumber(getProperty(rewards, 'coins'));
      if (coins) {
        meta.push({ label: 'Coins', value: formatNumber(coins) });
      }
      const azoth = asNumber(getProperty(rewards, 'azoth'));
      if (azoth) {
        meta.push({ label: 'Azoth', value: formatNumber(azoth) });
      }
      return meta;
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
  },
  creatures: {
    id: 'creatures',
    name: 'Creatures',
    icon: PawPrint,
    endpoint: 'creatures',
    description: 'Enemy families, bosses and fauna with level ranges and encounters.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/creatures/${id}` : '/new-world-database/creatures';
    },
    filters: [
      {
        id: 'family',
        label: 'Family',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const family = entity.Family ?? entity.family;
            if (!family) return undefined;
            return { value: String(family).toLowerCase(), label: formatLabel(asString(family)) ?? String(family) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const family = String(entity.Family ?? entity.family ?? '').toLowerCase();
          if (!family) return false;
          return selected.includes(family);
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/creature/${entity.id}`,
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      if (entity.Family) {
        badges.push({ label: asString(entity.Family), tone: 'muted' });
      }
      return badges;
    },
    getHighlight: (entity) => {
      if (entity.Level) {
        return { label: 'Level', value: String(entity.Level) };
      }
      return null;
    },
  },
  gatherables: {
    id: 'gatherables',
    name: 'Gatherables',
    icon: Pickaxe,
    endpoint: 'gatherables',
    description: 'Harvest nodes, veins and collectibles including trade skill requirements.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/gatherables/${id}` : '/new-world-database/gatherables';
    },
    filters: [
      {
        id: 'tradeskill',
        label: 'Tradeskill',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const skill = entity.Tradeskill ?? entity.tradeskill;
            if (!skill) return undefined;
            return { value: String(skill).toLowerCase(), label: formatLabel(asString(skill)) ?? String(skill) };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const skill = String(entity.Tradeskill ?? entity.tradeskill ?? '').toLowerCase();
          if (!skill) return false;
          return selected.includes(skill);
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/gatherable/${entity.id}`,
    getSubtitle: (entity) => formatLabel(asString(entity.Tradeskill ?? entity.tradeskill)),
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      if (entity.RequiredTradeskillLevel) {
        badges.push({ label: `Req. ${entity.RequiredTradeskillLevel}`, tone: 'outline' });
      }
      return badges;
    },
  },
  shops: {
    id: 'shops',
    name: 'Shops',
    icon: Store,
    endpoint: 'shops',
    description: 'Faction and seasonal stores with their currency costs.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/shops/${id}` : '/new-world-database/shops';
    },
    filters: [
      {
        id: 'shop',
        label: 'Vendor',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const shopName = asString(entity.shopName);
            if (!shopName) return undefined;
            return { value: shopName, label: shopName };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const shopName = asString(entity.shopName);
          if (!shopName) return false;
          return selected.includes(shopName);
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/item/${entity.id}`,
    getSubtitle: (entity) => asString(entity.shopName),
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      const rarity = getRarityLabel(asStringOrNumber(entity.rarity));
      if (rarity !== 'Unknown') {
        badges.push({ label: rarity, tone: 'rarity', rarity: asStringOrNumber(entity.rarity) });
      }
      const price = entity.price;
      const categoricalProgressionId = asString(getProperty(price, 'CategoricalProgressionId'));
      if (categoricalProgressionId) {
        badges.push({ label: formatLabel(categoricalProgressionId) ?? categoricalProgressionId, tone: 'muted' });
      }
      return badges;
    },
    getMeta: (entity) => {
      const meta: MetaDescriptor[] = [];
      const price = entity.price;
      const tokenCost = asNumber(getProperty(price, 'BuyCategoricalProgressionCost'));
      if (tokenCost) {
        meta.push({ label: 'Token Cost', value: formatNumber(tokenCost) });
      }
      const coinCost = asNumber(getProperty(price, 'BuyCurrencyCost'));
      if (coinCost) {
        meta.push({ label: 'Coin Cost', value: formatNumber(coinCost) });
      }
      return meta;
    },
    getDescription: (entity) => truncateText(asString(entity.description)),
    resolveIcon: (entity) => asString(entity.icon),
  },
  npcs: {
    id: 'npcs',
    name: 'NPCs',
    icon: Users,
    endpoint: 'npcs',
    description: 'Named non-player characters and vendors across Aeternum.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/npcs/${id}` : '/new-world-database/npcs';
    },
    filters: [
      {
        id: 'title',
        label: 'Role',
        type: 'multi',
        getOptions: (items) =>
          collectUniqueOptions(items, (entity) => {
            const title = asString(entity.title);
            if (!title) return undefined;
            return { value: title, label: title };
          }),
        predicate: (entity, selected) => {
          if (!selected.length) return true;
          const title = asString(entity.title);
          if (!title) return false;
          return selected.includes(title);
        },
      },
    ],
    externalDetailUrl: (entity) => `https://nwdb.info/db/npc/${entity.id}`,
    getSubtitle: (entity) => asString(entity.title),
    getDescription: (entity) => truncateText(asString(entity.description)),
  },
  zones: {
    id: 'zones',
    name: 'Zones',
    icon: MapIcon,
    endpoint: 'zones',
    description: 'Regions, landmarks and instanced content pulled from in-game mapping data.',
    detailRoute: (entity) => {
      const id = getEntityId(entity);
      return id ? `/new-world-database/zones/${id}` : '/new-world-database/zones';
    },
    filters: [],
    externalDetailUrl: (entity) => `https://nwdb.info/db/zone/${entity.id}`,
    getBadges: (entity) => {
      const badges: BadgeDescriptor[] = [];
      const rarity = getRarityLabel(asStringOrNumber(entity.rarity));
      if (rarity !== 'Unknown') {
        badges.push({ label: rarity, tone: 'rarity', rarity: asStringOrNumber(entity.rarity) });
      }
      return badges;
    },
    resolveIcon: (entity) => asString(entity.icon),
  },
};
const Database = () => {
  const filtersDisabled = true;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('items');
  const [categoryData, setCategoryData] = useState<CategoryData>({
    data: [],
    pageCount: 0,
    currentPage: 1,
    dynamicFilters: {},
  });
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [hoverLoading, setHoverLoading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [hoveredPerk, setHoveredPerk] = useState<Perk | null>(null);
  const [activeHoverKey, setActiveHoverKey] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredPerkDetails, setHoveredPerkDetails] = useState<any | null>(null);
  const [perkHoverLoading, setPerkHoverLoading] = useState(false);
  const [activePerkHoverKey, setActivePerkHoverKey] = useState<string | null>(null);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentHoverKeyRef = useRef<string | null>(null);
  const itemDetailsCacheRef = useRef<Record<string, Item>>({});
  const perkHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perkHoverDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPerkHoverKeyRef = useRef<string | null>(null);
  const perkDetailsCacheRef = useRef<Record<string, any>>({});

  const categories = useMemo(() => Object.values(CATEGORY_CONFIGS), []);
  const activeConfig = CATEGORY_CONFIGS[activeCategory] ?? CATEGORY_CONFIGS['items'];
  const categoryFilters = activeConfig.filters;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const fetchPerkTooltipDetails = useCallback(
    async (perkId: string): Promise<any | null> => {
      if (perkDetailsCacheRef.current[perkId]) {
        return perkDetailsCacheRef.current[perkId];
      }
      
      try {
        const response = await fetch(`https://nwdb.info/db/perk/${perkId}.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // Extract data from the response structure
        const data = responseData.data || responseData;
        
        perkDetailsCacheRef.current[perkId] = data;
        return data;
      } catch (error) {
        console.error(`Error fetching perk tooltip ${perkId}:`, error);
        return null;
      }
    },
    [],
  );

  const fetchPerkDetails = useCallback(async (perkId: string): Promise<Perk | null> => {
    if (perkDetailsCacheRef.current[perkId]) {
      return perkDetailsCacheRef.current[perkId];
    }
    try {
      const responseData = await simpleNwdbService.getPerkDetails(perkId);
      if (responseData?.error) {
        console.error(`Error fetching perk ${perkId}:`, responseData.error);
        return null;
      }
      const data = responseData.data || responseData;
      if (!data) return null;
      const perk: Perk = {
        id: data.id || perkId,
        name: data.name || 'Unknown Perk',
        description: data.description || '',
        rarity: data.rarity,
        tier: data.tier,
        icon: data.icon || data.iconHiRes,
        type: data.type,
        itemType: data.itemType,
      };
      perkDetailsCacheRef.current[perkId] = perk;
      return perk;
    } catch (error) {
      console.error(`Error fetching perk ${perkId}:`, error);
=======
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [perksCache, setPerksCache] = useState<Record<string, any>>({});
  const currentHoveredId = useRef<string | null>(null);
  const hoverDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get proper image URL
  const getImageUrl = (item: SearchResult | Item) => {
    const iconPath = 'iconHiRes' in item ? item.iconHiRes || item.icon : item.icon;
    if (!iconPath) {
      return '/placeholder.svg';
    }
    // Remove leading slash if present and ensure proper path
    const cleanPath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
    const fullUrl = `https://cdn.nwdb.info/db/images/live/v56/${cleanPath}.png`;
    return fullUrl;
  };

  // Get rarity display info
  const getRarityInfo = (rarity: string | number) => {
    const numericRarity = typeof rarity === 'number' ? rarity : 0;
    const rarityName = rarityNames[numericRarity as keyof typeof rarityNames] || 'Common';
    const colorClass = rarityColors[numericRarity as keyof typeof rarityColors] || rarityColors[0];
    return { name: rarityName, colorClass };
  };

  // Fetch item details using the original service
  const fetchItemDetails = useCallback(async (itemId: string): Promise<Item | null> => {
    try {
      if (itemId && itemId.startsWith('perkid_')) {
        console.log('Skipping perk ID:', itemId);
        return null;
      }
      
      const responseData = await simpleNwdbService.getItemDetails(itemId);
      
      if (responseData.error) {
        console.error('Error fetching item details:', responseData.error);
        return null;
      }
      
      const data = responseData.data || responseData;
      
      if (!data) {
        console.error('No data found for item:', itemId);
        return null;
      }
      
      // Fetch perk details
      const perksWithDetails = await Promise.all(
        (data.perks || []).map(async (perk: any) => {
          if (perksCache[perk.id]) {
            return { ...perk, ...perksCache[perk.id] };
          }
          
          try {
            const perkResponse = await fetch(`https://nwdb.info/db/perk/${perk.id}.json`);
            const perkData = await perkResponse.json();
            const perkInfo = {
              name: perkData.data?.name || perkData.name,
              description: perkData.data?.description || perkData.description
            };
            
            setPerksCache(prev => ({ ...prev, [perk.id]: perkInfo }));
            return { ...perk, ...perkInfo };
          } catch {
            return perk;
          }
        })
      );

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        iconHiRes: data.iconHiRes,
        tier: data.tier,
        rarity: data.rarity,
        baseDamage: data.baseDamage,
        critChance: data.critChance,
        critDamageMultiplier: data.critDamageMultiplier,
        blockStaminaDamage: data.blockStaminaDamage,
        blockStability: data.blockStability,
        perks: perksWithDetails,
        gearScoreMax: data.gearScoreMax,
        gearScoreMin: data.gearScoreMin,
        itemType: data.itemType,
        attributes: data.attributes,
        sockets: data.sockets,
      };
    } catch (error) {
      console.error('Error fetching item details:', error);
      return null;
    }
  }, [perksCache]);

  // Search function using the original service
  const searchItems = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await simpleNwdbService.searchItems(query, 10);
      
      const searchResults = results.map(item => ({
        id: item.id,
        name: item.name,
        rarity: item.rarity || 'Unknown',
        icon: item.icon || '',
        tier: item.tier || 0,
      }));
      
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fetch perk details
  const fetchPerkDetails = useCallback(async (perkId: string): Promise<any> => {
    try {
      const responseData = await simpleNwdbService.getPerkDetails(perkId);
      
      if (responseData.error) {
        console.error('Error fetching perk details:', responseData.error);
        return null;
      }
      
      const data = responseData.data || responseData;
      
      return {
        id: data.id || perkId,
        name: data.name || 'Unknown Perk',
        description: data.description || 'No description available',
        rarity: data.rarity || 'Common',
        tier: data.tier || 0,
        icon: data.icon || data.iconHiRes,
        type: data.type || 'perk',
        itemType: data.itemType || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching perk details:', error);
>>>>>>> 037983faadfcc98299e2af7549d0913ba9fd3185
      return null;
    }
  }, []);

<<<<<<< HEAD
  const fetchItemDetails = useCallback(
    async (itemId: string): Promise<Item | null> => {
      if (itemId.startsWith('perkid_')) return null;
      if (itemDetailsCacheRef.current[itemId]) {
        return itemDetailsCacheRef.current[itemId];
      }
      try {
        const responseData = await simpleNwdbService.getItemDetails(itemId);
        if (responseData?.error) {
          console.error(`Error fetching item ${itemId}:`, responseData.error);
          return null;
        }
        const data = responseData.data || responseData;
        if (!data) return null;

        const rawPerks = asArray<Record<string, unknown>>((data as Record<string, unknown>)['perks']);
        const perks = (
          await Promise.all(
            rawPerks.map(async (perkEntry) => {
              const perkId = toStringValue(perkEntry['id']);
              if (!perkId) {
                return null;
              }
              const details = await fetchPerkDetails(perkId);
              return {
                id: perkId,
                name: details?.name ?? toStringValue(perkEntry['name']),
                description: details?.description ?? toStringValue(perkEntry['description']),
                icon: details?.icon ?? toStringValue(perkEntry['icon']),
              };
            }),
          )
        ).filter((perk): perk is NonNullable<typeof perk> => perk !== null);

        const randomPerkBuckets = asArray<Record<string, unknown>>((data as Record<string, unknown>)['perkBuckets'])
          .map((bucket, bucketIndex) => {
            const bucketId = toStringValue(bucket['id']) ?? `${itemId}-bucket-${bucketIndex}`;
            const bucketChance = asNumber(bucket['chance']);
            const options = asArray<Record<string, unknown>>(bucket['perks'])
              .map((option, optionIndex) => {
                const perkInfo = getProperty(option, 'perk');
                const perkId = toStringValue(getProperty(perkInfo, 'id')) ?? toStringValue(option['id']);
                const name = toStringValue(getProperty(perkInfo, 'name')) ?? toStringValue(option['name']);
                const icon = toStringValue(getProperty(perkInfo, 'icon'));
                const chance = asNumber((option as Record<string, unknown>)['chance']);
                if (!perkId && !name) {
                  return null;
                }
                return {
                  id: perkId ?? `${bucketId}-option-${optionIndex}`,
                  name: name ?? perkId ?? `${bucketId}-option-${optionIndex}`,
                  icon,
                  chance,
                };
              })
              .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

            if (!options.length) {
              return null;
            }

            return {
              id: bucketId,
              chance: bucketChance,
              options,
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

        // Add random perk entries for each perk bucket
        if (randomPerkBuckets.length > 0) {
          randomPerkBuckets.forEach((bucket, bucketIndex) => {
            const bucketChance = bucket.chance || 0;
            const randomChancePercent = bucketChance <= 1 ? bucketChance * 100 : bucketChance;
            const formattedChance = Math.round(randomChancePercent * 10) / 10;
            
            perks.push({
              id: `random-perk-${bucket.id || bucketIndex}`,
              name: `${formattedChance}% Random`,
              description: `Random perk with ${formattedChance}% chance`,
              icon: undefined,
            });
          });
        }

        const item: Item = {
          id: data.id,
          name: data.name,
          description: data.description,
          icon: data.icon,
          iconHiRes: data.iconHiRes,
          tier: data.tier,
          rarity: data.rarity,
          gearScore: data.gearScore,
          gearScoreMax: data.gearScoreMax,
          gearScoreMin: data.gearScoreMin,
          baseDamage: data.baseDamage,
          critChance: data.critChance,
          critDamageMultiplier: data.critDamageMultiplier,
          blockStaminaDamage: data.blockStaminaDamage,
          blockStability: data.blockStability,
          perks,
          itemType: data.itemType,
          attributes: data.attributes,
          sockets: data.sockets,
        };

        itemDetailsCacheRef.current[itemId] = item;
        return item;
      } catch (error) {
        console.error(`Error fetching item ${itemId}:`, error);
        return null;
      }
    },
    [fetchPerkDetails],
  );

  const searchItems = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await simpleNwdbService.searchItems(trimmed, 12);
        const mapped = results.map((item) => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
          rarity: item.rarity,
          tier: typeof item.tier === 'string' ? Number(item.tier) || 0 : item.tier || 0,
          gearScoreMax: typeof item.gearScore === 'string' ? Number(item.gearScore) || 0 : item.gearScore || 0,
        }));
        setSearchResults(mapped);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  const handlePerkHover = useCallback(
    (perkId: string, elementId: string) => {
      // Only show tooltip for the specific element being hovered
      const hoverKey = `perk:${perkId}:${elementId}`;
      
      // Clear any existing timeouts
      if (perkHoverTimeoutRef.current) {
        clearTimeout(perkHoverTimeoutRef.current);
        perkHoverTimeoutRef.current = null;
      }
      if (perkHoverDebounceRef.current) {
        clearTimeout(perkHoverDebounceRef.current);
        perkHoverDebounceRef.current = null;
      }

      currentPerkHoverKeyRef.current = hoverKey;
      setActivePerkHoverKey(hoverKey);
      setPerkHoverLoading(true);

      // Debounce the hover to prevent rapid firing
      perkHoverDebounceRef.current = setTimeout(() => {
        // Double-check we're still hovering the same element
        if (currentPerkHoverKeyRef.current !== hoverKey) {
          return;
        }

        perkHoverTimeoutRef.current = setTimeout(async () => {
          // Triple-check we're still hovering the same element
          if (currentPerkHoverKeyRef.current !== hoverKey) {
            return;
          }

          try {
            const details = await fetchPerkTooltipDetails(perkId);
            // Final check before setting state
            if (currentPerkHoverKeyRef.current === hoverKey) {
              setHoveredPerkDetails(details);
              setPerkHoverLoading(false);
            }
          } catch (error) {
            console.error(`Error fetching perk tooltip details:`, error);
            if (currentPerkHoverKeyRef.current === hoverKey) {
              setHoveredPerkDetails(null);
              setPerkHoverLoading(false);
            }
          }
        }, 1000); // 1 second delay as requested
      }, 100); // Increased debounce for stability
    },
    [fetchPerkTooltipDetails],
  );

  const handlePerkMouseLeave = useCallback(() => {
    // Clear all timeouts immediately
    if (perkHoverDebounceRef.current) {
      clearTimeout(perkHoverDebounceRef.current);
      perkHoverDebounceRef.current = null;
    }
    if (perkHoverTimeoutRef.current) {
      clearTimeout(perkHoverTimeoutRef.current);
      perkHoverTimeoutRef.current = null;
    }
    
    // Reset all state
    currentPerkHoverKeyRef.current = null;
    setActivePerkHoverKey(null);
    setHoveredPerkDetails(null);
    setPerkHoverLoading(false);
  }, []);

  const handleEntityHover = useCallback(
    (id: string, type?: 'item' | 'perk') => {
      if (!type) return;

      const hoverKey = `${type}:${id}`;
      currentHoverKeyRef.current = hoverKey;
      setActiveHoverKey(hoverKey);

      // Clear any existing debounce
      if (hoverDebounceRef.current) {
        clearTimeout(hoverDebounceRef.current);
        hoverDebounceRef.current = null;
      }

      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      // Debounce hover to prevent rapid firing
      hoverDebounceRef.current = setTimeout(() => {
        if (currentHoverKeyRef.current !== hoverKey) return;

        setHoverLoading(true);

        // Delay before fetching to ensure user is actually hovering
        hoverTimeoutRef.current = setTimeout(async () => {
          if (currentHoverKeyRef.current !== hoverKey) return;
          
          try {
            if (type === 'item') {
              const details = await fetchItemDetails(id);
              if (currentHoverKeyRef.current === hoverKey) {
                setHoveredItem(details);
                setHoveredPerk(null);
              }
            } else {
              const details = await fetchPerkDetails(id);
              if (currentHoverKeyRef.current === hoverKey) {
                setHoveredPerk(details);
                setHoveredItem(null);
              }
            }
          } catch (error) {
            console.error(`Error fetching ${type} details:`, error);
          } finally {
            if (currentHoverKeyRef.current === hoverKey) {
              setHoverLoading(false);
            }
          }
        }, 200); // Reduced delay for better responsiveness
      }, 50); // Reduced debounce for better responsiveness
    },
    [fetchItemDetails, fetchPerkDetails],
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverDebounceRef.current) {
      clearTimeout(hoverDebounceRef.current);
      hoverDebounceRef.current = null;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    currentHoverKeyRef.current = null;
    setActiveHoverKey(null);
    setHoveredItem(null);
    setHoveredPerk(null);
    setHoverLoading(false);
  }, []);

  const fetchCategoryData = useCallback(async (categoryId: string, page = 1) => {
    const config = CATEGORY_CONFIGS[categoryId];
    if (!config) return;
    setIsLoadingCategory(true);
    try {
      const response = await fetch(`https://nwdb.info/db/${config.endpoint}/page/${page}.json`);
      const payload = await response.json();
      const data = Array.isArray(payload.data) ? payload.data : [];
      setCategoryData({
        data,
        pageCount: payload.pageCount || 0,
        currentPage: page,
        dynamicFilters: payload.dynamic_filters ?? {},
      });
    } catch (error) {
      console.error(`Error fetching ${categoryId} entries:`, error);
      setCategoryData({
        data: [],
        pageCount: 0,
        currentPage: 1,
        dynamicFilters: {},
      });
=======
  // Fetch category data
  const fetchCategoryData = useCallback(async (category: string, page: number = 1) => {
    const categoryConfig = categories.find(c => c.id === category);
    if (!categoryConfig) return;

    setIsLoadingCategory(true);
    try {
      const response = await fetch(`https://nwdb.info/db/${categoryConfig.endpoint}/page/${page}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategoryData({
        data: data.data || [],
        pageCount: data.pageCount || 1,
        currentPage: page
      });
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategoryData({ data: [], pageCount: 0, currentPage: 1 });
>>>>>>> 037983faadfcc98299e2af7549d0913ba9fd3185
    } finally {
      setIsLoadingCategory(false);
    }
  }, []);

<<<<<<< HEAD
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      if (categoryId === activeCategory) return;
      if (!CATEGORY_CONFIGS[categoryId]) return;
      setActiveCategory(categoryId);
      setActiveFilters({});
      setSearchQuery('');
      setSearchResults([]);
      handleMouseLeave();
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [activeCategory, handleMouseLeave],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > (categoryData.pageCount || 1) || page === categoryData.currentPage) return;
      fetchCategoryData(activeCategory, page);
    },
    [activeCategory, categoryData.currentPage, categoryData.pageCount, fetchCategoryData],
  );

  const toggleFilter = useCallback((filter: FilterConfig, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[filter.id] ?? [];
      let next: string[];
      if (filter.type === 'multi') {
        next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
      } else {
        next = current.includes(value) ? [] : [value];
      }
      const updated = { ...prev };
      if (!next.length) {
        delete updated[filter.id];
      } else {
        updated[filter.id] = next;
      }
      return updated;
    });
  }, []);

  const clearFilter = useCallback((filterId: string) => {
    setActiveFilters((prev) => {
      if (!prev[filterId]) return prev;
      const updated = { ...prev };
      delete updated[filterId];
      return updated;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const selectEntity = useCallback(
    (entity: RawEntity, categoryId: string) => {
      const config = CATEGORY_CONFIGS[categoryId];
      if (!config) return;
      if (config.detailRoute) {
        navigate(config.detailRoute(entity));
        return;
      }
      if (config.externalDetailUrl) {
        const url = config.externalDetailUrl(entity);
        if (url && typeof window !== 'undefined') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    },
    [navigate],
  );
  const filteredData = useMemo(() => {
    let data = categoryData.data;
    if (activeCategory !== 'items' && normalizedQuery) {
      data = data.filter((entity) => {
        const name = String(entity.name ?? '').toLowerCase();
        return name.includes(normalizedQuery);
      });
    }
    if (!categoryFilters.length) {
      // Apply sorting
      return data.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case 'name':
            aValue = String(a.name ?? '').toLowerCase();
            bValue = String(b.name ?? '').toLowerCase();
            break;
          case 'rarity':
            aValue = getRarityNumeric(asStringOrNumber(a.rarity) ?? asStringOrNumber(a.Rarity));
            bValue = getRarityNumeric(asStringOrNumber(b.rarity) ?? asStringOrNumber(b.Rarity));
            break;
          case 'tier':
            aValue = Number(a.tier ?? a.Tier ?? 0);
            bValue = Number(b.tier ?? b.Tier ?? 0);
            break;
          case 'gearScore':
            aValue = Number(a.gearScore ?? a.GearScore ?? 0);
            bValue = Number(b.gearScore ?? b.GearScore ?? 0);
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data.filter((entity) =>
      categoryFilters.every((filter) => {
        const selected = activeFilters[filter.id] ?? [];
        if (!selected.length) return true;
        return filter.predicate(entity, selected);
      }),
    ).sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = String(a.name ?? '').toLowerCase();
          bValue = String(b.name ?? '').toLowerCase();
          break;
        case 'rarity':
          aValue = getRarityNumeric(asStringOrNumber(a.rarity) ?? asStringOrNumber(a.Rarity));
          bValue = getRarityNumeric(asStringOrNumber(b.rarity) ?? asStringOrNumber(b.Rarity));
          break;
        case 'tier':
          aValue = Number(a.tier ?? a.Tier ?? 0);
          bValue = Number(b.tier ?? b.Tier ?? 0);
          break;
        case 'gearScore':
          aValue = Number(a.gearScore ?? a.GearScore ?? 0);
          bValue = Number(b.gearScore ?? b.GearScore ?? 0);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [categoryData.data, activeCategory, normalizedQuery, categoryFilters, activeFilters, sortField, sortDirection]);

  const activeFilterCount = categoryFilters.reduce((count, filter) => count + (activeFilters[filter.id]?.length ?? 0), 0);
  const shouldShowSearchResults = activeCategory === 'items' && normalizedQuery.length > 0;

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  useEffect(() => {
    fetchCategoryData(activeCategory, 1);
  }, [activeCategory, fetchCategoryData]);

  // Cleanup tooltips when category changes
  useEffect(() => {
    // Clear perk tooltips when category changes
    if (perkHoverDebounceRef.current) {
      clearTimeout(perkHoverDebounceRef.current);
      perkHoverDebounceRef.current = null;
    }
    if (perkHoverTimeoutRef.current) {
      clearTimeout(perkHoverTimeoutRef.current);
      perkHoverTimeoutRef.current = null;
    }
    currentPerkHoverKeyRef.current = null;
    setActivePerkHoverKey(null);
    setHoveredPerkDetails(null);
    setPerkHoverLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    if (activeCategory !== 'items') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    if (!searchQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
=======
  // Enhanced hover handling
  const handleMouseEnter = useCallback((itemId: string) => {
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
    }
    
    currentHoveredId.current = itemId;
    
    hoverDebounceTimeout.current = setTimeout(() => {
      if (currentHoveredId.current === itemId) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        setHoverLoading(true);
        
        const timeout = setTimeout(async () => {
          try {
            const itemDetails = await fetchItemDetails(itemId);
            if (currentHoveredId.current === itemId) {
              setHoveredItem(itemDetails);
            }
          } catch (error) {
            console.error('Error fetching hover item details:', error);
          } finally {
            if (currentHoveredId.current === itemId) {
              setHoverLoading(false);
            }
          }
        }, 1000);
        
        setHoverTimeout(timeout);
      }
    }, 50);
  }, [fetchItemDetails, hoverTimeout]);

  const handlePerkMouseEnter = useCallback((perkId: string) => {
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
    }
    
    currentHoveredId.current = perkId;
    
    hoverDebounceTimeout.current = setTimeout(() => {
      if (currentHoveredId.current === perkId) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        setHoverLoading(true);
        
        const timeout = setTimeout(async () => {
          try {
            const perkDetails = await fetchPerkDetails(perkId);
            if (currentHoveredId.current === perkId) {
              setHoveredPerk(perkDetails);
            }
          } catch (error) {
            console.error('Error fetching hover perk details:', error);
          } finally {
            if (currentHoveredId.current === perkId) {
              setHoverLoading(false);
            }
          }
        }, 1000);
        
        setHoverTimeout(timeout);
      }
    }, 50);
  }, [fetchPerkDetails, hoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
      hoverDebounceTimeout.current = null;
    }
    
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    currentHoveredId.current = null;
    setHoveredItem(null);
    setHoveredPerk(null);
    setHoverLoading(false);
  }, [hoverTimeout]);

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchItems(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchItems]);

  // Load initial category data
  useEffect(() => {
    fetchCategoryData(activeCategory);
  }, [activeCategory, fetchCategoryData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (hoverDebounceTimeout.current) {
        clearTimeout(hoverDebounceTimeout.current);
      }
    };
  }, [hoverTimeout]);

  // Handle item selection - navigate to detail page (RESTORED)
  const handleItemSelect = (itemId: string, itemType?: string) => {
    if ((itemId && itemId.startsWith('perkid_')) || activeCategory === 'perks') {
      navigate(`/new-world-database/perk/${itemId}`);
      return;
    }
    
    navigate(`/new-world-database/item/${itemId}`);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.enabled) {
      setActiveCategory(categoryId);
      setSelectedItem(null);
      setSearchQuery('');
      setSearchResults([]);
>>>>>>> 037983faadfcc98299e2af7549d0913ba9fd3185
    }
    const timeout = setTimeout(() => {
      searchItems(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [activeCategory, searchQuery, searchItems]);

<<<<<<< HEAD
  useEffect(() => () => handleMouseLeave(), [handleMouseLeave]);
  const renderCategoryCard = useCallback(
    (entity: RawEntity, index: number, categoryId: string): JSX.Element | null => {
      const config = CATEGORY_CONFIGS[categoryId];
      if (!config) return null;

      const Icon = config.icon;
      const name = entity.name ?? 'Unknown';
      const subtitle = config.getSubtitle?.(entity);
      const badges = config.getBadges?.(entity) ?? [];
      const meta = config.getMeta?.(entity) ?? [];
      const description = config.getDescription?.(entity);
      const highlight = config.getHighlight?.(entity);
      const rarityLabel = getRarityLabel(asStringOrNumber(entity.rarity ?? entity.Rarity));
      const iconSource = config.resolveIcon?.(entity) ?? asString(entity.icon) ?? asString(getProperty(entity.perkMod, 'icon'));
      const imageUrl = resolveIconUrl(iconSource);
      const cardKey = `${categoryId}-${entity.id ?? index}`;
      const hoverKey = config.hoverType ? `${config.hoverType}:${entity.id}` : null;
      const isHoveringItem = config.hoverType === 'item' && hoveredItem && hoveredItem.id === entity.id;
      const isHoveringPerk = config.hoverType === 'perk' && hoveredPerk && hoveredPerk.id === entity.id;
      const showLoading = hoverKey ? hoverLoading && activeHoverKey === hoverKey : false;
      const isClickable = Boolean(config.detailRoute || config.externalDetailUrl);
      const isExternal = Boolean(config.externalDetailUrl && !config.detailRoute);
      const DetailIcon = isExternal ? ExternalLink : ChevronRight;

      const cardBody = (
        <Card
          key={cardKey}
          onMouseEnter={config.hoverType ? () => handleEntityHover(String(entity.id), config.hoverType) : undefined}
          onMouseLeave={config.hoverType ? handleMouseLeave : undefined}
          onClick={() => {
            if (isClickable) {
              selectEntity(entity, categoryId);
            }
          }}
          onKeyDown={(event) => {
            if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              selectEntity(entity, categoryId);
            }
          }}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : -1}
          className={`group relative overflow-hidden border border-slate-800/50 bg-slate-900/40 backdrop-blur-sm transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-700/70 hover:shadow-lg min-h-[140px] w-full ${
            isClickable ? 'cursor-pointer' : 'cursor-default'
          } ${getRarityOutlineClasses(asStringOrNumber(entity.rarity ?? entity.Rarity))}`}
        >
          <CardContent className="relative flex flex-col gap-3 p-4 sm:flex-row sm:gap-4 sm:p-5 edge-flex-fix card-responsive">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700/40 bg-slate-800/50 mx-auto sm:mx-0">
              {iconSource ? (
                <img
                  src={imageUrl}
                  alt={String(name)}
                  className="h-full w-full object-contain p-1"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <Icon className="h-5 w-5 text-slate-400" />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white">{String(name)}</h3>
                  {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                </div>
                {highlight && (
                  <div className="text-center sm:text-right">
                    <p className="text-xs font-medium text-slate-300">{highlight.value}</p>
                  </div>
                )}
              </div>

              {badges.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 sm:justify-start">
                  {badges.map((badge, badgeIndex) => (
                    <Badge key={`${cardKey}-badge-${badgeIndex}`} className={`${getBadgeClassName(badge)} text-xs px-2 py-0.5`}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}

              {description && <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{description}</p>}

              {meta.length > 0 && (
                <div className="grid gap-x-3 gap-y-1 text-xs text-slate-500 sm:grid-cols-2">
                  {meta.map((entry, metaIndex) => (
                    <div key={`${cardKey}-meta-${metaIndex}`} className="flex items-center justify-center gap-1 sm:justify-start">
                      <span className="text-slate-500">{entry.label}</span>
                      <span className="font-medium text-slate-300">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {isClickable && (
                <span className="inline-flex items-center justify-center gap-1 text-xs text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:justify-start">
                  View details
                  <DetailIcon className="h-3 w-3" />
                </span>
              )}
=======
  // Render item card with enhanced design
  const renderItemCard = (item: SearchResult | Item, index?: number) => {
    const isFullItem = 'perks' in item;
    const itemData = isFullItem ? item : item as SearchResult;
    const uniqueKey = `${itemData.id}-${index || 0}`;
    const isPerk = activeCategory === 'perks' || (itemData.id && itemData.id.startsWith('perkid_'));
    const rarityInfo = getRarityInfo(itemData.rarity);

    return (
      <Tooltip key={uniqueKey}>
        <TooltipTrigger asChild>
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-br from-card/80 to-slate-900/80 border-slate-700/50 hover:border-primary/30 backdrop-blur-sm"
            onMouseEnter={() => isPerk ? handlePerkMouseEnter(itemData.id) : handleMouseEnter(itemData.id)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleItemSelect(itemData.id, activeCategory)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityInfo.colorClass} rounded-lg opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <img 
                    src={getImageUrl(itemData)} 
                    alt={itemData.name}
                    className="relative w-14 h-14 object-contain p-1 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${rarityInfo.colorClass} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                    {itemData.tier || '?'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                    {itemData.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    {itemData.tier && (
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300 bg-slate-800/50">
                        T{itemData.tier}
                      </Badge>
                    )}
                    <Badge 
                      className={`text-xs text-white bg-gradient-to-r ${rarityInfo.colorClass} border-0 shadow-sm`}
                    >
                      {rarityInfo.name}
                    </Badge>
                    {itemData.mountType && (
                      <Badge variant="secondary" className="text-xs bg-slate-700/70 text-slate-300">
                        {itemData.mountType}
                      </Badge>
                    )}
                    {itemData.gearScoreMax && (
                      <Badge variant="secondary" className="text-xs bg-slate-700/70 text-slate-300">
                        GS {itemData.gearScoreMax}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm bg-slate-900/95 border-slate-700 backdrop-blur-md">
          {hoverLoading ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-700 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center text-slate-400 text-sm">
                Loading {isPerk ? 'perk' : 'item'} details...
              </div>
            </div>
          ) : (hoveredItem && hoveredItem.id === itemData.id) || (hoveredPerk && hoveredPerk.id === itemData.id) ? (
            <div className="p-4 space-y-3 max-w-xs">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img 
                    src={isPerk ? getImageUrl(hoveredPerk) : getImageUrl(hoveredItem)} 
                    alt={isPerk ? hoveredPerk?.name : hoveredItem?.name}
                    className="w-12 h-12 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${getRarityInfo(isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity).colorClass} flex items-center justify-center text-xs font-bold text-white`}>
                    {isPerk ? hoveredPerk?.tier : hoveredItem?.tier}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-primary mb-1">
                    {isPerk ? hoveredPerk?.name : hoveredItem?.name}
                  </div>
                  <div className={`text-sm font-medium bg-gradient-to-r ${getRarityInfo(isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity).colorClass} bg-clip-text text-transparent`}>
                    {getRarityInfo(isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity).name}
                  </div>
                  {(isPerk ? hoveredPerk?.itemType : hoveredItem?.itemType) && (
                    <div className="text-slate-300 text-xs mt-1">{isPerk ? hoveredPerk?.itemType : hoveredItem?.itemType}</div>
                  )}
                </div>
              </div>

              {!isPerk && hoveredItem?.gearScoreMax && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                  <div className="text-2xl font-bold text-white">{hoveredItem?.gearScoreMax}</div>
                </div>
              )}

              <div className="border-t border-slate-600"></div>

              {(isPerk ? hoveredPerk?.description : hoveredItem?.description) && (
                <div className="text-slate-300 text-sm leading-relaxed">
                  {isPerk ? hoveredPerk?.description : hoveredItem?.description}
                </div>
              )}

              {isPerk && hoveredPerk && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-blue-400 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Type: {hoveredPerk.type}</span>
                  </div>
                </div>
              )}

              {!isPerk && hoveredItem?.attributes && hoveredItem?.attributes.length > 0 && (
                <div className="space-y-1">
                  {hoveredItem?.attributes.slice(0, 2).map((attr, index) => (
                    <div key={index} className="flex items-center space-x-2 text-blue-400 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>+{attr.value} {attr.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {!isPerk && hoveredItem?.perks && hoveredItem?.perks.length > 0 && (
                <div className="space-y-1">
                  {hoveredItem?.perks.slice(0, 2).map((perk, index) => (
                    <div key={index} className="flex items-center space-x-2 text-blue-400 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>{perk.name || `Random Perk`}</span>
                    </div>
                  ))}
                  {hoveredItem?.perks.length > 2 && (
                    <div className="text-gray-400 text-sm">+{hoveredItem?.perks.length - 2} more perks...</div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (categoryData.pageCount <= 1) return null;

    const pages = [];
    const totalPages = categoryData.pageCount;
    const currentPage = categoryData.currentPage;

    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <Button key={1} variant="outline" size="sm" onClick={() => handlePageChange(1)} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2 text-slate-400">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={i === currentPage 
            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
            : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          }
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-2 text-slate-400">...</span>);
      }
      pages.push(
        <Button key={totalPages} variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
          {totalPages}
        </Button>
      );
    }

    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {pages}
      </div>
    );
  };

  const activeConfig = categories.find(c => c.id === activeCategory);

  return (
    <Layout
      title="New World Database - Search Items, Mounts, and More"
      description="Search and browse New World items, mounts, recipes, and more in our comprehensive database."
      canonical={`${siteUrl}/new-world-database`}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent mb-4">
              New World Database
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and explore items, mounts, recipes, and more from Aeternum
            </p>
          </div>

          <div className="flex gap-8">
            {/* Enhanced Sidebar */}
            <div className="w-80 flex-shrink-0">
              <Card className="bg-card/80 backdrop-blur-sm border-slate-700/50 sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-foreground flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    Categories
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {activeConfig?.description || 'Select a category to explore'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isActive = activeCategory === category.id;
                      return (
                        <Button
                          key={category.id}
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start h-auto p-3 ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }`}
                          onClick={() => handleCategoryChange(category.id)}
                        >
                          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs opacity-70 mt-0.5">{category.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Enhanced Search */}
              <Card className="mb-6 bg-card/80 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder={`Search ${activeConfig?.name.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-slate-700/30 border-slate-600 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary text-lg"
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchQuery && (
                    <div className="mt-6">
                      {isSearching ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full bg-slate-700/50" />
                          ))}
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            Found {searchResults.length} results
                          </h3>
                          {searchResults.map((item, index) => (
                            <div key={`search-${item.id}-${index}`}>
                              {renderItemCard(item, index)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-muted-foreground text-lg">No items found</div>
                          <div className="text-sm text-muted-foreground mt-2">Try adjusting your search terms</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category Content */}
              {!searchQuery && (
                <Card className="bg-card/80 backdrop-blur-sm border-slate-700/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                      {activeConfig && <activeConfig.icon className="h-6 w-6 text-primary" />}
                      {activeConfig?.name}
                      <Badge variant="secondary" className="ml-auto bg-slate-700/70 text-slate-300">
                        {isLoadingCategory ? '...' : `${categoryData.data.length} items`}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCategory ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(12)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full bg-slate-700/50" />
                        ))}
                      </div>
                    ) : categoryData.data.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryData.data.map((item, index) => renderItemCard(item, index))}
                        </div>
                        {renderPagination()}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-muted-foreground text-xl">No items available</div>
                        <div className="text-sm text-muted-foreground mt-2">This category might be empty or unavailable</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
>>>>>>> 037983faadfcc98299e2af7549d0913ba9fd3185
            </div>
          </CardContent>
        </Card>
      );

      if (!config.hoverType) {
        return (
          <Tooltip key={cardKey}>
            <TooltipTrigger asChild>{cardBody}</TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm border-slate-700/70 bg-slate-900/95">
              {config.renderTooltipContent ? (
                config.renderTooltipContent(entity)
              ) : (
                <div className="space-y-2 text-sm text-slate-200">
                  {description ? <p>{description}</p> : <p>No additional details available yet.</p>}
                  {meta.length > 0 && (
                    <div className="grid gap-2 text-xs text-slate-400">
                      {meta.map((entry, metaIndex) => (
                        <div key={`${cardKey}-tooltip-meta-${metaIndex}`} className="flex items-center justify-between gap-4">
                          <span className="uppercase tracking-[0.2em] text-slate-500">{entry.label}</span>
                          <span className="font-medium text-slate-200">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        );
      }

      return (
        <HoverCard key={cardKey} openDelay={100} closeDelay={150}>
          <HoverCardTrigger asChild>{cardBody}</HoverCardTrigger>
          <HoverCardContent side="top" align="start" className="max-w-md border-slate-700/70 bg-slate-900/95">
            {showLoading ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-12 w-full rounded-md bg-slate-800/70" />
                <Skeleton className="h-6 w-full rounded-md bg-slate-800/70" />
                <Skeleton className="h-6 w-3/4 rounded-md bg-slate-800/70" />
              </div>
            ) : config.hoverType === 'item' && isHoveringItem && hoveredItem ? (
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={resolveIconUrl(hoveredItem.icon)}
                    alt={hoveredItem.name}
                    className="h-14 w-14 rounded-lg border border-slate-700/70 bg-slate-900/80 object-contain"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="space-y-1">
                    <h4 className={`text-lg font-semibold ${getRarityTextClasses(hoveredItem.rarity)}`}>{hoveredItem.name}</h4>
                    {hoveredItem.itemType && <p className="text-sm text-slate-300">{hoveredItem.itemType}</p>}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getBadgeClassName({ label: `Tier ${hoveredItem.tier ?? '?'}`, tone: 'outline' })}>
                        Tier {hoveredItem.tier ?? '?'}
                      </Badge>
                      {hoveredItem.gearScoreMax && (
                        <Badge className="border-none bg-slate-800/80 text-slate-200">GS {hoveredItem.gearScoreMax}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {hoveredItem.description && <p className="text-sm text-slate-200">{hoveredItem.description}</p>}

                {hoveredItem.attributes?.length ? (
                  <div className="space-y-1 text-sm text-blue-300">
                    {hoveredItem.attributes.slice(0, 3).map((attribute, attributeIndex) => (
                      <div key={`${cardKey}-attribute-${attributeIndex}`} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        <span>
                          +{attribute.value} {attribute.name}
                          {attribute.isSelectable ? ' (selectable)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {hoveredItem.perks?.length ? (
                  <div className="space-y-1 text-sm text-yellow-300">
                    {hoveredItem.perks.slice(0, 3).map((perk, perkIndex) => (
                      <div key={`${cardKey}-perk-${perkIndex}`} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                        <span>{perk.name ?? 'Random Perk'}</span>
                      </div>
                    ))}
                    {hoveredItem.perks.length > 3 && (
                      <p className="text-xs text-slate-400">+{hoveredItem.perks.length - 3} more perks</p>
                    )}
                  </div>
                ) : null}
              </div>
            ) : config.hoverType === 'perk' && isHoveringPerk && hoveredPerk ? (
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={resolveIconUrl(hoveredPerk.icon)}
                    alt={hoveredPerk.name}
                    className="h-14 w-14 rounded-lg border border-slate-700/70 bg-slate-900/80 object-contain"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="space-y-1">
                    <h4 className={`text-lg font-semibold ${getRarityTextClasses(hoveredPerk.rarity)}`}>{hoveredPerk.name}</h4>
                    {hoveredPerk.itemType && <p className="text-sm text-slate-300">{hoveredPerk.itemType}</p>}
                    <Badge className={getBadgeClassName({ label: `Tier ${hoveredPerk.tier ?? '?'}`, tone: 'outline' })}>
                      Tier {hoveredPerk.tier ?? '?'}
                    </Badge>
                  </div>
                </div>
                {hoveredPerk.description && <p className="text-sm text-slate-200">{hoveredPerk.description}</p>}
              </div>
            ) : (
              <div className="p-4 text-sm text-slate-300">Hover to load detailed stats.</div>
            )}
          </HoverCardContent>
        </HoverCard>
      );
    },
    [activeHoverKey, handleEntityHover, handleMouseLeave, hoverLoading, hoveredItem, hoveredPerk, selectEntity],
  );

  const renderPagination = useCallback(() => {
    const totalPages = categoryData.pageCount || 0;
    if (totalPages <= 1) return null;
    const currentPage = categoryData.currentPage || 1;

    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    const goToPage = (page: number) => {
      if (!isLoadingCategory) {
        handlePageChange(page);
      }
    };

    return (
      <div className="flex items-center justify-center gap-2 pt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1 || isLoadingCategory}
          onClick={() => goToPage(1)}
          className="border-slate-700/70 bg-slate-900/70 text-slate-300 hover:bg-slate-800/80"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1 || isLoadingCategory}
          onClick={() => goToPage(currentPage - 1)}
          className="border-slate-700/70 bg-slate-900/70 text-slate-300 hover:bg-slate-800/80"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {start > 1 && <span className="px-2 text-sm text-slate-500">...</span>}
        {pages.map((page) => (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? 'default' : 'outline'}
            disabled={isLoadingCategory}
            onClick={() => goToPage(page)}
            className={
              page === currentPage
                ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400'
                : 'border-slate-700/70 bg-slate-900/70 text-slate-300 hover:bg-slate-800/80'
            }
          >
            {page}
          </Button>
        ))}
        {end < totalPages && <span className="px-2 text-sm text-slate-500">...</span>}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages || isLoadingCategory}
          onClick={() => goToPage(currentPage + 1)}
          className="border-slate-700/70 bg-slate-900/70 text-slate-300 hover:bg-slate-800/80"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages || isLoadingCategory}
          onClick={() => goToPage(totalPages)}
          className="border-slate-700/70 bg-slate-900/70 text-slate-300 hover:bg-slate-800/80"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }, [categoryData.currentPage, categoryData.pageCount, handlePageChange, isLoadingCategory]);
  return (
    <Layout
      title="New World Database | Gear, Mounts, Recipes & More"
      description="Browse New World gear, mounts, recipes, quests, perks and more with real-time data pulled from NWDB."
      canonical={`${siteUrl}/new-world-database`}
    >
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] translate-x-1/3 rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.07),transparent_65%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-300">
                <Sparkles className="h-4 w-4" />
                Data Vault
              </div>
              <div>
                <h1 className="text-4xl font-semibold text-white md:text-5xl">New World Database</h1>
                <p className="mt-3 max-w-2xl text-base text-slate-300 md:text-lg">{activeConfig.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1">
                  <Filter className="h-3.5 w-3.5" />
                  {categoryFilters.length} filters
                </span>
                <Separator orientation="vertical" className="hidden h-4 bg-slate-700/70 sm:block" />
                <span>
                  Page {categoryData.currentPage || 1} of {categoryData.pageCount || 1}
                </span>
                <Separator orientation="vertical" className="hidden h-4 bg-slate-700/70 sm:block" />
                <span>{filteredData.length} results on this page</span>
                {activeFilterCount > 0 && (
                  <>
                    <Separator orientation="vertical" className="hidden h-4 bg-slate-700/70 sm:block" />
                    <span>{activeFilterCount} active filters</span>
                  </>
                )}
              </div>
            </div>

            <Card className="w-full max-w-md border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Search className="h-5 w-5 text-yellow-400" />
                  Search the archive
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={
                      activeCategory === 'items'
                        ? 'Search the entire NWDB item catalogue...'
                        : `Filter ${activeConfig.name.toLowerCase()} on this page...`
                    }
                    className="h-12 border-slate-700/60 bg-slate-900/70 pl-10 text-slate-100 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500 rounded-lg font-medium"
                  />
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {activeCategory === 'items'
                    ? 'Type at least two characters to fetch live data from NWDB. Filters apply to results below.'
                    : 'Search filters the current page for quick lookups. Use filters below to refine further.'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-[18rem,1fr]">
            <aside className="space-y-6">
              <Card className="border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Filter className="h-5 w-5 text-yellow-400" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = category.id === activeCategory;
                    return (
                      <Button
                        key={category.id}
                        variant={isActive ? 'default' : 'ghost'}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full justify-start gap-3 border-none text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 hover:from-yellow-400 hover:to-yellow-300 shadow-lg'
                            : 'bg-transparent text-slate-200 hover:bg-slate-800/70 hover:text-white hover:translate-x-1'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{category.name}</span>
                        {isActive && (
                          <span className="ml-auto rounded-full bg-slate-900/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
                            Active
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-slate-700/60 bg-slate-900/70 backdrop-blur">
                <CardContent className="space-y-2 p-5 text-sm text-slate-300">
                  <p>
                    Exploring <span className="font-semibold text-yellow-300">{activeConfig.name}</span> � page {categoryData.currentPage} of {categoryData.pageCount || 1}.
                  </p>
                  <p>Tip: Combine the quick search with filters to locate specific loot faster.</p>
                </CardContent>
              </Card>
            </aside>

            <main className="space-y-8">
              {categoryFilters.length > 0 && (
                <Card className={`border-slate-700/60 bg-slate-900/70 backdrop-blur ${filtersDisabled ? 'pointer-events-none opacity-40 saturate-50' : ''}`}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-5">
                    <span className={`text-sm font-medium ${filtersDisabled ? 'text-slate-500' : 'text-slate-200'}`}>Filters</span>
                    {filtersDisabled && (
                      <Badge variant="outline" className="border-slate-600/50 text-slate-400 bg-slate-800/50">Coming soon</Badge>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {categoryFilters.map((filter) => {
                        const options = filter.getOptions(categoryData.data, categoryData.dynamicFilters);
                        const selected = activeFilters[filter.id] ?? [];
                        const hasSelection = selected.length > 0;
                        return (
                          <Popover key={filter.id}>
                            <PopoverTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!options.length || filtersDisabled}
                                className={`h-9 gap-2 border-slate-700/70 bg-slate-900/70 text-slate-200 hover:bg-slate-800/80 ${
                                  hasSelection ? 'border-yellow-500/60 text-yellow-200' : ''
                                }`}
                              >
                                <span>{filter.label}</span>
                                {hasSelection && (
                                  <span className="rounded-full bg-yellow-500/20 px-2 text-[10px] font-semibold text-yellow-200">
                                    {selected.length}
                                  </span>
                                )}
                                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 border-slate-700/70 bg-slate-900/95 p-0" align="start">
                              <Command>
                                <CommandInput placeholder={`Search ${filter.label.toLowerCase()}...`} className="h-9" disabled={filtersDisabled} />
                                <CommandList>
                                  <CommandEmpty>No options found.</CommandEmpty>
                                  <CommandGroup className="max-h-60 overflow-y-auto">
                                    {options.map((option) => {
                                      const isSelected = selected.includes(option.value);
                                      return (
                                        <CommandItem
                                          key={option.value}
                                          onSelect={() => toggleFilter(filter, option.value)}
                                          className="flex items-center gap-2 text-slate-200"
                                        >
                                          <Check
                                            className={`h-4 w-4 ${
                                              isSelected ? 'text-yellow-400' : 'text-transparent'
                                            }`}
                                          />
                                          <span className="flex-1 text-sm">{option.label}</span>
                                          {option.hint && <span className="text-xs text-slate-400">{option.hint}</span>}
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                              {hasSelection && (
                                <div className="flex items-center justify-end border-t border-slate-800 px-3 py-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearFilter(filter.id)}
                                    className="h-8 text-xs text-slate-300 hover:text-white"
                                  >
                                    Clear
                                  </Button>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                        );
                      })}
                    </div>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="ml-auto h-9 text-xs text-slate-300 hover:text-white"
                      >
                        Reset filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {shouldShowSearchResults ? (
                <TooltipProvider delayDuration={120}>
                  <Card className="border-slate-700/60 bg-slate-900/70 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg text-slate-100">Search results</CardTitle>
                      {isSearching && <span className="text-xs text-slate-400">Fetching...</span>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isSearching ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, index) => (
                            <Skeleton key={index} className="h-24 w-full rounded-xl bg-slate-800/70" />
                          ))}
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((result, index) =>
                          renderCategoryCard(result as unknown as RawEntity, index, 'items'),
                        )
                      ) : (
                        <p className="text-sm text-slate-300">
                          No items found for <span className="text-yellow-300">{searchQuery}</span>. Try refining your query.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TooltipProvider>
              ) : (
                <TooltipProvider delayDuration={120}>
                  {isLoadingCategory ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 edge-grid-fallback">
                      {[...Array(12)].map((_, index) => (
                        <Skeleton key={index} className="h-40 w-full rounded-xl bg-gradient-to-br from-slate-800/70 to-slate-900/70 card-responsive" />
                      ))}
                    </div>
                  ) : filteredData.length > 0 ? (
                    <div className="overflow-visible rounded-lg border border-slate-700/60 bg-slate-900/70 backdrop-blur" style={{ position: 'relative', zIndex: 1 }}>
                      <div className="overflow-x-auto overflow-y-visible relative" style={{ zIndex: 1 }}>
                        <table className="w-full">
                          <thead className="bg-slate-800/50">
                            <tr>
                              <th 
                                className="px-4 py-5 text-left text-xs font-medium uppercase tracking-wider text-slate-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('name')}
                              >
                                <div className="flex items-center gap-2">
                                  Name
                                  {sortField === 'name' ? (
                                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                  )}
                                </div>
                              </th>
                              <th className="px-4 py-5 text-left text-xs font-medium uppercase tracking-wider text-slate-300">
                                Perks
                              </th>
                              <th 
                                className="px-4 py-5 text-left text-xs font-medium uppercase tracking-wider text-slate-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('rarity')}
                              >
                                <div className="flex items-center gap-2">
                                  Rarity
                                  {sortField === 'rarity' ? (
                                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                  )}
                                </div>
                              </th>
                              <th 
                                className="px-4 py-5 text-left text-xs font-medium uppercase tracking-wider text-slate-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('tier')}
                              >
                                <div className="flex items-center gap-2">
                                  Tier
                                  {sortField === 'tier' ? (
                                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                  )}
                                </div>
                              </th>
                              <th 
                                className="px-4 py-5 text-left text-xs font-medium uppercase tracking-wider text-slate-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('gearScore')}
                              >
                                <div className="flex items-center gap-2">
                                  Gear Score
                                  {sortField === 'gearScore' ? (
                                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                  )}
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {filteredData.map((entity, index) => {
                              const config = CATEGORY_CONFIGS[activeCategory];
                              const name = String(entity.name ?? 'Unknown');
                              const iconSource = config.resolveIcon?.(entity) ?? asString(entity.icon);
                              const imageUrl = resolveIconUrl(iconSource);
                              const rarityLabel = getRarityLabel(asStringOrNumber(entity.rarity ?? entity.Rarity));
                              const tier = entity.tier ?? entity.Tier;
                              const gearScore = entity.gearScore ?? entity.GearScore;
                              const isClickable = Boolean(config.detailRoute || config.externalDetailUrl);
                              
                              return (
                                <tr 
                                  key={`${activeCategory}-${entity.id ?? index}`}
                                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                                  style={{ position: 'relative', zIndex: 'auto' }}
                                  onClick={() => {
                                    if (isClickable) {
                                      selectEntity(entity, activeCategory);
                                    }
                                  }}
                                >
                                  <td className="px-4 py-5 relative" style={{ overflow: 'visible' }}>
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <div 
                                          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-700/40 bg-slate-800/50 cursor-pointer hover:border-slate-600/60 transition-colors"
                                          onMouseEnter={() => handleEntityHover(String(entity.id ?? index), 'item')}
                                          onMouseLeave={handleMouseLeave}
                                        >
                                          {iconSource ? (
                                            <img
                                              src={imageUrl}
                                              alt={String(name)}
                                              className="h-full w-full object-contain p-1"
                                              onError={(event) => {
                                                (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                                              }}
                                            />
                                          ) : (
                                            <config.icon className="h-6 w-6 text-slate-400" />
                                          )}
                                        </div>
                                        
                                        {/* Item Tooltip */}
                                        {activeHoverKey === `item:${String(entity.id ?? index)}` && (
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200" style={{ zIndex: 9999 }}>
                                            <div className="relative">
                                              {/* Tooltip Arrow */}
                                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-slate-900"></div>
                                              
                                              {/* Main Tooltip Container */}
                                              <div className="bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl max-w-sm overflow-hidden pointer-events-auto">
                                                {/* Header */}
                                                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                                                  <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                      <div className="h-12 w-12 rounded-lg bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden">
                                                        {hoveredItem?.icon ? (
                                                          <img
                                                            src={resolveIconUrl(hoveredItem.icon)}
                                                            alt={hoveredItem.name}
                                                            className="h-full w-full object-contain p-1"
                                                            onError={(event) => {
                                                              (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                                                            }}
                                                          />
                                                        ) : (
                                                          <config.icon className="h-7 w-7 text-slate-300" />
                                                        )}
                                                      </div>
                                                      {/* Rarity glow effect */}
                                                      {hoveredItem?.rarity && (
                                                        <div className={`absolute inset-0 rounded-lg ${getRarityOutlineClasses(hoveredItem.rarity)} opacity-30`}></div>
                                                      )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <h4 className="text-base font-bold text-white truncate">
                                                        {hoveredItem?.name || name}
                                                      </h4>
                                                      {hoveredItem?.rarity && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                          <span className={`text-sm font-semibold px-2 py-1 rounded ${getBadgeClassName({ label: getRarityLabel(hoveredItem.rarity), tone: 'rarity', rarity: hoveredItem.rarity })}`}>
                                                            {getRarityLabel(hoveredItem.rarity)}
                                                          </span>
                                                          {hoveredItem?.tier && (
                                                            <span className="text-sm text-slate-300 font-medium bg-slate-700 px-2 py-1 rounded">
                                                              Tier {toRomanNumeral(hoveredItem.tier) || hoveredItem.tier}
                                                            </span>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                {/* Content Area */}
                                                <div className="p-4 bg-slate-900">
                                                  {hoverLoading ? (
                                                    <div className="space-y-3">
                                                      <div className="flex items-center gap-3">
                                                        <Skeleton className="h-12 w-12 rounded-lg bg-slate-700" />
                                                        <div className="flex-1 space-y-2">
                                                          <Skeleton className="h-4 w-32 bg-slate-700" />
                                                          <Skeleton className="h-3 w-20 bg-slate-700" />
                                                        </div>
                                                      </div>
                                                      <div className="space-y-2">
                                                        <Skeleton className="h-3 w-full bg-slate-700" />
                                                        <Skeleton className="h-3 w-4/5 bg-slate-700" />
                                                        <Skeleton className="h-3 w-3/4 bg-slate-700" />
                                                      </div>
                                                    </div>
                                                  ) : hoveredItem ? (
                                                    <div className="space-y-4">
                                                      {hoveredItem.description && (
                                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                          <p className="text-sm text-slate-200 leading-relaxed">
                                                            {hoveredItem.description}
                                                          </p>
                                                        </div>
                                                      )}
                                                      
                                                      {/* Item stats */}
                                                      {(hoveredItem.gearScore || hoveredItem.itemType) && (
                                                        <div className="space-y-2">
                                                          <h5 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Stats</h5>
                                                          <div className="flex flex-wrap gap-2">
                                                            {hoveredItem.gearScore && (
                                                              <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-900/50 border border-blue-700 text-sm font-medium text-blue-200">
                                                                GS {hoveredItem.gearScore}
                                                              </span>
                                                            )}
                                                            {hoveredItem.itemType && (
                                                              <span className="inline-flex items-center px-3 py-1 rounded-md bg-purple-900/50 border border-purple-700 text-sm font-medium text-purple-200">
                                                                {hoveredItem.itemType}
                                                              </span>
                                                            )}
                                                          </div>
                                                        </div>
                                                      )}

                                                      {/* Perks preview */}
                                                      {hoveredItem.perks && hoveredItem.perks.length > 0 && (
                                                        <div className="space-y-2">
                                                          <h5 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Perks</h5>
                                                          <div className="space-y-1">
                                                            {hoveredItem.perks.slice(0, 3).map((perk, perkIndex) => (
                                                              <div key={perkIndex} className="flex items-center gap-2 text-sm text-yellow-200">
                                                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                                <span>{perk.name || 'Random Perk'}</span>
                                                              </div>
                                                            ))}
                                                            {hoveredItem.perks.length > 3 && (
                                                              <div className="text-xs text-slate-400 ml-4">
                                                                +{hoveredItem.perks.length - 3} more perks
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <div className="flex items-center justify-center py-6">
                                                      <div className="text-center">
                                                        <div className="text-slate-400 text-sm font-medium mb-1">
                                                          Failed to load item details
                                                        </div>
                                                        <div className="text-slate-500 text-xs">
                                                          Please try again
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className="text-sm font-medium text-white cursor-pointer hover:text-yellow-100 transition-colors"
                                          onMouseEnter={() => handleEntityHover(String(entity.id ?? index), 'item')}
                                          onMouseLeave={handleMouseLeave}
                                        >
                                          {name}
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-5 relative" style={{ overflow: 'visible' }}>
                                    <div className="flex items-center gap-1">
                                      <ArrowUp className="h-3 w-3 text-slate-400" />
                                      <div className="flex gap-3">
                                        {(() => {
                                          // Get all perks including random perks
                                          const rawPerks = asArray<Record<string, unknown>>((entity as Record<string, unknown>)['perks']);
                                          const randomPerkBuckets = asArray<Record<string, unknown>>((entity as Record<string, unknown>)['perkBuckets']);
                                          
                                          // Combine regular perks and random perks
                                          const allPerks: Array<{id?: string, name?: string, icon?: string, isRandom?: boolean, chance?: number}> = [];
                                          
                                          // Add regular perks
                                          rawPerks.forEach(perk => {
                                            if (perk) {
                                              allPerks.push({
                                                id: toStringValue(perk['id']),
                                                name: toStringValue(perk['name']),
                                                icon: toStringValue(perk['icon']),
                                                isRandom: false
                                              });
                                            }
                                          });
                                          
                                          // Add random perks
                                          randomPerkBuckets.forEach((bucket, bucketIndex) => {
                                            if (bucket) {
                                              const bucketChance = asNumber(bucket['chance']);
                                              const randomChancePercent = bucketChance <= 1 ? bucketChance * 100 : bucketChance;
                                              const formattedChance = Math.round(randomChancePercent * 10) / 10;
                                              
                                              allPerks.push({
                                                id: `random-perk-${bucketIndex}`,
                                                name: `${formattedChance}% Random`,
                                                icon: null,
                                                isRandom: true,
                                                chance: bucketChance
                                              });
                                            }
                                          });
                                          
                                          // Render up to 5 perks
                                          return allPerks.slice(0, 5).map((perk, i) => {
                                            const perkIcon = perk.icon;
                                            const perkId = perk.id;
                                            const perkName = perk.name;
                                            const isRandom = perk.isRandom;
                                            const chance = perk.chance;
                                          
                                            // Create unique element ID for this specific perk instance
                                            const elementId = `${String(entity.id ?? index)}-perk-${i}`;
                                            const hoverKey = `perk:${perkId}:${elementId}`;
                                          
                                            return (
                                              <div key={`${String(entity.id ?? index)}-perk-${i}`} className="relative">
                                                <div 
                                                  className="h-9 w-9 rounded border border-slate-600 bg-slate-700 flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
                                                  onMouseEnter={() => perkId && !isRandom && handlePerkHover(perkId, elementId)}
                                                  onMouseLeave={handlePerkMouseLeave}
                                                >
                                                  {perkIcon ? (
                                                    <img
                                                      src={resolveIconUrl(perkIcon)}
                                                      alt={perkName || `Perk ${i + 1}`}
                                                      className="h-full w-full object-contain p-1"
                                                      onError={(event) => {
                                                        (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                                                      }}
                                                    />
                                                  ) : isRandom ? (
                                                    <span className="text-xs font-bold text-yellow-400">R</span>
                                                  ) : (
                                                    <span className="text-sm text-slate-400">?</span>
                                                  )}
                                                </div>
                                                
                                                {/* Premium Perk Tooltip - only show for regular perks, not random */}
                                                {perkId && !isRandom && activePerkHoverKey === hoverKey && (
                                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200" style={{ zIndex: 9999 }}>
                                                    <div className="relative">
                                                      {/* Tooltip Arrow */}
                                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-slate-900"></div>
                                                      
                                                      {/* Main Tooltip Container */}
                                                      <div className="bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl max-w-xs overflow-hidden pointer-events-auto">
                                                        {/* Header */}
                                                        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                                                          <div className="flex items-center gap-3">
                                                            {hoveredPerkDetails?.icon && (
                                                              <div className="relative">
                                                                <div className="h-10 w-10 rounded-lg bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden">
                                                                  <img
                                                                    src={resolveIconUrl(hoveredPerkDetails.icon)}
                                                                    alt={hoveredPerkDetails.name || 'Perk'}
                                                                    className="h-full w-full object-contain p-1"
                                                                    onError={(event) => {
                                                                      (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                                                                    }}
                                                                  />
                                                                </div>
                                                                {/* Rarity glow effect */}
                                                                {hoveredPerkDetails?.rarity && (
                                                                  <div className={`absolute inset-0 rounded-lg ${getRarityOutlineClasses(hoveredPerkDetails.rarity)} opacity-30`}></div>
                                                                )}
                                                              </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                              <h4 className="text-sm font-bold text-white truncate">
                                                                {hoveredPerkDetails?.name || perkName || 'Unknown Perk'}
                                                              </h4>
                                                              {hoveredPerkDetails?.rarity && (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getBadgeClassName({ label: getRarityLabel(hoveredPerkDetails.rarity), tone: 'rarity', rarity: hoveredPerkDetails.rarity })}`}>
                                                                    {getRarityLabel(hoveredPerkDetails.rarity)}
                                                                  </span>
                                                                  {hoveredPerkDetails?.tier && (
                                                                    <span className="text-xs text-slate-300 font-medium bg-slate-700 px-2 py-1 rounded">
                                                                      Tier {toRomanNumeral(hoveredPerkDetails.tier) || hoveredPerkDetails.tier}
                                                                    </span>
                                                                  )}
                                                                </div>
                                                              )}
                                                            </div>
                                                          </div>
                                                        </div>
                                                        
                                                        {/* Content Area */}
                                                        <div className="p-4 bg-slate-900">
                                                          {perkHoverLoading ? (
                                                            <div className="space-y-3">
                                                              <div className="flex items-center gap-3">
                                                                <Skeleton className="h-10 w-10 rounded-lg bg-slate-700" />
                                                                <div className="flex-1 space-y-2">
                                                                  <Skeleton className="h-4 w-24 bg-slate-700" />
                                                                  <Skeleton className="h-3 w-16 bg-slate-700" />
                                                                </div>
                                                              </div>
                                                              <div className="space-y-2">
                                                                <Skeleton className="h-3 w-full bg-slate-700" />
                                                                <Skeleton className="h-3 w-4/5 bg-slate-700" />
                                                                <Skeleton className="h-3 w-3/4 bg-slate-700" />
                                                              </div>
                                                            </div>
                                                          ) : hoveredPerkDetails ? (
                                                            <div className="space-y-3">
                                                              {hoveredPerkDetails.description && (
                                                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                                  <p className="text-sm text-slate-200 leading-relaxed">
                                                                    {hoveredPerkDetails.description}
                                                                  </p>
                                                                </div>
                                                              )}
                                                              
                                                              {/* Additional perk info if available */}
                                                              {(hoveredPerkDetails.category || hoveredPerkDetails.type) && (
                                                                <div className="space-y-2">
                                                                  <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Details</h5>
                                                                  <div className="flex flex-wrap gap-2">
                                                                    {hoveredPerkDetails.category && (
                                                                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-900/50 border border-emerald-700 text-xs font-medium text-emerald-200">
                                                                        {hoveredPerkDetails.category}
                                                                      </span>
                                                                    )}
                                                                    {hoveredPerkDetails.type && (
                                                                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-900/50 border border-orange-700 text-xs font-medium text-orange-200">
                                                                        {hoveredPerkDetails.type}
                                                                      </span>
                                                                    )}
                                                                  </div>
                                                                </div>
                                                              )}
                                                            </div>
                                                          ) : (
                                                            <div className="flex items-center justify-center py-4">
                                                              <div className="text-center">
                                                                <div className="text-slate-400 text-sm font-medium mb-1">
                                                                  Failed to load perk details
                                                                </div>
                                                                <div className="text-slate-500 text-xs">
                                                                  Please try again
                                                                </div>
                                                              </div>
                                                            </div>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-5">
                                    <span className={`text-sm font-medium ${getRarityTextClasses(asStringOrNumber(entity.rarity ?? entity.Rarity))}`}>
                                      {rarityLabel}
                                    </span>
                                  </td>
                                  <td className="px-4 py-5">
                                    <span className="text-sm text-white">{toRomanNumeral(asNumber(tier)) ?? String(tier ?? '--')}</span>
                                  </td>
                                  <td className="px-4 py-5">
                                    <span className="text-sm text-white">{gearScore ? `${gearScore}-${gearScore}` : '--'}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <Card className="border-slate-700/60 bg-slate-900/70 backdrop-blur">
                      <CardContent className="space-y-3 p-6 text-sm text-slate-300">
                        <p>No results found with the current filters.</p>
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-yellow-300">
                          Clear filters
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  {renderPagination()}
                </TooltipProvider>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

<<<<<<< HEAD
export default Database; // Fixed type errors








=======
export default Database;
>>>>>>> 037983faadfcc98299e2af7549d0913ba9fd3185
