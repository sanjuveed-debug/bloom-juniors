import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatLocalDate } from '../utils/date.js'

const STORIES={
  toddler:{title:'The Sleepy Rainbow Egg',chapters:[
    {module:'alphabet',icon:'🗺️',title:'Find the torn map',mission:'Find the letter clues hiding on the map.'},
    {module:'numbers',icon:'🔢',title:'Count the stepping stones',mission:'Count a safe path across the sparkling river.'},
    {module:'shapes',icon:'🔷',title:'Build the rainbow bridge',mission:'Choose shapes to repair the little bridge.'},
    {module:'animals',icon:'🐘',title:'Ask the jungle friends',mission:'Meet the animals who heard the mysterious egg.'},
    {module:'colours',icon:'🌈',title:'Wake the rainbow egg',mission:'Return its colours and see what hatches!'},
  ]},
  early:{title:'The Secret of the Moon Egg',chapters:[
    {module:'story',icon:'📖',title:'Discover the torn map',mission:'Read the first clue hidden inside an explorer story.'},
    {module:'math',icon:'🔢',title:'Decode the moon numbers',mission:'Solve the number code that opens the river gate.'},
    {module:'shapes',icon:'🔷',title:'Rebuild the crystal bridge',mission:'Use shape clues to cross the glowing river.'},
    {module:'science',icon:'🔬',title:'Wake the moon garden',mission:'Use a science discovery to help the garden glow.'},
    {module:'davinci',icon:'🎨',title:'Create the hatching light',mission:'Make the final colours and reveal the creature!'},
  ]},
  junior:{title:'The Atlas of the Hidden Creature',chapters:[
    {module:'reading',icon:'📚',title:'Recover the missing journal',mission:'Read the explorer’s entry and identify the first location.'},
    {module:'wordproblems',icon:'🧭',title:'Calculate the safest route',mission:'Use the evidence to navigate beyond the waterfall.'},
    {module:'grammar',icon:'📝',title:'Repair the coded message',mission:'Rebuild the damaged sentences in the expedition log.'},
    {module:'science',icon:'🧪',title:'Test the glowing shell',mission:'Investigate the scientific clues without disturbing the egg.'},
    {module:'worldmap',icon:'🌍',title:'Locate the creature’s home',mission:'Complete the atlas and unlock the final discovery.'},
  ]},
}

const CLIFFHANGERS=['The map is glowing. A river has appeared overnight…','Something moved beyond the crystal bridge…','The egg made a tiny sound from inside…','A new symbol appeared on the shell…','The creature is ready to meet you!']
const OFFLINE=['Find one letter on a packet or sign.','Count five objects near you.','Find a circle, square and rectangle at home.','Move like your favourite animal for ten seconds.','Show someone the colour you love most.']

