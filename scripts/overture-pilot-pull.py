# Pilot pull — garage door businesses in the four pilot metros.
#
# WHY THIS EXISTS
# Unlike AirProHQ, garage door work has no unified national licence
# register (only CA, FL and AZ licence the trade specifically), so
# Overture Places (Foursquare Open Source Places, Apache 2.0) is the BASE
# layer here, not an enrichment layer. Apache 2.0 means it can lawfully be
# stored and republished — Google Places data cannot, whoever sells it.
#
# WHAT CHANGED FROM THE FIRST DRAFT OF THIS SCRIPT
#   1. Reads Overture straight from S3 with duckdb+httpfs, the way
#      airprohq's enrich-from-overture.py does. The `overturemaps` CLI
#      download-then-read round trip added a dependency, wrote GBs of
#      geoparquet to disk, and needed the spatial extension only to
#      recover a point coordinate that bbox.xmin/ymin already gives.
#   2. The category slug is no longer a guess. Verified against the live
#      2026-07-22.0 release: it is `garage_door_service`. The original
#      guess `garage_door_supplier` does not exist in the taxonomy.
#   3. `operating_status = 'open'` — LESSONS-LEARNED requires "confirmed
#      still trading" before a row is publishable.
#   4. `addresses[1].region` is pinned per metro. A bounding box is not a
#      state; without this, a box drawn round a metro silently imports
#      businesses from over the line into /[state]/[city]/ URLs.
#   5. Name-only matches are quarantined, not published. A name LIKE
#      '%garage door%' in Houston alone pulls in a gas station, a
#      condominium, an "investing" business and nine auto repair shops.
#   6. One S3 scan for all four metros instead of four. The bboxes are
#      OR'd into a single predicate — 74M rows is a lot to read twice.
#
# USAGE
#     pip install duckdb
#     python scripts/overture-pilot-pull.py [--release=2026-07-22.0]
#     python scripts/overture-pilot-pull.py --from-cache   # re-report only
#
# The S3 scan reads 74M rows and takes ~30 minutes. --from-cache re-runs the
# classification and the report against data-work/pilot-raw.json instead, so
# tuning the exclusion rules costs seconds rather than another half hour.
#
# OUTPUT
#     data-work/pilot-raw.json       unfiltered query result, for --from-cache
#     data-work/pilot-places.json    published tier, deduplicated
#     data-work/pilot-review.csv     tier B (name-matched) for eyeballing
#     ...plus the fill-rate report that decides whether Overture alone is
#     a strong enough base layer. Nothing here writes to src/data — that
#     is stage-listings.py's job, so this script can be re-run freely.

import csv
import json
import re
import sys
from pathlib import Path

import duckdb

# The report draws a box rule and uses >= glyphs. A Windows console defaults
# to cp1252 and raises UnicodeEncodeError on both, killing the script AFTER it
# has already written its output files — which looks like a failed run when it
# is only a failed print. Force UTF-8 on stdout instead of degrading the
# report to ASCII.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

REL = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--release=')),
           '2026-07-22.0')
S3 = f's3://overturemaps-us-west-2/release/{REL}/theme=places/type=place/*.parquet'

OUT_DIR = Path('data-work')
OUT_DIR.mkdir(exist_ok=True)

# Pilot metros: two states that licence the trade (AZ ROC-283, CA C-61/D-28,
# FL Garage Door Installation Specialty) and one that does not (TX), so the
# pilot measures Overture-only coverage as well as licence cross-matching.
#
# Boxes are wider than a city limit on purpose — the metro is the unit of
# search demand, and `region` below stops a wide box crossing a state line.
# City assignment comes from addresses[1].locality, never from the box.
PILOT_METROS = {
    'houston_tx':     {'region': 'TX', 'bbox': (-95.90, 29.40, -94.90, 30.20)},
    'phoenix_az':     {'region': 'AZ', 'bbox': (-112.50, 33.20, -111.50, 33.80)},
    'los_angeles_ca': {'region': 'CA', 'bbox': (-118.80, 33.70, -117.60, 34.40)},
    'orlando_fl':     {'region': 'FL', 'bbox': (-81.70, 28.20, -81.00, 28.80)},
}

# Verified against the live release, not guessed. `garage_door_service` is
# the primary category for 442 of the 442+ name-matching Houston places;
# `door_sales_service` is the adjacent category that also appears.
TRADE_CATEGORIES = ('garage_door_service', 'door_sales_service')

