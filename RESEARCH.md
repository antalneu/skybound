# Skybound — Research Summary

Factual backbone for the site. Everything below was verified against the sources listed in
§7 during the research pass. Written in my own words; no source text is reproduced.
Items marked **⚠ FLAG** are places where sources genuinely disagree or where the science is
unsettled — these are surfaced in the UI rather than smoothed over.

---

## 1. The classification system (WMO International Cloud Atlas)

The WMO taxonomy is hierarchical and borrowed deliberately from Linnaean biology: a cloud is
named by **genus**, then optionally narrowed by **species** (shape and internal structure),
**variety** (transparency and arrangement), and annotated with **supplementary features** and
**accessory clouds**. Roughly 100 combinations occur in practice.

### 1.1 The ten genera

| Genus | Abbr. | Étage | One-line character |
|---|---|---|---|
| Cirrus | Ci | High | Detached white filaments, fibrous or silky; pure ice |
| Cirrocumulus | Cc | High | Thin sheet of very small grains/ripples, no shading |
| Cirrostratus | Cs | High | Transparent whitish veil; the halo-maker |
| Altocumulus | Ac | Middle | Patches/rolls of rounded masses, often shaded |
| Altostratus | As | Middle | Greyish striated sheet; sun visible "as through ground glass" |
| Nimbostratus | Ns | Middle* | Thick dark grey layer, continuous precipitation, sun blotted out |
| Stratocumulus | Sc | Low | Grey/whitish patches with dark tessellation |
| Stratus | St | Low | Featureless grey layer; drizzle, ice prisms, snow grains |
| Cumulus | Cu | Low* | Detached, sharp-outlined, cauliflower tops, flat bases |
| Cumulonimbus | Cb | Low* | Heavy dense tower, anvil top; the only genus that makes lightning |

\* See §2.2 — the étage is assigned by **cloud base**, not by vertical extent.

The WMO's 2017 edition (the first full revision since 1987) added no new genera. Its additions
were one species (*volutus*), five supplementary features (*asperitas*, *cavum*, *cauda*,
*fluctus*, *murus*), one accessory cloud (*flumen*), and the special-cloud suffixes.

### 1.2 Species (15) — shape and internal structure

`fibratus` (fib) · `uncinus` (unc) · `spissatus` (spi) · `castellanus` (cas) · `floccus` (flo)
· `stratiformis` (str) · `nebulosus` (neb) · `lenticularis` (len) · `volutus` (vol)
· `fractus` (fra) · `humilis` (hum) · `mediocris` (med) · `congestus` (con) · `calvus` (cal)
· `capillatus` (cap)

A cloud gets **at most one** species — species are mutually exclusive.

### 1.3 Varieties (9) — transparency and arrangement

*Arrangement:* `intortus` · `vertebratus` · `undulatus` · `radiatus` · `lacunosus` · `duplicatus`
*Opacity:*     `translucidus` · `perlucidus` · `opacus`

A cloud may carry **several** varieties at once (e.g. *Altocumulus stratiformis translucidus
undulatus*), but the three opacity varieties are mutually exclusive with each other.

### 1.4 Supplementary features (11)

`incus` · `mamma` · `virga` · `praecipitatio` · `arcus` · `asperitas` · `cavum` · `fluctus`
· `murus` · `cauda` · `tuba`

### 1.5 Accessory clouds (4)

`pileus` · `velum` · `pannus` · `flumen`

### 1.6 Special clouds (origin suffixes)

- `homogenitus` — of human origin (contrails, cooling-tower plumes)
- `homomutatus` — human-origin cloud since reshaped by winds into a natural-looking form
- `flammagenitus` — from fire heat (pyrocumulus)
- `cataractagenitus` — from waterfall spray
- `silvagenitus` — from forest evapotranspiration

### 1.7 Genus → species/variety matrix (as implemented in the content layer)

