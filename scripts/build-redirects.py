# Generates vercel.json redirects, and refuses to write one whose
# destination does not exist in the build output.
#
# WHY EVERY RULE IS ENUMERATED AND NONE IS A WILDCARD
# The tidy-looking version of this is `/cost-guides/:slug -> /guides/:slug`.
# On AirProHQ that turned every unknown slug into a 301 pointing at a 404 —
# which is worse than the original 404, because a crawler follows the hop
# first and only then finds nothing. So every rule here is built from a real
# slug that exists, and each destination is checked against dist/ before the
# file is written.
#
#   npm run build && python scripts/build-redirects.py
#
# Run order matters: without dist/ there is nothing to validate against, and
# the script refuses to run rather than writing unverified rules.

import json
import subprocess
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DIST = Path('dist')
if not DIST.exists():
    sys.exit('  dist/ not found — run `npm run build` first')


def from_node(expr):
    """Read a value out of the ES modules in src/lib so this script cannot
    drift from the site's own source of truth."""
    out = subprocess.run(
        ['node', '--input-type=module', '-e', expr],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        sys.exit(f'  node failed reading site data:\n{out.stderr}')
    return json.loads(out.stdout.strip().splitlines()[-1])


guide_slugs = from_node(
    "import {guides} from './src/lib/guides.js';"
    "console.log(JSON.stringify(guides.map(g=>g.slug)))"
)
term_slugs = from_node(
    "import {glossary} from './src/lib/glossary.js';"
    "console.log(JSON.stringify(glossary.map(t=>t.slug)))"
)

# Guides that are planned but not published. Somebody linking to one, or an
# assistant citing a URL it expects to exist, currently gets a 404 — on
# AirProHQ exactly that happened, with a guide requested BEFORE it existed.
# Send those to the guides hub, which is a real page and a useful answer,
# rather than leaving them to fail. Each becomes a normal guide URL later,
# at which point it drops out of this list automatically.
planned_slugs = from_node(
    "import {PLANNED} from './src/lib/guides.js';"
    "console.log(JSON.stringify(PLANNED.map(g=>g.slug)))"
)

# Names people and assistants plausibly guess that are not our slugs. Seeded
# from the obvious phrasings; once GA and Search Console have real 404 data,
# add what actually appears rather than what we imagined.
# NOTE: 'garage-door-repair' is deliberately NOT an alias here. It looks like
# the obvious one, but /garage-door-repair/ is the directory hub — aliasing it
# would 301 the entire directory into a cost guide. The shadowing guard at the
# bottom of this file catches that, and caught exactly this mistake once.
ALIASES = {
    'garage-door-repair-prices': 'garage-door-repair-cost',
    'garage-door-repair-costs': 'garage-door-repair-cost',
    'how-much-does-garage-door-repair-cost': 'garage-door-repair-cost',
    'garage-door-spring-cost': 'garage-door-spring-replacement-cost',
    'garage-door-spring-repair-cost': 'garage-door-spring-replacement-cost',
    'garage-door-spring-replacement': 'garage-door-spring-replacement-cost',
    'torsion-spring-replacement-cost': 'garage-door-spring-replacement-cost',
    'garage-door-opener-cost': 'garage-door-opener-repair-cost',
    'garage-door-opener-replacement-cost': 'garage-door-opener-repair-cost',
    'garage-door-opener-repair': 'garage-door-opener-repair-cost',
    'diy-garage-door-spring-repair': 'why-diy-spring-repair-is-dangerous',
    'can-i-replace-a-garage-door-spring-myself': 'why-diy-spring-repair-is-dangerous',
    'garage-door-spring-safety': 'why-diy-spring-repair-is-dangerous',
    'hiring-a-garage-door-contractor': 'hiring-a-garage-door-company',
    'how-to-hire-a-garage-door-company': 'hiring-a-garage-door-company',
    'garage-door-contractor-checklist': 'hiring-a-garage-door-company',
}

# Wrong parent directories. Expanded per known slug rather than wildcarded,
# so an unknown slug still 404s honestly instead of redirecting into one.
WRONG_PARENTS = ['cost-guides', 'cost-guide', 'guide', 'cost', 'costs',
                 'blog', 'articles', 'resources']

rules = []


def add(source, destination):
    # The destination keeps its trailing slash. astro.config.mjs sets
    # trailingSlash: 'always', so the slashed form is the canonical URL and the
    # one in the sitemap and in every internal link. Emitting the slash-less
    # form still works — Vercel resolves it in one hop — but it lands a crawler
    # on a URL that immediately declares a different canonical. One redirect
    # straight to the canonical URL is the version with nothing left to
    # reconcile.
    rules.append({
        'source': '/' + source.strip('/'),
        'destination': '/' + destination.strip('/') + '/',
        'permanent': True,
    })


# ── guides: real slugs and aliases, under every plausible prefix ──
targets = {s: f'guides/{s}' for s in guide_slugs}
targets.update({a: f'guides/{t}' for a, t in ALIASES.items()})

for name, dest in targets.items():
    add(name, dest)                       # /garage-door-repair-cost
    add(f'{name}-guide', dest)            # /garage-door-repair-cost-guide
    add(f'{name}-2026', dest)
    for parent in WRONG_PARENTS:
        add(f'{parent}/{name}', dest)     # /cost-guides/garage-door-repair-cost
    # Suffixed variants under /guides/ itself. On AirProHQ, Google had
    # /guides/<slug>-guide/ indexed and 404ing, so these are not theoretical.
    add(f'guides/{name}-guide', dest)
    add(f'guides/{name}-2026', dest)
    add(f'guides/{name}-cost', dest)

for alias, real in ALIASES.items():
    add(f'guides/{alias}', f'guides/{real}')

# Planned-but-unwritten guides go to the hub, not to a page that isn't there.
for slug in planned_slugs:
    add(f'guides/{slug}', 'guides')
    add(slug, 'guides')

# ── glossary ──────────────────────────────────────────────
for t in term_slugs:
    add(f'glossary/what-is-a-{t}', f'glossary/{t}')
    add(f'what-is-a-{t}', f'glossary/{t}')
    add(f'terms/{t}', f'glossary/{t}')
add('terms-glossary', 'glossary')
add('definitions', 'glossary')
# /terms/ itself is the terms of service and a real page; the loop above only
# adds /terms/<slug>, so there is no collision.

# ── directory sections under the wrong prefix ─────────────
add('directory', 'garage-door-repair')
add('contractors', 'garage-door-repair')
add('companies', 'garage-door-repair')
add('garage-door-companies', 'garage-door-repair')
add('garage-door-installers', 'garage-door-repair')
add('find-a-pro', 'garage-door-repair')
add('guides/garage-door-repair', 'garage-door-repair')

cities = json.loads(Path('src/data/cities.json').read_text(encoding='utf-8'))
states = sorted({c['stateSlug'] for c in cities})

for st in states:
    add(f'{st}', f'garage-door-repair/{st}')
    add(f'{st}/garage-door-repair', f'garage-door-repair/{st}')
    add(f'garage-door-repair/{st}/compare-cities', f'garage-door-repair/{st}/compare')
    add(f'garage-doors/{st}', f'garage-door-repair/{st}')

for c in cities:
    st, ct = c['stateSlug'], c['citySlug']
    # A city URL missing its state segment is the single most likely guess,
    # since that is how people say it: "garage door repair houston".
    add(f'garage-door-repair/{ct}', f'garage-door-repair/{st}/{ct}')
    add(f'garage-doors/{st}/{ct}', f'garage-door-repair/{st}/{ct}')
    add(f'{st}/{ct}', f'garage-door-repair/{st}/{ct}')

# ── standard pages under common alternative names ─────────
for src, dest in [
    ('editorial', 'editorial-guidelines'),
    ('editorial-policy', 'editorial-guidelines'),
    ('methodology', 'editorial-guidelines'),
    ('how-we-work', 'editorial-guidelines'),
    ('privacy-policy', 'privacy'),
    ('terms-of-service', 'terms'),
    ('terms-and-conditions', 'terms'),
    ('list-your-business', 'get-listed'),
    ('add-a-listing', 'get-listed'),
    ('claim-your-listing', 'get-listed'),
    ('advertise', 'get-listed'),
    ('contact-us', 'contact'),
    ('about-us', 'about'),
]:
    add(src, dest)

# ── listings removed on request ───────────────────────────
# A removed listing must redirect, not 404. On AirProHQ the 404 page was
# taking 27.7% of pageviews before this; each of these preserves someone who
# wanted a real answer.
for r in json.loads(Path('src/data/removed-listings.json').read_text(encoding='utf-8')):
    # Routed through add() so these get the same trailing-slash treatment and
    # the same destination validation as every other rule.
    add(r['source'], r['destination'] or '/')

# ── validate every destination against the build output ───
def exists(dest):
    p = DIST / dest.strip('/')
    return (p / 'index.html').exists() or p.exists() or dest == '/'


# A redirect whose SOURCE is a real built page would shadow that page, so it
# is rejected too — that is how you accidentally 301 your own content away.
def is_real_page(source):
    p = DIST / source.strip('/')
    return (p / 'index.html').exists() or p.is_file()


seen, final, bad_dest, shadowing = set(), [], [], []
for r in rules:
    if r['source'] in seen:
        continue
    # Identity, including the trailing-slash-only case. A generated combination
    # can land on its own destination — the alias "garage-door-spring-
    # replacement" plus the "-cost" suffix reconstructs the real slug. Skipping
    # it silently here matters: without this it falls through to the shadow
    # check below and gets reported as a rejected rule on every run, which
    # trains you to ignore output that is supposed to mean something.
    if r['source'].rstrip('/') == r['destination'].rstrip('/'):
        continue
    if is_real_page(r['source']):
        shadowing.append(r)
        continue
    if not exists(r['destination']):
        bad_dest.append(r)
        continue
    seen.add(r['source'])
    final.append(r)

Path('vercel.json').write_text(
    json.dumps({'redirects': final}, indent=2) + '\n', encoding='utf-8')

print(f'  {len(final)} redirects written, every destination verified against dist/')
if shadowing:
    print(f'\n  {len(shadowing)} rejected — source is a real page and would be shadowed:')
    for r in shadowing[:10]:
        print(f'    {r["source"]} -> {r["destination"]}')
if bad_dest:
    print(f'\n  {len(bad_dest)} rejected — destination does not exist:')
    for r in bad_dest[:10]:
        print(f'    {r["source"]} -> {r["destination"]}')
