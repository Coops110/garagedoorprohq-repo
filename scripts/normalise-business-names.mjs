// ---------------------------------------------------------------
//  NORMALISE BUSINESS NAMES
//
//  Overture names arrive with a trailing separator on some records --
//  "garagedoorhouston.", "springtxgaragedoors.", "Repair Garage Springs." --
//  the same truncation artifact that 54b0447 stripped from LOCALITIES and
//  never from names. The 2026-10-31 audit found about 7 of these showing on
//  live listing pages and in the Houston city list.
//
//  WHAT THIS DOES NOT DO, deliberately:
//
//  It does not re-case or re-space a name. "garagedoorhouston" is ugly, and
//  turning it into "Garage Door Houston" means guessing where the words
//  break, inventing a trading name the business does not use, and publishing
//  it as fact on a page about a real company. The directory's whole claim is
//  that it does not make things up about the businesses it lists. A lowercase
//  run-together name is the name Overture holds; a prettier invented one is
//  a fabrication, so the dot comes off and nothing else changes.
//
//  It also will not strip a dot that belongs to an abbreviation. A first pass
//  matched /\.$/ and caught 25 records, 16 of which were legitimate -- "On
//  Track Garage Door Service, Inc.", "Ralph Wilkens Co.", "Hodges Overhead
//  Door Co." Stripping those would have corrupted 16 real company names to
//  fix 9 broken ones.
//
//  Usage: node scripts/normalise-business-names.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs';

const WRITE = process.argv.includes('--write');
const PATH = new URL('../src/data/businesses.json', import.meta.url);
const businesses = JSON.parse(readFileSync(PATH, 'utf8'));

// Final tokens where a trailing dot is part of the name, not an artifact.
// Matched case-insensitively against the last whitespace-separated token.
const ABBREVIATIONS = new Set([
  'inc.', 'co.', 'corp.', 'ltd.', 'llc.', 'l.l.c.', 'lp.', 'llp.', 'plc.',
  'pllc.', 'sr.', 'jr.', 'st.', 'bros.', 'mfg.', 'dba.', 'ent.', 'svc.',
  'svcs.', 'assoc.', 'intl.', 'natl.', 'dept.', 'div.', 'no.', 'ste.',
]);

const changes = [];
for (const b of businesses) {
  const name = b.name;
  const trimmed = name.trim();
  if (!trimmed.endsWith('.')) continue;

  const lastToken = trimmed.split(/\s+/).pop().toLowerCase();
  if (ABBREVIATIONS.has(lastToken)) continue;

  // A single-letter initial ("Smith Door Service R.") is an abbreviation too,
  // and there is no list that covers every initial.
  if (/(?:^|\s)[A-Za-z]\.$/.test(trimmed)) continue;

  // "curreygaragedoorservice.com" ends in a TLD, not a stray dot -- there is
  // nothing to strip, and it is left for the name-quality review rather than
  // silently rewritten here.
  if (/\.(?:com|net|org|biz|us|info|co)$/i.test(trimmed)) continue;

  const fixed = trimmed.replace(/\.+$/, '').trim();
  if (!fixed || fixed === trimmed) continue;
  changes.push({ id: b.id, city: b.city, stateCode: b.stateCode, from: name, to: fixed });
  if (WRITE) b.name = fixed;
}

console.log(`${changes.length} name(s) with a stray trailing separator:`);
for (const c of changes) console.log(`  ${JSON.stringify(c.from)} -> ${JSON.stringify(c.to)}   (${c.city}, ${c.stateCode})`);

const kept = businesses.filter((b) => b.name.trim().endsWith('.')).map((b) => b.name);
console.log(`\n${kept.length} name(s) keep a trailing dot as an abbreviation, e.g.`);
for (const n of kept.slice(0, 4)) console.log(`  ${JSON.stringify(n)}`);

if (!WRITE) {
  console.log('\nDry run. Re-run with --write to apply.');
  process.exit(0);
}

writeFileSync(PATH, `${JSON.stringify(businesses, null, 2)}\n`);
console.log('\nWritten. Slugs are NOT regenerated: a slug change would break the live URL');
console.log('and need a redirect, and these names are cosmetic. Run the build to confirm.');
