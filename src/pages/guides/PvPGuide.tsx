import Layout from '@/components/Layout';
import { siteUrl } from '@/config/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Swords, 
  Shield, 
  Target, 
  Users, 
  Map,
  Clock,
  ExternalLink,
  Zap,
  Settings,
  Hourglass,
  TrendingUp,
  ArrowDownUp,
  Milk,
  Sword,

} from 'lucide-react';

const PvPGuide = () => {
  const tableOfContents = [
    { id: 'pvp-basics', title: 'PvP Fundamentals', icon: Swords },
    { id: 'combat-mechanics', title: 'Advanced Combat', icon: Target },
    { id: 'pvp-settings', title: 'Best PvP Settings', icon: Settings },
    { id: 'stamina-management', title: 'Stamina Management', icon: Zap },
    { id: 'weapon-matchups', title: 'Matchup Knowledge', icon: Map },
    { id: 'cooldowns', title: 'Cooldowns & Engagement', icon: Hourglass },
    { id: 'disengage', title: 'How to Disengage', icon: ArrowDownUp },
    { id: 'consumable-mastery', title: 'Consumable Mastery', icon: TrendingUp },
    { id: 'universal-pvp-habits', title: 'Universal PvP Habits', icon: Users },
    { id: 'weapon-specific-tips', title: 'Weapon-Specific Tips', icon: Swords },
    { id: 'target-priority', title: 'Target Priority', icon: Target },
    { id: 'tiny-details', title: 'Tiny Details That Win Fights', icon: Map },
    { id: 'how-to-improve', title: 'How to Improve', icon: ExternalLink },
    { id: 'final-thoughts', title: 'Final Thoughts', icon: Shield },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const pageUrl = `${siteUrl}/guides/pvp-guide`;
  return (
    <Layout 
      title="PvP Guide - New World Builds"
      description="Master PvP combat in New World Aeternum with advanced strategies, weapon matchups, and tactical guides for solo and group PvP."
      canonical="/guides/pvp-guide"
      type="article"
      keywords={["New World PvP", "Aeternum PvP", "New World PvP builds", "PvP strategies"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: "Ultimate PvP Guide for New World Aeternum",
        description: "Advanced PvP strategies, weapon matchups, and tactical guidance for dominating New World Aeternum.",
        datePublished: "2025-02-10",
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
    ><div className="container px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: September 19, 2025</span>
            <span>•</span>
            <span>Reading time: ~7 min</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            PvP Mastery Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dominate the battlefield with advanced PvP strategies, weapon matchup knowledge, and tactical gameplay. 
            From 1v1 duels to large-scale wars, master every aspect of PvP combat.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="default">Advanced</Badge>
            <Badge variant="secondary">Season 9 Meta</Badge>
            <Badge variant="outline">Combat Focus</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Guide Contents</CardTitle>
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
            {/* PvP Basics */}
            <section id="pvp-basics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Swords className="mr-3 h-6 w-6" />
                    PvP Fundamentals
                  </CardTitle>
                  <CardDescription>
                    Master the core concepts that separate good from great PvP players.
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    PvP in New World Aeternum rewards skill, positioning, and game knowledge over gear alone. 
                    Understanding these fundamentals is crucial for success at any level of play.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-primary">Core PvP Principles:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Positioning:</strong> Control space and force favorable engagements</li>
                    <li><strong>Stamina Management:</strong> Never overextend - always keep escape options</li>
                    <li><strong>Ability Timing:</strong> Save key abilities for critical moments</li>
                    <li><strong>Target Prioritization:</strong> Focus fire on the most dangerous or vulnerable targets</li>
                    <li><strong>Cooldown Tracking:</strong> Know when enemies have used their escape abilities</li>
                  </ul>

                  <h4 className="text-lg font-semibold text-primary">Mindset & Psychology:</h4>
                  <p>
                    Mental state is often overlooked but crucial. Stay calm under pressure, learn from losses, 
                    and avoid tilting. Every death is a learning opportunity.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-primary">Advanced Tip:</h5>
                    <p className="text-sm">
                      Watch your opponent's stamina bar. When it's low, they can't dodge or block effectively. 
                      This is your window for aggressive plays and combo execution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Combat Mechanics */}
            <section id="combat-mechanics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Target className="mr-3 h-6 w-6" />
                    Advanced Combat Mechanics
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <h4 className="text-lg font-semibold text-primary">Animation Canceling:</h4>
                  <p>
                    Master animation canceling to increase your DPS and mobility. Key techniques include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Light attack: Dodge roll to cancel recovery frames</li>
                    <li>Heavy attack: Block to cancel the swing if you miss</li>
                    <li>Ability: Weapon swap to reduce cooldown perception</li>
                  </ul>

                  <h4 className="text-lg font-semibold text-primary">Grit & Crowd Control:</h4>
                  <p>
                    Understanding grit (immunity to stagger) and CC is essential for timing your abilities:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                    <div className="bg-muted/30 p-3 rounded">
                      <h5 className="font-medium text-gold-primary mb-1">Grit Abilities</h5>
                      <p className="text-xs text-muted-foreground">
                        Cannot be staggered during these abilities. Use them to trade damage or escape bad situations.
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded">
                      <h5 className="font-medium text-corruption-purple mb-1">Hard CC</h5>
                      <p className="text-xs text-muted-foreground">
                        Stuns, knockdowns, and roots that completely disable enemies. Save these for key moments.
                      </p>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-primary">Desync & Lag Compensation:</h4>
                  <p>
                    Online PvP involves network delays. Learn to predict and compensate for these factors 
                    to land abilities more consistently and avoid "phantom hits."
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* PvP Settings */}
            <section id="pvp-settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Settings className="mr-3 h-6 w-6" />
                    Best PvP Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                  Most players never touch these. Change them once and your fights immediately feel cleaner.
                  </p>

                  <div className="space-y-4 not-prose">
                    <div className="bg-nature-green/20 p-4 rounded border border-nature-green/30">
                      <h5 className="font-semibold text-nature-green mb-2">Fix these settings first for instant clarity and control</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>FOV:</strong> 70 (max)</li>
                        <li>• <strong>Tilt-Based Camera:</strong> 0</li>
                        <li>• <strong>Camera Shake:</strong> Disabled</li>
                        <li>• <strong>Freeform Movement:</strong> Enabled</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>


            {/* Stamina Management */}
            <section id="stamina-management">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Zap className="mr-3 h-6 w-6" />
                    Stamina Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                  Avoid grey barring. When you run out of stamina, you're exhausted and easy to CC-chain.<br>
                  </br><br></br>
                  • Don't spam dodge, one dodge usually breaks tracking. (max)<br></br>
                  • Keep a buffer: never dodge below 50 stamina (55 in heavy).<br></br>
                  • Absorb a hit if needed; exhaustion is worse than damage.
                  </p>
                </CardContent>
              </Card>
            </section>


            {/* Weapon Matchups */}
            <section id="weapon-matchups">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Shield className="mr-3 h-6 w-6" />
                    Weapon Matchup Knowledge
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    Understanding weapon matchups is crucial for 1v1 success. Each weapon has strengths 
                    and weaknesses against others.
                  </p>

                  <h4 className="text-lg font-semibold text-primary">Key Matchup Strategies:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>vs Ranged:</strong> Use line of sight and gap closers effectively</li>
                    <li><strong>vs Melee:</strong> Control spacing and punish overextensions</li>
                    <li><strong>vs Healers:</strong> Apply consistent pressure and use anti-heal</li>
                    <li><strong>vs Tanks:</strong> Avoid extended trades, look for burst windows</li>
                  </ul>
                </CardContent>
              </Card>
            </section>


              {/* Cooldowns */}
              <section id="cooldowns">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Hourglass className="mr-3 h-6 w-6" />
                    Cooldown & Engagement Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                <p>
                • Learn enemy builds to predict weakness windows <br></br>
                • Engage after they burn major cooldowns (e.g., Spear Sweep)<br></br>
                • Don't fight without your own defensive skills/potions<br></br>
                • Pre-pot buffs like Serum for early momentum
                  </p>
                </CardContent>
              </Card>
            </section>


              {/* Disengage */}
              <section id="disengage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <ArrowDownUp className="mr-3 h-6 w-6" />
                    How to Disengage
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                <p>
                • Always know your escape route <br></br>
                • Don't panic dodge, wait for recovery windows (e.g., GA Reap follow-up)<br></br>
                • Retreat while facing the fight; use ranged pressure<br></br>
                • Use CC defensively: Shockwave, Sweep, Trip
                  </p>
                </CardContent>
              </Card>
            </section>



{/* Consumable Mastery */}
<section id="consumable-mastery">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6" />
                    Consumable Mastery
                  </CardTitle>
                  <CardDescription>Potions and runes separate average players from great ones.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold">Endless Thirst vs Ankh</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left p-2 border-b border-border">Rune</th>
                            <th className="text-left p-2 border-b border-border">Effect</th>
                            <th className="text-left p-2 border-b border-border">Strengths</th>
                            <th className="text-left p-2 border-b border-border">Weaknesses</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border-b border-border"><strong>Endless Thirst</strong></td>
                            <td className="p-2 border-b border-border">Rotate potion types to bypass increased cooldowns</td>
                            <td className="p-2 border-b border-border">~133% potion power, long sustain</td>
                            <td className="p-2 border-b border-border">Requires active rotation</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-b border-border"><strong>Ankh</strong></td>
                            <td className="p-2 border-b border-border">Boosts healing received</td>
                            <td className="p-2 border-b border-border">Simple sustain option</td>
                            <td className="p-2 border-b border-border">Potions only ~75% effective</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold">Potion Combos</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Serum + Regeneration:</strong> Pre-pot serum, then regen for 35/40s of sustain (~800/1,000 HP/sec depending on build).</li>
                      <li><strong>Blooddrinker Rune:</strong> Best on high base damage weapons (Greatsword, War Hammer).</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>


            {/* Universal PvP Habits */}
            <section id="universal-pvp-habits">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Users className="mr-3 h-6 w-6" />
                    Universal PvP Habits
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Time CC:</strong> Land it when you can follow up or at the end of enemy casts.</li>
                    <li><strong>Punish grit windows:</strong> Many abilities lose grit just before impact, CC then.</li>
                    <li><strong>Block smartly:</strong> Don't block GS/WH heavy swings; do block Rapier/Hatchet/VB light strings.</li>
                    <li><strong>Dodge unpredictably:</strong> Don't fall into a rhythm.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Weapon-Specific Tips */}
            <section id="weapon-specific-tips">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Swords className="mr-3 h-6 w-6" />
                    Weapon-Specific Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-6">
                  <div>
                  <h4 className="text-lg font-semibold text-primary">Ice Gauntlet</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cast inside frosted areas for ~15% cooldown reduction (passive).</li>
                      <li>Dodge slightly late to avoid the IG heavy-root follow-up after <em>Ice Storm</em>.</li>
                      <li>Break <em>Entomb</em> with block (RMB), not dodge, to trigger damage/knockback.</li>
                    </ul>
                  </div>
                  <div>
                  <h4 className="text-lg font-semibold text-primary">Void Gauntlet</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Look slightly down when casting <em>Scream</em> for extra range.</li>
                      <li>Consider aimlock for faster tether connects.</li>
                    </ul>
                  </div>
                  <div>
                  <h4 className="text-lg font-semibold text-primary">Hatchet + Great Axe</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Pre-activate <strong>Berserk</strong> or <strong>Stoneform Heartrune</strong> to resist CC pulls (e.g., <em>Gravity Well</em>).</li>
                    </ul>
                  </div>
                  <div>
                  <h4 className="text-lg font-semibold text-primary">Rapier</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Turn your back before <em>Riposte</em> to surprise attackers.</li>
                      <li>Bait healer Ripostes by feinting, then punish the cooldown.</li>
                      <li>Evade backward, it covers more distance than forward.</li>
                    </ul>
                  </div>
                  <div>
                  <h4 className="text-lg font-semibold text-primary">Greatsword</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>With <em>Cross-cut</em>, cancel the second swing, delay the third to burn stamina with awkward dodges.</li>
                    </ul>
                  </div>
                  <div>
                  <h4 className="text-lg font-semibold text-primary">Fire Staff</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><em>Smolder</em> on Fireball is often overrated, value requires direct hits, not splash.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Target Priority */}
            <section id="target-priority">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Target className="mr-3 h-6 w-6" />
                    Target Priority
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Focus healers/DPS out of position.</li>
                    <li>Wait for healers to burn <em>Sacred Ground</em> before diving.</li>
                    <li>Secure low HP kills for numbers advantage.</li>
                    <li>Ignore tanks unless isolated.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Tiny Details */}
            <section id="tiny-details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Map className="mr-3 h-6 w-6" />
                    Tiny Details That Win Fights
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Pre-pot:</strong> Use potions before big hits, not after.</li>
                    <li><strong>Camera control:</strong> Constantly scan for flanks.</li>
                    <li><strong>Zoning:</strong> Forcing healers out of position often beats trying to kill them.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* How to Improve */}
            <section id="how-to-improve">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <ExternalLink className="mr-3 h-6 w-6" />
                    How to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Daily duels with strong players, learn, don't just win.</li>
                    <li>Record & review fights to spot mistakes.</li>
                    <li>Play multiple roles to understand enemy habits.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Final Thoughts */}
            <section id="final-thoughts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Shield className="mr-3 h-6 w-6" />
                    Final Thoughts
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-2">
                  <p>
                    PvP in <em>New World: Aeternum</em> is more than gear, it's awareness, stamina discipline, and precise timing.
                    Apply these settings, consumable strategies, and weapon tricks to see results fast.
                  </p>
                </CardContent>
              </Card>
            </section>


            {/* Related Links */}
            <Card className="bg-gradient-mystical">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Level Up Your PvP Game</h3>
                <p className="text-foreground/80">
                  Ready to put theory into practice? Check out our meta builds and optimization tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <Link to="/builds">
                      <Swords className="mr-2 h-4 w-4" />
                      PvP Builds
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/tools/armor-weight-calculator">
                      <Shield className="mr-2 h-4 w-4" />
                      Optimize Loadout
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/guides/opr-healing-guide">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      OPR Guide
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

export default PvPGuide;






