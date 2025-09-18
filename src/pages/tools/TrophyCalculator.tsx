import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Calculator, RotateCcw, Share2, TrendingUp, AlertCircle } from "lucide-react";

interface TrophyTier {
  name: string;
  materials: { [key: string]: number };
  baseCost: number;
  marketPrice: number;
}

interface MaterialPrices {
  [key: string]: number;
}

const TrophyCalculator = () => {
  const [materialPrices, setMaterialPrices] = useState<MaterialPrices>({
    ironOre: 0.10,
    silverOre: 0.50,
    goldOre: 2.00,
    platinumOre: 8.00,
    starmetal: 15.00,
    orichalcum: 25.00,
    timber: 0.05,
    lumber: 0.25,
    ironwood: 2.00,
    wyrdwood: 8.00,
    ironwoodPlanks: 20.00,
  });

  const [taxes, setTaxes] = useState({
    crafting: 5.0,
    trading: 2.5,
  });

  const trophyTiers: TrophyTier[] = [
    {
      name: "Basic Trophy",
      materials: {
        ironOre: 50,
        timber: 30,
      },
      baseCost: 0,
      marketPrice: 0,
    },
    {
      name: "Minor Trophy",
      materials: {
        silverOre: 40,
        lumber: 25,
      },
      baseCost: 0,
      marketPrice: 0,
    },
    {
      name: "Major Trophy",
      materials: {
        goldOre: 30,
        ironwood: 20,
        starmetal: 15,
      },
      baseCost: 0,
      marketPrice: 0,
    },
    {
      name: "Grand Trophy",
      materials: {
        platinumOre: 25,
        wyrdwood: 15,
        orichalcum: 10,
        ironwoodPlanks: 5,
      },
      baseCost: 0,
      marketPrice: 0,
    },
  ];

  const [trophyData, setTrophyData] = useState(trophyTiers);
  const { toast } = useToast();

  useEffect(() => {
    calculateTrophyCosts();
    // Save to localStorage
    localStorage.setItem('trophyCalculatorData', JSON.stringify({
      materialPrices,
      taxes,
      marketPrices: trophyData.map(t => ({ name: t.name, marketPrice: t.marketPrice }))
    }));
  }, [materialPrices, taxes, trophyData]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('trophyCalculatorData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.materialPrices) setMaterialPrices(data.materialPrices);
        if (data.taxes) setTaxes(data.taxes);
        if (data.marketPrices) {
          setTrophyData(prev => prev.map(trophy => {
            const saved = data.marketPrices.find((mp: any) => mp.name === trophy.name);
            return saved ? { ...trophy, marketPrice: saved.marketPrice } : trophy;
          }));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const calculateTrophyCosts = () => {
    const updatedTrophies = trophyData.map(trophy => {
      let materialCost = 0;
      
      Object.entries(trophy.materials).forEach(([material, quantity]) => {
        const price = materialPrices[material] || 0;
        materialCost += price * quantity;
      });

      const craftingFees = materialCost * (taxes.crafting / 100);
      const totalCraftCost = materialCost + craftingFees;

      return {
        ...trophy,
        baseCost: totalCraftCost,
      };
    });

    setTrophyData(updatedTrophies);
  };

  const handleMaterialPriceChange = (material: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMaterialPrices(prev => ({ ...prev, [material]: numValue }));
  };

  const handleTaxChange = (field: 'crafting' | 'trading', value: string) => {
    const numValue = parseFloat(value) || 0;
    setTaxes(prev => ({ ...prev, [field]: numValue }));
  };

  const handleMarketPriceChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTrophyData(prev => prev.map((trophy, i) => 
      i === index ? { ...trophy, marketPrice: numValue } : trophy
    ));
  };

  const resetCalculator = () => {
    setMaterialPrices({
      ironOre: 0.10,
      silverOre: 0.50,
      goldOre: 2.00,
      platinumOre: 8.00,
      starmetal: 15.00,
      orichalcum: 25.00,
      timber: 0.05,
      lumber: 0.25,
      ironwood: 2.00,
      wyrdwood: 8.00,
      ironwoodPlanks: 20.00,
    });
    setTaxes({ crafting: 5.0, trading: 2.5 });
    setTrophyData(trophyTiers);
    localStorage.removeItem('trophyCalculatorData');
    
    toast({
      title: "Calculator Reset",
      description: "All prices and settings reset to defaults",
    });
  };

  const shareCalculation = () => {
    const data = { materialPrices, taxes, trophyData };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied!",
      description: "Calculation link copied to clipboard",
    });
  };

  const getRecommendation = (craftCost: number, marketPrice: number) => {
    if (marketPrice === 0) return { text: "Set market price", color: "text-muted-foreground" };
    if (craftCost < marketPrice * 0.8) return { text: "Craft - Good profit", color: "text-green-400" };
    if (craftCost < marketPrice) return { text: "Craft - Small profit", color: "text-yellow-400" };
    return { text: "Buy - Cheaper than crafting", color: "text-red-400" };
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Trophy Calculator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Compare crafting costs vs market prices for trophies. Optimize your approach 
            by calculating material costs and determining whether to craft or buy.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Material Prices */}
          <Card className="gradient-card border-gaming-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Material Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(materialPrices).map(([material, price]) => (
                <div key={material} className="space-y-1">
                  <Label htmlFor={material} className="text-xs font-medium capitalize">
                    {material.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Input
                    id={material}
                    type="number"
                    min="0"
                    step="0.01"
                    value={price || ''}
                    onChange={(e) => handleMaterialPriceChange(material, e.target.value)}
                    className="bg-gaming-surface border-gaming-border text-sm"
                  />
                </div>
              ))}
              
              <div className="border-t border-gaming-border pt-4 mt-6">
                <h4 className="font-semibold text-sm mb-3">Taxes & Fees (%)</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="crafting" className="text-xs font-medium">
                      Crafting Tax
                    </Label>
                    <Input
                      id="crafting"
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={taxes.crafting || ''}
                      onChange={(e) => handleTaxChange('crafting', e.target.value)}
                      className="bg-gaming-surface border-gaming-border text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="trading" className="text-xs font-medium">
                      Trading Tax
                    </Label>
                    <Input
                      id="trading"
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={taxes.trading || ''}
                      onChange={(e) => handleTaxChange('trading', e.target.value)}
                      className="bg-gaming-surface border-gaming-border text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trophy Analysis */}
          <div className="xl:col-span-2 space-y-6">
            {trophyData.map((trophy, index) => {
              const recommendation = getRecommendation(trophy.baseCost, trophy.marketPrice);
              const profit = trophy.marketPrice - trophy.baseCost;
              
              return (
                <Card key={index} className="gradient-card border-gaming-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{trophy.name}</CardTitle>
                      <Badge className={recommendation.color} variant="outline">
                        {recommendation.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Materials Required */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Materials Required</h4>
                        <div className="space-y-2">
                          {Object.entries(trophy.materials).map(([material, quantity]) => (
                            <div key={material} className="flex justify-between text-sm">
                              <span className="text-muted-foreground capitalize">
                                {material.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="font-mono">{quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cost Analysis */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Cost Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Craft Cost</span>
                            <span className="font-mono">{trophy.baseCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Market Price</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={trophy.marketPrice || ''}
                              onChange={(e) => handleMarketPriceChange(index, e.target.value)}
                              className="bg-gaming-surface border-gaming-border text-xs h-6 w-20 text-right"
                            />
                          </div>
                          <div className="flex justify-between text-sm border-t border-gaming-border pt-2">
                            <span className="font-medium">Difference</span>
                            <span className={`font-mono font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Recommendation</h4>
                        <div className="p-3 rounded-lg bg-gaming-surface border border-gaming-border">
                          <div className={`text-sm font-medium mb-2 ${recommendation.color}`}>
                            {recommendation.text}
                          </div>
                          {trophy.marketPrice > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {trophy.baseCost < trophy.marketPrice ? 
                                `Profit margin: ${((profit / trophy.baseCost) * 100).toFixed(1)}%` :
                                `Loss: ${((Math.abs(profit) / trophy.marketPrice) * 100).toFixed(1)}%`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-12">
          <Button variant="outline" onClick={resetCalculator}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button variant="gaming" onClick={shareCalculation}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Calculation
          </Button>
        </div>

        {/* Tips */}
        <Card className="gradient-card border-gaming-border mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Trophy Crafting Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-gaming-surface">
                <h4 className="font-semibold text-sm mb-2">Material Sourcing</h4>
                <p className="text-xs text-muted-foreground">Buy materials during market dips. Set up buy orders for consistent supply at good prices.</p>
              </div>
              <div className="p-3 rounded-lg bg-gaming-surface">
                <h4 className="font-semibold text-sm mb-2">Crafting Optimization</h4>
                <p className="text-xs text-muted-foreground">Use territories with lowest crafting taxes. Consider crafting gear and food bonuses.</p>
              </div>
              <div className="p-3 rounded-lg bg-gaming-surface">
                <h4 className="font-semibold text-sm mb-2">Market Timing</h4>
                <p className="text-xs text-muted-foreground">Trophy demand peaks during wars and new content releases. Plan accordingly.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TrophyCalculator;