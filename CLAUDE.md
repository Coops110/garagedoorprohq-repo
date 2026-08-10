# Working on GarageDoorHQ

Rules for this repo. Most were carried over from AirProHQ and RigFloorHQ,
where ignoring them caused a real shipped bug; the ones marked **new here**
were learned building this site.

## The domain and the config

`src/lib/site.js` is the single source of truth for identity. `astro.config.mjs`,
`sitemap.xml`, `llms.txt`, `robots.txt` and every canonical and OG tag read from
it. Change the domain there and nowhere else.

Three values are **deliberately empty** and must be filled with values
belonging to *this* site, not copied from AirProHQ:

- `GA_ID` — a new GA4 property. Pasting AirProHQ's `G-TFRNDW8TK5` merges two
  sites' traffic into one property and neither set of numbers is usable
  afterwards.
- `SITE.web3FormsKey` — a key registered to `contact@garagedoorhq.com`.
  AirProHQ's key would post GarageDoorHQ enquiries into the AirProHQ inbox.
  `/get-listed/` shows a mailto fallback until this is set.
- `GSC_VERIFICATION` — only needed if verifying by meta tag. Domain-level DNS
  TXT verification is preferred and needs nothing here.

## Deploying

`git push origin main` deploys via Vercel once the project is linked. There is
no manual deploy step.

**Do not poll the live site in a loop after pushing.** On AirProHQ, repeated
`curl` in an `until` loop tripped Vercel's bot mitigation and got every
scripted request 403'd for hours. Wait once, check once, or use a browser.

## What this site is allowed to claim

The differentiator is honesty about a weak evidence base, not a strong one.

- **There are no ratings and no opening hours, and there must never be.**
  Overture / Foursquare Open Source Places (Apache 2.0) is the only business
  dataset that may lawfully be stored and republished, and it contains neither.
  Google Places contains both and forbids rehosting — buying it from a scraper
  does not change that, because the restriction follows the data. A rating on
  this site could only come from somewhere we are not entitled to take it from.
  `src/lib/data.js` has no rating accessor and `schema.js` emits no
  `aggregateRating`; keep it that way. A fabricated `aggregateRating` is also a
  structured-data spam violation, not merely inaccurate.
- **Licence verification means exactly one thing** and the wording lives in
  `CLAIMS.licenceMeaning` in `site.js` so it cannot drift between a badge, the
  editorial guidelines, `llms.txt` and the terms: *we check licence numbers
  against the state register; we do not inspect workmanship.*
- Only **CA, FL and AZ** license the trade (`src/lib/licensing.js`). In the
  other 47 states, pages must say there is no register to check rather than
  leaving a missing badge to read as a failed check.
- Terms of service says we "do not endorse, recommend, certify, vet or
  guarantee" any listing. Never write copy that contradicts it.

**new here** — AirProHQ's terms say "We do not verify licences" while its
listing badges say "State licence verified". That contradiction is exactly what
this rule exists to prevent; GarageDoorHQ's `/terms/` states what *is* verified
and what is not, in the same paragraph.

## Data pipeline

Order matters. Each script's header comment repeats this.

1. `python scripts/overture-pilot-pull.py` → `data-work/pilot-*.json|csv`
2. `python scripts/stage-listings.py [--min-city=3] [--metros=…]` → `src/data/`
3. `npm run build` (runs `check-pages` + `check-content` first)
4. `python scripts/build-redirects.py` — validates against `dist/`
5. `python scripts/check-links.py` and `python scripts/check-seo.py`

**Reading and writing separate directories is deliberate.** The pull writes
`data-work/`, the staging script reads it and writes `src/data/`. On AirProHQ a
script that read and wrote one file left a rejected record holding the address
from the previous run, so a fix appeared not to work. Different directories make
that class of bug impossible rather than merely unlikely.

`--from-cache` re-runs classification against `data-work/pilot-raw.json`. The
S3 scan reads 74M rows and takes about 30 minutes; tuning a filter should cost
seconds.

### The Overture category is `garage_door_service`

Verified against release 2026-07-22.0. Not `garage_door_supplier`, which does
not exist in the taxonomy. `door_sales_service` is the adjacent category.

### **new here** — for this trade, the category field is unreliable in one direction

The word "garage" pulls mis-categorisation toward `automotive_repair`,
`gas_station` and other car-related labels far more than chance. "M.G.A Garage
Door Repair Houston TX" is filed under `automotive_repair`.

