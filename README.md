# Skybound

An interactive atmosphere reference. Ten cloud genera, the physics that builds them, and a
live global explorer built on real NASA satellite imagery, current forecast-model fields for
wind, cloud, temperature and precipitation, and CAMS air quality.

The distinction between *observed* and *modelled* is kept explicit throughout, because it
changes how much a number is worth: the GIBS layers are genuine satellite retrievals, while the
Open-Meteo and CAMS fields are model output. Calling either one "observations" would overstate
it.

Dark cinematic UI, glass instrument panels, and a canvas particle wind field over a MapLibre
map — with the science held to the WMO International Cloud Atlas.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

Static output in `dist/`. HashRouter plus relative asset paths, so it runs from any static
host — or straight off the filesystem — with no server configuration.

**No API keys, no `.env`, no backend.** Every live data source is keyless and CORS-enabled,
verified by direct request (see below), so the whole thing runs client-side.

---

## Pages

| Route | What it is |
|---|---|
| `/` | Cinematic entry. Backdrop is a live NASA GIBS full-globe true-colour mosaic. |
| `/explorer` | **Global Atmosphere Explorer** — the centrepiece. Map, satellite layers, live wind field. |
| `/clouds` | Classification reference, filterable by étage and composition, plus the full WMO taxonomy. |
| `/clouds/:id` | Per-genus detail: photographs, WMO definition, formation, altitude, lookalike comparison. |
| `/formation` | Six-step formation walkthrough with an interactive diagram. |
| `/phenomena` | 10 rare clouds + 7 optical phenomena, each with a real photograph. |
| `/sources` | Every reference, every photo credit, every place the sources disagree. |
| `/style-guide` | Component showcase. Unlinked from the nav; kept as a working reference. |

---

## Live data

All three services were verified by direct request during research, and again from the
browser at the page origin. Details and exact URL shapes in `RESEARCH.md` §9.

**NASA GIBS** — satellite imagery. No key, `Access-Control-Allow-Origin: *`.
- `VIIRS_SNPP_CorrectedReflectance_TrueColor` — true colour
- `MODIS_Terra_CorrectedReflectance_TrueColor` — Terra, morning overpass
- `MODIS_Terra_Cloud_Fraction_Day` — retrieved cloud fraction, the measurement layer

Two things that bite: the tile path is `{z}/{y}/{x}` (row before column, WMTS order — not the
usual XYZ), and imagery for the current day is usually unpublished, so the client walks
backwards through recent dates until one resolves and then **states which date it is showing**.

**Open-Meteo Forecast** — wind, cloud cover, temperature, precipitation. No key,
`Access-Control-Allow-Origin: *`. Multi-point requests return a JSON array, one entry per
coordinate — verified to 240 points in a single call. The Explorer requests a **fixed global
15×9 grid**, not a viewport grid; see the rate-limit note below for why that distinction
matters. Model forecast data, not observations.

**Open-Meteo Air Quality** — US EPA AQI plus the six criteria pollutants. A **different host**
(`air-quality-api.open-meteo.com`) and a different model family: CAMS, not ICON/GFS. CAMS
Europe resolves at 0.1° (~11 km) hourly and republishes every 24 h; CAMS global at 0.4°
(~45 km) 3-hourly, republished every 12 h. Also model output, not station measurement — the
layer and the inspect card both say so.

The API returns `us_aqi` and the per-pollutant `us_aqi_*` sub-indices already converted from
concentration, which is the reason to use them: **no AQI breakpoint is computed in this
codebase, so none can be invented.** The only local decisions are which published category an
index falls in and what colour that category is, both checked against source by `npm run audit`.

**CARTO Dark Matter** — MapLibre basemap style. No key.

### Failure handling

Each source reports its own state through a `StatusDot`: live, loading, cached, or
unavailable. Grid responses are cached to `localStorage` — the weather grid and the air quality
grid under **separate keys**, since they refresh on different cadences and one going stale should
not invalidate the other — and served if a later fetch fails, so the fields degrade to slightly
stale rather than disappearing.

The two point queries behind the inspect card are issued **independently rather than awaited
together**, so a slow or failing air quality endpoint cannot delay or take down the weather
readout beside it.

> One trap worth knowing: **Open-Meteo answers malformed coordinates with HTTP 503**, not a
> 4xx. That makes a client bug look identical to an outage. Coordinates are clamped before
> every request specifically to keep those cases apart.

