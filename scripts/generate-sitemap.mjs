import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { sitemapRoutes, siteUrl } from "./seo-config.mjs";

const targetPath = resolve(process.cwd(), "public", "sitemap.xml");
const now = new Date().toISOString();

const ensureAbsolute = (path) => {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapRoutes
    .map((route) => {
      const loc = ensureAbsolute(route.path);
      const changefreq = route.changeFreq ?? "weekly";
      const priority = route.priority ?? 0.7;
      const lastmod = route.lastmod ?? now;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`;
    })
    .join("\n") +
  "\n</urlset>\n";

writeFileSync(targetPath, xml);
console.log(`Sitemap written to ${targetPath}`);

