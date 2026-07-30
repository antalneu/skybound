/**
 * Data audit.
 *
 * Checks every data-backed claim in the content layer that can be verified
 * without a network call: internal consistency, cross-references, unit
 * sanity, and agreement with the figures recorded in RESEARCH.md.
 *
 * This does NOT verify the science against the original sources — that was
 * done during the research pass and is recorded in RESEARCH.md. What it does
 * is catch the failure mode that actually bites: content drifting out of sync
 * with itself or with the research after edits.
 *
 *   npm run audit
 */

import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { ETAGES, GENERA, GENERA_BY_ID, etageOf } from '../src/data/genera.js'
import { SPECIES, VARIETIES, FEATURES, ACCESSORY, TERM_BY_ID } from '../src/data/taxonomy.js'
import { RARE, OPTICS } from '../src/data/phenomena.js'
import { LAPSE_RATES, SIZE_SCALE, STEPS } from '../src/data/formation.js'
import { CRE, COVERAGE } from '../src/data/climate.js'
import { ALL_PHOTOS, GENUS_PHOTOS, PHENOMENON_PHOTOS, OPTIC_PHOTOS } from '../src/data/images.js'
import {
  AQI_BANDS,
  AQ_POLLUTANTS,
  RAMPS,
  aqiBand,
  dominantPollutant,
  fetchAtmosphereGrid,
  makeFieldSampler,
  mercLat,
  mercY,
  rampColor,
  windToVector,
} from '../src/data/liveData.js'

const problems = []
const notes = []
const fail = (area, msg) => problems.push({ area, msg })
const note = (area, msg) => notes.push({ area, msg })

/* ------------------------------------------------------- 1. genera ---- */

const EXPECTED_GENERA = [
  'cirrus', 'cirrocumulus', 'cirrostratus',
  'altocumulus', 'altostratus', 'nimbostratus',
  'stratocumulus', 'stratus', 'cumulus', 'cumulonimbus',
]

if (GENERA.length !== 10) fail('genera', `expected 10 genera, found ${GENERA.length}`)
for (const id of EXPECTED_GENERA) {
  if (!GENERA_BY_ID[id]) fail('genera', `missing genus: ${id}`)
}

for (const g of GENERA) {
  const [lo, hi] = g.baseKm
  if (!(lo <= hi)) fail('altitude', `${g.name}: base range inverted (${lo} > ${hi})`)
  if (!(hi <= g.topKm)) fail('altitude', `${g.name}: top ${g.topKm} km is below base max ${hi} km`)
  if (lo < 0) fail('altitude', `${g.name}: negative base ${lo}`)
  if (g.topKm > 20) fail('altitude', `${g.name}: top ${g.topKm} km exceeds the tropopause everywhere`)

  // Base must sit inside the WMO band for its étage (temperate reference).
  const band = ETAGES[g.etage]?.bands?.temperate
  if (!band) {
    fail('etage', `${g.name}: unknown étage "${g.etage}"`)
  } else {
    const [bLo, bHi] = band
    // Nimbostratus is the documented exception — WMO files it middle, its base
    // is routinely lower. RESEARCH.md §8 flag 2 covers this.
    if (g.id !== 'nimbostratus' && (lo < bLo - 0.01 || lo > bHi + 0.01)) {
      fail('etage', `${g.name}: base ${lo} km outside ${g.etage} band ${bLo}–${bHi} km`)
    }
  }

  if (!['ice', 'mixed', 'water'].includes(g.composition)) {
    fail('composition', `${g.name}: invalid composition "${g.composition}"`)
  }

  // Cross-references into the taxonomy must resolve.
  for (const key of ['species', 'varieties', 'features', 'accessory']) {
    for (const term of g[key] ?? []) {
      if (!TERM_BY_ID[term]) fail('taxonomy', `${g.name}.${key}: unknown term "${term}"`)
    }
  }

  // The lookalike must resolve to a real genus (this broke once already).
  const first = g.confusion?.with?.split(' ')[0]
  if (!GENERA.some((x) => x.name === first)) {
    fail('confusion', `${g.name}: confusion.with "${g.confusion?.with}" resolves to no genus`)
  }
}

/* ----------------------------------------------------- 2. taxonomy ---- */