| Genus | Species | Varieties | Supp. features | Accessory |
|---|---|---|---|---|
| Ci | fibratus, uncinus, spissatus, castellanus, floccus | intortus, radiatus, vertebratus, duplicatus | mamma, fluctus | — |
| Cc | stratiformis, lenticularis, castellanus, floccus | undulatus, lacunosus | virga, mamma, cavum | — |
| Cs | fibratus, nebulosus | duplicatus, undulatus | — | — |
| Ac | stratiformis, lenticularis, castellanus, floccus, volutus | translucidus, perlucidus, opacus, duplicatus, undulatus, radiatus, lacunosus | virga, mamma, cavum, fluctus, asperitas | — |
| As | *(none — always nebulous)* | translucidus, opacus, duplicatus, undulatus, radiatus | virga, praecipitatio, mamma | pannus |
| Ns | *(none)* | *(none)* | praecipitatio, virga | pannus |
| Sc | stratiformis, lenticularis, castellanus, floccus, volutus | translucidus, perlucidus, opacus, duplicatus, undulatus, radiatus, lacunosus | virga, praecipitatio, mamma, fluctus, asperitas, cavum | — |
| St | nebulosus, fractus | opacus, translucidus, undulatus | praecipitatio, fluctus | — |
| Cu | humilis, mediocris, congestus, fractus | radiatus | virga, praecipitatio, arcus, tuba, fluctus | pileus, velum, pannus |
| Cb | calvus, capillatus | *(none)* | incus, mamma, virga, praecipitatio, arcus, murus, cauda, tuba | pileus, velum, pannus, flumen |

> **⚠ FLAG — sourcing note.** The WMO Atlas presents this matrix as an image-heavy table that
> resists automated extraction; one extraction attempt during research returned a badly
> misaligned mapping (e.g. *uncinus* → Cirrocumulus, *lenticularis* → Stratus), which is wrong.
> The table above was rebuilt from the per-genus Atlas pages cross-checked against the
> Wikipedia *List of cloud types* WMO matrix. It is accurate for the common cases, but the
> Atlas admits rare combinations beyond it. The site presents these as "commonly observed
> with", not as an exhaustive closed set.

---

## 2. Altitude classification

### 2.1 The three étages (WMO, by latitude)

Heights are of the **cloud base**, above ground level.

| Étage | Polar | Temperate | Tropical |
|---|---|---|---|
| High | 3–8 km (10,000–25,000 ft) | 5–13 km (16,500–40,000 ft) | 6–18 km (20,000–60,000 ft) |
| Middle | 2–4 km (6,500–13,000 ft) | 2–7 km (6,500–23,000 ft) | 2–8 km (6,500–25,000 ft) |
| Low | 0–2 km (0–6,500 ft) | 0–2 km (0–6,500 ft) | 0–2 km (0–6,500 ft) |

The étages overlap and shift with season and air mass; they are a convention, not a physical
boundary. The tropopause is higher in the tropics (~16–18 km) than at the poles (~8 km), which
is the underlying reason the high étage scales with latitude.

### 2.2 Vertical extent vs. base height

Three genera are routinely misfiled because their base and their top sit in different étages:

- **Nimbostratus** — WMO assigns it to the **middle** étage, but it habitually extends through
  all three. Many US-facing references list it as a low cloud because its base is often low.
- **Cumulus** and **Cumulonimbus** — bases in the **low** étage, tops that can reach the high
  étage (Cb tops routinely 12 km, occasionally punching through the tropopause). WMO calls these
  "clouds with vertical extent." The US NWS convention presents them as a fourth category,
  **"clouds with vertical development."**

The site uses the WMO étage as canonical and shows vertical extent as a separate visual axis,
so both conventions are legible.

> **⚠ FLAG — the NOAA numbers do not agree with each other.** NWS office material
> (weather.gov/lmk) puts the high/middle boundary at **20,000 ft**; NOAA's JetStream education
> module puts it at **15,000 ft**; the WMO temperate étage starts at ~16,500 ft. All three are
> in current publication. The site quotes the WMO latitude-dependent table as primary and notes
> the ~15,000–20,000 ft range as the common US shorthand rather than picking a winner.

---

## 3. Formation physics

### 3.1 The one thing that has to happen

A cloud forms when moist air is cooled to its dew point and water vapour condenses. In almost
all cases that cooling comes from **lifting**, not from heat loss.

