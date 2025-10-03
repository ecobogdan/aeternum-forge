import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { siteUrl } from "@/config/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, ListOrdered, RefreshCw } from "lucide-react";

// --- Domain model (ported from original HTML calculator) ---
// Glyph names and Runeglass case recipes
const GLYPHS = [
  "Above",
  "Chaos",
  "Destruction",
  "Food",
  "Gift",
  "Mountain",
  "Night",
  "River",
  "Sealed",
  "Shadow",
  "Strength",
  "Sun",
  "Water",
] as const;

const CASES: { name: string; glyph1: typeof GLYPHS[number]; glyph2: typeof GLYPHS[number] }[] = [
  { name: "Abyssal",     glyph1: "Shadow",     glyph2: "Chaos" },
  { name: "Arboreal",    glyph1: "Mountain",   glyph2: "River" },
  { name: "Electrified", glyph1: "Above",      glyph2: "Chaos" },
  { name: "Empowered",   glyph1: "Night",      glyph2: "Sealed" },
  { name: "Energizing",  glyph1: "Water",      glyph2: "Gift" },
  { name: "Frozen",      glyph1: "Water",      glyph2: "Shadow" },
  { name: "Ignited",     glyph1: "Sun",        glyph2: "Above" },
  { name: "Leeching",    glyph1: "Food",       glyph2: "Gift" },
  { name: "Punishing",   glyph1: "Strength",   glyph2: "Destruction" },
  { name: "Sighted",     glyph1: "Above",      glyph2: "Destruction" },
  { name: "Siphoning",   glyph1: "Chaos",      glyph2: "Gift" },
];

// Static recipe quantities (per craft)
const QTY = {
  sand: 10,      // Charged Sand
  sulfur: 4,     // Sulfur
  ecto: 3,       // Ancient Glob of Ectoplasm
  glyph: 5,      // each of the two glyphs
} as const;

// --- Types ---
interface PriceState {
  sand: number;   // Charged Sand price each
  sulfur: number; // Sulfur price each
  ecto: number;   // Ancient Glob of Ectoplasm price each
  glyphs: Record<(typeof GLYPHS)[number], number>;
}

interface CaseCostRow {
  name: string;
  glyph1: string;
  glyph2: string;
  cost: number;
}

const DEFAULTS: PriceState = {
  sand: 6.5,
  sulfur: 15,
  ecto: 60,
  glyphs: {
    Above: 25,
    Chaos: 35,
    Destruction: 62,
    Food: 13,
    Gift: 8,
    Mountain: 21,
    Night: 26,
    River: 39,
    Sealed: 24,
    Shadow: 44,
    Strength: 20,
    Sun: 37,
    Water: 29,
  },
};

const STORAGE_KEY = "runeglass:case-cost:v1";

export default function RuneglassCaseCalculator() {
  const [prices, setPrices] = useState<PriceState>(DEFAULTS);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load/save state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPrices((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {}
  }, []);

  useEffect(() => {
    if (hasInteracted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
    }
  }, [prices, hasInteracted]);

  // Calculation
  const rows = useMemo<CaseCostRow[]>(() => {
    const matCost = (prices.sand * QTY.sand) + (prices.sulfur * QTY.sulfur) + (prices.ecto * QTY.ecto);
    return CASES.map((rg) => {
      const g1 = prices.glyphs[rg.glyph1] ?? 0;
      const g2 = prices.glyphs[rg.glyph2] ?? 0;
      const glyphCost = (g1 + g2) * QTY.glyph;
      return {
        name: rg.name,
        glyph1: `${rg.glyph1} (x${QTY.glyph})`,
        glyph2: `${rg.glyph2} (x${QTY.glyph})`,
        cost: Number((glyphCost + matCost).toFixed(2)),
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [prices]);

  // No special cheapest styling; all rows look the same

  // Handlers
  const onNumber = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const setMat = (key: "sand" | "sulfur" | "ecto") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setPrices((p) => ({ ...p, [key]: onNumber(e.target.value) }));
  };

  const setGlyph = (name: (typeof GLYPHS)[number]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    const value = onNumber(e.target.value);
    setPrices((p) => ({ ...p, glyphs: { ...p.glyphs, [name]: value } }));
  };

  const reset = () => {
    setHasInteracted(true);
    setPrices(DEFAULTS);
  };

  return (
    <Layout
      title="Runeglass Profit Calculator & Crafting Costs - NW-Builds"
      description="Input market prices to calculate Runeglass case costs, crafting profit, and glyph requirements for New World Aeternum."
      canonical="/tools/runeglass"
      keywords={["Runeglass profit calculator", "Runeglass case cost", "New World glyph prices", "Aeternum profit tool"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Runeglass Profit Calculator",
        description: "Interactive tool to model Runeglass case costs, glyph inputs, and profit margins for New World Aeternum.",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: `${siteUrl}/tools/runeglass`
      }}
    >
      <div className="container px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            Runeglass Case Cost Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uses your market prices for glyphs and materials to compute one-craft costs for each case.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Calculator className="mr-2 h-5 w-5" /> Enter Market Prices</CardTitle>
                <CardDescription>All fields accept numbers &gt; 0. Defaults are prefilled; adjust for your server.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Materials */}
                <div>
                  <h4 className="font-semibold mb-3">Materials (per craft)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sand">Charged Sand (x{QTY.sand})</Label>
                      <Input id="sand" type="number" step="0.01" min={0} value={prices.sand} onChange={setMat("sand")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sulfur">Sulfur (x{QTY.sulfur})</Label>
                      <Input id="sulfur" type="number" step="0.01" min={0} value={prices.sulfur} onChange={setMat("sulfur")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ecto">Ancient Glob of Ectoplasm (x{QTY.ecto})</Label>
                      <Input id="ecto" type="number" step="0.01" min={0} value={prices.ecto} onChange={setMat("ecto")} />
                    </div>
                  </div>
                </div>

                {/* Glyphs */}
                <div>
                  <h4 className="font-semibold mb-3">Glyph Prices</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {GLYPHS.map((g) => (
                      <div key={g} className="space-y-2">
                        <Label htmlFor={`glyph-${g}`}>{g}</Label>
                        <Input
                          id={`glyph-${g}`}
                          type="number"
                          step="0.01"
                          min={0}
                          value={prices.glyphs[g]}
                          onChange={setGlyph(g)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={reset} variant="outline" className="flex items-center"><RefreshCw className="mr-2 h-4 w-4"/>Reset Defaults</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><ListOrdered className="mr-2 h-5 w-5"/> Results (A&gt;Z)</CardTitle>
                <CardDescription>Alphabetical by case name.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-2/5" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                    </colgroup>
                    <thead className="bg-muted/60 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left">Runeglass Case</th>
                        <th className="px-3 py-2 text-left">Glyph 1</th>
                        <th className="px-3 py-2 text-left">Glyph 2</th>
                        <th className="px-3 py-2 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.name}>
                          <td className="px-3 py-2 font-medium flex items-center gap-2">{r.name}</td>
                          <td className="px-3 py-2">{r.glyph1}</td>
                          <td className="px-3 py-2">{r.glyph2}</td>
                          <td className="px-3 py-2 text-right">
                            <span className="inline-flex items-center justify-end gap-2 px-2 py-1 rounded-full bg-primary/10 text-primary">
                              <span className="tabular-nums font-semibold">{r.cost.toFixed(2)}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}








