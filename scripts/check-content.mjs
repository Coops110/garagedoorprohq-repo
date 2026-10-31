// ─────────────────────────────────────────────────────────────
//  CONTENT INTEGRITY CHECK
//
//  Enforces the content rules that were learned the hard way on AirProHQ, as
//  a build failure rather than a code review someone has to remember to do:
//
//   1. `related` must be reciprocal. A one-way link is a dead end for a
//      reader and for a crawler, and it is invisible in review.
//   2. Keywords must be unique across published AND planned guides. Two of
//      our own pages targeting one keyword means Google picks one, usually
//      the weaker — the cannibalisation rule in CLAUDE.md.
//   3. Every cross-reference must resolve: guide -> guide, guide -> glossary
//      term, glossary -> guide, glossary -> glossary, cluster -> parent.
//   4. Glossary `also` must be reciprocal, same reasoning as (1).
//   5. Cost figures must not contradict each other. Any $ range that appears
//      in more than one guide is checked for identical bounds — a draft on
//      AirProHQ claimed capacitors cost $150–450 while the neighbouring AC
//      repair guide said $100–250.
//   6. No thin published pages: body word count must clear a floor. Measured
//      on the ARTICLE BODY only. Measuring a whole rendered page includes the
//      shared nav and footer, which makes every page look like every other
//      page and produces a number that means nothing.
//
//   Run: node scripts/check-content.mjs   (also part of `npm run prebuild`)
// ─────────────────────────────────────────────────────────────

import { guides, PLANNED, bodyWordCount } from '../src/lib/guides.js';
import { glossary } from '../src/lib/glossary.js';

const MIN_WORDS = 700;      // guides
const MIN_TERM_WORDS = 350; // glossary terms — see the note at rule 6

const problems = [];
const warnings = [];

const guideSlugs = new Set(guides.map((g) => g.slug));
const termSlugs = new Set(glossary.map((t) => t.slug));

// ── 1 + 3: guide cross-references ───────────────────────────
for (const g of guides) {
  for (const r of g.related || []) {
    if (!guideSlugs.has(r)) {
      problems.push(`guide "${g.slug}" relates to "${r}", which is not a published guide`);
      continue;
    }
    const other = guides.find((x) => x.slug === r);
    if (!(other.related || []).includes(g.slug)) {
      problems.push(`related is not reciprocal: "${g.slug}" -> "${r}", but "${r}" does not link back`);
    }
  }
  for (const t of g.glossary || []) {
    if (!termSlugs.has(t)) {
      problems.push(`guide "${g.slug}" references glossary term "${t}", which does not exist`);
    }
  }
  if (g.parent && !guideSlugs.has(g.parent)) {
    problems.push(`guide "${g.slug}" has parent "${g.parent}", which is not a published guide`);
  }
  if (g.parent && !guides.find((x) => x.slug === g.parent)?.pillar) {
    warnings.push(`guide "${g.slug}" has parent "${g.parent}", which is not marked pillar: true`);
  }
}

// ── 2: keyword uniqueness across published AND planned ──────
const seenKeywords = new Map();
for (const g of [...guides, ...PLANNED]) {
  const k = (g.keyword || '').trim().toLowerCase();
  if (!k) {
    problems.push(`guide "${g.slug}" has no keyword — cannot check for cannibalisation`);
    continue;
  }
  if (seenKeywords.has(k)) {
    problems.push(`keyword "${k}" is claimed by both "${seenKeywords.get(k)}" and "${g.slug}" — two pages targeting one query`);
  }
  seenKeywords.set(k, g.slug);
}
// A planned slug that collides with a published one would overwrite a route.
for (const p of PLANNED) {
  if (guideSlugs.has(p.slug)) {
    problems.push(`planned guide "${p.slug}" is already published — remove it from PLANNED`);
  }
}

// ── 3 + 4: glossary cross-references ────────────────────────
for (const t of glossary) {
  for (const a of t.also || []) {
    if (!termSlugs.has(a)) {
      problems.push(`glossary "${t.slug}" links to term "${a}", which does not exist`);
      continue;
    }
    const other = glossary.find((x) => x.slug === a);
    if (!(other.also || []).includes(t.slug)) {
      problems.push(`glossary also is not reciprocal: "${t.slug}" -> "${a}", but "${a}" does not link back`);
    }
  }
  for (const g of t.guides || []) {
    if (!guideSlugs.has(g)) {
      problems.push(`glossary "${t.slug}" references guide "${g}", which is not published`);
    }
  }
}

// ── 5: cost figures must agree ──────────────────────────────
// Collect every "$X – $Y" (and "$X to $Y") range, keyed by the row label it
// sits against, then flag a label that carries two different ranges.
const RANGE = /\$([\d,]+)\s*(?:–|-|to)\s*\$([\d,]+)/;
const ranges = new Map(); // normalised label -> [{ range, slug }]

function noteRange(label, text, slug) {
  const m = String(text).match(RANGE);
  if (!m) return;
  const key = String(label).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const range = `$${m[1]}–$${m[2]}`;
  if (!ranges.has(key)) ranges.set(key, []);
  ranges.get(key).push({ range, slug });
}

for (const g of guides) {
  for (const [label, cost] of g.costTable?.rows || []) {
    noteRange(label, cost, g.slug);
  }
}
for (const [label, hits] of ranges) {
  const distinct = [...new Set(hits.map((h) => h.range))];
  if (distinct.length > 1) {
    const where = hits.map((h) => `${h.slug}: ${h.range}`).join(' / ');
    problems.push(`cost figures disagree for "${label}" — ${where}`);
  }
}

