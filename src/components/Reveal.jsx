import { motion } from 'framer-motion'
import { useReducedMotion } from '../theme/useReducedMotion'

/**
 * Scroll reveal. 10px of travel, once only, on a long ease-out.
 *
 * This is reference material — motion here is to soften arrival, not to
 * perform. Anything larger reads as a slideshow on a long page.
 *
 * Under reduced motion the children render immediately and statically, so
 * content can never be stranded invisible if an observer never fires.
 */
export default function Reveal({ children, delay = 0, y = 10, className = '', as = 'div' }) {
  const reduced = useReducedMotion()

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  const MotionTag = motion[as] ?? motion.div

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  )
}