So **never exclude a name match on its category.** Two earlier versions of
`classify()` did, and between them silently dropped ~120 unmistakably real
companies. A name match is quarantined on the strength of the name; the category
goes into the review CSV for a person to weigh. Filtering is done by
`EXCLUDE_NAME`, because a name is the one field a business states plainly.

More generally: an unfamiliar value should mean "somebody should look at this",
never "delete it". Nothing in `data-work/` can reach the site without a human
promoting it, so over-quarantining costs a longer review file and over-dropping
costs a business you never see again.

### The publish bar

A record is published only if it is category-verified (tier A), currently
operating, has a phone, has a city, and sits in a city with at least
`--min-city` listings. Held-back records stay in
`data-work/held-below-threshold.json` and publish automatically once the city
qualifies — they are never deleted.

## Content rules

- New guides go in `src/lib/guides.js`; glossary terms in `src/lib/glossary.js`.
  `scripts/check-content.mjs` fails the build on: non-reciprocal `related` or
  `also`, a duplicate `keyword` across published *and* `PLANNED` guides, an
  unresolvable cross-reference, a cost range that disagrees between guides, or a
  guide under 700 / glossary term under 200 body words.
- **Figures must agree site-wide.** City and business pages read cost rows from
  the guide that owns them rather than restating them, so the two cannot drift.
  A draft on AirProHQ claimed capacitors cost $150–450 while the neighbouring
  guide said $100–250.
- **Never publish two pages targeting one keyword.** `PLANNED` exists so the
  keyword map stays visible. Two entries in `BUILD-PLAN.md` were merged for this
  reason — see the note above `PLANNED`.
- Measure phrase overlap and word count on the **article body only**. A whole
  rendered page includes the shared nav and footer, which makes every page look
  like every other page and produces a number that means nothing.
- **No spring or cable repair instructions, ever**, regardless of search demand.
  `/guides/why-diy-spring-repair-is-dangerous/` is a deliberate refusal, not an
  incomplete tutorial. A partial instruction is more dangerous than none.
- Only finished guides go in `guides`. No stub pages — thin pages are the most
  likely drag on indexing for a new domain.

## Adding a page

Wrap it in `BaseLayout` and everything follows: SEO tags, canonical, OG,
analytics, consent banner, header, footer. Sitemap inclusion is automatic via
filesystem discovery, and `noindex={true}` also drops it from the sitemap.
`scripts/check-pages.mjs` fails the build if a page skips the layout, omits a
title, or is indexable without a canonical.

**Use `fitTitle` / `fitDescription` from `src/lib/seo.js` for any title built
from data.** `SEO.astro` appends `" | GarageDoorHQ"` to any title not already
containing the site name, so a comfortable 50-character template title becomes a
65-character `<title>`. 825 pages breached the 60-character limit before this
existed, and the first version of `fitTitle` still shipped a bug by returning a
brand-less title that then got the suffix appended anyway. Every return path is
now brand-inclusive. `scripts/check-seo.py` audits the built HTML, which is the
only place the real length is visible.

## Mobile-first is structural

Every media query in `global.css` is `min-width`. Base styles are the 375px
phone layout; wider screens add to them. This audience is standing in a driveway
in front of a door that will not open.

Interactive elements are `var(--tap)` = 44px minimum. Inline links inside a
sentence are exempt. Wide tables scroll inside `.table-scroll`, never the page.
A linked table cell hands its padding to the link so the whole cell is tappable.

## Redirects

**Never wildcard a redirect whose destination is data-driven.**
`/cost-guides/:slug → /guides/:slug` forwards unknown slugs into 404s — a 301
into a dead page, which is worse than the original 404 because a crawler follows
the hop first.

`build-redirects.py` enumerates every rule from real slugs and city data, and
rejects any rule whose destination is missing from `dist/` **or whose source is
a real built page**. That second guard caught an alias that would have 301'd the
entire `/garage-door-repair/` directory hub into a cost guide.

Removed listings go in `src/data/removed-listings.json` and redirect to their
city page. On AirProHQ the 404 page was taking 27.7% of pageviews before this.

## Verify, don't assert

Several errors on the earlier sites came from stating something without
checking. Run the check, then say the number. Everything checkable here has a
script: `check-pages`, `check-content`, `check-seo`, `check-links`,
`build-redirects`. Use them instead of remembering.
