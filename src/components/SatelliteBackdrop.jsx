import { useEffect, useState } from 'react'
import { gibsDateCandidates } from '../data/liveData'
import { useReducedMotion } from '../theme/useReducedMotion'

/**
 * Full-globe true-colour satellite imagery as a page backdrop.
 *
 * Uses the GIBS WMS endpoint rather than tiles, because one GetMap call
 * returns the whole world at an arbitrary size — no tile grid to assemble
 * and no map engine needed just to show a picture.
 *
 * GIBS publishes on a delay, so the current day is usually empty. This walks
 * backwards through recent dates until one loads, and reports which date it
 * settled on so the UI can state it rather than implying the image is "now".
 */

const WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi'
const LAYER = 'VIIRS_SNPP_CorrectedReflectance_TrueColor'

function url(date, width) {
  const height = Math.round(width / 2) // 360°×180° is exactly 2:1
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    VERSION: '1.3.0',
    LAYERS: LAYER,
    CRS: 'EPSG:4326',
    BBOX: '-90,-180,90,180',
    WIDTH: String(width),
    HEIGHT: String(height),
    FORMAT: 'image/jpeg',
    TIME: date,
  })
  return `${WMS}?${params}`
}

export default function SatelliteBackdrop({ onResolved, className = '' }) {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const reduced = useReducedMotion()

  const dates = gibsDateCandidates(5)
  const date = dates[attempt]

  // Modest by default; the image is heavily darkened behind text, so pushing
  // resolution past this buys nothing visible and costs real bandwidth.
  const width = typeof window !== 'undefined' && window.innerWidth > 1400 ? 2048 : 1280

  useEffect(() => {
    if (loaded && date) onResolved?.({ date, status: 'live' })
    if (failed) onResolved?.({ date: null, status: 'error' })
  }, [loaded, failed, date, onResolved])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {!failed && date && (
        <img
          key={date}
          src={url(date, width)}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (attempt < dates.length - 1) setAttempt((a) => a + 1)
            else setFailed(true)
          }}
          className="h-full w-full object-cover"
          style={{
            opacity: loaded ? 0.5 : 0,
            transition: 'opacity 1.6s var(--ease-out)',
            // A very slow push-in gives the stillness of a satellite frame
            // some life without ever reading as movement.
            animation: reduced || !loaded ? 'none' : 'sat-drift 70s ease-in-out infinite alternate',
            transformOrigin: '55% 45%',
          }}
        />
      )}

      {/* Grade the imagery into the page palette — raw MODIS/VIIRS is warm and
          would sit outside the theme entirely. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(9,14,26,0.25), rgba(5,7,13,0.85) 75%), linear-gradient(180deg, rgba(5,7,13,0.55) 0%, rgba(5,7,13,0.2) 40%, rgba(5,7,13,0.97) 100%)',
        }}
      />
      <div
        className="absolute inset-0 mix-blend-color"
        style={{ background: 'linear-gradient(180deg, #12365c 0%, #0d1b33 100%)', opacity: 0.55 }}
      />

      <style>{`
        @keyframes sat-drift {
          from { transform: scale(1.04) translate3d(-0.6%, 0.4%, 0); }
          to   { transform: scale(1.13) translate3d(0.8%, -0.6%, 0); }
        }
      `}</style>
    </div>
  )
}
