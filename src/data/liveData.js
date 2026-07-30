/**
 * Live data clients — NASA GIBS and Open-Meteo.
 *
 * Both are keyless and send `Access-Control-Allow-Origin: *`, verified by
 * direct request (see RESEARCH.md §9). No proxy needed; everything runs in
 * the browser.
 *
 * ---------------------------------------------------------------------------
 * RATE LIMITS ARE A REAL DESIGN CONSTRAINT, NOT A FOOTNOTE
 *
 * Open-Meteo's free tier enforces THREE separate ceilings — 600 calls/minute,
 * 5,000/hour, 10,000/day — and bills a multi-location request once PER
 * LOCATION. A 375-point grid is therefore 375 calls, not one.
 *
 * The per-minute ceiling is the one that actually bites, and the one that is
 * easy to miss: a grid can sit comfortably inside the daily budget and still
 * fail, because a single refresh is one burst. Both limits were hit for real
 * during development.
 *
 * Three decisions follow, and they shape the whole Explorer:
 *
 *   1. Fetch the FULL 48-hour hourly series for every variable. The time
 *      scrubber then replays that series client-side at zero additional network
 *      cost, and `nowIndex` reads the current hour out of it — so a grid fetched
 *      hours ago is still correct for right now. Fetching per timestep would
 *      multiply request volume by 48 for no benefit.
 *   2. One fixed GLOBAL grid, refreshed on a slow timer rather than on movement.
 *      Panning, zooming and scrubbing cost nothing. Because refresh frequency
 *      buys so little (see 1), the budget is spent on resolution instead.
 *   3. Requests are chunked to ~150 coordinates and issued SEQUENTIALLY, which
 *      keeps URLs short enough for any proxy and avoids hammering a free public
 *      service with a parallel burst.
 *
 * 429 is surfaced explicitly as its own status, and classified by which ceiling
 * was hit, rather than being folded into a generic error — "you are throttled
 * for another 30 seconds", "you are out for the day" and "the service is down"
 * are three different messages.
 * ---------------------------------------------------------------------------
 */

/* ------------------------------------------------------------ GIBS ---- */

const GIBS_ROOT = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best'

/**
 * Satellite layers, all verified working.
 *
 * The tile path is {z}/{y}/{x} — row before column. GIBS follows WMTS axis
 * order, not the usual XYZ convention, and swapping them silently returns the
 * wrong part of the world rather than an error.
 */
export const GIBS_LAYERS = {
  none: {
    id: 'none',
    label: 'None',
    detail: 'Basemap only',
    blurb: 'Just the dark basemap, so the data layers read without competition.',
  },
  truecolor: {
    id: 'truecolor',
    layer: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    matrix: 'GoogleMapsCompatible_Level9',
    ext: 'jpg',
    maxZoom: 9,
    opacity: 0.9,
    label: 'True colour',
    detail: 'VIIRS/SNPP reflectance',
    blurb:
      'What the satellite actually sees. Cloud appears as it would to your eye from orbit — bright white against ocean and land.',
  },
  terra: {
    id: 'terra',
    layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    matrix: 'GoogleMapsCompatible_Level9',
    ext: 'jpg',
    maxZoom: 9,
    opacity: 0.9,
    label: 'MODIS Terra',
    detail: 'Terra reflectance',
    blurb:
      'The same product from Terra, which crosses the equator in the morning rather than the afternoon — a different time of day for the same ground.',
  },
  cloudfraction: {
    id: 'cloudfraction',
    layer: 'MODIS_Terra_Cloud_Fraction_Day',
    matrix: 'GoogleMapsCompatible_Level6',
    ext: 'png',
    maxZoom: 6,
    opacity: 0.75,
    label: 'Cloud fraction',
    detail: 'MODIS Terra, retrieved',
    blurb:
      'Satellite-retrieved cloud fraction, 0 to 1. A measurement rather than a photograph — this is the kind of layer the climate numbers come from.',
  },
}

