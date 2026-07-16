import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const PASSAGES = [
  {
    id: 'fox', level: 'Year 3', title: 'The Clever Fox',
    text: 'A fox was walking through the forest when he spotted a crow sitting high in an oak tree. The crow had found a large piece of cheese and clutched it proudly in her beak.\n\nThe sly fox wanted the cheese for himself. He sat beneath the tree and called up, "My dear crow, I have heard that your voice is the most beautiful in all the forest. The birds of paradise themselves are jealous of you! Please, would you sing just one song for me?"\n\nThe crow was so flattered that she opened her beak wide to sing — and the cheese tumbled straight down to the fox. He snatched it up and trotted away, calling back, "Thank you, crow. Remember: those who love flattery often pay a heavy price!"',
    questions: [
      { type: 'literal',    q: 'What was the crow holding in her beak?',            opts: ['A worm', 'A piece of cheese', 'A golden coin'],   ans: 'A piece of cheese' },
      { type: 'inference',  q: 'Why did the fox compliment the crow\'s voice?',      opts: ['He genuinely admired her', 'To trick her into dropping the cheese', 'He was lonely'],  ans: 'To trick her into dropping the cheese' },
      { type: 'vocabulary', q: 'What does "flattered" mean in this story?',          opts: ['Angry and upset', 'Pleased by a compliment', 'Tired and sleepy'],  ans: 'Pleased by a compliment' },
      { type: 'inference',  q: 'What lesson does the fox teach the crow?',           opts: ['Always share your food', 'Do not trust flattery', 'Foxes are clever hunters'], ans: 'Do not trust flattery' },
    ],
  },
  {
    id: 'space', level: 'Year 4', title: 'A Day on Mars',
    text: 'Commander Priya checked the oxygen levels one final time before stepping out of the airlock. Outside, the Martian landscape stretched in every direction — red dust, jagged rocks, and a pale salmon sky that looked nothing like the blue skies she had grown up under.\n\nShe had trained for six years for this moment. Mars was colder than any winter she had known, with temperatures dropping to minus sixty degrees Celsius at night. During the day, dust storms could rise without warning and block out the thin sunlight entirely.\n\nYet as she planted her boot into the rust-coloured soil for the first time, she felt only wonder. Humans had finally reached another world. Whatever challenges lay ahead — the isolation, the danger, the 225 million kilometres from home — none of it seemed to matter in this extraordinary moment.',
    questions: [
      { type: 'literal',    q: 'What did Priya check before stepping outside?',      opts: ['Her spacesuit zip', 'The oxygen levels', 'The temperature gauge'], ans: 'The oxygen levels' },
      { type: 'literal',    q: 'How long had Priya trained for this mission?',       opts: ['Three years', 'Ten years', 'Six years'], ans: 'Six years' },
      { type: 'inference',  q: 'How does Priya feel when she first steps on Mars?',  opts: ['Terrified and cold', 'Full of wonder and amazement', 'Bored and tired'], ans: 'Full of wonder and amazement' },
      { type: 'vocabulary', q: 'What does "isolation" mean in the final paragraph?', opts: ['Being completely alone', 'A type of spacesuit', 'A dust storm on Mars'], ans: 'Being completely alone' },
    ],
  },
  {
    id: 'volcano', level: 'Year 5', title: 'Inside a Volcano',
    text: 'Volcanoes are among the most powerful forces on Earth, capable of reshaping entire landscapes in a matter of hours. But what exactly happens inside one?\n\nDeep beneath the Earth\'s surface lies a layer called the mantle, where rock is so hot it melts into a thick, flowing substance called magma. When pressure builds up — due to tectonic plates shifting or gases expanding — the magma forces its way upward through cracks in the Earth\'s crust.\n\nOnce magma reaches the surface, it is called lava and can flow at speeds of up to 60 kilometres per hour. As it cools, it solidifies into new rock, gradually building up the cone shape we recognise as a volcano. Scientists who study volcanoes are called volcanologists, and they use instruments to monitor earthquakes and gas emissions, often giving communities crucial warning before an eruption occurs.',
    questions: [
      { type: 'literal',    q: 'What is magma called once it reaches the surface?',  opts: ['Mantle', 'Lava', 'Pumice'], ans: 'Lava' },
      { type: 'literal',    q: 'What do volcanologists monitor to warn communities?', opts: ['Rainfall and snow', 'Earthquakes and gas emissions', 'Wind and temperature'], ans: 'Earthquakes and gas emissions' },
      { type: 'inference',  q: 'Why is early warning from volcanologists important?',  opts: ['So tourists can watch the eruption', 'So communities can stay safe', 'So scientists can collect lava samples'], ans: 'So communities can stay safe' },
      { type: 'vocabulary', q: 'What does "solidifies" mean in this passage?',        opts: ['Melts into liquid', 'Turns into gas', 'Becomes hard and solid'], ans: 'Becomes hard and solid' },
    ],
  },
]

