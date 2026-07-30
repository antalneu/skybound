import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Photo, { Credit, Figure } from '../components/Photo'
import Reveal from '../components/Reveal'
import NotFound from './NotFound'
import { DataRow, Flag, Pill } from '../components/ui'
import { COMPOSITIONS, ETAGES, GENERA, GENERA_BY_ID, etageOf } from '../data/genera'
import { TERM_BY_ID } from '../data/taxonomy'
import { GENUS_PHOTOS } from '../data/images'

/** A taxonomy term that expands to its definition in place. */
function TermList({ label, ids, note }) {
  const [open, setOpen] = useState(null)

  if (!ids || ids.length === 0) {
    return (
      <div>
        <p className="hud-label mb-2">{label}</p>
        <p className="text-sm italic text-ink-faint">
          None — this genus takes no {label.toLowerCase()}.
        </p>
      </div>
    )
  }

  const term = open ? TERM_BY_ID[open] : null

  return (
    <div>
      <p className="hud-label mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const t = TERM_BY_ID[id]
          if (!t) return null
          const isOpen = open === id
          return (
            <button
              key={id}
              onClick={() => setOpen(isOpen ? null : id)}
              aria-expanded={isOpen}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                isOpen ? 'border-transparent bg-cirrus text-void' : 'border-hairline text-ink-soft hover:text-ink'
              }`}
            >
              <span className="latin">{t.id}</span>
              {t.newIn2017 && <span className="ml-1.5 opacity-70">2017</span>}
            </button>
          )
        })}
      </div>
      {term && (
        <div className="mt-3 rounded-md border border-hairline bg-surface p-4">
          <p className="mb-1 text-sm">
            <span className="latin text-ink">{term.id}</span>
            <span className="ml-2 text-xs text-ink-faint">— {term.gloss}</span>
          </p>
          <p className="text-sm leading-relaxed text-ink-soft">{term.text}</p>
          {term.unsettled && (
            <p className="mt-2 text-xs" style={{ color: 'var(--cirrus)' }}>
              Mechanism unresolved in the literature.
            </p>
          )}
        </div>
      )}
      {note && <p className="mt-2 text-xs text-ink-faint">{note}</p>}
    </div>
  )
}

export default function GenusDetail() {
  const { id } = useParams()
  const genus = GENERA_BY_ID[id]

  if (!genus) return <NotFound />

  const idx = GENERA.findIndex((g) => g.id === id)
  const prev = GENERA[(idx - 1 + GENERA.length) % GENERA.length]
  const next = GENERA[(idx + 1) % GENERA.length]
  // The WMO étage, not the explorer's filter bucket — `etageOf` folds the two
  // vertical-extent genera into their own group, which is right for filtering
  // but would print "Vertical extent" twice here.
  const etage = ETAGES[genus.etage]
  // `confusion.with` is a display label and may carry a species — Cumulonimbus
  // is confused with "Cumulus congestus", not with the bare genus. Every genus
  // name is a single word, so the first token resolves it exactly.
  const confused = GENERA.find((g) => genus.confusion.with.split(' ')[0] === g.name)

  const photos = GENUS_PHOTOS[genus.id] ?? []
  const [lead, ...rest] = photos
  const confusedPhoto = confused ? GENUS_PHOTOS[confused.id]?.[0] : null

  return (
    <article>
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <Link
          to="/clouds"
          className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
            <path d="M8 2.5L4 6.5l4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All genera
        </Link>
      </div>

      <header className="mx-auto max-w-6xl px-5 pb-8 pt-5 sm:px-8">
        <Reveal>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pill tone="accent">{etage.label}</Pill>
            <Pill>{COMPOSITIONS[genus.composition].label}</Pill>
            {genus.verticalExtent && <Pill>Vertical extent</Pill>}
          </div>
          <h1 className="display text-[clamp(2.4rem,6vw,4rem)] text-ink">
            {genus.name}
            <span className="ml-3 font-mono text-lg text-ink-faint">{genus.abbr}</span>
          </h1>
          <p className="latin mt-2 text-lg text-ink-soft">{genus.etymology}</p>
        </Reveal>
      </header>

      {/* Lead photograph, full width — the primary reference for this genus */}
      {lead && (
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Photo meta={lead} priority sizes="(min-width:1280px) 72rem, 100vw" aspect="16 / 9" className="rounded-md" />
            <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{lead.caption}</p>
              <Credit meta={lead} className="shrink-0" />
            </div>
          </Reveal>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div className="space-y-10">
            <Reveal>
              <figure>
                <p className="hud-label mb-3">WMO definition</p>
                <blockquote className="display border-l-2 pl-5 text-[clamp(1.15rem,2.2vw,1.5rem)] leading-snug text-ink" style={{ borderColor: 'var(--cirrus)' }}>
                  {genus.definition}
                </blockquote>
              </figure>
            </Reveal>

            <Reveal>
              <h2 className="display mb-3 text-2xl text-ink">What you see</h2>
              <div className="prose-study">
                <p>{genus.look}</p>
              </div>
            </Reveal>

            <Reveal>
              <h2 className="display mb-3 text-2xl text-ink">How it forms</h2>
              <div className="prose-study">
                <p>{genus.physics}</p>
              </div>
            </Reveal>

            <Reveal>
              <h2 className="display mb-3 text-2xl text-ink">What it tells you</h2>
              <div className="prose-study">
                <p>{genus.tells}</p>
              </div>
            </Reveal>

            {/* Side-by-side with the lookalike — the most useful thing a cloud
                guide can show, and the reason both photos are here at once. */}
            <Reveal>
              <h2 className="display mb-3 text-2xl text-ink">Telling it apart</h2>
              <div className="rounded-lg border border-hairline p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <figure>
                    <Photo meta={lead} sizes="(min-width:640px) 22rem, 100vw" aspect="3 / 2" className="rounded" />
                    <figcaption className="mt-2 text-xs text-ink-soft">
                      <span className="text-ink">{genus.name}</span> — this page
                    </figcaption>
                  </figure>
                  <figure>
                    <Link to={confused ? `/clouds/${confused.id}` : '/clouds'}>
                      <Photo meta={confusedPhoto} sizes="(min-width:640px) 22rem, 100vw" aspect="3 / 2" className="rounded" />
                    </Link>
                    <figcaption className="mt-2 text-xs text-ink-soft">
                      <Link to={confused ? `/clouds/${confused.id}` : '/clouds'} className="text-ink hover:text-cirrus">
                        {genus.confusion.with}
                      </Link>{' '}
                      — the confusion
                    </figcaption>
                  </figure>
                </div>
                <p className="mt-4 border-t border-hairline pt-4 text-sm leading-relaxed text-ink-soft">
                  {genus.confusion.how}
                </p>
              </div>
            </Reveal>

            {rest.length > 0 && (
              <Reveal>
                <h2 className="display mb-4 text-2xl text-ink">More references</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {rest.map((p) => (
                    <Figure
                      key={p.id}
                      meta={p}
                      sizes="(min-width:640px) 22rem, 100vw"
                      aspect="3 / 2"
                      className="[&_.figure-frame]:rounded"
                    />
                  ))}
                </div>
              </Reveal>
            )}

            {genus.heightNote && (
              <Reveal>
                <Flag title="Classified differently depending on who you ask">
                  {genus.heightNote}
                </Flag>
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={0.05}>
              <div className="card rounded-lg p-6">
                <p className="hud-label mb-4">At a glance</p>
                <dl>
                  <DataRow label="Étage">
                    {etage.label}
                    {genus.verticalExtent && ' (base) — vertical extent'}
                  </DataRow>
                  <DataRow label="Base height">
                    {genus.baseKm[0]}–{genus.baseKm[1]} km{' '}
                    <span className="text-ink-faint">
                      ({Math.round(genus.baseKm[0] * 3281).toLocaleString()}–
                      {Math.round(genus.baseKm[1] * 3281).toLocaleString()} ft)
                    </span>
                  </DataRow>
                  <DataRow label="Reaches">{genus.topKm} km</DataRow>
                  <DataRow label="Composition">{genus.compositionLabel}</DataRow>
                  <DataRow label="Temperature">{genus.tempRange}</DataRow>
                  <DataRow label="Precipitation">{genus.precipitation}</DataRow>
                </dl>
                <p className="mt-4 border-t border-hairline pt-3 text-xs leading-relaxed text-ink-faint">
                  Heights are WMO temperate-latitude values, measured above ground level. They run
                  higher in the tropics and lower toward the poles.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="card mt-5 space-y-6 rounded-lg p-6">
                <p className="hud-label">Commonly observed with</p>
                <TermList label="Species" ids={genus.species} note="At most one per cloud." />
                <TermList
                  label="Varieties"
                  ids={genus.varieties}
                  note="Several may apply at once; the opacity varieties exclude each other."
                />
                <TermList label="Supplementary features" ids={genus.features} />
                <TermList label="Accessory clouds" ids={genus.accessory} />
                <p className="border-t border-hairline pt-3 text-xs leading-relaxed text-ink-faint">
                  These are the combinations commonly recorded — the Atlas admits rarer ones. Not a
                  closed set.
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <nav className="mx-auto max-w-6xl border-t border-hairline px-5 py-8 sm:px-8" aria-label="Genus navigation">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { g: prev, dir: 'Previous', align: '' },
            { g: next, dir: 'Next', align: 'sm:text-right' },
          ].map(({ g, dir, align }) => (
            <Link key={dir} to={`/clouds/${g.id}`} className={`group ${align}`}>
              <p className="hud-label mb-1">{dir}</p>
              <p className="display text-xl text-ink group-hover:text-cirrus">{g.name}</p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {ETAGES[g.etage].label} · {g.abbr}
              </p>
            </Link>
          ))}
        </div>
      </nav>
    </article>
  )
}