**Lifting mechanisms:**
1. **Convective / thermal** — surface heating creates buoyant plumes → Cu, Cb.
2. **Orographic** — flow forced over terrain → lenticular waves, cap clouds, upslope stratus.
3. **Frontal** — a warm front's shallow slope (~1:200) lifts air gently over hundreds of km →
   layered Ci→Cs→As→Ns sequence. A cold front's steep nose (~1:50) lifts it violently → Cb.
4. **Convergence** — air converging horizontally must go up: the ITCZ, sea-breeze fronts,
   low-pressure centres.

**Non-lifting routes** (cooling in place): radiative cooling of the surface overnight →
radiation fog; warm moist air advected over a cold surface → advection fog; mixing of two
near-saturated air masses of different temperature → steam fog, and your visible breath.

### 3.2 Adiabatic cooling and lapse rates

Rising air expands against falling ambient pressure. Expansion does work, and with no heat
exchanged with the surroundings ("adiabatic"), that work comes out of the parcel's internal
energy — so it cools.

| Rate | Value | Meaning |
|---|---|---|
| Dry adiabatic (DALR) | **9.8 °C/km** | Unsaturated parcel, fixed by thermodynamics |
| Saturated adiabatic (SALR) | **~4 °C/km** warm/humid near surface → **6–7 °C/km** mid-troposphere | Latent heat release partly offsets expansion cooling |
| Environmental (ELR) | **~6.5 °C/km** global average, highly variable | The actual measured profile — a state of the atmosphere, not a law |

> **⚠ FLAG.** The SALR is not a constant and textbook single values (5.5, 6, 6.5 °C/km) are
> simplifications. It depends on temperature and pressure because warm air holds more vapour and
> therefore releases more latent heat per km. The site gives the range, not one number.

### 3.3 Stability

Comparing ELR to the adiabats determines whether lifted air keeps rising on its own:

- ELR < SALR → **absolutely stable**. Lifted air is colder than its surroundings, sinks back.
  Produces layered (stratiform) cloud.
- ELR > DALR → **absolutely unstable**. Rare and short-lived; usually a shallow superadiabatic
  layer just above hot ground.
- SALR < ELR < DALR → **conditionally unstable**. The common mid-latitude case: stable while
  dry, unstable once saturated. This is why a parcel needs a trigger to reach its LCL, after
  which it can accelerate upward on its own. All deep convection lives here.

### 3.4 The lifting condensation level

The **LCL** is the height at which a lifted parcel first reaches saturation. It is the cloud
base — and it is why fair-weather cumulus across a landscape all have flat bottoms at the same
level: the same air mass reaches saturation at the same height everywhere.

### 3.5 Nucleation

Saturation alone does not make a droplet. Forming one from pure vapour (homogeneous nucleation)
would require several hundred percent supersaturation, because the huge surface curvature of a
tiny embryo drives its equilibrium vapour pressure up (the **Kelvin effect**). The real
atmosphere rarely exceeds ~1% supersaturation.

The way out is **cloud condensation nuclei (CCN)** — hygroscopic aerosol particles, typically
around **0.2 µm**, roughly a hundredth the diameter of the droplet they seed. Sources: sea
salt, sulfates, mineral dust, smoke, pollen, volcanic ash. Dissolved solute lowers the
equilibrium vapour pressure (the **Raoult effect**), and **Köhler theory** is the competition
between the two effects; above a critical radius the droplet activates and grows freely.

**Ice nucleation** is separate. Liquid water in clouds persists supercooled down to about
**−38 °C**, below which it freezes homogeneously. Between 0 and −38 °C, freezing requires
**ice-nucleating particles** — mineral dust, and some remarkably effective biological particles.
This is why mixed-phase clouds exist at all.

### 3.6 From droplet to raindrop

| Particle | Typical diameter |
|---|---|
| CCN | 0.2 µm |
| Cloud droplet | 20 µm |
| Drizzle | 200 µm |
| Raindrop | 2 mm (2,000 µm) |

A raindrop is ~100× the diameter of a cloud droplet, so ~10⁶ times the volume: it takes roughly
**a million cloud droplets to make one raindrop**.

Condensation cannot do this. Diffusional growth rate scales as 1/r, so it slows sharply as the
droplet grows and effectively stalls around 10–20 µm. Two mechanisms bridge the gap:

**(a) Collision–coalescence ("warm rain").** Larger drops fall faster than smaller ones and
sweep them up. Dominant in warm clouds with no ice — tropical maritime cumulus. Needs a broad
initial size spread; giant sea-salt CCN help start it.

**(b) Wegener–Bergeron–Findeisen.** In a mixed-phase cloud where ice crystals and supercooled
droplets coexist, saturation vapour pressure over ice is **lower** than over supercooled liquid.
The air is then simultaneously supersaturated with respect to ice and subsaturated with respect
to liquid, so ice crystals grow by vapour deposition while droplets evaporate to feed them.
Once large, crystals grow further by **aggregation** (crystals colliding and sticking) and
**riming** (accreting supercooled droplets to form graupel). Most mid-latitude rain begins as
snow and melts on the way down.

---

## 4. Special and rare clouds

| Cloud | Where | Mechanism |
|---|---|---|
| **Noctilucent** (polar mesospheric) | **76–85 km**, mesopause | Water ice on meteoric-dust nuclei; needs **< about −120 °C**, the coldest place in the atmosphere. Polar summer only. Seen at ~50–70° latitude in deep twilight, lit by a sun already below the observer's horizon. |
| **Nacreous** (polar stratospheric) | **15–30 km**, polar winter | Forms below about **−85 °C**. Uniform ~10 µm particles diffract light into intense mother-of-pearl iridescence. PSCs also provide surfaces for the heterogeneous chlorine chemistry that drives polar ozone loss. |
| **Mammatus** (feature *mamma*) | Underside of Cb anvil, also Ac/As/Sc/Ci | Cloudy, hydrometeor-laden air **sinking** into clear air below the base. Evaporation and sublimation cool the sinking parcels, making them negatively buoyant — pouches, driven downward, the inverse of normal convection. |
| **Lenticularis** | Ac/Cc/Sc in mountain lee | Standing mountain-wave crests in stable, moist flow. Air condenses climbing into the crest and evaporates descending into the trough — so the **cloud stays put while air streams through it**. |
| **Kelvin–Helmholtz** (feature *fluctus*) | Any sheared interface | Shear instability where wind speed changes sharply with height. Billows roll up into breaking-wave curls. Lifetime of minutes. |
| **Asperitas** | Ac/Sc undersides | Chaotic, well-defined wave structure on a cloud base, like a rough sea seen from underneath. Recognised in the 2017 Atlas — the first new supplementary feature in decades, and the first proposed by an amateur observing network. **⚠ FLAG: the mechanism is genuinely not settled.** Candidate explanations involve mid-level gravity waves and mesoscale convective system outflow. The site says so plainly rather than inventing a tidy cause. |
| **Arcus — shelf cloud** | Leading edge of a storm's outflow | **Attached** to the parent Cb base. Warm moist inflow is lifted over the advancing cold density current of the downdraft. |
| **Arcus — roll cloud** (species *volutus*) | Gust fronts, sea breezes | **Detached**, horizontal tube rotating about its long axis, propagating as a **soliton** independent of the parent storm. Formalised as species *volutus* in 2017. |
| **Cavum** (fallstreak hole) | Supercooled Ac/Cc layers | An aircraft crossing a supercooled droplet layer triggers local freezing via expansion cooling over wings and props. The seeded ice crystals then grow by WBF at the droplets' expense and fall out as virga, punching a clean hole. |
| **Contrails** (*homogenitus* → *homomutatus*) | Cruise altitude, upper troposphere | Form when the **Schmidt–Appleman criterion** is met: hot moist exhaust mixing with cold ambient air follows a mixing line that becomes supersaturated with respect to **liquid water**; droplets condense on soot and freeze. They persist and spread only if ambient air is **ice-supersaturated** → *cirrus homogenitus*, becoming *homomutatus* once wind-sheared into natural-looking cirriform sheets. Contrail cirrus is a large and much-studied component of aviation's climate forcing. |
| **Pyrocumulus** (*flammagenitus*) | Over wildfires and eruptions | Fire heat drives the convection; smoke supplies abundant CCN. When it deepens into a **pyrocumulonimbus (pyroCb)** it generates its own lightning and can inject smoke into the **lower stratosphere**, where it persists for months. |

---

