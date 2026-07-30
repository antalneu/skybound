import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../theme/useReducedMotion'
import Reveal from './Reveal'

export { Reveal }

/* ---------------------------------------------------------- layout ---- */

export function Section({ id, eyebrow, title, lede, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 ${className}`}>
      {(eyebrow || title) && (
        <Reveal className="mb-10 max-w-2xl">
          {eyebrow && <p className="hud-label mb-3">{eyebrow}</p>}
          {title && (
            <h2 className="display text-[clamp(1.7rem,3.4vw,2.6rem)] text-ink">{title}</h2>
          )}
          {lede && <p className="mt-4 leading-relaxed text-ink-soft">{lede}</p>}
        </Reveal>
      )}
      {children}
    </section>
  )
}

export function PageHeader({ eyebrow, title, lede, children }) {
  return (
    <header className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
      <Reveal>
        {eyebrow && (
          <p className="hud-label mb-4 flex items-center gap-2.5">
            <span className="h-px w-8 bg-cirrus/60" />
            {eyebrow}
          </p>
        )}
        <h1 className="display-lg max-w-4xl text-[clamp(2.4rem,6.5vw,4.4rem)] text-ink">{title}</h1>
        {lede && (
          <p className="prose-study mt-6 text-[1.05rem] leading-relaxed text-ink-soft">{lede}</p>
        )}
        {children}
      </Reveal>
    </header>
  )
}

/* ---------------------------------------------------------- motion ---- */

/**
 * Number that eases to its new value instead of snapping.
 *
 * Live readouts that jump between values read as broken; easing them reads as
 * an instrument settling. Uses rAF rather than a spring so the final value is
 * always exact — a spring can leave 23.999 on screen.
 */
export function AnimatedNumber({ value, decimals = 0, duration = 620, className = '' }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(0)

  useEffect(() => {
    if (reduced || typeof value !== 'number' || Number.isNaN(value)) {
      setShown(value)
      fromRef.current = value
      return
    }
    const from = fromRef.current
    const start = performance.now()
    cancelAnimationFrame(rafRef.current)

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(from + (value - from) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = value
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration, reduced])

  if (typeof shown !== 'number' || Number.isNaN(shown)) {
    return <span className={className}>—</span>
  }
  return <span className={className}>{shown.toFixed(decimals)}</span>
}

/* ------------------------------------------------------- primitives ---- */

export function Pill({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'border-hairline-lit text-ink-soft',
    accent: 'border-cirrus/40 bg-cirrus/12 text-cirrus',
    gold: 'border-gold/40 bg-gold/12 text-gold',
    violet: 'border-violet/40 bg-violet/12 text-violet',
    quiet: 'border-hairline text-ink-faint',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function DataRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-hairline py-3 last:border-0 sm:grid-cols-[minmax(8.5rem,1fr)_2.4fr] sm:gap-6">
      <dt className="hud-label pt-0.5">{label}</dt>
      <dd className="text-sm leading-relaxed text-ink-soft">{children}</dd>
    </div>
  )
}

/** Instrument-style stat block for HUD readouts. */
export function Stat({ label, value, unit, tone = 'ink', className = '' }) {
  const tones = { ink: 'text-ink', cirrus: 'text-cirrus', gold: 'text-gold', violet: 'text-violet' }
  return (
    <div className={className}>
      <p className="hud-label">{label}</p>
      <p className={`hud-value mt-1 text-xl leading-none ${tones[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-[0.6em] text-ink-faint">{unit}</span>}
      </p>
    </div>
  )
}

/**
 * Uncertainty note. The science has genuine open questions and conflicting
 * sources; those get a designed treatment rather than a buried footnote.
 */
export function Flag({ title, children, compact = false }) {
  return (
    <aside
      className={`relative overflow-hidden rounded-lg border border-gold/25 bg-gold/[0.055] ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-[2px] bg-gold/70" />
      <p className="hud-label mb-2 flex items-center gap-2 text-gold">
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M6 1.4 11 10.5H1z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M6 4.8v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="6" cy="8.8" r="0.55" fill="currentColor" />
        </svg>
        {title ?? 'Where the sources disagree'}
      </p>
      <div className="text-sm leading-relaxed text-ink-soft">{children}</div>
    </aside>
  )
}

/** Live/stale/error indicator for data-backed panels. */
export function StatusDot({ status, label }) {
  const map = {
    live: { c: 'bg-good', t: 'text-good', d: 'Live' },
    loading: { c: 'bg-cirrus', t: 'text-cirrus', d: 'Loading' },
    cached: { c: 'bg-gold', t: 'text-gold', d: 'Cached' },
    error: { c: 'bg-danger', t: 'text-danger', d: 'Unavailable' },
  }
  const s = map[status] ?? map.loading
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-1.5 w-1.5">
        {status === 'live' && (
          <span className={`live-dot absolute inline-flex h-full w-full rounded-full ${s.c} opacity-70`} />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.c}`} />
      </span>
      <span className={`hud-label ${s.t}`}>{label ?? s.d}</span>
    </span>
  )
}

/** Primary action. */
export function Button({ as: Tag = 'button', tone = 'primary', className = '', children, ...rest }) {
  const tones = {
    primary:
      'bg-cirrus text-void hover:bg-[#96d1f5] shadow-[0_8px_28px_-10px_rgba(124,196,240,0.7)]',
    ghost: 'glass text-ink hover:border-hairline-lit',
  }
  return (
    <Tag
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
