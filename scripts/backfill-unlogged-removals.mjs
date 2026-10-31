// ---------------------------------------------------------------
//  BACKFILL UNLOGGED REMOVALS
//
//  The Rules say: "Removed listings are logged and redirected to their
//  city page." The 2026-10-21 removal of 47 lead-gen spam listings
//  (commit 57581a4) did neither -- it edited businesses.json directly and
//  predates removed-listings.json, so 14 of those URLs have been serving a
//  bare 404 ever since. Google had them indexed; a 404 sheds whatever link
//  equity they carried instead of passing it to the city page.
//
//  The other 33 of the 47 are already covered, because today's removals
//  re-removed the same slugs through the logged path.
//
//  The 14 are DERIVED FROM GIT, not typed out: the set difference between
//  businesses.json immediately before 57581a4 and businesses.json now,
//  minus everything already logged. Typing a list of 14 URLs by hand is how
//  you get 13 of them, and the wrong 13.
//
//  Idempotent: rows already present are left alone, so a second run is a
//  no-op rather than a duplicate.
//
//  Usage: node scripts/backfill-unlogged-removals.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// `~1`, never `^`. execSync spawns through cmd.exe on Windows, where `^` is
// the escape character -- `57581a4^` arrives at git as `57581a4`, which is a
// different (and valid) commit, so the script would silently compare the
// wrong two trees. Cost an hour on the Texas restore; not repeating it.
const REMOVAL_COMMIT = '57581a4';
const EXPECTED = 14;

const WRITE = process.argv.includes('--write');
const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));

const before = JSON.parse(
  execSync(`git show ${REMOVAL_COMMIT}~1:src/data/businesses.json`, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
);
const now = read('src/data/businesses.json');
const cities = read('src/data/cities.json');
const removed = read('src/data/removed-listings.json');

const urlOf = (b) => `/garage-door-repair/${b.stateSlug}/${b.citySlug}/${b.slug}/`;
const cityUrlOf = (b) => `/garage-door-repair/${b.stateSlug}/${b.citySlug}/`;

const nowUrls = new Set(now.map(urlOf));
const logged = new Set(removed.map((r) => r.source));
const liveCities = new Set(cities.map((c) => `${c.stateSlug}/${c.citySlug}`));

const missing = before.filter((b) => !nowUrls.has(urlOf(b)) && !logged.has(urlOf(b)));

// Guard, because a silent zero here would look like success. If the count
// moves, the data moved and this needs a human before it writes anything.
if (missing.length !== EXPECTED) {
  console.error(
    `Expected ${EXPECTED} unlogged removals, found ${missing.length}. ` +
      `Refusing to write -- the data has changed since this was written, so re-check it.`
  );
  process.exit(1);
}

// A destination that 404s is worse than the 404 it replaces: it spends a
// redirect to land the crawler nowhere. build-redirects.py would reject it,
// which is how this would become a silent no-op rather than an error.
const rows = missing.map((b) => {
  const cityLives = liveCities.has(`${b.stateSlug}/${b.citySlug}`);
  if (!cityLives) {
    throw new Error(`City page gone for ${urlOf(b)} -- needs a state-hub fallback, which this run did not expect.`);
  }
  return {
    source: urlOf(b),
    destination: cityUrlOf(b),
    id: b.id,
    name: b.name,
    slug: b.slug,
    state: b.state,
    stateCode: b.stateCode,
    removedOn: '2026-10-21',
    reason:
      'Lead-generation spam, removed in the 2026-10-21 batch of 47 (commit 57581a4). ' +
      'That batch edited businesses.json directly and predates this log, so the URL served ' +
      'a bare 404 until this row was backfilled on 2026-10-31.',
  };
});

const out = [...removed, ...rows].sort((a, b) => a.source.localeCompare(b.source));

console.log(`${removed.length} logged removals -> ${out.length} (+${rows.length} backfilled)`);
for (const r of rows) console.log(`  ${r.source} -> ${r.destination}`);

if (!WRITE) {
  console.log('\nDry run. Re-run with --write to apply.');
  process.exit(0);
}

writeFileSync(
  new URL('../src/data/removed-listings.json', import.meta.url),
  `${JSON.stringify(out, null, 2)}\n`
);
console.log('\nWritten. Now run: python scripts/build-redirects.py');
