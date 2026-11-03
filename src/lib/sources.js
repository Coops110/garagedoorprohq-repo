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
//
//  Prohibition 1 held, and then paid for itself. The 2026-11-02 audit asked
//  for a citation for the 10,000 and 25,000-cycle spring figures, and the
//  obvious candidate was DASMA TDS-190, "Factors Affecting Spring Cycle
//  Life" -- a free PDF whose title is the exact subject, and which several
//  third-party pages state "establishes the baseline residential spring
//  rating at 10,000 cycles".
//
//  IT DOES NOT SAY THAT. TDS-190 was read in full on 2026-11-03 and contains
//  no rating at all: it is a list of what shortens a spring's life, which is
//  useful and is cited below for exactly that. The 10,000-cycle figure comes
//  from somewhere else entirely, ANSI/DASMA 102 clause 6.1, which is a
//  requirement on the DOOR SYSTEM rather than on the spring. Citing TDS-190
//  would have been the fabrication this file's rule 1 describes, arrived at
//  by trusting a summary of a document instead of the document -- and it
//  would have looked impeccable, because the sheet is real, the link works
//  and the title matches the claim.
//
//  One convention note, 2026-11-03: `dasma102`, `dasma190` and
//  `springEyeInjuries` were read by Claude, not by Chris. Rule 3 says "a
//  human", and the distinction is recorded here rather than hidden in a date.
//  What rule 3 is actually protecting against is a `checked` date that nobody
//  earned by opening the page, and these three were opened and read end to
//  end. Each note below states only what its source states.
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
    // Was "Arizona classification ROC-283 covers garage doors, gates and
    // similar devices." No such classification exists. The register's own
    // classification list was read on 2026-11-03: 146 classifications, and
    // neither "283" nor "garage" appears anywhere on it. Full working in the
    // header of src/lib/licensing.js.
    note: 'Arizona has no garage-door classification. A license is required for any job over $1,000, and for any job needing a permit whatever it costs, so garage door work falls under a general residential or another specialty class.',
    checked: '2026-10-31',
  },

  dasma102: {
    id: 'dasma102',
    label: 'ANSI/DASMA 102-2004, clause 6.1 — Specifications for Sectional Doors',
    publisher: 'Door & Access Systems Manufacturers Association International, approved as an American National Standard',
    url: 'https://law.resource.org/pub/us/cfr/regulations.gov.docket.15/dasma.102.2004.pdf',
    // Where the 10,000-cycle figure actually comes from. Note it is a
    // requirement on the door SYSTEM, not on the spring, so the wording here
    // says "door system" and the guides say a standard spring is "rated at"
    // 10,000 cycles -- which is the market convention that follows from the
    // standard rather than a restatement of it.
    //
    // Clause 2.8 is the quiet find: a residential door is defined as one
    // "normally expected to be operated less than 1,500 cycles per year",
    // which is 4.1 a day. Every "four openings a day" and "roughly seven
    // years" on this site was written before anyone read that, and it lands
    // on the same number.
    note: 'Clause 6.1 requires a residential or commercial door system to be "designed to operate at a minimum of 10,000 cycles" when properly selected, installed, operated and maintained. Clause 2.2 defines one cycle as the door moving from closed to fully open and back, and clause 2.8 defines a residential door as one operated fewer than 1,500 cycles a year, which is the four openings a day our spring-life arithmetic uses. This is the 2004 edition as filed in a public federal rulemaking docket.',
    checked: '2026-11-03',
  },

  dasma190: {
    id: 'dasma190',
    label: 'DASMA Technical Data Sheet #190 — Factors Affecting Spring Cycle Life',
    publisher: 'Door & Access Systems Manufacturers Association International',
    url: 'https://www.dasma.com/wp-content/uploads/pubs/TechDataSheets/CommercialResidential/TDS190.pdf',
    // Read in full 2026-11-03. See the warning in the header: this sheet sets
    // no cycle rating, and the widely repeated claim that it does is wrong.
    note: 'What shortens a spring\'s life before it reaches its rating: a dropped or thrown spring, surface rust reducing the effective area of the wire, torch-cutting that overheats adjacent coils, a spring fitted to a door it does not counterbalance, the wrong number of turns, doors left standing open in extreme climates, and missing lubrication. It also states that applying the wrong number of turns to a torsion spring is a safety issue for whoever is applying the torque.',
    checked: '2026-11-03',
  },

  springEyeInjuries: {
    id: 'springEyeInjuries',
    label: 'Open globe injuries from garage door springs (2023)',
    publisher: 'Shah, Bejjani, Singhanetr, Patel, Patel, Armstrong and Rossin. Ophthalmic Surgery, Lasers and Imaging Retina 54(11):666. PMID 37855828',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12087354/',
    // The 2026-11-02 audit's finding was that the DIY guide cited only the
    // three licence registers, which support nothing it says about injury --
    // its central claim. This is a primary report of actual injuries, not a
    // secondary safety-page summary, and every one of the seven happened
    // during an attempted home repair, which is precisely the decision that
    // guide exists to influence.
    //
    // The paper also mentions a figure of 35,000 garage-door injuries a year
    // in the US. That is NOT quoted anywhere on the site: it is the paper
    // citing someone else, and this file's rule 2 says primary over
    // secondary. If that number is wanted, its own source has to be read.
    note: 'A case series of seven patients treated at Massachusetts Eye and Ear between 2008 and 2023, each injured when a garage door spring dislodged at high velocity while they were attempting to repair their own door. Vision in the injured eye afterwards ranged from 20/125 to no light perception.',
    checked: '2026-11-03',
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
