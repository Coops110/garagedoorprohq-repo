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
const MIN_TERM_WORDS = 200; // glossary terms

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

// Glossary pages have their own, lower floor. A definition page is legitimately
// shorter than a cost guide, but 15 pages of ~180 words is still exactly the
// thin-content drag that stalls indexing on an unproven domain — so each term
// carries a definition, mechanism, failure mode and a practical "what this
// means on a quote" paragraph rather than a dictionary entry.
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