export default function LivingAdventure({ageGroup='early',profileName,progress,onNavigate,onUpdateProgress}){
  const story=STORIES[ageGroup]||STORIES.early, today=formatLocalDate()
  const saved=progress.livingAdventure
  const state=saved?.storyId==='moon-egg-v1'?saved:{storyId:'moon-egg-v1',startedAt:Date.now(),completed:[],choice:null,launched:null,lastCompletedDate:null}
  const completed=state.completed||[]
  const chapterIndex=Math.min(completed.length,story.chapters.length-1), chapter=story.chapters[chapterIndex], finished=completed.length>=story.chapters.length
  const completedToday=state.lastCompletedDate===today

  useEffect(()=>{if(!saved||saved.storyId!=='moon-egg-v1')onUpdateProgress?.({livingAdventure:state})},[]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{
    if(!state.launched||finished||completed.includes(chapterIndex))return
    const moduleProgress=progress[chapter.module]||{}
    const sessionDone=(progress.sessions||[]).some(s=>s.module===chapter.module&&(s.date||0)>=state.launched.at)
    const playDone=(moduleProgress.played||0)>(state.launched.played||0)
    const dateDone=moduleProgress.lastPlayedDate===today&&state.launched.date===today
    if(!sessionDone&&!playDone&&!dateDone)return
    onUpdateProgress?.({livingAdventure:{...state,completed:[...completed,chapterIndex],lastCompletedDate:today,launched:null,lastReward:{chapter:chapterIndex,at:Date.now()}}})
  },[progress.sessions,progress[chapter.module]?.played,progress[chapter.module]?.lastPlayedDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose=choice=>onUpdateProgress?.({livingAdventure:{...state,choice}})
  const launch=()=>{
    onUpdateProgress?.({livingAdventure:{...state,launched:{module:chapter.module,at:Date.now(),date:today,played:progress[chapter.module]?.played||0}}})
    onNavigate(chapter.module)
  }
  const sceneLabel=useMemo(()=>state.choice==='river'?'Waterfall route':state.choice==='forest'?'Forest route':'Choose your route',[state.choice])
  return <section className="mx-auto mt-5 max-w-6xl px-4 md:px-6 xl:px-8">
    <div className="relative overflow-hidden rounded-[30px] border-2 border-[#a85b2a]/30 bg-cover bg-center shadow-xl" style={{backgroundImage:'linear-gradient(90deg,rgba(35,16,8,.88),rgba(35,16,8,.44)),url(/treasure-map-bg.png)'}}>
      <div className="relative grid min-h-[330px] items-center gap-4 p-5 text-white sm:grid-cols-[1fr_300px] sm:p-7">
        <div><p className="font-round text-xs font-black uppercase tracking-[.2em] text-[#ffd36a]">This week’s living adventure · {Math.min(completed.length+1,5)}/5</p><h2 className="mt-1 font-bubble text-3xl sm:text-4xl">{story.title}</h2>
          {finished?<><p className="mt-3 max-w-xl font-round text-lg font-bold">You followed every clue. The moon egg has hatched into a tiny starlight fox—and it remembers every place you explored together.</p><div className="mt-4 inline-flex rounded-2xl bg-[#ffd36a] px-5 py-3 font-bubble text-[#431d0d]">🦊 Expedition complete!</div></>:
          completedToday?<><p className="mt-3 font-bubble text-2xl text-[#ffd36a]">Chapter complete!</p><p className="mt-2 max-w-lg font-round text-lg font-bold">{CLIFFHANGERS[chapterIndex]}</p><p className="mt-4 rounded-xl bg-white/10 p-3 font-round text-sm"><b>Try it away from the screen:</b> {OFFLINE[chapterIndex]}</p><p className="mt-3 font-round text-sm text-white/65">The next chapter opens tomorrow.</p></>:
          <><p className="mt-3 font-round text-sm font-black uppercase tracking-wider text-white/60">Chapter {chapterIndex+1} · {sceneLabel}</p><div className="mt-2 flex items-center gap-3"><span className="text-5xl">{chapter.icon}</span><div><h3 className="font-bubble text-2xl">{chapter.title}</h3><p className="max-w-lg font-round text-sm font-bold text-white/80">{chapter.mission}</p></div></div>
          {!state.choice&&<div className="mt-4 flex gap-2"><button onClick={()=>choose('forest')} className="rounded-xl bg-white/15 px-4 py-2 font-bubble">🌳 Forest trail</button><button onClick={()=>choose('river')} className="rounded-xl bg-white/15 px-4 py-2 font-bubble">💧 Waterfall trail</button></div>}
          <motion.button whileTap={{scale:.96}} onClick={launch} className="mt-5 min-h-14 w-full max-w-md rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 font-bubble text-xl shadow-lg">START TODAY’S CHAPTER →</motion.button></>}
        </div>
        <div className="relative mx-auto h-56 w-64"><motion.div className="absolute left-1/2 top-1/2 text-8xl" animate={finished?{scale:[1,1.12,1],rotate:[-4,4,-4]}:{y:[0,-8,0],filter:['drop-shadow(0 0 8px #fff3)','drop-shadow(0 0 24px #ffd54f)','drop-shadow(0 0 8px #fff3)']}} transition={{duration:2.5,repeat:Infinity}}>{finished?'🦊':'🥚'}</motion.div>{[0,1,2,3,4].map(i=><div key={i} className={`absolute h-4 w-4 rounded-full ${i<completed.length?'bg-[#ffd34f] shadow-[0_0_16px_#ffd34f]':'bg-white/20'}`} style={{left:`${10+i*20}%`,bottom:`${8+Math.abs(2-i)*8}%`}}/>)}</div>
      </div>
    </div>
  </section>
}
