// ---------------------------------------------------------------
//  REMOVE "SOLUTIONS GARAGE CABINETS"
//
//  Chris, 2026-11-03: "remove solutions garage cabinets. For God's sake,
//  it's not supposed to be on there."
//
//  It is a garage CABINET and storage company in Phoenix, not a garage door
//  company. The 2026-11-02 audit flagged it, and it was still tagged
//  "emergency / 24-7" on the city page, so the new 24/7 list surfaced it as
//  somewhere to call at 2am about a door that will not open.
//
//  WHY THE OFF-TRADE SWEEP MISSED IT, which is the part worth keeping.
//  remove-off-trade-listings.mjs (2026-10-31) removed 79 window, glass and
//  shower firms, and this survived all three of its tests:
//
//    1. GARAGE_SIGNAL = /garage|overhead\s*door|roll[-\s]?up|opener/ matched
//       the word "Garage" in the name, and a garage signal overrides
//       everything else. But "garage" is not a garage-DOOR signal on a site
//       where cabinets, storage, flooring, epoxy and screens are all sold
//       "for your garage". That override is the bug.
//    2. Its sourceCategory is "contractor", which is on the deliberately
//       ADJACENT keep-list and says nothing either way.
//    3. OTHER_TRADE lists window, glass, shower, mirror, screen, awning and
//       fifteen more -- but not cabinet, closet, storage, organizer,
//       flooring or epoxy.
//
//  Its own `services` array even reads ["General contracting", "Locksmith",
//  "Garage door service"], so the source data claims a garage door service
//  it does not provide. That is Overture being wrong about a real business,
//  not us mis-reading it, and it is why the name has to be allowed to
//  overrule the category in BOTH directions.
//
//  SCOPE. This removes ONE record, by id, and refuses to run if that id is
//  not found or if the name has changed. Chris named one listing; removals
//  need his yes each time, and the Rules say to quarantine rather than
//  delete on our own judgement.
//
//  There is exactly one sibling in the same class: "Quick Response Garage
//  Cabinets" (Scottsdale AZ, filed under garage_door_service of all things,
//  quickresponsegaragecabinets.com). It is NOT touched here. It is reported
//  below and raised with Chris, because widening a named instruction into a
//  class is how a directory loses a real business.
//
//  Usage: node scripts/remove-garage-cabinet-listing.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs';

const WRITE = process.argv.includes('--write');
const url = (p) => new URL(`../${p}`, import.meta.url);
const read = (p) => JSON.parse(readFileSync(url(p), 'utf8'));

const TARGET_ID = 'da0196fb-6e58-4da6-b6cf-9a7859b21d9b';
const TARGET_NAME = 'Solutions Garage Cabinets';
const REMOVED_ON = '2026-11-03';

const businesses = read('src/data/businesses.json');
const removed = read('src/data/removed-listings.json');

const target = businesses.find((b) => b.id === TARGET_ID);
if (!target) {
  console.error(`No listing with id ${TARGET_ID}. Already removed, or the data moved. Refusing to guess.`);
  process.exit(1);
}
if (target.name !== TARGET_NAME) {
  console.error(`id ${TARGET_ID} is now named "${target.name}", not "${TARGET_NAME}". Refusing to remove the wrong record.`);
  process.exit(1);
}

console.log(`Removing: ${target.name} — ${target.street}, ${target.city}, ${target.stateCode}`);
console.log(`  category: ${target.sourceCategory}   website: ${target.website}`);
console.log(`  ${businesses.length} listings -> ${businesses.length - 1}`);

// Report the sibling rather than acting on it.
const SIBLING = /cabinet|closet|storage|organiz|organis|flooring|epoxy|shelv/i;
const siblings = businesses.filter((b) => b.id !== TARGET_ID && SIBLING.test(b.name));
console.log(`\nSame class, NOT removed (${siblings.length}) — needs Chris's yes separately:`);
for (const b of siblings) {
  console.log(`  ${b.name} — ${b.city}, ${b.stateCode} (${b.sourceCategory}) ${b.website || ''}`);
}

if (!WRITE) {
  console.log('\nDry run. Re-run with --write to apply.');
  process.exit(0);
}

const kept = businesses.filter((b) => b.id !== TARGET_ID);
const row = {
  source: `/garage-door-repair/${target.stateSlug}/${target.citySlug}/${target.slug}/`,
  destination: `/garage-door-repair/${target.stateSlug}/${target.citySlug}/`,
  id: target.id,
  name: target.name,
  slug: target.slug,
  state: target.state,
  stateCode: target.stateCode,
  removedOn: REMOVED_ON,
  reason:
    "Not a garage door company: it sells garage cabinets and storage. Removed on Chris's instruction, 2026-11-03. "
    + 'The 2026-10-31 off-trade sweep missed it because the word "garage" in a business name counted as a garage-door '
    + 'signal and overrode every other test, and because its source category is the deliberately-kept "contractor". '
    + 'Its Overture services array claims "Garage door service", which it does not provide.',
};

writeFileSync(url('src/data/businesses.json'), `${JSON.stringify(kept, null, 2)}\n`);
writeFileSync(
  url('src/data/removed-listings.json'),
  `${JSON.stringify([...removed, row].sort((a, b) => a.source.localeCompare(b.source)), null, 2)}\n`
);

console.log(`\nWritten. ${removed.length} logged removals -> ${removed.length + 1}.`);
console.log('Now run:  node scripts/regenerate-city-counts.mjs');
console.log('   then:  npm run build && python scripts/build-redirects.py');
