/**
 * Photograph layer.
 *
 * Every image is hosted on Wikimedia Commons under a free licence (CC0, CC BY,
 * CC BY-SA, or public domain). Author and licence are recorded for each one and
 * rendered next to the image as well as collected on the Sources page, which is
 * what CC BY and CC BY-SA require.
 *
 * `remote` is the Commons source. It is NOT what the site loads — Wikimedia
 * rate-limits third-party hotlinking hard (30 of 36 HEAD requests came back 429
 * during sourcing), so `scripts/fetch-photos.mjs` vendors these locally and
 * emits WebP at several widths. The site loads those. `remote` stays here so
 * the provenance chain is intact and the fetch is reproducible.
 *
 * `alt` describes what the photo SHOWS, not what it is called. This is study
 * material — the alt text names the visible field marks so it teaches the same
 * thing the image does.
 */

/* ------------------------------------------------------------------ hero */

export const HERO = {
  id: 'hero',
  remote:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Cirrus_clouds_with_3D_look.jpg/1920px-Cirrus_clouds_with_3D_look.jpg',
  page: 'https://commons.wikimedia.org/wiki/File:Cirrus_clouds_with_3D_look.jpg',
  artist: 'Simon A. Eugster',
  licence: 'CC BY-SA 3.0',
  alt: 'A deep blue sky filled with layered white cirrus filaments, the strands overlapping at different heights so the sky reads as three-dimensional.',
  caption: 'Cirrus at several levels, the overlap giving the sky visible depth.',
}

/* ---------------------------------------------------------- ten genera */

