// ─────────────────────────────────────────────────────────────
//  DIAGRAM REGISTRY — captions and legends, kept out of the drawings.
//
//  A guide or glossary term references a diagram by name; this file supplies
//  the words. Two reasons it is separated from the .astro components:
//
//  1. Legend text must be HTML, not SVG text. A 640-unit viewBox scaled into a
//     350px phone halves every font size with it, so labels drawn inside a
//     responsive SVG are illegible on the device most of this audience uses.
//     Body-level HTML also honours the reader's font-size setting and is picked
//     up as page text.
//  2. Most callouts have a glossary page, so the legend doubles as internal
//     linking — and every href here is checked by scripts/check-links.py
//     against the built output, the same as any other link on the site.
//
//  Legend numbers MUST match the markers in the drawing. There is no way to
//  enforce that automatically, so when a drawing's callouts change, change them
//  here in the same edit.
// ─────────────────────────────────────────────────────────────

export const diagrams = {
  'torsion-system': {
    component: 'TorsionSystem',
    caption:
      'Where the load actually travels: the springs carry the door’s weight, the drums convert that into cable pull, and the cables lift from the bottom bracket. Every expensive failure on this page happens somewhere on this drawing.',
    legend: [
      { n: 1, label: 'Torsion spring', href: '/glossary/torsion-spring/' },
      { n: 2, label: 'Torsion shaft and centre bearing plate' },
      { n: 3, label: 'Cable drum' },
      { n: 4, label: 'Lift cable', href: '/glossary/lift-cable/' },
      { n: 5, label: 'Vertical track', href: '/glossary/track/' },
      { n: 6, label: 'Roller', href: '/glossary/roller/' },
      { n: 7, label: 'Bottom bracket — under full spring tension' },
    ],
  },

  'spring-types': {
    component: 'SpringTypes',
    caption:
      'Look above your door. A single shaft with springs coiled around it is a torsion system; long springs running back along the horizontal tracks are extension springs. Which you have sets the price.',
    legend: [
      { n: 1, label: 'Torsion springs on a shaft above the opening', href: '/glossary/torsion-spring/' },
      { n: 2, label: 'Extension springs alongside the horizontal tracks', href: '/glossary/extension-spring/' },
      { n: 3, label: 'Safety cable threaded through the spring — ask for these if yours lack them' },
    ],
  },

  'photo-eye': {
    component: 'PhotoEye',
    caption:
      'The fault that most often needs no technician. If the door starts down and reverses, something is breaking this beam — a cobweb, a leaf, a bike wheel, or a bracket knocked out of line.',
    legend: [
      { n: 1, label: 'Photo-eye sensor, one each side', href: '/glossary/photo-eye-sensor/' },
      { n: 2, label: 'Infrared beam between them' },
      { n: 3, label: 'Anything breaking the beam reverses the door' },
      { n: 4, label: 'About six inches above the floor' },
    ],
  },

  'balance-test': {
    component: 'BalanceTest',
    caption:
      'The free diagnostic, and the one that tells a spring fault from an opener fault. Pull the release cord, lift the door to waist height by hand, and let go.',
    legend: [
      { n: 1, label: 'Balanced — stays where you left it', href: '/glossary/door-balance/' },
      { n: 2, label: 'Too little tension — slides shut. Springs are the fault.' },
      { n: 3, label: 'Too much tension — pulls upward. Also springs.' },
    ],
  },

  'opener-types': {
    component: 'OpenerTypes',
    caption:
      'The jackshaft argument is entirely about the ceiling. A rail opener runs down the middle of it; a jackshaft mounts beside the door and leaves it clear.',
    legend: [
      { n: 1, label: 'Motor unit, hung from the ceiling' },
      { n: 2, label: 'Trolley travelling along the rail' },
      { n: 3, label: 'Headroom the rail consumes' },
      { n: 4, label: 'Jackshaft motor, wall-mounted beside the opening', href: '/glossary/jackshaft-opener/' },
      { n: 5, label: 'Ceiling left clear for storage or a car lift' },
    ],
  },

  // Legend is generated from the guide's own costTable — see src/lib/costmap.js.
  'cost-map': {
    component: 'CostMap',
    dataDriven: true,
    caption:
      'Prices are read from the table below this drawing rather than written into it, so the two cannot disagree. All are national 2026 estimates, not quotes.',
  },
};

export function getDiagram(name) {
  return diagrams[name] || null;
}
