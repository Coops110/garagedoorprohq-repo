# Generates the Open Graph share cards in public/og/.
#
# WHY THIS IS A SCRIPT AND NOT AN SVG
# Every other image on this site is inline SVG, which is the right call for
# on-page diagrams. It is the wrong call here: Facebook, X, LinkedIn, Slack,
# WhatsApp and Discord all decline to render an SVG og:image. The share card has
# to be a raster, so it is generated once, committed, and served as a static
# file. Nothing about this runs on Vercel — there is no Pillow in the deploy.
#
#   pip install pillow
#   python scripts/build-og-images.py
#
# Re-run it after changing a guide's h1 or the palette. It is idempotent.
#
# FONTS
# The site's webfonts (Sora, Inter) are loaded from a CDN at runtime and are not
# on disk, so the cards use the closest available system face. That means a
# regeneration on a different machine can differ cosmetically from the committed
# PNGs — which is fine, because the PNGs are the artefact and they are in git.
# The fallback chain covers Windows and Linux so this does not hard-fail in CI.

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OUT = Path('public/og')
OUT.mkdir(parents=True, exist_ok=True)

# 1200x630 is the size every consumer scales from; below 600x315 some refuse to
# render a large card at all.
W, H = 1200, 630

# Palette lifted from src/styles/global.css. Kept in sync by hand — the CSS is
# the source of truth for the site, this is a copy for a non-CSS renderer.
PAPER = (248, 247, 244)
CARD = (255, 255, 255)
INK = (27, 34, 43)
INK_SOFT = (75, 85, 99)
MUTED = (120, 130, 143)
LINE = (228, 226, 220)
SIGNAL = (217, 72, 15)
STEEL = (44, 95, 124)
AMBER = (199, 125, 2)
PANEL = (243, 241, 234)

FONT_CANDIDATES = {
    'bold': ['C:/Windows/Fonts/seguisb.ttf', 'C:/Windows/Fonts/segoeuib.ttf',
             'C:/Windows/Fonts/arialbd.ttf',
             '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'],
    'black': ['C:/Windows/Fonts/seguibl.ttf', 'C:/Windows/Fonts/segoeuib.ttf',
              'C:/Windows/Fonts/arialbd.ttf',
              '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'],
    'regular': ['C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/arial.ttf',
                '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'],
}


def font(weight, size):
    for path in FONT_CANDIDATES[weight]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    print(f'  ! no {weight} font found, falling back to the PIL default')
    return ImageFont.load_default()


def text_width(draw, s, f):
    return draw.textbbox((0, 0), s, font=f)[2]


def wrap(draw, text, f, max_width):
    """Greedy word wrap measured against the actual font, not a character count —
    'Illinois' and 'MMMMMMMM' are not the same width."""
    words, lines, cur = text.split(), [], ''
    for word in words:
        trial = f'{cur} {word}'.strip()
        if text_width(draw, trial, f) <= max_width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def brand_mark(img, x, y, size=64):
    """The rounded-square mark from the site header: a steel-to-signal diagonal
    gradient with a white G. Built as a gradient layer plus a rounded-rect mask,
    since Pillow has no gradient primitive."""
    grad = Image.new('RGB', (size, size))
    gd = ImageDraw.Draw(grad)
    for i in range(size * 2):
        t = i / (size * 2 - 1)
        colour = tuple(round(STEEL[c] + (SIGNAL[c] - STEEL[c]) * t) for c in range(3))
        gd.line([(i, 0), (0, i)], fill=colour)

    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1],
                                          radius=round(size * 0.28), fill=255)
    img.paste(grad, (x, y), mask)

    d = ImageDraw.Draw(img)
    f = font('black', round(size * 0.56))
    bbox = d.textbbox((0, 0), 'G', font=f)
    d.text((x + (size - bbox[2] + bbox[0]) / 2 - bbox[0],
            y + (size - bbox[3] + bbox[1]) / 2 - bbox[1]), 'G', font=f, fill=CARD)


