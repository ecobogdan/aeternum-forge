import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Swords, Shield, Zap, Users, Target, AlertTriangle } from "lucide-react";

const PvPGuide = () => {
  const buildArchetypes = [
    {
      name: "Bruiser",
      weapons: "Great Axe + War Hammer",
      role: "Melee DPS",
      strengths: "High damage, crowd control, gap closing",
      weaknesses: "Vulnerable to kiting, limited range"
    },
    {
      name: "Assassin", 
      weapons: "Bow + Spear",
      role: "Ranged DPS",
      strengths: "High burst, mobility, range advantage",
      weaknesses: "Low survivability, skill dependent"
    },
    {
      name: "Mage",
      weapons: "Fire Staff + Ice Gauntlet", 
      role: "Magical DPS",
      strengths: "AOE damage, crowd control, burst potential",
      weaknesses: "Mana management, positioning crucial"
    },
    {
      name: "Healer",
      weapons: "Life Staff + Void Gauntlet",
      role: "Support",
      strengths: "Group sustainability, damage mitigation", 
      weaknesses: "Low solo damage, priority target"
    },
    {
      name: "Tank",
      weapons: "Sword + Shield",
      role: "Frontline",
      strengths: "High survivability, crowd control",
      weaknesses: "Low damage output, mobility limited"
    }
  ];

  const pvpModes = [
    {
      name: "Open World PvP",
      description: "Flag up for spontaneous encounters while questing and gathering",
      tips: [
        "Stay aware of surroundings and escape routes",
        "Travel in groups when possible",
        "Keep consumables stocked for emergency healing",
        "Know when to disengage from unfavorable fights"
      ]
    },
    {
      name: "Outpost Rush (OPR)",
      description: "20v20 structured PvP with objectives and siege mechanics",
      tips: [
        "Focus objectives over kills - capture outposts and gather materials",
        "Coordinate with team for baron and brute spawns",
        "Use siege weapons effectively against fortified positions",
        "Communicate enemy movements and coordinate pushes"
      ]
    },
    {
      name: "Wars",
      description: "50v50 company territory battles with siege warfare",
      tips: [
        "Follow shot-caller instructions precisely",
        "Understand your role: siege crew, backline, frontline",
        "Focus fire priority targets called by leadership",
        "Maintain formation and avoid overextending"
      ]
    }
  ];

  const combatFundamentals = [
    {
      title: "Animation Canceling",
      description: "Cancel attack animations with dodge or block to increase DPS and mobility"
    },
    {
      title: "Stamina Management", 
      description: "Balance offense and defense - save stamina for crucial dodges or blocks"
    },
    {
      title: "Weapon Swapping",
      description: "Master quick weapon swaps to chain abilities and adapt to situations"
    },
    {
      title: "Positioning",
      description: "Control engagement distance and use terrain to your advantage"
    },
    {
      title: "Cooldown Tracking",
      description: "Track enemy cooldowns to engage when they're vulnerable"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">PvP Combat Guide</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Master the art of player vs player combat in New World: Aeternum. 
            Learn advanced strategies, build optimization, and tactical approaches for every PvP scenario.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="destructive">Advanced Guide</Badge>
            <Badge variant="outline">Season 9 Meta</Badge>
          </div>
        </div>

        {/* Combat Fundamentals */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Combat Fundamentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combatFundamentals.map((fundamental) => (
                <div key={fundamental.title} className="p-4 rounded-lg bg-gaming-surface border border-gaming-border">
                  <h3 className="font-semibold text-foreground mb-2">{fundamental.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{fundamental.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Build Archetypes */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              PvP Build Archetypes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {buildArchetypes.map((build) => (
                <div key={build.name} className="p-4 rounded-lg bg-gaming-surface border border-gaming-border">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{build.name}</h3>
                        <Badge variant="secondary" className="text-xs">{build.role}</Badge>
                      </div>
                      <p className="text-sm text-primary mb-2">{build.weapons}</p>
                    </div>
                    <div className="flex-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Strengths:</p>
                        <p className="text-sm text-green-400">{build.strengths}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Weaknesses:</p>
                        <p className="text-sm text-red-400">{build.weaknesses}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PvP Game Modes */}
        <div className="space-y-8 mb-12">
          {pvpModes.map((mode, index) => (
            <Card key={mode.name} className="gradient-card border-gaming-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {index === 0 && <Swords className="h-5 w-5 text-primary" />}
                    {index === 1 && <Users className="h-5 w-5 text-primary" />}
                    {index === 2 && <AlertTriangle className="h-5 w-5 text-primary" />}
                  </div>
                  {mode.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">{mode.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mode.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="flex items-start gap-3 p-3 rounded-lg bg-gaming-surface">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                        {tipIndex + 1}
                      </div>
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Tips */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Advanced PvP Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Psychological Warfare</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <p className="text-sm text-muted-foreground">Bait enemy cooldowns before committing to fights</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <p className="text-sm text-muted-foreground">Use terrain and line of sight to control engagements</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <p className="text-sm text-muted-foreground">Force enemies into unfavorable positions</p>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Tactical Awareness</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <p className="text-sm text-muted-foreground">Monitor enemy health and mana bars constantly</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <p className="text-sm text-muted-foreground">Know when to disengage and reset positioning</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <p className="text-sm text-muted-foreground">Coordinate with teammates for focus fire</p>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center py-12 border-t border-gaming-border">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Ready to Dominate PvP?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Put these strategies into practice with optimized builds and continue improving 
            with our specialized guides and calculators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero">
              <Link to="/builds">View PvP Builds</Link>
            </Button>
            <Button asChild variant="gaming">
              <Link to="/guides/opr-healing">OPR Healing Guide</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/calculator">Optimize Armor Weight</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PvPGuide;