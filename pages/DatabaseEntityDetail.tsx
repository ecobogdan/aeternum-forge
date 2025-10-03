import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Sparkles,
  PawPrint,
  FlaskConical,
  Sword,
  BookOpen,
  Activity,
  ScrollText,
  Compass,
  Pickaxe,
  Store,
  Users,
  MapPin,
  Bot,
  Star,
  Trophy,
  Coins,
  FlaskRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { simpleNwdbService } from '@/services/simpleNwdbService';
import { siteUrl } from '@/config/seo';

interface CategoryDetailConfig {
  entityType: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  buildMeta?: (entity: any) => Array<{ label: string; value: string | null | undefined }>;
  buildSections?: (entity: any) => Array<{ title: string; icon: LucideIcon; items: Array<{ label: string; value: string }> }>;
}

const rarityLabels: Record<string | number, string> = {
  0: 'Common',
  1: 'Uncommon',
  2: 'Rare',
  3: 'Epic',
  4: 'Legendary',
  5: 'Mythic',
  100: 'Artifact',
  se: 'Status Effect',
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  artifact: 'Artifact',
};

const formatLabel = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  return value
    .replace(/[_.-]+/g, ' ')
    .replace(/[A-Z]/g, (match) => ` ${match}`)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (match) => match.toUpperCase());
};

const formatNumber = (value?: number | string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toLocaleString();
};

const formatRarity = (raw: unknown): string | undefined => {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'number' || typeof raw === 'string') {
    const key = typeof raw === 'number' ? raw : raw.toString().toLowerCase();
    return rarityLabels[key] ?? formatLabel(String(raw));
  }
  return undefined;
};

const formatChance = (value?: number | null): string | undefined => {
  if (value === undefined || value === null || Number.isNaN(value)) return undefined;
  const normalized = value <= 1 ? value * 100 : value;
  const clamped = Math.min(100, Math.max(0, normalized));
  const rounded = Math.round(clamped * 10) / 10;
  return `${rounded}%`;
};

const resolveIconUrl = (icon?: string | null): string => {
  if (!icon) return '/placeholder.svg';
  if (icon.startsWith('http')) return icon;
  const trimmed = icon.replace(/^\/+/, '');
  const lower = trimmed.toLowerCase();
  if (/(\.png|\.jpg|\.jpeg|\.webp|\.svg)$/.test(lower)) {
    return `https://cdn.nwdb.info/${trimmed}`;
  }
  if (lower.startsWith('lyshineui/') || lower.startsWith('db/')) {
    return `https://cdn.nwdb.info/${trimmed}`;
  }
  return `https://cdn.nwdb.info/db/images/live/v56/${trimmed}.png`;
};