## 5. Optical phenomena

The dividing line: **ice crystals refract** (halos, sharp angles, red on the inside);
**water droplets diffract** (coronae, iridescence, red on the outside).

| Phenomenon | Optics |
|---|---|
| **22° halo** | Refraction through the 60° prism angle of randomly oriented hexagonal ice columns. Minimum deviation is 22°, so light piles up at that radius. **Red inside, blue outside.** Classic host: Cirrostratus. |
| **46° halo** | Same crystals, but through the 90° angle between a side face and an end face. Much fainter and rarer. |
| **Sun dogs (parhelia)** | Horizontally oriented **plate** crystals: bright, often coloured patches 22° to the left and right of the sun, at the sun's own altitude. |
| **Circumzenithal arc** | Refraction entering the top face of plate crystals and leaving a side face — an upside-down, unusually pure-coloured arc high near the zenith. |
| **Corona** | **Diffraction** by small, uniformly sized water droplets: a bright aureole ringed with colour, **blue inside, red outside** — the reverse of a halo, which is the quickest way to tell them apart. Smaller droplets give a larger corona. |
| **Iridescence** | Corona optics in patchy cloud with a mix of droplet sizes, so the rings break into irregular pastel bands. Common on thin Ac lenticularis and spectacular on nacreous clouds. |
| **Glory** | Coloured rings centred on the **antisolar point** — your own shadow. Backscattering from droplets involving surface waves and interference. Seen around an aircraft's shadow on a cloud deck, or around your head from a mountain ridge (with the *Brocken spectre*). |
| **Crepuscular rays** | Not a cloud optic as such: sunbeams made visible by scattering off aerosol where cloud blocks the adjacent light. They are parallel; the apparent divergence is perspective. |

---

## 6. Weather and climate

### 6.1 Reading clouds for weather

Cloud sequences are the visible signature of an approaching front.

**Warm front, 24–48 h ahead of the surface front:**
`Ci → Cs (halo appears) → As (sun through ground glass) → Ns (steady precipitation)`
Cloud base lowers steadily; precipitation is light, continuous and widespread.

**Cold front:** `Cu → Cu congestus → Cb`, with a narrow, violent band of convective
precipitation, a gust front and possible arcus, then rapid clearing.

**Same-day thunderstorm indicators:** morning **Altocumulus castellanus** — turret-topped mid-level
cloud — signals mid-level instability and is a classic warning sign of afternoon storms.
**Cumulonimbus capillatus incus** (fibrous top with a spreading anvil) marks a mature storm.

### 6.2 Coverage

About **67% of Earth's surface** carries cloud at any given moment (multi-year satellite
climatology). Over the oceans, **fewer than 10%** of scenes are completely clear; over land,
about 30%.

### 6.3 Radiative effect

Cloud radiative effect (CRE) is the difference between all-sky and clear-sky radiation at the
top of the atmosphere, measured by instruments like NASA's **CERES**.

| Component | Global annual mean |
|---|---|
| Shortwave CRE (albedo, cooling) | **≈ −50 W/m²** |
| Longwave CRE (greenhouse, warming) | **≈ +30 W/m²** |
| **Net CRE** | **≈ −20 W/m²** |

**Clouds cool the present-day climate on net.** But the balance depends almost entirely on
cloud height and thickness:

- **Low, thick, warm** (Sc, St) — reflect strongly, but their tops are nearly as warm as the
  surface, so they emit almost as much IR as the ground they hide. Albedo wins → **net cooling**.
  Marine stratocumulus decks over cool eastern-ocean upwelling zones are the single most
  important cloud regime for planetary albedo.
- **High, thin, cold** (Ci) — let most sunlight through, but radiate to space at very cold
  temperatures, so they emit far less IR than the surface would. Greenhouse wins → **net warming**.
- **Deep convective** (Cb) — very large shortwave and longwave effects that largely **cancel**.

### 6.4 Cloud feedback

> **⚠ FLAG — this is the live research frontier, and the site says so.**

Cloud feedback is the **largest single source of spread** in estimates of climate sensitivity.
Two things that are easy to conflate:

1. The **sign of CRE today** (negative, cooling) does **not** determine the **sign of the
   feedback** under warming. The feedback depends on how cloud amount, height and optical
   thickness *change*, not on what they do now.
