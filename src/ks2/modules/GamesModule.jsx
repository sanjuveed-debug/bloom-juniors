import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import BloomQuizShow from '../../components/BloomQuizShow.jsx'
import YaagviCharacter from '../../components/YaagviCharacter.jsx'
import { dailySeedFor, seededShuffle } from '../../utils/seededRandom'

const pick = (items) => items[Math.floor(Math.random() * items.length)]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const QUEST_QUESTIONS = [
  { q: '7 x 8', a: 56, wrong: [54, 58, 64] },
  { q: '63 / 7', a: 9, wrong: [7, 8, 12] },
  { q: '15 + 28', a: 43, wrong: [33, 41, 46] },
  { q: '90 - 37', a: 53, wrong: [47, 57, 63] },
  { q: '6 x 9', a: 54, wrong: [45, 56, 63] },
  { q: '12 x 4', a: 48, wrong: [36, 44, 52] },
]

function FinishScreen({ theme, title, score, total = score, onDone }) {
  const lockedRef = useRef(false)
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
      <YaagviCharacter state="celebrate" size={130} />
      <p className="font-bubble text-white text-2xl">{title}</p>
      <p className="font-round text-white/60">Score: {score}</p>
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => {
          if (lockedRef.current) return
          lockedRef.current = true
          onDone(score, total)
        }}
        className="px-8 py-3 rounded-2xl font-bubble text-white"
        style={{ background: theme.primary }}
      >
        Finish
      </motion.button>
    </div>
  )
}

