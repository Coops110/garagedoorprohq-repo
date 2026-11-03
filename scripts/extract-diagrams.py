# Writes the standalone, downloadable SVGs offered by /diagrams/.
#
# Reads the BUILT page, not the source. The components are .astro and most of
# them compute geometry in expressions (`cx={192 + c * 30}`), so the source is
# not an SVG and cannot be copied. dist/diagrams/index.html holds the rendered
# result, which is.
#
# ── THE PART THAT WOULD OTHERWISE SHIP BROKEN ──
#
# Every drawing colours itself with CSS custom properties — var(--signal),
# var(--ink), var(--paper) and so on — which resolve against :root in
# global.css. That works perfectly on our pages and fails completely in a file
# somebody downloads: with no :root to inherit from, an SVG renderer falls back
# to black fills, and the whole point of the release is a drawing that is
# correct on someone else's site.
#
# So the variables are resolved to literal hex here, read out of global.css
# rather than hardcoded. The site has no dark-mode block, so :root is the only
# source and the substitution is unambiguous. If a dark theme is ever added,
# this script needs a decision about which palette ships, and it will fail
# loudly on any var() it cannot resolve rather than writing a black diagram.
#
# ── ORDER ──
#
#   1. npm run build          (renders /diagrams/)
#   2. python scripts/extract-diagrams.py
#   3. npm run build          (copies public/diagrams/ into dist/)
#
# The two-pass build is the price of deriving the files from real output. Step 2
# is idempotent, and check-links.py will fail on the download hrefs if it is
# skipped, so a forgotten run cannot ship quietly.

import io
import os
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SRC = Path('dist/diagrams/index.html')
CSS = Path('src/styles/global.css')
OUT = Path('public/diagrams')

if not SRC.exists():
    sys.exit(f'  {SRC} not found — run `npm run build` first. This reads rendered '
             'output, not source.')

html = io.open(SRC, encoding='utf-8').read()
css = io.open(CSS, encoding='utf-8').read()

# The :root block is the only palette; see the header.
root = re.search(r':root\s*\{(.*?)\}', css, re.S)
if not root:
    sys.exit(f'  no :root block in {CSS} — cannot resolve the diagram colours.')
PALETTE = dict(re.findall(r'--([a-z0-9-]+)\s*:\s*([^;]+);', root.group(1)))

VAR = re.compile(r'var\(\s*--([a-z0-9-]+)\s*\)')


def resolve(svg, where):
    missing = sorted({m for m in VAR.findall(svg) if m not in PALETTE})
    if missing:
        sys.exit(f'  {where}: no :root value for {", ".join("--" + m for m in missing)}. '
                 'Refusing to write a diagram with unresolved colours.')
    return VAR.sub(lambda m: PALETTE[m.group(1)].strip(), svg)


# Each release diagram is wrapped in <section data-diagram="name"> by
# src/pages/diagrams.astro. The page names the file; this follows.
SECTION = re.compile(r'<section[^>]*\bdata-diagram="([a-z0-9-]+)"[^>]*>(.*?)</section>', re.S)
SVG = re.compile(r'<svg\b.*?</svg>', re.S)
HREF = re.compile(r'href="/diagrams/([a-z0-9-]+)\.svg"')

sections = SECTION.findall(html)
if not sections:
    sys.exit('  no data-diagram sections in the built page. Did /diagrams/ change shape?')

OUT.mkdir(parents=True, exist_ok=True)

written, total_svgs, mismatched = [], 0, []
for name, body in sections:
    svgs = SVG.findall(body)
    if not svgs:
        sys.exit(f'  {name}: no <svg> inside its section.')

    # The page declares how many panels it expects via its download links. If
    # that disagrees with the drawing, the page is offering a URL nobody will
    # ever write — which is exactly what happened first time round: BalanceTest
    # renders one <svg> inside a .map() and produces three, while the page
    # linked a single unsuffixed file. Caught here rather than as a 404.
    offered = set(HREF.findall(body))
    expect = {name} if len(svgs) == 1 else {f'{name}-{i}' for i in range(1, len(svgs) + 1)}
    if offered != expect:
        mismatched.append(
            f'    {name}: drawing renders {len(svgs)} panel(s) -> {sorted(expect)}\n'
            f'      but the page offers {sorted(offered) or "nothing"}'
        )
        continue

    for i, svg in enumerate(svgs, 1):
        # Two diagrams are two-panel (opener-types, spring-types); the rest are
        # single. Only suffix when there is genuinely more than one, so the
        # common case keeps the clean filename the page links to.
        stem = name if len(svgs) == 1 else f'{name}-{i}'
        svg = resolve(svg, stem)
        # A standalone file needs the namespace even though the inline version
        # inherits it from the host document.
        if 'xmlns=' not in svg[:400]:
            svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"', 1)
        doc = '<?xml version="1.0" encoding="UTF-8"?>\n' + svg + '\n'
        (OUT / f'{stem}.svg').write_text(doc, encoding='utf-8')
        written.append(stem)
        total_svgs += 1

if mismatched:
    print('  ! the page and the drawings disagree about panel counts:\n')
    print('\n'.join(mismatched))
    print('\n    Fix `panels` in the RELEASE list in src/pages/diagrams.astro,')
    print('    rebuild, and run this again. Nothing was written for those.')
    sys.exit(1)

print(f'  {len(sections)} diagram(s) on the page, {total_svgs} file(s) written to {OUT}/')
for stem in written:
    size = (OUT / f'{stem}.svg').stat().st_size
    print(f'     {stem}.svg  {size / 1024:.1f} KB')

leftover = sorted(p.name for p in OUT.glob('*.svg')
                  if p.stem not in written)
if leftover:
    print()
    print('  ! these files are in public/diagrams/ but the page no longer offers them:')
    for n in leftover:
        print(f'      {n}')
    print('    Delete them by hand if a diagram was withdrawn — this script will not,')
    print('    because a URL somebody has already embedded should not vanish silently.')

print('\n  Next: npm run build  (copies these into dist/), then check-links.py')
