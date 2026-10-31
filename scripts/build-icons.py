# ─────────────────────────────────────────────────────────────
#  BUILD ICONS — favicon.ico, apple-touch-icon.png, logo.png
#
#  The 2026-10-21 audit found /favicon.ico, /apple-touch-icon.png and
#  /logo.svg all returning 404. Only public/favicon.svg existed, and an
#  SVG favicon alone leaves out every consumer that asks for the legacy
#  paths by convention rather than by reading the <head>: Safari and iOS
#  home-screen icons, Windows pinned tiles, feed readers, link unfurlers,
#  and the bare /favicon.ico fetch most crawlers still make. Each of those
#  was logging a 404 against the domain.
#
#  Also feeds Organization.logo in schema.js. Google wants a raster there
#  and a reasonable minimum size, so logo.png is rendered at 512x512
#  rather than pointing the markup at the SVG.
#
#  Geometry is redrawn here rather than rasterised from favicon.svg so
#  there is no cairosvg/rsvg dependency — Pillow is already a local dev
#  dependency for build-og-images.py and nothing here runs on Vercel.
#  Keep this in step with public/favicon.svg by hand if that changes;
#  they are the same four-panel sectional door under a header, on the
#  same steel-to-signal gradient.
#
#  Usage: python scripts/build-icons.py
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path('public')
STEEL = (44, 95, 124)    # --steel
SIGNAL = (217, 72, 15)   # --signal


def draw(size):
    """The favicon mark at any size, drawn in a 64-unit space and scaled."""
    s = size / 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Diagonal gradient, steel -> signal, drawn per-row across the diagonal.
    for i in range(size * 2):
        t = i / (size * 2 - 1)
        c = tuple(round(a + (b - a) * t) for a, b in zip(STEEL, SIGNAL))
        d.line([(i, 0), (0, i)], fill=c + (255,))

    # Rounded-rect mask, matching the SVG's rx=14 at 64 units.
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=round(14 * s), fill=255)
    img.putalpha(mask)

    # Four panels under a header, same rects and opacities as the SVG.
    panels = [(15, 5, 0.95), (24, 6, 0.80), (33, 6, 0.65), (42, 6, 0.50)]
    for y, h, op in panels:
        layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(layer).rounded_rectangle(
            [round(14 * s), round(y * s), round(50 * s), round((y + h) * s)],
            radius=round(2 * s), fill=(255, 255, 255, round(255 * op)),
        )
        img = Image.alpha_composite(img, layer)
    return img


written = []

# apple-touch-icon: 180x180, and flattened — iOS ignores transparency and
# composites onto black, which turns a rounded transparent corner into a
# black notch on the home screen.
apple = Image.new('RGB', (180, 180), (255, 255, 255))
apple.paste(draw(180), (0, 0), draw(180))
apple.save(OUT / 'apple-touch-icon.png')
written.append(('apple-touch-icon.png', apple.size))

# favicon.ico: several sizes in one file so browsers pick rather than scale.
ico_sizes = [16, 32, 48, 64]
draw(64).save(OUT / 'favicon.ico', sizes=[(n, n) for n in ico_sizes])
written.append(('favicon.ico', f'{ico_sizes} multi-size'))

# logo.png: Organization.logo. 512 square.
logo = draw(512)
logo.save(OUT / 'logo.png')
written.append(('logo.png', logo.size))

for name, size in written:
    p = OUT / name
    print(f'  public/{name:<22} {str(size):<22} {p.stat().st_size // 1024} KB')
print(f'\n  {len(written)} icons written')
