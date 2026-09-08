import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { COMPANION_BOND_STAGES, getCompanionBond } from '../utils/companionBond.js'
import { getCompanionPowerState } from '../utils/companionPowers.js'
import YaagviCharacter from './YaagviCharacter.jsx'

function CompanionLevelUpReveal({ previousStage, newStage, onClose }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      confetti({ particleCount: 130, spread: 130, origin: { y: 0.45 } })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [])
  return (
    <motion.div data-testid="companion-levelup-reveal" className="fixed inset-0 z-[300] grid place-items-center overflow-y-auto bg-[#1c0c2d]/88 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="relative w-full max-w-lg overflow-hidden rounded-[36px] border-4 p-6 text-center shadow-2xl" style={{ borderColor: newStage.aura, background: `linear-gradient(160deg, #fff5df 0%, ${newStage.aura}26 100%)` }}
        initial={{ scale: 0.7, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 210, damping: 18 }}>
        <p className="relative font-round text-xs font-black uppercase tracking-[.2em] text-[#a33e18]">Your friendship grew!</p>
        <div className="relative mx-auto my-4 flex justify-center"><YaagviCharacter state="celebrate" size={150} /></div>
        {previousStage && <p className="relative font-round text-sm font-bold text-[#9a5b35]">{previousStage.name} →</p>}
        <h2 className="relative mt-1 font-bubble text-3xl text-[#3b1607]">{newStage.name} {newStage.accessory}</h2>
        <p className="relative mx-auto mt-3 max-w-sm font-round text-sm font-bold text-[#694021]">{newStage.ability}</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} className="relative mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 font-bubble text-xl text-white shadow-lg">
          Yay! →
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function CompanionArt({ companion, stage, compact = false }) {
  const size = compact ? 'h-10 w-10' : 'h-24 w-24'
  return <motion.div className={`relative grid ${size} shrink-0 place-items-center overflow-visible rounded-full border-2 border-white bg-white/90 shadow-lg`} style={{boxShadow:`0 0 ${compact?14:28}px ${stage.aura}`}} animate={{y:[0,-3,0]}} transition={{duration:2,repeat:Infinity}}>
    {companion.image?<img src={companion.image} alt={companion.name} className="h-full w-full rounded-full object-contain"/>:<span className={compact?'text-2xl':'text-6xl'}>{companion.emoji || '🧸'}</span>}
    <motion.span className={`absolute -right-1 -top-1 grid place-items-center rounded-full bg-white shadow ${compact?'h-5 w-5 text-xs':'h-8 w-8 text-lg'}`} animate={{rotate:[-8,8,-8],scale:[1,1.12,1]}} transition={{duration:1.8,repeat:Infinity}}>{stage.accessory}</motion.span>
  </motion.div>
}

export function CompanionBadge({ progress, ageGroup = 'early', moduleId = '', onActivatePower }) {
  const bond = getCompanionBond(progress)
  const powerState = getCompanionPowerState(progress, ageGroup)
  const previousPoints = useRef(bond.points)
  const previousStageLevel = useRef(bond.stage.level)
  const [message,setMessage] = useState('')
  const [levelUp,setLevelUp] = useState(null)
  const toddler = ageGroup === 'toddler', junior = ageGroup === 'junior'
  useEffect(()=>{
    if (bond.stage.level > previousStageLevel.current) {
      const previousStage = COMPANION_BOND_STAGES.find(item => item.level === previousStageLevel.current) || null
      setLevelUp({ previousStage, newStage: bond.stage })
    }
    previousStageLevel.current = bond.stage.level
  },[bond.stage.level])
  useEffect(()=>{
    if (bond.points > previousPoints.current) {
      setMessage(toddler?'We grew together!':junior?`Bond +${bond.points-previousPoints.current} · strong work.`:`I felt that learning win! +${bond.points-previousPoints.current}`)
      const timer=window.setTimeout(()=>setMessage(''),2600)
      previousPoints.current=bond.points
      return ()=>window.clearTimeout(timer)
    }
    previousPoints.current=bond.points
  },[bond.points,toddler,junior])
  const tap=()=>setMessage(toddler?'Let’s play!':junior?`${bond.stage.name} ready for ${moduleId || 'the mission'}.`:`I’m learning beside you!`)
  const usePower=(event)=>{
    event.stopPropagation()
    if (!powerState.available) {
      setMessage(toddler?'Win a few more stars to fill my magic!':`Earn ${powerState.pointsToNext} more friendship point${powerState.pointsToNext===1?'':'s'} to recharge.`)
      return
    }
    const result=onActivatePower?.(powerState)
    setMessage(result?.message || (toddler?'Magic helper!':`${powerState.power.name} activated!`))
  }
  return <div className="relative shrink-0">
    <div className="flex items-center gap-1 rounded-full border-2 border-white/70 bg-white/75 p-1 shadow-md">
      <motion.button data-testid="companion-badge" whileTap={{scale:.9,rotate:-5}} onClick={tap} className="flex min-h-0 items-center gap-2 rounded-full py-0 pl-0 pr-1 shadow-none" aria-label={`${bond.companion.name}, friendship level ${bond.stage.level}`}><CompanionArt companion={bond.companion} stage={bond.stage} compact/><span className="hidden text-left lg:block"><span className="block max-w-24 truncate font-bubble text-xs text-[#351407]">{bond.companion.name}</span><span className="block font-round text-[8px] font-black uppercase text-[#7a3bad]">Lv.{bond.stage.level} {bond.stage.name}</span></span></motion.button>
      <motion.button data-testid="companion-power" whileTap={{scale:.88}} onClick={usePower} className={`relative grid h-10 w-10 min-h-0 shrink-0 place-items-center rounded-full border-2 font-bubble text-lg shadow-inner ${powerState.available?'border-[#f4b63e] bg-[#fff2a8] text-[#4a1f56]':'border-[#c9bca7] bg-[#ece6dc] grayscale'}`} aria-label={`${powerState.power.name}, ${powerState.available} charges`}>{powerState.power.icon}<span className="absolute -bottom-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#4a1f56] px-1 font-round text-[9px] font-black text-white">{powerState.available}</span></motion.button>
    </div>
    <AnimatePresence>{message&&<motion.div initial={{opacity:0,y:8,scale:.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-5}} className="absolute right-0 top-[52px] z-[260] w-52 rounded-2xl border-2 border-white bg-[#32113f] p-3 font-round text-xs font-extrabold text-white shadow-2xl">{message}<span className="absolute -top-2 right-5 h-4 w-4 rotate-45 border-l-2 border-t-2 border-white bg-[#32113f]"/></motion.div>}</AnimatePresence>
    <AnimatePresence>{levelUp&&<CompanionLevelUpReveal previousStage={levelUp.previousStage} newStage={levelUp.newStage} onClose={()=>setLevelUp(null)} />}</AnimatePresence>
  </div>
}

