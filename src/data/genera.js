/**
 * The ten cloud genera.
 *
 * Every altitude, composition and formation mechanism here traces to a source
 * listed in /RESEARCH.md §7 — chiefly the WMO International Cloud Atlas, with
 * NOAA/NWS and NASA for altitude conventions and climate role.
 *
 * Altitude fields use the WMO **temperate** étage as the display default,
 * because a single latitude has to be picked for a linear scale. `baseKm` is
 * the cloud *base*; `topKm` is how high the same cloud commonly reaches.
 * Where a US convention differs from WMO, `heightNote` says so rather than
 * silently choosing one.
 */

export const ETAGES = {
  high: {
    id: 'high',
    label: 'High',
    prefix: 'Cirro-',
    blurb: 'Ice, top to bottom. Too thin and too cold to rain on you.',
    bands: {
      polar: [3, 8],
      temperate: [5, 13],
      tropical: [6, 18],
    },
  },
  middle: {
    id: 'middle',
    label: 'Middle',
    prefix: 'Alto-',
    blurb: 'Mixed water and ice. Where a front announces itself.',
    bands: {
      polar: [2, 4],
      temperate: [2, 7],
      tropical: [2, 8],
    },
  },
  low: {
    id: 'low',
    label: 'Low',
    prefix: '—',
    blurb: 'Mostly liquid water. The clouds that actually reach you.',
    bands: {
      polar: [0, 2],
      temperate: [0, 2],
      tropical: [0, 2],
    },
  },
  vertical: {
    id: 'vertical',
    label: 'Vertical extent',
    prefix: '—',
    blurb: 'Based low, built tall. A single cloud spanning every étage.',
    bands: {
      polar: [0, 8],
      temperate: [0, 13],
      tropical: [0, 18],
    },
  },
}