// ── 6: thin-page floor ─────────────────────────────────────
for (const g of guides) {
  const words = bodyWordCount(g);
  if (words < MIN_WORDS) {
    problems.push(`guide "${g.slug}" body is ${words} words, below the ${MIN_WORDS}-word floor`);
  }
}

// Glossary pages have their own floor, lower than a guide's but not by much.
// A definition page is legitimately shorter than a cost guide — but the first
// version of this check used 200, and that let fifteen ~340-word pages through
// while LESSONS-LEARNED's own QA rule says anything under ~500 words on the page
// needs a content pass. 350 body words lands at roughly 500 rendered, once the
// h1, the diagram legend and the related-term lists are counted.
//
// So each term now carries: a one-line definition, the mechanism, the failure
// mode, a "what this means on a quote" paragraph, and one paragraph of something
// a homeowner would not already know. That is a page, not a dictionary entry.
for (const t of glossary) {
  const words = [t.short, ...(t.body || [])].join(' ').split(/\s+/).length;
  if (words < MIN_TERM_WORDS) {
    problems.push(`glossary "${t.slug}" is ${words} words, below the ${MIN_TERM_WORDS}-word floor`);
  }
  if (!t.title) {
    problems.push(`glossary "${t.slug}" has no title — the template needs one, and deriving "What is a ${t.term}?" mis-capitalises mid-sentence and breaks on terms like R-value`);
  }
}

// ── report ─────────────────────────────────────────────────
for (const w of warnings) console.warn(`  ! ${w}`);

// ── 7: spring-life figures must agree, and match the arithmetic ─────
// Rule 5 catches a dollar range that disagrees between guides. It does not
// catch a YEAR figure, and on 2026-10-31 two passages said a 10,000-cycle
// spring lasts "seven to ten years" while three others said seven, and one
// said "three to five" against "three and a half" — found by reading, which
// is exactly what this file exists to stop being necessary.
//
// The figure is not an opinion that can reasonably differ between pages. It
// is division: cycles / openings per day / 365. So this checks the
// arithmetic, not merely that the pages agree with each other — two pages
// can agree and both be wrong.
const WORD_NUM = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, 'three and a half': 3.5, 'three-and-a-half': 3.5,
};
const numOf = (s) => WORD_NUM[s.toLowerCase().trim()] ?? Number(s.replace(/,/g, ''));

const prose = (g) => [
  g.quickAnswer,
  ...(g.sections || []).flatMap((s) => s.body),
  ...(g.faqs || []).flatMap((f) => f.a),
].filter(Boolean).join(' ');

// Both word orders appear in the real copy, and a first draft only handled
// one of them — it passed cleanly while "lasts roughly ten years on a door
// used four times a day" sat in the file, because that sentence states the
// years BEFORE the rate. Caught by deliberately reintroducing the original
// bug and watching the check not fire, which is the only way to know a
// check works.
const NUM = 'three and a half|three-and-a-half|one|two|three|four|five|six|seven|eight|nine|ten|[\\d.]+';
const RATE = '(?:openings?|times?)\\s+a\\s+day';
const CLAIMS = [
  // "...10,000 cycles ... four openings a day ... seven years"
  new RegExp(`([\\d,]{4,})[\\s-]?cycle[s]?[^.]*?\\b(${NUM})\\b\\s+${RATE}[^.]*?\\b(${NUM})\\b[\\s-]?year`, 'gi'),
  // "...10,000-cycle ... seven years ... four times a day"  (years first)
  new RegExp(`([\\d,]{4,})[\\s-]?cycle[s]?[^.]*?\\b(${NUM})\\b[\\s-]?year[^.]*?\\b(${NUM})\\b\\s+${RATE}`, 'gi'),
];

for (const g of [...guides, ...glossary.map((t) => ({ slug: t.slug, quickAnswer: t.short, sections: [{ body: t.body || [] }] }))]) {
  const text = prose(g);
  for (const [i, re] of CLAIMS.entries()) {
   for (const m of text.matchAll(re)) {
    // Pattern 2 states the years before the rate, so the capture groups
    // arrive swapped.
    const [, cyclesRaw, a, b] = m;
    const [perDayRaw, yearsRaw] = i === 0 ? [a, b] : [b, a];
    const cycles = numOf(cyclesRaw);
    const perDay = numOf(perDayRaw);
    const stated = numOf(yearsRaw);
    if (!cycles || !perDay || !stated) continue;
    const actual = cycles / perDay / 365;
    // Half a year of slack: "roughly seven" for 6.85 is fine, "ten" is not.
    if (Math.abs(actual - stated) > 0.5) {
      problems.push(
        `guide "${g.slug}" says ${cyclesRaw} cycles at ${perDayRaw} a day lasts ${yearsRaw} years, but ${cyclesRaw} / ${perDayRaw} / 365 = ${actual.toFixed(1)}. Fix the figure, not the check.`
      );
    }
   }
  }
}

if (problems.length) {
  console.error('\n✗ Content check failed:\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error('');
  process.exit(1);
}

const totalWords = guides.reduce((s, g) => s + bodyWordCount(g), 0);
console.log(
  `✓ Content check passed — ${guides.length} guides (${totalWords} body words, ` +
  `min ${Math.min(...guides.map(bodyWordCount))}), ${glossary.length} glossary terms, ` +
  `${seenKeywords.size} unique keywords, all cross-links reciprocal`
);
