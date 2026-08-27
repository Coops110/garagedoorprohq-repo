// ─────────────────────────────────────────────────────────────
//  GUIDES — the informational content that earns the ad revenue and
//  supplies every cost figure quoted anywhere else on the site.
//
//  RULES THAT THE BUILD ENFORCES (scripts/check-content.mjs):
//   1. `related` must be reciprocal. If A lists B, B lists A. A one-way
//      link is a dead end for both a crawler and a reader.
//   2. Every `keyword` must be unique across the whole array. Two pages
//      targeting one keyword means Google picks one, usually the weaker.
//   3. Figures must not contradict each other. The cost tables below share
//      rows on purpose — the spring row in the repair-cost pillar is the
//      same range the spring guide headlines. Change one, change both, or
//      the site argues with itself on a neighbouring page.
//
//  Only finished guides go in `guides`. Planned ones live in `PLANNED` at
//  the bottom: they get no route, no sitemap entry and no thin placeholder
//  page, but their keywords are visible so the next guide written cannot
//  accidentally target one that is already claimed.
// ─────────────────────────────────────────────────────────────

export const guides = [
  // ═══════════════════════════════════════════════════════════
  //  PILLAR 1 — repair cost
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'garage-door-repair-cost',
    pillar: true,
    heroDiagram: 'cost-map',
    title: 'Garage Door Repair Cost in 2026: By Job',
    h1: 'Garage Door Repair Cost in 2026: What Each Job Actually Costs',
    description:
      'What garage door repair costs in 2026 by job — springs, openers, cables and panels — plus when repair stops making sense and replacement wins.',
    keyword: 'garage door repair cost',
    datePublished: '2026-08-11',
    dateModified: '2026-08-11',
    readTime: 9,
    quickAnswer:
      'Most garage door repairs cost $150 to $400 in 2026, with a national average near $260. A snapped torsion spring runs $180–$350 for one or $250–$550 for the pair; opener repairs run $100–$300; a single replacement panel runs $250–$800. Expect a $75–$150 diagnostic fee, usually credited against the work if you go ahead.',
    costTable: {
      caption: 'Common garage door repairs and typical installed cost, 2026 (US national)',
      rows: [
        ['Service call / diagnostic', '$75 – $150'],
        ['Photo-eye sensor realign or replace', '$85 – $200'],
        ['Roller replacement (set)', '$100 – $200'],
        ['Opener repair', '$100 – $300'],
        ['Lift cable replacement (pair)', '$130 – $250'],
        ['Track realignment or repair', '$125 – $300'],
        ['Off-track door reset', '$150 – $300'],
        ['Torsion spring — one', '$180 – $350'],
        ['Torsion spring — pair', '$250 – $550'],
        ['Panel replacement (per panel)', '$250 – $800'],
        ['Opener replacement, installed', '$300 – $700'],
      ],
    },
    sections: [
      {
        h2: 'What moves the price',
        body: [
          'Four things decide a garage door repair bill: which part failed, whether the door is single or double width, how quickly you need someone there, and local labour rates. The part itself is often the smaller half of the invoice. A torsion spring is a $40–$90 component; most of what you pay is the twenty minutes of skilled, genuinely dangerous work needed to fit it safely.',
          'Double-width doors cost more across almost every job. They are heavier, so they use heavier springs and cables, and a single panel spans further and costs more to replace. Assume the upper end of every range below for a 16-foot door.',
          'Timing matters more than most people expect. An after-hours or same-day emergency call typically adds $50–$150, and some companies charge a flat weekend premium. If the door is closed and the car is not trapped behind it, waiting until a normal weekday slot is the cheapest decision available to you.',
        ],
      },
      {
        h2: 'Springs: the most common failure, and the most expensive small job',
        diagram: 'torsion-system',
        body: [
          'Torsion springs are wound steel bars mounted above the door that carry almost all of its weight. They are rated in cycles — one open and one close is a cycle — and a standard 10,000-cycle spring lasts roughly seven to ten years on a door used four times a day. When one breaks it usually goes with a bang loud enough to be heard indoors, and the door then feels impossibly heavy or will not lift at all.',
          'Replacing one torsion spring runs $180–$350 installed. Replacing the pair runs $250–$550, and it is almost always the better buy: the second spring has done identical work for identical years, the labour is already on site, and paying the call-out twice inside a year is the expensive outcome.',
          'This is the one job on this page where the DIY saving is not worth considering. A wound torsion spring stores enough energy to break bones, and the winding bars have to be handled correctly to release it. We have a separate page on exactly why, and it is deliberately not a tutorial.',
        ],
      },
      {
        h2: 'Openers: repair or replace',
        body: [
          'Opener faults split into cheap and terminal. A misaligned photo-eye sensor, a failed capacitor, a stripped plastic drive gear or a dead remote are all cheap — $100–$300 covers most of them, and a sensor realignment can be at the bottom of that range. A burnt-out motor or a cracked logic board on a fifteen-year-old chain-drive unit is terminal, because the parts cost approaches the price of a new opener that comes with a warranty.',
          'A new opener installed runs $300–$700 depending on drive type and horsepower. Belt drives cost more than chain drives and are markedly quieter, which matters if there is a bedroom over the garage.',
          'One useful rule: if the quoted repair is more than half the price of a replacement unit and the opener is over ten years old, replace it. That is the same arithmetic used across home mechanical systems, and it holds here.',
        ],
      },
      {
        h2: 'Cables, rollers, tracks and off-track doors',
        body: [
          'Lift cables fray and snap, usually one before the other, and a snapped cable lets one side of the door drop. Replacing the pair runs $130–$250. Like springs, they are replaced in pairs because they have worn identically.',
          'Rollers are the small wheels that run in the vertical track. Worn nylon or seized steel rollers make the door loud and jerky, and a set runs $100–$200. It is a cheap job that transforms how the door sounds.',
          'A door off its track is the failure that looks most alarming and is often not the most expensive. Resetting it runs $150–$300. What matters is finding out why it came off — a bent track, a broken roller or a cable that let go. Paying to reset a door without fixing the cause buys you the same call-out again in a month.',
        ],
      },
      {
        h2: 'Panels: the point where the arithmetic changes',
        body: [
          'A single replacement panel runs $250–$800 fitted, driven mostly by material and whether the exact panel is still manufactured. On a door more than about fifteen years old, an exact match may not exist, and a visibly different panel is a poor result on the most visible elevation of most houses.',
          'Once two or more panels are damaged, price the whole door. A new single door installed runs $750–$2,000 and a double runs $1,200–$3,500, so three panels at the top of the range is already replacement money — for a door with a full warranty, current insulation and no mismatched section.',
        ],
      },
      {
        h2: 'How to avoid overpaying',
        body: [
          'Ask for the price in parts and labour separately. It is the single fastest way to see whether a quote is high on the component, high on the hours, or fair.',
          'Get the cycle rating in writing when springs are quoted. A 10,000-cycle spring and a 25,000-cycle spring look identical in the van and differ by roughly $40–$80 a pair fitted, but the high-cycle spring lasts two to three times longer. On a door you open six times a day it is the clearest value upgrade in the trade.',
          'Confirm whether the diagnostic fee is credited against the repair. Most companies credit it; the ones that do not should tell you before they drive out, and a company that will not answer that on the phone has told you something useful.',
          'Where the state licenses the trade — California, Florida and Arizona are the three that license garage door work specifically — ask for the licence number and check it yourself on the state register. It takes about a minute, and it is the one credential a homeowner can verify without expertise.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does it cost to fix a garage door?',
        a: 'Most garage door repairs cost $150 to $400 in 2026, averaging around $260 nationally. Sensor and roller jobs sit at the bottom of that range, spring and panel work at the top. Expect a $75–$150 diagnostic fee, usually credited against the repair.',
      },
      {
        q: 'Why is garage door spring replacement so expensive for such a small part?',
        a: 'The spring itself is a $40–$90 part. You are paying for the labour to fit it, and that labour is skilled and genuinely hazardous — a wound torsion spring holds enough stored energy to cause serious injury if it is released incorrectly.',
      },
      {
        q: 'Should I replace one garage door spring or both?',
        a: 'Both. The second spring has done the same number of cycles over the same years, so it is close behind the first. The pair costs $250–$550 against $180–$350 for one, and replacing both avoids paying a second call-out within a year.',
      },
      {
        q: 'Is it cheaper to repair or replace a garage door?',
        a: 'Repair, until roughly two panels are damaged or the total quote passes half the price of a new door. A new single door runs $750–$2,000 installed and a double runs $1,200–$3,500, so three panels at $800 each is already replacement money.',
      },
      {
        q: 'How much is an emergency garage door repair?',
        a: 'Add $50–$150 to the normal price for same-day, after-hours or weekend service. If the door is closed and no vehicle is trapped, booking a standard weekday slot is the cheapest option available.',
      },
      {
        q: 'How long does a garage door repair take?',
        a: 'Most single-fault repairs take 1–2 hours on site. Spring and cable replacement is usually under an hour of actual work; panel replacement can take longer or need a return visit if the panel has to be ordered.',
      },
    ],
    related: ['garage-door-spring-replacement-cost', 'garage-door-opener-repair-cost', 'why-diy-spring-repair-is-dangerous', 'hiring-a-garage-door-company', 'torsion-vs-extension-springs', 'garage-door-opener-wont-work', 'garage-door-maintenance'],
    glossary: ['torsion-spring', 'extension-spring', 'cycle-rating', 'photo-eye-sensor', 'lift-cable'],
  },

  // ═══════════════════════════════════════════════════════════
  //  CLUSTER — springs
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'garage-door-spring-replacement-cost',
    pillar: false,
    parent: 'garage-door-repair-cost',
    title: 'Garage Door Spring Replacement Cost 2026',
    h1: 'Garage Door Spring Replacement Cost in 2026',
    description:
      'Garage door spring replacement costs $180–$350 for one torsion spring or $250–$550 for the pair in 2026, and why both is the cheaper choice.',
    keyword: 'garage door spring replacement cost',
    datePublished: '2026-08-11',
    dateModified: '2026-08-11',
    readTime: 7,
    quickAnswer:
      'Replacing one torsion spring costs $180–$350 installed in 2026; the pair costs $250–$550. Extension springs are cheaper at $120–$300 a pair. High-cycle springs add $40–$80 to a pair and last two to three times as long. The spring is a $40–$90 part — most of the bill is skilled, hazardous labour.',
    costTable: {
      caption: 'Garage door spring replacement, typical installed cost 2026',
      rows: [
        ['Extension springs, pair', '$120 – $300'],
        ['Torsion spring, one', '$180 – $350'],
        ['Torsion spring, pair', '$250 – $550'],
        ['High-cycle torsion pair (25,000 cycle)', '$300 – $630'],
        ['Torsion pair, double-width door', '$350 – $600'],
        ['Spring pair plus cables and rollers', '$380 – $800'],
      ],
    },
    sections: [
      {
        h2: 'Torsion or extension: which springs you have',
        diagram: 'spring-types',
        body: [
          'Look above the door. A single steel bar running horizontally above the opening, with one or two springs wound around it, is a torsion system — that is what most doors fitted in the last thirty years use. Long springs running parallel to the horizontal tracks on each side, stretching as the door closes, are extension springs, common on older and lighter single doors.',
          'Torsion springs cost more to replace but last longer, balance the door better and fail less dramatically. Extension springs run $120–$300 for the pair. If yours are extension springs without safety cables threaded through them, ask for those to be added — they cost very little and they stop a snapping spring becoming a projectile.',
        ],
      },
      {
        h2: 'Why the pair costs barely more than one',
        body: [
          'The labour and the call-out are the bulk of the invoice, and both are already paid for once the technician is on the ladder. The second spring is mostly the part cost, which is why one spring at $180–$350 becomes a pair at $250–$550 rather than double.',
          'The reason to do it is not the discount, it is the cycle count. Both springs were fitted on the same day and have done the same number of openings, so when one goes the other is typically within months of the same fate. Replacing one means booking the same job twice inside a year and paying the call-out twice.',
        ],
      },
      {
        h2: 'Cycle rating is the number that actually matters',
        body: [
          'Springs are rated in cycles — one full open and close. A standard spring is rated at 10,000 cycles, which on a door opened four times a day works out at roughly seven years. Open it eight times a day and the same spring is a three-and-a-half year part.',
          'High-cycle springs rated 25,000 cycles or more use thicker wire on a larger diameter and add roughly $40–$80 to a fitted pair. On any door that gets heavy daily use, that is the best-value upgrade in this trade: two to three times the life for well under a third more money. Ask for the rating in writing, because a 10,000 and a 25,000-cycle spring are not distinguishable to a homeowner once they are up.',
        ],
      },
      {
        h2: 'What else should be replaced at the same time',
        body: [
          'Lift cables wear in step with springs and cost $130–$250 as a pair on their own. Doing them alongside the springs, while the door is already being balanced, is normally cheaper than the two jobs separately — bundled with rollers it runs $380–$800.',
          'A good technician will also check the door is balanced before leaving: disconnected from the opener, a correctly sprung door should stay put when stopped halfway. If it slams down or shoots up, the spring tension is wrong, and that transfers the load onto the opener you are next going to be paying to replace.',
        ],
      },
      {
        h2: 'Signs a spring is about to go',
        body: [
          'A visible gap of two or three inches in one of the springs above the door means it has already snapped — that is the single unambiguous sign. Before that point, look for a door that lifts unevenly or sags on one side, feels much heavier by hand than it used to, opens jerkily, or makes the opener strain and stall partway.',
          'A door that will not lift at all, or lifts a few inches and stops, is the classic broken-spring presentation. Do not keep pressing the opener button: with the springs gone, the opener is trying to lift the door’s full weight alone, and that is how a $250 spring job becomes a $250 spring job plus a $500 opener.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does it cost to replace a garage door spring?',
        a: 'One torsion spring costs $180–$350 fitted in 2026, and the pair costs $250–$550. Extension springs are cheaper at $120–$300 for the pair. A double-width door sits at the top of those ranges.',
      },
      {
        q: 'How long do garage door springs last?',
        a: 'A standard 10,000-cycle spring lasts about seven to ten years at four openings a day, or nearer three to five at eight a day. High-cycle springs rated 25,000 cycles last two to three times as long for $40–$80 more on a fitted pair.',
      },
      {
        q: 'Can I replace a garage door spring myself?',
        a: 'You should not. A wound torsion spring stores enough energy to cause serious injury or death if released incorrectly, and the winding bars have to be handled in a specific sequence. The saving is roughly $100–$250 of labour against that risk.',
      },
      {
        q: 'How do I know if my garage door spring is broken?',
        a: 'A two to three inch gap in the coil above the door means it has snapped. Before that, look for a door that feels much heavier than usual, lifts unevenly or sags on one side, or an opener that strains and stalls partway up.',
      },
      {
        q: 'Do I need to replace both garage door springs?',
        a: 'It is strongly advised. Both springs have completed the same number of cycles, so the second is usually close behind the first. The pair costs $250–$550 against $180–$350 for one, and it avoids a second call-out fee within the year.',
      },
    ],
    related: ['garage-door-repair-cost', 'why-diy-spring-repair-is-dangerous', 'garage-door-opener-repair-cost', 'torsion-vs-extension-springs'],
    glossary: ['torsion-spring', 'extension-spring', 'cycle-rating', 'lift-cable', 'door-balance'],
  },

  // ═══════════════════════════════════════════════════════════
  //  CLUSTER — openers
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'garage-door-opener-repair-cost',
    pillar: false,
    parent: 'garage-door-repair-cost',
    title: 'Garage Door Opener Repair Cost 2026',
    h1: 'Garage Door Opener Repair Cost in 2026',
    description:
      'Garage door opener repair costs $100–$300 in 2026; a new opener installed runs $300–$700. Which faults are worth fixing and which are terminal.',
    keyword: 'garage door opener repair cost',
    datePublished: '2026-08-11',
    dateModified: '2026-08-11',
    readTime: 7,
    quickAnswer:
      'Most garage door opener repairs cost $100–$300 in 2026. Sensor realignment is $85–$200, a drive gear or capacitor $120–$300, a logic board $150–$400. A replacement opener installed runs $300–$700. If the repair exceeds half the replacement cost and the unit is over ten years old, replace it.',
    costTable: {
      caption: 'Garage door opener repairs and replacement, installed cost 2026',
      rows: [
        ['Photo-eye sensor realign or replace', '$85 – $200'],
        ['Remote or keypad replacement', '$40 – $120'],
        ['Limit switch adjustment', '$85 – $175'],
        ['Drive gear or sprocket', '$120 – $300'],
        ['Capacitor', '$120 – $250'],
        ['Trolley or carriage', '$130 – $300'],
        ['Chain or belt replacement', '$140 – $300'],
        ['Logic board', '$150 – $400'],
        ['New chain-drive opener, installed', '$300 – $550'],
        ['New belt-drive opener, installed', '$400 – $700'],
      ],
    },
    sections: [
      {
        h2: 'Check the cheap things first',
        diagram: 'photo-eye',
        body: [
          'Two faults account for a large share of call-outs and neither needs a technician. If the door closes a few inches then reverses and the opener light flashes, the photo-eye sensors near the floor are misaligned or blocked — a cobweb, a leaf, a bike wheel, or a bracket knocked out of line. They should face each other with a steady indicator light. Wipe both lenses and nudge one until the light is solid.',
          'If nothing responds to the remote but the wall button works, it is the remote — a battery or, at worst, a $40–$120 replacement. If nothing responds to anything and there is no light, check the outlet and the breaker before booking anyone.',
          'Beyond that, stop. The next tier of faults involves stored spring tension and mains-connected boards, and a technician’s diagnostic fee of $75–$150 is normally credited against the repair anyway.',
        ],
      },
      {
        h2: 'Faults worth repairing',
        body: [
          'A stripped plastic drive gear is the classic repairable failure on chain-drive units. The gear is designed as the sacrificial part; the motor is fine, and $120–$300 buys years more service.',
          'A failed capacitor presents as a motor that hums but does not turn. It is a $120–$250 job and worth doing on any unit under about twelve years old.',
          'Limit switch problems — the door stopping short, or pressing into the floor and reversing — are adjustment work at $85–$175. A logic board at $150–$400 is the borderline case: worth it on a newer unit with a working motor, rarely worth it on a fifteen-year-old one.',
        ],
      },
      {
        h2: 'When to stop repairing',
        body: [
          'A burnt-out motor is the end. So is a cracked housing, a bent rail, or a second board failure on the same unit. Any of those on an opener over ten years old means the money belongs in a replacement.',
          'The rule that keeps this simple: if the quoted repair is more than half the installed price of a new opener, replace instead. At $300–$700 installed, that means a repair quote above roughly $200–$350 on an old unit deserves a direct comparison rather than an automatic yes.',
          'There is also a safety floor. Any opener made before 1993 predates the federal requirement for photo-eye entrapment protection, and openers from that era should be replaced rather than repaired regardless of what has failed.',
        ],
      },
      {
        h2: 'Chain, belt or direct drive',
        diagram: 'opener-types',
        body: [
          'Chain drives are the cheapest at $300–$550 installed and the loudest. On a detached garage, the noise is irrelevant and the saving is real.',
          'Belt drives run $400–$700 installed and are markedly quieter, which is the whole argument if there is a bedroom above or beside the garage. Direct-drive and wall-mount jackshaft units sit at or above the top of that range; a jackshaft mounts beside the door rather than on the ceiling, which is the answer for a garage with a low ceiling or overhead storage.',
          'All current openers include rolling-code remotes and Wi-Fi is now near-standard rather than a premium feature. Battery backup is worth specifying deliberately: without it, a power cut means lifting a heavy door by hand, and in some states it is now a code requirement on new residential installs.',
        ],
      },
      {
        h2: 'One thing to check before blaming the opener',
        diagram: 'balance-test',
        body: [
          'An opener that strains, stalls partway or reverses under load is frequently a spring problem wearing the opener out, not an opener problem. Pull the release cord, disconnect the door from the opener and lift it by hand. A correctly balanced door lifts with modest effort and stays put when you let go halfway.',
          'If it is heavy, or drops, the springs are the fault and the opener is the symptom. Replacing the opener without fixing that puts a new motor straight back under the same overload — and spring work runs $250–$550, which is money far better spent than $700 on an opener that will fail the same way.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does it cost to repair a garage door opener?',
        a: 'Most opener repairs cost $100–$300 in 2026. Sensor realignment runs $85–$200, a drive gear or capacitor $120–$300, and a logic board $150–$400. A diagnostic fee of $75–$150 is usual and normally credited against the work.',
      },
      {
        q: 'Is it worth repairing a garage door opener or should I replace it?',
        a: 'Replace it if the repair quote is more than half the installed price of a new opener and the unit is over ten years old. New openers run $300–$700 installed, so a repair above roughly $200–$350 on an old unit is worth comparing directly.',
      },
      {
        q: 'Why does my garage door open then immediately close again?',
        a: 'Usually a photo-eye sensor that is misaligned, dirty or blocked, or a limit switch out of adjustment. Wipe both sensor lenses and check they face each other with a steady light before booking a technician.',
      },
      {
        q: 'How long does a garage door opener last?',
        a: 'Ten to fifteen years is typical. Life is shortened most by an unbalanced door, because the opener then lifts weight the springs should be carrying.',
      },
      {
        q: 'How much is a new garage door opener installed?',
        a: 'A chain-drive opener runs $300–$550 installed and a belt drive $400–$700. Wall-mount jackshaft and direct-drive units sit at or above the top of that range.',
      },
    ],
    related: ['garage-door-repair-cost', 'garage-door-spring-replacement-cost', 'hiring-a-garage-door-company', 'garage-door-opener-wont-work'],
    glossary: ['photo-eye-sensor', 'jackshaft-opener', 'limit-switch', 'rolling-code', 'door-balance'],
  },

  // ═══════════════════════════════════════════════════════════
  //  SAFETY — deliberately not a how-to
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'why-diy-spring-repair-is-dangerous',
    pillar: false,
    parent: 'garage-door-repair-cost',
    title: 'Why DIY Garage Door Spring Repair Is Risky',
    h1: 'Why You Should Not Replace a Garage Door Spring Yourself',
    description:
      'A wound garage door torsion spring stores enough energy to cause serious injury. What the real risk is, and what the DIY saving actually amounts to.',
    keyword: 'diy garage door spring repair danger',
    datePublished: '2026-08-11',
    dateModified: '2026-08-11',
    readTime: 5,
    // This page exists to talk someone out of the job. It contains no
    // procedure, no tool list and no sequence — a partial instruction here
    // would be more dangerous than none, and the search intent behind
    // "can I replace a garage door spring myself" is a decision, not a
    // method.
    quickAnswer:
      'No. A wound torsion spring on a standard double garage door holds roughly 200–300 pounds of stored force, released through winding bars that will swing violently if mishandled. The saving over a professional replacement is about $100–$250 of labour. This page does not explain how to do it, on purpose.',
    sections: [
      {
        h2: 'What the stored energy actually is',
        diagram: 'torsion-system',
        body: [
          'A torsion spring does not simply hold a door up. It is wound under tension so that it counterbalances the door’s entire weight — 150 pounds for a typical insulated single, well over 300 for a double. That energy is held in a coil of hardened steel on a bar above your head, and it stays there whether the door is open, closed, or already broken.',
          'Releasing it is done with winding bars inserted into the spring cone, turned in a controlled sequence. If a bar slips, is the wrong size, or is substituted with a screwdriver, the spring unwinds against whatever is holding it. Hand and forearm fractures are the common outcome. Head injuries are the serious one.',
          'Even a spring that has already snapped is not safe. The remaining coil holds residual tension, and the second spring on a two-spring door is still fully wound.',
        ],
      },
      {
        h2: 'What you would actually save',
        body: [
          'A torsion spring is a $40–$90 part. A professional pair replacement costs $250–$550 fitted. Buying the springs and fitting them yourself saves roughly $100–$250 in labour — assuming you already own correctly sized winding bars, vice grips and a wind-up chart for your door, and assuming you get the wind count right first time.',
          'Get the wind count wrong and the door is unbalanced, which transfers load onto the opener and shortens the life of a $300–$700 unit. Order the wrong wire size, inside diameter or length — four measurements, all easy to get wrong from a photograph — and the door is out of service until the right part arrives.',
        ],
      },
      {
        h2: 'What to do instead',
        body: [
          'Leave the door closed and stop using the opener. With a spring gone, the opener is attempting to lift the full weight of the door on its own, which is how one failure becomes two.',
          'If the door is open and a vehicle is under it, do not lower it by hand. Clamp the track below the bottom roller with locking pliers on both sides so it cannot travel, move the car out, and leave the door where it is until a technician arrives.',
          'Then get two quotes for a pair replacement rather than one spring, and ask for the cycle rating in writing. Where the state licenses the trade — California, Florida and Arizona — ask for the licence number and check it on the state register yourself.',
        ],
      },
      {
        h2: 'The jobs that are genuinely fine to do yourself',
        diagram: 'balance-test',
        body: [
          'Plenty of garage door maintenance carries no stored-energy risk at all. Cleaning and realigning the photo-eye sensors near the floor. Replacing remote batteries. Wiping the tracks out — tracks are cleaned, not greased. Lubricating hinges, rollers and the spring coil itself with a garage-door-specific lubricant, which is the single maintenance job that most extends component life.',
          'Testing the balance is also safe and worth doing twice a year: pull the release cord, lift the door by hand to waist height and let go. It should stay put. If it slides or slams, the springs need attention — from someone else.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I replace a garage door spring myself?',
        a: 'You should not. A wound torsion spring holds 200–300 pounds of stored force on a typical double door, released through winding bars that cause serious hand, arm and head injuries when mishandled. The saving is about $100–$250 of labour.',
      },
      {
        q: 'Is a broken garage door spring still dangerous?',
        a: 'Yes. A snapped coil retains residual tension, and on a two-spring door the second spring is still fully wound. Treat the whole assembly as loaded until a technician has released it.',
      },
      {
        q: 'What should I do while I wait for a garage door repair?',
        a: 'Leave the door closed and stop using the opener, which is otherwise lifting the door’s full weight alone. If the door is open, clamp the track below the bottom roller on both sides before moving a vehicle out, and leave the door up.',
      },
      {
        q: 'Which garage door repairs are safe to do myself?',
        a: 'Cleaning and realigning photo-eye sensors, replacing remote batteries, wiping out tracks, lubricating hinges and rollers, and testing the door balance. Anything involving springs, cables or the opener’s internals is not.',
      },
    ],
    related: ['garage-door-repair-cost', 'garage-door-spring-replacement-cost', 'torsion-vs-extension-springs', 'garage-door-maintenance'],
    glossary: ['torsion-spring', 'winding-bar', 'door-balance', 'lift-cable'],
  },

  // ═══════════════════════════════════════════════════════════
  //  HIRING — the guide every city page links to
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'hiring-a-garage-door-company',
    pillar: true,
    title: 'How to Hire a Garage Door Company',
    h1: 'How to Hire a Garage Door Company: A Homeowner’s Checklist',
    description:
      'What to ask a garage door company before you book, which states license the trade, and how to check a contractor licence number yourself.',
    keyword: 'how to hire a garage door company',
    datePublished: '2026-08-11',
    dateModified: '2026-08-11',
    readTime: 8,
    quickAnswer:
      'Ask for the price split into parts and labour, the spring cycle rating in writing, whether the diagnostic fee is credited, and proof of liability insurance. In California, Florida and Arizona the trade is licensed at state level and you can check a licence number yourself in about a minute. Most other states license only general contractors, or nothing at all.',
    sections: [
      {
        h2: 'Only three states license this trade specifically',
        body: [
          'Unlike HVAC or electrical work, garage door installation is not a licensed trade in most of the United States. Three states license it specifically: California, through the Contractors State License Board as a C-61/D-28 limited specialty classification; Florida, through the Department of Business and Professional Regulation as a Garage Door Installation Specialty Contractor; and Arizona, through the Registrar of Contractors under classification ROC-283.',
          'Everywhere else, the work either falls under a general contractor licence, is licensed only at city or county level, or is not licensed at all. That is not a loophole a contractor is exploiting — it is simply how the trade is regulated, and it means "licensed" is a much weaker signal in most of the country than homeowners assume.',
          'The practical consequence: in the 47 states without a trade licence, verify insurance rather than licensure, and treat a company’s answers about parts, ratings and warranties as your real screening tool.',
        ],
      },
      {
        h2: 'How to check a licence yourself',
        body: [
          'In all three licensing states the register is public, free and searchable by licence number or business name. Search the number the company gives you, and check three things: that the status reads active, that the classification actually covers garage door work, and that the name on the licence matches the company quoting you. A licence belonging to a different entity is the most common discrepancy.',
          'Ask for the number before the visit, not after. A company that will not give it over the phone in a state that requires one has answered a different and more useful question.',
          'Where a listing on this site shows a verified licence, it means we matched the business to an active record on that state’s register. We check licence numbers against the state register; we do not inspect workmanship, and a listing is never a recommendation.',
        ],
      },
      {
        h2: 'Insurance matters everywhere, licensing does not',
        body: [
          'Ask for a certificate of general liability insurance, and for workers’ compensation cover if more than one person will be on site. A garage door is a heavy moving assembly attached to your house, and the failure modes involve damage to vehicles, walls and people.',
          'Ask the insurer’s name and policy number, not just whether they are insured. A company that is genuinely covered can produce a certificate the same day, because they already send it to commercial clients as routine.',
        ],
      },
      {
        h2: 'The four questions that reveal a quote',
        body: [
          'Ask for parts and labour separately. A fair spring job is a modest part and skilled labour; a quote that will not separate the two is hiding which half is inflated.',
          'Ask for the spring cycle rating in writing. A 10,000-cycle and a 25,000-cycle spring are indistinguishable once fitted and differ by $40–$80 on a pair. Being quoted the cheap spring at the high-cycle price is the most common way to be overcharged in this trade.',
          'Ask whether the diagnostic fee is credited against the work. Most companies credit it; the ones that do not should say so before driving out.',
          'Ask what the warranty covers and for how long — separately for the part and the labour. "One year" often means one year on the part and ninety days on the fitting.',
        ],
      },
      {
        h2: 'Warning signs',
        body: [
          'A price quoted over the phone for a fault nobody has seen is not a quote, it is a hook. Any honest answer to "how much to fix my garage door" is a range and a diagnostic fee.',
          'Pressure to replace the whole door when one part has failed deserves a second opinion, particularly when the replacement is offered at a discount that expires today.',
          'Deep discounts advertised on a service call — a "$29 tune-up" — are lead generation, and the profit has to reappear somewhere in the invoice. So does a demand for full payment in cash up front.',
          'For anything over about $1,000, get a second quote. The spread between garage door quotes on identical work is wide enough that one phone call regularly pays for itself several times over.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do garage door installers need a licence?',
        a: 'Only in California (CSLB C-61/D-28), Florida (DBPR Garage Door Installation Specialty Contractor) and Arizona (ROC-283) is the trade licensed specifically at state level. Elsewhere it falls under a general contractor licence, is licensed locally, or is not licensed at all.',
      },
      {
        q: 'How do I check if a garage door company is licensed?',
        a: 'In California, Florida and Arizona, search the state register by licence number or business name. Check that the status is active, the classification covers garage door work, and the name on the licence matches the company quoting you.',
      },
      {
        q: 'What should I ask a garage door company before hiring them?',
        a: 'The price split into parts and labour, the spring cycle rating in writing, whether the diagnostic fee is credited against the repair, the warranty terms for part and labour separately, and a certificate of liability insurance.',
      },
      {
        q: 'How many quotes should I get for garage door work?',
        a: 'One is enough for a small repair under a few hundred dollars. Get two or three for anything over about $1,000 — the spread on identical work is wide enough that a second call routinely pays for itself.',
      },
      {
        q: 'Is a cheap garage door tune-up offer worth taking?',
        a: 'Treat it as lead generation. A heavily discounted service call has to recover its margin somewhere in the final invoice, so ask what the tune-up includes and what the company charges for the repairs it typically finds.',
      },
    ],
    related: ['garage-door-repair-cost', 'garage-door-opener-repair-cost'],
    glossary: ['cycle-rating', 'torsion-spring', 'door-balance'],
  },

  // ═══════════════════════════════════════════════════════════
  //  TROUBLESHOOTING — symptom-led, deliberately not a cost page
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'garage-door-opener-wont-work',
    pillar: false,
    parent: 'garage-door-repair-cost',
    heroDiagram: 'photo-eye',
    title: 'Garage Door Opener Not Working: Fixes',
    h1: 'Garage Door Opener Not Working: What to Check, in Order',
    description:
      'Garage door opener not working? The free checks in the order a technician runs them, what each symptom actually means, and the point where you should stop.',
    keyword: 'garage door opener not working',
    datePublished: '2026-08-27',
    dateModified: '2026-08-27',
    readTime: 7,
    // Structured by SYMPTOM, not by part. Someone searching this has a door
    // that will not move and no idea which component owns the problem — a
    // parts-ordered page asks them to diagnose before they can read it.
    // Prices here are quoted, never tabled: garage-door-opener-repair-cost
    // owns those figures and restating them in a second table is how two
    // pages start disagreeing.
    quickAnswer:
      'Three checks cost nothing and cover most opener call-outs: mains power at the outlet, the photo-eye sensors near the floor, and the emergency release cord. Work through them in that order. If the door starts to close then reverses with the opener light flashing, it is the photo-eyes. If the motor runs but nothing moves, the release cord has been pulled. Beyond those, a diagnostic visit runs $75–$150 and is normally credited against the repair.',
    sections: [
      {
        h2: 'The three checks that cost nothing',
        body: [
          'Start with power, because a dead circuit presents exactly like a dead motor: no light, no hum, no response from either the wall button or the remote. Garage outlets frequently share a circuit with an exterior socket, so whatever tripped it may be outside and nothing to do with the door. Check the breaker and, if the outlet is a GFCI, its reset button.',
          'Second, look at the two photo-eye sensors mounted about six inches above the floor on either side of the opening. They are the most common cause of an opener that appears broken, and they are one of the few parts of the system a homeowner is actively meant to touch. Both should show a steady indicator light. A blinking light, or one that has gone dark, means the pair are no longer seeing each other.',
          'Third, find the emergency release cord — the red handle hanging from the rail — and check whether it has been pulled. If it has, the trolley is disconnected from the door and the motor will run perfectly while nothing happens. This is the most misdiagnosed fault on the list, and it is often pulled by accident by someone tall, or deliberately by someone who has since forgotten.',
        ],
      },
      {
        h2: 'The door starts to close, then stops and goes back up',
        body: [
          'This is the photo-eye fault and it has a signature: the door travels a few inches, changes its mind, returns to fully open, and the opener light flashes several times. That flashing is the opener telling you the safety beam is broken. It is a report, not a fault of its own.',
          'The causes are mundane. A cobweb across a lens. A leaf blown against a bracket. A bin or a bicycle wheel parked in the beam. A bracket knocked out of true by a car door. Overnight condensation fogging one lens. Wipe both lenses with a dry cloth and nudge one bracket until its indicator light is steady rather than blinking, then try the door again.',
          'If one sensor stays dark no matter how it is aimed, suspect the wiring rather than the sensor. Low-voltage wire stapled to a stud and later pierced during a garage tidy-up is a recurring cause. That is where the free checks end — sensor realignment or replacement runs $85–$200 fitted, and chasing a damaged run through a wall is not a homeowner job.',
        ],
      },
      {
        h2: 'The motor runs but the door does not move',
        diagram: 'trolley-cord',
        body: [
          'Two causes, easily told apart by watching the trolley — the carriage that travels along the rail. If the trolley is moving and the door is not, the emergency release has been pulled and the door is simply disconnected. Re-latching is usually a matter of pulling the cord back toward the door and running the opener until the carriage clicks in, though the exact method varies between makes.',
          'One caution that matters more than it sounds: only re-latch, or unlatch, with the door fully closed. Doing it part way open puts the entire weight of the door on whatever is holding it up, and if a spring has already failed, that is nothing at all. A door in that state comes down fast.',
          'If the trolley is not moving either, and the motor hums rather than turns, that is a failed capacitor or a stripped drive gear. Both run $120–$300 and both are genuine repairs rather than checks. The drive gear is worth knowing about: on chain-drive units it is a plastic part designed to be the one that fails, so a stripped gear usually means the motor is fine.',
        ],
      },
      {
        h2: 'The remote does nothing but the wall button works',
        diagram: 'rolling-code',
        body: [
          'This narrows the fault usefully. The wall button working proves the motor, the drive and the power supply are all fine, so the problem is the remote, its battery, or the receiver’s memory of it. Nothing expensive is implicated.',
          'Replace the battery first — it is the answer most of the time and costs almost nothing. If a fresh battery changes nothing, the remote needs reprogramming to the opener. Every manufacturer documents the sequence for its own units, and it is typically a learn button on the motor head followed by a press on the remote within thirty seconds.',
          'Modern openers use rolling-code encryption, which changes the transmitted code on every press so a recorded code cannot be replayed later. That is a real security benefit, but it also means a remote that has fallen out of sync needs re-pairing rather than repairing. If the remote is physically damaged, a replacement remote or keypad runs $40–$120.',
        ],
      },
      {
        h2: 'The door stops short, or touches down and bounces straight back up',
        body: [
          'Both symptoms usually point at settings rather than failures. The limit switches tell the opener where the floor and the fully-open position are; the force setting tells it how much resistance should count as an obstruction. Either can drift after a power cut, a service visit, or simply over years.',
          'A door that halts a foot short of closed, or that touches the floor and immediately reverses, is typically a limit set slightly wrong. Most openers expose the adjustment as two dials or buttons on the motor head, and professional adjustment runs $85–$175 if you would rather not.',
          'There is one version of this symptom that is not a settings problem and deserves attention: if the door has also become noticeably harder to lift by hand, the opener is reading genuine resistance and doing exactly what it should. That points at the springs or the rollers, not the opener. Test the balance before touching anything electronic — an unbalanced door will defeat any force setting you choose, and raising the force to compensate removes the protection that setting exists to provide.',
        ],
      },
      {
        h2: 'Where the free checks stop',
        body: [
          'The line is easy to state: anything you can see and reach from the floor is fair game. Anything involving the springs, the lift cables, or the inside of the motor head is not.',
          'The springs above the door hold enough stored energy to cause serious injury, and they stay loaded whether the door is open, closed or already broken. The logic board inside the opener is mains-connected. Neither is a reasonable place to learn, and neither failure is common enough to be worth the risk of finding out.',
          'A diagnostic visit runs $75–$150 and is normally credited against the repair if you go ahead, so calling someone once the free checks are exhausted often costs nothing extra. Where the state licenses the trade — California, Florida and Arizona license garage door work specifically — ask for the licence number and check it on the state register yourself. It takes about a minute.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why does my garage door open but not close?',
        a: 'Almost always the photo-eye sensors near the floor. An opener will raise a door with a broken safety beam but refuses to lower one, because that beam is the entrapment protection. Check both lenses for dirt and alignment — the indicator lights should be steady, not blinking.',
      },
      {
        q: 'My garage door opener motor runs but the door does not move. Why?',
        a: 'The emergency release cord has been pulled, disconnecting the trolley from the door. Re-latch it with the door fully closed, never part way open. If the trolley itself is not moving and the motor hums, it is usually a capacitor or a stripped drive gear at $120–$300.',
      },
      {
        q: 'Why does my garage door reverse before it touches the ground?',
        a: 'Either a blocked or misaligned photo-eye, or limit and force settings that have drifted. If the opener light flashes at the same time, start with the sensors. If the door has also become heavier to lift by hand, the springs are the real cause and the opener is behaving correctly.',
      },
      {
        q: 'My garage door remote stopped working but the wall button still works.',
        a: 'The motor and power supply are fine — the wall button proves it. Replace the remote battery, then reprogram the remote to the opener. Rolling-code openers change their code on every press, so a remote out of sync needs re-pairing rather than repair. A replacement remote runs $40–$120.',
      },
      {
        q: 'How much does it cost to fix a garage door opener that is not working?',
        a: 'Most opener repairs run $100–$300. Sensor work is $85–$200, a capacitor or drive gear $120–$300, a logic board $150–$400. Expect a $75–$150 diagnostic fee, usually credited against the repair.',
      },
      {
        q: 'Should I repair or replace an opener that keeps failing?',
        a: 'If the quoted repair exceeds half the installed price of a replacement and the unit is over ten years old, replace it. Any opener made before 1993 predates the federal photo-eye requirement and should be replaced rather than repaired, whatever has actually failed.',
      },
    ],
    related: ['garage-door-opener-repair-cost', 'garage-door-repair-cost', 'garage-door-maintenance'],
    glossary: ['photo-eye-sensor', 'limit-switch', 'emergency-release-cord', 'rolling-code'],
  },

  // ═══════════════════════════════════════════════════════════
  //  SPRINGS — explanatory only. See the comment before the body.
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'torsion-vs-extension-springs',
    pillar: false,
    parent: 'garage-door-repair-cost',
    heroDiagram: 'spring-types',
    title: 'Torsion vs Extension Garage Door Springs',
    h1: 'Torsion vs Extension Springs: What You Have and Why It Matters',
    description:
      'How to tell torsion and extension garage door springs apart, what each costs to replace, how each one fails, and why safety cables are not optional.',
    keyword: 'torsion vs extension springs',
    datePublished: '2026-08-27',
    dateModified: '2026-08-27',
    readTime: 7,
    // ⚠️ THIS PAGE DESCRIBES, IT DOES NOT INSTRUCT. Same rule as
    // why-diy-spring-repair-is-dangerous: no procedure, no tool list, no
    // sequence, no winding counts. The search intent behind "what are
    // extension springs" is comprehension — someone reading a quote or
    // identifying what broke — not a method. A partial instruction on a
    // loaded spring is more dangerous than none, and the last section says
    // so to the reader rather than only to whoever edits this file.
    // The cost rows are COPIED VERBATIM from garage-door-spring-replacement-cost.
    // Identical labels and identical ranges is the point: check-content.mjs
    // compares them, and a shared row cannot drift.
    quickAnswer:
      'Torsion springs sit on a steel shaft above the door and store energy by twisting. Extension springs run front-to-back alongside the horizontal tracks and store it by stretching. Torsion is what almost every door built in the last thirty years uses: it balances better, lasts longer and fails more predictably. Extension springs are cheaper — $120–$300 a pair against $250–$550 for a torsion pair — and must have safety cables threaded through them. Neither type is a homeowner replacement.',
    costTable: {
      caption: 'Spring replacement by type, typical installed cost 2026 (US national)',
      rows: [
        ['Extension springs, pair', '$120 – $300'],
        ['Torsion spring, one', '$180 – $350'],
        ['Torsion spring, pair', '$250 – $550'],
        ['High-cycle torsion pair (25,000 cycle)', '$300 – $630'],
      ],
    },
    sections: [
      {
        h2: 'How to tell which system you have, in ten seconds',
        body: [
          'Open the door fully and look up. A single steel shaft running horizontally across the wall directly above the opening, with one or two tightly wound springs threaded onto it, is a torsion system. Two long springs running front-to-back along the horizontal tracks instead, one each side, visibly stretching as the door closes, are extension springs.',
          'The two are unmistakable once you know what you are looking at, and the difference matters more than most homeowners expect. It changes the replacement price, it changes how the door fails, and it changes what a competent quote should include.',
          'A small number of doors — usually wide, heavy, or fitted where there is no headroom above the opening — use a jackshaft arrangement, with the torsion assembly mounted to one side of the door rather than centred above it. That is still a torsion system for pricing and safety purposes.',
        ],
      },
      {
        h2: 'What each one actually does',
        body: [
          'Both types do the same job: counterbalance the weight of the door so that the opener, or your arm, only has to overcome friction rather than lift 150 to 300 pounds of steel. A garage door opener is not built to lift a door. It is built to move a door that is already balanced.',
          'A torsion spring stores that energy in twist. It is wound onto a shaft that spans the opening, and as the door lowers the spring winds tighter; as the door rises it unwinds and gives the energy back. Because that one shaft drives both lift cables from a drum at each end, the pull on the two sides is mechanically linked and therefore even. This is why torsion doors track straighter, sit level, and are generally quieter.',
          'An extension spring stores energy in stretch. Each is anchored at the rear of a horizontal track and pulls through a pulley as the door closes. Crucially, the two sides are independent — nothing forces them to pull equally. That single fact explains most of the differences that follow, including why a door on extension springs is more prone to drifting out of level as the two age at slightly different rates.',
        ],
      },
      {
        h2: 'How each one fails, and why that difference is the important one',
        body: [
          'A torsion spring fails by snapping, usually with a bang loud enough to hear from inside the house, and the broken coil stays on the shaft where it was. The door then becomes extremely heavy, and an opener asked to lift it will try — which is how one failure becomes two. It is an alarming failure, but a contained one.',
          'An extension spring under tension is a stretched steel line with nothing restraining it along its length. When one breaks, it can whip. This is precisely what safety cables exist to prevent: a steel cable threaded through the middle of each extension spring so that a failed spring is captured rather than released across the garage. If your door has extension springs with no cable running through them, that is the cheapest safety improvement available to you, any technician can add them, and it should be on the next invoice regardless of what else is being done.',
          'Both failure modes leave the door in the same condition — unbalanced and unsafe to operate. In both cases the response is the same: leave the door closed and stop using the opener until someone has looked at it.',
        ],
      },
      {
        h2: 'Cycle life is the number that decides the real cost',
        diagram: 'spring-life',
        body: [
          'Springs of both types are rated in cycles, where one cycle is a single open and close. A standard spring is rated at 10,000 cycles, which on a door used four times a day works out at roughly seven years. Use the door eight times a day and the identical spring becomes a three-and-a-half year part. The rating is a count, not a promise in years, and this is the single most misread number in the trade.',
          'High-cycle torsion springs rated at 25,000 cycles or more use thicker wire on a larger diameter and add roughly $40–$80 to a fitted pair. On a door that serves as the household’s main entrance, that is the best-value upgrade available here: two to three times the service life for well under a third more money. Ask for the rating in writing, because a 10,000 and a 25,000-cycle spring are indistinguishable to a homeowner once they are mounted.',
          'Extension springs are cheaper to buy and cheaper to fit, at $120–$300 the pair against $250–$550 for a torsion pair. That gap is the main reason extension systems persist on older single doors. It narrows considerably once you count call-outs rather than parts: shorter service life and independent, uneven wear mean more visits across the same span of years.',
        ],
      },
      {
        h2: 'Can you convert extension springs to torsion?',
        diagram: 'winding-cone',
        body: [
          'Yes, and it is a common upgrade on older single doors. A conversion means fitting a torsion shaft, drums, new lift cables and the springs themselves, plus a mounting plate above the opening. Expect it to price above a straight torsion pair replacement, because of the extra hardware and the extra time.',
          'It is worth considering when the door is heavy enough that even, linked pull genuinely matters, when the existing extension springs have no safety cables and the pulleys are worn anyway, or when you are already replacing cables and rollers so much of the labour is shared. It is not worth doing for its own sake on a light, lightly used single door whose hardware is sound.',
          'Headroom is the constraint that usually decides it. A standard torsion assembly needs roughly twelve inches of clear space above the opening. Low-headroom kits exist and cost more, and this is a measurement a technician should take before quoting rather than a question you can settle from the ground.',
        ],
      },
      {
        h2: 'Why this page describes and does not instruct',
        body: [
          'Everything above exists so you can identify what you have, read a quote, and ask a question that gets a straight answer. None of it is a procedure, and that is deliberate rather than an oversight.',
          'A wound torsion spring on a double door holds roughly 200–300 pounds of stored force, released through winding bars in a controlled sequence. An extension spring at rest in a closed door is a loaded line. Both stay loaded after a failure, and on a two-spring door the survivor is still fully wound after the first has gone. Against that, the labour saved by doing it yourself is around $100–$250. The injuries are routinely fractures of the hand and forearm.',
          'The genuinely useful homeowner skill here is detection, not replacement. Twice a year, with the door closed, pull the release cord, lift the door by hand to waist height and let go. A balanced door stays where you put it. One that slides down or drifts up has a spring losing its rating — and that is the moment to call someone, not the moment to buy tools.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How do I know if I have torsion or extension springs?',
        a: 'Look above the door. A single horizontal steel shaft above the opening with springs wound around it is torsion. Two long springs running front-to-back along the horizontal tracks, one on each side, that visibly stretch as the door closes, are extension springs.',
      },
      {
        q: 'Are extension springs dangerous?',
        a: 'A stretched extension spring can whip when it breaks, because nothing restrains it along its length. Safety cables threaded through each spring capture a failed one. If your extension springs have no cables through them, have them added — they cost very little and any technician can fit them.',
      },
      {
        q: 'Which lasts longer, torsion or extension springs?',
        a: 'Torsion, in practice. Both are rated in cycles and a standard rating is 10,000, but torsion springs are mechanically linked through one shaft so they wear evenly, while independent extension springs age at slightly different rates and pull the door out of level as they do.',
      },
      {
        q: 'Why do torsion springs cost more than extension springs?',
        a: 'Heavier materials and more involved fitting. An extension pair runs $120–$300 installed against $250–$550 for a torsion pair. Torsion buys better balance, quieter operation and a more contained failure, which is why nearly every door built in the last thirty years uses it.',
      },
      {
        q: 'Can I replace extension springs myself since they are not wound?',
        a: 'No. An extension spring in a closed door is under full tension and stores energy in stretch rather than twist — different mechanism, same hazard. It is also anchored to a pulley and cable system that has to be reassembled correctly for the door to stay level.',
      },
      {
        q: 'Should both springs be replaced at the same time?',
        a: 'Yes, for either type. Both were fitted on the same day and have done the same number of cycles, so when one goes the other is usually close behind. Replacing the pair costs far less than paying a second call-out within the year.',
      },
    ],
    related: ['garage-door-spring-replacement-cost', 'why-diy-spring-repair-is-dangerous', 'garage-door-repair-cost'],
    glossary: ['torsion-spring', 'extension-spring', 'cycle-rating', 'winding-bar', 'lift-cable', 'door-balance'],
  },

  // ═══════════════════════════════════════════════════════════
  //  PILLAR 2 — maintenance
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'garage-door-maintenance',
    pillar: true,
    heroDiagram: 'balance-test',
    title: 'Garage Door Maintenance: What and When',
    h1: 'Garage Door Maintenance: What to Do, and How Often',
    description:
      'Garage door maintenance is four jobs and twenty minutes a year. What to lubricate, what to leave dry, what to test monthly, and what to pay someone for.',
    keyword: 'garage door maintenance',
    datePublished: '2026-08-27',
    dateModified: '2026-08-27',
    readTime: 8,
    quickAnswer:
      'Garage door maintenance is four jobs and about twenty minutes a year. Test the balance twice a year. Lubricate hinges, rollers and the spring coil twice a year with a garage-door lubricant. Check the photo-eyes and the auto-reverse monthly. Keep the tracks clean — tracks are wiped, never greased. Everything past that involves stored spring tension and belongs to a technician. A professional tune-up runs $75–$150.',
    costTable: {
      caption: 'Maintenance jobs and common wear parts, installed cost 2026',
      rows: [
        ['Garage-door lubricant, per can', '$8 – $15'],
        ['Bottom seal or weatherstrip replacement', '$50 – $150'],
        ['Professional tune-up visit', '$75 – $150'],
        ['Roller replacement (set)', '$100 – $200'],
        ['Track realignment or repair', '$125 – $300'],
        ['Lift cable replacement (pair)', '$130 – $250'],
      ],
    },
    sections: [
      {
        h2: 'The balance test, which predicts almost everything else',
        body: [
          'Twice a year, with the door fully closed, pull the emergency release cord to disconnect the opener. Lift the door by hand to about waist height and let go. A correctly balanced door stays exactly where you left it. If it slides down, or pulls itself upward, the springs are no longer carrying the door’s weight properly.',
          'This one test tells you more than any other thing you can do. An unbalanced door transfers its weight onto the opener — a $300–$700 unit designed to overcome friction, not to lift a door — so a spring problem left alone reliably becomes an opener problem within months. It is also the earliest warning you will get that a spring is reaching the end of its cycle rating, well before it snaps.',
          'While the door is disconnected, move it through its full travel by hand. It should run smoothly, without grinding, catching, or needing a shove at one particular point. A door that binds in one spot has a track, roller or hinge problem, and finding that while the door still works is far cheaper than finding it when the door jams half open.',
        ],
      },
      {
        h2: 'Lubrication: what to use, and what to leave dry',
        body: [
          'Twice a year, apply a garage-door-specific lubricant to the hinges, the roller stems and bearings, the torsion spring coil, and the end bearing plates. A lithium or silicone-based product sold for the purpose is what you want. The whole job takes about ten minutes and it is the single maintenance task that most extends the life of the moving parts.',
          'Do not use WD-40 as the lubricant. It is a solvent and water displacer, not a lubricant — it will free a seized part beautifully and then leave it dry, which is worse than where you started. It has a legitimate place in cleaning a gummed-up roller, but something has to go on afterwards.',
          'And do not grease the tracks. This is the mistake that sounds most like maintenance and does the most quiet harm. The tracks are a guide surface, not a bearing surface: the rollers are meant to roll along them, not slide through grease. Grease in a track collects grit and becomes a lapping compound that grinds the rollers away. Wipe the tracks out with a dry cloth. That is the entire job.',
        ],
      },
      {
        h2: 'The monthly two-minute safety check',
        body: [
          'Once a month, two tests take about a minute each. First, the photo-eyes: with the door closing, wave a broom handle through the beam near the floor. The door should stop and reverse immediately. Then confirm both lenses are clean and both indicator lights are steady rather than blinking.',
          'Second, the auto-reverse on contact. Lay a flat length of timber, or a roll of kitchen towel, on the floor in the door’s path and close the door onto it. The door should touch, sense the resistance and reverse. If it presses down and keeps pressing, the force setting is too high — and raising force to solve a closing problem is exactly how this protection gets defeated.',
          'Both of these are entrapment protections, and both have been federally required on openers made from 1993 onward. If your opener predates that and has no photo-eyes at all, it should be replaced rather than maintained, no matter how well the motor still runs.',
        ],
      },
      {
        h2: 'What wears out, and roughly when',
        diagram: 'spring-life',
        body: [
          'Springs are the shortest-lived major component. A standard 10,000-cycle spring lasts roughly seven years at four openings a day and about half that at eight. Lift cables are steel under constant load and tend to reach the end of their life at a similar age, which is why they are usually replaced alongside springs — the labour overlaps almost entirely, and a cable pair costs $130–$250 on its own visit.',
          'Rollers are the cheapest wear part and the one that most changes how a door sounds. Steel rollers with exposed bearings are noisy when new and get worse; nylon rollers are quieter and last longer. A set runs $100–$200 fitted, and having them done at the same visit as springs saves a separate call-out.',
          'Hinges, brackets and the bottom fixture last a long time if they are lubricated, and they are the parts most likely to be quietly bent rather than obviously broken. Once a year, look for elongated screw holes and hairline cracks around the hinge knuckles, particularly the centre hinges on a double-width door where the load is highest.',
        ],
      },
      {
        h2: 'Seals, rust and the bottom of the door',
        diagram: 'door-layers',
        body: [
          'The bottom seal fails soonest and matters most day to day. It keeps out water, leaves, draughts and rodents, and it perishes from ultraviolet light and repeated compression. Replacement runs $50–$150, and it is one of the few wear parts a capable homeowner can genuinely change, because it slides into a retainer with no stored energy involved anywhere in the job.',
          'Check the perimeter weatherstripping on the jambs and header at the same time. On an insulated door with a decent R-value, a gap around the frame gives back a good part of what the insulation is doing — this is usually the cheapest energy fix available on the whole building envelope.',
          'Rust is the slow one, and the one people notice too late. Look at the bottom two feet of a steel door, the bottom fixture, and anywhere water sits after rain. Touching up a chip before it spreads is a five-minute job. A rusted-through bottom section is a panel replacement at $250–$800, on the most visible elevation of most houses.',
        ],
      },
      {
        h2: 'What a paid tune-up should actually include',
        body: [
          'A professional tune-up runs $75–$150 and should cover: a balance check with the opener disconnected, spring tension adjustment, lubrication of every moving part, tightening of track fixings and hinge fasteners, roller inspection, cable inspection along their whole length, photo-eye alignment, and force and limit checks on the opener.',
          'Ask what the visit includes before booking, and be a little wary of a tune-up priced well below that range. A heavily discounted service call has to recover its margin somewhere, and it usually does so in whatever the visit discovers. That is not automatically dishonest — but it is worth knowing which of the two things you have bought.',
          'On frequency, the honest answer is that annually is plenty for a normally used residential door. Twice a year is right for a door that serves as the main entrance to the house, or one on a coastal, dusty or very cold site. A door opened twice a week does not need what a door opened eight times a day needs, and paying for the same schedule regardless is how maintenance stops being good value.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How often should a garage door be serviced?',
        a: 'Annually for a normally used residential door, and twice a year if it is the main entrance to the house or sits on a coastal, dusty or very cold site. The balance test and lubrication are twice-yearly jobs either way; the photo-eye and auto-reverse checks are monthly.',
      },
      {
        q: 'What lubricant should I use on a garage door?',
        a: 'A garage-door-specific lithium or silicone lubricant, on hinges, roller stems and bearings, the spring coil and the end bearing plates. Not WD-40 — that is a solvent and water displacer, so it frees a seized part and then leaves it dry.',
      },
      {
        q: 'Should I grease the garage door tracks?',
        a: 'No. Tracks are a guide surface, not a bearing surface — the rollers roll along them rather than sliding. Grease collects grit and turns into a lapping compound that wears the rollers out. Wipe the tracks with a dry cloth instead.',
      },
      {
        q: 'How do I test if my garage door is balanced?',
        a: 'With the door closed, pull the emergency release cord, lift the door by hand to waist height and let go. A balanced door stays put. If it slides down or drifts up, the springs need attention from a technician — that is not a homeowner adjustment.',
      },
      {
        q: 'How much does a garage door tune-up cost?',
        a: 'A professional tune-up runs $75–$150 and should include a balance check, spring tension adjustment, full lubrication, fixing and fastener tightening, roller and cable inspection, photo-eye alignment, and opener force and limit checks.',
      },
      {
        q: 'What garage door maintenance can I safely do myself?',
        a: 'Lubrication, wiping the tracks, cleaning and aligning the photo-eyes, replacing remote batteries, testing the balance, testing the auto-reverse, and replacing the bottom seal. Anything involving springs, lift cables or the inside of the opener is not homeowner work.',
      },
    ],
    related: ['garage-door-repair-cost', 'why-diy-spring-repair-is-dangerous', 'garage-door-opener-wont-work'],
    glossary: ['door-balance', 'cycle-rating', 'roller', 'track', 'weatherstrip', 'photo-eye-sensor'],
  },
];

