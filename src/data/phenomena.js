/**
 * Rare clouds and atmospheric optics — the Sky Gallery content.
 *
 * Altitudes and temperature thresholds are sourced in /RESEARCH.md §4–5.
 * `unsettled: true` marks entries where the mechanism is genuinely open in
 * the literature; the UI surfaces that rather than papering over it.
 */

export const RARE = [
  {
    id: 'noctilucent',
    name: 'Noctilucent clouds',
    latin: 'Polar mesospheric clouds',
    render: 'noctilucent',
    altitude: '76–85 km',
    altitudeNote: 'The mesopause — ten times higher than any tropospheric cloud',
    when: 'Polar summer, latitudes ~50–70°',
    tagline: 'The highest clouds on Earth, lit by a sun that has already set.',
    what: 'Electric-blue filaments and whorls that appear in deep twilight, an hour or two after sunset, while the rest of the sky is already dark.',
    physics:
      'Water ice condensing on meteoric dust at the mesopause, the coldest place in the entire atmosphere — formation requires temperatures below about −120 °C, which only occur over the summer pole. They glow because at 80 km they are still in direct sunlight long after the ground below has gone dark.',
    aside:
      'First recorded in 1885, two years after Krakatoa. Whether that was coincidence or cause is still argued.',
    rarity: 'seasonal',
  },
  {
    id: 'nacreous',
    name: 'Nacreous clouds',
    latin: 'Polar stratospheric clouds',
    render: 'nacreous',
    altitude: '15–30 km',
    altitudeNote: 'Lower stratosphere, well above all weather',
    when: 'Polar winter, at high latitudes',
    tagline: 'Mother-of-pearl — and a catalyst for ozone loss.',
    what: 'Intense, saturated iridescence in pastel bands, most visible when the sun is just below the horizon. The colours are far purer than anything a tropospheric cloud produces.',
    physics:
      'Forms below roughly −85 °C in the polar winter stratosphere. The particles are remarkably uniform, around 10 µm, and that uniformity is exactly why the diffraction colours are so clean — a spread of particle sizes would smear them into white.',
    aside:
      'These clouds provide the surfaces for the heterogeneous chlorine chemistry that drives polar ozone destruction. The prettiest cloud in the sky has a serious side.',
    rarity: 'rare',
  },
  {
    id: 'mammatus',
    name: 'Mammatus',
    latin: 'mamma — supplementary feature',
    render: 'mammatus',
    altitude: 'Underside of the parent cloud',
    altitudeNote: 'Classically beneath a cumulonimbus anvil at 8–12 km',
    when: 'After the storm has passed, usually',
    tagline: 'Convection running in reverse.',
    what: 'Rows of smooth hanging pouches on a cloud base, often lit orange by a low sun. Most striking under a thunderstorm anvil, but also seen under altocumulus, altostratus and cirrus.',
    physics:
      'Ordinary convection is buoyant air rising. Mammatus is the opposite: cloudy air heavy with ice and water sinks into the clear, drier air below. As it sinks, its hydrometeors evaporate and sublimate, which cools it further and makes it *more* negatively buoyant. The pouches are that runaway sinking made visible.',
    aside:
      'Widely believed to signal an incoming storm. They usually mark one that has already gone by.',
    rarity: 'uncommon',
  },
  {
    id: 'lenticular',
    name: 'Lenticular clouds',
    latin: 'Altocumulus lenticularis',
    render: 'lenticular',
    altitude: '2–7 km, in the lee of terrain',
    altitudeNote: 'Also seen as Cc and Sc lenticularis',
    when: 'Stable, moist, windy conditions near mountains',
    tagline: 'A cloud that stays still while the air races through it.',
    what: 'Smooth, sharply outlined lenses, often stacked in piles like a column of plates. They hold position over or downwind of a ridge for hours.',
    physics:
      'Stable air forced over a barrier does not simply return to its level — it overshoots and oscillates, setting up standing waves downwind. Water condenses as air climbs into a wave crest and evaporates as it descends into the trough. The wave is stationary, so the cloud is stationary, even in a 40 m/s wind. Air is streaming through it the whole time.',
    aside:
      'Glider pilots ride the same waves for altitude records. Powered aircraft avoid them, because the rotor turbulence beneath is severe.',
    rarity: 'uncommon',
  },
  {
    id: 'kelvin-helmholtz',
    name: 'Kelvin–Helmholtz waves',
    latin: 'fluctus — supplementary feature',
    render: 'kelvin',
    altitude: 'Any sheared interface',
    altitudeNote: 'Most often seen at low and middle levels',
    when: 'Strong vertical wind shear across a stable layer',
    tagline: 'Breaking surf, upside down, in the air.',
    what: 'A row of near-identical curling billows along a cloud top, each one a breaking wave frozen mid-collapse. They last a few minutes at most — spot one and photograph it immediately.',
    physics:
      'Where wind speed changes sharply across a density interface, the interface becomes unstable: a small ripple grows, its crest is dragged forward faster than its base, and it curls over. The same instability makes wind-driven waves break on water. Here the two fluids are just two layers of air.',
    aside:
      'Formally recognised as the supplementary feature fluctus in 2017, though the physics has carried Kelvin and Helmholtz\'s names since the 1860s.',
    rarity: 'rare',
  },
  {
    id: 'asperitas',
    name: 'Asperitas',
    latin: 'asperitas — supplementary feature',
    render: 'asperitas',
    altitude: '2–7 km typically',
    altitudeNote: 'On Altocumulus and Stratocumulus bases',
    when: 'Often near mesoscale convective systems',
    tagline: 'The underside of a storm-tossed sea.',
    what: 'A cloud base thrown into chaotic, sharply defined waves and troughs, lit from within, resembling a rough ocean surface viewed from below.',
    physics:
      'Not settled. Candidate explanations involve mid-level gravity waves propagating along the cloud base, and outflow from mesoscale convective systems, but no single mechanism is established. Unusually for a cloud this dramatic, the honest answer is that nobody is certain yet.',
    aside:
      'Proposed by the Cloud Appreciation Society and accepted into the Atlas in 2017 — the first new supplementary feature in decades, and the first to originate with amateur observers.',
    rarity: 'rare',
    unsettled: true,
  },
  {
    id: 'arcus',
    name: 'Shelf and roll clouds',
    latin: 'arcus / volutus',
    render: 'arcus',
    altitude: '0.5–2 km',
    altitudeNote: 'Along the leading edge of a storm outflow',
    when: 'Ahead of a gust front',
    tagline: 'The visible edge of the cold air a storm pushes ahead of itself.',
    what: 'A low, dark, wedge-shaped bar spanning the horizon. A shelf cloud stays attached to the storm base above it; a roll cloud is fully detached and rotates about its long axis.',
    physics:
      'A thunderstorm\'s downdraught spreads out at the surface as a cold density current. Warm moist air ahead of it is forced up over the advancing wedge and condenses along the boundary. A roll cloud goes further: it separates from the parent storm and propagates on its own as a solitary wave, which is why it was given its own species name, volutus, in 2017.',
    aside:
      'Australia\'s Gulf of Carpentaria produces the Morning Glory — roll clouds up to 1,000 km long, arriving on schedule most spring mornings.',
    rarity: 'uncommon',
  },
  {
    id: 'cavum',
    name: 'Fallstreak holes',
    latin: 'cavum — supplementary feature',
    render: 'cavum',
    altitude: '2–7 km',
    altitudeNote: 'In thin supercooled Ac or Cc layers',
    when: 'Near airports, mostly',
    tagline: 'A hole punched in a cloud by an aircraft.',
    what: 'A clean circular or elliptical gap in an otherwise unbroken thin cloud sheet, usually with a wisp of ice trailing in the middle.',
    physics:
      'The layer is supercooled — liquid droplets below 0 °C that have nothing to freeze onto. An aircraft passing through cools the air locally as it expands over the wings and propellers, which triggers freezing. The new ice crystals then grow rapidly at the droplets\' expense, because saturation vapour pressure over ice is lower than over liquid water. They get heavy, fall out as virga, and leave a hole.',
    aside:
      'Reliably reported as a UFO. The mechanism is entirely mundane, and entirely human-caused.',
    rarity: 'uncommon',
  },
  {
    id: 'contrails',
    name: 'Contrails',
    latin: 'Cirrus homogenitus → homomutatus',
    render: 'contrail',
    altitude: '8–12 km',
    altitudeNote: 'Commercial cruise altitude',
    when: 'When the Schmidt–Appleman criterion is satisfied',
    tagline: 'The only cloud genus humans routinely manufacture.',
    what: 'Straight white lines behind aircraft. Most vanish within seconds; some persist for hours, spread under shear, and end up indistinguishable from natural cirrus.',
    physics:
      'Hot, moist engine exhaust mixes with very cold ambient air. The mixing line briefly passes into supersaturation with respect to liquid water — that condition is the Schmidt–Appleman criterion — and droplets condense on soot particles and freeze almost instantly. Whether the trail then survives depends entirely on the ambient air: if it is supersaturated with respect to ice, the contrail persists and spreads. If not, it sublimes away in seconds.',
    aside:
      'Contrail cirrus is a significant component of aviation\'s climate forcing, and unlike CO₂ it responds within hours to changes in flight routing.',
    rarity: 'common',
  },
  {
    id: 'pyrocb',
    name: 'Pyrocumulonimbus',
    latin: 'Cumulonimbus flammagenitus',
    render: 'pyrocb',
    altitude: 'Base near the fire; tops to 15 km',
    altitudeNote: 'The strongest overshoot into the stratosphere',
    when: 'Over intense wildfires and volcanic eruptions',
    tagline: 'A thunderstorm that builds its own fuel.',
    what: 'A dirty, brown-grey convective tower rising directly from a fire, capable of producing its own lightning — and therefore of starting new fires far downwind.',
    physics:
      'The fire supplies the heat that drives the convection, and the smoke supplies abundant condensation nuclei. Once the plume is deep enough to glaciate it becomes a genuine cumulonimbus with the fire as its heat engine rather than the sun.',
    aside:
      'The largest pyroCbs inject smoke into the lower stratosphere, where it circles the globe and stays aloft for months. The 2019–20 Australian event was detectable in stratospheric aerosol for over a year.',
    rarity: 'rare',
  },
]

