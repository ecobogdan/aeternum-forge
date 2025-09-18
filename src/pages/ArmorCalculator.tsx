import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { Shield, RotateCcw, Link, Save } from "lucide-react";

interface LoadThresholds {
  light: number;
  medium: number;
  heavy: number;
}

const LOAD_THRESHOLDS: LoadThresholds = {
  light: 13,
  medium: 23,
  heavy: Infinity
};

const ArmorCalculator = () => {
  const [weights, setWeights] = useState({
    helmet: 0,
    chest: 0,
    gloves: 0,
    legs: 0,
    boots: 0,
    extras: 0,
  });

  const [totalWeight, setTotalWeight] = useState(0);
  const [loadCategory, setLoadCategory] = useState("Light");
  const [margin, setMargin] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    setTotalWeight(total);

    let category = "Light";
    let nextThreshold = LOAD_THRESHOLDS.medium;

    if (total > LOAD_THRESHOLDS.medium) {
      category = "Heavy";
      nextThreshold = Infinity;
    } else if (total > LOAD_THRESHOLDS.light) {
      category = "Medium";
      nextThreshold = LOAD_THRESHOLDS.heavy;
    }

    setLoadCategory(category);
    setMargin(nextThreshold === Infinity ? 0 : nextThreshold - total);

    // Save to localStorage
    localStorage.setItem('armorCalculatorWeights', JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('armorCalculatorWeights');
    if (saved) {
      try {
        const parsedWeights = JSON.parse(saved);
        setWeights(parsedWeights);
      } catch (error) {
        console.error('Error loading saved weights:', error);
      }
    }
  }, []);

  const handleWeightChange = (slot: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setWeights(prev => ({ ...prev, [slot]: numValue }));
  };

  const resetCalculator = () => {
    const resetWeights = {
      helmet: 0,
      chest: 0,
      gloves: 0,
      legs: 0,
      boots: 0,
      extras: 0,
    };
    setWeights(resetWeights);
    localStorage.removeItem('armorCalculatorWeights');
    toast({
      title: "Calculator Reset",
      description: "All weights have been reset to zero",
    });
  };

  const copyStateAsLink = () => {
    const params = new URLSearchParams();
    Object.entries(weights).forEach(([slot, weight]) => {
      if (weight > 0) {
        params.set(slot, weight.toString());
      }
    });
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied!",
      description: "Calculator state copied to clipboard",
    });
  };

  const getLoadCategoryColor = (category: string) => {
    switch (category) {
      case "Light": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Heavy": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Armor Weight Calculator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Calculate your total equipped weight and determine your load category. 
            Optimize your build for Light, Medium, or Heavy load thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="gradient-card border-gaming-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Equipment Weights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "helmet", label: "Helmet", placeholder: "0.0" },
                { key: "chest", label: "Chest Armor", placeholder: "0.0" },
                { key: "gloves", label: "Gloves", placeholder: "0.0" },
                { key: "legs", label: "Leg Armor", placeholder: "0.0" },
                { key: "boots", label: "Boots", placeholder: "0.0" },
                { key: "extras", label: "Extras (Shield/Jewelry)", placeholder: "0.0" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    min="0"
                    step="0.1"
                    value={weights[key as keyof typeof weights] || ''}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="bg-gaming-surface border-gaming-border"
                  />
                </div>
              ))}

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
                  onClick={copyStateAsLink}
                  className="flex-1"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="gradient-card border-gaming-border">
            <CardHeader>
              <CardTitle>Load Category Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="text-4xl font-bold mb-2 text-primary">
                  {totalWeight.toFixed(1)}
                </div>
                <div className="text-muted-foreground mb-4">Total Equipped Weight</div>
                
                <div className={`text-2xl font-semibold mb-2 ${getLoadCategoryColor(loadCategory)}`}>
                  {loadCategory} Load
                </div>
                
                {margin > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {margin.toFixed(1)} weight until next threshold
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gaming-surface">
                  <span className="text-sm font-medium">Light Load</span>
                  <span className={`text-sm ${totalWeight <= LOAD_THRESHOLDS.light ? 'text-green-400 font-semibold' : 'text-muted-foreground'}`}>
                    ≤ {LOAD_THRESHOLDS.light}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gaming-surface">
                  <span className="text-sm font-medium">Medium Load</span>
                  <span className={`text-sm ${totalWeight > LOAD_THRESHOLDS.light && totalWeight <= LOAD_THRESHOLDS.medium ? 'text-yellow-400 font-semibold' : 'text-muted-foreground'}`}>
                    {LOAD_THRESHOLDS.light + 0.1} - {LOAD_THRESHOLDS.medium}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gaming-surface">
                  <span className="text-sm font-medium">Heavy Load</span>
                  <span className={`text-sm ${totalWeight > LOAD_THRESHOLDS.medium ? 'text-red-400 font-semibold' : 'text-muted-foreground'}`}>
                    &gt; {LOAD_THRESHOLDS.medium}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gaming-surface rounded-lg border border-gaming-border">
                <h4 className="font-semibold mb-2 text-sm">Load Category Effects:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li><strong className="text-green-400">Light:</strong> Fastest movement, longest dodge distance</li>
                  <li><strong className="text-yellow-400">Medium:</strong> Balanced movement and protection</li>
                  <li><strong className="text-red-400">Heavy:</strong> Highest defense, shortest dodge distance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ArmorCalculator;