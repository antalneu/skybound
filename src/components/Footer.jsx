import { Link } from 'react-router-dom'
import { COLOPHON } from '../data/sources'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="display text-xl text-ink">Skybound</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">{COLOPHON.text}</p>
          </div>

          <nav aria-label="Footer">
            <p className="hud-label mb-3">Reference</p>
            <ul className="space-y-2 text-sm">
              {[
                ['/clouds', 'Classification'],
                ['/formation', 'Formation science'],
                ['/phenomena', 'Special & optical'],
                ['/sources', 'Sources'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-ink-soft transition-colors hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="hud-label mb-3">Grounded in</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>WMO International Cloud Atlas</li>
              <li>NASA — CERES, Earth Observatory</li>
              <li>NOAA — JetStream, NWS, GFDL</li>
              <li>Photographs: Wikimedia Commons</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-hairline pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>{COLOPHON.stack}</p>
          <p>
            Educational reference. For forecasts and warnings, use your national meteorological
            service.
          </p>
        </div>
      </div>
    </footer>
  )
}