export const GENUS_PHOTOS = {
  cirrus: [
    {
      id: 'cirrus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Cirrus_uncinus_und_Cirrus_fibratus_II.jpg/1920px-Cirrus_uncinus_und_Cirrus_fibratus_II.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Cirrus_uncinus_und_Cirrus_fibratus_II.jpg',
      artist: 'GerritR',
      licence: 'CC BY-SA 4.0',
      alt: 'Detached white cirrus filaments against blue sky. Several end in an upward hook with a denser head, and trail a long fibrous tail behind them.',
      caption:
        'Cirrus uncinus and fibratus. The hook is where the ice forms; the tail is the fall streak, dragged sideways by wind shear.',
      species: 'uncinus, fibratus',
    },
    {
      id: 'cirrus-2',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Cirrus_uncinus_in_Staffeln_angeordnet.jpg/1920px-Cirrus_uncinus_in_Staffeln_angeordnet.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Cirrus_uncinus_in_Staffeln_angeordnet.jpg',
      artist: 'GerritR',
      licence: 'CC BY-SA 4.0',
      alt: 'Rows of hooked cirrus arranged in parallel echelons across the sky, each hook trailing a tail in the same direction.',
      caption:
        'The same species in echelons — every tail points the same way, tracing the wind at that level.',
      species: 'uncinus',
    },
  ],

  cirrocumulus: [
    {
      id: 'cirrocumulus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Cirrocumulus_clouds_over_Bergsfjorden%2C_Senja%2C_Troms%2C_Norway%2C_2015_September.jpg/1920px-Cirrocumulus_clouds_over_Bergsfjorden%2C_Senja%2C_Troms%2C_Norway%2C_2015_September.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Cirrocumulus_clouds_over_Bergsfjorden,_Senja,_Troms,_Norway,_2015_September.jpg',
      artist: 'Ximonic (Simo Räsänen)',
      licence: 'CC BY-SA 3.0',
      alt: 'A high sheet of very small, evenly spaced white cloud grains over a Norwegian fjord. Every element is uniformly bright with no grey undersides.',
      caption:
        'A mackerel sky over Senja, Norway. The diagnostic is the absence of shading — every grain is uniformly lit.',
    },
    {
      id: 'cirrocumulus-2',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Cirrus_and_Cirrocumulus_over_Jakarta.jpg/1920px-Cirrus_and_Cirrocumulus_over_Jakarta.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Cirrus_and_Cirrocumulus_over_Jakarta.jpg',
      artist: 'Vitaium',
      licence: 'CC BY-SA 4.0',
      alt: 'Fine granular cirrocumulus alongside wispier cirrus filaments in the same sky.',
      caption:
        'Cirrocumulus and cirrus together — useful for scale, since both sit at the same altitude.',
    },
  ],

  cirrostratus: [
    {
      id: 'cirrostratus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/22%C2%B0-Halo_in_Cirrostratus_fibratus_bei_Limburg_II.jpg/1920px-22%C2%B0-Halo_in_Cirrostratus_fibratus_bei_Limburg_II.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:22%C2%B0-Halo_in_Cirrostratus_fibratus_bei_Limburg_II.jpg',
      artist: 'GerritR',
      licence: 'CC BY-SA 4.0',
      alt: 'A milky, almost transparent veil of high cloud covering the whole sky, with a complete circular halo of light ringing the sun.',
      caption:
        'Cirrostratus fibratus with a 22° halo — the single most reliable field mark for this genus.',
      species: 'fibratus',
    },
    {
      id: 'cirrostratus-2',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Cirrostratus_transformiert_zu_Altostratus_I_farbusm.jpg/1920px-Cirrostratus_transformiert_zu_Altostratus_I_farbusm.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Cirrostratus_transformiert_zu_Altostratus_I_farbusm.jpg',
      artist: 'GerritR',
      licence: 'CC BY-SA 4.0',
      alt: 'A thin high veil thickening and lowering into a greyer, denser sheet across the frame.',
      caption:
        'Cirrostratus thickening into altostratus — the warm-front sequence caught mid-transition.',
    },
  ],

  altocumulus: [
    {
      id: 'altocumulus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Altocumulus_stratiformis_translucidus_perlucidus.jpg/1920px-Altocumulus_stratiformis_translucidus_perlucidus.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Altocumulus_stratiformis_translucidus_perlucidus.jpg',
      artist: 'GerritR',
      licence: 'CC BY-SA 4.0',
      alt: 'A broad sheet of rounded mid-level cloud masses with clearly shaded grey undersides, separated by gaps of blue sky.',
      caption:
        'Altocumulus stratiformis translucidus perlucidus. The shaded undersides are what separate it from cirrocumulus.',
      species: 'stratiformis',
    },
    {
      id: 'altocumulus-2',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Altocumulus_stratiformis_translucidus_perlucidus_undulatus.jpg/1920px-Altocumulus_stratiformis_translucidus_perlucidus_undulatus.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Altocumulus_stratiformis_translucidus_perlucidus_undulatus.jpg',
      artist: 'GerritR',
      licence: 'CC BY-SA 4.0',
      alt: 'The same rounded mid-level elements, here organised into regular parallel wave crests running across the sky.',
      caption: 'The undulatus variety — the layer has been set oscillating by wave motion.',
      species: 'stratiformis',
    },
  ],

  altostratus: [
    {
      id: 'altostratus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017-06-22_16_57_51_Sun_shining_dimly_through_an_altostratus_cloud_layer_over_Ladybank_Lane_in_the_Chantilly_Highlands_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg/1920px-thumbnail.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:2017-06-22_16_57_51_Sun_shining_dimly_through_an_altostratus_cloud_layer_over_Ladybank_Lane_in_the_Chantilly_Highlands_section_of_Oak_Hill,_Fairfax_County,_Virginia.jpg',
      artist: 'Famartin',
      licence: 'CC BY-SA 4.0',
      alt: 'A featureless grey-blue sheet covering the whole sky, with the sun showing only as a diffuse bright patch with no defined edge.',
      caption:
        'The definitive altostratus test: the sun visible as through ground glass, with no disc and no halo.',
    },
  ],

  nimbostratus: [
    {
      id: 'nimbostratus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Nimbostratus_pannus.jpg/1920px-Nimbostratus_pannus.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Nimbostratus_pannus.jpg',
      artist: 'GerritR',
      licence: 'CC BY-SA 4.0',
      alt: 'A uniformly dark grey rain layer with no visible base, its underside blurred by falling precipitation, with ragged darker shreds drifting beneath it.',
      caption:
        'Nimbostratus with pannus. The base has no definition because the rain falling out of it smears the boundary.',
    },
    {
      id: 'nimbostratus-2',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Nimbostratus_Forest.jpg/1920px-Nimbostratus_Forest.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Nimbostratus_Forest.jpg',
      artist: 'Gabriel Picard',
      licence: 'CC BY-SA 4.0',
      alt: 'A heavy, featureless dark grey overcast pressing low over a forest, with no structure visible anywhere in the cloud.',
      caption: 'Complete opacity — the sun cannot be located anywhere in the sky.',
    },
  ],

  stratocumulus: [
    {
      id: 'stratocumulus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Stratocumulus_stratiformis_duplicatus_II.jpg/1920px-Stratocumulus_stratiformis_duplicatus_II.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Stratocumulus_stratiformis_duplicatus_II.jpg',
      artist: 'GerritR',
      licence: 'CC BY-SA 4.0',
      alt: 'Large, lumpy grey cloud rolls filling the low sky, with distinctly dark undersides and narrow bright gaps of light between them.',
      caption:
        'Stratocumulus stratiformis duplicatus — two layers at slightly different heights. The elements are large and clearly shaded.',
      species: 'stratiformis',
    },
    {
      id: 'stratocumulus-2',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Stratocumulus_lacunosus.jpg/1920px-Stratocumulus_lacunosus.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Stratocumulus_lacunosus.jpg',
      artist: 'Berrucomons',
      licence: 'CC BY-SA 3.0',
      alt: 'A low cloud sheet perforated by regularly spaced rounded holes, giving a net or honeycomb appearance.',
      caption: 'The rare lacunosus variety — regular holes rather than regular cloud.',
    },
  ],

  stratus: [
    {
      id: 'stratus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/2016-10-01_18_00_40_Low_stratus_over_a_field_at_the_National_Weather_Service%27s_Baltimore-Washington_Weather_Forecast_Office_on_Old_Ox_Road_%28Virginia_State_Secondary_Route_606%29_in_Sterling%2C_Loudoun_County%2C_Virginia.jpg/1920px-thumbnail.jpg',
      page: "https://commons.wikimedia.org/wiki/File:2016-10-01_18_00_40_Low_stratus_over_a_field_at_the_National_Weather_Service's_Baltimore-Washington_Weather_Forecast_Office_on_Old_Ox_Road_(Virginia_State_Secondary_Route_606)_in_Sterling,_Loudoun_County,_Virginia.jpg",
      artist: 'Famartin',
      licence: 'CC BY-SA 4.0',
      alt: 'A flat, featureless grey cloud layer hanging very low over an open field, with a uniform base and no internal structure.',
      caption:
        'Low stratus over a field. Lower it another hundred metres and the same cloud would be called fog.',
    },
  ],

  cumulus: [
    {
      id: 'cumulus-1',
      remote: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Cumulus_humilis_clouds.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Cumulus_humilis_clouds.jpg',
      artist: 'Toby Hudson',
      licence: 'CC BY-SA 3.0',
      alt: 'Scattered detached white heaps with bright cauliflower tops and flat dark bases, every base sitting at the same height above the ground.',
      caption:
        'Cumulus humilis — wider than they are tall. Every base is level, because every parcel saturates at the same altitude.',
      species: 'humilis',
    },
    {
      id: 'cumulus-2',
      remote: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Cumulus_humilis_-_39.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Cumulus_humilis_-_39.jpg',
      artist: 'Medium69 (William Crochot)',
      licence: 'CC BY-SA 4.0',
      alt: 'Fair-weather cumulus with sharply outlined bright tops and flat shaded bottoms against a clear blue sky.',
      caption: 'The textbook fair-weather cloud: sharp outline, brilliant sunlit crown, flat base.',
      species: 'humilis',
    },
  ],

  cumulonimbus: [
    {
      id: 'cumulonimbus-1',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Anvil_of_a_Thunderstorm_Cloud.jpg/1920px-Anvil_of_a_Thunderstorm_Cloud.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Anvil_of_a_Thunderstorm_Cloud.jpg',
      artist: 'Eulenjäger',
      licence: 'CC BY-SA 3.0',
      alt: 'A towering storm cloud whose top has flattened and spread sideways into a wide fibrous anvil, with a dark base far below.',
      caption:
        'The incus. The updraught rose until the tropopause stopped it, then had nowhere to go but sideways.',
      species: 'capillatus',
    },
    {
      id: 'cumulonimbus-2',
      remote:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cumulonimbus_cloud_over_Africa.jpg/1920px-Cumulonimbus_cloud_over_Africa.jpg',
      page: 'https://commons.wikimedia.org/wiki/File:Cumulonimbus_cloud_over_Africa.jpg',
      artist: 'NASA',
      licence: 'Public domain',
      alt: 'A single cumulonimbus photographed from orbit above Africa, its anvil spreading flat and casting a long shadow across the cloud deck below.',
      caption:
        'The same cloud from the International Space Station — the only view that shows the full vertical extent at once.',
    },
  ],
}

