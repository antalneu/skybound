import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FormationDiagram from '../components/FormationDiagram'
import Reveal from '../components/Reveal'
import { DataRow, Flag, PageHeader, Pill, Section } from '../components/ui'
import { LAPSE_RATES, LIFTING, SIZE_SCALE, STABILITY, STEPS } from '../data/formation'
import { useReducedMotion } from '../theme/useReducedMotion'

function StepWalkthrough() {
  const [step, setStep] = useState(0)
  const reduced = useReducedMotion()
  const s = STEPS[step]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_1fr] lg:gap-12">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <FormationDiagram step={step} onStep={setStep} />
      </div>

      <div>
        <motion.div
          key={s.id}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm text-cirrus">{String(s.n).padStart(2, '0')}</span>
            <p className="hud-label">{s.subtitle}</p>
          </div>
          <h3 className="display mt-2 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ink">{s.title}</h3>

          <div className="prose-study mt-4">
            <p>{s.body}</p>
          </div>

          {s.highlight && (
            <p
              className="display mt-6 border-l-2 pl-5 text-lg leading-snug text-ink"
              style={{ borderColor: 'var(--cirrus)' }}
            >
              {s.highlight}
            </p>
          )}

          {s.facts && (
            <dl className="mt-6">
              {s.facts.map((f) => (
                <DataRow key={f.k} label={f.k}>
                  {f.v}
                </DataRow>
              ))}
            </dl>
          )}

          {s.branches && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {s.branches.map((b) => (
                <div key={b.name} className="card rounded-lg p-5">
                  <p className="hud-label mb-1">{b.sub}</p>
                  <p className="display text-lg leading-tight text-ink">{b.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b.text}</p>
                </div>
              ))}
            </div>
          )}

          {s.flag && (
            <div className="mt-6">
              <Flag title="Not a constant" compact>
                {s.flag}
              </Flag>
            </div>
          )}
        </motion.div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => setStep((step - 1 + STEPS.length) % STEPS.length)}
            className="rounded-full border border-hairline px-4 py-2 text-xs font-medium text-ink"
          >
            ← Previous
          </button>
          <button
            onClick={() => setStep((step + 1) % STEPS.length)}
            className="rounded-full bg-cirrus px-4 py-2 text-xs font-medium text-void"
          >
            Next step →
          </button>
          <span className="ml-auto text-xs text-ink-faint">
            {step + 1} of {STEPS.length}
          </span>
        </div>
      </div>
    </div>
  )
}

