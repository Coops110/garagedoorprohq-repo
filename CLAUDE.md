# Working on GarageDoorProHQ

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
- `SITE.web3FormsKey` — a key registered to `contact@garagedoorprohq.com`.
  AirProHQ's key would post GarageDoorProHQ enquiries into the AirProHQ inbox.
  `/get-listed/` shows a mailto fallback until this is set.
- `GSC_VERIFICATION` — only needed if verifying by meta tag. Domain-level DNS
  TXT verification is preferred and needs nothing here.

## Deploying

The project is **not git-linked**. It was created by `vercel --prod` from disk, so
`git push` deploys nothing — the repo has no remote and the branch is `master`.
To restore the usual GitHub -> Vercel flow, create the repo and connect it in the
Vercel dashboard.

**Always deploy with `--archive=tgz`:**

    npx vercel --prod --archive=tgz

Without it the CLI uploads one request per file. It was picking up `dist/` too
despite `.gitignore` listing it, so each deploy shipped ~976 built pages, and
about ten deploys exhausted the free tier's 5000-file daily upload allowance —
after which it refuses to deploy for 24 hours. `.vercelignore` now excludes
`dist/` explicitly, and the archive flag sidesteps the file count entirely.

**Do not poll the live site in a loop after pushing.** On AirProHQ, repeated
`curl` in an `until` loop tripped Vercel's bot mitigation and got every
scripted request 403'd for hours. Wait once, check once, or use a browser.

## Licence badges are the highest-risk output on the site

A badge is the only claim here a reader cannot check at a glance, and it is the
stated differentiator — so a wrong one is worse than none at all.

**There is no shared identifier between Overture and any state register.**
Matching is on name, which is exactly the operation that put a Lubbock firm in
Wharton on AirProHQ. `match-licences.py` therefore requires all four of:

1. **Corroboration** — the city or ZIP must agree too. Cities present and
   differing means the record is logged as a conflict and gets no badge.
2. **Unambiguity** — two register records matching one business with different
   licence numbers means neither is used. Texas has eight licensed "Mendoza"
   HVAC firms; the same holds here.
3. **Active status only** — the badge says "active record", so expired,
   suspended and inactive earn nothing.
4. **Right classification** — a California B general licence is not a C-61/D-28.

`python scripts/match-licences.py --self-test` runs the real matcher over a
fixture built to trip each guard, needs no network and no data, and must stay at
11/11. Run it after touching that file: a silent regression in a guard ships a
false badge, which is the worst thing this codebase can emit.

Note the name normaliser strips `garage`, `door` and `doors` as noise. On a site
where every business is a garage door company those words carry no
distinguishing information, and leaving them in makes "A1 Garage Door" and "A1
Garage Doors Inc" look different.

**All three registers need a manual download. None of them is scriptable, and
this was established by trying.**

- **CA** — `web.cslb.ca.gov` serves the search form over GET, but the POST is
  rejected by an F5 web application firewall ("Request Rejected" plus a support
  ID). There is no static file URL; every export is generated behind that form.
  Getting through would mean impersonating a browser to defeat bot protection,
  which this project will not do for a file a human downloads in four clicks.
- **FL** — `myfloridalicense.com` returns 403 to scripted requests.
- **AZ** — the ROC search is a Salesforce Experience Cloud app backed by an
  internal Aura endpoint, not a stable public interface.

So `fetch-licences.py` does not fetch. It normalises a downloaded export into the
matcher's schema, sniffs the delimiter (CSLB and DBPR files have appeared comma,
tab and pipe delimited — the wrong one yields a single giant column, which looks
exactly like an empty register), and prints the status and classification
distributions so a wrong column mapping is visible immediately rather than as a
mysteriously empty badge count two steps later. Where to click for each file is
in the script header.

Do not substitute a third-party scraper. The official registers are free and
authoritative; buying the same rows from a middleman inherits their terms while
adding nothing — the reasoning that keeps Google Places off this site.

## www redirects to the apex, and that rule is fragile

`garagedoorprohq.com` is canonical; `www` 308s to it. The rule is generated at
the top of `vercel.json` by `build-redirects.py` and its source is the regex
`/(.*)`, **not** `/:path*`.

That distinction matters and cost a deploy to find. `:path*` does not match a
path ending in a slash, and `trailingSlash: 'always'` means every real page URL
here ends in one — so the `:path*` version redirected `/privacy-policy` and
`/og/default.png` correctly while serving `/about/` and every guide with a 200 on
both hosts. It fired on exactly the URLs that did not matter.

