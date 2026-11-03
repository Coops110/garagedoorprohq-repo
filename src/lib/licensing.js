// ─────────────────────────────────────────────────────────────
//  STATE LICENSING — the site's one real differentiator, and the one
//  place where over-claiming would be a false representation.
//
//  THREE STATES HAVE A REGISTER WE CAN CHECK A NUMBER AGAINST. TWO OF THEM
//  LICENSE GARAGE DOOR WORK BY NAME. That distinction is new on 2026-11-03
//  and it is the whole reason this comment is shouting.
//
//  Until today this file said the trade was "licensed as a distinct trade in
//  exactly three states" and gave Arizona's classification as "ROC-283
//  Garage Doors, Gates and Similar Devices". There is no such
//  classification. The AZ ROC's own classification list
//  (https://roc.az.gov/license-classifications, read 2026-11-03) carries 146
//  classifications across its general, dual and specialty groups, and the
//  string "283" does not appear on the page. Neither does the word "garage".
//  The only classifications mentioning doors at all are R-7 and C-7
//  Carpentry ("metal doors or door frames"), R-60 and C-60 Finish Carpentry,
//  R-14 Fencing ("automatic gates") and R-24 Ornamental Metals.
//
//  "ROC-283" was almost certainly a licence NUMBER mistaken for a
//  classification code: Arizona prints its numbers as "ROC 284792", which is
//  what the register's own contractor-search records show.
//
//  What Arizona actually requires is a licence for any job over $1,000, or
//  any job needing a permit whatever it costs (A.R.S. § 32-1121, the statute
//  the ROC's own page links to for the handyman exemption). So Arizona
//  licenses the CONTRACTOR, not the trade.
//
//  California (CSLB D-28) and Florida (DBPR Garage Door Installation
//  Specialty Contractor, Florida Administrative Code 61G4-15.100(1)(k)) were
//  both re-checked the same day and are correct as stated.
//
//  Everywhere outside these three, garage door work falls under a general
//  contractor license, is licensed at city or county level, or is not
//  licensed at all. That is a fact about regulation, not a gap in our
//  research, and pages in the other 47 states must say so rather than
//  implying a check we cannot make.
//
//  `namesTheTrade` is what templates branch on. Do not reintroduce a shared
//  sentence with the classification slotted into it: the difference between
//  Arizona and the other two is a whole sentence, not a noun, which is
//  exactly how the wrong claim survived in twelve places at once. Each state
//  carries its own `tradeScope` and `licenceRule` for that reason.
//
//  The wording below is the wording that ships. It has to stay consistent
//  with /terms/ ("we do not endorse, recommend, certify, vet or guarantee")
//  and with /editorial-guidelines/. A badge that claims more than a
//  register lookup supports is the kind of copy that sits one click from
//  the page denying it.
// ─────────────────────────────────────────────────────────────

export const LICENCE_STATES = {
  CA: {
    state: 'California',
    authority: 'California Contractors State License Board (CSLB)',
    authorityShort: 'CSLB',
    article: 'a',    // "a CSLB license" — spoken "see-ess-ell-bee"
    namesTheTrade: true,
    classification: 'C-61/D-28 Doors, Gates and Activating Devices',
    tradeScope:
      'California licenses garage door work as its own classification, C-61/D-28 Doors, Gates and Activating Devices.',
    licenceRule:
      'Yes. California licenses the trade through the Contractors State License Board under C-61/D-28 Doors, Gates and Activating Devices.',
    searchUrl: 'https://www.cslb.ca.gov/onlineservices/checklicenseII/checklicense.aspx',
    searchLabel: 'CSLB license check',
    // What a homeowner should confirm once they are on the register.
    verifySteps: [
      'Enter the license number the company gave you, or search by business name.',
      'Check the status reads “Active” — not expired, suspended or inactive.',
      'Check the classification includes C-61/D-28, which is the one that covers garage doors and operators.',
      'Check the business name on the license matches the company quoting you. A license held by a different entity is the most common discrepancy.',
      'Check the workers’ compensation and bond entries, both shown on the same record.',
    ],
  },
  FL: {
    state: 'Florida',
    authority: 'Florida Department of Business and Professional Regulation (DBPR)',
    authorityShort: 'DBPR',
    article: 'a',    // "a DBPR license" — spoken "dee-bee-pee-arr"
    namesTheTrade: true,
    classification: 'Garage Door Installation Specialty Contractor',
    tradeScope:
      'Florida licenses garage door work as its own classification, Garage Door Installation Specialty Contractor.',
    licenceRule:
      'Yes. Florida licenses the trade through the Department of Business and Professional Regulation as a Garage Door Installation Specialty Contractor.',
    searchUrl: 'https://www.myfloridalicense.com/wl11.asp',
    searchLabel: 'DBPR license search',
    verifySteps: [
      'Search by license number or business name on the DBPR licensee search.',
      'Check the license status is current rather than null, delinquent or expired.',
      'Check the license type is a garage door or specialty contractor category covering this work.',
      'Check the licensee name matches the company quoting you.',
      'Note that some Florida garage door work is also permitted at county level — ask which county permit applies to your job.',
    ],
  },
  AZ: {
    state: 'Arizona',
    authority: 'Arizona Registrar of Contractors (ROC)',
    authorityShort: 'AZ ROC',
    article: 'an',   // "an AZ ROC license" — spoken "ay-zee rock"
    // The odd one out. See the header: there is no garage-door
    // classification in Arizona, so this is null rather than a plausible
    // code, and every template must handle null rather than print it.
    namesTheTrade: false,
    classification: null,
    tradeScope:
      'Arizona licenses the contractor rather than the trade: the Registrar of Contractors has no garage-door classification, but a license is required for any job over $1,000, and for any job needing a permit whatever it costs.',
    licenceRule:
      'Yes for most jobs, though not as a garage door trade. Arizona requires an AZ ROC license for any job over $1,000, and for any job needing a permit whatever it costs. The Registrar of Contractors has no garage-door classification, so the work falls under a general residential or another specialty class.',
    searchUrl: 'https://roc.az.gov/contractor-search',
    searchLabel: 'AZ ROC contractor search',
    verifySteps: [
      'Search the ROC contractor database by license number or business name.',
      'Check the license status is Active.',
      'Check the classification covers residential construction of this kind. Arizona has no garage-door classification, so expect a general residential or another specialty class rather than one naming garage doors.',
      'Check the license holder name matches the company quoting you.',
      'Check the complaint history shown on the same record.',
    ],
  },
};

