import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Atmosphere from './components/Atmosphere'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Reference from './pages/Reference'
import GenusDetail from './pages/GenusDetail'
import Formation from './pages/Formation'
import Phenomena from './pages/Phenomena'
import Sources from './pages/Sources'
import StyleGuide from './pages/StyleGuide'
import NotFound from './pages/NotFound'
import { useReducedMotion } from './theme/useReducedMotion'

/**
 * MapLibre is ~800 kB — well over half the bundle — and only the Explorer
 * needs it. Splitting the route keeps every reference page light and defers
 * that cost until someone actually opens the map.
 */
const Explorer = lazy(() => import('./pages/Explorer'))

function ExplorerFallback() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: 'calc(100dvh - 57px)' }}
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-cirrus" />
        <p className="hud-label mt-4">Loading map engine</p>
      </div>
    </div>
  )
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

/**
 * Route transition.
 *
 * The Explorer is excluded on purpose: fading a MapLibre canvas in and out
 * forces a GL context resize mid-transition, which stutters badly. It gets a
 * hard cut and runs its own entrance animation instead.
 */
function Routed() {
  const location = useLocation()
  const reduced = useReducedMotion()
  const isExplorer = location.pathname.startsWith('/explorer')

  const routes = (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route
        path="/explorer"
        element={
          <Suspense fallback={<ExplorerFallback />}>
            <Explorer />
          </Suspense>
        }
      />
      <Route path="/clouds" element={<Reference />} />
      <Route path="/clouds/:id" element={<GenusDetail />} />
      <Route path="/formation" element={<Formation />} />
      <Route path="/phenomena" element={<Phenomena />} />
      <Route path="/sources" element={<Sources />} />
      <Route path="/style-guide" element={<StyleGuide />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )

  if (reduced || isExplorer) return routes

  // Entrance-only, deliberately no AnimatePresence.
  //
  // `mode="wait"` holds the incoming route until the outgoing exit animation
  // finishes — and requestAnimationFrame is paused in a backgrounded tab, so
  // navigating while hidden leaves the exit animation unfinished and the route
  // never swaps. Keying on pathname remounts and plays the entrance, which
  // gives the same feel with no way to deadlock.
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
    >
      {routes}
    </motion.div>
  )
}

function Chrome() {
  const { pathname } = useLocation()
  // The Explorer is a full-viewport instrument; a footer under it would push
  // the map off screen and add a scrollbar to something meant not to scroll.
  const showFooter = !pathname.startsWith('/explorer')
  return (
    <>
      <Nav />
      <main id="main">
        <Routed />
      </main>
      {showFooter && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <>
      <Atmosphere />
      <HashRouter>
        <ScrollToTop />
        <Chrome />
      </HashRouter>
    </>
  )
}
