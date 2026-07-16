import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { sessionSeedFor, seededShuffle } from '../../utils/seededRandom'

const PROBLEMS = [
  {
    q: 'Aisha buys 3 books at £4.50 each and a pen for £1.20. How much does she spend altogether?',
    hint: 'First: 3 × £4.50 = ?\nThen add the pen price.',
    opts: ['£14.70', '£13.50', '£15.70', '£12.70'],
    ans: '£14.70',
    working: '3 × £4.50 = £13.50\n£13.50 + £1.20 = £14.70',
  },
  {
    q: 'A train journey is 240 km. It travels at 80 km/h. How long does the journey take in hours?',
    hint: 'Time = Distance ÷ Speed\n240 ÷ 80 = ?',
    opts: ['2 hours', '3 hours', '4 hours', '6 hours'],
    ans: '3 hours',
    working: '240 ÷ 80 = 3 hours',
  },
  {
    q: 'There are 32 children in a class. ¼ of them walk to school. How many children walk?',
    hint: 'Find ¼ of 32.\n32 ÷ 4 = ?',
    opts: ['6', '8', '10', '12'],
    ans: '8',
    working: '32 ÷ 4 = 8 children',
  },
  {
    q: 'A rectangle has a length of 12 cm and width of 7 cm. What is its perimeter?',
    hint: 'Perimeter = 2 × (length + width)\n2 × (12 + 7) = ?',
    opts: ['38 cm', '84 cm', '19 cm', '34 cm'],
    ans: '38 cm',
    working: '2 × (12 + 7) = 2 × 19 = 38 cm',
  },
  {
    q: 'Ben saves £5.60 per week for 8 weeks. He then spends £22.00. How much does he have left?',
    hint: 'First: 8 × £5.60 = ?\nThen subtract £22.00.',
    opts: ['£22.80', '£26.80', '£20.80', '£24.80'],
    ans: '£22.80',
    working: '8 × £5.60 = £44.80\n£44.80 − £22.00 = £22.80',
  },
  {
    q: 'A pizza is cut into 8 equal slices. Tom eats 3 slices, Sara eats 2. What fraction is left?',
    hint: 'Slices eaten: 3 + 2 = 5\nLeft: 8 − 5 = ? out of 8',
    opts: ['3/8', '5/8', '2/8', '4/8'],
    ans: '3/8',
    working: '5 slices eaten. 8 − 5 = 3 left → 3/8',
  },
  {
    q: 'A shop sells 145 items on Monday, 238 on Tuesday, and 97 on Wednesday. How many total?',
    hint: 'Add all three numbers:\n145 + 238 + 97 = ?',
    opts: ['470', '480', '460', '490'],
    ans: '480',
    working: '145 + 238 = 383\n383 + 97 = 480',
  },
  {
    q: 'A field is 45 m long and 30 m wide. What is its area in square metres?',
    hint: 'Area = length × width\n45 × 30 = ?',
    opts: ['150 m²', '1350 m²', '135 m²', '750 m²'],
    ans: '1350 m²',
    working: '45 × 30 = 1350 m²',
  },
]

const HARDER_PROBLEMS = [
  {
    q: 'A school trip costs £12.50 per child. 28 children go. What is the total cost?',
    hint: 'Multiply: 28 × £12.50\n= 28 × £12 + 28 × £0.50',
    opts: ['£350.00', '£340.00', '£360.00', '£345.00'],
    ans: '£350.00',
    working: '28 × £12 = £336\n28 × £0.50 = £14\n£336 + £14 = £350.00',
  },
  {
    q: 'A car travels 135 miles in 3 hours. What is its average speed in mph?',
    hint: 'Speed = Distance ÷ Time\n135 ÷ 3 = ?',
    opts: ['40 mph', '45 mph', '50 mph', '55 mph'],
    ans: '45 mph',
    working: '135 ÷ 3 = 45 mph',
  },
  {
    q: 'A shirt costs £24. It is reduced by 25% in a sale. What is the sale price?',
    hint: '25% of £24 = ¼ of £24\nThen subtract from £24.',
    opts: ['£16', '£17', '£18', '£19'],
    ans: '£18',
    working: '25% of £24 = £6\n£24 − £6 = £18',
  },
  {
    q: '3 apples and 2 bananas cost £2.10. Each banana costs 30p. How much is each apple?',
    hint: '2 bananas = 2 × 30p = 60p\n£2.10 − 60p = ?\nDivide by 3.',
    opts: ['40p', '50p', '60p', '55p'],
    ans: '50p',
    working: '2 × 30p = 60p\n£2.10 − £0.60 = £1.50\n£1.50 ÷ 3 = 50p',
  },
  {
    q: 'A recipe needs 450g of flour for 12 biscuits. How much flour is needed for 20 biscuits?',
    hint: 'Find flour per biscuit: 450 ÷ 12\nThen × 20.',
    opts: ['750g', '700g', '800g', '650g'],
    ans: '750g',
    working: '450 ÷ 12 = 37.5g per biscuit\n37.5 × 20 = 750g',
  },
  {
    q: 'The ratio of boys to girls in a class is 3:2. There are 30 children. How many are girls?',
    hint: 'Total parts = 3 + 2 = 5\nEach part = 30 ÷ 5\nGirls = 2 parts.',
    opts: ['10', '12', '14', '18'],
    ans: '12',
    working: '30 ÷ 5 = 6 per part\nGirls = 2 × 6 = 12',
  },
]

