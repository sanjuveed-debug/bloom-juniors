import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech.js'
import {
  TREASURE_ITEMS,
  getMysteryEggProgress,
  getTreasureStreakProgress,
  nextTreasure,
  normaliseTreasureCollection,
} from '../utils/treasureRewards.js'
import {
  getTreasurePersonality,
  getTreasureSetProgress,
  interactWithLivingTreasure,
  moveLivingTreasure,
  placeLivingTreasure,
  recordTreasureSecretGame,
  removeLivingTreasure,
} from '../utils/livingTreasures.js'

export { TREASURE_ITEMS, nextTreasure }

const SLOT_LABELS = {
  buddy: 'Adventure buddy',
  outfit: 'Explorer outfit',
  tool: 'Explorer tool',
  room: 'Room decoration',
}

const TREASURE_MOTIONS = {
  bounce: { y: [0, -16, 0], scale: [1, 1.06, 1] },
  spin: { rotate: [0, 16, -10, 360], scale: [1, 1.08, 1] },
  glow: { scale: [1, 1.16, 1], filter: ['drop-shadow(0 0 0px #fde047)', 'drop-shadow(0 0 18px #fde047)', 'drop-shadow(0 0 0px #fde047)'] },
  wiggle: { rotate: [0, -12, 12, -8, 8, 0], y: [0, -4, 0] },
  float: { y: [0, -22, -4, 0], rotate: [0, 4, -4, 0] },
  pulse: { scale: [1, 1.22, .96, 1.12, 1] },
  sway: { rotate: [0, -10, 9, -6, 5, 0], x: [0, -5, 5, 0] },
  peek: { x: [0, -13, 12, 0], rotate: [0, -8, 7, 0], scale: [1, .92, 1.08, 1] },
}