function QuestDashGame({ theme, onDone }) {
  const lanes = [18, 50, 82]
  const questions = useMemo(() => seededShuffle([...QUEST_QUESTIONS], dailySeedFor('questdash')), [])
  const [lane, setLane] = useState(1)
  const [items, setItems] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(3)
  const [message, setMessage] = useState('Catch the right answer')
  const [finished, setFinished] = useState(false)
  const [suspended, setSuspended] = useState(false)
  const nextId = useRef(0)
  const timersRef = useRef([])
  const question = questions[questionIndex]

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    const handle = () => setSuspended(document.hidden)
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowLeft') setLane((value) => Math.max(0, value - 1))
      if (event.key === 'ArrowRight') setLane((value) => Math.min(2, value + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (finished || suspended) return undefined
    const spawn = setInterval(() => {
      const correct = Math.random() < 0.45
      const obstacle = Math.random() < 0.18
      const value = correct ? question.a : pick(question.wrong)
      setItems((list) => [
        ...list.slice(-8),
        {
          id: nextId.current++,
          lane: randomInt(0, 2),
          y: -12,
          value,
          correct: correct && !obstacle,
          obstacle,
          speed: Math.random() * 0.9 + 1.1,
        },
      ])
    }, 760)
    return () => clearInterval(spawn)
  }, [finished, suspended, question])

  useEffect(() => {
    if (finished || suspended) return undefined
    const tick = setInterval(() => {
      setItems((list) => {
        const next = []
        let clearFallingAnswers = false
        list.forEach((item) => {
          const moved = { ...item, y: item.y + item.speed }
          const hit = moved.y > 74 && moved.y < 90 && moved.lane === lane
          if (hit) {
            if (moved.correct) {
              const nextScore = score + 25
              setScore(nextScore)
              clearFallingAnswers = true
              if (questionIndex + 1 >= questions.length) {
                setFinished(true)
                confetti({ particleCount: 100, spread: 120 })
              } else {
                setQuestionIndex((value) => value + 1)
              }
              setMessage('Gem collected')
              confetti({ particleCount: 25, spread: 55 })
            } else {
              setHealth((value) => Math.max(0, value - 1))
              setMessage(moved.obstacle ? 'Dodge the blockers' : 'Wrong answer')
            }
            const mid = window.setTimeout(() => {
              timersRef.current = timersRef.current.filter(t => t !== mid)
              setMessage('Catch the right answer')
            }, 600)
            timersRef.current.push(mid)
          } else if (moved.y < 106) {
            next.push(moved)
          }
        })
        return clearFallingAnswers ? [] : next
      })
    }, 45)
    return () => clearInterval(tick)
  }, [finished, suspended, lane, questionIndex, score, questions])

  useEffect(() => {
    if (!finished && health <= 0) {
      setFinished(true)
      confetti({ particleCount: 100, spread: 120 })
    }
  }, [finished, health])

  if (finished) return <FinishScreen theme={theme} title="Quest Dash Complete" score={score} total={QUEST_QUESTIONS.length * 25} onDone={onDone} />

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bubble text-white text-lg">Quest Dash</p>
          <p className="font-round text-white/55 text-xs">Move lanes and collect answers</p>
        </div>
        <div className="font-round text-white/70 text-xs text-right">
          <p>Score {score}</p>
          <p>HP {health}/3</p>
        </div>
      </div>

      <div
        className="relative h-[460px] max-h-[60vh] overflow-hidden rounded-3xl border touch-none select-none"
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 100
          setLane(x < 33 ? 0 : x > 66 ? 2 : 1)
        }}
        style={{
          background: 'linear-gradient(180deg, rgba(14,165,233,0.22), rgba(15,23,42,0.95))',
          borderColor: `${theme.primary}55`,
        }}
      >
        <div className="absolute inset-x-0 top-3 z-10 flex flex-col items-center gap-2 pointer-events-none">
          <span className="px-5 py-2 rounded-full bg-black/35 font-bubble text-white text-lg">
            {question.q} = ?
          </span>
          <span className="px-4 py-1 rounded-full bg-white/10 font-round text-white/70 text-xs">{message}</span>
        </div>

        {lanes.map((x) => (
          <div key={x} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `${x}%` }} />
        ))}

        {items.map((item) => (
          <motion.div
            key={item.id}
            className="absolute w-16 h-16 -translate-x-1/2 rounded-2xl flex items-center justify-center font-bubble text-white text-xl shadow-xl"
            style={{
              left: `${lanes[item.lane]}%`,
              top: `${item.y}%`,
              background: item.obstacle
                ? 'linear-gradient(135deg, #111827, #EF4444)'
                : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              border: '2px solid rgba(255,255,255,0.5)',
            }}
          >
            {item.obstacle ? 'X' : item.value}
          </motion.div>
        ))}

        <motion.div
          className="absolute bottom-7 w-20 h-20 -translate-x-1/2 rounded-3xl flex items-center justify-center font-bubble text-white text-2xl shadow-2xl"
          animate={{ left: `${lanes[lane]}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ background: `linear-gradient(180deg, ${theme.accent}, ${theme.primary})` }}
        >
          ME
        </motion.div>

        <div className="absolute bottom-2 left-3 right-3 text-center font-round text-white/45 text-xs">
          Tap left, middle, or right. Arrow keys also work.
        </div>
      </div>
    </div>
  )
}

function TowerBuilderGame({ theme, onDone }) {
  const questions = useMemo(() => seededShuffle([...QUEST_QUESTIONS], dailySeedFor('tower')), [])
  const [step, setStep] = useState(0)
  const [blocks, setBlocks] = useState([])
  const [score, setScore] = useState(0)
  const [penalty, setPenalty] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const current = questions[step]
  const options = useMemo(() => [current.a, ...current.wrong].sort(() => Math.random() - 0.5), [current])
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const choose = (value) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = value === current.a
    const newScore = score + (correct ? 20 : 0)
    if (correct) {
      setBlocks((list) => [...list, value])
      setScore(newScore)
      setFeedback('Tower block added')
      confetti({ particleCount: 25, spread: 45 })
    } else {
      setFeedback('Not that block — solve it one more time')
      setPenalty((value) => value + 5)
    }

    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (!correct) {
        lockedRef.current = false
        return
      }
      if (step + 1 >= questions.length) {
        completedRef.current = true
        confetti({ particleCount: 90, spread: 120 })
        onDone(Math.max(0, newScore - penalty), questions.length * 20)
      } else {
        setStep((v) => v + 1)
        lockedRef.current = false
      }
    }, 850)
    timersRef.current.push(id)
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bubble text-white text-lg">Sky Tower</p>
          <p className="font-round text-white/55 text-xs">Build by choosing the right block</p>
        </div>
        <p className="font-round text-white/70 text-xs">Score {score}</p>
      </div>

      <div className="min-h-[260px] rounded-3xl border p-4 flex flex-col justify-end items-center overflow-hidden" style={{ borderColor: `${theme.primary}55`, background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))' }}>
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3 px-4 py-2 rounded-full font-bubble text-white text-sm"
              style={{ background: `${theme.primary}DD` }}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col-reverse items-center gap-1">
          {blocks.map((block, index) => (
            <motion.div
              key={`${block}-${index}`}
              initial={{ y: -80, rotate: -8, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              className="h-8 rounded-lg flex items-center justify-center font-bubble text-white"
              style={{
                width: `${130 - Math.min(index * 6, 50)}px`,
                background: index % 2 ? theme.primary : theme.accent,
              }}
            >
              {block}
            </motion.div>
          ))}
          <div className="w-44 h-4 rounded-full bg-white/15" />
        </div>
      </div>

      <div className="rounded-2xl p-4 text-center" style={{ background: theme.card }}>
        <p className="font-round text-white/55 text-xs mb-1">Choose the answer</p>
        <p className="font-bubble text-white text-3xl">{current.q}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <motion.button
            key={option}
            data-companion-answer={option === current.a ? 'correct' : 'wrong'}
            whileTap={{ scale: 0.92 }}
            onClick={() => choose(option)}
            className="py-5 rounded-2xl font-bubble text-white text-2xl"
            style={{ background: theme.card, border: `2px solid ${theme.primary}45` }}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const SPELL_WORDS = ['rocket', 'planet', 'castle', 'bridge', 'jungle', 'thunder']

function WordForgeGame({ theme, onDone }) {
  const words = useRef(seededShuffle([...SPELL_WORDS], dailySeedFor('wordforge')).slice(0, 4)).current
  const [wordIndex, setWordIndex] = useState(0)
  const [built, setBuilt] = useState('')
  const [selectedIndices, setSelectedIndices] = useState([])
  const [score, setScore] = useState(0)
  const [penalty, setPenalty] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const word = words[wordIndex]
  const letters = useMemo(() => word.split('').sort(() => Math.random() - 0.5), [word])
  const wordLockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const addLetter = (letter, index) => {
    if (wordLockedRef.current || completedRef.current || selectedIndices.includes(index) || built.length >= word.length) return
    const next = built + letter
    const nextSelected = [...selectedIndices, index]
    setBuilt(next)
    setSelectedIndices(nextSelected)
    if (next.length === word.length) {
      wordLockedRef.current = true
      const correct = next === word
      const newScore = score + (correct ? 25 : 0)
      setFeedback(correct ? 'Word built!' : 'Listen to the word in your head and rebuild it')
      if (correct) {
        setScore(newScore)
        confetti({ particleCount: 30, spread: 50 })
      } else {
        setPenalty((value) => value + 5)
      }
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        if (correct && wordIndex + 1 >= words.length) {
          completedRef.current = true
          onDone(Math.max(0, newScore - penalty), words.length * 25)
        } else if (correct) {
          setBuilt('')
          setSelectedIndices([])
          setFeedback(null)
          setWordIndex((v) => v + 1)
          wordLockedRef.current = false
        } else {
          setBuilt('')
          setSelectedIndices([])
          setFeedback(null)
          wordLockedRef.current = false
        }
      }, 950)
      timersRef.current.push(id)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bubble text-white text-lg">Word Builder</p>
          <p className="font-round text-white/55 text-xs">Tap letters in the correct order</p>
        </div>
        <p className="font-round text-white/70 text-xs">Score {score}</p>
      </div>

      <div className="rounded-3xl border p-5 text-center" style={{ borderColor: `${theme.primary}55`, background: theme.card }}>
        <p className="font-round text-white/50 text-xs mb-2">Build this word</p>
        <p className="font-bubble text-3xl" style={{ color: theme.accent }}>{word.toUpperCase()}</p>
        <div className="mt-5 min-h-16 rounded-2xl bg-black/20 flex items-center justify-center gap-2 px-3">
          {word.split('').map((_, index) => (
            <span key={index} className="w-9 h-11 rounded-lg bg-white/10 flex items-center justify-center font-bubble text-white text-xl">
              {built[index]?.toUpperCase() || ''}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="self-center px-4 py-2 rounded-full font-bubble text-white"
            style={{ background: `${theme.primary}DD` }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-3">
        {letters.map((letter, index) => {
          const used = selectedIndices.includes(index)
          return (
          <motion.button
            key={`${letter}-${index}`}
            whileTap={{ scale: 0.88 }}
            onClick={() => addLetter(letter, index)}
            disabled={used || Boolean(feedback)}
            className="py-5 rounded-2xl font-bubble text-white text-2xl uppercase"
            style={{
              background: used
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))',
              border: `2px solid ${theme.primary}45`,
              opacity: used ? 0.45 : 1,
            }}
          >
            {letter}
          </motion.button>
          )
        })}
      </div>

      <button
        onClick={() => { setBuilt(''); setSelectedIndices([]) }}
        className="font-round text-white/50 text-sm"
      >
        Clear
      </button>
    </div>
  )
}

function MemoryGame({ theme, onDone }) {
  const pairs = [
    ['7 x 8', '56'],
    ['9 x 6', '54'],
    ['63 / 7', '9'],
    ['12 x 4', '48'],
    ['90 - 37', '53'],
    ['15 + 28', '43'],
  ]
  const [deck, setDeck] = useState(() => seededShuffle(
    pairs.flatMap(([question, answer], pairId) => [
      { id: `${pairId}-q`, pairId, label: question, flipped: false, matched: false },
      { id: `${pairId}-a`, pairId, label: answer, flipped: false, matched: false },
    ]),
    dailySeedFor('memory')
  ))
  const [selected, setSelected] = useState([])
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    const handle = () => {
      if (document.hidden) { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
    }
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [])

  const flip = (id) => {
    if (selected.length === 2) return
    const card = deck.find((item) => item.id === id)
    if (!card || card.flipped || card.matched) return

    const updated = deck.map((item) => item.id === id ? { ...item, flipped: true } : item)
    const nextSelected = [...selected, id]
    setDeck(updated)
    setSelected(nextSelected)

    if (nextSelected.length === 2) {
      setMoves((value) => value + 1)
      const [a, b] = nextSelected.map((selectedId) => updated.find((item) => item.id === selectedId))
      if (a.pairId === b.pairId && a.id !== b.id) {
        const matched = updated.map((item) => nextSelected.includes(item.id) ? { ...item, matched: true } : item)
        setDeck(matched)
        setSelected([])
        if (matched.every((item) => item.matched)) {
          confetti({ particleCount: 90, spread: 120 })
          const tid = window.setTimeout(() => {
            timersRef.current = timersRef.current.filter(t => t !== tid)
            if (completedRef.current) return
            completedRef.current = true
            setDone(true)
          }, 500)
          timersRef.current.push(tid)
        }
      } else {
        const tid = window.setTimeout(() => {
          timersRef.current = timersRef.current.filter(t => t !== tid)
          setDeck((list) => list.map((item) => nextSelected.includes(item.id) && !item.matched ? { ...item, flipped: false } : item))
          setSelected([])
        }, 800)
        timersRef.current.push(tid)
      }
    }
  }

  if (done) return <FinishScreen theme={theme} title="Memory Vault Opened" score={Math.max(10, 200 - moves * 5)} total={200} onDone={onDone} />

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="font-bubble text-white text-lg">Memory Vault</p>
        <p className="font-round text-white/60 text-sm">Match each question with its answer. Moves: {moves}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {deck.map((card) => (
          <motion.button
            key={card.id}
            whileTap={{ scale: 0.88 }}
            onClick={() => flip(card.id)}
            className="aspect-square rounded-xl flex items-center justify-center px-1 text-center text-base font-bubble"
            style={{
              background: card.matched ? '#22C55E40' : card.flipped ? `${theme.primary}50` : theme.card,
              border: card.matched ? '2px solid #22C55E' : `2px solid ${theme.primary}30`,
              color: 'white',
            }}
          >
            {card.flipped || card.matched ? card.label : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const MAZE_LAYOUT = [
  '###############',
  '#.............#',
  '#.###.###.###.#',
  '#.............#',
  '#.###.#.#.###.#',
  '#.....#.#.....#',
  '###.#.....#.###',
  '#...#.###.#...#',
  '#.#.......#.#.#',
  '#.#.#####.#.#.#',
  '#.............#',
  '#.###.###.###.#',
  '#.....#.#.....#',
  '#.............#',
  '###############',
]

const MAZE_SIZE = MAZE_LAYOUT.length
const MAZE_TARGET_GEMS = 24
const MAZE_MAX_SCORE = MAZE_TARGET_GEMS * 10 + 100
const START_POS = { row: 7, col: 7 }
const START_BLOCKERS = [
  { row: 1, col: 1 },
  { row: 1, col: 13 },
  { row: 13, col: 1 },
]

function isMazeWall(row, col) {
  return row < 0 || col < 0 || row >= MAZE_SIZE || col >= MAZE_SIZE || MAZE_LAYOUT[row][col] === '#'
}

function keyForCell(row, col) {
  return `${row}:${col}`
}

function MazeMunchGame({ theme, onDone }) {
  const [player, setPlayer] = useState(START_POS)
  const [blockers, setBlockers] = useState(START_BLOCKERS)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [collected, setCollected] = useState(0)
  const [message, setMessage] = useState(`Collect ${MAZE_TARGET_GEMS} gems. Avoid blockers.`)
  const [finished, setFinished] = useState(false)
  const [suspended, setSuspended] = useState(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    const handle = () => setSuspended(document.hidden)
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [])

  const [gems, setGems] = useState(() => {
    const cells = new Set()
    MAZE_LAYOUT.forEach((row, rowIndex) => {
      row.split('').forEach((cell, colIndex) => {
        if (cell === '.' && !(rowIndex === START_POS.row && colIndex === START_POS.col)) {
          cells.add(keyForCell(rowIndex, colIndex))
        }
      })
    })
    return cells
  })

  const hitBlocker = useCallback((nextPlayer = player, nextBlockers = blockers) => (
    nextBlockers.some((blocker) => blocker.row === nextPlayer.row && blocker.col === nextPlayer.col)
  ), [blockers, player])

  const finish = useCallback((finalScore) => {
    if (completedRef.current) return
    completedRef.current = true
    setFinished(true)
    confetti({ particleCount: 120, spread: 130 })
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      onDone(finalScore, MAZE_MAX_SCORE)
    }, 850)
    timersRef.current.push(id)
  }, [onDone])

  const loseLife = useCallback(() => {
    setLives((current) => {
      const nextLives = current - 1
      if (nextLives <= 0) {
        finish(score)
      } else {
        setPlayer(START_POS)
        setBlockers(START_BLOCKERS)
        setMessage('Careful. Try another route.')
        const id = window.setTimeout(() => {
          timersRef.current = timersRef.current.filter(t => t !== id)
          setMessage(`Collect ${MAZE_TARGET_GEMS} gems. Avoid blockers.`)
        }, 900)
        timersRef.current.push(id)
      }
      return Math.max(0, nextLives)
    })
  }, [finish, score])

  const movePlayer = useCallback((rowDelta, colDelta) => {
    if (finished || suspended) return
    setPlayer((current) => {
      const next = { row: current.row + rowDelta, col: current.col + colDelta }
      if (isMazeWall(next.row, next.col)) return current

      const gemKey = keyForCell(next.row, next.col)
      setGems((currentGems) => {
        if (!currentGems.has(gemKey)) return currentGems
        const updated = new Set(currentGems)
        updated.delete(gemKey)
        const nextScore = score + 10
        const nextCollected = collected + 1
        setScore(nextScore)
        setCollected(nextCollected)
        if (nextCollected >= MAZE_TARGET_GEMS || updated.size === 0) finish(nextScore + 100)
        return updated
      })

      if (hitBlocker(next)) {
        const id = window.setTimeout(() => {
          timersRef.current = timersRef.current.filter(t => t !== id)
          loseLife()
        }, 0)
        timersRef.current.push(id)
      }
      return next
    })
  }, [collected, finish, finished, suspended, hitBlocker, loseLife, score])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowUp') movePlayer(-1, 0)
      if (event.key === 'ArrowDown') movePlayer(1, 0)
      if (event.key === 'ArrowLeft') movePlayer(0, -1)
      if (event.key === 'ArrowRight') movePlayer(0, 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [movePlayer])

  useEffect(() => {
    if (finished || suspended || lives <= 0) return undefined
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ]
    const tick = setInterval(() => {
      setBlockers((current) => {
        const moved = current.map((blocker) => {
          const choices = directions
            .map((direction) => ({ row: blocker.row + direction.row, col: blocker.col + direction.col }))
            .filter((cell) => !isMazeWall(cell.row, cell.col))
            .sort((a, b) => {
              const aDistance = Math.abs(a.row - player.row) + Math.abs(a.col - player.col)
              const bDistance = Math.abs(b.row - player.row) + Math.abs(b.col - player.col)
              return Math.random() < 0.7 ? aDistance - bDistance : Math.random() - 0.5
            })
          return choices[0] || blocker
        })
        if (hitBlocker(player, moved)) {
          const id = window.setTimeout(() => {
            timersRef.current = timersRef.current.filter(t => t !== id)
            loseLife()
          }, 0)
          timersRef.current.push(id)
        }
        return moved
      })
    }, 620)
    return () => clearInterval(tick)
  }, [finished, suspended, hitBlocker, lives, loseLife, player])

  if (finished) {
    return <FinishScreen theme={theme} title="Maze Munch Complete" score={score} total={MAZE_MAX_SCORE} onDone={onDone} />
  }

  const controls = [
    { label: 'UP', action: () => movePlayer(-1, 0), className: 'col-start-2' },
    { label: 'LEFT', action: () => movePlayer(0, -1), className: 'col-start-1' },
    { label: 'DOWN', action: () => movePlayer(1, 0), className: 'col-start-2' },
    { label: 'RIGHT', action: () => movePlayer(0, 1), className: 'col-start-3' },
  ]

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bubble text-white text-lg">Maze Munch</p>
          <p className="font-round text-white/55 text-xs">{message}</p>
        </div>
        <div className="font-round text-white/70 text-xs text-right">
          <p>Score {score}</p>
          <p>Gems {collected}/{MAZE_TARGET_GEMS}</p>
          <p>HP {lives}/3</p>
        </div>
      </div>

      <div
        className="grid aspect-square w-full max-w-[min(86vw,420px)] mx-auto rounded-3xl border p-2 gap-1"
        style={{
          gridTemplateColumns: `repeat(${MAZE_SIZE}, minmax(0, 1fr))`,
          background: 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.20), rgba(15,23,42,0.96))',
          borderColor: `${theme.primary}55`,
        }}
      >
        {MAZE_LAYOUT.flatMap((row, rowIndex) => row.split('').map((cell, colIndex) => {
          const key = keyForCell(rowIndex, colIndex)
          const hasPlayer = player.row === rowIndex && player.col === colIndex
          const blocker = blockers.some((item) => item.row === rowIndex && item.col === colIndex)
          const hasGem = gems.has(key)
          return (
            <div
              key={key}
              className="relative rounded-[4px] flex items-center justify-center"
              style={{
                background: cell === '#'
                  ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
                  : 'rgba(255,255,255,0.04)',
                boxShadow: cell === '#' ? `0 0 10px ${theme.primary}35 inset` : 'none',
              }}
            >
              {hasGem && <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />}
              {hasPlayer && (
                <motion.span
                  layoutId="maze-player"
                  className="absolute inset-[12%] rounded-full flex items-center justify-center font-bubble text-[10px] text-white z-20"
                  style={{ background: '#FACC15', color: '#1F2937' }}
                >
                  Y
                </motion.span>
              )}
              {blocker && (
                <motion.span
                  layout
                  className="absolute inset-[16%] rounded-md flex items-center justify-center font-bubble text-[10px] text-white z-10"
                  style={{ background: '#EF4444' }}
                >
                  B
                </motion.span>
              )}
            </div>
          )
        }))}
      </div>

      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        {controls.map((control) => (
          <motion.button
            key={control.label}
            whileTap={{ scale: 0.9 }}
            onClick={control.action}
            className={`${control.className} h-12 rounded-xl font-bubble text-white text-xs`}
            style={{ background: theme.card, border: `1px solid ${theme.primary}55` }}
          >
            {control.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const GAMES = [
  { id: 'quiz', label: 'Bloom Brain Championship', badge: 'LIVE', desc: 'Contestant seat, lifelines, adaptive questions, and prizes' },
  { id: 'maze', label: 'Maze Munch', badge: 'MAZE', desc: 'Collect 24 gems and avoid blockers' },
  { id: 'quest', label: 'Quest Dash', badge: 'RUN', desc: 'Move lanes and catch the correct answer' },
  { id: 'tower', label: 'Sky Tower', badge: 'BUILD', desc: 'Build a tower with maths blocks' },
  { id: 'forge', label: 'Word Builder', badge: 'SPELL', desc: 'Tap scrambled letters to spell the word' },
  { id: 'memory', label: 'Memory Vault', badge: 'BRAIN', desc: 'Match maths questions with answers' },
]

export default function GamesModule({ theme, onBack, gamesUnlocked, played = 0, onComplete }) {
  const [game, setGame] = useState(null)
  const [result, setResult] = useState(null)
  const gameCompleteCalledRef = useRef(false)

  useEffect(() => { gameCompleteCalledRef.current = false }, [game])

  if (!gamesUnlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: theme.bg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="absolute top-safe left-4 mt-4 font-round text-white/60 text-sm">
          Back
        </motion.button>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center">
          <div className="text-7xl mb-5">🔒</div>
          <h2 className="font-bubble text-white text-2xl mb-3">Games Locked</h2>
          <p className="font-round text-white/60 text-sm mb-2 max-w-xs mx-auto">
            Complete <span style={{ color: theme.accent }} className="font-bold">2 learning modules</span> today to unlock the Game Arena.
          </p>
          <p className="font-round text-white/40 text-xs mt-1">Study first. Game Arena opens after.</p>
        </motion.div>
      </div>
    )
  }

  if (game && !result) {
    const handleDone = (score, total = 1) => {
      if (gameCompleteCalledRef.current) return
      gameCompleteCalledRef.current = true
      setResult({ game, score })
      confetti({ particleCount: 100, spread: 130 })
      onComplete?.({ game, score, correct: score, total })
    }

    return (
      <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
        <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setGame(null)} className="font-round text-white/60 text-sm">
            Games
          </motion.button>
          <p className="font-bubble text-white text-base">{GAMES.find((item) => item.id === game)?.label}</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
          {game === 'maze' && <MazeMunchGame theme={theme} onDone={handleDone} />}
          {game === 'quest' && <QuestDashGame theme={theme} onDone={handleDone} />}
          {game === 'tower' && <TowerBuilderGame theme={theme} onDone={handleDone} />}
          {game === 'forge' && <WordForgeGame theme={theme} onDone={handleDone} />}
          {game === 'memory' && <MemoryGame theme={theme} onDone={handleDone} />}
          {game === 'quiz' && <BloomQuizShow ageGroup="junior" played={played} onBack={() => setGame(null)} onComplete={({ correct, total }) => handleDone(correct, total)} />}
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: theme.bg }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center">
          <YaagviCharacter state="celebrate" size={130} className="mx-auto mb-4" />
          <h2 className="font-bubble text-white text-2xl mb-2">Game Complete</h2>
          <p className="font-round text-white/60 mb-6">Score: {result.score}</p>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => { setResult(null); setGame(result.game) }}
              className="px-6 py-3 rounded-2xl font-round text-white"
              style={{ background: theme.primary }}
            >
              Play Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setResult(null)}
              className="px-6 py-3 rounded-2xl font-round text-white"
              style={{ background: theme.card, border: `1px solid ${theme.primary}50` }}
            >
              Other Games
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">
          Back
        </motion.button>
        <p className="font-bubble text-white text-lg">Game Arena</p>
        <span className="ml-auto font-round text-green-400 text-xs">Unlocked</span>
      </div>

      <div className="px-5 pt-5 pb-3">
        <div className="rounded-3xl p-5 border" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(14,165,233,0.16))', borderColor: `${theme.primary}45` }}>
          <p className="font-bubble text-white text-2xl">Choose your mission</p>
          <p className="font-round text-white/55 text-sm mt-1">Fast games, movement, building, and rewards after study time.</p>
        </div>
      </div>

      <div className="flex-1 px-5 pt-2 pb-8 grid gap-4">
        {GAMES.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGame(item.id)}
            className="p-5 rounded-2xl flex items-center gap-4 text-left overflow-hidden relative"
            style={{ background: theme.card, border: `1px solid ${theme.primary}50` }}
          >
            <span className="w-16 h-16 rounded-2xl flex items-center justify-center font-bubble text-white text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
              {item.badge}
            </span>
            <div className="min-w-0">
              <p className="font-bubble text-white text-lg">{item.label}</p>
              <p className="font-round text-white/50 text-sm">{item.desc}</p>
            </div>
            <span className="ml-auto text-white/40 font-bubble">GO</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
