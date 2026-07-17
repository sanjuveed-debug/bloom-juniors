import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { sessionSeedFor, seededShuffle } from '../../utils/seededRandom'

const TYPE_COLORS = {
  noun:      { bg: '#3B82F6', label: 'Noun',      def: 'a person, place, or thing'        },
  verb:      { bg: '#22C55E', label: 'Verb',      def: 'an action or doing word'           },
  adjective: { bg: '#F59E0B', label: 'Adjective', def: 'a word that describes a noun'     },
  adverb:    { bg: '#EC4899', label: 'Adverb',    def: 'a word that describes a verb'     },
}

// Each question: highlight the TARGET word and ask its type
const QUESTIONS = [
  { sentence: ['The', 'clever', 'fox', 'ran', 'quickly', 'through', 'the', 'forest'], target: 2, type: 'noun'      },
  { sentence: ['She', 'painted', 'a', 'beautiful', 'picture', 'in', 'the', 'art', 'room'], target: 1, type: 'verb' },
  { sentence: ['The', 'enormous', 'elephant', 'drank', 'from', 'the', 'river'], target: 1, type: 'adjective'       },
  { sentence: ['He', 'ran', 'very', 'quickly', 'to', 'catch', 'the', 'bus'], target: 3, type: 'adverb'             },
  { sentence: ['My', 'dog', 'barked', 'loudly', 'at', 'the', 'stranger'], target: 2, type: 'verb'                  },
  { sentence: ['The', 'ancient', 'castle', 'stood', 'on', 'a', 'misty', 'hill'], target: 2, type: 'noun'           },
  { sentence: ['She', 'gently', 'placed', 'the', 'fragile', 'vase', 'down'], target: 1, type: 'adverb'             },
  { sentence: ['The', 'bright', 'sun', 'shone', 'through', 'the', 'window'], target: 1, type: 'adjective'          },
  { sentence: ['They', 'played', 'happily', 'in', 'the', 'garden', 'all', 'day'], target: 2, type: 'adverb'        },
  { sentence: ['The', 'teacher', 'explained', 'the', 'difficult', 'question'], target: 4, type: 'adjective'        },
]

const HARDER_TYPE_COLORS = {
  ...TYPE_COLORS,
  conjunction: { bg: '#6366F1', label: 'Conjunction', def: 'joins two clauses or words' },
  pronoun:     { bg: '#F97316', label: 'Pronoun',     def: 'replaces a noun (he, she, they)' },
  preposition: { bg: '#14B8A6', label: 'Preposition', def: 'shows place or time (on, under, after)' },
}

const HARDER_QUESTIONS = [
  { sentence: ['She', 'ran', 'quickly', 'because', 'she', 'was', 'late'], target: 3, type: 'conjunction' },
  { sentence: ['They', 'played', 'in', 'the', 'garden', 'all', 'afternoon'], target: 2, type: 'preposition' },
  { sentence: ['He', 'won', 'the', 'race', 'although', 'he', 'fell'], target: 4, type: 'conjunction' },
  { sentence: ['She', 'left', 'her', 'bag', 'under', 'the', 'desk'], target: 4, type: 'preposition' },
  { sentence: ['Tom', 'and', 'she', 'went', 'to', 'the', 'park'], target: 2, type: 'pronoun' },
  { sentence: ['We', 'stayed', 'inside', 'because', 'it', 'was', 'raining'], target: 3, type: 'conjunction' },
  { sentence: ['They', 'hid', 'the', 'treasure', 'beneath', 'the', 'old', 'tree'], target: 4, type: 'preposition' },
  { sentence: ['He', 'passed', 'the', 'ball', 'to', 'her', 'quickly'], target: 5, type: 'pronoun' },
  { sentence: ['She', 'studied', 'hard', 'so', 'that', 'she', 'could', 'pass'], target: 3, type: 'conjunction' },
  { sentence: ['The', 'cat', 'sat', 'on', 'the', 'warm', 'mat'], target: 3, type: 'preposition' },
]

