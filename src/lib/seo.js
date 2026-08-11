import { SITE } from './site.js';

// ─────────────────────────────────────────────────────────────
//  TITLE AND DESCRIPTION BUDGETS
//
//  BUILD-PLAN requires titles ≤60 characters and descriptions ≤155. Those are
//  limits on the FINAL RENDERED TAG, not on the string a template passes in —
//  SEO.astro appends " | GarageDoorProHQ" to any title that does not already
//  contain the site name, so a comfortable 50-character template title becomes
//  a 65-character <title> in the output.
//
//  Data-driven pages make this worse, because the length is not knowable when
//  the template is written. "Chandler & Gilbert Garage Door Repair" is a real
//  business in the pilot data and produced an 83-character title.
//
//  So titles are composed rather than concatenated: pass candidates from most
//  informative to least, and the first one that fits the budget wins. Nothing
//  is silently truncated unless every candidate is too long.
//
//  scripts/check-seo.py audits the built HTML against the same numbers, so a
//  template that stops using these helpers is caught rather than shipped.
// ─────────────────────────────────────────────────────────────

export const TITLE_MAX = 60;
export const DESC_MAX = 155;
export const DESC_MIN = 70;

const SUFFIX = ` | ${SITE.name}`;

// Truncate on a word boundary where one is available in the last 40% of the
// budget, so a clamp never cuts mid-word when it can avoid it.
export function clamp(str, max) {
  const s = String(str).replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd() + '…';
}

/**
 * Compose a <title> that is ≤TITLE_MAX *after* SEO.astro has appended the
 * brand. Candidates run most-informative first; falsy entries are skipped.
 *
 * Every return path is brand-inclusive, and that is load-bearing rather than
 * stylistic. SEO.astro appends " | GarageDoorProHQ" to any title that does not
 * already contain the site name — so returning a "complete but brand-less"
 * 49-character title does not save 15 characters, it produces a 64-character
 * <title>. That is exactly the bug this helper existed to prevent, and it
 * shipped once before check-seo.py caught it in the built HTML.
 */
export function fitTitle(...candidates) {
  const list = candidates.filter(Boolean).map((c) => String(c).replace(/\s+/g, ' ').trim());

  for (const c of list) {
    // Already branded: SEO.astro will leave it alone, so it only has to fit.
    if (c.includes(SITE.name)) {
      if (c.length <= TITLE_MAX) return c;
      continue;
    }
    if (c.length + SUFFIX.length <= TITLE_MAX) return c + SUFFIX;
  }

  // Nothing fits whole. Clamp the shortest candidate into the space left after
  // the suffix, and let the ellipsis show that it was cut.
  const shortest = [...list].sort((a, b) => a.length - b.length)[0] || SITE.name;
  return clamp(shortest, TITLE_MAX - SUFFIX.length) + SUFFIX;
}

/**
 * Compose a meta description within DESC_MAX, preferring one that also clears
 * DESC_MIN — a 40-character description wastes the slot even though it is
 * technically valid.
 */
export function fitDescription(...candidates) {
  const list = candidates.filter(Boolean).map((c) => String(c).replace(/\s+/g, ' ').trim());
  for (const c of list) {
    if (c.length <= DESC_MAX && c.length >= DESC_MIN) return c;
  }
  for (const c of list) {
    if (c.length <= DESC_MAX) return c;
  }
  return clamp(list[0] || SITE.description, DESC_MAX);
}
