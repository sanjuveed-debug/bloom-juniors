import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'
import { CompanionBadge } from './CompanionBond.jsx'
import { ActiveGameTreasure, TreasureLoadoutBadge, TreasureLoadoutPicker } from './TreasureGameLoadout.jsx'
import { spendCompanionPower } from '../utils/companionPowers.js'
import { activateTreasurePower, getActiveTreasure, getTreasureQuest, getTreasureQuestRewards, processTreasureLearningWin, setActiveTreasure } from '../utils/treasureLoadout.js'
import GameCompleteReveal from './GameCompleteReveal.jsx'

const META = {
  phonics:['Echo Jungle','🎤'],math:['Number Falls','🔢'],tricky:['Starry Caves','⭐'],story:['Story Tree','📖'],shapes:['Shape River','🔷'],logic:['Puzzle Pass','🧩'],davinci:['Rainbow Mountain','🎨'],shop:['Treasure Market','🛍️'],worldgk:['World Lookout','🌍'],science:['Wonder Springs','🔬'],planets:['Moon Camp','🪐'],anatomy:['Body Basecamp','🫀'],exercise:['Movement Meadow','🏃'],arcade:['Treasure Arcade','🎮'],sacred:['Story Temple','🕊️'],piggybank:['Coin Cove','🐷'],
  colours:['Rainbow Garden','🌈'],numbers:['Counting Falls','🔢'],animals:['Animal Jungle','🐘'],fruits:['Fruit Orchard','🍎'],bodyparts:['Wiggle Meadow','👋'],alphabet:['Letter Tree','🔤'],
  timestables:['Number Castle','🏰'],fractions:['Crystal Cave','💎'],reading:['Book Kingdom','📖'],spelling:['Spell Academy','✨'],wordproblems:['Puzzle Tower','🧩'],grammar:['Grammar Grove','🌳'],worldmap:['World Globe','🌍'],spirituality:['Temple Isle','🕉️'],games:['Game Arena','🎮'],quizshow:['Bloom Quiz Stage','🎤'],
}
// science/exercise/piggybank module ids are shared between the early and
// junior bands with different intended location names — META above can't
// hold two values per key, so junior gets an explicit override here.
const JUNIOR_META_OVERRIDE = {
  science:['Science Lab','🔬'],exercise:['Training Zone','🏃'],piggybank:['Money Bank','🐷'],
}