/* -------------------------------------------------- rare & special clouds */

export const PHENOMENON_PHOTOS = {
  noctilucent: {
    id: 'noctilucent',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Helkivad_%C3%B6%C3%B6pilved_Kuresoo_kohal.jpg/1920px-Helkivad_%C3%B6%C3%B6pilved_Kuresoo_kohal.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Helkivad_%C3%B6%C3%B6pilved_Kuresoo_kohal.jpg',
    artist: 'Martin Koitmäe',
    licence: 'CC BY-SA 4.0',
    alt: 'Electric-blue rippled filaments glowing high in a deep twilight sky over a dark bog, while the landscape below is already in full darkness.',
    caption:
      'Noctilucent cloud over Kuresoo bog, Estonia. At 80 km these are still in sunlight long after the ground has gone dark.',
  },
  nacreous: {
    id: 'nacreous',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Nacreous_clouds_Antarctica.jpg/1920px-Nacreous_clouds_Antarctica.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Nacreous_clouds_Antarctica.jpg',
    artist: 'Alan Light',
    licence: 'CC BY 2.0',
    alt: 'Intense bands of pink, green and gold iridescence in a lens-shaped cloud over an Antarctic horizon, the colours far more saturated than ordinary cloud.',
    caption:
      'Nacreous cloud over Antarctica. The colour purity comes from unusually uniform ~10 µm particles.',
  },
  mammatus: {
    id: 'mammatus',
    remote: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Mammatus-clouds-Tulsa-1973.png',
    page: 'https://commons.wikimedia.org/wiki/File:Mammatus-clouds-Tulsa-1973.png',
    artist: 'NOAA',
    licence: 'Public domain',
    alt: 'Rows of smooth rounded pouches hanging down from the underside of a dark storm cloud base, each lobe bulging downward.',
    caption:
      'Mammatus over Tulsa, 1973. Sinking, evaporating, hydrometeor-laden air — convection running in reverse.',
  },
  lenticular: {
    id: 'lenticular',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Lenticular_clouds_%28Altocumulus_lenticularis%29_%2830368465690%29.jpg/1920px-Lenticular_clouds_%28Altocumulus_lenticularis%29_%2830368465690%29.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Lenticular_clouds_(Altocumulus_lenticularis)_(30368465690).jpg',
    artist: 'Giuseppe Donatiello',
    licence: 'CC0',
    alt: 'Smooth, sharply outlined lens-shaped clouds stacked in the sky like a pile of plates, with clean edges and no ragged detail.',
    caption: 'Altocumulus lenticularis. The cloud is stationary; the air is streaming straight through it.',
  },
  'kelvin-helmholtz': {
    id: 'kelvin-helmholtz',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Kelvin_Helmholtz_cloud_formation_during_Hartford_sunset.jpg/1920px-Kelvin_Helmholtz_cloud_formation_during_Hartford_sunset.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Kelvin_Helmholtz_cloud_formation_during_Hartford_sunset.jpg',
    artist: 'Paul Danese',
    licence: 'CC0',
    alt: 'A row of near-identical cloud billows along a single level, each one curling forward over itself like a breaking ocean wave, lit orange by a low sun.',
    caption:
      'Kelvin–Helmholtz billows at sunset over Hartford. Each crest is dragged forward of its base by shear, then curls.',
  },
  asperitas: {
    id: 'asperitas',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Stratocumulus_stratiformis_asperitas_am_Rand_eines_Regengebiets_III.jpg/1920px-Stratocumulus_stratiformis_asperitas_am_Rand_eines_Regengebiets_III.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Stratocumulus_stratiformis_asperitas_am_Rand_eines_Regengebiets_III.jpg',
    artist: 'GerritR',
    licence: 'CC BY-SA 4.0',
    alt: 'A cloud base thrown into chaotic, sharply defined waves and hollows, lit from within, resembling a rough sea surface seen from underneath.',
    caption:
      'Asperitas on a stratocumulus base at the edge of a rain area. Recognised in 2017; the mechanism is still open.',
  },
  arcus: {
    id: 'arcus',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Cumulonimbus_arcus_%C3%BCber_Schwanebeck.jpg/1920px-Cumulonimbus_arcus_%C3%BCber_Schwanebeck.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Cumulonimbus_arcus_%C3%BCber_Schwanebeck.jpg',
    artist: 'Birkho',
    licence: 'CC BY-SA 4.0',
    alt: 'A low, dark, wedge-shaped bar of cloud spanning the horizon along the leading edge of an advancing storm, attached to the cloud mass above it.',
    caption:
      'A shelf cloud — arcus attached to the parent cumulonimbus, marking the leading edge of the cold outflow.',
  },
  cavum: {
    id: 'cavum',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Altocumulus_stratiformis_cavum_mit_langer_Kante.jpg/1920px-Altocumulus_stratiformis_cavum_mit_langer_Kante.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Altocumulus_stratiformis_cavum_mit_langer_Kante.jpg',
    artist: 'GerritR',
    licence: 'CC BY-SA 4.0',
    alt: 'A clean elongated gap punched through an otherwise unbroken thin cloud sheet, with a wisp of trailing ice cloud left in the middle of the opening.',
    caption:
      'A fallstreak hole in altocumulus. An aircraft triggered freezing; the ice grew, fell out, and left the hole.',
  },
  contrails: {
    id: 'contrails',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Three_Contrails_%28Condensation_Trail%29_visible_simultaneously.jpg/1920px-Three_Contrails_%28Condensation_Trail%29_visible_simultaneously.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Three_Contrails_(Condensation_Trail)_visible_simultaneously.jpg',
    artist: 'Iamdev37',
    licence: 'CC BY-SA 4.0',
    alt: 'Three straight white condensation trails crossing a blue sky at different angles, the older ones visibly broader and more diffuse than the newest.',
    caption:
      'Three contrails at different ages. Spreading means the ambient air is supersaturated with respect to ice.',
  },
  pyrocb: {
    id: 'pyrocb',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Pyrocumulus_cloud_produced_by_the_Dixie_Fire_on_July_22-5865.jpg/1920px-Pyrocumulus_cloud_produced_by_the_Dixie_Fire_on_July_22-5865.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Pyrocumulus_cloud_produced_by_the_Dixie_Fire_on_July_22-5865.jpg',
    artist: 'Frank Schulenburg',
    licence: 'CC BY-SA 4.0',
    alt: 'A tall brown-grey convective tower boiling directly up out of a wildfire smoke plume, its upper part billowing like a thunderstorm.',
    caption:
      'Pyrocumulus above the Dixie Fire, California, 2021. The fire supplies the heat; the smoke supplies the nuclei.',
  },
}

