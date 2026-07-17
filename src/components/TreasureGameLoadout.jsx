import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getActiveTreasure, getOwnedTreasureItems, getTreasureEvolution, getTreasurePower, getTreasureQuest, getTreasureQuestRewards, normaliseTreasureLoadout } from '../utils/treasureLoadout.js'

function TreasureArt({ item, className = 'h-10 w-10', animate = false }) {
  const content = item?.image
    ? <img src={item.image} alt="" className={`${className} object-contain`} />
    : <span className={className.includes('h-16') ? 'text-5xl' : 'text-3xl'}>{item?.emoji || '✨'}</span>
  return animate
    ? <motion.div animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.2, repeat: Infinity }}>{content}</motion.div>
    : content
}

export function TreasureLoadoutBadge({ collection, moduleId, onOpen }) {
  const active = getActiveTreasure(collection, moduleId)
  if (!active) return null
  return <motion.button
    data-testid="treasure-loadout-badge"
    whileTap={{ scale: .9 }}
    onClick={onOpen}
    className="relative flex h-12 min-h-0 shrink-0 items-center gap-1 rounded-full border-2 border-[#f4b63e] bg-[#fff8d6] p-1 pr-2 shadow-md"
    aria-label={`Choose game treasure. ${active.item.name}, level ${active.evolution.level}`}
  >
    <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white"><TreasureArt item={active.item}/></span>
    <span className="hidden text-left xl:block"><span className="block max-w-20 truncate font-bubble text-[10px] text-[#351407]">{active.item.name}</span><span className="block font-round text-[8px] font-black uppercase text-[#8a3bad]">Lv.{active.evolution.level} {active.evolution.accessory}</span></span>
  </motion.button>
}

export function ActiveGameTreasure({ active, quest, rewards = [], onActivate, message = '' }) {
  if (!active) return null
  return <div className="pointer-events-none fixed bottom-4 right-4 z-[175] flex flex-col items-end" data-testid="active-game-treasure">
    <AnimatePresence>{message && <motion.div initial={{ opacity: 0, y: 8, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5 }} className="mb-2 max-w-56 rounded-2xl border-2 border-white bg-[#3b1747] px-4 py-3 text-center font-round text-xs font-extrabold text-white shadow-2xl">{message}</motion.div>}</AnimatePresence>
    <motion.button
      data-testid="treasure-power"
      className="pointer-events-auto relative grid h-20 w-20 min-h-0 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-[#fff6b1] to-[#ffb6d9] shadow-2xl"
      style={{ boxShadow: `0 0 28px ${active.evolution.aura}99` }}
      whileHover={{ scale: 1.06 }} whileTap={{ scale: .88 }} onClick={onActivate}
      aria-label={`Use ${active.power.name}`}
    >
      <TreasureArt item={active.item} className="h-16 w-16" animate/>
      <span className="absolute -left-2 -top-2 grid h-7 min-w-7 place-items-center rounded-full bg-[#4a1f56] px-1 font-bubble text-xs text-white">{active.power.icon}</span>
      <span className="absolute -bottom-2 rounded-full bg-[#fff8df] px-2 py-1 font-round text-[8px] font-black uppercase text-[#58213c] shadow">Tap for magic</span>
      {quest && !quest.locked && <span data-testid="treasure-quest-progress" className="absolute -right-2 -top-2 grid h-8 min-w-8 place-items-center rounded-full border-2 border-white bg-[#16a34a] px-1 font-bubble text-[9px] text-white shadow">{quest.completed.length}/{quest.required}</span>}
      {rewards.length > 0 && <motion.span data-testid="treasure-quest-reward" title={rewards.at(-1).name} className="absolute -right-2 top-8 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#6d28d9] text-base shadow" animate={{scale:[1,1.14,1],rotate:[0,6,0]}} transition={{duration:2,repeat:Infinity}}>{rewards.at(-1).icon}</motion.span>}
    </motion.button>
  </div>
}

