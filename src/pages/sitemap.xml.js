import { SITE } from '../lib/site.js';
import { getAllStates, getAllCities, getAllBusinesses } from '../lib/data.js';
import { guides } from '../lib/guides.js';
import { glossary } from '../lib/glossary.js';
import attribution from '../data/overture-attribution.json';

// Prerendered at build time, so this becomes a static /sitemap.xml — what
// @astrojs/sitemap would produce, with no third-party dependency to break on
// a minor bump. Driven straight from src/data and src/lib, so new cities,
// businesses, guides and glossary terms appear automatically.
export const prerender = true;

// lastmod tells a crawler a page changed. It was reaching only the 18 static
// routes and the guides -- 887 of 905 URLs, every city and every listing, had
// none, so a crawler had no signal that any of the directory had ever moved.
//
// changefreq and priority are gone. Google has said for years that it ignores
// both, and they were the only reason this function took four arguments. A
// sitemap that states a weekly changefreq for a page that changes when its
// source dataset does is noise dressed as information.
function url(loc, lastmod) {
  const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${mod}\n  </url>`;
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

  // Directory pages change when their SOURCE DATA changes, which is a real
  // date we hold: the Overture release the listings were staged from. Using
  // the build date instead would stamp every page as modified on every
  // deploy, which is a lie a crawler learns to distrust. A listing whose
  // licence was checked later than the release carries that date instead,
  // because a verified badge genuinely is a change to that page.
  const dataDate = (attribution.release || '').slice(0, 10) || buildDate;
  const listingDate = (b) =>
    b.licenceCheckedOn && b.licenceCheckedOn > dataDate ? b.licenceCheckedOn : dataDate;

  // A city or state page is as fresh as the freshest listing on it.
  const freshestIn = (list) => list.map(listingDate).sort().pop() || dataDate;
  const businesses = getAllBusinesses();
  const byCity = new Map();
  const byState = new Map();
  for (const b of businesses) {
    const ck = `${b.stateSlug}/${b.citySlug}`;
    if (!byCity.has(ck)) byCity.set(ck, []);
    byCity.get(ck).push(b);
    if (!byState.has(b.stateSlug)) byState.set(b.stateSlug, []);
    byState.get(b.stateSlug).push(b);
  }

  for (const route of staticRoutes()) {
    // Content hubs age with the guides; the directory hub with the data;
    // everything else with the build, which for a hand-written page is
    // genuinely the best available answer.
    const lastmod =
      route === '/' || route === '/guides/' ? latestGuideDate
      : route === '/garage-door-repair/' ? freshestIn(businesses)
      : buildDate;
    entries.push(url(`${base}${route}`, lastmod));
  }

  for (const g of guides) {
    entries.push(url(`${base}/guides/${g.slug}/`, g.dateModified || g.datePublished));
  }

  for (const t of glossary) {
    // Glossary terms carry no date of their own. Definitions do not drift,
    // so the build date is the honest answer rather than inventing one.
    entries.push(url(`${base}/glossary/${t.slug}/`, buildDate));
  }

  for (const s of getAllStates()) {
    const mod = freshestIn(byState.get(s.stateSlug) || []);
    entries.push(url(`${base}/garage-door-repair/${s.stateSlug}/`, mod));
    if (s.cityCount > 1) {
      entries.push(url(`${base}/garage-door-repair/${s.stateSlug}/compare/`, mod));
    }
  }

  for (const c of getAllCities()) {
    entries.push(url(
      `${base}/garage-door-repair/${c.stateSlug}/${c.citySlug}/`,
      freshestIn(byCity.get(`${c.stateSlug}/${c.citySlug}`) || []),
    ));
  }

  for (const b of businesses) {
    entries.push(url(
      `${base}/garage-door-repair/${b.stateSlug}/${b.citySlug}/${b.slug}/`,
      listingDate(b),
    ));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
