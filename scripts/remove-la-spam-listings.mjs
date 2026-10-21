// ---------------------------------------------------------------
//  REMOVE LA SPAM LISTINGS -- the 2026-10-16 Claude SEO audit's Critical
//  #1: 38 businesses literally named "Garage Door Los Angeles" (slugs
//  garage-door-los-angeles, -2 through -38), 41% of the entire LA city
//  page. Confirmed directly against the current data before writing this
//  script, not just trusting the audit: all 38 share the identical
//  generic name, 37 of 38 use a toll-free number, all 38 have a DIFFERENT
//  toll-free number from each other (classic call-tracking-per-listing
//  lead-gen pattern), none carry any license data, and they're scattered
//  across real-looking residential street addresses with no real
//  business behind them. This is the audit's own documented quarantine
//  rule: "3 or more listings with the same name in one metro, each with
//  a different phone number."
//
//  301s each removed listing's URL to its real city hub page rather than
//  leaving a bare 404 -- any crawler or bookmark that found one of these
//  URLs lands somewhere real instead of a dead end.
//
//  This is the FAST, scoped quick-win fix (Action Plan item 1's "quick
//  rule" half). The fuller spam-scoring pipeline across ALL listings
//  (toll-free-only, off-category, shared-address signals -- Action Plan
//  item 2) is a separate, larger piece not done by this script.
//
//  Usage: node scripts/remove-la-spam-listings.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const BIZ_FILE = new URL('../src/data/businesses.json', import.meta.url);
const REMOVED_FILE = new URL('../src/data/removed-listings.json', import.meta.url);
const VERCEL_FILE = new URL('../vercel.json', import.meta.url);

const businesses = JSON.parse(readFileSync(BIZ_FILE, 'utf8'));
const removed = JSON.parse(readFileSync(REMOVED_FILE, 'utf8'));
const vercel = JSON.parse(readFileSync(VERCEL_FILE, 'utf8'));

const today = new Date().toISOString().slice(0, 10);
const reason = 'Lead-generation spam: 38 listings literally named "Garage Door Los Angeles" (41% of the LA city page), 37/38 toll-free numbers, each with its own distinct toll-free number (call-tracking-per-listing pattern), no license data, no real business behind them. Flagged as the single Critical finding in the 2026-10-16 Claude SEO audit; redirected to the city page rather than left as a 404.';

const spam = businesses.filter((b) => /^garage door los angeles$/i.test(b.name));
if (spam.length !== 38) {
  console.error(`Expected exactly 38 "Garage Door Los Angeles" listings, found ${spam.length}. Stopping -- re-check before running.`);
  process.exit(1);
}

const remaining = businesses.filter((b) => !/^garage door los angeles$/i.test(b.name));
const newRemovedEntries = spam.map((b) => ({
  id: b.id,
  name: b.name,
  slug: b.slug,
  state: b.state,
  stateCode: b.stateCode,
  removedOn: today,
  reason,
}));

const cityPath = `/garage-door-repair/${spam[0].stateSlug}/${spam[0].citySlug}/`;
const newRedirects = spam.map((b) => ({
  source: `/garage-door-repair/${b.stateSlug}/${b.citySlug}/${b.slug}/`,
  destination: cityPath,
  permanent: true,
}));

writeFileSync(BIZ_FILE, JSON.stringify(remaining, null, 1));
writeFileSync(REMOVED_FILE, JSON.stringify([...removed, ...newRemovedEntries], null, 1));
vercel.redirects = [...vercel.redirects, ...newRedirects];
writeFileSync(VERCEL_FILE, JSON.stringify(vercel, null, 2) + '\n');

console.log(`Removed ${spam.length} spam listings from businesses.json (${businesses.length} -> ${remaining.length}).`);
console.log(`Logged ${newRemovedEntries.length} entries in removed-listings.json (${removed.length} -> ${removed.length + newRemovedEntries.length}).`);
console.log(`Added ${newRedirects.length} 301 redirects to ${cityPath} in vercel.json (${vercel.redirects.length - newRedirects.length} -> ${vercel.redirects.length}).`);
