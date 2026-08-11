# Matches published listings against state licence registers, for the three
# states that license garage door work: CA, FL and AZ.
#
# WHY THIS SCRIPT IS THE RISKIEST ONE IN THE REPO
# A licence badge is the only claim this site makes that a reader cannot check
# at a glance, and it is the site's stated differentiator. A wrong badge is
# therefore worse than no badge: it tells someone a business is licensed when we
# have not established that. So the bar here is deliberately higher than
# "probably the same company".
#
# There is NO shared identifier between Overture and a state register — no
# common id, no shared key. Matching is therefore on name, which is exactly the
# operation LESSONS-LEARNED warns about: on AirProHQ, name-only matching put a
# Lubbock-licensed firm in Wharton and an Austin one in Haltom City, and Texas
# has eight licensed "Mendoza" HVAC firms.
#
# Four guards, all of which must pass:
#
#   1. CORROBORATION. A normalised name match is not enough on its own. The city
#      or the ZIP must also agree. Where the cities are both present and differ,
#      the record is recorded as a conflict and gets no badge.
#   2. UNAMBIGUITY. If two or more register records match one business and they
#      carry different licence numbers, we cannot tell which is the right firm,
#      so none is used. This is the "eight Mendoza firms" case.
#   3. ACTIVE STATUS ONLY. An expired, suspended or inactive licence earns no
#      badge, because the badge wording says "active record".
#   4. RIGHT CLASSIFICATION. The licence must actually cover garage door work.
#      A general B licence in California is not a C-61/D-28.
#   5. A CONTRADICTED STRONGER SIGNAL BEATS AN AGREEING WEAKER ONE. If both
#      sides carry a phone number and the numbers differ, that is evidence
#      against the match — it does not fall through to matching on city.
#   6. ONE LICENCE, ONE LISTING. A licence number may badge at most one
#      business. Where two listings claim the same licence, it is kept only for
#      the single phone-corroborated claimant, and otherwise dropped entirely.
#
# Everything rejected is written out with its reason, so a human can see what was
# thrown away and why rather than trusting a single summary number.
#
# READS  data-work/licences/*.json   (normalised registers — see fetch-licences.py)
#        src/data/businesses.json    (read only)
# WRITES data-work/licence-matches.json
#        data-work/licence-rejected.csv
#
# It does NOT write src/data/. stage-listings.py is the only writer there, which
# is the pipeline rule in CLAUDE.md — a script that reads and writes the same
# file left a stale address behind on AirProHQ and made a fix look ineffective.
#
#   python scripts/match-licences.py
#   python scripts/match-licences.py --self-test    # no network, no data needed

import csv
import json
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

LICENCE_DIR = Path('data-work/licences')
BUSINESSES = Path('src/data/businesses.json')
OUT_MATCHES = Path('data-work/licence-matches.json')
OUT_REJECTED = Path('data-work/licence-rejected.csv')

# Classifications that actually cover garage door work in each state. A licence
# outside these earns no badge even if the name and city match perfectly.
VALID_CLASSES = {
    'CA': (re.compile(r'C-?61.*D-?28|D-?28', re.I), 'C-61/D-28 Doors, Gates and Activating Devices'),
    'FL': (re.compile(r'garage\s*door', re.I), 'Garage Door Installation Specialty Contractor'),
    'AZ': (re.compile(r'\b(ROC-?)?283\b|garage\s*door', re.I), 'ROC-283 Garage Doors, Gates and Similar Devices'),
}

ACTIVE_WORDS = ('active', 'current', 'valid', 'clear')

AUTHORITY = {
    'CA': 'California Contractors State License Board',
    'FL': 'Florida Department of Business and Professional Regulation',
    'AZ': 'Arizona Registrar of Contractors',
}

# Same normaliser shape as the Overture matcher, so match rates between the two
# sources are comparable and a name behaves identically in both.
NOISE = re.compile(
    r'\b(inc|llc|l\.l\.c|ltd|lp|llp|co|corp|corporation|company|incorporated'
    r'|the|a|of|and|dba|services?|service|garage|door|doors)\b'
)


