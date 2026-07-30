import { makeFieldSampler, mercLat, mercY, rampColor } from '../../data/liveData'

/**
 * Smooth scalar heatmaps (cloud cover, precipitation, temperature) rendered
 * as a georeferenced MapLibre canvas source.
 *
 * The grid is sampled into a small offscreen canvas, which MapLibre then
 * stretches over the grid's geographic bounds. Handing the canvas to MapLibre
 * rather than overlaying it on the DOM buys three things:
 *
 *   1. It sits BENEATH the basemap's labels and boundaries, so coastlines and
 *      place names stay crisp instead of being fogged over by the data.
 *   2. MapLibre reprojects it, so it stays correct under globe projection and
 *      any future rotation — an overlay blit only works on a flat north-up map.
 *   3. Panning and zooming cost nothing here; the map moves its own texture.
 *
 * The offscreen is built in *Mercator Y* space to match how the grid was
 * sampled. Building it in degrees of latitude would stretch progressively
 * toward the poles.
 */

/**
 * Offscreen resolution, raised from 192×128 when the sample grid got denser.
 *
 * This is the reconstruction buffer, not the data — it has to be fine enough
 * not to throw away detail the grid actually has. MapLibre stretches it over
 * the whole world with linear filtering, so at 192 px a 1280 px-wide viewport
 * was magnifying nearly 7× and the gradients turned to mush. 480 px across 360°
 * is ~1.3 px per degree, comfortably finer than the ~12° sample spacing, so the
 * limit on what you see is the grid rather than the buffer.
 *
 * Cost is bounded: renders happen when data or the timestep changes, not per
 * frame, so this is a few milliseconds of arithmetic several times a session.
 */
const OFF_W = 480
const OFF_H = 320

