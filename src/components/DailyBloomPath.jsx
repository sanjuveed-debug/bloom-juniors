import React from 'react'
import { motion } from 'framer-motion'

const MODULE_EMOJI = {
  phonics: '🎤', soundpop: '🎤', sound: '🎤',
  math: '🔢', maths: '🔢', numberworld: '🔢', number: '🔢',
  story: '📖', storyroom: '📖',
  davinci: '🎨', art: '🎨',
  worldgk: '🌍', world: '🌍',
  starcatch: '⭐', star: '⭐',
  tricky: '✨', trickywords: '✨',
  toddler: '🧸',
}

function getEmoji(id = '') {
  const key = id.toLowerCase().replace(/[^a-z]/g, '')
  for (const [pattern, emoji] of Object.entries(MODULE_EMOJI)) {
    if (key.includes(pattern)) return emoji
  }
  return '📚'
}

function PathNode({ step, state, idx, onTap, theme }) {
  const isActive = state === 'current'
  const isDone   = state === 'done'
  const isLocked = state === 'locked'
  const nodeSize = isActive ? 80 : 68

  return (
    <div className="flex items-center gap-5 px-5">
      {/* Circle node with fixed 80px column so connectors align */}
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 80, height: 80 }}>
        {/* Expanding pulse ring */}
        {isActive && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            animate={{ scale: [1, 1.6], opacity: [0.55, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            style={{ width: nodeSize, height: nodeSize, border: `3px solid ${theme.primary}` }}
          />
        )}

        <motion.button
          onClick={() => !isLocked && onTap(step.id)}
          whileTap={!isLocked ? { scale: 0.91 } : {}}
          animate={isActive ? { scale: [1, 1.06, 1] } : {}}
          transition={isActive ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : {}}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: nodeSize,
            height: nodeSize,
            background: isDone
              ? 'linear-gradient(135deg, #FDE68A, #F59E0B)'
              : isActive
                ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent || theme.secondary || '#FF6B9D'})`
                : theme.card || 'rgba(0,0,0,0.06)',
            border: isActive
              ? '3px solid rgba(255,255,255,0.4)'
              : isDone
                ? '3px solid rgba(245,158,11,0.5)'
                : `2px solid ${theme.primary}18`,
            boxShadow: isActive
              ? `0 14px 36px ${theme.primary}55, 0 0 0 5px ${theme.primary}20`
              : isDone
                ? '0 6px 20px rgba(245,158,11,0.3)'
                : 'none',
            filter: isLocked ? 'grayscale(0.8)' : 'none',
            opacity: isLocked ? 0.48 : 1,
            cursor: isLocked ? 'default' : 'pointer',
          }}
        >
          <span style={{ fontSize: isActive ? 36 : 30, lineHeight: 1, userSelect: 'none' }}>
            {isDone ? '✅' : getEmoji(step.id)}
          </span>
        </motion.button>
      </div>

      {/* Text label beside the node */}
      <div className="flex-1 min-w-0">
        <p
          className="font-round text-xs font-black uppercase tracking-wider mb-0.5"
          style={{
            color: isDone ? '#92400E'
              : isActive ? theme.primary
              : `${theme.text}40`,
          }}
        >
          {isDone ? '✓ Done' : isActive ? 'Tap to start →' : `Step ${idx + 1}`}
        </p>
        <p
          className="font-bubble text-xl leading-tight"
          style={{
            color: isDone ? '#78350F'
              : isActive ? theme.text
              : `${theme.text}40`,
          }}
        >
          {step.label}
        </p>
      </div>
    </div>
  )
}

function PathConnector({ done, color }) {
  return (
    <div className="px-5" style={{ height: 48 }}>
      {/* Align with the 80px node column */}
      <div className="relative flex flex-col items-center" style={{ width: 80, height: 48 }}>
        {/* Dotted background dots */}
        <div className="absolute inset-0 flex flex-col items-center justify-around py-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: 'rgba(0,0,0,0.1)' }} />
          ))}
        </div>
        {/* Gold fill — animates down as step completes */}
        <motion.div
          className="absolute top-0 w-1.5 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: done ? '100%' : '0%' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
          style={{ background: `linear-gradient(to bottom, ${color}, #10B981)` }}
        />
      </div>
    </div>
  )
}

function ArcadeGate({ locked, onTap, theme }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 22 }}
      whileTap={!locked ? { scale: 0.97 } : {}}
      onClick={() => !locked && onTap('arcade')}
      disabled={locked}
      className="relative mx-5 flex items-center gap-4 rounded-[28px] p-5"
      style={{
        background: locked
          ? theme.card || 'rgba(0,0,0,0.05)'
          : 'linear-gradient(135deg, #7C3AED, #EC4899)',
        border: locked
          ? `2px dashed ${theme.primary}20`
          : '2px solid rgba(255,255,255,0.3)',
        boxShadow: locked ? 'none' : '0 16px 40px rgba(124,58,237,0.4)',
        filter: locked ? 'grayscale(0.7)' : 'none',
        opacity: locked ? 0.48 : 1,
        cursor: locked ? 'default' : 'pointer',
      }}
    >
      {!locked && (
        <motion.div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          animate={{ opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ border: '3px solid rgba(255,255,255,0.5)' }}
        />
      )}

      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{ width: 56, height: 56, fontSize: 28, background: locked ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.2)' }}
      >
        {locked ? '🔒' : '🎮'}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-round text-xs font-black uppercase tracking-wider mb-0.5"
          style={{ color: locked ? `${theme.text}30` : 'rgba(255,255,255,0.7)' }}
        >
          {locked ? 'Finish your path first' : 'Ready to play!'}
        </p>
        <p className="font-bubble text-xl leading-tight" style={{ color: locked ? `${theme.text}35` : '#fff' }}>
          Game Arcade
        </p>
      </div>

      {!locked && (
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="flex-shrink-0 text-2xl text-white/80"
        >
          →
        </motion.span>
      )}
    </motion.button>
  )
}

