/**
 * Every source consulted while building this site. Mirrors /RESEARCH.md §7.
 */

export const SOURCE_GROUPS = [
  {
    id: 'primary',
    label: 'Primary and institutional',
    note: 'The classification system, altitude conventions and radiation figures come from these.',
    items: [
      {
        title: 'WMO International Cloud Atlas',
        org: 'World Meteorological Organization',
        url: 'https://cloudatlas.wmo.int/en/home.html',
        used: 'Genera, species, varieties, supplementary features, accessory clouds, special-cloud suffixes, étage table, noctilucent and nacreous cloud entries.',
      },
      {
        title: 'A New Edition of the International Cloud Atlas',
        org: 'WMO Bulletin',
        url: 'https://wmo.int/media/magazine-article/new-edition-of-international-cloud-atlas',
        used: 'The 2017 revision — volutus, asperitas, cavum, cauda, fluctus, murus, flumen.',
      },
      {
        title: 'JetStream — How Clouds Form & NWS Cloud Chart',
        org: 'NOAA',
        url: 'https://www.noaa.gov/jetstream/clouds',
        used: 'Lifting mechanisms, US altitude conventions, the standard observer cloud chart.',
      },
      {
        title: 'Cloud Classification',
        org: 'NWS Louisville',
        url: 'https://www.weather.gov/lmk/cloud_classification',
        used: 'US altitude bands and per-genus appearance and weather associations.',
      },
      {
        title: 'Sky Watcher Cloud Chart',
        org: 'NOAA / NASA',
        url: 'https://www.ncei.noaa.gov/sites/default/files/sky-watcher-cloud-chart-noaa-nasa-english-version.pdf',
        used: 'Cross-check on genus identification cues.',
      },
      {
        title: 'Cloudy Earth',
        org: 'NASA Earth Observatory',
        url: 'https://science.nasa.gov/earth/earth-observatory/cloudy-earth-85843/',
        used: 'Global cloud cover — about 67% of Earth\'s surface at any moment.',
      },
      {
        title: 'CERES — Clouds and the Earth\'s Radiant Energy System',
        org: 'NASA Langley',
        url: 'https://ceres.larc.nasa.gov/science/',
        used: 'Measurement basis for cloud radiative effect.',
      },
      {
        title: 'Cloud Radiative Effect',
        org: 'NOAA Geophysical Fluid Dynamics Laboratory',
        url: 'https://www.gfdl.noaa.gov/cloud-radiative-effect/',
        used: 'Shortwave, longwave and net CRE values; forcing masking and its effect on sensitivity.',
      },
      {
        title: 'DOE Explains… Clouds and Aerosols',
        org: 'US Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsclouds-and-aerosols',
        used: 'Aerosol–cloud interactions, condensation nuclei.',
      },
      {
        title: 'Sizes of Aerosols, Raindrops and Cloud Droplets',
        org: 'UCAR Center for Science Education',
        url: 'https://scied.ucar.edu/image/aerosols-raindrop-cloud-droplets-sizes',
        used: 'The 0.2 µm / 20 µm / 2 mm size scale.',
      },
    ],
  },
  {
    id: 'literature',
    label: 'Textbook and peer-reviewed',
    note: 'Optics geometry, microphysics and the climate-feedback discussion.',
    items: [
      {
        title: 'Practical Meteorology, Ch. 22 — Atmospheric Optics',
        org: 'Stull, University of British Columbia',
        url: 'https://www.eoas.ubc.ca/books/Practical_Meteorology/prmet102/Ch22-Optics-v102.pdf',
        used: 'Halo, corona and glory geometry; the refraction-versus-diffraction distinction.',
      },
      {
        title: 'Atmospheric Processes and Phenomena — Ch. 5 & 7',
        org: 'University of Hawaiʻi OER',
        url: 'https://pressbooks-dev.oer.hawaii.edu/atmo/chapter/chapter-5-atmospheric-stability/',
        used: 'Lapse rates, stability criteria, precipitation processes.',
      },
      {
        title: 'A conceptual framework for understanding longwave cloud effects on climate sensitivity',
        org: 'Atmospheric Chemistry and Physics, 25, 9075 (2025)',
        url: 'https://acp.copernicus.org/articles/25/9075/2025/',
        used: 'Longwave cloud effects and their role in sensitivity estimates.',
      },
      {
        title: 'Most long-lived contrails form within cirrus clouds with uncertain climate impact',
        org: 'Nature Communications (2025)',
        url: 'https://www.nature.com/articles/s41467-025-65532-2',
        used: 'Contrail persistence and its climate significance.',
      },
      {
        title: 'Contrails, contrail cirrus, and ship tracks',
        org: 'DLR Institute of Atmospheric Physics',
        url: 'https://elib.dlr.de/45218/1/g-214.pdf',
        used: 'The Schmidt–Appleman criterion.',
      },
      {
        title: 'Wegener–Bergeron–Findeisen process',
        org: 'Reviewed against primary microphysics literature',
        url: 'https://en.wikipedia.org/wiki/Wegener%E2%80%93Bergeron%E2%80%93Findeisen_process',
        used: 'Mixed-phase growth; cross-checked against the Hawaiʻi OER chapter above.',
      },
      {
        title: 'International Cloud Atlas and new cloud classifications',
        org: 'Royal Meteorological Society',
        url: 'https://www.rmets.org/metmatters/international-cloud-atlas-and-new-cloud-classifications',
        used: 'Context on the 2017 revision and the asperitas proposal.',
      },
    ],
  },
  {
    id: 'data',
    label: 'Live data providers',
    note: 'Everything the Global Atmosphere Explorer draws. All keyless and CORS-enabled, verified by direct request. Whether a source is observed or modelled is stated, because it changes how much a number is worth.',
    items: [
      {
        title: 'Global Imagery Browse Services (GIBS)',
        org: 'NASA Earthdata',
        url: 'https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api',
        used: 'Near-real-time satellite imagery: VIIRS/SNPP and MODIS Terra corrected reflectance, plus MODIS Terra retrieved cloud fraction. Observational. Tiles are served in WMTS {z}/{y}/{x} order, and the current day is usually unpublished.',
      },
      {
        title: 'Open-Meteo Forecast API',
        org: 'Open-Meteo',
        url: 'https://open-meteo.com/en/docs',
        used: 'Cloud cover, precipitation, 2 m temperature, and 10 m wind speed and direction, as 48-hour hourly series. Model forecast output, not observations. Requested in m/s so displayed units need no conversion.',
      },
      {
        title: 'Open-Meteo Air Quality API',
        org: 'Open-Meteo, on Copernicus CAMS',
        url: 'https://open-meteo.com/en/docs/air-quality-api',
        used: 'US EPA AQI and the six criteria pollutants, plus per-pollutant AQI sub-indices. Model output from CAMS — Europe at 0.1° hourly, global at 0.4° 3-hourly. Taking the index from the API is deliberate: no AQI breakpoint is computed locally, so none can be invented.',
      },
      {
        title: 'Copernicus Atmosphere Monitoring Service (CAMS)',
        org: 'ECMWF / Copernicus',
        url: 'https://atmosphere.copernicus.eu/',
        used: 'The upstream atmospheric composition model behind the air quality layer. Cited because the layer is only as good as this, and it is a forecast system rather than a monitoring network.',
      },
      {
        title: 'Air Quality Index (AQI) Basics',
        org: 'AirNow (US EPA)',
        url: 'https://www.airnow.gov/aqi/aqi-basics/',
        used: 'The six official AQI categories and their numeric ranges — 0–50, 51–100, 101–150, 151–200, 201–300, 301+ — and the category health statements the inspect card paraphrases.',
      },
      {
        title: 'Technical Assistance Document for the Reporting of Daily Air Quality',
        org: 'US EPA',
        url: 'https://document.airnow.gov/technical-assistance-document-for-the-reporting-of-daily-air-quailty.pdf',
        used: 'The official AQI category colours (#00E400, #FFFF00, #FF7E00, #FF0000, #8F3F97, #7E0023) and the definition of the reported AQI as the maximum of the per-pollutant sub-indices. Used verbatim, since people read these colours as health signals.',
      },
      {
        title: 'API Web Service — station observations',
        org: 'NOAA / National Weather Service',
        url: 'https://www.weather.gov/documentation/services-web-api',
        used: 'Independent observational cross-check in scripts/verify-live.mjs. Genuine station measurement, used to sanity-check the model fields rather than to render a layer.',
      },
      {
        title: 'Dark Matter basemap',
        org: 'CARTO, on OpenStreetMap data',
        url: 'https://carto.com/attributions',
        used: 'The Explorer basemap style. Geography and labels only; no atmospheric data.',
      },
    ],
  },
  {
    id: 'crosscheck',
    label: 'Cross-check only',
    note: 'Used to rebuild the genus/species matrix after the WMO table resisted automated extraction, then verified against the per-genus Atlas pages.',
    items: [
      {
        title: 'List of cloud types · Cloud species · Etage · Asperitas',
        org: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/List_of_cloud_types',
        used: 'Structural cross-reference for the genus–species–variety matrix. Not treated as authoritative on its own.',
      },
    ],
  },
]

