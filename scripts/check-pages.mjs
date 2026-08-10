// ─────────────────────────────────────────────────────────────
//  PRE-BUILD SANITY CHECK
//
//  Every page must render through BaseLayout. That is what supplies the
//  <head> (canonical, OG tags, JSON-LD, analytics), the header, the footer
//  and the consent banner. A page that skips it still builds and looks
//  roughly fine in a browser — it just silently collects no analytics and
//  carries no SEO tags, which is the kind of bug you find months later in a
//  report.
//
//  Runs automatically before `npm run build` via the "prebuild" script, so a
//  broken page fails the Vercel deploy instead of shipping quietly.
// ─────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const PAGES_DIR = 'src/pages';

// Non-.astro routes (sitemap.xml.js, llms.txt.js, robots.txt.js) legitimately
// have no layout — they do not render HTML.
function astroPages(dir, found = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) astroPages(full, found);
    else if (name.endsWith('.astro')) found.push(full);
  }
  return found;
}

const pages = astroPages(PAGES_DIR);
const problems = [];

for (const file of pages) {
  const src = readFileSync(file, 'utf8');
  const rel = relative('.', file).replace(/\\/g, '/');

  if (!/import\s+BaseLayout\s+from/.test(src)) {
    problems.push(`${rel} — does not import BaseLayout (no analytics, no SEO tags)`);
    continue;
  }
  if (!/<BaseLayout[\s>]/.test(src)) {
    problems.push(`${rel} — imports BaseLayout but never renders it`);
    continue;
  }
  // A page with no title falls back to nothing useful, and SEO.astro would
  // build "undefined | GarageDoorHQ" into the <title>.
  if (!/<BaseLayout[^>]*\btitle=/s.test(src)) {
    problems.push(`${rel} — renders BaseLayout without a title prop`);
  }
  // noindex pages legitimately skip canonical (they are not indexed), but an
  // indexable page without one risks duplicate-URL ambiguity.
  const noindexed = /noindex\s*=\s*\{?\s*true/.test(src);
  const dynamic = rel.includes('[');
  if (!noindexed && !dynamic && !/canonical=/.test(src)) {
    problems.push(`${rel} — indexable page with no canonical prop`);
  }
}

if (problems.length) {
  console.error('\n✗ Page check failed:\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error(
    '\nWrap the page in <BaseLayout title="…" description="…" canonical="/path/">\n' +
    'so it gets the shared <head>, analytics, header and footer. Pass\n' +
    'noindex={true} if the page should stay out of search results and the\n' +
    'sitemap.\n'
  );
  process.exit(1);
}

console.log(`✓ Page check passed — ${pages.length} pages all use BaseLayout`);