function TreasureArt({ item, size = 'large' }) {
  const large = size === 'large'
  const [videoReady, setVideoReady] = useState(false)
  const dimensions = large ? 'h-64 w-52' : 'h-20 w-16'
  if (item?.video) {
    return (
      <div className={`relative ${dimensions}`} aria-label={item.name}>
        {item.image && (
          <img src={item.image} alt={item.name}
            className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
        )}
        <video autoPlay muted loop playsInline preload="auto" poster={item.image}
          onCanPlay={() => setVideoReady(true)} onError={() => setVideoReady(false)}
          className={`absolute inset-0 h-full w-full object-contain drop-shadow-2xl transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}>
          <source src={item.video} type="video/webm" />
        </video>
      </div>
    )
  }
  if (item?.image) return <img src={item.image} alt={item.name} className={`${dimensions} object-contain drop-shadow-2xl`} />
  return <span className={large ? 'text-9xl' : 'text-5xl'}>{item?.emoji || '🎁'}</span>
}

function ChestAnimation({ open, reducedMotion }) {
  return (
    <div className="relative mx-auto h-36 w-52" aria-hidden="true">
      <AnimatePresence>
        {open && [...Array(10)].map((_, index) => (
          <motion.span key={index} className="absolute left-1/2 top-16 text-2xl"
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], x: (index % 2 ? -1 : 1) * (35 + index * 9), y: -55 - (index % 4) * 22, scale: [0, 1.3, .7] }}
            transition={{ duration: reducedMotion ? .2 : 1.4, delay: index * .04 }}>
            {index % 3 === 0 ? '✨' : '⭐'}
          </motion.span>
        ))}
      </AnimatePresence>
      <motion.div className="absolute bottom-3 left-5 h-20 w-[168px] rounded-b-[28px] rounded-t-xl border-4 border-[#7b3b13] bg-gradient-to-b from-[#f6b53d] to-[#d66b17] shadow-2xl"
        animate={open && !reducedMotion ? { y: [0, 4, 0] } : {}} />
      <motion.div className="absolute bottom-[72px] left-5 h-12 w-[168px] origin-bottom rounded-t-[34px] border-4 border-[#7b3b13] bg-gradient-to-b from-[#ffd65c] to-[#e88a1d] shadow-xl"
        animate={open
          ? { rotateX: -105, y: -14, rotate: 0 }
          : reducedMotion
            ? { rotateX: 0, y: 0, rotate: 0 }
            : { rotateX: 0, y: 0, rotate: [0, -3, 3, -2, 0] }}
        transition={open
          ? { duration: reducedMotion ? .1 : .65, type: 'spring', stiffness: 150, damping: 15 }
          : { duration: .5, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-10 left-1/2 z-10 h-11 w-9 -translate-x-1/2 rounded-lg border-4 border-[#7b3b13] bg-[#ffe06d]"
        animate={!open && !reducedMotion
          ? { boxShadow: ['0 0 0px rgba(255,214,92,0)', '0 0 16px rgba(255,214,92,.85)', '0 0 0px rgba(255,214,92,0)'] }
          : { boxShadow: '0 0 0px rgba(255,214,92,0)' }}
        transition={{ duration: .5, ease: 'easeInOut' }}>
        <div className="mx-auto mt-2 h-3 w-2 rounded-full bg-[#7b3b13]" />
      </motion.div>
    </div>
  )
}

export function TreasureChestReward({ item, onClose, duplicate = false, duplicateDust = 10, weekly = false, ageGroup = 'early', contextLabel, actionLabel = 'PUT IT IN MY TREASURE ROOM' }) {
  const reducedMotion = useReducedMotion()
  const { speak } = useSpeech()
  const [open, setOpen] = useState(false)
  const personality = getTreasurePersonality(item, ageGroup)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(true)
      speak(duplicate ? 'Sparkle dust! This treasure remembered you already own it.' : `${item?.name || 'A new treasure'}! ${personality.reaction}`, { mood: duplicate ? 'celebrate' : personality.mood })
    }, reducedMotion ? 50 : 500)
    return () => window.clearTimeout(timer)
  }, [ageGroup, duplicate, item?.id, item?.name, personality.mood, personality.reaction, reducedMotion, speak])

  return (
    <motion.div className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-[#1c0c2d]/88 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="relative w-full max-w-lg overflow-hidden rounded-[36px] border-4 border-[#ffe29a] bg-gradient-to-b from-[#fff5cf] via-[#ffd86a] to-[#ff9b3d] p-6 text-center shadow-2xl"
        initial={{ scale: .65, y: 70 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 210, damping: 18 }}>
        <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_center,#fff8bd_0%,transparent_68%)]" />
        {weekly && <div className="relative mx-auto mb-2 w-fit rounded-full bg-[#5b248d] px-4 py-1 font-round text-xs font-black uppercase tracking-[.16em] text-white shadow-lg">7-day rare treasure</div>}
        <ChestAnimation open={open} reducedMotion={reducedMotion} />
        <motion.div className="relative mx-auto -mt-5 flex min-h-64 items-center justify-center"
          initial={{ opacity: 0, scale: .25, y: 70 }} animate={open ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ delay: reducedMotion ? 0 : .25, type: 'spring', stiffness: 180, damping: 14 }}>
          <motion.div animate={open && !reducedMotion ? TREASURE_MOTIONS[personality.motion] : {}} transition={{ duration: personality.duration, repeat: Infinity, repeatDelay: .5 }}><TreasureArt item={item} /></motion.div>
        </motion.div>
        <p className="relative font-round text-xs font-black uppercase tracking-[.2em] text-[#9a3412]">
          {duplicate ? 'You found sparkle dust!' : (contextLabel || `${personality.verb} · YOUR TREASURE IS ALIVE!`)}
        </p>
        <h2 className="relative mt-1 font-bubble text-3xl text-[#3b1607]">{duplicate ? `+${duplicateDust} Sparkle Dust` : item?.name}</h2>
        <p className="relative mx-auto mt-2 max-w-sm font-round text-sm font-bold text-[#7a4525]">
          {duplicate ? 'You already own this treasure, so it changed into magic dust for your room.' : item?.message}
        </p>
        <motion.button whileTap={{ scale: .95 }} onClick={onClose}
          className="relative mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 font-bubble text-xl text-white shadow-lg">
          {actionLabel} →
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function RoomStage({ collection, profileName, ageGroup, onMove, onInteract }) {
  const stageRef = useRef(null)
  const draggedRef = useRef(false)
  const { speak } = useSpeech()
  const [activeReaction, setActiveReaction] = useState(null)
  const layoutIds = Object.keys(collection.roomLayout || {})
  const equippedIds = Object.values(collection.equipped || {})
  const displayedIds = [...new Set([...layoutIds, ...equippedIds])]
  const displayedItems = displayedIds.map(id => collection.items.find(item => item.id === id)).filter(Boolean)
  const react = item => {
    const personality = getTreasurePersonality(item, ageGroup)
    setActiveReaction({ item, personality })
    onInteract?.(item)
    speak(personality.reaction, { mood: personality.mood })
    window.setTimeout(() => setActiveReaction(current => current?.item.id === item.id ? null : current), 3600)
  }
  return (
    <div ref={stageRef} data-testid="living-treasure-room" className="relative mt-5 min-h-[340px] overflow-hidden rounded-[30px] border-4 border-[#f4bd62] bg-gradient-to-b from-[#7751b8] via-[#c47bc4] to-[#ffd17e] shadow-xl sm:min-h-[390px]">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[#8b542f]/55" />
      <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-[#ffe772] shadow-[0_0_50px_#fff1a0]" />
      {[...Array(12)].map((_, index) => <span key={index} className="absolute text-sm text-white/80" style={{ left: `${8 + (index * 17) % 87}%`, top: `${9 + (index * 23) % 58}%` }}>✦</span>)}
      <motion.img src="/yaagvi-3d-wave.png" alt={`${profileName || 'Your explorer'} in the treasure room`}
        className="pointer-events-none absolute bottom-3 left-1/2 h-60 -translate-x-1/2 object-contain drop-shadow-2xl sm:h-72"
        animate={{ y: [0, -5, 0] }} transition={{ duration: 2.4, repeat: Infinity }} />
      {displayedItems.map((item, index) => {
        const position = collection.roomLayout?.[item.id] || { x: index % 2 ? 82 : 12, y: 30 + Math.floor(index / 2) * 30 }
        const personality = getTreasurePersonality(item, ageGroup)
        return <motion.button key={item.id} type="button" data-testid={`placed-treasure-${item.id}`} drag dragMomentum={false} dragElastic={0.08} dragConstraints={stageRef}
          onDragStart={() => { draggedRef.current = true }}
          onDragEnd={(_, info) => {
            const rect = stageRef.current?.getBoundingClientRect()
            if (!rect) return
            onMove?.(item, { x: ((info.point.x - rect.left) / rect.width) * 100, y: ((info.point.y - rect.top) / rect.height) * 100 })
            window.setTimeout(() => { draggedRef.current = false }, 80)
          }}
          onClick={() => { if (!draggedRef.current) react(item) }}
          className="absolute z-20 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center overflow-visible rounded-3xl border-2 border-white/70 bg-white/90 text-5xl shadow-xl sm:h-24 sm:w-24 sm:text-6xl"
          style={{ left: `${position.x}%`, top: `${position.y}%`, borderColor: `${personality.accent}aa` }}
          initial={{ scale: 0 }} animate={activeReaction?.item.id === item.id ? TREASURE_MOTIONS[personality.motion] : { scale: 1, y: [0, -3, 0] }} transition={{ duration: personality.duration, repeat: activeReaction?.item.id === item.id ? 1 : Infinity }}>
          {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-contain" /> : <span>{item.emoji || (item.kind === 'dolly' ? '🧸' : '🎁')}</span>}
          <span className="pointer-events-none absolute -bottom-5 whitespace-nowrap rounded-full bg-[#2b143e]/85 px-2 py-1 font-round text-[8px] font-black text-white">TAP · {personality.verb}</span>
        </motion.button>
      })}
      <AnimatePresence>{activeReaction && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-1/2 top-3 z-40 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border-2 border-white/60 bg-[#2b143e]/88 p-3 text-center text-white shadow-xl backdrop-blur"><p className="font-bubble text-sm">{activeReaction.item.name}</p><p className="font-round text-[10px] font-bold text-white/80">{activeReaction.personality.reaction}</p></motion.div>}</AnimatePresence>
      <div className="absolute bottom-3 left-3 rounded-full bg-[#2b143e]/75 px-3 py-1 font-round text-xs font-bold text-white">
        {displayedItems.length ? `${displayedItems.length} treasure${displayedItems.length === 1 ? '' : 's'} alive · drag to move · tap to play` : 'Choose an owned treasure below to bring it into your room'}
      </div>
    </div>
  )
}

function TreasureSecretGame({ collection, ageGroup, onCollectionChange }) {
  const set = getTreasureSetProgress(collection, ageGroup)
  const saved = collection.secretGames?.[set.ageGroup] || {}
  const { speak } = useSpeech()
  const [status, setStatus] = useState('idle')
  const [sequence, setSequence] = useState([])
  const [highlight, setHighlight] = useState(null)
  const [step, setStep] = useState(0)
  const sequenceLength = set.ageGroup === 'toddler' ? 3 : set.ageGroup === 'junior' ? 5 : 4

  useEffect(() => {
    if (status !== 'watch' || !sequence.length) return undefined
    let index = 0
    setHighlight(sequence[0].id)
    const timer = window.setInterval(() => {
      index += 1
      if (index >= sequence.length) {
        window.clearInterval(timer)
        setHighlight(null)
        setStatus('play')
        speak('Your turn! Tap the treasures in the same order.', { mood: 'instruct' })
        return
      }
      setHighlight(sequence[index].id)
    }, 720)
    return () => window.clearInterval(timer)
  }, [sequence, speak, status])

  const start = () => {
    if (!set.unlocked) return
    const offset = (Number(saved.plays) || 0) % set.items.length
    const pattern = [0, 2, 4, 1, 5, 3].slice(0, sequenceLength).map(index => set.items[(index + offset) % set.items.length])
    setSequence(pattern)
    setStep(0)
    setStatus('watch')
    speak(`Watch closely. Remember the ${sequenceLength} treasures that light up.`, { mood: 'instruct' })
  }

  const choose = item => {
    if (status !== 'play') return
    if (sequence[step]?.id !== item.id) {
      setStatus('missed')
      speak('Almost! The treasures changed their signal. Watch once more and try again.', { mood: 'guide' })
      return
    }
    const nextStep = step + 1
    setHighlight(item.id)
    window.setTimeout(() => setHighlight(null), 260)
    if (nextStep < sequence.length) {
      setStep(nextStep)
      return
    }
    const result = recordTreasureSecretGame(collection, set.ageGroup, sequence.length, sequence.length)
    onCollectionChange?.(result.collection)
    setStatus('won')
    confetti({ particleCount: 150, spread: 130, origin: { y: .64 }, colors: ['#fde047', '#ec4899', '#7c3aed', '#34d399'] })
    speak(result.firstPerfect ? 'Perfect signal! You unlocked twenty five sparkle dust.' : 'Perfect signal! Your treasure team remembers that win.', { mood: 'celebrate' })
  }

  return <section data-testid="treasure-secret-game" className={`mt-4 overflow-hidden rounded-[28px] border-2 p-4 shadow-lg ${set.unlocked ? 'border-[#f4bd62] bg-gradient-to-r from-[#2b164b] via-[#5b2d87] to-[#a53f83] text-white' : 'border-[#d8c7ad] bg-[#fff8e9] text-[#3b1607]'}`}>
    <div className="flex items-center gap-3"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/90 text-4xl shadow">{set.icon}</div><div className="min-w-0 flex-1"><p className={`font-round text-[9px] font-black uppercase tracking-[.18em] ${set.unlocked ? 'text-yellow-200' : 'text-[#a34820]'}`}>{set.unlocked ? 'SECRET GAME UNLOCKED' : 'COMPLETE THIS COLLECTION'}</p><h3 className="font-bubble text-xl">{set.game}</h3><p className={`font-round text-[10px] font-bold ${set.unlocked ? 'text-white/75' : 'text-[#825b42]'}`}>{set.unlocked ? `Best ${saved.best || 0}/${sequenceLength} · played ${saved.plays || 0} times` : `${set.count}/${set.required} ${set.name} treasures found`}</p></div></div>
    <div className="mt-3 flex gap-1.5">{set.items.map(item => <span key={item.id} title={item.name} className={`grid h-10 flex-1 place-items-center rounded-xl text-xl ${set.owned.some(owned => owned.id === item.id) ? 'bg-white/90' : set.unlocked ? 'bg-white/15 grayscale' : 'bg-[#e7dbc9] grayscale'}`}>{set.owned.some(owned => owned.id === item.id) ? item.emoji : '🔒'}</span>)}</div>
    {set.unlocked && status !== 'idle' && <div className="mt-3 rounded-2xl bg-black/20 p-3"><p className="text-center font-round text-[10px] font-black uppercase tracking-[.14em] text-yellow-200">{status === 'watch' ? 'WATCH THE SIGNAL' : status === 'play' ? `YOUR TURN · ${step}/${sequence.length}` : status === 'won' ? 'PERFECT SIGNAL!' : 'THE SIGNAL MOVED'}</p><div className="mt-3 grid grid-cols-3 gap-2">{set.items.map(item => <motion.button type="button" key={item.id} aria-label={`Signal ${item.name}`} disabled={status !== 'play'} onClick={() => choose(item)} animate={highlight === item.id ? { scale: [1, 1.2, 1], boxShadow: `0 0 30px ${getTreasurePersonality(item, ageGroup).accent}` } : {}} className="min-h-16 rounded-2xl border-2 border-white/30 bg-white/90 text-3xl shadow">{item.emoji}</motion.button>)}</div></div>}
    {set.unlocked && <button type="button" data-testid="start-treasure-secret-game" onClick={start} className="mt-3 min-h-12 w-full rounded-2xl bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 font-bubble text-sm text-[#3b1607] shadow-lg">{status === 'idle' ? set.action : status === 'won' ? 'PLAY A NEW SIGNAL' : status === 'missed' ? 'WATCH AGAIN' : 'RESTART'} →</button>}
    {!set.unlocked && <p className="mt-3 rounded-xl bg-white/60 p-2 text-center font-round text-[10px] font-bold text-[#80583d]">Every Dream Project adventure can reveal one missing piece. No purchase needed.</p>}
  </section>
}

export function TreasureShelf({ collection = [], equipped, onEquip, onCollectionChange, onClose, profileName, ageGroup = 'early' }) {
  const normalised = normaliseTreasureCollection(Array.isArray(collection) ? { items: collection, equipped } : collection)
  const [filter, setFilter] = useState('all')
  const namedIds = new Set(TREASURE_ITEMS.map(item => item.id))
  const shelfItems = useMemo(() => [...TREASURE_ITEMS, ...normalised.items.filter(item => !namedIds.has(item.id))], [normalised.items])
  const visibleItems = filter === 'all' ? shelfItems : shelfItems.filter(item => item.slot === filter)
  const filters = [['all', 'All'], ['buddy', 'Buddies'], ['outfit', 'Outfits'], ['tool', 'Tools'], ['room', 'Room']]
  const updateCollection = next => onCollectionChange?.(next)
  const chooseTreasure = item => {
    if (item.slot === 'room' || item.kind === 'souvenir' || item.kind === 'decor' || item.kind === 'crystal') {
      updateCollection(normalised.roomLayout[item.id] ? removeLivingTreasure(normalised, item.id) : placeLivingTreasure(normalised, item))
      return
    }
    onEquip?.(item)
  }

  return (
    <motion.div className="fixed inset-0 z-[290] overflow-y-auto bg-[#fff0d6] p-4 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mx-auto max-w-5xl pb-12">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-round text-xs font-black uppercase tracking-[.2em] text-[#a34820]">Things I really earned</p>
            <h2 className="font-bubble text-3xl text-[#3b1607]">My Treasure Room</h2>
          </div>
          <button onClick={onClose} className="min-h-12 rounded-full bg-white px-5 font-bubble shadow">Back</button>
        </div>

        <RoomStage collection={normalised} profileName={profileName} ageGroup={ageGroup}
          onMove={(item, position) => updateCollection(moveLivingTreasure(normalised, item.id, position))}
          onInteract={item => updateCollection(interactWithLivingTreasure(normalised, item.id))} />

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/75 px-4 py-3 shadow-sm">
          <div><p className="font-bubble text-lg text-[#3b1607]">{normalised.items.length} treasures owned</p><p className="font-round text-xs font-bold text-[#8a5b3a]">Place room treasures, then drag and tap them above</p></div>
          <div className="rounded-xl bg-[#6f3aa6] px-3 py-2 text-center text-white"><p className="text-lg">✨</p><p className="font-bubble text-sm">{normalised.sparkleDust}</p></div>
        </div>

        <TreasureSecretGame collection={normalised} ageGroup={ageGroup} onCollectionChange={updateCollection} />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {filters.map(([id, label]) => <button key={id} onClick={() => setFilter(id)} className={`shrink-0 rounded-full px-4 py-2 font-round text-xs font-black ${filter === id ? 'bg-[#7a3bad] text-white shadow' : 'bg-white text-[#67364a]'}`}>{label}</button>)}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {visibleItems.map(item => {
            const owned = normalised.items.some(ownedItem => ownedItem.id === item.id)
            const roomItem = item.slot === 'room' || item.kind === 'souvenir' || item.kind === 'decor' || item.kind === 'crystal'
            const selected = roomItem ? Boolean(normalised.roomLayout[item.id]) : normalised.equipped?.[item.slot] === item.id
            return (
              <motion.button key={item.id} disabled={!owned} whileTap={owned ? { scale: .95 } : {}}
                onClick={() => owned && chooseTreasure(item)}
                className={`relative flex min-h-52 flex-col items-center justify-center rounded-3xl border-2 p-4 text-center ${owned ? 'border-[#f59e0b] bg-white shadow-lg' : 'border-[#8a5b3a]/10 bg-[#e9dcc8] grayscale'} ${selected ? 'ring-4 ring-[#7a3bad]' : ''}`}>
                {item.rarity === 'rare' && <span className="absolute right-2 top-2 rounded-full bg-[#6f3aa6] px-2 py-1 font-round text-[9px] font-black text-white">RARE</span>}
                <TreasureArt item={item} size="small" />
                <p className="mt-2 font-bubble text-sm text-[#3b1607]">{owned ? item.name : 'Mystery treasure'}</p>
                <p className="font-round text-[10px] font-black text-[#8a5b3a]">{!owned ? 'KEEP EXPLORING' : selected ? (roomItem ? 'IN MY ROOM ✓' : 'ACTIVE ✓') : roomItem ? 'PUT IN MY ROOM' : `USE AS ${SLOT_LABELS[item.slot]?.toUpperCase() || 'TREASURE'}`}</p>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export function TreasureShelfButton({ count = 0, collection, onClick }) {
  const normalised = normaliseTreasureCollection(collection || { items: Array.from({ length: count }) })
  const actualCount = collection ? normalised.items.length : count
  const streak = getTreasureStreakProgress(normalised)
  return (
    <motion.button data-testid="treasure-room-button" whileTap={{ scale: .97 }} onClick={onClick}
      className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl items-center gap-3 rounded-2xl border-2 border-[#d58a46]/35 bg-[#fff7e6] p-3 text-left shadow">
      <span className="text-4xl">🧸</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bubble text-lg text-[#3b1607]">My Treasure Room</span>
        <span className="block font-round text-xs font-bold text-[#8a5b3a]">{actualCount ? `${actualCount} real treasure${actualCount === 1 ? '' : 's'} earned` : 'Your first real treasure is waiting'}</span>
        <span className="mt-1 flex gap-1" aria-label={`${streak.progress} of 7 days toward a rare treasure`}>
          {[1, 2, 3, 4, 5, 6, 7].map(day => <span key={day} className={`h-2 flex-1 rounded-full ${day <= streak.progress ? 'bg-[#7a3bad]' : 'bg-[#d8c4ac]'}`} />)}
        </span>
      </span>
      <span className="font-bubble text-xl text-[#a34820]">→</span>
    </motion.button>
  )
}

export function MysteryEgg({ collection, onHatch, profileName }) {
  const reducedMotion = useReducedMotion()
  const progress = getMysteryEggProgress(collection)
  const [reveal, setReveal] = useState(null)
  const colours = [
    ['#8b5cf6', '#ec4899'],
    ['#22c1c3', '#7c3aed'],
    ['#fb923c', '#f43f5e'],
    ['#38bdf8', '#8b5cf6'],
  ][progress.cycle % 4]
  const hatch = () => {
    const result = onHatch?.()
    if (result?.hatched) setReveal(result)
  }

  return (
    <>
      <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
        <div className="relative overflow-hidden rounded-[28px] border-2 border-[#7a3bad]/25 bg-gradient-to-r from-[#fff8e8] to-[#f3e5ff] p-4 shadow-lg sm:p-5">
          <div className="absolute -right-8 -top-14 h-44 w-44 rounded-full bg-[#b276da]/15 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <motion.div className="relative grid h-24 w-20 shrink-0 place-items-center sm:h-28 sm:w-24"
              animate={progress.ready && !reducedMotion ? { rotate: [0, -7, 7, -4, 4, 0], y: [0, -4, 0] } : { y: [0, -2, 0] }}
              transition={{ duration: progress.ready ? 1.2 : 2.8, repeat: Infinity }}>
              <div className="absolute bottom-1 h-4 w-16 rounded-full bg-[#3b1607]/15 blur-sm" />
              <div className="relative h-20 w-16 rounded-[55%_55%_48%_48%/65%_65%_38%_38%] border-4 border-white/70 shadow-[inset_-10px_-12px_18px_rgba(55,20,80,.22),0_12px_22px_rgba(83,44,105,.25)] sm:h-24 sm:w-20"
                style={{ background: `radial-gradient(circle at 32% 25%, #fff 0 5%, transparent 6%), linear-gradient(145deg, ${colours[0]}, ${colours[1]})` }}>
                <span className="absolute left-3 top-8 text-lg text-white/75">✦</span>
                <span className="absolute bottom-5 right-3 text-sm text-yellow-200">★</span>
                {progress.feeds >= 2 && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-white/85">⌁</span>}
              </div>
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-[#8a3f77]">A friend is growing inside</p>
              <h3 className="font-bubble text-xl text-[#3b1607] sm:text-2xl">Mystery Egg #{progress.cycle}</h3>
              <p className="mt-1 font-round text-xs font-bold text-[#7a513b]">
                {progress.ready ? 'It is wiggling! Tap to meet your surprise companion.' : `Open a daily treasure on ${progress.required - progress.feeds} more day${progress.required - progress.feeds === 1 ? '' : 's'} to help it hatch.`}
              </p>
              <div className="mt-3 flex gap-2" aria-label={`${progress.feeds} of ${progress.required} egg sparks collected`}>
                {Array.from({ length: progress.required }).map((_, index) => (
                  <span key={index} className={`h-3 flex-1 rounded-full ${index < progress.feeds ? 'bg-gradient-to-r from-[#7a3bad] to-[#ec4899]' : 'bg-[#d8c4d8]'}`} />
                ))}
              </div>
            </div>
            {progress.ready && <motion.button whileTap={{ scale: .94 }} onClick={hatch}
              className="min-h-16 shrink-0 rounded-2xl bg-gradient-to-r from-[#7a3bad] to-[#ec4899] px-5 font-bubble text-lg text-white shadow-xl">
              HATCH<br className="sm:hidden" /> MY EGG →
            </motion.button>}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {reveal && (
          <motion.div className="fixed inset-0 z-[310] grid place-items-center overflow-y-auto bg-[#1c0c2d]/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="relative w-full max-w-lg overflow-hidden rounded-[36px] border-4 border-[#ffe29a] bg-gradient-to-b from-[#fff8d8] via-[#f1d3ff] to-[#d58ff0] p-7 text-center shadow-2xl"
              initial={{ scale: .35, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }}>
              {[...Array(12)].map((_, index) => <motion.span key={index} className="absolute left-1/2 top-1/2 text-2xl" animate={{ x: (index % 2 ? -1 : 1) * (45 + index * 11), y: -100 + (index % 5) * 42, opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: index * .08 }}>✦</motion.span>)}
              <motion.div className="relative text-[130px] leading-none" animate={reducedMotion ? {} : { y: [0, -12, 0], rotate: [0, -4, 4, 0] }} transition={{ duration: 2, repeat: Infinity }}>{reveal.item?.emoji}</motion.div>
              <p className="relative mt-2 font-round text-xs font-black uppercase tracking-[.2em] text-[#7a3bad]">The egg hatched!</p>
              <h2 className="relative mt-1 font-bubble text-3xl text-[#3b1607]">{reveal.duplicate ? '+20 Sparkle Dust' : reveal.item?.name}</h2>
              <p className="relative mx-auto mt-2 max-w-sm font-round text-sm font-bold text-[#6d4358]">{reveal.duplicate ? 'This friend returned with extra magic for your Treasure Room.' : `${reveal.item?.message} ${profileName || 'Explorer'}, your new friend is waiting in the Treasure Room.`}</p>
              <button onClick={() => setReveal(null)} className="relative mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#7a3bad] to-[#ec4899] font-bubble text-xl text-white shadow-lg">WELCOME, NEW FRIEND! →</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function DailyTreasureQuest({ doneCount = 0, required = 2, claimed = false, collection, onClaim, profileName, nextAdventure, onPlayNext }) {
  const safeDone = Math.min(required, Math.max(0, doneCount))
  const ready = safeDone >= required
  const streak = getTreasureStreakProgress(collection)
  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
      <div className={`relative overflow-hidden rounded-[28px] border-2 p-5 shadow-xl ${ready && !claimed ? 'border-[#ffb02e] bg-gradient-to-r from-[#5b248d] via-[#8b3fb1] to-[#d95683] text-white' : 'border-[#d58a46]/35 bg-[#fff7e6] text-[#3b1607]'}`}>
        <div className="absolute -right-8 -top-10 text-[130px] opacity-10" aria-hidden="true">🗝️</div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <motion.div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/90 text-5xl shadow-lg"
            animate={ready && !claimed ? { rotate: [-5, 5, -5], scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 1.6, repeat: Infinity }}>
            {claimed ? '✅' : ready ? '🗝️' : '🧰'}
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className={`font-round text-xs font-black uppercase tracking-[.18em] ${ready && !claimed ? 'text-[#ffe789]' : 'text-[#a34820]'}`}>Today's real treasure</p>
            <h3 className="font-bubble text-2xl sm:text-3xl">{claimed ? `${profileName || 'Explorer'} found today's treasure!` : ready ? 'Your golden key is ready!' : `Complete ${required - safeDone} more adventure${required - safeDone === 1 ? '' : 's'}`}</h3>
            <div className="mt-3 flex gap-2" aria-label={`${safeDone} of ${required} adventures complete`}>
              {Array.from({ length: required }).map((_, index) => <div key={index} className={`h-3 flex-1 rounded-full ${index < safeDone ? ready && !claimed ? 'bg-[#ffe56b]' : 'bg-[#ef8f29]' : ready && !claimed ? 'bg-white/25' : 'bg-[#dac8b3]'}`} />)}
            </div>
            <p className={`mt-2 font-round text-xs font-bold ${ready && !claimed ? 'text-white/80' : 'text-[#8a5b3a]'}`}>{claimed ? (streak.rareUnlocked ? 'Rare treasure collected! Unlimited adventures are still open.' : `${streak.progress}/7 days toward a rare treasure · keep exploring now`) : `${safeDone}/${required} adventures complete · a real collectible comes out`}</p>
          </div>
          {ready && !claimed ? <motion.button whileTap={{ scale: .95 }} onClick={onClaim}
            className="min-h-16 shrink-0 rounded-2xl bg-gradient-to-r from-[#ffd34f] to-[#ff8a38] px-6 font-bubble text-lg text-[#431d0d] shadow-xl">
            OPEN MY CHEST →
          </motion.button> : onPlayNext ? <motion.button data-testid="daily-treasure-next" whileTap={{ scale: .95 }} onClick={onPlayNext}
            className="min-h-16 shrink-0 rounded-2xl bg-gradient-to-r from-[#ff7a2f] to-[#ec3f83] px-6 font-bubble text-base text-white shadow-xl sm:text-lg">
            {claimed ? 'PLAY A FRESH CHALLENGE' : `PLAY ${nextAdventure?.shortLabel || nextAdventure?.label || 'NEXT ADVENTURE'}`} →
          </motion.button> : null}
        </div>
      </div>
    </section>
  )
}
