import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Photo from '../components/Photo'
import SatelliteBackdrop from '../components/SatelliteBackdrop'
import { Button, Reveal, Section, StatusDot } from '../components/ui'
import { GENERA } from '../data/genera'
import { GENUS_PHOTOS } from '../data/images'
import { COVERAGE } from '../data/climate'
import { useReducedMotion } from '../theme/useReducedMotion'

function Hero() {
  const reduced = useReducedMotion()
  const [sat, setSat] = useState({ date: null, status: 'loading' })
  const onResolved = useCallback((v) => setSat(v), [])

  const rise = (delay) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, delay, ease: [0.16, 1, 0.3, 1] },
        }

  return (
    <section className="relative flex min-h-[92svh] flex-col justify-center overflow-hidden">
      <SatelliteBackdrop onResolved={onResolved} />

      <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <motion.div className="mb-7 flex flex-wrap items-center gap-3" {...rise(0.15)}>
          <span className="glass inline-flex items-center gap-2.5 rounded-full px-3 py-1.5">
            <StatusDot
              status={sat.status === 'live' ? 'live' : sat.status === 'error' ? 'error' : 'loading'}
              label={sat.status === 'error' ? 'Imagery offline' : 'NASA GIBS'}
            />
            {sat.date && <span className="hud-value text-[0.65rem] text-ink-soft">{sat.date}</span>}
          </span>
        </motion.div>

        <motion.h1
          className="display-lg max-w-5xl text-[clamp(2.8rem,8.5vw,6.2rem)] text-ink"
          {...rise(0.25)}
        >
          The atmosphere,
          <br />
          <span className="text-cirrus">read properly.</span>
        </motion.h1>

        <motion.p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft" {...rise(0.38)}>
          Ten cloud genera, the physics that makes each one inevitable, and a live global
          explorer built on real satellite imagery and current wind observations. Grounded in the
          WMO International Cloud Atlas.
        </motion.p>

        <motion.div className="mt-10 flex flex-wrap items-center gap-3" {...rise(0.5)}>
          <Button as={Link} to="/explorer">
            Open the Explorer
            <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
              <path
                d="M2 6.5h8M6.5 3l3.5 3.5L6.5 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button as={Link} to="/clouds" tone="ghost">
            The ten genera
          </Button>
        </motion.div>

        <motion.p className="mt-9 max-w-md text-xs leading-relaxed text-ink-faint" {...rise(0.62)}>
          {sat.date
            ? `Backdrop is VIIRS/SNPP true-colour imagery from ${sat.date} — the most recent full-globe mosaic GIBS has published.`
            : 'Backdrop is NASA GIBS true-colour satellite imagery.'}
        </motion.p>
      </div>
    </section>
  )
}

function Numbers() {
  const items = [
    { v: `${COVERAGE.global}%`, k: "of Earth's surface under cloud at any moment" },
    { v: '-20 W/m²', k: 'net cloud radiative effect — clouds cool the present climate' },
    { v: '~10⁶', k: 'cloud droplets in a single average raindrop' },
    { v: '9.8 °C', k: 'temperature lost per kilometre of dry ascent' },
  ]
  return (
    <Section className="!py-14">
      <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.k} delay={i * 0.06}>
            <div className="h-full bg-deep/80 p-6">
              <p className="display text-[clamp(1.6rem,3vw,2.2rem)] text-cirrus">{it.v}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{it.k}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function GeneraGrid() {
  return (
    <Section
      eyebrow="Classification"
      title="Ten genera, agreed internationally."
      lede="No genus has been added since the system was formalised. The 2017 revision of the International Cloud Atlas — the first in thirty years — added one species and five supplementary features, and left the ten untouched."
    >
      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {GENERA.map((g, i) => {
          const photo = GENUS_PHOTOS[g.id]?.[0]
          return (
            <Reveal key={g.id} delay={Math.min(i * 0.035, 0.25)}>
              <Link to={`/clouds/${g.id}`} className="group block">
                <div className="relative overflow-hidden rounded-lg border border-hairline">
                  <Photo
                    meta={photo}
                    sizes="(min-width:1280px) 20vw, (min-width:640px) 45vw, 100vw"
                    aspect="4 / 3"
                    imgClassName="transition-transform duration-[1.2s] group-hover:scale-[1.06]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <h3 className="display text-lg text-ink transition-colors group-hover:text-cirrus">
                      {g.name}
                    </h3>
                    <span className="hud-value text-[0.65rem] text-ink-faint">{g.abbr}</span>
                  </div>
                  <p className="hud-value mt-1 text-[0.65rem] text-ink-faint">
                    {g.baseKm[0]}–{g.topKm} km
                  </p>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

const SECTIONS = [
  {
    to: '/explorer',
    label: 'Global Atmosphere Explorer',
    text: 'An interactive world map with live NASA satellite layers and an animated wind field built from current Open-Meteo observations.',
    tag: 'Live data',
  },
  {
    to: '/formation',
    label: 'Formation science',
    text: 'Lift, adiabatic cooling, saturation, nucleation, droplet growth, and the two separate mechanisms that turn droplets into rain.',
    tag: 'Interactive diagram',
  },
  {
    to: '/phenomena',
    label: 'Special & optical',
    text: 'Noctilucent and nacreous cloud, mammatus, lenticular, Kelvin–Helmholtz, asperitas — plus halos, coronae, glories and iridescence.',
    tag: '17 entries',
  },
]

function Wayfinding() {
  return (
    <Section className="!pt-4">
      <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-3">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.to} delay={i * 0.06}>
            <Link
              to={s.to}
              className="group flex h-full flex-col bg-deep/80 p-6 transition-colors duration-500 hover:bg-surface sm:p-8"
            >
              <p className="hud-label mb-3 text-cirrus">{s.tag}</p>
              <h3 className="display text-xl text-ink transition-colors group-hover:text-cirrus">
                {s.label}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-cirrus">
                Open
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M2 5.5h7M6 2.5l3 3-3 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Numbers />
      <GeneraGrid />
      <Wayfinding />
    </>
  )
}