const COUNTS = { species: [SPECIES, 15], varieties: [VARIETIES, 9], features: [FEATURES, 11], accessory: [ACCESSORY, 4] }
for (const [name, [list, expected]] of Object.entries(COUNTS)) {
  if (list.length !== expected) {
    fail('taxonomy', `${name}: expected ${expected} per WMO, found ${list.length}`)
  }
}

// Every taxonomy term should be reachable from at least one genus, otherwise
// it is documented but unreferenced.
const referenced = new Set(GENERA.flatMap((g) => [...g.species, ...g.varieties, ...g.features, ...g.accessory]))
for (const t of [...SPECIES, ...VARIETIES, ...FEATURES, ...ACCESSORY]) {
  if (!referenced.has(t.id)) note('taxonomy', `"${t.id}" is defined but not listed on any genus`)
}

/* ------------------------------------------------------- 3. physics ---- */

const dalr = LAPSE_RATES.find((r) => r.id === 'dalr')
if (Math.abs(dalr.value - 9.8) > 0.05) fail('physics', `DALR is ${dalr.value}, should be 9.8 °C/km`)

const elr = LAPSE_RATES.find((r) => r.id === 'elr')
if (Math.abs(elr.value - 6.5) > 0.05) fail('physics', `ELR is ${elr.value}, should be ~6.5 °C/km`)

const salr = LAPSE_RATES.find((r) => r.id === 'salr')
if (salr.value >= dalr.value) fail('physics', 'SALR must be below DALR — latent heat offsets expansion cooling')

// The million-droplets claim has to survive its own arithmetic.
const droplet = SIZE_SCALE.find((s) => s.id === 'droplet')
const raindrop = SIZE_SCALE.find((s) => s.id === 'raindrop')
const volumeRatio = (raindrop.microns / droplet.microns) ** 3
if (Math.abs(volumeRatio - 1e6) / 1e6 > 0.05) {
  fail('physics', `raindrop/droplet volume ratio is ${volumeRatio.toExponential(2)}, but the copy claims ~10^6`)
}
if (SIZE_SCALE.some((s, i) => i > 0 && s.microns <= SIZE_SCALE[i - 1].microns)) {
  fail('physics', 'SIZE_SCALE is not monotonically increasing')
}
if (STEPS.length !== 6) fail('physics', `formation walkthrough should have 6 steps, found ${STEPS.length}`)

/* ------------------------------------------------------- 4. climate ---- */

const sw = CRE.find((c) => c.id === 'sw')
const lw = CRE.find((c) => c.id === 'lw')
const net = CRE.find((c) => c.id === 'net')
if (sw.value >= 0) fail('climate', 'shortwave CRE must be negative (cooling)')
if (lw.value <= 0) fail('climate', 'longwave CRE must be positive (warming)')
if (Math.abs(sw.value + lw.value - net.value) > 1) {
  fail('climate', `CRE does not balance: ${sw.value} + ${lw.value} != ${net.value}`)
}
if (COVERAGE.global < 60 || COVERAGE.global > 75) {
  fail('climate', `global cloud cover ${COVERAGE.global}% is outside the satellite-derived 60–75% range`)
}

/* -------------------------------------------------------- 5. photos ---- */

let manifest = {}
try {
  manifest = JSON.parse(await readFile('src/data/photo-manifest.json', 'utf8'))
} catch {
  fail('photos', 'photo-manifest.json missing — run `npm run photos`')
}

for (const p of ALL_PHOTOS) {
  if (!p.artist) fail('photos', `${p.id}: no artist recorded (CC BY/BY-SA require attribution)`)
  if (!p.licence) fail('photos', `${p.id}: no licence recorded`)
  if (!p.page?.startsWith('https://commons.wikimedia.org/')) fail('photos', `${p.id}: source page is not a Commons file page`)
  if (!p.alt || p.alt.length < 40) fail('photos', `${p.id}: alt text missing or too short to be useful as study material`)
  if (!manifest[p.id]) note('photos', `${p.id}: not in manifest — will render as a labelled placeholder`)
}
for (const id of EXPECTED_GENERA) {
  if (!GENUS_PHOTOS[id]?.length) fail('photos', `genus ${id} has no photographs`)
}
for (const r of RARE) {
  if (!PHENOMENON_PHOTOS[r.id]) fail('photos', `rare cloud "${r.id}" has no photograph entry`)
}
for (const o of OPTICS) {
  if (!OPTIC_PHOTOS[o.id]) fail('photos', `optic "${o.id}" has no photograph entry`)
}

