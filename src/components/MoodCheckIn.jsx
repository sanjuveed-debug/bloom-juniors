import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEMES } from '../themes'

const MOODS = [
  { key: 'happy',   emoji: '😊', label: 'Happy',   reply: 'Yay! Let\'s have a brilliant day together!' },
  { key: 'okay',    emoji: '😐', label: 'Okay',    reply: 'That\'s alright. Let\'s do something fun to cheer up!' },
  { key: 'sleepy',  emoji: '😴', label: 'Sleepy',  reply: 'A sleepy day is a cosy day. Let\'s take it gently.' },
]

export default function MoodCheckIn({ avatar, profileName, onComplete, onSkip, themeOverride }) {
  const theme = themeOverride || THEMES[avatar] || THEMES.rumi
  const [chosen, setChosen] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const handlePick = (mood) => {
    if (chosen || timerRef.current) return
    setChosen(mood)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      onComplete?.(mood)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8">
        <p className="font-round text-sm opacity-70 mb-1" style={{ color: theme.text }}>
          Hi {profileName || 'friend'}!
        </p>
        <h2 className="font-bubble text-3xl" style={{ color: theme.primary }}>
          How are you feeling today?
        </h2>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4">
        {MOODS.map((m, i) => {
          const isChosen = chosen?.key === m.key
          const faded = chosen && !isChosen
          return (
            <motion.button
              key={m.key}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: faded ? 0.3 : 1,
                scale: isChosen ? 1.15 : 1,
              }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 18 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePick(m)}
              className="flex flex-col items-center gap-2 p-6 rounded-3xl shadow-lg"
              style={{
                background: isChosen
                  ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
                  : theme.card,
                border: `2px solid ${isChosen ? theme.primary : theme.primary + '30'}`,
                minWidth: 110,
              }}>
              <motion.span className="text-6xl"
                animate={isChosen ? { rotate: [0, 12, -12, 0], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: isChosen ? Infinity : 0 }}>
                {m.emoji}
              </motion.span>
              <span className="font-bubble text-sm"
                style={{ color: isChosen ? 'white' : theme.text }}>
                {m.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {chosen && (
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-8 font-round text-center text-base max-w-xs"
            style={{ color: theme.text }}>
            {chosen.reply}
          </motion.p>
        )}
      </AnimatePresence>

      {onSkip && !chosen && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          onClick={onSkip}
          className="mt-8 font-round text-sm opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: theme.text }}>
          Skip for now →
        </motion.button>
      )}
    </div>
  )
}
