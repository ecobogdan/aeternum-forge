import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, MapPin, Sword, Users, Coins, Target } from "lucide-react";

const NewPlayerGuide = () => {
  const sections = [
    {
      id: "getting-started",
      title: "Getting Started in Aeternum",
      icon: MapPin,
      content: [
        "Choose your starting beach carefully - each provides different early game advantages",
        "Focus on gathering basic resources (wood, stone, fibers) to level up your gathering skills",
        "Complete the main story quest to unlock key features and fast travel points",
        "Join a company early for support and group activities"
      ]
    },
    {
      id: "character-build",
      title: "Building Your Character",
      icon: Sword,
      content: [
        "Experiment with different weapon combinations to find your playstyle",
        "Allocate attribute points based on your preferred weapons (STR, DEX, INT, FOC, CON)",
        "Don't worry about mistakes - you can respec attributes and weapon masteries",
        "Focus on 2-3 weapons maximum to efficiently spend weapon mastery points"
      ]
    },
    {
      id: "crafting-trading",
      title: "Crafting & Trading",
      icon: Coins,
      content: [
        "Level gathering skills first (Mining, Logging, Harvesting, Skinning, Fishing)",
        "Choose 2-3 crafting skills to focus on rather than spreading thin",
        "Use the Trading Post to buy materials you need and sell excess resources",
        "Set up buy orders for commonly needed materials at good prices"
      ]
    },
    {
      id: "pvp-preparation",
      title: "PvP Preparation",
      icon: Target,
      content: [
        "Enable PvP for bonus XP and faction tokens, but be prepared for combat",
        "Learn weapon combos and animation canceling in practice areas",
        "Understand different build archetypes: DPS, Tank, Healer, Hybrid",
        "Practice dodge timing and positioning - movement is crucial in New World PvP"
      ]
    },
    {
      id: "group-content",
      title: "Group Activities",
      icon: Users,
      content: [
        "Join expeditions (dungeons) for guaranteed gear upgrades and experience",
        "Participate in Outpost Rush (OPR) at level 60 for PvP practice and rewards",
        "Contribute to Wars and Invasions when your company participates",
        "Form groups for elite areas and world bosses for better loot chances"
      ]
    }
  ];

  const quickTips = [
    "Always carry food for health regeneration",
    "Bank items frequently to avoid losing them on death",
    "Join global and recruitment chat channels for company invites",
    "Use fast travel shrines to move around the map efficiently",
    "Save azoth by traveling with lighter equipment loads"
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">New Player Guide</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Essential knowledge for new adventurers entering the world of Aeternum. 
            Master the fundamentals to accelerate your progress and avoid common pitfalls.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary">Updated for Season 9</Badge>
            <Badge variant="outline">Beginner Friendly</Badge>
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="gradient-card border-gaming-border mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Essential Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gaming-surface">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.id} className="gradient-card border-gaming-border" id={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                      <p className="text-muted-foreground leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table of Contents - Floating */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden xl:block">
          <Card className="w-64 gradient-card border-gaming-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-xs text-muted-foreground hover:text-primary transition-colors py-1"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 py-12 border-t border-gaming-border">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Ready to Dive Deeper?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Now that you understand the basics, explore our specialized guides and tools 
            to master specific aspects of the game.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero">
              <Link to="/builds">Explore S9 Builds</Link>
            </Button>
            <Button asChild variant="gaming">
              <Link to="/guides/pvp">Learn PvP Strategies</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/calculator">Try Armor Calculator</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewPlayerGuide;