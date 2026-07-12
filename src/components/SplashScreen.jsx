import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TAGLINES = [
  'Learning made magical ✨',
  'Every child can shine 🌟',
  'Smart. Fun. Brilliant. 🚀',
]

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0) // 0=logo, 1=tagline, 2=out
  const doneRef = React.useRef(false)
  const onDoneRef = React.useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const dismiss = React.useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase(2)
    window.setTimeout(() => onDoneRef.current?.(), 350)
  }, [])

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase(1), 900)
    const t2 = window.setTimeout(() => setPhase(2), 2200)
    const t3 = window.setTimeout(dismiss, 2700)
    return () => [t1, t2, t3].forEach(window.clearTimeout)
  }, [dismiss])

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={{
            background: 'linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 50%, #FFF7ED 100%)',
          }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          onClick={dismiss}
        >
          {/* Animated star particles */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left:   `${(i * 17 + 5)  % 95}%`,
                top:    `${(i * 11 + 3)  % 88}%`,
                width:  `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                background: ['#F97316','#FB923C','#FBBF24','#0F766E','#14B8A6'][i % 5],
              }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.6, 1.4, 0.6] }}
              transition={{ duration: 1.5 + (i % 5) * 0.4, repeat: Infinity, delay: i * 0.09 }}
            />
          ))}

          {/* ── LOGO AREA ── */}
          <div className="relative z-10 flex flex-col items-center">

            {/* App icon: glowing shield/book */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              className="mb-5"
            >
              <div
                className="relative w-28 h-28 rounded-[28px] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #F97316, #EA580C)',
                  boxShadow: '0 0 0 2px rgba(255,255,255,0.6), 0 12px 32px rgba(194,65,12,0.35)',
                }}
              >
                <motion.span
                  className="text-6xl"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🌟
                </motion.span>
              </div>
            </motion.div>

            {/* App name */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="text-center"
            >
              <h1
                className="font-bubble text-5xl"
                style={{
                  color: '#9A3412',
                  letterSpacing: '0.03em',
                }}
              >
                Bloom Juniors
              </h1>
              <p className="font-round text-sm mt-0.5 tracking-[0.2em] uppercase" style={{ color: 'rgba(66,32,6,0.45)' }}>
                Learning
              </p>
            </motion.div>

            {/* Tagline */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="font-round text-base font-bold mt-4 text-center"
                  style={{ color: 'rgba(66,32,6,0.7)' }}
                >
                  {TAGLINES[0]}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Loading dots */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-2 mt-6"
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: ['#F97316','#FBBF24','#0F766E'][i] }}
                      animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom tagline for parents */}
          <motion.p
            className="absolute bottom-10 font-round text-xs text-center px-8"
            style={{ color: 'rgba(66,32,6,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ delay: 0.5 }}
          >
            UK British Curriculum · Ages 3–9 · EYFS, KS1 & Early KS2 🇬🇧
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