/** GIBS publishes on a delay, so today is usually empty. Walk backwards. */
export function gibsDateCandidates(count = 6) {
  const out = []
  const now = new Date()
  for (let i = 1; i <= count; i++) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export function gibsTileUrl(layerKey, date) {
  const l = GIBS_LAYERS[layerKey]
  if (!l?.layer) return null
  return `${GIBS_ROOT}/${l.layer}/default/${date}/${l.matrix}/{z}/{y}/{x}.${l.ext}`
}

/** Most recent date with published imagery. Probes one cheap low-zoom tile. */
export async function resolveGibsDate(layerKey, signal) {
  const l = GIBS_LAYERS[layerKey]
  if (!l?.layer) return null
  for (const date of gibsDateCandidates()) {
    try {
      const res = await fetch(
        `${GIBS_ROOT}/${l.layer}/default/${date}/${l.matrix}/2/1/2.${l.ext}`,
        { method: 'HEAD', signal },
      )
      if (res.ok) return date
    } catch (err) {
      if (err.name === 'AbortError') throw err
    }
  }
  return null
}

/* ------------------------------------------------------ projection ---- */

/**
 * Web Mercator latitude <-> Y helpers.
 *
 * The heatmap is drawn by scaling a small grid-sized bitmap over the map. That
 * only lines up if grid rows are evenly spaced in *Mercator Y*, not in degrees
 * of latitude — otherwise the image stretches wrongly toward the poles. So the
 * sampled latitudes are chosen in Mercator space up front.
 */
export const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
export const mercLat = (y) => ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI

/* ------------------------------------------------------ Open-Meteo ---- */

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast'
// v2: the v1 cache stored viewport-bounded grids. Serving one of those under
// the global-grid scheme would render as a rectangle floating in the map, so
// old entries are abandoned rather than migrated.
const CACHE_KEY = 'skybound:atmos-cache-v2'

export const HOURLY_VARS = [
  'cloud_cover',
  'precipitation',
  'temperature_2m',
  'wind_speed_10m',
  'wind_direction_10m',
]

/**
 * Meteorological wind direction is where the wind comes FROM, so a flow
 * vector points the opposite way.
 * @returns {{u:number,v:number}} u east-positive, v north-positive, m/s
 */
export function windToVector(speed, dirFromDeg) {
  const r = (dirFromDeg * Math.PI) / 180
  return { u: -speed * Math.sin(r), v: -speed * Math.cos(r) }
}

/**
 * Classify a 429 by WHICH limit was hit.
 *
 * Open-Meteo enforces three separate ceilings — 600/minute, 5,000/hour,
 * 10,000/day — and says which in the response body:
 *
 *   {"error":true,"reason":"Minutely API request limit exceeded. ..."}
 *
 * Folding all three into one "rate limited" state loses the only fact that
 * matters to the reader: a minutely limit clears in under a minute and is worth
 * waiting out automatically, while a daily one means come back tomorrow.
 * Telling someone to "try again later" when it would have fixed itself in 40
 * seconds is a worse failure than the throttle.
 */
async function rateLimitError(res) {
  let scope = 'unknown'
  try {
    const body = await res.json()
    const reason = String(body?.reason ?? '')
    if (/minutely/i.test(reason)) scope = 'minute'
    else if (/hourly/i.test(reason)) scope = 'hour'
    else if (/daily/i.test(reason)) scope = 'day'
  } catch {
    /* body may be empty or not JSON — 'unknown' is the honest answer */
  }
  return Object.assign(new Error(`rate limited (${scope})`), { rateLimited: true, scope })
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return p && Array.isArray(p.points) && p.points.length ? p : null
  } catch {
    return null
  }
}

function writeCache(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* quota or private mode — caching is a nicety */
  }
}

/**
 * A still-valid cached grid, or null.
 *
 * Refetching on every mount is what makes the rate limit bite in practice. A
 * refresh is several hundred billed calls, so a dozen reloads while reading —
 * or a dozen navigations in and out of the Explorer — is thousands of calls
 * spent re-downloading numbers already on disk. That is how a limit designed
 * for abuse gets tripped by ordinary use.
 *
 * It is also pointless: every fetch stores a 48-hour series and `nowIndex`
 * reads the current hour out of it, so a grid from an hour ago is still exactly
 * right for now. Freshness is reported honestly from the cached `fetchedAt`, so
 * reusing it does not hide the age.
 *
 * @param {number} maxAgeMs treat a cache older than this as stale
 * @param {number} minPoints reject a grid from a coarser era than the current one
 */
export function cachedAtmosphereGrid(maxAgeMs, minPoints = 0) {
  const c = readCache()
  if (!c?.fetchedAt) return null
  if (Date.now() - c.fetchedAt > maxAgeMs) return null
  // A cache written before the grid was resized would render at the wrong
  // density; the bounds match, so nothing else would catch it.
  if (c.points.length < minPoints) return null
  return { ...c, status: 'live' }
}

/** Same, for the air quality grid. */
export function cachedAirQualityGrid(maxAgeMs, minPoints = 0) {
  const c = readAqCache()
  if (!c?.fetchedAt) return null
  if (Date.now() - c.fetchedAt > maxAgeMs) return null
  if (c.points.length < minPoints) return null
  return { ...c, status: 'live' }
}

