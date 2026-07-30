import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Photo from '../components/Photo'
import Reveal from '../components/Reveal'
import AltitudeScale from '../components/AltitudeScale'
import { PageHeader, Pill, Section } from '../components/ui'
import { COMPOSITIONS, ETAGES, GENERA, etageOf } from '../data/genera'
import { TAXONOMY_GROUPS } from '../data/taxonomy'
import { GENUS_PHOTOS } from '../data/images'

const ETAGE_FILTERS = [
  { id: 'all', label: 'All levels' },
  { id: 'high', label: 'High' },
  { id: 'middle', label: 'Middle' },
  { id: 'low', label: 'Low' },
  { id: 'vertical', label: 'Vertical extent' },
]

const COMP_FILTERS = [
  { id: 'all', label: 'Any' },
  { id: 'ice', label: 'Ice' },
  { id: 'mixed', label: 'Mixed phase' },
  { id: 'water', label: 'Water' },
]

function FilterRow({ label, options, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="hud-label w-full sm:w-20">{label}</span>
      <div className="flex flex-wrap gap-0.5 rounded-full border border-hairline p-0.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={value === o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              value === o.id ? 'bg-cirrus text-void' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** One genus, laid out as a reference entry rather than a marketing card. */
function GenusEntry({ genus }) {
  const photo = GENUS_PHOTOS[genus.id]?.[0]
  return (
    <article className="grid gap-5 border-t border-hairline py-8 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
      <Link to={`/clouds/${genus.id}`} className="group block">
        <Photo
          meta={photo}
          sizes="(min-width:640px) 15rem, 100vw"
          aspect="4 / 3"
          className="rounded-md"
          imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </Link>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pill tone="quiet">{ETAGES[genus.etage].label}</Pill>
          <Pill tone="quiet">{COMPOSITIONS[genus.composition].label}</Pill>
          {genus.verticalExtent && <Pill tone="quiet">Vertical extent</Pill>}
        </div>

        <h2 className="display text-2xl text-ink">
          <Link to={`/clouds/${genus.id}`} className="hover:text-cirrus">
            {genus.name}
          </Link>
          <span className="ml-2 font-mono text-sm text-ink-faint">{genus.abbr}</span>
        </h2>
        <p className="latin mt-0.5 text-sm text-ink-faint">{genus.etymology}</p>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{genus.definition}</p>

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs">
          <div>
            <dt className="text-ink-faint">Base</dt>
            <dd className="mt-0.5 font-mono text-ink-soft">
              {genus.baseKm[0]}–{genus.baseKm[1]} km
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Reaches</dt>
            <dd className="mt-0.5 font-mono text-ink-soft">{genus.topKm} km</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Precipitation</dt>
            <dd className="mt-0.5 text-ink-soft">{genus.precipitation}</dd>
          </div>
        </dl>

        <Link
          to={`/clouds/${genus.id}`}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-cirrus"
        >
          Full entry
          <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
            <path d="M2 5.5h7M6 2.5l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  )
}

function TaxonomyTable() {
  const [open, setOpen] = useState('species')
  const group = TAXONOMY_GROUPS.find((g) => g.id === open)

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-hairline pb-3" role="tablist" aria-label="Taxonomy levels">
        {TAXONOMY_GROUPS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={open === g.id}
            onClick={() => setOpen(g.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              open === g.id ? 'bg-cirrus text-void' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {g.label}
            <span className="ml-1.5 opacity-60">{g.items.length}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-sm text-ink-soft">
          <span className="text-ink">{group.describes}.</span> {group.rule}
        </p>
        <dl className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {group.items.map((item) => (
            <div key={item.id} className="border-t border-hairline pt-3">
              <dt className="flex flex-wrap items-baseline gap-2">
                <span className="latin text-base text-ink">{item.id}</span>
                {item.abbr && <span className="font-mono text-[0.7rem] text-ink-faint">{item.abbr}</span>}
                <span className="text-xs text-ink-faint">— {item.gloss}</span>
                {item.newIn2017 && <Pill tone="accent">New 2017</Pill>}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export default function Reference() {
  const [etage, setEtage] = useState('all')
  const [comp, setComp] = useState('all')

  const results = useMemo(
    () =>
      GENERA.filter(
        (g) =>
          (etage === 'all' || etageOf(g) === etage) && (comp === 'all' || g.composition === comp),
      ),
    [etage, comp],
  )

  const filtered = etage !== 'all' || comp !== 'all'

  return (
    <>
      <PageHeader
        eyebrow="Classification reference"
        title="The ten genera."
        lede="The WMO classification is hierarchical and borrowed from biology: a cloud is named by genus, narrowed by species and variety, and annotated with supplementary features. Around a hundred combinations occur in practice."
      />

      <Section className="pt-0">
        <Reveal>
          <div className="flex flex-col gap-3 rounded-lg border border-hairline p-4">
            <FilterRow label="Altitude" options={ETAGE_FILTERS} value={etage} onChange={setEtage} />
            <FilterRow label="Made of" options={COMP_FILTERS} value={comp} onChange={setComp} />
            <div className="flex items-center justify-between border-t border-hairline pt-3">
              <p className="text-xs text-ink-faint" role="status" aria-live="polite">
                Showing {results.length} of {GENERA.length}
                {etage !== 'all' && ` · ${ETAGES[etage].blurb}`}
              </p>
              {filtered && (
                <button
                  onClick={() => {
                    setEtage('all')
                    setComp('all')
                  }}
                  className="text-xs text-cirrus underline underline-offset-4"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-4">
          {results.length === 0 ? (
            <p className="border-t border-hairline py-16 text-center text-sm text-ink-soft">
              No genus matches that combination. There are only ten, so the filters run out quickly.
            </p>
          ) : (
            results.map((g) => <GenusEntry key={g.id} genus={g} />)
          )}
        </div>
      </Section>

      <Section
        className="border-t border-hairline"
        eyebrow="By altitude"
        title="Filed by base, not by size."
        lede="Composition tracks height closely: everything above about 6 km is pure ice, everything below about 2 km is liquid water, and the middle étage is where both coexist. That mixed-phase zone is where most precipitation is manufactured."
      >
        <Reveal>
          <AltitudeScale />
        </Reveal>
      </Section>

      <Section
        className="border-t border-hairline"
        eyebrow="The rest of the system"
        title="Species, varieties, features."
        lede="Genus is only the first term. Species describes shape and internal structure, variety describes transparency and arrangement, and supplementary features name the structures attached to a cloud. The 2017 revision — the first in thirty years — added one species and five supplementary features."
      >
        <Reveal>
          <TaxonomyTable />
        </Reveal>
      </Section>
    </>
  )
}
