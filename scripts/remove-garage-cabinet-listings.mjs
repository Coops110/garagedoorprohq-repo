// ---------------------------------------------------------------
//  REMOVE GARAGE CABINET LISTINGS
//
//  Garage CABINET and storage companies, which are not garage door
//  companies. Two of them, each removed on Chris's explicit instruction and
//  each recorded below with the words he used and the date.
//
//  Chris, 2026-11-03: "remove solutions garage cabinets. For God's sake,
//  it's not supposed to be on there."
//  Chris, 2026-11-03, when the sibling was put to him: "Yes, remove it."
//
//  WHY THE OFF-TRADE SWEEP MISSED BOTH, which is the part worth keeping.
//  remove-off-trade-listings.mjs (2026-10-31) removed 79 window, glass and
//  shower firms. These two survived it, for overlapping reasons:
//
//    1. GARAGE_SIGNAL = /garage|overhead\s*door|roll[-\s]?up|opener/ matched
//       the word "Garage" in both names, and a garage signal overrides every
//       other test. But "garage" is not a garage-DOOR signal on a site where
//       cabinets, storage, closets, organizers, flooring, epoxy and screens
//       are all sold "for your garage". That override is the bug.
//    2. OTHER_TRADE lists window, glass, shower, mirror, screen, awning and
//       fifteen more -- but not cabinet, closet, storage, organizer,
//       flooring or epoxy.
//    3. Neither category test could have saved it. Solutions is filed under
//       "contractor", which is on the deliberately-kept ADJACENT list and
//       says nothing either way. Quick Response is filed under
//       "garage_door_service" -- the site's own core category -- and its
//       services array reads ["Garage door service"]. Solutions' reads
//       ["General contracting", "Locksmith", "Garage door service"].
//
//  So in both cases the SOURCE DATA claims a garage door service the
//  business does not provide. That is Overture being wrong about a real
//  business, not us mis-reading it, and it is why a name has to be allowed
//  to overrule a category in BOTH directions -- not only when the name looks
//  worse than the category.
//
//  SCOPE AND SAFETY. Removals are by id, from the fixed table below. The
//  script refuses to run if an id is present with a different name, and
//  skips an id that is already gone so it is safe to re-run. It will not act
//  on anything not listed here: Chris approves each listing, one at a time,
//  and a named instruction is not permission for the class. Any further
//  sibling is printed for him, never removed.
//
//  Usage: node scripts/remove-garage-cabinet-listings.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs';

const WRITE = process.argv.includes('--write');
const url = (p) => new URL(`../${p}`, import.meta.url);
const read = (p) => JSON.parse(readFileSync(url(p), 'utf8'));

const APPROVED = [
  {
    id: 'da0196fb-6e58-4da6-b6cf-9a7859b21d9b',
    name: 'Solutions Garage Cabinets',
    removedOn: '2026-11-03',
    reason:
      "Not a garage door company: it sells garage cabinets and storage. Removed on Chris's instruction, 2026-11-03. "
      + 'The 2026-10-31 off-trade sweep missed it because the word "garage" in a business name counted as a garage-door '
      + 'signal and overrode every other test, and because its source category is the deliberately-kept "contractor". '
      + 'Its Overture services array claims "Garage door service", which it does not provide.',
  },
  {
    id: '086f8f5d-8452-4631-80aa-f2da09c80e1e',
    name: 'Quick Response Garage Cabinets',
    removedOn: '2026-11-03',
    reason:
      "Not a garage door company: it sells garage cabinets and storage. Removed on Chris's instruction, 2026-11-03, "
      + 'after it was raised as the only sibling of Solutions Garage Cabinets. This one was filed under the site\'s own '
      + 'core source category, "garage_door_service", with a services array reading ["Garage door service"] — so no '
      + 'category test could have caught it and only the name identifies the trade.',
  },
];

const businesses = read('src/data/businesses.json');
const removed = read('src/data/removed-listings.json');

const targets = [];
for (const a of APPROVED) {
  const b = businesses.find((x) => x.id === a.id);
  if (!b) {
    console.log(`  already removed, skipping: ${a.name}`);
    continue;
  }
  if (b.name !== a.name) {
    console.error(`id ${a.id} is now named "${b.name}", not "${a.name}". Refusing to remove the wrong record.`);
    process.exit(1);
  }
  targets.push([b, a]);
}

if (targets.length === 0) {
  console.log('\nNothing to do.');
  process.exit(0);
}

console.log(`Removing ${targets.length}:`);
for (const [b] of targets) {
  console.log(`  ${b.name} — ${b.street}, ${b.city}, ${b.stateCode}`);
  console.log(`    category: ${b.sourceCategory}   services: ${JSON.stringify(b.services)}`);
}
console.log(`  ${businesses.length} listings -> ${businesses.length - targets.length}`);

// Any further sibling is reported, never removed.
const SIBLING = /cabinet|closet|storage|organiz|organis|flooring|epoxy|shelv/i;
const ids = new Set(APPROVED.map((a) => a.id));
const siblings = businesses.filter((b) => !ids.has(b.id) && SIBLING.test(b.name));
console.log(`\nSame class, NOT removed (${siblings.length}) — each needs Chris's yes separately:`);
for (const b of siblings) {
  console.log(`  ${b.name} — ${b.city}, ${b.stateCode} (${b.sourceCategory}) ${b.website || ''}`);
}
if (siblings.length === 0) console.log('  (none)');

if (!WRITE) {
  console.log('\nDry run. Re-run with --write to apply.');
  process.exit(0);
}

const kept = businesses.filter((b) => !ids.has(b.id));
const rows = targets.map(([b, a]) => ({
  source: `/garage-door-repair/${b.stateSlug}/${b.citySlug}/${b.slug}/`,
  destination: `/garage-door-repair/${b.stateSlug}/${b.citySlug}/`,
  id: b.id,
  name: b.name,
  slug: b.slug,
  state: b.state,
  stateCode: b.stateCode,
  removedOn: a.removedOn,
  reason: a.reason,
}));

// Anything already logged keeps its original row rather than gaining a second.
const alreadyLogged = new Set(removed.map((r) => r.id));
const newRows = rows.filter((r) => !alreadyLogged.has(r.id));

writeFileSync(url('src/data/businesses.json'), `${JSON.stringify(kept, null, 2)}\n`);
writeFileSync(
  url('src/data/removed-listings.json'),
  `${JSON.stringify([...removed, ...newRows].sort((a, b) => a.source.localeCompare(b.source)), null, 2)}\n`
);

console.log(`\nWritten. ${removed.length} logged removals -> ${removed.length + newRows.length}.`);
console.log('Now run:  node scripts/regenerate-city-counts.mjs');
console.log('   then:  npm run build && python scripts/build-redirects.py');
