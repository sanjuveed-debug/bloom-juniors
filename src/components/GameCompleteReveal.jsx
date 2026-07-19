import React from 'react'
import { motion } from 'framer-motion'
import YaagviCharacter from './YaagviCharacter.jsx'

const COPY = {
  toddler: { eyebrow: 'YOU FOUND IT!', title: 'Happy treasure dance!', continue: 'Next adventure', replay: 'Play again' },
  early: { eyebrow: 'TRAIL COMPLETE', title: 'You moved the adventure!', continue: 'Continue adventure', replay: 'Replay this game' },
  junior: { eyebrow: 'MISSION COMPLETE', title: 'Expedition progress saved!', continue: 'Continue expedition', replay: 'Retry this mission' },
}

export default function GameCompleteReveal({ ageGroup = 'early', place, icon, result = {}, treasureMessage = '', onReplay, onContinue, onHome }) {
  const copy = COPY[ageGroup] || COPY.early
  const stars = Math.max(1, Math.min(3, Number(result.stars) || (Number(result.total) > 0 ? Math.ceil((Number(result.correct) / Number(result.total)) * 3) : 3)))
  const scoreText = Number(result.total) > 0
    ? ageGroup === 'toddler'
      ? `All ${Number(result.total)} clues found!`
      : `${Math.max(0, Number(result.correct) || 0)} of ${Number(result.total)} clues solved`
    : 'Your journey has been saved'
  return <motion.div data-testid="game-complete-reveal" className="fixed inset-0 z-[255] grid place-items-center overflow-y-auto bg-[#241331]/80 p-3 backdrop-blur-md sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.section className="relative w-full max-w-3xl overflow-hidden rounded-[34px] border-4 border-[#ffe5a8] bg-[#fff5df] shadow-2xl" initial={{ y: 34, scale: .88 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: .94 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }}>
      <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: 'url(/treasure-map-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff7e8]/95 via-[#fff3d8]/92 to-[#f3d4ef]/88" />
      <div className="relative grid min-h-[500px] items-center gap-3 p-5 sm:grid-cols-[1fr_240px] sm:p-9">
        <div>
          <p className="font-round text-xs font-black uppercase tracking-[.2em] text-[#a33e18]">{copy.eyebrow}</p>
          <h2 className="mt-2 font-bubble text-3xl leading-tight text-[#351407] sm:text-5xl">{copy.title}</h2>
          <p className="mt-2 font-round text-base font-bold text-[#7b4a2e]">{icon} {place}</p>
          <div className="mt-5 flex gap-2" aria-label={`${stars} stars earned`}>{[1,2,3].map(value => <motion.span key={value} className={`text-5xl ${value <= stars ? '' : 'grayscale opacity-20'}`} initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: .12 * value, type: 'spring' }}>⭐</motion.span>)}</div>
          <p className="mt-3 font-bubble text-xl text-[#542219]">{scoreText}</p>
          <div className="mt-4 rounded-2xl border-2 border-[#f2ba55]/45 bg-white/65 p-3 font-round text-sm font-black text-[#694021]">🎁 {treasureMessage || result.reward || 'Treasure XP, quest progress, and your learning journey are saved.'}</div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <motion.button whileTap={{ scale: .96 }} onClick={onContinue} className="min-h-14 rounded-2xl bg-gradient-to-r from-[#f06a35] to-[#e83f83] px-5 font-bubble text-lg text-white shadow-lg">{copy.continue} →</motion.button>
            <motion.button whileTap={{ scale: .96 }} onClick={onReplay} className="min-h-14 rounded-2xl border-2 border-[#6d315d]/20 bg-white/85 px-5 font-bubble text-lg text-[#542045]">↻ {copy.replay}</motion.button>
          </div>
          <button onClick={onHome} className="mt-4 min-h-11 w-full font-round text-sm font-black text-[#7b543d] underline decoration-2 underline-offset-4">Return to Bloom Home</button>
        </div>
        <div className="relative mx-auto hidden h-80 w-56 self-end sm:block"><motion.div className="absolute inset-x-5 bottom-4 h-9 rounded-full bg-[#69351d]/20 blur-md" animate={{ scaleX: [1, .8, 1] }} transition={{ duration: 1.4, repeat: Infinity }} /><motion.div className="relative h-full w-full" animate={{ y: [0,-12,0] }} transition={{ duration: 1.4, repeat: Infinity }}><YaagviCharacter state="celebrate" size="100%" imageClassName="drop-shadow-2xl" /></motion.div></div>
      </div>
      <div className="pointer-events-none absolute inset-0" aria-hidden>{Array.from({length:18},(_,index)=><motion.span key={index} className="absolute text-xl" style={{left:`${5+(index*17)%90}%`,top:'-8%'}} animate={{y:['0vh','105vh'],rotate:[0,index%2?280:-280]}} transition={{duration:2.8+(index%4)*.4,delay:(index%6)*.16,repeat:Infinity}}>✨</motion.span>)}</div>
    </motion.section>
  </motion.div>
}