export const OPTICS = [
  {
    id: 'halo22',
    name: '22° halo',
    render: 'halo',
    agent: 'ice',
    tagline: 'A ring of light exactly one outstretched hand from the sun.',
    what: 'A circle of light around the sun or moon, faintly red on the inside edge and bluish on the outside. Its radius is always 22° — roughly the span from thumb to little finger on an outstretched hand.',
    physics:
      'Sunlight refracts through the 60° prism formed by alternate side faces of randomly oriented hexagonal ice columns. Rays can deviate by many angles, but not less than 22°, and light piles up at that minimum — which is why the ring has a sharp inner edge and fades outward.',
    host: 'Cirrostratus',
    rarity: 'common',
  },
  {
    id: 'sundog',
    name: 'Sun dogs',
    render: 'sundog',
    agent: 'ice',
    tagline: 'Two false suns flanking the real one.',
    what: 'Bright, often rainbow-tinted patches 22° to the left and right of the sun, at the same height above the horizon. Formally, parhelia.',
    physics:
      'The same 60° refraction as the halo, but through *plate* crystals falling with their flat faces horizontal. Because the crystals are aligned rather than random, the light concentrates into two spots instead of spreading around a full ring.',
    host: 'Cirrus, Cirrostratus',
    rarity: 'common',
  },
  {
    id: 'cza',
    name: 'Circumzenithal arc',
    render: 'cza',
    agent: 'ice',
    tagline: 'An upside-down rainbow, directly overhead.',
    what: 'A short, brilliantly coloured arc high near the zenith, curving away from the sun. Purer in colour than any rainbow, and easy to miss because almost nobody looks straight up.',
    physics:
      'Light enters the horizontal top face of a plate crystal and leaves through a vertical side face. That geometry disperses colours far more cleanly than a raindrop does, and it only works when the sun is below 32° altitude.',
    host: 'Cirrus, Cirrostratus',
    rarity: 'uncommon',
  },
  {
    id: 'corona',
    name: 'Corona',
    render: 'corona',
    agent: 'water',
    tagline: 'The halo\'s opposite, and the way to tell droplets from ice.',
    what: 'A small bright disc around the sun or moon, ringed with colour — blue on the inside, red on the outside.',
    physics:
      'Diffraction, not refraction. Light bends around small, uniformly sized water droplets and the bent waves interfere. Smaller droplets give a wider corona, so the ring size is a direct readout of droplet size.',
    host: 'Altocumulus, thin Altostratus',
    rarity: 'common',
    contrast:
      'Colour order is the tell. A halo runs red on the inside, blue outside. A corona runs blue on the inside, red outside. Ice refracts; water diffracts.',
  },
  {
    id: 'iridescence',
    name: 'Iridescence',
    render: 'iridescence',
    agent: 'water',
    tagline: 'Corona optics, broken into pastel bands.',
    what: 'Irregular patches of soft pink, green and gold along the edges of thin cloud — most often on lenticular clouds, and spectacular on nacreous ones.',
    physics:
      'The same droplet diffraction that makes a corona, but in cloud where droplet size varies from place to place. Each patch produces its own ring radius, and the rings break up into bands. Uniform droplets give clean rings; varied droplets give iridescence.',
    host: 'Altocumulus lenticularis, nacreous clouds',
    rarity: 'uncommon',
  },
  {
    id: 'glory',
    name: 'Glory',
    render: 'glory',
    agent: 'water',
    tagline: 'Coloured rings around your own shadow.',
    what: 'Concentric rings of colour centred exactly on the antisolar point — which, from an aircraft, means around the aircraft\'s shadow, and from a mountain ridge, around your own head.',
    physics:
      'Light is scattered back toward its source by individual droplets, through a process involving surface waves travelling around the droplet and interfering on the way out. The backscatter is sharply directional, which is why the rings are so tight and the colours so pure.',
    host: 'Stratus, Stratocumulus, fog',
    rarity: 'uncommon',
    aside:
      'Seen around your own shadow from a ridge, with the shadow magnified onto the fog beyond, it is called a Brocken spectre.',
  },
  {
    id: 'crepuscular',
    name: 'Crepuscular rays',
    render: 'crepuscular',
    agent: 'aerosol',
    tagline: 'Parallel beams that only look like they are spreading.',
    what: 'Shafts of light fanning out from behind a cloud, or from below the horizon at sunset.',
    physics:
      'Not a cloud optic at all — the rays are sunlight scattered by aerosol and haze, made visible only because cloud blocks the light either side of them. The beams are parallel; the apparent fan is perspective, the same reason railway tracks appear to converge.',
    host: 'Any cloud with gaps',
    rarity: 'common',
  },
]

export const RARITY = {
  common: { label: 'Common', note: 'Look up regularly and you will see it' },
  uncommon: { label: 'Uncommon', note: 'Worth the wait' },
  seasonal: { label: 'Seasonal', note: 'Only at certain times of year' },
  rare: { label: 'Rare', note: 'A genuine event' },
}
