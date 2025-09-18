import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { Gem, Calculator, RotateCcw, Share2, TrendingUp } from "lucide-react";

interface RunglassInputs {
  componentPrice: number;
  componentQuantity: number;
  stationFee: number;
  territoryTax: number;
  yield: number;
  sellPrice: number;
}

const RunglassCalculator = () => {
  const [inputs, setInputs] = useState<RunglassInputs>({
    componentPrice: 0,
    componentQuantity: 4,
    stationFee: 15,
    territoryTax: 5,
    yield: 1,
    sellPrice: 0,
  });

  const [results, setResults] = useState({
    totalCost: 0,
    outputValue: 0,
    profit: 0,
    profitPerUnit: 0,
    roi: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    calculateResults();
    // Save to localStorage
    localStorage.setItem('runglassCalculatorInputs', JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('runglassCalculatorInputs');
    if (saved) {
      try {
        const parsedInputs = JSON.parse(saved);
        setInputs(parsedInputs);
      } catch (error) {
        console.error('Error loading saved inputs:', error);
      }
    }
  }, []);

  const calculateResults = () => {
    const materialCost = inputs.componentPrice * inputs.componentQuantity;
    const fees = inputs.stationFee + (materialCost * inputs.territoryTax / 100);
    const totalCost = materialCost + fees;
    const outputValue = inputs.sellPrice * inputs.yield;
    const profit = outputValue - totalCost;
    const profitPerUnit = inputs.yield > 0 ? profit / inputs.yield : 0;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    setResults({
      totalCost,
      outputValue,
      profit,
      profitPerUnit,
      roi,
    });
  };

  const handleInputChange = (field: keyof RunglassInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const resetCalculator = () => {
    const resetInputs: RunglassInputs = {
      componentPrice: 0,
      componentQuantity: 4,
      stationFee: 15,
      territoryTax: 5,
      yield: 1,
      sellPrice: 0,
    };
    setInputs(resetInputs);
    localStorage.removeItem('runglassCalculatorInputs');
    toast({
      title: "Calculator Reset",
      description: "All inputs have been reset to default values",
    });
  };

  const shareCalculation = () => {
    const params = new URLSearchParams();
    Object.entries(inputs).forEach(([key, value]) => {
      params.set(key, value.toString());
    });
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied!",
      description: "Calculation link copied to clipboard",
    });
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return "text-green-400";
    if (profit < 0) return "text-red-400";
    return "text-muted-foreground";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gem className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Runglass Calculator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Calculate profit margins for Runglass crafting. Factor in material costs, 
            taxes, fees, and yield to optimize your crafting investments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="gradient-card border-gaming-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Crafting Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="componentPrice" className="text-sm font-medium">
                      Component Price (each)
                    </Label>
                    <Input
                      id="componentPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.componentPrice || ''}
                      onChange={(e) => handleInputChange('componentPrice', e.target.value)}
                      placeholder="0.00"
                      className="bg-gaming-surface border-gaming-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="componentQuantity" className="text-sm font-medium">
                      Quantity Needed
                    </Label>
                    <Input
                      id="componentQuantity"
                      type="number"
                      min="1"
                      value={inputs.componentQuantity || ''}
                      onChange={(e) => handleInputChange('componentQuantity', e.target.value)}
                      placeholder="4"
                      className="bg-gaming-surface border-gaming-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stationFee" className="text-sm font-medium">
                    Crafting Station Fee
                  </Label>
                  <Input
                    id="stationFee"
                    type="number"
                    min="0"
                    step="0.1"
                    value={inputs.stationFee || ''}
                    onChange={(e) => handleInputChange('stationFee', e.target.value)}
                    placeholder="15.0"
                    className="bg-gaming-surface border-gaming-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="territoryTax" className="text-sm font-medium">
                    Territory Tax (%)
                  </Label>
                  <Input
                    id="territoryTax"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={inputs.territoryTax || ''}
                    onChange={(e) => handleInputChange('territoryTax', e.target.value)}
                    placeholder="5.0"
                    className="bg-gaming-surface border-gaming-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yield" className="text-sm font-medium">
                    Expected Yield
                  </Label>
                  <Input
                    id="yield"
                    type="number"
                    min="1"
                    step="0.1"
                    value={inputs.yield || ''}
                    onChange={(e) => handleInputChange('yield', e.target.value)}
                    placeholder="1"
                    className="bg-gaming-surface border-gaming-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellPrice" className="text-sm font-medium">
                    Sell Price (per unit)
                  </Label>
                  <Input
                    id="sellPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={inputs.sellPrice || ''}
                    onChange={(e) => handleInputChange('sellPrice', e.target.value)}
                    placeholder="0.00"
                    className="bg-gaming-surface border-gaming-border"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetCalculator}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    variant="gaming"
                    onClick={shareCalculation}
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="gradient-card border-gaming-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Profit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <div className={`text-4xl font-bold mb-2 ${getProfitColor(results.profit)}`}>
                    {results.profit >= 0 ? '+' : ''}{results.profit.toFixed(2)}
                  </div>
                  <div className="text-muted-foreground mb-2">Total Profit</div>
                  <div className={`text-lg font-semibold ${getProfitColor(results.roi)}`}>
                    {results.roi >= 0 ? '+' : ''}{results.roi.toFixed(1)}% ROI
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gaming-surface">
                    <span className="text-sm font-medium">Material Cost</span>
                    <span className="text-sm font-mono">
                      {(inputs.componentPrice * inputs.componentQuantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gaming-surface">
                    <span className="text-sm font-medium">Crafting Fees</span>
                    <span className="text-sm font-mono">
                      {(inputs.stationFee + ((inputs.componentPrice * inputs.componentQuantity) * inputs.territoryTax / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gaming-surface border-t border-gaming-border">
                    <span className="text-sm font-medium">Total Cost</span>
                    <span className="text-sm font-mono font-semibold">
                      {results.totalCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gaming-surface">
                    <span className="text-sm font-medium">Output Value</span>
                    <span className="text-sm font-mono">
                      {results.outputValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gaming-surface">
                    <span className="text-sm font-medium">Profit Per Unit</span>
                    <span className={`text-sm font-mono ${getProfitColor(results.profitPerUnit)}`}>
                      {results.profitPerUnit >= 0 ? '+' : ''}{results.profitPerUnit.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gaming-surface rounded-lg border border-gaming-border">
                  <h4 className="font-semibold mb-2 text-sm">Optimization Tips:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use territories with lowest crafting taxes</li>
                    <li>• Buy materials during market dips</li>
                    <li>• Consider crafting bonuses from gear and food</li>
                    <li>• Monitor competitor pricing regularly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card className="gradient-card border-gaming-border">
              <CardHeader>
                <CardTitle className="text-lg">Break-Even Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Break-even sell price: </span>
                    <span className="font-mono font-semibold text-foreground">
                      {inputs.yield > 0 ? (results.totalCost / inputs.yield).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Max component price (current profit): </span>
                    <span className="font-mono font-semibold text-foreground">
                      {inputs.componentQuantity > 0 ? 
                        ((results.outputValue - inputs.stationFee) / (inputs.componentQuantity * (1 + inputs.territoryTax / 100))).toFixed(2) : 
                        '0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RunglassCalculator;