export default function DailyBloomPath({ adventure, theme, onNavigate, onClaimTreasure, treasureClaimed=false }) {
  const steps = (adventure?.steps || []).map(s => ({
    id:    s.module?.id    ?? s.id    ?? '',
    label: s.module?.label ?? s.label ?? '',
    done:  s.done ?? false,
  }))
  const doneCount = steps.filter(s => s.done).length
  const allDone   = steps.length > 0 && doneCount >= steps.length

  return (
    <section className="mx-auto mt-5 max-w-6xl px-4 md:px-6 xl:px-8">
      <div className="relative overflow-hidden rounded-[34px] border-2 p-5 shadow-xl"
        style={{ backgroundImage: 'linear-gradient(rgba(255,247,237,.18),rgba(255,237,213,.18)),url(/treasure-map-bg.png)', backgroundSize:'cover', backgroundPosition:'center', borderColor: 'rgba(146,64,14,.32)', boxShadow: '0 18px 45px rgba(66,32,6,.18)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(90deg,rgba(255,247,237,.78),rgba(255,247,237,.18) 42%,rgba(255,247,237,.08))' }} />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="font-round text-xs font-black uppercase tracking-[0.18em]" style={{ color:'#9A3412' }}>Today's treasure map</p>
            <h2 className="font-bubble mt-1 text-3xl" style={{ color:'#422006' }}>
              {allDone ? 'Treasure found!' : doneCount ? 'Follow the trail!' : 'Ready, explorer?'}
            </h2>
            <p className="font-round mt-1 text-sm font-bold" style={{ color:'rgba(66,32,6,.6)' }}>Help Yaagvi reach the treasure — one adventure at a time.</p>
          </div>
          <motion.span className="text-5xl" animate={{ rotate:[-4,4,-4], y:[0,-4,0] }} transition={{ duration:2,repeat:Infinity }}>🗺️</motion.span>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:items-center">
          {steps.map((step, idx) => {
            const state = step.done ? 'done' : idx === doneCount ? 'current' : 'locked'
            const locked = state === 'locked'
            return <motion.button key={step.id || idx} disabled={locked} onClick={() => !locked && onNavigate(step.id)}
              whileTap={!locked ? { scale:.92 } : {}} animate={state === 'current' ? { y:[0,-7,0] } : {}}
              transition={{ duration:1.8,repeat:state === 'current' ? Infinity : 0 }}
              className={`relative flex flex-col items-center text-center ${idx % 2 ? 'md:mt-16' : 'md:mb-10'}`}>
              {state === 'current' && <motion.div className="absolute -inset-3 rounded-full border-4 border-orange-400"
                animate={{ scale:[.8,1.2],opacity:[.8,0] }} transition={{duration:1.4,repeat:Infinity}} />}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 text-4xl shadow-lg"
                style={{ background:step.done?'linear-gradient(135deg,#FDE68A,#F59E0B)':locked?'#E7D8C5':'linear-gradient(135deg,#F97316,#DB2777)', borderColor:'#FFF7ED', filter:locked?'grayscale(.8)':'none', opacity:locked?.55:1 }}>
                {step.done ? '✅' : getEmoji(step.id)}
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white font-bubble text-xs" style={{color:'#9A3412'}}>{idx+1}</span>
              </div>
              <p className="font-bubble mt-2 rounded-lg px-2 py-0.5 text-base leading-tight"
                style={{ color:locked?'rgba(66,32,6,.78)':'#422006', background:'rgba(255,247,237,.58)', textShadow:'0 1px 0 rgba(255,255,255,.8)' }}>{step.label}</p>
              <p className="font-round rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                style={{ color:state==='current'?'#9A3412':'rgba(66,32,6,.72)', background:'rgba(255,247,237,.66)' }}>{step.done?'Found':state==='current'?'Go here!':'Locked'}</p>
            </motion.button>
          })}
          <motion.button disabled={!allDone} onClick={() => allDone && (treasureClaimed ? onNavigate('arcade') : onClaimTreasure?.())} whileTap={allDone?{scale:.9}:{}}
            className="relative flex flex-col items-center text-center md:mt-14">
            <motion.div className="text-6xl" animate={allDone?{y:[0,-8,0],rotate:[-3,3,-3]}:{}} transition={{duration:1.4,repeat:Infinity}} style={{filter:allDone?'none':'grayscale(1)',opacity:allDone?1:.5}}>🧰</motion.div>
            <p className="font-bubble rounded-lg bg-orange-50/70 px-2 py-0.5 text-base" style={{color:allDone?'#422006':'rgba(66,32,6,.78)'}}>{allDone&&!treasureClaimed?'Open my treasure!':treasureClaimed?'Treasure collected ✓':'Treasure chest'}</p>
          </motion.button>
        </div>
        <motion.div className="absolute bottom-3 left-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-orange-100 text-3xl shadow-md"
          animate={{x:[0,12,0],y:[0,-3,0]}} transition={{duration:2.8,repeat:Infinity,ease:'easeInOut'}}>🧭</motion.div>
      </div>
    </section>
  )
}
