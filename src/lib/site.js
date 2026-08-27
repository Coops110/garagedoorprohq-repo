// ─────────────────────────────────────────────────────────────
//  SITE CONFIG — the single source of truth for identity and domain.
//  astro.config.mjs, the sitemap, llms.txt, every canonical tag and every
//  OG tag read from here, so nothing can drift.
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: 'GarageDoorProHQ',
  tagline: 'Find Garage Door Pros Across America',
  domain: 'https://garagedoorprohq.com',
  legalName: 'GarageDoorProHQ Garage Door Directory',
  description:
    'GarageDoorProHQ is a free directory of local garage door contractors and honest garage door repair and installation cost guides for U.S. homeowners.',
  // Google AdSense publisher ID. Empty hides every ad slot until approved.
  adsensePublisherId: '',
  // Web3Forms access key for the get-listed form. Not a secret — Web3Forms
  // keys are designed to sit in public HTML. Submissions are emailed to the
  // address registered with the key.
  //
  // ⚠️ EMPTY ON PURPOSE. This must be a key registered to
  // SITE.email below, not AirProHQ's key — reusing that one would post
  // GarageDoorProHQ enquiries into the AirProHQ inbox. /get-listed/ shows a
  // mailto fallback until this is filled in.
  web3FormsKey: '',
  // Public contact address. Must match LEGAL.contactEmail — it is published
  // in the Organization schema, on /contact/ and in the privacy policy as
  // the route for data requests.
  email: 'contact@garagedoorprohq.com',
};

// ── Sister sites ────────────────────────────────────────────
// AirProHQ and RigFloorHQ share an operator with this site. Nothing links
// to them yet, deliberately: a brand new domain trading site-wide
// reciprocal footer links with two established ones is the exact
// reciprocal-network footprint Google's link spam policy describes, and
// GarageDoorProHQ has no indexing history of its own to risk it against.
//
// When this domain is indexed and holding a stable indexing ratio (see
// BUILD-PLAN section 3), flip `disclose` to true. That surfaces the
// operator disclosure on /about/ and /editorial-guidelines/ — an ownership
// disclosure, which is an honesty signal, not a link-building tactic.
// In-content cross-links belong in individual guides where the other
// site's page is genuinely the better answer, added by hand, never
// templated site-wide.
export const SISTER_SITES = {
  disclose: false,
  sites: [
    { name: 'AirProHQ', url: 'https://airprohq.com', trade: 'HVAC contractors and heating & cooling cost guides' },
    { name: 'RigFloorHQ', url: 'https://rigfloorhq.com', trade: 'oil and gas drilling reference' },
  ],
};

// Google Analytics 4 measurement ID. Leave empty to disable.
// GA: Admin → Data streams → web stream → "MEASUREMENT ID" (G-XXXXXXXXXX).
// Only injected in production builds, so `npm run dev` never reaches GA.
//
// ⚠️ MUST BE A NEW GA4 PROPERTY. Do not paste AirProHQ's G-TFRNDW8TK5 —
// two sites on one measurement ID merge their traffic and neither set of
// numbers is usable afterwards.
export const GA_ID = 'G-4RH2GLSMX0';

// Google Search Console HTML-tag verification token, if verifying by meta
// tag. Domain-level DNS TXT verification is preferred (it covers every
// subdomain and protocol at once) and needs nothing here.
export const GSC_VERIFICATION = '';

// ── Cookie consent (GDPR / UK PECR) ─────────────────────────
// Where opt-in consent is legally required before analytics/ads storage.
// Google resolves the visitor's region server-side from IP, so this list
// drives Consent Mode v2 defaults reliably without browser geo-guessing.
// UK + all 27 EU states + the 3 remaining EEA states + Switzerland.
export const CONSENT_REQUIRED_REGIONS = [
  'GB',
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'CH',
];

// Bump the version suffix to re-prompt everyone (e.g. after adding a
// tracking vendor the old consent did not cover).
export const CONSENT_STORAGE_KEY = 'garagedoorprohq_consent_v1';

// 'all' shows the banner everywhere and gives non-EU visitors an opt-out
// too, increasingly expected under US state privacy laws. 'eu' limits it to
// the regions above. Consent Mode defaults stay correct either way.
export const CONSENT_BANNER_SCOPE = 'all';

// ── Legal identity (privacy policy + terms) ─────────────────
// These appear verbatim on /privacy/ and /terms/, which name the operator
// as data controller — so they must match reality before those pages go
// public.
export const LEGAL = {
  entityType: 'sole-trader',
  legalName: 'GarageDoorProHQ',
  address: '483 Chaiyaphruek 3 Alley, Muang Pattaya, Bang Lamung District, Chon Buri 20150, Thailand',
  // Derived from SITE.email so the address in the privacy policy can never
  // drift from the one published elsewhere. Must be a monitored mailbox:
  // there is a one-month deadline to answer data subject requests.
  contactEmail: SITE.email,
  // Operator is based in Thailand, so Thai law governs the terms. UK/EEA
  // data protection duties still apply to UK/EEA visitors regardless.
  governingLaw: 'Thailand',
  lastUpdated: '11 August 2026',
  founderName: 'Chris',
  founderRole: 'Founder & editor',
};

// ── The claim the site is allowed to make ───────────────────
// One string, used everywhere a listing needs qualifying, so the wording
// cannot drift between a badge tooltip, /editorial-guidelines/, llms.txt
// and the terms of service. Terms say we do not endorse, recommend,
// certify, vet or guarantee any listing — nothing on the site may imply
// otherwise.
export const CLAIMS = {
  // States where the trade itself is licensed and a badge is possible.
  licenceStates: ['CA', 'FL', 'AZ'],
  licenceMeaning:
    'We check licence numbers against the state register; we do not inspect workmanship.',
  listingMeaning:
    'Listings are compiled from public and openly licensed business data. A listing is not a recommendation.',
  hoursMeaning:
    'Where a listing says a contractor advertises 24/7 service, that claim comes from the contractor’s own website. It is not verified opening hours.',

  // Paid promotion. Lives here for the same reason licenceMeaning does: this
  // claim appears on the homepage, the directory hub, every city page, the
  // contact page, the editorial guidelines, llms.txt and the terms. When it was
  // written as an absolute ("no paid tier, no featured slot, no way to buy a
  // higher position — we have not built one") it foreclosed the site's own
  // revenue model in nine places at once, and changing it in eight of them
  // would leave the ninth contradicting the terms.
  //
  // The line this wording holds: what is sold is ATTENTION, clearly labelled.
  // What is never sold is the editorial layer — the cost figures, the licence
  // badges, or what a listing says about a business. Selling a labelled ad
  // position is ordinary publishing; selling an unlabelled one, or selling a
  // badge, is not, and the second kind is what the disclosure commitment here
  // exists to keep out.
  placementMeaning:
    'Listing itself is free. We may sell advertising and sponsored positions, and anything paid for is labelled as advertising. Paying never changes what a listing says, whether it carries a licence badge, or any figure in our guides.',
};
