# Audits the BUILT HTML against the per-page SEO rules in BUILD-PLAN.md.
#
# These are checkable facts, so they are checked rather than trusted. The
# title-length rule in particular is easy to get wrong by accident: SEO.astro
# appends " | GarageDoorProHQ" to any title that does not already contain the site
# name, so a 50-character title in a template becomes a 65-character <title>
# in the output. Only the built HTML shows the real number.
#
#   npm run build && python scripts/check-seo.py
#
# Exits non-zero on any failure, so it can gate a deploy.

import glob
import os
import re
import sys
from collections import Counter
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

TITLE_MAX = 60
DESC_MAX = 155
DESC_MIN = 70

pages = glob.glob('dist/**/*.html', recursive=True)
if not pages:
    sys.exit('  no HTML in dist/ — run `npm run build` first')

TITLE = re.compile(r'<title>(.*?)</title>', re.S)
DESC = re.compile(r'<meta name="description" content="(.*?)"', re.S)
CANON = re.compile(r'<link rel="canonical" href="(.*?)"')
NOINDEX = re.compile(r'<meta name="robots" content="noindex')
H1 = re.compile(r'<h1[^>]*>(.*?)</h1>', re.S)
IMG = re.compile(r'<img\b([^>]*)>', re.S)
SVG = re.compile(r'<svg\b([^>]*)>', re.S)
SVG_BLOCK = re.compile(r'<svg\b.*?</svg>', re.S)
VIEWBOX = re.compile(r'viewBox="([^"]+)"')
CIRCLE = re.compile(r'<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.]+)"')
OG_IMAGE = re.compile(r'<meta property="og:image" content="([^"]+)"')
OG_IMAGE_ALT = re.compile(r'<meta property="og:image:alt" content="[^"]+"')


# Derived from the canonical tags the build actually emitted, never hardcoded. A
# hardcoded origin silently stops matching after a domain change, at which point
# every og:image URL looks external and skips the "is this file in the build"
# check — so the move to garagedoorprohq.com would have quietly disabled the
# guard rather than failing loudly.
def _origin_from_build():
    for f in pages:
        with open(f, encoding='utf-8') as fh:
            m = CANON.search(fh.read())
        if m:
            parts = m.group(1).split('/')
            if len(parts) >= 3:
                return f'{parts[0]}//{parts[2]}'
    return ''


SITE_ORIGIN = _origin_from_build()


def unescape(s):
    for a, b in [('&amp;', '&'), ('&lt;', '<'), ('&gt;', '>'),
                 ('&quot;', '"'), ('&#39;', "'"), ('&#x27;', "'")]:
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s).strip()


def strip_tags(s):
    return unescape(re.sub(r'<[^>]*>', ' ', s))


fails = Counter()
examples = {}
canonicals = {}


def fail(kind, page, detail):
    fails[kind] += 1
    examples.setdefault(kind, []).append(f'{page} — {detail}')


