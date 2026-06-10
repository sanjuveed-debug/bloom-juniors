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

export default function DailyBloomPath({ adventure, theme, onNavigate }) {
  const steps = (adventure?.steps || []).map(s => ({
    id:    s.module?.id    ?? s.id    ?? '',
    label: s.module?.label ?? s.label ?? '',
    done:  s.done ?? false,
  }))
  const doneCount = steps.filter(s => s.done).length
  const allDone   = steps.length > 0 && doneCount >= steps.length

  return (
    <section className="mx-auto mt-4 max-w-lg">
      {/* Header */}
      <div className="mb-4 px-5">
        <p className="font-round text-xs font-black uppercase tracking-[0.16em] mb-0.5" style={{ color: `${theme.text}66` }}>
          Today's Bloom Path
        </p>
        <p className="font-bubble text-2xl" style={{ color: theme.text }}>
          {doneCount === 0 ? 'Start here 👇' : allDone ? 'All done! 🎉' : 'Keep going! 🌱'}
        </p>
      </div>

      {/* Stepping-stone path */}
      <div>
        {steps.map((step, idx) => {
          const state = step.done ? 'done' : idx === doneCount ? 'current' : 'locked'
          return (
            <React.Fragment key={step.id || idx}>
              <PathNode step={step} state={state} idx={idx} onTap={onNavigate} theme={theme} />
              <PathConnector done={step.done} color={theme.primary} />
            </React.Fragment>
          )
        })}
        <ArcadeGate locked={!allDone} onTap={onNavigate} theme={theme} />
      </div>
    </section>
  )
}