// True only where the register names garage door work as its own
// classification, which is California and Florida. Arizona has a register
// worth checking and no such classification, so a page that needs to say
// "the trade is licensed here" must use this and not licenceInfo() alone.
export function namesTheTrade(stateCode) {
  return Boolean(LICENCE_STATES[stateCode]?.namesTheTrade);
}

export function licenceInfo(stateCode) {
  return LICENCE_STATES[stateCode] || null;
}

export function licensesTrade(stateCode) {
  return Object.hasOwn(LICENCE_STATES, stateCode);
}

// What a page should tell a visitor in a state with no trade license. This
// is the honest version of the "no badge here" story, and it is genuinely
// actionable — insurance is checkable everywhere.
export function noLicenceGuidance(stateName) {
  return [
    `${stateName} does not license garage door installation as a separate trade. Depending on the job, the work may fall under a general contractor license, a city or county registration, or no license requirement at all — so there is no state register for us to check a garage door license number against, and no listing on this site shows a verified license badge in ${stateName}.`,
    `That makes insurance the credential worth asking for. Request a certificate of general liability insurance, plus workers’ compensation if more than one person will be on site, and ask for the insurer name and policy number rather than a yes or no. A company that genuinely carries cover can produce the certificate the same day.`,
    `It is also worth asking your city or county building department whether a permit is required for the work, particularly for a full door replacement — the answer varies between neighboring jurisdictions.`,
  ];
}

// ── BADGE EXPIRY ──────────────────────────────────────────────
//  The 2026-11-02 audit found "✓ State license verified" still showing on
//  a CSLB record that had expired on 10/31/2026, because the badge only
//  ever tested that a licence number existed. The register data we hold
//  includes the expiry date, so the badge can test it — and must, since
//  the Rules line is "a missing badge is better than a false one" and an
//  expired licence is the single most likely way for the badge to become
//  false without anyone touching the data.
//
//  This is evaluated at build time, so a badge only drops off on the next
//  build after the expiry date. validate-data-consistency.mjs warns on
//  anything expired or lapsing within 60 days so the rebuild is prompted
//  rather than discovered by the next audit.
//
//  Stored format is MM/DD/YYYY, the format the registers themselves use.
export function parseLicenceExpiry(value) {
  if (!value) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value).trim());
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  // Rejects 02/31/2027 and friends, which Date would roll forward silently.
  if (d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
  return d;
}

// True only when we can still stand behind the badge. A licence with no
// recorded expiry keeps its badge — nothing in the data says it lapsed —
// but a date we cannot parse is treated as lapsed, because the alternative
// is showing a verification claim we cannot date.
export function licenceIsCurrent(biz, asOf = new Date()) {
  if (!biz?.licenceNumber) return false;
  if (!biz.licenceExpires) return true;
  const expires = parseLicenceExpiry(biz.licenceExpires);
  if (!expires) return false;
  const today = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  return expires >= today;
}
