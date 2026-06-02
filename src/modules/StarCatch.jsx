import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { THEMES } from '../themes'

// Official Read Write Inc. (RWI) Red Words — progressive sets
const WORD_SETS = [
  ['I', 'the', 'to', 'no', 'go', 'into', 'he', 'she', 'we', 'me', 'be', 'was', 'my', 'you'],
  ['they', 'her', 'all', 'are', 'said', 'have', 'like', 'so', 'do', 'some', 'come', 'were', 'there', 'little'],
  ['one', 'when', 'what', 'out', 'oh', 'their', 'people', 'could', 'asked', 'looked', 'called', 'many', 'would', 'should'],
  ['every', 'again', 'because', 'once', 'always', 'want', 'two', 'four', 'where', 'who', 'water', 'of', 'put', 'push', 'pull', 'full'],
]

function getActiveWords(sessionsPlayed) {
  if (sessionsPlayed >= 6) return WORD_SETS.flat()
  if (sessionsPlayed >= 4) return [...WORD_SETS[0], ...WORD_SETS[1], ...WORD_SETS[2]]
  if (sessionsPlayed >= 2) return [...WORD_SETS[0], ...WORD_SETS[1]]
  return WORD_SETS[0]
}

function getWordSetLevel(sessionsPlayed) {
  if (sessionsPlayed >= 6) return 4
  if (sessionsPlayed >= 4) return 3
  if (sessionsPlayed >= 2) return 2
  return 1
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const STAR_COLORS = ['#FFD700', '#FF6B9D', '#38BDF8', '#A78BFA']

function makeStars(targetWord, activeWords) {
  const others = shuffle(activeWords.filter(w => w !== targetWord)).slice(0, 3)
  return shuffle([targetWord, ...others]).map((word, i) => ({
    id: i,
    word,
    isTarget: word === targetWord,
    color: STAR_COLORS[i],
  }))
}

export default function StarCatch({ avatar, progress, onAddStars, onBack, profileName }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()

  const sessionsPlayed = progress?.tricky?.sessionsPlayed || 0
  const activeWords = useRef(getActiveWords(sessionsPlayed)).current
  const setLevel    = getWordSetLevel(sessionsPlayed)
  const shuffledWords = useRef(shuffle(activeWords)).current

  const [wordIndex, setWordIndex] = useState(0)
  const [stars, setStars]         = useState(() => makeStars(shuffledWords[0], activeWords))
  const [caught, setCaught]       = useState(new Set())
  const [shaking, setShaking]     = useState(new Set())
  const [score, setScore]         = useState(0)
  const [round, setRound]         = useState(1)
  const [feedback, setFeedback]   = useState(null)
  const [wrongWords, setWrongWords] = useState([])
  const totalRounds = 12
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const currentWord = shuffledWords[wordIndex % shuffledWords.length]

  // Speak the instruction whenever the word changes
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(`Find the word: ${currentWord}`, { mood: 'instruct' })
    }, 400)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord])

  const nextRound = useCallback(() => {
    const nextIdx = (wordIndex + 1) % shuffledWords.length
    setWordIndex(nextIdx)
    setStars(makeStars(shuffledWords[nextIdx], activeWords))
    setCaught(new Set())
    setShaking(new Set())
    setFeedback(null)
  }, [wordIndex, shuffledWords, activeWords])

  const handleStarClick = useCallback((star) => {
    if (caught.has(star.id) || shaking.has(star.id) || completedRef.current) return

    if (star.isTarget) {
      // Correct — celebrate (no need to speak star.word; celebrate message includes the word)
      setCaught(prev => new Set([...prev, star.id]))
      const finalScore = score + 1
      setScore(finalScore)
      setFeedback({ type: 'correct', msg: `✨ "${currentWord.toUpperCase()}" — well done!` })
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFD700', '#FF6B9D', '#A78BFA'],
      })
      speak(`Yes! ${currentWord}! Brilliant, ${profileName || 'superstar'}!`, { mood: 'celebrate' })

      if (round >= totalRounds) {
        completedRef.current = true
        const id = window.setTimeout(() => {
          timersRef.current = timersRef.current.filter(t => t !== id)
          onAddStars('tricky', finalScore, {
            total: totalRounds,
            correct: finalScore,
            struggles: wrongWords,
          })
        }, 900)
        timersRef.current.push(id)
      } else {
        // Give celebrate speech time to finish before next instruction fires
        const id = window.setTimeout(() => {
          timersRef.current = timersRef.current.filter(t => t !== id)
          setRound(r => r + 1)
          nextRound()
        }, 2200)
        timersRef.current.push(id)
      }
    } else {
      // Wrong — speak the tapped word, then re-cue the instruction
      // (wrong-word speak can kill the pending instruction TTS fetch)
      speak(star.word, { rate: 0.85 })
      setWrongWords(prev => [...prev, currentWord])
      setFeedback({ type: 'wrong', msg: `That says "${star.word}" — keep looking for "${currentWord}"!` })
      setShaking(prev => new Set([...prev, star.id]))
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        setShaking(prev => { const n = new Set(prev); n.delete(star.id); return n })
        setFeedback(null)
        speak(`Find the word: ${currentWord}`, { mood: 'instruct' })
      }, 1200)
      timersRef.current.push(id)
    }
  }, [caught, shaking, currentWord, score, round, totalRounds, wrongWords, speak, nextRound, onAddStars, profileName])

  if (round > totalRounds) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center">
          <div className="text-8xl mb-4">🌟</div>
          <h2 className="font-bubble text-4xl shimmer-text mb-2">Word Wizard!</h2>
          <p className="font-round text-xl mb-6" style={{ color: theme.text }}>
            You caught <span className="font-bold text-yellow-500">{score}</span> tricky words!
          </p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="bubble-btn px-8 py-4 text-xl"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            Back to Home 🏠
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <div className="text-center">
          <p className="font-round text-xs font-bold opacity-60" style={{ color: theme.text }}>
            Round {round}/{totalRounds}
          </p>
          <div className="flex gap-1 justify-center mt-0.5">
            {Array.from({ length: score }).map((_, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs">⭐</motion.span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full"
          style={{ background: theme.primary + '20' }}>
          <span className="text-base">⭐</span>
          <span className="font-bubble text-base" style={{ color: theme.primary }}>{score}</span>
        </div>
      </div>

      {/* Target word card */}
      <motion.div
        key={currentWord}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className="mx-4 rounded-3xl p-5 text-center shadow-lg"
        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <p className="font-round text-white/80 text-sm">Tap the star that says...</p>
          {setLevel > 1 && (
            <span className="bg-white/30 rounded-full px-2 py-0.5 font-bubble text-white text-xs leading-none">
              Lv.{setLevel}
            </span>
          )}
        </div>
        <p className="font-bubble text-white tracking-wider" style={{ fontSize: 52 }}>{currentWord}</p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => speak(currentWord, { rate: 0.7 })}
          className="mt-2 bg-white/20 rounded-full px-5 py-1.5 text-white font-round text-sm"
        >
          🔊 Hear it
        </motion.button>
      </motion.div>

      {/* 2×2 star grid — large tap targets, readable words */}
      <div className="flex-1 flex items-center justify-center px-4 mt-3 pb-4">
        <div className="grid grid-cols-2 gap-4 w-full" style={{ maxWidth: 400 }}>
          {stars.map((star) => {
            const isCaught  = caught.has(star.id)
            const isShaking = shaking.has(star.id)
            const fontSize  = star.word.length > 6 ? 16 : star.word.length > 4 ? 20 : 26

            return (
              <motion.button
                key={`${round}-${star.id}`}
                animate={
                  isCaught  ? { scale: [1, 1.5, 0], opacity: [1, 1, 0] } :
                  isShaking ? { x: [0, -12, 12, -10, 10, -6, 6, 0] } :
                              { scale: [1, 1.04, 1] }
                }
                transition={
                  isCaught  ? { duration: 0.45 } :
                  isShaking ? { duration: 0.55, ease: 'easeInOut' } :
                              { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                }
                disabled={isCaught}
                className="aspect-square rounded-3xl flex flex-col items-center justify-center shadow-xl"
                style={{
                  background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7), ${star.color})`,
                  border: `3px solid rgba(255,255,255,0.9)`,
                  boxShadow: isShaking
                    ? `0 0 0 4px #EF4444, 0 4px 20px ${star.color}80`
                    : `0 4px 20px ${star.color}80`,
                  cursor: isCaught ? 'default' : 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
                onClick={() => handleStarClick(star)}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>⭐</span>
                <span className="font-bubble text-white text-center mt-1 px-2 leading-tight"
                  style={{ fontSize, wordBreak: 'break-word' }}>
                  {star.word}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback.msg}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-50 ${
              feedback.type === 'correct' ? 'bg-green-400' : 'bg-orange-400'
            }`}
            style={{ maxWidth: 'calc(100vw - 32px)' }}
          >
            <p className="font-bubble text-white text-base text-center">{feedback.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
