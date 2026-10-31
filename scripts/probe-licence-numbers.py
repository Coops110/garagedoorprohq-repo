# ─────────────────────────────────────────────────────────────
#  PROBE LICENCE NUMBERS FROM BUSINESSES' OWN WEBSITES
#
#  WHY THIS EXISTS. match-licences.py joins Overture listings to the state
#  register BY NAME, and on 2026-10-31 that produced 28 badges from 445
#  listings in licensing states — 375 of the 417 failures never matched a
#  name at all. The cause is structural, not a bug: Overture stores TRADING
#  names ("Mighty Garage Door Repair") and CSLB stores LEGAL ENTITY names
#  ("ALMIGHTY GARAGE DOORS"). Loosening the name match to bridge that is
#  exactly what produced a false badge before (CLAUDE.md: "Mesa Garage Door
#  Services" badged from "MESA GARAGE DOORS").
#
#  This takes the other route, which needs no name matching at all.
#  California B&P Code 7030.5 REQUIRES a licensed contractor to state its
#  licence number on its own advertising, including its website. So:
#
#      read the number off the business's own site
#         -> look it up in the register BY EXACT NUMBER
#            -> corroborate that the register record is the same business
#
#  An exact numeric join has no fuzzy step to get wrong. The name never
#  enters into it.
#
#  THE GUARD THAT MATTERS. A business can display a number that is not its
#  own — a franchisee quoting head office, a lead-gen page quoting someone
#  else's, or simple error. So a hit is only a CANDIDATE, and is reported
#  with whether the register record's city and ZIP agree with the listing.
#  Same principle as the existing matcher: corroboration or no badge.
#
#  READ-ONLY. Writes one report to data-work/ (gitignored) and touches
#  nothing in src/data. Nothing here badges anything; staging stays a
#  separate, deliberate step.
#
#  POLITE BY DEFAULT. One request per site, sequential, real timeout, normal
#  user agent, and --limit so a run can be sized. It reads the public
#  homepage a contractor is legally obliged to publish this number on — it
#  does not defeat any protection, and a site that refuses is simply skipped.
#
#  Usage: python scripts/probe-licence-numbers.py [--limit=25] [--state=CA]
import csv
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36')


def arg(name, default=None):
    for a in sys.argv[1:]:
        if a.startswith(f'--{name}='):
            return a.split('=', 1)[1]
    return default


STATE = (arg('state', 'CA') or 'CA').upper()
LIMIT = int(arg('limit', '25'))

# CSLB numbers are 6-8 digits. Anchored to a licence word so a phone number,
# ZIP or year cannot be mistaken for one — a bare \d{6,8} on a contractor's
# page matches all sorts of things.
LIC_PATTERNS = [
    re.compile(r'(?:cslb|contractor[\'s]*\s+licen[cs]e|licen[cs]e|lic\.?|lic#)'
               r'[^0-9a-zA-Z]{0,12}(?:no\.?|number|#)?[^0-9]{0,6}(\d{6,8})', re.I),
    re.compile(r'\b(?:lic|licen[cs]e)[^0-9]{0,8}(\d{6,8})\b', re.I),
]


def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read(600_000)
    return raw.decode('utf-8', 'ignore')


# ── ENRICHMENT ──────────────────────────────────────────────────────
#  Chris, 2026-10-31: if we are fetching the page anyway, take the facts
#  that would thicken a listing. One request, two answers.
#
#  WHAT IS DELIBERATELY NOT TAKEN: ratings, review counts and opening
#  hours. GarageDoorProHQ Rules.md forbids all three outright, and that
#  does not loosen just because the number is sitting on the page. The ban
#  is not about where the data comes from, it is about what the site is
#  willing to claim.
#
#  Everything below is a SELF-DECLARED claim by the business, and must be
#  presented as one — the same footing as the existing 24/7 flag, whose
#  wording already lives in CLAIMS.hoursMeaning: "that claim comes from the
#  contractor's own website. It is not verified." A brand logo on a page is
#  evidence they say they fit Genie openers, not evidence that they do.
BRANDS = ['LiftMaster', 'Genie', 'Chamberlain', 'Clopay', 'Amarr', 'Wayne Dalton',
          'Overhead Door', 'Raynor', 'Sommer', 'Marantec', 'CHI', 'Linear']
SERVICE_TERMS = {
    'spring repair': r'\bspring(?:s)?\s+(?:repair|replacement)\b',
    'opener repair': r'\bopener\s+(?:repair|replacement|install)',
    'cable repair': r'\bcable(?:s)?\s+repair\b',
    'off-track': r'\boff[- ]track\b',
    'new installation': r'\b(?:new\s+door\s+install|door\s+installation)\b',
    'commercial': r'\bcommercial\b',
    'gates': r'\bgate(?:s)?\s+(?:repair|install|opener)',
    'emergency / 24-7': r'\b(?:24[/ -]?7|emergency\s+service|same[- ]day)\b',
}
YEARS = [
    re.compile(r'\b(?:since|established|est\.?|serving\s+\w+\s+since)\s+(19\d{2}|20[0-2]\d)\b', re.I),
    re.compile(r'\bover\s+(\d{1,2})\+?\s+years\b', re.I),
]


