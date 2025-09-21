const rawSiteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? 'https://www.nw-builds.com';
export const siteUrl = rawSiteUrl.replace(/\/$/, '');

export const sitemapRoutes = [
  { path: '/', priority: 1.0, changeFreq: 'weekly' },
  { path: '/builds', priority: 0.9, changeFreq: 'weekly' },
  { path: '/guides/new-player-guide', priority: 0.9, changeFreq: 'monthly' },
  { path: '/guides/pvp-guide', priority: 0.9, changeFreq: 'monthly' },
  { path: '/guides/opr-healing-guide', priority: 0.8, changeFreq: 'monthly' },
  { path: '/guides/hive-of-gorgon-guide', priority: 0.8, changeFreq: 'monthly' },
  { path: '/guides/ultimate-gold-making-guide', priority: 0.8, changeFreq: 'monthly' },
  { path: '/tools/armor-weight-calculator', priority: 0.7, changeFreq: 'monthly' },
  { path: '/tools/runeglass', priority: 0.7, changeFreq: 'monthly' },
  { path: '/tools/trophies', priority: 0.7, changeFreq: 'monthly' },
  { path: '/tools/matrix', priority: 0.7, changeFreq: 'monthly' }
];
