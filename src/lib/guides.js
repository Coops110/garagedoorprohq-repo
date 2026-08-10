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
    related: ['garage-door-spring-replacement-cost', 'garage-door-opener-repair-cost', 'why-diy-spring-repair-is-dangerous', 'hiring-a-garage-door-company'],
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
    related: ['garage-door-repair-cost', 'why-diy-spring-repair-is-dangerous', 'garage-door-opener-repair-cost'],
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
        body: [
          'Chain drives are the cheapest at $300–$550 installed and the loudest. On a detached garage, the noise is irrelevant and the saving is real.',
          'Belt drives run $400–$700 installed and are markedly quieter, which is the whole argument if there is a bedroom above or beside the garage. Direct-drive and wall-mount jackshaft units sit at or above the top of that range; a jackshaft mounts beside the door rather than on the ceiling, which is the answer for a garage with a low ceiling or overhead storage.',
          'All current openers include rolling-code remotes and Wi-Fi is now near-standard rather than a premium feature. Battery backup is worth specifying deliberately: without it, a power cut means lifting a heavy door by hand, and in some states it is now a code requirement on new residential installs.',
        ],
      },
      {
        h2: 'One thing to check before blaming the opener',
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
    related: ['garage-door-repair-cost', 'garage-door-spring-replacement-cost', 'hiring-a-garage-door-company'],
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
    related: ['garage-door-repair-cost', 'garage-door-spring-replacement-cost'],
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
  { slug: 'garage-door-opener-wont-work', keyword: 'garage door opener not working', parent: 'garage-door-openers', batch: 3 },
  { slug: 'smart-garage-door-openers', keyword: 'smart garage door opener', parent: 'garage-door-openers', batch: 3 },
  { slug: 'garage-door-materials-types', keyword: 'garage door materials', pillar: true, batch: 3 },
  { slug: 'steel-vs-wood-garage-doors', keyword: 'steel vs wood garage door', parent: 'garage-door-materials-types', batch: 3 },
  { slug: 'vinyl-vs-aluminum-garage-doors', keyword: 'vinyl vs aluminum garage door', parent: 'garage-door-materials-types', batch: 3 },
  { slug: 'garage-door-springs', keyword: 'garage door springs', pillar: true, batch: 3 },
  { slug: 'torsion-vs-extension-springs', keyword: 'torsion vs extension springs', parent: 'garage-door-springs', batch: 3 },
  { slug: 'garage-door-spring-lifespan', keyword: 'how long do garage door springs last', parent: 'garage-door-springs', batch: 3 },
  { slug: 'garage-door-maintenance', keyword: 'garage door maintenance', pillar: true, batch: 3 },
  { slug: 'garage-door-maintenance-checklist', keyword: 'garage door maintenance checklist', parent: 'garage-door-maintenance', batch: 3 },
  { slug: 'garage-door-wont-open-troubleshooting', keyword: 'garage door wont open', parent: 'garage-door-maintenance', batch: 3 },
  { slug: 'garage-door-off-track-repair-cost', keyword: 'garage door off track repair cost', parent: 'garage-door-repair-cost', batch: 2 },
  { slug: 'garage-door-panel-replacement-cost', keyword: 'garage door panel replacement cost', parent: 'garage-door-repair-cost', batch: 2 },
];