/* ---------------------------------------------------- 6. live data ---- */

// Meteorological convention: direction is where the wind comes FROM.
const cardinals = [
  [0, 'v', -10],
  [90, 'u', -10],
  [180, 'v', 10],
  [270, 'u', 10],
]
for (const [deg, axis, expected] of cardinals) {
  const got = windToVector(10, deg)[axis]
  if (Math.abs(got - expected) > 0.01) {
    fail('livedata', `windToVector(10, ${deg}°): ${axis}=${got.toFixed(2)}, expected ${expected}`)
  }
}

// Mercator round-trip.
for (const lat of [-84, -45, 0, 45, 51.56, 84]) {
  const back = mercLat(mercY(lat))
  if (Math.abs(back - lat) > 1e-9) fail('livedata', `Mercator round-trip failed at ${lat}: got ${back}`)
}

// Sampler must be exact at grid nodes even with smoothstep weighting.
const testGrid = {
  nx: 2, ny: 2,
  bounds: { west: 0, south: 0, east: 10, north: 10 },
  points: [
    { cloud: [0] }, { cloud: [100] },
    { cloud: [0] }, { cloud: [100] },
  ],
}
const s = makeFieldSampler(testGrid, 'cloud', 0)
if (Math.abs(s(0, 5) - 0) > 1e-9) fail('livedata', `sampler at west node = ${s(0, 5)}, expected 0`)
if (Math.abs(s(10, 5) - 100) > 1e-9) fail('livedata', `sampler at east node = ${s(10, 5)}, expected 100`)
if (Math.abs(s(5, 5) - 50) > 1e-9) fail('livedata', `sampler at midpoint = ${s(5, 5)}, expected 50 (smoothstep is symmetric)`)
if (s(50, 5) !== null) fail('livedata', 'sampler should return null outside bounds')

// Ramps must be monotonic in their stop positions and cover their domain.
for (const [field, r] of Object.entries(RAMPS)) {
  const ats = r.stops.map((x) => x.at)
  if (ats.some((v, i) => i > 0 && v <= ats[i - 1])) fail('livedata', `${field} ramp stops are not increasing`)
  if (ats[0] > r.domain[0]) fail('livedata', `${field} ramp starts at ${ats[0]}, above domain min ${r.domain[0]}`)
  if (ats[ats.length - 1] < r.domain[1]) fail('livedata', `${field} ramp ends at ${ats[ats.length - 1]}, below domain max ${r.domain[1]}`)
  if (r.stops.some((x) => x.c.length !== 4)) fail('livedata', `${field} ramp stops must be RGBA`)
}

/* ------------------------------------------ 6a. request chunking ---- */

