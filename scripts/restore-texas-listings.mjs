// ---------------------------------------------------------------
//  RESTORE TEXAS LISTINGS -- reverses commit 5358f5f (2026-09-10),
//  "Remove 335 out-of-scope Texas listings -- site only claims CA/FL/AZ".
//
//  WHY THIS IS BEING REVERSED
//  That removal rested on a scope rule that has since been reversed.
//  GarageDoorProHQ Rules.md, 2026-10-31: "It covers the whole country
//  (Chris, 2026-10-31). The licence check is shown only in states that
//  license the trade (CA, FL, AZ)." Licensing coverage and directory
//  coverage are different things -- Texas does not license the trade, so
//  Texas listings simply carry no badge, exactly like the other 47
//  non-licensing states the site now claims to serve.
//
//  WHAT IT COST
//  335 listings across 25 cities, 39% of the directory, removed on
//  2026-09-10. The 28-day GSC window measured on 2026-10-11 (102
//  impressions against 3,283 prior, -96.9%) runs 13 Sep - 11 Oct: entirely
//  after this deletion, compared against a period almost entirely before
//  it. The August GSC export put Houston alone at 928 impressions and the
//  Texas cities together at roughly 30% of all site impressions. This does
//  not explain the whole collapse -- a new-domain honeymoon ending and the
//  directory-quality findings in the 2026-10-21 audit are also in play, and
//  AirProHQ fell in the same window -- but it is the measured, reversible
//  part.
//
//  SCREENED BEFORE RESTORING, not assumed clean. Across the 335: 3 listings
//  share a name with 2+ others in the same city, 15 share a website host
//  with 2+ others (veterangaragedoor.com 8, garagedoordoctor.biz 4,
//  asapgaragedoorstx.com 3), 3 use a toll-free number, 0 lack a phone.
//  Against the LA spam cluster -- 38 identical names, 37 distinct toll-free
//  numbers, no license data -- this is a clean set. The three shared hosts
//  look like real multi-location businesses and go into the same
//  cluster-verification pass as the six CA/AZ/FL hosts rather than being
//  dropped here on a guess. Nothing is quarantined by this script.
//
//  Reads the records straight from git rather than from a copied fixture,
//  so the restore is provably the same data that was removed.
//
//  Usage: node scripts/restore-texas-listings.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const BIZ_FILE = new URL('../src/data/businesses.json', import.meta.url);
const CITIES_FILE = new URL('../src/data/cities.json', import.meta.url);
const REMOVED_FILE = new URL('../src/data/removed-listings.json', import.meta.url);

const REMOVAL_COMMIT = '5358f5f';
const EXPECTED = 335;

const businesses = JSON.parse(readFileSync(BIZ_FILE, 'utf8'));
const cities = JSON.parse(readFileSync(CITIES_FILE, 'utf8'));
const removed = JSON.parse(readFileSync(REMOVED_FILE, 'utf8'));

// `~1`, never `^`. execSync spawns through cmd.exe on Windows, where `^` is
// the escape character -- `5358f5f^` arrives at git as `5358f5f`, which is
// the commit AFTER the removal, so the filter below finds zero Texas records
// and the restore silently does nothing. Caught here because the count guard
// exists; it would otherwise have reported success having restored nothing.
const show = (path) =>
  JSON.parse(execSync(`git show ${REMOVAL_COMMIT}~1:${path}`, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  }));

const beforeBiz = show('src/data/businesses.json');
const beforeCities = show('src/data/cities.json');

const txBiz = beforeBiz.filter((b) => b.stateCode === 'TX');
const txCities = beforeCities.filter((c) => c.stateCode === 'TX');

if (txBiz.length !== EXPECTED) {
  console.error(`Expected ${EXPECTED} Texas listings in ${REMOVAL_COMMIT}^, found ${txBiz.length}. Stopping.`);
  process.exit(1);
}

// Refuse to create duplicates if this is run twice.
const haveIds = new Set(businesses.map((b) => b.id));
const clashes = txBiz.filter((b) => haveIds.has(b.id));
if (clashes.length) {
  console.error(`${clashes.length} of these ids are already present -- already restored? Stopping.`);
  process.exit(1);
}

const haveCitySlugs = new Set(cities.map((c) => `${c.stateCode}/${c.citySlug}`));
const newCities = txCities.filter((c) => !haveCitySlugs.has(`${c.stateCode}/${c.citySlug}`));

// Appended, deliberately NOT re-sorted. The existing array is not in any
// sort order, so sorting it would turn a reviewable 335-record addition
// into a 20,000-line reshuffle where a real change could hide. Nothing
// reads these files positionally.
const mergedBiz = [...businesses, ...txBiz];
const mergedCities = [...cities, ...newCities];

// Drop the Texas rows from removed-listings.json. This is what actually
// un-shadows the pages: build-redirects.py:229 generates a 301 for every
// row in that file, so leaving them in place would 301 each restored
// listing straight back to its city page and the restore would look like
// it had silently failed. The 47 CA spam rows stay exactly as they are.
const txRemoved = removed.filter((r) => r.stateCode === 'TX');
const keptRemoved = removed.filter((r) => r.stateCode !== 'TX');
if (txRemoved.length !== EXPECTED) {
  console.error(`Expected ${EXPECTED} Texas rows in removed-listings.json, found ${txRemoved.length}. Stopping.`);
  process.exit(1);
}

// indent 1, no trailing newline -- matches regenerate-city-counts.mjs and
// the remove-*.mjs scripts, so these files don't churn a line on every run.
writeFileSync(BIZ_FILE, JSON.stringify(mergedBiz, null, 1));
writeFileSync(CITIES_FILE, JSON.stringify(mergedCities, null, 1));
writeFileSync(REMOVED_FILE, JSON.stringify(keptRemoved, null, 1));

console.log(`  restored   ${txBiz.length} Texas listings  (${businesses.length} -> ${mergedBiz.length})`);
console.log(`  restored   ${newCities.length} Texas cities    (${cities.length} -> ${mergedCities.length})`);
console.log(`  un-flagged ${txRemoved.length} rows from removed-listings.json (${removed.length} -> ${keptRemoved.length}); ${keptRemoved.length} spam rows kept`);
console.log('\n  Next: node scripts/regenerate-city-counts.mjs   (counts are stale until you do)');
console.log('        npm run build && python scripts/build-redirects.py');
