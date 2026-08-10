// ─────────────────────────────────────────────────────────────
//  GLOSSARY — DefinedTermSet / DefinedTerm.
//
//  Each term is a real page, not a tooltip: they answer literal
//  "what is a ..." queries, and they give the guides somewhere concrete to
//  link a piece of jargon instead of re-explaining it every time.
//
//  `short` is the one-sentence definition that goes into the DefinedTerm
//  schema, so it must stand alone without the body around it.
//  `also` must be reciprocal, same rule as guide `related` —
//  scripts/check-content.mjs fails the build otherwise.
// ─────────────────────────────────────────────────────────────

export const glossary = [
  {
    slug: 'torsion-spring',
    title: 'What Is a Torsion Spring?',
    term: 'Torsion spring',
    short:
      'A wound steel spring mounted on a shaft above the garage door opening that counterbalances the door’s weight as it opens and closes.',
    body: [
      'A torsion spring sits on a horizontal steel shaft above the door and stores energy by twisting rather than stretching. As the door closes the spring winds tighter; as it opens the spring unwinds and lifts most of the door’s weight, which is why an opener motor of well under one horsepower can move a 300-pound double door.',
      'Torsion systems replaced extension springs on most residential doors because they balance the door more evenly, last longer, and fail less violently. A single door usually has one spring; a double usually has two.',
      'A wound torsion spring holds its stored energy whether the door is open, closed or already broken, which is why replacement is not homeowner work.',
      'On a quote, a torsion spring line should name three things: how many springs, the cycle rating, and whether the lift cables are being replaced at the same time. If any of the three is missing, ask. The difference between a standard and a high-cycle spring is invisible once fitted and is the most common way to be overcharged in this trade. A technician should also test the door balance before leaving, because a spring wound to the wrong tension puts the load straight onto the opener you will otherwise be replacing next.',
    ],
    also: ['extension-spring', 'cycle-rating', 'winding-bar', 'door-balance', 'lift-cable'],
    guides: ['garage-door-spring-replacement-cost', 'why-diy-spring-repair-is-dangerous'],
  },
  {
    slug: 'extension-spring',
    title: 'What Is an Extension Spring?',
    term: 'Extension spring',
    short:
      'A long spring mounted parallel to each horizontal track that stretches as the garage door closes, used mainly on older and lighter doors.',
    body: [
      'Extension springs run alongside the horizontal tracks on both sides of the door and work by stretching. They are simpler and cheaper than torsion springs and are still found on many older single-width doors.',
      'The drawback is the failure mode: an extension spring under tension that snaps can travel across the garage. Safety cables threaded through the centre of each spring contain it if it breaks, and any extension spring without one should have one added — the part costs very little.',
      'Replacing a pair of extension springs costs less than a torsion pair, but extension systems balance the door less evenly and tend to need more frequent adjustment.',
      'If your door has extension springs, the most valuable thing you can ask for is safety cables: a length of cable threaded through the centre of each spring and anchored at both ends. They cost very little, they are often absent on older installations, and they are what stops a snapping spring crossing the garage. Many technicians will fit them as part of a spring replacement if asked, and it is worth asking explicitly rather than assuming.',
    ],
    also: ['torsion-spring', 'lift-cable', 'cycle-rating'],
    guides: ['garage-door-spring-replacement-cost'],
  },
  {
    slug: 'cycle-rating',
    title: 'Garage Door Spring Cycle Rating Explained',
    term: 'Cycle rating',
    short:
      'The number of full open-and-close cycles a garage door spring is engineered to survive — 10,000 on a standard spring, 25,000 or more on a high-cycle spring.',
    body: [
      'One cycle is one complete open and one complete close. A standard residential spring is rated at 10,000 cycles, which sounds enormous until you divide it by real use: four openings a day is roughly seven years, eight a day is closer to three and a half.',
      'High-cycle springs use thicker wire on a larger diameter to reach 25,000 cycles or more, and add roughly $40–$80 to a fitted pair. On a door used heavily — a household where the garage is the main entrance — that is the clearest value upgrade available.',
      'Cycle rating is impossible to identify by eye once a spring is fitted, so it should be specified in writing on the quote. A standard spring supplied at a high-cycle price is the most common overcharge in the trade.',
      'To work out what a rating means for your door, count how many times it opens on a normal day and multiply by 730 for a year. Two cars leaving and returning is four cycles, plus a bin run and a bike, so eight a day is realistic rather than pessimistic. At eight a day a 10,000-cycle spring is a three-and-a-half year part, not a ten-year one. That arithmetic is usually what settles the high-cycle decision, and it is worth doing before the technician arrives rather than on the doorstep.',
    ],
    also: ['torsion-spring', 'extension-spring'],
    guides: ['garage-door-spring-replacement-cost', 'garage-door-repair-cost', 'hiring-a-garage-door-company'],
  },
  {
    slug: 'photo-eye-sensor',
    title: 'What Is a Photo-Eye Sensor?',
    term: 'Photo-eye sensor',
    short:
      'A pair of infrared safety sensors mounted near the floor on both sides of the garage door opening that reverse a closing door if the beam is broken.',
    body: [
      'The two sensors sit about six inches off the floor facing each other across the opening. One transmits an infrared beam, the other receives it. If anything interrupts the beam while the door is closing, the opener reverses.',
      'Federal law has required entrapment protection on residential garage door openers sold in the United States since 1993, which is why an opener made before then should be replaced rather than repaired.',
      'Misaligned or dirty photo-eyes are one of the most common reasons a door closes a few inches and then reverses, often with the opener light flashing. Cleaning both lenses and nudging one until its indicator light is steady is safe homeowner maintenance.',
      'Two checks are worth doing yourself before booking anyone. First, look at the small indicator light on each sensor: both should be lit and steady, not flickering or off. Second, wipe both lenses with a dry cloth, since a spider web or a film of dust is enough to break the beam. If a light is off or flickering the bracket has usually been knocked, and gently twisting the housing until the light steadies fixes it. If neither light comes on at all, the wiring or the opener board is the problem and that is not homeowner work.',
    ],
    also: ['limit-switch', 'jackshaft-opener'],
    guides: ['garage-door-opener-repair-cost', 'garage-door-repair-cost'],
  },
  {
    slug: 'lift-cable',
    title: 'What Is a Garage Door Lift Cable?',
    term: 'Lift cable',
    short:
      'A steel cable running from the bottom bracket of the garage door to the spring shaft, transferring the spring’s force to the door.',
    body: [
      'One cable runs up each side of the door, attached at the bottom bracket and wound onto a drum on the torsion shaft. The springs turn the shaft, the drums wind the cables, and the cables lift the door.',
      'Cables fray from the inside out where they wind onto the drum, so a cable can be close to failure while looking sound from the ground. They wear in step with the springs, which is why replacing both at once is usually cheaper than two separate visits.',
      'A snapped cable lets one side of the door drop and typically pulls it off the track. The bottom bracket a cable attaches to is under full spring tension and must never be unbolted by a homeowner.',
      'Cables are worth inspecting from the ground twice a year and it takes seconds. With the door closed, look at the bottom two feet of cable on each side for kinks, rust or loose strands standing away from the bundle. Any of those means it should be replaced now rather than after it lets go. If one cable has already snapped, do not run the opener: the door is being lifted unevenly, and that is how a bent track and a jammed door get added to the bill.',
    ],
    also: ['torsion-spring', 'extension-spring', 'roller', 'track'],
    guides: ['garage-door-repair-cost', 'garage-door-spring-replacement-cost', 'why-diy-spring-repair-is-dangerous'],
  },
  {
    slug: 'door-balance',
    title: 'Garage Door Balance: What It Means',
    term: 'Door balance',
    short:
      'How well a garage door’s springs offset its weight — a balanced door stays put when stopped halfway with the opener disconnected.',
    body: [
      'Balance is the test that tells you whether the springs are doing their job. Pull the emergency release cord to disconnect the opener, lift the door by hand to about waist height, and let go. A balanced door stays where you left it and can be moved with modest effort.',
      'A door that slides shut has too little spring tension; one that pulls upward has too much. Either way the opener is now carrying load it was never designed to carry, and openers fail early because of it.',
      'Checking balance twice a year takes under a minute and is the cheapest diagnostic available to a homeowner. Correcting it is spring work, and that is not.',
      'Do this test twice a year and note what you find, because balance drifts gradually and a slow change is hard to notice day to day. If the door needs noticeably more effort than it did last time, the springs are losing tension well before they snap, which is useful warning. It also settles the most common argument in this trade: an opener that strains, stalls or reverses is usually a spring problem wearing out the opener, not an opener fault, and replacing the motor without correcting the balance just puts a new one under the same overload.',
    ],
    also: ['torsion-spring', 'emergency-release-cord', 'winding-bar', 'jackshaft-opener', 'r-value'],
    guides: ['garage-door-opener-repair-cost', 'garage-door-spring-replacement-cost', 'why-diy-spring-repair-is-dangerous', 'hiring-a-garage-door-company'],
  },
  {
    slug: 'winding-bar',
    title: 'What Is a Winding Bar?',
    term: 'Winding bar',
    short:
      'A solid steel rod sized to fit a torsion spring’s winding cone, used to tension or release the spring in a controlled sequence.',
    body: [
      'Winding bars are inserted into holes in the winding cone at the end of a torsion spring and turned to add or release tension. They must match the cone’s hole diameter and be long enough to give leverage while keeping the operator’s hands clear.',
      'Substituting a screwdriver or a bolt is the single most common cause of serious garage door injury. An undersized bar can slip out of the cone under load, at which point the spring unwinds against whatever is in the way.',
      'The presence of winding bars in a technician’s hands is a reasonable sign they do this properly. Their absence is a reason to ask what they intend to use.',
      'This is worth knowing as a homeowner for one reason: it lets you tell a properly equipped technician from an improvised one. Correct bars are plain solid steel rods, sized to the cone and usually 18 inches or longer, and anyone who does spring work carries a matched pair. If someone reaches for a screwdriver, a length of rebar or a bolt instead, that is the moment to stop the job. Not because the tool looks cheap, but because an undersized bar is the specific failure that causes the injuries.',
    ],
    also: ['torsion-spring', 'door-balance'],
    guides: ['why-diy-spring-repair-is-dangerous'],
  },
  {
    slug: 'jackshaft-opener',
    title: 'What Is a Jackshaft Opener?',
    term: 'Jackshaft opener',
    short:
      'A wall-mounted garage door opener that drives the torsion shaft directly from the side of the opening instead of pulling the door along a ceiling rail.',
    body: [
      'A jackshaft opener mounts on the wall beside the door and turns the torsion shaft, so it needs no ceiling rail or trolley at all. That frees the whole ceiling for storage or a car lift, and suits garages with low headroom or a sloped roof.',
      'They cost more than a comparable chain or belt drive and generally include battery backup as standard. Because they act on the torsion shaft, they depend on correct spring balance more than a rail opener does.',
      'A jackshaft is not a fix for an unbalanced door. If the springs are wrong, a jackshaft will wear out just as a rail opener would.',
      'A jackshaft is worth pricing specifically if any of three things is true: the garage ceiling is too low for a rail, you want the ceiling clear for storage or a car lift, or the roof is sloped or vaulted in a way a standard rail cannot follow. It costs more than a comparable belt drive and usually includes battery backup, which is increasingly a code requirement on new residential installs. It is not a fix for a noisy or straining door: if the springs are wrong, a jackshaft wears out the same way a rail opener would.',
    ],
    also: ['photo-eye-sensor', 'rolling-code', 'door-balance'],
    guides: ['garage-door-opener-repair-cost'],
  },
  {
    slug: 'limit-switch',
    title: 'Garage Door Limit Switch Explained',
    term: 'Limit switch',
    short:
      'The setting that tells a garage door opener where the door’s fully open and fully closed positions are.',
    body: [
      'Limit switches define travel. If the close limit is set too far, the door presses into the floor, the opener senses resistance and reverses — a fault frequently mistaken for a sensor problem. If it is set too short, the door stops with a gap at the bottom.',
      'Older openers use mechanical screw-adjusted limits; newer ones learn the positions during a set-up routine and store them electronically.',
      'Limit adjustment is straightforward for a technician and typically costs less than any parts-based repair, which is why it is worth ruling out before agreeing to replace anything.',
      'Two symptoms point at limits rather than anything expensive. If the door touches the floor and then reverses back up, the close limit is set too far and the opener is reading the floor as an obstruction. If it stops with a visible gap at the bottom, the close limit is short. Either way it is adjustment work, priced well below any parts-based repair, so it is worth naming as a possibility when you describe the fault on the phone rather than accepting a quote for a new board.',
    ],
    also: ['photo-eye-sensor', 'emergency-release-cord'],
    guides: ['garage-door-opener-repair-cost'],
  },
  {
    slug: 'rolling-code',
    title: 'What Is Rolling Code Security?',
    term: 'Rolling code',
    short:
      'A remote-control security system that changes the transmitted code after every use so a captured signal cannot be replayed.',
    body: [
      'Early garage door remotes sent one fixed code, which could be captured and replayed by anyone with a scanner, or matched by a code grabber cycling through combinations. Rolling code — also sold under manufacturer names such as Security+ — changes the code every time the button is pressed.',
      'All current openers use rolling code. If an opener is old enough to use a fixed code and a bank of DIP switches inside the remote, that is a security reason to replace it in its own right.',
      'Rolling code is also why a remote sometimes needs re-pairing after a battery change or a power cut: the receiver and transmitter have to resynchronise.',
      'There is a practical test for whether an opener is old enough to be a security concern. Open the remote: if it contains a row of tiny sliding switches rather than just a battery and a board, it is a fixed-code unit from before rolling code became standard, and its code can be captured and replayed. That is a reason to replace the opener on its own merits, whether or not it still works. On a current unit, occasional re-pairing after a battery change or a power cut is normal rather than a fault, because the transmitter and receiver have simply fallen out of sync.',
    ],
    also: ['jackshaft-opener'],
    guides: ['garage-door-opener-repair-cost'],
  },
  {
    slug: 'roller',
    title: 'Garage Door Rollers Explained',
    term: 'Roller',
    short:
      'A small wheel on each side of every garage door section that runs inside the vertical and horizontal track.',
    body: [
      'Rollers carry the door along the track. Cheap steel rollers with exposed bearings are loud and seize; nylon rollers with sealed bearings are quieter and last longer, and are one of the few inexpensive upgrades that noticeably changes how a door sounds.',
      'A seized roller drags, which wears the track and can eventually pull the door off it. Replacing a full set costs $100–$200 and is often done alongside spring work while the door is already apart.',
      'The bottom roller bracket is under cable tension and is not a homeowner job, even though the rollers above it look identical.',
      'Rollers are the cheapest upgrade that changes how a garage door feels to live with. If the door is loud, grinding or jerky and the springs check out, worn rollers are usually the reason, and swapping steel for sealed nylon makes a startling difference, particularly with a bedroom over the garage. Look along the track with the door closed: a roller that has stopped turning wears flat on one side, and any that are visibly seized or wobbling on their stems should be replaced as a set rather than individually.',
    ],
    also: ['track', 'lift-cable'],
    guides: ['garage-door-repair-cost'],
  },
  {
    slug: 'track',
    title: 'Garage Door Tracks Explained',
    term: 'Track',
    short:
      'The steel channel on each side of the opening that guides the garage door’s rollers, turning from vertical to horizontal at the curve.',
    body: [
      'Each side has a vertical section beside the opening, a curved section, and a horizontal section running back into the garage on hangers. Alignment matters more than it looks: a track bent by a car bumper or knocked out of plumb makes the door bind, and binding is what eventually forces a roller out.',
      'Tracks are cleaned, never greased. Grease collects grit and turns the channel into an abrasive. Lubricant belongs on hinges, rollers and the spring, not in the track.',
      'A door off its track costs $150–$300 to reset, but resetting it without finding out why it came off buys the same call-out again.',
      'The most useful thing a homeowner can do about tracks is look at them. With the door closed, sight up each vertical track: it should be straight, snug against the door edge and firmly bolted to the jamb. Dents from a bumper, a gap that widens toward the top, or a loose bracket all make the door bind, and binding is what eventually forces a roller out of the channel. If a door has come off its track more than once, the cause is nearly always alignment rather than bad luck, and fixing the track is what stops the third call-out.',
    ],
    also: ['roller', 'lift-cable'],
    guides: ['garage-door-repair-cost'],
  },
  {
    slug: 'emergency-release-cord',
    title: 'The Garage Door Emergency Release Cord',
    term: 'Emergency release cord',
    short:
      'The red cord hanging from a garage door opener’s trolley that disconnects the door from the opener so it can be moved by hand.',
    body: [
      'Pulling the red cord releases the trolley from the opener carriage, leaving the door free to move manually. It is what you use during a power cut, and what you use to test door balance.',
      'Pull it only with the door fully closed unless the track is clamped. With the door open and the springs broken, releasing the trolley removes the only thing holding several hundred pounds of door up.',
      'Reconnecting is usually a matter of pulling the cord back toward the door, or running the opener until the carriage relatches — the method varies by manufacturer and is in the manual.',
      'Two rules make this safe. Pull it with the door fully closed unless the track is clamped, because with the door up and a spring broken the trolley is the only thing holding several hundred pounds. And if you need to get a car out from under a raised door, clamp locking pliers onto the track just below the bottom roller on both sides first so the door physically cannot travel, then release and move the car. It is also worth locating the cord before you need it: a power cut at night is a poor time to be looking for it.',
    ],
    also: ['door-balance', 'limit-switch'],
    guides: ['why-diy-spring-repair-is-dangerous'],
  },
  {
    slug: 'r-value',
    title: 'Garage Door R-Value Explained',
    term: 'R-value',
    short:
      'A measure of a garage door’s resistance to heat flow — the higher the number, the better the door insulates.',
    body: [
      'An uninsulated single-skin steel door has an R-value around 0 to 2. A polystyrene-insulated door reaches roughly R-6 to R-9, and a polyurethane-injected door reaches R-12 to R-18 or higher in the same thickness, because the foam is denser and bonds to both skins.',
      'R-value matters most where the garage is attached, heated, used as a workshop, or shares a wall or ceiling with a living space. On a detached, unheated garage it changes very little except door weight and rigidity.',
      'A higher R-value door is heavier, which means the springs must be sized for it. Fitting a heavier insulated door onto the old springs is a common shortcut that leaves the door out of balance from day one.',
      'R-value is worth paying for in three situations and largely wasted outside them: the garage is attached and shares a wall or ceiling with a room you heat, you use it as a workshop or gym, or it houses something that suffers in temperature swings. On a detached, unheated garage the practical gains are small. What does change in every case is weight, because an insulated door is significantly heavier than a single-skin one and the springs must be sized for the new door. Reusing the old springs on a heavier replacement is a common shortcut that leaves the door out of balance from the first day.',
    ],
    also: ['weatherstrip', 'door-balance'],
    guides: [],
  },
  {
    slug: 'weatherstrip',
    title: 'Garage Door Weatherstrip Explained',
    term: 'Weatherstrip',
    short:
      'The flexible seal along the bottom, sides and top of a garage door that closes the gap between door and opening.',
    body: [
      'The bottom seal — sometimes called an astragal — is a rubber or vinyl strip in a retainer along the base of the door. It compresses against the floor to keep out water, draughts, leaves and rodents, and it is the part that perishes first because it takes the most abuse.',
      'Replacing a bottom seal is inexpensive and is genuine homeowner work on most doors: the old strip slides out of the retainer and the new one slides in. Side and top seals are nailed or screwed to the frame.',
      'A door that leaves a visible gap at one end when closed is more often a levelling or limit problem than a seal problem, so check the floor is level before buying a thicker seal.',
      'Replacing a bottom seal is one of the few garage door jobs that is genuinely straightforward. With the door closed, the old strip slides out of the aluminium retainer at the base and a new one slides in, often helped by a little soapy water. Buy by the retainer profile rather than by eye, since the T-shaped and bead-shaped types are not interchangeable. Before buying a thicker seal to close a stubborn gap, check whether the floor is level and whether the door is sitting square, because a gap at one end only is usually a levelling or limit problem wearing a seal-shaped disguise.',
    ],
    also: ['r-value'],
    guides: [],
  },
];

export function getTerm(slug) {
  return glossary.find((t) => t.slug === slug);
}

export function getTerms(slugs = []) {
  return slugs.map(getTerm).filter(Boolean);
}
