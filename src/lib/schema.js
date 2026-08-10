import { SITE } from './site.js';

const base = SITE.domain.replace(/\/$/, '');

const abs = (u) => (String(u).startsWith('http') ? u : base + u);

// ── Organization / WebSite (site-wide, homepage) ─────────────
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.legalName,
    url: base + '/',
    description: SITE.description,
    email: SITE.email,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: base + '/',
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
    '@context': 'https://schema.org',
    // HomeAndConstructionBusiness is the closest standard type; schema.org
    // has no GarageDoorBusiness the way it has HVACBusiness.
    '@type': 'HomeAndConstructionBusiness',
    name: b.name,
    url,
  };
  if (b.phone) schema.telephone = b.phone;

  const address = { '@type': 'PostalAddress', addressCountry: 'US' };
  if (b.street) address.streetAddress = b.street;
  if (b.city) address.addressLocality = b.city;
  if (b.stateCode) address.addressRegion = b.stateCode;
  if (b.postalCode) address.postalCode = b.postalCode;
  schema.address = address;

  if (b.website) schema.sameAs = [b.website];
  if (b.lat != null && b.lng != null) {
    schema.geo = { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng };
  }
  if (b.services?.length) {
    schema.knowsAbout = b.services;
  }
  // A licence is a real, externally checkable credential, so it belongs in
  // the structured data where a rating does not.
  if (b.licenceNumber) {
    schema.hasCredential = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      identifier: b.licenceNumber,
      recognizedBy: { '@type': 'GovernmentOrganization', name: b.licenceAuthority },
    };
  }
  return schema;
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
export function articleSchema({ title, description, url, datePublished, dateModified }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: abs(url),
    datePublished,
    dateModified: dateModified || datePublished,
    author: { '@type': 'Organization', name: SITE.legalName },
    publisher: { '@type': 'Organization', name: SITE.legalName },
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
