# Pulls the three state licence registers into data-work/licences/ as normalised
# JSON for scripts/match-licences.py.
#
# These are public records, published by each state precisely so that consumers
# can check a contractor. That is the same "public records only" basis the rest of
# the site's data rests on, and it is why the editorial guidelines can describe
# the check honestly.
#
# DO NOT USE A THIRD-PARTY SCRAPER FOR THIS. A web search for CSLB bulk data
# returns half a dozen commercial scraping services. The official portal is free
# and authoritative, and buying the same records from a middleman inherits their
# terms while adding nothing — the same reasoning that keeps Google Places data
# off this site entirely.
#
# STATE OF PLAY
#
#   CA  Works. The CSLB data portal serves a list by classification and county,
#       filtered to C-61/D-28 (Doors, Gates and Activating Devices). ASP.NET
#       WebForms, so the flow is: GET the form for __VIEWSTATE, then POST the
#       classification and county.
#
#   FL  Needs a manual export. myfloridalicense.com returns 403 to scripted
#       requests. DBPR publishes licensee extract files from its site; download
#       the contractor file and point --fl-file at it.
#
#   AZ  Needs a manual export. The ROC search is a Salesforce Experience Cloud
#       app whose data comes from an internal Aura endpoint — not a stable public
#       interface, and not something to script against. Export from the
#       contractor search UI and point --az-file at it.
#
# Being explicit about that split matters: two of the three states are a manual
# step, and pretending otherwise would leave someone assuming badges will appear
# in Florida and Arizona on their own.
#
#   python scripts/fetch-licences.py --ca-counties="LOS ANGELES,ORANGE"
#   python scripts/fetch-licences.py --fl-file=~/Downloads/dbpr.csv
#
# Output: data-work/licences/{ca,fl,az}.json, each a list of
#   {state, licence, name, city, zip, status, classification, expires}

import csv
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OUT_DIR = Path('data-work/licences')
OUT_DIR.mkdir(parents=True, exist_ok=True)

CSLB_FORM = 'https://web.cslb.ca.gov/onlineservices/Dataportal/ListByCounty'
CSLB_CLASS = 'C-61/D-28'

# Counties covering the Los Angeles pilot metro. Widen as the site expands.
CA_DEFAULT_COUNTIES = ['LOS ANGELES', 'ORANGE']

UA = 'GarageDoorProHQ/1.0 (+https://garagedoorprohq.com; licence verification for a public directory)'


def arg(name, default=None):
    for a in sys.argv[1:]:
        if a.startswith(f'--{name}='):
            return a.split('=', 1)[1]
    return default


def get(url, data=None):
    req = urllib.request.Request(
        url,
        data=urllib.parse.urlencode(data).encode() if data else None,
        headers={'User-Agent': UA, 'Accept': 'text/html,text/csv,*/*'},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read().decode('utf-8', 'replace')


def hidden_fields(html):
    """Pull the ASP.NET postback tokens out of the form."""
    out = {}
    for name in ('__VIEWSTATE', '__VIEWSTATEGENERATOR', '__EVENTVALIDATION'):
        m = re.search(rf'id="{name}"[^>]*value="([^"]*)"', html)
        if m:
            out[name] = m.group(1)
    return out


def fetch_ca(counties):
    """CSLB list by classification and county."""
    rows = []
    for county in counties:
        print(f'  CA / {county}: requesting {CSLB_CLASS} …')
        form = get(CSLB_FORM)
        fields = hidden_fields(form)
        if '__VIEWSTATE' not in fields:
            print('    ! no __VIEWSTATE in the form — the page structure has changed.')
            print('      Re-inspect the form before trusting anything this returns.')
            return rows
        fields.update({
            'ctl00$MainContent$lbClassification': CSLB_CLASS,
            'ctl00$MainContent$lbCounty': county,
            'ctl00$MainContent$btnSearch': 'Search',
        })
        body = get(CSLB_FORM, fields)
        got = parse_cslb(body, county)
        print(f'    {len(got)} records')
        rows.extend(got)
    return rows


def parse_cslb(body, county):
    """CSLB returns either a CSV attachment or an HTML table depending on the
    path taken. Handle both rather than assuming, and say so loudly if neither
    shape is recognisable — a silent zero here would read as 'no licensed
    contractors in Los Angeles', which is obviously wrong and easy to miss."""
    rows = []

    if body.lstrip().lower().startswith(('license', '"license', 'lic ')) or body.count(',') > body.count('<'):
        for r in csv.DictReader(io.StringIO(body)):
            low = {(k or '').strip().lower(): (v or '').strip() for k, v in r.items()}
            rows.append({
                'state': 'CA',
                'licence': low.get('license no.') or low.get('license') or low.get('licenseno'),
                'name': low.get('business name') or low.get('businessname') or low.get('name'),
                'city': low.get('city'),
                'zip': low.get('zip') or low.get('zip code') or low.get('zipcode'),
                'status': low.get('primary status') or low.get('status') or 'ACTIVE',
                'classification': low.get('classification') or low.get('classifications') or CSLB_CLASS,
                'expires': low.get('expiration date') or low.get('expires'),
            })
        return [r for r in rows if r['licence'] and r['name']]

    trs = re.findall(r'<tr[^>]*>(.*?)</tr>', body, re.S | re.I)
    for tr in trs:
        cells = [re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', c)).strip()
                 for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S | re.I)]
        # A licence row starts with a numeric licence number.
        if len(cells) >= 3 and re.fullmatch(r'\d{5,9}', cells[0] or ''):
            rows.append({
                'state': 'CA', 'licence': cells[0], 'name': cells[1],
                'city': cells[2] if len(cells) > 2 else '',
                'zip': next((c for c in cells if re.fullmatch(r'\d{5}(-\d{4})?', c)), ''),
                'status': 'ACTIVE', 'classification': CSLB_CLASS,
                'expires': next((c for c in cells if re.fullmatch(r'\d{1,2}/\d{1,2}/\d{4}', c)), None),
            })

    if not rows:
        print(f'    ! nothing parseable for {county}. Neither CSV nor a licence table.')
        print('      Save the response and look at it before assuming there are no records.')
    return rows


