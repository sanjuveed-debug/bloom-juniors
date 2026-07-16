import { motion } from 'framer-motion'

export default function AdventureCompleteBanner({ icon = '🧰' }) {
  return (
    <motion.div
      data-testid="adventure-complete-banner"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="mx-auto mb-5 flex w-full max-w-md items-center gap-3 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-100 p-4 text-left shadow-md"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-sm">{icon}</span>
      <span>
        <span className="block font-bubble text-lg text-amber-950">Adventure complete!</span>
        <span className="block font-round text-sm font-bold text-amber-800">
          This win has powered today’s treasure trail. Return to the map to continue or open the chest.
        </span>
      </span>
    </motion.div>
  )
}
