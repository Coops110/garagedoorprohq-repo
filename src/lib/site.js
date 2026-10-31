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
  // Must be a key registered to SITE.email below, not AirProHQ's
  // (797c8369-b3df-4fc6-b75d-7b48bdaa67f7) — reusing that one would post
  // GarageDoorProHQ enquiries into the AirProHQ inbox. Checked: this is a
  // different key. /get-listed/ shows a mailto fallback while this is empty.
  web3FormsKey: '65ee7f71-2132-4cf4-81ed-ba637df6a332',
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
//
// Set to 'eu' 2026-09-11 — Chris's call: a GDPR-style banner is alien to
// visitors outside the regions that actually require opt-in consent, and
// Consent Mode's own server-side region resolution (see SEO.astro) already
// grants analytics by default everywhere outside CONSENT_REQUIRED_REGIONS,
// so nothing is lost for those visitors by not prompting them at all.
export const CONSENT_BANNER_SCOPE = 'eu';

// ── Legal identity (privacy policy + terms) ─────────────────
// These appear verbatim on /privacy/ and /terms/, which name the operator
// as data controller — so they must match reality before those pages go
// public.
export const LEGAL = {
  entityType: 'sole-trader',
  legalName: 'GarageDoorProHQ',
  address: 'Unit 173637, PO Box 7169, Poole, BH15 9EL, United Kingdom',
  // Derived from SITE.email so the address in the privacy policy can never
  // drift from the one published elsewhere. Must be a monitored mailbox:
  // there is a one-month deadline to answer data subject requests.
  contactEmail: SITE.email,
  // Business and tax residency are UK-based, so UK law governs the terms.
  governingLaw: 'United Kingdom',
  // Per page, not one shared date. A single `lastUpdated` was wrong the moment
  // /how-we-price/ shipped: that page was written on 2026-10-31 and displayed
  // "11 August 2026", a false freshness signal on the one page whose job is to
  // explain how the site arrives at its figures. A shared date is also
  // self-defeating — editing any one page silently backdates or forward-dates
  // the other three.
  //
  // US format, because the Rules set US spelling (2026-10-31) and "11 August
  // 2026" reads as foreign on a US-facing site. Dates here are the day the
  // page's CONTENT last changed, never the build date: a date that moves on
  // every deploy tells a reader nothing.
  updated: {
    terms: 'August 11, 2026',
    privacy: 'October 31, 2026',              // funding and location wording corrected
    editorialGuidelines: 'October 31, 2026',  // funding wording corrected
    howWePrice: 'October 31, 2026',           // written this day
  },
  // Full name. /how-we-price/ already said "Chris Cooper" while About said
  // "Chris", and a byline that changes between pages is exactly the signal
  // that makes an about-the-author claim worth less than no claim.
  founderName: 'Chris Cooper',
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
    'We check license numbers against the state register; we do not inspect workmanship.',
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
  // The line this wording holds: what is sold is ATTENTION, clearly labeled.
  // What is never sold is the editorial layer — the cost figures, the license
  // badges, or what a listing says about a business. Selling a labeled ad
  // position is ordinary publishing; selling an unlabeled one, or selling a
  // badge, is not, and the second kind is what the disclosure commitment here
  // exists to keep out.
  // Self-declared facts read from a business's own website. Lives here for
  // the same reason licenceMeaning does: it will appear on 481 listing pages
  // and must say the same thing on every one of them.
  //
  // The distinction it has to carry is the whole point. A license badge means
  // we checked a number against a state register. This means the opposite —
  // nobody checked anything, the business said it about itself. Both are
  // useful; conflating them would make the badge worthless. The heading above
  // this block says "says about itself" for the same reason: provenance in the
  // heading, not buried in a footnote nobody reads.
  siteFactsMeaning:
    'Taken from the company’s own website. These are its claims about itself, not things we verified — we have not visited this business, inspected its work, or spoken to its customers.',

  placementMeaning:
    'Listing itself is free. We may sell advertising and sponsored positions, and anything paid for is labeled as advertising. Paying never changes what a listing says, whether it carries a license badge, or any figure in our guides.',

  // One canonical answer to "how is this funded?", because three pages were
  // giving three answers. /about/ said the site is funded by "Advertising, and
  // in future affiliate arrangements" and that "there is no mechanism for a
  // business to pay us for placement"; /privacy/ said "At the date of this
  // policy we do not display advertising"; and /terms/ said "We may also sell
  // sponsored positions directly". The privacy line was the accurate one — the
  // site has no revenue at all — so /about/ was claiming income it does not
  // have AND denying a model Chris had already decided to keep open.
  //
  // A directory's funding disclosure is the page a sceptical reader checks
  // before trusting the listings, so three versions of it is worse than none.
  // Future tense throughout, and it states the absence of revenue plainly
  // rather than implying ads are already running.
  fundingMeaning:
    'The site has no revenue yet. The intended model is advertising and sponsored positions, and in future affiliate arrangements. Anything paid for is labeled as advertising, and paying never changes what a listing says, whether it carries a license badge, or any figure in our guides.',
};
