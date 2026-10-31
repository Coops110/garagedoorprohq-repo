// ---------------------------------------------------------------
//  VALIDATE DATA CONSISTENCY -- same build assertion added to
//  airprohq-repo the same night, for the same reason: cities.json's
//  stored count drifted from businesses.json's real length (found here
//  via the LA spam-listing removal: cities.json said 66, the real
//  pre-removal count was 77). Catches that class of drift automatically
//  instead of needing a fresh audit to find it.
//
//  Usage: node scripts/validate-data-consistency.mjs
import { readFileSync } from 'node:fs';

const businesses = JSON.parse(readFileSync(new URL('../src/data/businesses.json', import.meta.url), 'utf8'));
const cities = JSON.parse(readFileSync(new URL('../src/data/cities.json', import.meta.url), 'utf8'));

let failed = false;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
const ok = (msg) => console.log(`OK: ${msg}`);

const citiesSum = cities.reduce((s, c) => s + c.count, 0);
if (citiesSum !== businesses.length) {
  fail(`cities.json count sum (${citiesSum}) != businesses.json length (${businesses.length}). Run: node scripts/regenerate-city-counts.mjs`);
} else {
  ok(`cities.json count sum matches businesses.json (${businesses.length})`);
}

const cityKeys = new Set(cities.map((c) => `${c.stateCode}|${c.citySlug}`));
const orphans = businesses.filter((b) => !cityKeys.has(`${b.stateCode}|${b.citySlug}`));
if (orphans.length) {
  fail(`${orphans.length} business(es) have no matching city entry, e.g. ${orphans[0].name} (${orphans[0].city}, ${orphans[0].stateCode}). Run: node scripts/regenerate-city-counts.mjs`);
} else {
  ok(`every business has a matching city entry`);
}

// ── SPAM DETECTION (Critical #2, agreed with Chris 2026-10-31) ──────
//
// The previous version of this check, and the rule in
// GarageDoorProHQ Rules.md, both tested for identical names on a shared
// website. That test is INVERTED. Sameness is what a legitimate chain
// looks like: a1garage.com is 7 listings under one name on one site and
// is a real national franchise; so are Wayne Dalton's three company
// branches. Applied literally the old rule deletes the real chains and
// keeps the spam, because spam uses a DIFFERENT name every time.
//
//   A chain has ONE identity in MANY places.
//   Lead-gen spam has MANY identities in ONE place.
//
// So the signal is name DIVERSITY on a shared host, measured after
// stripping the city and the trade words -- "Angel Garage Door Repair
// Garden Grove" and "Angel ... Santa Monica" are one identity, not two.
// Validated 2026-10-31 against all 12 shared hosts then in the data; it
// separated the five real chains from the three removed lead-gen
// operations cleanly, where the old rule separated neither.
//
// Two allowlists, both deliberate. A check that stays noisy after a
// human has already judged something trains you to ignore it, so a
// reviewed host or listing goes in the list with its date and stops
// firing. Anything NOT in them is new and unreviewed, and fails the
// build rather than printing a warning nobody reads -- which is what let
// the 38 "Garage Door Los Angeles" listings sit live until an audit
// found them.

// Reviewed and confirmed real. Date = when a human actually checked.
const KNOWN_CHAINS = new Set([
  'a1garage.com',             // 2026-10-31 national franchise, 7 listings, one name
  'veterangaragedoor.com',    // 2026-10-31 real, 8 listings, Houston-area local numbers
  'garagedoordoctor.biz',     // 2026-10-31 real, local 281/346
  'asapgaragedoorstx.com',    // 2026-10-31 real branch naming ("of Pearland", "of Humble")
  'garagedooranytime.com',    // 2026-10-31 brand-consistent once the city is stripped
  'angelgaragedoors.com',     // 2026-10-31 UNRESOLVED, allowlisted to keep the build quiet
                              //            while it is checked -- not a clean bill of health
  'wayne-dalton.com',         // 2026-10-31 manufacturer's OWN branches, not dealers citing it
]);

// Manufacturers and franchisors. A listing citing one of these is a data
// question (is this really their site?), never grounds to auto-flag the
// business. Note "overhead door" is both a brand and the generic trade
// term, so it is matched as a full host only, never as a substring --
// matching loosely swept up ~25 legitimate independents like
// overheaddoorhouston.com.
const MANUFACTURER_HOSTS = new Set([
  'wayne-dalton.com', 'clopaydoor.com', 'amarr.com', 'overheaddoor.com',
  'liftmaster.com', 'chamberlain.com', 'geniecompany.com', 'geniepro.com',
  'raynor.com', 'chiohd.com',
]);

