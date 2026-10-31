// ---------------------------------------------------------------
//  REMOVE OFF-TRADE LISTINGS
//
//  Chris, 2026-10-31: "Anything that's not a garage door company,
//  Desert King Windows, remove them."
//
//  The 2026-10-31 audit found Houston listing about 20 glass, shower and
//  window firms among its 139 "garage door companies", and Phoenix ranking
//  "Desert King Windows" first. The listing template tells the reader each
//  entry "is listed as a garage door business", so this was not an untidy
//  directory, it was a page making a false statement about each of them.
//
//  WHY NOT JUST FILTER ON THE CATEGORY. The audit framed this as "205
//  listings aren't in Overture's garage_door_service category", but acting
//  on that alone would delete real companies. The 205 breaks down as:
//
//    door_sales_service            133   a door company very plausibly does
//                                        garage doors -- DH Pace and the
//                                        Wayne-Dalton Genie Sales Center are
//                                        both in here
//    contractor                     20   generic, says nothing either way
//    fence_and_gate_sales_service   10   gates are adjacent trade; lots of
//                                        real garage door firms do both
//    the rest                       ~42  windows, glass, locksmith, truck
//                                        dealer, a beauty salon
//
//  So the rule is two-signal and conservative:
//
//    REMOVE when the category cannot plausibly be a garage door company
//    (windows, glass, locksmith, automotive, salon, wholesale...) OR the
//    NAME reads as another trade -- and in both cases only when the record
//    carries no garage-door signal of its own.
//
//    KEEP every adjacent category. A "door sales service" with no garage
//    word in its name is ambiguous, and the cost of the two errors is not
//    symmetric: wrongly keeping an ambiguous listing leaves a directory
//    slightly less precise, wrongly deleting a real local business removes
//    a company's only listing here. 72 records sit in that bucket and are
//    reported, not touched.
//
//  Removals go through the logged path the Rules require -- a row in
//  removed-listings.json and a 301 to the city page -- never a silent
//  delete. Rules: "Never delete held records. Quarantine them."
//
//  Usage: node scripts/remove-off-trade-listings.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs';

const WRITE = process.argv.includes('--write');
const url = (p) => new URL(`../${p}`, import.meta.url);
const read = (p) => JSON.parse(readFileSync(url(p), 'utf8'));

const businesses = read('src/data/businesses.json');
const removed = read('src/data/removed-listings.json');

// Categories that cannot plausibly be a garage door company.
const OFF_CATEGORY = new Set([
  'windows_installation', 'key_and_locksmith', 'glass_and_mirror_sales_service',
  'beauty_salon', 'event_planning', 'automotive_repair', 'truck_dealer', 'parking',
  'damage_restoration', 'fire_protection_service', 'online_shop', 'wholesale_store',
  'electrical_wholesaler', 'business_management_services',
  'business_manufacturing_and_supply', 'home_improvement_store',
  'industrial_equipment', 'business', 'professional_services',
]);

// Adjacent categories. Listed here so the intent is explicit rather than
// implied by absence: these are DELIBERATELY kept.
const ADJACENT = new Set([
  'door_sales_service', 'contractor', 'fence_and_gate_sales_service', 'carpenter',
  'handyman', 'iron_work', 'automation_services', 'b2b_equipment_maintenance_and_repair',
]);

// Anything that marks the record as genuinely in the trade, which overrides
// both tests above. "Overhead Door" is the trade term as well as a brand;
// "opener" and "roll-up" are garage-door specific.
const GARAGE_SIGNAL = /garage|overhead\s*door|roll[-\s]?up|opener/i;

// Trades that are not this one. Matched on the name only when the record has
// no garage signal, so "Garage Door & Window Co" is kept.
const OTHER_TRADE = /\b(window|glass|shower|mirror|screen|awning|blind|solar|roofing|patio|salon|nails?|automotive|truck|carpet|plumb|pest|landscap|hvac|painter|moving)/i;

const hasGarageSignal = (b) =>
  GARAGE_SIGNAL.test(b.name) || b.sourceCategory === 'garage_door_service';

const toRemove = [];
const ambiguous = [];
for (const b of businesses) {
  if (hasGarageSignal(b)) continue;
  if (OFF_CATEGORY.has(b.sourceCategory)) {
    toRemove.push([b, `source category "${b.sourceCategory}" is not a garage door trade`]);
  } else if (OTHER_TRADE.test(b.name)) {
    toRemove.push([b, 'business name identifies a different trade']);
  } else if (ADJACENT.has(b.sourceCategory)) {
    ambiguous.push(b);
  }
}

// 79, and the 79th is worth naming because an earlier exploratory pass said
// 78. That pass treated /door.*gate/ as a garage signal, which spared
// "Powermaster Door & Gate Operators" (Anaheim, industrial_equipment,
// powermasteroperators.com). It is a manufacturer of commercial door and gate
// operators, not a local garage door contractor, so it belongs in the removal
// and the looser signal was simply wrong. Kept as an explicit count so a
// future data change cannot quietly widen the blast radius.
const EXPECTED = 79;
if (toRemove.length !== EXPECTED) {
  console.error(
    `Expected ${EXPECTED} off-trade listings, found ${toRemove.length}. ` +
      `Refusing to write -- the data moved since this was reviewed, so re-read the list first.`
  );
  process.exit(1);
}

console.log(`Removing ${toRemove.length} off-trade listings. ${businesses.length} -> ${businesses.length - toRemove.length}`);
const byState = new Map();
for (const [b] of toRemove) byState.set(b.stateCode, (byState.get(b.stateCode) || 0) + 1);
console.log('  by state:', [...byState.entries()].map(([s, n]) => `${s} ${n}`).join(', '));
console.log(`\nKeeping ${ambiguous.length} in adjacent categories (door sales, contractor, fence and gate, iron work).`);
console.log('  These are ambiguous, not clean: a door company may well do garage doors.');
console.log('  Reviewing them by hand is a separate job, and deleting a real business is the worse error.');

if (!WRITE) {
  console.log('\nDry run. Re-run with --write to apply.');
  process.exit(0);
}

const ids = new Set(toRemove.map(([b]) => b.id));
const kept = businesses.filter((b) => !ids.has(b.id));

const rows = toRemove.map(([b, why]) => ({
  source: `/garage-door-repair/${b.stateSlug}/${b.citySlug}/${b.slug}/`,
  destination: `/garage-door-repair/${b.stateSlug}/${b.citySlug}/`,
  id: b.id,
  name: b.name,
  slug: b.slug,
  state: b.state,
  stateCode: b.stateCode,
  removedOn: '2026-10-31',
  reason: `Not a garage door company: ${why}. Removed on Chris's instruction, 2026-10-31, after the audit found glass, window and shower firms listed as garage door businesses.`,
}));

writeFileSync(url('src/data/businesses.json'), `${JSON.stringify(kept, null, 2)}\n`);
writeFileSync(
  url('src/data/removed-listings.json'),
  `${JSON.stringify([...removed, ...rows].sort((a, b) => a.source.localeCompare(b.source)), null, 2)}\n`
);

console.log(`\nWritten. ${removed.length} logged removals -> ${removed.length + rows.length}.`);
console.log('Now run:  node scripts/regenerate-city-counts.mjs');
console.log('   then:  npm run build && python scripts/build-redirects.py');
