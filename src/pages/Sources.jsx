import Reveal from '../components/Reveal'
import { Flag, PageHeader, Section } from '../components/ui'
import { COLOPHON, FLAGS, SOURCE_GROUPS } from '../data/sources'
import { FEEDBACK, HEIGHT_EFFECT } from '../data/climate'
import { ALL_PHOTOS } from '../data/images'
import manifest from '../data/photo-manifest.json'

function SourceItem({ item }) {
  return (
    <li className="border-b border-hairline py-5 last:border-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="display text-lg text-ink underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          {item.title}
          <svg width="10" height="10" viewBox="0 0 11 11" aria-hidden="true" className="ml-1.5 inline-block opacity-50">
            <path d="M3 8L8 3M8 3H4.2M8 3v3.8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <span className="text-xs text-ink-faint sm:ml-auto sm:shrink-0">{item.org}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.used}</p>
    </li>
  )
}

/** Photograph credits. CC BY and CC BY-SA require attribution — this is it. */
function PhotoCredits() {
  const rows = [...ALL_PHOTOS].sort((a, b) => a.subject.localeCompare(b.subject))
  const missing = rows.filter((r) => !manifest[r.id])

  return (
    <div>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-ink-soft">{COLOPHON.images}</p>

      {missing.length > 0 && (
        <div className="mb-5">
          <Flag title="Photographs not available" compact>
            {missing.length} subject{missing.length === 1 ? '' : 's'} could not be illustrated with a
            suitably licensed photograph and render as a labelled placeholder rather than a
            substituted image: {missing.map((m) => m.subject).join(', ')}.
          </Flag>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-sm">
          <caption className="sr-only">
            Photograph credits: subject, photographer, licence and source file
          </caption>
          <thead>
            <tr className="border-b border-hairline-lit text-left">
              <th scope="col" className="py-2 pr-4 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Subject
              </th>
              <th scope="col" className="py-2 pr-4 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Photographer
              </th>
              <th scope="col" className="py-2 pr-4 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Licence
              </th>
              <th scope="col" className="py-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-hairline align-top">
                <td className="py-2.5 pr-4 text-ink">{r.subject}</td>
                <td className="py-2.5 pr-4 text-ink-soft">{r.artist}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-ink-soft">{r.licence}</td>
                <td className="py-2.5">
                  <a
                    href={r.page}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cirrus underline underline-offset-2"
                  >
                    Commons file page
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Sources() {
  return (
    <>
      <PageHeader
        eyebrow="Sources and uncertainty"
        title="Where all of this came from."
        lede="Nothing here was written from memory. Every altitude, temperature threshold, radiation figure and formation mechanism traces to one of the references below — and where those references disagree with each other, this page says so instead of quietly picking one."
      />

      <Section className="pt-0">
        {SOURCE_GROUPS.map((group, gi) => (
          <Reveal key={group.id} delay={gi * 0.04}>
            <div className="mb-10">
              <div className="mb-2 flex flex-wrap items-baseline gap-3">
                <h2 className="display text-2xl text-ink">{group.label}</h2>
                <span className="text-xs text-ink-faint">{group.items.length} sources</span>
              </div>
              <p className="mb-2 max-w-2xl text-sm text-ink-soft">{group.note}</p>
              <ul>
                {group.items.map((item) => (
                  <SourceItem key={item.title} item={item} />
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </Section>

      <Section
        className="border-t border-hairline"
        eyebrow="Photographs"
        title="Every image, credited."
        id="photos"
      >
        <Reveal>
          <PhotoCredits />
        </Reveal>
      </Section>

      <Section
        className="border-t border-hairline"
        eyebrow="Open questions"
        title="Seven places this reference refuses to round off."
        lede="Some of these are conflicts between reputable sources. Others are genuinely unsettled science. Either way, the honest answer is more useful than a confident one."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {FLAGS.map((f, i) => (
            <Reveal key={f.id} delay={Math.min(i * 0.04, 0.24)}>
              <div className="card h-full rounded-lg p-6">
                <h3 className="display text-lg leading-snug text-ink">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.text}</p>
                <p className="mt-4 border-t border-hairline pt-3 text-xs leading-relaxed text-ink-faint">
                  <span className="text-cirrus">How this reference handles it · </span>
                  {f.resolution}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="border-t border-hairline" eyebrow="The biggest one" title="Cloud feedback." lede={FEEDBACK.headline}>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="prose-study space-y-4">
              <p>
                Two things are easy to conflate here, and conflating them produces a wrong answer.
              </p>
              <p>
                The first is the sign of the cloud radiative effect today, which is negative — clouds
                cool the present climate. The second is the sign of the cloud <em>feedback</em> under
                warming, which depends on how cloud amount, height and optical thickness{' '}
                <strong className="text-ink">change</strong>. The first does not determine the second.
              </p>
              <p>
                Clouds also mask radiative forcing — by roughly 0.7 W/m², reducing effective climate
                sensitivity by on the order of 15%.
              </p>
            </div>

            <div className="mt-6">
              <Flag title="Assessed position, not a settled number">{FEEDBACK.assessed}</Flag>
            </div>

            <div className="card mt-6 rounded-lg p-6">
              <p className="hud-label mb-2">{FEEDBACK.aerosol.title}</p>
              <p className="text-sm leading-relaxed text-ink-soft">{FEEDBACK.aerosol.text}</p>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="card rounded-lg p-6">
              <p className="hud-label mb-5">Why cloud height decides the sign</p>
              <div className="space-y-5">
                {HEIGHT_EFFECT.map((h) => (
                  <div key={h.id} className="border-b border-hairline pb-5 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="display text-lg text-ink">{h.name}</h3>
                      <span className="shrink-0 text-[0.65rem] font-medium uppercase tracking-wider text-ink-faint">
                        {h.effect}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-faint">{h.examples}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{h.text}</p>
                    {h.weight && (
                      <p className="mt-2 text-xs italic leading-relaxed text-ink-faint">{h.weight}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="border-t border-hairline">
        <Reveal>
          <h2 className="display text-2xl text-ink">Colophon</h2>
          <p className="prose-study mt-4 text-ink-soft">{COLOPHON.text}</p>
          <p className="mt-3 text-sm text-ink-faint">{COLOPHON.stack}</p>
          <p className="prose-study mt-6 border-t border-hairline pt-5 text-sm text-ink-soft">
            The classification content follows the WMO International Cloud Atlas, which is the
            international standard. This is an educational reference and is not affiliated with the
            WMO, NASA or NOAA. For forecasts and severe weather warnings, use your national
            meteorological service.
          </p>
        </Reveal>
      </Section>
    </>
  )
}
