import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
// Pinned to MapLibre 5.24 — the mature line, and the default-export form.
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { AnimatePresence, motion } from 'framer-motion'
import WindField from '../components/explorer/WindField'
import FieldRenderer from '../components/explorer/FieldRenderer'
import { terminatorCollection } from '../components/explorer/terminator'
import { AnimatedNumber, StatusDot } from '../components/ui'
import {
  AQ_POLLUTANTS,
  AQI_BANDS,
  aqiBand,
  dominantPollutant,
  GIBS_LAYERS,
  GLOBAL_BOUNDS,
  RAMPS,
  cachedAirQualityGrid,
  cachedAtmosphereGrid,
  fetchAirQualityGrid,
  fetchAtmosphereGrid,
  fetchPointAirQuality,
  fetchPointSeries,
  gibsTileUrl,
  inspectAt,
  makeFieldSampler,
  makeWindSampler,
  nowIndex,
  rampCss,
  resolveGibsDate,
  WIND_RAMP,
} from '../data/liveData'
import { useReducedMotion } from '../theme/useReducedMotion'

const BASE_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const GIBS_SOURCE = 'gibs-src'
const GIBS_LAYER = 'gibs-lyr'
const NIGHT_SOURCE = 'night-src'
const NIGHT_LAYER = 'night-lyr'

const ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> · ' +
  '<a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a> · ' +
  '<a href="https://www.earthdata.nasa.gov/" target="_blank" rel="noreferrer">NASA GIBS</a> · ' +
  '<a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>'

const fmtLat = (v) => `${Math.abs(v).toFixed(1)}°${v >= 0 ? 'N' : 'S'}`
const fmtLon = (v) => {
  const w = ((((v + 180) % 360) + 360) % 360) - 180
  return `${Math.abs(w).toFixed(1)}°${w >= 0 ? 'E' : 'W'}`
}
const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
const compass = (d) => COMPASS[Math.round((((d % 360) + 360) % 360) / 22.5) % 16]

/** Run `fn` once the style is genuinely ready. */
function whenStyleReady(map, fn) {
  if (map.isStyleLoaded()) {
    fn()
    return () => {}
  }
  const handler = () => {
    if (!map.isStyleLoaded()) return
    map.off('idle', handler)
    map.off('styledata', handler)
    fn()
  }
  map.on('idle', handler)
  map.on('styledata', handler)
  return () => {
    map.off('idle', handler)
    map.off('styledata', handler)
  }
}

async function diagnoseMapFailure() {
  if (document.visibilityState === 'hidden') {
    return {
      title: 'Map paused — this tab is not visible',
      detail:
        'The map renders on an animation frame loop, which browsers pause in hidden or background tabs. Bring this tab to the foreground and it will finish loading.',
      retryable: true,
    }
  }
  const framesRan = await new Promise((resolve) => {
    let n = 0
    const tick = () => (++n >= 2 ? resolve(true) : requestAnimationFrame(tick))
    requestAnimationFrame(tick)
    setTimeout(() => resolve(n > 0), 1200)
  })
  if (!framesRan) {
    return {
      title: 'Map paused — no animation frames',
      detail:
        'This view is not painting frames, so the map engine cannot render. Open it in a normal foreground browser tab.',
      retryable: true,
    }
  }
  const c = document.createElement('canvas')
  if (!(c.getContext('webgl2') || c.getContext('webgl'))) {
    return {
      title: 'WebGL unavailable',
      detail: 'The map needs WebGL, which this browser or device has disabled. The rest of the reference works without it.',
      retryable: false,
    }
  }
  return {
    title: 'Map could not finish loading',
    detail: 'The map engine started but never completed its first render. The basemap may be blocked.',
    retryable: true,
  }
}

/* ------------------------------------------------------------- HUD ---- */

