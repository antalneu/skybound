/**
 * The rest of the WMO naming system: species, varieties, supplementary
 * features, accessory clouds, and the origin suffixes.
 *
 * Definitions are paraphrased from the WMO International Cloud Atlas
 * (see /RESEARCH.md §1). Items added in the 2017 edition — the first full
 * revision since 1987 — carry `newIn2017`.
 *
 * `genera` lists the genera each term is *commonly observed with*. The Atlas
 * admits rarer combinations; this is not a closed set.
 */

export const SPECIES = [
  {
    id: 'fibratus',
    abbr: 'fib',
    gloss: 'fibrous',
    text: 'Nearly straight or evenly curved filaments with no hooks or tufts at the ends. The plainest possible cirriform shape.',
    genera: ['cirrus', 'cirrostratus'],
  },
  {
    id: 'uncinus',
    abbr: 'unc',
    gloss: 'hooked',
    text: "Comma-shaped, ending above in a hook or tuft that is not rounded. The classic mares' tail — the hook is the crystal source, the tail is the fall streak.",
    genera: ['cirrus'],
  },
  {
    id: 'spissatus',
    abbr: 'spi',
    gloss: 'thickened',
    text: 'Cirrus dense enough to look greyish when you look toward the sun through it. Often the remains of a decayed cumulonimbus anvil.',
    genera: ['cirrus'],
  },
  {
    id: 'castellanus',
    abbr: 'cas',
    gloss: 'castle-like',
    text: 'Turrets rising from a shared horizontal base, crenellated along the top. A direct visual readout of instability at that level.',
    genera: ['cirrus', 'cirrocumulus', 'altocumulus', 'stratocumulus'],
  },
  {
    id: 'floccus',
    abbr: 'flo',
    gloss: 'tuft of wool',
    text: 'Small tufts with rounded cumuliform tops and ragged lower parts, usually trailing virga.',
    genera: ['cirrus', 'cirrocumulus', 'altocumulus', 'stratocumulus'],
  },
  {
    id: 'stratiformis',
    abbr: 'str',
    gloss: 'layered',
    text: 'Spread out into an extensive horizontal sheet or layer.',
    genera: ['cirrocumulus', 'altocumulus', 'stratocumulus'],
  },
  {
    id: 'nebulosus',
    abbr: 'neb',
    gloss: 'misty',
    text: 'A veil or layer with no discernible detail — nothing to focus your eye on.',
    genera: ['cirrostratus', 'stratus'],
  },
  {
    id: 'lenticularis',
    abbr: 'len',
    gloss: 'lens-shaped',
    text: 'Almond- or lens-shaped with sharply defined outlines, often elongated and stacked. Frequently iridescent at the edges, and — unusually for a cloud — stationary.',
    genera: ['cirrocumulus', 'altocumulus', 'stratocumulus'],
  },
  {
    id: 'volutus',
    abbr: 'vol',
    gloss: 'rolled',
    text: 'A long, low, horizontal, detached tube that appears to roll slowly about its own long axis. Detached from any parent cloud, it travels as a solitary wave.',
    genera: ['altocumulus', 'stratocumulus'],
    newIn2017: true,
  },
  {
    id: 'fractus',
    abbr: 'fra',
    gloss: 'broken',
    text: 'Ragged and shredded, with an outline that visibly changes from moment to moment.',
    genera: ['stratus', 'cumulus'],
  },
  {
    id: 'humilis',
    abbr: 'hum',
    gloss: 'lowly',
    text: 'Cumulus of small vertical extent — wider than it is tall. The textbook fair-weather cloud.',
    genera: ['cumulus'],
  },
  {
    id: 'mediocris',
    abbr: 'med',
    gloss: 'middling',
    text: 'Cumulus of moderate vertical extent, roughly as tall as it is wide, with small bumps starting to appear on top.',
    genera: ['cumulus'],
  },
  {
    id: 'congestus',
    abbr: 'con',
    gloss: 'piled up',
    text: 'Markedly sprouting, taller than it is wide, with a hard cauliflower top. One step short of a thunderstorm.',
    genera: ['cumulus'],
  },
  {
    id: 'calvus',
    abbr: 'cal',
    gloss: 'bald',
    text: 'Cumulonimbus whose top has begun to lose its sharp cauliflower edges but has not yet turned fibrous. Glaciation has just started.',
    genera: ['cumulonimbus'],
  },
  {
    id: 'capillatus',
    abbr: 'cap',
    gloss: 'having hair',
    text: 'Cumulonimbus with a clearly fibrous, striated upper part, usually spread into an anvil. The storm is mature.',
    genera: ['cumulonimbus'],
  },
]

