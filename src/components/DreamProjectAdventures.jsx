import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { TreasureChestReward } from './TreasureCollection.jsx'
import { formatLocalDate } from '../utils/date.js'
import {
  PROJECT_ADVENTURE_CLUES,
  claimProjectAdventureSouvenir,
  completeProjectAdventure,
  findProjectAdventureClue,
  getProjectAdventureState,
  startProjectAdventure,
} from '../utils/projectAdventures.js'

const CLUE_POSITIONS = [
  { left: '18%', top: '56%' },
  { left: '49%', top: '28%' },
  { left: '77%', top: '60%' },
]

const AGE_COPY = {
  toddler: { eyebrow: 'Treehouse visitor adventure', button: 'WELCOME TODAY’S VISITOR', helper: 'A new little friend or surprise can visit your Treehouse.' },
  early: { eyebrow: 'Skyship destination', button: 'FLY TO THIS WORLD', helper: 'Your finished Skyship can discover another world whenever you want.' },
  junior: { eyebrow: 'Headquarters expedition', button: 'LAUNCH THIS EXPEDITION', helper: 'Use your completed Headquarters to investigate a rotating mystery.' },
}

export default function DreamProjectAdventures({ progress = {}, ageGroup = 'early', onUpdateProgress }) {
  const date = formatLocalDate()
  const adventure = useMemo(() => getProjectAdventureState(progress.projectAdventures, ageGroup, date), [progress.projectAdventures, ageGroup, date])
  const copy = AGE_COPY[adventure.ageGroup] || AGE_COPY.early
  const destination = adventure.destination
  const [showMission, setShowMission] = useState(Boolean(adventure.active))
  const [celebration, setCelebration] = useState(null)

  if (!destination) return null

  const start = () => {
    onUpdateProgress?.(current => ({
      projectAdventures: startProjectAdventure(current?.projectAdventures, adventure.ageGroup, date),
    }))
    setShowMission(true)
  }

  const findClue = clueId => {
    onUpdateProgress?.(current => ({
      projectAdventures: findProjectAdventureClue(current?.projectAdventures, clueId),
    }))
    confetti({ particleCount: 28, spread: 70, origin: { y: .55 }, colors: destination.colors })
  }

  const collect = () => {
    const preview = completeProjectAdventure(progress.projectAdventures)
    if (!preview.completed) return
    const runId = adventure.active?.runId
    onUpdateProgress?.(current => {
      const result = completeProjectAdventure(current?.projectAdventures)
      if (!result.completed) return {}
      return {
        projectAdventures: result.state,
        treasureCollection: claimProjectAdventureSouvenir(current?.treasureCollection, result.reward, runId || result.state.history.at(-1)?.runId, { duplicate: result.duplicate }),
      }
    })
    setShowMission(false)
    setCelebration({ reward: preview.reward, duplicate: preview.duplicate })
    confetti({ particleCount: 150, spread: 145, origin: { y: .58 }, colors: [...destination.colors, '#fde047', '#ffffff'] })
  }

  return <>
    <section data-testid="dream-project-adventures" className="mt-4 overflow-hidden rounded-[30px] border-2 border-white/70 bg-white/85 shadow-xl">
      <div className="grid sm:grid-cols-[1fr_auto]">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <motion.div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-4xl text-white shadow-lg" style={{ background: `linear-gradient(145deg,${destination.colors[0]},${destination.colors[1]})` }} animate={{ y: [0, -5, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2.2, repeat: Infinity }}>{destination.icon}</motion.div>
            <div className="min-w-0">
              <p className="font-round text-[10px] font-black uppercase tracking-[.18em]" style={{ color: destination.colors[0] }}>{copy.eyebrow}</p>
              <h2 className="mt-1 font-bubble text-2xl text-[#38180b]">{adventure.active ? `Continue ${destination.title}` : destination.title}</h2>
              <p className="mt-1 font-round text-sm font-bold leading-5 text-[#79533e]">{destination.summary}</p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-[#fff6df] px-4 py-3 font-round text-xs font-bold leading-5 text-[#79533e]">{copy.helper}</p>
        </div>
        <div className="flex min-w-[245px] flex-col justify-center p-5 pt-0 sm:border-l sm:border-[#eadbc5] sm:pt-5">
          <div className="flex justify-between font-round text-[10px] font-black uppercase tracking-[.12em] text-[#87634b]"><span>{adventure.completedRuns} trips complete</span><span>{adventure.uniqueSouvenirs}/6 souvenirs</span></div>
          <div className="mt-2 flex gap-1.5">{Array.from({ length: 6 }).map((_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index < adventure.uniqueSouvenirs ? 'bg-emerald-500' : 'bg-[#ded1bf]'}`}/>)}</div>
          <motion.button data-testid="start-project-adventure" whileTap={{ scale: .96 }} onClick={adventure.active ? () => setShowMission(true) : start} className="mt-4 min-h-14 rounded-2xl px-4 font-bubble text-sm text-white shadow-lg" style={{ background: `linear-gradient(100deg,${destination.colors[0]},${destination.colors[1]})` }}>{adventure.active ? `CONTINUE · ${adventure.foundCount}/${PROJECT_ADVENTURE_CLUES}` : copy.button} →</motion.button>
          <p className="mt-2 text-center font-round text-[9px] font-bold text-[#9a795f]">No waiting until tomorrow · take another trip after this one</p>
        </div>
      </div>
    </section>

    <AnimatePresence>{showMission && adventure.active && <motion.div data-testid="project-adventure-mission" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[360] flex items-center justify-center overflow-y-auto bg-[#160d2b]/90 p-3 backdrop-blur-lg">
      <motion.div initial={{ scale: .75, y: 55 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .85, opacity: 0 }} transition={{ type: 'spring', damping: 22 }} className="w-full max-w-3xl overflow-hidden rounded-[34px] border-4 border-white/60 bg-[#fff8e8] shadow-2xl">
        <div className="relative h-[420px] overflow-hidden sm:h-[500px]" style={{ background: `radial-gradient(circle at 50% 48%,${destination.colors[1]} 0%,${destination.colors[0]} 48%,#211442 100%)` }}>
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle,#fff 1.5px,transparent 1.5px)', backgroundSize: '26px 26px' }}/>
          {[12, 34, 68, 88].map((left, index) => <motion.span key={left} className="absolute text-3xl text-white/50" style={{ left: `${left}%`, top: `${16 + index * 18}%` }} animate={{ y: [0, -12, 0], rotate: [0, 12, 0], opacity: [.25, .8, .25] }} transition={{ duration: 2 + index * .35, repeat: Infinity }}>✦</motion.span>)}
          <button type="button" onClick={() => setShowMission(false)} className="absolute right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/30 font-bubble text-white backdrop-blur">×</button>
          <div className="absolute left-4 top-4 z-20 max-w-[76%] rounded-2xl bg-black/30 p-4 text-white backdrop-blur">
            <p className="font-round text-[9px] font-black uppercase tracking-[.18em] text-yellow-200">{copy.eyebrow} · {adventure.foundCount}/{PROJECT_ADVENTURE_CLUES}</p>
            <h2 className="font-bubble text-2xl sm:text-3xl">{destination.title}</h2>
            <p className="mt-1 font-round text-xs font-bold text-white/80">{adventure.ready ? 'Everything is found—your souvenir is ready!' : destination.summary}</p>
          </div>
          <motion.div className="absolute left-1/2 top-[47%] text-8xl sm:text-9xl" style={{ translateX: '-50%', translateY: '-50%' }} animate={{ y: [0, -8, 0], scale: [1, 1.04, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>{destination.icon}</motion.div>
          {destination.clues.map(([id, label, icon], index) => {
            const found = adventure.active.found.includes(id)
            return <motion.button key={id} type="button" aria-label={`Find ${label}`} disabled={found} onClick={() => findClue(id)} className={`absolute z-20 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 text-4xl shadow-2xl sm:h-24 sm:w-24 sm:text-5xl ${found ? 'border-emerald-200 bg-emerald-500' : 'border-white/80 bg-white/90'}`} style={CLUE_POSITIONS[index]} animate={found ? { scale: [1, 1.18, 1] } : { y: [0, -7, 0], rotate: [-4, 4, -4] }} transition={{ duration: 1.5 + index * .25, repeat: found ? 0 : Infinity }}>{found ? '✓' : icon}<span className="absolute -bottom-8 whitespace-nowrap rounded-xl bg-black/60 px-2 py-1 font-round text-[9px] font-black text-white">{found ? `${label} found` : label}</span></motion.button>
          })}
          <div className="absolute inset-x-4 bottom-4 z-30">
            {adventure.ready
              ? <motion.button data-testid="collect-project-souvenir" initial={{ scale: .7 }} animate={{ scale: [1, 1.035, 1] }} transition={{ duration: 1, repeat: Infinity }} onClick={collect} className="min-h-16 w-full rounded-2xl bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 font-bubble text-lg text-[#3d1a15] shadow-2xl">OPEN MY SOUVENIR {destination.souvenir.emoji} →</motion.button>
              : <div className="rounded-2xl bg-black/35 p-3 text-center font-round text-xs font-black text-white backdrop-blur">Tap the three glowing discoveries · your companion is exploring too</div>}
          </div>
        </div>
      </motion.div>
    </motion.div>}</AnimatePresence>

    <AnimatePresence>{celebration && <TreasureChestReward item={celebration.reward} duplicate={celebration.duplicate} duplicateDust={5} ageGroup={adventure.ageGroup} contextLabel="Adventure complete" actionLabel="KEEP IT AND EXPLORE AGAIN" onClose={() => setCelebration(null)} />}</AnimatePresence>
  </>
}
