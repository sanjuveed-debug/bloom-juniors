import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Kid-safe premium lock: no checkout here — points to the Parent Zone.
export default function PremiumLockModal({ show, moduleLabel, theme, onClose, onParentZone }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="bg-white rounded-3xl p-7 text-center max-w-xs w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1 }}
              className="text-6xl mb-3"
            >👑</motion.div>
            <h2 className="font-bubble text-2xl mb-1" style={{ color: theme?.primary || '#8B5CF6' }}>
              Premium Adventure!
            </h2>
            <p className="font-round text-sm text-gray-600 mb-5 leading-relaxed">
              {moduleLabel ? `${moduleLabel} is` : 'This is'} part of Bloom Premium.
              Ask a grown-up to unlock the full library in the Parent Zone.
            </p>
            {onParentZone && (
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={onParentZone}
                className="w-full py-3.5 rounded-2xl font-bubble text-white text-base mb-2 shadow"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                👨‍👩‍👧 Open Parent Zone
              </motion.button>
            )}
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl font-round text-sm font-bold text-gray-500 bg-gray-100">
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