/**
 * A grid larger than ~150 points is split across several HTTP requests, and the
 * responses are concatenated. Point order carries ALL the geography — the
 * sampler addresses cells as points[j * nx + i] — so a chunk boundary that
 * drops, reorders or short-changes a single point silently rotates part of the
 * map. Nothing about the result would look broken; it would just be wrong.
 *
 * Tested against a stubbed fetch so it runs offline and costs no quota. Open-
 * Meteo's per-minute ceiling is 600 calls and one refresh is a single burst, so
 * exercising this for real would be self-defeating.
 */
{
  const realFetch = globalThis.fetch
  const calls = []

  globalThis.fetch = async (url) => {
    const u = new URL(url)
    const lats = u.searchParams.get('latitude').split(',').map(Number)
    const lons = u.searchParams.get('longitude').split(',').map(Number)
    calls.push(lats.length)
    // Echo the coordinates back, and encode each point's identity in its data
    // so a reordering is detectable rather than merely suspected.
    return {
      ok: true,
      status: 200,
      json: async () =>
        lats.map((lat, k) => ({
          latitude: lat,
          longitude: lons[k],
          hourly: {
            time: [1000, 2000],
            cloud_cover: [lat * 1000 + lons[k], 0],
            precipitation: [0, 0],
            temperature_2m: [0, 0],
            wind_speed_10m: [0, 0],
            wind_direction_10m: [0, 0],
          },
        })),
    }
  }

  try {
    const nx = 25
    const ny = 15
    const g = await fetchAtmosphereGrid({ west: -180, east: 180, south: -84, north: 84 }, nx, ny)

    if (g.status !== 'live') fail('chunking', `stubbed fetch produced status "${g.status}"`)
    if (g.points.length !== nx * ny) {
      fail('chunking', `merged ${g.points.length} points, expected ${nx * ny}`)
    }
    if (calls.length < 2) fail('chunking', `a ${nx * ny}-point grid issued only ${calls.length} request(s) — chunking did not engage`)
    if (calls.some((n) => n > 150)) fail('chunking', `a request carried ${Math.max(...calls)} coordinates, over the 150 cap`)
    if (calls.reduce((a, b) => a + b, 0) !== nx * ny) {
      fail('chunking', 'requested coordinate count does not equal the grid size')
    }

    // Every cell must hold the value belonging to its own coordinates.
    const yTop = mercY(84)
    const yBot = mercY(-84)
    let wrong = 0
    for (let j = 0; j < ny; j++) {
      const lat = Number(mercLat(yTop + ((yBot - yTop) * j) / (ny - 1)).toFixed(3))
      for (let i = 0; i < nx; i++) {
        const lon = Number((-180 + (360 / (nx - 1)) * i).toFixed(3))
        const p = g.points[j * nx + i]
        if (Math.abs(p.cloud[0] - (lat * 1000 + lon)) > 1e-6) wrong++
      }
    }
    if (wrong) fail('chunking', `${wrong} of ${nx * ny} cells hold another point's data — chunk merge is misordered`)

    // A short chunk must fail loudly, not silently shift every later point.
    globalThis.fetch = async (url) => {
      const u = new URL(url)
      const lats = u.searchParams.get('latitude').split(',').map(Number)
      return {
        ok: true,
        status: 200,
        json: async () =>
          lats.slice(0, -1).map((lat) => ({
            latitude: lat,
            longitude: 0,
            hourly: { time: [1000], cloud_cover: [1], precipitation: [0], temperature_2m: [0], wind_speed_10m: [0], wind_direction_10m: [0] },
          })),
      }
    }
    const short = await fetchAtmosphereGrid({ west: -180, east: 180, south: -84, north: 84 }, nx, ny)
    if (short.status === 'live') {
      fail('chunking', 'a response missing a point was accepted as live — the length guard is not working')
    }
  } finally {
    globalThis.fetch = realFetch
  }
}

/* ------------------------------------------------- 6b. AQI bands ---- */

/**
 * The AQI colour bands are a published regulatory scale, not a design choice,
 * so they are checked against an independent copy of the table rather than
 * against themselves. People read these colours as health signals: a band drawn
 * one step too green is a misinformation bug.
 *
 * Offline on purpose — this gates a commit. `scripts/verify-live.mjs` re-reports
 * the same table as part of its live diagnostic output; the overlap is
 * deliberate, because that script is the thing someone runs when a reading
 * looks wrong.
 */
const OFFICIAL_AQI = [
  [0, 50, 'Good', '#00E400'],
  [51, 100, 'Moderate', '#FFFF00'],
  [101, 150, 'Unhealthy for Sensitive Groups', '#FF7E00'],
  [151, 200, 'Unhealthy', '#FF0000'],
  [201, 300, 'Very Unhealthy', '#8F3F97'],
  [301, 500, 'Hazardous', '#7E0023'],
]

if (AQI_BANDS.length !== OFFICIAL_AQI.length) {
  fail('aqi', `expected ${OFFICIAL_AQI.length} published bands, found ${AQI_BANDS.length}`)
}

for (const [min, max, label, hex] of OFFICIAL_AQI) {
  const b = AQI_BANDS.find((x) => x.min === min && x.max === max)
  if (!b) {
    fail('aqi', `no band covering ${min}–${max}`)
    continue
  }
  if (b.label !== label) fail('aqi', `band ${min}–${max} is labelled "${b.label}", official is "${label}"`)
  if (b.hex.toUpperCase() !== hex) fail('aqi', `band ${min}–${max} is ${b.hex}, official is ${hex}`)
  if (!b.health) fail('aqi', `band ${min}–${max} has no health note`)

  // Boundary values are where an off-by-one lands.
  for (const v of [min, max]) {
    if (aqiBand(v)?.label !== label) fail('aqi', `aqiBand(${v}) is not "${label}"`)
  }
  // rampColor must emit the official RGB exactly — stepped, never blended.
  const mid = (min + max) / 2
  const [r, g, bl] = rampColor('aqi', mid)
  const got = '#' + [r, g, bl].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()
  if (got !== hex) fail('aqi', `rampColor('aqi', ${mid}) is ${got}, expected ${hex}`)
}