export default function AdventureModuleFrame({ moduleId, ageGroup='early', progress, onUpdateProgress, onMap, children }) {
  const [place,icon]=(ageGroup==='junior'&&JUNIOR_META_OVERRIDE[moduleId])||META[moduleId]||['Explorer Trail','🗺️']
  const toddler=ageGroup==='toddler', junior=ageGroup==='junior'
  const { speak, speaking, primeSpeech } = useSpeech()
  const [tap,setTap]=useState(null), timer=useRef(null)
  const [treasurePicker,setTreasurePicker]=useState(false)
  const [treasureMessage,setTreasureMessage]=useState('')
  const [treasureEffect,setTreasureEffect]=useState('')
  const [completion,setCompletion]=useState(null)
  const [answerFeedback,setAnswerFeedback]=useState(null)
  const [runKey,setRunKey]=useState(0)
  const treasureTimer=useRef(null)
  const answerTimer=useRef(null)
  const mainRef=useRef(null)
  const activeTreasure=getActiveTreasure(progress?.treasureCollection,moduleId)
  const activeQuest=activeTreasure?getTreasureQuest(progress?.treasureCollection,activeTreasure.item.id,ageGroup):null
  const activeQuestRewards=activeTreasure?getTreasureQuestRewards(progress?.treasureCollection,activeTreasure.item.id,ageGroup):[]
  useEffect(()=>()=>{ clearTimeout(timer.current); clearTimeout(treasureTimer.current); clearTimeout(answerTimer.current) },[])
  useEffect(()=>{
    const celebrate=event=>{
      if (event.detail?.module!==moduleId || !event.detail?.eventId || !activeTreasure) return
      const preview=processTreasureLearningWin(progress?.treasureCollection,{moduleId,eventId:event.detail.eventId,ageGroup})
      if (!preview.awarded) return
      onUpdateProgress?.(current=>({
        ...current,
        treasureCollection:processTreasureLearningWin(current?.treasureCollection,{moduleId,eventId:event.detail.eventId,ageGroup}).collection,
      }))
      const message=preview.questCompleted
        ? `${activeTreasure.item.name} completed its treasure quest and unlocked ${preview.questReward.name}!`
        : preview.questAdvanced
          ? `Quest clue found! ${preview.quest.completed.length} of ${preview.quest.required}. Next: ${preview.quest.nextName}.`
          : preview.evolved
        ? `${activeTreasure.item.name} evolved into ${preview.evolution.name}!`
        : `${activeTreasure.item.name} earned 6 treasure XP!`
      setTreasureMessage(message)
      clearTimeout(treasureTimer.current); treasureTimer.current=window.setTimeout(()=>setTreasureMessage(''),4200)
    }
    window.addEventListener('yaagvi:celebrate',celebrate)
    return ()=>window.removeEventListener('yaagvi:celebrate',celebrate)
  },[activeTreasure?.item.id,ageGroup,moduleId,onUpdateProgress,progress?.treasureCollection,speak])
  useEffect(()=>{
    const complete=event=>{
      if(event.detail?.module!==moduleId) return
      setCompletion({...event.detail,receivedAt:Date.now()})
    }
    window.addEventListener('bloom:game-complete',complete)
    return()=>window.removeEventListener('bloom:game-complete',complete)
  },[moduleId])
  const respondToTap=(event)=>{
    const target=event.target.closest?.('button,[role="button"]')
    if(!target||target.disabled) return
    setTap({x:event.clientX,y:event.clientY,id:Date.now()})
    clearTimeout(timer.current); timer.current=setTimeout(()=>setTap(null),650)
    const answer=target.dataset.companionAnswer || target.dataset.correctAnswer
    if(answer==='correct'||answer==='true'||answer==='wrong'||answer==='false') {
      const correct=answer==='correct'||answer==='true'
      target.classList.remove('game-answer-win','game-answer-try')
      void target.offsetWidth
      target.classList.add(correct?'game-answer-win':'game-answer-try')
      window.setTimeout(()=>target?.classList.remove('game-answer-win','game-answer-try'),850)
      const message=correct
        ? toddler?'You found it!':junior?'Clue solved!':'Great thinking!'
        : toddler?'Try one more!':junior?'Recheck the clue':'Good try — look again'
      setAnswerFeedback({correct,message,id:Date.now()})
      clearTimeout(answerTimer.current)
      answerTimer.current=window.setTimeout(()=>setAnswerFeedback(null),correct?1250:950)
    }
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
  const chooseTreasure=itemId=>{
    onUpdateProgress?.(current=>({
      ...current,
      treasureCollection:setActiveTreasure(current?.treasureCollection,moduleId,itemId),
    }))
    setTreasurePicker(false)
  }
  const activateGameTreasure=()=>{
    const root=mainRef.current
    if (!root || !activeTreasure) return
    const visible=element=>{
      const style=window.getComputedStyle(element), rect=element.getBoundingClientRect()
      return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0&&!element.disabled&&!element.closest('header')
    }
    const wrong=[...root.querySelectorAll('[data-companion-answer="wrong"],[data-correct-answer="false"]')].filter(visible)
    const choices=[...root.querySelectorAll('button:not(:disabled),[role="button"]')].filter(visible)
    const {power,evolution,item}=activeTreasure
    const canClearOne=(power.id==='clue'&&evolution.level>=2)||(power.id==='focus'&&evolution.level>=3)
    const removed=canClearOne?wrong.slice(0,1):[]
    removed.forEach(element=>{
      element.dataset.treasureHidden='true'; element.style.pointerEvents='none'; element.setAttribute('aria-hidden','true')
      window.setTimeout(()=>{ delete element.dataset.treasureHidden; element.style.pointerEvents=''; element.removeAttribute('aria-hidden') },5200)
    })
    choices.slice(0,8).forEach(element=>element.classList.add('treasure-choice-focus'))
    window.setTimeout(()=>root.querySelectorAll('.treasure-choice-focus').forEach(element=>element.classList.remove('treasure-choice-focus')),4300)
    const effectClass=power.id==='palette'?'treasure-palette-active':power.id==='bounce'?'treasure-bounce-active':power.id==='cheer'?'treasure-cheer-active':'treasure-focus-active'
    setTreasureEffect(effectClass); window.setTimeout(()=>setTreasureEffect(''),5000)
    const eventId=`treasure-power:${moduleId}:${item.id}:${Date.now()}`
    onUpdateProgress?.(current=>({
      ...current,
      treasureCollection:activateTreasurePower(current?.treasureCollection,{moduleId,itemId:item.id,eventId}).collection,
    }))
    const message=removed.length
      ? `${item.name} tucked away one unlikely choice. You choose the answer!`
      : toddler?`${item.name} made learning magic!`:`${power.name} is ready. Look carefully and make your choice.`
    setTreasureMessage(message); clearTimeout(treasureTimer.current); treasureTimer.current=window.setTimeout(()=>setTreasureMessage(''),4200)
    speak(message,{mood:'guide'})
  }
  return <div className="game-experience min-h-screen bg-[#fff3df]" data-age={ageGroup} data-module={moduleId}>
    <header className="sticky top-0 z-[190] border-b-2 border-[#a85b2a]/25 bg-[#fff1d2]/95 px-3 py-2 shadow-md backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <motion.button whileTap={{scale:.9}} onClick={onMap} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#7a3818]/15 bg-white/80 text-xl" aria-label="Back to adventure map">🗺️</motion.button>
        <motion.button whileTap={{scale:.9}} onClick={hearCurrentScreen} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#7a3818]/15 bg-white/80 text-xl" aria-label={speaking?'Speaking instructions':'Hear this screen'}>{speaking?'🔊':'🔈'}</motion.button>
        <div className="min-w-0 flex-1"><p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-[#a34820]">{toddler?'Today’s little adventure':junior?'Expedition mission':'Yaagvi’s treasure trail'}</p><p className="truncate font-bubble text-lg text-[#351407]">{icon} {place}</p><div className="mt-1 flex gap-1" aria-hidden>{[0,1,2,3,4].map((_,i)=><span key={i} className={`h-1 w-5 rounded-full ${i===0?'bg-[#e86d35]':'bg-[#c46a31]/20'}`}/>)}</div></div>
        <TreasureLoadoutBadge collection={progress?.treasureCollection} moduleId={moduleId} onOpen={()=>setTreasurePicker(true)}/>
        <CompanionBadge progress={progress} ageGroup={ageGroup} moduleId={moduleId} onActivatePower={activateCompanionPower}/>
      </div>
    </header>
    <main ref={mainRef} className={`relative overflow-hidden ${treasureEffect}`} onPointerDownCapture={respondToTap}>
      <div className="game-ambient pointer-events-none absolute inset-0 z-0" aria-hidden />
      <div key={runKey} className="relative z-[1]">{children}</div>
      <AnimatePresence>{tap&&<motion.div key={tap.id} className="pointer-events-none fixed z-[240] grid h-16 w-16 place-items-center rounded-full border-4 border-white/80 text-2xl shadow-xl" style={{left:tap.x-32,top:tap.y-32,background:'rgba(255,196,73,.35)'}} initial={{scale:.2,opacity:1}} animate={{scale:1.45,opacity:0}} exit={{opacity:0}} transition={{duration:.6}}>✨</motion.div>}</AnimatePresence>
      <AnimatePresence>{answerFeedback&&<motion.div key={answerFeedback.id} data-testid="game-answer-feedback" className={`pointer-events-none fixed left-1/2 top-[76px] z-[245] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border-2 px-4 py-2 font-bubble text-sm shadow-xl ${answerFeedback.correct?'border-[#7ee2a8] bg-[#e9fff0] text-[#14643a]':'border-[#f1c86a] bg-[#fff7dd] text-[#744317]'}`} initial={{y:-18,scale:.75,opacity:0}} animate={{y:0,scale:1,opacity:1}} exit={{y:-10,scale:.9,opacity:0}}>{answerFeedback.correct?'⭐':'🧭'} {answerFeedback.message}</motion.div>}</AnimatePresence>
    </main>
    <ActiveGameTreasure active={activeTreasure} quest={activeQuest} rewards={activeQuestRewards} onActivate={activateGameTreasure} message={treasureMessage}/>
    <TreasureLoadoutPicker collection={progress?.treasureCollection} moduleId={moduleId} ageGroup={ageGroup} open={treasurePicker} onClose={()=>setTreasurePicker(false)} onChoose={chooseTreasure}/>
    <AnimatePresence>{completion&&<GameCompleteReveal ageGroup={ageGroup} place={place} icon={icon} result={completion} treasureMessage={treasureMessage} onReplay={()=>{setCompletion(null);setTreasureMessage('');setRunKey(value=>value+1)}} onContinue={onMap} onHome={onMap}/>}</AnimatePresence>
  </div>
}
