import businesses from '../data/businesses.json';
import cities from '../data/cities.json';
import siteFacts from '../data/site-facts.json';

// ─────────────────────────────────────────────────────────────
//  WHAT IS DELIBERATELY ABSENT HERE
//
//  There is no rating, review count, star average or opening-hours
//  accessor in this file, and there must never be one. Overture / Foursquare
//  Open Source Places — the only source of business data on this site that
//  is licensed for redistribution — carries neither ratings nor hours.
//  Google Places carries both and forbids storing or republishing them.
//
//  So a rating field on this site could only come from somewhere we are not
//  allowed to take it from. That is a structural property of the legal
//  sourcing decision, not a gap waiting to be filled. AirProHQ's data.js
//  has a `sortByQuality` that multiplies rating by review count; that
//  function cannot be ported, and ranking here uses source-data confidence
//  instead — see sortForDisplay.
// ─────────────────────────────────────────────────────────────

// ── BUSINESSES ──────────────────────────────────────────────
export function getAllBusinesses() {
  return businesses;
}

export function getBusinessesByCity(stateSlug, citySlug) {
  return businesses
    .filter((b) => b.stateSlug === stateSlug && b.citySlug === citySlug)
    .sort(sortForDisplay);
}

// Other companies in the same city, as a ROTATING WINDOW rather than the
// top of the list.
//
// The listing pages used to take .slice(0, 3) off getBusinessesByCity(),
// which returns a deterministic sortForDisplay order — so every one of
// Houston's 139 listing pages showed the same three businesses. Those three
// collected 138 inbound links each and the other 135 collected none, which
// is most of why 482 of 780 listings sat on exactly one inbound link, from
// their city page alone.
//
// Taking the n entries that FOLLOW this listing in that same order, wrapping
// at the end, gives every listing exactly n inbound links from its siblings
// and leaves none stranded. Deterministic, so builds stay reproducible —
// no randomness, no build-time drift.
export function nearbyInCity(business, n = 3) {
  const all = getBusinessesByCity(business.stateSlug, business.citySlug);
  const i = all.findIndex((x) => x.slug === business.slug);
  if (i < 0 || all.length < 2) return [];
  const out = [];
  for (let k = 1; k <= Math.min(n, all.length - 1); k += 1) {
    out.push(all[(i + k) % all.length]);
  }
  return out;
}

export function getBusinessesByState(stateSlug) {
  return businesses.filter((b) => b.stateSlug === stateSlug).sort(sortForDisplay);
}

// Self-declared claims from a business's own website, kept in their own file
// and reached through their own accessor. Deliberately NOT merged onto the
// business record: a template that can write `b.services` without thinking
// cannot tell a sourced fact from a company's own marketing, and the whole
// value of the license badge rests on that line staying visible. Returns null
// rather than an empty object so a caller must handle "nothing claimed".
export function siteFactsFor(business) {
  const f = business && siteFacts[business.id];
  return f && Object.keys(f).length > 1 ? f : null;
}