2. Clouds also **mask** radiative forcing — by roughly 0.7 W/m², reducing effective sensitivity
   by on the order of 15%.

The current assessed position (IPCC AR6) is that the **net cloud feedback is positive**, with
reduced low-cloud cover over the subtropical oceans as the main contributor, and with
substantial remaining uncertainty. The site presents this as an assessed range with open
questions, not a settled number.

**Aerosol–cloud interactions** are the related large uncertainty in anthropogenic forcing: more
CCN split the same water into more, smaller droplets, making clouds brighter (**Twomey effect**)
and possibly longer-lived (**Albrecht / lifetime effect**).

---

## 7. Sources

**Primary / institutional**
- WMO International Cloud Atlas — genera, species, varieties, supplementary features, accessory
  clouds, special clouds, noctilucent and nacreous cloud entries. `cloudatlas.wmo.int`
- WMO — *A New Edition of the International Cloud Atlas* and *Classifying clouds* (2017 revision:
  *volutus*, *asperitas*, *cavum*, *cauda*, *fluctus*, *murus*, *flumen*). `wmo.int`
- NOAA JetStream — *How Clouds Form*, *NWS Cloud Chart*. `noaa.gov/jetstream`
- NWS Louisville — *Cloud Classification*. `weather.gov/lmk/cloud_classification`
- NOAA/NASA — *Sky Watcher Cloud Chart*. `ncei.noaa.gov`
- NASA Earth Observatory — *Cloudy Earth* (67% global cloud cover). `science.nasa.gov`
- NASA CERES — cloud radiative effect science pages. `ceres.larc.nasa.gov`
- NOAA GFDL — *Cloud Radiative Effect* (SW/LW/net CRE, forcing masking). `gfdl.noaa.gov`
- US DOE — *DOE Explains… Clouds and Aerosols*. `energy.gov`
- UCAR Center for Science Education — aerosol/droplet/raindrop size comparison. `scied.ucar.edu`

**Textbook / review**
- Stull, *Practical Meteorology* — Ch. 22, Atmospheric Optics (halo, corona, glory geometry).
  `eoas.ubc.ca` / Geosciences LibreTexts
- *Atmospheric Processes and Phenomena* (U. Hawaiʻi OER) — Ch. 5 Stability, Ch. 7 Precipitation.
- Royal Meteorological Society — *International Cloud Atlas and new cloud classifications*.
- Atmospheric Chemistry and Physics (Copernicus) — longwave cloud effects on climate sensitivity
  (2025); CCN phase-space depiction (2025).
- *Nature Communications* (2025) — long-lived contrails forming within cirrus.
- DLR — *Contrails, contrail cirrus, and ship tracks* (Schmidt–Appleman treatment).

**Cross-check only** (used to rebuild the genus/species matrix after the WMO table failed
automated extraction, then verified against per-genus Atlas pages)
- Wikipedia — *List of cloud types*, *Cloud species*, *Etage*, *Asperitas*.

---

## 8. Open flags carried into the UI

1. **Étage boundary numbers disagree between NOAA publications** (15,000 vs 20,000 ft) and with
   the WMO latitude table. → Show WMO as primary, note the US shorthand range.
2. **Nimbostratus étage** — WMO middle, many US references low. → Show both conventions.
3. **Cumulus/Cumulonimbus** — WMO "vertical extent" within the low étage vs. NWS's separate
   "vertical development" category. → Show both.
4. **Asperitas mechanism unresolved.** → State it as open.
5. **SALR is not a constant.** → Give the range.
6. **Cloud feedback sign and magnitude are active research.** → Present as assessed range with
   the CRE-vs-feedback distinction made explicit.
7. **Genus/species matrix is "commonly observed with", not exhaustive.**

---

## 9. Live data sources

Investigated and **verified empirically** — every endpoint below was called from this machine
and returned real data, rather than being assumed from documentation.

### 9.1 NASA GIBS — satellite imagery tiles

Global Imagery Browse Services. **No API key.** Returns
`Access-Control-Allow-Origin: *`, so it is usable directly from the browser with no proxy.

REST/XYZ template (Web Mercator, which is what MapLibre wants):