const TYPE_BADGE = { literal: '📖 Literal', inference: '💭 Inference', vocabulary: '📝 Vocabulary' }

export default function ReadingModule({ theme, onDone, onBack }) {
  const [phase, setPhase] = useState('pick') // pick | read | quiz | result
  const [passage, setPassage] = useState(null)
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const startPassage = (p) => {
    lockedRef.current = false
    completedRef.current = false
    setPassage(p); setQ(0); setScore(0); setFeedback(null); setPhase('read')
  }

  const handle = (ans) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = ans === passage.questions[q].ans
    const ns = score + (correct ? 1 : 0)
    if (correct) confetti({ particleCount: 40, spread: 60, origin: { x: 0.5, y: 0.4 } })
    setFeedback({ correct, ans: passage.questions[q].ans })
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (q + 1 >= passage.questions.length) {
        completedRef.current = true
        setScore(ns)
        setPhase('result')
        onDone(ns, passage.questions.length)
      } else {
        setQ(q + 1)
        lockedRef.current = false
      }
    }, 1200)
    timersRef.current.push(id)
  }

  if (phase === 'pick') return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-lg">Reading</p>
      </div>
      <div className="flex-1 px-5 pt-6 flex flex-col gap-4">
        <p className="font-round text-white/50 text-sm text-center">Choose a passage to read</p>
        {PASSAGES.map((p, i) => (
          <motion.button key={p.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.96 }} onClick={() => startPassage(p)}
            className="p-5 rounded-2xl text-left" style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">📖</span>
              <div>
                <p className="font-bubble text-white text-lg">{p.title}</p>
                <p className="font-round text-sm mt-0.5" style={{ color: theme.accent }}>{p.level} · {p.questions.length} questions</p>
                <p className="font-round text-white/40 text-xs mt-1">{p.text.slice(0, 80)}…</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  if (phase === 'read') return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPhase('pick')} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-base flex-1">{passage.title}</p>
        <span className="font-round text-white/40 text-xs">{passage.level}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
        <div className="p-5 rounded-2xl mb-6 max-w-lg mx-auto" style={{ background: theme.card, border: `1px solid ${theme.primary}30` }}>
          {passage.text.split('\n\n').map((para, i) => (
            <p key={i} className="font-round text-white/90 text-base leading-relaxed mb-3 last:mb-0">{para}</p>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPhase('quiz')}
          className="w-full max-w-lg mx-auto block py-4 rounded-2xl font-bubble text-white text-xl"
          style={{ background: theme.primary, boxShadow: `0 6px 20px ${theme.glow}60` }}>
          Answer Questions →
        </motion.button>
      </div>
    </div>
  )

  if (phase === 'result') {
    const pct = Math.round((score / passage.questions.length) * 100)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: theme.bg }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center">
          <div className="text-5xl mb-4">{pct >= 75 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : '⭐'}</div>
          <h2 className="font-bubble text-white text-3xl mb-2">{score}/{passage.questions.length}</h2>
          <p className="font-round text-white/60 mb-8">{passage.title}</p>
          <div className="flex gap-4 justify-center">
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => startPassage(passage)}
              className="px-6 py-3 rounded-2xl font-round text-white" style={{ background: theme.primary }}>
              Try Again
            </motion.button>
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => setPhase('pick')}
              className="px-6 py-3 rounded-2xl font-round text-white" style={{ background: theme.card, border: `1px solid ${theme.primary}50` }}>
              Other Passages
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  const curr = passage.questions[q]
  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPhase('read')} className="font-round text-white/60 text-sm">← Passage</motion.button>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ background: theme.accent, width: `${(q / passage.questions.length) * 100}%` }} />
        </div>
        <span className="font-round text-white/60 text-sm">{q + 1}/{passage.questions.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <span className="font-round text-xs px-3 py-1 rounded-full" style={{ background: `${theme.primary}40`, color: theme.accent }}>
          {TYPE_BADGE[curr.type]}
        </span>
        <div className="w-full max-w-sm p-6 rounded-3xl text-center" style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
          <p className="font-bubble text-white text-xl leading-snug">{curr.q}</p>
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`px-5 py-2 rounded-xl font-round text-base ${feedback.correct ? 'bg-green-500/80' : 'bg-orange-500/70'} text-white`}>
              {feedback.correct ? '✓ Correct!' : `✗ Answer: ${feedback.ans}`}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {curr.opts.map(opt => (
            <motion.button key={opt} data-companion-answer={opt === curr.ans ? 'correct' : 'wrong'} whileTap={{ scale: 0.96 }} onClick={() => handle(opt)}
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
