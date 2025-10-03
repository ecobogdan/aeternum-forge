import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { siteUrl } from '@/config/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RotateCcw } from 'lucide-react';

// --- Ported data & logic from the HTML calculator ---
// Groups and the minor-tier mote each trophy uses
const GROUPS = {
  combat: [
    { name: 'Ancient Combat Trophy', mote: 'Soul Mote' },
    { name: 'Angry Earth Combat Trophy', mote: 'Earth Mote' },
    { name: 'Corrupted Combat Trophy', mote: 'Life Mote' },
    { name: 'Lost Combat Trophy', mote: 'Death Mote' },
    { name: 'Wildlife Combat Trophy', mote: 'Fire Mote' },
    { name: 'Human Combat Trophy', mote: 'Death Mote' },
  ],
  crafting: [
    { name: 'Weaponsmithing Trophy', mote: 'Fire Mote' },
    { name: 'Armoring Trophy', mote: 'Fire Mote' },
    { name: 'Engineering Trophy', mote: 'Air Mote' },
    { name: 'Arcana Trophy', mote: 'Earth Mote' },
    { name: 'Cooking Trophy', mote: 'Water Mote' },
  ],
  gathering: [
    { name: 'Mining Trophy', mote: 'Earth Mote' },
    { name: 'Fishing Trophy', mote: 'Water Mote' },
    { name: 'Logging Trophy', mote: 'Air Mote' },
    { name: 'Harvesting Trophy', mote: 'Water Mote' },
    { name: 'Skinning Trophy', mote: 'Air Mote' },
    { name: 'Luck Trophy', mote: 'Rabbit Foot' },
  ],
} as const;

type GroupKey = keyof typeof GROUPS;

// Mapping of Basic/Major special mats per trophy (ported)
const BASIC_MAT: Record<string, string> = {
  'Ancient Combat Trophy': 'Ancient Femur',
  'Angry Earth Combat Trophy': 'Barkflesh',
  'Corrupted Combat Trophy': 'Corrupted Crest',
  'Lost Combat Trophy': 'Ectoplasmic Essence',
  'Wildlife Combat Trophy': 'Pristine Wolf Claw',
  'Human Combat Trophy': 'Human Digit',
  'Weaponsmithing Trophy': "Quartermaster's Notes",
  'Armoring Trophy': "Armorer's Journal",
  'Engineering Trophy': "Engineer's Technique",
  'Arcana Trophy': 'Ancient Texts',
  'Cooking Trophy': "Chef's Secret Techniques", // per original
  'Mining Trophy': "Surveyor's Tools",
  'Logging Trophy': "Lumberjack's Token",
  'Harvesting Trophy': 'Journal of Aeternum Flora',
  'Skinning Trophy': 'Notes on Aeternum Fauna',
  'Fishing Trophy': 'Taxidermied Blue',
  'Luck Trophy': 'Stacked Deck',
};

const BASIC_EXTRAS: Record<string, { mat: string; qty: number }[]> = {
  'Human Combat Trophy': [{ mat: 'Flame Core', qty: 5 }], // exception from original
};

const MAJOR_MAT: Record<string, string> = {
  'Ancient Combat Trophy': 'Ancient Mandible',
  'Angry Earth Combat Trophy': 'Glowing Sap',
  'Corrupted Combat Trophy': 'Corrupted Totem',
  'Lost Combat Trophy': 'Ephemeral Seal',
  'Wildlife Combat Trophy': 'Pristine Bear Claw',
  'Human Combat Trophy': 'Human Idol',
  'Weaponsmithing Trophy': "Forgemaster's Notes",
  'Armoring Trophy': 'Precision Armoring',
  'Engineering Trophy': 'Precision Engineering',
  'Arcana Trophy': "Philosopher's Stone",
  'Cooking Trophy': "Chef's Secret Cookbook",
  'Mining Trophy': 'Adamantine Dust',
  'Logging Trophy': 'Pure Resin',
  'Harvesting Trophy': 'Mercurial Token',
  'Skinning Trophy': "Tracker's Seal",
  'Fishing Trophy': 'Taxidermied Daemonaja',
  'Luck Trophy': 'Loaded Dice',
};

const MAJOR_EXTRAS: Record<string, { mat: string; qty: number }[]> = {
  'Human Combat Trophy': [{ mat: 'Flame Core', qty: 50 }],
};

