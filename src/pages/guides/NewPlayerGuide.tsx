import Layout from '@/components/Layout';
import { siteUrl } from '@/config/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Sword, 
  Shield, 
  Coins, 
  Map, 
  Users,
  BookOpen,
  Star,
  Clock,
  ExternalLink,
  BookUp
} from 'lucide-react';

const NewPlayerGuide = () => {
  const tableOfContents = [
    { id: 'getting-started', title: 'Getting Started', icon: Compass },
    { id: 'character-creation', title: 'Character Creation', icon: Users },
    { id: 'archetypes', title: 'Archetypes', icon: BookOpen},
    { id: 'combat-basics', title: 'Combat Basics', icon: Sword },
    { id: 'leveling', title: 'Leveling', icon: BookUp},
    
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const pageUrl = `${siteUrl}/guides/new-player-guide`;

  return (
    <Layout 
      title="New Player Guide - New World Builds"
      description="Complete beginner's guide to New World Aeternum. Learn the basics of combat, crafting, territories, and progression from an expert content creator."
      canonical="/guides/new-player-guide"
      type="article"
      keywords={["New World beginner guide", "New World leveling", "New World tips", "Aeternum guide"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Complete New Player Guide for New World Aeternum",
        description: "Comprehensive beginner's guide covering character creation, combat, crafting, and progression in New World Aeternum.",
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
    ><div className="container px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: September 19, 2025</span>
            <span>•</span>
            <span>Reading time: ~15 min</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            New Player Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know to get started in New World Aeternum. 
            From character creation to endgame preparation, this comprehensive guide will set you on the path to success.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="default">Beginner Friendly</Badge>
            <Badge variant="secondary">Updated for Season 9</Badge>
            <Badge variant="outline">Comprehensive</Badge>
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
            {/* Getting Started */}
            <section id="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Compass className="mr-3 h-6 w-6" />
                    Getting Started
                  </CardTitle>
                  <CardDescription>
                    Welcome to Aeternum! Your journey begins here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    New World Aeternum is a supernatural colonial-age MMO set on the mysterious island of Aeternum. 
                    As a shipwrecked explorer, you'll discover a land filled with magic, danger, and opportunity.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-primary">Key Features:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Classless System:</strong> No rigid classes - build your character however you want</li>
                    <li><strong>Player-driven Economy:</strong> Players can craft</li>
                    <li><strong>Territory Control:</strong> Companies can claim and control territories</li>
                    <li><strong>PvP & PvE:</strong> Engage in both competitive and cooperative gameplay</li>
                  </ul>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-primary">Pro Tip:</h5>
                    <p className="text-sm">
                      Take your time exploring the starting areas. The game rewards thorough exploration 
                      with resources, lore, and hidden discoveries that will help throughout your journey.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Character Creation */}
            <section id="character-creation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Users className="mr-3 h-6 w-6" />
                    Character Creation
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                  You’ll choose your appearance and archetype, but archetypes do not lock you into a build, you can change the weapons you play with later without any obstacles.
                  </p>

                  <h4 className="text-lg font-semibold text-primary">Attribute System:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                    <div className="space-y-2">
                      <h5 className="font-medium text-gold-primary">Strength (STR)</h5>
                      <p className="text-sm text-muted-foreground">
                        Increases damage with melee weapons like Sword & Shield, Great Axe, War Hammer, and Hatchet.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-aeternum-blue">Dexterity (DEX)</h5>
                      <p className="text-sm text-muted-foreground">
                        Powers ranged weapons like Bow, Musket, Rapier, and Spear. Also affects critical hit chance.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-corruption-purple">Intelligence (INT)</h5>
                      <p className="text-sm text-muted-foreground">
                        Fuels magical weapons like Fire Staff, Ice Gauntlet, and Void Gauntlet.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-nature-green">Focus (FOC)</h5>
                      <p className="text-sm text-muted-foreground">
                        Powers Life Staff healing and buffs.
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <h5 className="font-medium text-primary">Constitution (CON)</h5>
                      <p className="text-sm text-muted-foreground">
                        Increases health points. Essential for all builds for survivability.
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-primary">Recommended First Build:</h5>
                    <p className="text-sm">
                      Start with the weapon combination you enjoy playing, later on you will still level up all your weapons easily
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>



            {/* Archetype */}
            <section id="archetypes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <BookOpen className="mr-3 h-6 w-6" />
                    The Seven Archetypes Explained
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
  <p>
    Archetypes are starter playstyles in New World: Aeternum. They give you two starting weapons and bonuses to trade skills, but you are free to change weapons, respec stats. Think of them as templates, not restrictions.
  </p>

  <Accordion type="single" collapsible className="w-full">
    {/* 1. Soldier (kept exactly as in your file) */}
    <AccordionItem value="soldier" className="border-muted/40">
      <AccordionTrigger className="text-left">
        <span className="font-medium text-primary">1. Soldier</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-muted/30 p-4 rounded border-l-4 border-primary">
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li><strong>Weapons:</strong> Sword &amp; Shield + Hatchet</li>
            <li><strong>Stats:</strong> Strength + Constitution</li>
            <li><strong>Equip Load:</strong> Medium while leveling; Heavy for tanking later</li>
            <li><strong>Trade Skills:</strong> Weaponsmithing, Mining, Smelting</li>
            <li><strong>Playstyle:</strong> Durable melee fighter, ideal for group tanking but versatile enough for solo play</li>
            <br />
            <strong>Leveling Tip:</strong> Use Hatchet’s “Berserk” for solo efficiency, and Sword &amp; Shield for group tanking in expeditions
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* 2. Healers (kept exactly as in your file) */}
    <AccordionItem value="healers" className="border-muted/40">
      <AccordionTrigger className="text-left">
        <span className="font-medium text-nature-green">2. Healers</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-muted/30 p-4 rounded border-l-4 border-nature-green">
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li><strong>Weapons:</strong> Bow + Spear</li>
            <li><strong>Stats:</strong> Dexterity + Constitution</li>
            <li><strong>Equip Load:</strong> Light for max ranged damage; Medium if leaning on Spear</li>
            <li><strong>Trade Skills:</strong> Engineering, Logging, Woodworking</li>
            <li><strong>Playstyle:</strong> Mobile ranged fighter with strong kiting and utility</li>
            <br />
            <strong>Leveling Tip:</strong> Use Hatchet’s “Berserk” for solo efficiency, and Sword &amp; Shield for group tanking in expeditions.
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* 3. Mystic */}
    <AccordionItem value="mystic" className="border-muted/40">
      <AccordionTrigger className="text-left">
        <span className="font-medium text-corruption-purple">3. Mystic</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-muted/30 p-4 rounded border-l-4 border-corruption-purple">
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li><strong>Weapons:</strong> Life Staff + Void Gauntlet</li>
            <li><strong>Stats:</strong> Focus (healing) + Intelligence (Void DPS) + Constitution</li>
            <li><strong>Equip Load:</strong> Light for outgoing healing bonus.</li>
            <li><strong>Trade Skills:</strong> Arcana, Harvesting, Weaving</li>
            <li><strong>Playstyle:</strong> Pure support in groups, but surprisingly strong in solo when mixing Void damage with healing sustain.</li>
            <br />
            <strong>Leveling Tip:</strong> Focus on healing in expeditions; solo players should combine Void Gauntlet’s voidblade with Life Staff sustain.
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* 4. Occultist */}
    <AccordionItem value="occultist" className="border-muted/40">
      <AccordionTrigger className="text-left">
        <span className="font-medium text-aeternum-blue">4. Occultist</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-muted/30 p-4 rounded border-l-4 border-aeternum-blue">
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li><strong>Weapons:</strong> Fire Staff + Ice Gauntlet</li>
            <li><strong>Stats:</strong> Intelligence + Constitution</li>
            <li><strong>Equip Load:</strong> Light</li>
            <li><strong>Trade Skills:</strong> Jewelcrafting, Mining, Stonecutting</li>
            <li><strong>Playstyle:</strong> AoE mage with ranged burst and crowd control. Excellent for PvE packs.</li>
            <br />
            <strong>Leveling Tip:</strong> Use Fire Staff for AoE farming, Ice Gauntlet to root/kite enemies when overwhelmed.
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* 5. Destroyer */}
    <AccordionItem value="destroyer" className="border-muted/40">
      <AccordionTrigger className="text-left">
        <span className="font-medium text-destructive">5. Destroyer</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-muted/30 p-4 rounded border-l-4 border-destructive">
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li><strong>Weapons:</strong> Great Axe + War Hammer</li>
            <li><strong>Stats:</strong> Strength + Constitution</li>
            <li><strong>Equip Load:</strong> Medium (leveling) → Heavy (endgame bruiser/tank hybrid)</li>
            <li><strong>Trade Skills:</strong> Armoring, Skinning, Leatherworking</li>
            <li><strong>Playstyle:</strong> The classic bruiser — big damage cleaves and heavy CC.</li>
            <br />
            <strong>Leveling Tip:</strong> Great Axe pulls groups and heals via passives; War Hammer stuns, good for crowd-control.
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* 6. Swordbearer */}
    <AccordionItem value="swordbearer" className="border-muted/40">
      <AccordionTrigger className="text-left">
        <span className="font-medium">6. Swordbearer</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-muted/30 p-4 rounded border-l-4 border-white">
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li><strong>Weapons:</strong> Greatsword + Blunderbuss</li>
            <li><strong>Stats:</strong> Strength / Dexterity hybrid + Constitution</li>
            <li><strong>Equip Load:</strong> Medium → Heavy depending on focus</li>
            <li><strong>Trade Skills:</strong> Cooking, Fishing, Leatherworking</li>
            <li><strong>Playstyle:</strong> Flexible melee + short-range ranged burst, capable of frontline pressure.</li>
            <br />
            <strong>Leveling Tip:</strong> Use Greatsword stance swaps to adapt to different fights; Blunderbuss helps with range damage.
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* 7. Musketeer */}
    <AccordionItem value="musketeer" className="border-muted/40">
      <AccordionTrigger className="text-left">
        <span className="font-medium text-gold-primary">7. Musketeer</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-muted/30 p-4 rounded border-l-4 border-gold-primary">
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li><strong>Weapons:</strong> Musket + Rapier</li>
            <li><strong>Stats:</strong> Dexterity + Constitution</li>
            <li><strong>Equip Load:</strong> Light for max DPS</li>
            <li><strong>Trade Skills:</strong> Armoring, Harvesting, Weaving</li>
            <li><strong>Playstyle:</strong> Precision ranged damage with rapier mobility as a backup.</li>
            <br />
            <strong>Leveling Tip:</strong> Perfect for solo players — musket kiting makes farming safe, rapier gives an escape tool.
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* Optional: keep your DPS(7) block? Recommend removing to avoid duplication */}
  </Accordion>
