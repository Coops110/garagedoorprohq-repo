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

// 2026-10-21: an identical-name cluster alone is NOT a reliable spam
// signal on its own -- "A1 Garage Door Service" legitimately has 6 real
// listings in the Phoenix metro, each a real distinct location page on
// a1garage.com/locations/... The actual spam signature (the 38 "Garage
// Door Los Angeles" listings, and the 9 found independently the same
// night) is identical-name PLUS 2+ listings in the cluster sharing the
// exact same website URL -- a real multi-location chain has a different
// page per location; lead-gen spam reuses one URL across fake listings.
const byMetroName = new Map();
for (const b of businesses) {
  const key = `${b.metro || b.citySlug}|${b.name.toLowerCase()}`;
  if (!byMetroName.has(key)) byMetroName.set(key, []);
  byMetroName.get(key).push(b);
}
const spamClusters = [...byMetroName.entries()].filter(([, list]) => {
  if (list.length < 3) return false;
  const websiteCounts = new Map();
  for (const b of list) {
    if (!b.website) continue;
    websiteCounts.set(b.website, (websiteCounts.get(b.website) || 0) + 1);
  }
  return [...websiteCounts.values()].some((n) => n >= 2);
});
if (spamClusters.length) {
  // Warning, not a build failure: a real multi-location chain (A1 Garage
  // Door Service, 6 real Phoenix-metro locations on a1garage.com) can
  // still trip this -- two of its real locations happen to share one
  // exact URL, which reads the same as the spam pattern to this simple a
  // heuristic. Telling a real company's duplicate record apart from fake
  // scattered listings needs a human look, not an automated hard-fail.
  console.warn(`WARN: ${spamClusters.length} name/metro cluster(s) with 3+ identical-name listings sharing a website URL, e.g. "${spamClusters[0][0].split('|')[1]}" x${spamClusters[0][1].length} -- review by hand for the lead-gen spam pattern from the 2026-10-16 audit's Critical #1, or a real company's duplicate record.`);
} else {
  ok(`no 3+-identical-name spam clusters found`);
}

if (failed) {
  console.error('\nData consistency check failed -- see FAIL lines above.');
  process.exit(1);
}
console.log('\nAll data consistency checks passed.');
