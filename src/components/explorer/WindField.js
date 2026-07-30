import { windColor } from '../../data/liveData'

/**
 * Animated wind flow field over a MapLibre map.
 *
 * Particles live in geographic space (lon/lat) and are projected to screen
 * once per frame. Keeping them geographic — rather than in screen pixels —
 * means panning and zooming carry the flow with the map instead of smearing
 * it, and the field stays correct without rebuilding on every move.
 *
 * Trails come from fading the canvas with `destination-in` rather than
 * painting a translucent background over it. Painting a background tints
 * every trail toward that colour as it ages; `destination-in` decays alpha
 * only, so trails fade cleanly to transparent and the map shows through.
 *
 * Step size is derived from the map's current degrees-per-pixel, so a given
 * wind speed moves the same number of pixels per frame at every zoom level.
 * Without that, the flow crawls when zoomed out and tears past when zoomed in.
 */

const PX_PER_MS = 0.34 // screen px per (m/s) per frame
const MAX_AGE = 110
const TRAIL_FADE = 0.9

export default class WindField {
  constructor(canvas, map, { reducedMotion = false } = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: true })
    this.map = map
    this.reducedMotion = reducedMotion
    this.sampler = null
    this.particles = []
    this.raf = 0
    this.running = false
    this.needsReproject = false
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
  }

  setSampler(sampler) {
    this.sampler = sampler
    if (sampler) this.seed()
    if (this.reducedMotion) this.drawStatic()
  }

  resize() {
    const { canvas } = this
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(rect.width * this.dpr)
    canvas.height = Math.round(rect.height * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.w = rect.width
    this.h = rect.height
    // Particle budget scales with area so a large display is not starved and
    // a phone is not asked to push desktop counts.
    this.count = Math.round(
      Math.max(600, Math.min(3400, (rect.width * rect.height) / 620)),
    )
    this.seed()
    if (this.reducedMotion) this.drawStatic()
  }

  /** Place particles at random points inside the current view. */
  seed() {
    if (!this.map || !this.w) return
    const b = this.map.getBounds()
    this.particles = Array.from({ length: this.count ?? 1200 }, () =>
      this.spawn(b, Math.random() * MAX_AGE),
    )
  }

  spawn(bounds, age = 0) {
    const west = bounds.getWest()
    const east = bounds.getEast()
    const south = bounds.getSouth()
    const north = bounds.getNorth()
    return {
      lon: west + Math.random() * (east - west),
      lat: south + Math.random() * (north - south),
      age,
      px: null,
      py: null,
    }
  }

  start() {
    if (this.running) return
    this.running = true
    if (this.reducedMotion) {
      this.drawStatic()
      return
    }
    const loop = () => {
      if (!this.running) return
      this.step()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  clear() {
    if (this.ctx && this.w) this.ctx.clearRect(0, 0, this.w, this.h)
  }

  /** Called on map move — drop stale screen positions so trails don't smear. */
  invalidate() {
    this.needsReproject = true
    this.clear()
  }

  step() {
    const { ctx, map, sampler } = this
    if (!ctx || !map || !this.w) return

    if (!sampler) {
      this.clear()
      return
    }

    // Fade existing trails by decaying alpha only.
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`
    ctx.fillRect(0, 0, this.w, this.h)
    ctx.globalCompositeOperation = 'source-over'

    const bounds = map.getBounds()
    const west = bounds.getWest()
    const east = bounds.getEast()
    const degPerPx = (east - west) / this.w
    const reproject = this.needsReproject
    this.needsReproject = false

    ctx.lineWidth = 1.15
    ctx.lineCap = 'round'

    for (const p of this.particles) {
      p.age += 1

      const s = sampler(p.lon, p.lat)
      if (!s || p.age > MAX_AGE) {
        Object.assign(p, this.spawn(bounds, 0))
        continue
      }

      const latRad = (p.lat * Math.PI) / 180
      const cosLat = Math.max(0.08, Math.cos(latRad))

      // Equal m/s gives equal screen px on both axes: longitude degrees are
      // uniform in Mercator, latitude degrees compress by cos(lat).
      const nextLon = p.lon + s.u * PX_PER_MS * degPerPx
      const nextLat = p.lat + s.v * PX_PER_MS * degPerPx * cosLat

      const proj = map.project([nextLon, nextLat])

      if (reproject || p.px == null) {
        p.px = proj.x
        p.py = proj.y
        p.lon = nextLon
        p.lat = nextLat
        continue
      }

      // Off-screen particles are recycled rather than tracked forever.
      if (proj.x < -60 || proj.x > this.w + 60 || proj.y < -60 || proj.y > this.h + 60) {
        Object.assign(p, this.spawn(bounds, 0))
        continue
      }

      const [r, g, bl] = windColor(s.speed)
      // Fade in at birth and out at death so particles never pop.
      const life = Math.min(1, p.age / 12) * (1 - Math.max(0, (p.age - MAX_AGE * 0.75) / (MAX_AGE * 0.25)))
      ctx.strokeStyle = `rgba(${r},${g},${bl},${0.15 + life * 0.6})`
      ctx.beginPath()
      ctx.moveTo(p.px, p.py)
      ctx.lineTo(proj.x, proj.y)
      ctx.stroke()

      p.px = proj.x
      p.py = proj.y
      p.lon = nextLon
      p.lat = nextLat
    }
  }

  /**
   * Reduced-motion rendering: a static arrow grid carrying the same
   * information. The field is still legible — direction, speed and colour are
   * all there — it simply does not move.
   */
  drawStatic() {
    const { ctx, map, sampler } = this
    if (!ctx || !map || !this.w) return
    this.clear()
    if (!sampler) return

    const spacing = 46
    const cols = Math.ceil(this.w / spacing)
    const rows = Math.ceil(this.h / spacing)
    ctx.lineWidth = 1.3
    ctx.lineCap = 'round'

    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= cols; i++) {
        const x = i * spacing + spacing / 2
        const y = j * spacing + spacing / 2
        const ll = map.unproject([x, y])
        const s = sampler(ll.lng, ll.lat)
        if (!s || s.speed < 0.1) continue

        const mag = Math.min(1, s.speed / 22)
        const len = 8 + mag * 13
        const ang = Math.atan2(-s.v, s.u) // screen y is inverted vs north
        const dx = Math.cos(ang) * len
        const dy = Math.sin(ang) * len
        const [r, g, b] = windColor(s.speed)

        ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`
        ctx.beginPath()
        ctx.moveTo(x - dx / 2, y - dy / 2)
        ctx.lineTo(x + dx / 2, y + dy / 2)
        ctx.stroke()

        // arrowhead
        const hx = x + dx / 2
        const hy = y + dy / 2
        ctx.beginPath()
        ctx.moveTo(hx, hy)
        ctx.lineTo(hx - Math.cos(ang - 0.42) * 5, hy - Math.sin(ang - 0.42) * 5)
        ctx.moveTo(hx, hy)
        ctx.lineTo(hx - Math.cos(ang + 0.42) * 5, hy - Math.sin(ang + 0.42) * 5)
        ctx.stroke()
      }
    }
  }

  destroy() {
    this.stop()
    this.particles = []
    this.sampler = null
  }
}
