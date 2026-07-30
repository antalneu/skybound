/**
 * Clouds in weather forecasting and in the climate system.
 * Sourced in /RESEARCH.md §6 — NASA CERES, NOAA GFDL, NASA Earth Observatory.
 */

export const COVERAGE = {
  global: 67,
  oceanClear: 10,
  landClear: 30,
  note: 'Multi-year satellite climatology. Over the oceans, fewer than one scene in ten is completely clear at any moment.',
}

export const CRE = [
  {
    id: 'sw',
    label: 'Shortwave',
    sub: 'Albedo — sunlight reflected back to space',
    value: -50,
    display: '≈ −50 W/m²',
    sign: 'cooling',
  },
  {
    id: 'lw',
    label: 'Longwave',
    sub: 'Greenhouse — outgoing infrared trapped',
    value: 30,
    display: '≈ +30 W/m²',
    sign: 'warming',
  },
  {
    id: 'net',
    label: 'Net',
    sub: 'What clouds do to the present-day climate',
    value: -20,
    display: '≈ −20 W/m²',
    sign: 'cooling',
    emphasis: true,
  },
]

export const CRE_NOTE =
  'Cloud radiative effect is the difference between all-sky and clear-sky radiation at the top of the atmosphere, measured by instruments such as NASA\'s CERES. On balance, clouds cool the Earth as it is today.'

export const HEIGHT_EFFECT = [
  {
    id: 'low',
    name: 'Low and thick',
    examples: 'Stratocumulus, Stratus',
    effect: 'cooling',
    text: 'Bright enough to reflect a large fraction of incoming sunlight, but with tops nearly as warm as the surface beneath — so they emit almost as much infrared as the ground they are hiding. The albedo term wins.',
    weight: 'Marine stratocumulus decks over cool eastern-ocean upwelling zones are the single most important cloud regime for planetary albedo.',
  },
  {
    id: 'high',
    name: 'High and thin',
    examples: 'Cirrus, Cirrostratus',
    effect: 'warming',
    text: 'Nearly transparent to sunlight, so they reflect little — but they radiate to space at the very cold temperature of the upper troposphere, emitting far less infrared than the surface would. The greenhouse term wins.',
  },
  {
    id: 'deep',
    name: 'Deep convective',
    examples: 'Cumulonimbus',
    effect: 'neutral',
    text: 'Very large shortwave and longwave effects that largely cancel each other out. Individually dramatic; in the global energy budget, close to a wash.',
  },
]

export const FEEDBACK = {
  headline: 'The largest single source of uncertainty in climate sensitivity.',
  body: [
    'Two things are easy to conflate here, and conflating them produces a wrong answer.',
    'The first is the sign of the cloud radiative effect today, which is negative — clouds cool the present climate. The second is the sign of the cloud *feedback* under warming, which depends on how cloud amount, height and optical thickness **change**. The first does not determine the second.',
    'Clouds also mask radiative forcing — by roughly 0.7 W/m², reducing effective climate sensitivity by on the order of 15%.',
  ],
  assessed:
    'The current assessed position (IPCC AR6) is that the net cloud feedback is positive, with reduced low-cloud cover over the subtropical oceans as the main contributor. Substantial uncertainty remains, and this is an active research frontier rather than a settled number.',
  aerosol: {
    title: 'Aerosol–cloud interactions',
    text: 'The related large uncertainty in anthropogenic forcing. More condensation nuclei split the same water into more, smaller droplets — a brighter cloud (the Twomey effect), and possibly a longer-lived one (the Albrecht or lifetime effect).',
  },
  unsettled: true,
}

export const FRONT_SEQUENCE = [
  {
    id: 'ci',
    genus: 'cirrus',
    lead: '24–48 h',
    text: 'First filaments appear high and thin, thickening from one horizon.',
  },
  {
    id: 'cs',
    genus: 'cirrostratus',
    lead: '12–24 h',
    text: 'The sky milks over. A 22° halo appears around the sun — the most reliable single sign in amateur forecasting.',
  },
  {
    id: 'as',
    genus: 'altostratus',
    lead: '6–12 h',
    text: 'Grey deepens, the halo goes. The sun becomes a bright patch behind ground glass, and shadows disappear.',
  },
  {
    id: 'ns',
    genus: 'nimbostratus',
    lead: 'now',
    text: 'The sun is gone completely and steady rain has begun. It will last for hours.',
  },
]

export const FORECAST_TELLS = [
  {
    sign: 'Altocumulus castellanus in the morning',
    means: 'Mid-level instability is already present. Thunderstorms are likely later the same day.',
  },
  {
    sign: 'A 22° halo',
    means: 'Cirrostratus is overhead. If it is thickening, rain in roughly 12–24 hours.',
  },
  {
    sign: 'Cumulus growing taller than it is wide',
    means: 'Deep instability. Congestus is one step from a thunderstorm.',
  },
  {
    sign: 'A cumulus top going soft and fibrous',
    means: 'It has glaciated. It is now a cumulonimbus, and lightning is possible.',
  },
  {
    sign: 'A shelf cloud on the horizon',
    means: 'The storm\'s cold outflow is arriving before the storm does. Expect a sharp wind shift.',
  },
  {
    sign: 'Stratus that has not lifted by mid-afternoon',
    means: 'It probably will not. The boundary layer is too stable to mix out.',
  },
]
