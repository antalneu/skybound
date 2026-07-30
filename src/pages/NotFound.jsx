import { Link } from 'react-router-dom'
import Photo, { Credit } from '../components/Photo'
import { PHENOMENON_PHOTOS } from '../data/images'

export default function NotFound() {
  const photo = PHENOMENON_PHOTOS.cavum

  return (
    <section className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
      <Photo meta={photo} sizes="(min-width:640px) 42rem, 100vw" aspect="3 / 2" className="rounded-md" />
      <div className="mt-3">
        <Credit meta={photo} />
      </div>

      <p className="hud-label mt-10">Cavum — a hole in the layer</p>
      <h1 className="display mt-3 text-[clamp(1.9rem,4.5vw,2.8rem)] text-ink">
        Nothing at this altitude.
      </h1>
      <p className="prose-study mt-4 text-ink-soft">
        The page you asked for is not here. The cloud above it is — a fallstreak hole, punched
        through a supercooled layer by a passing aircraft.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link to="/" className="rounded-full bg-cirrus px-5 py-2.5 text-sm font-medium text-void">
          Home
        </Link>
        <Link to="/clouds" className="rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-ink">
          The ten genera
        </Link>
      </div>
    </section>
  )
}