# NO CATEGORY-BASED EXCLUSION FOR NAME MATCHES, and that took three attempts
# to get right. Worth recording, because it is specific to this trade.
#
#   Attempt 1 — an allowlist of "plausible" categories. Built from a Houston
#   sample, so `builders` and `hardware_store` were missing, and ~100 Los
#   Angeles rows with unmistakably real names ("Long Beach Garage Door Repair
#   Services", "Angel Garage Door Repair Lakewood") vanished silently. The same
#   failure mode LESSONS-LEARNED describes for filtered reference lists.
#
#   Attempt 2 — invert it to a denylist of obviously-wrong categories. Better,
#   but it still dropped "M.G.A Garage Door Repair Houston TX", "Ohana Garage
#   Door Repair of Katy" and five more Alpine Garage Door Repair branches,
#   because Overture files them under `automotive_repair`.
#
#   Which is the actual insight: for THIS trade the category field is
#   systematically unreliable in one direction. The word "garage" pulls
#   mis-categorisation toward automotive_repair, gas_station and car-related
#   labels far more often than chance. Excluding on category therefore throws
#   away precisely the records the name identified correctly.
#
# So a name match is quarantined on the strength of the name, and the category
# is recorded in the review CSV for the human to weigh rather than used to
# delete the row. EXCLUDE_NAME below is what does the real filtering, because a
# name is the one field a business controls and states plainly.

# Names that look like the trade but are not it. Storage and parking are the
# predictable ones; "garage sale" is the classic keyword collision.
EXCLUDE_NAME = re.compile(
    r'garage\s+sale|self\s*storage|mini\s*storage|storage\s+(unit|center|centre)'
    r'|u-?haul|public\s+storage|extra\s+space|parking\s+(garage|lot|deck)'
    r'|apartment|condominium|\bcondos?\b|car\s*wash|auto\s+(body|glass|sales)'
    r'|towing|\bhotel\b|\bmotel\b',
    re.I,
)

# Residential garage door work is the whole point of the site. A firm whose
# own name says it only does commercial rolling steel is out of scope, the
# same way airprohq had to strip cooling-tower specialists.
COMMERCIAL_ONLY = re.compile(r'rolling\s+steel|loading\s+dock|dock\s+&?\s*door', re.I)

NAME_HINT = re.compile(r'garage\s*door|overhead\s+door', re.I)


def region_predicate() -> str:
    """One WHERE clause covering all four metros, so S3 is scanned once."""
    parts = []
    for m in PILOT_METROS.values():
        minx, miny, maxx, maxy = m['bbox']
        parts.append(
            f"(bbox.xmin BETWEEN {minx} AND {maxx}"
            f" AND bbox.ymin BETWEEN {miny} AND {maxy}"
            f" AND addresses[1].region = '{m['region']}')"
        )
    return ' OR '.join(parts)


def metro_for(lon, lat, region):
    """Which pilot metro a row belongs to. Region is checked too, so a row
    inside two overlapping boxes cannot be filed under the wrong state."""
    for name, m in PILOT_METROS.items():
        minx, miny, maxx, maxy = m['bbox']
        if m['region'] == region and minx <= lon <= maxx and miny <= lat <= maxy:
            return name
    return None


def fetch():
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs; SET s3_region='us-west-2';")
    # bbox.xmin/ymin are the point coordinate for a place (min == max), so
    # no spatial extension and no WKB decoding is needed to get lat/lng.
    return con.execute(f"""
        SELECT
            id,
            names.primary                AS name,
            categories.primary           AS category,
            categories.alternate         AS alternates,
            confidence,
            phones[1]                    AS phone,
            websites[1]                  AS website,
            addresses[1].freeform        AS street,
            addresses[1].locality        AS city,
            addresses[1].region          AS region,
            addresses[1].postcode        AS postcode,
            bbox.xmin                    AS lng,
            bbox.ymin                    AS lat
        FROM read_parquet('{S3}')
        WHERE ({region_predicate()})
          AND operating_status = 'open'
          AND (
                categories.primary IN {TRADE_CATEGORIES}
             OR list_contains(categories.alternate, 'garage_door_service')
             OR lower(names.primary) LIKE '%garage door%'
             OR lower(names.primary) LIKE '%overhead door%'
          )
    """).fetchall()


def classify(row):
    """Returns (tier, reason). Tier A publishes; tier B goes to review; None
    is dropped. Tier is about *how the row was identified*, never about how
    good the contractor is — we have no basis for the latter."""
    name = row['name'] or ''
    cat = row['category']
    alts = row['alternates'] or []

    if EXCLUDE_NAME.search(name):
        return None, 'excluded by name (storage/parking/unrelated)'
    if COMMERCIAL_ONLY.search(name) and not NAME_HINT.search(name):
        return None, 'commercial-only overhead door supplier'

    if cat in TRADE_CATEGORIES or 'garage_door_service' in alts:
        return 'A', f'category {cat or "-"}'
    if not NAME_HINT.search(name):
        return None, f'no garage/overhead door in name, category {cat}'
    return 'B', f'name match, category {cat or "none"}'


