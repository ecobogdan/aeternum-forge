import Layout from '@/components/Layout';
import { siteUrl } from '@/config/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Shield,
  Users,
  Target,
  Clock,
  ExternalLink,
  Zap,
  Settings,
  AlertTriangle,
  Swords
} from 'lucide-react';

const OPRHealingGuide = () => {
  const tableOfContents = [
    { id: 'pvp-healing-settings', title: 'PvP Healing Settings', icon: Settings },
    { id: 'weapon-combos', title: 'Best PvP Weapon Combos', icon: Swords },
    { id: 'abilities', title: 'What Abilities to Use in OPRs', icon: Heart },
    { id: 'healing-principles', title: 'Core Healing Principles', icon: Users },
    { id: 'surviving', title: 'Surviving Focus Fire', icon: Shield },
    { id: 'common-mistakes', title: 'Common Healing Mistakes', icon: AlertTriangle },
    { id: 'final-thoughts', title: 'Final Thoughts', icon: Target },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const pageUrl = `${siteUrl}/guides/opr-healing-guide`;

  return (
    <Layout
      title="How to ACTUALLY Heal in OPR (New World 2025 Guide)"
      description="Master PvP healing in New World OPR: settings, weapon combos, abilities, positioning, survival, and the mistakes to avoid."
      canonical="/guides/opr-healing-guide"
      type="article"
      keywords={["New World OPR", "New World healing", "OPR healer build", "OPR tips"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Heal Effectively in Outpost Rush",
        description: "Step-by-step Outpost Rush healing strategies, gear priorities, and positioning tips for New World Aeternum.",
        totalTime: "PT15M",
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


        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: September 19, 2025</span>
            <span>•</span>
            <span>Reading time: ~7 min</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            OPR Healing Mastery
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            "If you think healing in PvP is just standing still and spamming Sacred Ground, you're not healing.
            This guide covers settings, builds, positioning, consumables, and the tricks the best healers use
            to survive and carry fights."
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="default">Healer</Badge>
            <Badge variant="secondary">Outpost Rush</Badge>
            <Badge variant="outline">PvP</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">On this page</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Zap className="h-5 w-5 mr-2" /> Advanced Tricks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Check debuffs:</strong> Watch your buff bar for plagued. Without it, you can outheal a lot; with stacks, Sacred won't hold long.</li>
                  <li><strong>Bait CC:</strong> If someone is dedicated to stopping your heals, watch their cooldowns. Cast to bait their CC, then heal when it matters.</li>
                  <li><strong>Master Riposte:</strong> Start Riposte facing away, then turn around to land it more consistently.</li>
                </ul>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-3 space-y-10">
            <Card>
              <CardContent className="prose prose-invert max-w-none space-y-4 p-6">
                <div className="border-l-4 border-primary bg-muted/30 p-4 rounded">
                  <p>You're Healing WRONG - How to be a REAL OPR Healer (New World Aeternum 2025 Healing Guide)</p>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/o-eFeAGVw3w"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>

            <section id="pvp-healing-settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Settings className="mr-3 h-6 w-6" />
                    PvP Healing Settings
                  </CardTitle>
                  <CardDescription>Fix these for instant clarity and control.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Smartcast:</strong> turn it <strong>off</strong>.</li>
                    <li><strong>Targeted Healing:</strong> turn it <strong>on</strong>. In the extra options, only <em>lock camera to the target</em> should be on.</li>
                    <li><strong>Keybinds:</strong> use a mouse with many buttons and bind each group member to a dedicated button.</li>
                    <li><strong>Nameplates:</strong> set number of nameplates to <strong>100</strong> always.</li>
                    <li><strong>MMB (Middle Mouse Button):</strong> freecast your Sacred Ground.</li>
                  </ul>
                  <div className="border-l-4 border-primary bg-muted/30 p-3 rounded">
                    <p>Most players never touch these. Change them once and your fights immediately feel cleaner.</p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="weapon-combos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Swords className="mr-3 h-6 w-6" />
                    Best PvP Weapon Combos for Healing
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary">Life Staff + Rapier</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Fleche escape from assassins.</li>
                      <li>Evade to dodge attacks.</li>
                      <li>Riposte to stun enemies & gain invulnerability.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary">Life Staff + Hatchet</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>More CC immunity with Berserk.</li>
                      <li>Defy Death = get out of jail free card.</li>
                      <li>Social Distancing for haste & slow on the target.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="abilities">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Heart className="mr-3 h-6 w-6" />
                    What Abilities to Use in OPRs
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    Please use <strong>DST</strong>. With AGS lowering the TTK, the current meta is all about burst damage,
                    so you need burst heals to counter it. You can't really provide too much value when you just AoE heal.
                    And please do not use clap.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Sacred Ground</strong>: when you foresee the person you're healing won't be moving much.
                      You can also use it to push DPS further and control space.</li>
                    <li><strong>Divine's Embrace</strong>: use when an ally is under 50%. Grants cooldown reduction on DE
                      and heals a second nearby ally.</li>
                    <li><strong>Light's Embrace</strong>: use on self or allies above 50%. Grants haste and 25 stamina.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="healing-principles">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Users className="mr-3 h-6 w-6" />
                    Core Healing Principles
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Positioning</strong>: stay behind your frontline, but close enough to see DPS. Use walls, rocks, and structures to break enemy aim.</li>
                    <li><strong>Awareness</strong>: watch fight movement and maintain distance from danger.</li>
                    <li><strong>Pre-heal vs. Reactive heal</strong>: anticipate damage and start casting before big hits land.</li>
                    <li><strong>Don't be greedy</strong>: if keeping one ally alive puts you in danger, reset. A dead healer helps no one.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="surviving">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Shield className="mr-3 h-6 w-6" />
                    Surviving Focus Fire
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Learn to spot when enemies turn toward you.</li>
                    <li><strong>Rapier Fleche / Evade</strong> to escape.</li>
                    <li>Understand weapons and stamina damage (e.g., Hatchet hits), you can block many attacks.</li>
                    <li>Drop <strong>Sacred Ground</strong> on yourself if pressured.</li>
                    <li>Use terrain to break line of sight, then re-engage.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="common-mistakes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <AlertTriangle className="mr-3 h-6 w-6" />
                    Common Healing Mistakes
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Standing still too long</strong>: free kills for ranged builds. Always weave micro-movements or dodge steps between heals.</li>
                    <li><strong>Overhealing full HP allies</strong>: wastes cooldowns before burst hits.</li>
                    <li><strong>Tunnel vision on one target</strong>: ignoring the bigger fight can wipe your team.</li>
                    <li><strong>Ignoring your own health</strong>: dead healer = no heals. Keep yourself topped with Light's Embrace or pots.</li>
                    <li><strong>No escape plan</strong>: always have terrain, dodges, or mobility ready when targeted.</li>
                    <li><strong>Not using potions and food</strong>: use serum/regen when hit, or pre-use if expecting burst.</li>
                    <li><strong>No keybinds for party targeting</strong>: scrolling to allies is painfully slow in PvP.</li>
                    <li><strong>Bad camera awareness</strong>: zoomed-in POV or poor nameplate settings = missed heals.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="final-thoughts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Target className="mr-3 h-6 w-6" />
                    Final Thoughts
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <p>
                    PvP in <em>New World: Aeternum</em> is more than gear, it's awareness, stamina discipline,
                    and precise timing. Apply these settings, consumable strategies, and weapon tricks to see results fast.
                  </p>
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default OPRHealingGuide;









