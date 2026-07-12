import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  WONDER_SEEDS,
  getAvailableSeedAwards,
  isWonderPlotReady,
  normalizeWonderWorld,
  plantWonderSeed,
  revealWonderPlot,
} from '../utils/wonderWorld.js'
import { formatLocalDate } from '../utils/date.js'

const PLOT_POSITIONS = [
  { left: '47%', top: '70%' },
  { left: '49%', top: '46%' },
  { left: '73%', top: '52%' },
]

function SeedPlant({ seedId, ready = false }) {
  const seed = WONDER_SEEDS.find(item => item.id === seedId) || WONDER_SEEDS[0]
  if (!ready) {
    return <div className="relative h-14 w-14">
      <div className="absolute bottom-0 left-1/2 h-5 w-14 -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-[#80502f] to-[#4b2d1c] shadow-lg"/>
      <motion.div animate={{ y: [0, -3, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-3 left-1/2 h-8 w-2 -translate-x-1/2 rounded-full bg-green-600">
        <span className="absolute -left-3 top-2 h-3 w-4 -rotate-[25deg] rounded-full bg-green-400"/>
        <span className="absolute -right-3 top-0 h-3 w-4 rotate-[25deg] rounded-full bg-green-500"/>
      </motion.div>
    </div>
  }
  if (seed.id === 'rainbow') {
    const colors = ['#fb7185', '#fb923c', '#fde047', '#4ade80', '#38bdf8', '#a78bfa']
    return <motion.div className="relative h-20 w-20" animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 2.4, repeat: Infinity }}><div className="absolute bottom-0 left-1/2 h-12 w-2 -translate-x-1/2 rounded-full bg-green-600"/>{colors.map((color,index)=><span key={color} className="absolute left-1/2 top-2 h-8 w-5 origin-[50%_32px] -translate-x-1/2 rounded-full shadow" style={{background:color,transform:`translateX(-50%) rotate(${index*60}deg)`}}/>)}<span className="absolute left-1/2 top-7 h-6 w-6 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_18px_#fde047]"/></motion.div>
  }
  if (seed.id === 'moonberry') {
    return <motion.div className="relative h-20 w-20" animate={{ y: [0,-4,0] }} transition={{duration:2,repeat:Infinity}}><div className="absolute bottom-0 left-1/2 h-14 w-2 -translate-x-1/2 rounded-full bg-emerald-700"/>{[[18,22],[46,14],[35,38]].map(([left,top],index)=><span key={index} className="absolute h-7 w-7 rounded-full bg-gradient-to-br from-violet-300 to-indigo-700 shadow-[0_0_18px_#c4b5fd]" style={{left,top}}/>)}<span className="absolute left-7 top-0 text-xl">🌙</span></motion.div>
  }
  if (seed.id === 'giggle') {
    return <motion.div className="relative h-20 w-20" animate={{scale:[1,1.05,1]}} transition={{duration:1.8,repeat:Infinity}}><div className="absolute bottom-0 left-1/2 h-10 w-4 -translate-x-1/2 rounded bg-amber-800"/><div className="absolute left-2 top-0 h-16 w-16 rounded-[45%] bg-gradient-to-br from-lime-300 to-emerald-600 shadow-xl"/>{[0,1,2,3].map(i=><span key={i} className="absolute h-3 w-3 rounded-full bg-pink-300 shadow-[0_0_9px_#f9a8d4]" style={{left:18+(i%2)*28,top:14+Math.floor(i/2)*26}}/>)}</motion.div>
  }
  return <motion.div className="relative h-20 w-20" animate={{x:[-3,3,-3],y:[0,-3,0]}} transition={{duration:2.5,repeat:Infinity}}><div className="absolute bottom-0 left-1/2 h-11 w-2 -translate-x-1/2 rounded-full bg-teal-600"/><div className="absolute left-1 top-2 h-10 w-16 rounded-full bg-white shadow-[0_0_20px_#bae6fd]"><span className="absolute -top-3 left-4 h-8 w-8 rounded-full bg-white"/><span className="absolute -top-2 right-2 h-7 w-7 rounded-full bg-sky-50"/></div><span className="absolute bottom-0 left-4 text-lg">💧</span><span className="absolute bottom-1 right-3 text-lg">💧</span></motion.div>
}

export function WonderWorldButton({ progress, onClick }) {
  const world = normalizeWonderWorld(progress?.wonderWorld)
  const seeds = getAvailableSeedAwards(world).length
  const growing = world.plots.filter(Boolean).length
  const ready = world.plots.filter(plot => isWonderPlotReady(plot)).length
  return <motion.button whileTap={{scale:.97}} onClick={onClick} className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl items-center gap-3 rounded-2xl border-2 border-emerald-600/25 bg-gradient-to-r from-[#e9ffd7] to-[#dff7ff] p-3 text-left shadow-lg">
    <span className="text-4xl">🌱</span><span className="flex-1"><span className="block font-bubble text-lg text-[#274116]">Yaagvi&apos;s Secret World</span><span className="block font-round text-xs font-bold text-[#53723e]">{ready?`${ready} surprise${ready===1?' is':'s are'} ready!`:seeds?`${seeds} Wonder Seed${seeds===1?'':'s'} ready to plant`:growing?'Something is growing for tomorrow':world.discoveries.length?`${world.discoveries.length} magical discoveries`:'Complete today’s adventure to earn a seed'}</span></span><span className="font-bubble text-xl text-emerald-700">→</span>
  </motion.button>
}

export default function WonderWorld({ progress, profileName, onUpdateProgress, onBack }) {
  const today = formatLocalDate()
  const world = normalizeWonderWorld(progress?.wonderWorld)
  const availableAwards = getAvailableSeedAwards(world)
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [newDiscovery, setNewDiscovery] = useState(null)
  const recentDiscoveries = useMemo(() => [...world.discoveries].reverse().slice(0, 12), [world.discoveries])

  const plant = seedId => {
    const next = plantWonderSeed(world, selectedPlot, seedId, today)
    onUpdateProgress?.({ wonderWorld: next })
    setSelectedPlot(null)
    confetti({ particleCount: 55, spread: 80, origin: { y: .72 }, colors: ['#4ade80','#fde047','#f9a8d4'] })
  }
  const reveal = index => {
    const result = revealWonderPlot(world, index, today)
    if (!result.discovery) return
    onUpdateProgress?.({ wonderWorld: result.world })
    setNewDiscovery(result.discovery)
    confetti({ particleCount: 150, spread: 150, origin: { y: .55 } })
  }
  const tapPlot = (plot, index) => {
    if (!plot) { if (availableAwards.length) setSelectedPlot(index); return }
    if (isWonderPlotReady(plot, today)) reveal(index)
  }

  return <div className="min-h-screen bg-[#fff3da] pb-16 text-[#3b210f]">
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-[#fff8e8]/95 px-4 py-3 shadow-sm backdrop-blur"><div className="mx-auto flex max-w-6xl items-center gap-3"><button onClick={onBack} className="h-11 rounded-full bg-white px-4 font-bubble shadow">← Back</button><div className="min-w-0 flex-1"><p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">A world that remembers</p><h1 className="truncate font-bubble text-xl sm:text-2xl">{profileName || 'Your'}&apos;s Secret World</h1></div><div className="rounded-2xl bg-[#e8ffd5] px-3 py-2 text-center"><p className="text-lg">🌱</p><p className="font-bubble leading-none">{availableAwards.length}</p></div></div></header>

    <main className="mx-auto max-w-6xl px-3 pt-4 sm:px-5">
      <div className="rounded-3xl bg-white/75 p-4 shadow"><p className="font-bubble text-xl">Plant today. Discover tomorrow.</p><p className="mt-1 font-round text-sm font-bold text-[#78583e]">Learning adventures earn Wonder Seeds. Choose what to grow, then come back after a sleep to see what your world made.</p></div>

      <div className="relative mt-4 h-[250px] overflow-hidden rounded-[30px] border-4 border-[#cb8a4b] bg-[length:100%_100%] bg-center shadow-2xl sm:h-auto sm:aspect-[16/9] sm:bg-cover" style={{backgroundImage:'url(/yaagvi-secret-world.webp)'}}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#3b210f]/20 via-transparent to-white/5"/>
        {world.plots.map((plot,index)=>{const ready=isWonderPlotReady(plot,today);return <motion.button key={index} onClick={()=>tapPlot(plot,index)} whileTap={{scale:.9}} className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={PLOT_POSITIONS[index]}>
          <motion.div animate={ready?{scale:[1,1.12,1]}:{}} transition={{duration:1.4,repeat:Infinity}} className={`grid h-16 w-16 place-items-center rounded-full border-4 shadow-xl sm:h-24 sm:w-24 ${ready?'border-yellow-300 bg-[#fff8c7]/95 ring-8 ring-yellow-300/35':plot?'border-white/80 bg-[#fff8e8]/80':'border-dashed border-white/90 bg-[#fff8e8]/75'}`}>
            {plot?<div className="scale-75 sm:scale-100"><SeedPlant seedId={plot.seedId} ready={ready}/></div>:<span className="font-bubble text-3xl text-emerald-700">+</span>}
          </motion.div>
          <span className="mt-1 max-w-32 rounded-full bg-[#3b210f]/85 px-2 py-1 text-center font-round text-[9px] font-black text-white shadow sm:text-xs">{ready?'✨ TAP TO DISCOVER':plot?'Growing… come back tomorrow':availableAwards.length?'Plant here':'Earn a seed first'}</span>
        </motion.button>})}
      </div>

      <section className="mt-5 rounded-3xl bg-white/75 p-4 shadow"><div className="flex items-end justify-between"><div><p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Made by your world</p><h2 className="font-bubble text-2xl">My Discoveries</h2></div><p className="font-bubble text-emerald-700">{world.discoveries.length}</p></div>{recentDiscoveries.length?<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{recentDiscoveries.map(item=>{const seed=WONDER_SEEDS.find(seedItem=>seedItem.id===item.seedId)||WONDER_SEEDS[0];return <div key={item.id} className="rounded-2xl border border-emerald-800/10 bg-[#f6ffe9] p-3 text-center"><div className="mx-auto flex h-20 items-end justify-center"><SeedPlant seedId={item.seedId} ready/></div><p className="mt-1 font-bubble text-sm">{item.name}</p><p className="font-round text-[9px] font-black uppercase" style={{color:seed.color}}>Discovered</p></div>})}</div>:<div className="mt-3 rounded-2xl border-2 border-dashed border-emerald-700/15 p-6 text-center"><p className="text-4xl">🌱</p><p className="mt-1 font-bubble">Your first discovery begins with a Wonder Seed.</p></div>}</section>
    </main>

    <AnimatePresence>{selectedPlot!==null&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[200] flex items-end justify-center bg-[#20120a]/70 p-4 backdrop-blur-sm sm:items-center" onClick={()=>setSelectedPlot(null)}><motion.div initial={{y:80,scale:.9}} animate={{y:0,scale:1}} exit={{y:80,opacity:0}} onClick={event=>event.stopPropagation()} className="w-full max-w-lg rounded-[30px] bg-[#fff8e8] p-5 shadow-2xl"><p className="font-round text-xs font-black uppercase tracking-[.18em] text-emerald-700">Use one Wonder Seed</p><h2 className="font-bubble text-2xl">What should this become?</h2><div className="mt-4 grid grid-cols-2 gap-3">{WONDER_SEEDS.map(seed=><motion.button key={seed.id} whileTap={{scale:.94}} onClick={()=>plant(seed.id)} className="rounded-2xl border-2 bg-white p-4 text-center shadow-sm" style={{borderColor:`${seed.color}55`}}><span className="text-4xl">{seed.icon}</span><p className="mt-1 font-bubble text-sm">{seed.name}</p><p className="font-round text-[10px] font-bold text-[#806047]">A surprise grows overnight</p></motion.button>)}</div><button onClick={()=>setSelectedPlot(null)} className="mt-4 min-h-12 w-full rounded-xl bg-[#eadfcb] font-bubble">Not yet</button></motion.div></motion.div>}
    {newDiscovery&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[210] flex items-center justify-center bg-[#16310f]/80 p-4 backdrop-blur-md"><motion.div initial={{scale:.5,y:60}} animate={{scale:1,y:0}} transition={{type:'spring'}} className="w-full max-w-md rounded-[34px] bg-gradient-to-b from-[#f5ffd8] to-[#ffe08a] p-6 text-center shadow-2xl"><p className="font-round text-xs font-black uppercase tracking-[.2em] text-emerald-800">Your world made something new!</p><div className="mx-auto mt-2 flex h-40 items-end justify-center"><SeedPlant seedId={newDiscovery.seedId} ready/></div><h2 className="font-bubble text-3xl">{newDiscovery.name}</h2><p className="mt-2 font-round text-sm font-bold text-[#6b4c2b]">It is now part of your Secret World forever.</p><button onClick={()=>setNewDiscovery(null)} className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 font-bubble text-lg text-white shadow-lg">PUT IT IN MY WORLD →</button></motion.div></motion.div>}</AnimatePresence>
  </div>
}