/**
 * Coordinates per HTTP request.
 *
 * Billing is per location, so splitting a grid across several requests costs
 * exactly the same quota as sending it in one. What it buys is a URL that
 * servers will actually accept: coordinates run ~16 characters per point, so a
 * 600-point grid in a single URL is ~10 kB and past the point where common
 * proxies start rejecting request lines. 150 keeps each URL near 2.5 kB.
 */
const COORDS_PER_REQUEST = 150

const chunk = (arr, size) => {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Sample the atmosphere over `bounds`: 48 hours of hourly values for every
 * variable, at every grid point, in as few requests as the URL budget allows.
 *
 * @returns {Promise<AtmosGrid>} points[] each with hourly arrays, plus times[]
 */
export async function fetchAtmosphereGrid(
  { west, south, east, north },
  nx = 12,
  ny = 8,
  signal,
) {
  // Clamp before sending. Open-Meteo answers malformed coordinates with 503,
  // which is otherwise indistinguishable from an outage.
  const w = Math.max(-180, Math.min(179.9, west))
  const e = Math.max(-179.9, Math.min(180, east))
  const s = Math.max(-84, Math.min(84, south))
  const n = Math.max(-84, Math.min(84, north))

  const yS = mercY(s)
  const yN = mercY(n)

  const lats = []
  const lons = []
  const coords = []
  for (let j = 0; j < ny; j++) {
    // Top row first, so row order matches image rows (north at top).
    const t = ny === 1 ? 0.5 : j / (ny - 1)
    const lat = mercLat(yN + (yS - yN) * t)
    for (let i = 0; i < nx; i++) {
      const lon = nx === 1 ? (w + e) / 2 : w + ((e - w) / (nx - 1)) * i
      lats.push(lat.toFixed(3))
      lons.push(lon.toFixed(3))
      coords.push({ lat, lon })
    }
  }

  const bounds = { west: w, south: s, east: e, north: n }

  const latChunks = chunk(lats, COORDS_PER_REQUEST)
  const lonChunks = chunk(lons, COORDS_PER_REQUEST)

  try {
    // Sequential, not parallel. Firing six requests at once at a free public
    // service is how you earn a 429; the grid is refreshed rarely enough that
    // taking a moment over it costs nothing.
    const rows = []
    for (let k = 0; k < latChunks.length; k++) {
      const url =
        `${OPEN_METEO}?latitude=${latChunks[k].join(',')}&longitude=${lonChunks[k].join(',')}` +
        `&hourly=${HOURLY_VARS.join(',')}` +
        `&forecast_days=2&wind_speed_unit=ms&timeformat=unixtime`

      const res = await fetch(url, { signal })
      if (res.status === 429) throw await rateLimitError(res)
      if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
      const json = await res.json()
      // A single-coordinate request answers with a bare object, not an array.
      const part = Array.isArray(json) ? json : [json]
      // Any short chunk would silently shift every later point into the wrong
      // cell, so this fails loudly instead of rendering a plausible wrong map.
      if (part.length !== latChunks[k].length) {
        throw new Error(`chunk ${k} returned ${part.length} of ${latChunks[k].length} points`)
      }
      rows.push(...part)
    }

    const times = rows[0]?.hourly?.time ?? []
    const points = rows.map((row, i) => {
      const h = row.hourly ?? {}
      return {
        lat: coords[i]?.lat ?? row.latitude,
        lon: coords[i]?.lon ?? row.longitude,
        cloud: h.cloud_cover ?? [],
        precip: h.precipitation ?? [],
        temp: h.temperature_2m ?? [],
        windSpeed: h.wind_speed_10m ?? [],
        windDir: h.wind_direction_10m ?? [],
      }
    })

    const payload = {
      points,
      nx,
      ny,
      bounds,
      times,
      fetchedAt: Date.now(),
      status: 'live',
    }
    writeCache(payload)
    return payload
  } catch (err) {
    if (err.name === 'AbortError') throw err
    const cached = readCache()
    if (cached) {
      return { ...cached, status: err.rateLimited ? 'throttled' : 'cached', limitScope: err.scope }
    }
    return {
      points: [],
      nx,
      ny,
      bounds,
      times: [],
      status: err.rateLimited ? 'throttled' : 'error',
      limitScope: err.scope,
      error: String(err.message ?? err),
    }
  }
}

/**
 * Full hourly series for ONE exact location.
 *
 * The viewport grid exists to draw fields, and interpolating it is fine for
 * that. It is NOT fine for answering "what is it doing here?" — at global
 * zoom the grid is ~20° apart, so a clicked city gets a value blended from
 * samples many hundreds of kilometres away. That produced a genuinely wrong
 * reading (20.5 °C interpolated for Tilburg against an actual 33 °C).
 *
 * A single-location request is one of the cheapest calls available, so
 * inspect asks the model directly instead of guessing from the grid.
 *
 * Open-Meteo snaps to its own model grid, so the response's own latitude and
 * longitude are returned too — the card shows where the answer actually
 * comes from rather than implying metre precision.
 */
export async function fetchPointSeries(lat, lon, signal) {
  const url =
    `${OPEN_METEO}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&hourly=${HOURLY_VARS.join(',')}` +
    `&forecast_days=2&wind_speed_unit=ms&timeformat=unixtime`
  try {
    const res = await fetch(url, { signal })
    if (res.status === 429) throw await rateLimitError(res)
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
    const j = await res.json()
    const row = Array.isArray(j) ? j[0] : j
    const h = row?.hourly ?? {}
    return {
      status: 'live',
      lat: row?.latitude ?? lat,
      lon: row?.longitude ?? lon,
      elevation: row?.elevation,
      times: h.time ?? [],
      cloud: h.cloud_cover ?? [],
      precip: h.precipitation ?? [],
      temp: h.temperature_2m ?? [],
      windSpeed: h.wind_speed_10m ?? [],
      windDir: h.wind_direction_10m ?? [],
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    return {
      status: err.rateLimited ? 'throttled' : 'error',
      limitScope: err.scope,
      error: String(err.message ?? err),
    }
  }
}

/* ----------------------------------------------------- air quality ---- */

/**
 * Air quality is a DIFFERENT HOST from the weather API, and a different model
 * family (CAMS, not ICON/GFS). Confirmed by direct request:
 *
 *   - endpoint  air-quality-api.open-meteo.com/v1/air-quality  (keyless)
 *   - CAMS Europe  0.1° (~11 km), hourly, refreshed every 24 h
 *   - CAMS global  0.4° (~45 km), 3-hourly, refreshed every 12 h
 *   - `us_aqi` and per-pollutant `us_aqi_*` sub-indices are returned directly,
 *     already converted from concentration. Units: USAQI for indices,
 *     μg/m³ for concentrations.
 *
 * Taking the index straight from the API matters: it means no AQI breakpoint is
 * ever computed here, so none can be invented. This module only decides which
 * published CATEGORY a returned index falls in, and what colour that category
 * is — both fixed by EPA and both verified against source (see AQI_BANDS).
 */
const OPEN_METEO_AQ = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const AQ_CACHE_KEY = 'skybound:aq-cache-v1'

/** Concentrations, in μg/m³. */
export const AQ_POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5', sub: 'us_aqi_pm2_5' },
  { key: 'pm10', label: 'PM10', sub: 'us_aqi_pm10' },
  { key: 'ozone', label: 'O₃', sub: 'us_aqi_ozone' },
  { key: 'nitrogen_dioxide', label: 'NO₂', sub: 'us_aqi_nitrogen_dioxide' },
  { key: 'sulphur_dioxide', label: 'SO₂', sub: 'us_aqi_sulphur_dioxide' },
  { key: 'carbon_monoxide', label: 'CO', sub: 'us_aqi_carbon_monoxide' },
]

const AQ_HOURLY_VARS = ['us_aqi', ...AQ_POLLUTANTS.map((p) => p.sub), ...AQ_POLLUTANTS.map((p) => p.key)]

/**
 * The six official US EPA AQI categories.
 *
 * Breakpoints and colours are the published values, not approximations:
 * ranges from AirNow's AQI Basics, hex from the EPA Technical Assistance
 * Document for the Reporting of Daily Air Quality. People read these colours as
 * health signals, so an invented threshold or an "close enough" green would be
 * a genuine misinformation bug rather than a styling choice.
 *
 * `alpha` is presentation only — it climbs with severity so a hazardous cell
 * cannot be mistaken for thin haze — and never alters the band boundaries.
 */
export const AQI_BANDS = [
  { min: 0, max: 50, label: 'Good', rgb: [0, 228, 0], hex: '#00E400', alpha: 120,
    health: 'Air quality poses little or no risk.' },
  { min: 51, max: 100, label: 'Moderate', rgb: [255, 255, 0], hex: '#FFFF00', alpha: 140,
    health: 'Acceptable, but unusually sensitive people may notice effects.' },
  { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups', rgb: [255, 126, 0], hex: '#FF7E00', alpha: 160,
    health: 'Sensitive groups may feel effects; most people will not.' },
  { min: 151, max: 200, label: 'Unhealthy', rgb: [255, 0, 0], hex: '#FF0000', alpha: 178,
    health: 'Some of the general public may feel effects; sensitive groups more seriously.' },
  { min: 201, max: 300, label: 'Very Unhealthy', rgb: [143, 63, 151], hex: '#8F3F97', alpha: 196,
    health: 'Health alert — raised risk of effects for everyone.' },
  { min: 301, max: 500, label: 'Hazardous', rgb: [126, 0, 35], hex: '#7E0023', alpha: 214,
    health: 'Emergency conditions — everyone is more likely to be affected.' },
]

/** Which published band an index falls in. Clamps above 500 to Hazardous. */
export function aqiBand(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return null
  for (const b of AQI_BANDS) if (v <= b.max) return b
  return AQI_BANDS[AQI_BANDS.length - 1]
}

/**
 * The pollutant driving the overall index.
 *
 * EPA defines the reported AQI as the MAXIMUM of the per-pollutant sub-indices,
 * so the dominant pollutant is whichever sub-index is highest — it is not
 * inferred from raw concentrations, which are not comparable across species.
 */
export function dominantPollutant(subIndices) {
  let best = null
  for (const p of AQ_POLLUTANTS) {
    const v = subIndices?.[p.sub]
    if (typeof v !== 'number' || Number.isNaN(v)) continue
    if (!best || v > best.index) best = { key: p.key, label: p.label, index: v }
  }
  return best
}

/**
 * Reindex hourly arrays onto another series' timestamps.
 *
 * The weather and air-quality APIs happen to agree today — both start at
 * today 00:00 UTC, verified offset of exactly 0 hours. Sharing one scrubber
 * index across both therefore works *right now*, which is precisely why it is
 * worth not relying on: a future change to either service's window would
 * silently shift every AQI reading by hours with no visible symptom. Matching
 * on the timestamp makes that class of bug impossible instead of unlikely.
 */
function alignHourly(srcTimes, targetTimes, arrays) {
  if (!targetTimes?.length || !srcTimes?.length) return arrays
  const pos = new Map(srcTimes.map((t, i) => [t, i]))
  const out = {}
  for (const [key, arr] of Object.entries(arrays)) {
    out[key] = targetTimes.map((t) => {
      const i = pos.get(t)
      return i == null ? null : (arr?.[i] ?? null)
    })
  }
  return out
}

function readAqCache() {
  try {
    const raw = localStorage.getItem(AQ_CACHE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return p && Array.isArray(p.points) && p.points.length ? p : null
  } catch {
    return null
  }
}

/**
 * Air-quality grid, on the SAME coordinate scheme as the weather grid so the
 * two are index-comparable, and time-aligned to `alignTo` so one scrubber
 * index addresses both.
 */
export async function fetchAirQualityGrid(
  { west, south, east, north },
  nx = 13,
  ny = 7,
  signal,
  alignTo = null,
) {
  const w = Math.max(-180, Math.min(179.9, west))
  const e = Math.max(-179.9, Math.min(180, east))
  const s = Math.max(-84, Math.min(84, south))
  const n = Math.max(-84, Math.min(84, north))

  const yS = mercY(s)
  const yN = mercY(n)

  const lats = []
  const lons = []
  const coords = []
  for (let j = 0; j < ny; j++) {
    const t = ny === 1 ? 0.5 : j / (ny - 1)
    const lat = mercLat(yN + (yS - yN) * t)
    for (let i = 0; i < nx; i++) {
      const lon = nx === 1 ? (w + e) / 2 : w + ((e - w) / (nx - 1)) * i
      lats.push(lat.toFixed(3))
      lons.push(lon.toFixed(3))
      coords.push({ lat, lon })
    }
  }

  const bounds = { west: w, south: s, east: e, north: n }

  // The AQ request carries 13 variables, so its URL is longer per coordinate
  // than the forecast one — chunk it the same way, for the same reason.
  const latChunks = chunk(lats, COORDS_PER_REQUEST)
  const lonChunks = chunk(lons, COORDS_PER_REQUEST)

  try {
    const rows = []
    for (let k = 0; k < latChunks.length; k++) {
      const url =
        `${OPEN_METEO_AQ}?latitude=${latChunks[k].join(',')}&longitude=${lonChunks[k].join(',')}` +
        `&hourly=${AQ_HOURLY_VARS.join(',')}&forecast_days=2&timeformat=unixtime`

      const res = await fetch(url, { signal })
      if (res.status === 429) throw await rateLimitError(res)
      if (!res.ok) throw new Error(`Open-Meteo AQ ${res.status}`)
      const json = await res.json()
      const part = Array.isArray(json) ? json : [json]
      if (part.length !== latChunks[k].length) {
        throw new Error(`AQ chunk ${k} returned ${part.length} of ${latChunks[k].length} points`)
      }
      rows.push(...part)
    }

    const native = rows[0]?.hourly?.time ?? []
    const times = alignTo?.length ? alignTo : native

    const points = rows.map((row, i) => {
      const h = row.hourly ?? {}
      const raw = { aqi: h.us_aqi ?? [] }
      for (const p of AQ_POLLUTANTS) {
        raw[p.key] = h[p.key] ?? []
        raw[p.sub] = h[p.sub] ?? []
      }
      const series = alignTo?.length ? alignHourly(row.hourly?.time ?? native, alignTo, raw) : raw
      return { lat: coords[i]?.lat ?? row.latitude, lon: coords[i]?.lon ?? row.longitude, ...series }
    })

    const payload = { points, nx, ny, bounds, times, fetchedAt: Date.now(), status: 'live' }
    try {
      localStorage.setItem(AQ_CACHE_KEY, JSON.stringify(payload))
    } catch {
      /* quota — caching is a nicety */
    }
    return payload
  } catch (err) {
    if (err.name === 'AbortError') throw err
    const cached = readAqCache()
    if (cached) return { ...cached, status: err.rateLimited ? 'throttled' : 'cached', limitScope: err.scope }
    return {
      points: [],
      nx,
      ny,
      bounds,
      times: [],
      status: err.rateLimited ? 'throttled' : 'error',
      limitScope: err.scope,
      error: String(err.message ?? err),
    }
  }
}

/** Air quality for ONE exact location — the authoritative inspect reading. */
export async function fetchPointAirQuality(lat, lon, signal) {
  const url =
    `${OPEN_METEO_AQ}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&hourly=${AQ_HOURLY_VARS.join(',')}&forecast_days=2&timeformat=unixtime`
  try {
    const res = await fetch(url, { signal })
    if (res.status === 429) throw await rateLimitError(res)
    if (!res.ok) throw new Error(`Open-Meteo AQ ${res.status}`)
    const j = await res.json()
    const row = Array.isArray(j) ? j[0] : j
    const h = row?.hourly ?? {}
    const out = { status: 'live', lat: row?.latitude ?? lat, lon: row?.longitude ?? lon, times: h.time ?? [], aqi: h.us_aqi ?? [] }
    for (const p of AQ_POLLUTANTS) {
      out[p.key] = h[p.key] ?? []
      out[p.sub] = h[p.sub] ?? []
    }
    return out
  } catch (err) {
    if (err.name === 'AbortError') throw err
    return {
      status: err.rateLimited ? 'throttled' : 'error',
      limitScope: err.scope,
      error: String(err.message ?? err),
    }
  }
}

/** Index of the hour nearest to now, for the scrubber's default position. */
export function nowIndex(times) {
  if (!times?.length) return 0
  const now = Date.now() / 1000
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < times.length; i++) {
    const d = Math.abs(times[i] - now)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/* -------------------------------------------------------- sampling ---- */

/**
 * Smoothstep easing applied to interpolation weights.
 *
 * Plain bilinear interpolation is only C0-continuous: the value is continuous
 * across grid nodes but its gradient is not, and the eye picks that up as hard
 * creases and banding — very visible on a coarse grid stretched over a
 * continent. Easing the weights zeroes the derivative at each node, making the
 * reconstruction C1-continuous and the banding disappear.
 *
 * Values AT the grid nodes are unchanged, so this smooths the reconstruction
 * between samples without altering the measured data.
 */
const smooth = (t) => t * t * (3 - 2 * t)

/** Global bounds for the always-on base grid. */
export const GLOBAL_BOUNDS = { west: -180, east: 180, south: -84, north: 84 }

/**
 * Wrap a longitude into the grid's span when the grid covers the whole globe.
 *
 * MapLibre repeats the world horizontally, so at low zoom the visible bounds
 * run past ±180 — a particle at 200°E is really at −160°E. Without wrapping,
 * everything in the repeated copies samples as out-of-bounds and the fields
 * simply stop at the antimeridian.
 */
function wrapLon(lon, bounds) {
  if (bounds.east - bounds.west < 359) return lon
  return ((((lon + 180) % 360) + 360) % 360) - 180
}

const FIELD_ACCESSOR = {
  cloud: (p, t) => p.cloud[t],
  precip: (p, t) => p.precip[t],
  temp: (p, t) => p.temp[t],
  aqi: (p, t) => p.aqi?.[t],
}

/**
 * Bilinear sampler over one variable at one timestep.
 *
 * The grid is coarse (10-30° spacing), so treating samples as truth would give
 * visible stair-stepping. Interpolating between the four surrounding nodes is
 * what makes both the heatmap and the wind flow read as continuous fields.
 */
export function makeFieldSampler(grid, field, t) {
  if (!grid?.points?.length) return null
  const { points, nx, ny, bounds } = grid
  const get = FIELD_ACCESSOR[field]
  if (!get) return null

  const yTop = mercY(bounds.north)
  const yBot = mercY(bounds.south)
  const spanX = bounds.east - bounds.west || 1
  const spanY = yBot - yTop || 1

  return function sample(lonIn, lat) {
    const lon = wrapLon(lonIn, bounds)
    const fx = ((lon - bounds.west) / spanX) * (nx - 1)
    const fy = ((mercY(lat) - yTop) / spanY) * (ny - 1)
    if (fx < 0 || fy < 0 || fx > nx - 1 || fy > ny - 1) return null

    const i0 = Math.floor(fx)
    const j0 = Math.floor(fy)
    const i1 = Math.min(nx - 1, i0 + 1)
    const j1 = Math.min(ny - 1, j0 + 1)
    const tx = smooth(fx - i0)
    const ty = smooth(fy - j0)
    const L = (a, b, k) => a + (b - a) * k

    const v = (i, j) => {
      const val = get(points[j * nx + i] ?? {}, t)
      return typeof val === 'number' && !Number.isNaN(val) ? val : 0
    }
    return L(L(v(i0, j0), v(i1, j0), tx), L(v(i0, j1), v(i1, j1), tx), ty)
  }
}

/** Bilinear wind sampler returning a flow vector at one timestep. */
export function makeWindSampler(grid, t) {
  if (!grid?.points?.length) return null
  const { points, nx, ny, bounds } = grid
  const yTop = mercY(bounds.north)
  const yBot = mercY(bounds.south)
  const spanX = bounds.east - bounds.west || 1
  const spanY = yBot - yTop || 1

  const vecs = points.map((p) => {
    const sp = p.windSpeed[t]
    const dr = p.windDir[t]
    if (typeof sp !== 'number' || typeof dr !== 'number') return { u: 0, v: 0 }
    return windToVector(sp, dr)
  })

  return function sample(lonIn, lat) {
    const lon = wrapLon(lonIn, bounds)
    const fx = ((lon - bounds.west) / spanX) * (nx - 1)
    const fy = ((mercY(lat) - yTop) / spanY) * (ny - 1)
    if (fx < 0 || fy < 0 || fx > nx - 1 || fy > ny - 1) return null

    const i0 = Math.floor(fx)
    const j0 = Math.floor(fy)
    const i1 = Math.min(nx - 1, i0 + 1)
    const j1 = Math.min(ny - 1, j0 + 1)
    const tx = smooth(fx - i0)
    const ty = smooth(fy - j0)
    const L = (a, b, k) => a + (b - a) * k
    const g = (i, j) => vecs[j * nx + i] ?? { u: 0, v: 0 }

    const u = L(L(g(i0, j0).u, g(i1, j0).u, tx), L(g(i0, j1).u, g(i1, j1).u, tx), ty)
    const v = L(L(g(i0, j0).v, g(i1, j0).v, tx), L(g(i0, j1).v, g(i1, j1).v, tx), ty)
    return { u, v, speed: Math.hypot(u, v) }
  }
}

/** All variables at one point and timestep, for the inspect card. */
export function inspectAt(grid, t, lon, lat) {
  if (!grid?.points?.length) return null
  const out = {}
  for (const f of ['cloud', 'precip', 'temp']) {
    const s = makeFieldSampler(grid, f, t)
    out[f] = s ? s(lon, lat) : null
  }
  const w = makeWindSampler(grid, t)
  const wind = w ? w(lon, lat) : null
  if (wind) {
    out.windSpeed = wind.speed
    // Convert the flow vector back to the meteorological "from" bearing.
    out.windDir = (Math.atan2(-wind.u, -wind.v) * 180) / Math.PI
    if (out.windDir < 0) out.windDir += 360
  }
  return out
}

/* ---------------------------------------------------------- ramps ---- */

const lerpStops = (stops, v) => {
  if (v <= stops[0].at) return stops[0].c
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i].at) {
      const k = (v - stops[i - 1].at) / (stops[i].at - stops[i - 1].at)
      return stops[i - 1].c.map((c, j) => c + (stops[i].c[j] - c) * k)
    }
  }
  return stops[stops.length - 1].c
}

