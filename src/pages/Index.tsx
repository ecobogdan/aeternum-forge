import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout/Layout";
import heroBg from "@/assets/hero-bg.jpg";
import { Swords, Calculator, BookOpen, Coins, Shield, Target } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Swords,
      title: "Season 9 Builds",
      description: "Optimized character builds for the latest season with detailed breakdowns and embed views.",
      href: "/builds",
      color: "text-red-400"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Guides", 
      description: "Expert guides covering PvP tactics, healing strategies, and dungeon mechanics.",
      href: "/guides/new-player",
      color: "text-blue-400"
    },
    {
      icon: Calculator,
      title: "Armor Calculator",
      description: "Calculate your exact load thresholds and optimize your equipment weight distribution.",
      href: "/calculator",
      color: "text-green-400"
    },
    {
      icon: Coins,
      title: "Gold Making Tools",
      description: "Profit calculators for Runglass, Trophies, and trading to maximize your gold income.",
      href: "/tools/runglass",
      color: "text-yellow-400"
    },
    {
      icon: Shield,
      title: "PvP Strategies",
      description: "Advanced PvP tactics and build optimizations for Outpost Rush and Wars.",
      href: "/guides/pvp",
      color: "text-purple-400"
    },
    {
      icon: Target,
      title: "Endgame Content",
      description: "Master the Hive of Gorgon and other challenging endgame encounters.",
      href: "/guides/hive-gorgon",
      color: "text-orange-400"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Master
            <span className="gradient-primary bg-clip-text text-transparent"> Aeternum</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
            Your ultimate companion for New World: Aeternum. Expert builds, comprehensive guides, 
            and powerful calculators to dominate every aspect of the game.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/builds">View S9 Builds</Link>
            </Button>
            <Button asChild variant="gaming" size="xl">
              <Link to="/guides/new-player">Start Learning</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From beginner guides to advanced strategies, we've got every tool and resource 
              to help you become a legendary adventurer in Aeternum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="gradient-card border-gaming-border hover:shadow-gold transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-lg bg-gaming-surface flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-center leading-relaxed">
                    {feature.description}
                  </p>
                  <Button asChild variant="gold" className="w-full">
                    <Link to={feature.href}>Explore</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-20 px-4 bg-gaming-bg">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8 text-foreground">Stay Updated</h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            New World: Aeternum is constantly evolving. Follow our content for the latest 
            build optimizations, patch analysis, and meta shifts.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Optimized Builds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">25+</div>
              <div className="text-muted-foreground">Detailed Guides</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
          </div>

          <Button asChild variant="hero" size="xl">
            <Link to="/builds">Start Your Journey</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;