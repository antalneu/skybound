import { useEffect, useState } from 'react'

/**
 * Tracks prefers-reduced-motion, and keeps tracking it — flipping the OS
 * setting mid-session takes effect immediately.
 *
 * CSS covers the declarative animations (see index.css). This hook is for the
 * cases CSS cannot reach: components that should render their final state
 * directly rather than transitioning into it.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