// Templated universal mats by tier (exactly as in original logic)
const TIER_MATS: Record<'minor' | 'basic' | 'major', { mat: string; qty: number }[]> = {
  minor: [
    { mat: 'Mote', qty: 25 },
    { mat: 'Maple Stain', qty: 1 },
    { mat: 'Lumber', qty: 25 },
    { mat: 'Steel Ingot', qty: 20 },
  ],
  basic: [
    { mat: 'Minor Trophy', qty: 1 },
    { mat: 'Wyrdwood Plank', qty: 25 },
    { mat: 'Starmetal Ingot', qty: 20 },
    { mat: 'Oak Stain', qty: 1 },
    { mat: 'Basic Trophy Mat', qty: 1 },
  ],
  major: [
    { mat: 'Basic Trophy', qty: 1 },
    { mat: 'Ironwood Plank', qty: 25 },
    { mat: 'Orichalcum Ingot', qty: 20 },
    { mat: 'Mahogany Stain', qty: 1 },
    { mat: 'Major Trophy Mat', qty: 1 },
  ],
};

// The HTML tool let users input a single price per unique material
const ALL_MATS = Array.from(
  new Set([
    'Death Mote', 'Life Mote', 'Fire Mote', 'Soul Mote', 'Air Mote', 'Earth Mote', 'Water Mote',
    'Maple Stain', 'Wyrdwood Plank', 'Starmetal Ingot', 'Oak Stain', 'Lumber', 'Steel Ingot',
    'Minor Trophy', 'Ironwood Plank', 'Orichalcum Ingot', 'Mahogany Stain', 'Basic Trophy',
    'Ancient Femur', 'Barkflesh', 'Corrupted Crest', 'Ectoplasmic Essence', 'Pristine Wolf Claw', 'Human Digit',
    "Quartermaster's Notes", "Armorer's Journal", "Engineer's Technique", 'Ancient Texts', 'Journal of Aeternum Flora',
    'Notes on Aeternum Fauna', 'Surveyor\'s Tools', "Lumberjack's Token", 'Taxidermied Blue',
    'Glowing Sap', 'Pristine Bear Claw', 'Corrupted Totem', 'Ephemeral Seal', 'Human Idol', 'Ancient Mandible',
    "Forgemaster's Notes", 'Precision Armoring', 'Precision Engineering', "Philosopher's Stone",
    'Mercurial Token', "Tracker's Seal", 'Adamantine Dust', 'Pure Resin', 'Taxidermied Daemonaja',
    'Flame Core', 'Rabbit Foot', 'Stacked Deck', 'Loaded Dice',
  ])
).sort();

// --- TSX state & helpers ---
function buildMats(group: GroupKey, trophyName: string, tier: 'minor' | 'basic' | 'major') {
  const mats: { mat: string; qty: number }[] = [];
  // Ensure we have a valid trophy for the selected group
  const groupList = GROUPS[group];
  const trophy = groupList.find((t) => t.name === trophyName) ?? groupList[0];
  if (!trophy) return mats; // safety for unexpected empty group

  if (tier === 'minor') {
    // Special case for Luck Trophy - uses Rabbit Foot instead of Mote
    if (trophy.name === 'Luck Trophy') {
      mats.push({ mat: 'Rabbit Foot', qty: 1 });
    } else {
      mats.push({ mat: trophy.mote, qty: 25 });
    }
    mats.push({ mat: 'Maple Stain', qty: 1 });
    mats.push({ mat: 'Lumber', qty: 25 });
    mats.push({ mat: 'Steel Ingot', qty: 20 });
  } else if (tier === 'basic') {
    mats.push({ mat: 'Minor Trophy', qty: 1 });
    mats.push({ mat: 'Wyrdwood Plank', qty: 25 });
    mats.push({ mat: 'Starmetal Ingot', qty: 20 });
    mats.push({ mat: 'Oak Stain', qty: 1 });
    const basicMat = BASIC_MAT[trophy.name];
    if (basicMat) mats.push({ mat: basicMat, qty: 1 });
    if (BASIC_EXTRAS[trophy.name]) BASIC_EXTRAS[trophy.name].forEach((x) => mats.push(x));
  } else if (tier === 'major') {
    mats.push({ mat: 'Basic Trophy', qty: 1 });
    mats.push({ mat: 'Ironwood Plank', qty: 25 });
    mats.push({ mat: 'Orichalcum Ingot', qty: 20 });
    mats.push({ mat: 'Mahogany Stain', qty: 1 });
    const majorMat = MAJOR_MAT[trophy.name];
    if (majorMat) mats.push({ mat: majorMat, qty: 1 });
    if (MAJOR_EXTRAS[trophy.name]) MAJOR_EXTRAS[trophy.name].forEach((x) => mats.push(x));
  }
  return mats;
}