// ── Lookups ─────────────────────────────────────────────────
export function getGuide(slug) {
  return guides.find((g) => g.slug === slug);
}

export function getPillars() {
  return guides.filter((g) => g.pillar);
}

export function getClusters(pillarSlug) {
  return guides.filter((g) => g.parent === pillarSlug);
}

// Word count of the article body only. Measuring a whole rendered page
// includes the shared nav and footer, which makes every page look similar
// to every other page and makes the number useless — the same mistake that
// produced a meaningless ~17% overlap reading on AirProHQ.
export function bodyWordCount(g) {
  const parts = [
    g.h1, g.quickAnswer,
    ...(g.sections || []).flatMap((s) => [s.h2, ...s.body]),
    ...(g.faqs || []).flatMap((f) => [f.q, f.a]),
    ...(g.costTable?.rows || []).flat(),
  ];
  return parts.filter(Boolean).join(' ').split(/\s+/).length;
}

// ─────────────────────────────────────────────────────────────
//  PLANNED — written but not yet published, or not yet written.
//
//  These get NO route and NO sitemap entry. A stub page would be a thin
//  page, and thin pages are the most likely drag on indexing for a new
//  domain. They are listed here so the keyword column stays visible: the
//  next guide written must not target one of these, and none of these may
//  target a keyword already claimed in `guides` above.
//
//  ⚠️ Two entries in BUILD-PLAN.md were merged or renamed here because as
//  planned they competed with each other for one keyword:
//    · /guides/garage-door-installation/ + /guides/garage-door-installation-cost/
//      → kept as one cost pillar plus a separate *process* guide
//        ("what to expect on installation day"), which is a different
//        query and a different intent.
//    · /guides/garage-door-openers/ + /guides/best-garage-door-opener-types/
//      → kept as one buyer's guide. Two pages both answering "which opener
//        should I buy" is the cannibalisation CLAUDE.md warns about.
// ─────────────────────────────────────────────────────────────
export const PLANNED = [
  { slug: 'garage-door-installation-cost', keyword: 'garage door installation cost', pillar: true, batch: 2 },
  { slug: 'garage-door-installation-what-to-expect', keyword: 'garage door installation process', parent: 'garage-door-installation-cost', batch: 3 },
  { slug: 'garage-door-sizes-guide', keyword: 'standard garage door sizes', parent: 'garage-door-installation-cost', batch: 3 },
  { slug: 'insulated-vs-non-insulated-garage-doors', keyword: 'insulated vs non insulated garage door', parent: 'garage-door-installation-cost', batch: 3 },
  { slug: 'garage-door-openers', keyword: 'best garage door opener', pillar: true, batch: 2 },
  { slug: 'smart-garage-door-openers', keyword: 'smart garage door opener', parent: 'garage-door-openers', batch: 3 },
  { slug: 'garage-door-materials-types', keyword: 'garage door materials', pillar: true, batch: 3 },
  { slug: 'steel-vs-wood-garage-doors', keyword: 'steel vs wood garage door', parent: 'garage-door-materials-types', batch: 3 },
  { slug: 'vinyl-vs-aluminum-garage-doors', keyword: 'vinyl vs aluminum garage door', parent: 'garage-door-materials-types', batch: 3 },
  { slug: 'garage-door-springs', keyword: 'garage door springs', pillar: true, batch: 3 },
  { slug: 'garage-door-spring-lifespan', keyword: 'how long do garage door springs last', parent: 'garage-door-springs', batch: 3 },
  { slug: 'garage-door-maintenance-checklist', keyword: 'garage door maintenance checklist', parent: 'garage-door-maintenance', batch: 3 },
  { slug: 'garage-door-wont-open-troubleshooting', keyword: 'garage door wont open', parent: 'garage-door-maintenance', batch: 3 },
  { slug: 'garage-door-off-track-repair-cost', keyword: 'garage door off track repair cost', parent: 'garage-door-repair-cost', batch: 2 },
  { slug: 'garage-door-panel-replacement-cost', keyword: 'garage door panel replacement cost', parent: 'garage-door-repair-cost', batch: 2 },
];
