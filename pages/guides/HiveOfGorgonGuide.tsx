import Layout from '@/components/Layout';
import { siteUrl } from '@/config/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Skull,
  Shield,
  Swords,
  Users,
  Clock,
  ExternalLink,
  Zap,
  Crown,
  Compass
} from 'lucide-react';

const HiveOfGorgonGuide = () => {
  const toc = [
    { id: 'overview', title: 'Overview', icon: Skull },
    { id: 'group-setup', title: 'Recommended Group Setup', icon: Users },
    { id: 'consumables-buffs', title: 'Consumables & Buffs', icon: Zap },
    { id: 'boss-fights', title: 'Boss Fights & Strategy', icon: Crown },
    { id: 'loot-rewards', title: 'Loot & Rewards', icon: Swords },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const pageUrl = `${siteUrl}/guides/hive-of-gorgon-guide`;

  return (
    <Layout
      title="Hive of Gorgons Raid Guide - New World Aeternum"
      description="Master the Hive of Gorgons 10-player raid with group compositions, consumables, and boss strategies for Echidna, Typhon, and Broodmother Medusa."
      canonical="/guides/hive-of-gorgon-guide"
      type="article"
      keywords={["Hive of Gorgons raid", "New World raid guide", "Aeternum Echidna", "Echidna strategy"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Hive of Gorgons Raid Guide",
        description: "Step-by-step Hive of Gorgons raid guide covering preparation, mechanics, and loot tables for New World Aeternum.",
        datePublished: "2025-08-17",
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
          <div className="flex justify-center items-center space-x-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: August 17, 2025</span>
            <span>•</span>
            <span>Reading time: ~7 min</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            Hive of Gorgons Raid Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            New World's first true <strong>10-player raid</strong>, hidden in Cutlass Keys. This guide covers preparation,
            team comps, consumables, and full boss breakdowns so your group clears smoothly.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="default">Raid Guide</Badge>
            <Badge variant="secondary">PvE</Badge>
            <Badge variant="outline">Team Strategy</Badge>
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

            {/* Quick Tips Recap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips Recap</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Gear for <strong>Enchanted Ward + Refreshing</strong>. Socket <strong>Onyx</strong> gems.</li>
                  <li>Swap amulets per boss: <strong>Strike</strong> (Echidna), <strong>Slash</strong> (Typhon), <strong>Nature</strong> (Medusa).</li>
                  <li>Assign dedicated <strong>cleansers</strong> for puzzles & Medusa.</li>
                  <li>Always kill <strong>Corvids &gt; Wolves</strong> before DPSing Typhon unless phasing.</li>
                  <li>Use pillars to survive one-shot mechanics.</li>
                  <li>Save cooldowns for burst windows after stuns or phase transitions.</li>
                </ul>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-10">
            {/* Overview */}
            <section id="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Skull className="mr-3 h-6 w-6" />
                    Dungeon Overview
                  </CardTitle>
                  <CardDescription>What to expect inside the Hive of Gorgons.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    The Hive of Gorgons is a corrupted raid packed with puzzles, waves of Angry Earth,
                    and three powerful bosses: <strong>Echidna</strong>, <strong>Typhon</strong>, and the <strong>Broodmother Medusa</strong>.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <h5 className="font-medium text-primary">Raid Size</h5>
                      <p className="text-sm text-muted-foreground">10 players</p>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-medium text-primary">Party Structure</h5>
                      <p className="text-sm text-muted-foreground">1 Tank • 2 Healers • 7 DPS</p>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-medium text-primary">Focus</h5>
                      <p className="text-sm text-muted-foreground">Mechanics, add control, and positioning</p>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-medium text-primary">Location</h5>
                      <p className="text-sm text-muted-foreground">Cutlass Keys (Corrupted heart)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Group Setup */}
            <section id="group-setup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Users className="mr-3 h-6 w-6" />
                    Recommended Group Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded border-l-4 border-primary">
                    <h5 className="font-medium text-primary mb-2">Tank (1)</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                      <li><strong>Weapons:</strong> Sword & Shield + War Hammer (taunts, stuns, stagger breaks)</li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-4 rounded border-l-4 border-nature-green">
                    <h5 className="font-medium text-nature-green mb-2">Healers (2)</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                      <li>Life Staff / Void Gauntlet</li>
                      <li>Life Staff / Flail</li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-4 rounded border-l-4 border-gold-primary">
                    <h5 className="font-medium text-gold-primary mb-2">DPS (7)</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                      <li>Bleed Rapier</li>
                      <li>Evade Rapier x2</li>
                      <li>Spear / Fire Staff</li>
                      <li>Spear / Sword & Shield</li>
                      <li>Hatchet / Greatsword</li>
                      <li>Blunderbuss / Fire Staff</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-primary bg-muted/30 p-3 rounded">
                    <p className="text-sm text-muted-foreground">
                      Full build details are available in the Gorgon section of <a href="https://www.nw-builds.com/new-world-builds" className="underline hover:no-underline">nw-builds.com</a>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Consumables */}
            <section id="consumables-buffs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Zap className="mr-3 h-6 w-6" />
                    Consumables & Buffs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Angry Earth Ward Potions</strong>: Reduces incoming damage.</li>
                    <li><strong>Infused Angry Earth Coating</strong>: Mandatory for DPS.</li>
                    <li><strong>Powerful Honing Stone</strong>: Extra damage boost.</li>
                    <li><strong>Attribute Food</strong>: CON (tanks), FOC (healers), STR/DEX/INT (DPS).</li>
                    <li><strong>Major Angry Earth Combat Trophies</strong>: Up to +15% bonus damage.</li>
                    <li><strong>Infused Health Potions + Regeneration Serums</strong>: Sustain through heavy AoE.</li>
                    <li><strong>Grit Potion</strong>: Prevents interruption during Typhon.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Boss Fights & Strategy */}
            <section id="boss-fights">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Crown className="mr-3 h-6 w-6" />
                    Boss Fights & Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Echidna */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-primary">Echidna (First Boss)</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                      <li><strong>Obsidian Crystals</strong>: Spawn around the arena; destroy immediately or they explode with AoE vines.</li>
                      <li><strong>Phase 2 Slam</strong>: Random jump slam; move away when marked.</li>
                      <li><strong>Positioning</strong>: Tank keeps boss away from walls. When stamina breaks, DPS the neck from the side the tail lays for higher damage.</li>
                    </ul>
                  </div>

                  {/* Maze */}
                  <div className="bg-muted/30 p-4 rounded border-l-4 border-primary">
                    <h5 className="font-semibold mb-2 text-primary">The Maze (Intermission)</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                      <li>Activate platforms while managing two snakes.</li>
                      <li>Assign two players to snakes; others clear spiders and stand on platforms.</li>
                      <li>Move <strong>counter-clockwise</strong>, lighting all platforms to proceed.</li>
                    </ul>
                  </div>

                  {/* Typhon */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-primary">Typhon (Second Boss)</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                      <li><strong>Static Thorn Waves</strong>: Avoid sections that close off randomly.</li>
                      <li><strong>Moving Thorn Waves</strong>: Red thorn circles? Keep moving.</li>
                      <li><strong>Adds</strong>:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li><strong>Corvids</strong> (priority: they buff Typhon's damage by 30%).</li>
                          <li><strong>Wolves</strong> (apply raid-wide bleed).</li>
                          <li>Kill order: <strong>Corvids &gt; Wolves &gt; Others</strong>.</li>
                        </ul>
                      </li>
                      <li><strong>Charge Attack</strong>: Marked player hides behind a pillar or dies. Burst DPS during the stun window after.</li>
                      <li><strong>Phases</strong>: 70% &gt; room 2 &gt; 30% &gt; room 3. Push if close to a threshold.</li>
                      <li><strong>General</strong>: Arena rotation ramps difficulty; stay mobile.</li>
                    </ul>
                  </div>

                  {/* Cleanse Room */}
                  <div className="bg-muted/30 p-4 rounded border-l-4 border-nature-green">
                    <h5 className="font-semibold mb-2 text-nature-green">Cleanse Room (Intermission)</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                      <li>Fountains spawn cleanse orbs to clear poison zones.</li>
                      <li>Assign 1/2 players to cleansing duty.</li>
                      <li>Use each open cleanse to <strong>unlock the next closed cleanse</strong> until the room is fully clear (including center).</li>
                      <li>Rest of raid handles adds and supports cleansers.</li>
                    </ul>
                  </div>

                  {/* Broodmother Medusa */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-primary">Broodmother Medusa (Final Boss)</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                      <li><strong>Recommended Setup</strong>: Full ranged DPS if your group is inexperienced.</li>
                      <li><strong>Eggs</strong>: Assign 1/2 slash-damage users to clear quickly.</li>
                      <li><strong>Cleansing</strong>: Healers cleanse poison zones, but avoid hitting Medusa with cleanse (causes random charges).</li>
                      <li><strong>Ceiling Flowers</strong>: Drop AoE sleep clouds; ranged DPS should kill ASAP.</li>
                      <li><strong>Priority:</strong> Flowers &gt; Eggs &gt; Adds &gt; Boss.</li>
                      <li><strong>Final 40%</strong>: Vines block fountains; assign DPS to clear. Boss may charge randomly even without cleanse triggers.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Loot & Rewards */}
            <section id="loot-rewards">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Swords className="mr-3 h-6 w-6" />
                    Loot & Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>Clearing the Hive of Gorgons rewards:</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li><strong>725 GS Weapons & Armor</strong>: Hoplite Set, Gorgon's Set.</li>
                    <li><strong>Unique Artifacts</strong>: e.g., Trsna (Warhammer), Elemental Band (ring).</li>
                    <li><strong>Exclusive Perks</strong>: Hasted Vigor (armor), Unimpeded (amulet), Distained Infliction (weapons).</li>
                    <li><strong>Gorgonite Schematic</strong>: Craft tradable 725 GS with one locked perk.</li>
                    <li><strong>Raid Materials</strong>: Chromatic Seals, Hive Tokens, Gorgon's Eye.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Footer CTAs */}
            <Card className="bg-gradient-mystical">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Master All PvE Content</h3>
                <p className="text-foreground/80">Prepare for success with optimized builds and comprehensive guides.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <Link to="/builds">
                      <Swords className="mr-2 h-4 w-4" />
                      PvE Builds
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/guides/new-player-guide">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      New Player Guide
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/tools/armor-weight-calculator">
                      <Shield className="mr-2 h-4 w-4" />
                      Optimize Gear
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

export default HiveOfGorgonGuide;







