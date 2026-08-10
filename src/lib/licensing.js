// ─────────────────────────────────────────────────────────────
//  STATE LICENSING — the site's one real differentiator, and the one
//  place where over-claiming would be a false representation.
//
//  Garage door work is licensed as a distinct trade in exactly three
//  states. Everywhere else it falls under a general contractor licence, is
//  licensed at city or county level, or is not licensed at all. That is a
//  fact about regulation, not a gap in our research, and pages in the other
//  47 states must say so rather than implying a check we cannot make.
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
    classification: 'C-61/D-28 Doors, Gates and Activating Devices',
    searchUrl: 'https://www.cslb.ca.gov/onlineservices/checklicenseII/checklicense.aspx',
    searchLabel: 'CSLB licence check',
    // What a homeowner should confirm once they are on the register.
    verifySteps: [
      'Enter the licence number the company gave you, or search by business name.',
      'Check the status reads “Active” — not expired, suspended or inactive.',
      'Check the classification includes C-61/D-28, which is the one that covers garage doors and operators.',
      'Check the business name on the licence matches the company quoting you. A licence held by a different entity is the most common discrepancy.',
      'Check the workers’ compensation and bond entries, both shown on the same record.',
    ],
  },
  FL: {
    state: 'Florida',
    authority: 'Florida Department of Business and Professional Regulation (DBPR)',
    authorityShort: 'DBPR',
    classification: 'Garage Door Installation Specialty Contractor',
    searchUrl: 'https://www.myfloridalicense.com/wl11.asp',
    searchLabel: 'DBPR licence search',
    verifySteps: [
      'Search by licence number or business name on the DBPR licensee search.',
      'Check the licence status is current rather than null, delinquent or expired.',
      'Check the licence type is a garage door or specialty contractor category covering this work.',
      'Check the licensee name matches the company quoting you.',
      'Note that some Florida garage door work is also permitted at county level — ask which county permit applies to your job.',
    ],
  },
  AZ: {
    state: 'Arizona',
    authority: 'Arizona Registrar of Contractors (ROC)',
    authorityShort: 'AZ ROC',
    classification: 'ROC-283 Garage Doors, Gates and Similar Devices',
    searchUrl: 'https://roc.az.gov/contractor-search',
    searchLabel: 'AZ ROC contractor search',
    verifySteps: [
      'Search the ROC contractor database by licence number or business name.',
      'Check the licence status is Active.',
      'Check the classification list includes ROC-283, or a general residential class that covers the work.',
      'Check the licence holder name matches the company quoting you.',
      'Check the complaint history shown on the same record.',
    ],
  },
};

export function licenceInfo(stateCode) {
  return LICENCE_STATES[stateCode] || null;
}

export function licensesTrade(stateCode) {
  return Object.hasOwn(LICENCE_STATES, stateCode);
}

// What a page should tell a visitor in a state with no trade licence. This
// is the honest version of the "no badge here" story, and it is genuinely
// actionable — insurance is checkable everywhere.
export function noLicenceGuidance(stateName) {
  return [
    `${stateName} does not license garage door installation as a separate trade. Depending on the job, the work may fall under a general contractor licence, a city or county registration, or no licence requirement at all — so there is no state register for us to check a garage door licence number against, and no listing on this site shows a verified licence badge in ${stateName}.`,
    `That makes insurance the credential worth asking for. Request a certificate of general liability insurance, plus workers’ compensation if more than one person will be on site, and ask for the insurer name and policy number rather than a yes or no. A company that genuinely carries cover can produce the certificate the same day.`,
    `It is also worth asking your city or county building department whether a permit is required for the work, particularly for a full door replacement — the answer varies between neighbouring jurisdictions.`,
  ];
}
