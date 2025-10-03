import Layout from '@/components/Layout';
import { siteUrl } from '@/config/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Sword, 
  Shield, 
  Coins, 
  Map, 
  Users,
  BookOpen,
  Clock,
  ExternalLink,
  BookUp
} from 'lucide-react';

const EndGameGuide = () => {
  const tableOfContents = [
    { id: 'end-game-overview', title: 'End-Game Overview', icon: Star },
    { id: 'expeditions', title: 'Expeditions', icon: Sword },
    { id: 'chest-runs', title: 'Chest Runs', icon: Map },
    { id: 'mutated-expeditions', title: 'Mutated Expeditions', icon: BookUp },
    { id: 'gear-progression', title: 'Gear Progression', icon: Shield },
    { id: 'gathering-crafting', title: 'Gathering & Crafting', icon: Coins },
    { id: 'trading-post', title: 'Trading Post', icon: Users },
    { id: 'housing', title: 'Housing', icon: BookOpen },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const pageUrl = `${siteUrl}/guides/new-world-end-game`;

  return (
    <Layout 
      title="End-Game Guide - New World Builds"
      description="Complete end-game guide for New World Aeternum. Learn how to progress from level 65 to Gorgon raid readiness with expert strategies and tips."
      canonical="/guides/new-world-end-game"
      type="article"
      keywords={["New World end game", "New World gorgon raid", "New World level 65", "Aeternum end game guide"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Complete End-Game Guide for New World Aeternum",
        description: "Comprehensive end-game guide covering expeditions, chest runs, mutated expeditions, and progression to Gorgon raid readiness.",
        datePublished: "2025-01-15",
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
        },
        image: [`${siteUrl}/og-default.jpg`]
      }}
    >
      <div className="container px-4 py-8 space-y-8">

        {/* Twitch Badge */}
        <div className="flex justify-center">
          <a
            href="https://www.twitch.tv/llangi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-purple-600/90 text-white text-sm font-medium shadow-lg hover:bg-purple-700 transition text-center"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 2L2 6v14h6v2h4l2-2h4l4-4V2H4zm16 12l-2 2h-4l-2 2H8v-2H4V4h16v10z" />
            </svg>
            <span className="leading-none">Question? Watch me Live on Twitch!</span>
          </a>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: September 19, 2025</span>
            <span>•</span>
            <span>Reading time: ~12 min</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            End-Game Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know to progress from level 65 to Gorgon raid readiness. 
            Master expeditions, chest runs, and gear progression with expert strategies.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="default">Level 65+</Badge>
            <Badge variant="secondary">Gorgon Ready</Badge>
            <Badge variant="outline">Expert Guide</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tableOfContents.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => scrollToSection(item.id)}
                  >
                    <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{item.title}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* End-Game Video */}
            <Card>
              <CardContent className="prose prose-invert max-w-none space-y-4 p-6">
                <div className="border-l-4 border-primary bg-muted/30 p-4 rounded">
                  <p>The REAL Endgame Starts Here – New World Aeternum Ultimate New Player Guide (2025)</p>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/MofT5Q_ck9U?si=D2fXMqJ3PJbjzl1-"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
            {/* End-Game Overview */}
            <section id="end-game-overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Star className="mr-3 h-6 w-6" />
                    End-Game Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    <span className="font-medium text-nature-green mb-1 block">Reached Level 65</span>
                    <span className="font-medium text-nature-green mb-1 block">Completed the Main Story Quest (MSQ)</span>
                    And now you're wondering... What do I do next!?
                    <br></br><br></br>
                    New World's PvE content isn't very difficult, but there's still a lot to do. Your main PvE goal is to become strong enough to complete the Hive of the Gorgon raid. This raid is the primary source of 725 Gear Score (GS) items in the game.
                    <br></br><br></br>
                    However, you can't just jump into the raid the moment you hit 65, you need to improve your character and become Gorgon-ready!
                  </p>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <span className="font-semibold mb-2 text-primary block text-base">Your End-Game Journey:</span>
                    <p className="text-sm">
                      Focus on expeditions → chest runs → mutated expeditions → Gorgon raid. 
                      Each step builds upon the previous, preparing you for the ultimate PvE challenge.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Expeditions */}
            <section id="expeditions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Sword className="mr-3 h-6 w-6" />
                    Expeditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    These are entry-level instanced PvE activities. While they won't drop raid-ready gear, 
                    they're essential to progress toward mutated expeditions, which can drop up to 700 GS items.
                  </p>

                  <h4 className="text-lg font-semibold text-primary">How to Queue:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Press <strong>K</strong> to open the Activity Finder</li>
                    <li>Select <strong>Activity Finder</strong> from the top menu</li>
                    <li>Choose your desired expedition or select <strong>Random Expedition</strong></li>
                  </ul>

                  <h4 className="text-lg font-semibold text-primary">Gold Rewards:</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li><strong>Random Expedition:</strong> 750 Gold for the first three completions per day</li>
                      <li><strong>Tank/Healer Bonus:</strong> Additional 250 Gold when queuing as Tank or Healer</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <span className="font-semibold mb-2 text-primary block text-base">Pro Tip:</span>
                    <p className="text-sm">
                      Always queue as Tank or Healer when possible for the bonus gold. 
                      These roles are often in high demand and will help you earn more gold faster.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Chest Runs */}
            <section id="chest-runs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Map className="mr-3 h-6 w-6" />
                    Chest Runs
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    You should start doing chest runs alongside expeditions. These take place in elite open-world zones, 
                    where you'll find hundreds of elite chests that can drop somewhat usable gear.
                  </p>

                  <h4 className="text-lg font-semibold text-primary">How to Join:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Monitor the <strong>Recruitment Chat</strong></li>
                    <li>Look for calls like <strong>"+myrk"</strong> (EU) or <strong>"x myrk"</strong> (NA) for Myrkgard runs</li>
                    <li>Once invited to a raid group, check the map for the location</li>
                    <li>Teleport to the nearest shrine and run with your group</li>
                    <li>Kill mobs and loot chests together</li>
                  </ul>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <span className="font-semibold mb-2 text-primary block text-base">Pro Tip:</span>
                    <p className="text-sm">
                      Use a different weapon every time you join a chest run to easily level all your weapons to 20. 
                      This is an efficient way to master multiple weapon types while earning gear.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Mutated Expeditions */}
            <section id="mutated-expeditions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <BookUp className="mr-3 h-6 w-6" />
                    Mutated Expeditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    You unlock mutated expeditions after completing their normal versions. Mutations drop higher GS gear 
                    and also have a chance to drop unique artifacts, which only drop from mutated versions and change weekly.
                  </p>

                  <h4 className="text-lg font-semibold text-primary">Artifact Collection:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Try to collect all artifacts during a given mutation week</li>
                    <li>There is bad luck protection - you will get the artifact at the 5th try in the worst case scenario</li>
                    <li>Artifacts are essential for many end-game builds</li>
                  </ul>

                  <h4 className="text-lg font-semibold text-primary">Gold Rewards:</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li><strong>Random Mutation:</strong> 1,000 Gold for completing two random mutation runs per day</li>
                      <li><strong>Tank/Healer Bonus:</strong> Additional 500 Gold when queuing as Tank or Healer</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <span className="font-semibold mb-2 text-primary block text-base">Strategy:</span>
                    <p className="text-sm">
                      Focus on the current week's mutations to maximize your artifact collection. 
                      Check which artifacts are available and prioritize those expeditions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Gear Progression */}
            <section id="gear-progression">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Shield className="mr-3 h-6 w-6" />
                    Gear Progression
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <h4 className="text-lg font-semibold text-primary">What to Look for in Items:</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">
                      You'll find Gorgon builds and other guides on this website. Pick any beginner Gorgon build and start hunting for gear that fits it. 
                      One universal perk to prioritize is <strong>Enchanted Ward</strong>, which reduces incoming PvE damage from all mobs. 
                      This is the most important perk in PvE.
                    </p>
                    <br></br><br></br>
                    <p className="text-sm">
                      There's no hard GS requirement for the Gorgon raid, but the higher, the better. Higher GS increases both attributes and perk strength. 
                      However, <strong>perks over GS</strong> in most cases.
                    </p>
                    <br></br><br></br>
                    <p className="text-sm">
                      Many builds also require specific artifacts. You can find drop locations and sources for all artifacts on nwdb.info.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Gathering & Crafting */}
            <section id="gathering-crafting">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Coins className="mr-3 h-6 w-6" />
                    Gathering & Crafting
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <span className="font-medium text-nature-green mb-1 block text-base">Gathering</span>
                    <p className="text-sm">
                      You'll need gold to support your progression. Gathering is one of the easiest and most consistent ways for new players to earn gold, 
                      especially in combination with daily expedition bonuses. Focus on gathering materials like wood, leather, fibers, and ore to either refine or sell at the Trading Post.
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <span className="font-medium text-nature-green mb-1 block text-base">Crafting / Refining</span>
                    <div className="text-sm space-y-2">
                      <p>
                        New World features one of the best crafting systems in any MMORPG. As a
                        new player, focus on refining rather than crafting gear, which has
                        steeper requirements. While profit margins can be slim, refining can still
                        be lucrative if you spot good opportunities.
                      </p>

                      <p>
                        I've built a tool to help with this, check out the explanation video below:{" "}
                        <a
                          href="https://www.youtube.com/watch?v=gQwuAcDLc7M"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline text-nature-green font-medium"
                        >
                          New World - Refining Tool Explanation
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Trading Post */}
            <section id="trading-post">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Users className="mr-3 h-6 w-6" />
                    Trading Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <span className="font-medium text-nature-green mb-1 block text-base">Smart Shopping</span>
                    <div className="text-sm space-y-2">
                      <p>
                        As you farm gold, complete expeditions, and hunt for artifacts, always keep an eye on the Trading Post. 
                        Filter items by the perks needed for your chosen Gorgon build and look for good deals.
                      </p>

                      <p>
                        Don't overpay. If you want me to check an item's price before buying, come ask me live on{" "}
                        <a
                          href="https://www.twitch.tv/llangi"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline text-nature-green font-medium"
                        >
                          twitch.tv/LLangi 
                        </a>
                        {" "}I'll gladly let you know if it's worth it!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Housing */}
            <section id="housing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <BookOpen className="mr-3 h-6 w-6" />
                    Housing
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <span className="font-medium text-nature-green mb-1 block text-base">Housing Benefits</span>
                    <div className="text-sm space-y-2">
                      <p>Houses in New World are more than just cosmetic, they offer:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Fast travel points</li>
                        <li>Trophy slots (which give powerful buffs)</li>
                        <li>Additional storage space</li>
                      </ul>

                      <p>
                        You can own up to three houses, and your first house comes with a 9,000 Gold
                        discount. There are four house tiers:
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Tier 1: 5,000 Gold</li>
                        <li>Tier 2: 10,000 Gold</li>
                        <li>Tier 3: 15,000 Gold</li>
                        <li>Tier 4: 20,000 Gold</li>
                      </ul>

                      <p>
                        To maximize the discount, don't buy a Tier 1 house first, you'd miss out on
                        4,000 Gold in savings. I recommend buying the Tier 4 house (20k base / 11k discounted)
                        as your first. You'll want one top-tier house in a town with important storage
                        or crafting stations.
                      </p>

                      <p>
                        To maximize storage, buy Golden Steel Storage Chests, you can slot 4 of them
                        in a Tier 4 house. These typically cost around 2.5k/4k Gold, depending on
                        your server.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Related Links */}
            <Card className="bg-gradient-mystical">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Ready for Gorgon Raid?</h3>
                <p className="text-foreground/80">
                  Now that you understand end-game progression, explore our specialized builds and guides.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <Link to="/new-world-builds">
                      <Sword className="mr-2 h-4 w-4" />
                      Gorgon Builds
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/guides/new-world-hive-of-gorgon-guide">
                      <Shield className="mr-2 h-4 w-4" />
                      Gorgon Guide
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/tools/new-world-armor-weight-calculator">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Armor Calculator
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EndGameGuide;
