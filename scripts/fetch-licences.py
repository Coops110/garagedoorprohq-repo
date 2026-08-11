# Normalises state licence register exports into data-work/licences/ for
# scripts/match-licences.py.
#
# These are public records, published by each state precisely so consumers can
# check a contractor. That is the same "public records only" basis the rest of
# this site's data rests on, and it is why the editorial guidelines can describe
# the check honestly.
#
# ── ALL THREE STATES NEED A MANUAL DOWNLOAD, AND THAT IS FINAL ──
#
# An earlier version of this script tried to drive California's CSLB portal
# directly. It cannot be done, and the reason matters:
#
#   CA  web.cslb.ca.gov serves the form over GET, but the search POST is
#       rejected by an F5 web application firewall ("Request Rejected" plus a
#       support ID). There is no static file URL — every export is generated
#       behind that form. Getting past the WAF would mean impersonating a
#       browser to defeat bot protection, which is not something this project
#       will do for a file a human can download in four clicks.
#
#   FL  myfloridalicense.com returns 403 to scripted requests.
#
#   AZ  The ROC search is a Salesforce Experience Cloud app whose data comes
#       from an internal Aura endpoint — not a stable public interface.
#
# So this script does the part that actually needs care: normalising three
# differently-shaped exports into one schema, and saying clearly when a file's
# columns do not match rather than silently writing zero rows.
#
# DO NOT SUBSTITUTE A THIRD-PARTY SCRAPER. A web search for "CSLB bulk data"
# returns several commercial services. The official registers are free and
# authoritative; buying the same rows from a middleman inherits their terms
# while adding nothing — the reasoning that keeps Google Places off this site.
#
# ── WHERE TO GET EACH FILE ──
#
#   CA  https://web.cslb.ca.gov/onlineservices/Dataportal/ListByClassification
#       Select classification "C-61/D-28 - Doors, Gates and Activating Devices
#       Contractor", then download. Covers the whole state in one file.
#
#   FL  https://www.myfloridalicense.com/  ->  DBPR licensee data / public
#       records downloads. Take the construction industry (CILB) licensee file.
#
#   AZ  https://azroc.my.site.com/AZRoc/s/contractor-search
#       Search classification 283, then export the results.
#
#   python scripts/fetch-licences.py --ca-file=~/Downloads/cslb.csv
#   python scripts/fetch-licences.py --fl-file=… --az-file=…
#
# Output: data-work/licences/{ca,fl,az}.json, each a list of
#   {state, licence, name, city, zip, status, classification, expires}

import csv
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OUT_DIR = Path('data-work/licences')
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Candidate header names per output field, lower-cased. Every state names its
# columns differently and renames them between exports, so each field lists
# several possibilities and the first one present wins.
MAPS = {
    'CA': {
        'licence': ['license number', 'licenseno', 'license no.', 'license no', 'license', 'lic #'],
        'name': ['business name', 'businessname', 'name', 'dba'],
        'city': ['city', 'mailing city', 'business city'],
        'zip': ['zip', 'zip code', 'zipcode', 'mailing zip'],
        'status': ['primary status', 'license status', 'status'],
        'classification': ['classification', 'classifications', 'class', 'classification(s)'],
        'expires': ['expiration date', 'expires', 'expiration'],
    },
    'FL': {
        'licence': ['license number', 'licensenumber', 'lic number', 'license'],
        'name': ['business name', 'dba name', 'licensee name', 'name'],
        'city': ['city', 'business city', 'mailing city'],
        'zip': ['zip', 'zip code', 'business zip'],
        'status': ['status', 'license status', 'primary status'],
        'classification': ['license type', 'profession', 'classification', 'rank'],
        'expires': ['expiration date', 'expires', 'expiry'],
    },
    'AZ': {
        'licence': ['license number', 'license #', 'licensenumber', 'roc number', 'license'],
        'name': ['business name', 'dba', 'entity name', 'name'],
        'city': ['city', 'business city'],
        'zip': ['zip', 'zip code', 'postal code'],
        'status': ['status', 'license status'],
        'classification': ['classification', 'class', 'license class', 'scope'],
        'expires': ['expiration date', 'expires', 'expiration'],
    },
}


def arg(name):
    for a in sys.argv[1:]:
        if a.startswith(f'--{name}='):
            return a.split('=', 1)[1]
    return None


def sniff_reader(fh):
    """CSLB and DBPR exports have appeared as comma, tab and pipe delimited.
    Detect rather than assume — the wrong delimiter yields one giant column and
    zero usable rows, which looks identical to an empty register."""
    sample = fh.read(64 * 1024)
    fh.seek(0)
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=',\t|;')
    except csv.Error:
        dialect = csv.excel
    return csv.DictReader(fh, dialect=dialect)


def normalise(path, state):
    mapping = MAPS[state]
    p = Path(path).expanduser()
    if not p.exists():
        sys.exit(f'  {p} not found')

    with p.open(encoding='utf-8-sig', newline='') as fh:
        reader = sniff_reader(fh)
        headers = [(h or '').strip().lower() for h in (reader.fieldnames or [])]
        rows, skipped = [], 0
        for r in reader:
            low = {(k or '').strip().lower(): (v or '').strip() for k, v in r.items()}
            rec = {'state': state}
            for field, candidates in mapping.items():
                rec[field] = next((low[c] for c in candidates if low.get(c)), '')
            if rec['licence'] and rec['name']:
                rows.append(rec)
            else:
                skipped += 1

    if not rows:
        print(f'\n  ! No usable rows in {p.name}.')
        print(f'    Columns found: {headers}')
        print('    Expected a licence-number column named one of:'
              f' {mapping["licence"]}')
        print('    and a business-name column named one of:'
              f' {mapping["name"]}')
        print('    Add the real column names to MAPS in this script and re-run.')
        return []

    print(f'  {state}: {len(rows)} usable rows'
          + (f', {skipped} skipped (no licence number or no name)' if skipped else ''))
    # Surface what the matcher will actually filter on, so a wrong column
    # mapping is visible here rather than as a mysteriously empty badge count
    # two steps later.
    from collections import Counter
    statuses = Counter(r['status'].lower() or '(blank)' for r in rows)
    classes = Counter(r['classification'][:44] or '(blank)' for r in rows)
    print(f'     statuses: {dict(statuses.most_common(4))}')
    print(f'     classes : {dict(classes.most_common(3))}')
    return rows


def main():
    wrote = False
    for state in ('CA', 'FL', 'AZ'):
        path = arg(f'{state.lower()}-file')
        if not path:
            continue
        rows = normalise(path, state)
        if rows:
            out = OUT_DIR / f'{state.lower()}.json'
            out.write_text(json.dumps(rows, indent=1), encoding='utf-8')
            print(f'     -> {out}')
            wrote = True

    if not wrote:
        print(__doc__)
        print('''  Nothing to do. Download the register export first, then:

    python scripts/fetch-licences.py --ca-file=path/to/cslb.csv
    python scripts/fetch-licences.py --fl-file=path/to/dbpr.csv
    python scripts/fetch-licences.py --az-file=path/to/roc.csv

  Then:
    python scripts/match-licences.py
    python scripts/stage-listings.py

  The matcher can be verified with no data at all:
    python scripts/match-licences.py --self-test''')
        return

    print('\n  Next: python scripts/match-licences.py')


if __name__ == '__main__':
    main()
