import React, { useMemo, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { THEMES } from '../themes'

const COINS = [1, 2, 5, 10, 20, 50]

const EARLY_ROUNDS = [
  { type: 'save', title: 'Save for a sticker', target: 6, prompt: 'Put 6 pennies in the piggy bank.', options: [1, 2, 5, 10] },
  { type: 'save', title: 'Save for a book', target: 12, prompt: 'Make 12 pennies for the book fund.', options: [1, 2, 5, 10] },
  { type: 'spend', title: 'Can we buy it?', price: 8, balance: 10, prompt: 'You have 10p. The crayon costs 8p. Can you buy it?', answer: 'yes' },
  { type: 'choice', title: 'Need or want?', prompt: 'Lunch is a need or a want?', answer: 'need', options: ['need', 'want'] },
  { type: 'save', title: 'Rainbow goal', target: 15, prompt: 'Save exactly 15 pennies.', options: [1, 2, 5, 10] },
]

const JUNIOR_ROUNDS = [
  { type: 'save', title: 'Emergency fund', target: 35, prompt: 'Deposit coins to save exactly 35p.', options: [5, 10, 20, 50] },
  { type: 'budget', title: 'Budget check', income: 50, save: 20, spend: 25, prompt: 'You earn 50p, save 20p, and spend 25p. How much is left?', answer: 5, options: [0, 5, 10, 15] },
  { type: 'choice', title: 'Smart money', prompt: 'Which is usually smarter first?', answer: 'save', options: ['save', 'spend'] },
  { type: 'interest', title: 'Bonus saving', start: 40, bonus: 4, prompt: 'You save 40p and get a 4p bonus. What is the new balance?', answer: 44, options: [36, 40, 44, 48] },
  { type: 'budget', title: 'Goal planner', income: 80, save: 30, spend: 35, prompt: 'You have 80p, save 30p, and spend 35p. What is left?', answer: 15, options: [10, 15, 20, 25] },
]

function getRounds(ageGroup) {
  return ageGroup === 'junior' ? JUNIOR_ROUNDS : EARLY_ROUNDS
}

function formatMoney(value) {
  return `${value}p`
}

export default function PiggyBankGame({
  ageGroup = 'early',
  avatar,
  theme: themeOverride,
  profileName,
  onBack,
  onComplete,
}) {
  const theme = themeOverride || THEMES[avatar] || THEMES.yaagvi || THEMES.rumi
  const rounds = useMemo(() => getRounds(ageGroup), [ageGroup])
  const { speak } = useSpeech()
  const [roundIndex, setRoundIndex] = useState(0)
  const [coinPile, setCoinPile] = useState([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const transitioningRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const round = rounds[roundIndex]
  const coinTotal = coinPile.reduce((sum, coin) => sum + coin, 0)
  const learnerName = profileName || 'Superstar'

  const nextRound = (wasCorrect) => {
    if (completedRef.current) return
    const nextScore = score + (wasCorrect ? 1 : 0)
    setScore(nextScore)
    setCoinPile([])

    if (roundIndex >= rounds.length - 1) {
      completedRef.current = true
      setDone(true)
      confetti({ particleCount: 120, spread: 120, origin: { x: 0.5, y: 0.35 } })
      const stars = Math.max(1, Math.round((nextScore / rounds.length) * 5))
      onComplete?.({ correct: nextScore, total: rounds.length, stars })
      speak(`Piggy bank complete. You got ${nextScore} out of ${rounds.length}. Great money thinking, ${learnerName}.`, { mood: 'celebrate' })
      return
    }

    setRoundIndex(index => index + 1)
    transitioningRef.current = false
  }

  const checkSave = () => {
    if (transitioningRef.current) return
    const correct = coinTotal === round.target
    setFeedback(correct ? 'Perfect saving!' : `You made ${formatMoney(coinTotal)}. Try for ${formatMoney(round.target)}.`)
    speak(correct ? 'Perfect saving. That is exactly right.' : `You made ${coinTotal} pennies. Try again.`, {
      mood: correct ? 'celebrate' : 'guide',
    })
    if (correct) {
      transitioningRef.current = true
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        nextRound(true)
      }, 750)
      timersRef.current.push(id)
    }
  }

  const answer = (value) => {
    if (transitioningRef.current) return
    const correct = String(value) === String(round.answer)
    setFeedback(correct ? 'Correct!' : 'Good try. Think again.')
    speak(correct ? 'Correct. Nice money thinking.' : 'Good try. Think again.', {
      mood: correct ? 'celebrate' : 'guide',
    })
    if (correct) {
      transitioningRef.current = true
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        nextRound(true)
      }, 700)
      timersRef.current.push(id)
    }
  }

  const skipAfterTry = () => {
    if (transitioningRef.current) return
    transitioningRef.current = true
    setFeedback('We will practise this again later.')
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      nextRound(false)
    }, 650)
    timersRef.current.push(id)
  }

  const resetGame = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    transitioningRef.current = false
    completedRef.current = false
    setRoundIndex(0)
    setCoinPile([])
    setScore(0)
    setFeedback('')
    setDone(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 py-10" style={{ background: theme.bg || 'linear-gradient(160deg,#13052c,#071b39)' }}>
        <div className="w-full max-w-md rounded-[32px] border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur">
          <div className="text-7xl">🐷</div>
          <h1 className="font-bubble mt-3 text-3xl text-white">Piggy Bank Saved!</h1>
          <p className="font-round mt-2 text-white/70">
            {learnerName} scored {score}/{rounds.length} and earned money stars.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={resetGame}
              className="rounded-2xl px-4 py-3 font-bubble text-white"
              style={{ background: 'linear-gradient(135deg,#22C55E,#0EA5E9)' }}
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl px-4 py-3 font-bubble text-white"
              style={{ background: 'linear-gradient(135deg,#FF7A18,#FF2D55)' }}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto px-4 pb-10 pt-safe" style={{ background: theme.bg || 'linear-gradient(160deg,#13052c,#071b39)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-3 py-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-white/10 px-4 py-2 font-round text-sm font-bold text-white/75"
          >
            Back
          </button>
          <div className="rounded-full bg-white/10 px-4 py-2 font-bubble text-sm text-white">
            Round {roundIndex + 1}/{rounds.length}
          </div>
        </div>

        <div className="rounded-[34px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[30px] p-5 text-center" style={{ background: 'linear-gradient(145deg,#FDE68A,#FB7185)' }}>
              <motion.div
                className="text-8xl"
                animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 2.8, repeat: Infinity }}
              >
                🐷
              </motion.div>
              <p className="font-bubble mt-3 text-3xl text-[#3B0764]">Piggy Bank</p>
              <p className="font-round mt-2 text-sm font-bold text-[#5B2143]">
                Save, spend, and choose wisely.
              </p>
              <div className="mt-5 rounded-3xl bg-white/70 p-4">
                <p className="font-round text-xs font-black uppercase tracking-[0.18em] text-[#7C2D12]">Score</p>
                <p className="font-bubble text-4xl text-[#3B0764]">{score}</p>
              </div>
            </div>

            <div className="rounded-[30px] bg-white p-5">
              <p className="font-round text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                {ageGroup === 'junior' ? 'Money Mission' : 'Money Play'}
              </p>
              <h1 className="font-bubble mt-2 text-3xl text-[#2d0a5e]">{round.title}</h1>
              <p className="font-round mt-2 text-lg font-bold leading-7 text-slate-700">{round.prompt}</p>

              {round.type === 'save' && (
                <>
                  <div className="mt-5 rounded-[24px] border-2 border-dashed border-orange-300 bg-orange-50 p-4">
                    <p className="font-round text-sm font-bold text-slate-600">Inside piggy bank</p>
                    <p className="font-bubble text-5xl text-[#2d0a5e]">{formatMoney(coinTotal)}</p>
                    <div className="mt-3 flex min-h-[44px] flex-wrap gap-2">
                      {coinPile.map((coin, index) => (
                        <motion.button
                          key={`${coin}-${index}`}
                          type="button"
                          onClick={() => setCoinPile(prev => prev.filter((_, i) => i !== index))}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-11 w-11 rounded-full bg-yellow-300 font-bubble text-sm text-yellow-950 shadow"
                        >
                          {coin}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {(round.options || COINS).map(coin => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => {
                          setFeedback('')
                          setCoinPile(prev => [...prev, coin])
                        }}
                        className="rounded-2xl bg-yellow-300 px-3 py-4 font-bubble text-xl text-yellow-950 shadow"
                      >
                        {coin}p
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCoinPile([])}
                      className="rounded-2xl bg-slate-100 px-4 py-3 font-bubble text-slate-600"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={checkSave}
                      className="rounded-2xl px-4 py-3 font-bubble text-white"
                      style={{ background: 'linear-gradient(135deg,#22C55E,#0EA5E9)' }}
                    >
                      Check
                    </button>
                  </div>
                </>
              )}

              {round.type === 'spend' && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {['yes', 'no'].map(option => (
                    <button
                      key={option}
                      data-companion-answer={option === round.answer ? 'correct' : 'wrong'}
                      type="button"
                      onClick={() => answer(option)}
                      className="rounded-3xl px-4 py-6 font-bubble text-2xl text-white shadow"
                      style={{ background: option === 'yes' ? '#22C55E' : '#EF4444' }}
                    >
                      {option === 'yes' ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              )}

              {['choice', 'budget', 'interest'].includes(round.type) && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {round.options.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answer(option)}
                      className="rounded-3xl border-2 border-slate-100 bg-slate-50 px-4 py-5 font-bubble text-xl text-[#2d0a5e] shadow-sm"
                    >
                      {typeof option === 'number' ? formatMoney(option) : option}
                    </button>
                  ))}
                </div>
              )}

              {feedback && (
                <div className="mt-4 rounded-2xl bg-[#FFF7ED] p-3">
                  <p className="font-round text-sm font-bold text-orange-800">{feedback}</p>
                  {!/perfect|correct/i.test(feedback) && (
                    <button
                      type="button"
                      onClick={skipAfterTry}
                      className="mt-2 font-round text-xs font-black uppercase tracking-[0.14em] text-orange-600"
                    >
                      Next after this try
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
