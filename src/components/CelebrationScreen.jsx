import React from 'react'
import { motion } from 'framer-motion'

const CONFETTI = ['🌟', '✨', '🎊', '🌸', '⭐', '🎉', '💛', '🌈']

export default function CelebrationScreen({ profileName, onPlayArcade, onShowGrownUp }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-5"
      style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FCE7F3 50%, #EDE9FE 100%)' }}
    >
      {/* Falling confetti */}
      {CONFETTI.map((emoji, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute text-2xl select-none"
          style={{ left: `${(i * 12 + 4) % 94}%`, top: '-5%' }}
          animate={{ y: ['0vh', '108vh'], rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)], opacity: [1, 0.6, 0] }}
          transition={{ duration: 2.2 + (i % 3) * 0.4, delay: i * 0.18, ease: 'easeIn', repeat: Infinity, repeatDelay: 1.5 }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Card */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
        className="relative w-full max-w-sm rounded-[40px] bg-white p-8 text-center shadow-2xl"
      >
        <motion.div
          animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="text-7xl mb-4 block"
        >
          🎉
        </motion.div>

        <p className="font-bubble text-3xl mb-1" style={{ color: '#7C3AED' }}>
          {profileName ? `You did it, ${profileName}!` : 'You did it!'}
        </p>
        <p className="font-round text-sm mb-7 opacity-55" style={{ color: '#374151' }}>
          Your learning path is complete!
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPlayArcade}
          className="w-full font-bubble text-2xl text-white rounded-[28px] shadow-xl mb-3"
          style={{
            height: 76,
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            boxShadow: '0 16px 40px rgba(124,58,237,0.38)',
          }}
        >
          🎮 Play Arcade
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onShowGrownUp}
          className="w-full font-bubble text-lg rounded-[24px]"
          style={{ height: 62, background: '#FEF3C7', color: '#92400E' }}
        >
          🏅 Show grown-up
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
