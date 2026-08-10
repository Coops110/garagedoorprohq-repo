# Stages the pilot pull into src/data/ as the site's published listings.
#
# PIPELINE ORDER — this is step 2 and it must not be run out of order:
#   1. scripts/overture-pilot-pull.py     -> data-work/pilot-places.json
#   2. scripts/stage-listings.py          -> src/data/businesses.json + cities.json
#   3. npm run build
#   4. python scripts/build-redirects.py  (validates against dist/)
#   5. python scripts/check-links.py
#
# This script READS data-work/ and WRITES src/data/. It never writes back to
# its own input. AirProHQ had a script that read and wrote one file, and a
# record whose match was later rejected silently kept the address from the
# previous run — so a fix appeared not to work. Separate input and output
# directories make that class of bug impossible rather than merely unlikely.
#
# The quality bar for publishing, mirroring AirProHQ's:
#   · identified by Overture category, not by name alone (tier A)
#   · a phone number present — without one the listing cannot do its job
#   · a city present, or the listing has nowhere to live in the URL tree
#   · the city clears --min-city, default 3
#
# Records held back are NOT deleted. They stay in data-work/ and publish
# automatically once their city reaches the threshold.
#
#   python scripts/stage-listings.py [--min-city=3] [--metros=houston_tx,...]

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

# The summary below draws a box rule. A Windows console defaults to cp1252 and
# raises UnicodeEncodeError on it — after the JSON has already been written,
# which reads as a failed run when only the print failed.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

IN_FILE = Path('data-work/pilot-places.json')
OUT_DIR = Path('src/data')

arg = lambda name, default: next(
    (a.split('=', 1)[1] for a in sys.argv if a.startswith(f'--{name}=')), default)

MIN_CITY = int(arg('min-city', '3'))
ONLY_METROS = [m for m in arg('metros', '').split(',') if m]

# Full state names for the four pilot states. Deliberately not a 50-state
# table: a lookup that silently returns None for an unlisted state would let
# a bad row through with an empty state name. Adding a state to the site
# means adding it here, on purpose.
STATES = {
    'TX': ('Texas', 'texas'),
    'AZ': ('Arizona', 'arizona'),
    'CA': ('California', 'california'),
    'FL': ('Florida', 'florida'),
}

# Human labels for Overture category slugs. Anything unmapped is
# de-slugified rather than dropped, so a taxonomy addition shows up as
# readable text instead of vanishing.
CATEGORY_LABELS = {
    'garage_door_service': 'Garage door service',
    'door_sales_service': 'Door sales & service',
    'contractor': 'General contracting',
    'home_service': 'Home services',
    'home_improvement_store': 'Home improvement',
    'building_supply_store': 'Building supplies',
    'fence_and_gate_sales_service': 'Fences & gates',
    'automation_services': 'Automation',
    'key_and_locksmith': 'Locksmith',
    'construction': 'Construction',
    'professional_services': 'Professional services',
}


def label(cat):
    if not cat:
        return None
    return CATEGORY_LABELS.get(cat) or cat.replace('_', ' ').capitalize()


def slugify(s):
    s = re.sub(r'[^a-z0-9]+', '-', str(s).lower()).strip('-')
    return re.sub(r'-{2,}', '-', s)


def title_city(s):
    """Overture localities arrive in mixed case. Title-case them, but keep
    the small words that read wrong capitalised."""
    small = {'of', 'the', 'de', 'del', 'las', 'los', 'in'}
    parts = str(s).strip().split()
    out = []
    for i, w in enumerate(parts):
        lw = w.lower()
        out.append(lw if (i and lw in small) else lw.capitalize())
    return ' '.join(out)


