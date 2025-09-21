// ArmorWeightCalculator ??? UPDATED 2025-09-19 12:57:15
// Implements: static Results card, dropdowns per slot mapping, removed Jewelry, colored category button, vertical layout

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { siteUrl } from '@/config/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, RotateCcw, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LIGHT_MAX = 12.9;
const MEDIUM_MAX = 22.9;

type Slot = 'head' | 'chest' | 'gloves' | 'legs' | 'boots' | 'shield';

type ArmorWeights = Record<Slot, number | null>;

const OPTIONS: Record<Slot, { label: string; value: number }[]> = {
  head: [
    { label: 'Light (1.5)', value: 1.5 },
    { label: 'Medium (2.6)', value: 2.6 },
    { label: 'Heavy (4.7)', value: 4.7 },
  ],
  chest: [
    { label: 'Featherweight (0.0)', value: 0.0 },
    { label: 'Light (3.5)', value: 3.5 },
    { label: 'Medium (6.2)', value: 6.2 },
    { label: 'Heavy (11.0)', value: 11.0 },
  ],
  gloves: [
    { label: 'Light (1.5)', value: 1.5 },
    { label: 'Medium (2.6)', value: 2.6 },
    { label: 'Heavy (4.7)', value: 4.7 },
  ],
  legs: [
    { label: 'Light (2.0)', value: 2.0 },
    { label: 'Medium (3.5)', value: 3.5 },
    { label: 'Heavy (6.3)', value: 6.3 },
  ],
  boots: [
    { label: 'Light (1.5)', value: 1.5 },
    { label: 'Medium (2.6)', value: 2.6 },
    { label: 'Heavy (4.7)', value: 4.7 },
  ],
  shield: [
    { label: 'None (0.0)', value: 0.0 },
    { label: 'Round (2.7)', value: 2.7 },
    { label: 'Kite (5.4)', value: 5.4 },
    { label: 'Tower (11.0)', value: 11.0 },
  ],
};



const allowedValues: Record<Slot, number[]> = Object.fromEntries(
  (Object.keys(OPTIONS) as Slot[]).map((k) => [k, OPTIONS[k].map((o) => o.value)])
) as Record<Slot, number[]>;

const sanitizeValue = (slot: Slot, raw: unknown): number | null => {
  if (raw === null || raw === undefined || raw === '') return null;
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;
  return allowedValues[slot].includes(num) ? num : null;
};

const numericWeight = (value: number | null) => (typeof value === 'number' ? value : 0);