function getProblems(played) {
  if (played >= 3) {
    return seededShuffle([...PROBLEMS, ...HARDER_PROBLEMS], sessionSeedFor('wordproblems-hard', played)).slice(0, 8)
  }
  return seededShuffle([...PROBLEMS], sessionSeedFor('wordproblems', played))
}

export default function WordProblemsModule({ theme, onDone, onBack, played = 0 }) {
  const [problems] = useState(() => getProblems(played))
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [showWorking, setShowWorking] = useState(false)
  const curr = problems[q]
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const handle = (ans) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = ans === curr.ans
    const ns = score + (correct ? 1 : 0)
    if (correct) confetti({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.4 } })
    setFeedback({ correct, ans: curr.ans })
    setShowWorking(true)
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      setShowHint(false)
      setShowWorking(false)
      if (q + 1 >= problems.length) {
        completedRef.current = true
        onDone(ns, problems.length)
      } else {
        setQ(q + 1)
        lockedRef.current = false
      }
    }, 2200)
    timersRef.current.push(id)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ background: theme.accent, width: `${(q / problems.length) * 100}%` }} />
        </div>
        <span className="font-round text-white/60 text-sm">{q + 1}/{problems.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 pt-5 pb-8 gap-4">
        <div className="w-full max-w-sm p-5 rounded-3xl" style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
          <p className="font-round text-white text-base leading-relaxed">{curr.q}</p>
        </div>

        <AnimatePresence>
          {showHint && !showWorking && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
              className="w-full max-w-sm p-4 rounded-2xl"
              style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}50` }}>
              <p className="font-round text-xs mb-1" style={{ color: theme.accent }}>💡 Hint</p>
              <p className="font-round text-white/80 text-sm whitespace-pre-line">{curr.hint}</p>
            </motion.div>
          )}
          {showWorking && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="w-full max-w-sm p-4 rounded-2xl"
              style={{ background: '#22C55E20', border: '1px solid #22C55E50' }}>
              <p className="font-round text-xs text-green-400 mb-1">✓ Working out</p>
              <p className="font-round text-white/80 text-sm whitespace-pre-line">{curr.working}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`px-6 py-3 rounded-2xl font-bubble text-lg ${feedback.correct ? 'bg-green-500/80' : 'bg-orange-500/70'} text-white`}>
              {feedback.correct ? '✓ Correct!' : `✗ Answer: ${feedback.ans}`}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {curr.opts.map(opt => (
            <motion.button key={opt} data-companion-answer={opt === curr.ans ? 'correct' : 'wrong'} whileTap={{ scale: 0.88 }} onClick={() => handle(opt)}
              className="py-4 rounded-2xl font-round text-white text-sm text-center"
              style={{
                background: feedback && opt === curr.ans ? '#22C55E30' : theme.card,
                border: feedback && opt === curr.ans ? '2px solid #22C55E' : `2px solid ${theme.primary}30`,
              }}>
              {opt}
            </motion.button>
          ))}
        </div>

        {!showHint && !feedback && (
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowHint(true)}
            className="w-full max-w-sm py-3 rounded-2xl font-round text-sm"
            style={{ background: theme.card, border: `1px dashed ${theme.accent}40`, color: theme.accent }}>
            💡 Show Hint
          </motion.button>
        )}
      </div>
    </div>
  )
}
