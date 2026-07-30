import Photo, { Credit } from '../components/Photo'
import Reveal from '../components/Reveal'
import { Flag, PageHeader, Pill, Section } from '../components/ui'
import { OPTICS, RARE, RARITY } from '../data/phenomena'
import { OPTIC_PHOTOS, PHENOMENON_PHOTOS } from '../data/images'

/**
 * A reading layout, not a gallery of thumbnails behind modals. Each entry is a
 * complete reference in place: photograph, what you see, the physics, and the
 * caveat where there is one.
 */
function Entry({ item, photo, index }) {
  // Alternate sides on wide screens so a long run of entries has rhythm
  const flip = index % 2 === 1
  return (
    <article className="border-t border-hairline py-10 first:border-t-0 first:pt-0">
      <div
        className={`grid gap-6 lg:grid-cols-2 lg:gap-12 ${flip ? 'lg:[&>figure]:order-2' : ''}`}
      >
        <figure>
          <Photo
            meta={photo}
            sizes="(min-width:1024px) 34rem, 100vw"
            aspect="3 / 2"
            className="rounded-md"
          />
          <figcaption className="mt-3 flex flex-col gap-1">
            {photo?.caption && (
              <span className="text-sm leading-relaxed text-ink-soft">{photo.caption}</span>
            )}
            <Credit meta={photo} />
          </figcaption>
        </figure>

        <div className="lg:pt-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {item.rarity && <Pill tone={item.rarity === 'rare' ? 'accent' : 'quiet'}>{RARITY[item.rarity]?.label}</Pill>}
            {item.altitude && <Pill tone="quiet">{item.altitude}</Pill>}
            {item.agent && (
              <Pill tone="quiet">
                {item.agent === 'ice'
                  ? 'Ice — refraction'
                  : item.agent === 'water'
                    ? 'Droplets — diffraction'
                    : 'Aerosol — scattering'}
              </Pill>
            )}
          </div>

          <h3 className="display text-[clamp(1.5rem,3vw,2.1rem)] text-ink">{item.name}</h3>
          {item.latin && <p className="latin mt-1 text-sm text-ink-faint">{item.latin}</p>}
          {item.host && <p className="mt-1 text-xs text-ink-faint">Usually seen on {item.host}</p>}
          {item.when && <p className="mt-1 text-xs text-ink-faint">{item.when}</p>}

          <div className="prose-study mt-5 space-y-4">
            <div>
              <p className="hud-label mb-1.5">What you see</p>
              <p>{item.what}</p>
            </div>
            <div>
              <p className="hud-label mb-1.5">The physics</p>
              <p>{item.physics}</p>
            </div>
          </div>

          {item.contrast && (
            <div className="mt-5">
              <Flag title="How to tell it from a halo" compact>
                {item.contrast}
              </Flag>
            </div>
          )}

          {item.unsettled && (
            <div className="mt-5">
              <Flag title="Genuinely unresolved" compact>
                The mechanism is not established in the literature. This entry describes an open
                question rather than inventing a tidy cause for it.
              </Flag>
            </div>
          )}

          {item.aside && (
            <p
              className="mt-5 border-l-2 pl-4 text-sm italic leading-relaxed text-ink-soft"
              style={{ borderColor: 'var(--hairline-lit)' }}
            >
              {item.aside}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Phenomena() {
  return (
    <>
      <PageHeader
        eyebrow="Special & optical phenomena"
        title="Outside the ordinary troposphere."
        lede="Clouds that form eighty kilometres up, clouds that stand still in a gale, clouds nobody can yet fully explain — and the small set of optical effects that turn ordinary ice and water into geometry."
      />

      <Section className="pt-0" id="rare">
        <Reveal className="mb-8 max-w-2xl">
          <h2 className="display text-[clamp(1.5rem,3vw,2.1rem)] text-ink">Rare and special clouds</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Some of these are rare because the conditions are extreme. Others are common but almost
            never noticed, which is its own kind of rare.
          </p>
        </Reveal>

        {RARE.map((item, i) => (
          <Entry key={item.id} item={item} photo={PHENOMENON_PHOTOS[item.id]} index={i} />
        ))}
      </Section>

      <Section className="border-t border-hairline" id="optics">
        <Reveal className="mb-8 max-w-2xl">
          <p className="hud-label mb-3">Atmospheric optics</p>
          <h2 className="display text-[clamp(1.5rem,3vw,2.1rem)] text-ink">Ice refracts. Water diffracts.</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            That single distinction sorts almost every optical effect in the sky, and the giveaway is
            the order of the colours. A halo runs red on the inside. A corona runs red on the outside.
            Once you know which way round to look, you can tell what a cloud is made of from the
            ground.
          </p>
        </Reveal>

        <Reveal className="mb-10">
          <div className="grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2">
            <div className="bg-deep p-6">
              <p className="hud-label mb-2" style={{ color: 'var(--cirrus)' }}>
                Refraction — ice crystals
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">
                Light passes <em>through</em> hexagonal ice prisms and bends by a fixed minimum
                angle. That fixed angle is why halos have a sharp inner edge and always the same
                radius. Red appears on the <strong className="text-ink">inside</strong>.
              </p>
            </div>
            <div className="bg-deep p-6">
              <p className="hud-label mb-2" style={{ color: 'var(--cirrus)' }}>
                Diffraction — water droplets
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">
                Light bends <em>around</em> droplets and the bent waves interfere. Ring size depends
                on droplet size, so a corona is a direct readout of it. Red appears on the{' '}
                <strong className="text-ink">outside</strong>.
              </p>
            </div>
          </div>
        </Reveal>

        {OPTICS.map((item, i) => (
          <Entry key={item.id} item={item} photo={OPTIC_PHOTOS[item.id]} index={i} />
        ))}
      </Section>
    </>
  )
}