def main():
    if not IN_FILE.exists():
        sys.exit(f'  {IN_FILE} not found — run scripts/overture-pilot-pull.py first')

    rows = json.loads(IN_FILE.read_text(encoding='utf-8'))
    stats = Counter(total=len(rows))

    staged = []
    for r in rows:
        if ONLY_METROS and r.get('metro') not in ONLY_METROS:
            stats['skipped_metro'] += 1
            continue
        # Tier A only. Name-only matches live in data-work/pilot-review.csv
        # and are promoted by hand after a human has looked at them.
        if r.get('tier') != 'A':
            stats['not_category_verified'] += 1
            continue
        if not r.get('phone'):
            stats['no_phone'] += 1
            continue
        if not r.get('city'):
            stats['no_city'] += 1
            continue
        code = r.get('region')
        if code not in STATES:
            stats['unknown_state'] += 1
            continue

        state, state_slug = STATES[code]
        city = title_city(r['city'])
        services = [label(r.get('category'))] + [
            label(c) for c in (r.get('alternates') or [])
        ]
        services = [s for s in dict.fromkeys(filter(None, services))][:5]

        staged.append({
            'id': r['id'],
            'name': str(r['name']).strip(),
            'slug': slugify(r['name']),
            'phone': r['phone'],
            'website': (r.get('website') or '').split('?')[0] or None,
            'street': r.get('street') or None,
            'city': city,
            'citySlug': slugify(city),
            'state': state,
            'stateCode': code,
            'stateSlug': state_slug,
            'postalCode': (r.get('postcode') or '')[:5] or None,
            'lat': round(r['lat'], 6) if r.get('lat') is not None else None,
            'lng': round(r['lng'], 6) if r.get('lng') is not None else None,
            'confidence': round(r.get('confidence') or 0, 3),
            'services': services,
            'sourceCategory': r.get('category'),
            'metro': r.get('metro'),
            # Populated by the licence cross-match step (CA/FL/AZ only).
            # Present as explicit nulls so a template reading them cannot
            # confuse "not checked" with "checked and absent".
            'licenceNumber': None,
            'licenceAuthority': None,
            'licenceStatus': None,
            'licenceCheckedOn': None,
        })

    # ── city threshold ──────────────────────────────────────
    by_city = defaultdict(list)
    for b in staged:
        by_city[(b['stateSlug'], b['citySlug'])].append(b)

    published, held = [], []
    for key, group in by_city.items():
        (published if len(group) >= MIN_CITY else held).extend(group)

    # ── unique slugs, scoped per city ───────────────────────
    # Two firms called "Precision Garage Door" in one city would otherwise
    # collide on one URL and one would silently overwrite the other.
    seen = set()
    for b in sorted(published, key=lambda x: (x['stateSlug'], x['citySlug'], x['name'])):
        base = b['slug'] or 'garage-door-company'
        slug, n = base, 1
        while (b['stateSlug'], b['citySlug'], slug) in seen:
            n += 1
            slug = f'{base}-{n}'
        b['slug'] = slug
        seen.add((b['stateSlug'], b['citySlug'], slug))

    # ── cities.json ─────────────────────────────────────────
    cities = []
    for (state_slug, city_slug), group in sorted(by_city.items()):
        if len(group) < MIN_CITY:
            continue
        first = group[0]
        coords = [(b['lat'], b['lng']) for b in group if b['lat'] is not None]
        cities.append({
            'city': first['city'],
            'citySlug': city_slug,
            'state': first['state'],
            'stateCode': first['stateCode'],
            'stateSlug': state_slug,
            'count': len(group),
            'licensedCount': sum(1 for b in group if b['licenceNumber']),
            'withWebsite': sum(1 for b in group if b['website']),
            'withAddress': sum(1 for b in group if b['street']),
            # Centroid, used to centre the city map. Averaging listing
            # coordinates is honest here — it is where the listings are, not
            # a claim about the city's official centre.
            'lat': round(sum(c[0] for c in coords) / len(coords), 5) if coords else None,
            'lng': round(sum(c[1] for c in coords) / len(coords), 5) if coords else None,
        })
    cities.sort(key=lambda c: (-c['count'], c['city']))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / 'businesses.json').write_text(
        json.dumps(published, indent=1), encoding='utf-8')
    (OUT_DIR / 'cities.json').write_text(
        json.dumps(cities, indent=1), encoding='utf-8')

    # Attribution is a licence condition of Apache 2.0, not a courtesy.
    # Written from here so it can never describe a dataset the site is not
    # actually publishing.
    (OUT_DIR / 'overture-attribution.json').write_text(json.dumps({
        'source': 'Foursquare Open Source Places, distributed by Overture Maps Foundation',
        'release': '2026-07-22.0',
        'license': 'Apache License 2.0',
        'licenseUrl': 'https://www.apache.org/licenses/LICENSE-2.0',
        'note': 'Business names, addresses, phone numbers, websites, coordinates and '
                'categories derive from this dataset. Records were filtered to the '
                'garage_door_service category, restricted to businesses marked as '
                'currently operating, deduplicated, and reformatted. No ratings, '
                'reviews or opening hours are published because this dataset does '
                'not contain them.',
    }, indent=1), encoding='utf-8')

    # Held-back records are kept, not discarded, so they publish
    # automatically once the city reaches the threshold.
    Path('data-work/held-below-threshold.json').write_text(
        json.dumps(held, indent=1), encoding='utf-8')

    print(f'''
  Staged listings
  ─────────────────────────────────────────────────────
  rows in pilot pull                {stats['total']}
    not category-verified (tier B)  {stats['not_category_verified']}
    no phone                        {stats['no_phone']}
    no city                         {stats['no_city']}
    state outside the pilot         {stats['unknown_state']}
    metro filtered out              {stats['skipped_metro']}

  cleared the quality bar           {len(staged)}
    published (city >= {MIN_CITY})          {len(published)}
    held below threshold            {len(held)}  -> data-work/held-below-threshold.json

  city pages                        {len(cities)}
  state pages                       {len({c['stateSlug'] for c in cities})}
  business pages                    {len(published)}
  licence-verified so far           {sum(1 for b in published if b['licenceNumber'])}
''')
    for c in cities[:15]:
        print(f"    {c['count']:>4}  {c['city']}, {c['stateCode']}")


if __name__ == '__main__':
    main()