const CATEGORY_DETAILS: Record<string, CategoryDetailConfig> = {
  mounts: {
    entityType: 'mount',
    title: 'Mount',
    description: 'Detailed stats for rideable companions and mounts.',
    icon: PawPrint,
    accent: 'text-amber-300',
    buildMeta: (entity) => [
      { label: 'Mount Type', value: entity.mountType },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
  },
  recipes: {
    entityType: 'recipe',
    title: 'Recipe',
    description: 'Crafting schematic details, experience values and outputs.',
    icon: FlaskConical,
    accent: 'text-emerald-300',
    buildMeta: (entity) => [
      { label: 'Tradeskill', value: entity.tradeskill ?? entity.Tradeskill },
      { label: 'Tier', value: entity.tier ? `Tier ${entity.tier}` : undefined },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
      { label: 'Recipe Level', value: formatNumber(entity.recipeLevel) },
      { label: 'Category', value: formatLabel(entity.category) },
    ],
    buildSections: (entity) => {
      const sections: Array<{ title: string; icon: LucideIcon; items: Array<{ label: string; value: string }> }> = [];
      if (entity.output) {
        const outputs = Array.isArray(entity.output) ? entity.output : [entity.output];
        const items = outputs
          .filter((entry: any) => entry)
          .map((output: any, index: number) => ({
            label: output.name ?? `Output ${index + 1}`,
            value: `${formatNumber(output.quantity ?? 1)} � ${formatLabel(output.itemType) ?? ''}`.trim(),
          }));
        if (items.length) {
          sections.push({ title: 'Outputs', icon: Sparkles, items });
        }
      }
      if (Array.isArray(entity.ingredients) && entity.ingredients.length) {
        const items = entity.ingredients.map((ingredient: any, index: number) => ({
          label: ingredient.name ?? `Ingredient ${index + 1}`,
          value: `${formatNumber(ingredient.quantity ?? 1)} � ${formatLabel(ingredient.itemType) ?? ''}`.trim(),
        }));
        sections.push({ title: 'Ingredients', icon: FlaskRound, items });
      }
      return sections;
    },
  },
  abilities: {
    entityType: 'ability',
    title: 'Ability',
    description: 'Weapon skill node data including cooldowns and tags.',
    icon: Sword,
    accent: 'text-sky-300',
    buildMeta: (entity) => [
      { label: 'Weapon', value: entity.WeaponTag || entity.weaponTag },
      { label: 'Skill Tree', value: entity.skillTree },
      { label: 'Category', value: formatLabel(entity.UICategory ?? entity.uiCategory) },
      { label: 'Cooldown', value: formatNumber(entity.cooldown) ? `${formatNumber(entity.cooldown)}s` : undefined },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
  },
  'lore-books': {
    entityType: 'lore',
    title: 'Lore Entry',
    description: 'Lore topics and narratives collected across Aeternum.',
    icon: BookOpen,
    accent: 'text-rose-300',
    buildMeta: (entity) => [
      { label: 'Type', value: formatLabel(entity.itemType) },
      { label: 'Order', value: formatNumber(entity.order) },
    ],
  },
  'status-effects': {
    entityType: 'status-effect',
    title: 'Status Effect',
    description: 'Combat statuses, boons and debuffs with effect classes.',
    icon: Activity,
    accent: 'text-teal-300',
    buildMeta: (entity) => [
      { label: 'Categories', value: Array.isArray(entity.effectCategories) ? entity.effectCategories.join(', ') : undefined },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
  },
  quests: {
    entityType: 'quest',
    title: 'Quest',
    description: 'Quest objectives with rewards and level requirements.',
    icon: ScrollText,
    accent: 'text-purple-300',
    buildMeta: (entity) => [
      { label: 'Quest Type', value: formatLabel(entity.itemType) },
      { label: 'Difficulty', value: formatNumber(entity.DifficultyLevel ?? entity.difficultyLevel) },
      {
        label: 'Level Range',
        value:
          entity.MinLevel || entity.MaxLevel
            ? `${entity.MinLevel ?? '--'} � ${entity.MaxLevel ?? '--'}`
            : undefined,
      },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
    buildSections: (entity) => {
      const sections: Array<{ title: string; icon: LucideIcon; items: Array<{ label: string; value: string }> }> = [];
      if (entity.rewards) {
        const rewards = entity.rewards;
        const items: Array<{ label: string; value: string }> = [];
        if (rewards.xp) items.push({ label: 'Experience', value: formatNumber(rewards.xp) ?? String(rewards.xp) });
        if (rewards.coins) items.push({ label: 'Coins', value: `${formatNumber(rewards.coins)} gold` });
        if (rewards.azoth) items.push({ label: 'Azoth', value: formatNumber(rewards.azoth) ?? String(rewards.azoth) });
        if (rewards.standing) items.push({ label: 'Standing', value: formatNumber(rewards.standing) ?? String(rewards.standing) });
        if (items.length) {
          sections.push({ title: 'Rewards', icon: Trophy, items });
        }
      }
      return sections;
    },
  },
  creatures: {
    entityType: 'creature',
    title: 'Creature',
    description: 'Enemy family data with level and encounter metadata.',
    icon: Bot,
    accent: 'text-lime-300',
    buildMeta: (entity) => [
      { label: 'Family', value: formatLabel(entity.Family ?? entity.family) },
      { label: 'Level', value: formatNumber(entity.Level ?? entity.level) },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
  },
  gatherables: {
    entityType: 'gatherable',
    title: 'Gatherable',
    description: 'Resource nodes, veins and harvestable collectibles.',
    icon: Pickaxe,
    accent: 'text-emerald-300',
    buildMeta: (entity) => [
      { label: 'Trade Skill', value: formatLabel(entity.Tradeskill ?? entity.tradeskill) },
      { label: 'Required Level', value: formatNumber(entity.RequiredTradeskillLevel) },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
  },
  shops: {
    entityType: 'item',
    title: 'Shop Item',
    description: 'Store items with faction token and currency costs.',
    icon: Store,
    accent: 'text-yellow-300',
    buildMeta: (entity) => [
      { label: 'Shop', value: entity.shopName },
      { label: 'Token Cost', value: formatNumber(entity.price?.BuyCategoricalProgressionCost) },
      { label: 'Coin Cost', value: formatNumber(entity.price?.BuyCurrencyCost) },
      {
        label: 'Cooldown',
        value: entity.price?.BuyCooldownSeconds ? `${formatNumber(entity.price.BuyCooldownSeconds)}s` : undefined,
      },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
  },
  npcs: {
    entityType: 'npc',
    title: 'NPC',
    description: 'Named vendors and characters across settlements.',
    icon: Users,
    accent: 'text-cyan-300',
    buildMeta: (entity) => [
      { label: 'Title', value: entity.title },
      { label: 'Has Map Pin', value: entity.has_map_link ? 'Yes' : 'No' },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
  },
  zones: {
    entityType: 'zone',
    title: 'Zone',
    description: 'Regions, points of interest and instanced area metadata.',
    icon: MapPin,
    accent: 'text-indigo-300',
    buildMeta: (entity) => [
      { label: 'Zone Id', value: formatNumber(entity.id) },
      { label: 'Rarity', value: formatRarity(entity.rarity) },
    ],
  },
};

const fallbackConfig: CategoryDetailConfig = {
  entityType: 'item',
  title: 'Entry',
  description: 'Database entry details.',
  icon: Sparkles,
  accent: 'text-amber-200',
};

const DatabaseEntityDetail = () => {
  const { categoryId, entityId } = useParams<{ categoryId: string; entityId: string }>();
  const [entity, setEntity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = useMemo(() => CATEGORY_DETAILS[categoryId ?? ''] ?? fallbackConfig, [categoryId]);

  useEffect(() => {
    if (!entityId) return;
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await simpleNwdbService.getEntityDetails(config.entityType, entityId);
        if (cancelled) return;
        if (response?.error) {
          setError(response.error);
          setEntity(null);
          return;
        }
        const data = response?.data ?? response;
        if (!data) {
          setError('Unable to load entity data.');
          setEntity(null);
          return;
        }
        setEntity(data);
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
          setEntity(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [config.entityType, entityId]);

  const meta = useMemo(() => (config.buildMeta && entity ? config.buildMeta(entity) : []), [config, entity]);
  const sections = useMemo(
    () => (config.buildSections && entity ? config.buildSections(entity) : []),
    [config, entity],
  );

  const name = entity?.name ?? entity?.Name ?? entityId ?? 'Unknown Entry';
  const description = entity?.description ?? config.description;
  const iconUrl = resolveIconUrl(entity?.icon);

  const pageTitle = `${name} � ${config.title}`;
  const canonical = `${siteUrl}/new-world-database/${categoryId ?? 'entry'}/${entityId ?? ''}`;

  return (
    <Layout title={pageTitle} description={description} canonical={canonical}>
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[22rem] w-[22rem] translate-x-1/3 rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.06),transparent_65%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/new-world-database">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to database
              </Button>
            </Link>
          </div>

          <Card className="border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm shadow-2xl">
            <CardContent className="flex flex-col gap-8 p-8 md:flex-row md:items-start">
              <div className="flex-shrink-0">
                {isLoading ? (
                  <Skeleton className="h-24 w-24 rounded-xl" />
                ) : (
                  <img
                    src={iconUrl}
                    alt={name}
                    className="h-24 w-24 rounded-xl border border-slate-700/70 bg-slate-900/80 object-contain"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <config.icon className={`h-6 w-6 ${config.accent}`} />
                  <span className="text-sm uppercase tracking-[0.35em] text-slate-400">{config.title}</span>
                </div>
                <h1 className="text-3xl font-semibold text-white md:text-4xl">{isLoading ? 'Loading�' : name}</h1>
                {description && <p className="max-w-3xl text-slate-300">{description}</p>}

                {meta.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {meta
                      .filter((entry) => entry.value !== undefined && entry.value !== null && entry.value !== '')
                      .map((entry) => (
                        <div
                          key={entry.label}
                          className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
                        >
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{entry.label}</p>
                          <p className="mt-1 font-medium text-slate-100">{entry.value}</p>
                        </div>
                      ))}
                  </div>
                )}

                {entity?.rarity !== undefined && (
                  <Badge variant="outline" className="border-slate-600/60 bg-slate-900/60 text-slate-200">
                    {formatRarity(entity.rarity)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="mt-8 space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : error ? (
            <Card className="mt-8 border-rose-500/40 bg-rose-500/10">
              <CardContent className="p-6 text-rose-200">
                <p className="font-semibold">Unable to load entry.</p>
                <p className="text-sm opacity-80">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-8 space-y-6">
              {sections.map((section) => (
                <Card key={section.title} className="border-slate-700/60 bg-slate-900/70 backdrop-blur">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <section.icon className="h-4 w-4 text-slate-300" />
                    <CardTitle className="text-base text-slate-100">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-200">
                    {section.items.map((item) => (
                      <div key={`${section.title}-${item.label}`} className="flex items-center justify-between gap-4">
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</span>
                        <span className="font-medium text-slate-100">{item.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              <Card className="border-slate-700/60 bg-slate-900/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base text-slate-100">Raw data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950/70 p-4 text-xs text-slate-300">
                    {JSON.stringify(entity, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DatabaseEntityDetail;
