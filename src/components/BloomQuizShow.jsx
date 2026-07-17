import React, { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech.js'
import { createBloomQuiz, getBloomQuizPrize } from '../utils/bloomQuiz.js'

const COPY = {
  toddler: { title: 'Yaagvi’s Picture Show', seat: 'Take my seat!', correct: 'The lights love that answer!', wrong: 'Brave try — the show goes on!' },
  early: { title: 'The Big Bloom Quiz', seat: 'Take the contestant seat', correct: 'That answer lights the stage!', wrong: 'Good attempt — next spotlight!' },
  junior: { title: 'Bloom Brain Championship', seat: 'Enter the championship', correct: 'Locked in — correct!', wrong: 'Not this time. Reset for the next one.' },
}

export default function BloomQuizShow({ ageGroup = 'early', profileName = 'Explorer', played = 0, onBack, onComplete }) {
  const copy = COPY[ageGroup] || COPY.early
  const questions = useMemo(() => createBloomQuiz(ageGroup, { played, seed: `${new Date().toISOString().slice(0, 10)}:${Date.now()}` }), [ageGroup, played])
  const { speak, speaking, primeSpeech } = useSpeech()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [mistakes, setMistakes] = useState([])
  const [selected, setSelected] = useState('')
  const [removed, setRemoved] = useState([])
  const [hintOpen, setHintOpen] = useState(false)
  const [usedHalf, setUsedHalf] = useState(false)
  const [usedHint, setUsedHint] = useState(false)
  const timer = useRef(null)
  const question = questions[index]
  const prize = getBloomQuizPrize(correct, questions.length, ageGroup)

  const sayQuestion = () => {
    primeSpeech()
    speak(`${question.prompt}. Your choices are ${question.options.filter(option => !removed.includes(option)).join(', ')}`, { mood: 'instruct' })
  }
  const start = () => {
    primeSpeech()
    setPhase('play')
    window.setTimeout(() => speak(`Welcome, ${profileName}. You are today’s contestant. First question. ${questions[0].prompt}`, { mood: 'guide' }), 120)
  }
  const useHalf = () => {
    if (usedHalf || selected) return
    const wrong = question.options.filter(option => option !== question.answer)
    setRemoved(wrong.slice(0, ageGroup === 'toddler' ? 1 : 2))
    setUsedHalf(true)
  }
  const useHint = () => {
    if (usedHint || selected) return
    setHintOpen(true)
    setUsedHint(true)
    primeSpeech()
    speak(question.hint, { mood: 'guide' })
  }
  const choose = option => {
    if (selected || removed.includes(option)) return
    setSelected(option)
    const won = option === question.answer
    const nextCorrect = correct + (won ? 1 : 0)
    if (won) {
      setCorrect(nextCorrect)
      confetti({ particleCount: 40, spread: 80, origin: { y: .62 } })
    } else {
      setMistakes(current => [...current, question.id])
    }
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (index >= questions.length - 1) {
        const finalPrize = getBloomQuizPrize(nextCorrect, questions.length, ageGroup)
        setPhase('complete')
        confetti({ particleCount: 150, spread: 140, origin: { y: .45 } })
        speak(`${profileName}, you won the ${finalPrize.title}!`, { mood: 'celebrate' })
      } else {
        const next = index + 1
        setIndex(next)
        setSelected('')
        setRemoved([])
        setHintOpen(false)
        primeSpeech()
        window.setTimeout(() => speak(`${questions[next].prompt}. Your choices are ${questions[next].options.join(', ')}`, { mood: 'instruct' }), 160)
      }
    }, won ? 1000 : 1350)
  }

  if (phase === 'intro') return <div className="relative min-h-[calc(100dvh-68px)] overflow-hidden bg-[radial-gradient(circle_at_50%_18%,#8d4bd8_0,#30115e_38%,#120728_78%)] px-4 py-8 text-white">
    <StageLights />
    <button onClick={onBack} className="relative z-10 rounded-full border border-white/25 bg-white/10 px-4 py-2 font-round text-sm font-black">← Back</button>
    <div className="relative z-10 mx-auto grid max-w-5xl items-center gap-4 sm:grid-cols-[1fr_320px]">
      <div className="text-center sm:text-left"><p className="font-round text-xs font-black uppercase tracking-[.28em] text-[#ffd75b]">Tonight on the Bloom Stage</p><h1 className="mt-2 font-bubble text-4xl leading-tight sm:text-6xl">{copy.title}</h1><p className="mt-3 font-round text-lg font-bold text-white/75">{profileName}, you are the contestant. Answer, climb the prize lights, and open a real Bloom chest.</p><motion.button whileTap={{ scale: .95 }} onClick={start} className="mt-7 min-h-16 rounded-2xl bg-gradient-to-r from-[#ff8a25] to-[#ed397e] px-8 font-bubble text-xl text-white shadow-[0_0_36px_rgba(255,111,82,.55)]">🎤 {copy.seat} →</motion.button><p className="mt-3 font-round text-xs text-white/50">Original Bloom game show · Yaagvi is your host</p></div>
      <motion.img src="/yaagvi-3d-wave.png" alt="Yaagvi hosts the Bloom quiz show" className="mx-auto h-[360px] w-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,.45)]" animate={{ y: [0,-8,0], rotate: [-1,1,-1] }} transition={{ duration: 2.2, repeat: Infinity }}/>
    </div>
  </div>

  if (phase === 'complete') return <div className="relative grid min-h-[calc(100dvh-68px)] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,#9c55e7,#32115f_48%,#120728)] p-5 text-white"><StageLights/><motion.div className="relative z-10 w-full max-w-xl rounded-[34px] border-4 border-[#ffd75b] bg-[#fff4dc] p-6 text-center text-[#381130] shadow-2xl sm:p-9" initial={{ scale: .6, rotate: -3 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}><motion.div className="text-7xl" animate={{ y: [0,-8,0] }} transition={{ repeat: Infinity, duration: 1.4 }}>🎁</motion.div><p className="mt-2 font-round text-xs font-black uppercase tracking-[.2em] text-[#a4481f]">The prize lights chose</p><h2 className="mt-1 font-bubble text-3xl sm:text-4xl">{prize.title}</h2><p className="mt-3 font-round text-base font-black">{correct} of {questions.length} spotlight questions solved</p><div className="my-4 flex justify-center gap-1">{Array.from({length:prize.stars},(_,i)=><span key={i} className="text-4xl">⭐</span>)}</div><p className="font-round text-sm font-bold text-[#765033]">{prize.message}</p><button onClick={() => onComplete?.({ stars: prize.stars, correct, total: questions.length, struggles: mistakes })} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#ff7b2c] to-[#ed3a82] font-bubble text-xl text-white shadow-lg">Open my prize →</button></motion.div></div>

  return <div className="relative min-h-[calc(100dvh-68px)] overflow-hidden bg-[radial-gradient(circle_at_50%_12%,#7a45bd,#2b1057_46%,#100621)] p-3 text-white sm:p-6">
    <StageLights />
    <div className="relative z-10 mx-auto max-w-5xl">
      <div className="flex items-center gap-3"><button onClick={onBack} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-round text-sm font-black">← Exit</button><div className="min-w-0 flex-1"><p className="truncate font-bubble text-lg">{copy.title}</p><div className="mt-1 flex gap-1">{questions.map((_,step)=><span key={step} className={`h-2 flex-1 rounded-full ${step<index?'bg-[#59d68a]':step===index?'bg-[#ffd75b]':'bg-white/15'}`}/>)}</div></div><span className="rounded-xl bg-[#ffd75b] px-3 py-2 font-bubble text-[#391137]">{index+1}/{questions.length}</span></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[170px_1fr]"><div className="hidden sm:block"><motion.img src="/yaagvi-3d-wave.png" alt="Yaagvi asks the question" className="h-64 w-full object-contain drop-shadow-xl" animate={{ y: [0,-5,0] }} transition={{ duration: 2, repeat: Infinity }}/><p className="rounded-2xl bg-white/10 p-3 text-center font-round text-xs font-bold text-white/70">Host Yaagvi</p></div><section className="rounded-[30px] border-2 border-white/20 bg-[#1a0d36]/80 p-4 shadow-2xl backdrop-blur-md sm:p-7"><div className="flex items-center justify-between gap-3"><p className="font-round text-[11px] font-black uppercase tracking-[.2em] text-[#ffd75b]">{question.category}</p><button onClick={sayQuestion} className="rounded-full bg-white/10 px-3 py-2 font-round text-xs font-black" aria-label="Hear the host read this question">{speaking?'🔊':'🔈'} Hear host</button></div>{question.visual&&<div className="mt-4 text-center text-4xl leading-relaxed sm:text-5xl">{question.visual}</div>}<h2 className="mt-4 text-center font-bubble text-2xl leading-snug sm:text-4xl">{question.prompt}</h2>{hintOpen&&<motion.p initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mx-auto mt-3 max-w-xl rounded-2xl bg-[#fff5cb] p-3 text-center font-round text-sm font-black text-[#633419]">🧭 {question.hint}</motion.p>}<div className={`mt-6 grid gap-3 ${ageGroup==='toddler'?'sm:grid-cols-3':'sm:grid-cols-2'}`}>{question.options.map((option,optionIndex)=>{const hidden=removed.includes(option),isAnswer=option===question.answer,isPicked=option===selected;return <motion.button key={option} data-companion-answer={isAnswer?'correct':'wrong'} disabled={hidden||Boolean(selected)} whileTap={{scale:.96}} onClick={()=>choose(option)} className={`min-h-16 rounded-2xl border-2 px-4 font-bubble text-lg shadow-lg transition ${hidden?'pointer-events-none scale-90 opacity-0':selected&&isAnswer?'border-[#7df0a5] bg-[#187d48]':isPicked?'border-[#ff9f9f] bg-[#9b2945]':'border-white/20 bg-white/10 hover:bg-white/20'}`}><span className="mr-2 text-[#ffd75b]">{String.fromCharCode(65+optionIndex)}</span>{option}</motion.button>})}</div><AnimatePresence>{selected&&<motion.p className={`mt-4 text-center font-bubble text-lg ${selected===question.answer?'text-[#7df0a5]':'text-[#ffd27a]'}`} initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}}>{selected===question.answer?copy.correct:copy.wrong}</motion.p>}</AnimatePresence></section></div>
      <div className="mt-4 flex flex-wrap justify-center gap-3"><button disabled={usedHalf||Boolean(selected)} onClick={useHalf} className="min-h-12 rounded-full border border-white/20 bg-white/10 px-5 font-round text-sm font-black disabled:opacity-35">½ Half the choices</button><button disabled={usedHint||Boolean(selected)} onClick={useHint} className="min-h-12 rounded-full border border-white/20 bg-white/10 px-5 font-round text-sm font-black disabled:opacity-35">🧭 Yaagvi clue</button></div>
    </div>
  </div>
}

function StageLights() {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden><motion.div className="absolute -left-20 -top-36 h-[620px] w-32 origin-top rotate-[24deg] bg-gradient-to-b from-[#ffe783]/45 to-transparent blur-xl" animate={{rotate:[18,34,18]}} transition={{duration:4,repeat:Infinity}}/><motion.div className="absolute -right-20 -top-36 h-[620px] w-32 origin-top -rotate-[24deg] bg-gradient-to-b from-[#74dfff]/40 to-transparent blur-xl" animate={{rotate:[-18,-34,-18]}} transition={{duration:4.6,repeat:Infinity}}/><div className="absolute inset-x-0 bottom-0 h-36 bg-[radial-gradient(ellipse_at_center,#e94a8d55,transparent_65%)]"/></div>
}