const shuffleTypes = (correct, harder = false) => {
  const all = Object.keys(harder ? HARDER_TYPE_COLORS : TYPE_COLORS)
  const opts = [correct, ...all.filter(t => t !== correct).sort(() => Math.random() - 0.5).slice(0, 3)]
  return opts.sort(() => Math.random() - 0.5)
}

function getQuestions(played) {
  if (played >= 3) {
    const pool = seededShuffle([...QUESTIONS, ...HARDER_QUESTIONS], sessionSeedFor('grammar-hard', played)).slice(0, 12)
    return { questions: pool, harder: true }
  }
  return { questions: seededShuffle([...QUESTIONS], sessionSeedFor('grammar', played)), harder: false }
}

export default function GrammarModule({ theme, onDone, onBack, played = 0 }) {
  const [{ questions, harder }] = useState(() => getQuestions(played))
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [opts] = useState(() => questions.map(qq => shuffleTypes(qq.type, harder)))
  const typeColors = harder ? HARDER_TYPE_COLORS : TYPE_COLORS
  const curr = questions[q]
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const missedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const handle = (type) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = type === curr.type
    const ns = score + (correct && !missedRef.current ? 1 : 0)
    if (!correct) missedRef.current = true
    if (correct) confetti({ particleCount: 45, spread: 65, origin: { x: 0.5, y: 0.4 } })
    setFeedback({ correct, type: correct ? curr.type : null })
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (!correct) {
        lockedRef.current = false
        return
      }
      if (q + 1 >= questions.length) {
        completedRef.current = true
        onDone(ns, questions.length, { questions })
      } else {
        setQ(q + 1)
        missedRef.current = false
        lockedRef.current = false
      }
    }, 1300)
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

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        <p className="font-round text-white/50 text-sm text-center">What type of word is highlighted?</p>

        {/* Sentence with highlighted target word */}
        <div className="w-full max-w-sm p-5 rounded-3xl" style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
          <p className="font-round text-white text-lg leading-relaxed text-center flex flex-wrap justify-center gap-x-2 gap-y-1">
            {curr.sentence.map((word, i) => (
              i === curr.target
                ? <motion.span key={i}
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="font-bubble px-2 py-0.5 rounded-lg text-white"
                    style={{ background: feedback?.correct ? typeColors[curr.type].bg : theme.primary, fontSize: '1.15rem' }}>
                    {word}
                  </motion.span>
                : <span key={i} className="text-white/80">{word}</span>
            ))}
          </p>
        </div>

        {/* Reference legend */}
        <div className="flex gap-2 flex-wrap justify-center">
          {Object.entries(typeColors).map(([k, v]) => (
            <span key={k} className="font-round text-xs px-2 py-1 rounded-full text-white"
              style={{ background: `${v.bg}50` }}>
              {v.label}: {v.def}
            </span>
          ))}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`px-6 py-3 rounded-2xl font-bubble text-lg text-white ${feedback.correct ? 'bg-green-500/80' : 'bg-orange-500/70'}`}>
              {feedback.correct ? `✓ Yes — it's a ${typeColors[feedback.type].label}!` : '✗ Read the meaning chips and try again'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {opts[q].map(type => (
            <motion.button key={type} data-companion-answer={type === curr.type ? 'correct' : 'wrong'} whileTap={{ scale: 0.88 }} onClick={() => handle(type)}
              className="py-4 px-3 rounded-2xl flex flex-col items-center gap-1"
              style={{
                background: feedback?.correct && type === curr.type
                  ? `${typeColors[type].bg}60`
                  : `${typeColors[type].bg}25`,
                border: feedback?.correct && type === curr.type
                  ? `2px solid ${typeColors[type].bg}`
                  : `2px solid ${typeColors[type].bg}40`,
              }}>
              <span className="font-bubble text-white text-lg">{typeColors[type].label}</span>
              {harder && <span className="font-round text-white/50 text-xs leading-tight text-center">{typeColors[type].def}</span>}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
