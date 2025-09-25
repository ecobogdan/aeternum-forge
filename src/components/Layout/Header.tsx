import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, Twitch, Youtube, MessageCircle } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "S9 Builds", href: "/builds" },
    { name: "Database", href: "/new-world-database" },
    { name: "Resource Map", href: "/resource-map" },
    {
      name: "Guides",
      dropdown: [
        { name: "New Player Guide", href: "/guides/new-player" },
        { name: "PvP Guide", href: "/guides/pvp" },
        { name: "OPR Healing Guide", href: "/guides/opr-healing" },
        { name: "Hive of Gorgon Guide", href: "/guides/hive-gorgon" },
        { name: "Ultimate Gold Making Guide", href: "/guides/gold-making" },
      ],
    },
    { name: "Armor Calculator", href: "/calculator" },
    {
      name: "Gold Tools",
      dropdown: [
        { name: "Runglass Calculator", href: "/tools/runglass" },
        { name: "Trophy Calculator", href: "/tools/trophies" },
        { name: "Matrix Calculator", href: "/tools/matrix" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Twitch", icon: Twitch, href: "#", color: "hover:text-purple-400" },
    { name: "YouTube", icon: Youtube, href: "#", color: "hover:text-red-400" },
    { name: "Discord", icon: MessageCircle, href: "#", color: "hover:text-blue-400" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gaming-border bg-gaming-bg/95 backdrop-blur supports-[backdrop-filter]:bg-gaming-bg/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="gradient-primary h-8 w-8 rounded-md"></div>
            <span className="text-xl font-bold text-primary">NW Aeternum</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) =>
              item.dropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1">
                      <span>{item.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gaming-surface border-gaming-border">
                    {item.dropdown.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link
                          to={subItem.href}
                          className="flex w-full items-center px-3 py-2 text-sm hover:bg-primary hover:text-primary-foreground"
                        >
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Social Links & Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Social Icons */}
            <div className="hidden sm:flex items-center space-x-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`transition-smooth ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-gaming-surface border-gaming-border">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.dropdown ? (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            {item.name}
                          </div>
                          <div className="ml-4 space-y-2">
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                onClick={() => setIsOpen(false)}
                                className="block text-sm text-foreground hover:text-primary transition-smooth"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  
                  <div className="border-t border-gaming-border pt-4 mt-6">
                    <div className="flex items-center space-x-4">
                      {socialLinks.map((social) => (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-smooth ${social.color}`}
                          aria-label={social.name}
                        >
                          <social.icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;