// What the companies in one state say about themselves, in aggregate. The
// state hubs were 121-194 words of prose each and said nothing that was not
// true of every other state; this is the part that genuinely differs —
// LiftMaster leads in Arizona and California, Overhead Door in Florida and
// Texas, and the median founding year spans 1998 to 2006.
//
// Returns null below a floor, because an "aggregate" over four companies is
// an anecdote wearing a percentage. Nothing is rendered rather than
// something misleading.
//
// `since` deliberately reports a median and never the oldest year. The oldest
// values in the data are 1921 and 1937, and 1921 is when Overhead Door
// Corporation was founded — a dealer writing "since 1921" is very likely
// quoting the brand's history, not its own. A median absorbs that; a
// headline "trading since 1921" would repeat someone else's marketing as a
// fact about a local business.
export function stateFactsSummary(stateCode, { min = 12 } = {}) {
  const inState = businesses.filter((b) => b.stateCode === stateCode);
  const rows = inState.map((b) => siteFacts[b.id]).filter(Boolean);
  if (rows.length < min) return null;

  const tally = (key) => {
    const c = new Map();
    for (const r of rows) for (const v of r[key] || []) c.set(v, (c.get(v) || 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  };
  const years = rows.map((r) => r.since).filter(Boolean).sort((a, b) => a - b);

  return {
    sampled: rows.length,
    ofTotal: inState.length,
    services: tally('services').slice(0, 4),
    brands: tally('brands').slice(0, 3),
    medianSince: years.length >= 8 ? years[Math.floor(years.length / 2)] : null,
    sinceCount: years.length,
    familyOwned: rows.filter((r) => r.familyOwned).length,
  };
}

export function getBusiness(stateSlug, citySlug, slug) {
  return businesses.find(
    (b) => b.stateSlug === stateSlug && b.citySlug === citySlug && b.slug === slug
  );
}

// Display order, NOT a quality ranking. Precedence:
//   1. a verified state license (CA/FL/AZ only — a real external check)
//   2. completeness of the listing: a street address and website make the
//      page more useful to the visitor than a name and phone alone
//   3. Overture's record confidence
//   4. name, so the order is stable between builds
//
// Confidence is Overture's measure of how sure it is the *record* is
// accurate — it says nothing about the contractor. It is used for ordering
// and is never shown to visitors as a score, which would read as a rating
// the site has no basis to publish.
export function sortForDisplay(a, b) {
  const completeness = (x) => (x.licenceNumber ? 4 : 0) + (x.street ? 2 : 0) + (x.website ? 1 : 0);
  const d = completeness(b) - completeness(a);
  if (d) return d;
  const c = (b.confidence || 0) - (a.confidence || 0);
  if (c) return c;
  return a.name.localeCompare(b.name);
}

// ── CITIES / STATES ─────────────────────────────────────────
export function getAllCities() {
  return cities;
}

export function getCitiesByState(stateSlug) {
  return cities.filter((c) => c.stateSlug === stateSlug).sort((a, b) => b.count - a.count);
}

export function getCity(stateSlug, citySlug) {
  return cities.find((c) => c.stateSlug === stateSlug && c.citySlug === citySlug);
}

export function getAllStates() {
  const map = new Map();
  for (const c of cities) {
    if (!map.has(c.stateSlug)) {
      map.set(c.stateSlug, {
        stateSlug: c.stateSlug,
        stateCode: c.stateCode,
        state: c.state,
        count: 0,
        cityCount: 0,
        licensedCount: 0,
      });
    }
    const s = map.get(c.stateSlug);
    s.count += c.count;
    s.cityCount += 1;
    s.licensedCount += c.licensedCount || 0;
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function getState(stateSlug) {
  return getAllStates().find((s) => s.stateSlug === stateSlug);
}

// States where the trade itself is licensed, so a listing there can carry a
// verified-license badge. Used to decide whether a page should explain the
// badge or explain its absence — both are better than silence.
export function stateLicensesTrade(stateCode) {
  return ['CA', 'FL', 'AZ'].includes(stateCode);
}

// ── SITE-WIDE STATS (homepage trust bar) ────────────────────
// No average rating here, for the reason at the top of this file.
export function getSiteStats() {
  return {
    businesses: businesses.length,
    cities: cities.length,
    states: getAllStates().length,
    withPhone: businesses.filter((b) => b.phone).length,
    withWebsite: businesses.filter((b) => b.website).length,
    licenceVerified: businesses.filter((b) => b.licenceNumber).length,
  };
}

// ── FORMATTING ──────────────────────────────────────────────
export function formatCount(n) {
  return (n || 0).toLocaleString('en-US');
}

// Three jobs, three functions, because Overture stores these inconsistently:
// 430 bare 10-digit strings, 216 already E.164, 134 formatted some other way.
// Letting that reach the page meant a reader saw "3104845992" on one card and
// "(602) 920-5100" on the next, and a parser saw a 10-digit string with no
// country.
//
//   e164Phone   -> +13104845992   machine-readable: schema, tel:
//   formatPhone -> (310) 484-5992 human-readable: anything on the page
//   telHref     -> tel:+13104845992

const US_DIGITS = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length === 10) return d;                       // bare 10-digit
  if (d.length === 11 && d.startsWith('1')) return d.slice(1);
  return null;                                         // not a US number
};

export function e164Phone(phone) {
  const d = US_DIGITS(phone);
  return d ? `+1${d}` : null;
}

export function formatPhone(phone) {
  const d = US_DIGITS(phone);
  // Anything that is not a recognizable US 10-digit number is returned
  // untouched rather than mangled into a wrong-looking format.
  if (!d) return phone || '';
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function telHref(phone) {
  if (!phone) return null;
  const e = e164Phone(phone);
  if (e) return `tel:${e}`;
  const digits = String(phone).replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : null;
}