export function TreasureLoadoutPicker({ collection, moduleId, ageGroup = 'early', open, onClose, onChoose }) {
  const items = getOwnedTreasureItems(collection)
  const active = getActiveTreasure(collection, moduleId)
  const loadout = normaliseTreasureLoadout(collection?.treasureLoadout)
  return <AnimatePresence>{open && <motion.div data-testid="treasure-loadout-picker" className="fixed inset-0 z-[280] grid place-items-center bg-[#24102d]/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.section initial={{ y: 30, scale: .94 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .96 }} onClick={event => event.stopPropagation()} className="max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border-4 border-[#f5be4f] bg-[#fff5df] p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><p className="font-round text-[10px] font-black uppercase tracking-[.2em] text-[#a34820]">Bring treasure into this game</p><h2 className="font-bubble text-2xl text-[#351407]">Choose my magical helper</h2><p className="mt-1 font-round text-sm font-bold text-[#76462d]">Every real learning win gives the chosen treasure 6 XP.</p></div><button onClick={onClose} className="grid h-11 w-11 min-h-0 place-items-center rounded-full bg-white font-bubble text-lg shadow" aria-label="Close treasure chooser">×</button></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(item => {
          const evolution = getTreasureEvolution(loadout.itemProgress[item.id] || {})
          const power = getTreasurePower(item)
          const quest = getTreasureQuest(collection,item.id,ageGroup)
          const selected = active?.item.id === item.id
          return <button key={item.id} data-testid={`treasure-option-${item.id}`} onClick={() => onChoose(item.id)} className={`relative min-h-40 rounded-3xl border-3 p-3 text-left shadow-md ${selected ? 'border-[#9333ea] bg-[#f3ddff]' : 'border-[#e9c98f] bg-white'}`}>
            <div className="flex items-start justify-between"><span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-[#fff4c7]"><TreasureArt item={item} className="h-12 w-12"/></span><span className="rounded-full bg-[#4a1f56] px-2 py-1 font-round text-[9px] font-black text-white">LV.{evolution.level}</span></div>
            <p className="mt-2 font-bubble text-sm text-[#351407]">{item.name}</p><p className="mt-1 font-round text-[10px] font-extrabold text-[#8a3bad]">{power.icon} {power.name}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8dcc8]"><div className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#a855f7]" style={{ width: `${evolution.progressPercent}%` }}/></div><p className="mt-1 font-round text-[8px] font-black text-[#8b6245]">{evolution.xp} XP · {evolution.next ? `${evolution.next.need - evolution.xp} to evolve` : 'Legendary!'}</p>
            <p className={`mt-2 rounded-xl px-2 py-1 font-round text-[9px] font-black ${quest.locked?'bg-[#eee5d8] text-[#8b735e]':'bg-[#dcfce7] text-[#166534]'}`}>{quest.locked?`🔒 Quest in ${quest.xpToUnlock} XP`:`🗺️ Quest ${quest.completed.length}/${quest.required}`}</p>
          </button>
        })}
      </div>
      {active && (()=>{const quest=getTreasureQuest(collection,active.item.id,ageGroup),rewards=getTreasureQuestRewards(collection,active.item.id,ageGroup);return <div className="mt-4 grid gap-3 rounded-2xl bg-[#3b1747] p-4 text-white sm:grid-cols-2"><div><p className="font-bubble text-sm">{active.power.icon} {active.power.name}</p><p className="font-round text-xs font-bold text-white/75">{active.power.description} It never reveals the answer.</p>{rewards.length>0&&<p data-testid="unlocked-treasure-effects" className="mt-2 font-round text-[10px] font-black text-yellow-200">Unlocked: {rewards.map(reward=>`${reward.icon} ${reward.name}`).join(' · ')}</p>}</div><div data-testid="active-treasure-quest" className="rounded-xl bg-white/10 p-3"><p className="font-round text-[9px] font-black uppercase tracking-wider text-yellow-200">Treasure quest · Route {quest.cycle}</p>{quest.locked?<p className="mt-1 font-bubble text-sm">Earn {quest.xpToUnlock} XP to begin</p>:<><p className="mt-1 font-bubble text-sm">Next: {quest.nextName}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-400" style={{width:`${quest.progressPercent}%`}}/></div><p className="mt-1 font-round text-[9px] font-bold text-white/70">Reward: {quest.reward.icon} {quest.reward.name}</p></>}</div></div>})()}
    </motion.section>
  </motion.div>}</AnimatePresence>
}