---

## The Explorer's layers

| Layer | Source | Notes |
|---|---|---|
| Satellite imagery | NASA GIBS | True colour (VIIRS / MODIS Terra) or retrieved cloud fraction. Opacity slider. |
| **Cloud cover heatmap** | Open-Meteo | Smooth intensity gradient, transparent → haze → dense blue-white. |
| Precipitation | Open-Meteo | mm/h, cyan → blue → violet. |
| Temperature | Open-Meteo | −30 → 45 °C, cool blue → red. |
| **Air quality** | Open-Meteo AQ | US EPA AQI, stepped into the six official category colours. Off by default; fetched on first activation. |
| Wind field | Open-Meteo | Animated particle flow, coloured by speed. |
| Night shading | Computed | Solar terminator polygon, refreshed every few minutes. |
| Globe view | MapLibre | Toggles the 3D globe projection. |

Plus a **48-hour time scrubber**, a **click-to-inspect** card, and per-layer opacity.

### The air quality layer is stepped, not blended

Every other heatmap is a smooth gradient because its variable is continuous. AQI is not — it is
a categorical health scale, so blending between bands would paint a colour that signals a
category the index is not in. `rampColor('aqi', v)` therefore returns the **exact published
band colour** and never interpolates.

Verified in the browser rather than assumed: sweeping the live layer's composited canvas found
**0 pixels sitting between two bands**. Colours do drift by up to ~5/255 per channel at full
opacity, and more as alpha falls, because canvas stores premultiplied alpha and `getImageData`
divides it back out — but that drift is same-hue rounding, never a category change. MapLibre's
linear raster resampling also softens band edges by a pixel or two, which is a contour being
anti-aliased, not a category being misreported.

The inspect card additionally shows the **dominant pollutant**, which is the highest sub-index —
that is EPA's own definition of the reported AQI, not a heuristic.

One thing that genuinely surprises people, and which the card now states outright: **the
concentration column and the sub-index column are not the same measurement.** EPA defines each
sub-index over that pollutant's official averaging window — 24 hours for PM, 8 for ozone —
while the μg/m³ figure is that single hour. Delhi made it obvious: 67.5 μg/m³ of PM2.5 with a
sub-index of 150, where mapping the instantaneous value through the published breakpoints gives
159 and mapping the 24-hour mean (56.9) gives 152. `npm run verify:live` measures which of those
the API is tracking, so if the provider ever switches, the explanation in the UI stops being
true loudly instead of quietly.

### Two decisions worth knowing

**The heatmaps are a MapLibre canvas source, not a DOM overlay.** The grid is sampled into a
192×128 offscreen canvas which MapLibre stretches over the grid's geographic bounds. That puts
the data *beneath* the basemap's labels and coastlines — so geography stays crisp instead of
being fogged over — and lets MapLibre reproject it, which is why it stays correct in globe view.
An overlay blit would only be valid on a flat, north-up map.

**Interpolation is smoothstep-weighted, not plain bilinear.** Bilinear is only C0-continuous:
the value is continuous across grid nodes but the gradient is not, and on a coarse grid the eye
reads that as hard vertical creases. Easing the weights (`t²(3−2t)`) zeroes the derivative at
each node and the banding disappears. Values at the nodes are unchanged, so this smooths the
reconstruction without altering measured data.

### Data limitations, stated plainly

- **The field grid is global and fixed** — 25×15 = 375 points over the whole planet. Spacing is
  **15° in longitude**, uniform; in latitude it runs from **3.1° near the poles to 23.5° at the
  equator**, because rows are spaced evenly in Mercator Y to match how the heatmap is blitted.
  Worth saying plainly: the grid is coarsest exactly where most people look.
  It resolves continental-scale structure, not individual cloud systems, and the panel says so.
  For local accuracy, click any point (direct model query) or use the GIBS cloud-fraction layer,
  which is a genuine satellite retrieval at real sensor resolution.

  The air quality grid is coarser — 17×11, so 22.5° in longitude and 4.8–32° in latitude — to keep
  both grids inside one minute's allowance. CAMS resolves at 0.4° globally and 0.1° over Europe, so
  there is far more detail in the source than either grid shows.

  The **reconstruction buffer** was raised from 192×128 to **480×320** when the grid got denser.
  That is not data, it is the canvas the samplers write into: at 192 px, MapLibre was magnifying it
  nearly 7× across a desktop viewport and the gradients turned to mush. 480 px over 360° is ~1.3 px
  per degree, comfortably finer than the 15° sample spacing, so what limits the picture is the grid
  rather than the buffer.

  It used to be fetched per viewport, which was wrong twice over: zooming out left everything
  outside the last-fetched box **blank**, and every pan was a weighted API call — which is what
  exhausted the quota, which then blocked the refetch that would have filled the hole. A global
  grid removes both failure modes at once.
