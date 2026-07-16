import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'
import { CompanionBadge } from './CompanionBond.jsx'
import { spendCompanionPower } from '../utils/companionPowers.js'

const META = {
  phonics:['Echo Jungle','🎤'],math:['Number Falls','🔢'],tricky:['Starry Caves','⭐'],story:['Story Tree','📖'],shapes:['Shape River','🔷'],logic:['Puzzle Pass','🧩'],davinci:['Rainbow Mountain','🎨'],shop:['Treasure Market','🛍️'],worldgk:['World Lookout','🌍'],science:['Wonder Springs','🔬'],planets:['Moon Camp','🪐'],anatomy:['Body Basecamp','🫀'],exercise:['Movement Meadow','🏃'],arcade:['Treasure Arcade','🎮'],sacred:['Story Temple','🕊️'],piggybank:['Coin Cove','🐷'],
  colours:['Rainbow Garden','🌈'],numbers:['Counting Falls','🔢'],animals:['Animal Jungle','🐘'],fruits:['Fruit Orchard','🍎'],bodyparts:['Wiggle Meadow','👋'],alphabet:['Letter Tree','🔤'],
  timestables:['Multiplier Mine','✖️'],fractions:['Fraction Falls','🍕'],reading:['Story Ruins','📚'],spelling:['Word Woods','✍️'],wordproblems:['Problem Pass','🧭'],grammar:['Grammar Grove','📝'],worldmap:['Atlas Lookout','🌍'],spirituality:['Wisdom Temple','🕊️'],games:['Treasure Arcade','🎮'],
}

export default function AdventureModuleFrame({ moduleId, ageGroup='early', progress, onUpdateProgress, onMap, children }) {
  const [place,icon]=META[moduleId]||['Explorer Trail','🗺️']
  const toddler=ageGroup==='toddler', junior=ageGroup==='junior'
  const { speak, speaking, primeSpeech } = useSpeech()
  const [tap,setTap]=useState(null), timer=useRef(null)
  const mainRef=useRef(null)
  useEffect(()=>()=>clearTimeout(timer.current),[])
  const respondToTap=(event)=>{
    const target=event.target.closest?.('button,[role="button"]')
    if(!target||target.disabled) return
    setTap({x:event.clientX,y:event.clientY,id:Date.now()})
    clearTimeout(timer.current); timer.current=setTimeout(()=>setTap(null),650)
  }
  const hearCurrentScreen=()=>{
    primeSpeech()
    const root=document.querySelector('.game-experience main')
    const candidates=[...(root?.querySelectorAll('[data-speech],h1,h2,h3,p')||[])]
      .map(el=>el.textContent?.replace(/\s+/g,' ').trim()).filter(text=>text&&text.length>3&&!/back|progress|correct$/i.test(text))
    const visible=[...new Set(candidates)].slice(0,3).join('. ').slice(0,360)
    const fallback=toddler?`Welcome to ${place}. Tap, look, and play with Yaagvi.`:junior?`Mission briefing for ${place}. Complete the challenge to earn experience and treasure.`:`Welcome to ${place}. Complete the clue to move forward on your treasure map.`
    speak(visible||fallback,{mood:'instruct'})
  }
  const activateCompanionPower=(powerState)=>{
    const root=mainRef.current
    if (!root || !powerState.available) return null
    const visible=element=>{
      const style=window.getComputedStyle(element)
      const rect=element.getBoundingClientRect()
      return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0&&!element.disabled
    }
    const wrong=[...root.querySelectorAll('[data-companion-answer="wrong"],[data-correct-answer="false"]')].filter(visible)
    const correct=[...root.querySelectorAll('[data-companion-answer="correct"],[data-correct-answer="true"]')].filter(visible)
    const choices=[...root.querySelectorAll('button:not(:disabled),[role="button"]')].filter(visible).filter(element=>!element.closest('header'))
    const removed=wrong.slice(0,powerState.removeCount)
    removed.forEach(element=>{
      element.dataset.companionHidden='true'
      element.setAttribute('aria-hidden','true')
      element.style.pointerEvents='none'
    })
    if (powerState.revealCorrect && correct[0]) {
      correct[0].classList.add('companion-correct-glow')
      window.setTimeout(()=>correct[0]?.classList.remove('companion-correct-glow'),5500)
    } else {
      ;(correct.length?correct:choices).slice(0,6).forEach(element=>element.classList.add('companion-choice-glow'))
      window.setTimeout(()=>root.querySelectorAll('.companion-choice-glow').forEach(element=>element.classList.remove('companion-choice-glow')),4500)
    }
    root.classList.add('companion-focus-active')
    window.setTimeout(()=>root?.classList.remove('companion-focus-active'),5000)
    const effect=removed.length?`removed-${removed.length}`:powerState.revealCorrect&&correct.length?'revealed-clue':'focus'
    onUpdateProgress?.(current=>spendCompanionPower(current,{moduleId,ageGroup,effect}))
    window.dispatchEvent(new CustomEvent('bloom:companion-power',{detail:{moduleId,ageGroup,powerId:powerState.power.id,effect}}))
    const message=removed.length
      ? toddler?(removed.length===1?'One sleepy choice is gone!':'Two sleepy choices are gone!'):`${powerState.power.name} cleared ${removed.length} unlikely choice${removed.length===1?'':'s'}.`
      : toddler?'Look! The choices are glowing!':`${powerState.power.name} is focusing this challenge.`
    speak(message,{mood:'guide'})
    return {message}
  }
  return <div className="game-experience min-h-screen bg-[#fff3df]" data-age={ageGroup} data-module={moduleId}>
    <header className="sticky top-0 z-[190] border-b-2 border-[#a85b2a]/25 bg-[#fff1d2]/95 px-3 py-2 shadow-md backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <motion.button whileTap={{scale:.9}} onClick={onMap} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#7a3818]/15 bg-white/80 text-xl" aria-label="Back to adventure map">🗺️</motion.button>
        <motion.button whileTap={{scale:.9}} onClick={hearCurrentScreen} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#7a3818]/15 bg-white/80 text-xl" aria-label={speaking?'Speaking instructions':'Hear this screen'}>{speaking?'🔊':'🔈'}</motion.button>
        <div className="min-w-0 flex-1"><p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-[#a34820]">{toddler?'Today’s little adventure':junior?'Expedition mission':'Yaagvi’s treasure trail'}</p><p className="truncate font-bubble text-lg text-[#351407]">{icon} {place}</p><div className="mt-1 flex gap-1" aria-hidden>{[0,1,2,3,4].map((_,i)=><span key={i} className={`h-1 w-5 rounded-full ${i===0?'bg-[#e86d35]':'bg-[#c46a31]/20'}`}/>)}</div></div>
        <CompanionBadge progress={progress} ageGroup={ageGroup} moduleId={moduleId} onActivatePower={activateCompanionPower}/>
      </div>
    </header>
    <main ref={mainRef} className="relative overflow-hidden" onPointerDownCapture={respondToTap}>
      <div className="game-ambient pointer-events-none absolute inset-0 z-0" aria-hidden />
      <div className="relative z-[1]">{children}</div>
      <AnimatePresence>{tap&&<motion.div key={tap.id} className="pointer-events-none fixed z-[240] grid h-16 w-16 place-items-center rounded-full border-4 border-white/80 text-2xl shadow-xl" style={{left:tap.x-32,top:tap.y-32,background:'rgba(255,196,73,.35)'}} initial={{scale:.2,opacity:1}} animate={{scale:1.45,opacity:0}} exit={{opacity:0}} transition={{duration:.6}}>✨</motion.div>}</AnimatePresence>
    </main>
  </div>
}
