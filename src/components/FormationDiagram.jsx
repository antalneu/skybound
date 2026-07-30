import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { STEPS } from '../data/formation'
import { useReducedMotion } from '../theme/useReducedMotion'

/**
 * The rising-parcel diagram: lift → cool → saturate → nucleate → grow → rain.
 *
 * Drawn as a diagram, not as a picture of a cloud — the photographs elsewhere
 * do that job, and a diagram competing with them would only muddy both. So:
 * flat fills, a labelled altitude axis, and no texture.
 *
 * Step-driven rather than scroll-driven. Scroll-linked animation reads badly in
 * study material — you cannot go back a step or pause on the interesting one —
 * so it is buttons, with optional autoplay.
 *
 * The vertical axis is honest: the parcel's temperature readout follows the dry
 * adiabatic rate below the condensation level and the saturated rate above it,
 * which is why the numbers slow down once the cloud starts.
 */

const W = 440
const H = 520
const GROUND_Y = 462
const LCL_Y = 258
const AXIS_X = 46

// Parcel height and the temperature it has cooled to, per step.
const STAGES = [
  { y: 430, temp: 22, cloud: 0, rain: false },
  { y: 340, temp: 12.6, cloud: 0, rain: false },
  { y: LCL_Y, temp: 4, cloud: 0.3, rain: false },
  { y: 222, temp: 2, cloud: 0.55, rain: false },
  { y: 182, temp: -0.4, cloud: 0.8, rain: false },
  { y: 142, temp: -3, cloud: 1, rain: true },
]

/** Cloud built from plain circles — deliberately diagrammatic. */
const CLOUD_LOBES = [
  { cx: 168, cy: 244, r: 30, at: 0.0 },
  { cx: 208, cy: 228, r: 38, at: 0.15 },
  { cx: 252, cy: 238, r: 32, at: 0.3 },
  { cx: 288, cy: 246, r: 24, at: 0.45 },
  { cx: 196, cy: 200, r: 30, at: 0.6 },
  { cx: 238, cy: 194, r: 26, at: 0.78 },
  { cx: 216, cy: 168, r: 22, at: 0.92 },
]

function Cloud({ progress }) {
  if (progress <= 0) return null
  return (
    <g>
      {CLOUD_LOBES.map((l, i) => (
        <circle
          key={i}
          cx={l.cx}
          cy={l.cy}
          r={progress > l.at ? l.r : 0}
          fill="var(--cirrus)"
          opacity="0.5"
          style={{ transition: 'r 600ms var(--ease-out)' }}
        />
      ))}
      {/* Flat base at the condensation level — the point of the whole figure */}
      <rect
        x={150}
        y={LCL_Y - 6}
        width={progress > 0.2 ? 160 : 0}
        height={12}
        rx={6}
        fill="var(--cirrus)"
        opacity="0.55"
        style={{ transition: 'width 600ms var(--ease-out)' }}
      />
    </g>
  )
}

function Rain({ on, reduced }) {
  const drops = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: 158 + i * 11 + ((i * 37) % 7),
        delay: ((i * 13) % 10) / 10,
        len: 10 + ((i * 7) % 9),
      })),
    [],
  )
  if (!on) return null

  return (
    <g stroke="var(--cirrus)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65">
      {drops.map((d, i) =>
        reduced ? (
          <line key={i} x1={d.x} y1={LCL_Y + 20} x2={d.x - 2} y2={LCL_Y + 20 + d.len} />
        ) : (
          <motion.line
            key={i}
            x1={d.x}
            x2={d.x - 3}
            initial={{ y1: LCL_Y + 8, y2: LCL_Y + 8 + d.len, opacity: 0 }}
            animate={{
              y1: [LCL_Y + 8, GROUND_Y - 4],
              y2: [LCL_Y + 8 + d.len, GROUND_Y - 4 + d.len],
              opacity: [0, 0.85, 0.85, 0],
            }}
            transition={{ duration: 1.4, delay: d.delay, repeat: Infinity, ease: 'linear' }}
          />
        ),
      )}
    </g>
  )
}

/** Magnified inset for the two microphysics steps. */
function Inset({ step, reduced }) {
  const show = step === 3 || step === 4
  return (
    <motion.g
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
      style={{ pointerEvents: 'none' }}
    >
      <line
        x1={306}
        y1={318}
        x2={272}
        y2={276}
        stroke="var(--hairline-lit)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx={348}
        cy={366}
        r={62}
        fill="var(--surface)"
        stroke="var(--hairline-lit)"
        strokeWidth="1"
      />

      {step === 3 && (
        <g>
          <text x={348} y={330} textAnchor="middle" fontSize="8" fill="var(--ink-faint)" letterSpacing="1.2">
            NUCLEATION
          </text>
          <circle cx={348} cy={368} r={22} fill="var(--cirrus)" opacity="0.28" />
          <circle cx={348} cy={368} r={22} fill="none" stroke="var(--cirrus)" strokeWidth="1" opacity="0.5" />
          <circle cx={348} cy={368} r={4.5} fill="var(--cirrus)" />
          {[0, 72, 144, 216, 288].map((a) => {
            const rad = (a * Math.PI) / 180
            return (
              <circle
                key={a}
                cx={348 + Math.cos(rad) * 36}
                cy={368 + Math.sin(rad) * 36}
                r="1.7"
                fill="var(--ink-faint)"
              />
            )
          })}
          <text x={348} y={408} textAnchor="middle" fontSize="7.5" fill="var(--ink-soft)">
            0.2 µm nucleus, water condensing on
          </text>
        </g>
      )}

      {step === 4 && (
        <g>
          <text x={348} y={330} textAnchor="middle" fontSize="8" fill="var(--ink-faint)" letterSpacing="1.2">
            GROWTH STALLS
          </text>
          <circle cx={318} cy={368} r={4} fill="var(--cirrus)" opacity="0.45" />
          <circle cx={344} cy={368} r={10} fill="var(--cirrus)" opacity="0.6" />
          <circle cx={374} cy={368} r={12.5} fill="var(--cirrus)" opacity="0.65" />
          <path
            d="M 326 386 C 338 394, 358 394, 368 386"
            fill="none"
            stroke="var(--ink-faint)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text x={348} y={406} textAnchor="middle" fontSize="7.5" fill="var(--ink-soft)">
            stops near 20 µm
          </text>
        </g>
      )}
    </motion.g>
  )
}