export function CompanionBondCard({ progress, ageGroup = 'early', onChooseBuddy }) {
  const bond = getCompanionBond(progress)
  const powerState = getCompanionPowerState(progress, ageGroup)
  return <section data-testid="companion-bond-card" className="relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-[#2b174b] via-[#563184] to-[#a04a92] p-5 text-white shadow-xl" style={{borderColor:`${bond.stage.aura}99`}}>
    <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-25 blur-2xl" style={{background:bond.stage.aura}}/>
    <div className="relative flex items-center gap-4"><CompanionArt companion={bond.companion} stage={bond.stage}/><div className="min-w-0 flex-1"><p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-yellow-200">My learning companion</p><h2 className="truncate font-bubble text-2xl">{bond.companion.name}</h2><p className="font-round text-xs font-bold text-white/75">Level {bond.stage.level} · {bond.stage.name}</p><p className="mt-1 font-round text-xs font-extrabold text-white">{bond.stage.ability}</p></div></div>
    <div className="relative mt-4"><div className="flex items-center justify-between font-round text-[10px] font-black uppercase"><span>{bond.points} friendship points</span><span>{bond.next?`${bond.next.need-bond.points} to ${bond.next.name}`:'Maximum friendship'}</span></div><div className="mt-1 h-3 overflow-hidden rounded-full bg-white/15"><motion.div initial={{width:0}} animate={{width:`${bond.progressPercent}%`}} className="h-full rounded-full" style={{background:`linear-gradient(90deg,${bond.stage.aura},#fde047)`}}/></div></div>
    <div className="relative mt-4 flex justify-between gap-1">{COMPANION_BOND_STAGES.map(stage=><div key={stage.level} className={`text-center ${bond.points>=stage.need?'opacity-100':'opacity-35 grayscale'}`}><div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-white/15 text-base">{stage.accessory}</div><p className="mt-1 font-round text-[7px] font-black">LV.{stage.level}</p></div>)}</div>
    <div className="relative mt-4 flex items-center gap-3 rounded-2xl bg-white/12 p-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff2a8] text-2xl text-[#351407]">{powerState.power.icon}</div><div className="min-w-0 flex-1"><p className="font-bubble text-sm">{powerState.power.name}</p><p className="font-round text-[10px] font-bold text-white/70">Use it inside any game when a clue feels tricky.</p></div><div className="text-center"><p className="font-bubble text-xl text-yellow-200">{powerState.available}/{powerState.maxCharges}</p><p className="font-round text-[8px] font-black uppercase text-white/60">Ready</p></div></div>
    <button onClick={onChooseBuddy} className="relative mt-4 min-h-11 w-full rounded-2xl bg-white/90 font-bubble text-sm text-[#4b2369] shadow">CHOOSE MY COMPANION →</button>
  </section>
}