const niceNum = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '???');

// Allow decimal-friendly input like 0.01 while keeping missing detection
function parsePriceInput(v: string) {
  const raw = v.trim();
  if (!raw) return NaN;
  const n = parseFloat(raw.replace(/,/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

export default function TrophyCalculator() {
  // UI selection state
  const [group, setGroup] = useState<GroupKey>('combat');
  const [trophy, setTrophy] = useState<string>(GROUPS.combat[0].name);
  const [tier, setTier] = useState<'minor' | 'basic' | 'major'>('minor');

  // Prices keyed by material name
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [inputsVersion, setInputsVersion] = useState(0);

  // recompute materials list based on selection
  const mats = useMemo(() => buildMats(group, trophy, tier), [group, trophy, tier]);

  // compute total cost
  const { total, hasMissing } = useMemo(() => {
    let sum = 0;
    let missing = false;
    for (const { mat, qty } of mats) {
      const p = prices[mat];
      if (p == null || Number.isNaN(p)) {
        missing = true;
      } else {
        sum += p * qty;
      }
    }
    return { total: sum, hasMissing: missing };
  }, [mats, prices]);

  // ensure trophy stays valid when group changes
  useEffect(() => {
    const list = GROUPS[group].map((t) => t.name);
    if (!list.includes(trophy)) setTrophy(list[0]);
  }, [group]);

  const reset = () => {
    setPrices({});
    setInputsVersion((v) => v + 1);
  };

  return (
    <Layout
      title="Trophy Calculator & Trophy Advisor - NW-Builds"
      description="Plan your New World trophies, calculate housing bonuses, and track crafting trophies for maximum buffs."
      canonical="/tools/new-world-trophies"
      keywords={["New World trophies", "Trophy calculator", "Housing trophy bonuses", "Aeternum crafting trophies"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "New World Trophy Calculator",
        description: "Tool to compare trophy bonuses, track materials, and plan housing trophies for New World Aeternum.",
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        url: `${siteUrl}/tools/trophies`
      }}
    >
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            Trophy Cost Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uses your market prices for materials to compute one-craft costs for each case.
          </p>
          <div className="grid grid-cols-1 gap-8"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Controls */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group">Group</Label>
                <select
                  id="group"
                  value={group}
                  onChange={(e) => setGroup(e.target.value as GroupKey)}
                  className="w-full rounded-md border bg-background p-2 text-sm shadow-sm"
                >
                  <option value="combat">Combat</option>
                  <option value="crafting">Crafting</option>
                  <option value="gathering">Gathering</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trophy">Trophy</Label>
                <select
                  id="trophy"
                  value={trophy}
                  onChange={(e) => setTrophy(e.target.value)}
                  className="w-full rounded-md border bg-background p-2 text-sm shadow-sm"
                >
                  {GROUPS[group].map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">Tier</Label>
                <select
                  id="tier"
                  value={tier}
                  onChange={(e) => setTier(e.target.value as 'minor' | 'basic' | 'major')}
                  className="w-full rounded-md border bg-background p-2 text-sm shadow-sm"
                >
                  <option value="minor">Minor</option>
                  <option value="basic">Basic</option>
                  <option value="major">Major</option>
                </select>
              </div>

              <Separator />
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset Prices
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price inputs + result */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Materials & Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ALL_MATS.map((mat) => {
                  // Show only mats relevant to current selection (plus handy shared mats)
                  const neededNow = mats.some((m) => m.mat === mat);
                  if (!neededNow) return null;
                  return (
                    <div key={`${mat}-${inputsVersion}`} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{mat}</div>
                        <div className="text-xs text-muted-foreground">Price per unit</div>
                      </div>
                      <Input
                        inputMode="decimal"
                        placeholder="0.00"
                        onChange={(e) =>
                          setPrices((p) => ({ ...p, [mat]: parsePriceInput(e.target.value) }))
                        }
                        className="w-28"
                      />
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="text-sm font-medium">Summary</div>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-3 gap-2 p-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Trophy</div>
                      <div className="font-medium">{trophy}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Tier</div>
                      <div className="font-medium capitalize">{tier}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Cost</div>
                      <div className="font-semibold">{hasMissing ? 'Please enter all prices' : `${niceNum(total)}`}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-3">
                    <div className="mb-2 text-sm font-medium">Required Materials</div>
                    <div className="space-y-2">
                      {mats.map(({ mat, qty }) => (
                        <div key={mat} className="flex items-center justify-between text-sm">
                          <span className="truncate">{mat}</span>
                          <span className="tabular-nums"> {qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}



