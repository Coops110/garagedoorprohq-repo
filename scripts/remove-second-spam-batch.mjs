// ---------------------------------------------------------------
//  REMOVE SECOND SPAM BATCH -- found independently by the new
//  validate-data-consistency.mjs spam-cluster check, not in the original
//  2026-10-16 audit report: 2 more name/metro clusters sharing the exact
//  fake-local-presence pattern as the already-removed 38 "Garage Door
//  Los Angeles" listings --
//
//  - "Local Garage Door Repair" x6 (Anaheim, Orange x3, Placentia x2) --
//    all 6 link to the SAME site, garagedoorrepairsusa.com, each with a
//    different real-looking street address and phone number.
//  - "Garage Door Santa Monica" x3 -- 2 of 3 link to garagedoorngates.com,
//    same city-name-as-business-name pattern as the original spam.
//
//  Checked and deliberately NOT touching the other 3 clusters the same
//  validator flagged: "A1 Garage Door Service" (6 in Phoenix metro, 3 in
//  Orlando) is a real national chain -- each listing links to its own
//  real page on a1garage.com/locations/... "Garage Door Repair" x3 (LA,
//  Redondo Beach, Pico Rivera) has three different websites and no
//  shared-domain or city-name-pattern signal, so there isn't enough
//  evidence to call it the same spam pattern.
//
//  Usage: node scripts/remove-second-spam-batch.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const BIZ_FILE = new URL('../src/data/businesses.json', import.meta.url);
const REMOVED_FILE = new URL('../src/data/removed-listings.json', import.meta.url);
const VERCEL_FILE = new URL('../vercel.json', import.meta.url);

const businesses = JSON.parse(readFileSync(BIZ_FILE, 'utf8'));
const removed = JSON.parse(readFileSync(REMOVED_FILE, 'utf8'));
const vercel = JSON.parse(readFileSync(VERCEL_FILE, 'utf8'));

const today = new Date().toISOString().slice(0, 10);
const targetNames = new Set(['local garage door repair', 'garage door santa monica']);
const spam = businesses.filter((b) => targetNames.has(b.name.toLowerCase()));

if (spam.length !== 9) {
  console.error(`Expected exactly 9 listings (6 "Local Garage Door Repair" + 3 "Garage Door Santa Monica"), found ${spam.length}. Stopping -- re-check before running.`);
  process.exit(1);
}

const remaining = businesses.filter((b) => !targetNames.has(b.name.toLowerCase()));

const reasonFor = (b) => b.name.toLowerCase() === 'local garage door repair'
  ? 'Lead-generation spam: generic name, scattered fake street addresses across Anaheim/Orange/Placentia, no license data, all 6 listings under this name link to the same underlying site (garagedoorrepairsusa.com). Found independently by validate-data-consistency.mjs while investigating the 2026-10-16 audit\'s Critical #1 (same fake-local-presence pattern as the 38 already-removed "Garage Door Los Angeles" listings).'
  : 'Lead-generation spam: name is the city-name pattern ("Garage Door" + city), no license data, 2 of 3 listings under this name link to the same underlying site (garagedoorngates.com). Found independently by validate-data-consistency.mjs while investigating the 2026-10-16 audit\'s Critical #1 (same pattern as the 38 already-removed "Garage Door Los Angeles" listings).';

const newRemovedEntries = spam.map((b) => ({
  id: b.id,
  name: b.name,
  slug: b.slug,
  state: b.state,
  stateCode: b.stateCode,
  removedOn: today,
  reason: reasonFor(b),
}));

const newRedirects = spam.map((b) => ({
  source: `/garage-door-repair/${b.stateSlug}/${b.citySlug}/${b.slug}/`,
  destination: `/garage-door-repair/${b.stateSlug}/${b.citySlug}/`,
  permanent: true,
}));

writeFileSync(BIZ_FILE, JSON.stringify(remaining, null, 1));
writeFileSync(REMOVED_FILE, JSON.stringify([...removed, ...newRemovedEntries], null, 1));
vercel.redirects = [...vercel.redirects, ...newRedirects];
writeFileSync(VERCEL_FILE, JSON.stringify(vercel, null, 2) + '\n');

console.log(`Removed ${spam.length} spam listings from businesses.json (${businesses.length} -> ${remaining.length}).`);
console.log(`Logged ${newRemovedEntries.length} entries in removed-listings.json.`);
console.log(`Added ${newRedirects.length} 301 redirects in vercel.json.`);
