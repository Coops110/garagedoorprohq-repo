# GarageDoorHQ

USA garage door contractor directory and cost guides. Astro static site,
deployed on Vercel. Sibling to AirProHQ (HVAC) and RigFloorHQ.

## Quick start

```bash
npm install
npm run dev
```

```bash
npm run build
```

`build` runs `check-pages` and `check-content` first and fails on either.

## The full verification pass

Run all of it before a deploy. Each one exits non-zero on failure.

```bash
npm run build && python scripts/check-seo.py && python scripts/check-links.py && python scripts/build-redirects.py
```

| Script | Checks |
|---|---|
| `scripts/check-pages.mjs` | Every page uses `BaseLayout`, has a title, and has a canonical unless noindexed |
| `scripts/check-content.mjs` | Reciprocal cross-links, unique keywords, agreeing cost figures, word-count floors |
| `scripts/check-seo.py` | Built HTML: title ≤60, description 70–155, one `h1`, unique canonicals, image alt, inline SVG labelled or decorative, no callout marker clipped by its viewBox |
| `scripts/check-links.py` | No internal link in the built site points at a missing page |
| `scripts/build-redirects.py` | Writes `vercel.json`; rejects any rule with a missing destination or a real page as its source |

## Data pipeline

Base layer is **Foursquare Open Source Places via Overture Maps** (Apache 2.0) —
free for commercial use *and* legal to redistribute. Unlike AirProHQ, this trade
has no national licence register to build on: only CA, FL and AZ license garage
door work specifically.

```bash
pip install duckdb
python scripts/overture-pilot-pull.py              # ~30 min, 74M row S3 scan
python scripts/overture-pilot-pull.py --from-cache  # seconds, re-classify only
python scripts/stage-listings.py --min-city=3
```

Run order is enforced by convention, not by code — see `CLAUDE.md`. The pull
writes `data-work/`; staging reads it and writes `src/data/`. Nothing reads and
writes the same file.

### Current pilot data

Release 2026-07-22.0, four metros (Houston TX, Phoenix AZ, Los Angeles CA,
Orlando FL):

| | |
|---|---|
| Category-verified, deduplicated | 1,004 |
| Clears the publish bar (phone + city) | 998 (99.4%) |
| Published (city ≥ 3 listings) | 852 |
| Held below threshold | 146 |
| City pages | 84 |
| Quarantined for human review | 223 → `data-work/pilot-review.csv` |
| Dropped | 2 (both commercial loading-dock firms) |

Field fill rate on the published tier: **phone 99.4%, address 99.7%, city 100%,
website 84.6%**. That answers the open question in `LESSONS-LEARNED.md` — Overture
alone is a strong enough base layer for contactability, so no second
corroborating source is needed just to publish. A second source is still needed
for the CA/FL/AZ licence cross-match, which is not yet built.

## Publishing in batches

`BUILD-PLAN.md` gates publishing on indexing, not on the calendar. The staged
data currently covers all four pilot metros at once, which is batch 2 territory.
To publish batch 1 only:

```bash
python scripts/stage-listings.py --min-city=3 --metros=houston_tx
```

Then rebuild, re-run `build-redirects.py`, and deploy. Widen the `--metros` list
as each batch clears its gate.

## Before the first deploy

Three values in `src/lib/site.js` are intentionally empty and must be set to
this site's own — not AirProHQ's. See `CLAUDE.md`.

- `GA_ID` — a new GA4 property
- `SITE.web3FormsKey` — a key registered to this site's contact address
- `GSC_VERIFICATION` — only if verifying by meta tag rather than DNS

## Structure

```
src/lib/site.js        identity, claims wording, consent config — single source of truth
src/lib/data.js        listing accessors (no ratings — see the header comment)
src/lib/guides.js      published guides + PLANNED keyword map
src/lib/glossary.js    DefinedTerm pages
src/lib/licensing.js   CA/FL/AZ registers and verification steps
src/lib/schema.js      JSON-LD builders
src/lib/seo.js         title/description budget helpers
src/lib/diagrams.js    diagram captions + legends (words live here, not in the SVG)
src/lib/costmap.js     cost-map anchors, matched onto a guide's own costTable
src/components/diagrams/  authored inline SVG — no photography, see CLAUDE.md
src/pages/garage-door-repair/[state]/[city]/[business]/
src/pages/guides/, src/pages/glossary/
```

## Not linked to the sister sites yet

`SISTER_SITES.disclose` in `site.js` is `false`, deliberately. A brand new domain
trading site-wide reciprocal footer links with two established ones is the
footprint Google's link spam policy describes, and this domain has no indexing
history to spend on it. Flip the flag once indexing is stable to surface an
ownership disclosure on `/about/`; add in-content cross-links by hand, in
individual guides where the other site's page is genuinely the better answer.
