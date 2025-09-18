import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Coins, TrendingUp, ShoppingCart, Map, Clock, Target } from "lucide-react";

const GoldMakingGuide = () => {
  const goldStrategies = [
    {
      method: "Trading Post Flipping",
      profitability: "High", 
      timeInvestment: "Medium",
      initialCost: "Medium",
      description: "Buy low, sell high by monitoring market trends and price fluctuations",
      tips: [
        "Track price history for popular items",
        "Set up buy orders 10-20% below market value",
        "Focus on high-volume items like potions and food",
        "Monitor server events that affect supply and demand"
      ]
    },
    {
      method: "Resource Gathering & Selling",
      profitability: "Medium",
      timeInvestment: "High", 
      initialCost: "Low",
      description: "Collect raw materials and sell them on the trading post",
      tips: [
        "Focus on rare materials like Orichalcum and Ironwood",
        "Time gathering during peak hours for best prices",
        "Level gathering skills for better yield and rare drops",
        "Use gathering gear and consumables for efficiency"
      ]
    },
    {
      method: "Crafted Item Production",
      profitability: "High",
      timeInvestment: "Medium",
      initialCost: "High", 
      description: "Craft in-demand items and sell for profit margins",
      tips: [
        "Specialize in 2-3 crafting skills maximum",
        "Calculate material costs vs selling price",
        "Focus on consumables with consistent demand",
        "Use crafting bonuses and territory bonuses"
      ]
    },
    {
      method: "Daily Activities",
      profitability: "Low",
      timeInvestment: "Low",
      initialCost: "None",
      description: "Consistent income from daily quests, faction missions, and activities",
      tips: [
        "Complete all daily faction missions", 
        "Run daily expeditions for guaranteed rewards",
        "Participate in town board missions",
        "Join Outpost Rush for steady gold income"
      ]
    }
  ];

  const highValueItems = [
    {
      category: "Consumables",
      items: ["Health Potions (T4-T5)", "Mana Potions (T4-T5)", "Food Buffs", "Coatings & Tinctures"],
      demand: "Consistent",
      notes: "Always in demand, especially during wars and events"
    },
    {
      category: "Crafting Materials", 
      items: ["Asmodeum", "Runic Leather", "Phoenixweave", "Glittering Ebony"],
      demand: "High",
      notes: "Required for endgame gear crafting"
    },
    {
      category: "Gems & Components",
      items: ["Cut Brilliant Gems", "Timeless Shards", "Legendary Materials"],
      demand: "Medium-High", 
      notes: "Expensive but lower volume trading"
    },
    {
      category: "Gear & Weapons",
      items: ["Meta PvP Builds", "600 GS Crafted Items", "Perfect Perk Combinations"],
      demand: "Variable",
      notes: "High profit margins but requires market knowledge"
    }
  ];

  const marketTiming = [
    {
      event: "War Declarations",
      impact: "Consumable prices spike 24-48 hours before wars",
      strategy: "Stock up on potions, food, and coatings in advance"
    },
    {
      event: "New Content Releases", 
      impact: "Crafting materials and gear in high demand",
      strategy: "Prepare relevant materials and items before patch releases"
    },
    {
      event: "Weekend Peak Hours",
      impact: "Higher player activity increases all market volume",
      strategy: "List high-value items during peak times for maximum visibility"
    },
    {
      event: "Seasonal Events",
      impact: "Event-specific items and general consumables see increased demand",
      strategy: "Participate in events while maintaining market activities"
    }
  ];

  const advancedTips = [
    {
      tip: "Cross-Server Trading",
      description: "Transfer to different servers to buy low and return to sell high. Requires character transfers but can be very profitable."
    },
    {
      tip: "Company Coordination",
      description: "Work with company members to corner specific markets or coordinate large-scale resource gathering operations."
    },
    {
      tip: "Settlement Tax Optimization",
      description: "Use territories with lowest trading taxes for high-volume transactions. Factor tax costs into profit calculations."
    },
    {
      tip: "Storage Management",
      description: "Use multiple settlements' storage effectively. Keep materials where you craft, finished goods where you sell."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Ultimate Gold Making Guide</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Master the economy of Aeternum with proven strategies, market analysis, and profit optimization techniques. 
            Build your wealth through smart trading, efficient crafting, and market timing.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary">Economy Guide</Badge>
            <Badge variant="outline">Profit Strategies</Badge>
          </div>
        </div>

        {/* Gold Making Strategies */}
        <div className="space-y-6 mb-12">
          {goldStrategies.map((strategy, index) => (
            <Card key={index} className="gradient-card border-gaming-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{strategy.method}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={strategy.profitability === "High" ? "default" : strategy.profitability === "Medium" ? "secondary" : "outline"}>
                      {strategy.profitability} Profit
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>⏱️ {strategy.timeInvestment} Time</span>
                  <span>💰 {strategy.initialCost} Investment</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">{strategy.description}</p>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Key Tips & Strategies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {strategy.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex items-start gap-3 p-3 rounded-lg bg-gaming-surface">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                          {tipIndex + 1}
                        </div>
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* High Value Items */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              High-Value Item Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {highValueItems.map((category, index) => (
                <div key={index} className="p-4 rounded-lg bg-gaming-surface border border-gaming-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{category.category}</h3>
                    <Badge variant="outline" className="text-xs">
                      {category.demand} Demand
                    </Badge>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-primary">• {item}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">{category.notes}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Timing */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Market Timing & Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketTiming.map((timing, index) => (
                <div key={index} className="p-4 rounded-lg bg-gaming-surface border border-gaming-border">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{timing.event}</h3>
                    <Target className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{timing.impact}</p>
                  <p className="text-sm text-primary">
                    <strong>Strategy:</strong> {timing.strategy}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Tips */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Advanced Trading Techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {advancedTips.map((advancedTip, index) => (
                <div key={index} className="p-4 rounded-lg bg-gaming-surface border border-gaming-border">
                  <h3 className="font-semibold text-foreground mb-2">{advancedTip.tip}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{advancedTip.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calculators Promotion */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Use Our Gold Making Calculators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Take your gold making to the next level with our specialized calculators. 
              Calculate profit margins, optimize crafting costs, and track your investments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button asChild variant="gold" className="h-auto py-4">
                <Link to="/tools/runglass" className="flex flex-col items-center gap-2">
                  <span className="font-semibold">Runglass Calculator</span>
                  <span className="text-xs opacity-80">Optimize crafting profits</span>
                </Link>
              </Button>
              <Button asChild variant="gold" className="h-auto py-4">
                <Link to="/tools/trophies" className="flex flex-col items-center gap-2">
                  <span className="font-semibold">Trophy Calculator</span>
                  <span className="text-xs opacity-80">Compare craft vs buy costs</span>
                </Link>
              </Button>
              <Button asChild variant="gold" className="h-auto py-4">
                <Link to="/tools/matrix" className="flex flex-col items-center gap-2">
                  <span className="font-semibold">Matrix Calculator</span>
                  <span className="text-xs opacity-80">Track multiple investments</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center py-12 border-t border-gaming-border">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Start Building Your Fortune</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Apply these strategies consistently and track your progress. Remember that building wealth 
            in New World requires patience, market knowledge, and strategic thinking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero">
              <Link to="/tools/runglass">Try Gold Calculators</Link>
            </Button>
            <Button asChild variant="gaming">
              <Link to="/builds">View Economic Builds</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/guides/new-player">New Player Guide</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GoldMakingGuide;