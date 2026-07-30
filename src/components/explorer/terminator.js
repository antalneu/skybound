/**
 * Day/night terminator as a GeoJSON polygon.
 *
 * Emitted as GeoJSON rather than drawn on a canvas so MapLibre owns it — it
 * then pans, zooms and reprojects for free, and sits correctly in the layer
 * stack under the labels.
 *
 * The maths is the standard low-precision solar position: good to a fraction
 * of a degree, which is far below what is visible at these zoom levels. It is
 * not an ephemeris and should not be used for anything that needs accuracy.
 */

const RAD = Math.PI / 180
const DEG = 180 / Math.PI

/** Approximate solar declination for a date, in degrees. */
export function solarDeclination(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const dayOfYear = (date.getTime() - start) / 86400000
  // Standard cosine approximation, zeroed near the equinoxes.
  return -23.44 * Math.cos(RAD * ((360 / 365.24) * (dayOfYear + 10)))
}

/** Longitude directly beneath the sun, in degrees. */
export function subsolarLongitude(date = new Date()) {
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  let lon = -(utcHours - 12) * 15
  while (lon > 180) lon -= 360
  while (lon < -180) lon += 360
  return lon
}

/**
 * Polygon covering the night hemisphere.
 *
 * At each longitude the terminator latitude satisfies
 *   tan(lat) = -cos(lon - subsolarLon) / tan(declination)
 * The polygon is closed toward whichever pole is currently in darkness — the
 * winter pole, opposite the sign of the declination.
 */
export function nightPolygon(date = new Date(), step = 2) {
  const decl = solarDeclination(date)
  const lonSun = subsolarLongitude(date)

  // Near an equinox tan(decl) approaches zero and the formula degenerates.
  const tanDecl = Math.tan(RAD * decl)
  const safeTan = Math.abs(tanDecl) < 1e-4 ? (tanDecl < 0 ? -1e-4 : 1e-4) : tanDecl

  const coords = []
  for (let lon = -180; lon <= 180; lon += step) {
    const lat = Math.atan(-Math.cos(RAD * (lon - lonSun)) / safeTan) * DEG
    coords.push([lon, Math.max(-89.9, Math.min(89.9, lat))])
  }

  // Dark pole: north in northern winter (decl < 0), south otherwise.
  const darkPole = decl > 0 ? -90 : 90
  coords.push([180, darkPole], [-180, darkPole], coords[0])

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}

export function terminatorCollection(date = new Date()) {
  return { type: 'FeatureCollection', features: [nightPolygon(date)] }
}
