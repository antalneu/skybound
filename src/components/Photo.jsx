import { useState } from 'react'
import manifest from '../data/photo-manifest.json'

/**
 * Photograph rendering.
 *
 * Images are vendored locally by scripts/fetch-photos.mjs (Wikimedia
 * rate-limits hotlinking), which also writes photo-manifest.json holding each
 * image's real dimensions, available widths, and a 24px inline placeholder.
 *
 * The manifest is the source of truth for whether an image exists. If an entry
 * is missing — a download failed, or a subject genuinely has no good free photo
 * — this renders a labelled placeholder rather than a broken image or, worse, a
 * substituted photo of something else. The brief asks for that explicitly, and
 * for study material a wrong photo is worse than no photo.
 */

function Placeholder({ subject, reason, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-deep p-6 text-center ${className}`}
      style={{ border: '1px dashed var(--hairline-lit)' }}
      role="img"
      aria-label={`No photograph available for ${subject}`}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="text-ink-faint">
        <rect x="2.5" y="4.5" width="17" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="9" r="1.6" fill="currentColor" opacity="0.6" />
        <path d="M4 15l4.2-4 3 2.6L15 10l3 4.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-xs font-medium text-ink-soft">No free-licensed photograph</p>
      <p className="max-w-xs text-[0.7rem] leading-relaxed text-ink-faint">
        {reason ?? `Nothing suitable was found for ${subject} under a reusable licence.`}
      </p>
    </div>
  )
}

/**
 * @param {object}  meta     entry from data/images.js (needs id, alt)
 * @param {string}  sizes    responsive sizes attribute
 * @param {boolean} priority true for above-the-fold images — skips lazy loading
 * @param {string}  aspect   CSS aspect-ratio; defaults to the real one
 */
export default function Photo({
  meta,
  sizes = '100vw',
  priority = false,
  aspect,
  className = '',
  imgClassName = '',
}) {
  const [loaded, setLoaded] = useState(false)
  const entry = meta && manifest[meta.id]

  if (!entry) {
    return (
      <Placeholder
        subject={meta?.subject ?? meta?.id ?? 'this subject'}
        className={className}
      />
    )
  }

  const srcSet = entry.widths.map((w) => `/photos/${meta.id}-${w}.webp ${w}w`).join(', ')
  const ratio = aspect ?? `${entry.width} / ${entry.height}`

  return (
    <div className={`figure-frame ${className}`} style={{ aspectRatio: ratio }}>
      {/* Blurred 24px placeholder holds the space and the colour while the
          real file arrives. Hidden once loaded so it never softens the photo. */}
      {!loaded && <img src={entry.lqip} alt="" aria-hidden="true" className="figure-lqip" />}
      <picture>
        <source type="image/webp" srcSet={srcSet} sizes={sizes} />
        <img
          src={`/photos/${meta.id}.jpg`}
          alt={meta.alt}
          width={entry.width}
          height={entry.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          data-loaded={loaded}
          className={`figure-img ${imgClassName}`}
        />
      </picture>
    </div>
  )
}

/** Credit line. CC BY and CC BY-SA both require it, so it is never optional. */
export function Credit({ meta, className = '' }) {
  if (!meta) return null
  return (
    <span className={`text-[0.7rem] leading-relaxed text-ink-faint ${className}`}>
      <a
        href={meta.page}
        target="_blank"
        rel="noreferrer"
        className="underline decoration-line underline-offset-2 hover:text-ink-soft"
      >
        {meta.artist}
      </a>
      {' · '}
      {meta.licence}
      {' · Wikimedia Commons'}
    </span>
  )
}

/** Photo with its caption and credit — the standard unit on every page. */
export function Figure({ meta, sizes, priority, aspect, className = '', showCaption = true }) {
  if (!meta) return null
  return (
    <figure className={className}>
      <Photo meta={meta} sizes={sizes} priority={priority} aspect={aspect} />
      {showCaption && (
        <figcaption className="mt-3 flex flex-col gap-1">
          {meta.caption && (
            <span className="text-sm leading-relaxed text-ink-soft">{meta.caption}</span>
          )}
          <Credit meta={meta} />
        </figcaption>
      )}
    </figure>
  )
}

/** True when a photo actually exists — lets pages lay out around gaps. */
export function hasPhoto(meta) {
  return Boolean(meta && manifest[meta.id])
}