It is also the one legitimate wildcard on the site. The rule against wildcards is
about data-driven *destinations*; this is a 1:1 host swap with the path
preserved, so it cannot manufacture a 301-into-404.

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
this rule exists to prevent; GarageDoorProHQ's `/terms/` states what *is* verified
and what is not, in the same paragraph.

## Data pipeline

Order matters. Each script's header comment repeats this.

1. `python scripts/overture-pilot-pull.py` → `data-work/pilot-*.json|csv`
2. `python scripts/fetch-licences.py …` → `data-work/licences/*.json` *(optional)*
3. `python scripts/match-licences.py` → `data-work/licence-matches.json` *(optional)*
4. `python scripts/stage-listings.py [--min-city=3] [--metros=…]` → `src/data/`
5. `npm run build` (runs `check-pages` + `check-content` first)
6. `python scripts/build-redirects.py` — validates against `dist/`
7. `python scripts/check-links.py` and `python scripts/check-seo.py`

Steps 2–3 are optional and their absence is a valid state: no register data means
no badges, which is correct rather than broken. **`stage-listings.py` is the only
writer of `src/data/`** — the matcher writes `data-work/` and staging merges it,
so nothing reads and writes the same file.

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
from data.** `SEO.astro` appends `" | GarageDoorProHQ"` to any title not already
containing the site name, so a comfortable 50-character template title becomes a
65-character `<title>`. 825 pages breached the 60-character limit before this
existed, and the first version of `fitTitle` still shipped a bug by returning a
brand-less title that then got the suffix appended anyway. Every return path is
now brand-inclusive. `scripts/check-seo.py` audits the built HTML, which is the
only place the real length is visible.

## Diagrams

All imagery on this site is **authored inline SVG** in `src/components/diagrams/`.
There is no photography, and that is a content decision as much as a licensing
one: a photo of a van or a technician next to a listing would imply we have seen
that business, which directly contradicts the editorial line that we have not.

Three rules, each of which was learned by breaking it:

- **No prose labels inside a drawing.** A 640-unit viewBox renders at about
  319px in the article column on a 375px phone, so a 15px label lands at 7px.
  One "Header (wall above the opening)" label shipped like that and also
  collided with two callouts. Labels go in the HTML legend, which is real body
  text at the reader's own font size and gets picked up as page content.
  `Figure.astro` carries the full reasoning.
- **Marker geometry is sized per drawing**, so every callout renders at roughly
  21px whatever the viewBox: `r ≈ 10.5 × viewBoxWidth / 319`. Markers use
  `dominant-baseline="central"` so the digit centres itself and there is no
  offset arithmetic to get wrong when a size changes.
- **Marker centres must sit at least `r` inside the viewBox.** Raising the
  radius from 15 to 21 for legibility pushed seven markers past the edge, where
  they render as clipped half-circles. `scripts/check-seo.py` now enforces this
  against the built HTML, along with requiring every inline `<svg>` to be either
  `role="img"` with an accessible name or explicitly `aria-hidden`.

### Share cards are the exception to inline SVG

`public/og/` holds pre-rendered 1200x630 PNGs, generated by
`scripts/build-og-images.py` and committed. No major consumer — Facebook, X,
LinkedIn, Slack, WhatsApp, Discord — renders an SVG `og:image`, so the one place
on this site that genuinely needs a raster is the share card. Pillow is a local
dev dependency only; nothing about this runs on Vercel.

`SEO.astro` falls back to `/og/default.png`, so a page cannot ship without a
card. Guides get their own; the directory and glossary share one. Per-listing
cards for 852 businesses would be ~35MB of near-identical PNGs for no gain.

`check-seo.py` requires every indexable page to have `og:image` plus
`og:image:alt`, and requires the referenced file to exist in `dist/` — a broken
card is worse than none, because the consumer caches the failure.

Re-run the generator after changing a guide's `h1` or `quickAnswer`. Two things
to know: `subprocess.run(text=True)` decodes with the Windows cp1252 default
while Node emits UTF-8, so the codec is pinned — without it every en dash
rendered as "â€“" into the image. And the fonts are system faces, because the
site's webfonts live on a CDN; a regeneration elsewhere can differ cosmetically,
which is fine since the PNGs are the committed artefact.

Captions and legends live in `src/lib/diagrams.js`, keyed by name; a guide
section references one with `diagram: '<name>'` and a guide can set
`heroDiagram`. Legend numbers must match the drawing — nothing can enforce that,
so change both in one edit.

The cost-map diagram is data-driven: `src/lib/costmap.js` matches anchors onto a
guide's own `costTable`, so a renamed row drops its callout rather than showing a
stale price. Same one-source-of-truth rule as the city and business pages.

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