- **Rate limits set the grid size, and the binding limit is per-MINUTE.** Open-Meteo's free tier
  enforces three separate ceilings — **600/minute**, 5,000/hour, 10,000/day — and bills a
  multi-location request **per location**, so a 375-point grid costs 375 calls, not one.

  The per-minute ceiling is the one that actually bites, and the easy one to miss. A grid can sit
  comfortably inside the daily budget and still fail outright, because **one refresh is a single
  burst**. A 31×19 grid (589 points) needs only 2,356 calls/day — 24% of the daily cap — and
  still dies on arrival:

  ```
  {"error":true,"reason":"Minutely API request limit exceeded. Please try again in one minute."}
  ```

  Learned by doing it. So the grid is sized to the minute, leaving room for the other caller:

  ```
  weather   375 pts (25×15, 3 requests)
  air qual  187 pts (17×11, 2 requests)
            -----------------------------
            562 calls in the worst-case minute    (limit 600)
  daily     562 × 4 refreshes = 2,248 calls/day   (limit 10,000)
  ```

  Anything denser would have to fill in progressively across minutes, trading a coarse map for a
  half-drawn one. Not worth it.

  **Density beats refresh rate, and it isn't close.** Each fetch returns a full 48-hour hourly
  series and `nowIndex` reads the current hour out of it — so a grid fetched six hours ago still
  holds the right value for right now. Refreshing often re-downloads numbers already on disk.
  Resolution is the thing that can't be recovered after the fact. So the refresh budget was spent
  on resolution: **2.8× the sample count at 15° spacing instead of 26°, for under a quarter of the
  daily quota.** For contrast, the original 15×9 on a 20-minute timer cost 9,720 calls/day — 97%
  of the cap for a third of the detail.

  **Panning, zooming and scrubbing time make no network requests at all.**

- **A reload costs nothing.** Refetching on every mount is what made the limit bite in ordinary
  use: a refresh is several hundred billed calls, so a dozen reloads while reading was thousands
  of calls spent re-downloading the same series. Both grids now reuse a cached copy that is still
  inside its refresh window — **measured at 0 API calls on load** — and the freshness indicator
  still reports the cache's true age, so reuse never hides staleness. The cache is also rejected
  if it holds fewer points than the current grid, so a cache written before a resize can't render
  at the wrong density.

- **429 is classified, not lumped together.** The API says which ceiling was hit, and they call
  for completely different patience: a minutely limit clears in under a minute and is **retried
  automatically after 65 s**; hourly and daily are not retried on a timer, because hammering a
  service that has already said no for the next hour is how a short block becomes a long one. The
  status line names the actual limit — "Throttled — retrying", "Daily limit reached" — rather than
  a generic "rate limited" that leaves you guessing whether to wait 40 seconds or a day.

- **Requests are chunked and sequential.** Coordinates run ~16 characters each, so a 375-point
  grid in one URL is past where proxies start rejecting request lines. Chunks of 150 keep each URL
  near 2.5 kB, and they go out one at a time — firing five requests at once at a free public
  service is how you earn a 429. Chunking costs no extra quota, since billing is per location
  either way. Point order carries all the geography (`points[j * nx + i]`), so a short chunk
  **fails loudly** instead of silently rotating part of the map; `npm run audit` verifies the merge
  against a stubbed fetch, including a deliberately misordered response.

  Air quality still refreshes on the same slow 6-hourly timer and is **off by default, fetched
  only on first activation** — most sessions never open it, and an unopened layer shouldn't cost
  187 calls. Toggling it back off doesn't discard the grid.
- **Failure is never silent.** The status bar renders whether or not data arrived. Gating it on
  having data meant a failed fetch removed the explanation along with the fields, leaving a
  blank map and no reason — worse than showing stale data. There is an explicit no-data state
  with a Retry button, and rate limiting is named as such.