/** Places where sources genuinely disagree, or the science is open. */
export const FLAGS = [
  {
    id: 'aqi-averaging',
    title: 'An AQI sub-index and the concentration beside it are not the same measurement',
    text: 'EPA defines each pollutant sub-index over that pollutant\'s own averaging window — 24 hours for particulates, 8 for ozone — while the concentration reported for an hour is that hour alone. Reading the two as a pair looks like arithmetic that does not work. Delhi, measured while building this: 67.5 μg/m³ of PM2.5 carrying a sub-index of 150, where mapping the instantaneous value through the published breakpoints gives 159 and mapping the 24-hour mean, 56.9 μg/m³, gives 152.',
    resolution: 'The inspect card labels the columns 1 h and avg, and says outright that they will not divide neatly. scripts/verify-live.mjs measures which series the sub-index actually tracks — instantaneous or 24-hour mean — so if the provider ever changes that, the explanation stops being true loudly rather than quietly.',
  },
  {
    id: 'aqi-standards',
    title: 'There is more than one AQI, and they disagree about the same air',
    text: 'The US EPA index and the European AQI use different breakpoints, different averaging windows and different category counts, so one city can be "Moderate" on one scale and "Fair" on the other from identical concentrations. Open-Meteo returns both.',
    resolution: 'This site uses the US EPA index throughout, and labels it "US AQI" everywhere it appears rather than the bare word "AQI" — the colours are only meaningful against a named standard.',
  },
  {
    id: 'etage-numbers',
    title: 'NOAA publications do not agree with each other on étage boundaries',
    text: 'NWS office material puts the high/middle boundary at 20,000 ft; NOAA\'s JetStream module puts it at 15,000 ft; the WMO temperate étage begins near 16,500 ft. All three are in current publication.',
    resolution: 'This site quotes the WMO latitude-dependent table as primary, and notes the 15,000–20,000 ft range as US shorthand rather than picking a winner.',
  },
  {
    id: 'nimbostratus',
    title: 'Nimbostratus is filed differently on either side of the Atlantic',
    text: 'The WMO assigns it to the middle étage. Many US-facing references list it as a low cloud, because its base usually is low. It habitually spans all three levels regardless.',
    resolution: 'Both conventions are shown on the cloud\'s detail page.',
  },
  {
    id: 'vertical',
    title: 'Cumulus and Cumulonimbus have two competing classifications',
    text: 'WMO places them in the low étage as clouds "with vertical extent." The US NWS gives them a separate fourth category, "clouds with vertical development."',
    resolution: 'The explorer offers vertical extent as its own filter, and each detail page states both.',
  },
  {
    id: 'asperitas',
    title: 'Nobody is certain how asperitas forms',
    text: 'Candidate explanations involve mid-level gravity waves and mesoscale convective system outflow, but no mechanism is established.',
    resolution: 'Stated as open on the gallery entry, rather than given a tidy invented cause.',
  },
  {
    id: 'salr',
    title: 'The saturated adiabatic lapse rate is not a constant',
    text: 'It ranges from about 4 °C/km in warm humid air near the surface to 6–7 °C/km in the middle troposphere, because warmer air releases more latent heat per kilometre of ascent.',
    resolution: 'Given as a range throughout, not as a single textbook number.',
  },
  {
    id: 'feedback',
    title: 'Cloud feedback is the live research frontier',
    text: 'The sign of the cloud radiative effect today does not determine the sign of the feedback under warming — a distinction frequently lost in summary.',
    resolution: 'Presented as an assessed range with the distinction made explicit.',
  },
  {
    id: 'matrix',
    title: 'The genus–species matrix is not a closed set',
    text: 'The Atlas admits rarer combinations than any summary table lists.',
    resolution: 'Species and varieties are labelled "commonly observed with", not presented as exhaustive.',
  },
]

export const COLOPHON = {
  text: 'Every photograph is a real, identified cloud, sourced from Wikimedia Commons under a free licence and credited to its photographer. The only drawn figures are the formation diagram and the altitude chart, which are diagrams rather than depictions.',
  stack: 'React · Vite · Tailwind CSS · Framer Motion · photographs from Wikimedia Commons',
  images:
    'Photographs are vendored into the repository rather than hotlinked, because Wikimedia rate-limits third-party embedding — during sourcing, 30 of 36 requests returned HTTP 429. They are resized to three widths and served as WebP with a JPEG fallback. The original file page, photographer and licence for each one are recorded below and shown beside every image.',
}
