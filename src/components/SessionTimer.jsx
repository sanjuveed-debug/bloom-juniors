import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * SessionTimer — a friendly countdown timer for kids' sessions.
 *
 * Props:
 *   sessionMinutes  — total session length (default 30)
 *   profileName     — child's name for personalised messages
 *   onTimeUp        — called once when countdown reaches 0
 *   theme           — THEMES[avatar] object for colours
 */
export default function SessionTimer({ sessionMinutes = 30, profileName, onTimeUp, theme }) {
  const totalSecs = sessionMinutes * 60
  const [remaining, setRemaining] = useState(totalSecs)
  const [expired, setExpired] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const calledRef = useRef(false)
  const startRef = useRef(Date.now())

  // Re-start if sessionMinutes changes (parent changes the setting)
  useEffect(() => {
    setRemaining(sessionMinutes * 60)
    setExpired(false)
    setDismissed(false)
    calledRef.current = false
    startRef.current = Date.now()
  }, [sessionMinutes])

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000)
      const left = Math.max(0, totalSecs - elapsed)
      setRemaining(left)
      if (left === 0 && !calledRef.current) {
        calledRef.current = true
        setExpired(true)
        onTimeUp?.()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [totalSecs, onTimeUp])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pad = (n) => String(n).padStart(2, '0')

  // Colour states
  const isWarning = remaining <= 300 && remaining > 60   // last 5 min
  const isDanger  = remaining <= 60  && remaining > 0    // last 1 min
  const pillColor = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : theme?.secondary || '#A78BFA'

  if (dismissed) return null

  return (
    <>
      {/* Timer pill — always visible in top-right */}
      <motion.div
        className="fixed z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg select-none"
        style={{
          top: 'max(0.75rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
          right: 'max(0.75rem, calc(env(safe-area-inset-right, 0px) + 0.5rem))',
          background: pillColor + '22',
          border: `2px solid ${pillColor}`,
          backdropFilter: 'blur(8px)',
        }}
        animate={isDanger ? { scale: [1, 1.08, 1] } : {}}
        transition={isDanger ? { duration: 0.8, repeat: Infinity } : {}}
      >
        <span className="text-base leading-none">{isDanger ? '⏰' : isWarning ? '⌛' : '⏱'}</span>
        <span className="font-bubble text-sm leading-none" style={{ color: pillColor }}>
          {pad(mins)}:{pad(secs)}
        </span>
      </motion.div>

      {/* Time's up overlay */}
      <AnimatePresence>
        {expired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-6"
          >
            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="bg-white rounded-3xl p-8 mx-2 text-center shadow-2xl max-w-xs w-full"
            >
              <div className="text-7xl mb-3">🎉</div>
              <h2 className="font-bubble text-3xl mb-2" style={{ color: theme?.primary || '#8B00FF' }}>
                Time's Up!
              </h2>
              <p className="font-round text-base mb-1" style={{ color: '#374151' }}>
                Wow, {profileName || 'superstar'}!
              </p>
              <p className="font-round text-sm mb-6 opacity-70" style={{ color: '#6B7280' }}>
                You've been learning for {sessionMinutes} whole minutes. That's amazing. Time for a little break!
              </p>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setDismissed(true)}
                className="w-full py-4 rounded-2xl font-bubble text-white text-xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${theme?.primary || '#8B00FF'}, ${theme?.accent || '#FF6B9D'})` }}
              >
                OK, I'll take a break 😊
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
