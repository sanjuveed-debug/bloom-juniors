import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import MatchingActivity from './MatchingActivity'
import { useSpeech } from '../hooks/useSpeech'
import { trackEvent } from '../utils/analytics.js'

const DEMO_COLOUR = '#8B5CF6'
const DEMO_EMOJIS = ['🦋', '🍎', '⭐', '🐠', '🎈', '🐞', '🌸', '🐧']

// "Count the animals" pairs: question tile shows N emojis, answer tile the number.
function makeDemoPairs() {
  const counts = []
  while (counts.length < 4) {
    const n = Math.floor(Math.random() * 5) + 1 // 1-5
    if (!counts.includes(n)) counts.push(n)
  }
  const emojis = [...DEMO_EMOJIS].sort(() => Math.random() - 0.5)
  return counts.map((n, i) => ({
    id: `d${i}`,
    question: emojis[i].repeat(n),
    answer: String(n),
  }))
}

// Count graphemes (emoji are multi-code-unit, so use Array.from / segmentation)
function emojiCount(text) {
  try {
    return [...new Intl.Segmenter().segment(text)].length
  } catch {
    return Array.from(text).length
  }
}

export default function LandingDemo({ onGetStarted }) {
  const { speak } = useSpeech()
  const [round, setRound] = useState(0)
  const [pairs, setPairs] = useState(() => makeDemoPairs())
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)

  const handleComplete = useCallback((misses, total) => {
    setDone(true)
    confetti({ particleCount: 90, spread: 110, origin: { y: 0.6 } })
    speak('Brilliant! You matched them all!', { mood: 'celebrate' })
    trackEvent('demo_complete', { misses, total })
  }, [speak])

  const playAgain = useCallback(() => {
    setPairs(makeDemoPairs())
    setDone(false)
    setRound(r => r + 1)
  }, [])

  return (
    <section className="px-4 pb-16 md:px-8">
      <div className="mx-auto max-w-xl">
        <h2 className="font-bubble text-white text-3xl md:text-4xl text-center mb-2">
          Try it yourself — right now
        </h2>
        <p className="font-round text-white/50 text-sm text-center mb-8">
          A real activity, right here. No signup, no download — count the animals, then tap the matching number. Yaagvi counts along with you.
        </p>

        <div className="rounded-[28px] p-5 md:p-7"
          style={{ background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${DEMO_COLOUR}50` }}>

          {!started ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >🎯</motion.div>
              <p className="font-bubble text-white text-2xl mb-2">Count &amp; Match</p>
              <p className="font-round text-white/55 text-sm mb-6">
                Count each group of animals and match it to the right number — Yaagvi counts out loud with you.
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => { setStarted(true); speak('Count the animals, then tap the matching number!', { mood: 'instruct' }) }}
                className="font-bubble text-lg text-white px-8 py-4 rounded-2xl shadow-xl"
                style={{ background: `linear-gradient(135deg, ${DEMO_COLOUR}, #FF1D8E)` }}
              >
                ▶ Play the demo
              </motion.button>
              <p className="font-round text-white/35 text-xs mt-3">Tip: turn your sound on 🔊</p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {!done ? (
                  <motion.div key={`board-${round}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MatchingActivity
                      pairs={pairs}
                      colour={DEMO_COLOUR}
                      tileTextClass="text-3xl"
                      onSpeak={(text) => {
                        const t = String(text)
                        if (/^\d+$/.test(t)) {
                          speak(t, { mood: 'instruct' })
                        } else {
                          // count the emojis aloud: "1, 2, 3!"
                          const n = emojiCount(t)
                          speak(Array.from({ length: n }, (_, i) => i + 1).join(', ') + '!', { mood: 'celebrate' })
                        }
                      }}
                      onComplete={handleComplete}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="done"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6">
                    <div className="text-6xl mb-3">🎉</div>
                    <p className="font-bubble text-white text-2xl mb-2">You matched them all!</p>
                    <p className="font-round text-white/60 text-sm mb-6 max-w-sm mx-auto">
                      That was 1 of 40+ activities. Your child gets a guided daily path of
                      phonics, maths and stories — and games unlock after the learning.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.04 }}
                        onClick={onGetStarted}
                        className="font-bubble text-lg text-white px-8 py-4 rounded-2xl shadow-xl"
                        style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)' }}
                      >
                        Create a free account →
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={playAgain}
                        className="font-bubble text-lg text-white/75 px-8 py-4 rounded-2xl border-2 border-white/20 hover:bg-white/8 transition-colors"
                      >
                        🔄 Play again
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