- **Longitude wraps.** MapLibre repeats the world horizontally, so at low zoom the visible
  bounds run past ±180°. Samplers wrap into range, otherwise the fields stop dead at the
  antimeridian. Verified: across a visible span of −194.8° to 193.2° there are no null samples.
- **429 is surfaced as its own state** ("Rate limited — showing last cached grid"), not folded
  into a generic error, because throttling and an outage need different messages.
- The inspect card says on its face that values are interpolated from the sample grid and are
  indicative for the region, not a point forecast.

## Data audit

```bash
npm run audit
```

`scripts/audit-data.mjs` checks every data-backed claim that can be verified without a network
call, and exits non-zero on failure so it can gate a commit.

| Area | What it checks |
|---|---|
| Genera | All ten present; base ≤ base-max ≤ top; bases inside their WMO étage band; valid composition |
| Étage | Nimbostratus exempted explicitly, since WMO files it middle while its base is lower (RESEARCH.md §8) |
| Taxonomy | WMO counts hold (15 species, 9 varieties, 11 features, 4 accessory); every genus cross-reference resolves |
| Confusion | Each genus's lookalike resolves to a real genus — this silently broke once |
| Physics | DALR = 9.8, ELR ≈ 6.5, SALR < DALR; size scale monotonic; **raindrop/droplet volume ratio actually equals the 10⁶ the copy claims** |
| Climate | SW negative, LW positive, SW + LW = net; global cover inside the satellite-derived range |
| Photos | Artist and licence recorded (CC BY/BY-SA require it); Commons source page; alt text long enough to teach |
| Live data | Wind vectors correct in all four cardinals; Mercator round-trip exact; sampler exact at nodes and midpoint; ramps monotonic and covering their domain |
| **AQI** | Bands checked against an **independent copy** of the published EPA table — labels, hex, boundary values, `rampColor` exactness, clean 0–500 tiling, alpha rising with severity, dominant-pollutant = highest sub-index, missing data transparent |
| **Chunking** | A 375-point grid split across requests must merge in exact order, against a stubbed fetch: every cell holds its own coordinates' data, no request exceeds 150 coordinates, and a short chunk is rejected rather than silently shifting every later point |
| Research | Key figures still present in RESEARCH.md, so content and research cannot silently diverge |

**What it deliberately does not do** is re-verify the science against original sources. That was
the research pass, and it is recorded in RESEARCH.md with citations. The audit catches the
failure mode that actually occurs in practice: content drifting out of sync with itself, or with
the research, after edits.

## Live-data verification

```bash
npm run verify:live
```

The audit above is offline. This is the other half: it hits the real APIs and checks that what
the Explorer **displays** matches what they **returned** — closing the nine accuracy traps by
measurement rather than by assertion. It imports the shipping functions from
`src/data/liveData.js`, not a reimplementation, so a regression in the real code path fails the
script.

Five reference sites, chosen to make sign and hemisphere errors visible rather than letting mild
mid-latitude numbers hide them: **Tilburg**, **Denver** (1,600 m, negative longitude),
**Delhi** (genuinely poor air, exercises the upper bands), **Sydney** (southern hemisphere),
**Reykjavik** (high latitude). It prints the raw API value beside the rendered string for every
field, then checks:

| Trap | How it is checked |
|---|---|
| Coordinate order | Requested lat/lon vs the model cell returned; an explicit transposition test |
| Units | Read from the API's own `hourly_units` envelope, not assumed — °C, m/s, %, mm, USAQI, μg/m³ |
| Field type | `temperature_2m` present, so it cannot silently become apparent or surface temperature |
| Timestep | The nearest-hour sample must be ≤ 30 min from now; a 60 min+ drift is the off-by-one |
| API alignment | Weather and air-quality time windows compared directly (currently offset 0) |
| Wind convention | All four cardinals, plus a bearing round-trip through the flow vector |
| Heatmap sampling | Node-exact, midpoint-exact, longitude wrap, antimeridian agreement |
| Legend | AQI band table, boundary values, and stepped `rampColor` output |
| Observation check | A **NOAA/NWS station** reading at Denver — genuinely independent of the model |

Two guards deserve naming, because they distinguish a bug from weather: the temperature gap is
only failed above 15 °C, since ~18 °C is the size of a Celsius/Fahrenheit confusion while 5 °C
is ordinary model-vs-station disagreement; and if the observed/model wind ratio lands near 3.6
it warns, because that is what an m/s value mislabelled as km/h looks like.

