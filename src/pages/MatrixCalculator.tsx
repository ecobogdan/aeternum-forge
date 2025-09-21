import { useState } from "react";
import Layout from "@/components/Layout";
import { siteUrl } from "@/config/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingUp } from "lucide-react";

/**
 * New World "Matrix" calculator
 * ------------------------------------------------------------
 * This replaces the previous free-form matrix table with the
 * specific calculator from the provided HTML. We keep the
 * existing page framing and shadcn card layout while wiring the
 * original inputs + calculations.
 */

type Prices = {
  prismatic_ingot: number;
  prismatic_block: number;
  prismatic_plank: number;
  prismatic_cloth: number;
  prismatic_leather: number;
  infused_alkahest: number;
  gemstone_dust: number; // Powerful Gemstone Dust
};

const defaultPrices: Prices = {
  prismatic_ingot: 0,
  prismatic_block: 0,
  prismatic_plank: 0,
  prismatic_cloth: 0,
  prismatic_leather: 0,
  infused_alkahest: 0,
  gemstone_dust: 0,
};

// Pretty print money with fixed 2 decimals
function fmt(n: number) {
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper to safely parse numeric inputs
function parseVal(v: string) {
  const n = parseFloat(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// Matrix definitions (quantities per matrix)
// Matches the mapping in the uploaded HTML document.
const MATRIXES = [
  {
    key: "weapon_ws",
    title: "Weapon Matrix (Weaponsmithing, Forge)",
    refining: "Weaponsmithing",
    station: "Forge",
    req: {
      prismatic_ingot: 4,
      prismatic_plank: 2,
      prismatic_leather: 4,
      prismatic_cloth: 2,
      // Azoth 500, Gypsum Orb 10 (price treated as 0)
    } as Partial<Record<keyof Prices, number>>,
  },
  {
    key: "weapon_eng",
    title: "Weapon Matrix (Engineering, Workshop)",
    refining: "Engineering",
    station: "Workshop",
    req: {
      prismatic_ingot: 2,
      prismatic_plank: 2,
      prismatic_leather: 4,
      prismatic_block: 2,
      infused_alkahest: 25,
    },
  },
  {
    key: "armor_armoring",
    title: "Armor Matrix (Armoring, Outfitting)",
    refining: "Armoring",
    station: "Outfitting",
    req: {
      prismatic_block: 4,
      prismatic_ingot: 2,
      gemstone_dust: 15,
      prismatic_plank: 2,
      prismatic_cloth: 2,
    },
  },
  {
    key: "armor_arcana",
    title: "Armor Matrix (Arcana, Arcane Repository)",
    refining: "Arcana",
    station: "Arcane Repository",
    req: {
      prismatic_ingot: 2,
      prismatic_cloth: 2,
      prismatic_leather: 4,
      prismatic_block: 2,
      infused_alkahest: 25,
    },
  },
  {
    key: "jewelry_jc",
    title: "Jewelry Matrix (Jewelcrafting, Outfitting)",
    refining: "Jewelcrafting",
    station: "Outfitting",
    req: {
      prismatic_block: 4,
      prismatic_ingot: 2,
      gemstone_dust: 15,
      prismatic_leather: 2,
      infused_alkahest: 25,
    },
  },
] as const;

type MatrixKey = typeof MATRIXES[number]["key"];

function calcMatrixTotal(prices: Prices, req: Partial<Record<keyof Prices, number>>) {
  let sum = 0;
  (Object.keys(req) as (keyof Prices)[]).forEach((k) => {
    const qty = req[k] ?? 0;
    const unit = prices[k] ?? 0;
    sum += qty * unit;
  });
  return sum;
}

export default function MatrixCalculator() {
  const [prices, setPrices] = useState<Prices>(defaultPrices);

  const setPrice = (field: keyof Prices) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrices((p) => ({ ...p, [field]: parseVal(e.target.value) }));
  };

  return (
        <Layout
      title="Perk Matrix Calculator - New World Builds"
      description="Filter New World items by slot, weapon, and perk combinations to pinpoint best-in-slot drops for your builds."
      canonical="/tools/new-world-matrix"
      keywords={["New World perk matrix", "Best in slot finder", "New World item filter", "Aeternum gear planner"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "New World Perk Matrix",
        description: "Searchable matrix to filter New World items by desired perks, slot, and weapon for endgame builds.",
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        url: `${siteUrl}/tools/matrix`
      }}
    >
      <div className="container px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            Matrix Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter <span className="font-semibold">unit prices</span> for the listed materials. Totals reflect crafting <b>one</b> Matrix.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Inputs & Results */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calculator className="mr-2 h-5 w-5" />
                      Material Prices
                    </CardTitle>
                    <CardDescription>Provide current market unit prices</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prismatic_ingot">Prismatic Ingots</Label>
                    <Input id="prismatic_ingot" inputMode="decimal" placeholder="0.00" onChange={setPrice("prismatic_ingot")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prismatic_block">Prismatic Blocks</Label>
                    <Input id="prismatic_block" inputMode="decimal" placeholder="0.00" onChange={setPrice("prismatic_block")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prismatic_plank">Prismatic Planks</Label>
                    <Input id="prismatic_plank" inputMode="decimal" placeholder="0.00" onChange={setPrice("prismatic_plank")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prismatic_cloth">Prismatic Cloths</Label>
                    <Input id="prismatic_cloth" inputMode="decimal" placeholder="0.00" onChange={setPrice("prismatic_cloth")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prismatic_leather">Prismatic Leathers</Label>
                    <Input id="prismatic_leather" inputMode="decimal" placeholder="0.00" onChange={setPrice("prismatic_leather")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="infused_alkahest">Infused Alkahest</Label>
                    <Input id="infused_alkahest" inputMode="decimal" placeholder="0.00" onChange={setPrice("infused_alkahest")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gemstone_dust">Powerful Gemstone Dust</Label>
                    <Input id="gemstone_dust" inputMode="decimal" placeholder="0.00" onChange={setPrice("gemstone_dust")} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Azoth and Gypsum Orb costs are treated as 0 in this calculator.
                </p>
              </CardContent>
            </Card>

            {/* Results */}
            {MATRIXES.map((m) => {
              const total = calcMatrixTotal(prices, m.req);
              return (
                <Card key={m.key} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{m.title}</CardTitle>
                    <CardDescription>
                      <span className="font-medium">Refining Trait:</span> {m.refining} • <span className="font-medium">Station:</span> {m.station}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div className="md:col-span-2 overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 pr-2">Material</th>
                              <th className="text-left py-2 pr-2">Quantity</th>
                              <th className="text-left py-2 pr-2">Unit Price</th>
                              <th className="text-left py-2">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(Object.keys(m.req) as (keyof Prices)[]).map((k) => {
                              const qty = m.req[k] ?? 0;
                              const up = prices[k] ?? 0;
                              return (
                                <tr key={String(k)} className="border-b last:border-0">
                                  <td className="py-2 pr-2 capitalize">{String(k).replace(/_/g, " ")}</td>
                                  <td className="py-2 pr-2">{qty}</td>
                                  <td className="py-2 pr-2">{fmt(up)}</td>
                                  <td className="py-2">{fmt(qty * up)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <th colSpan={3} className="text-right py-2 pr-2">Sum:</th>
                              <th className="py-2">{fmt(total)}</th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="md:col-span-1">
                        <div className="rounded-lg border p-4 bg-muted/30">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <TrendingUp className="h-4 w-4" />
                            Total Cost
                          </div>
                          <div className="text-2xl font-bold text-primary">{fmt(total)}</div>
                          <p className="text-xs text-muted-foreground mt-3">
                            Costs reflect crafting <b>one</b> Matrix.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Matrix Method Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">Matrix Method Mapping</CardTitle>
                <CardDescription>From the reference HTML tables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="px-3 py-2 text-left">Matrix</th>
                        <th className="px-3 py-2 text-left">Recipe Path</th>
                        <th className="px-3 py-2 text-left">Ingredients Needed</th>
                        <th className="px-3 py-2 text-left">Trait</th>
                        <th className="px-3 py-2 text-left">Station</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          matrix: 'Weapon Matrix (Weaponsmithing)',
                          path: 'Enchanted Handle + Tempered Cast',
                          ingredients: '4 Prismatic Ingot, 2 Prismatic Plank, 4 Prismatic Leather, 500 Azoth, 10 Gypsum Orb, 2 Prismatic Cloth',
                          trait: 'Weaponsmithing',
                          station: 'Forge',
                        },
                        {
                          matrix: 'Weapon Matrix (Engineering)',
                          path: 'Enchanted Handle + Honing Acid',
                          ingredients: '2 Prismatic Ingot, 2 Prismatic Plank, 4 Prismatic Leather, 500 Azoth, 10 Gypsum Orb, 2 Prismatic Block, 25 Infused Alkahest',
                          trait: 'Engineering',
                          station: 'Workshop',
                        },
                        {
                          matrix: 'Armor Matrix (Armoring)',
                          path: 'Blessed Rivets + Reinforced Bracing',
                          ingredients: '4 Prismatic Block, 2 Prismatic Ingot, 15 Powerful Gemstone Dust, 500 Azoth, 10 Gypsum Orb, 2 Prismatic Plank, 2 Prismatic Cloth',
                          trait: 'Armoring',
                          station: 'Outfitting',
                        },
                        {
                          matrix: 'Armor Matrix (Arcana)',
                          path: 'Tempered Cast + Honing Acid',
                          ingredients: '2 Prismatic Ingot, 2 Prismatic Cloth, 4 Prismatic Leather, 500 Azoth, 10 Gypsum Orb, 2 Prismatic Block, 25 Infused Alkahest',
                          trait: 'Arcana',
                          station: 'Arcane Repository',
                        },
                        {
                          matrix: 'Jewelry Matrix (Jewelcrafting)',
                          path: 'Blessed Rivets + Honing Acid',
                          ingredients: '4 Prismatic Block, 2 Prismatic Ingot, 15 Powerful Gemstone Dust, 500 Azoth, 10 Gypsum Orb, 2 Prismatic Leather, 25 Infused Alkahest',
                          trait: 'Jewelcrafting',
                          station: 'Outfitting',
                        },
                      ].map((row) => (
                        <tr key={row.matrix} className="border-b last:border-0">
                          <td className="px-3 py-2">{row.matrix}</td>
                          <td className="px-3 py-2">{row.path}</td>
                          <td className="px-3 py-2">{row.ingredients}</td>
                          <td className="px-3 py-2">{row.trait}</td>
                          <td className="px-3 py-2">{row.station}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Subrecipe Method Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">Subrecipe Method Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="px-3 py-2 text-left">Subrecipe</th>
                        <th className="px-3 py-2 text-left">Ingredients Needed</th>
                        <th className="px-3 py-2 text-left">Trait</th>
                        <th className="px-3 py-2 text-left">Station</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          sub: 'Enchanted Handle (Armoring)',
                          ingredients: '2 Prismatic Ingot, 2 Prismatic Plank, 2 Prismatic Leather, 250 Azoth, 5 Gypsum Orb',
                          trait: 'Armoring',
                          station: 'Outfitting',
                        },
                        {
                          sub: 'Tempered Cast (Weaponsmithing)',
                          ingredients: '2 Prismatic Ingot, 2 Prismatic Cloth, 2 Prismatic Leather, 250 Azoth, 5 Gypsum Orb',
                          trait: 'Weaponsmithing',
                          station: 'Forge',
                        },
                        {
                          sub: 'Honing Acid (Arcana)',
                          ingredients: '2 Prismatic Block, 2 Prismatic Leather, 25 Infused Alkahest, 250 Azoth, 5 Gypsum Orb',
                          trait: 'Arcana',
                          station: 'Arcane Repository',
                        },
                        {
                          sub: 'Blessed Rivets (Jewelcrafting)',
                          ingredients: '2 Prismatic Block, 2 Prismatic Ingot, 15 Powerful Gemstone Dust, 250 Azoth, 5 Gypsum Orb',
                          trait: 'Jewelcrafting',
                          station: 'Outfitting',
                        },
                        {
                          sub: 'Reinforced Bracing (Engineering)',
                          ingredients: '2 Prismatic Block, 2 Prismatic Plank, 2 Prismatic Cloth, 250 Azoth, 5 Gypsum Orb',
                          trait: 'Engineering',
                          station: 'Workshop',
                        },
                      ].map((row) => (
                        <tr key={row.sub} className="border-b last:border-0">
                          <td className="px-3 py-2">{row.sub}</td>
                          <td className="px-3 py-2">{row.ingredients}</td>
                          <td className="px-3 py-2">{row.trait}</td>
                          <td className="px-3 py-2">{row.station}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Quick summary */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Quick Summary</CardTitle>
                <CardDescription>Live totals per Matrix</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {MATRIXES.map((m) => {
                  const total = calcMatrixTotal(prices, m.req);
                  return (
                    <div key={m.key} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[66%]" title={m.title}>{m.title}</span>
                      <span className="font-semibold">{fmt(total)}</span>
                    </div>
                  );
                })}
                <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                  Tip: Paste market prices once and compare across all crafting methods.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}




