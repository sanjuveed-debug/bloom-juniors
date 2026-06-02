import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { useVisibilityTimers } from '../hooks/useVisibilityTimers'
import { THEMES } from '../themes'

// ── 3D Shape data from school lesson ─────────────────────────────────────────
const SHAPES = [
  {
    name: 'Cube',
    emoji: '🟦',
    alt: '📦',
    faces: 6,
    faceType: 'squares',
    stacks: true,
    rolls: false,
    vertices: 8,
    edges: 12,
    colour: '#4D96FF',
    fun: 'A cube has 6 flat square faces. It stacks brilliantly and makes a very stable base!',
    example: 'Like a wooden block or a dice 🎲',
  },
  {
    name: 'Sphere',
    emoji: '⚽',
    alt: '🌍',
    faces: 0,
    faceType: 'curved surface (no flat faces)',
    stacks: false,
    rolls: true,
    vertices: 0,
    edges: 0,
    colour: '#22C55E',
    fun: 'A sphere has no flat faces at all — it is completely round. It rolls in every direction!',
    example: 'Like a football or an orange 🍊',
  },
  {
    name: 'Cylinder',
    emoji: '🥫',
    alt: '🪣',
    faces: 2,
    faceType: 'circles + 1 curved side',
    stacks: true,
    rolls: true,
    vertices: 0,
    edges: 2,
    colour: '#F59E0B',
    fun: 'A cylinder has 2 flat circle faces on top and bottom. It can stack AND roll on its side!',
    example: 'Like a tin can or a toilet roll 🚽',
  },
  {
    name: 'Cone',
    emoji: '🍦',
    alt: '🔺',
    faces: 1,
    faceType: 'circle base + curved side',
    stacks: false,
    rolls: true,
    vertices: 1,
    edges: 1,
    colour: '#EF4444',
    fun: 'A cone has 1 flat circular base and a pointed tip called a vertex. It rolls in a circle!',
    example: 'Like an ice cream cone 🍦 or a party hat 🎉',
  },
  {
    name: 'Cuboid',
    emoji: '📦',
    alt: '🧱',
    faces: 6,
    faceType: 'rectangles',
    stacks: true,
    rolls: false,
    vertices: 8,
    edges: 12,
    colour: '#8B5CF6',
    fun: 'A cuboid is like a cube but with rectangles instead of squares. Perfect for building!',
    example: 'Like a cereal box or a brick 🧱',
  },
  {
    name: 'Pyramid',
    emoji: '🔺',
    alt: '⛺',
    faces: 5,
    faceType: '1 square base + 4 triangles',
    stacks: false,
    rolls: false,
    vertices: 5,
    edges: 8,
    colour: '#EC4899',
    fun: 'A pyramid has a flat square base with 4 triangular faces that meet at a point on top!',
    example: 'Like the Egyptian pyramids 🏛️ or a party hat',
  },
]

// ── Question bank ─────────────────────────────────────────────────────────────
function makeQuestions() {
  const questions = []

  SHAPES.forEach(shape => {
    // Q1: Name the shape
    const wrongNames = SHAPES.filter(s => s.name !== shape.name)
    const opts1 = [
      { label: shape.name, correct: true },
      { label: wrongNames[0].name, correct: false },
      { label: wrongNames[1].name, correct: false },
      { label: wrongNames[2].name, correct: false },
    ].sort(() => Math.random() - 0.5)
    questions.push({
      id: `name-${shape.name}`,
      shape,
      question: `What shape is this? ${shape.emoji}`,
      type: 'name',
      options: opts1,
    })

    // Q2: Does it roll?
    questions.push({
      id: `roll-${shape.name}`,
      shape,
      question: `Does the ${shape.name} ${shape.emoji} roll?`,
      type: 'yesno',
      options: [
        { label: `Yes, it rolls! 🏃`, correct: shape.rolls },
        { label: `No, it doesn't roll`, correct: !shape.rolls },
      ],
    })

    // Q3: Does it stack?
    questions.push({
      id: `stack-${shape.name}`,
      shape,
      question: `Can the ${shape.name} ${shape.emoji} stack?`,
      type: 'yesno',
      options: [
        { label: `Yes, it stacks! 📚`, correct: shape.stacks },
        { label: `No, it doesn't stack`, correct: !shape.stacks },
      ],
    })
  })

  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]
  }
  return questions
}

