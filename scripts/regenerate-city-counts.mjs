// ---------------------------------------------------------------
//  REGENERATE CITY COUNTS -- recompute cities.json's count,
//  licensedCount, withWebsite and withAddress fields directly from the
//  current businesses.json, overwriting whatever drift has accumulated.
//
//  Found 2026-10-21 while removing the 38 LA spam listings (see
//  scripts/remove-la-spam-listings.mjs): cities.json's stored LA count
//  was 66, but the real pre-removal count was 77 (39 real + 38 spam) --
//  already stale before that removal touched anything, same class of
//  bug independently found and fixed on airprohq-repo the same night
//  (scripts/regenerate-city-counts.mjs there). Same fix here: a single,
//  idempotent recompute pass rather than trusting whatever script last
//  wrote this file.
//
//  Usage: node scripts/regenerate-city-counts.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { licenceIsCurrent } from '../src/lib/licensing.js';

const BIZ_FILE = new URL('../src/data/businesses.json', import.meta.url);
const CITIES_FILE = new URL('../src/data/cities.json', import.meta.url);

const businesses = JSON.parse(readFileSync(BIZ_FILE, 'utf8'));
const cities = JSON.parse(readFileSync(CITIES_FILE, 'utf8'));

const beforeSum = cities.reduce((s, c) => s + c.count, 0);

const cityMap = new Map(cities.map((c) => [`${c.stateCode}|${c.citySlug}`, { ...c }]));
for (const b of businesses) {
  const k = `${b.stateCode}|${b.citySlug}`;
  if (!cityMap.has(k)) {
    cityMap.set(k, {
      city: b.city, citySlug: b.citySlug, state: b.state, stateCode: b.stateCode, stateSlug: b.stateSlug,
      count: 0, licensedCount: 0, withWebsite: 0, withAddress: 0, lat: b.lat, lng: b.lng,
    });
  }
}
for (const c of cityMap.values()) { c.count = 0; c.licensedCount = 0; c.withWebsite = 0; c.withAddress = 0; }
for (const b of businesses) {
  const c = cityMap.get(`${b.stateCode}|${b.citySlug}`);
  c.count++;
  // Counts what the pages will actually badge, not what holds a number:
  // an expired register record shows no badge, so counting it would leave
  // "N license-verified" on the city and state hubs overstating by one.
  // Re-run this script after any badge lapses (the build warns).
  if (licenceIsCurrent(b)) c.licensedCount++;
  if (b.website) c.withWebsite++;
  if (b.street || b.address) c.withAddress++;
}

// Deliberately NOT dropping cities that land at count 0 -- same reasoning
// as the AirProHQ version: removing a page entirely is a real indexing
// decision, not something a count-fix script should decide unilaterally.
const cityList = [...cityMap.values()]
  .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));

const afterSum = cityList.reduce((s, c) => s + c.count, 0);

writeFileSync(CITIES_FILE, JSON.stringify(cityList, null, 1));

console.log(`cities.json regenerated: ${cities.length} -> ${cityList.length} cities`);
console.log(`count sum: ${beforeSum} -> ${afterSum} (businesses.json has ${businesses.length})`);
if (afterSum !== businesses.length) {
  console.error(`MISMATCH: regenerated sum (${afterSum}) still does not equal businesses.json length (${businesses.length})`);
  process.exit(1);
}
console.log('OK: regenerated sum matches businesses.json exactly.');
