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

  const dismiss = React.useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase(2)
    setTimeout(onDone, 350)
  }, [onDone])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900)
    const t2 = setTimeout(() => setPhase(2), 2200)
    const t3 = setTimeout(() => dismiss(), 2700)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [dismiss])

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={{
            background: 'linear-gradient(160deg, #0B0F2A 0%, #1A1550 35%, #2D126B 65%, #0B0F2A 100%)',
          }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          onClick={dismiss}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(139,0,255,0.35) 0%, transparent 70%)',
            }}
          />

          {/* Animated star particles */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left:   `${(i * 17 + 5)  % 95}%`,
                top:    `${(i * 11 + 3)  % 88}%`,
                width:  `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                background: ['#FFD700','#FF6B9D','#7DD3FC','#A78BFA','#6EE7B7'][i % 5],
              }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.4, 0.6] }}
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
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-[28px]"
                style={{ background: 'radial-gradient(circle, rgba(139,0,255,0.7), transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div
                className="relative w-28 h-28 rounded-[28px] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #7C3AED, #4F46E5, #1D4ED8)',
                  boxShadow: '0 0 0 2px rgba(255,255,255,0.15), 0 16px 48px rgba(99,60,255,0.7)',
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
                  background: 'linear-gradient(135deg, #E879F9, #818CF8, #60A5FA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.7))',
                  letterSpacing: '0.03em',
                }}
              >
                Bloom Juniors
              </h1>
              <p className="font-round text-white/50 text-sm mt-0.5 tracking-[0.2em] uppercase">
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
                  className="font-round text-white/75 text-base font-bold mt-4 text-center"
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
                      style={{ background: ['#E879F9','#818CF8','#60A5FA'][i] }}
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
            className="absolute bottom-10 font-round text-white/30 text-xs text-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ delay: 0.5 }}
          >
            UK British Curriculum · Ages 3–8 · EYFS & KS1 🇬🇧
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
