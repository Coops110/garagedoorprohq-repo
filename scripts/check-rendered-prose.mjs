// ---------------------------------------------------------------
//  CHECK RENDERED PROSE
//
//  Fails the build when two words have run together in visible copy.
//
//  Why this exists: in JSX an interpolation that ends a line in TEXT position
//  loses the newline entirely. With `{lic.authority}` alone at the end of a
//  line, 59 live city pages read
//
//      "you can confirm it on the Arizona Registrar of Contractors
//       (ROC)register without any expertise"
//
//  Nothing about the source looked wrong. The defect existed only in the
//  rendered output, which is why this check reads dist/ and not src/ -- the
//  same design as check-us-spelling.mjs, and for the same reason.
//
//  WHY NODE AND NOT check-seo.py. The glue rules lived in check-seo.py first,
//  which was the wrong home: check-seo.py is Python, Python on this project is
//  local-only by convention (same reasoning as Pillow for the OG images), and
//  prebuild/postbuild are all Node. So Cloudflare never ran it, and a check
//  that only runs when a person remembers to run it did not stop the bug it
//  was written for. Here it gates every build, including Cloudflare's, with no
//  new runtime on the builder. The rules live HERE and only here, so the two
//  cannot drift.
//
//  ── PRECISION OVER COVERAGE ──
//
//  Every rule below was chosen by running it against the real build first and
//  keeping only the ones that fire ZERO times on a clean one. That is the bar,
//  because an ignored failing check protects nothing -- the same lesson the
//  -ise/-yse patterns in check-us-spelling.mjs already learned.
//
//  Measured and REJECTED on that ground:
//    lowercase-then-uppercase   7,207 hits -- "GarageDoorProHQ", business names
//    period-then-lowercase         24 hits -- email addresses, raw-domain names
//    digit-then-letter            423 hits -- postcodes, street numbers
//    comma-then-letter              1 hit  -- a real defect, in the company
//                                             address ("GarageDoorProHQ ,Unit
//                                             173637"); too thin a signal to
//                                             gate a build on, logged instead
//
//  WHAT THIS DOES NOT CATCH: glue between two lowercase words. A bare
//  `{lic.state}` would render "Arizonalicenses" and no rule here sees it,
//  because telling that from a real word needs a dictionary. This narrows the
//  hole; it does not close it. Do not read a pass here as proof that no
//  interpolation lost its space.
//
//  Usage: node scripts/check-rendered-prose.mjs   (runs in postbuild)
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

if (!existsSync(DIST)) {
  console.error('No dist/ -- run the build first. This check reads rendered output, not source.');
  process.exit(1);
}

const GLUE = [
  [/\)[A-Za-z]/g, 'closing paren followed by a letter'],
  // `(?![a-z]{1,3}\))` exempts the "(s)" plural idiom. Without it the SIL OFL
  // font licence's "Holder(s)" fired, and ordinary copy like "listing(s)"
  // would too -- both correct English. "Contractors(ROC)" is still caught,
  // because ROC is uppercase.
  [/[A-Za-z]\((?![a-z]{1,3}\))/g, 'letter followed by an opening paren'],
  [/:[A-Za-z]/g, 'colon followed by a letter'],
  [/;[A-Za-z]/g, 'semicolon followed by a letter'],
];

// Same third-party exemption as check-us-spelling.mjs: the SIL OFL text is
// verbatim and not ours to restyle.
const SKIP = /[\\/]fonts[\\/]|OFL|LICENSE|LICENCE\.txt/i;

// These legitimately carry colons, semicolons and parens: CSS declarations,
// JSON-LD, SVG path data and the <head>. Only visible prose is checked.
const NON_PROSE = [
  /<head[\s\S]*?<\/head>/gi,
  /<script[\s\S]*?<\/script>/gi,
  /<style[\s\S]*?<\/style>/gi,
  /<svg[\s\S]*?<\/svg>/gi,
];

// URLs, emails and URI schemes carry colons and parens by design. None is in
// today's output as visible text, but a page that adds one must not read as a
// defect.
const URLISH = /https?:\/\/\S+|\b[\w.+-]+@[\w.-]+\.\w+|\b(?:mailto|tel):\S+/g;

const prose = (text, isHtml) => {
  let t = text;
  if (isHtml) {
    for (const rx of NON_PROSE) t = t.replace(rx, ' ');
    t = t.replace(/<[^>]*>/g, ' ');
  }
  // Drop entities wholesale rather than decoding them. A missed entity would
  // leave its trailing ";" against the next word and read as glue.
  t = t.replace(/&[#\w]+;/g, ' ');
  return t.replace(URLISH, ' ');
};

const files = [];
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|txt|xml)$/i.test(p) && !SKIP.test(p)) files.push(p);
  }
};
walk(DIST);

const hits = [];
for (const f of files) {
  const raw = readFileSync(f, 'utf8');
  const text = prose(raw, /\.html$/i.test(f));
  for (const [rx, what] of GLUE) {
    rx.lastIndex = 0;
    const m = rx.exec(text);
    if (m) {
      const around = text.slice(Math.max(0, m.index - 45), m.index + 30).replace(/\s+/g, ' ').trim();
      hits.push({ page: f.slice(DIST.length + 1), what, around });
    }
  }
}

console.log(`Rendered prose check -- ${files.length} built files scanned`);

if (!hits.length) {
  console.log('  OK: no words glued together in visible copy');
  process.exit(0);
}

const byKind = new Map();
for (const h of hits) {
  if (!byKind.has(h.what)) byKind.set(h.what, []);
  byKind.get(h.what).push(h);
}

console.error(`\n  FAIL: ${hits.length} page(s) with words glued together:\n`);
for (const [what, list] of [...byKind.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.error(`    ${what}  (${list.length} page(s))`);
  for (const h of list.slice(0, 4)) {
    console.error(`      ${h.page}`);
    console.error(`        ...${h.around}...`);
  }
  if (list.length > 4) console.error(`      ... and ${list.length - 4} more`);
}
console.error('\n  Almost always an interpolation that ended a line in text position and');
console.error('  swallowed its space. Add an explicit {\' \'} or keep the next word on the');
console.error('  same line. Fix the source, not dist/.');
process.exit(1);