**Result at time of writing: pass.** Denver read 23.7 °C against 29.0 °C observed at KBJC — a
5.3 °C gap that is an inherent data-source limitation, not a code fault: the station is not the
model cell, Denver sits at 1,600 m under a coarse grid, and the observation was 75 minutes
earlier. Every unit, coordinate, band and convention check passed.

## Accuracy of the inspect readout

The click-to-inspect card issues a **direct single-location query** to Open-Meteo rather than
reading the field grid.

This was a real bug. Inspect originally interpolated the viewport grid, which at global zoom is
~20° between samples — so clicking a city returned a value blended from points hundreds of
kilometres away. Tilburg read 20.5 °C against an actual 33 °C, because the interpolation mixed
warm continental Europe with the cold Atlantic. A single-point query is both exact and one of
the cheapest calls available.

The card states which path produced the number: a direct model query (with the model cell's own
coordinates and elevation, since Open-Meteo snaps to its grid) or, if throttled, the grid
fallback labelled as a regional average. Wind is shown in m/s **and** km/h so it can be checked
against any consumer weather app directly.

## The wind field

`src/components/explorer/WindField.js` — a canvas particle flow field, written from scratch
rather than pulled from a library.

- Particles live in **geographic** space and are projected to screen once per frame, so pan
  and zoom carry the flow with the map instead of smearing it.
- Trails come from fading the canvas with `destination-in`, which decays alpha only. Painting
  a translucent background over it instead would tint every trail as it ages.
- Step size derives from the map's current degrees-per-pixel, so a given wind speed moves the
  same number of pixels per frame at every zoom.
- The grid is coarse (10–20° globally), so samples are **bilinearly interpolated** — treating
  them as truth gives a visible stair-step.
- Particle count scales with canvas area, between 600 and 3400.
- Under `prefers-reduced-motion` it renders a **static arrow grid** carrying the same
  information — direction, speed, colour — rather than switching itself off.

Meteorological wind direction is the direction wind blows *from*, so the flow vector is
negated. Verified: from-north gives v = −10, from-east gives u = −10.

---

## Architecture

```
src/
  data/                content layer — edit here, never in a component
    genera.js              the ten genera
    taxonomy.js            species, varieties, features, accessory, origins
    phenomena.js           rare clouds + optical phenomena
    formation.js           formation steps, lapse rates, stability
    climate.js             radiative effect, front sequence, forecasting tells
    sources.js             references and uncertainty flags
    images.js              photo metadata: source, artist, licence, alt, caption
    liveData.js            GIBS + Open-Meteo clients, AQI bands, sampler, ramps
    photo-manifest.json    generated by the photo script — do not hand-edit
  components/
    explorer/WindField.js     particle flow field
    explorer/FieldRenderer.js scalar heatmaps as a MapLibre canvas source
    explorer/terminator.js    solar terminator polygon
    Photo.jsx              responsive images, LQIP, labelled placeholders
    ui.jsx                 design-system primitives
  pages/
  theme/                 reduced-motion hook

scripts/
  audit-data.mjs         offline content + AQI band gate     (npm run audit)
  verify-live.mjs         live API accuracy check       (npm run verify:live)
  fetch-photos.mjs        one-off photo vendoring           (npm run photos)
```

Design tokens live in `src/index.css` under `@theme`. Two densities coexist deliberately:
**editorial** for reference pages, **HUD** (mono, tabular numerals, tight) for the Explorer.

MapLibre is ~950 kB, so `/explorer` is **code-split** via `React.lazy`. Reference pages ship
175 kB gzipped; the map engine loads only when someone opens it.

---

## Photographs

36 photographs from Wikimedia Commons, all CC0 / CC BY / CC BY-SA / public domain.
Photographer, licence and source page are recorded in `src/data/images.js`, shown beside every
image, and tabulated on `/sources`.

They are **vendored, not hotlinked** — Wikimedia rate-limits third-party embedding hard (30 of
36 HEAD requests returned 429 during sourcing).

```bash
npm run photos
```

Downloads once with backoff and polite pacing, resizes to 640/1280/1920, encodes WebP with a
JPEG fallback, and writes a manifest with real dimensions and a 24px inline placeholder.
`npm run photos -- --force` re-fetches.

Where a subject has no manifest entry, `Photo` renders a **labelled placeholder** rather than
substituting an image of something else. For study material a wrong photo is worse than none.

---

## Research provenance

