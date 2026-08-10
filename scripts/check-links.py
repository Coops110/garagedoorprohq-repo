# Scans the BUILT site for internal links pointing at pages that do not
# exist. A sitemap-clean site is not necessarily link-clean: broken internal
# links send real visitors to the 404 page and burn crawl budget, and they are
# invisible until something looks for them.
#
#   npm run build && python scripts/check-links.py
#
# Exits non-zero if anything is broken, so it can gate a deploy.

import glob
import os
import re
import sys
from collections import Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pages = glob.glob('dist/**/*.html', recursive=True)
if not pages:
    sys.exit('  no HTML in dist/ — run `npm run build` first')


def target(url):
    u = url.split('#')[0].split('?')[0]
    if not u.startswith('/'):
        return None
    p = os.path.join('dist', u.lstrip('/'))
    return os.path.join(p, 'index.html') if u.endswith('/') else p


broken, sources = Counter(), {}
for f in pages:
    with open(f, encoding='utf-8') as fh:
        html = fh.read()
    for m in re.finditer(r'href="(/[^"]*)"', html):
        u = m.group(1)
        t = target(u)
        if not t:
            continue
        if os.path.exists(t):
            continue
        # A bare /foo may be a file (/llms.txt, /favicon.svg) or a directory
        # whose index.html we have not tried yet.
        alt = os.path.join('dist', u.lstrip('/'))
        if os.path.exists(alt) or os.path.exists(os.path.join(alt, 'index.html')):
            continue
        broken[u] += 1
        sources.setdefault(u, set()).add(f.replace('dist', '').replace(os.sep, '/'))

print(f'  pages scanned                  {len(pages)}')
print(f'  distinct broken internal links {len(broken)}')
print(f'  total broken href occurrences  {sum(broken.values())}')
if broken:
    print()
    for u, n in broken.most_common(20):
        print(f'  {n:>5}x  {u}')
        for s in sorted(sources[u])[:2]:
            print(f'          from {s}')

sys.exit(1 if broken else 0)
