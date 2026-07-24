import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getNeverFinishedAdventure, launchNeverFinishedAdventure, settleNeverFinishedAdventure } from '../utils/adventureDirector.js'

const AGE_COPY = {
  toddler: { eyebrow: 'Keep playing', heading: 'Another little adventure is ready!', button: 'PLAY AGAIN', colors: ['#ff7a2f', '#ef476f'] },
  early: { eyebrow: 'The map never ends', heading: 'Continue exploring', button: 'FOLLOW THE NEW CLUE', colors: ['#7a3bad', '#ec4899'] },
  junior: { eyebrow: 'Unlimited expedition mode', heading: 'Proceed to the next mission', button: 'START BONUS EXPEDITION', colors: ['#7d321f', '#553060'] },
}

export default function NeverFinishedAdventure({ ageGroup = 'early', progress = {}, active = true, onNavigate, onUpdateProgress }) {
  const copy = AGE_COPY[ageGroup] || AGE_COPY.early
  const settled = useMemo(() => settleNeverFinishedAdventure(progress), [progress])
  const adventure = useMemo(() => getNeverFinishedAdventure(settled, ageGroup), [settled, ageGroup])

  useEffect(() => {
    if (settled === progress) return
    onUpdateProgress?.({ adventureDirector: settled.adventureDirector })
  }, [settled, progress, onUpdateProgress])

  if (!active) return null
  const launch = () => {
    const next = launchNeverFinishedAdventure(settled, adventure)
    onUpdateProgress?.({ adventureDirector: next.adventureDirector })
    try {
      sessionStorage.setItem('bloom_living_launch', adventure.module.id)
      sessionStorage.setItem('bloom_endless_adventure', JSON.stringify({ id: adventure.id, moduleId: adventure.module.id, contentSeed: adventure.contentSeed, sessionSize: adventure.sessionSize, difficulty: adventure.difficulty }))
    } catch {}
    onNavigate?.(adventure.module.id)
  }

  return <section id="never-finished-adventure" data-testid={`never-finished-${ageGroup}`} className="mx-auto mt-5 max-w-6xl px-4 md:px-6 xl:px-8">
    <div className="relative overflow-hidden rounded-[30px] border-2 border-[#6d3a22]/20 bg-[#fff9e9] p-5 shadow-xl sm:p-6">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{background:copy.colors[1]}}/>
      <div className="relative grid gap-5 sm:grid-cols-[1fr_250px] sm:items-center">
        <div><p className="font-round text-[11px] font-black uppercase tracking-[.2em]" style={{color:copy.colors[0]}}>{copy.eyebrow}</p><h2 className="mt-1 font-bubble text-3xl text-[#351407]">{copy.heading}</h2><div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/85 p-4 shadow"><motion.div className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-4xl shadow" style={{background:`linear-gradient(145deg,${copy.colors[1]}35,#fff)`}} animate={{y:[0,-5,0]}} transition={{duration:1.7,repeat:Infinity}}>{adventure.module.emoji}</motion.div><div><p className="font-bubble text-xl text-[#3d190c]">{adventure.mission.title}</p><p className="font-round text-sm font-bold text-[#79533e]">{adventure.mission.instruction}</p><p className="mt-1 font-round text-[10px] font-black uppercase tracking-wider" style={{color:copy.colors[0]}}>{adventure.module.label} · {adventure.difficultyLabel} · {adventure.sessionSize} clues</p></div></div></div>
        <div className="rounded-[24px] bg-[#321b30] p-4 text-center text-white shadow-lg"><p className="text-5xl">🧭</p><p className="mt-2 font-bubble text-lg">Expedition #{adventure.runNumber}</p><p className="mt-1 font-round text-xs font-bold text-white/65">Recent destinations are skipped automatically.</p><motion.button data-testid="never-finished-launch" whileTap={{scale:.95}} onClick={launch} className="mt-4 min-h-14 w-full rounded-2xl px-3 font-bubble text-sm text-white shadow-lg" style={{background:`linear-gradient(100deg,${copy.colors[0]},${copy.colors[1]})`}}>{copy.button} →</motion.button></div>
      </div>
    </div>
  </section>
}