export default class FieldRenderer {
  constructor(map, { sourceId = 'heat-src', layerId = 'heat-lyr' } = {}) {
    this.map = map
    this.sourceId = sourceId
    this.layerId = layerId

    this.canvas = document.createElement('canvas')
    this.canvas.width = OFF_W
    this.canvas.height = OFF_H
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })

    this.layers = []
    this.grid = null
    this.t = 0
    this.attached = false
  }

  /**
   * @param {Array<{field:string,opacity:number,grid?:object}>} layers
   *   bottom-to-top. `grid` overrides the shared grid for that layer — air
   *   quality comes from a different API on a different refresh cadence, so it
   *   arrives as its own grid rather than as extra columns on the weather one.
   *   Both are sampled over GLOBAL_BOUNDS, so they composite into one canvas.
   */
  setLayers(layers) {
    this.layers = layers
    this.render()
  }

  setData(grid, t) {
    this.grid = grid
    this.t = t
    this.render()
  }

  /** Build one variable's RGBA buffer at the offscreen resolution. */
  buildBuffer(field, grid) {
    const sampler = makeFieldSampler(grid, field, this.t)
    if (!sampler) return null
    const { bounds } = grid
    const yTop = mercY(bounds.north)
    const yBot = mercY(bounds.south)

    const img = this.ctx.createImageData(OFF_W, OFF_H)
    const d = img.data
    for (let j = 0; j < OFF_H; j++) {
      const lat = mercLat(yTop + ((yBot - yTop) * j) / (OFF_H - 1))
      for (let i = 0; i < OFF_W; i++) {
        const lon = bounds.west + ((bounds.east - bounds.west) * i) / (OFF_W - 1)
        const v = sampler(lon, lat)
        const idx = (j * OFF_W + i) * 4
        if (v == null) {
          d[idx + 3] = 0
          continue
        }
        const [r, g, b, a] = rampColor(field, v)
        d[idx] = r
        d[idx + 1] = g
        d[idx + 2] = b
        d[idx + 3] = a
      }
    }
    return img
  }

  render() {
    const { map } = this
    if (!map) return

    const active = this.layers.filter(
      (l) => l.opacity > 0 && (l.grid ?? this.grid)?.points?.length,
    )

    if (!active.length || !this.gridForBounds) {
      this.detach()
      return
    }

    // Composite the active variables into the single shared canvas.
    this.ctx.clearRect(0, 0, OFF_W, OFF_H)
    const scratch = document.createElement('canvas')
    scratch.width = OFF_W
    scratch.height = OFF_H
    const sctx = scratch.getContext('2d')

    for (const layer of active) {
      const img = this.buildBuffer(layer.field, layer.grid ?? this.grid)
      if (!img) continue
      sctx.putImageData(img, 0, 0)
      this.ctx.globalAlpha = layer.opacity
      this.ctx.drawImage(scratch, 0, 0)
      sctx.clearRect(0, 0, OFF_W, OFF_H)
    }
    this.ctx.globalAlpha = 1
    this.featherEdges()

    this.attach()
  }

  /**
   * Fade the outer edge to transparent.
   *
   * The data only covers the viewport it was fetched for. Zoom out — or fall
   * back to a cached grid from a tighter view — and that region becomes a
   * hard-edged rectangle floating in the middle of the map, which reads as a
   * rendering fault rather than as the edge of coverage. Feathering makes the
   * boundary legible as "data stops here" instead.
   */
  featherEdges() {
    const ctx = this.ctx
    const f = Math.round(OFF_W * 0.06)
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'

    const strip = (x0, y0, x1, y1, w, h) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1)
      g.addColorStop(0, 'rgba(0,0,0,1)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), w, h)
    }

    strip(0, 0, f, 0, f, OFF_H) // left
    strip(OFF_W, 0, OFF_W - f, 0, f, OFF_H) // right
    strip(0, 0, 0, f, OFF_W, f) // top
    strip(0, OFF_H, 0, OFF_H - f, OFF_W, f) // bottom

    ctx.restore()
    ctx.globalCompositeOperation = 'source-over'
  }

  /**
   * Whichever grid defines the blit rectangle. The shared weather grid is
   * preferred, but an active layer may carry its own — so the air quality layer
   * still draws if it is the only one that has loaded.
   */
  get gridForBounds() {
    if (this.grid?.points?.length) return this.grid
    return this.layers.find((l) => l.grid?.points?.length)?.grid ?? null
  }

  get coordinates() {
    const { north, south, east, west } = this.gridForBounds.bounds
    // Clockwise from top-left, as MapLibre expects.
    return [
      [west, north],
      [east, north],
      [east, south],
      [west, south],
    ]
  }

  attach() {
    const { map } = this
    if (!map.isStyleLoaded()) return

    try {
      if (!this.attached || !map.getSource(this.sourceId)) {
        if (map.getLayer(this.layerId)) map.removeLayer(this.layerId)
        if (map.getSource(this.sourceId)) map.removeSource(this.sourceId)

        map.addSource(this.sourceId, {
          type: 'canvas',
          canvas: this.canvas,
          coordinates: this.coordinates,
          // animate:false avoids re-uploading the texture every frame; the
          // refresh is driven explicitly by setCoordinates below.
          animate: false,
        })

        // Beneath the first symbol layer so labels and boundaries stay on top.
        const firstSymbol = map.getStyle().layers.find((l) => l.type === 'symbol')?.id
        map.addLayer(
          {
            id: this.layerId,
            type: 'raster',
            source: this.sourceId,
            paint: { 'raster-opacity': 1, 'raster-fade-duration': 0, 'raster-resampling': 'linear' },
          },
          firstSymbol,
        )
        this.attached = true
      } else {
        // setCoordinates is also what forces MapLibre to re-read the canvas,
        // which is why it is called even when the bounds have not changed.
        map.getSource(this.sourceId).setCoordinates(this.coordinates)
      }
    } catch (err) {
      console.warn('[skybound] heatmap attach failed:', err)
    }
  }

  detach() {
    const { map } = this
    if (!map) return
    try {
      if (map.getLayer(this.layerId)) map.removeLayer(this.layerId)
      if (map.getSource(this.sourceId)) map.removeSource(this.sourceId)
    } catch {
      /* style may be mid-swap */
    }
    this.attached = false
  }

  destroy() {
    this.detach()
    this.grid = null
    this.map = null
  }
}