```
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{Layer}/default/{Time}/{TileMatrixSet}/{z}/{y}/{x}.{ext}
```

Note the axis order is `{z}/{y}/{x}` — row before column, **not** the usual XYZ `{z}/{x}/{y}`.

Layers confirmed working (HTTP 200, correct content type):

| Layer | Matrix set | Format | Use |
|---|---|---|---|
| `MODIS_Terra_CorrectedReflectance_TrueColor` | `GoogleMapsCompatible_Level9` | jpg | True-colour daily mosaic |
| `VIIRS_SNPP_CorrectedReflectance_TrueColor` | `GoogleMapsCompatible_Level9` | jpg | Sharper true colour, NRT |
| `MODIS_Terra_Cloud_Fraction_Day` | `GoogleMapsCompatible_Level6` | png | Cloud-fraction heatmap |

`{Time}` is `YYYY-MM-DD` for daily products. Imagery for the current day is often not yet
published, so the client must **fall back to earlier dates** rather than showing empty tiles.

### 9.2 Open-Meteo — wind, cloud cover, temperature

**No API key** for non-commercial use. Returns `Access-Control-Allow-Origin: *` — verified by
sending an explicit `Origin: http://localhost:5173` header. Browser-safe, no proxy needed.

```
https://api.open-meteo.com/v1/forecast
  ?latitude=<csv>&longitude=<csv>
  &current=wind_speed_10m,wind_direction_10m,cloud_cover,temperature_2m
  &wind_speed_unit=ms
```

- **Multi-point works**, and is the key to a wind field: comma-separated coordinate lists
  return a JSON **array**, one object per point, in request order.
- Verified up to **240 points in a single request** (~94 KB, ~3.1 KB URL). Single-point calls
  return a bare object, not an array — the client has to normalise that.
- `wind_direction_10m` is degrees **from which** the wind blows (meteorological convention).
  Converting to a flow vector requires rotating by 180°.

> **⚠ FLAG.** Open-Meteo returns **HTTP 503** rather than a 4xx when coordinates are
> malformed, which makes a client bug look like an outage. Error handling should not assume a
> 503 means the service is down.

#### 9.2.1 Three rate ceilings, and the per-minute one is the trap

The free tier enforces **600 calls/minute, 5,000/hour and 10,000/day**, and bills a
multi-location request once **per location**. So a 375-point grid is 375 calls, not one.

The per-minute ceiling is the one that governs design, and it is easy to miss because it does
not appear in a daily-budget calculation at all. **One grid refresh is a single burst**, so a
grid can sit at 24% of the daily allowance and still fail outright. Measured: a 31×19 grid (589
points) needs 2,356 calls/day, comfortably inside every daily and hourly figure, and returns

```
{"error":true,"reason":"Minutely API request limit exceeded. Please try again in one minute."}
```

Two consequences worth recording:

- **Maximum useful grid size is set by the minute, not the day** — about 600 points total across
  all endpoints, and less if you want headroom for point queries. Anything larger has to fill in
  progressively across minutes.
- **The reason string names the ceiling**, so a client can tell a 40-second wait from a
  come-back-tomorrow. Treating all three the same is a worse failure than the throttle itself.

A further practical note, learned by exhausting the hourly limit during development: refetching
on every page load is what makes these limits bite in ordinary use. Because a response carries a
full 48-hour series, a cached grid stays *correct* for hours — reusing it is not a compromise.

### 9.3 Open-Meteo Air Quality — AQI and pollutants

**A different host from §9.2**, and a different model family. Keyless for non-commercial use.

```
https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude=<csv>&longitude=<csv>
  &hourly=us_aqi,us_aqi_pm2_5,...,pm2_5,pm10,ozone,
          nitrogen_dioxide,sulphur_dioxide,carbon_monoxide
  &forecast_days=2&timeformat=unixtime
```

- **Model forecast, not observation.** Upstream is Copernicus CAMS: the European domain at
  0.1° (~11 km) hourly, republished every 24 h; the global domain at 0.4° (~45 km) 3-hourly,
  republished every 12 h. A `domains` parameter selects, default `auto`.
- Multi-point works the same way as the forecast API — comma-separated lists, JSON array in
  request order.