def pct(n, total):
    return f'{n / total * 100:5.1f}%' if total else '    -'


RAW_CACHE = OUT_DIR / 'pilot-raw.json'


def load_raw():
    cols = ['id', 'name', 'category', 'alternates', 'confidence', 'phone',
            'website', 'street', 'city', 'region', 'postcode', 'lng', 'lat']
    if '--from-cache' in sys.argv:
        if not RAW_CACHE.exists():
            sys.exit(f'  {RAW_CACHE} not found — run without --from-cache first')
        raw = json.loads(RAW_CACHE.read_text(encoding='utf-8'))
        print(f'  rows from cache {RAW_CACHE}: {len(raw)}')
        return raw
    raw = [dict(zip(cols, r)) for r in fetch()]
    for r in raw:
        r['alternates'] = list(r['alternates'] or [])
    RAW_CACHE.write_text(json.dumps(raw, indent=1), encoding='utf-8')
    print(f'  rows returned from Overture {REL}: {len(raw)}')
    return raw


def main():
    raw = load_raw()

    kept, review, dropped = [], [], []
    for r in raw:
        r['metro'] = metro_for(r['lng'], r['lat'], r['region'])
        if not r['metro']:
            dropped.append((r, 'outside every pilot metro'))
            continue
        tier, reason = classify(r)
        r['tier'] = tier
        r['tierReason'] = reason
        if tier == 'A':
            kept.append(r)
        elif tier == 'B':
            review.append(r)
        else:
            dropped.append((r, reason))

    # Deduplicate. The same firm appears more than once when Overture holds
    # both a storefront and an office record; keep the higher-confidence one.
    # Phone is the stronger key — two records sharing a phone are one firm
    # even when the names differ ("ABC Garage Doors" / "ABC Garage Door Co").
    by_key = {}
    for r in sorted(kept, key=lambda x: -(x['confidence'] or 0)):
        digits = re.sub(r'\D', '', r['phone'] or '')
        key = digits[-10:] if len(digits) >= 10 else (
            (r['name'] or '').lower().strip(), (r['city'] or '').lower().strip())
        by_key.setdefault(key, r)
    deduped = list(by_key.values())

    (OUT_DIR / 'pilot-places.json').write_text(
        json.dumps(deduped, indent=1), encoding='utf-8')

    with (OUT_DIR / 'pilot-review.csv').open('w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow(['metro', 'name', 'category', 'reason', 'city', 'phone', 'website'])
        for r in sorted(review, key=lambda x: (x['metro'], x['name'] or '')):
            w.writerow([r['metro'], r['name'], r['category'], r['tierReason'],
                        r['city'], r['phone'], r['website']])

    # ── the numbers that decide whether Overture alone is enough ──
    print(f'''
  Overture pilot pull — garage door, 4 metros
  ─────────────────────────────────────────────────────────
  category-verified (publishable tier)   {len(kept)}
    after dedupe by phone / name+city    {len(deduped)}
  name-matched only (quarantined)        {len(review)}  -> data-work/pilot-review.csv
  dropped                                {len(dropped)}
''')

    print('  fill rate, category-verified rows only')
    print('  metro            rows   phone  website  address     city')
    print('  ' + '-' * 57)
    for m in list(PILOT_METROS) + ['ALL']:
        rows = deduped if m == 'ALL' else [r for r in deduped if r['metro'] == m]
        n = len(rows)
        print(f'  {m:<15} {n:>5}  {pct(sum(1 for r in rows if r["phone"]), n)}'
              f'  {pct(sum(1 for r in rows if r["website"]), n)}'
              f'  {pct(sum(1 for r in rows if r["street"]), n)}'
              f'  {pct(sum(1 for r in rows if r["city"]), n)}')

    publishable = [r for r in deduped if r['phone'] and r['city']]
    print(f'\n  clears the quality bar (phone + city)  {len(publishable)}'
          f'  ({pct(len(publishable), len(deduped)).strip()})')

    # City spread decides how many city pages clear --min-city.
    from collections import Counter
    spread = Counter((r['region'], (r['city'] or '?').title()) for r in publishable)
    over3 = [c for c, n in spread.items() if n >= 3]
    print(f'  distinct cities                        {len(spread)}')
    print(f'  cities with >= 3 listings (publishable) {len(over3)}')
    print('\n  top cities:')
    for (reg, city), n in spread.most_common(15):
        print(f'    {n:>4}  {city}, {reg}')

    if not deduped:
        print('\n  ZERO category-verified rows. Before assuming the taxonomy '
              'drifted, check the release exists and that operating_status '
              'still uses the value "open" in this release.')


if __name__ == '__main__':
    main()