function SizeScale() {
  const max = SIZE_SCALE[SIZE_SCALE.length - 1].r
  return (
    <div className="card rounded-lg p-6 sm:p-8">
      <p className="hud-label mb-6">Drawn to scale by radius</p>
      <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
        {SIZE_SCALE.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-3">
            <div
              className="rounded-full"
              style={{
                width: s.r * 2,
                height: s.r * 2,
                background: 'var(--cirrus)',
                opacity: 0.2 + (s.r / max) * 0.5,
                border: '1px solid var(--cirrus)',
              }}
            />
            <div className="text-center">
              <p className="font-mono text-xs text-ink">
                {s.microns >= 1000 ? `${s.microns / 1000} mm` : `${s.microns} µm`}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-ink-faint">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-7 border-t border-hairline pt-4 text-sm leading-relaxed text-ink-soft">
        These circles are scaled by radius, not volume — which understates the gap enormously. By
        volume a raindrop is roughly a million times a cloud droplet. If a cloud droplet were the
        size of a pea, the raindrop would be two metres across.
      </p>
    </div>
  )
}

export default function Formation() {
  return (
    <>
      <PageHeader
        eyebrow="Formation science"
        title="Six things have to happen, in order."
        lede="A cloud is not simply cold air. It is the end of a specific chain: air is lifted, expands, cools, saturates, finds something to condense onto, and grows droplets — and then has to solve the separate, harder problem of making those droplets heavy enough to fall."
      />

      <Section className="pt-0">
        <StepWalkthrough />
      </Section>

      <Section
        className="border-t border-hairline"
        eyebrow="Step one, four ways"
        title="Something has to push the air up."
        lede="Cooling in place produces fog. Everything else in the sky begins with lift, and the lifting mechanism leaves its fingerprint on the shape that results."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {LIFTING.map((l, i) => (
            <Reveal key={l.id} delay={i * 0.05}>
              <div className="card h-full rounded-lg p-6">
                <h3 className="display text-xl text-ink">{l.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{l.text}</p>
                <p className="mt-4 border-t border-hairline pt-3 text-xs text-ink-faint">
                  <span className="text-ink-soft">Produces</span> · {l.makes}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        className="border-t border-hairline"
        eyebrow="Lapse rates"
        title="Three numbers that decide the whole sky."
        lede="Two of these are properties of a parcel of air. The third is a property of the atmosphere on the day. Compare them and you can predict whether the sky will layer or tower."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {LAPSE_RATES.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.05}>
              <div className="card h-full rounded-lg p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="hud-label">{r.abbr}</p>
                  <span className="font-mono text-base text-cirrus">{r.display}</span>
                </div>
                <p className="display mt-2 text-xl text-ink">{r.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{r.note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-8 space-y-4">
            {STABILITY.map((s) => (
              <div key={s.id} className="card rounded-lg p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="sm:w-56 sm:shrink-0">
                    <Pill tone={s.tone === 'active' ? 'accent' : 'default'}>{s.condition}</Pill>
                    <h3 className="display mt-3 text-xl leading-tight text-ink">{s.name}</h3>
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed text-ink-soft">{s.text}</p>
                    <p className="mt-3 text-xs text-ink-faint">
                      <span className="text-ink-soft">Produces</span> · {s.makes}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-6">
            <Flag>
              The saturated adiabatic rate above is given as a range on purpose. It is not a constant
              — it runs near 4 °C/km in warm humid air close to the surface and 6–7 °C/km in the
              middle troposphere, because warmer air carries more vapour and so releases more latent
              heat per kilometre climbed. Textbooks that quote a single figure are simplifying.
            </Flag>
          </div>
        </Reveal>
      </Section>

      <Section
        className="border-t border-hairline"
        eyebrow="The size problem"
        title="A million droplets to make one raindrop."
        lede="This is the step that makes cloud physics hard. Condensation builds a cloud droplet quickly and then almost stops, because diffusional growth slows in proportion to the radius. Everything about precipitation is a workaround for that."
      >
        <Reveal>
          <SizeScale />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card rounded-lg p-6">
              <p className="hud-label mb-2">Warm rain</p>
              <h3 className="display text-xl text-ink">Collision–coalescence</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Larger drops fall faster, catch smaller ones, and merge. It needs a spread of droplet
                sizes to get started — giant sea-salt nuclei provide it. This is how a tropical
                maritime cumulus rains without ever forming ice.
              </p>
            </div>
            <div className="card rounded-lg p-6">
              <p className="hud-label mb-2">Cold rain</p>
              <h3 className="display text-xl text-ink">Wegener–Bergeron–Findeisen</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Saturation vapour pressure over ice is lower than over supercooled water. In a
                mixed-phase cloud the air is therefore supersaturated for ice and subsaturated for
                liquid at the same time — so crystals grow while the droplets around them evaporate
                to feed them.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="display mt-8 max-w-2xl text-[clamp(1.3rem,2.6vw,1.8rem)] leading-snug text-ink">
            Most rain in the mid-latitudes begins as snow, and melts on the way down.
          </p>
        </Reveal>
      </Section>

      <Section className="border-t border-hairline">
        <Reveal>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="display text-2xl text-ink">Now put the physics against the shapes.</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                Every genus is a different answer to the same six steps — a different amount of lift,
                at a different altitude, with a different phase of water.
              </p>
            </div>
            <Link
              to="/clouds"
              className="shrink-0 rounded-full bg-cirrus px-5 py-2.5 text-sm font-medium text-void"
            >
              The ten genera
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