export const VARIETIES = [
  {
    id: 'intortus',
    abbr: 'in',
    gloss: 'twisted',
    group: 'arrangement',
    text: 'Filaments curved and tangled in a visibly irregular way.',
    genera: ['cirrus'],
  },
  {
    id: 'vertebratus',
    abbr: 've',
    gloss: 'vertebrate',
    group: 'arrangement',
    text: 'Elements arranged like ribs off a spine — a fish skeleton laid across the sky.',
    genera: ['cirrus'],
  },
  {
    id: 'undulatus',
    abbr: 'un',
    gloss: 'waved',
    group: 'arrangement',
    text: 'Undulations across a patch, sheet or layer, in one direction or occasionally two.',
    genera: [
      'cirrocumulus',
      'cirrostratus',
      'altocumulus',
      'altostratus',
      'stratocumulus',
      'stratus',
    ],
  },
  {
    id: 'radiatus',
    abbr: 'ra',
    gloss: 'radiating',
    group: 'arrangement',
    text: 'Broad parallel bands that appear to converge at a point on the horizon. The convergence is pure perspective — the bands are parallel.',
    genera: ['cirrus', 'altocumulus', 'altostratus', 'stratocumulus', 'cumulus'],
  },
  {
    id: 'lacunosus',
    abbr: 'la',
    gloss: 'full of holes',
    group: 'arrangement',
    text: 'A thin layer perforated by regularly spaced round holes with fringed edges — a net or honeycomb. Rare.',
    genera: ['cirrocumulus', 'altocumulus', 'stratocumulus'],
  },
  {
    id: 'duplicatus',
    abbr: 'du',
    gloss: 'doubled',
    group: 'arrangement',
    text: 'Superposed patches or layers at slightly different levels, sometimes partly merged.',
    genera: ['cirrus', 'cirrostratus', 'altocumulus', 'altostratus', 'stratocumulus'],
  },
  {
    id: 'translucidus',
    abbr: 'tr',
    gloss: 'translucent',
    group: 'opacity',
    text: 'Translucent enough over most of its area to show where the sun or moon is.',
    genera: ['altocumulus', 'altostratus', 'stratocumulus', 'stratus'],
  },
  {
    id: 'perlucidus',
    abbr: 'pe',
    gloss: 'letting light through',
    group: 'opacity',
    text: 'An extensive layer with real gaps between the elements, through which blue sky, sun or moon appears.',
    genera: ['altocumulus', 'stratocumulus'],
  },
  {
    id: 'opacus',
    abbr: 'op',
    gloss: 'opaque',
    group: 'opacity',
    text: 'Opaque enough over most of its area to hide the sun or moon completely.',
    genera: ['altocumulus', 'altostratus', 'stratocumulus', 'stratus'],
  },
]

export const FEATURES = [
  {
    id: 'incus',
    gloss: 'anvil',
    text: 'The upper part of a cumulonimbus spread out into a smooth, fibrous anvil. It marks the tropopause: the updraught rose until the temperature stopped falling, lost its buoyancy, and had nowhere to go but sideways.',
    genera: ['cumulonimbus'],
  },
  {
    id: 'mamma',
    gloss: 'udder',
    text: 'Hanging pouches on the underside of a cloud. Convection upside down — cloudy air laden with hydrometeors sinks into clear air, evaporates, cools further, and keeps sinking.',
    genera: ['cirrus', 'cirrocumulus', 'altocumulus', 'altostratus', 'stratocumulus', 'cumulonimbus'],
  },
  {
    id: 'virga',
    gloss: 'rod, streak',
    text: 'Trails of precipitation that leave the cloud base and evaporate before reaching the ground. The bend in the streak traces the wind shear it fell through.',
    genera: ['cirrocumulus', 'altocumulus', 'altostratus', 'nimbostratus', 'stratocumulus', 'cumulus', 'cumulonimbus'],
  },
  {
    id: 'praecipitatio',
    gloss: 'precipitation',
    text: 'Precipitation that does reach the ground. The formal distinction from virga is exactly that.',
    genera: ['altostratus', 'nimbostratus', 'stratocumulus', 'stratus', 'cumulus', 'cumulonimbus'],
  },
  {
    id: 'arcus',
    gloss: 'arch',
    text: 'A dense horizontal roll with ragged edges along the lower leading edge of a storm. Attached to the parent cloud it is a shelf cloud; detached and rolling, it is a roll cloud — now formally the species volutus.',
    genera: ['cumulus', 'cumulonimbus'],
  },
  {
    id: 'asperitas',
    gloss: 'roughness',
    text: 'Well-defined, chaotic wave structures on a cloud base — a rough sea viewed from underneath. Proposed by an amateur observing network and accepted in 2017, the first new supplementary feature in decades. Its formation mechanism is still unresolved.',
    genera: ['altocumulus', 'stratocumulus'],
    newIn2017: true,
    unsettled: true,
  },
  {
    id: 'cavum',
    gloss: 'hollow',
    text: 'A clean circular or elliptical hole punched through a thin supercooled layer, usually with virga trailing in the middle. An aircraft crossing the layer triggers freezing; the new ice crystals then grow at the droplets\' expense and fall out.',
    genera: ['cirrocumulus', 'altocumulus', 'stratocumulus'],
    newIn2017: true,
  },
  {
    id: 'fluctus',
    gloss: 'wave',
    text: 'Short-lived curls or breaking waves along a cloud top — Kelvin–Helmholtz billows, produced by shear across an interface. Visible for minutes at most.',
    genera: ['cirrus', 'altocumulus', 'stratocumulus', 'stratus', 'cumulus'],
    newIn2017: true,
  },
  {
    id: 'murus',
    gloss: 'wall',
    text: 'A localised, often abrupt lowering of cloud beneath a cumulonimbus base — the wall cloud. It sits under the main updraught, and tornadoes form from it.',
    genera: ['cumulonimbus'],
    newIn2017: true,
  },
  {
    id: 'cauda',
    gloss: 'tail',
    text: 'A horizontal tail of cloud attached to a wall cloud, pointing away from the precipitation area. Storm chasers call it the beaver\'s tail.',
    genera: ['cumulonimbus'],
    newIn2017: true,
  },
  {
    id: 'tuba',
    gloss: 'trumpet',
    text: 'A column or inverted cone hanging from a cloud base — a funnel cloud, marking a vortex. It becomes a tornado only once it reaches the ground.',
    genera: ['cumulus', 'cumulonimbus'],
  },
]

