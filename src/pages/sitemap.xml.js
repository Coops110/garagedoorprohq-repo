import { SITE } from '../lib/site.js';
import { getAllStates, getAllCities, getAllBusinesses } from '../lib/data.js';
import { guides } from '../lib/guides.js';
import { glossary } from '../lib/glossary.js';

// Prerendered at build time, so this becomes a static /sitemap.xml — what
// @astrojs/sitemap would produce, with no third-party dependency to break on
// a minor bump. Driven straight from src/data and src/lib, so new cities,
// businesses, guides and glossary terms appear automatically.
export const prerender = true;

// lastmod tells a crawler a page changed. Without it there is no signal to
// recrawl an updated guide.
function url(loc, changefreq, priority, lastmod) {
  const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${mod}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

// Static pages are discovered from the filesystem so a new page is included
// without editing this file. Pages passing noindex to BaseLayout are skipped
// — submitting a noindexed URL only earns a Search Console warning. Dynamic
// routes ([slug] etc.) are handled by the loops below.
const pageSources = import.meta.glob('./**/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const ROUTE_META = {
  '/': ['weekly', '1.0'],
  '/garage-door-repair/': ['weekly', '0.9'],
  '/guides/': ['weekly', '0.9'],
  '/glossary/': ['monthly', '0.7'],
};
const DEFAULT_META = ['monthly', '0.5'];

function staticRoutes() {
  return Object.entries(pageSources)
    .filter(([file, src]) => {
      if (file.includes('[')) return false;          // dynamic route
      if (/\/404\.astro$/.test(file)) return false;  // error page
      return !/noindex\s*=\s*\{?\s*true/.test(src);  // respects noindex
    })
    .map(([file]) => {
      const path = file
        .replace(/^\.\//, '')
        .replace(/\.astro$/, '')
        .replace(/(^|\/)index$/, '');
      return path ? `/${path}/` : '/';
    })
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
}

export async function GET() {
  const base = SITE.domain.replace(/\/$/, '');
  const entries = [];

  const buildDate = new Date().toISOString().slice(0, 10);
  const latestGuideDate = guides
    .map((g) => g.dateModified || g.datePublished)
    .filter(Boolean)
    .sort()
    .pop() || buildDate;

  for (const route of staticRoutes()) {
    const [changefreq, priority] = ROUTE_META[route] || DEFAULT_META;
    // Content hubs age with the guides; everything else with the build.
    const lastmod = route === '/' || route === '/guides/' ? latestGuideDate : buildDate;
    entries.push(url(`${base}${route}`, changefreq, priority, lastmod));
  }

  for (const g of guides) {
    entries.push(url(`${base}/guides/${g.slug}/`, 'monthly', '0.8', g.dateModified || g.datePublished));
  }

  for (const t of glossary) {
    entries.push(url(`${base}/glossary/${t.slug}/`, 'yearly', '0.5'));
  }

  for (const s of getAllStates()) {
    entries.push(url(`${base}/garage-door-repair/${s.stateSlug}/`, 'weekly', '0.8'));
    if (s.cityCount > 1) {
      entries.push(url(`${base}/garage-door-repair/${s.stateSlug}/compare/`, 'monthly', '0.6'));
    }
  }

  for (const c of getAllCities()) {
    entries.push(url(`${base}/garage-door-repair/${c.stateSlug}/${c.citySlug}/`, 'weekly', '0.7'));
  }

  for (const b of getAllBusinesses()) {
    entries.push(url(`${base}/garage-door-repair/${b.stateSlug}/${b.citySlug}/${b.slug}/`, 'monthly', '0.6'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