export default function FormationDiagram({ step, onStep }) {
  const reduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const stage = STAGES[step]

  useEffect(() => {
    if (!playing || reduced) return
    const t = setTimeout(() => onStep((step + 1) % STEPS.length), 3600)
    return () => clearTimeout(t)
  }, [playing, step, onStep, reduced])

  return (
    <div className="card rounded-lg">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Diagram, step ${step + 1} of ${STEPS.length}: ${STEPS[step].title}. ${STEPS[step].subtitle}.`}
      >
        {/* altitude axis */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = GROUND_Y - i * 88
          return (
            <g key={i}>
              <line x1={AXIS_X} y1={y} x2={W - 14} y2={y} stroke="var(--hairline)" strokeWidth="1" />
              <text x={AXIS_X - 8} y={y + 3.5} textAnchor="end" fontSize="9.5" fill="var(--ink-faint)">
                {i}
              </text>
            </g>
          )
        })}
        <text x={AXIS_X - 8} y={GROUND_Y - 4 * 88 - 12} textAnchor="end" fontSize="8" fill="var(--ink-faint)">
          km
        </text>

        <Cloud progress={stage.cloud} />
        <Rain on={stage.rain} reduced={reduced} />

        {/* lifting condensation level */}
        <g opacity={step >= 2 ? 1 : 0.3} style={{ transition: 'opacity 500ms' }}>
          <line
            x1={AXIS_X}
            y1={LCL_Y}
            x2={W - 14}
            y2={LCL_Y}
            stroke="var(--cirrus)"
            strokeWidth="1.3"
            strokeDasharray="6 5"
          />
          <text x={W - 16} y={LCL_Y - 9} textAnchor="end" fontSize="9" fill="var(--cirrus)">
            Lifting condensation level — cloud base
          </text>
        </g>

        {/* ground */}
        <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill="var(--hairline)" />
        <line x1={0} y1={GROUND_Y} x2={W} y2={GROUND_Y} stroke="var(--hairline-lit)" strokeWidth="1.5" />

        {/* the parcel */}
        <motion.g
          animate={{ y: stage.y - 430 }}
          transition={{ duration: reduced ? 0 : 1, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <circle
            cx={232}
            cy={430}
            r={25}
            fill="var(--cirrus)"
            opacity={step >= 2 ? 0.28 : 0.16}
            style={{ transition: 'opacity 700ms' }}
          />
          <circle cx={232} cy={430} r={25} fill="none" stroke="var(--cirrus)" strokeWidth="1.4" />
          <text x={232} y={434} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--cirrus)">
            {stage.temp}°
          </text>
          {step < 5 && (
            <g stroke="var(--cirrus)" strokeWidth="1.4" strokeLinecap="round" opacity="0.6">
              <line x1={232} y1={398} x2={232} y2={378} />
              <path d="M 226 384 L 232 376 L 238 384" fill="none" />
            </g>
          )}
        </motion.g>

        <Inset step={step} reduced={reduced} />

        {/* which lapse rate is currently operating */}
        <text
          x={AXIS_X + 10}
          y={GROUND_Y - 54}
          fontSize="9.5"
          fill="var(--ink-soft)"
          opacity={step >= 1 ? 1 : 0}
          style={{ transition: 'opacity 500ms' }}
        >
          {step >= 2 ? 'Saturated: ≈4–7 °C/km' : 'Dry adiabatic: 9.8 °C/km'}
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-2 border-t border-hairline p-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={reduced}
          className="rounded-full bg-cirrus px-4 py-1.5 text-xs font-medium text-void disabled:opacity-40"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <div className="flex gap-1" role="tablist" aria-label="Formation steps">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === step}
              onClick={() => {
                setPlaying(false)
                onStep(i)
              }}
              title={s.title}
              className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                i === step
                  ? 'bg-cirrus text-void'
                  : 'border border-hairline text-ink-soft hover:text-ink'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="ml-auto text-xs text-ink-faint">
          {reduced ? 'Autoplay off — reduced motion' : 'Step through, or press play'}
        </p>
      </div>
    </div>
  )
}
