import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech.js'
import { speakThenAdvance } from '../utils/speechAdvance.js'

export default function ToddlerChoiceAdventure({
  moduleId,
  title,
  place,
  instruction,
  questions,
  answerOf,
  optionsOf,
  promptOf,
  speechOf,
  hintOf,
  correctSpeechOf,
  renderVisual,
  renderOption,
  background = 'linear-gradient(145deg,#6d28d9,#db2777 58%,#f97316)',
  onBack,
  onDone,
}) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [guideAnswer, setGuideAnswer] = useState(false)
  const [message, setMessage] = useState('')
  const attemptsRef = useRef(0)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])
  const { speak, speaking, primeSpeech } = useSpeech()
  const current = questions[questionIndex]
  const answer = answerOf(current)
  const options = optionsOf(current)

  const hearQuestion = (question = current) => {
    if (!question) return
    primeSpeech()
    speak(speechOf(question), { mood: 'question', rate: 0.84 })
  }

  useEffect(() => {
    const start = event => {
      if (event.detail?.moduleId !== moduleId) return
      window.setTimeout(() => hearQuestion(questions[0]), 180)
    }
    window.addEventListener('bloom:module-started', start)
    return () => {
      window.removeEventListener('bloom:module-started', start)
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  // The game session is fixed for the lifetime of this mounted adventure.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  const choose = option => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    setSelected(option)

    if (option !== answer) {
      attemptsRef.current += 1
      const guided = attemptsRef.current >= 2
      setGuideAnswer(guided)
      setMessage(guided ? 'Yaagvi made the matching choice glow!' : 'Good try — use Yaagvi’s clue!')
      const clue = guided
        ? `Look for the choice with the golden glow. ${hintOf(current)}`
        : hintOf(current)
      speakThenAdvance(speak, clue, { mood: 'guide', rate: 0.84 }, () => {
        setSelected(null)
        setMessage(guided ? 'Tap the glowing choice.' : '')
        lockedRef.current = false
      }, timersRef, { minMs: 600, maxMs: 2200 })
      return
    }

    const nextScore = score + (attemptsRef.current === 0 ? 1 : 0)
    setScore(nextScore)
    setMessage('You found it!')
    confetti({ particleCount: 55, spread: 85, origin: { y: .55 } })
    speakThenAdvance(speak, correctSpeechOf(current), { mood: 'celebrate', rate: 0.84 }, () => {
      if (questionIndex >= questions.length - 1) {
        completedRef.current = true
        onDone(nextScore, questions.length)
        return
      }
      const nextIndex = questionIndex + 1
      attemptsRef.current = 0
      setSelected(null)
      setGuideAnswer(false)
      setMessage('')
      setQuestionIndex(nextIndex)
      lockedRef.current = false
      const id = window.setTimeout(() => hearQuestion(questions[nextIndex]), 160)
      timersRef.current.push(id)
    }, timersRef, { minMs: 700, maxMs: 2400 })
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden px-3 pb-8 pt-safe text-white" style={{ background }}>
      <div className="game-ambient pointer-events-none absolute inset-0 opacity-70" />
      <header className="relative z-10 mx-auto flex max-w-4xl items-center justify-between py-3">
        <button onClick={onBack} className="min-h-11 rounded-full border-2 border-white/30 bg-black/15 px-4 font-round text-sm font-black">← Map</button>
        <button aria-label="Hear Yaagvi read this question" onClick={() => hearQuestion()} className="flex min-h-11 items-center gap-2 rounded-full border-2 border-white/35 bg-white/20 px-4 font-round text-sm font-black"><span className="text-xl">{speaking ? '🔊' : '🔈'}</span><span>Hear Yaagvi</span></button>
      </header>

      <main className="relative z-10 mx-auto mt-2 max-w-4xl rounded-[32px] border-4 border-white/35 bg-[#fff8e8]/95 p-4 text-[#3b1607] shadow-2xl sm:p-7">
        <div className="flex items-center gap-3">
          <motion.img src="/yaagvi-mascot-single.webp" alt="Yaagvi guides the activity" className="h-16 w-16 object-contain drop-shadow-md sm:h-20 sm:w-20" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          <div className="min-w-0 flex-1">
            <p className="font-round text-xs font-black uppercase tracking-[.14em] text-[#a33b19]">Today’s little adventure</p>
            <p className="font-bubble text-base leading-tight sm:text-xl">{instruction}</p>
          </div>
          <span className="rounded-xl bg-[#3b1607] px-3 py-2 font-bubble text-sm text-white">{questionIndex + 1}/{questions.length}</span>
        </div>

        <div className="mt-3 flex gap-1.5" aria-label={`Question ${questionIndex + 1} of ${questions.length}`}>
          {questions.map((_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index < questionIndex ? 'bg-emerald-500' : index === questionIndex ? 'bg-orange-500' : 'bg-[#dec9a7]'}`} />)}
        </div>

        <motion.section key={`${moduleId}-${questionIndex}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-center">
          <div className="mx-auto grid min-h-44 max-w-xl place-items-center rounded-[28px] border-2 border-[#efd4a6] bg-white/80 p-4 shadow-inner">
            {renderVisual(current)}
          </div>
          <h2 className="mt-4 font-bubble text-2xl leading-tight sm:text-3xl">{promptOf(current)}</h2>
          <p aria-live="polite" className={`mt-2 min-h-6 font-round text-sm font-black ${message === 'You found it!' ? 'text-emerald-700' : 'text-[#a4481f]'}`}>{message}</p>
        </motion.section>

        <div className="mx-auto mt-3 grid max-w-2xl grid-cols-3 gap-2 sm:gap-4">
          {options.map(option => {
            const isAnswer = option === answer
            const isSelected = selected === option
            const guided = guideAnswer && isAnswer
            return (
              <motion.button
                key={String(option)}
                data-companion-answer={isAnswer ? 'correct' : 'wrong'}
                whileTap={{ scale: .93 }}
                onClick={() => choose(option)}
                className={`relative min-h-20 rounded-2xl border-[3px] px-2 py-3 font-bubble text-base shadow-md transition sm:text-xl ${
                  isSelected && isAnswer ? 'border-emerald-600 bg-emerald-500 text-white' :
                  isSelected ? 'border-rose-600 bg-rose-500 text-white' :
                  guided ? 'border-amber-500 bg-amber-100 text-[#5b2b0c] ring-4 ring-amber-300' :
                  'border-[#e8c996] bg-white text-[#4a1c0b]'
                }`}
              >
                {renderOption ? renderOption(option, current) : option}
              </motion.button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
