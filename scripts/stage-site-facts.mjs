// ---------------------------------------------------------------
//  STAGE SELF-DECLARED SITE FACTS -- promotes the probe's output from
//  data-work/ into src/data/ so the listing pages can render it.
//
//  WRITES ITS OWN FILE, NOT businesses.json. That separation is the point:
//
//      businesses.json  Overture + official state registers. Sourced data.
//      site-facts.json  what a business publishes about itself. Claims.
//
//  Merging the two would destroy the distinction the pages depend on. A
//  licence badge means a number was checked against a state register; a
//  service list means a company typed it on its own homepage. Both are
//  worth showing, and showing them as the same kind of thing would make the
//  badge worthless. Two sources, two files, and the template has to reach
//  for the claims deliberately rather than finding them mixed in with facts.
//
//  Keyed by business id, so a listing removed later simply stops matching
//  and its claims go unrendered -- nothing to clean up separately.
//
//  capturedOn is stamped here rather than taken from the probe, so every
//  record carries the date the claim was read. A claim with no date is not
//  checkable, and "the website said so, at some point" is not a standard
//  this site would accept anywhere else.
//
//  Usage: node scripts/stage-site-facts.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const IN = new URL('../data-work/site-facts.json', import.meta.url);
const BIZ = new URL('../src/data/businesses.json', import.meta.url);
const OUT = new URL('../src/data/site-facts.json', import.meta.url);

if (!existsSync(IN)) {
  console.error('  data-work/site-facts.json not found — run scripts/probe-licence-numbers.py --all first');
  process.exit(1);
}

const probed = JSON.parse(readFileSync(IN, 'utf8'));
const businesses = JSON.parse(readFileSync(BIZ, 'utf8'));
const byKey = new Map(businesses.map((b) => [`${b.name}|${b.city}`, b]));

const today = new Date().toISOString().slice(0, 10);
const staged = {};
let unmatched = 0;

for (const row of probed) {
  const b = byKey.get(`${row.listing}|${row.city}`);
  if (!b) { unmatched += 1; continue; }

  const rec = { capturedOn: today };
  // Only the fields that survived review. Ratings, review counts and opening
  // hours are not in the probe's output at all and must never be added here:
  // GarageDoorProHQ Rules.md forbids all three outright, and that does not
  // loosen because a business happens to publish them.
  if (row.services?.length) rec.services = row.services;
  if (row.brands?.length) rec.brands = row.brands;
  if (row.since) rec.since = row.since;
  if (row.familyOwned) rec.familyOwned = true;
  if (row.claimsBondedInsured) rec.claimsBondedInsured = true;

  // A record carrying only a date says nothing; skip rather than render an
  // empty section headed "what this company says about itself".
  if (Object.keys(rec).length > 1) staged[b.id] = rec;
}

writeFileSync(OUT, JSON.stringify(staged, null, 1));

const n = Object.keys(staged).length;
const counts = {};
for (const r of Object.values(staged)) {
  for (const k of Object.keys(r)) if (k !== 'capturedOn') counts[k] = (counts[k] || 0) + 1;
}
console.log(`  staged ${n} listings with self-declared facts (${(n / businesses.length * 100).toFixed(0)}% of ${businesses.length})`);
console.log(`  fields: ${JSON.stringify(counts)}`);
if (unmatched) console.log(`  ${unmatched} probe row(s) no longer match a live listing — skipped`);
console.log(`  -> src/data/site-facts.json`);
