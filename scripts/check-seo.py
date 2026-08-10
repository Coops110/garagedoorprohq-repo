# Audits the BUILT HTML against the per-page SEO rules in BUILD-PLAN.md.
#
# These are checkable facts, so they are checked rather than trusted. The
# title-length rule in particular is easy to get wrong by accident: SEO.astro
# appends " | GarageDoorHQ" to any title that does not already contain the site
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

for url, hits in canonicals.items():
    if len(hits) > 1:
        fail('duplicate canonical', hits[0], f'{url} also claimed by {len(hits) - 1} other page(s)')

print(f'  pages audited {len(pages)}')
if not fails:
    print(f'  ✓ all pass — title ≤{TITLE_MAX}, description {DESC_MIN}–{DESC_MAX}, '
          f'one h1, canonical present, unique canonicals, images have alt')
    sys.exit(0)

print()
for kind, n in fails.most_common():
    print(f'  ✗ {kind}: {n}')
    for ex in examples[kind][:4]:
        print(f'      {ex}')
    if len(examples[kind]) > 4:
        print(f'      … and {len(examples[kind]) - 4} more')
sys.exit(1)
