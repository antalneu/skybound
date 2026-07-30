/**
 * Live-data verification.
 *
 * `audit-data.mjs` checks the content layer offline. This checks the other half:
 * that what the Explorer DISPLAYS matches what the APIs actually returned, and
 * that the nine accuracy traps in the brief are genuinely closed rather than
 * assumed.
 *
 *   node scripts/verify-live.mjs
 *
 * It imports the real functions from src/data/liveData.js — not a
 * reimplementation — so a regression in the shipping code path fails this
 * script. liveData's cache helpers touch localStorage, which does not exist in
 * Node; every call site is already inside a try/catch, so they degrade to "no
 * cache" here rather than throwing.
 *
 * Requires network. Exits non-zero on a hard failure (swapped coordinates,
 * wrong units, inverted wind, wrong AQI band) but only warns on a
 * model-vs-observation difference, which is expected and not a code fault.
 */

import {
  AQ_POLLUTANTS,
  AQI_BANDS,
  aqiBand,
  dominantPollutant,
  fetchPointAirQuality,
  fetchPointSeries,
  makeFieldSampler,
  nowIndex,
  rampColor,
  windToVector,
} from '../src/data/liveData.js'

const FAIL = []
const WARN = []
const fail = (m) => FAIL.push(m)
const warn = (m) => WARN.push(m)

/**
 * Being throttled is not a test failure.
 *
 * One grid refresh is several hundred billed calls against a 600/minute and
 * 5,000/hour ceiling, so running this script a few times in a row — or running
 * it after the app has refreshed — genuinely can exhaust the allowance. Reporting
 * that as a red FAIL would train whoever reads the output to ignore red, which is
 * worse than not checking at all. It is recorded as "could not verify" and the
 * exit code stays clean.
 */
let THROTTLED = null
const throttled = (scope, where) => {
  // Keep the FIRST occurrence: that is where the allowance actually ran out.
  // Later ones are just the same wall, and overwriting would misreport it.
  if (!THROTTLED) THROTTLED = { scope: scope ?? 'unknown', where }
}

/**
 * Fetch JSON, distinguishing a throttle from a real failure.
 * @returns {Promise<{json?:object, limited?:boolean, scope?:string}>}
 */
