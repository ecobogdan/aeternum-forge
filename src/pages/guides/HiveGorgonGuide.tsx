import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Skull, Shield, Zap, Users, Clock, AlertTriangle } from "lucide-react";

const HiveGorgonGuide = () => {
  const phases = [
    {
      phase: 1,
      name: "Entry & Trash Clearing",
      duration: "10-15 minutes",
      description: "Navigate through the hive, clearing trash mobs and mini-bosses",
      mechanics: [
        "Coordinated pulls to avoid overwhelming spawns",
        "Resource management for the main encounter", 
        "Positioning for optimal DPS and safety"
      ],
      tips: [
        "Save consumables and cooldowns for Gorgon fight",
        "Assign roles: tank, healer, DPS priorities",
        "Clear all paths to avoid adds during boss fight"
      ]
    },
    {
      phase: 2,
      name: "Gorgon Encounter - Phase 1",
      duration: "5-8 minutes",
      description: "Initial phase with basic attack patterns and mechanics",
      mechanics: [
        "Petrification gaze - avoid looking directly at Gorgon",
        "Poison pools - stay mobile and avoid green areas",
        "Tentacle slams - dodge telegraphed ground attacks"
      ],
      tips: [
        "Tank maintains aggro while facing away from team",
        "DPS focuses on consistent damage, avoid burst windows",
        "Healer stays at maximum range for safety"
      ]
    },
    {
      phase: 3,
      name: "Gorgon Encounter - Phase 2", 
      duration: "8-12 minutes",
      description: "Advanced mechanics with adds and environmental hazards",
      mechanics: [
        "Spawn waves of serpent adds every 60 seconds",
        "Poison mist covers increasing area of arena",
        "Enrage mechanic after 15 minutes total fight time"
      ],
      tips: [
        "Prioritize add clearing immediately when they spawn",
        "Use arena edges to avoid expanding poison zones",
        "Coordinate burst damage windows between add waves"
      ]
    }
  ];

  const roleStrategies = [
    {
      role: "Tank",
      icon: Shield,
      color: "text-blue-400",
      responsibilities: [
        "Maintain Gorgon aggro while facing away from team",
        "Position boss away from poison pools and safe zones",
        "Taunt serpent adds immediately when they spawn",
        "Communicate positioning changes to team"
      ],
      gearTips: [
        "High constitution build with threat generation gems",
        "Poison resistance potions and food buffs",
        "Sword/Shield or Great Axe/War Hammer builds work well"
      ]
    },
    {
      role: "Healer",
      icon: Users,
      color: "text-green-400", 
      responsibilities: [
        "Maintain maximum range while keeping team in heal range",
        "Prioritize tank health during add phases",
        "Cleanse poison debuffs when possible",
        "Call out dangerous positioning to team"
      ],
      gearTips: [
        "Life Staff + Void Gauntlet for mana sustain",
        "Focus on area heals over single target",
        "Corruption resistance and mana potions essential"
      ]
    },
    {
      role: "DPS",
      icon: Zap,
      color: "text-red-400",
      responsibilities: [
        "Consistent damage on Gorgon between mechanics",
        "Immediate add clearing when serpents spawn",
        "Avoid petrification gaze and poison zones",
        "Coordinate burst windows with team"
      ],
      gearTips: [
        "Ranged builds preferred for safety and mobility",
        "Fire/Ice mage or Bow/Spear builds excel here",
        "Corruption resistance coatings and potions"
      ]
    }
  ];

  const importantMechanics = [
    {
      name: "Petrification Gaze",
      severity: "Critical",
      description: "Direct eye contact with Gorgon causes instant death",
      counter: "Always face away from Gorgon, use peripheral vision for positioning"
    },
    {
      name: "Poison Pools",
      severity: "High", 
      description: "Green areas deal increasing damage over time",
      counter: "Maintain mobility, use ranged attacks when possible"
    },
    {
      name: "Serpent Adds",
      severity: "High",
      description: "Spawn every 60 seconds in phase 2, overwhelming if ignored",
      counter: "Immediate focus fire, tank must taunt quickly"
    },
    {
      name: "Enrage Timer", 
      severity: "Critical",
      description: "15-minute hard limit before Gorgon becomes unbeatable",
      counter: "Optimize DPS rotations, minimize downtime between phases"
    }
  ];

  const lootRewards = [
    "Legendary Gorgon weapons with unique perks",
    "High-tier crafting materials for endgame gear",
    "Exclusive cosmetic items and housing decorations", 
    "Achievement progress for dedicated PvE content"
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skull className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Hive of Gorgon Guide</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Conquer one of New World's most challenging endgame encounters. Master the mechanics, 
            coordinate your team, and claim legendary rewards from the depths of the Hive.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="destructive">Endgame Content</Badge>
            <Badge variant="outline">5-Player Group</Badge>
            <Badge variant="secondary">High Difficulty</Badge>
          </div>
        </div>

        {/* Phase Breakdown */}
        <div className="space-y-8 mb-12">
          {phases.map((phase) => (
            <Card key={phase.phase} className="gradient-card border-gaming-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {phase.phase}
                    </div>
                    {phase.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    {phase.duration}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">{phase.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Key Mechanics</h4>
                    <ul className="space-y-2">
                      {phase.mechanics.map((mechanic, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2"></div>
                          <p className="text-sm text-muted-foreground">{mechanic}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Strategy Tips</h4>
                    <ul className="space-y-2">
                      {phase.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                          <p className="text-sm text-muted-foreground">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Strategies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {roleStrategies.map((roleData) => (
            <Card key={roleData.role} className="gradient-card border-gaming-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <roleData.icon className={`h-5 w-5 ${roleData.color}`} />
                  {roleData.role} Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Responsibilities</h4>
                  <ul className="space-y-2">
                    {roleData.responsibilities.map((responsibility, index) => (
                      <li key={index} className="text-xs text-muted-foreground leading-relaxed">
                        • {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Gear & Build Tips</h4>
                  <ul className="space-y-2">
                    {roleData.gearTips.map((tip, index) => (
                      <li key={index} className="text-xs text-muted-foreground leading-relaxed">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Critical Mechanics */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Critical Mechanics & Counters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importantMechanics.map((mechanic) => (
                <div key={mechanic.name} className="p-4 rounded-lg bg-gaming-surface border-l-4 border-red-400">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{mechanic.name}</h3>
                    <Badge 
                      variant={mechanic.severity === "Critical" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {mechanic.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{mechanic.description}</p>
                  <p className="text-sm text-primary leading-relaxed">
                    <strong>Counter:</strong> {mechanic.counter}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-primary" />
              Loot & Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lootRewards.map((reward, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gaming-surface">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{reward}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center py-12 border-t border-gaming-border">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Ready to Face the Gorgon?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Prepare your team with optimized builds and gear. Practice the mechanics 
            and coordinate your strategy before entering the Hive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero">
              <Link to="/builds">View PvE Builds</Link>
            </Button>
            <Button asChild variant="gaming">
              <Link to="/guides/new-player">New Player Guide</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/calculator">Optimize Your Gear</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HiveGorgonGuide;