const ArmorWeightCalculator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [weights, setWeights] = useState<ArmorWeights>({
    head: null, chest: null, gloves: null, legs: null, boots: null, shield: null,
  });

  useEffect(() => {
    const savedState = localStorage.getItem('awcalc:v2');
    if (savedState) {
      try {
        const p = JSON.parse(savedState);
        setWeights({
          head: sanitizeValue('head', p.head),
          chest: sanitizeValue('chest', p.chest),
          gloves: sanitizeValue('gloves', p.gloves),
          legs: sanitizeValue('legs', p.legs),
          boots: sanitizeValue('boots', p.boots),
          shield: sanitizeValue('shield', p.shield),
        });
      } catch (e) { console.error(e); }
    } else {
      const legacy = localStorage.getItem('awcalc:v1');
      if (legacy) {
        try {
          const p = JSON.parse(legacy);
          setWeights({
            head: sanitizeValue('head', p.head),
            chest: sanitizeValue('chest', p.chest),
            gloves: sanitizeValue('gloves', p.gloves),
            legs: sanitizeValue('legs', p.legs),
            boots: sanitizeValue('boots', p.boots),
            shield: sanitizeValue('shield', p.shield),
          });
        } catch (e) { console.error(e); }
      }
    }
    const stateParam = searchParams.get('state');
    if (stateParam) {
      try {
        const decoded = atob(stateParam);
        const p = JSON.parse(decoded);
        setWeights({
          head: sanitizeValue('head', p.head),
          chest: sanitizeValue('chest', p.chest),
          gloves: sanitizeValue('gloves', p.gloves),
          legs: sanitizeValue('legs', p.legs),
          boots: sanitizeValue('boots', p.boots),
          shield: sanitizeValue('shield', p.shield),
        });
      } catch (e) { console.error(e); }
    } else {
      // No state in the URL; ensure any previous state parameter is cleared out
      setSearchParams((params) => {
        if (!params.has('state')) return params;
        const next = new URLSearchParams(params);
        next.delete('state');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => { localStorage.setItem('awcalc:v2', JSON.stringify(weights)); }, [weights]);

  const hasSelections = (Object.values(weights) as (number | null)[]).some((value) => value !== null);

  const totalWeight =
    numericWeight(weights.head) +
    numericWeight(weights.chest) +
    numericWeight(weights.gloves) +
    numericWeight(weights.legs) +
    numericWeight(weights.boots) +
    numericWeight(weights.shield);

  const getWeightCategory = (t: number) => (t <= LIGHT_MAX ? 'Light' : t <= MEDIUM_MAX ? 'Medium' : 'Heavy');

  const getMarginToNext = (t: number) => {
    if (t <= LIGHT_MAX) return { category: 'Medium', margin: LIGHT_MAX - t, direction: 'until' as const };
    if (t <= MEDIUM_MAX) return { category: 'Heavy', margin: MEDIUM_MAX - t, direction: 'until' as const };
    return { category: 'Medium', margin: t - MEDIUM_MAX, direction: 'over' as const };
  };

  const currentCategory = hasSelections ? getWeightCategory(totalWeight) : null;
  const margin = hasSelections ? getMarginToNext(totalWeight) : null;

  const handleSelectChange = (slot: Slot, value: string) => {
    if (value === '') {
      setWeights((prev) => ({ ...prev, [slot]: null }));
      return;
    }
    const num = parseFloat(value);
    setWeights((prev) => ({ ...prev, [slot]: Number.isFinite(num) ? num : null }));
  };

  const resetWeights = () => {
    setWeights({ head: null, chest: null, gloves: null, legs: null, boots: null, shield: null });
    localStorage.removeItem('awcalc:v2');
    setSearchParams({});
  };

  const copyStateLink = () => {
    const numericState = Object.fromEntries(
      (Object.keys(weights) as Slot[]).map((slot) => [slot, numericWeight(weights[slot])])
    );
    const stateString = btoa(JSON.stringify(numericState));
    const url = `${window.location.origin}${window.location.pathname}?state=${stateString}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied!', description: 'Calculator state link copied to clipboard' });
  };

  const getCategoryButtonClasses = (c: string) => ({
    'Light': 'bg-green-600 text-white hover:bg-green-600/90',
    'Medium': 'bg-white text-black border hover:bg-white/90',
    'Heavy': 'bg-red-600 text-white hover:bg-red-600/90',
  }[c] || '');

  const selectValue = (slot: Slot, v: number | null) =>
    typeof v === 'number' && allowedValues[slot].includes(v) ? String(v) : '';

  return (
    <Layout 
      title="Armor Weight Calculator - New World Builds"
      description="Calculate your armor weight and determine your equipment load category in New World Aeternum. Optimize your build for Light, Medium, or Heavy load."
      canonical="/tools/armor-weight-calculator"
      keywords={["New World armor weight", "New World calculator", "Equipment load", "Aeternum armor"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "New World Armor Weight Calculator",
        description: "Interactive calculator to determine your New World armor weight threshold for Light, Medium, and Heavy builds.",
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        url: `${siteUrl}/tools/armor-weight-calculator`
      }}
    >
      <div className="container px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            Armor Weight Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Calculate your total armor weight and determine your equipment load category. 
            Optimize your build for the perfect balance of protection and mobility.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Equipment Weights
                </CardTitle>
                <CardDescription>Select the weight class for each piece of equipment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="head">Head Armor</Label>
                    <Select value={selectValue('head', weights.head)} onValueChange={(v) => handleSelectChange('head', v)}>
                      <SelectTrigger id="head" className="w-full"><SelectValue placeholder="Select weight..." /></SelectTrigger>
                      <SelectContent>
                        {OPTIONS.head.map((opt) => (<SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chest">Chest Armor</Label>
                    <Select value={selectValue('chest', weights.chest)} onValueChange={(v) => handleSelectChange('chest', v)}>
                      <SelectTrigger id="chest" className="w-full"><SelectValue placeholder="Select weight..." /></SelectTrigger>
                      <SelectContent>
                        {OPTIONS.chest.map((opt) => (<SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gloves">Gloves</Label>
                    <Select value={selectValue('gloves', weights.gloves)} onValueChange={(v) => handleSelectChange('gloves', v)}>
                      <SelectTrigger id="gloves" className="w-full"><SelectValue placeholder="Select weight..." /></SelectTrigger>
                      <SelectContent>
                        {OPTIONS.gloves.map((opt) => (<SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legs">Leg Armor</Label>
                    <Select value={selectValue('legs', weights.legs)} onValueChange={(v) => handleSelectChange('legs', v)}>
                      <SelectTrigger id="legs" className="w-full"><SelectValue placeholder="Select weight..." /></SelectTrigger>
                      <SelectContent>
                        {OPTIONS.legs.map((opt) => (<SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="boots">Boots</Label>
                    <Select value={selectValue('boots', weights.boots)} onValueChange={(v) => handleSelectChange('boots', v)}>
                      <SelectTrigger id="boots" className="w-full"><SelectValue placeholder="Select weight..." /></SelectTrigger>
                      <SelectContent>
                        {OPTIONS.boots.map((opt) => (<SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shield">Shield</Label>
                    <Select value={selectValue('shield', weights.shield)} onValueChange={(v) => handleSelectChange('shield', v)}>
                      <SelectTrigger id="shield" className="w-full"><SelectValue placeholder="Select weight..." /></SelectTrigger>
                      <SelectContent>
                        {OPTIONS.shield.map((opt) => (<SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button onClick={resetWeights} variant="outline" className="flex items-center"><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
                  <Button onClick={copyStateLink} variant="outline" className="flex items-center"><Copy className="mr-2 h-4 w-4" />Copy State Link</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Your current equipment load</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{hasSelections ? totalWeight.toFixed(1) : '--'}</div>
                  <div className="text-sm text-muted-foreground">Total Weight</div>
                </div>

                <div className="text-center">
                  <Button type="button" disabled className={`text-lg px-4 py-2 mb-2 ${currentCategory ? getCategoryButtonClasses(currentCategory) : 'bg-muted text-muted-foreground'}`}>
                    {currentCategory ? `${currentCategory} Load` : 'Select armor weights'}
                  </Button>
                  <div className="text-sm text-muted-foreground">Equipment Category</div>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  {margin ? (
                    <>
                      <div className="text-sm font-medium mb-1">
                        {margin.direction === 'until' ? 'Remaining until' : 'Weight over'} {margin.category}
                      </div>
                      <div className="text-lg font-semibold text-primary">{Math.abs(margin.margin).toFixed(1)}</div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Select weights to see thresholds</div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center"><span>Light Load</span><span className="font-medium">&lt;= {LIGHT_MAX}</span></div>
                  <div className="flex justify-between items-center"><span>Medium Load</span><span className="font-medium">{LIGHT_MAX + 0.1} - {MEDIUM_MAX}</span></div>
                  <div className="flex justify-between items-center"><span>Heavy Load</span><span className="font-medium">&gt; {MEDIUM_MAX + 0.1}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Load Benefits</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-nature-green mb-1">Light Load</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Base Damage: +15%</li>
                    <li>• Outgoing Healing: +30%</li>
                    <li>• Your dodge is a quick roll</li>
                    <li>• Dodge Stamina Cost: 50</li>
                    <li>• For 0.85s after taking a melee hit, dodge distance is reduced by 20% and you cannor run</li>
                    <li>• [PvP] Crit Damage Taken: -15%</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="flex justify-between items-center">Medium Load</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Your dodge is a quick hop</li>
                    <li>• Dodge Stamina Cost: 50</li>
                    <li>• Incoming Crowd Control Duration: -10%</li>
                    <li>• For 0.65s after taking a melee hit, dodge distance is reduced by 20% and you cannot run</li>
                    <li>• [PvP] Crit Damage Taken: -20%</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Heavy Load</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Base Damage: -15%</li>
                    <li>• Outgoing Healing: -30%</li>
                    <li>• Incoming Crowd Control Duration: -20%</li>
                    <li>• Your dodge is a directional step</li>
                    <li>• Dodge Stamina Cost: 55</li>
                    <li>• For 0.50s after taking a melee hit, you cannot run</li>
                    <li>• [PvP] Crit Damage Taken: -25%</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Encumbered</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>If the inventory weight limit is exceeded, you are encumbered, which restricts your movement and actions. You also lose more stamina while blocking.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArmorWeightCalculator;




