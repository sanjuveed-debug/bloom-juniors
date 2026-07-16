import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { sessionSeedFor, seededShuffle } from '../../utils/seededRandom'

// SVG fraction bar — shaded n out of d parts
function FractionBar({ n, d, color = '#22C55E' }) {
  const w = 240, h = 40, gap = 3
  const partW = (w - gap * (d - 1)) / d
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {Array.from({ length: d }).map((_, i) => (
        <rect key={i} x={i * (partW + gap)} y={0} width={partW} height={h} rx={5}
          fill={i < n ? color : 'rgba(255,255,255,0.12)'}
          stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      ))}
    </svg>
  )
}

// SVG pie fraction
function FractionPie({ n, d, color = '#3B82F6', size = 90 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 4
  const slices = Array.from({ length: d }).map((_, i) => {
    const startAngle = (i / d) * 2 * Math.PI - Math.PI / 2
    const endAngle = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle)
    const large = (1 / d) > 0.5 ? 1 : 0
    return { i, x1, y1, x2, y2, large, filled: i < n }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map(s => (
        <path key={s.i}
          d={d === 1 ? `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0` :
            `M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.large} 1 ${s.x2} ${s.y2} Z`}
          fill={s.filled ? color : 'rgba(255,255,255,0.1)'}
          stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

const EASY_QUESTIONS = [
  { type: 'bar',  q: 'What fraction is shaded?',  n: 1, d: 2,  opts: ['½', '⅓', '¼'],    ans: '½'  },
  { type: 'pie',  q: 'What fraction is shaded?',  n: 1, d: 4,  opts: ['½', '¼', '⅓'],    ans: '¼'  },
  { type: 'bar',  q: 'What fraction is shaded?',  n: 2, d: 3,  opts: ['⅓', '½', '⅔'],    ans: '⅔'  },
  { type: 'calc', q: 'What is ½ of 18?',          n:0,  d:0,   opts: [9, 8, 6],           ans: 9    },
  { type: 'calc', q: 'What is ¼ of 24?',          n:0,  d:0,   opts: [4, 6, 8],           ans: 6    },
  { type: 'pie',  q: 'What fraction is shaded?',  n: 3, d: 4,  opts: ['¼', '¾', '⅔'],    ans: '¾'  },
  { type: 'equiv',q: 'Which equals ½?',           n:0,  d:0,   opts: ['2/4', '2/3', '3/4'], ans: '2/4' },
  { type: 'calc', q: 'What is ⅓ of 15?',          n:0,  d:0,   opts: [3, 5, 6],           ans: 5    },
  { type: 'bar',  q: 'What fraction is shaded?',  n: 3, d: 5,  opts: ['⅗', '⅖', '⅔'],    ans: '⅗'  },
  { type: 'calc', q: 'What is ¾ of 20?',          n:0,  d:0,   opts: [10, 15, 12],        ans: 15   },
]

const HARDER_QUESTIONS = [
  { type: 'equiv', q: 'Which equals ¾?',           n:0, d:0, opts: ['6/8', '3/6', '4/8'],   ans: '6/8'  },
  { type: 'calc',  q: 'What is ⅖ of 30?',          n:0, d:0, opts: [10, 12, 15],             ans: 12    },
  { type: 'calc',  q: '¾ of 36 = ?',               n:0, d:0, opts: [24, 27, 30],             ans: 27    },
  { type: 'equiv', q: 'Which fraction is largest?', n:0, d:0, opts: ['⅓', '⅖', '¼'],         ans: '⅖'  },
  { type: 'calc',  q: 'What is ⅗ of 45?',          n:0, d:0, opts: [25, 27, 30],             ans: 27    },
  { type: 'equiv', q: '¼ + ¼ = ?',                 n:0, d:0, opts: ['½', '¾', '⅛'],          ans: '½'  },
  { type: 'calc',  q: 'Which is bigger: ⅗ or ½?',  n:0, d:0, opts: ['⅗', '½', 'Equal'],     ans: '⅗'  },
  { type: 'equiv', q: '1½ as an improper fraction?', n:0, d:0, opts: ['3/2', '4/2', '2/3'],  ans: '3/2' },
  { type: 'calc',  q: '⅔ of 24 = ?',               n:0, d:0, opts: [12, 16, 18],             ans: 16    },
  { type: 'equiv', q: 'Which equals ⅔?',            n:0, d:0, opts: ['4/6', '3/6', '2/4'],   ans: '4/6' },
]

function getQuestions(played) {
  if (played >= 3) {
    return seededShuffle([...EASY_QUESTIONS, ...HARDER_QUESTIONS], sessionSeedFor('fractions-hard', played)).slice(0, 12)
  }
  return seededShuffle([...EASY_QUESTIONS], sessionSeedFor('fractions', played))
}

export default function FractionsModule({ theme, onDone, onBack, played = 0 }) {
  const [questions] = useState(() => getQuestions(played))
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const current = questions[q]
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const handle = (ans) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = ans == current.ans
    const ns = score + (correct ? 1 : 0)
    if (correct) confetti({ particleCount: 45, spread: 65, origin: { x: 0.5, y: 0.4 } })
    setFeedback({ correct, ans: current.ans })
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (q + 1 >= questions.length) {
        completedRef.current = true
        onDone(ns, questions.length)
      } else {
        setQ(q + 1)
        lockedRef.current = false
      }
    }, 1100)
    timersRef.current.push(id)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ background: theme.accent, width: `${(q / questions.length) * 100}%` }} />
        </div>
        <span className="font-round text-white/60 text-sm">{q + 1}/{questions.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-full max-w-sm p-6 rounded-3xl text-center" style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
          <p className="font-bubble text-white text-xl mb-5" style={{ textShadow: `0 0 15px ${theme.glow}` }}>
            {current.q}
          </p>
          {current.type === 'bar' && (
            <div className="flex justify-center">
              <FractionBar n={current.n} d={current.d} color={theme.accent} />
            </div>
          )}
          {current.type === 'pie' && (
            <div className="flex justify-center">
              <FractionPie n={current.n} d={current.d} color={theme.accent} size={100} />
            </div>
          )}
          {(current.type === 'calc' || current.type === 'equiv') && (
            <div className="text-5xl font-bubble text-white/20">½ ¼ ⅓</div>
          )}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`px-6 py-3 rounded-2xl font-bubble text-lg ${feedback.correct ? 'bg-green-500/80' : 'bg-orange-500/70'} text-white`}>
              {feedback.correct ? '✓ Correct!' : `✗ Answer: ${feedback.ans}`}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {current.opts.map(opt => (
            <motion.button key={opt} data-companion-answer={String(opt) === String(current.ans) ? 'correct' : 'wrong'} whileTap={{ scale: 0.88 }} onClick={() => handle(opt)}
              className="py-5 rounded-2xl font-bubble text-white text-xl"
              style={{
                background: feedback && String(opt) === String(current.ans) ? '#22C55E40' : theme.card,
                border: feedback && String(opt) === String(current.ans) ? '2px solid #22C55E' : `2px solid ${theme.primary}30`,
              }}>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
