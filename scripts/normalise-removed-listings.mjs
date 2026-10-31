// ---------------------------------------------------------------
//  NORMALISE removed-listings.json ONTO ONE SCHEMA.
//
//  THE BUG: build-redirects.py has been crashing since 2026-10-21.
//    KeyError: 'source'   (scripts/build-redirects.py:232)
//  Nobody noticed because the script that broke it also made it
//  unnecessary: remove-la-spam-listings.mjs writes its 301s *straight into*
//  vercel.json (line 65) instead of going through the generator, and
//  appends rows shaped {id,name,slug,state,stateCode,removedOn,reason} --
//  while build-redirects.py:232 reads r['source'] and r['destination'],
//  the shape every earlier row uses.
//
//  So vercel.json has had two writers with incompatible schemas, and the
//  generator -- the one that validates every destination against dist/ and
//  refuses any rule whose source is a real built page -- has been dead for
//  ten days. Running it today is what surfaced it.
//
//  THE FIX: give the 47 newer rows the same explicit source/destination the
//  older ones carry, read out of the 301s already live in vercel.json so the
//  URLs are the real ones rather than reconstructed from parts. The row
//  shape then has one definition, the generator owns the redirects key
//  again, and remove-*.mjs no longer needs to touch vercel.json at all.
//
//  Idempotent: rows that already have source+destination are left alone.
//
//  Usage: node scripts/normalise-removed-listings.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const REMOVED_FILE = new URL('../src/data/removed-listings.json', import.meta.url);
const VERCEL_FILE = new URL('../vercel.json', import.meta.url);

const removed = JSON.parse(readFileSync(REMOVED_FILE, 'utf8'));
const vercel = JSON.parse(readFileSync(VERCEL_FILE, 'utf8'));

// slug -> the 301 already published for it. Listing URLs are the deep ones:
// /garage-door-repair/{state}/{city}/{slug}/
const bySlug = new Map();
for (const r of vercel.redirects || []) {
  const m = r.source.match(/^\/garage-door-repair\/[^/]+\/[^/]+\/([^/]+)\/$/);
  if (m) bySlug.set(m[1], r);
}

let filled = 0;
const missing = [];
const out = removed.map((row) => {
  if (row.source && row.destination) return row;
  const hit = bySlug.get(row.slug);
  if (!hit) {
    missing.push(row.slug);
    return row;
  }
  filled += 1;
  // source/destination first so the row reads as a redirect rule, which is
  // what build-redirects.py consumes it as.
  return { source: hit.source, destination: hit.destination, ...row };
});

if (missing.length) {
  console.error(`No published 301 found for ${missing.length} slug(s); cannot infer their URL:`);
  for (const s of missing.slice(0, 10)) console.error(`  ${s}`);
  console.error('Stopping rather than writing rows the generator will crash on.');
  process.exit(1);
}

writeFileSync(REMOVED_FILE, JSON.stringify(out, null, 1));
console.log(`  backfilled source+destination on ${filled} row(s); ${out.length} rows total, all one shape`);
