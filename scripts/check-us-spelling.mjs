// ---------------------------------------------------------------
//  CHECK US SPELLING  (Rules, 2026-10-31: "US spelling on the site")
//
//  Scans the BUILT output, not the source, and that is the whole design.
//  The source is full of identifiers that are legitimately British --
//  `licenceNumber` appears 789 times, plus `licenceInfo`, `licenceMeaning`,
//  `LICENCE_STATES`, `noLicenceGuidance` -- and renaming them buys a reader
//  nothing. dist/ holds only rendered text, so a hit here is always something
//  a visitor can actually see.
//
//  Why this exists: the 2026-10-31 audit found UK spelling on the license
//  badge ("Licence verified"), in the city template ("Labour rates in
//  {City}"), in the diagrams ("aluminium", "centre", "travelling") and in
//  llms.txt. The first sweep fixed them and still missed `call-outs` and
//  `centred`, because a `\bcall-out\b` pattern does not match the plural.
//  So the patterns here deliberately allow a trailing suffix.
//
//  It also caught a real bug the audit did not: global.css defined
//  `.badge-licence` while both usages were `.badge-license`, so the license
//  badge -- the site's entire differentiator -- had been rendering unstyled.
//  A spelling split between a stylesheet and its markup is invisible in
//  review and obvious to a machine.
//
//  Usage: node scripts/check-us-spelling.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

if (!existsSync(DIST)) {
  console.error('No dist/ -- run the build first. This check reads rendered output, not source.');
  process.exit(1);
}

// `(?![a-z])` where a suffix must NOT follow, and an explicit `[a-z]*` where
// one may. "licence" must not match "licences" differently -- both are wrong --
// so the forms that take suffixes get them.
const BRITISH = [
  [/\blicence[a-z]*/gi, 'license'],
  [/\blabour[a-z]*/gi, 'labor'],
  [/\bneighbour[a-z]*/gi, 'neighbor'],
  [/\bcentre[a-z]*/gi, 'center'],
  [/\baluminium/gi, 'aluminum'],
  [/\btravelling/gi, 'traveling'],
  [/\bcall-out[a-z]*/gi, 'service call'],
  [/\badverts?\b/gi, 'ad / ads'],
  [/\bcolour[a-z]*/gi, 'color'],
  // An explicit list of the -ise/-yse stems, NOT a general pattern.
  //
  // A general `[a-z]+is(e|ed|ing|ation)` pattern was tried first and fired on
  // "advertising", "surprising", "disguise" and "improvised" -- all correct US
  // English. A check that cries wolf is worse than no check: this codebase
  // already learned that lesson with the spam filter, where the fix was to put
  // reviewed items in an allowlist so the signal stays trustworthy. Precision
  // matters more than coverage here, because an ignored failing check protects
  // nothing.
  //
  // Stems only, so every inflection is covered: categoris/categorised/
  // categorising all match the one entry.
  [new RegExp(
    '\\b(?:' +
      [
        'organis', 'recognis', 'analys', 'personalis', 'authoris', 'apologis',
        'categoris', 'prioritis', 'summaris', 'standardis', 'specialis',
        'minimis', 'maximis', 'optimis', 'realis', 'utilis', 'emphasis(?=e|ed|ing)',
        'criticis', 'legitimis', 'normalis', 'synchronis', 'resynchronis',
        'customis', 'itemis', 'penalis', 'stabilis', 'visualis', 'characteris',
        'familiaris', 'neutralis', 'formalis', 'finalis', 'localis', 'paralys',
        'catalys', 'modernis', 'emphasis',
      ].join('|') +
      // Suffixes are ENUMERATED, not `[a-z]*`. The open version matched
      // "realistic" off the `realis` stem and "analysis"/"paralysis" off
      // theirs -- all correct US English. The British forms are only ever the
      // verb inflections, so those are the only endings worth matching.
      ')(?:e|ed|es|ing|ation|ations)\\b',
    'gi'
  ), '-ize / -ization / -yze'],
  // Doubled-L before a suffix: UK labelled/levelling, US labeled/leveling.
  // Included because "labelled" is in CLAIMS.placementMeaning, which is the
  // canonical sponsorship-disclosure string shown on five pages -- the exact
  // sort of high-visibility copy where a British spelling reads as a tell.
  // "cancelled" is deliberately absent: both spellings are current in US
  // English, so flagging it would be a false positive, and a check nobody
  // trusts is a check nobody reads.
  [/\b(?:label|level|model|signal|total|fuel|travel|marvel)l(?:ed|ing|er|ers)\b/gi, 'single l (labeled, leveling)'],
  [/\bfavour[a-z]*/gi, 'favor'],
  [/\bbehaviour[a-z]*/gi, 'behavior'],
  [/\bmetres?\b/gi, 'meters'],
  // "11 August 2026" rather than "August 11, 2026". A US-facing site reading
  // a date the foreign way around is the same class of tell as the spelling.
  [/\b\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4}\b/g, 'Month D, YYYY'],
];

// Font licence files are verbatim third-party text (SIL OFL). Rewriting
// someone else's licence to match a house style would be both wrong and,
// for the OFL, a condition violation.
const SKIP = /[\\/]fonts[\\/]|OFL|LICENSE|LICENCE\.txt/i;

const files = [];
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|txt|xml)$/i.test(p) && !SKIP.test(p)) files.push(p);
  }
};
walk(DIST);

const hits = new Map(); // "word -> us" => { count, pages:Set, sample }
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const [rx, us] of BRITISH) {
    for (const m of text.matchAll(rx)) {
      const key = `${m[0].toLowerCase()} -> ${us}`;
      if (!hits.has(key)) hits.set(key, { count: 0, pages: new Set(), sample: '' });
      const h = hits.get(key);
      h.count += 1;
      h.pages.add(f.slice(DIST.length + 1));
      if (!h.sample) {
        h.sample = text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60).replace(/\s+/g, ' ');
      }
    }
  }
}

console.log(`US spelling check -- ${files.length} built files scanned`);

if (!hits.size) {
  console.log('  OK: no British spellings or UK date formats in rendered output');
  process.exit(0);
}

console.error(`\n  FAIL: ${hits.size} British form(s) in rendered output:\n`);
for (const [key, h] of [...hits.entries()].sort((a, b) => b[1].count - a[1].count)) {
  const where = h.pages.size === 1 ? [...h.pages][0] : `${h.pages.size} pages, e.g. ${[...h.pages][0]}`;
  console.error(`    ${key}  (${h.count}x, ${where})`);
  console.error(`      ...${h.sample}...`);
}
console.error('\n  Rules (2026-10-31): US spelling on the site. Fix the source, not dist/.');
console.error('  Identifiers in source (licenceNumber, CLAIMS.licenceMeaning) are fine -- this only reads rendered text.');
process.exit(1);
