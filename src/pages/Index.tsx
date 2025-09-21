import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { siteUrl } from "@/config/seo";
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Swords, Calculator, BookOpen, TrendingUp, Users, Zap } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

const Index = () => {
  const features = [
    {
      icon: Swords,
      title: "S9 Meta Builds",
      description: "Optimized builds for Season 9 with detailed explanations and gear recommendations.",
      link: "/new-world-builds",
      color: "aeternum-blue"
    },
    {
      icon: BookOpen,
      title: "Expert Guides",
      description: "Comprehensive guides covering everything from new player basics to advanced PvE/PvP strategies.",
      link: "/guides/new-world-new-player-guide",
      color: "nature-green"
    },
    {
      icon: Calculator,
      title: "Optimization Tools",
      description: "Calculate armor weights, profit margins, and optimize your gameplay with precision tools.",
      link: "/tools/new-world-armor-weight-calculator",
      color: "gold-primary"
    },
    {
      icon: TrendingUp,
      title: "Gold Making",
      description: "Master the market with detailed crafting calculators and profit optimization tools.",
      link: "/tools/new-world-runeglass",
      color: "corruption-purple"
    }
  ];

  const stats = [
    { label: "Active Builds", value: "100+" },
    { label: "Detailed Guides", value: "10+" },
    { label: "Optimization Tools", value: "4" },
    { label: "Community Members", value: "4k+" }
  ];

  const featuredBuildVideoUrl = "https://www.youtube.com/embed/v_20005p8aY?si=4md5D9qviF4Bfbpz";

  return (
    <Layout
      title="New World Builds, Guides & Tools | NW-Builds by LLangi"
      description="Master New World Aeternum with curated Season 9 builds, actionable guides, and optimization tools from LLangi."
      canonical="/"
      keywords={["New World builds", "New World guides", "Aeternum tools", "LLangi builds", "New World calculators"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "New World Builds, Guides & Tools",
        description: "Master New World Aeternum with curated Season 9 builds, actionable guides, and optimization tools from LLangi.",
        url: siteUrl,
        primaryImageOfPage: `${siteUrl}/og-default.jpg`,
        inLanguage: "en",
        publisher: {
          "@type": "Organization",
          name: "NW-Builds by LLangi",
          url: siteUrl
        }
      }}
    >
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-primary via-gold-primary to-aeternum-blue bg-clip-text text-transparent animate-float">
                Master New World Aeternum
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                The ultimate hub for builds, guides, and optimization tools. 
                Dominate Aeternum with expert strategies and cutting-edge calculators.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-3 glow-effect">
                <Link to="/new-world-builds">
                  <Swords className="mr-2 h-5 w-5" />
                  Explore Builds
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link to="/guides/new-world-new-player-guide">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Start Learning
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From meta builds to profit calculators, we provide the tools and knowledge 
              to help you dominate in New World Aeternum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 cursor-pointer">
                <Link to={feature.link}>
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 rounded-full bg-gradient-gold mb-4 group-hover:animate-glow">
                      <feature.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Content Section */}
      <section className="py-24">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Latest Content
            </h2>
            <p className="text-xl text-muted-foreground">
              Stay up-to-date with the newest updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured Build */}
            <Card className="md:col-span-2 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-gold-primary text-primary-foreground">
                  @LLangiTTV
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Latest YouTube Video</CardTitle>
                <CardDescription>
                  Subscribe to the channel to make sure you don't miss the latest updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="relative w-full overflow-hidden rounded-lg bg-black"
                    style={{ paddingTop: "56.25%" }}
                  >
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={featuredBuildVideoUrl}
                      title="Last Youtube Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Quick Tools
                </CardTitle>
                <CardDescription>
                  Access our most popular calculators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tools/new-world-armor-weight-calculator">
                    <Zap className="mr-2 h-4 w-4" />
                    Armor Weight Calculator
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tools/new-world-runeglass">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Runeglass Profit Calculator
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tools/new-world-trophies">
                    <Users className="mr-2 h-4 w-4" />
                    Trophy Calculator
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-mystical">
        <div className="container px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Dominate Aeternum?
            </h2>
            <p className="text-xl text-foreground/80">
              Join hundreds of players who've improved their gameplay with our expert guides and tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
                <Link to="/new-world-builds">
                  Start with Builds
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 border-foreground/20 text-foreground hover:bg-foreground/10">
                <Link to="/guides/new-world-new-player-guide">
                  Read the Guides
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
