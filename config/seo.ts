import type { ReactNode } from "react";

const rawSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://nw-builds.com";
export const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const defaultTitle = "New World Aeternum Builds & Guides | NW-Builds by LLangi";
export const defaultDescription = "Master New World Aeternum with curated Season 9 builds, in-depth guides, and optimization tools created by LLangi.";
export const defaultKeywords = [
  "New World builds",
  "Aeternum guides",
  "New World armor calculator",
  "New World runeglass",
  "LLangi builds",
  "New World Season 9"
];

export const defaultImage = `${siteUrl}/og-default.jpg`;

export interface StructuredDataEntry {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

export interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "profile" | "video.other";
  noIndex?: boolean;
  keywords?: string[];
  structuredData?: StructuredDataEntry | StructuredDataEntry[];
  children?: ReactNode;
}

export const organizationSchema: StructuredDataEntry = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NW-Builds by LLangi",
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
  sameAs: [
    "https://www.youtube.com/@LLangiTTV",
    "https://www.twitch.tv/llangi",
    "https://discord.gg/mysDhRuKVY"
  ]
};

export const webSiteSchema: StructuredDataEntry = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NW-Builds",
  description: defaultDescription,
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?query={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export interface SitemapRoute {
  path: string;
  priority?: number;
  changeFreq?: "daily" | "weekly" | "monthly";
  lastmod?: string;
}

export const sitemapRoutes: SitemapRoute[] = [
  { path: "/", priority: 1.0, changeFreq: "weekly" },
  { path: "/builds", priority: 0.9, changeFreq: "weekly" },
  { path: "/guides/new-player-guide", priority: 0.9, changeFreq: "monthly" },
  { path: "/guides/pvp-guide", priority: 0.9, changeFreq: "monthly" },
  { path: "/guides/opr-healing-guide", priority: 0.8, changeFreq: "monthly" },
  { path: "/guides/hive-of-gorgon-guide", priority: 0.8, changeFreq: "monthly" },
  { path: "/guides/ultimate-gold-making-guide", priority: 0.8, changeFreq: "monthly" },
  { path: "/tools/armor-weight-calculator", priority: 0.7, changeFreq: "monthly" },
  { path: "/tools/runeglass", priority: 0.7, changeFreq: "monthly" },
  { path: "/tools/trophies", priority: 0.7, changeFreq: "monthly" },
  { path: "/tools/matrix", priority: 0.7, changeFreq: "monthly" }
];
