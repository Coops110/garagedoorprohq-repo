// ---------------------------------------------------------------
//  REMOVE CHAIN SPAM LISTINGS -- the 25 fabricated-local-presence
//  listings across three shared hosts, verified 2026-10-31 and removed on
//  Chris's yes. This is the cluster the 2026-10-21 session flagged as
//  "needs a slower look, not tonight's pace".
//
//  TARGETED BY WEBSITE HOST, NOT BY NAME. The name is the disguise -- each
//  listing wears a different one. The website is what they actually share,
//  so that is what this matches on.
//
//  WHY THESE THREE, AND WHY NOT THE OTHERS
//  The signal is NOT "same name on a shared site". That is what a real
//  franchise looks like: a1garage.com is 7 listings under one name on one
//  site and is a genuine national chain. Inverted, the signal holds --
//  a chain has one identity in many places, lead-gen has many identities
//  in one place. Counting distinct name-stems per host (city and trade
//  words stripped) separates them cleanly:
//
//    garagedoorrepairsusa.com    14 listings, 11 stems   <- removed
//    localgaragedoorsrepair.com   7 listings,  4 stems   <- removed
//    aegaragedoorrepair.com       4 listings,  2 stems   <- removed
//    a1garage.com                 7 listings,  1 stem    <- kept, real
//    veterangaragedoor.com        8 listings,  1 stem    <- kept, real
//    garagedooranytime.com        3 listings,  1 stem    <- kept, real
//    asapgaragedoorstx.com        3 listings,  1 stem    <- kept, real
//    garagedoordoctor.biz         4 listings,  1 stem    <- kept, real
//
//  Corroborated per host rather than taken from the ratio alone:
//   - garagedoorrepairsusa.com: two of the "business names" are the bare
//     query strings "garage door repair" and "best rated garage door
//     repair". Those are not names.
//   - localgaragedoorsrepair.com: loaded the site. It states "available in
//     ALL cities and states" and runs one toll-free number throughout,
//     while being listed here as seven separate local businesses.
//   - aegaragedoorrepair.com: four listings under two unrelated brands
//     ("Aces" and "AE"), mostly 855 toll-free. Weakest of the three, still
//     over the line.
//
//  NOT TOUCHED, deliberately: angelgaragedoors.com (5) is unresolved --
//  brand-consistent, local area codes, one toll-free on the site -- and
//  wayne-dalton.com (3) is a manufacturer URL cited by independent
//  dealers, which is a data defect to fix in the website field, not a
//  reason to delete three real businesses.
//
//  Quarantined, never deleted: every record is logged to
//  removed-listings.json with its reason and 301'd to its city page, so
//  nothing is lost and a wrong call is reversible.
//
//  Does NOT write vercel.json. build-redirects.py owns the redirects key
//  and generates it from these rows -- it validates every destination
//  against dist/ and refuses any rule whose source is a real built page,
//  neither of which happens when a script edits vercel.json by hand. That
//  bypass is what left the generator crashing for ten days.
//
//  Usage: node scripts/remove-chain-spam-listings.mjs
//     then node scripts/regenerate-city-counts.mjs
//     then npm run build && python scripts/build-redirects.py
import { readFileSync, writeFileSync } from 'node:fs';

const BIZ_FILE = new URL('../src/data/businesses.json', import.meta.url);
const REMOVED_FILE = new URL('../src/data/removed-listings.json', import.meta.url);

const HOSTS = {
  'garagedoorrepairsusa.com':
    'Lead-generation spam: 14 listings on one website under 12 different business names, including the bare query strings "garage door repair" and "best rated garage door repair", which are not business names. One operator presented as a dozen local firms.',
  'localgaragedoorsrepair.com':
    'Lead-generation spam: 7 listings on one website under 7 different business names ("Mike\'s Garage Door Repair Anaheim" alongside "Local Garage Door Repair Calabasas"). The site itself states services are "available in ALL cities and states" and runs a single toll-free number, while being listed here as seven separate local businesses.',
  'aegaragedoorrepair.com':
    'Lead-generation spam: 4 listings on one website under two unrelated brands ("Aces" and "AE"), each with its own toll-free number — the call-tracking-per-listing pattern, not a real multi-location business.',
};

const EXPECTED = 25;
const TODAY = new Date().toISOString().slice(0, 10);

const businesses = JSON.parse(readFileSync(BIZ_FILE, 'utf8'));
const removed = JSON.parse(readFileSync(REMOVED_FILE, 'utf8'));

const hostOf = (b) => {
  const w = (b.website || '').toLowerCase();
  return w ? w.split('//').pop().split('/')[0].replace(/^www\./, '') : '';
};

const doomed = businesses.filter((b) => HOSTS[hostOf(b)]);

if (doomed.length !== EXPECTED) {
  console.error(`Expected exactly ${EXPECTED} listings across the three hosts, found ${doomed.length}. Stopping — re-verify before running.`);
  for (const h of Object.keys(HOSTS)) {
    console.error(`  ${h}: ${businesses.filter((b) => hostOf(b) === h).length}`);
  }
  process.exit(1);
}

const listingUrl = (b) => `/garage-door-repair/${b.stateSlug}/${b.citySlug}/${b.slug}/`;
const cityUrl = (b) => `/garage-door-repair/${b.stateSlug}/${b.citySlug}/`;

// Same row shape as every other row in this file. Written explicitly rather
// than reconstructed later -- the shape drift between the two writers is
// exactly what broke build-redirects.py.
const newRows = doomed.map((b) => ({
  source: listingUrl(b),
  destination: cityUrl(b),
  id: b.id,
  name: b.name,
  slug: b.slug,
  state: b.state,
  stateCode: b.stateCode,
  removedOn: TODAY,
  reason: HOSTS[hostOf(b)],
}));

const doomedIds = new Set(doomed.map((b) => b.id));
const remaining = businesses.filter((b) => !doomedIds.has(b.id));

writeFileSync(BIZ_FILE, JSON.stringify(remaining, null, 1));
writeFileSync(REMOVED_FILE, JSON.stringify([...removed, ...newRows], null, 1));

for (const [host] of Object.entries(HOSTS)) {
  const n = doomed.filter((b) => hostOf(b) === host).length;
  console.log(`  removed ${String(n).padStart(2)}  ${host}`);
}
console.log(`\n  ${doomed.length} listings quarantined and 301'd (${businesses.length} -> ${remaining.length})`);
console.log(`  removed-listings.json: ${removed.length} -> ${removed.length + newRows.length} rows`);
console.log('\n  Next: node scripts/regenerate-city-counts.mjs');
console.log('        npm run build && python scripts/build-redirects.py');
