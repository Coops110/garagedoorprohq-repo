import businesses from '../data/businesses.json';
import cities from '../data/cities.json';

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

export function getBusinessesByState(stateSlug) {
  return businesses.filter((b) => b.stateSlug === stateSlug).sort(sortForDisplay);
}

export function getBusiness(stateSlug, citySlug, slug) {
  return businesses.find(
    (b) => b.stateSlug === stateSlug && b.citySlug === citySlug && b.slug === slug
  );
}

// Display order, NOT a quality ranking. Precedence:
//   1. a verified state licence (CA/FL/AZ only — a real external check)
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
// verified-licence badge. Used to decide whether a page should explain the
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

// tel: needs digits only; the display string keeps Overture's formatting.
export function telHref(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : null;
}