</CardContent>
              </Card>
            </section>



            {/* Combat Basics */}
            <section id="combat-basics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Sword className="mr-3 h-6 w-6" />
                    Combat Basics
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                    Combat in New World is action-based and skill-focused. Understanding the fundamentals 
                    will dramatically improve your effectiveness in both PvE and PvP scenarios.
                  </p>

                  <h4 className="text-lg font-semibold text-primary">Core Mechanics:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Light/Heavy Attacks:</strong> Left-click for light, hold for heavy attacks</li>
                    <li><strong>Blocking:</strong> Right-click to block incoming damage</li>
                    <li><strong>Dodging:</strong> Shift to dodge roll (consumes stamina)</li>
                    <li><strong>Abilities:</strong> Q, R, F keys for weapon abilities</li>
                    <li><strong>Weapon Swapping:</strong> Press 1 and 2 to swap weapons</li>
                  </ul>

                  <h4 className="text-lg font-semibold text-primary">Stamina Management:</h4>
                  <p>
                    Stamina is crucial for combat effectiveness. It's consumed by dodging and blocking. Learn to manage it carefully - being caught without stamina 
                    can be deadly.
                  </p>

                  <h4 className="text-lg font-semibold text-primary">Armor Load Categories:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
                    <div className="bg-muted/30 p-3 rounded">
                      <h5 className="font-medium text-nature-green mb-1">Light Load (&lt;=12.9)</h5>
                      <p className="text-xs text-muted-foreground">
                        Longer dodge distance, reduced stamina costs
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded">
                      <h5 className="font-medium text-primary mb-1">Medium Load (13.0-22.9)</h5>
                      <p className="text-xs text-muted-foreground">
                        Balanced stats, moderate stamina costs, good all-around choice
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded">
                      <h5 className="font-medium text-destructive mb-1">Heavy Load (&gt;23.0)</h5>
                      <p className="text-xs text-muted-foreground">
                        Maximum protection, shorter dodge distance
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-primary">Combat Tips:</h5>
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>Always keep moving - standing still makes you an easy target</li>
                      <li>Learn enemy attack patterns and dodge timings</li>
                      <li>Use terrain to your advantage in both PvE and PvP</li>
                      <li>Don't spam abilities - timing and positioning matter more</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* leveling */}
            <section id="leveling">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <BookUp className="mr-3 h-6 w-6" />
                    Leveling
                  </CardTitle>
                  <CardDescription>
                    The only leveling information you need to know.
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none space-y-4">
                  <p>
                  The purpose of this New World Leveling Guide is to provide you with an efficient way to reach level 65. Please note, that in order to reach level 65 you must own the Rise of the Angry Earth Expansion. If you do not, you will be capped at level 60.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-primary">Key Features:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Questing:</strong> Let the Main Story lead. Whenever you reach a new story step, grab the side quests around it, they're usually close =&gt; finish them in a quick sweep, then jump back on the Main Story track. </li>
                    <li><strong>Lore Notes:</strong> Pick up every lore page you see. These give a decent amount of experience when picked up for the first time. </li>
                    <li><strong>XP Buffs:</strong> Pushing Main Story fast? Turn on PvP flagging, get a Music buff, and bank Rested XP. Or go booster-free to savor the lore.</li>
                    <li><strong>Gathering:</strong> Let Main Story lead. You'll get XP from everything, gathering too. It's slow by itself, but chaining gathering/refining/crafting adds real levels. Post early gear on the Trading Post to bankroll the climb.</li>
                  </ul>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-primary">Pro Tip:</h5>
                    <p className="text-sm">
                    Let fun lead. Follow the MSQ at your own speed, skip the "perfect run", and mix in what you enjoy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>


            {/* Additional sections would continue here... */}
            
            {/* Related Links */}
            <Card className="bg-gradient-mystical">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Ready for Advanced Content?</h3>
                <p className="text-foreground/80">
                  Now that you understand the basics, explore our specialized guides and optimization tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <Link to="/guides/new-world-end-game">
                      <Star className="mr-2 h-4 w-4" />
                      End-Game Guide
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/new-world-builds">
                      <Sword className="mr-2 h-4 w-4" />
                      Explore Builds
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                    <Link to="/tools/new-world-armor-weight-calculator">
                      <Shield className="mr-2 h-4 w-4" />
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

export default NewPlayerGuide;




