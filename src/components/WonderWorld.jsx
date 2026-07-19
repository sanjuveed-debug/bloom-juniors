import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  WONDER_SEEDS,
  getAvailableSeedAwards,
  getWonderDiscoveryDetails,
  getWonderGrowthStage,
  interactWithWonderDiscovery,
  isWonderPlotReady,
  normalizeWonderWorld,
  plantWonderSeed,
  revealWonderPlot,
} from '../utils/wonderWorld.js'
import { formatLocalDate } from '../utils/date.js'
import {
  claimWonderTreasureReward,
  equipTreasureReward,
  hatchMysteryEgg,
  normaliseTreasureCollection,
} from '../utils/treasureRewards.js'
import { MysteryEgg, TreasureShelf } from './TreasureCollection.jsx'
import { YaagviRoom } from './RetentionWidgets.jsx'
import YaagviCharacter from './YaagviCharacter.jsx'
import { getLivingWorldScore, LIVING_WORLD_AGE_COPY } from '../utils/livingWorld.js'
import { findCompanionQuestMarker, getCompanionQuest } from '../utils/companionQuest.js'
import { CompanionBondCard } from './CompanionBond.jsx'
import DreamProject from './DreamProject.jsx'
import DreamProjectAdventures from './DreamProjectAdventures.jsx'
import { getDreamProjectState } from '../utils/dreamProject.js'

const PLOT_POSITIONS = [
  { left: '47%', top: '70%' },
  { left: '49%', top: '46%' },
  { left: '73%', top: '52%' },
]

const QUEST_MARKER_POSITIONS = [
  { left: '24%', top: '22%' },
  { left: '43%', top: '28%' },
  { left: '63%', top: '18%' },
  { left: '84%', top: '34%' },
  { left: '76%', top: '75%' },
]

const SEED_TEASERS = {
  rainbow: 'A striped colour-burst bud',
  moonberry: 'A glowing moon and berry lights',
  giggle: 'A smiling puff that loves to bounce',
  cloud: 'A tiny rain cloud with dancing drops',
}