// Bands must tile 0–500 with no gap and no overlap.
for (let i = 1; i < AQI_BANDS.length; i++) {
  if (AQI_BANDS[i].min !== AQI_BANDS[i - 1].max + 1) {
    fail('aqi', `bands ${AQI_BANDS[i - 1].label} and ${AQI_BANDS[i].label} do not meet cleanly`)
  }
}
if (AQI_BANDS[0].min !== 0) fail('aqi', 'band table does not start at 0')
if (AQI_BANDS.at(-1).max !== 500) fail('aqi', 'band table does not end at 500')

// Missing data must be transparent, never a colour that implies a category.
if (rampColor('aqi', null)[3] !== 0) fail('aqi', 'a missing AQI value renders as a visible colour')
if (aqiBand(NaN) !== null) fail('aqi', 'aqiBand(NaN) must be null')

// Alpha rises with severity, so hazardous cannot read as thin haze.
for (let i = 1; i < AQI_BANDS.length; i++) {
  if (AQI_BANDS[i].alpha < AQI_BANDS[i - 1].alpha) {
    fail('aqi', `alpha decreases at ${AQI_BANDS[i].label} — severity must not become fainter`)
  }
}

// The dominant pollutant is the highest sub-index, per EPA's definition.
{
  const subs = {
    us_aqi_pm2_5: 40,
    us_aqi_pm10: 55,
    us_aqi_ozone: 120,
    us_aqi_nitrogen_dioxide: 12,
    us_aqi_sulphur_dioxide: 3,
    us_aqi_carbon_monoxide: 1,
  }
  const dom = dominantPollutant(subs)
  if (dom?.key !== 'ozone') fail('aqi', `dominantPollutant picked ${dom?.key}, expected ozone (highest sub-index)`)
  if (dominantPollutant({}) !== null) fail('aqi', 'dominantPollutant must be null when no sub-index is present')
  if (dominantPollutant({ us_aqi_pm2_5: null, us_aqi_pm10: 7 })?.key !== 'pm10') {
    fail('aqi', 'dominantPollutant must skip null sub-indices')
  }
}

if (AQ_POLLUTANTS.length !== 6) {
  fail('aqi', `expected the 6 criteria pollutants, found ${AQ_POLLUTANTS.length}`)
}

/* ------------------------------------------- 7. research agreement ---- */

const research = await readFile('RESEARCH.md', 'utf8').catch(() => '')
if (research) {
  const mustAppear = [
    ['9.8 °C/km', 'dry adiabatic rate'],
    ['67%', 'global cloud cover'],
    ['−50 W/m²', 'shortwave CRE'],
    ['+30 W/m²', 'longwave CRE'],
    ['−20 W/m²', 'net CRE'],
    ['0.2 µm', 'CCN diameter'],
    ['2 mm', 'raindrop diameter'],
  ]
  for (const [needle, what] of mustAppear) {
    if (!research.includes(needle)) fail('research', `RESEARCH.md no longer states ${what} (${needle}) — content and research have diverged`)
  }
} else {
  fail('research', 'RESEARCH.md not readable')
}

/* --------------------------------------------------------- report ---- */

const byArea = (list) =>
  list.reduce((acc, x) => ((acc[x.area] ??= []).push(x.msg), acc), {})

console.log(`\nSkybound data audit — ${GENERA.length} genera, ${ALL_PHOTOS.length} photographs\n`)

if (problems.length === 0) {
  console.log('  PASS  no inconsistencies found')
} else {
  console.log(`  FAIL  ${problems.length} problem${problems.length === 1 ? '' : 's'}\n`)
  for (const [area, msgs] of Object.entries(byArea(problems))) {
    console.log(`  [${area}]`)
    for (const m of msgs) console.log(`     · ${m}`)
  }
}

if (notes.length) {
  console.log(`\n  ${notes.length} note${notes.length === 1 ? '' : 's'} (not failures)\n`)
  for (const [area, msgs] of Object.entries(byArea(notes))) {
    console.log(`  [${area}]`)
    for (const m of msgs) console.log(`     · ${m}`)
  }
}

console.log('')
process.exit(problems.length ? 1 : 0)
