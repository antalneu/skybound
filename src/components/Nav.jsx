import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const LINKS = [
  { to: '/explorer', label: 'Explorer', live: true },
  { to: '/clouds', label: 'Classification' },
  { to: '/formation', label: 'Formation' },
  { to: '/phenomena', label: 'Phenomena' },
  { to: '/sources', label: 'Sources' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-cirrus focus:px-4 focus:py-2 focus:text-sm focus:text-void"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-hairline bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-5 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 17a4.2 4.2 0 0 1-.4-8.37A6 6 0 0 1 17 9.9 3.8 3.8 0 0 1 16.6 17H6z"
                fill="none"
                stroke="var(--cirrus)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="display text-[0.98rem] tracking-tight text-ink">Skybound</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-1.5 text-[0.82rem] transition-colors duration-300 ${
                    isActive ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full border border-hairline-lit bg-white/[0.055]"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      {l.label}
                      {l.live && (
                        <span className="live-dot h-1 w-1 rounded-full bg-good" aria-hidden="true" />
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            className="ml-auto rounded-full border border-hairline p-2 text-ink-soft md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
              <path d="M1.5 4h12M1.5 7.5h12M1.5 11h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[55] md:hidden">
            <motion.div
              className="absolute inset-0 bg-void/85 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="glass-strong absolute inset-x-3 top-3 rounded-2xl p-5"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="display text-base text-ink">Skybound</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full border border-hairline p-1.5 text-ink-soft"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col" aria-label="Primary">
                <NavLink to="/" className="display border-b border-hairline py-3 text-xl text-ink">
                  Home
                </NavLink>
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className="display flex items-center gap-2 border-b border-hairline py-3 text-xl text-ink last:border-0"
                  >
                    {l.label}
                    {l.live && <span className="live-dot h-1.5 w-1.5 rounded-full bg-good" />}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