/** RGBA ramps. Alpha is part of the ramp so "no data" reads as nothing. */
export const RAMPS = {
  cloud: {
    label: 'Cloud cover',
    unit: '%',
    domain: [0, 100],
    ticks: ['clear', 'partial', 'overcast'],
    // Transparent -> haze -> dense blue-white.
    //
    // The shape matters more than the peak. Most of the planet sits in the
    // 30-100% band at any moment, so a ramp that gets opaque early turns the
    // whole map into one white sheet and destroys the distinction it exists to
    // show. Holding the LOW end back is what keeps light haze and dense
    // overcast legible as different things.
    //
    // The top end was raised (192 -> 228) because the opposite failure is just
    // as real: too faint everywhere reads as a broken layer rather than a
    // subtle one. Overcast should be unmistakable while 20% cover stays a
    // whisper — hence a curve that is nearly flat below 20 and steep above 60.
    stops: [
      { at: 0, c: [186, 208, 236, 0] },
      { at: 20, c: [192, 212, 236, 18] },
      { at: 40, c: [206, 222, 242, 58] },
      { at: 60, c: [222, 234, 248, 110] },
      { at: 80, c: [238, 246, 253, 168] },
      { at: 90, c: [247, 251, 255, 200] },
      { at: 100, c: [255, 255, 255, 228] },
    ],
  },
  precip: {
    label: 'Precipitation',
    unit: 'mm/h',
    domain: [0, 10],
    ticks: ['0', '1', '4', '10+'],
    stops: [
      { at: 0, c: [90, 190, 220, 0] },
      { at: 0.08, c: [96, 196, 224, 40] },
      { at: 0.6, c: [76, 158, 238, 120] },
      { at: 2.5, c: [92, 116, 240, 180] },
      { at: 6, c: [148, 92, 236, 214] },
      { at: 10, c: [208, 78, 220, 236] },
    ],
  },
  temp: {
    label: 'Temperature',
    unit: '°C',
    domain: [-30, 45],
    ticks: ['−30', '0', '20', '45'],
    stops: [
      { at: -30, c: [58, 84, 186, 205] },
      { at: -10, c: [70, 148, 220, 205] },
      { at: 0, c: [112, 200, 216, 200] },
      { at: 12, c: [150, 214, 152, 196] },
      { at: 22, c: [246, 214, 118, 205] },
      { at: 32, c: [244, 148, 78, 214] },
      { at: 45, c: [226, 78, 68, 224] },
    ],
  },
}

