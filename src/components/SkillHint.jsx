import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── AdaptedMind-style "hint panel" shown after 2 wrong answers ────────────────
// Each hint has a visual example + simple explanation in Byju's language

const HINTS = {
  // ── Math hints ───────────────────────────────────────────────────────────────
  add: {
    title: 'Adding means putting together! ➕',
    visual: '🍎🍎 + 🍎🍎🍎 = 🍎🍎🍎🍎🍎',
    steps: [
      'Count the first group',
      'Count the second group',
      'Count ALL of them together!',
    ],
    colour: '#FF9A3C',
  },
  subtract: {
    title: 'Taking away means removing! ➖',
    visual: '🍪🍪🍪🍪🍪 → eat 2 → 🍪🍪🍪',
    steps: [
      'Start with the big number',
      'Cross out (remove) that many',
      'Count what is left!',
    ],
    colour: '#EF4444',
  },
  multiply: {
    title: 'Multiply = groups of the same size! ✖️',
    visual: '3 groups of 4 = 🌟🌟🌟🌟 | 🌟🌟🌟🌟 | 🌟🌟🌟🌟 = 12',
    steps: [
      'Make equal groups',
      'Count how many groups',
      'Add all the groups together!',
    ],
    colour: '#8B5CF6',
  },
  count: {
    title: 'Counting — point to each one! 🔢',
    visual: '☝️ Touch each object and say 1... 2... 3...',
    steps: [
      'Point to the first one — say 1',
      'Move to the next — say 2',
      'The last number you say is the answer!',
    ],
    colour: '#22C55E',
  },
  onemore: {
    title: 'One MORE means go up by 1! ⬆️',
    visual: '5 → one more → 6',
    steps: [
      'Find the number',
      'Go up just ONE step',
      'That\'s one more!',
    ],
    colour: '#14B8A6',
  },
  oneless: {
    title: 'One LESS means go down by 1! ⬇️',
    visual: '8 → one less → 7',
    steps: [
      'Find the number',
      'Go down just ONE step',
      'That\'s one less!',
    ],
    colour: '#F43F5E',
  },

  // ── Phonics hints ────────────────────────────────────────────────────────────
  sh: {
    title: 'SH — put finger to lips! 🤫',
    visual: '"Shhh" like "ship", "shop", "fish"',
    steps: [
      'Put your finger to your lips',
      'Say "Shhh" — the quiet sound',
      'Listen: SH-IP has the "sh" sound!',
    ],
    colour: '#3B82F6',
  },
  th: {
    title: 'TH — tongue between teeth! 👅',
    visual: '"th" like in "think", "thumb", "bath"',
    steps: [
      'Put your tongue between your teeth',
      'Blow gently — th-th-th!',
      'Listen: TH-INK has the "th" sound!',
    ],
    colour: '#EC4899',
  },
  ch: {
    title: 'CH — like a train! 🚂',
    visual: '"ch-ch-ch" like "chip", "chat", "lunch"',
    steps: [
      'Press lips forward',
      'Say "ch" like a train chuffing!',
      'Listen: CH-IP starts with "ch"!',
    ],
    colour: '#F59E0B',
  },
  ay: {
    title: 'AY — as in "say" and "play"! 🎉',
    visual: '"ay" like in "day", "play", "stay"',
    steps: [
      'Open your mouth wide',
      'Say "ay" — it rhymes with "day"!',
      'D-AY, PL-AY, ST-AY',
    ],
    colour: '#22C55E',
  },
  ee: {
    title: 'EE — like a happy squeal! 😄',
    visual: '"ee" like in "tree", "bee", "feet"',
    steps: [
      'Spread your lips wide into a smile',
      'Say "eeeee" — a long e sound!',
      'TR-EE, B-EE, F-EET',
    ],
    colour: '#4D96FF',
  },

  // ── Shapes hints ─────────────────────────────────────────────────────────────
  cube: {
    title: 'A Cube has 6 square faces! 🎲',
    visual: '📦 Like a dice — all sides are equal squares',
    steps: [
      'Count the faces: front, back, top, bottom, left, right = 6',
      'All faces are squares',
      'It has 8 corners and 12 edges!',
    ],
    colour: '#4D96FF',
  },
  sphere: {
    title: 'A Sphere is perfectly round! ⚽',
    visual: '🌍 Like a ball — no flat faces at all!',
    steps: [
      'No flat faces — it\'s all curved',
      'It rolls in any direction',
      'Like a football or an orange!',
    ],
    colour: '#22C55E',
  },

  // ── General fallback ─────────────────────────────────────────────────────────
  default: {
    title: 'Let\'s try again! 💪',
    visual: '🎯 Read the question carefully',
    steps: [
      'Listen to the question again 🔊',
      'Think about what you already know',
      'You can do this — give it another go!',
    ],
    colour: '#8B5CF6',
  },
}

export function getHint(module, context) {
  if (module === 'math' && context) return HINTS[context] || HINTS.add
  if (module === 'phonics' && context) return HINTS[context] || HINTS.sh
  if (module === 'shapes' && context) return HINTS[context] || HINTS.default
  return HINTS.default
}

export default function SkillHint({ hint, onClose, onTryAgain }) {
  if (!hint) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 120, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 120, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl skill-hint-panel"
          style={{ background: 'white' }}
        >
          {/* Coloured top bar */}
          <div className="px-5 pt-5 pb-4 text-white"
            style={{ background: `linear-gradient(135deg, ${hint.colour}, ${hint.colour}CC)` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bubble text-xs opacity-80">💡 Quick Tip!</span>
              <motion.button
                whileTap={{ scale: 0.85 }} onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                ×
              </motion.button>
            </div>
            <h3 className="font-bubble text-xl leading-snug">{hint.title}</h3>
          </div>

          <div className="px-5 py-4">
            {/* Visual example */}
            <div className="rounded-2xl p-3 mb-4 text-center"
              style={{ background: hint.colour + '15', border: `2px solid ${hint.colour}30` }}>
              <p className="font-round text-base font-bold leading-relaxed" style={{ color: hint.colour }}>
                {hint.visual}
              </p>
            </div>

            {/* Step-by-step */}
            <p className="font-bubble text-sm mb-2" style={{ color: '#374151' }}>How to solve it:</p>
            <div className="flex flex-col gap-2 mb-4">
              {hint.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.12 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bubble text-sm shrink-0"
                    style={{ background: hint.colour }}>
                    {i + 1}
                  </div>
                  <p className="font-round text-sm leading-snug pt-0.5" style={{ color: '#374151' }}>{step}</p>
                </motion.div>
              ))}
            </div>

            {/* Try again button */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onTryAgain}
              className="w-full py-4 rounded-2xl font-bubble text-lg text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${hint.colour}, ${hint.colour}BB)`,
                boxShadow: `0 6px 0 ${hint.colour}55`,
              }}
            >
              ✅ Got it! Let me try again!
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
