import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { dailySeedFor, seededShuffle } from '../../utils/seededRandom'

const TOPICS = {
  'Plants 🌱': [
    { q: 'What do plants need to make their own food?', opts: ['Sunlight, water and CO₂', 'Soil, worms and rain', 'Light, oxygen and sugar'], ans: 'Sunlight, water and CO₂', fact: 'Plants make food through photosynthesis — they use sunlight, water, and carbon dioxide to produce glucose.' },
    { q: 'What is the job of a flower?', opts: ['To make fruit juice', 'To attract insects for pollination', 'To store water for the plant'], ans: 'To attract insects for pollination', fact: 'Flowers attract bees and other insects, which carry pollen from one plant to another — this is called pollination.' },
    { q: 'What happens to a seed when it starts to grow?', opts: ['It photosynthesises', 'It germinates', 'It pollinates'], ans: 'It germinates', fact: 'Germination is when a seed begins to sprout. It needs warmth, water, and oxygen to start growing.' },
  ],
  'Animals 🦁': [
    { q: 'What is a carnivore?', opts: ['An animal that eats only plants', 'An animal that eats only meat', 'An animal that eats both plants and meat'], ans: 'An animal that eats only meat', fact: 'Carnivores only eat other animals. Lions, sharks, and eagles are examples of carnivores.' },
    { q: 'What do we call animals that eat both plants and meat?', opts: ['Herbivores', 'Carnivores', 'Omnivores'], ans: 'Omnivores', fact: 'Omnivores eat both plants and animals. Humans, bears, and foxes are omnivores.' },
    { q: 'Which of these is a vertebrate?', opts: ['Earthworm', 'Spider', 'Frog'], ans: 'Frog', fact: 'Vertebrates have a backbone. Frogs, fish, birds, reptiles, and mammals are all vertebrates. Spiders and worms are invertebrates.' },
  ],
  'Forces ⚡': [
    { q: 'What is gravity?', opts: ['A force that pushes objects upward', 'A force that pulls objects toward Earth', 'A force that makes things float'], ans: 'A force that pulls objects toward Earth', fact: 'Gravity is a pulling force. On Earth, it pulls everything toward the centre of the planet, keeping us on the ground.' },
    { q: 'What is friction?', opts: ['A force between two surfaces that slows movement', 'A force that makes things speed up', 'The same as gravity'], ans: 'A force between two surfaces that slows movement', fact: 'Friction acts between surfaces in contact. Rough surfaces create more friction than smooth ones — that\'s why tyres have tread.' },
    { q: 'Which material is attracted to a magnet?', opts: ['Plastic', 'Wood', 'Iron'], ans: 'Iron', fact: 'Magnets attract magnetic materials: iron, steel, cobalt, and nickel. Plastic, wood, and aluminium are not magnetic.' },
  ],
  'Light 💡': [
    { q: 'What is a source of light?', opts: ['A mirror', 'The Moon', 'The Sun'], ans: 'The Sun', fact: 'The Sun is a light source — it produces its own light. The Moon only reflects light from the Sun; it is not a light source.' },
    { q: 'What happens when light cannot pass through an object?', opts: ['A shadow is formed', 'A rainbow appears', 'The object glows'], ans: 'A shadow is formed', fact: 'Opaque objects block light, creating shadows. The shadow forms on the opposite side from the light source.' },
    { q: 'Which type of material lets all light pass through?', opts: ['Opaque', 'Translucent', 'Transparent'], ans: 'Transparent', fact: 'Transparent materials like glass and clear water let all light through. Translucent materials (like frosted glass) let some light through.' },
  ],
  'Rocks 🪨': [
    { q: 'Which type of rock is formed from cooled lava?', opts: ['Sedimentary', 'Igneous', 'Metamorphic'], ans: 'Igneous', fact: 'Igneous rocks form when magma cools and solidifies. Granite and basalt are igneous rocks.' },
    { q: 'What is a fossil?', opts: ['A very old rock', 'The preserved remains of a living thing', 'A type of crystal'], ans: 'The preserved remains of a living thing', fact: 'Fossils are the preserved remains or impressions of animals and plants from millions of years ago, found in sedimentary rock.' },
    { q: 'What do we call soil that is made up of tiny rock particles, humus, water and air?', opts: ['Gravel', 'Loam', 'Clay'], ans: 'Loam', fact: 'Loam is a mixture of sand, silt, clay and humus (decomposed organic matter). It\'s ideal for growing plants.' },
  ],
}

