// Anchor points for the CostMap diagram, shared between the drawing and its
// legend.
//
// This lives in lib/ rather than inside CostMap.astro because an Astro
// component cannot return data to the page that renders it — and the drawing
// and the legend must be generated from ONE list or they will drift out of
// step, which is the exact failure this site avoids everywhere else by reading
// figures from the guide that owns them.
//
// Marker centres must sit inside [22, 618] x [22, 278] so a radius-21 circle
// is not clipped by the 640x300 viewBox. scripts/check-seo.py enforces this
// against the built HTML.
//
// Prices are never written here. They are matched out of a guide's costTable at
// build time, so renaming a row in guides.js removes its callout rather than
// leaving a stale number on the drawing.

const ANCHORS = [
  { key: 'springs', match: /torsion spring — pair/i, label: 'Torsion springs',
    x: 320, y: 74, lx: 320, ly: 30, colour: 'var(--signal)',
    href: '/glossary/torsion-spring/' },
  { key: 'opener', match: /opener replacement/i, label: 'Opener',
    x: 128, y: 108, lx: 128, ly: 30, colour: 'var(--steel)',
    href: '/guides/garage-door-opener-repair-cost/' },
  { key: 'cables', match: /lift cable/i, label: 'Lift cables',
    x: 78, y: 200, lx: 24, ly: 200, colour: 'var(--steel)',
    href: '/glossary/lift-cable/' },
  { key: 'rollers', match: /roller replacement/i, label: 'Rollers',
    x: 560, y: 132, lx: 614, ly: 120, colour: 'var(--amber)',
    href: '/glossary/roller/' },
  { key: 'track', match: /track realignment/i, label: 'Track',
    x: 574, y: 240, lx: 614, ly: 252, colour: 'var(--ink-soft)',
    href: '/glossary/track/' },
  { key: 'panel', match: /panel replacement/i, label: 'Door panel',
    x: 300, y: 188, lx: 300, ly: 276, colour: 'var(--ink)' },
];

/**
 * Match a guide's costTable rows onto the drawing.
 * Returns only anchors whose row still exists, numbered in drawing order.
 */
export function costCallouts(rows = []) {
  return ANCHORS
    .map((a) => {
      const row = rows.find(([job]) => a.match.test(job));
      return row ? { ...a, price: row[1] } : null;
    })
    .filter(Boolean)
    .map((a, i) => ({ ...a, n: i + 1 }));
}
