/**
 * Formation Science page content — the six-step chain from lifted air to
 * falling rain, plus lapse rates, stability and lifting mechanisms.
 *
 * Numbers are sourced in /RESEARCH.md §3. Where a value is a range rather
 * than a constant (notably the saturated adiabatic lapse rate) it is given
 * as a range, because the single textbook figures are simplifications.
 */

export const STEPS = [
  {
    n: 1,
    id: 'lift',
    title: 'Air is lifted',
    subtitle: 'Something has to push it up',
    body: "Almost every cloud on Earth begins with air being forced to rise. Cooling in place — the route to fog — is the exception, not the rule. There are four ways to make air go up, and each leaves a recognisable signature in the cloud that results.",
    figure: 'lift',
    facts: [
      { k: 'Convective', v: 'Surface heating floats buoyant plumes upward → Cu, Cb' },
      { k: 'Orographic', v: 'Flow forced over terrain → lenticular, cap cloud' },
      { k: 'Frontal', v: 'One air mass overrides another → layered sheets, or Cb' },
      { k: 'Convergence', v: 'Air converging horizontally must go somewhere → ITCZ' },
    ],
  },
  {
    n: 2,
    id: 'cool',
    title: 'It expands, and cools',
    subtitle: 'Adiabatic cooling — no heat is removed',
    body: 'Pressure falls with height, so a rising parcel expands. Expanding takes work, and with no heat exchanged with the surroundings that work comes out of the parcel\'s own internal energy. The parcel cools without losing a single joule to the air around it. This is why it is called adiabatic, and it is fixed by thermodynamics rather than by weather.',
    figure: 'cool',
    facts: [
      { k: 'Dry adiabatic rate', v: '9.8 °C per km — unsaturated air' },
      { k: 'Saturated rate', v: '≈4 °C/km warm and humid, 6–7 °C/km mid-troposphere' },
      { k: 'Why lower', v: 'Condensing water releases latent heat, offsetting the cooling' },
    ],
    flag: 'The saturated rate is not a constant. Warm air holds more vapour, so it releases more latent heat per kilometre. Single textbook values are convenient simplifications.',
  },
  {
    n: 3,
    id: 'saturate',
    title: 'It reaches saturation',
    subtitle: 'The lifting condensation level becomes the cloud base',
    body: 'Cool air holds less vapour than warm air. Keep cooling a parcel and it eventually reaches the point where the vapour it already carries is all it can hold — relative humidity hits 100%. The height where that happens is the lifting condensation level, and it is exactly where the cloud starts.',
    figure: 'saturate',
    facts: [
      { k: 'LCL', v: 'Where a lifted parcel first saturates' },
      { k: 'Consequence', v: 'Every cumulus in one air mass shares a base height' },
      { k: 'Visible proof', v: 'Flat cumulus bottoms, all lined up across the sky' },
    ],
  },
  {
    n: 4,
    id: 'nucleate',
    title: 'Vapour finds a surface',
    subtitle: 'Cloud condensation nuclei',
    body: 'Saturation alone is not enough. A droplet forming from pure vapour would start impossibly small, and its extreme surface curvature drives its equilibrium vapour pressure so high that it would evaporate instantly — the Kelvin effect. Homogeneous nucleation needs several hundred percent supersaturation. The real atmosphere rarely exceeds one percent. Clouds exist because the air is full of particles to condense onto.',
    figure: 'nucleate',
    facts: [
      { k: 'CCN size', v: '≈0.2 µm — a hundredth of the droplet it seeds' },
      { k: 'Sources', v: 'Sea salt, sulfates, mineral dust, smoke, pollen, ash' },
      { k: 'Köhler theory', v: 'Curvature pushes vapour pressure up, dissolved solute pulls it down' },
      { k: 'Ice needs help too', v: 'Water stays liquid to −38 °C without an ice-nucleating particle' },
    ],
  },
  {
    n: 5,
    id: 'grow',
    title: 'Droplets grow — and then stall',
    subtitle: 'Condensation runs out of road at about 20 µm',
    body: 'Vapour diffusing onto a droplet grows it quickly at first, but the growth rate scales as 1 over the radius: the bigger the droplet, the slower it gets. Condensation alone tops out around 10–20 µm. That is a cloud droplet, and a cloud droplet does not fall — it is far too light. Something else has to take over before anything can rain.',
    figure: 'grow',
    facts: [
      { k: 'CCN', v: '0.2 µm' },
      { k: 'Cloud droplet', v: '20 µm' },
      { k: 'Drizzle', v: '200 µm' },
      { k: 'Raindrop', v: '2,000 µm — 2 mm' },
    ],
    highlight:
      'A raindrop is 100× the diameter of a cloud droplet, so a million times the volume. It takes roughly a million cloud droplets to make one raindrop.',
  },
  {
    n: 6,
    id: 'rain',
    title: 'Two ways to bridge the gap',
    subtitle: 'Collision–coalescence, and Wegener–Bergeron–Findeisen',
    body: 'Nature has two mechanisms for turning cloud droplets into precipitation, and which one operates depends on whether there is ice in the cloud.',
    figure: 'rain',
    branches: [
      {
        name: 'Collision–coalescence',
        sub: 'Warm rain',
        text: 'Bigger drops fall faster than smaller ones, catch up with them, and merge. It needs a spread of droplet sizes to start — giant sea-salt nuclei help. This is how tropical maritime clouds rain without ever forming ice.',
      },
      {
        name: 'Wegener–Bergeron–Findeisen',
        sub: 'Cold rain',
        text: 'Where ice crystals and supercooled droplets coexist, saturation vapour pressure over ice is lower than over liquid. The air is simultaneously supersaturated for ice and subsaturated for water, so crystals grow by deposition while the droplets around them evaporate to feed them. Aggregation and riming finish the job.',
      },
    ],
    highlight:
      'Most rain in the mid-latitudes starts as snow and melts on the way down.',
  },
]