export default function ScienceModule({ theme, onDone, onBack }) {
  const [topic, setTopic] = useState(null)
  const [questions, setQuestions] = useState([])
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)

  const startTopic = (t) => {
    lockedRef.current = false
    completedRef.current = false
    setTopic(t)
    setQuestions(seededShuffle([...TOPICS[t]], dailySeedFor('science-' + t)))
    setQ(0)
    setScore(0)
    setFeedback(null)
  }

  const handle = (ans) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = ans === questions[q].ans
    const ns = score + (correct ? 1 : 0)
    if (correct) confetti({ particleCount: 45, spread: 65, origin: { x: 0.5, y: 0.4 } })
    setFeedback({ correct, ans: questions[q].ans, fact: questions[q].fact, ns })
  }

  const advance = () => {
    if (completedRef.current) return
    const ns = feedback.ns
    setFeedback(null)
    if (q + 1 >= questions.length) {
      completedRef.current = true
      onDone(ns, questions.length)
    } else {
      setQ(q + 1)
      lockedRef.current = false
    }
  }

  if (!topic) return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-lg">Science Quest</p>
      </div>
      <div className="flex-1 px-5 pt-6">
        <p className="font-round text-white/50 text-sm text-center mb-4">Choose a topic</p>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(TOPICS).map((t, i) => (
            <motion.button key={t}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.92 }} onClick={() => startTopic(t)}
              className="py-6 rounded-2xl font-bubble text-white text-base text-center"
              style={{ background: theme.card, border: `1px solid ${theme.primary}50` }}>
              {t}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )

  const curr = questions[q]
  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTopic(null)} className="font-round text-white/60 text-sm">← Topics</motion.button>
        <p className="font-round text-white/60 text-sm flex-1">{topic}</p>
        <span className="font-round text-white/60 text-sm">{q + 1}/{questions.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        <div className="w-full max-w-sm p-6 rounded-3xl text-center" style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
          <p className="font-bubble text-white text-xl leading-snug">{curr.q}</p>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="w-full max-w-sm rounded-2xl overflow-hidden">
              <div className={`px-5 py-3 font-bubble text-lg text-white ${feedback.correct ? 'bg-green-500/80' : 'bg-orange-500/70'}`}>
                {feedback.correct ? '✓ Correct!' : `✗ Answer: ${feedback.ans}`}
              </div>
              <div className="px-5 py-3" style={{ background: `${theme.primary}20` }}>
                <p className="font-round text-xs mb-1" style={{ color: theme.accent }}>🔬 Did you know?</p>
                <p className="font-round text-white/80 text-sm">{feedback.fact}</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={advance}
                  className="mt-3 w-full py-2.5 rounded-xl font-bubble text-white text-sm"
                  style={{ background: feedback.correct ? '#22C55E' : theme.primary }}
                >
                  {q + 1 >= questions.length ? 'Finish ✓' : 'Next →'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {curr.opts.map(opt => (
            <motion.button key={opt} whileTap={{ scale: 0.96 }} onClick={() => handle(opt)}
              className="py-4 px-5 rounded-2xl font-round text-white text-sm text-left"
              style={{
                background: feedback && opt === curr.ans ? '#22C55E30' : theme.card,
                border: feedback && opt === curr.ans ? '2px solid #22C55E' : `2px solid ${theme.primary}30`,
              }}>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