/* ------------------------------------------------------ optical phenomena */

export const OPTIC_PHOTOS = {
  halo22: {
    id: 'halo22',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Halo_in_cirrostratus_1.jpg/1920px-Halo_in_cirrostratus_1.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Halo_in_cirrostratus_1.jpg',
    artist: 'Chrumps',
    licence: 'CC BY 2.5',
    alt: 'A complete circle of light ringing the sun in a thin high cloud veil, the ring noticeably reddish on its inner edge and fading outward.',
    caption:
      '22° halo in cirrostratus. Sharp inner edge, soft outer fade — the signature of a minimum deviation angle.',
  },
  sundog: {
    id: 'sundog',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Sun_dog_with_reflection_over_Brofjorden.jpg/1920px-Sun_dog_with_reflection_over_Brofjorden.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Sun_dog_with_reflection_over_Brofjorden.jpg',
    artist: 'W.carter',
    licence: 'CC BY-SA 4.0',
    alt: 'A bright, faintly rainbow-tinted patch of light beside the sun at the same height above the horizon, over water.',
    caption: 'A parhelion over Brofjorden, Sweden — 22° from the sun and at exactly the sun’s own altitude.',
  },
  cza: {
    id: 'cza',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Circumzenithal_arc_and_sundog_over_Cirrus_clouds.jpg/1920px-Circumzenithal_arc_and_sundog_over_Cirrus_clouds.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Circumzenithal_arc_and_sundog_over_Cirrus_clouds.jpg',
    artist: 'Brocken Inaglory',
    licence: 'CC BY-SA 3.0',
    alt: 'A short, vividly coloured arc high in the sky curving away from the sun, with colours purer and more separated than a rainbow, alongside a sun dog.',
    caption: 'A circumzenithal arc with a sun dog. Only forms when the sun is below 32° altitude.',
  },
  corona: {
    id: 'corona',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Lunar_Corona.jpg/1920px-Lunar_Corona.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Lunar_Corona.jpg',
    artist: 'Wing-Chi Poon',
    licence: 'CC BY-SA 2.5',
    alt: 'A small bright disc of light around the moon, ringed by coloured bands running blue on the inside and reddish on the outside.',
    caption:
      'A lunar corona. Colour order is reversed from a halo — blue inside, red outside — because this is diffraction, not refraction.',
  },
  iridescence: {
    id: 'iridescence',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Highly_iridising_altocumulus.jpg/1920px-Highly_iridising_altocumulus.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Highly_iridising_altocumulus.jpg',
    artist: 'C messier',
    licence: 'CC BY-SA 3.0',
    alt: 'Irregular patches of pastel pink, green and gold along the thin edges of a mid-level cloud, the bands following the cloud edge rather than forming rings.',
    caption:
      'Iridescent altocumulus. Same optics as a corona, but varied droplet sizes break the rings into bands.',
  },
  glory: {
    id: 'glory',
    remote: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Gloria_around_plane_shadow.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Gloria_around_plane_shadow.jpg',
    artist: 'Sudika',
    licence: 'CC BY-SA 3.0',
    alt: "Concentric coloured rings centred exactly on an aircraft's shadow cast on the cloud deck below.",
    caption: 'A glory ringing the aircraft’s own shadow — centred on the antisolar point, always.',
  },
  crepuscular: {
    id: 'crepuscular',
    remote:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/2023-07-29_06_54_51_Crepuscular_rays_through_a_break_in_a_altostratus_cloud_layer_viewed_from_Burlington_County_Route_630_%28Woodlane_Road%29_in_Westampton_Township%2C_Burlington_County%2C_New_Jersey.jpg/1920px-thumbnail.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:2023-07-29_06_54_51_Crepuscular_rays_through_a_break_in_a_altostratus_cloud_layer_viewed_from_Burlington_County_Route_630_(Woodlane_Road)_in_Westampton_Township,_Burlington_County,_New_Jersey.jpg',
    artist: 'Famartin',
    licence: 'CC BY-SA 4.0',
    alt: 'Shafts of sunlight fanning out through a break in a grey cloud layer, appearing to spread as they descend toward the horizon.',
    caption: 'Crepuscular rays through altostratus. The beams are parallel — the fan is perspective.',
  },
}

/** Flat list of every photo, used by the fetch script and the Sources page. */
export const ALL_PHOTOS = [
  { subject: 'Home — hero', ...HERO },
  ...Object.entries(GENUS_PHOTOS).flatMap(([genus, list]) =>
    list.map((p) => ({ subject: genus[0].toUpperCase() + genus.slice(1), ...p })),
  ),
  ...Object.entries(PHENOMENON_PHOTOS).map(([, p]) => ({ subject: p.id, ...p })),
  ...Object.entries(OPTIC_PHOTOS).map(([, p]) => ({ subject: p.id, ...p })),
]
