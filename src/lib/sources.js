// ─────────────────────────────────────────────────────────────
//  EXTERNAL SOURCES
//
//  The 2026-10-31 audit scored Authority 35 and found 0 external links
//  across all 8 guides, /how-we-price/, /about/ and
//  /editorial-guidelines/. For a site whose whole pitch is "we check things
//  against the register", citing nothing outside itself is the single
//  weakest signal it sends.
//
//  Chris's instruction, 2026-10-31: "Why can't we just link to where we got
//  the information from and use that as the authority checker?" That is the
//  right answer, and a better one than inventing author credentials nobody
//  has. A reader who can click through to the statute does not need to
//  believe anything about who wrote the page.
//
//  THE RULE FOR THIS FILE: an entry is a source we actually read, named
//  precisely enough that a reader lands on the thing we are citing and not
//  a search page. No secondary summaries, no vendor blogs, no "according to
//  industry sources". Three specific prohibitions, each learned the hard
//  way on this project:
//
//   1. No DASMA technical data sheet numbers. DASMA's sheets would be the
//      ideal citation for the spring-safety claims, but they have not been
//      read, and citing TDS-156 because it sounds plausible is fabrication
//      wearing a reference's clothes. When Chris pulls the sheets, they get
//      entries here.
//   2. Primary over secondary, always. The battery-backup rule was checked
//      against the enacted bill text on leginfo, not the installer blogs --
//      which disagree with each other on the date and one of which cites a
//      Florida statute that does not exist.
//   3. `checked` is the date a human last loaded the URL and confirmed it
//      says what we claim. It is not the build date and it must not be
//      bumped without re-reading the source.
// ─────────────────────────────────────────────────────────────

export const SOURCES = {
  cfr1211: {
    id: 'cfr1211',
    label: '16 CFR Part 1211 — Safety Standard for Automatic Residential Garage Door Operators',
    publisher: 'U.S. Consumer Product Safety Commission',
    url: 'https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1211',
    // The CPSC issued Part 1211 on 21 December 1992 under the Consumer
    // Product Safety Improvement Act of 1990, and subpart A codifies the
    // entrapment-protection provisions of UL 325. This is the basis for every
    // "since 1993" statement on the site.
    note: 'The federal standard requiring entrapment protection on residential garage door openers. Issued December 1992 and in force for openers manufactured from 1993.',
    checked: '2026-10-31',
  },

  sb969: {
    id: 'sb969',
    label: 'SB 969 (2018) — Automatic garage door openers: backup batteries',
    publisher: 'California Legislature',
    url: 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201720180SB969',
    // Added Health and Safety Code section 19892, operative July 1, 2019.
    // Section 19891 sets a $1,000 civil penalty per non-compliant opener.
    // California is the only state with a statewide mandate.
    note: 'Added Health and Safety Code § 19892, operative July 1, 2019: a residential garage door opener sold or installed in California must have a battery backup.',
    checked: '2026-10-31',
  },

  cslb: {
    id: 'cslb',
    label: 'Check a license — Contractors State License Board',
    publisher: 'State of California',
    url: 'https://www.cslb.ca.gov/onlineservices/checklicenseII/checklicense.aspx',
    note: 'The register every California license badge on this site is matched against. Classification C-61/D-28 covers garage doors and operators.',
    checked: '2026-10-31',
  },

  dbpr: {
    id: 'dbpr',
    label: 'Licensee search — Department of Business and Professional Regulation',
    publisher: 'State of Florida',
    url: 'https://www.myfloridalicense.com/wl11.asp',
    note: 'Florida licenses garage door installation as a specialty contractor category.',
    checked: '2026-10-31',
  },

  azroc: {
    id: 'azroc',
    label: 'Contractor search — Registrar of Contractors',
    publisher: 'State of Arizona',
    url: 'https://roc.az.gov/contractor-search',
    note: 'Arizona classification ROC-283 covers garage doors, gates and similar devices.',
    checked: '2026-10-31',
  },

  overture: {
    id: 'overture',
    label: 'Overture Maps Foundation — Places',
    publisher: 'Overture Maps Foundation',
    url: 'https://docs.overturemaps.org/guides/places/',
    note: 'The open dataset every business listing on this site is built from. Licensed for redistribution, which is why this site carries no ratings, review counts or opening hours — that data is not in it, and the sources that do hold it forbid republishing.',
    checked: '2026-10-31',
  },
};

// Resolve ids to entries, dropping unknown ids loudly rather than rendering
// an empty list. A guide referencing a source that does not exist is a typo,
// and a silently empty Sources block is worse than none -- it reads as
// "we looked and found nothing".
export function sourcesFor(ids = []) {
  return ids.map((id) => {
    const s = SOURCES[id];
    if (!s) throw new Error(`Unknown source id "${id}" — add it to src/lib/sources.js or fix the reference.`);
    return s;
  });
}