function GrowingSeed({ seed }) {
  const soil = <div className="absolute bottom-0 left-1/2 h-4 w-16 -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-[#96623a] to-[#4b2d1c] shadow-lg"/>
  if (seed.id === 'rainbow') return <motion.div role="img" aria-label="Rainbow Seed growing" className="relative h-20 w-20" animate={{y:[0,-3,0],rotate:[-2,2,-2]}} transition={{duration:2,repeat:Infinity}}>
    {soil}<div className="absolute bottom-3 left-1/2 h-9 w-2 -translate-x-1/2 rounded-full bg-emerald-600"/><span className="absolute bottom-5 left-4 h-3 w-5 -rotate-[28deg] rounded-full bg-emerald-400"/>
    <div className="absolute left-1/2 top-0 h-12 w-12 -translate-x-1/2 rounded-[55%_55%_48%_48%] border-2 border-white shadow-[0_0_22px_#f472b6]" style={{background:'conic-gradient(#fb7185,#fb923c,#fde047,#4ade80,#38bdf8,#a78bfa,#fb7185)'}}><span className="absolute left-2 top-1 h-3 w-2 -rotate-12 rounded-full bg-white/70"/></div>
  </motion.div>
  if (seed.id === 'moonberry') return <motion.div role="img" aria-label="Moonberry Seed growing" className="relative h-20 w-20" animate={{y:[0,-4,0]}} transition={{duration:2.2,repeat:Infinity}}>
    {soil}<div className="absolute bottom-3 left-1/2 h-9 w-2 -translate-x-1/2 rounded-full bg-emerald-700"/><span className="absolute bottom-6 right-4 h-3 w-5 rotate-[25deg] rounded-full bg-teal-400"/>
    <div className="absolute left-1/2 top-0 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border-2 border-violet-200 bg-gradient-to-br from-violet-300 to-indigo-800 text-2xl shadow-[0_0_24px_#a78bfa]">🌙</div>
    {[18,38,50].map((left,index)=><motion.span key={left} className="absolute top-9 h-3 w-3 rounded-full bg-fuchsia-300 shadow-[0_0_10px_#e879f9]" style={{left}} animate={{scale:[.8,1.25,.8]}} transition={{duration:1.4,repeat:Infinity,delay:index*.2}}/>)}
  </motion.div>
  if (seed.id === 'giggle') return <motion.div role="img" aria-label="Giggle Seed growing" className="relative h-20 w-20" animate={{scale:[1,1.07,1],rotate:[-2,2,-2]}} transition={{duration:1.5,repeat:Infinity}}>
    {soil}<div className="absolute bottom-3 left-1/2 h-8 w-3 -translate-x-1/2 rounded-full bg-amber-700"/>
    <div className="absolute left-1/2 top-1 h-12 w-14 -translate-x-1/2 rounded-[48%] border-2 border-lime-100 bg-gradient-to-br from-lime-300 to-emerald-600 shadow-[0_0_20px_#86efac]"><span className="absolute left-3 top-4 h-2 w-2 rounded-full bg-[#28451d]"/><span className="absolute right-3 top-4 h-2 w-2 rounded-full bg-[#28451d]"/><span className="absolute left-1/2 top-7 h-2 w-5 -translate-x-1/2 rounded-b-full border-b-2 border-[#28451d]"/><span className="absolute -right-2 top-0 text-sm">✨</span></div>
  </motion.div>
  return <motion.div role="img" aria-label="Cloud Seed growing" className="relative h-20 w-20" animate={{x:[-3,3,-3],y:[0,-3,0]}} transition={{duration:2.4,repeat:Infinity}}>
    {soil}<div className="absolute bottom-3 left-1/2 h-8 w-2 -translate-x-1/2 rounded-full bg-teal-600"/>
    <div className="absolute left-1/2 top-2 h-10 w-16 -translate-x-1/2 rounded-full border-2 border-white bg-gradient-to-b from-white to-sky-200 shadow-[0_0_22px_#7dd3fc]"><span className="absolute -top-3 left-2 h-9 w-9 rounded-full bg-white"/><span className="absolute -top-2 right-2 h-8 w-8 rounded-full bg-sky-50"/></div>
    {[23,38,53].map((left,index)=><motion.span key={left} className="absolute top-12 h-4 w-2 rounded-full bg-sky-400" style={{left}} animate={{y:[0,8],opacity:[1,0]}} transition={{duration:1,repeat:Infinity,delay:index*.25}}/>)}
  </motion.div>
}

function SeedKernel({ seed }) {
  return <motion.div role="img" aria-label={`${seed.name} planted`} className="relative h-20 w-20" animate={{scale:[1,1.06,1]}} transition={{duration:2.2,repeat:Infinity}}>
    <div className="absolute bottom-0 left-1/2 h-5 w-16 -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-[#96623a] to-[#4b2d1c] shadow-lg"/>
    <div className="absolute left-1/2 top-5 grid h-11 w-9 -translate-x-1/2 place-items-center rounded-[55%_55%_48%_48%] border-2 border-white text-xl shadow-xl" style={{background:`linear-gradient(145deg,#fff,${seed.color})`,boxShadow:`0 0 20px ${seed.color}88`}}>{seed.icon}</div>
    <motion.span className="absolute right-2 top-2 text-lg" animate={{rotate:[0,18,0],scale:[.8,1.15,.8]}} transition={{duration:1.5,repeat:Infinity}}>✨</motion.span>
  </motion.div>
}

