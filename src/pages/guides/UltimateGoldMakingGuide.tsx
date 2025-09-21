// NW Builds ??? UltimateGoldMakingGuide UPDATED WITH CONTENT (2025-09-19)

import Layout from '@/components/Layout';
import { siteUrl } from '@/config/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  Hammer,
  Pickaxe,
  ShoppingCart,
  Clock,
  ExternalLink,
  Calculator,
  Crown,
  AlertTriangle
} from 'lucide-react';

const UltimateGoldMakingGuide = () => {
  const toc = [
    { id: 'main-rule', title: 'The Main Rule', icon: Coins },
    { id: 'refining', title: 'Refining: First Profits', icon: Hammer },
    { id: 'runeglass', title: 'Crafting Runeglasses', icon: TrendingUp },
    { id: 'trophies', title: 'Crafting Trophies', icon: Crown },
    { id: 'matrix', title: 'Matrixes: Side Income', icon: Calculator },
    { id: 'high-tier', title: 'High-Tier Armor (Endgame)', icon: ShoppingCart },
    { id: 'flipping', title: 'Flipping Items', icon: TrendingUp },
    { id: 'final-thoughts', title: 'Final Thoughts', icon: Coins },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const pageUrl = `${siteUrl}/guides/ultimate-gold-making-guide`;

  return (
    <Layout
      title="How to Make Millions of Gold in New World: Step-by-Step Guide (2025)"
      description="Repeatable, consistent strategies to grow wealth in Aeternum: refining, runeglasses, trophies, matrixes, high-tier armor, and flipping."
      canonical="/guides/new-world-ultimate-gold-making-guide"
      type="article"
      keywords={["New World gold", "Aeternum economy", "New World market", "Gold making guide"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Ultimate Gold Making Guide",
        description: "Learn profitable gold making strategies, trading post tactics, and crafting rotations for New World Aeternum.",
        datePublished: "2025-05-12",
        dateModified: "2025-09-19",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl
        },
        author: {
          "@type": "Person",
          name: "LLangi"
        },
        publisher: {
          "@type": "Organization",
          name: "NW-Builds by LLangi",
          url: siteUrl
        }
      }}
    ><div className="container px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: September 19, 2025</span>
            <span>•</span>
            <span>Reading time: ~7 min</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            How to Make Millions of Gold in New World
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            I made tens of millions of gold in New World, and I didn't buy gold, cheat, or flip one crazy item.
            These are <strong>repeatable, consistent strategies that any player can use</strong>. In this guide,
            I'll show you exactly how I did it and how you can start your gold-making journey today.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="default">Gold Making</Badge>
            <Badge variant="secondary">2025</Badge>
            <Badge variant="outline">Economy</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar TOC */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">On this page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {toc.map(item => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => scrollTo(item.id)}
                  >
                    <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{item.title}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Calculators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calculator className="mr-2 h-4 w-4" />
                  Profit Calculators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tools/new-world-runeglass">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Runeglass Calculator
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tools/new-world-trophies">
                    <Crown className="mr-2 h-4 w-4" />
                    Trophy Calculator
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tools/new-world-matrix">
                    <Calculator className="mr-2 h-4 w-4" />
                    Matrix Calculator
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Risk / Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Risk & Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Don't overexpose: keep ~30% liquid for quick opportunities.</li>
                  <li>Never risk more than 20% of capital on one trade.</li>
                  <li>Track taxes and fees in every profit calc.</li>
                </ul>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-10">
            {/* Video Callout */}
            <Card>
              <CardContent className="prose prose-invert max-w-none space-y-4 p-6">
                <div className="border-l-4 border-primary bg-muted/30 p-4 rounded">
                  <p>How I Made 50M+ Gold in New World Aeternum (Step by Step Guide)</p>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/bW6msTLkROU"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>

            {/* Main Rule */}
            <section id="main-rule">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Coins className="mr-3 h-6 w-6" />
                    The Main Rule: Make Your Gold Work for You
                  </CardTitle>
                  <CardDescription>Linear gathering is fine, but compounding comes from investing.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>The single most important principle for scaling your gold in New World is:</p>
                  <p><strong>You make gold from gold.</strong></p>
                  <p>
                    While gathering is a good starting point, it only produces linear growth. To scale your wealth
                    exponentially, you need to <strong>invest your gold strategically</strong>.
                  </p>

                  <h4 className="text-lg font-semibold">Getting Started: Your Initial Capital</h4>
                  <p>
                    To begin, you'll need <strong>20,000/30,000 gold</strong>. You can gather this within a couple of days
                    through daily expeditions and basic gathering. Once you have this seed capital, you can start using
                    the methods below to multiply your gold.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Refining */}
            <section id="refining">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Hammer className="mr-3 h-6 w-6" />
                    Refining: The First Step to Profit
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    Refining is the perfect entry point because it requires minimal capital and is easy to scale.
                    To maximize profits, make sure you have:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Weaver's Fen Fort</strong></li>
                    <li><strong>Full refining bonus set</strong></li>
                  </ul>
                  <p>
                    Without these, profit margins are slim. I've created a <strong>tool to identify the most profitable
                    refined materials</strong> at any time, ensuring your refining efforts generate the highest returns.
                    You can find this tool in my Discord server.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Runeglass */}
            <section id="runeglass">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6" />
                    Crafting Runeglasses
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>After you've grown your capital to around 100k+ gold, crafting runeglasses is a strong next step. To do this:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Level <strong>Weaponsmithing</strong> and <strong>Stonecutting</strong> to 180</li>
                    <li>Use my <strong>runeglass cost calculator tool</strong> to determine the most profitable items to craft on your server</li>
                  </ul>
                  <p className="border-l-4 border-primary bg-muted/30 p-3 rounded">
                    You can find the runeglass tool here:{' '}
                    <a href="https://www.nw-builds.com/new-world-runeglass" className="underline hover:no-underline" target="_blank" rel="noreferrer">
                      https://www.nw-builds.com/new-world-runeglass
                    </a>
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Trophies */}
            <section id="trophies">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Crown className="mr-3 h-6 w-6" />
                    Crafting Trophies
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    Trophies are in high demand, especially among new players. Combat trophies, in particular, sell well
                    for raids like <strong>Gorgon</strong>.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>High-demand items: Basic combat trophies (e.g., Angry Earth Trophy)</li>
                  </ul>
                  <p className="border-l-4 border-primary bg-muted/30 p-3 rounded">
                    Trophy profitability tool:{' '}
                    <a href="https://www.nw-builds.com/new-world-trophy" className="underline hover:no-underline" target="_blank" rel="noreferrer">
                      https://www.nw-builds.com/new-world-trophy
                    </a>
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Matrixes */}
            <section id="matrix">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Calculator className="mr-3 h-6 w-6" />
                    Matrixes: Side Income
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>Matrixes can be profitable, but they're limited due to material constraints:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Requires <strong>250 in certain trade skills</strong></li>
                    <li><strong>Gypsum Orbs cannot be purchased</strong>, limiting production</li>
                  </ul>
                  <p>
                    I recommend crafting matrixes <strong>only on the side</strong> when you have excess gypsum.
                    My <strong>matrix crafting tool</strong> helps track profitability and optimal crafting times.
                  </p>
                  <p className="border-l-4 border-primary bg-muted/30 p-3 rounded">
                    Matrix tool:{' '}
                    <a href="https://www.nw-builds.com/new-world-matrix" className="underline hover:no-underline" target="_blank" rel="noreferrer">
                      https://www.nw-builds.com/new-world-matrix
                    </a>
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* High-Tier Armor */}
            <section id="high-tier">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <ShoppingCart className="mr-3 h-6 w-6" />
                    Crafting High-Tier Armor: The Endgame
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>This is where real gold-making happens, crafting <strong>725 GS armor with Enchanted Ward</strong>.</p>
                  <h4 className="text-lg font-semibold">Requirements</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>High working capital:</strong> 6k/20k gold per item</li>
                    <li>Learn <strong>Gorgonite schematics</strong> for the items you want to craft</li>
                    <li>Use <strong>full Armoring set</strong>, earring with armoring buff, armoring town buff, 3 major armoring trophies</li>
                    <li><strong>MD Fort</strong> allows the use of lower-tier materials</li>
                  </ul>
                  <h4 className="text-lg font-semibold">Tips for success</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Focus on armor pieces; avoid weapons or jewelry for maximum profit</li>
                    <li>Craft in small batches to mitigate risk</li>
                    <li>Gradually replace stock as items sell</li>
                  </ul>
                  <p>This method is slow but highly profitable for dedicated crafters.</p>
                </CardContent>
              </Card>
            </section>

            {/* Flipping */}
            <section id="flipping">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6" />
                    Flipping Items: Advanced Gold-Making
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    Flipping requires deep market knowledge. As a crafter, you know which setups are valuable.
                    Buy underpriced items and resell for large profits.
                  </p>
                  <h4 className="text-lg font-semibold">Example</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      Light &amp; Medium head/hands with <strong>Enchanted Ward, Freedom, Slash/Strike Conditioning</strong> perks
                    </li>
                    <li>Purchase price: 10/30k gold</li>
                    <li>Market value: 100k+ gold</li>
                  </ul>
                  <p className="border-l-4 border-primary bg-muted/30 p-3 rounded">
                    For beginners, I offer a <strong>Price Check channel in my Discord server</strong>. Post a screenshot,
                    and I'll provide an average market price. You can also ask during Twitch streams.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Final Thoughts */}
            <section id="final-thoughts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Coins className="mr-3 h-6 w-6" />
                    Final Thoughts: From Broke to Multi-Millionaire
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    Following these methods, I went from broke to a multi-millionaire in New World. The key is{' '}
                    <em>consistency, strategic investment, and making your gold work for you</em>.
                  </p>
                  <p>
                    For more tips, check out my guides on <em>New World economy, PvP strategies, and raid tactics</em>:
                    everything you need to thrive in Aeternum.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Footer CTA */}
            <Card className="bg-gradient-mystical">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Start Your Gold Empire Today</h3>
                <p className="text-foreground/80">Use our tools to maximize profits and track progress.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <Link to="/tools/new-world-runeglass">
                      <Calculator className="mr-2 h-4 w-4" />
                      Profit Calculators
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/new-world-builds">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      S9 Builds
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/tools/new-world-armor-weight-calculator">
                      <Pickaxe className="mr-2 h-4 w-4" />
                      Armor Weight Calculator
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default UltimateGoldMakingGuide;