export function rampColor(field, v) {
  // AQI is deliberately NOT a smooth ramp. Its colours are a published
  // categorical scale, so blending between bands would render a colour that
  // signals a health category the index is not in.
  //
  // Every colour this returns is exactly an official band colour. Measured in
  // the browser, the composited canvas then drifts by up to ~5/255 per channel
  // at full opacity and more as alpha falls, because canvas stores premultiplied
  // alpha and getImageData has to divide it back out. That drift is same-hue
  // rounding, not blending: a sweep of the live layer found 0 pixels sitting
  // between two bands. MapLibre's linear raster resampling also softens band
  // edges by a pixel or two on screen, which is a contour being anti-aliased
  // rather than a category being misreported.
  if (field === 'aqi') {
    const b = aqiBand(v)
    return b ? [...b.rgb, b.alpha] : [0, 0, 0, 0]
  }
  const r = RAMPS[field]
  if (!r || typeof v !== 'number' || Number.isNaN(v)) return [0, 0, 0, 0]
  return lerpStops(r.stops, v).map(Math.round)
}

/** CSS gradient string for a legend bar. */
export function rampCss(field) {
  const r = RAMPS[field]
  if (!r) return 'transparent'
  const [lo, hi] = r.domain
  return `linear-gradient(90deg, ${r.stops
    .map((s) => {
      const [red, g, b, a] = s.c
      const pct = ((s.at - lo) / (hi - lo)) * 100
      return `rgba(${Math.round(red)},${Math.round(g)},${Math.round(b)},${(a / 255).toFixed(3)}) ${pct.toFixed(1)}%`
    })
    .join(', ')})`
}

/** Wind speed ramp, tuned so ordinary winds are not all one colour. */
export const WIND_RAMP = [
  { at: 0, c: [110, 165, 210] },
  { at: 4, c: [124, 196, 240] },
  { at: 8, c: [140, 226, 200] },
  { at: 13, c: [245, 216, 130] },
  { at: 19, c: [245, 150, 96] },
  { at: 26, c: [235, 110, 130] },
  { at: 34, c: [200, 130, 235] },
]

export function windColor(speed) {
  return lerpStops(WIND_RAMP, speed).map(Math.round)
}