function SeedPlantBase({ seedId, ready = false }) {
  const seed = WONDER_SEEDS.find(item => item.id === seedId) || WONDER_SEEDS[0]
  if (!ready) return <GrowingSeed seed={seed}/>
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

function SeedPlant({ seedId, ready = false, stage = 'sprout', discoveryName = '' }) {
  const seed = WONDER_SEEDS.find(item => item.id === seedId) || WONDER_SEEDS[0]
  if (!ready && stage === 'seed') return <SeedKernel seed={seed}/>
  const plant = <SeedPlantBase seedId={seedId} ready={ready}/>
  if (!ready || !discoveryName) return plant
  const details = getWonderDiscoveryDetails(discoveryName)
  const variant = Math.max(0, seed.discoveries.indexOf(discoveryName))
  const positions = ['-right-2 -top-2', '-left-2 top-2', 'right-0 top-8']
  return <motion.div role="img" aria-label={discoveryName} className="relative h-24 w-24" whileTap={{scale:.9,rotate:variant===1?-5:5}}>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 scale-110">{plant}</div>
    <motion.span className={`absolute ${positions[variant]} grid h-10 w-10 place-items-center rounded-full border-2 border-white text-2xl shadow-xl`} style={{background:`linear-gradient(145deg,#fff,${details.accent}55)`,boxShadow:`0 0 18px ${details.accent}`}} animate={{y:[0,-4,0],rotate:variant===2?[0,15,0]:[0,-8,0]}} transition={{duration:1.7+variant*.25,repeat:Infinity}}>{details.icon}</motion.span>
    <span className="absolute bottom-1 left-1 h-3 w-3 rounded-full" style={{background:details.accent,boxShadow:`0 0 12px ${details.accent}`}}/>
  </motion.div>
}

const LIVING_WORLD_THEMES = {
  toddler: { primary: '#ef476f', accent: '#ff7a2f', text: '#421a0c' },
  early: { primary: '#7a3bad', accent: '#ec4899', text: '#32113f' },
  junior: { primary: '#7d321f', accent: '#b86a2f', text: '#2c160d' },
}

export default function WonderWorld({ progress, profileName, ageGroup = 'early', onUpdateProgress, onBack }) {
  const today = formatLocalDate()
  const world = normalizeWonderWorld(progress?.wonderWorld)
  const availableAwards = getAvailableSeedAwards(world)
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [newDiscovery, setNewDiscovery] = useState(null)
  const [activeDiscovery, setActiveDiscovery] = useState(null)
  const [reactionBurst, setReactionBurst] = useState(0)
  const [showTreasures, setShowTreasures] = useState(false)
  const [questCelebration, setQuestCelebration] = useState(false)
  const recentDiscoveries = useMemo(() => [...world.discoveries].reverse().slice(0, 12), [world.discoveries])
  const treasureCollection = normaliseTreasureCollection(progress?.treasureCollection)
  const copy = LIVING_WORLD_AGE_COPY[ageGroup] || LIVING_WORLD_AGE_COPY.early
  const theme = LIVING_WORLD_THEMES[ageGroup] || LIVING_WORLD_THEMES.early
  const worldScore = getLivingWorldScore(progress)
  const equippedItems = Object.values(treasureCollection.equipped)
    .map(id => treasureCollection.items.find(item => item.id === id))
    .filter(Boolean)
  const buddy = treasureCollection.items.find(item => item.id === treasureCollection.equipped?.buddy)
    || { id: 'yaagvi', name: 'Yaagvi', image: '/yaagvi-3d-wave.png' }
  const companionQuest = getCompanionQuest(world, { date: today, ageGroup, buddyId: buddy.id })
  const dreamProjectComplete = getDreamProjectState(progress, ageGroup).completed

  const plant = seedId => {
    onUpdateProgress?.(currentProgress => ({
      wonderWorld: plantWonderSeed(currentProgress?.wonderWorld, selectedPlot, seedId, today),
    }))
    setSelectedPlot(null)
    confetti({ particleCount: 55, spread: 80, origin: { y: .72 }, colors: ['#4ade80','#fde047','#f9a8d4'] })
  }
  const reveal = index => {
    const result = revealWonderPlot(world, index, today)
    if (!result.discovery) return
    const details = getWonderDiscoveryDetails(result.discovery.name)
    const rewardPreview = claimWonderTreasureReward(progress?.treasureCollection, result.discovery, details)
    onUpdateProgress?.(currentProgress => ({
      wonderWorld: revealWonderPlot(currentProgress?.wonderWorld, index, today).world,
      treasureCollection: claimWonderTreasureReward(currentProgress?.treasureCollection, result.discovery, details).collection,
    }))
    setNewDiscovery({ ...result.discovery, treasure: rewardPreview.item, duplicate: rewardPreview.duplicate })
    confetti({ particleCount: 150, spread: 150, origin: { y: .55 } })
  }
  const playWithDiscovery = item => {
    setActiveDiscovery(item)
    setReactionBurst(value => value + 1)
    onUpdateProgress?.(currentProgress => ({ wonderWorld: interactWithWonderDiscovery(currentProgress?.wonderWorld, item.id) }))
    confetti({ particleCount: 24, spread: 65, origin: { y: .75 }, scalar: .7 })
  }
  const tapPlot = (plot, index) => {
    if (!plot) { if (availableAwards.length) setSelectedPlot(index); return }
    if (isWonderPlotReady(plot, today)) reveal(index)
  }
  const equipTreasure = item => onUpdateProgress?.(currentProgress => ({
    treasureCollection: equipTreasureReward(currentProgress?.treasureCollection, item),
  }))
  const updateTreasureCollection = nextCollection => onUpdateProgress?.({ treasureCollection: nextCollection })
  const hatchEgg = () => {
    const result = hatchMysteryEgg(progress?.treasureCollection)
    if (result.hatched) onUpdateProgress?.({ treasureCollection: result.collection })
    return result
  }
  const findQuestMarker = markerId => {
    const preview = findCompanionQuestMarker(world, markerId, { date: today, ageGroup, buddyId: buddy.id })
    if (!preview.newlyFound) return
    onUpdateProgress?.(currentProgress => {
      const result = findCompanionQuestMarker(currentProgress?.wonderWorld, markerId, { date: today, ageGroup, buddyId: buddy.id })
      const patch = { wonderWorld: result.world }
      if (result.completed) {
        const collection = normaliseTreasureCollection(currentProgress?.treasureCollection)
        patch.treasureCollection = { ...collection, sparkleDust: collection.sparkleDust + 5 }
      }
      return patch
    })
    if (preview.completed) {
      setQuestCelebration(true)
      confetti({ particleCount: 130, spread: 130, origin: { y: .58 }, colors: ['#fde047','#a78bfa','#34d399'] })
    }
  }

  return <div className="min-h-screen bg-[#fff3da] pb-16 text-[#3b210f]">
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-[#fff8e8]/95 px-4 py-3 shadow-sm backdrop-blur"><div className="mx-auto flex max-w-6xl items-center gap-3"><button onClick={onBack} className="h-11 rounded-full bg-white px-4 font-bubble shadow">← Back</button><div className="min-w-0 flex-1"><p className="font-round text-[10px] font-black uppercase tracking-[.18em]" style={{color:theme.primary}}>{copy.eyebrow}</p><h1 className="truncate font-bubble text-xl sm:text-2xl">{profileName || 'Your'}&apos;s Living World</h1></div><div className="rounded-2xl bg-[#e8ffd5] px-3 py-2 text-center"><p className="text-lg">🌱</p><p className="font-bubble leading-none">{availableAwards.length}</p></div></div></header>

    <main className="mx-auto max-w-6xl px-3 pt-4 sm:px-5">
      <div className="rounded-3xl bg-white/75 p-4 shadow"><p className="font-bubble text-xl">Everything you earn lives here.</p><p className="mt-1 font-round text-sm font-bold text-[#78583e]">{copy.intro}</p><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-[#fff4cf] p-2"><p className="font-bubble text-lg">{treasureCollection.items.length}</p><p className="font-round text-[9px] font-black uppercase">Treasures</p></div><div className="rounded-2xl bg-[#eefbdc] p-2"><p className="font-bubble text-lg">{world.discoveries.length}</p><p className="font-round text-[9px] font-black uppercase">Discoveries</p></div><div className="rounded-2xl bg-[#f4e8ff] p-2"><p className="font-bubble text-lg">{worldScore}</p><p className="font-round text-[9px] font-black uppercase">World points</p></div></div></div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <CompanionBondCard progress={progress} ageGroup={ageGroup} onChooseBuddy={()=>setShowTreasures(true)}/>
      <section data-testid="companion-quest" className="overflow-hidden rounded-3xl border-2 bg-gradient-to-r from-[#30205d] via-[#63378d] to-[#b64f91] p-4 text-white shadow-xl" style={{borderColor:`${theme.accent}88`}}>
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-white/70 bg-white/90 shadow-lg">{buddy.image?<img src={buddy.image} alt={buddy.name} className="h-full w-full object-contain"/>:<span className="text-4xl">{buddy.emoji || '🧸'}</span>}</div>
          <div className="min-w-0 flex-1"><p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-yellow-200">Today&apos;s buddy quest · {buddy.name}</p><h2 className="font-bubble text-xl sm:text-2xl">{companionQuest.completedAt ? 'Quest complete!' : companionQuest.title}</h2><p className="font-round text-xs font-bold text-white/80">{companionQuest.completedAt ? 'Your Wonder Seed and 5 sparkle dust are safe. Keep planting, building, and playing with your discoveries.' : ageGroup==='toddler'?`Tap ${companionQuest.required} glowing ${companionQuest.plural}.`:`Search the world and find ${companionQuest.required} hidden ${companionQuest.plural}.`}</p></div>
          <div className="shrink-0 rounded-2xl bg-black/20 px-3 py-2 text-center"><p className="font-bubble text-xl">{companionQuest.found.length}/{companionQuest.required}</p><p className="font-round text-[8px] font-black uppercase text-yellow-200">found</p></div>
        </div>
        <div className="mt-3 flex gap-2" aria-label={`${companionQuest.found.length} of ${companionQuest.required} buddy clues found`}>{Array.from({length:companionQuest.required}).map((_,index)=><span key={index} className={`h-2 flex-1 rounded-full ${index<companionQuest.found.length?'bg-yellow-300':'bg-white/20'}`}/>)}</div>
      </section>
      </div>

      <DreamProject
        progress={progress}
        ageGroup={ageGroup}
        equippedItems={equippedItems}
        onUpdateProgress={onUpdateProgress}
      />

      {dreamProjectComplete && <DreamProjectAdventures
        progress={progress}
        ageGroup={ageGroup}
        onUpdateProgress={onUpdateProgress}
      />}

      <div className="relative mt-4 h-[380px] overflow-hidden rounded-[30px] border-4 border-[#cb8a4b] bg-cover bg-center shadow-2xl sm:h-auto sm:aspect-[16/9]" style={{backgroundImage:'url(/yaagvi-secret-world.webp)'}}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#3b210f]/20 via-transparent to-white/5"/>
        <motion.div className="absolute bottom-0 left-[7%] z-10" animate={{y:[0,-5,0]}} transition={{duration:2.4,repeat:Infinity}}>
          <YaagviCharacter state="wave" size={150} imageClassName="drop-shadow-2xl" />
        </motion.div>
        {!companionQuest.completedAt&&Array.from({length:companionQuest.required}).map((_,index)=>!companionQuest.found.includes(index)&&<motion.button type="button" key={`quest-${index}`} onClick={()=>findQuestMarker(index)} aria-label={`Find ${companionQuest.singular} ${index+1}`} className={`absolute z-30 grid place-items-center rounded-full border-2 border-white bg-[#fff8c7]/90 shadow-[0_0_24px_#fde047] ${ageGroup==='junior'?'h-10 w-10 text-xl':'h-14 w-14 text-3xl'}`} style={QUEST_MARKER_POSITIONS[index]} initial={{scale:0,opacity:0}} animate={{scale:[1,1.14,1],opacity:1,rotate:[-6,6,-6]}} transition={{scale:{duration:1.4,repeat:Infinity,delay:index*.15},opacity:{duration:.3},rotate:{duration:2,repeat:Infinity}}}>{companionQuest.icon}</motion.button>)}
        {equippedItems.map((item,index)=><motion.button type="button" key={item.id} onClick={()=>setShowTreasures(true)} className="absolute z-20 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border-2 border-white/80 bg-white/90 text-3xl shadow-xl sm:h-20 sm:w-20 sm:text-4xl" style={{right:`${4+(index%2)*10}%`,bottom:`${8+Math.floor(index/2)*21}%`}} animate={{y:[0,-4,0],rotate:[-2,2,-2]}} transition={{duration:2+index*.25,repeat:Infinity}} aria-label={`${item.name} on display`}>{item.image?<img src={item.image} alt="" className="h-full w-full object-contain"/>:(item.emoji||'🎁')}</motion.button>)}
        {world.plots.map((plot,index)=>{const growth=getWonderGrowthStage(plot,today),ready=growth.id==='ready',seed=plot?(WONDER_SEEDS.find(item=>item.id===plot.seedId)||WONDER_SEEDS[0]):null;return <motion.button key={index} onClick={()=>tapPlot(plot,index)} whileTap={{scale:.9}} className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={PLOT_POSITIONS[index]}>
          <motion.div animate={ready?{scale:[1,1.12,1]}:{}} transition={{duration:1.4,repeat:Infinity}} className={`grid h-16 w-16 place-items-center rounded-full border-4 shadow-xl sm:h-24 sm:w-24 ${ready?'ring-8 ring-yellow-300/35':plot?'':'border-dashed border-white/90 bg-[#fff8e8]/75'}`} style={plot?{borderColor:ready?'#fde047':seed.color,background:`radial-gradient(circle, white 0%, ${seed.color}22 72%, ${seed.color}55 100%)`,boxShadow:`0 12px 26px ${seed.color}55`}:undefined}>
            {plot?<div className="scale-75 sm:scale-100"><SeedPlant seedId={plot.seedId} ready={ready} stage={growth.id}/></div>:<span className="font-bubble text-3xl text-emerald-700">+</span>}
          </motion.div>
          <span className="mt-1 min-w-24 max-w-36 rounded-xl bg-[#3b210f]/90 px-2 py-1 text-center font-round text-[9px] font-black text-white shadow sm:text-xs">{ready?'✨ TAP TO DISCOVER':plot?<><span className="whitespace-nowrap" style={{color:seed.color}}>{seed.icon} {seed.name.replace(' Seed','')}</span><span className="block text-white">Stage {growth.step}/3 · {growth.id==='seed'?'planted':'sprouting'}</span><span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/25"><span className="block h-full rounded-full" style={{width:`${growth.progress}%`,background:seed.color}}/></span></>:availableAwards.length?'Plant here':'Earn a seed first'}</span>
        </motion.button>})}
      </div>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-3xl bg-white/80 p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3"><div><p className="font-round text-[10px] font-black uppercase tracking-[.18em]" style={{color:theme.primary}}>Things I really earned</p><h2 className="font-bubble text-2xl">My treasures</h2><p className="font-round text-xs font-bold text-[#78583e]">Choose what appears inside your world.</p></div><span className="text-4xl">🧰</span></div>
          <div className="mt-3 flex min-h-20 items-center gap-2 overflow-x-auto rounded-2xl bg-[#fff7e7] p-3">{treasureCollection.items.length?treasureCollection.items.slice(-5).map(item=><span key={item.id} title={item.name} className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-white bg-white text-3xl shadow">{item.image?<img src={item.image} alt={item.name} className="h-full w-full object-contain"/>:(item.emoji||'🎁')}</span>):<p className="font-round text-sm font-bold text-[#78583e]">Complete two adventures to open your first treasure.</p>}</div>
          <motion.button whileTap={{scale:.97}} onClick={()=>setShowTreasures(true)} className="mt-3 min-h-12 w-full rounded-2xl font-bubble text-white shadow-lg" style={{background:`linear-gradient(100deg,${theme.accent},${theme.primary})`}}>DECORATE MY WORLD →</motion.button>
        </div>
        <YaagviRoom theme={theme} roomScore={worldScore} stickersCount={treasureCollection.items.length} dark profileName={profileName}/>
      </section>

      <MysteryEgg collection={treasureCollection} profileName={profileName} onHatch={hatchEgg}/>

      <section className="mt-5 rounded-3xl bg-white/75 p-4 shadow"><div className="flex items-end justify-between"><div><p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Made by your world</p><h2 className="font-bubble text-2xl">{copy.discoveries}</h2><p className="font-round text-xs font-bold text-[#78583e]">Tap any friend to make it react.</p></div><p className="font-bubble text-emerald-700">{world.discoveries.length}</p></div>{recentDiscoveries.length?<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{recentDiscoveries.map(item=>{const seed=WONDER_SEEDS.find(seedItem=>seedItem.id===item.seedId)||WONDER_SEEDS[0],details=getWonderDiscoveryDetails(item.name);return <motion.button key={item.id} onClick={()=>playWithDiscovery(item)} whileTap={{scale:.93}} className="rounded-2xl border-2 bg-[#f6ffe9] p-3 text-center shadow-sm" style={{borderColor:`${details.accent}55`,background:`linear-gradient(145deg,#f6ffe9,${details.accent}20)`}}><div className="mx-auto flex h-24 items-end justify-center"><SeedPlant seedId={item.seedId} ready discoveryName={item.name}/></div><p className="mt-1 font-bubble text-sm">{item.name}</p><p className="font-round text-[9px] font-black uppercase" style={{color:seed.color}}>{item.interactionCount?`Played ${item.interactionCount}×`:'Tap to play'}</p></motion.button>})}</div>:<div className="mt-3 rounded-2xl border-2 border-dashed border-emerald-700/15 p-6 text-center"><p className="text-4xl">🌱</p><p className="mt-1 font-bubble">Your first discovery begins with a Wonder Seed.</p></div>}</section>
    </main>
    <AnimatePresence>{questCelebration&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[320] grid place-items-center overflow-y-auto bg-[#1e1238]/85 p-4 backdrop-blur-md"><motion.div initial={{scale:.55,y:60}} animate={{scale:1,y:0}} exit={{scale:.8,opacity:0}} transition={{type:'spring'}} className="w-full max-w-md overflow-hidden rounded-[34px] border-4 border-yellow-200 bg-gradient-to-b from-[#fff8c9] via-[#f5d9ff] to-[#b7f7de] p-6 text-center shadow-2xl"><motion.div className="text-8xl" animate={{y:[0,-10,0],rotate:[-5,5,-5]}} transition={{duration:1.8,repeat:Infinity}}>{companionQuest.icon}</motion.div><p className="font-round text-xs font-black uppercase tracking-[.2em] text-[#6b348c]">Buddy quest complete</p><h2 className="mt-1 font-bubble text-3xl text-[#32113f]">You found them all!</h2><p className="mt-2 font-round text-sm font-bold text-[#66456f]">{buddy.name} found a reward for your Living World.</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/80 p-3 shadow"><p className="text-4xl">🌱</p><p className="font-bubble text-sm">1 Wonder Seed</p></div><div className="rounded-2xl bg-white/80 p-3 shadow"><p className="text-4xl">✨</p><p className="font-bubble text-sm">5 Sparkle Dust</p></div></div><button onClick={()=>setQuestCelebration(false)} className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#7a3bad] to-[#ec4899] font-bubble text-lg text-white shadow-lg">KEEP MY REWARDS →</button></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{showTreasures&&<TreasureShelf collection={treasureCollection} ageGroup={ageGroup} onEquip={equipTreasure} onCollectionChange={updateTreasureCollection} onClose={()=>setShowTreasures(false)} profileName={profileName}/>}</AnimatePresence>

    <AnimatePresence>{selectedPlot!==null&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[200] flex items-end justify-center bg-[#20120a]/70 p-4 backdrop-blur-sm sm:items-center" onClick={()=>setSelectedPlot(null)}><motion.div initial={{y:80,scale:.9}} animate={{y:0,scale:1}} exit={{y:80,opacity:0}} onClick={event=>event.stopPropagation()} className="w-full max-w-lg rounded-[30px] bg-[#fff8e8] p-5 shadow-2xl"><p className="font-round text-xs font-black uppercase tracking-[.18em] text-emerald-700">Use one Wonder Seed</p><h2 className="font-bubble text-2xl">What should this become?</h2><div className="mt-4 grid grid-cols-2 gap-3">{WONDER_SEEDS.map(seed=><motion.button key={seed.id} whileTap={{scale:.94}} onClick={()=>plant(seed.id)} className="overflow-hidden rounded-2xl border-2 p-3 text-center shadow-lg" style={{borderColor:seed.color,background:`linear-gradient(145deg,white,${seed.color}24)`}}><div className="mx-auto flex h-20 items-center justify-center"><GrowingSeed seed={seed}/></div><p className="font-bubble text-sm" style={{color:seed.color}}>{seed.name}</p><p className="mt-1 font-round text-[10px] font-bold text-[#6f4b35]">{SEED_TEASERS[seed.id]}</p></motion.button>)}</div><button onClick={()=>setSelectedPlot(null)} className="mt-4 min-h-12 w-full rounded-xl bg-[#eadfcb] font-bubble">Not yet</button></motion.div></motion.div>}
    {newDiscovery&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto bg-[#16310f]/80 p-4 backdrop-blur-md"><motion.div initial={{scale:.5,y:60}} animate={{scale:1,y:0}} transition={{type:'spring'}} className="w-full max-w-md rounded-[34px] bg-gradient-to-b from-[#f5ffd8] to-[#ffe08a] p-6 text-center shadow-2xl"><p className="font-round text-xs font-black uppercase tracking-[.2em] text-emerald-800">Your world made something new!</p><div className="mx-auto mt-2 flex h-36 items-end justify-center"><SeedPlant seedId={newDiscovery.seedId} ready discoveryName={newDiscovery.name}/></div><h2 className="font-bubble text-3xl">{newDiscovery.name}</h2><p className="mt-2 font-round text-sm font-bold text-[#6b4c2b]">{getWonderDiscoveryDetails(newDiscovery.name).reaction}</p><div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-amber-400/50 bg-white/75 p-3 text-left shadow"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-100 text-3xl">{newDiscovery.duplicate?'✨':getWonderDiscoveryDetails(newDiscovery.name).icon}</span><span><span className="block font-round text-[10px] font-black uppercase tracking-[.15em] text-amber-700">Treasure Room reward</span><span className="block font-bubble text-base">{newDiscovery.duplicate?'+10 Sparkle Dust':newDiscovery.treasure?.name}</span><span className="block font-round text-[10px] font-bold text-[#78583e]">{newDiscovery.duplicate?'You already owned this keepsake.':'Yours forever · use it as room decor'}</span></span></div><button onClick={()=>setNewDiscovery(null)} className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 font-bubble text-lg text-white shadow-lg">KEEP IT IN MY WORLD →</button></motion.div></motion.div>}
    {activeDiscovery&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[205] flex items-center justify-center bg-[#142a18]/75 p-4 backdrop-blur-sm" onClick={()=>setActiveDiscovery(null)}><motion.div initial={{scale:.7,y:40}} animate={{scale:1,y:0}} exit={{scale:.8,opacity:0}} onClick={event=>event.stopPropagation()} className="w-full max-w-sm overflow-hidden rounded-[32px] border-4 border-white/70 bg-gradient-to-b from-white to-[#e9ffd8] p-5 text-center shadow-2xl"><p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">A friend who remembers you</p><motion.div key={reactionBurst} className="mx-auto flex h-44 items-end justify-center" initial={{scale:.65,rotate:-12}} animate={{scale:[.65,1.18,1],rotate:[-12,8,0]}}><SeedPlant seedId={activeDiscovery.seedId} ready discoveryName={activeDiscovery.name}/></motion.div><h2 className="font-bubble text-2xl">{activeDiscovery.name}</h2><motion.p key={`reaction-${reactionBurst}`} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="mt-2 rounded-2xl bg-white/75 p-3 font-round text-sm font-extrabold text-[#5d412d]">{getWonderDiscoveryDetails(activeDiscovery.name).reaction}</motion.p><button onClick={()=>playWithDiscovery(activeDiscovery)} className="mt-4 min-h-12 w-full rounded-2xl font-bubble text-white shadow-lg" style={{background:getWonderDiscoveryDetails(activeDiscovery.name).accent}}>PLAY AGAIN ✨</button><button onClick={()=>setActiveDiscovery(null)} className="mt-2 min-h-10 w-full font-round text-xs font-black text-[#78583e]">Back to my world</button></motion.div></motion.div>}</AnimatePresence>
  </div>
}