for f in pages:
    with open(f, encoding='utf-8') as fh:
        html = fh.read()
    page = '/' + os.path.relpath(f, 'dist').replace(os.sep, '/').replace('index.html', '')
    noindexed = bool(NOINDEX.search(html))

    m = TITLE.search(html)
    if not m:
        fail('missing title', page, '')
    else:
        title = unescape(m.group(1))
        if len(title) > TITLE_MAX:
            fail('title too long', page, f'{len(title)} chars: "{title}"')

    m = DESC.search(html)
    if not m:
        fail('missing description', page, '')
    else:
        desc = unescape(m.group(1))
        if len(desc) > DESC_MAX:
            fail('description too long', page, f'{len(desc)} chars: "{desc[:80]}…"')
        elif len(desc) < DESC_MIN:
            fail('description too short', page, f'{len(desc)} chars: "{desc}"')

    m = CANON.search(html)
    if not m:
        if not noindexed:
            fail('missing canonical', page, '')
    else:
        # Two pages claiming one canonical URL means one of them is telling
        # Google to drop it. Almost always a copy-paste in a template.
        canonicals.setdefault(m.group(1), []).append(page)

    # Share cards. A missing og:image is a page that shares as a bare text stub;
    # a present-but-broken one is worse, because the consumer caches the failure.
    # So the tag must exist, carry alt text, and point at a file that is actually
    # in the build.
    if not noindexed:
        og = OG_IMAGE.search(html)
        if not og:
            fail('no og:image', page, '')
        else:
            url = og.group(1)
            local = url.replace(SITE_ORIGIN, '') if url.startswith(SITE_ORIGIN) else url
            if local.startswith('/'):
                if not (Path('dist') / local.lstrip('/')).is_file():
                    fail('og:image points at a file not in the build', page, local)
            if not OG_IMAGE_ALT.search(html):
                fail('og:image without og:image:alt', page, local)

    h1s = H1.findall(html)
    if not h1s:
        fail('missing h1', page, '')
    elif len(h1s) > 1:
        fail('multiple h1', page, f'{len(h1s)} found')
    else:
        h1 = strip_tags(h1s[0])
        title_text = unescape(TITLE.search(html).group(1)) if TITLE.search(html) else ''
        # An H1 identical to the title wastes the chance to target a second
        # phrasing of the same intent.
        if h1 and h1 == title_text:
            fail('h1 identical to title', page, f'"{h1}"')

    for attrs in IMG.findall(html):
        if 'alt=' not in attrs:
            fail('image without alt', page, attrs.strip()[:70])

    # Inline SVG is invisible to the alt-text rule above, because it is not an
    # <img>. Every diagram must therefore declare itself either meaningful
    # (role="img" plus an accessible name) or decorative (aria-hidden). An SVG
    # that does neither is announced by a screen reader as an unlabelled
    # graphic, which is worse than silence.
    for attrs in SVG.findall(html):
        named = 'aria-labelledby=' in attrs or 'aria-label=' in attrs
        decorative = 'aria-hidden="true"' in attrs
        if decorative:
            continue
        if 'role="img"' not in attrs or not named:
            fail('svg without role=img + accessible name (or aria-hidden)',
                 page, attrs.strip()[:70])

    # Callout markers must fit inside their viewBox. Raising the marker radius
    # from 15 to 21 (needed for phone legibility) pushed seven markers past the
    # edge of their drawings, where they render as clipped half-circles. That is
    # pure arithmetic, so it is checked rather than eyeballed — and eyeballing
    # missed it once already.
    for svg in SVG_BLOCK.finditer(html):
        vb = VIEWBOX.search(svg.group(0))
        if not vb:
            continue
        minx, miny, w, h = (float(v) for v in vb.group(1).split())
        for cx, cy, r in CIRCLE.findall(svg.group(0)):
            cx, cy, r = float(cx), float(cy), float(r)
            # Radius >= 13 identifies a callout marker; component circles
            # (drums, rollers, sensor lenses) are smaller.
            if r < 13:
                continue
            if (cx - r < minx or cx + r > minx + w
                    or cy - r < miny or cy + r > miny + h):
                fail('callout marker clipped by its viewBox', page,
                     f'cx={cx:g} cy={cy:g} r={r:g} in viewBox {vb.group(1)}')

for url, hits in canonicals.items():
    if len(hits) > 1:
        fail('duplicate canonical', hits[0], f'{url} also claimed by {len(hits) - 1} other page(s)')

print(f'  pages audited {len(pages)}')
if not fails:
    print(f'  ✓ all pass — title ≤{TITLE_MAX}, description {DESC_MIN}–{DESC_MAX}, '
          f'one h1, canonical present, unique canonicals, images have alt, '
          f'every inline svg labelled or explicitly decorative, '
          f'og:image present with alt and backed by a real file')
    sys.exit(0)

print()
for kind, n in fails.most_common():
    print(f'  ✗ {kind}: {n}')
    for ex in examples[kind][:4]:
        print(f'      {ex}')
    if len(examples[kind]) > 4:
        print(f'      … and {len(examples[kind]) - 4} more')
sys.exit(1)
