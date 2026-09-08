import { motion } from 'framer-motion'

// A screen should arrive with a little life, not snap into place. Spring
// physics (rather than a fixed-duration ease) gives it a natural
// overshoot-and-settle instead of mechanical, linear motion.
export default function ScreenEnter({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }}
    >
      {children}
    </motion.div>
  )
}