async function getJson(url, where) {
  const res = await fetch(url)
  if (res.status === 429) {
    let scope = 'unknown'
    try {
      const reason = String((await res.json())?.reason ?? '')
      if (/minutely/i.test(reason)) scope = 'minute'
      else if (/hourly/i.test(reason)) scope = 'hour'
      else if (/daily/i.test(reason)) scope = 'day'
    } catch {
      /* empty body */
    }
    throttled(scope, where)
    console.log(`   skip  rate limited (${scope} ceiling) — cannot verify ${where} right now`)
    return { limited: true, scope }
  }
  if (!res.ok) {
    fail(`${where}: HTTP ${res.status}`)
    return {}
  }
  return { json: await res.json() }
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
const compass = (d) => COMPASS[Math.round((((d % 360) + 360) % 360) / 22.5) % 16]
const pad = (s, n) => String(s).padEnd(n)
const num = (v, d = 1) => (typeof v === 'number' && !Number.isNaN(v) ? v.toFixed(d) : '—')

/**
 * Deliberately spread: a negative-longitude high-altitude site, a southern
 * hemisphere site, a high-latitude site, and a site with genuinely poor air
 * quality — so a sign error, a hemisphere error or a clamped AQI band shows up
 * instead of hiding behind mild mid-latitude numbers.
 */
const SITES = [
  { name: 'Tilburg, NL', lat: 51.56, lon: 5.08 },
  { name: 'Denver, CO', lat: 39.74, lon: -104.98, nws: true },
  { name: 'Delhi, IN', lat: 28.61, lon: 77.21 },
  { name: 'Sydney, AU', lat: -33.87, lon: 151.21 },
  { name: 'Reykjavik, IS', lat: 64.15, lon: -21.94 },
]

/* ------------------------------------------------- 1. unit contracts ---- */

async function checkUnits() {
  console.log('\n1. Unit and field contracts (straight from the API envelope)')

  const got = await getJson(
    'https://api.open-meteo.com/v1/forecast?latitude=51.56&longitude=5.08' +
      '&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation' +
      '&forecast_days=2&wind_speed_unit=ms&timeformat=unixtime',
    'unit contracts',
  )
  if (!got.json) return null
  const w = got.json

  const u = w.hourly_units ?? {}
  const expect = {
    temperature_2m: '°C',
    wind_speed_10m: 'm/s',
    wind_direction_10m: '°',
    cloud_cover: '%',
    precipitation: 'mm',
  }
  for (const [k, v] of Object.entries(expect)) {
    const got = u[k]
    const ok = got === v
    console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${pad(k, 20)} ${pad(got, 6)} (expected ${v})`)
    if (!ok) fail(`unit mismatch: ${k} is "${got}", the UI labels it "${v}"`)
  }

  // The field must be 2 m air temperature, not apparent/dew point/surface.
  if (!('temperature_2m' in u)) fail('temperature_2m absent — wrong temperature field requested')

  const gotA = await getJson(
    'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=51.56&longitude=5.08' +
      '&hourly=us_aqi,pm2_5&forecast_days=1&timeformat=unixtime',
    'air quality unit contracts',
  )
  if (!gotA.json) return w
  const au = gotA.json.hourly_units ?? {}
  console.log(`   ${au.us_aqi === 'USAQI' ? 'ok  ' : 'FAIL'} ${pad('us_aqi', 20)} ${pad(au.us_aqi, 6)} (expected USAQI)`)
  console.log(`   ${au.pm2_5 === 'μg/m³' ? 'ok  ' : 'FAIL'} ${pad('pm2_5', 20)} ${pad(au.pm2_5, 6)} (expected μg/m³)`)
  if (au.us_aqi !== 'USAQI') fail(`AQI unit is "${au.us_aqi}" — the UI labels it US AQI`)
  if (au.pm2_5 !== 'μg/m³') fail(`pollutant unit is "${au.pm2_5}" — the UI labels it μg/m³`)

  return w
}

/* ------------------------------------------ 2. timestep and alignment ---- */

async function checkTimeAlignment() {
  console.log('\n2. Timestep alignment (the "close but wrong" trap)')

  const [gw, ga] = await Promise.all([
    getJson('https://api.open-meteo.com/v1/forecast?latitude=51.56&longitude=5.08&hourly=temperature_2m&forecast_days=2&timeformat=unixtime', 'forecast time window'),
    getJson('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=51.56&longitude=5.08&hourly=us_aqi&forecast_days=2&timeformat=unixtime', 'air quality time window'),
  ])
  if (!gw.json || !ga.json) return null

  const wt = gw.json.hourly.time
  const at = ga.json.hourly.time
  const i = nowIndex(wt)
  const chosen = new Date(wt[i] * 1000)

  /**
   * nowIndex resolves to the NEAREST hour, not the floor of the current hour.
   *
   * Asserting "must equal the current hour" is the wrong invariant and fails
   * spuriously for 30 minutes out of every 60 — at 22:47, the 23:00 sample is
   * 13 minutes away and the 22:00 sample is 47, so 23:00 is the better estimate
   * of conditions now. Temperature, wind and cloud cover are instantaneous
   * values at the stamped hour, so nearest genuinely beats floor.
   *
   * The real invariant is that the chosen hour is never more than half an hour
   * from now. An off-by-one — the trap this is guarding — would show up as a
   * drift of 60 minutes or more, which this catches.
   */
  const driftMin = Math.abs(chosen - Date.now()) / 60000
  const ok = driftMin <= 30 + 1e-6
  console.log(`   now (UTC)          ${new Date().toISOString()}`)
  console.log(`   nowIndex -> [${i}]     ${chosen.toISOString()}`)
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} nearest-hour sample is ${driftMin.toFixed(1)} min from now (must be ≤ 30)`)
  if (!ok) fail(`nowIndex chose an hour ${driftMin.toFixed(1)} min away — off-by-one into the hourly array`)

  const offset = (at[0] - wt[0]) / 3600
  console.log(`   ${offset === 0 ? 'ok  ' : 'warn'} weather vs air-quality window offset = ${offset} h`)
  if (offset !== 0) {
    warn(`the two APIs no longer share a time origin (offset ${offset} h) — alignHourly() is now doing real work, which is exactly what it is for`)
  }
  return { wt, at }
}

/* ------------------------------------ 3. wind convention round-tripping -- */

function checkWind() {
  console.log('\n3. Wind direction convention (meteorological "from")')

  const cases = [
    { from: 0, name: 'from N', expect: { u: 0, v: -10 } },
    { from: 90, name: 'from E', expect: { u: -10, v: 0 } },
    { from: 180, name: 'from S', expect: { u: 0, v: 10 } },
    { from: 270, name: 'from W', expect: { u: 10, v: 0 } },
  ]
  for (const c of cases) {
    const { u, v } = windToVector(10, c.from)
    const ok = Math.abs(u - c.expect.u) < 1e-9 && Math.abs(v - c.expect.v) < 1e-9
    console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${pad(c.name, 8)} -> u=${num(u)} v=${num(v)} (flow blows toward the opposite compass point)`)
    if (!ok) fail(`wind vector wrong for ${c.name}: got u=${u} v=${v}`)
  }

  // The inspect card converts the flow vector back to a "from" bearing. That
  // round trip is where an inversion would hide.
  for (const from of [0, 37, 90, 173, 250, 359]) {
    const { u, v } = windToVector(8, from)
    let back = (Math.atan2(-u, -v) * 180) / Math.PI
    if (back < 0) back += 360
    const ok = Math.abs(back - from) < 1e-6
    if (!ok) fail(`bearing round trip failed: ${from}° -> ${back.toFixed(4)}°`)
    console.log(`   ${ok ? 'ok  ' : 'FAIL'} round trip ${pad(from + '°', 5)} -> ${back.toFixed(1)}° (${compass(back)})`)
  }
}

/* ------------------------------------------------- 4. AQI band mapping -- */

function checkAqiBands() {
  console.log('\n4. AQI band mapping against the published EPA breakpoints')

  // Official ranges and colours. Hard-coded here ON PURPOSE: this is an
  // independent copy of the published table, so if AQI_BANDS is ever edited
  // the two disagree and this fails.
  const OFFICIAL = [
    [0, 50, 'Good', '#00E400'],
    [51, 100, 'Moderate', '#FFFF00'],
    [101, 150, 'Unhealthy for Sensitive Groups', '#FF7E00'],
    [151, 200, 'Unhealthy', '#FF0000'],
    [201, 300, 'Very Unhealthy', '#8F3F97'],
    [301, 500, 'Hazardous', '#7E0023'],
  ]

  if (AQI_BANDS.length !== OFFICIAL.length) fail(`expected ${OFFICIAL.length} AQI bands, found ${AQI_BANDS.length}`)

  for (const [min, max, label, hex] of OFFICIAL) {
    const b = AQI_BANDS.find((x) => x.min === min && x.max === max)
    if (!b) {
      fail(`no AQI band for ${min}-${max}`)
      continue
    }
    const okLabel = b.label === label
    const okHex = b.hex.toUpperCase() === hex
    console.log(`   ${okLabel && okHex ? 'ok  ' : 'FAIL'} ${pad(min + '-' + max, 9)} ${pad(b.hex, 8)} ${b.label}`)
    if (!okLabel) fail(`band ${min}-${max} label is "${b.label}", official is "${label}"`)
    if (!okHex) fail(`band ${min}-${max} colour is ${b.hex}, official is ${hex}`)

    // Boundaries are where an off-by-one lands.
    for (const v of [min, max]) {
      const got = aqiBand(v)
      if (got?.label !== label) fail(`aqiBand(${v}) returned "${got?.label}", expected "${label}"`)
    }
    // rampColor must emit the official RGB exactly — no blending.
    const [r, g, bl] = rampColor('aqi', (min + max) / 2)
    const hx = '#' + [r, g, bl].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()
    if (hx !== hex) fail(`rampColor('aqi', ${(min + max) / 2}) = ${hx}, expected ${hex}`)
  }

  // Just-over-a-boundary must move up a band, and nothing may blend between.
  const pairs = [[50, 'Good'], [51, 'Moderate'], [100, 'Moderate'], [101, 'Unhealthy for Sensitive Groups'], [300, 'Very Unhealthy'], [301, 'Hazardous'], [900, 'Hazardous']]
  for (const [v, label] of pairs) {
    const got = aqiBand(v)?.label
    const ok = got === label
    console.log(`   ${ok ? 'ok  ' : 'FAIL'} AQI ${pad(v, 4)} -> ${got}`)
    if (!ok) fail(`aqiBand(${v}) = "${got}", expected "${label}"`)
  }
  if (aqiBand(null) !== null || aqiBand(undefined) !== null || aqiBand(NaN) !== null) {
    fail('aqiBand must return null for missing values rather than a colour')
  }
}

/* --------------------------------- 4b. AQI averaging-window semantics ---- */

/**
 * The sub-index and the concentration beside it are NOT the same measurement.
 *
 * EPA defines the PM2.5 sub-index over a 24-hour average, so the index the API
 * returns for a given hour reflects the preceding day, while the μg/m³ figure
 * for that hour is instantaneous. Delhi made this obvious: 67.5 μg/m³ with a
 * sub-index of 150, where mapping the instantaneous value through the published
 * breakpoints would give 159, and mapping the 24-hour mean (56.9) gives 152.
 *
 * The UI has to say so, or the two columns look like arithmetic that does not
 * work. This check exists so that if the provider ever switches to indexing the
 * instantaneous value, the explanation in the UI stops being true loudly rather
 * than quietly.
 */
async function checkAqiAveraging() {
  console.log('\n4b. AQI sub-index averaging window (PM2.5)')

  const gotJ = await getJson(
    'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.61&longitude=77.21' +
      '&hourly=pm2_5,us_aqi_pm2_5&past_days=2&forecast_days=1&timeformat=unixtime',
    'the AQI averaging window',
  )
  if (!gotJ.json) return
  const j = gotJ.json

  // EPA PM2.5 breakpoints, 2024 revision, on a 24-hour average in μg/m³.
  const BP = [
    [0, 9.0, 0, 50],
    [9.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 125.4, 151, 200],
    [125.5, 225.4, 201, 300],
    [225.5, 325.4, 301, 500],
  ]
  const toIndex = (c) => {
    for (const [cl, ch, il, ih] of BP) {
      if (c >= cl && c <= ch) return ((ih - il) / (ch - cl)) * (c - cl) + il
    }
    return null
  }

  const h = j.hourly
  const n = h.time.length
  let instErr = 0
  let avgErr = 0
  let samples = 0

  for (let i = n - 6; i < n; i++) {
    const inst = h.pm2_5[i]
    const sub = h.us_aqi_pm2_5[i]
    if (typeof inst !== 'number' || typeof sub !== 'number') continue
    const win = h.pm2_5.slice(Math.max(0, i - 23), i + 1).filter((v) => typeof v === 'number')
    const avg = win.reduce((a, b) => a + b, 0) / win.length
    const fromInst = toIndex(inst)
    const fromAvg = toIndex(avg)
    if (fromInst == null || fromAvg == null) continue
    instErr += Math.abs(fromInst - sub)
    avgErr += Math.abs(fromAvg - sub)
    samples++
    console.log(
      `   pm2.5 ${pad(num(inst), 6)} μg/m³  sub-index ${pad(Math.round(sub), 4)}  ` +
        `instantaneous→${pad(Math.round(fromInst), 4)}  24 h mean ${pad(num(avg), 6)}→${Math.round(fromAvg)}`,
    )
  }

  if (!samples) {
    warn('could not evaluate the AQI averaging window — no usable samples')
    return
  }
  const mi = instErr / samples
  const ma = avgErr / samples
  console.log(`   mean |error| vs sub-index:  instantaneous ${mi.toFixed(1)}   24 h mean ${ma.toFixed(1)}`)
  const ok = ma < mi
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} sub-index tracks the 24-hour mean, as EPA defines it`)
  if (!ok) {
    fail(
      'the PM2.5 sub-index no longer tracks a 24-hour mean — the inspect card explains the ' +
        'averaging window on the assumption that it does, so that copy is now wrong',
    )
  }
}

/* ------------------------------------------ 5. per-site live readings ---- */

async function checkSites() {
  console.log('\n5. Live readings — raw API value beside the value the card renders')

  for (const site of SITES) {
    const [w, a] = await Promise.all([
      fetchPointSeries(site.lat, site.lon),
      fetchPointAirQuality(site.lat, site.lon),
    ])

    console.log(`\n   ── ${site.name}  requested ${site.lat}, ${site.lon}`)

    if (w.status === 'throttled') {
      throttled(w.limitScope, `weather query for ${site.name}`)
      console.log(`      skip  rate limited (${w.limitScope ?? 'unknown'} ceiling) — cannot verify right now`)
      continue
    }
    if (w.status !== 'live') {
      fail(`${site.name}: weather query failed (${w.status} ${w.error ?? ''})`)
      continue
    }

    // Coordinate order. A silent lat/lon swap is the failure this catches:
    // Open-Meteo snaps to its model grid, so a small delta is fine, but a swap
    // would put the answer in a different hemisphere.
    const dLat = Math.abs(w.lat - site.lat)
    const dLon = Math.abs(w.lon - site.lon)
    const snapped = dLat < 0.6 && dLon < 0.6
    console.log(`      ${snapped ? 'ok  ' : 'FAIL'} model cell ${num(w.lat, 2)}, ${num(w.lon, 2)}  (Δ ${num(dLat, 2)}, ${num(dLon, 2)})${w.elevation != null ? `  ${Math.round(w.elevation)} m` : ''}`)
    if (!snapped) fail(`${site.name}: returned ${w.lat},${w.lon} for requested ${site.lat},${site.lon} — coordinates look swapped or mis-sent`)
    if (Math.abs(w.lat - site.lon) < 0.6 && Math.abs(w.lon - site.lat) < 0.6) {
      fail(`${site.name}: latitude and longitude are transposed`)
    }

    const i = nowIndex(w.times)
    const t = new Date(w.times[i] * 1000)

    // Reproduce exactly what the inspect card computes.
    const speed = w.windSpeed[i]
    const dir = w.windDir[i]
    const { u, v } = windToVector(speed, dir)
    let back = (Math.atan2(-u, -v) * 180) / Math.PI
    if (back < 0) back += 360

    console.log(`      hour        ${t.toISOString()}  [idx ${i}]`)
    console.log(`      temp        raw ${num(w.temp[i])} °C          -> card "${num(w.temp[i])} °C"`)
    console.log(`      cloud       raw ${num(w.cloud[i], 0)} %           -> card "${num(w.cloud[i], 0)}%"`)
    console.log(`      precip      raw ${num(w.precip[i])} mm          -> card "${num(w.precip[i])} mm"`)
    console.log(`      wind        raw ${num(speed)} m/s @ ${num(dir, 0)}°  -> card "${num(speed)} m/s · ${num(speed * 3.6)} km/h · from ${compass(dir)} ${Math.round(dir)}°"`)

    if (Math.abs(back - dir) > 0.01) fail(`${site.name}: wind bearing round trip drifted (${dir} -> ${back.toFixed(2)})`)

    // Sanity envelopes. These are deliberately wide — they catch unit errors
    // (a Celsius/Fahrenheit-sized gap, m/s read as km/h), not weather.
    if (w.temp[i] < -70 || w.temp[i] > 60) fail(`${site.name}: temperature ${w.temp[i]} °C is outside any plausible range — unit error`)
    if (speed < 0 || speed > 75) fail(`${site.name}: wind ${speed} m/s implausible — unit error`)
    if (w.cloud[i] < 0 || w.cloud[i] > 100) fail(`${site.name}: cloud cover ${w.cloud[i]} % out of range`)

    if (a.status === 'live') {
      let ai = a.times.indexOf(w.times[i])
      const matched = ai >= 0
      if (!matched) ai = nowIndex(a.times)
      const aqi = a.aqi[ai]
      const band = aqiBand(aqi)
      const subs = {}
      for (const p of AQ_POLLUTANTS) subs[p.sub] = a[p.sub]?.[ai]
      const dom = dominantPollutant(subs)

      console.log(`      aqi         raw ${num(aqi, 0)} USAQI       -> card "${num(aqi, 0)} ${band?.label}" ${band?.hex}`)
      console.log(`      dominant    ${dom ? `${dom.label} sub-index ${Math.round(dom.index)}` : '—'}`)
      console.log(`      pollutants  ${AQ_POLLUTANTS.map((p) => `${p.label} ${num(a[p.key]?.[ai])}`).join('  ')}`)
      console.log(`      ${matched ? 'ok  ' : 'warn'} AQ hour matched by timestamp${matched ? '' : ' — FELL BACK to nearest hour'}`)
      if (!matched) warn(`${site.name}: air quality hour did not match the weather hour by timestamp`)

      // EPA defines the reported AQI as the max of the sub-indices.
      if (dom && typeof aqi === 'number' && Math.abs(dom.index - aqi) > 1) {
        warn(`${site.name}: reported AQI ${aqi} vs highest sub-index ${Math.round(dom.index)} — expected these to agree`)
      }
      if (typeof aqi === 'number' && (aqi < 0 || aqi > 1000)) fail(`${site.name}: AQI ${aqi} out of range`)
    } else if (a.status === 'throttled') {
      throttled(a.limitScope, `air quality query for ${site.name}`)
      console.log(`      skip  air quality rate limited (${a.limitScope ?? 'unknown'} ceiling)`)
    } else {
      warn(`${site.name}: air quality query returned ${a.status}`)
    }

    // Independent observational cross-check, where one exists. NWS is station
    // data, not a model, so this is a genuinely different source rather than
    // the same number twice.
    if (site.nws) {
      try {
        const pts = await fetch(`https://api.weather.gov/points/${site.lat},${site.lon}`, {
          headers: { 'User-Agent': 'skybound-verify (personal study project)' },
        }).then((r) => r.json())
        const stationsUrl = pts?.properties?.observationStations
        if (stationsUrl) {
          const st = await fetch(stationsUrl, { headers: { 'User-Agent': 'skybound-verify (personal study project)' } }).then((r) => r.json())
          const first = st?.features?.[0]?.id
          if (first) {
            const ob = await fetch(`${first}/observations/latest`, {
              headers: { 'User-Agent': 'skybound-verify (personal study project)' },
            }).then((r) => r.json())
            const p = ob?.properties
            const obT = p?.temperature?.value
            const obW = p?.windSpeed?.value // km/h per NWS
            const obD = p?.windDirection?.value
            console.log(`      ── NOAA/NWS station ${p?.station ?? first} @ ${p?.timestamp}`)
            console.log(`         observed    ${num(obT)} °C · ${num(obW)} km/h${obD != null ? ` from ${compass(obD)} ${obD}°` : ''}`)
            if (typeof obT === 'number' && typeof w.temp[i] === 'number') {
              const gap = Math.abs(obT - w.temp[i])
              console.log(`         Δ temp      ${num(gap)} °C vs model`)
              // ~18 °C is the size of a C/F confusion; 8 is generous for
              // model-vs-station at a coarse grid point with terrain.
              if (gap > 15) fail(`Denver: model ${num(w.temp[i])} °C vs observed ${num(obT)} °C — gap of ${num(gap)} °C looks like a unit error, not weather`)
              else if (gap > 8) warn(`Denver: ${num(gap)} °C model-vs-station gap — large, but Denver sits at 1600 m and the grid is coarse`)
            }
            if (typeof obW === 'number' && typeof speed === 'number') {
              const modelKmh = speed * 3.6
              console.log(`         Δ wind      ${num(Math.abs(obW - modelKmh))} km/h vs model ${num(modelKmh)} km/h`)
              // If we had mislabelled m/s as km/h the ratio would sit near 3.6.
              if (obW > 8 && modelKmh > 8) {
                const ratio = obW / modelKmh
                if (ratio > 2.8 && ratio < 4.4) warn(`Denver: observed/model wind ratio ${num(ratio, 2)} is suspiciously close to 3.6 — check for an m/s vs km/h slip`)
              }
            }
            if (typeof obD === 'number' && typeof dir === 'number') {
              let d = Math.abs(obD - dir) % 360
              if (d > 180) d = 360 - d
              console.log(`         Δ dir       ${Math.round(d)}°`)
              if (d > 150) warn(`Denver: wind direction differs by ${Math.round(d)}° — near-opposite; worth an eye, though light winds swing freely`)
            }
          }
        }
      } catch (err) {
        warn(`NWS cross-check unavailable: ${err.message}`)
      }
    }
  }
}

/* ------------------------------------------- 6. sampler / legend sanity -- */

function checkSampler() {
  console.log('\n6. Sampler and legend integrity')

  const mk = (bounds) => ({
    nx: 2,
    ny: 2,
    bounds,
    points: [10, 20, 30, 40].map((v) => ({ cloud: [v], precip: [v], temp: [v], aqi: [v] })),
    times: [0],
  })

  /**
   * Node exactness is checked on a REGIONAL grid, not a global one.
   *
   * Longitude wrapping is only active when the grid spans the whole globe, and
   * on a global grid the east and west edges are the same meridian — so probing
   * the corner at exactly +180° wraps to −180° and legitimately returns the
   * west column. Using global bounds here would test the wrap, not the
   * interpolation, and would read as a sampler fault when it is not one.
   */
  const s = makeFieldSampler(mk({ west: -100, east: 100, south: -60, north: 60 }), 'aqi', 0)
  const corners = [
    ['NW', -100, 60, 10],
    ['NE', 100, 60, 20],
    ['SW', -100, -60, 30],
    ['SE', 100, -60, 40],
  ]
  for (const [name, lon, lat, want] of corners) {
    const got = s(lon, lat)
    const ok = Math.abs(got - want) < 1e-6
    console.log(`   ${ok ? 'ok  ' : 'FAIL'} node ${pad(name, 3)} -> ${num(got, 3)} (expected ${want})`)
    if (!ok) fail(`sampler at ${name} returned ${got}, expected ${want}`)
  }
  // Midpoint must land mid-range, confirming the easing is symmetric.
  const mid = s(0, 0)
  const okMid = Math.abs(mid - 25) < 1e-6
  console.log(`   ${okMid ? 'ok  ' : 'FAIL'} midpoint -> ${num(mid, 3)} (expected 25)`)
  if (!okMid) fail(`sampler midpoint returned ${mid}, expected 25`)

  // Longitude wrapping: the repeated world must not sample as out-of-bounds.
  const g = makeFieldSampler(mk({ west: -180, east: 180, south: -84, north: 84 }), 'aqi', 0)
  for (const lon of [-194.8, 193.2, 360, -360, 180, -180]) {
    const got = g(lon, 0)
    console.log(`   ${got != null ? 'ok  ' : 'FAIL'} wrapped lon ${pad(lon, 7)} -> ${num(got, 2)}`)
    if (got == null) fail(`sampler returned null at wrapped longitude ${lon}`)
  }
  // Documented degeneracy: on a global grid +180 and -180 are one meridian, so
  // they must agree. If they ever diverge, the wrap has broken.
  const anti = [g(180, 0), g(-180, 0)]
  const okAnti = Math.abs(anti[0] - anti[1]) < 1e-9
  console.log(`   ${okAnti ? 'ok  ' : 'FAIL'} antimeridian +180 and −180 agree (${num(anti[0], 2)} / ${num(anti[1], 2)})`)
  if (!okAnti) fail(`antimeridian mismatch: +180 gave ${anti[0]}, −180 gave ${anti[1]}`)

  // Missing values must be transparent, never a colour.
  const [, , , alpha] = rampColor('aqi', null)
  console.log(`   ${alpha === 0 ? 'ok  ' : 'FAIL'} missing AQI renders fully transparent (alpha ${alpha})`)
  if (alpha !== 0) fail('a missing AQI value produced a visible colour')
}

/* ----------------------------------------------------------- runner ---- */

console.log('Skybound live-data verification')
console.log('='.repeat(64))

try {
  await checkUnits()
  await checkTimeAlignment()
  checkWind()
  checkAqiBands()
  await checkAqiAveraging()
  checkSampler()
  await checkSites()
} catch (err) {
  fail(`verification aborted: ${err.stack ?? err}`)
}

console.log('\n' + '='.repeat(64))
if (WARN.length) {
  console.log(`\n${WARN.length} warning(s) — expected variance or a soft signal, not a code fault:`)
  for (const w of WARN) console.log(`  ~ ${w}`)
}
if (FAIL.length) {
  console.log(`\n${FAIL.length} FAILURE(S):`)
  for (const f of FAIL) console.log(`  ✗ ${f}`)
  console.log('')
  process.exit(1)
}

if (THROTTLED) {
  const when =
    THROTTLED.scope === 'minute'
      ? 'clears in under a minute'
      : THROTTLED.scope === 'hour'
        ? 'clears at the top of the hour'
        : THROTTLED.scope === 'day'
          ? 'clears tomorrow'
          : 'unknown reset window'
  console.log(`\n  INCOMPLETE  rate limited on the ${THROTTLED.scope} ceiling — ${when}.`)
  console.log(`              First hit on: ${THROTTLED.where}.`)
  console.log('              Everything reached was correct; the checks above marked "skip"')
  console.log('              simply could not run. Not a code fault — re-run once it resets.\n')
  process.exit(0)
}

console.log('\n  PASS  displayed values trace back to the API, units and bands verified\n')
