import { SITE } from './site.js';
import { e164Phone } from './data.js';

const base = SITE.domain.replace(/\/$/, '');

const abs = (u) => (String(u).startsWith('http') ? u : base + u);

// ── Organization / WebSite (site-wide, homepage) ─────────────
// ORG_ID / SITE_ID are the entity graph the 2026-10-21 audit found missing:
// Organization and WebSite existed but were unlinked, and every guide
// repeated an anonymous publisher instead of pointing at one entity. Anything
// that needs the publisher now references these by @id rather than restating
// it, so there is exactly one Organization node on the site.
export const ORG_ID = base + '/#organization';
export const SITE_ID = base + '/#website';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@id': ORG_ID,
    '@type': 'Organization',
    // SITE.name, not SITE.legalName. The audit found the publisher named two
    // different things in the same markup — "GarageDoorProHQ Garage Door
    // Directory" on the Organization against "GarageDoorProHQ" on Articles.
    // One name everywhere; legalName carries the longer form, which is what
    // that property is for.
    name: SITE.name,
    legalName: SITE.legalName,
    url: base + '/',
    description: SITE.description,
    email: SITE.email,
    logo: {
      '@type': 'ImageObject',
      url: base + '/logo.png',
      width: 512,
      height: 512,
    },
    // Points at the page that actually states the editorial standards,
    // rather than asserting principles with nothing behind them.
    publishingPrinciples: base + '/editorial-guidelines/',
    // No sameAs. GarageDoorProHQ Rules.md, 2026-10-31: "Social: none." There
    // are no real profiles to list, and sameAs pointing at profiles that do
    // not exist is a fabricated identity claim, not a markup improvement.
    // Add this the day real profiles exist, not before.
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@id': SITE_ID,
    '@type': 'WebSite',
    name: SITE.name,
    url: base + '/',
    // Links the site to its publisher instead of leaving two unconnected
    // top-level nodes, which is what the audit found.
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: base + '/search/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ── BreadcrumbList ──────────────────────────────────────────
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

// ── LocalBusiness (business detail pages) ───────────────────
//
// No `aggregateRating`. AirProHQ's equivalent emits one when a listing has a
// rating; this site has no lawfully redistributable rating source, so
// emitting the property at all would mean inventing it. A fabricated
// aggregateRating is also a structured-data spam violation, not merely
// inaccurate.
//
// No `openingHoursSpecification` either, for the same reason — and a wrong
// one sends someone to a voicemail at 2am.
export function businessSchema(b, url) {
  const schema = {
    // HomeAndConstructionBusiness is the closest standard type; schema.org
    // has no GarageDoorBusiness the way it has HVACBusiness.
    '@type': 'HomeAndConstructionBusiness',
    '@id': url + '#business',
    name: b.name,
  };
  // `url` is the BUSINESS's own site, not this directory page. It pointed
  // here for all 419 listings that have a website, which told every consumer
  // that garagedoorprohq.com/.../acme-doors/ is Acme Doors' official URL. It
  // is not — it is a page ABOUT them, which is what the WebPage wrapper at
  // the bottom of this function now says. Omitted entirely when a business
  // has no site of its own, rather than falling back to ours.
  if (b.website) schema.url = b.website;
  // E.164 in the markup regardless of how the source stored it. 430 of these
  // were bare 10-digit strings, which is ambiguous to a parser about country.
  if (b.phone) schema.telephone = e164Phone(b.phone) || b.phone;

  const address = { '@type': 'PostalAddress', addressCountry: 'US' };
  if (b.street) address.streetAddress = b.street;
  if (b.city) address.addressLocality = b.city;
  if (b.stateCode) address.addressRegion = b.stateCode;
  if (b.postalCode) address.postalCode = b.postalCode;
  schema.address = address;

  // No sameAs here. It used to be [b.website], which is the same value already
  // set as schema.url a few lines up -- sameAs is for OTHER authoritative
  // profiles of the same entity (a social page, a Wikipedia article), so
  // repeating the homepage asserts nothing and just makes the graph noisier.
  // The 2026-10-31 audit flagged it; there is no second profile to put here,
  // for the same reason the Organization has no sameAs (Rules: "Social: none").
  if (b.lat != null && b.lng != null) {
    schema.geo = { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng };
  }
  if (b.services?.length) {
    schema.knowsAbout = b.services;
  }
  // A license is a real, externally checkable credential, so it belongs in
  // the structured data where a rating does not.
  if (b.licenceNumber) {
    schema.hasCredential = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      identifier: b.licenceNumber,
      recognizedBy: { '@type': 'GovernmentOrganization', name: b.licenceAuthority },
    };
  }

  // The page is a WebPage ABOUT the business, not the business itself. That
  // distinction is the whole point of the fix: this URL belongs to us, the
  // business's own URL belongs to them, and `about` is what connects the
  // two without either claiming to be the other. isPartOf and publisher tie
  // the page back into the one site-wide entity graph.
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: `${b.name} — ${b.city}, ${b.stateCode}`,
    about: schema,
    isPartOf: { '@id': SITE_ID },
    publisher: { '@id': ORG_ID },
  };
}

// ── ItemList (city / state directory pages) ────────────────
export function itemListSchema(items, urlFn) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: abs(urlFn(it)),
    })),
  };
}

// Strips tags for schema.org text fields — FAQ answers may carry live links
// for display, but structured data must be plain text.
function stripHtml(str) {
  return String(str).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ── FAQPage ─────────────────────────────────────────────────
export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: stripHtml(f.q),
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.a) },
    })),
  };
}

// ── Article (guides) ────────────────────────────────────────
export function articleSchema({ title, description, url, datePublished, dateModified, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: abs(url),
    // mainEntityOfPage ties the Article to the page it is ON, rather than
    // leaving a free-floating Article node that could be read as syndicated
    // from somewhere else. Both were missing — the 2026-10-31 audit's Schema
    // finding.
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(url) },
    // The guide's own OG image. Google's Article documentation treats image as
    // a recommended property, and the site already generates one per guide, so
    // this was a field left empty rather than data we do not have.
    ...(image ? { image: [abs(image)] } : {}),
    datePublished,
    dateModified: dateModified || datePublished,
    // By @id, not a restated anonymous Organization. Every guide was emitting
    // its own unconnected publisher node under a name that disagreed with the
    // Organization's; these now resolve to the single entity.
    //
    // Still an Organization author rather than a Person. That is the audit's
    // E-E-A-T finding and it is not a markup fix: it needs a real named author
    // with real credentials, which is Chris's call, not something to invent
    // here. Left honest rather than papered over.
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

// ── DefinedTermSet / DefinedTerm (glossary) ─────────────────
export function definedTermSetSchema(terms) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: `${SITE.name} Garage Door Glossary`,
    url: base + '/glossary/',
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: stripHtml(t.short),
      url: `${base}/glossary/${t.slug}/`,
    })),
  };
}

export function definedTermSchema(t) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: t.term,
    description: stripHtml(t.short),
    url: `${base}/glossary/${t.slug}/`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: `${SITE.name} Garage Door Glossary`,
      url: base + '/glossary/',
    },
  };
}