def from_file(path, state, mapping):
    """Normalise a hand-exported CSV. `mapping` gives candidate header names per
    output field, lower-cased, because every state names its columns differently
    and they are renamed between exports."""
    p = Path(path).expanduser()
    if not p.exists():
        sys.exit(f'  {p} not found')
    rows = []
    with p.open(encoding='utf-8-sig', newline='') as fh:
        for r in csv.DictReader(fh):
            low = {(k or '').strip().lower(): (v or '').strip() for k, v in r.items()}
            rec = {'state': state}
            for field, candidates in mapping.items():
                rec[field] = next((low[c] for c in candidates if low.get(c)), '')
            if rec.get('licence') and rec.get('name'):
                rows.append(rec)
    if not rows:
        print(f'  ! no usable rows in {p}. Check the column names against the mapping.')
        print(f'    expected any of: {mapping}')
    return rows


FL_MAP = {
    'licence': ['license number', 'licensenumber', 'lic number', 'license'],
    'name': ['business name', 'dba name', 'name', 'licensee name'],
    'city': ['city', 'business city', 'mailing city'],
    'zip': ['zip', 'zip code', 'business zip'],
    'status': ['status', 'license status', 'primary status'],
    'classification': ['license type', 'profession', 'classification', 'rank'],
    'expires': ['expiration date', 'expires', 'expiry'],
}
AZ_MAP = {
    'licence': ['license number', 'license #', 'licensenumber', 'roc number', 'license'],
    'name': ['business name', 'dba', 'name', 'entity name'],
    'city': ['city', 'business city'],
    'zip': ['zip', 'zip code', 'postal code'],
    'status': ['status', 'license status'],
    'classification': ['classification', 'class', 'license class', 'scope'],
    'expires': ['expiration date', 'expires', 'expiration'],
}


def write(state, rows):
    if not rows:
        print(f'  {state}: nothing written')
        return
    (OUT_DIR / f'{state.lower()}.json').write_text(json.dumps(rows, indent=1), encoding='utf-8')
    print(f'  {state}: {len(rows)} records -> {OUT_DIR / (state.lower() + ".json")}')


def main():
    did_anything = False

    if arg('ca-counties') or '--ca' in sys.argv:
        counties = [c.strip().upper() for c in (arg('ca-counties') or ','.join(CA_DEFAULT_COUNTIES)).split(',') if c.strip()]
        write('CA', fetch_ca(counties))
        did_anything = True

    if arg('fl-file'):
        write('FL', from_file(arg('fl-file'), 'FL', FL_MAP))
        did_anything = True

    if arg('az-file'):
        write('AZ', from_file(arg('az-file'), 'AZ', AZ_MAP))
        did_anything = True

    if not did_anything:
        print(__doc__ or '')
        print('''  Nothing requested. Pick at least one:

    --ca-counties="LOS ANGELES,ORANGE"   pull from the CSLB portal
    --fl-file=path/to/dbpr.csv           normalise a DBPR export
    --az-file=path/to/roc.csv            normalise an AZ ROC export

  Then: python scripts/match-licences.py && python scripts/stage-listings.py

  The matcher can be verified with no data at all:
    python scripts/match-licences.py --self-test''')


if __name__ == '__main__':
    main()