def door_art(d, x, y, w, h):
    """A simplified version of the on-site door drawing. Deliberately restrained:
    a share card is usually seen as a small thumbnail, so the type has to carry
    it and the art is there to be recognisable rather than read."""
    d.rounded_rectangle([x, y, x + w, y + h], radius=10, fill=CARD, outline=LINE, width=3)

    # header band with the torsion shaft and springs
    hdr = round(h * 0.20)
    d.rectangle([x + 12, y + 12, x + w - 12, y + hdr], fill=PANEL, outline=LINE, width=2)
    shaft_y = y + hdr // 2 + 6
    d.line([(x + 30, shaft_y), (x + w - 30, shaft_y)], fill=INK, width=6)

    # Two spring runs meeting a centre bearing plate. The coil count is derived
    # from the space actually available on each side of the plate — nine coils at
    # 20px was hardcoded, and in a 392px-wide drawing the two runs overran each
    # other in the middle, reading as one dense scribble rather than two springs.
    plate_w = 26
    mid = x + w // 2
    coil_gap = 20
    run_start = x + 58
    run_end = mid - plate_w // 2 - 14
    coils = max(1, (run_end - run_start) // coil_gap)
    for i in range(coils):
        for cx in (run_start + i * coil_gap, x + w - 58 - i * coil_gap):
            d.ellipse([cx - 7, shaft_y - 17, cx + 7, shaft_y + 17], outline=SIGNAL, width=4)
    d.rounded_rectangle([mid - plate_w // 2, shaft_y - 13, mid + plate_w // 2, shaft_y + 13],
                        radius=3, fill=INK)

    # cable drums
    for cx in (x + 34, x + w - 34):
        d.ellipse([cx - 16, shaft_y - 16, cx + 16, shaft_y + 16], fill=STEEL)
        d.ellipse([cx - 6, shaft_y - 6, cx + 6, shaft_y + 6], fill=CARD)

    # door sections
    top = y + hdr + 14
    avail = (y + h - 16) - top
    rows = 4
    gap = 8
    sec = (avail - gap * (rows - 1)) // rows
    for i in range(rows):
        sy = top + i * (sec + gap)
        d.rounded_rectangle([x + 26, sy, x + w - 26, sy + sec],
                            radius=4, fill=PANEL, outline=INK_SOFT, width=2)
        mid = x + w // 2
        d.rounded_rectangle([x + 46, sy + 8, mid - 12, sy + sec - 8], radius=3, outline=LINE, width=2)
        d.rounded_rectangle([mid + 12, sy + 8, x + w - 46, sy + sec - 8], radius=3, outline=LINE, width=2)
        # rollers
        for cx in (x + 20, x + w - 20):
            d.ellipse([cx - 6, sy + sec // 2 - 6, cx + 6, sy + sec // 2 + 6], fill=AMBER)


def card(path, eyebrow, headline, kicker, eyebrow_colour=STEEL):
    img = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(img)

    # Signal bar along the bottom — the one element every card shares, so a
    # thumbnail is recognisable before any text is legible.
    d.rectangle([0, H - 14, W, H], fill=SIGNAL)

    pad = 68
    art_w = 392
    text_right = W - pad - art_w - 48

    # ── brand lockup ──
    brand_mark(img, pad, pad, 64)
    fb = font('bold', 38)
    bx = pad + 64 + 18
    by = pad + 10
    # Accent lands on "Pro" to match the site header and AirProHQ's wordmark.
    name = SITE['name']
    if 'Pro' in name:
        head, _, tail = name.partition('Pro')
        segments = ((head, INK), ('Pro', SIGNAL), (tail, INK))
    else:
        segments = ((name, INK),)
    for part, colour in segments:
        d.text((bx, by), part, font=fb, fill=colour)
        bx += text_width(d, part, fb)

    # ── eyebrow ──
    fe = font('bold', 22)
    ey = pad + 118
    d.rectangle([pad, ey + 9, pad + 30, ey + 13], fill=SIGNAL)
    d.text((pad + 44, ey), eyebrow.upper(), font=fe, fill=eyebrow_colour)

    # ── headline: shrink to fit rather than overflow or clip ──
    for size in (66, 60, 54, 48, 43, 39):
        fh = font('black', size)
        lines = wrap(d, headline, fh, text_right - pad)
        if len(lines) <= 3:
            break
    line_h = round(size * 1.17)
    hy = ey + 58
    for line in lines[:3]:
        d.text((pad, hy), line, font=fh, fill=INK)
        hy += line_h

    # ── kicker + domain, pinned to the bottom ──
    if kicker:
        fk = font('regular', 25)
        lines = wrap(d, kicker, fk, text_right - pad)
        # The kicker gets two lines. Truncating by slicing the list left the text
        # stopping mid-phrase with no signal that it had been cut ("…pounds of
        # stored"), so an over-long kicker is ellipsised on the second line
        # instead.
        if len(lines) > 2:
            lines = lines[:2]
            while lines[1] and text_width(d, lines[1] + '…', fk) > text_right - pad:
                lines[1] = lines[1].rsplit(' ', 1)[0] if ' ' in lines[1] else ''
            lines[1] = lines[1].rstrip(' ,;') + '…'
        for line in lines:
            d.text((pad, hy + 12), line, font=fk, fill=INK_SOFT)
            hy += 34

    fd = font('bold', 24)
    d.text((pad, H - 14 - 46), HOST, font=fd, fill=MUTED)

    door_art(d, W - pad - art_w, pad + 40, art_w, H - 2 * pad - 96)

    img.save(path, 'PNG', optimize=True)
    kb = path.stat().st_size / 1024
    print(f'  {path}  {img.width}x{img.height}  {kb:.0f} KB')
    return kb


def site_from_source():
    """Read name and domain from src/lib/site.js — the same single source of
    truth the site itself uses. Hardcoding the domain here meant the rebrand to
    garagedoorprohq.com left the old one printed on every card."""
    out = subprocess.run(
        ['node', '--input-type=module', '-e',
         "import {SITE} from './src/lib/site.js';"
         "console.log(JSON.stringify({name:SITE.name,domain:SITE.domain}))"],
        capture_output=True, text=True, encoding='utf-8')
    if out.returncode != 0:
        sys.exit(f'  node failed reading site.js:\n{out.stderr}')
    return json.loads(out.stdout.strip().splitlines()[-1])


SITE = site_from_source()
HOST = SITE['domain'].replace('https://', '').replace('http://', '').rstrip('/')


def guides_from_source():
    """Read the real guide list rather than restating it, so a new guide gets a
    card and a renamed one does not keep a stale card."""
    out = subprocess.run(
        ['node', '--input-type=module', '-e',
         "import {guides} from './src/lib/guides.js';"
         "console.log(JSON.stringify(guides.map(g=>({slug:g.slug,h1:g.h1,"
         "quickAnswer:g.quickAnswer,pillar:!!g.pillar}))))"],
        capture_output=True, text=True, encoding='utf-8')
    if out.returncode != 0:
        sys.exit(f'  node failed reading guides.js:\n{out.stderr}')
    return json.loads(out.stdout.strip().splitlines()[-1])


def first_sentence(text, limit=150, floor=45):
    """Opening sentences, up to `limit` characters.

    Taking literally the first sentence produced a card whose entire subtitle was
    "No." — which is exactly right on the page (it answers "can I replace a spring
    myself?") and useless as a share subtitle. So sentences are accumulated until
    there is at least `floor` characters of actual substance.
    """
    parts = [p.strip() for p in text.split('. ') if p.strip()]
    out = ''
    for part in parts:
        # Rejoin with the '. ' that split() consumed, or "No." becomes "No".
        candidate = f'{out}. {part}' if out else part
        if len(candidate) > limit and len(out) >= floor:
            break
        out = candidate
        if len(out) >= floor and len(out) <= limit:
            # Enough to read, and stopping on a sentence boundary.
            if not out.endswith(('.', '!', '?')):
                out += '.'
            return out
    out = out.rstrip('.')
    if len(out) > limit:
        out = out[:limit].rsplit(' ', 1)[0] + '…'
        return out
    return out + '.'


def main():
    total = 0

    total += card(
        OUT / 'default.png',
        'Garage doors, honestly priced',
        'What it should cost, and who can do it',
        'Cost guides researched in-house. No paid placement, and no ratings we cannot stand behind.',
    )

    total += card(
        OUT / 'directory.png',
        'Directory',
        'Garage door companies, city by city',
        'Compiled from openly licensed public business data. A listing is not a recommendation.',
    )

    total += card(
        OUT / 'glossary.png',
        'Glossary',
        'Every garage door term, in plain English',
        'Torsion springs, cycle ratings, photo-eyes and jackshafts — so you can read the quote.',
    )

    gdir = OUT / 'guides'
    gdir.mkdir(exist_ok=True)
    guides = guides_from_source()
    live = set()
    for g in guides:
        # The h1 carries a trailing clause for the page; the card wants the claim.
        headline = g['h1'].split(':')[0].strip()
        safety = 'dangerous' in g['slug'] or 'Not' in g['h1']
        total += card(
            gdir / f"{g['slug']}.png",
            'Safety' if safety else ('Cost guide' if g['pillar'] else 'Guide'),
            headline,
            first_sentence(g['quickAnswer']),
            eyebrow_colour=SIGNAL if safety else STEEL,
        )
        live.add(f"{g['slug']}.png")

    # A guide that was renamed or unpublished leaves an orphan card behind, which
    # would then be referenced by nothing and served forever. Remove it.
    for stale in gdir.glob('*.png'):
        if stale.name not in live:
            stale.unlink()
            print(f'  removed orphan card {stale.name}')

    print(f'\n  {3 + len(guides)} cards, {total:.0f} KB total')


if __name__ == '__main__':
    main()