def norm(name):
    """Normalise a business name for comparison.

    Note that 'garage', 'door' and 'doors' are stripped as noise. On a site where
    every business is a garage door company those words carry no distinguishing
    information — leaving them in makes "A1 Garage Door" and "A1 Garage Doors
    Inc" look different while making "Precision Garage Door" and "Premier Garage
    Door" look more similar than they are.
    """
    s = unicodedata.normalize('NFKD', str(name or '')).encode('ascii', 'ignore').decode().lower()
    s = s.replace('&', ' and ')
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    s = NOISE.sub(' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def zip5(value):
    digits = re.sub(r'\D', '', str(value or ''))
    return digits[:5] if len(digits) >= 5 else ''


def phone10(value):
    """Last ten digits, so "(562) 360 1926" and "+15623601926" compare equal."""
    digits = re.sub(r'\D', '', str(value or ''))
    return digits[-10:] if len(digits) >= 10 else ''


def load_registers():
    """Normalised register records. Each file is a list of dicts with keys:
    state, licence, name, city, zip, status, classification, expires."""
    if not LICENCE_DIR.exists():
        return []
    rows = []
    for f in sorted(LICENCE_DIR.glob('*.json')):
        rows.extend(json.loads(f.read_text(encoding='utf-8')))
    return rows


def index_registers(rows):
    """Group register records by normalised name, keeping only active licences
    whose classification covers garage door work."""
    index, skipped = {}, {'inactive': 0, 'wrong_class': 0, 'unusable_name': 0}
    for r in rows:
        state = (r.get('state') or '').upper()
        pattern = VALID_CLASSES.get(state, (None, None))[0]
        if pattern is None:
            continue
        # Each state has its own word for "in good standing". CSLB uses CLEAR;
        # without it all 2,786 California records are discarded on status alone.
        if str(r.get('status', '')).strip().lower() not in ACTIVE_WORDS:
            skipped['inactive'] += 1
            continue
        if not pattern.search(str(r.get('classification', ''))):
            skipped['wrong_class'] += 1
            continue
        key = norm(r.get('name'))
        # A name that normalises to almost nothing ("A1 Garage Doors" -> "a1")
        # cannot carry a match on its own.
        if len(key) < 3:
            skipped['unusable_name'] += 1
            continue
        index.setdefault((state, key), []).append(r)
    return index, skipped


def match(businesses, index):
    matched, rejected = {}, []

    def reject(b, reason, detail=''):
        rejected.append({
            'name': b['name'], 'city': b.get('city', ''), 'state': b.get('stateCode', ''),
            'reason': reason, 'detail': detail,
        })

    for b in businesses:
        state = (b.get('stateCode') or '').upper()
        if state not in VALID_CLASSES:
            continue  # the trade is not licensed here; no badge is expected
        candidates = index.get((state, norm(b['name'])), [])
        if not candidates:
            reject(b, 'no register record with a matching name')
            continue

        # ── guard 1: corroboration on city or ZIP ──
        b_city = (b.get('city') or '').strip().lower()
        b_zip = zip5(b.get('postalCode'))
        b_phone = phone10(b.get('phone'))
        corroborated, conflicting = [], []
        # Strongest first: a shared phone number is very nearly unique, a ZIP is
        # narrow, a city is merely consistent.
        for r in candidates:
            r_city = (r.get('city') or '').strip().lower()
            r_zip = zip5(r.get('zip'))
            r_phone = phone10(r.get('phone'))
            if b_phone and r_phone and b_phone == r_phone:
                r['_via'] = 'phone'
                corroborated.append(r)
            elif b_phone and r_phone and b_phone != r_phone:
                # Both sides carry a phone and they disagree. This is checked
                # BEFORE the ZIP and city fallbacks, not after: a contradicted
                # stronger signal outranks an agreeing weaker one. Ordering it
                # after the ZIP check still badged "Mesa Garage Door Services"
                # from "MESA GARAGE DOORS" on a shared ZIP while the two phone
                # numbers had nothing in common — which is how the first version
                # of this fix passed the real data and failed its own test.
                conflicting.append(r)
            elif b_zip and r_zip and b_zip == r_zip:
                r['_via'] = 'ZIP'
                corroborated.append(r)
            elif b_city and r_city and b_city == r_city:
                r['_via'] = 'city'
                corroborated.append(r)
            elif b_city and r_city and b_city != r_city:
                conflicting.append(r)
        if not corroborated:
            if conflicting and any(phone10(r.get('phone')) and b_phone
                                   and phone10(r.get('phone')) != b_phone for r in conflicting):
                reject(b, 'name matched but phone number conflicts',
                       f"ours {b.get('phone')}, register "
                       + '/'.join(sorted({(r.get('phone') or '?') for r in conflicting})))
            elif conflicting:
                reject(b, 'name matched but city conflicts',
                       f"we say {b.get('city')}, register says "
                       + '/'.join(sorted({(r.get('city') or '?') for r in conflicting})))
            else:
                reject(b, 'name matched but nothing corroborated it (no city or ZIP on one side)')
            continue

        # ── guard 2: unambiguous ──
        numbers = {str(r.get('licence')).strip() for r in corroborated}
        if len(numbers) > 1:
            reject(b, 'several licences match — cannot tell which firm', ', '.join(sorted(numbers)))
            continue

        rank = {'phone': 0, 'ZIP': 1, 'city': 2}
        r = sorted(corroborated, key=lambda x: rank.get(x.get('_via'), 9))[0]
        matched[b['id']] = {
            'licenceNumber': str(r['licence']).strip(),
            'licenceAuthority': AUTHORITY[state],
            'licenceStatus': 'Active',
            'licenceClass': VALID_CLASSES[state][1],
            'licenceExpires': r.get('expires') or None,
            'licenceCheckedOn': date.today().isoformat(),
            # What actually corroborated it, so a spot-check can retrace the
            # decision rather than taking the match on faith.
            'licenceMatchedOn': r.get('_via', 'city'),
        }

    # ── guard 5: a licence number may badge at most one business ──
    # Licence #1015910 was assigned to two different Overture listings, both
    # named "Garage Door Hero" in Anaheim with different phone numbers. Whatever
    # the explanation — a duplicate, a franchise, two firms — at least one of the
    # two badges is wrong, and we cannot tell which. Keep it only where exactly
    # one claimant is corroborated by phone; otherwise drop them all.
    from collections import defaultdict
    by_licence = defaultdict(list)
    for bid, v in matched.items():
        by_licence[v['licenceNumber']].append(bid)

    by_id = {b['id']: b for b in businesses}
    for licence, ids in by_licence.items():
        if len(ids) < 2:
            continue
        strong = [i for i in ids if matched[i]['licenceMatchedOn'] == 'phone']
        keep = strong[0] if len(strong) == 1 else None
        for i in ids:
            if i == keep:
                continue
            b = by_id[i]
            reject(b, 'licence already claimed by another listing',
                   f'#{licence} also matched {len(ids) - 1} other listing(s)'
                   + ('; kept the phone-corroborated one' if keep else '; none was phone-corroborated'))
            del matched[i]

    return matched, rejected


# ── self-test ────────────────────────────────────────────────
# Runs the real matcher over a fixture built to trip each guard. This exists
# because the guards are the whole value of the script and a silent regression
# in one of them ships a false badge — the single worst output this site can
# produce.
def self_test():
    registers = [
        # a clean match, and CSLB's real status word
        {'state': 'CA', 'licence': '111111', 'name': 'Anselmo Garage Doors Inc', 'city': 'Anaheim',
         'zip': '92805', 'phone': '(714) 555 0101', 'status': 'CLEAR',
         'classification': ' D21 | D28', 'expires': '01/31/2028'},
        # same name in a different city, but the phone number agrees — phone
        # should win over the city mismatch rather than being thrown out.
        {'state': 'CA', 'licence': '777777', 'name': 'Harbor Garage Doors', 'city': 'Wilmington',
         'zip': '90744', 'phone': '(310) 555 0199', 'status': 'CLEAR',
         'classification': ' D28', 'expires': '06/30/2028'},
        # right name, wrong city — the Lubbock/Wharton case
        {'state': 'CA', 'licence': '222222', 'name': 'Beacon Garage Door', 'city': 'Fresno',
         'zip': '93701', 'status': 'ACTIVE', 'classification': 'C-61/D-28', 'expires': '2028-01-31'},
        # two firms share a name in the same city — the Mendoza case
        {'state': 'CA', 'licence': '333333', 'name': 'Mendoza Garage Doors', 'city': 'Glendale',
         'zip': '91205', 'status': 'ACTIVE', 'classification': 'C-61/D-28', 'expires': '2028-01-31'},
        {'state': 'CA', 'licence': '444444', 'name': 'Mendoza Garage Door Co', 'city': 'Glendale',
         'zip': '91205', 'status': 'ACTIVE', 'classification': 'C-61/D-28', 'expires': '2029-01-31'},
        # expired
        {'state': 'CA', 'licence': '555555', 'name': 'Corona Garage Doors', 'city': 'Corona',
         'zip': '92879', 'status': 'EXPIRED', 'classification': 'C-61/D-28', 'expires': '2019-01-31'},
        # active but the wrong classification — a general builder, not D-28
        {'state': 'CA', 'licence': '666666', 'name': 'Delta Garage Doors', 'city': 'Downey',
         'zip': '90241', 'status': 'ACTIVE', 'classification': 'B - General Building', 'expires': '2028-01-31'},
        # guard 5: same city, but the phones actively disagree. This is the real
        # "Mesa Garage Door Services" / "MESA GARAGE DOORS" case.
        {'state': 'CA', 'licence': '888888', 'name': 'Mesa Garage Doors', 'city': 'Anaheim',
         'zip': '92805', 'phone': '(800) 951 7700', 'status': 'CLEAR',
         'classification': ' D28', 'expires': '12/31/2028'},
        # guard 6, case one: two listings both legitimately corroborate this
        # licence — one by phone, one by ZIP. The phone-corroborated one wins.
        # (The real case was licence 1015910 badging two "Garage Door Hero"
        # listings in Anaheim.)
        {'state': 'CA', 'licence': 'AAAAAA', 'name': 'Twin Garage Doors', 'city': 'Irvine',
         'zip': '92602', 'phone': '(949) 555 0111', 'status': 'CLEAR',
         'classification': ' D28', 'expires': '12/31/2028'},
        # guard 6, case two: two claimants, neither corroborated by phone, so
        # there is no basis to choose — both must lose the badge.
        {'state': 'CA', 'licence': 'BBBBBB', 'name': 'Pair Garage Doors', 'city': 'Tustin',
         'zip': '92780', 'phone': '', 'status': 'CLEAR',
         'classification': ' D28', 'expires': '12/31/2028'},
    ]
    businesses = [
        {'id': 'a', 'name': 'Anselmo Garage Doors', 'city': 'Anaheim', 'postalCode': '92805',
         'phone': '+1 714-555-0101', 'stateCode': 'CA'},
        {'id': 'h', 'name': 'Harbor Garage Doors', 'city': 'San Pedro', 'postalCode': '90731',
         'phone': '(310) 555-0199', 'stateCode': 'CA'},
        {'id': 'b', 'name': 'Beacon Garage Doors', 'city': 'Glendale', 'postalCode': '91205', 'stateCode': 'CA'},
        {'id': 'c', 'name': 'Mendoza Garage Doors', 'city': 'Glendale', 'postalCode': '91205', 'stateCode': 'CA'},
        {'id': 'd', 'name': 'Corona Garage Doors', 'city': 'Corona', 'postalCode': '92879', 'stateCode': 'CA'},
        {'id': 'e', 'name': 'Delta Garage Doors', 'city': 'Downey', 'postalCode': '90241', 'stateCode': 'CA'},
        {'id': 'f', 'name': 'Nonexistent Garage Doors', 'city': 'Irvine', 'postalCode': '92602', 'stateCode': 'CA'},
        # guard 5: city agrees, phone contradicts -> no badge.
        {'id': 'i', 'name': 'Mesa Garage Door Services', 'city': 'Anaheim', 'postalCode': '92805',
         'phone': '6572208539', 'stateCode': 'CA'},
        # guard 6 case one: 'j' matches by phone, 'k' only by ZIP.
        {'id': 'j', 'name': 'Twin Garage Doors', 'city': 'Irvine', 'postalCode': '92602',
         'phone': '9495550111', 'stateCode': 'CA'},
        {'id': 'k', 'name': 'Twin Garage Doors', 'city': 'Irvine', 'postalCode': '92602',
         'phone': '', 'stateCode': 'CA'},
        # guard 6 case two: neither has a phone, so neither can be preferred.
        {'id': 'p', 'name': 'Pair Garage Doors', 'city': 'Tustin', 'postalCode': '92780',
         'phone': '', 'stateCode': 'CA'},
        {'id': 'q', 'name': 'Pair Garage Doors', 'city': 'Tustin', 'postalCode': '92780',
         'phone': '', 'stateCode': 'CA'},
        # Texas does not license the trade, so this must be ignored entirely
        # rather than rejected — a rejection would imply we looked and failed.
        {'id': 'g', 'name': 'Anselmo Garage Doors', 'city': 'Houston', 'postalCode': '77002', 'stateCode': 'TX'},
    ]

    index, _ = index_registers(registers)
    matched, rejected = match(businesses, index)
    reasons = {r['name']: r['reason'] for r in rejected}

    checks = [
        ('clean match gets a badge', 'a' in matched),
        ('badge carries the right number', matched.get('a', {}).get('licenceNumber') == '111111'),
        ('phone beats ZIP as the recorded source', matched.get('a', {}).get('licenceMatchedOn') == 'phone'),
        ('CLEAR counts as an active licence', 'a' in matched),
        ('pipe-separated D28 classification accepted', 'a' in matched),
        ('phone match survives a city mismatch', 'h' in matched),
        ('and records phone as the source', matched.get('h', {}).get('licenceMatchedOn') == 'phone'),
        ('city conflict is rejected', 'b' not in matched),
        ('conflict reason is explicit', 'city conflicts' in reasons.get('Beacon Garage Doors', '')),
        ('ambiguous name is rejected', 'c' not in matched),
        ('ambiguity reason is explicit', 'several licences' in reasons.get('Mendoza Garage Doors', '')),
        ('expired licence is rejected', 'd' not in matched),
        ('wrong classification is rejected', 'e' not in matched),
        ('unmatched name is rejected', 'f' not in matched),
        ('phone conflict outranks a matching city', 'i' not in matched),
        ('and says so', 'phone number conflicts' in reasons.get('Mesa Garage Door Services', '')),
        ('duplicate licence keeps only the phone-corroborated listing',
         'j' in matched and 'k' not in matched),
        ('and explains the drop',
         'already claimed' in reasons.get('Twin Garage Doors', '')),
        ('duplicate with no phone evidence drops both',
         'p' not in matched and 'q' not in matched),
        ('no licence number badges two listings',
         len({v['licenceNumber'] for v in matched.values()}) == len(matched)),
        ('unlicensed state is skipped, not rejected',
         'g' not in matched and not any(r['state'] == 'TX' for r in rejected)),
    ]
    width = max(len(c[0]) for c in checks)
    failed = 0
    for label, ok in checks:
        print(f"  {'PASS' if ok else 'FAIL'}  {label:<{width}}")
        failed += 0 if ok else 1
    print(f"\n  {len(checks) - failed}/{len(checks)} guards behaving correctly")
    return 1 if failed else 0


def main():
    if '--self-test' in sys.argv:
        sys.exit(self_test())

    if not BUSINESSES.exists():
        sys.exit(f'  {BUSINESSES} not found — run scripts/stage-listings.py first')
    registers = load_registers()
    if not registers:
        sys.exit(
            f'  no register data in {LICENCE_DIR}/\n'
            '  Run scripts/fetch-licences.py, or drop normalised JSON there by hand.\n'
            '  Verify the matcher itself with: python scripts/match-licences.py --self-test'
        )

    businesses = json.loads(BUSINESSES.read_text(encoding='utf-8'))
    index, skipped = index_registers(registers)
    matched, rejected = match(businesses, index)

    OUT_MATCHES.parent.mkdir(parents=True, exist_ok=True)
    OUT_MATCHES.write_text(json.dumps(matched, indent=1), encoding='utf-8')
    with OUT_REJECTED.open('w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=['name', 'city', 'state', 'reason', 'detail'])
        w.writeheader()
        w.writerows(rejected)

    in_scope = [b for b in businesses if (b.get('stateCode') or '').upper() in VALID_CLASSES]
    from collections import Counter
    by_reason = Counter(r['reason'] for r in rejected)

    print(f'''
  Licence matching
  ─────────────────────────────────────────────────────────
  register records loaded            {len(registers)}
    dropped, not active              {skipped['inactive']}
    dropped, wrong classification    {skipped['wrong_class']}
    dropped, name too generic        {skipped['unusable_name']}
  usable register names              {len(index)}

  listings in a licensing state      {len(in_scope)}
  BADGED                             {len(matched)}
  no badge                           {len(rejected)}  -> data-work/licence-rejected.csv
''')
    for reason, n in by_reason.most_common():
        print(f'    {n:>5}  {reason}')
    print('\n  Next: python scripts/stage-listings.py   (merges these into src/data/)')


if __name__ == '__main__':
    main()