function Toggle({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[18px] w-8 shrink-0 rounded-full border transition-colors duration-300 ${
        on ? 'border-cirrus/50 bg-cirrus/25' : 'border-hairline bg-white/5'
      }`}
    >
      <span
        className={`absolute top-[2px] h-3 w-3 rounded-full transition-all duration-300 ${
          on ? 'left-[16px] bg-cirrus' : 'left-[2px] bg-ink-faint'
        }`}
      />
    </button>
  )
}

function LayerRow({ layer, onToggle, onOpacity, legend, note }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 transition-colors duration-300 ${
      layer.on ? 'border-hairline-lit bg-white/[0.04]' : 'border-hairline'
    }`}>
      <div className="flex items-center gap-2.5">
        <Toggle on={layer.on} onChange={onToggle} label={`Toggle ${layer.label}`} />
        <span className={`flex-1 text-[0.82rem] font-medium ${layer.on ? 'text-ink' : 'text-ink-faint'}`}>
          {layer.label}
        </span>
        <span className="hud-value text-[0.62rem] text-ink-faint">
          {Math.round(layer.opacity * 100)}%
        </span>
      </div>

      <AnimatePresence initial={false}>
        {layer.on && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2.5">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={layer.opacity}
                onChange={(e) => onOpacity(Number(e.target.value))}
                aria-label={`${layer.label} opacity`}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/12 accent-[var(--cirrus)]"
              />
              {legend && <div className="mt-2.5">{legend}</div>}
              {note && <p className="mt-2 text-[0.66rem] leading-relaxed text-ink-faint">{note}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RampLegend({ field }) {
  const r = RAMPS[field]
  if (!r) return null
  return (
    <div>
      <div
        className="h-1.5 w-full rounded-full ring-1 ring-inset ring-white/10"
        style={{ background: rampCss(field) }}
      />
      <div className="mt-1 flex justify-between font-mono text-[0.58rem] text-ink-faint">
        {r.ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
        <span>{r.unit}</span>
      </div>
    </div>
  )
}

function WindLegend() {
  const css = `linear-gradient(90deg, ${WIND_RAMP.map(
    (s) => `rgb(${s.c.join(',')}) ${(s.at / 34) * 100}%`,
  ).join(', ')})`
  return (
    <div>
      <div className="h-1.5 w-full rounded-full ring-1 ring-inset ring-white/10" style={{ background: css }} />
      <div className="mt-1 flex justify-between font-mono text-[0.58rem] text-ink-faint">
        <span>0</span>
        <span>8</span>
        <span>19</span>
        <span>34+ m/s</span>
      </div>
    </div>
  )
}

/**
 * Discrete swatches, not a gradient bar.
 *
 * The other legends are continuous because their variables are. AQI is a
 * categorical health scale, so a smooth bar would imply intermediate colours
 * that carry no official meaning — and would not let anyone match a colour on
 * the map back to a named category. Widths are proportional to each band's
 * true numeric span, so the 201–300 band reads twice as wide as 151–200.
 */
function AqiLegend() {
  const total = 500
  return (
    <div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full ring-1 ring-inset ring-white/10">
        {AQI_BANDS.map((b) => (
          <span
            key={b.label}
            title={`${b.min}–${b.max} ${b.label}`}
            style={{ background: b.hex, width: `${((b.max - b.min + 1) / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[0.58rem] text-ink-faint">
        <span>0</span>
        <span>100</span>
        <span>200</span>
        <span>300</span>
        <span>500 US AQI</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- the page ---- */

const INITIAL_LAYERS = {
  cloud: { label: 'Cloud cover', on: true, opacity: 0.8 },
  precip: { label: 'Precipitation', on: false, opacity: 0.9 },
  // Was 0.55, which combined with the ramp's own alpha into something too
  // washed out to read as a temperature field at all.
  temp: { label: 'Temperature', on: false, opacity: 0.8 },
  // Off by default, and fetched only once switched on. A second API means a
  // second call budget, and most sessions never open this layer.
  aqi: { label: 'Air quality', on: false, opacity: 0.8 },
  wind: { label: 'Wind field', on: true, opacity: 1 },
  night: { label: 'Night shading', on: true, opacity: 0.32 },
}

/**
 * The field grid is GLOBAL and fixed, not per-viewport.
 *
 * Fetching per viewport looked reasonable and was wrong twice over:
 *
 *   1. Coverage holes. The data only existed where it was last fetched, so
 *      zooming out left everything outside that box blank — and the refetch
 *      that would have fixed it is exactly what the rate limit blocked.
 *   2. Request volume. Every pan and zoom was a weighted API call, which is
 *      what exhausted the quota in the first place.
 *
 * A global grid removes both: coverage can never have a hole, and panning and
 * zooming cost nothing. It is refreshed on a timer, not on movement.
 *
 * The cost is fixed resolution — ~19° between samples. That is an overview,
 * and the UI says so. For local accuracy the inspect card issues a direct
 * point query, and the GIBS satellite layers carry real sensor resolution.
 *
 * Size is set by the quota, not by taste. Open-Meteo bills a multi-location
 * request per LOCATION, so a 600-point grid costs 600 calls, not one.
 *
 * THE TRADE THAT MATTERS: density beats refresh rate, and it is not close.
 *
 * Each fetch returns a full 48-HOUR hourly series, and `nowIndex` picks the
 * current hour out of it. So a grid fetched six hours ago still holds the right
 * value for right now — refreshing often re-downloads numbers we already have.
 * Spatial resolution, by contrast, cannot be recovered after the fact: at the
 * original 15×9 the samples sat 26° apart, which renders as vague smears with
 * no geographic structure. It read as a broken layer rather than a coarse one.
 *
 * So the refresh interval was spent on resolution instead.
 *
 * THE CEILING IS PER-MINUTE, NOT PER-DAY. This is the part that is easy to get
 * wrong, and it was: the free tier allows 600 calls/MINUTE, 5,000/hour and
 * 10,000/day, and one grid refresh is a single burst. A 31×19 grid (589 points)
 * fits the daily budget comfortably and still fails, because 589 calls in a few
 * seconds sits right on the minute limit — the API answers
 * "Minutely API request limit exceeded" and the map gets nothing at all.
 * Verified the hard way.
 *
 * So the grid is sized to the minute, with room for the other caller:
 *
 *   weather  375 pts (25×15, 3 requests)
 *   air qual 187 pts (17×11, 2 requests)
 *            -----------------------------
 *            562 calls in the worst-case minute   (limit 600)
 *   daily    562 × 4 refreshes = 2,248 calls/day  (limit 10,000)
 *
 * That is 2.8× the original sample count at 15° spacing instead of 26°, for
 * under a quarter of the daily quota — the original 15×9 on a 20-minute timer
 * cost 9,720 calls/day, 97% of the cap, for a third of the detail.
 *
 * Anything denser than ~600 points would have to fill in progressively across
 * minutes, which trades a coarse map for a half-drawn one. Not worth it.
 */
const GRID_NX = 25
const GRID_NY = 15
const REFRESH_MS = 6 * 60 * 60 * 1000

// Denser than the old 13×7 but kept below the weather grid so the two together
// stay inside one minute's allowance. CAMS resolves at 0.4° globally and 0.1°
// over Europe, so there is far more detail here than either grid can show.
const AQ_NX = 17
const AQ_NY = 11
const AQ_REFRESH_MS = 6 * 60 * 60 * 1000

export default function Explorer() {
  const containerRef = useRef(null)
  const windCanvasRef = useRef(null)
  const mapRef = useRef(null)
  const fieldRef = useRef(null)
  const rendererRef = useRef(null)
  const abortRef = useRef(null)

  const reduced = useReducedMotion()

  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [satKey, setSatKey] = useState('none')
  const [satOpacity, setSatOpacity] = useState(0.85)
  const [gibsDate, setGibsDate] = useState(null)
  const [layers, setLayers] = useState(INITIAL_LAYERS)
  const [grid, setGrid] = useState(null)
  const [limitScope, setLimitScope] = useState(null)
  const [aqGrid, setAqGrid] = useState(null)
  const [aqStatus, setAqStatus] = useState('idle')
  const [pointAq, setPointAq] = useState(null)
  const [aqOpen, setAqOpen] = useState(false)
  const [status, setStatus] = useState('loading')
  const [fetchedAt, setFetchedAt] = useState(null)
  const [tIndex, setTIndex] = useState(0)
  const [inspect, setInspect] = useState(null)
  const [point, setPoint] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [globe, setGlobe] = useState(false)
  const [nowTick, setNowTick] = useState(Date.now())
  const [zoom, setZoom] = useState(1.7)

  const setLayer = useCallback((key, patch) => {
    setLayers((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }, [])

  /* ---- data: one global grid, refreshed on a timer ---- */
  const loadGrid = useCallback(async ({ force = false } = {}) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    // Reuse a still-valid cache rather than spending several hundred billed
    // calls to re-download the same 48-hour series on every mount.
    if (!force) {
      const cached = cachedAtmosphereGrid(REFRESH_MS, GRID_NX * GRID_NY)
      if (cached) {
        setGrid(cached)
        setStatus('live')
        setLimitScope(null)
        setFetchedAt(cached.fetchedAt)
        setTIndex((cur) =>
          cur === 0 && cached.times?.length
            ? nowIndex(cached.times)
            : Math.min(cur, (cached.times?.length ?? 1) - 1),
        )
        return
      }
    }

    setStatus((s) => (s === 'live' ? 'live' : 'loading'))

    try {
      const g = await fetchAtmosphereGrid(GLOBAL_BOUNDS, GRID_NX, GRID_NY, ctrl.signal)
      // Only replace a good grid with a good grid. A throttled response with no
      // cache carries no points, and swapping it in would blank a map that is
      // currently showing perfectly serviceable data. Functional form because
      // loadGrid is a stable callback and must not close over `grid`.
      setGrid((prev) => (g.points?.length || !prev ? g : prev))
      setLimitScope(g.status === 'throttled' ? (g.limitScope ?? 'unknown') : null)
      setStatus(g.status)
      // Only stamp a fetch time when data actually arrived. Defaulting to
      // Date.now() made a throttled response with nothing cached report
      // "Data — just now" over an empty map, which is the exact opposite of the
      // truth and the worst thing a freshness indicator can say.
      if (g.points?.length) setFetchedAt(g.fetchedAt ?? Date.now())
      else if (!g.fetchedAt) setFetchedAt(null)
      setTIndex((cur) =>
        cur === 0 && g.times?.length ? nowIndex(g.times) : Math.min(cur, (g.times?.length ?? 1) - 1),
      )
    } catch (err) {
      if (err.name !== 'AbortError') setStatus('error')
    }
  }, [])

  /**
   * Wait out a minutely throttle instead of surfacing it as a dead end.
   *
   * 600 calls/minute is easy to trip — two reloads, or the air quality layer
   * switched on right after first load — and it clears in under a minute. Asking
   * someone to press Retry on something that fixes itself in 40 seconds is a
   * worse experience than the throttle. Hourly and daily limits are NOT retried
   * on a timer: hammering a service that has already said no for the next hour
   * is how a temporary block becomes a longer one.
   */
  useEffect(() => {
    if (limitScope !== 'minute') return
    const id = setTimeout(() => loadGrid({ force: true }), 65000)
    return () => clearTimeout(id)
  }, [limitScope, loadGrid])

  /* ---- air quality: separate API, lazy, slow cadence ---- */
  const aqAbort = useRef(null)

  const loadAq = useCallback(async (alignTo, { force = false } = {}) => {
    aqAbort.current?.abort()
    const ctrl = new AbortController()
    aqAbort.current = ctrl

    if (!force) {
      const cached = cachedAirQualityGrid(AQ_REFRESH_MS, AQ_NX * AQ_NY)
      if (cached) {
        setAqGrid(cached)
        setAqStatus('live')
        return
      }
    }

    setAqStatus((s) => (s === 'live' ? 'live' : 'loading'))
    try {
      const g = await fetchAirQualityGrid(GLOBAL_BOUNDS, AQ_NX, AQ_NY, ctrl.signal, alignTo)
      setAqGrid(g)
      setAqStatus(g.status)
    } catch (err) {
      if (err.name !== 'AbortError') setAqStatus('error')
    }
  }, [])

  // Fetch on first activation, then keep it fresh on its own slow timer while
  // the layer stays on. Toggling off does not discard the grid — flipping the
  // layer back on should not cost another 91 calls.
  const aqOn = layers.aqi.on
  const gridTimes = grid?.times
  useEffect(() => {
    if (!aqOn) return
    if (!aqGrid) loadAq(gridTimes)
    const id = setInterval(() => loadAq(gridTimes, { force: true }), AQ_REFRESH_MS)
    return () => clearInterval(id)
    // aqGrid intentionally excluded: including it would re-run this effect the
    // moment the fetch lands and restart the interval on every refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aqOn, gridTimes, loadAq])

  useEffect(() => () => aqAbort.current?.abort(), [])

  /* ---- map init ---- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      center: [10, 25],
      zoom: 1.7,
      minZoom: 0.8,
      maxZoom: 9,
      attributionControl: false,
      // Rotation is disabled deliberately: the heatmap is blitted as an
      // axis-aligned rectangle over the projected grid bounds, which is only
      // valid on a north-up map. Allowing rotation would shear the data.
      dragRotate: false,
      pitchWithRotate: false,
    })
    mapRef.current = map
    map.touchZoomRotate?.disableRotation()
    if (import.meta.env.DEV) window.__sky = { map, field: () => fieldRef.current }

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: ATTRIBUTION }),
      'bottom-right',
    )

    let settled = false
    const markReady = () => {
      if (settled) return
      settled = true
      clearTimeout(readyTimer)
      setMapReady(true)
      setMapError(null)
      loadGrid()
    }
    map.on('load', markReady)
    map.on('styledata', () => map.isStyleLoaded() && markReady())

    const readyTimer = setTimeout(async () => {
      if (!settled) setMapError(await diagnoseMapFailure())
    }, 10000)

    // Movement no longer triggers a fetch — the grid is global, so panning and
    // zooming are free. Only the particle trails need invalidating.
    const onMove = () => {
      setZoom(map.getZoom())
      fieldRef.current?.invalidate()
    }
    map.on('moveend', onMove)

    const onClick = (e) => setInspect({ lon: e.lngLat.lng, lat: e.lngLat.lat })
    map.on('click', onClick)

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      map.resize()
      map.triggerRepaint?.()
      if (map.isStyleLoaded()) markReady()
      else setMapError(null)
    }
    document.addEventListener('visibilitychange', onVisible)

    const ro = new ResizeObserver(() => {
      map.resize()
      rendererRef.current?.resize()
      fieldRef.current?.resize()
    })
    ro.observe(containerRef.current)

    return () => {
      clearTimeout(readyTimer)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
      abortRef.current?.abort()
      fieldRef.current?.destroy()
      rendererRef.current?.destroy()
      map.remove()
      mapRef.current = null
    }
  }, [loadGrid])

  /* ---- renderers ---- */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !windCanvasRef.current) return

    const renderer = new FieldRenderer(map)
    rendererRef.current = renderer

    const field = new WindField(windCanvasRef.current, map, { reducedMotion: reduced })
    fieldRef.current = field
    field.resize()
    field.start()

    const onResize = () => field.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.destroy()
      field.destroy()
      rendererRef.current = null
      fieldRef.current = null
    }
  }, [mapReady, reduced])

  /* ---- heatmap layers ---- */
  // Order is bottom-to-top. Air quality sits above temperature but below cloud
  // and precipitation, which are the weather story the map leads with.
  const heatLayers = useMemo(() => {
    const out = []
    for (const f of ['temp', 'aqi', 'precip', 'cloud']) {
      if (!layers[f].on) continue
      // Air quality carries its own grid — different API, different cadence.
      out.push(
        f === 'aqi'
          ? { field: f, opacity: layers[f].opacity, grid: aqGrid }
          : { field: f, opacity: layers[f].opacity },
      )
    }
    return out
  }, [layers, aqGrid])

  useEffect(() => {
    rendererRef.current?.setLayers(heatLayers)
  }, [heatLayers, mapReady])

  useEffect(() => {
    if (grid) rendererRef.current?.setData(grid, tIndex)
  }, [grid, tIndex, mapReady])

  /* ---- wind ---- */
  const windSampler = useMemo(() => (grid ? makeWindSampler(grid, tIndex) : null), [grid, tIndex])

  useEffect(() => {
    const f = fieldRef.current
    if (!f) return
    f.setSampler(layers.wind.on ? windSampler : null)
    if (layers.wind.on) f.start()
    else f.clear()
  }, [windSampler, layers.wind.on, mapReady])

  /* ---- GIBS raster ---- */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    let cancelled = false
    const ctrl = new AbortController()

    const removeExisting = () => {
      try {
        if (map.getLayer(GIBS_LAYER)) map.removeLayer(GIBS_LAYER)
        if (map.getSource(GIBS_SOURCE)) map.removeSource(GIBS_SOURCE)
      } catch {
        /* style may be mid-swap */
      }
    }

    if (satKey === 'none') {
      removeExisting()
      setGibsDate(null)
      return
    }

    let detach = () => {}
    ;(async () => {
      const date = await resolveGibsDate(satKey, ctrl.signal).catch(() => null)
      if (cancelled) return
      setGibsDate(date)
      if (!date) return

      // Adding a source before the style is genuinely ready throws, and the
      // rejection is swallowed inside this async block — which is exactly how
      // the layer silently failed to appear before.
      detach = whenStyleReady(map, () => {
        if (cancelled) return
        try {
          removeExisting()
          const cfg = GIBS_LAYERS[satKey]
          map.addSource(GIBS_SOURCE, {
            type: 'raster',
            tiles: [gibsTileUrl(satKey, date)],
            tileSize: 256,
            maxzoom: cfg.maxZoom,
            attribution: 'NASA GIBS',
          })
          const firstSymbol = map.getStyle().layers.find((l) => l.type === 'symbol')?.id
          map.addLayer(
            {
              id: GIBS_LAYER,
              type: 'raster',
              source: GIBS_SOURCE,
              paint: { 'raster-opacity': satOpacity, 'raster-fade-duration': 300 },
            },
            firstSymbol,
          )
        } catch (err) {
          console.warn('[skybound] GIBS layer add failed:', err)
        }
      })
    })()

    return () => {
      cancelled = true
      ctrl.abort()
      detach()
    }
    // satOpacity intentionally excluded — handled by its own effect below so
    // dragging the slider does not tear down and refetch the layer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satKey, mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (map?.getLayer(GIBS_LAYER)) {
      try {
        map.setPaintProperty(GIBS_LAYER, 'raster-opacity', satOpacity)
      } catch {
        /* layer removed mid-update */
      }
    }
  }, [satOpacity, satKey, gibsDate])

  /* ---- night shading ---- */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    let cancelled = false

    const detach = whenStyleReady(map, () => {
      if (cancelled) return
      try {
        if (!map.getSource(NIGHT_SOURCE)) {
          map.addSource(NIGHT_SOURCE, { type: 'geojson', data: terminatorCollection() })
        }
        if (!map.getLayer(NIGHT_LAYER)) {
          const firstSymbol = map.getStyle().layers.find((l) => l.type === 'symbol')?.id
          map.addLayer(
            {
              id: NIGHT_LAYER,
              type: 'fill',
              source: NIGHT_SOURCE,
              paint: {
                'fill-color': '#02040a',
                'fill-opacity': layers.night.on ? layers.night.opacity : 0,
                'fill-opacity-transition': { duration: 400 },
              },
            },
            firstSymbol,
          )
        }
      } catch (err) {
        console.warn('[skybound] night layer failed:', err)
      }
    })
    return () => {
      cancelled = true
      detach()
    }
  }, [mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (map?.getLayer(NIGHT_LAYER)) {
      try {
        map.setPaintProperty(NIGHT_LAYER, 'fill-opacity', layers.night.on ? layers.night.opacity : 0)
      } catch {
        /* ignore */
      }
    }
  }, [layers.night.on, layers.night.opacity, mapReady])

  // Periodic data refresh. This is the only thing that fetches the grid now,
  // so request volume is bounded by wall-clock time rather than by how much
  // the reader pans around.
  useEffect(() => {
    if (!mapReady) return
    const id = setInterval(() => loadGrid({ force: true }), REFRESH_MS)
    return () => clearInterval(id)
  }, [mapReady, loadGrid])

  // Terminator drifts; refresh it every few minutes.
  useEffect(() => {
    const id = setInterval(() => {
      setNowTick(Date.now())
      const src = mapRef.current?.getSource(NIGHT_SOURCE)
      if (src) src.setData(terminatorCollection())
    }, 180000)
    return () => clearInterval(id)
  }, [])

  /* ---- globe projection ---- */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    try {
      map.setProjection?.({ type: globe ? 'globe' : 'mercator' })
    } catch (err) {
      console.warn('[skybound] projection switch unsupported:', err)
    }
  }, [globe, mapReady])

  /* ---- inspect: real point query, not grid interpolation ---- */
  const pointAbort = useRef(null)

  useEffect(() => {
    if (!inspect) {
      setPoint(null)
      return
    }
    pointAbort.current?.abort()
    const ctrl = new AbortController()
    pointAbort.current = ctrl
    setPoint({ status: 'loading' })
    setPointAq({ status: 'loading' })
    // Two independent requests to two different services. Kept separate rather
    // than Promise.all'd so a slow or failing air quality endpoint cannot hold
    // up — or take down — the weather readout.
    fetchPointSeries(inspect.lat, inspect.lon, ctrl.signal)
      .then((res) => !ctrl.signal.aborted && setPoint(res))
      .catch((err) => {
        if (err.name !== 'AbortError') setPoint({ status: 'error' })
      })
    fetchPointAirQuality(inspect.lat, inspect.lon, ctrl.signal)
      .then((res) => !ctrl.signal.aborted && setPointAq(res))
      .catch((err) => {
        if (err.name !== 'AbortError') setPointAq({ status: 'error' })
      })
    return () => ctrl.abort()
  }, [inspect])

  /* ---- derived ---- */
  const times = grid?.times ?? []
  const currentTime = times[tIndex]
  const hasData = times.length > 1

  const inspectValues = useMemo(() => {
    // Prefer the exact model value for the clicked location. The grid is for
    // drawing fields; interpolating it for a point reading is what produced
    // a wrong temperature at city scale.
    if (point?.status === 'live' && point.times?.length) {
      let i = point.times.indexOf(currentTime)
      if (i < 0) i = nowIndex(point.times)
      return {
        source: 'point',
        modelLat: point.lat,
        modelLon: point.lon,
        elevation: point.elevation,
        cloud: point.cloud[i],
        precip: point.precip[i],
        temp: point.temp[i],
        windSpeed: point.windSpeed[i],
        windDir: point.windDir[i],
      }
    }
    // Fallback only — labelled as such in the card.
    if (inspect && grid) {
      return { source: 'grid', ...inspectAt(grid, tIndex, inspect.lon, inspect.lat) }
    }
    return null
  }, [point, inspect, grid, tIndex, currentTime])

  /**
   * Air quality for the inspect card.
   *
   * Same precedence as the weather readout: a direct point query is the real
   * answer, and the interpolated grid is only a labelled fallback. The time
   * index is resolved by TIMESTAMP against the scrubber's selected hour, never
   * by reusing the weather array's position.
   */
  const aqValues = useMemo(() => {
    if (pointAq?.status === 'live' && pointAq.times?.length) {
      let i = pointAq.times.indexOf(currentTime)
      if (i < 0) i = nowIndex(pointAq.times)
      const subs = {}
      for (const p of AQ_POLLUTANTS) subs[p.sub] = pointAq[p.sub]?.[i]
      const conc = {}
      for (const p of AQ_POLLUTANTS) conc[p.key] = pointAq[p.key]?.[i]
      return {
        source: 'point',
        aqi: pointAq.aqi?.[i],
        dominant: dominantPollutant(subs),
        subs,
        conc,
      }
    }
    if (inspect && aqGrid?.points?.length) {
      const s = makeFieldSampler(aqGrid, 'aqi', tIndex)
      const v = s ? s(inspect.lon, inspect.lat) : null
      return v == null ? null : { source: 'grid', aqi: v, dominant: null, subs: {}, conc: {} }
    }
    return null
  }, [pointAq, inspect, aqGrid, tIndex, currentTime])

  const freshness = useMemo(() => {
    if (!fetchedAt) return null
    const mins = Math.floor((nowTick - fetchedAt) / 60000)
    if (mins < 1) return 'just now'
    if (mins === 1) return '1 min ago'
    if (mins < 60) return `${mins} min ago`
    return `${Math.floor(mins / 60)} h ago`
  }, [fetchedAt, nowTick])

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  // Name the ceiling, not just the fact. "Waiting out the minute limit" and
  // "out of calls for today" call for completely different patience.
  const statusLabel =
    status === 'throttled'
      ? limitScope === 'minute'
        ? 'Throttled — retrying'
        : limitScope === 'hour'
          ? 'Hourly limit reached'
          : limitScope === 'day'
            ? 'Daily limit reached'
            : 'Rate limited'
      : status === 'cached'
        ? 'Cached'
        : undefined

  const controls = (
    <>
      <div>
        <p className="hud-label mb-2">Satellite imagery</p>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(GIBS_LAYERS).map((l) => (
            <button
              key={l.id}
              onClick={() => setSatKey(l.id)}
              aria-pressed={satKey === l.id}
              className={`rounded-md border px-2.5 py-2 text-left transition-colors duration-300 ${
                satKey === l.id ? 'border-cirrus/50 bg-cirrus/12 text-cirrus' : 'border-hairline text-ink-soft hover:text-ink'
              }`}
            >
              <span className="block text-[0.76rem] font-medium">{l.label}</span>
              <span className="mt-0.5 block font-mono text-[0.56rem] opacity-70">{l.detail}</span>
            </button>
          ))}
        </div>
        {satKey !== 'none' && (
          <div className="mt-2.5">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={satOpacity}
              onChange={(e) => setSatOpacity(Number(e.target.value))}
              aria-label="Satellite opacity"
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/12 accent-[var(--cirrus)]"
            />
            <p className="mt-1.5 text-[0.66rem] leading-relaxed text-ink-faint">
              {GIBS_LAYERS[satKey].blurb}
            </p>
          </div>
        )}
      </div>

      <div className="rule-fade" />

      <div className="space-y-1.5">
        <p className="hud-label mb-2">Data layers</p>
        <LayerRow
          layer={layers.cloud}
          onToggle={(on) => setLayer('cloud', { on })}
          onOpacity={(opacity) => setLayer('cloud', { opacity })}
          legend={<RampLegend field="cloud" />}
          // Spacing is stated as measured, not as a single round number. Rows
          // are evenly spaced in Mercator Y to match how the heatmap is blitted,
          // which means the latitude gap widens toward the equator — the grid is
          // coarsest exactly where most people look.
          note={`Interpolated from a fixed global ${GRID_NX}×${GRID_NY} grid — samples sit 12° apart in longitude and 2–18° apart in latitude, widest at the equator. Continental-scale structure, not individual cloud systems. Click any point for an exact model reading, or use the Cloud fraction satellite layer for real sensor resolution.`}
        />
        <LayerRow
          layer={layers.precip}
          onToggle={(on) => setLayer('precip', { on })}
          onOpacity={(opacity) => setLayer('precip', { opacity })}
          legend={<RampLegend field="precip" />}
        />
        <LayerRow
          layer={layers.temp}
          onToggle={(on) => setLayer('temp', { on })}
          onOpacity={(opacity) => setLayer('temp', { opacity })}
          legend={<RampLegend field="temp" />}
        />
        <LayerRow
          layer={layers.aqi}
          onToggle={(on) => setLayer('aqi', { on })}
          onOpacity={(opacity) => setLayer('aqi', { opacity })}
          legend={<AqiLegend />}
          note={
            aqStatus === 'loading'
              ? 'Loading CAMS air quality…'
              : aqStatus === 'error'
                ? 'Air quality unavailable — the CAMS endpoint did not respond.'
                : aqStatus === 'throttled'
                  ? 'Rate limited — showing the last cached air quality grid.'
                  : `US EPA AQI from CAMS, interpolated from a ${AQ_NX}×${AQ_NY} global grid — 20° apart in longitude, 4–27° in latitude. Colours are the official EPA category bands. This is modelled data, not station observations, and still far coarser than the air you are breathing — click any point for a direct query.`
          }
        />
        <LayerRow
          layer={layers.wind}
          onToggle={(on) => setLayer('wind', { on })}
          onOpacity={(opacity) => setLayer('wind', { opacity })}
          legend={<WindLegend />}
          note={reduced ? 'Static vector field — animation disabled for reduced motion.' : null}
        />
        <LayerRow
          layer={layers.night}
          onToggle={(on) => setLayer('night', { on })}
          onOpacity={(opacity) => setLayer('night', { opacity })}
          note="Approximate solar terminator, refreshed every few minutes."
        />
      </div>

      <div className="rule-fade" />

      <div className="flex items-center justify-between">
        <div>
          <p className="hud-label">Globe view</p>
          <p className="mt-0.5 text-[0.66rem] text-ink-faint">3D projection</p>
        </div>
        <Toggle on={globe} onChange={setGlobe} label="Toggle globe projection" />
      </div>
    </>
  )

  return (
    <div className="relative" style={{ height: 'calc(100dvh - 57px)' }}>
      {/*
        h-full, not `absolute inset-0`. MapLibre adds `.maplibregl-map`, whose
        stylesheet sets `position: relative` — same specificity as a Tailwind
        utility and loaded later, so `absolute` loses and `inset-0` stops
        applying. The container then collapses to 0 height and MapLibre falls
        back to a default 1280x300 canvas.
      */}
      <div ref={containerRef} className="h-full w-full" aria-label="Interactive world map" />

      {/* The heatmaps are a MapLibre canvas source, not a DOM overlay — see
          FieldRenderer. Only the wind particles need their own canvas. */}
      <canvas
        ref={windCanvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: layers.wind.on ? layers.wind.opacity : 0, transition: 'opacity 400ms var(--ease-out)' }}
        aria-hidden="true"
      />

      <AnimatePresence>
        {!mapReady && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-void px-6"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {mapError ? (
              <div className="glass max-w-md rounded-xl p-6 text-center">
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" className="mx-auto text-gold">
                  <path d="M12 3 22 20H2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="12" cy="17.4" r="0.9" fill="currentColor" />
                </svg>
                <h2 className="display mt-4 text-lg text-ink">{mapError.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{mapError.detail}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  {mapError.retryable && (
                    <button onClick={() => window.location.reload()} className="rounded-full bg-cirrus px-4 py-2 text-xs font-medium text-void">
                      Retry
                    </button>
                  )}
                  <Link to="/clouds" className="rounded-full border border-hairline px-4 py-2 text-xs font-medium text-ink">
                    Go to the reference
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-cirrus" />
                <p className="hud-label mt-4">Initialising atmosphere</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- desktop layer panel --- */}
      <motion.aside
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="glass absolute left-4 top-4 z-20 hidden max-h-[calc(100%-8rem)] w-[17.5rem] space-y-3.5 overflow-y-auto rounded-xl p-4 lg:block"
      >
        <div className="flex items-center justify-between">
          <p className="display text-sm text-ink">Atmosphere</p>
          <StatusDot status={status === 'throttled' ? 'cached' : status} label={statusLabel} />
        </div>
        {controls}
      </motion.aside>

      {/* --- inspect card --- */}
      <AnimatePresence>
        {inspect && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="glass-strong absolute right-4 top-4 z-20 w-[16.5rem] rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="hud-label">Inspect</p>
                <p className="hud-value mt-1 text-sm text-ink">
                  {fmtLat(inspect.lat)} {fmtLon(inspect.lon)}
                </p>
              </div>
              <button
                onClick={() => setInspect(null)}
                aria-label="Close inspect panel"
                className="rounded-full border border-hairline p-1.5 text-ink-soft hover:text-ink"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <div>
                <p className="hud-label">Cloud</p>
                <p className="hud-value mt-0.5 text-lg text-ink">
                  {inspectValues?.cloud != null ? <><AnimatedNumber value={inspectValues.cloud} decimals={0} />%</> : '—'}
                </p>
              </div>
              <div>
                <p className="hud-label">Temp</p>
                <p className="hud-value mt-0.5 text-lg text-gold">
                  {inspectValues?.temp != null ? <><AnimatedNumber value={inspectValues.temp} decimals={1} />°C</> : '—'}
                </p>
              </div>
              <div>
                <p className="hud-label">Wind</p>
                <p className="hud-value mt-0.5 text-lg text-cirrus">
                  {inspectValues?.windSpeed != null ? <><AnimatedNumber value={inspectValues.windSpeed} decimals={1} /> m/s</> : '—'}
                </p>
                {inspectValues?.windSpeed != null && (
                  // km/h alongside m/s: m/s is the meteorological unit, but
                  // every consumer weather app reports km/h, and having both
                  // makes the reading directly checkable against one.
                  <p className="hud-value mt-0.5 text-[0.65rem] text-ink-faint">
                    {(inspectValues.windSpeed * 3.6).toFixed(1)} km/h
                    {inspectValues.windDir != null && (
                      <> · from {compass(inspectValues.windDir)} {Math.round(inspectValues.windDir)}°</>
                    )}
                  </p>
                )}
              </div>
              <div>
                <p className="hud-label">Precip</p>
                <p className="hud-value mt-0.5 text-lg text-violet">
                  {inspectValues?.precip != null ? <><AnimatedNumber value={inspectValues.precip} decimals={1} /> mm</> : '—'}
                </p>
              </div>
            </div>

            {/* --- air quality --- */}
            <div className="mt-3 border-t border-hairline pt-2.5">
              {pointAq?.status === 'loading' && !aqValues && (
                <p className="hud-label text-cirrus">Querying air quality…</p>
              )}
              {(pointAq?.status === 'error' || pointAq?.status === 'throttled') && !aqValues && (
                <p className="text-[0.62rem] leading-relaxed text-ink-faint">
                  Air quality unavailable for this point.
                </p>
              )}
              {aqValues?.aqi != null &&
                (() => {
                  const band = aqiBand(aqValues.aqi)
                  return (
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className="h-7 w-1.5 shrink-0 rounded-full"
                          style={{ background: band.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="hud-label">Air quality · US AQI</p>
                          <p className="hud-value mt-0.5 text-lg text-ink">
                            <AnimatedNumber value={aqValues.aqi} decimals={0} />
                            <span className="ml-1.5 align-middle text-[0.65rem] text-ink-soft">
                              {band.label}
                            </span>
                          </p>
                        </div>
                      </div>

                      {aqValues.dominant && (
                        <p className="hud-value mt-1 text-[0.65rem] text-ink-faint">
                          Driven by {aqValues.dominant.label} · sub-index{' '}
                          {Math.round(aqValues.dominant.index)}
                        </p>
                      )}

                      <p className="mt-1.5 text-[0.62rem] leading-relaxed text-ink-soft">
                        {band.health}
                      </p>

                      {aqValues.source === 'point' && (
                        <>
                          <button
                            onClick={() => setAqOpen((v) => !v)}
                            aria-expanded={aqOpen}
                            className="hud-label mt-2 flex w-full items-center justify-between rounded border border-hairline px-2 py-1.5 text-ink-soft transition-colors hover:text-ink"
                          >
                            <span>Pollutants</span>
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 12 12"
                              aria-hidden="true"
                              className="transition-transform duration-200"
                              style={{ transform: aqOpen ? 'rotate(180deg)' : 'none' }}
                            >
                              <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                            </svg>
                          </button>

                          <AnimatePresence initial={false}>
                            {aqOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                className="overflow-hidden"
                              >
                                <table className="mt-1.5 w-full border-collapse">
                                  <caption className="sr-only">
                                    Pollutant concentrations for this hour, beside their US EPA AQI
                                    sub-indices, which are computed over each pollutant&rsquo;s
                                    official averaging window
                                  </caption>
                                  <thead>
                                    <tr className="hud-label text-ink-faint">
                                      <th scope="col" className="py-1 text-left font-normal">Species</th>
                                      <th scope="col" className="py-1 text-right font-normal" title="Concentration for this hour">
                                        μg/m³ <span className="text-ink-faint/70">1 h</span>
                                      </th>
                                      <th scope="col" className="py-1 text-right font-normal" title="EPA sub-index over the pollutant's official averaging window">
                                        Sub-idx <span className="text-ink-faint/70">avg</span>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {AQ_POLLUTANTS.map((p) => {
                                      const c = aqValues.conc[p.key]
                                      const sub = aqValues.subs[p.sub]
                                      const isDom = aqValues.dominant?.key === p.key
                                      return (
                                        <tr
                                          key={p.key}
                                          className="border-t border-hairline/60 font-mono text-[0.65rem]"
                                        >
                                          <td className={`py-1 ${isDom ? 'text-gold' : 'text-ink-soft'}`}>
                                            {p.label}
                                            {isDom && <span className="sr-only"> (dominant pollutant)</span>}
                                          </td>
                                          <td className="py-1 text-right tabular-nums text-ink">
                                            {typeof c === 'number' ? c.toFixed(1) : '—'}
                                          </td>
                                          <td className="py-1 text-right tabular-nums text-ink-soft">
                                            {typeof sub === 'number' ? Math.round(sub) : '—'}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                                <p className="mt-1.5 text-[0.58rem] leading-relaxed text-ink-faint">
                                  The reported AQI is the highest sub-index, which is how EPA
                                  defines it. The two columns are not the same measurement: each
                                  sub-index is computed over that pollutant&rsquo;s official
                                  averaging window — 24 hours for PM, 8 for ozone — while the
                                  concentration is this hour alone. They will not divide neatly,
                                  and are not meant to.
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}

                      {aqValues.source === 'grid' && (
                        <p className="mt-1.5 text-[0.62rem] leading-relaxed text-gold">
                          Interpolated from the {aqGrid?.nx}×{aqGrid?.ny} air quality grid — a
                          regional estimate, not a local reading.
                        </p>
                      )}
                    </div>
                  )
                })()}
            </div>

            <div className="mt-3 border-t border-hairline pt-2.5">
              {point?.status === 'loading' && (
                <p className="hud-label text-cirrus">Querying model…</p>
              )}
              {inspectValues?.source === 'point' && (
                <p className="text-[0.62rem] leading-relaxed text-ink-faint">
                  Direct model query at{' '}
                  <span className="hud-value text-ink-soft">
                    {fmtLat(inspectValues.modelLat)} {fmtLon(inspectValues.modelLon)}
                  </span>
                  {inspectValues.elevation != null && <> · {Math.round(inspectValues.elevation)} m</>}
                  . Open-Meteo snaps to its own model grid, so this is the nearest model cell —
                  not the exact pixel you clicked.
                </p>
              )}
              {inspectValues?.source === 'grid' && (
                <p className="text-[0.62rem] leading-relaxed text-gold">
                  Point query unavailable — falling back to the {grid?.nx}×{grid?.ny} field grid.
                  At this zoom those samples are far apart, so treat this as a regional average
                  rather than a local reading.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- status bar + time scrubber ---
          Always rendered. Gating this on having data meant that when a fetch
          failed the whole bar vanished along with it, leaving a blank map and
          no explanation — which is worse than showing stale data. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="glass absolute inset-x-4 bottom-4 z-20 rounded-xl px-4 py-3 lg:left-[19.5rem] lg:right-24"
      >
        {hasData ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="min-w-[8.5rem]">
              <p className="hud-label">Forecast time</p>
              <p className="hud-value mt-0.5 text-sm text-ink">
                {currentTime
                  ? new Date(currentTime * 1000).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
                  : '—'}
              </p>
            </div>

            <input
              type="range"
              min="0"
              max={times.length - 1}
              step="1"
              value={tIndex}
              onChange={(e) => setTIndex(Number(e.target.value))}
              aria-label="Forecast hour"
              className="h-1 min-w-[8rem] flex-1 cursor-pointer appearance-none rounded-full bg-white/12 accent-[var(--cirrus)]"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTIndex(nowIndex(times))}
                className="rounded-full border border-hairline px-3 py-1 text-[0.68rem] text-ink-soft hover:text-ink"
              >
                Now
              </button>
              <span className="hud-value text-[0.62rem] text-ink-faint">
                +{tIndex - nowIndex(times)}h
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
            <div>
              <p className="hud-label">Forecast data</p>
              <p className="mt-0.5 max-w-xl text-sm leading-relaxed text-ink-soft">
                {status === 'loading'
                  ? 'Fetching the global grid…'
                  : status === 'throttled'
                    ? limitScope === 'minute'
                      ? 'Open-Meteo’s per-minute limit (600 calls) was reached and nothing is cached yet. One grid refresh is a single burst of several hundred calls, so a couple of quick reloads will do it. Retrying automatically in under a minute — satellite imagery and the reference pages are unaffected.'
                      : limitScope === 'hour'
                        ? 'Open-Meteo’s hourly limit (5,000 calls) was reached and nothing is cached yet. It resets on the hour. Satellite imagery and the reference pages are unaffected.'
                        : limitScope === 'day'
                          ? 'Open-Meteo’s daily limit (10,000 calls) was reached and nothing is cached yet. It resets tomorrow. Satellite imagery and the reference pages still work.'
                          : 'Open-Meteo rate limit reached, and nothing cached yet. Satellite imagery and the reference pages are unaffected.'
                    : status === 'error'
                      ? 'Could not reach Open-Meteo. The satellite layers still work.'
                      : 'No forecast data loaded.'}
              </p>
            </div>
            <button
              onClick={() => loadGrid({ force: true })}
              disabled={status === 'loading'}
              className="shrink-0 rounded-full bg-cirrus px-4 py-1.5 text-xs font-medium text-void disabled:opacity-40"
            >
              {status === 'loading' ? 'Loading…' : 'Retry'}
            </button>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-2">
          <span className="hud-label">
            Imagery <span className="text-ink-soft">{gibsDate ?? '—'}</span>
          </span>
          <span className="hud-label">
            Data <span className="text-ink-soft">{freshness ?? '—'}</span>
          </span>
          <span className="hud-label">
            Grid <span className="text-ink-soft">{GRID_NX}×{GRID_NY} global</span>
          </span>
          {status === 'throttled' && hasData && (
            <span className="hud-label text-gold">
              {limitScope === 'minute'
                ? 'Throttled — cached grid, retrying shortly'
                : limitScope === 'day'
                  ? 'Daily limit — cached grid until tomorrow'
                  : 'Rate limited — showing last cached grid'}
            </span>
          )}
          {status === 'error' && hasData && (
            <span className="hud-label text-danger">Stale — last fetch failed</span>
          )}
        </div>
      </motion.div>

      {/* --- mobile sheet --- */}
      <button
        onClick={() => setPanelOpen(true)}
        className="glass absolute right-4 top-4 z-20 rounded-full px-4 py-2 text-xs font-medium text-ink lg:hidden"
      >
        Layers
      </button>

      <AnimatePresence>
        {panelOpen && (
          <motion.div className="absolute inset-0 z-30 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-void/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              className="glass-strong absolute inset-x-0 bottom-0 max-h-[82%] space-y-3.5 overflow-y-auto rounded-t-2xl p-5"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between">
                <p className="display text-base text-ink">Atmosphere</p>
                <div className="flex items-center gap-3">
                  <StatusDot status={status === 'throttled' ? 'cached' : status} label={statusLabel} />
                  <button
                    onClick={() => setPanelOpen(false)}
                    aria-label="Close layers panel"
                    className="rounded-full border border-hairline p-1.5 text-ink-soft"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
              {controls}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="sr-only" role="note">
        Interactive map. Focus the map and use arrow keys to pan, plus and minus to zoom. Click
        anywhere to inspect conditions at that point.
      </p>
    </div>
  )
}