def extract_facts(text):
    """Self-declared facts only. Returns what the business SAYS about itself."""
    facts = {}
    brands = [b for b in BRANDS if re.search(r'\b' + re.escape(b) + r'\b', text, re.I)]
    if brands:
        facts['brands'] = brands[:6]
    services = [label for label, pat in SERVICE_TERMS.items() if re.search(pat, text, re.I)]
    if services:
        facts['services'] = services
    for pat in YEARS:
        m = pat.search(text)
        if m:
            v = int(m.group(1))
            # "since 1998" and "over 25 years" are the same fact stated two
            # ways; normalise both to a founding year so they cannot
            # contradict each other on the page.
            facts['since'] = v if v > 1900 else 2026 - v
            break
    if re.search(r'\b(?:family[- ]owned|family\s+run)\b', text, re.I):
        facts['familyOwned'] = True
    if re.search(r'\b(?:bonded\s+and\s+insured|licensed[,\s]+bonded)\b', text, re.I):
        facts['claimsBondedInsured'] = True
    return facts


def plain_text(html):
    # Strip tags first: a number split across markup is still a number to a
    # reader, and "Lic<span>#</span> 1234567" is common on these sites.
    text = re.sub(r'<(script|style)\b.*?</\1>', ' ', html, flags=re.S | re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    return re.sub(r'\s+', ' ', text)


def numbers_in(text):
    found = []
    for pat in LIC_PATTERNS:
        found += pat.findall(text)
    # Preserve order, drop duplicates.
    return list(dict.fromkeys(found))


def main():
    rejected = list(csv.DictReader(open('data-work/licence-rejected.csv', encoding='utf-8')))
    businesses = json.load(open('src/data/businesses.json', encoding='utf-8'))
    by_key = {(b['name'], b['city']): b for b in businesses}

    reg_path = Path('data-work/licences') / f'{STATE.lower()}.json'
    if not reg_path.exists():
        sys.exit(f'  {reg_path} not found — run fetch-licences.py first')
    register = json.load(open(reg_path, encoding='utf-8'))
    by_number = {}
    for r in register:
        n = re.sub(r'\D', '', str(r.get('licence') or ''))
        if n:
            by_number.setdefault(n, r)

    targets = []
    for row in rejected:
        if row.get('state') != STATE:
            continue
        biz = by_key.get((row.get('name'), row.get('city')))
        if biz and biz.get('website'):
            targets.append(biz)

    print(f'  {STATE}: {len(targets)} unmatched listings have a website; probing {min(LIMIT, len(targets))}')
    print(f'  register holds {len(by_number)} distinct licence numbers\n')

    results = []
    enriched = []
    hit = corroborated = unreachable = nonumber = notinreg = 0

    for i, b in enumerate(targets[:LIMIT], 1):
        url = b['website']
        if not url.startswith('http'):
            url = 'http://' + url
        try:
            html = fetch(url)
        except Exception as e:                      # noqa: BLE001 - any failure is "skip"
            unreachable += 1
            print(f'  {i:>3}. {b["name"][:34]:<36} unreachable ({type(e).__name__})')
            time.sleep(0.4)
            continue

        text = plain_text(html)
        nums = numbers_in(text)
        facts = extract_facts(text)
        matched = [n for n in nums if n in by_number]
        if facts:
            enriched.append({'listing': b['name'], 'city': b['city'], **facts})
        if not nums:
            nonumber += 1
            print(f'  {i:>3}. {b["name"][:34]:<36} no licence number on the page')
        elif not matched:
            notinreg += 1
            print(f'  {i:>3}. {b["name"][:34]:<36} states {nums[:2]} — not in the register')
        else:
            hit += 1
            num = matched[0]
            reg = by_number[num]
            same_city = (reg.get('city') or '').strip().lower() == (b.get('city') or '').strip().lower()
            same_zip = re.sub(r'\D', '', str(reg.get('zip') or ''))[:5] == \
                       re.sub(r'\D', '', str(b.get('postalCode') or ''))[:5]
            ok = same_city or same_zip
            corroborated += 1 if ok else 0
            flag = 'CORROBORATED' if ok else 'number found, city/ZIP DISAGREE'
            print(f'  {i:>3}. {b["name"][:34]:<36} #{num}  {reg.get("name","")[:26]:<28} {flag}')
            results.append({
                'listing': b['name'], 'city': b['city'], 'website': b['website'],
                'licence': num, 'registerName': reg.get('name'),
                'registerCity': reg.get('city'), 'status': reg.get('status'),
                'classification': reg.get('classification'),
                'cityAgrees': same_city, 'zipAgrees': same_zip,
                'corroborated': ok,
            })
        time.sleep(0.4)

    out = Path('data-work/licence-probe.json')
    out.write_text(json.dumps(results, indent=1), encoding='utf-8')
    enr = Path('data-work/site-facts.json')
    enr.write_text(json.dumps(enriched, indent=1), encoding='utf-8')

    n = min(LIMIT, len(targets))
    print(f'\n  probed {n}')
    print(f'    licence number found AND in the register   {hit}'
          f'   (of which corroborated on city or ZIP: {corroborated})')
    print(f'    states a number not in the register        {notinreg}')
    print(f'    no licence number on the page              {nonumber}')
    print(f'    unreachable                                {unreachable}')
    if hit:
        print(f'\n  hit rate {hit}/{n} = {hit / n:.0%}. Across all {len(targets)} '
              f'that projects to roughly {round(hit / n * len(targets))} more candidates.')
    import collections
    counts = collections.Counter(k for e in enriched for k in e if k not in ('listing', 'city'))
    print(f'\n  self-declared facts found on {len(enriched)}/{n} sites: {dict(counts)}')
    print(f'\n  -> {out}')
    print(f'  -> {enr}   (nothing staged; src/data untouched)')


if __name__ == '__main__':
    main()