export const GENERA = [
  // ---------------------------------------------------------------- HIGH ---
  {
    id: 'cirrus',
    name: 'Cirrus',
    abbr: 'Ci',
    etymology: 'Latin cirrus — a curl or lock of hair',
    etage: 'high',
    baseKm: [6, 13],
    topKm: 13,
    composition: 'ice',
    compositionLabel: 'Ice crystals only',
    tempRange: 'below about −40 °C',
    precipitation: 'None reaches the ground',
    definition:
      'Detached clouds in the form of white, delicate filaments, patches or narrow bands, with a fibrous hair-like appearance, a silky sheen, or both.',
    look:
      "Fine white strokes drawn across open blue, with real gaps between them. Cirrus never has enough substance to grey the sky or blunt the sun's edge. Look at the shape of the strokes: many end in a hook or comma, the tail always trailing behind the denser head.",
    physics:
      'Ice crystals nucleate straight from vapour in the driest, coldest part of the troposphere — no liquid stage at all. Crystals grow heavy enough to fall, and what you are looking at is mostly the fall streak, not the cloud that made it. Wind speed changes with height, so the falling streak is dragged sideways relative to its source. That shear is what bends cirrus into hooks.',
    tells:
      'Cirrus that is thickening, lowering and spreading into a continuous sheet is the leading edge of a warm front, usually 24–48 hours ahead of the rain. Cirrus that stays sparse and isolated means nothing much.',
    confusion: {
      with: 'Cirrostratus',
      how: 'Cirrus is detached — you can see sky between the filaments. Cirrostratus is continuous enough to veil the whole sky, and it is the one that produces a halo.',
    },
    species: ['fibratus', 'uncinus', 'spissatus', 'castellanus', 'floccus'],
    varieties: ['intortus', 'radiatus', 'vertebratus', 'duplicatus'],
    features: ['mamma', 'fluctus'],
    accessory: [],
    signature: 'cirrus',
  },
  {
    id: 'cirrocumulus',
    name: 'Cirrocumulus',
    abbr: 'Cc',
    etymology: 'cirrus (curl) + cumulus (heap)',
    etage: 'high',
    baseKm: [6, 12],
    topKm: 12,
    composition: 'ice',
    compositionLabel: 'Ice, often with supercooled droplets',
    tempRange: 'below about −30 °C',
    precipitation: 'Virga only — never reaches the ground',
    definition:
      'A thin white patch, sheet or layer without shading, made of very small elements in the form of grains or ripples, merged or separate, and more or less regularly arranged.',
    look:
      'A fine granular sheet — the "mackerel sky." The individual grains subtend less than one degree, about the width of your little finger held at arm\'s length. The absence of shading is the diagnostic: every element is uniformly bright.',
    physics:
      'Shallow convection or gravity waves inside a thin, cold layer near the tropopause. The regular spacing comes from convective cells or wave crests in the layer, which is why the pattern is so orderly compared to cumulus below.',
    tells:
      'Uncommon and short-lived — it usually decays into cirrus or cirrostratus within an hour or two. In the tropics a mackerel sky is a recognised precursor to a tropical cyclone approaching from over the horizon.',
    confusion: {
      with: 'Altocumulus',
      how: 'Size and shading. Cirrocumulus elements are under 1° wide and have no grey undersides. Altocumulus elements are 1–5° wide and show visible shading.',
    },
    species: ['stratiformis', 'lenticularis', 'castellanus', 'floccus'],
    varieties: ['undulatus', 'lacunosus'],
    features: ['virga', 'mamma', 'cavum'],
    accessory: [],
    signature: 'cirrocumulus',
  },
  {
    id: 'cirrostratus',
    name: 'Cirrostratus',
    abbr: 'Cs',
    etymology: 'cirrus (curl) + stratus (spread out)',
    etage: 'high',
    baseKm: [6, 13],
    topKm: 13,
    composition: 'ice',
    compositionLabel: 'Ice crystals only',
    tempRange: 'below about −40 °C',
    precipitation: 'None',
    definition:
      'A transparent whitish veil of fibrous or smooth appearance, totally or partly covering the sky, and generally producing halo phenomena.',
    look:
      'So thin it is easy to miss. The sky loses its depth and takes on a milky cast; shadows on the ground go soft-edged but do not disappear. The reliable tell is the 22° halo, a ring of light around the sun or moon with a radius roughly the span of an outstretched hand.',
    physics:
      'A deep, slowly ascending sheet of air on the forward slope of a warm front, cooling until the whole layer glaciates. Because the ascent is gentle and uniform over hundreds of kilometres, the result is a smooth sheet rather than discrete cells.',
    tells:
      'The most useful single cloud in amateur forecasting. A cirrostratus halo following thickening cirrus puts rain roughly 12–24 hours out. If the veil keeps thickening and lowering into altostratus, the front is on schedule.',
    confusion: {
      with: 'Altostratus',
      how: 'Through cirrostratus the sun still casts distinct shadows and can produce a halo. Through altostratus it looks like a bright patch behind ground glass, shadows vanish, and there is no halo — altostratus has too much liquid water.',
    },
    species: ['fibratus', 'nebulosus'],
    varieties: ['duplicatus', 'undulatus'],
    features: [],
    accessory: [],
    signature: 'cirrostratus',
  },

  // -------------------------------------------------------------- MIDDLE ---
  {
    id: 'altocumulus',
    name: 'Altocumulus',
    abbr: 'Ac',
    etymology: 'altum (height) + cumulus (heap)',
    etage: 'middle',
    baseKm: [2, 7],
    topKm: 7,
    composition: 'mixed',
    compositionLabel: 'Water droplets, often supercooled; ice at the cold end',
    tempRange: '0 °C to −30 °C',
    precipitation: 'Virga; rarely light precipitation reaching the ground',
    definition:
      'White or grey patches, sheets or layers, generally with shading, composed of rounded masses or rolls which are sometimes partly fibrous or diffuse, and may or may not be merged.',
    look:
      'Rounded masses with clearly shaded undersides, arranged in rolls, waves or a broad patchwork. Elements typically span one to five degrees — between a fingertip and three fingers at arm\'s length. Thin patches often show iridescence at their edges.',
    physics:
      'Instability or wave motion confined to a middle-level layer. Air within the layer overturns in shallow convective cells, or is set oscillating by flow over terrain or by shear at the layer boundary. Because the cells are isolated in a layer rather than rooted at the surface, they organise into far more regular patterns than cumulus.',
    tells:
      'Altocumulus castellanus on a summer morning — the variant with small turrets rising from a common base — indicates instability already present at mid-levels and is a well-known signal for thunderstorms later the same day. A plain altocumulus sheet, by contrast, usually just means a front is nearby.',
    confusion: {
      with: 'Stratocumulus',
      how: 'Element size. Held at arm\'s length, altocumulus elements are between one and three fingers wide; stratocumulus elements are wider than three fingers — often much wider — because they are far closer to you.',
    },
    species: ['stratiformis', 'lenticularis', 'castellanus', 'floccus', 'volutus'],
    varieties: [
      'translucidus',
      'perlucidus',
      'opacus',
      'duplicatus',
      'undulatus',
      'radiatus',
      'lacunosus',
    ],
    features: ['virga', 'mamma', 'cavum', 'fluctus', 'asperitas'],
    accessory: [],
    signature: 'altocumulus',
  },
  {
    id: 'altostratus',
    name: 'Altostratus',
    abbr: 'As',
    etymology: 'altum (height) + stratus (spread out)',
    etage: 'middle',
    baseKm: [2, 7],
    topKm: 7,
    composition: 'mixed',
    compositionLabel: 'Water droplets, supercooled droplets, ice crystals, snow',
    tempRange: '0 °C to −30 °C',
    precipitation: 'Light continuous rain or snow, often as virga',
    definition:
      'A greyish or bluish sheet or layer of striated, fibrous or uniform appearance, covering the sky wholly or partly, thin enough in places to reveal the sun as through ground glass, and showing no halo phenomena.',
    look:
      'A featureless grey-blue wash over the whole sky. Its signature is what it does to the sun: a diffuse bright patch with no defined disc, and no shadows on the ground. The absence of a halo separates it from cirrostratus — altostratus contains liquid water, and liquid droplets cannot refract a halo.',
    physics:
      'The same slow frontal ascent that made the cirrostratus, continued and deepened. As the sheet thickens and its base descends into warmer air, ice gives way to a mixed-phase layer. Altostratus very often forms by cirrostratus simply thickening downward.',
    tells:
      'Rain within a few hours. Altostratus is the middle act of the warm-front sequence: once it thickens further and its base lowers, it becomes nimbostratus and the precipitation begins in earnest.',
    confusion: {
      with: 'Nimbostratus',
      how: 'If you can still locate the sun as a bright patch, it is altostratus. Once the sun is completely blotted out and steady precipitation has started, it has become nimbostratus.',
    },
    species: [],
    varieties: ['translucidus', 'opacus', 'duplicatus', 'undulatus', 'radiatus'],
    features: ['virga', 'praecipitatio', 'mamma'],
    accessory: ['pannus'],
    signature: 'altostratus',
  },
  {
    id: 'nimbostratus',
    name: 'Nimbostratus',
    abbr: 'Ns',
    etymology: 'nimbus (rain cloud) + stratus (spread out)',
    etage: 'middle',
    baseKm: [0.6, 3],
    topKm: 8,
    composition: 'mixed',
    compositionLabel: 'Water droplets and raindrops; ice and snow aloft',
    tempRange: 'spans +10 °C to −40 °C through its depth',
    precipitation: 'Continuous rain or snow — its defining property',
    definition:
      'A grey, often dark cloud layer rendered diffuse by continuously falling rain or snow, thick enough throughout to blot out the sun completely.',
    look:
      'Uniform dark grey with no structure and no visible base — the falling precipitation smears the boundary until there is nothing to focus on. Ragged shreds of pannus often scud along beneath it in the rain-cooled air.',
    physics:
      'Deep, sustained, gentle ascent across a broad frontal surface. Precipitation forms mostly through the Wegener–Bergeron–Findeisen process in the cold upper part of the layer and melts on the way down. The vertical motion is slow — centimetres per second — but it acts over hundreds of kilometres and many hours, which is why the rain is light, steady, and does not stop.',
    tells:
      'The rain you already have. Nimbostratus is a diagnosis rather than a forecast: it is what an occluding or warm frontal system looks like from underneath, and it typically persists for six to twelve hours.',
    confusion: {
      with: 'Cumulonimbus',
      how: 'Duration and character. Nimbostratus gives steady, moderate, widespread precipitation for hours with no lightning. Cumulonimbus gives brief, violent, localised precipitation with gusts, and it is the only cloud that produces lightning and hail.',
    },
    heightNote:
      'The WMO assigns Nimbostratus to the middle étage, though it habitually extends through all three. Many US-facing references list it as a low cloud because its base is usually low. Both conventions are in current use.',
    species: [],
    varieties: [],
    features: ['praecipitatio', 'virga'],
    accessory: ['pannus'],
    signature: 'nimbostratus',
  },

  // ----------------------------------------------------------------- LOW ---
  {
    id: 'stratocumulus',
    name: 'Stratocumulus',
    abbr: 'Sc',
    etymology: 'stratus (spread out) + cumulus (heap)',
    etage: 'low',
    baseKm: [0.5, 2],
    topKm: 2,
    composition: 'water',
    compositionLabel: 'Water droplets; supercooled in winter',
    tempRange: '+15 °C to −5 °C',
    precipitation: 'Light drizzle at most; usually nothing',
    definition:
      'Grey or whitish patches, sheets or layers, almost always with dark parts, composed of tessellated masses or rolls which are non-fibrous, and which may or may not be merged.',
    look:
      'Lumpy grey rolls or slabs with distinctly darker undersides, usually with narrow bright cracks of light between them. The elements are large — wider than three fingers at arm\'s length, often far wider. The most common cloud on Earth, and the one most people would describe as "just overcast."',
    physics:
      'Convection capped by an inversion. Air rising off the surface hits a stable layer it cannot penetrate, so it spreads sideways instead of building upward — cumulus flattened and forced to fill a lid. Radiative cooling from the cloud top helps drive the overturning that keeps the deck alive, which is why marine stratocumulus persists for days.',
    tells:
      'Usually benign: stratocumulus means a stable, capped boundary layer, and it often clears with afternoon heating. Its real significance is climatic, not meteorological — the vast stratocumulus decks over cool eastern-ocean upwelling zones are the single most important cloud type for Earth\'s albedo.',
    confusion: {
      with: 'Altocumulus',
      how: 'Element size and darkness. Stratocumulus elements are large and clearly shaded to dark grey; altocumulus elements are smaller and their shading is lighter.',
    },
    species: ['stratiformis', 'lenticularis', 'castellanus', 'floccus', 'volutus'],
    varieties: [
      'translucidus',
      'perlucidus',
      'opacus',
      'duplicatus',
      'undulatus',
      'radiatus',
      'lacunosus',
    ],
    features: ['virga', 'praecipitatio', 'mamma', 'fluctus', 'asperitas', 'cavum'],
    accessory: [],
    signature: 'stratocumulus',
  },
  {
    id: 'stratus',
    name: 'Stratus',
    abbr: 'St',
    etymology: 'Latin stratus — spread out, layered',
    etage: 'low',
    baseKm: [0, 0.6],
    topKm: 1,
    composition: 'water',
    compositionLabel: 'Small water droplets',
    tempRange: '+15 °C to −10 °C',
    precipitation: 'Drizzle, snow grains or ice prisms',
    definition:
      'A generally grey cloud layer with a fairly uniform base, which may give drizzle, ice prisms or snow grains. When the sun is visible through it, its outline is clearly discernible.',
    look:
      'A flat, featureless grey ceiling with no structure at all. Low enough to hide hilltops and tall buildings. When it reaches the ground it is called fog — the physics is identical, only the observer\'s position changes.',
    physics:
      'Cooling without lifting. Either a surface radiating heat away overnight until the air above reaches its dew point, or warm moist air advecting over a cold surface — cold water, snow cover — and being chilled from below. Weak turbulent mixing spreads the saturated layer into a sheet.',
    tells:
      'Dull and persistent, but harmless. Stratus indicates a stable, moist, poorly mixed boundary layer. It usually burns off from below as the surface warms — a stratus deck that has not lifted by mid-afternoon likely will not.',
    confusion: {
      with: 'Nimbostratus',
      how: 'Stratus is thin, brighter, and drizzles at most; you can often make out the sun\'s outline through it. Nimbostratus is much deeper, completely opaque, and gives steady rain rather than drizzle.',
    },
    species: ['nebulosus', 'fractus'],
    varieties: ['opacus', 'translucidus', 'undulatus'],
    features: ['praecipitatio', 'fluctus'],
    accessory: [],
    signature: 'stratus',
  },

  // ------------------------------------------------------------ VERTICAL ---
  {
    id: 'cumulus',
    name: 'Cumulus',
    abbr: 'Cu',
    etymology: 'Latin cumulus — a heap or pile',
    etage: 'low',
    verticalExtent: true,
    baseKm: [0.5, 2],
    topKm: 6,
    composition: 'water',
    compositionLabel: 'Water droplets; ice only in the tallest tops',
    tempRange: '+20 °C to −20 °C',
    precipitation: 'None from humilis; showers from congestus',
    definition:
      'Detached clouds, generally dense and with sharp outlines, developing vertically as rising mounds, domes or towers, of which the bulging upper part often resembles a cauliflower. The sunlit parts are mostly brilliant white; the base is relatively dark and nearly horizontal.',
    look:
      'Crisp, bright, individually separate heaps with flat bottoms. The flat base is the giveaway, and the fact that every cumulus in view shares the same base height is one of the most quietly satisfying sights in meteorology.',
    physics:
      'Surface heating creates buoyant plumes of warm air. A plume cools at 9.8 °C per kilometre as it rises until it reaches saturation, and that height — the lifting condensation level — is where the cloud starts. Because the whole air mass has similar temperature and humidity, every plume saturates at the same altitude. That is why the bases line up.',
    tells:
      'Read the growth. Shallow, flattened cumulus humilis is the definition of fair weather. Cumulus that keeps building through the day into mediocris and then congestus — taller than it is wide, with hard cauliflower tops — indicates deep instability, and congestus is one step from a thunderstorm.',
    confusion: {
      with: 'Cumulonimbus',
      how: 'Look at the top. If the top is still hard-edged and cauliflower-like, it is cumulus congestus. Once the top goes soft, fibrous and striated — the moment it glaciates to ice — it has become cumulonimbus, and it can now produce lightning.',
    },
    heightNote:
      'WMO places Cumulus in the low étage because its base is low, and describes it as a cloud "with vertical extent." The US NWS convention instead puts Cumulus and Cumulonimbus in a separate fourth category, "clouds with vertical development."',
    species: ['humilis', 'mediocris', 'congestus', 'fractus'],
    varieties: ['radiatus'],
    features: ['virga', 'praecipitatio', 'arcus', 'tuba', 'fluctus'],
    accessory: ['pileus', 'velum', 'pannus'],
    signature: 'cumulus',
  },
  {
    id: 'cumulonimbus',
    name: 'Cumulonimbus',
    abbr: 'Cb',
    etymology: 'cumulus (heap) + nimbus (rain cloud)',
    etage: 'low',
    verticalExtent: true,
    baseKm: [0.5, 2],
    topKm: 16,
    composition: 'mixed',
    compositionLabel: 'Droplets below, supercooled water and ice above, hail within',
    tempRange: '+25 °C at the base to −80 °C at the anvil',
    precipitation: 'Heavy showers, hail, lightning; tornadoes from the strongest',
    definition:
      'A heavy and dense cloud of considerable vertical extent in the form of a mountain or huge tower. At least part of its upper portion is usually smooth, fibrous or striated, and nearly always flattened, often spreading out in the shape of an anvil or vast plume.',
    look:
      'A single cloud occupying every level of the troposphere at once. The base is dark and low; the top is 10–16 km up, glaciated to ice, and spread flat into an anvil where it hit the tropopause and could rise no further. From directly beneath you see almost none of this — just a very dark base, and possibly a shelf cloud on the leading edge.',
    physics:
      'Deep moist convection in a conditionally unstable atmosphere. Once a parcel is lifted past its level of free convection it accelerates upward on its own, latent heat release feeding the ascent, with updraughts that can exceed 50 m/s. The rise stops at the tropopause, where the temperature inversion halts buoyancy and the cloud spreads horizontally into the anvil. The strongest storms overshoot briefly, punching a dome above the anvil top.',
    tells:
      'The only cloud that produces lightning, hail or tornadoes. Cumulonimbus capillatus incus — fibrous top, anvil spread — marks a mature storm. Mammatus beneath the anvil, a lowered wall cloud (murus) beneath the base, or a shelf cloud on the leading edge all warrant attention.',
    confusion: {
      with: 'Cumulus congestus',
      how: 'Glaciation. Congestus tops are hard and sharply outlined; cumulonimbus tops are soft, fibrous and striated because they have frozen to ice crystals. That transition is exactly when lightning becomes possible.',
    },
    heightNote:
      'Base in the low étage, top routinely in the high étage and occasionally through the tropopause. WMO classifies it as a low cloud with vertical extent; the US NWS lists it under "vertical development."',
    species: ['calvus', 'capillatus'],
    varieties: [],
    features: [
      'incus',
      'mamma',
      'virga',
      'praecipitatio',
      'arcus',
      'murus',
      'cauda',
      'tuba',
    ],
    accessory: ['pileus', 'velum', 'pannus', 'flumen'],
    signature: 'cumulonimbus',
  },
]

export const GENERA_BY_ID = Object.fromEntries(GENERA.map((g) => [g.id, g]))

export const COMPOSITIONS = {
  ice: { label: 'Ice', hint: 'Ice crystals only' },
  mixed: { label: 'Mixed phase', hint: 'Water and ice together' },
  water: { label: 'Water', hint: 'Liquid droplets' },
}

/** Étage filter that folds the two vertical-extent genera into their own group. */
export function etageOf(genus) {
  return genus.verticalExtent ? 'vertical' : genus.etage
}