export const ACCESSORY = [
  {
    id: 'pileus',
    gloss: 'cap',
    text: 'A smooth cap or hood above a fast-rising cumuliform top: moist air lifted in a wave ahead of the tower, condensing just before the tower reaches it.',
    genera: ['cumulus', 'cumulonimbus'],
  },
  {
    id: 'velum',
    gloss: 'veil, sail',
    text: 'A thin horizontal veil close above or attached to a cumuliform cloud, which often pierces straight through it.',
    genera: ['cumulus', 'cumulonimbus'],
  },
  {
    id: 'pannus',
    gloss: 'shred of cloth',
    text: 'Ragged shreds beneath the main cloud base, sometimes merging into a continuous layer. Forms in air moistened by falling rain. Pilots call it scud.',
    genera: ['altostratus', 'nimbostratus', 'cumulus', 'cumulonimbus'],
  },
  {
    id: 'flumen',
    gloss: 'river',
    text: 'Bands of low cloud streaming into the inflow region of a severe storm, connected to but not part of the wall cloud.',
    genera: ['cumulonimbus'],
    newIn2017: true,
  },
]

export const SPECIAL_ORIGINS = [
  {
    id: 'homogenitus',
    gloss: 'of human making',
    text: 'A cloud formed as a direct result of human activity — contrails, cooling-tower plumes, cloud above industrial stacks.',
  },
  {
    id: 'homomutatus',
    gloss: 'changed by humans',
    text: 'A cloud of human origin that has persisted long enough for upper winds to reshape it into something indistinguishable from a natural cirriform sheet.',
  },
  {
    id: 'flammagenitus',
    gloss: 'made by flame',
    text: 'Convective cloud driven by the heat of a wildfire or volcanic eruption. Pyrocumulus, and at its most extreme pyrocumulonimbus.',
  },
  {
    id: 'cataractagenitus',
    gloss: 'made by a waterfall',
    text: 'Cloud formed in the spray and forced updraught at a large waterfall.',
  },
  {
    id: 'silvagenitus',
    gloss: 'made by forest',
    text: 'Cloud formed over a forest from the moisture the canopy transpires.',
  },
]

export const TAXONOMY_GROUPS = [
  {
    id: 'species',
    label: 'Species',
    latin: 'species',
    rule: 'At most one per cloud — species are mutually exclusive.',
    describes: 'Shape and internal structure',
    items: SPECIES,
  },
  {
    id: 'varieties',
    label: 'Varieties',
    latin: 'varietas',
    rule: 'Several at once is normal, but the three opacity varieties exclude each other.',
    describes: 'Transparency and arrangement',
    items: VARIETIES,
  },
  {
    id: 'features',
    label: 'Supplementary features',
    latin: 'pars adiuncta',
    rule: 'Attached to or partly merged with the main cloud.',
    describes: 'Attached structures',
    items: FEATURES,
  },
  {
    id: 'accessory',
    label: 'Accessory clouds',
    latin: 'nubes accessoria',
    rule: 'A separate small cloud, adjacent to the main one.',
    describes: 'Companion clouds',
    items: ACCESSORY,
  },
  {
    id: 'origins',
    label: 'Special clouds',
    latin: 'nubes specialis',
    rule: 'A suffix naming what made the cloud, appended to the full name.',
    describes: 'Origin suffixes',
    items: SPECIAL_ORIGINS,
  },
]

const ALL = [...SPECIES, ...VARIETIES, ...FEATURES, ...ACCESSORY, ...SPECIAL_ORIGINS]
export const TERM_BY_ID = Object.fromEntries(ALL.map((t) => [t.id, t]))