`RESEARCH.md` was written before any code, from primary sources: the WMO International Cloud
Atlas, NOAA (JetStream, NWS, GFDL), NASA (Earth Observatory, CERES), Stull's *Practical
Meteorology*, and ACP / *Nature Communications* papers. Nothing was written from memory.

Where sources genuinely conflict, the site shows the conflict. Seven such flags are collected
on `/sources` and in `RESEARCH.md` §8 — including NOAA contradicting itself on the high/middle
étage boundary (15,000 vs 20,000 ft), the Nimbostratus filing split between WMO and US
practice, and asperitas, whose formation mechanism is genuinely unresolved.

---

## Accessibility

- All foreground tokens clear WCAG AA against every background; lowest measured **6.03:1**,
  most above AAA. Verified in-browser, not eyeballed.
- `prefers-reduced-motion` honoured in CSS, in the reveal components, in route transitions,
  and in the wind field (static arrows instead of particles).
- Alt text describes **visible field marks**, not just the cloud's name.
- Keyboard navigable throughout; the map supports arrow-key pan and +/− zoom once focused,
  with a screen-reader note saying so.
- Charts carry text equivalents; the altitude chart repeats as a linked list.

---

## If the Explorer sits on "Initialising atmosphere"

**Open it in a real, foreground browser tab.**

MapLibre renders on a `requestAnimationFrame` loop and only emits `load` after its first
rendered frame. Browsers pause rAF in hidden, backgrounded or non-compositing tabs — including
embedded preview panes. No frames means no first render, which means no `load`, and the map
waits forever without reporting anything.

Measured in the build environment: `visibilityState: "hidden"`, **0 animation frames in 3
seconds**. MapLibre constructs fine, the style fetches fine, WebGL2 is available — the render
loop simply never ticks.

The page now detects this. After 10 seconds it replaces the spinner with a specific diagnosis
(hidden tab / no animation frames / WebGL unavailable / generic), a retry, and a link onward,
and it recovers automatically when the tab becomes visible.

## Known limitations

- **The map is confirmed to render; its *appearance* is not signed off.** The rAF pause above
  blocks screenshots, so it was worked around instead: shimming
  `requestAnimationFrame` onto `setTimeout` — which hidden tabs do not throttle — lets
  MapLibre's render loop tick in a background tab. With that in place the map reports
  `loaded: true`, `isStyleLoaded: true`, `areTilesLoaded: true`, 95 CARTO layers plus the
  `heat-lyr` and `night-lyr` sources, a live WebGL2 context, and `readPixels` over the drawing
  buffer returns **17,290 samples, 100% non-black, 118 distinct colours** — a genuinely drawn
  map, not a blank canvas. The air quality layer was verified the same way, by reading the
  composited offscreen canvas and confirming official band colours with zero cross-band pixels.

  What that does *not* establish is whether it looks good: `readPixels` reads the map canvas,
  not the glass-panel HTML around it. Tile alignment and particle aesthetics still want a human
  eye. **Worth a look at `/explorer` in a foreground browser.**

  One byproduct worth knowing: under the shim the loading overlay stays at `opacity: 1` over a
  working map, because Framer Motion binds `requestAnimationFrame` at *import* time and so keeps
  using the paused original. That is an artifact of the instrumentation, not a product bug — in a
  visible tab the exit animation runs and the overlay clears.
- No Three.js hero shader. The brief listed it as an optional stretch; a shader canvas running
  site-wide would compete for GPU with the map and particle field, which is where the frame
  budget actually matters. The atmospheric background is CSS-only and composites on the GPU.
- Single dark theme, per the brief's visual direction. There is no light mode.
- The Explorer's wind grid is the same fixed global 15×9 as the other fields — enough for a
  convincing planetary flow, not a substitute for a real reanalysis product.
- **No jet stream ribbon.** The brief lists it as a stretch layer. Open-Meteo does expose
  pressure-level winds (`wind_speed_250hPa` and similar), so it is reachable — but every extra
  variable is billed per location per variable, and the honest ordering was to spend the
  remaining call budget on air quality, which was a required layer, rather than a stretch one.
- **Air quality is modelled, not measured.** CAMS is a forecast system; the layer is not station
  data, and at 30° longitude spacing it cannot describe a city. The layer note and the inspect
  card both say so, and the direct point query is offered as the accurate path. Anyone making a
  decision about the air they are actually breathing should read a local monitor, not this.
