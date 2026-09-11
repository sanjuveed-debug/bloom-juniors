import { motion, useReducedMotion } from 'framer-motion'

// Keep the learning scene stable as navigation changes the screen.
export default function ScreenEnter({ children }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: reduceMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.12 }}
    >
      {children}
    </motion.div>
  )
}
