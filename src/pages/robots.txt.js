import { SITE } from '../lib/site.js';

// Generated rather than a static file in public/, so the Sitemap line can
// never point at a stale domain — it is built from SITE.domain, the same
// single source of truth as every canonical tag.
export const prerender = true;

export async function GET() {
  const base = SITE.domain.replace(/\/$/, '');

  const body = `# ${SITE.name}
# Full crawl access. Nothing here is gated and there is no login.
User-agent: *
Allow: /

# /search/ is a client-side query page with no unique content of its own and
# is noindexed in its <head>. Disallowing it as well would stop a crawler
# reading that tag, so it is deliberately left crawlable.

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
