// Writes public/_redirects for Cloudflare Workers static assets from the
// redirects in vercel.json, on every build.
//
// vercel.json stays the one list: build-redirects.py and the remove-*.mjs
// scripts all write there, and a hand-copied _redirects would drift from it
// the first time one of them ran. public/_redirects is gitignored for the
// same reason.
//
// Each source is emitted twice, with and without its trailing slash. Vercel
// adds the slash before it evaluates redirects, so one slashed rule covered
// both forms there. Cloudflare does not: its trailing-slash handling only acts
// on a path that has a real file behind it, and a redirect source never does,
// so /foo would 404 against a table that only holds /foo/.
//
// The www -> apex rule (the one with a `has` host condition) is skipped:
// _redirects cannot match on host, so that lives in a Cloudflare Redirect Rule.

import { readFileSync, writeFileSync } from 'node:fs';

// Cloudflare's limit for static (no placeholder, no splat) redirects.
const STATIC_LIMIT = 2000;

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const lines = [];
const seen = new Set();

for (const r of vercel.redirects || []) {
  if (r.has) continue;
  const status = r.statusCode || (r.permanent === false ? 307 : 308);
  if (/[\s*:]/.test(r.source) || /\s/.test(r.destination)) {
    console.error(`[cloudflare-redirects] cannot port pattern rule: ${r.source}`);
    process.exit(1);
  }
  const bare = r.source.replace(/\/+$/, '');
  for (const src of [bare + '/', bare]) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    lines.push(`${src} ${r.destination} ${status}`);
  }
}

if (lines.length > STATIC_LIMIT) {
  console.error(`[cloudflare-redirects] ${lines.length} rules is over Cloudflare's ${STATIC_LIMIT} static redirect limit`);
  process.exit(1);
}

writeFileSync(
  new URL('../public/_redirects', import.meta.url),
  '# Generated from vercel.json by scripts/write-cloudflare-redirects.mjs. Do not edit.\n' +
    lines.join('\n') + '\n',
);
console.log(`[cloudflare-redirects] wrote ${lines.length} rules to public/_redirects`);
