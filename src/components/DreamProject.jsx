import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { buildDreamProjectStage, getDreamProjectState } from '../utils/dreamProject.js'
import { getActiveCompanion } from '../utils/companionBond.js'

function CompanionFigure({ companion, className = '' }) {
  return <motion.div className={`absolute z-30 grid place-items-center ${className}`} animate={{y:[0,-5,0],rotate:[-2,2,-2]}} transition={{duration:2,repeat:Infinity}}>{companion.image?<img src={companion.image} alt={`${companion.name} helping to build`} className="h-full w-full object-contain drop-shadow-xl"/>:<span className="text-5xl drop-shadow-xl">{companion.emoji || '🧸'}</span>}</motion.div>
}

function TreehouseScene({ stage, choices, companion, equippedItems, flying = false, onFly }) {
  if (stage >= 6) return <CompletedProjectScene ageGroup="toddler" companion={companion} flying={flying} onFly={onFly}/>
  return <div className="relative h-full overflow-hidden bg-gradient-to-b from-[#8ee8ff] via-[#d8f8d2] to-[#7fc768]">
    <div className="absolute left-[8%] top-[9%] h-16 w-16 rounded-full bg-[#fff7a8] shadow-[0_0_35px_#fde047]"/><div className="absolute bottom-0 h-[26%] w-full rounded-t-[50%] bg-gradient-to-b from-[#79c65d] to-[#3e8d46]"/>
    {stage===0&&<div className="absolute left-1/2 top-[22%] h-[58%] w-[35%] -translate-x-1/2 rounded-[45%] border-4 border-dashed border-white/70 bg-white/15"/>}
    {stage>=1&&<motion.div initial={{scaleY:0}} animate={{scaleY:1}} className="absolute bottom-[18%] left-1/2 h-[58%] w-20 origin-bottom -translate-x-1/2 rounded-[48%_42%_18%_22%] bg-gradient-to-r from-[#75451f] via-[#b8753a] to-[#623619] shadow-2xl"><div className="absolute -left-24 top-5 h-24 w-28 rounded-full bg-gradient-to-br from-[#86dc61] to-[#2c8846] shadow-xl"/><div className="absolute -right-24 top-0 h-28 w-32 rounded-full bg-gradient-to-br from-[#a5ef6e] to-[#398c45] shadow-xl"/></motion.div>}
    {stage>=2&&<motion.div initial={{scale:0,y:30}} animate={{scale:1,y:0}} className="absolute left-1/2 top-[20%] h-[34%] w-[42%] -translate-x-1/2 rounded-[26px] border-4 border-[#fff0b0] bg-gradient-to-br from-[#ff7a5c] to-[#ee4d8b] shadow-2xl"><div className="absolute -top-10 left-1/2 h-20 w-[112%] -translate-x-1/2 rotate-[-2deg] rounded-[80%_80%_18%_18%] bg-gradient-to-r from-[#8b4d2b] to-[#d17c38]"/><div className="absolute left-1/2 top-[30%] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border-4 border-white bg-[#8ce7ff] text-3xl shadow-inner">{choices[2]==='heart'?'💗':'⭐'}</div></motion.div>}
    {stage>=3&&<motion.div initial={{height:0}} animate={{height:'32%'}} className="absolute bottom-[8%] left-[33%] w-16 border-x-4 border-[#75451f] bg-[repeating-linear-gradient(to_bottom,transparent_0_16px,#f3c66d_16px_22px)]"/>}
    {stage>=4&&<motion.div initial={{scale:0}} animate={{scale:1}} className="absolute bottom-[8%] right-[8%] rounded-[35px] bg-[#5aa647]/50 px-4 py-2 text-5xl">{choices[4]==='moon'?'🌙🌼':'🌷🌻'}</motion.div>}
    {stage>=5&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute left-[54%] top-[47%] rounded-xl bg-[#fff4c7] px-3 py-1 font-bubble text-xs text-[#6c331f] shadow">{companion.name}&apos;s room 🛏️</motion.div>}
    {stage>=6&&<motion.div initial={{pathLength:0}} animate={{pathLength:1}} className="absolute bottom-[12%] right-[25%] h-[38%] w-20 rotate-[-18deg] rounded-full border-[14px] border-[#f9a8d4] bg-gradient-to-b from-[#fde047] via-[#67e8f9] to-[#a78bfa] shadow-xl"/>}
    <CompanionFigure companion={companion} className="bottom-[8%] left-[9%] h-24 w-20"/>
    {stage>=4&&equippedItems.slice(0,2).map((item,index)=><motion.div key={item.id} initial={{scale:0}} animate={{scale:1}} className="absolute bottom-[8%] z-20 grid h-12 w-12 place-items-center rounded-2xl bg-white/85 text-3xl shadow" style={{left:`${22+index*9}%`}}>{item.emoji || '🎁'}</motion.div>)}
  </div>
}

const COMPLETED_SCENES = {
  toddler: {
    src: '/dream-projects/rainbow-treehouse-complete-v2.webp',
    alt: 'The completed Rainbow Treehouse in a magical sunny garden',
    action: 'PLAY IN MY TREEHOUSE →',
    companionClass: 'left-[38%] top-[58%] h-[34%] w-[18%] sm:left-[37%] sm:top-[55%] sm:h-[28%] sm:w-[14%]',
    background: '#75c66f',
  },
  early: {
    src: '/dream-projects/magical-skyship-complete-v2.webp',
    alt: 'The completed Magical Skyship flying above sunset clouds',
    action: 'FLY MY SKYSHIP →',
    companionClass: 'left-[29%] top-[34%] h-[36%] w-[20%] sm:left-[30%] sm:top-[40%] sm:h-[25%] sm:w-[13%]',
    background: '#352064',
  },
  junior: {
    src: '/dream-projects/explorer-headquarters-complete-v2.webp',
    alt: 'The completed Explorer Headquarters glowing above a mountain valley',
    action: 'ACTIVATE MY BASE →',
    companionClass: 'left-[33%] top-[59%] h-[32%] w-[17%] sm:left-[32%] sm:top-[58%] sm:h-[25%] sm:w-[13%]',
    background: '#132653',
  },
}

function CompletedProjectScene({ ageGroup = 'early', companion, flying, onFly }) {
  const scene = COMPLETED_SCENES[ageGroup] || COMPLETED_SCENES.early
  return <div className="relative h-full overflow-hidden" style={{ background: scene.background }}>
    <motion.img
      src={scene.src}
      alt={scene.alt}
      className="absolute inset-0 h-full w-full object-cover"
      animate={flying
        ? { scale: [1.01, 1.06, 1.12], y: [0, -8, -18] }
        : { scale: [1.015, 1.035, 1.015], y: [0, -4, 0] }}
      transition={flying
        ? { duration: 2.4, ease: 'easeOut' }
        : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#211442]/50 via-transparent to-transparent"/>
    <CompanionFigure companion={companion} className={scene.companionClass}/>
    {[18, 48, 78].map((left, index) => <motion.span key={left} className="absolute z-20 text-xl text-yellow-100" style={{ left: `${left}%`, top: `${22 + index * 19}%` }} animate={{ opacity: [.15, 1, .15], scale: [.7, 1.35, .7] }} transition={{ duration: 1.8 + index * .4, repeat: Infinity }}>✦</motion.span>)}
    <motion.button
      type="button"
      onClick={onFly}
      whileTap={{ scale: .96 }}
      className="absolute bottom-4 left-4 z-40 rounded-2xl border-2 border-white/70 bg-[#2e1724]/85 px-5 py-3 font-bubble text-sm text-white shadow-xl backdrop-blur"
    >
      {flying ? 'IT CAME ALIVE! ✨' : scene.action}
    </motion.button>
  </div>
}

function SkyshipScene({ stage, choices, companion, equippedItems, flying = false, onFly }) {
  if (stage >= 6) return <CompletedProjectScene ageGroup="early" companion={companion} flying={flying} onFly={onFly}/>
  return <div className="relative h-full overflow-hidden bg-gradient-to-b from-[#30205f] via-[#704c9d] to-[#f3a46e]">
    {[12,28,74,88].map((left,index)=><motion.span key={left} className="absolute text-xl text-yellow-200" style={{left:`${left}%`,top:`${12+index*13}%`}} animate={{opacity:[.3,1,.3],scale:[.8,1.3,.8]}} transition={{duration:1.5+index*.3,repeat:Infinity}}>✦</motion.span>)}<div className="absolute bottom-[8%] left-[5%] h-16 w-40 rounded-full bg-white/20 blur-sm"/><div className="absolute right-[2%] top-[12%] h-24 w-24 rounded-full bg-[#fff2a8] shadow-[0_0_35px_#fde68a]"/>
    {stage===0&&<div className="absolute left-1/2 top-[27%] h-[45%] w-[58%] -translate-x-1/2 rounded-[50%] border-4 border-dashed border-white/45"/>}
    {stage>=1&&<motion.div initial={{scale:0}} animate={{scale:1}} className="absolute bottom-[16%] left-1/2 h-28 w-24 -translate-x-1/2 rounded-b-[45%] bg-gradient-to-b from-[#f59e0b] to-[#ea580c] shadow-2xl"><motion.div className="absolute bottom-[-42px] left-1/2 h-14 w-10 -translate-x-1/2 rounded-b-full bg-gradient-to-b from-[#fde047] via-[#fb923c] to-transparent" animate={{height:[45,65,45]}} transition={{duration:.7,repeat:Infinity}}/></motion.div>}
    {stage>=2&&<motion.div initial={{scaleX:0}} animate={{scaleX:1}} className={`absolute left-1/2 top-[31%] h-44 w-[46%] -translate-x-1/2 rounded-[48%_48%_38%_38%] border-4 border-[#ffe8a6] shadow-2xl ${choices[2]==='star'?'bg-gradient-to-br from-[#facc15] to-[#ec4899]':'bg-gradient-to-br from-[#fb923c] to-[#ef476f]'}`}><div className="absolute left-1/2 top-7 h-20 w-24 -translate-x-1/2 rounded-t-full border-4 border-[#c4f0ff] bg-gradient-to-b from-[#7dd3fc] to-[#2563eb] shadow-inner"/></motion.div>}
    {stage>=3&&<><motion.div initial={{x:80}} animate={{x:0}} className="absolute left-[15%] top-[48%] h-16 w-[30%] rounded-full border-4 border-[#baf4ff] bg-gradient-to-r from-[#0d9488] to-[#2dd4bf] shadow-xl"/><motion.div initial={{x:-80}} animate={{x:0}} className="absolute right-[15%] top-[48%] h-16 w-[30%] rounded-full border-4 border-[#baf4ff] bg-gradient-to-l from-[#0d9488] to-[#2dd4bf] shadow-xl"/></>}
    {stage>=4&&<motion.div initial={{y:-40,opacity:0}} animate={{y:0,opacity:1}} className="absolute left-1/2 top-[21%] -translate-x-1/2 text-5xl">{choices[4]==='garden'?'🌱':'🔭'}</motion.div>}
    {stage>=5&&<CompanionFigure companion={companion} className="left-1/2 top-[34%] h-20 w-16 -translate-x-1/2"/>}
    {stage<5&&<CompanionFigure companion={companion} className="bottom-[5%] left-[8%] h-24 w-20"/>}
    {stage>=6&&<motion.div className="absolute bottom-[3%] left-[30%] h-6 w-[42%] rounded-full bg-gradient-to-r from-[#f472b6] via-[#fde047] to-[#38bdf8] blur-[2px]" animate={{opacity:[.4,1,.4],scaleX:[.8,1.1,.8]}} transition={{duration:1.2,repeat:Infinity}}/>}
    {stage>=4&&equippedItems.slice(0,2).map((item,index)=><div key={item.id} className="absolute bottom-[8%] z-20 text-4xl" style={{right:`${8+index*8}%`}}>{item.emoji || '🎁'}</div>)}
  </div>
}

function HeadquartersScene({ stage, choices, companion, equippedItems, flying = false, onFly }) {
  if (stage >= 6) return <CompletedProjectScene ageGroup="junior" companion={companion} flying={flying} onFly={onFly}/>
  return <div className="relative h-full overflow-hidden bg-gradient-to-b from-[#18385c] via-[#4f7592] to-[#d6a869]">
    <div className="absolute bottom-0 h-[28%] w-full bg-gradient-to-b from-[#77905b] to-[#3f5f3f]"/><div className="absolute right-[7%] top-[9%] h-20 w-20 rounded-full bg-[#f8df98] shadow-[0_0_30px_#fef3c7]"/>
    {stage===0&&<div className="absolute bottom-[17%] left-1/2 h-[48%] w-[62%] -translate-x-1/2 border-4 border-dashed border-white/45 bg-white/5"/>}
    {stage>=1&&<motion.div initial={{scaleX:0}} animate={{scaleX:1}} className="absolute bottom-[18%] left-1/2 h-12 w-[62%] -translate-x-1/2 rounded-lg border-4 border-[#c98d56] bg-[#70482f] shadow-xl"/>}
    {stage>=2&&<motion.div initial={{y:80}} animate={{y:0}} className="absolute bottom-[23%] left-1/2 h-[42%] w-[54%] -translate-x-1/2 rounded-t-[22px] border-4 border-[#b9d9df] bg-gradient-to-br from-[#314a67] to-[#182a45] shadow-2xl"><div className="absolute left-[8%] top-[22%] grid h-20 w-24 place-items-center rounded-xl border-2 border-cyan-200 bg-[#6da4bd]/60 text-4xl">{choices[2]==='science'?'🧪':'🗺️'}</div><div className="absolute bottom-0 right-[12%] h-24 w-20 rounded-t-xl bg-[#d39b5e]"/></motion.div>}
    {stage>=3&&<motion.div initial={{scale:0}} animate={{scale:1}} className="absolute bottom-[28%] right-[18%] h-28 w-32 rounded-xl border-4 border-[#c3e7eb] bg-[#426b7d] p-3 text-center text-4xl shadow-xl">🧭<p className="font-round text-[9px] font-black text-white">STRATEGY</p></motion.div>}
    {stage>=4&&<motion.div initial={{height:0}} animate={{height:'48%'}} className="absolute bottom-[23%] left-[29%] w-20 rounded-t-2xl border-4 border-[#b9d9df] bg-[#253c57] text-center text-4xl shadow-xl"><span className="absolute left-1/2 top-3 -translate-x-1/2">{choices[4]==='drone'?'🛸':'🔭'}</span></motion.div>}
    {stage>=5&&<div className="absolute bottom-[27%] left-[43%] rounded-xl bg-[#0f2037]/80 px-4 py-3 text-center text-3xl text-cyan-200 shadow-[0_0_24px_#67e8f9]">⌁<p className="font-round text-[8px] font-black text-white">COMPANION COMMAND</p></div>}
    {stage>=6&&<motion.div className="absolute left-1/2 top-[3%] h-[45%] w-4 -translate-x-1/2 bg-gradient-to-t from-cyan-300 to-transparent blur-[2px]" animate={{opacity:[.4,1,.4],scaleX:[1,1.8,1]}} transition={{duration:1.4,repeat:Infinity}}/>}
    <CompanionFigure companion={companion} className="bottom-[8%] left-[7%] h-24 w-20"/>
    {stage>=4&&equippedItems.slice(0,2).map((item,index)=><div key={item.id} className="absolute bottom-[8%] z-20 text-4xl" style={{right:`${8+index*8}%`}}>{item.emoji || '🎁'}</div>)}
  </div>
}

function ProjectScene({ ageGroup, state, companion, equippedItems, flying, onFly }) {
  const props={stage:state.state.stage,choices:state.state.choices,companion,equippedItems,flying,onFly}
  if(ageGroup==='toddler')return <TreehouseScene {...props}/>
  if(ageGroup==='junior')return <HeadquartersScene {...props}/>
  return <SkyshipScene {...props}/>
}

export default function DreamProject({ progress = {}, ageGroup = 'early', equippedItems = [], onUpdateProgress }) {
  const state=getDreamProjectState(progress,ageGroup)
  const companion=getActiveCompanion(progress)
  const [selectedChoice,setSelectedChoice]=useState('')
  const [celebration,setCelebration]=useState(null)
  const [flying,setFlying]=useState(false)
  useEffect(()=>setSelectedChoice(state.nextStage?.choices?.[0]?.id||''),[state.state.stage,state.project.id])
  const build=()=>{
    const next=buildDreamProjectStage(progress,ageGroup,selectedChoice)
    if(next===progress)return
    onUpdateProgress?.({dreamProject:next.dreamProject})
    setCelebration(state.nextStage.name)
    confetti({particleCount:120,spread:130,origin:{y:.62},colors:['#fde047','#67e8f9','#f472b6','#86efac']})
    window.setTimeout(()=>setCelebration(null),2300)
  }
  const fly=()=>{
    if(flying)return
    setFlying(true)
    confetti({particleCount:90,spread:115,origin:{y:.68},colors:['#fde047','#67e8f9','#f472b6','#86efac']})
    window.setTimeout(()=>setFlying(false),2600)
  }
  return <section data-testid={`dream-project-${ageGroup}`} className="mt-4 overflow-hidden rounded-[32px] border-2 border-[#8b5a35]/25 bg-[#fffaf0] shadow-2xl">
    <div className="grid lg:grid-cols-[1.35fr_.65fr]">
      <div data-testid="dream-project-scene" className="relative h-[360px] min-w-0 sm:h-[430px]"><ProjectScene ageGroup={ageGroup} state={state} companion={companion} equippedItems={equippedItems} flying={flying} onFly={fly}/><div className="absolute left-4 top-4 z-40 max-w-[75%] rounded-2xl bg-[#2e1724]/85 px-4 py-3 text-white shadow-xl backdrop-blur"><p className="font-round text-[9px] font-black uppercase tracking-[.18em] text-yellow-200">{state.project.eyebrow}</p><h2 className="font-bubble text-2xl">{state.project.name}</h2><p className="font-round text-xs font-bold text-white/75">{state.completed?'All 6 pieces complete!':`Building stage ${state.state.stage+1} of 6`}</p></div></div>
      <div className="p-5 sm:p-6"><p className="font-round text-xs font-black uppercase tracking-[.18em] text-[#9a431f]">Learning becomes something real</p><h3 className="mt-1 font-bubble text-2xl text-[#38180b]">{state.completed?(ageGroup==='toddler'?'Your Rainbow Treehouse is ready!':ageGroup==='early'?'Your Magical Skyship is ready!':'Your Explorer Headquarters is ready!'):state.nextStage.name}</h3><p className="mt-1 font-round text-sm font-bold text-[#79533e]">{state.completed?(ageGroup==='toddler'?`Every room, garden and rainbow piece is complete. ${companion.name} is ready to play!`:ageGroup==='early'?`Every engine, wing and adventure detail is complete. ${companion.name} is ready to fly!`:`Every lab, tower and expedition system is online. ${companion.name} is ready to explore!`):state.nextStage.detail}</p>
        <div className="mt-4 grid grid-cols-4 gap-2">{state.project.materials.map(([icon,label])=><div key={label} className="rounded-xl bg-[#fff0c9] p-2 text-center"><p className="text-2xl">{icon}</p><p className="truncate font-round text-[8px] font-black text-[#6d462e]">{label}</p></div>)}</div>
        <div className="mt-4 rounded-2xl bg-[#342039] p-4 text-white"><div className="flex items-center justify-between"><span className="font-bubble text-sm">{state.completed?'🏆 Dream project':'🧰 Build bundles'}</span><span className="font-bubble text-xl text-yellow-200">{state.completed?'6/6':state.availableBundles}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-pink-400" style={{width:`${state.progressPercent}%`}}/></div><p className="mt-2 font-round text-[10px] font-bold text-white/65">{state.completed?'Every piece is built—bring it to life whenever you want.':state.canBuild?`Ready now · uses ${state.nextCost} bundle${state.nextCost===1?'':'s'}`:`Earn ${state.pointsToNextBundle} more friendship points toward another bundle.`}</p></div>
        {!state.completed&&state.nextStage.choices&&<div className="mt-4"><p className="font-round text-[10px] font-black uppercase text-[#7a3bad]">Make it yours</p><div className="mt-2 grid grid-cols-2 gap-2">{state.nextStage.choices.map(choice=><button key={choice.id} onClick={()=>setSelectedChoice(choice.id)} className={`rounded-2xl border-2 p-3 font-bubble text-sm ${selectedChoice===choice.id?'border-[#7a3bad] bg-[#f4e8ff] shadow':'border-[#d9cbb8] bg-white'}`}><span className="mr-1 text-xl">{choice.icon}</span>{choice.label}</button>)}</div></div>}
        {!state.completed&&<motion.button data-testid="dream-project-build" whileTap={{scale:.96}} onClick={build} disabled={!state.canBuild} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#ff7a2f] to-[#ec4899] px-4 font-bubble text-lg text-white shadow-lg disabled:cursor-not-allowed disabled:grayscale disabled:opacity-45">{state.canBuild?`BUILD ${state.nextStage.name.toUpperCase()} →`:`KEEP LEARNING TO BUILD · ${state.nextCost} 🧰`}</motion.button>}
        <div className="mt-4 flex gap-1.5" aria-label={`${state.state.stage} of 6 building stages complete`}>{state.project.stages.map((stage,index)=><span key={stage.name} title={stage.name} className={`h-2 flex-1 rounded-full ${index<state.state.stage?'bg-emerald-500':'bg-[#dfd1bd]'}`}/>)}</div>
      </div>
    </div>
    <AnimatePresence>{celebration&&<motion.div initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.8}} className="pointer-events-none fixed inset-x-4 top-[35%] z-[350] mx-auto max-w-sm rounded-[28px] border-4 border-yellow-200 bg-[#341b3f]/95 p-6 text-center text-white shadow-2xl"><p className="text-6xl">🛠️✨</p><p className="mt-2 font-bubble text-2xl">{celebration} built!</p><p className="font-round text-sm font-bold text-white/70">{companion.name} helped make it permanent.</p></motion.div>}</AnimatePresence>
  </section>
}