- Units, read from the response envelope rather than assumed: indices are `USAQI`, all six
  pollutant concentrations are `μg/m³`. (Carbon dioxide, if requested, is `ppm` — a different
  unit in the same response, which is worth not tripping over.)
- Both `us_aqi` and `european_aqi` are available, plus **per-pollutant sub-indices**
  (`us_aqi_pm2_5`, `us_aqi_ozone`, …). Taking the index from the API means no AQI breakpoint has
  to be computed client-side, and therefore none can be invented — which matters, because AQI
  colours are read as health guidance.
- Verified time alignment against the forecast API: with `forecast_days=2` both windows start at
  today 00:00 UTC and run 48 hours, **offset exactly 0**. Convenient, but relied on defensively
  rather than assumed — values are matched by timestamp, so a future change to either service's
  window cannot silently shift every reading by hours.

> **⚠ FLAG — measured, not documented.** The sub-index tracks each pollutant's **official EPA
> averaging window**, not the hourly concentration returned beside it. Measured at Delhi:
> 67.5 μg/m³ of PM2.5 carrying a sub-index of 150, where mapping the instantaneous value through
> the published breakpoints gives 159, and mapping the 24-hour mean (56.9 μg/m³) gives 152.
> Across six consecutive hours the mean error against a 24-hour mean was **3.3 index points**
> versus **19.9** against the instantaneous value. So the two numbers are not a ratio and must
> not be presented as one.

#### 9.3.1 US EPA AQI — categories, breakpoints, colours

Taken from AirNow's AQI Basics for the ranges and health statements, and from the EPA Technical
Assistance Document for the colours. Used verbatim, never approximated.

| AQI | Category | Colour |
|---|---|---|
| 0–50 | Good | `#00E400` green |
| 51–100 | Moderate | `#FFFF00` yellow |
| 101–150 | Unhealthy for Sensitive Groups | `#FF7E00` orange |
| 151–200 | Unhealthy | `#FF0000` red |
| 201–300 | Very Unhealthy | `#8F3F97` purple |
| 301–500 | Hazardous | `#7E0023` maroon |

The reported AQI is the **maximum** of the per-pollutant sub-indices, not an average — which is
also the definition of the "dominant pollutant" shown in the inspect card.

> **⚠ FLAG.** The US EPA and European indices use different breakpoints, averaging windows and
> category counts, so identical concentrations can land in differently-named categories. The
> index must always be labelled with its standard; a bare "AQI" is not meaningful.

### 9.4 Basemap

MapLibre GL JS needs a style, not a key. Both verified 200 with CORS:

- `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` — CARTO Dark Matter,
  the right base for a dark cinematic theme
- `https://demotiles.maplibre.org/style.json` — MapLibre's own demo tiles, fallback

### 9.5 Consequences for the build

- **No server proxy or serverless function is required.** Everything is keyless and
  CORS-enabled client-side. The brief allowed for a proxy; it turned out to be unnecessary.
- The wind field is a coarse grid (order 10–20° spacing globally), so particle animation must
  **bilinearly interpolate** between grid points rather than treat samples as truth.
- All four services are best-effort public goods. The client caches the last successful
  response and shows an explicit status indicator rather than failing silently.
- **Rate limits are an architectural constraint, not a footnote** — and the binding one is
  per-minute (§9.2.1), which caps total grid size at roughly 600 points across both endpoints.
  Two endpoints share every budget, which is why air quality uses a coarser grid and is fetched
  only when the layer is switched on.
- **Density beats refresh rate.** Because a response carries 48 hours and the client reads the
  current hour out of it, a grid fetched hours ago is still right for now — so refresh frequency
  buys almost nothing, while resolution cannot be recovered after the fact. Refresh cadence
  should never exceed what the upstream model publishes anyway: 20-minute polling of an hourly
  model is wasted quota, and 20-minute polling of CAMS (12–24 h) is meaningless. Spending the
  saved calls on sample points instead was the single biggest visual improvement to the Explorer.
- **Observed and modelled must stay distinguishable in the UI.** Only the GIBS layers are
  measurements; everything else is model output. Presenting them identically would overstate the
  forecast fields, which is the failure mode this project is most exposed to.
