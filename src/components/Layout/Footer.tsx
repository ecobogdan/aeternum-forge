import { Link } from "react-router-dom";
import { Twitch, Youtube, MessageCircle } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "S9 Builds", href: "/builds" },
    { name: "New Player Guide", href: "/guides/new-player" },
    { name: "PvP Guide", href: "/guides/pvp" },
    { name: "Armor Calculator", href: "/calculator" },
    { name: "Gold Tools", href: "/tools/runglass" },
  ];

  const guideLinks = [
    { name: "OPR Healing Guide", href: "/guides/opr-healing" },
    { name: "Hive of Gorgon Guide", href: "/guides/hive-gorgon" },
    { name: "Ultimate Gold Making", href: "/guides/gold-making" },
    { name: "Trophy Calculator", href: "/tools/trophies" },
    { name: "Matrix Calculator", href: "/tools/matrix" },
  ];

  const socialLinks = [
    { name: "Twitch", icon: Twitch, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" },
    { name: "Discord", icon: MessageCircle, href: "#" },
  ];

  return (
    <footer className="bg-gaming-bg border-t border-gaming-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="gradient-primary h-8 w-8 rounded-md"></div>
              <span className="text-xl font-bold text-primary">NW Aeternum</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your ultimate guide to mastering New World: Aeternum. Expert builds, 
              comprehensive guides, and powerful calculators for every adventurer.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides & Tools */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Guides & Tools</h3>
            <ul className="space-y-2">
              {guideLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Connect</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join our community for the latest updates, build discussions, and New World news.
            </p>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                📺 Watch Live Streams
              </a>
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                💬 Join Discord
              </a>
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                🎥 YouTube Channel
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gaming-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 NW Aeternum. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built for the New World: Aeternum community 🗡️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;