export const LIFTING = [
  {
    id: 'convective',
    name: 'Convective',
    text: 'The ground heats unevenly. Warm patches launch buoyant plumes that rise until they saturate.',
    makes: 'Cumulus, Cumulonimbus',
  },
  {
    id: 'orographic',
    name: 'Orographic',
    text: 'Wind meets terrain and has nowhere to go but up and over. Stable air keeps oscillating downwind.',
    makes: 'Lenticular clouds, cap clouds, upslope Stratus',
  },
  {
    id: 'frontal',
    name: 'Frontal',
    text: 'A warm front\'s slope is about 1:200 — gentle ascent over hundreds of kilometres. A cold front\'s is nearer 1:50, and the lift is violent.',
    makes: 'Ci → Cs → As → Ns at a warm front; Cb at a cold front',
  },
  {
    id: 'convergence',
    name: 'Convergence',
    text: 'When air flows together horizontally, mass conservation leaves only one direction available.',
    makes: 'The Intertropical Convergence Zone, sea-breeze fronts',
  },
]

export const LAPSE_RATES = [
  {
    id: 'dalr',
    label: 'Dry adiabatic',
    abbr: 'DALR',
    value: 9.8,
    display: '9.8 °C/km',
    note: 'Unsaturated parcel. Fixed by thermodynamics — not a property of the weather.',
  },
  {
    id: 'salr',
    label: 'Saturated adiabatic',
    abbr: 'SALR',
    value: 5.5,
    display: '≈4–7 °C/km',
    note: 'Latent heat release partly offsets expansion cooling. Varies with temperature and pressure.',
  },
  {
    id: 'elr',
    label: 'Environmental',
    abbr: 'ELR',
    value: 6.5,
    display: '≈6.5 °C/km average',
    note: 'The actual measured profile. A state of the atmosphere at a moment, not a law.',
  },
]

export const STABILITY = [
  {
    id: 'stable',
    name: 'Absolutely stable',
    condition: 'ELR < SALR',
    text: 'A lifted parcel is colder and denser than its surroundings at every level, so it sinks straight back down. Vertical motion is suppressed and cloud spreads sideways instead.',
    makes: 'Layered cloud — Stratus, Stratocumulus, Altostratus',
    tone: 'calm',
  },
  {
    id: 'conditional',
    name: 'Conditionally unstable',
    condition: 'SALR < ELR < DALR',
    text: 'Stable while the parcel is dry, unstable once it saturates. It needs a trigger to reach its condensation level — but past that point it accelerates upward under its own buoyancy. This is the common mid-latitude case, and every thunderstorm lives here.',
    makes: 'Cumulus growing through the day, and Cumulonimbus',
    tone: 'active',
  },
  {
    id: 'unstable',
    name: 'Absolutely unstable',
    condition: 'ELR > DALR',
    text: 'A lifted parcel stays warmer than its surroundings whether saturated or not, so it keeps rising. Rare and self-destroying — the convection it drives mixes the layer and removes the condition.',
    makes: 'Shallow superadiabatic layers over strongly heated ground',
    tone: 'violent',
  },
]

export const SIZE_SCALE = [
  { id: 'ccn', label: 'Condensation nucleus', microns: 0.2, r: 1 },
  { id: 'droplet', label: 'Cloud droplet', microns: 20, r: 10 },
  { id: 'drizzle', label: 'Drizzle drop', microns: 200, r: 22 },
  { id: 'raindrop', label: 'Raindrop', microns: 2000, r: 44 },
]
