import { useState } from 'react'
import {
  AnimatedNumber,
  Button,
  DataRow,
  Flag,
  PageHeader,
  Pill,
  Reveal,
  Section,
  Stat,
  StatusDot,
} from '../components/ui'
import { WIND_RAMP, windColor } from '../data/liveData'

/**
 * Component showcase.
 *
 * Built before the pages were re-skinned, so the visual language could be
 * settled in one place rather than drifting across six pages. Kept in the
 * app (unlinked from the main nav) because it stays useful as a reference
 * when adding anything new.
 */

const SWATCHES = [
  { name: 'void', hex: '#05070d', note: 'Page base' },
  { name: 'deep', hex: '#090d18', note: 'Recessed' },
  { name: 'surface', hex: '#0e1424', note: 'Cards' },
  { name: 'cirrus', hex: '#7cc4f0', note: 'Primary accent — high cloud' },
  { name: 'gold', hex: '#f5b168', note: 'Warning / low sun' },
  { name: 'violet', hex: '#a394d8', note: 'Storm' },
  { name: 'good', hex: '#6fd3a8', note: 'Live status' },
  { name: 'danger', hex: '#ff8a76', note: 'Error' },
]

function Row({ title, children, note }) {
  return (
    <div className="border-t border-hairline py-8">
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h3 className="display text-lg text-ink">{title}</h3>
        {note && <p className="text-xs text-ink-faint">{note}</p>}
      </div>
      {children}
    </div>
  )
}

export default function StyleGuide() {
  const [n, setN] = useState(12.4)

  return (
    <>
      <PageHeader
        eyebrow="Internal — design system"
        title="Component showcase."
        lede="The visual language in one place: palette, type scale, glass surfaces, HUD instruments and motion. Built first so the rest of the site had something to be consistent with."
      />

      <Section className="pt-0">
        <Row title="Palette" note="Accents are sky states, not UI colours">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SWATCHES.map((s) => (
              <div key={s.name} className="card overflow-hidden rounded-lg">
                <div className="h-16 w-full" style={{ background: s.hex }} />
                <div className="p-3">
                  <p className="hud-value text-xs text-ink">{s.name}</p>
                  <p className="hud-value mt-0.5 text-[0.65rem] text-ink-faint">{s.hex}</p>
                  <p className="mt-1 text-[0.65rem] leading-snug text-ink-faint">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Row>

        <Row title="Type" note="Space Grotesk display · Inter body · JetBrains Mono data">
          <div className="space-y-4">
            <p className="display-lg text-[clamp(2rem,5vw,3.4rem)] text-ink">
              Cumulonimbus capillatus incus
            </p>
            <p className="display text-2xl text-ink">Display — section heading</p>
            <p className="hud-label">HUD LABEL — INSTRUMENT FIELD</p>
            <p className="hud-value text-xl text-cirrus">14.7 m/s · 284° · 63%</p>
            <p className="prose-study text-ink-soft">
              Body copy sits at a 68-character measure with 1.75 leading. Long-form reference
              text has to survive a dark background, so it runs a little lighter in weight and
              a little looser than it would on paper.
            </p>
            <p className="latin text-ink-faint">Altocumulus stratiformis translucidus undulatus</p>
          </div>
        </Row>

        <Row title="Surfaces" note="Glass over imagery, cards over nothing">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass rounded-xl p-5">
              <p className="hud-label mb-2">.glass</p>
              <p className="text-sm text-ink-soft">
                Blur plus a top inset highlight. For overlays on the map and imagery.
              </p>
            </div>
            <div className="glass-strong rounded-xl p-5">
              <p className="hud-label mb-2">.glass-strong</p>
              <p className="text-sm text-ink-soft">
                Heavier and more opaque — sheets and dialogs that must stay readable.
              </p>
            </div>
            <div className="card rounded-xl p-5">
              <p className="hud-label mb-2">.card</p>
              <p className="text-sm text-ink-soft">
                Solid gradient. For long-form reading, where blur costs more than it gives.
              </p>
            </div>
          </div>
        </Row>

        <Row title="Instruments" note="Tabular numerals so digits don't jitter">
          <div className="glass grid grid-cols-2 gap-5 rounded-xl p-5 sm:grid-cols-4">
            <Stat label="Wind" value={<AnimatedNumber value={n} decimals={1} />} unit="m/s" tone="cirrus" />
            <Stat label="Cloud" value={<AnimatedNumber value={n * 5} decimals={0} />} unit="%" tone="violet" />
            <Stat label="Temp" value={<AnimatedNumber value={n * 1.4} decimals={1} />} unit="°C" tone="gold" />
            <Stat label="Bearing" value="WSW 248" unit="°" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => setN(Math.random() * 30)}>Randomise values</Button>
            <Button tone="ghost" onClick={() => setN(0)}>
              Zero
            </Button>
          </div>
        </Row>

        <Row title="Status" note="Every data-backed panel reports its own state">
          <div className="flex flex-wrap gap-6">
            <StatusDot status="live" />
            <StatusDot status="loading" />
            <StatusDot status="cached" />
            <StatusDot status="error" />
          </div>
        </Row>

        <Row title="Pills">
          <div className="flex flex-wrap gap-2">
            <Pill>Default</Pill>
            <Pill tone="accent">High étage</Pill>
            <Pill tone="gold">New 2017</Pill>
            <Pill tone="violet">Vertical extent</Pill>
            <Pill tone="quiet">Quiet</Pill>
          </div>
        </Row>

        <Row title="Wind ramp" note="Tuned so ordinary winds are not all one colour">
          <div
            className="h-3 w-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${WIND_RAMP.map(
                (s) => `rgb(${s.c.join(',')}) ${(s.at / 34) * 100}%`,
              ).join(', ')})`,
            }}
          />
          <div className="mt-2 flex flex-wrap gap-4">
            {[2, 6, 11, 16, 22, 30].map((v) => (
              <span key={v} className="hud-value text-xs" style={{ color: `rgb(${windColor(v).join(',')})` }}>
                {v} m/s
              </span>
            ))}
          </div>
        </Row>

        <Row title="Data rows">
          <dl className="max-w-2xl">
            <DataRow label="Base height">1.5–6 km (4,900–19,700 ft)</DataRow>
            <DataRow label="Composition">Water droplets, often supercooled</DataRow>
            <DataRow label="Precipitation">Virga; rarely reaching the ground</DataRow>
          </dl>
        </Row>

        <Row title="Uncertainty note" note="Used wherever sources conflict or science is open">
          <Flag title="Where the sources disagree">
            NOAA's own publications put the high/middle étage boundary at 15,000 ft in one place
            and 20,000 ft in another. This site quotes the WMO latitude table as primary and
            notes the US shorthand rather than picking a winner.
          </Flag>
        </Row>

        <Row title="Reveal" note="10px, once, disabled under prefers-reduced-motion">
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="card rounded-lg p-5 text-sm text-ink-soft">
                  Staggered by {(i * 0.08).toFixed(2)}s
                </div>
              </Reveal>
            ))}
          </div>
        </Row>
      </Section>
    </>
  )
}
