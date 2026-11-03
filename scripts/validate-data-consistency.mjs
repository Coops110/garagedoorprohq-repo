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
import { licenceIsCurrent, parseLicenceExpiry } from '../src/lib/licensing.js';

const businesses = JSON.parse(readFileSync(new URL('../src/data/businesses.json', import.meta.url), 'utf8'));
const cities = JSON.parse(readFileSync(new URL('../src/data/cities.json', import.meta.url), 'utf8'));

let failed = false;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
const ok = (msg) => console.log(`OK: ${msg}`);
const warn = (msg) => console.warn(`WARN: ${msg}`);

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

// ── vercel.json route patterns ──────────────────────────────────────
// Added 2026-10-31 after this cost eight commits of silent non-deployment.
//
// A headers rule was committed with source
//   /(favicon\.ico|favicon\.svg|apple-touch-icon\.png|logo\.(png|svg))
// which is valid regex and INVALID as a Vercel source. Vercel parses these
// with path-to-regexp, where an unnamed group may only be the catch-all
// `(.*)`; an alternation needs to hang off a named parameter,
// `/:file(a|b)`. Vercel rejected the whole deployment at config-validation
// time -- before any build, so no deployment record appeared in `vercel ls`
// and nothing surfaced as an error anywhere. Every push for the next eight
// commits looked like it worked and changed nothing on the live site. It
// was only found because the live sitemap still had changefreq in it.
//
// A failure with no error message is the worst kind, so it fails here now,
// locally, before the commit.
const vercelCfg = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const UNNAMED_GROUP = /(^|[^:\w])\(([^)]*)\)/g;
const badSources = [];
for (const [key, rules] of [['headers', vercelCfg.headers], ['redirects', vercelCfg.redirects]]) {
  for (const r of rules || []) {
    const src = r.source || '';
    if (!src.startsWith('/')) { badSources.push(`${key}: "${src}" does not start with /`); continue; }
    for (const m of src.matchAll(UNNAMED_GROUP)) {
      // `(.*)` is the one unnamed group Vercel accepts. Anything else in an
      // unnamed group — an alternation especially — is rejected.
      if (m[2] !== '.*') {
        badSources.push(`${key}: "${src}" has unnamed group "(${m[2]})" — use a named parameter, e.g. /:file(${m[2]})`);
      }
    }
  }
}
// Second guard, same file, same day, same lesson: a redirect source that does
// not end in a slash on a trailingSlash: true site never fires. Vercel
// normalises the slash BEFORE evaluating redirects, so /foo is 308'd to /foo/
// and then matched against a table that only holds /foo — nothing matches and
// it 404s. All 772 redirects were dead this way from the day the table was
// generated, and a 404 is indistinguishable from a page that was simply never
// there, so nothing flagged it.
//
// The one legitimate exception is a host-canonicalisation rule, which must match
// every path including the slashed ones and so has to be the `/(.*)` regex.
if (vercelCfg.trailingSlash === true) {
  const unslashed = (vercelCfg.redirects || []).filter(
    (r) => !r.source.endsWith('/') && !r.has?.some((h) => h.type === 'host')
  );
  if (unslashed.length) {
    fail(`${unslashed.length} redirect source(s) do not end in "/" while vercel.json sets trailingSlash: true — these can never match, because the slash is normalised on before redirects are evaluated. They will 404 silently:\n      ${unslashed.slice(0, 4).map((r) => `${r.source} -> ${r.destination}`).join('\n      ')}`);
  } else {
    ok(`every path redirect source ends in "/" , matching trailingSlash: true`);
  }
}

if (badSources.length) {
  fail(`${badSources.length} invalid vercel.json route pattern(s) — Vercel will reject the deployment with no build and no error in \`vercel ls\`:\n      ${badSources.slice(0, 4).join('\n      ')}`);
} else {
  ok(`all ${(vercelCfg.headers || []).length + (vercelCfg.redirects || []).length} vercel.json route patterns are valid`);
}

// ── LICENCE BADGE EXPIRY (audit 2026-11-02) ────────────────────────
//
// The audit found "✓ State license verified" live on a CSLB record that
// expired on 10/31/2026. The badge now tests the expiry date, so the site
// can no longer show that claim — but the badge only re-evaluates on a
// build, and the data only improves when someone re-checks the register.
// So this reports rather than asserts:
//
//   - an unparseable expiry FAILS, because it is a data bug and it silently
//     suppresses a badge we are entitled to show;
//   - an expired or soon-to-lapse badge WARNS. Failing would block builds
//     from the day a licence lapses, including while Chris is away, which
//     would make a push-blocking emergency out of a listing that is already
//     rendering honestly.
//
// Rule: "a missing badge is better than a false one."
const badged = businesses.filter((b) => b.licenceNumber);
const unparseableExpiry = badged.filter(
  (b) => b.licenceExpires && !parseLicenceExpiry(b.licenceExpires)
);
if (unparseableExpiry.length) {
  fail(`${unparseableExpiry.length} licence expiry date(s) are not MM/DD/YYYY and will suppress the badge, e.g. ${unparseableExpiry[0].name}: "${unparseableExpiry[0].licenceExpires}". Fix the data in businesses.json.`);
} else {
  ok(`all ${badged.length} licence expiry dates parse as MM/DD/YYYY`);
}

const soon = new Date();
soon.setDate(soon.getDate() + 60);
const lapsed = badged.filter((b) => !licenceIsCurrent(b));
const lapsingSoon = badged.filter((b) => licenceIsCurrent(b) && !licenceIsCurrent(b, soon));
if (lapsed.length) {
  warn(`${lapsed.length} licence(s) have expired, so those listings show no badge and are not in licensedCount: ${lapsed.map((b) => `${b.name} (${b.city}, ${b.stateCode}) ${b.licenceExpires}`).join('; ')}. Re-check the register, update businesses.json, then run: node scripts/regenerate-city-counts.mjs`);
}
if (lapsingSoon.length) {
  warn(`${lapsingSoon.length} licence badge(s) lapse within 60 days: ${lapsingSoon.map((b) => `${b.name} (${b.city}, ${b.stateCode}) ${b.licenceExpires}`).join('; ')}. The badge drops off on the first build after each date.`);
}
if (!lapsed.length && !lapsingSoon.length) {
  ok(`no licence badge has expired or lapses within 60 days`);
}

if (failed) {
  console.error('\nData consistency check failed -- see FAIL lines above.');
  process.exit(1);
}
console.log('\nAll data consistency checks passed.');
