import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ETAGES, GENERA } from '../data/genera'
import { Flag } from './ui'

/**
 * Altitude chart: one bar per genus, drawn from its base to the height it
 * commonly reaches.
 *
 * Most published cloud charts plot the base only, which hides the most
 * interesting fact in the classification — that a cumulonimbus is filed as a
 * low cloud while its top is higher than any cirrus. Plotting full vertical
 * extent makes that visible instead of needing a footnote.
 *
 * The lighter segment is the range the base can occupy; the solid segment is
 * the body of the cloud above it.
 */

const LATITUDES = [
  { id: 'polar', label: 'Polar', max: 9 },
  { id: 'temperate', label: 'Temperate', max: 14 },
  { id: 'tropical', label: 'Tropical', max: 19 },
]

const PAD = { top: 18, right: 12, bottom: 46, left: 42 }
const CHART_W = 760
const CHART_H = 400

export default function AltitudeScale({ compact = false }) {
  const [lat, setLat] = useState('temperate')
  const [active, setActive] = useState(null)

  const latitude = LATITUDES.find((l) => l.id === lat)
  const maxKm = latitude.max
  const plotH = CHART_H - PAD.top - PAD.bottom
  const plotW = CHART_W - PAD.left - PAD.right

  const yOf = (km) => PAD.top + plotH * (1 - Math.min(km, maxKm) / maxKm)
  const colW = plotW / GENERA.length
  const barW = Math.min(34, colW * 0.5)

  const bands = ['low', 'middle', 'high'].map((id) => {
    const [lo, hi] = ETAGES[id].bands[lat]
    return { id, label: ETAGES[id].label, lo, hi }
  })

  const ticks = Array.from({ length: Math.floor(maxKm / 2) + 1 }, (_, i) => i * 2)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="hud-label">Latitude</span>
        <div className="flex rounded-full border border-hairline p-0.5" role="radiogroup" aria-label="Latitude band">
          {LATITUDES.map((l) => (
            <button
              key={l.id}
              role="radio"
              aria-checked={lat === l.id}
              onClick={() => setLat(l.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                lat === l.id ? 'bg-cirrus text-void' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-ink-faint">
          Boundaries shift with latitude — the tropopause is roughly twice as high over the
          equator as over the pole.
        </span>
      </div>

      <div className="card overflow-x-auto rounded-lg p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="h-auto w-full"
          style={{ minWidth: 600 }}
          role="img"
          aria-label={`Altitude chart of the ten cloud genera at ${latitude.label.toLowerCase()} latitudes, showing cloud base and the height each genus commonly reaches.`}
        >
          {bands.map((b) => (
            <g key={b.id}>
              <rect
                x={PAD.left}
                y={yOf(b.hi)}
                width={plotW}
                height={Math.max(0, yOf(b.lo) - yOf(b.hi))}
                fill="var(--cirrus)"
                opacity={b.id === 'middle' ? 0.07 : 0.04}
              />
              <text
                x={PAD.left + 8}
                y={yOf(b.hi) + 14}
                fontSize="9"
                fill="var(--ink-faint)"
                letterSpacing="1.3"
              >
                {b.label.toUpperCase()} · {b.lo}–{b.hi} KM
              </text>
            </g>
          ))}

          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={yOf(t)}
                x2={CHART_W - PAD.right}
                y2={yOf(t)}
                stroke="var(--hairline)"
                strokeWidth="1"
              />
              <text x={PAD.left - 8} y={yOf(t) + 3.5} textAnchor="end" fontSize="9.5" fill="var(--ink-faint)">
                {t}
              </text>
            </g>
          ))}
          <text x={PAD.left - 8} y={PAD.top - 6} textAnchor="end" fontSize="8" fill="var(--ink-faint)">
            km
          </text>

          {GENERA.map((g, i) => {
            const cx = PAD.left + colW * (i + 0.5)
            const isActive = active === g.id
            const dim = active && !isActive
            const topY = yOf(g.topKm)
            const baseLo = yOf(g.baseKm[0])
            const baseHi = yOf(g.baseKm[1])

            return (
              <g
                key={g.id}
                opacity={dim ? 0.3 : 1}
                style={{ transition: 'opacity 200ms' }}
                onMouseEnter={() => setActive(g.id)}
                onMouseLeave={() => setActive(null)}
              >
                <rect
                  x={cx - barW / 2}
                  y={topY}
                  width={barW}
                  height={Math.max(2, baseHi - topY)}
                  rx={barW / 2}
                  fill="var(--cirrus)"
                  opacity={isActive ? 0.9 : 0.6}
                  style={{ transition: 'opacity 200ms' }}
                />
                <rect
                  x={cx - barW / 2}
                  y={baseHi}
                  width={barW}
                  height={Math.max(2, baseLo - baseHi)}
                  rx={barW / 4}
                  fill="var(--cirrus)"
                  opacity={isActive ? 0.4 : 0.22}
                  style={{ transition: 'opacity 200ms' }}
                />
                <line
                  x1={cx - barW / 2 - 3}
                  y1={baseLo}
                  x2={cx + barW / 2 + 3}
                  y2={baseLo}
                  stroke="var(--cirrus)"
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y={CHART_H - PAD.bottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={isActive ? 'var(--cirrus)' : 'var(--ink-soft)'}
                >
                  {g.abbr}
                </text>
                {g.topKm >= 10 && (
                  <text x={cx} y={CHART_H - PAD.bottom + 30} textAnchor="middle" fontSize="8" fill="var(--ink-faint)">
                    →{g.topKm}km
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-2 pb-1 text-[0.7rem] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-full" style={{ background: 'var(--cirrus)', opacity: 0.6 }} />
            Body of the cloud
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-full" style={{ background: 'var(--cirrus)', opacity: 0.22 }} />
            Range the base can sit in
          </span>
        </div>
      </div>

      {!compact && (
        <>
          {/* The same data as a list — readable without decoding a chart, and
              the route to each genus page. */}
          <ul className="mt-5 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {GENERA.map((g) => (
              <li key={g.id}>
                <Link
                  to={`/clouds/${g.id}`}
                  onMouseEnter={() => setActive(g.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(g.id)}
                  onBlur={() => setActive(null)}
                  className="flex items-baseline gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-surface"
                >
                  <span className="w-7 shrink-0 font-mono text-xs text-cirrus">{g.abbr}</span>
                  <span className="text-ink">{g.name}</span>
                  <span className="ml-auto font-mono text-xs text-ink-faint">
                    {g.baseKm[0]}–{g.topKm} km
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Flag title="Two conventions, both in current use">
              The WMO assigns each genus to an étage by the height of its <em>base</em>. That puts
              Cumulonimbus in the <em>low</em> étage even though its top routinely reaches 12–16 km,
              and Nimbostratus in the middle étage even though it spans all three. The US National
              Weather Service instead gives Cumulus and Cumulonimbus a fourth category, "clouds with
              vertical development." Separately, NOAA's own publications put the high/middle boundary
              at 15,000 ft in one place and 20,000 ft in another. This chart follows the WMO latitude
              table and shows full vertical extent, so the disagreement is visible rather than hidden.
            </Flag>
          </div>
        </>
      )}
    </div>
  )
}