// Listings reviewed and kept despite a bare trade-phrase name.
const REVIEWED_BARE_NAMES = new Set([
  // 2026-10-31, both kept: real street address, local area code matching
  // the city, phone matches the site, no nationwide claim, own domain not
  // shared with anyone. An ugly trading name on a keyword domain is normal
  // for small trades; deleting a real business is the worse error.
  'Garage Door Repair|Redondo Beach',
  'Garage Door Repair|Pico Rivera',
]);

const hostOf = (b) => {
  const w = (b.website || '').toLowerCase();
  return w ? w.split('//').pop().split('/')[0].replace(/^www\./, '') : '';
};

// SIGNAL 1 — a name that is a bare trade phrase and nothing else.
// "best rated garage door repair" is a search query, not a business name.
//
// The city is deliberately NOT stripped here, unlike signal 2. A first
// draft did strip it and fired on 61 listings, because "Mesa Garage Door
// Repair" became "Garage Door Repair" -- and {City} Garage Door Repair is
// an entirely normal real trade name, not spam. The actual signal is a
// name carrying NO distinguishing word at all: no person, no brand, no
// place. Stripping the city destroys exactly the word that distinguishes.
// Only a RANKING claim counts as a prefix here, never a service attribute.
// A second draft included "affordable", "same day", "emergency" and "fast"
// and fired on "Same Day Garage Door Services" (Gilbert, on
// samedaygaragedoorservices.com) and "Affordable Garage Doors" (Scottsdale)
// -- both real businesses whose names describe what they sell, which is
// ordinary trade naming. No real company, though, names itself "best rated":
// that is a review claim, and a review claim as a name is a search query.
const BARE_NAME = /^(best |best[- ]rated |top[- ]rated |#?1 |number one )?garage doors?( repair| service)?s?$/i;
const bareNamed = businesses.filter(
  (b) => BARE_NAME.test(b.name.trim()) && !REVIEWED_BARE_NAMES.has(`${b.name}|${b.city}`)
);
if (bareNamed.length) {
  fail(`${bareNamed.length} listing(s) named as a bare trade phrase rather than a business, e.g. "${bareNamed[0].name}" (${bareNamed[0].city}). Review, then either quarantine or add to REVIEWED_BARE_NAMES in this file.`);
} else {
  ok(`no unreviewed bare trade-phrase listing names`);
}

// SIGNAL 2 — name diversity across one website host.
const NOISE = /\b(garage|door|doors|repair|service|services|of|the|and|inc|llc|co)\b/gi;
const stemOf = (b) =>
  b.name.toLowerCase().replace(new RegExp(b.city, 'ig'), '').replace(NOISE, '').replace(/[^a-z]/g, '');

const byHost = new Map();
for (const b of businesses) {
  const h = hostOf(b);
  if (!h) continue;
  if (!byHost.has(h)) byHost.set(h, []);
  byHost.get(h).push(b);
}
const diverse = [...byHost.entries()].filter(([host, list]) => {
  if (list.length < 3) return false;                      // too few to judge
  if (KNOWN_CHAINS.has(host) || MANUFACTURER_HOSTS.has(host)) return false;
  const stems = new Set(list.map(stemOf).filter(Boolean));
  // 0.5, calibrated against real data rather than picked. Replayed over
  // businesses.json as it stood immediately before the 25 confirmed
  // lead-gen listings were removed:
  //     0.7 -> caught 14 of 25 (garagedoorrepairsusa.com only)
  //     0.5 -> caught 25 of 25 (adds localgaragedoorsrepair.com at 4
  //            stems/7, and aegaragedoorrepair.com at 2/4)
  // and over the current data both thresholds flag nothing, so 0.5 buys
  // the other 11 at no false-positive cost. The confirmed real chains sit
  // far below it -- a1garage 0.14, veterangaragedoor 0.13, garagedoordoctor
  // 0.25, asapgaragedoorstx and garagedooranytime 0.33 -- so there is real
  // headroom between the two populations, not a line drawn through them.
  return stems.size / list.length >= 0.5;                 // many identities, one place
});
if (diverse.length) {
  const [host, list] = diverse[0];
  const stems = new Set(list.map(stemOf).filter(Boolean));
  fail(`${diverse.length} unreviewed website host(s) carry many business identities — the lead-gen pattern. e.g. ${host}: ${list.length} listings under ${stems.size} distinct name-stems. Verify the site, then quarantine the listings or add the host to KNOWN_CHAINS in this file.`);
} else {
  ok(`no unreviewed many-identities-one-host clusters`);
}

if (failed) {
  console.error('\nData consistency check failed -- see FAIL lines above.');
  process.exit(1);
}
console.log('\nAll data consistency checks passed.');
