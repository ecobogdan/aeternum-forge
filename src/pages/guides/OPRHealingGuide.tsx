import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart, Shield, Users, Zap, Target, AlertCircle } from "lucide-react";

const OPRHealingGuide = () => {
  const healingPriorities = [
    {
      priority: 1,
      target: "Frontline Tanks",
      reason: "Keep your damage dealers alive to maintain pressure",
      tips: ["Pre-heal before they engage", "Use area heals for clustered frontlines"]
    },
    {
      priority: 2, 
      target: "Other Healers",
      reason: "Preserve team healing capacity",
      tips: ["Counter-heal enemy focus fire", "Coordinate overlapping healing circles"]
    },
    {
      priority: 3,
      target: "Ranged DPS",
      reason: "Maintain sustained damage output",
      tips: ["Quick spot heals between rotations", "Beacon placement for positioning"]
    },
    {
      priority: 4,
      target: "Yourself",
      reason: "Stay alive to continue supporting the team",
      tips: ["Always prioritize your own survival", "Use mobility to avoid being targeted"]
    }
  ];

  const keyAbilities = [
    {
      weapon: "Life Staff",
      abilities: [
        {
          name: "Sacred Ground",
          description: "Area heal over time - cornerstone of group healing",
          tips: ["Place ahead of team movement", "Stack multiple circles when needed"]
        },
        {
          name: "Divine Embrace", 
          description: "Strong single-target heal with fortify",
          tips: ["Use on critical health targets", "Fortify helps survive burst damage"]
        },
        {
          name: "Beacon",
          description: "Targeted area heal that follows allies",
          tips: ["Attach to mobile frontline fighters", "Great for objective captures"]
        }
      ]
    },
    {
      weapon: "Void Gauntlet",
      abilities: [
        {
          name: "Oblivion",
          description: "Area damage and healing based on enemy hits",
          tips: ["Place on grouped enemies", "Provides sustain during team fights"]
        },
        {
          name: "Orb of Decay",
          description: "Projectile that heals allies and damages enemies", 
          tips: ["Aim through teammates to heal", "Use for poke damage on enemies"]
        },
        {
          name: "Essence Rupture",
          description: "Debuff that heals you when target takes damage",
          tips: ["Apply to priority enemy targets", "Provides passive healing during fights"]
        }
      ]
    }
  ];

  const positioningTips = [
    "Stay behind cover but maintain line of sight to your team",
    "Position near escape routes in case you get focused",
    "Use elevation when possible for better field of view", 
    "Stay close enough to heal but far enough to avoid AOE damage",
    "Rotate positions frequently to avoid being predictable"
  ];

  const mapStrategies = [
    {
      area: "Outpost Captures",
      strategy: "Place Sacred Ground on capture points before team arrives. Use Beacon on point holders."
    },
    {
      area: "Baron/Brute Fights",
      strategy: "Focus on keeping the tank alive. Use defensive positioning behind terrain."
    },
    {
      area: "Bridge Battles",
      strategy: "Heal from elevated positions. Watch for flanking enemies trying to reach you."
    },
    {
      area: "Fort Sieges",
      strategy: "Coordinate with other healers. Focus on siege weapon operators and gate breakers."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">OPR Healing Guide</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Master the art of healing in Outpost Rush. Learn positioning, priority targeting, 
            and team coordination to become an invaluable support player.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary">Support Role</Badge>
            <Badge variant="outline">Team Play Focus</Badge>
          </div>
        </div>

        {/* Healing Priorities */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Healing Priority System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healingPriorities.map((priority) => (
                <div key={priority.priority} className="p-4 rounded-lg bg-gaming-surface border border-gaming-border">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {priority.priority}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{priority.target}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{priority.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        {priority.tips.map((tip, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Abilities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {keyAbilities.map((weaponData) => (
            <Card key={weaponData.weapon} className="gradient-card border-gaming-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {weaponData.weapon === "Life Staff" ? <Heart className="h-5 w-5 text-green-400" /> : <Zap className="h-5 w-5 text-purple-400" />}
                  {weaponData.weapon} Abilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weaponData.abilities.map((ability) => (
                    <div key={ability.name} className="p-3 rounded-lg bg-gaming-surface">
                      <h4 className="font-semibold text-sm text-foreground mb-1">{ability.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{ability.description}</p>
                      <div className="space-y-1">
                        {ability.tips.map((tip, index) => (
                          <p key={index} className="text-xs text-primary">• {tip}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Positioning */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Positioning & Survival
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Core Positioning Rules</h3>
                <ul className="space-y-3">
                  {positioningTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4">Survival Tactics</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gaming-surface border border-gaming-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1">When Focused</h4>
                    <p className="text-xs text-muted-foreground">Use dodge rolls, Sacred Ground self-heal, and call for peels from teammates.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gaming-surface border border-gaming-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1">Managing Cooldowns</h4>
                    <p className="text-xs text-muted-foreground">Rotate abilities efficiently. Always keep one escape or heal ready.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gaming-surface border border-gaming-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1">Mana Management</h4>
                    <p className="text-xs text-muted-foreground">Use potions during lulls. Void Gauntlet abilities help with mana sustain.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map-Specific Strategies */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Map-Specific Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mapStrategies.map((strategy, index) => (
                <div key={index} className="p-4 rounded-lg bg-gaming-surface border border-gaming-border">
                  <h3 className="font-semibold text-foreground mb-2">{strategy.area}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{strategy.strategy}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Tips */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Advanced Healing Techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Predictive Healing</h3>
                <p className="text-sm text-muted-foreground">Anticipate damage and pre-heal before engagements. Watch enemy cooldowns and positioning.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Communication</h3>
                <p className="text-sm text-muted-foreground">Call out enemy positions, coordinate with other healers, and request peels when focused.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Resource Management</h3>
                <p className="text-sm text-muted-foreground">Balance mana usage between big heals and sustain. Use consumables strategically.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center py-12 border-t border-gaming-border">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Master OPR Healing</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to put these techniques into practice? Check out optimized healer builds 
            and continue learning with our other specialized guides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero">
              <Link to="/builds">View Healer Builds</Link>
            </Button>
            <Button asChild variant="gaming">
              <Link to="/guides/pvp">PvP Combat Guide</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/calculator">Optimize Gear Load</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OPRHealingGuide;