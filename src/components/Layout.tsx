import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Seo from '@/components/Seo';
import type { SeoProps } from '@/config/seo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Menu, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitch, faYoutube, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

type LayoutSeoProps = Omit<SeoProps, "children">;

interface LayoutProps extends LayoutSeoProps {
  children: React.ReactNode;
}

const Layout = ({ children, title, description, canonical, image, type, noIndex, keywords, structuredData }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Control desktop nav dropdowns to open only on click
  const [menuValue, setMenuValue] = useState<string | undefined>(undefined);
  // Local click-only dropdowns for Guides and Gold Making Tools
  const [openGuides, setOpenGuides] = useState(false);
  const [openTools, setOpenTools] = useState(false);
  const guidesRef = useRef<HTMLDivElement | null>(null);
  const toolsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (guidesRef.current && !guidesRef.current.contains(t)) setOpenGuides(false);
      if (toolsRef.current && !toolsRef.current.contains(t)) setOpenTools(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGuides(false);
        setOpenTools(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  const location = useLocation();

  const resolvedCanonical = canonical ?? location.pathname;
  
  const isActive = (path: string) => location.pathname === path;

  const guidesItems = [
    { title: "New Player Guide", href: "/guides/new-world-new-player-guide" },
    { title: "End-Game Guide", href: "/guides/new-world-end-game" },
    { title: "PvP Guide", href: "/guides/new-world-pvp-guide" },
    { title: "OPR Healing Guide", href: "/guides/new-world-opr-healing-guide" },
    { title: "Hive of Gorgon Guide", href: "/guides/new-world-hive-of-gorgon-guide" },
    { title: "Ultimate Gold Making Guide", href: "/guides/new-world-ultimate-gold-making-guide" },
  ];

  const toolsItems = [
    { title: "Runeglass Calculator", href: "/tools/new-world-runeglass" },
    { title: "Trophy Calculator", href: "/tools/new-world-trophies" },
    { title: "Matrix Calculator", href: "/tools/new-world-matrix" },
  ];

  return (
    <><Seo
        title={title}
        description={description}
        canonical={resolvedCanonical}
        image={image}
        type={type}
        noIndex={noIndex}
        keywords={keywords}
        structuredData={structuredData}
      />

<div className="min-h-screen bg-gradient-hero">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container flex h-16 items-center justify-between px-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={logo}
                alt="NW-Builds logo"
                className="h-10 w-10 rounded-lg object-contain"
              />
              <span className="hidden font-bold sm:inline-block text-primary">
                NW-Builds
              </span>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu
              className="hidden lg:flex"
              value={menuValue}
              onValueChange={(v) => {
                // Allow close from outside/escape (undefined) only
                if (v == null) setMenuValue(undefined);
              }}
              // Block hover interactions to enforce click-only
              onPointerEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onPointerMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onMouseEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      to="/" 
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        isActive("/") && "bg-accent text-accent-foreground"
                      )}
                    >
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      to="/new-world-builds" 
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        isActive("/new-world-builds") && "bg-accent text-accent-foreground"
                      )}
                    >
                      S9 Builds
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <div ref={guidesRef} className="relative">
                  <button
                    type="button"
                    className={cn(
                      "group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    )}
                    aria-haspopup="menu"
                    aria-expanded={openGuides}
                    onClick={() => setOpenGuides((v) => !v)}
                  >
                    Guides
                    <span className="ml-1 inline-block"></span>
                  </button>
                  {openGuides && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-[600px] max-w-[90vw] rounded-md border bg-popover p-2 text-popover-foreground shadow-lg">
                      <ul className="grid w-full gap-3 p-2 md:grid-cols-2">
                        {guidesItems.map((item) => (
                          <li key={item.title}>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                              onClick={() => setOpenGuides(false)}
                            >
                              <div className="text-sm font-medium leading-none">{item.title}</div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      to="/tools/new-world-armor-weight-calculator" 
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        isActive("/tools/new-world-armor-weight-calculator") && "bg-accent text-accent-foreground"
                      )}
                    >
                      Armor Calculator
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <div ref={toolsRef} className="relative">
                  <button
                    type="button"
                    className={cn(
                      "group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    )}
                    aria-haspopup="menu"
                    aria-expanded={openTools}
                    onClick={() => setOpenTools((v) => !v)}
                  >
                    Gold Making Tools
                    <span className="ml-1 inline-block"></span>
                  </button>
                  {openTools && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-[300px] rounded-md border bg-popover p-2 text-popover-foreground shadow-lg">
                      <ul className="grid w-full gap-3 p-2">
                        {toolsItems.map((item) => (
                          <li key={item.title}>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                              onClick={() => setOpenTools(false)}
                            >
                              <div className="text-sm font-medium leading-none">{item.title}</div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Social Icons & Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              {/* Social Icons */}
              <div className="hidden items-center space-x-3 md:flex">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Watch creator live</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://www.twitch.tv/llangi" target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faTwitch} className="h-8 w-8" />
                    </a>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://www.youtube.com/@LLangiTTV" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faYoutube} className="h-8 w-8" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://discord.gg/mysDhRuKVY" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faDiscord} className="h-8 w-8" />
                  </a>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border bg-background">
              <div className="container px-4 py-4 space-y-2">
                <Link 
                  to="/" 
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/new-world-builds" 
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  S9 Builds
                </Link>
                
                {/* Guides submenu */}
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground">Guides</div>
                  {guidesItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="block rounded-md px-6 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>

                <Link 
                  to="/tools/new-world-armor-weight-calculator" 
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Armor Calculator
                </Link>

                {/* Tools submenu */}
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground">Gold Making Tools</div>
                  {toolsItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="block rounded-md px-6 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex space-x-2 px-3 py-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://www.twitch.tv/llangi" target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faTwitch} className="h-8 w-8" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://www.youtube.com/@LLangiTTV" target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faYoutube} className="h-8 w-8" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://discord.gg/mysDhRuKVY" target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faDiscord} className="h-8 w-8" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background/80 backdrop-blur">
          <div className="container px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-primary mb-4">NW-Builds</h3>
                <p className="text-sm text-muted-foreground">
                  Your ultimate resource for New World Aeternum builds, guides, and optimization tools.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2 text-sm">
                  <Link to="/new-world-builds" className="block hover:text-primary">S9 Builds</Link>
                  <Link to="/guides/new-world-new-player-guide" className="block hover:text-primary">New Player Guide</Link>
                  <Link to="/tools/new-world-armor-weight-calculator" className="block hover:text-primary">Armor Calculator</Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://www.twitch.tv/llangi" target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faTwitch} className="h-8 w-8" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://www.youtube.com/@LLangiTTV" target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faYoutube} className="h-8 w-8" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://discord.gg/mysDhRuKVY" target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faDiscord} className="h-8 w-8" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
  <p>
    &copy; 2025 NW-Builds by LLangi. Built for the New World community.  
    Shoutout to{" "}
    <a
      href="https://www.nw-buddy.de/"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-foreground"
    >
      NW-Buddy
    </a>
    .
  </p>
</div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;