// ── Tower challenge ───────────────────────────────────────────────────────────
// Which shapes are best for the bottom of a tower? Stackable ones!
const TOWER_QUESTION = {
  question: 'Help build a stable tower! Tap shapes that can go at the BOTTOM.',
  hint: 'The bottom shape needs to be flat and stable.',
  answer: SHAPES.filter(s => s.stacks).map(s => s.name),
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ShapeWorld({ avatar, progress, onAddStars, onBack, profileName }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()
  const [mode, setMode]         = useState('menu')   // menu | learn | quiz | tower
  const [currentShape, setCurrentShape] = useState(0)
  const [questions, setQuestions] = useState(() => makeQuestions())
  const [qIdx, setQIdx]         = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)     // 'correct' | 'wrong'
  const [correct, setCorrect]   = useState(0)
  const [towerPicks, setTowerPicks] = useState(new Set())
  const [towerChecked, setTowerChecked] = useState(false)

  const shape = SHAPES[currentShape]
  const question = questions[qIdx]
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const { track } = useVisibilityTimers()

  // ── Speak on learn mode shape change ──
  useEffect(() => {
    if (mode === 'learn') {
      speak(`${shape.name}. ${shape.fun}. ${shape.example}`, { mood: 'instruct' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShape, mode])

  useEffect(() => {
    if (mode === 'quiz' && question) {
      speak(question.question, { mood: 'question' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, mode])

  useEffect(() => {
    if (mode === 'tower') {
      speak(TOWER_QUESTION.question, { mood: 'question' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const enterMode = useCallback((nextMode) => {
    if (nextMode === 'learn') {
      setCurrentShape(0)
    }
    if (nextMode === 'quiz') {
      lockedRef.current = false
      completedRef.current = false
      setQuestions(makeQuestions())
      setQIdx(0)
      setSelected(null)
      setFeedback(null)
      setCorrect(0)
    }
    if (nextMode === 'tower') {
      setTowerPicks(new Set())
      setTowerChecked(false)
    }
    setMode(nextMode)
  }, [])

  const handleAnswer = useCallback((opt) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    setSelected(opt)
    const nextCorrect = correct + (opt.correct ? 1 : 0)
    if (opt.correct) {
      setFeedback('correct')
      setCorrect(nextCorrect)
      speak('Correct! Great thinking!', { mood: 'celebrate' })
    } else {
      setFeedback('wrong')
      speak(`Not quite. ${question.shape.fun}`, { mood: 'instruct' })
    }
    track(() => {
      setFeedback(null)
      setSelected(null)
      if (qIdx < questions.length - 1) {
        setQIdx(q => q + 1)
        lockedRef.current = false
      } else {
        completedRef.current = true
        const total = questions.length
        speak(
          `Amazing ${profileName || 'superstar'}! You got ${nextCorrect} out of ${total}. You know your shapes!`,
          { mood: 'celebrate' }
        )
        confetti({ particleCount: 100, spread: 100, origin: { x: 0.5, y: 0.5 } })
        onAddStars('shapes', 3, { total, correct: nextCorrect, struggles: [] })
        setQIdx(total) // trigger isLast result screen
      }
    }, 1400)
  }, [correct, qIdx, questions, speak, profileName, onAddStars, question, track])

  const checkTower = useCallback(() => {
    const correctAnswers = new Set(TOWER_QUESTION.answer)
    const allCorrect = [...correctAnswers].every(a => towerPicks.has(a))
      && [...towerPicks].every(p => correctAnswers.has(p))
    setTowerChecked(true)
    if (allCorrect) {
      speak('Brilliant! Those flat shapes make the best base for a tower.', { mood: 'celebrate' })
      confetti({ particleCount: 80, spread: 80 })
      onAddStars('shapes', 2, { total: TOWER_QUESTION.answer.length, correct: TOWER_QUESTION.answer.length, struggles: [] })
    } else {
      speak('Not quite. Think about which shapes have flat bottoms and can balance.', { mood: 'instruct' })
    }
  }, [towerPicks, speak, onAddStars])

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (mode === 'menu') {
    return (
      <div className="min-h-screen pb-8 flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center px-4 pt-safe pb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow mr-3"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <div>
            <h1 className="font-bubble text-3xl shimmer-text">Shape World 🔷</h1>
            <p className="font-round text-sm opacity-60" style={{ color: theme.text }}>3D Shapes Explorer</p>
          </div>
        </div>

        <div className="px-4 mb-6 p-4 rounded-3xl mx-4"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
          <p className="font-bubble text-white text-lg">What you'll learn</p>
          <p className="font-round text-white/90 text-sm mt-1">
            Explore cubes, spheres, cones and more — just like in school!
            Find out which shapes roll, stack, and make great towers 🏗️
          </p>
        </div>

        <div className="flex flex-col gap-4 px-4">
          {[
            { id: 'learn', emoji: '📖', title: 'Learn the Shapes', desc: 'Explore all 6 shapes with fun facts', color: '#4D96FF' },
            { id: 'quiz',  emoji: '🧠', title: 'Shape Quiz',       desc: `Answer ${questions.length} questions`, color: '#22C55E' },
            { id: 'tower', emoji: '🏗️', title: 'Build a Tower',    desc: 'Which shapes make the best base?', color: '#F59E0B' },
          ].map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => enterMode(item.id)}
              className="flex items-center gap-4 p-4 rounded-3xl shadow-lg text-left"
              style={{ background: theme.card, border: `2px solid ${item.color}40` }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: item.color + '25' }}>
                {item.emoji}
              </div>
              <div className="flex-1">
                <p className="font-bubble text-lg" style={{ color: theme.text }}>{item.title}</p>
                <p className="font-round text-sm opacity-60" style={{ color: theme.text }}>{item.desc}</p>
              </div>
              <span style={{ color: item.color, fontSize: 22 }}>▶</span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ── LEARN ─────────────────────────────────────────────────────────────────
  if (mode === 'learn') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center justify-between px-4 pt-safe pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMode('menu')}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <p className="font-bubble text-lg shimmer-text">{currentShape + 1} / {SHAPES.length}</p>
          <div className="w-10" />
        </div>

        {/* Dot progress */}
        <div className="flex gap-2 justify-center mb-3">
          {SHAPES.map((_, i) => (
            <motion.button key={i}
              onClick={() => setCurrentShape(i)}
              className="w-3 h-3 rounded-full"
              style={{ background: i === currentShape ? shape.colour : theme.secondary }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentShape}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            className="flex-1 mx-4 flex flex-col gap-4">

            {/* Shape hero card */}
            <div className="rounded-3xl p-6 text-center shadow-xl"
              style={{ background: `linear-gradient(135deg, ${shape.colour}CC, ${shape.colour}88)` }}>
              <motion.div
                className="text-[120px] leading-none mb-3"
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {shape.emoji}
              </motion.div>
              <h2 className="font-bubble text-4xl text-white">{shape.name}</h2>
              <p className="font-round text-white/90 text-sm mt-1">{shape.example}</p>
            </div>

            {/* Properties */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Flat Faces', value: shape.faces === 0 ? 'None' : `${shape.faces} (${shape.faceType})`, emoji: '🔲' },
                { label: 'Rolls?', value: shape.rolls ? 'Yes! 🏃' : 'No 🚫', emoji: '⚽', ok: shape.rolls },
                { label: 'Stacks?', value: shape.stacks ? 'Yes! 📚' : 'No 🚫', emoji: '📚', ok: shape.stacks },
                { label: 'Vertices', value: shape.vertices === 0 ? 'None' : String(shape.vertices), emoji: '📍' },
              ].map((prop, i) => (
                <motion.div key={i}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  className="p-3 rounded-2xl shadow text-center"
                  style={{ background: theme.card }}>
                  <div className="text-xl mb-1">{prop.emoji}</div>
                  <p className="font-round text-xs opacity-60 mb-0.5" style={{ color: theme.text }}>{prop.label}</p>
                  <p className="font-bubble text-sm" style={{ color: theme.text }}>{prop.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Fun fact */}
            <div className="p-4 rounded-2xl" style={{ background: `${shape.colour}20`, border: `2px solid ${shape.colour}50` }}>
              <p className="font-round text-sm" style={{ color: theme.text }}>💡 {shape.fun}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex gap-3 px-4 py-4">
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentShape(i => Math.max(0, i - 1))}
            disabled={currentShape === 0}
            className="flex-1 py-3 rounded-2xl font-bubble text-white disabled:opacity-30"
            style={{ background: theme.primary }}>
            ← Previous
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (currentShape < SHAPES.length - 1) setCurrentShape(i => i + 1)
              else setMode('menu')
            }}
            className="flex-1 py-3 rounded-2xl font-bubble text-white"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            {currentShape < SHAPES.length - 1 ? 'Next →' : 'Done! 🎉'}
          </motion.button>
        </div>
      </div>
    )
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (mode === 'quiz') {
    const isLast = qIdx >= questions.length
    if (isLast) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6"
          style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
          <div className="text-8xl mb-4">🏆</div>
          <h2 className="font-bubble text-4xl shimmer-text mb-2">Shape Expert!</h2>
          <p className="font-round text-lg text-center mb-6" style={{ color: theme.text }}>
            {correct} / {questions.length} correct
          </p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMode('menu')}
            className="px-10 py-4 rounded-2xl font-bubble text-white text-xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            Back to Menu 🏠
          </motion.button>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center justify-between px-4 pt-safe pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMode('menu')}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <div className="text-center">
            <p className="font-bubble text-base" style={{ color: theme.primary }}>{qIdx + 1} / {questions.length}</p>
            <p className="font-round text-xs opacity-60" style={{ color: theme.text }}>✅ {correct} correct</p>
          </div>
          <div className="text-2xl">{question.shape.emoji}</div>
        </div>

        {/* Progress bar */}
        <div className="mx-4 h-2 rounded-full mb-4" style={{ background: theme.secondary }}>
          <motion.div className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})` }}
            animate={{ width: `${((qIdx) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }} />
        </div>

        {/* Shape display */}
        <motion.div key={qIdx}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col px-4 gap-4">

          <div className="rounded-3xl p-6 flex flex-col items-center shadow-xl"
            style={{ background: `linear-gradient(135deg, ${question.shape.colour}BB, ${question.shape.colour}66)` }}>
            <motion.div
              className="text-[90px] leading-none"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}>
              {question.shape.emoji}
            </motion.div>
          </div>

          <p className="font-bubble text-xl text-center" style={{ color: theme.text }}>
            {question.question}
          </p>

          <div className={`grid gap-3 ${question.options.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {question.options.map((opt, i) => {
              const isSel = selected === opt
              const showRight = feedback && opt.correct
              const showWrong = feedback && isSel && !opt.correct
              return (
                <motion.button key={i}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!feedback}
                  className="py-4 px-3 rounded-2xl font-bubble text-base shadow-md disabled:opacity-60"
                  style={{
                    background: showRight ? '#22C55E' : showWrong ? '#EF4444'
                      : `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                    color: 'white',
                  }}>
                  {showRight ? '✅ ' : showWrong ? '❌ ' : ''}{opt.label}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    )
  }

  // ── TOWER CHALLENGE ───────────────────────────────────────────────────────
  if (mode === 'tower') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center px-4 pt-safe pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMode('menu')}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <h2 className="font-bubble text-2xl shimmer-text ml-3">Tower Challenge 🏗️</h2>
        </div>

        <div className="mx-4 p-4 rounded-3xl mb-4"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
          <p className="font-bubble text-white text-base">{TOWER_QUESTION.question}</p>
          <p className="font-round text-white/80 text-sm mt-1">💡 {TOWER_QUESTION.hint}</p>
        </div>

        <div className="px-4 grid grid-cols-2 gap-3 mb-4">
          {SHAPES.map(s => {
            const picked = towerPicks.has(s.name)
            const isCorrect = TOWER_QUESTION.answer.includes(s.name)
            const showResult = towerChecked
            return (
              <motion.button key={s.name}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  if (towerChecked) return
                  setTowerPicks(prev => {
                    const next = new Set(prev)
                    if (next.has(s.name)) next.delete(s.name)
                    else next.add(s.name)
                    return next
                  })
                }}
                className="p-4 rounded-3xl flex flex-col items-center gap-2 shadow-lg"
                style={{
                  background: showResult
                    ? isCorrect ? '#D1FAE5' : picked ? '#FEE2E2' : theme.card
                    : picked ? `${s.colour}30` : theme.card,
                  border: `3px solid ${showResult
                    ? isCorrect ? '#22C55E' : picked ? '#EF4444' : theme.secondary
                    : picked ? s.colour : theme.secondary}`,
                }}>
                <div className="text-5xl">{s.emoji}</div>
                <p className="font-bubble text-sm" style={{ color: theme.text }}>{s.name}</p>
                {showResult && (
                  <span className="text-lg">{isCorrect ? '✅' : picked ? '❌' : '—'}</span>
                )}
              </motion.button>
            )
          })}
        </div>

        {!towerChecked ? (
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={checkTower}
            disabled={towerPicks.size === 0}
            className="mx-4 py-4 rounded-2xl font-bubble text-white text-xl disabled:opacity-40 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            Check My Tower! 🏗️
          </motion.button>
        ) : (
          <div className="mx-4 flex flex-col gap-3">
            <div className="p-4 rounded-2xl text-center"
              style={{ background: theme.card }}>
              <p className="font-bubble text-lg" style={{ color: theme.text }}>
                {[...towerPicks].every(p => TOWER_QUESTION.answer.includes(p)) &&
                 TOWER_QUESTION.answer.every(a => towerPicks.has(a))
                  ? '🎉 Perfect tower base!'
                  : '💡 The flat-bottomed shapes make the best base!'}
              </p>
              <p className="font-round text-sm opacity-70 mt-1" style={{ color: theme.text }}>
                Best for the bottom: {TOWER_QUESTION.answer.join(', ')} — they have flat bases!
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMode('menu')}
              className="py-4 rounded-2xl font-bubble text-white text-lg shadow-lg"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
              Back to Menu 🏠
            </motion.button>
          </div>
        )}
      </div>
    )
  }

  return null
}
