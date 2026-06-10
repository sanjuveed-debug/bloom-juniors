import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'

const MASCOT_IMAGE = '/yaagvi-mascot-single.webp'

const TROPHIES = [
  { label: 'First Step',     need: 0,   emoji: '🌟', color: '#F59E0B' },
  { label: 'Sound Explorer', need: 3,   emoji: '🎵', color: '#8B5CF6' },
  { label: 'Number Ninja',   need: 8,   emoji: '🔢', color: '#3B82F6' },
  { label: 'Speed Star',     need: 15,  emoji: '⚡', color: '#EAB308' },
  { label: 'Art Wizard',     need: 22,  emoji: '🎨', color: '#EC4899' },
  { label: 'Story Hero',     need: 32,  emoji: '📜', color: '#10B981' },
  { label: 'World Explorer', need: 45,  emoji: '🗺️', color: '#0EA5E9' },
  { label: 'Champion',       need: 60,  emoji: '🏆', color: '#F97316' },
  { label: 'Legend',         need: 80,  emoji: '👑', color: '#EF4444' },
  { label: 'Grand Master',   need: 100, emoji: '🌈', color: '#6366F1' },
]

function TrophySlot({ trophy, unlocked, idx, isNext, dark }) {
  const [popped, setPopped] = useState(false)

  return (
    <div className="flex flex-col items-center" style={{ width: 52 }}>
      <motion.button
        initial={unlocked ? { scale: 0.5, rotate: -12, opacity: 0 } : false}
        animate={{ scale: 1, rotate: 0, opacity: unlocked ? 1 : 0.38 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18, delay: idx * 0.04 }}
        onClick={() => unlocked && setPopped(true)}
        className="relative flex h-11 w-11 items-center justify-center rounded-[14px]"
        style={{
          background: unlocked
            ? `${trophy.color}20`
            : dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.07)',
          border: `2px solid ${unlocked ? trophy.color + '66' : dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
          filter: unlocked ? 'none' : 'grayscale(1)',
          boxShadow: unlocked ? `0 4px 14px ${trophy.color}35` : 'none',
          cursor: unlocked ? 'pointer' : 'default',
        }}
      >
        {/* Shimmer sweep on locked */}
        {!unlocked && (
          <div className="absolute inset-0 overflow-hidden rounded-[12px] pointer-events-none">
            <motion.div
              animate={{ x: [-44, 44] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: idx * 0.25, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-6"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)', left: '-24px' }}
            />
          </div>
        )}

        {/* Glow ring on next-to-unlock trophy */}
        {isNext && (
          <motion.div
            className="absolute rounded-[16px] pointer-events-none"
            style={{ inset: -3, border: `2px solid ${trophy.color}`, boxShadow: `0 0 10px ${trophy.color}88` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}

        <span className="relative z-10 text-xl leading-none select-none">{trophy.emoji}</span>

        {/* Tap burst */}
        <AnimatePresence>
          {popped && (
            <motion.div
              key="burst"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.8, opacity: 0 }}
              exit={{}}
              onAnimationComplete={() => setPopped(false)}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 rounded-[14px] pointer-events-none"
              style={{ background: `${trophy.color}55` }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      <p
        className="mt-1 text-center font-round font-bold leading-tight"
        style={{
          fontSize: 8,
          maxWidth: 52,
          color: unlocked
            ? dark ? 'rgba(255,255,255,0.82)' : '#334155'
            : dark ? 'rgba(255,255,255,0.35)' : '#94a3b8',
        }}
      >
        {unlocked ? trophy.label : `${trophy.need}★`}
      </p>
    </div>
  )
}

function safePercent(done, total) {
  if (!total) return 0
  return Math.min(100, Math.round((done / total) * 100))
}

function buildHint({ ageGroup, profileName, nextLabel, doneCount, totalCount, roomScore }) {
  const name = profileName || 'superstar'
  const next = nextLabel || 'the next mission'

  if (doneCount >= totalCount && totalCount > 0) {
    if (ageGroup === 'toddler') return `Well done ${name}. Your play path is finished. You can visit ${name}'s Room or play your favourite game.`
    if (ageGroup === 'junior') return `Mission complete, ${name}. Games are a good reward now, or you can build extra XP with one more challenge.`
    return `Great job ${name}. Today's adventure is complete. You can collect rewards in ${name}'s Room.`
  }

  if (ageGroup === 'toddler') {
    return `Hi ${name}. Tap ${next}. Just one tiny game first. I will help you.`
  }

  if (ageGroup === 'junior') {
    return `Start with ${next}, ${name}. Finish the study missions first, then use games as the reward.`
  }

  if (roomScore < 10) {
    return `Let's begin with ${next}, ${name}. A quick win will unlock more things for ${name}'s Room.`
  }

  return `Your best next step is ${next}, ${name}. Do that first, then come back for a room reward.`
}

function AiHintButton({ ageGroup, theme, profileName, nextLabel, doneCount, totalCount, roomScore, dark }) {
  const [hint, setHint] = useState('')
  const { speak, stopSpeaking } = useSpeech()

  const askHint = () => {
    stopSpeaking()
    const nextHint = buildHint({ ageGroup, profileName, nextLabel, doneCount, totalCount, roomScore })
    setHint(nextHint)
    speak(nextHint, { mood: 'guide' })
  }

  return (
    <div
      className="rounded-[24px] p-3"
      style={{
        background: dark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.8)',
        border: dark ? '1.5px solid rgba(255,255,255,0.16)' : `1.5px solid ${theme.primary}22`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-14 w-14 shrink-0 overflow-hidden rounded-[18px] bg-white"
          style={{ boxShadow: `0 10px 22px ${theme.primary}35` }}
        >
          <img src={MASCOT_IMAGE} alt="Yaagvi" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bubble text-base leading-tight" style={{ color: dark ? '#fff' : theme.text }}>
            Yaagvi Hint
          </p>
          <p className="font-round mt-0.5 text-xs font-bold leading-4" style={{ color: dark ? 'rgba(255,255,255,0.58)' : `${theme.text}99` }}>
            Free guided help, no paid AI call.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={askHint}
          className="rounded-2xl px-4 py-3 font-bubble text-sm text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent || theme.secondary || '#FF6B35'})` }}
        >
          Help
        </motion.button>
      </div>

      <AnimatePresence>
        {hint && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="font-round mt-3 rounded-2xl px-3 py-2 text-sm font-bold leading-5"
            style={{
              background: dark ? 'rgba(0,0,0,0.22)' : `${theme.primary}12`,
              color: dark ? 'rgba(255,255,255,0.82)' : theme.text,
            }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export function YaagviRoom({ theme, roomScore, stickersCount, dark, profileName }) {
  const next = TROPHIES.find(t => roomScore < t.need)
  const unlockedCount = TROPHIES.filter(t => roomScore >= t.need).length
  const ptsLeft = next ? next.need - roomScore : 0
  const pct = next ? Math.round(((next.need - ptsLeft) / next.need) * 100) : 100

  const row1 = TROPHIES.slice(0, 5)
  const row2 = TROPHIES.slice(5, 10)

  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-4"
      style={{
        background: dark
          ? 'linear-gradient(160deg, #1a1235 0%, #0d0a1f 100%)'
          : `linear-gradient(160deg, ${theme.primary}14, #fff8f0 80%)`,
        border: dark ? '1.5px solid rgba(255,255,255,0.12)' : `1.5px solid ${theme.primary}28`,
      }}
    >
      {/* Subtle wall dot texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '18px 18px' }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-round text-xs font-black uppercase tracking-[0.18em]" style={{ color: dark ? 'rgba(255,255,255,0.45)' : `${theme.text}88` }}>
            Trophy Wall
          </p>
          <p className="font-bubble mt-0.5 text-xl leading-tight" style={{ color: dark ? '#fff' : theme.text }}>
            {profileName ? `${profileName}'s Wall` : 'Trophy Wall'}
          </p>
        </div>
        <div
          className="rounded-2xl px-3 py-1.5 text-center"
          style={{ background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.88)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <p className="font-bubble text-lg leading-none" style={{ color: dark ? '#fff' : theme.primary }}>{roomScore}</p>
          <p className="font-round text-[9px] font-black uppercase tracking-wider" style={{ color: dark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>pts</p>
        </div>
      </div>

      {/* Progress bar toward next trophy */}
      <div className="relative mt-3">
        {next ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <p className="font-round text-[10px] font-bold" style={{ color: dark ? 'rgba(255,255,255,0.55)' : `${theme.text}88` }}>
                {ptsLeft} pts → {next.emoji} {next.label}
              </p>
              <p className="font-bubble text-[10px]" style={{ color: next.color }}>{pct}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                style={{ background: `linear-gradient(90deg, ${next.color}99, ${next.color})` }}
              />
            </div>
          </>
        ) : (
          <motion.p
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center font-bubble text-sm"
            style={{ color: '#F59E0B' }}
          >
            🎉 Wall complete! Grand Master!
          </motion.p>
        )}
      </div>

      {/* Two trophy shelves */}
      <div className="relative mt-4 space-y-3">
        {[row1, row2].map((row, rowIdx) => (
          <div key={rowIdx}>
            <div className="flex justify-around pb-2.5">
              {row.map((trophy, idx) => (
                <TrophySlot
                  key={trophy.label}
                  trophy={trophy}
                  unlocked={roomScore >= trophy.need}
                  idx={rowIdx * 5 + idx}
                  isNext={next?.label === trophy.label}
                  dark={dark}
                />
              ))}
            </div>
            {/* Wooden shelf plank */}
            <div
              className="h-3 rounded-full"
              style={{
                background: dark
                  ? 'linear-gradient(90deg, #5C3A1E, #8B5E3C, #5C3A1E)'
                  : 'linear-gradient(90deg, #C8956E, #D4A574, #C8956E)',
                boxShadow: dark ? '0 4px 10px rgba(0,0,0,0.4)' : '0 4px 10px rgba(139,94,60,0.25)',
              }}
            />
          </div>
        ))}
      </div>

      <p className="mt-3 text-center font-round text-[10px] font-bold" style={{ color: dark ? 'rgba(255,255,255,0.38)' : `${theme.text}66` }}>
        {unlockedCount}/{TROPHIES.length} trophies earned
      </p>
    </div>
  )
}

export default function RetentionPanel({
  ageGroup = 'early',
  theme,
  profileName,
  missionTitle = "Today's Mission",
  missionSubtitle = 'Finish the next step first.',
  steps = [],
  nextLabel,
  onNavigate,
  roomScore = 0,
  stickersCount = 0,
  dark = false,
}) {
  const doneCount = steps.filter(step => step.done).length
  const totalCount = steps.length
  const pct = safePercent(doneCount, totalCount)

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="rounded-[26px] p-4"
          style={{
            background: dark ? 'rgba(0,0,0,0.26)' : 'rgba(255,255,255,0.82)',
            border: dark ? '1.5px solid rgba(255,255,255,0.14)' : `1.5px solid ${theme.primary}22`,
            boxShadow: dark ? '0 16px 34px rgba(0,0,0,0.2)' : `0 14px 30px ${theme.primary}16`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-round text-xs font-black uppercase tracking-[0.18em]" style={{ color: dark ? 'rgba(255,255,255,0.52)' : `${theme.text}88` }}>
                ✅ Start Here
              </p>
              <p className="font-bubble mt-1 text-2xl leading-tight" style={{ color: dark ? '#fff' : theme.text }}>
                {missionTitle}
              </p>
              <p className="font-round mt-1 text-sm font-bold leading-5" style={{ color: dark ? 'rgba(255,255,255,0.62)' : `${theme.text}99` }}>
                {missionSubtitle}
              </p>
            </div>
            <div className="rounded-2xl px-3 py-2 text-center" style={{ background: `${theme.primary}18` }}>
              <p className="font-bubble text-lg leading-none" style={{ color: dark ? '#fff' : theme.primary }}>{doneCount}/{totalCount || 1}</p>
              <p className="font-round text-[10px] font-black uppercase tracking-wider" style={{ color: dark ? 'rgba(255,255,255,0.52)' : `${theme.text}88` }}>done</p>
            </div>
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full" style={{ background: dark ? 'rgba(255,255,255,0.12)' : `${theme.primary}18` }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent || theme.secondary || '#FF6B35'})` }}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {steps.map((step, index) => (
              <motion.button
                key={`${step.id || step.label}-${index}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => step.id && onNavigate?.(step.id)}
                className="min-h-[92px] rounded-[20px] p-3 text-left"
                style={{
                  background: step.done ? '#DCFCE7' : dark ? 'rgba(255,255,255,0.1)' : `${theme.primary}12`,
                  border: step.done ? '1.5px solid #22C55E' : dark ? '1.5px solid rgba(255,255,255,0.14)' : `1.5px solid ${theme.primary}22`,
                }}
              >
                <p className="font-round text-xs font-black" style={{ color: step.done ? '#15803D' : dark ? 'rgba(255,255,255,0.55)' : `${theme.text}88` }}>
                  Step {index + 1}
                </p>
                <p className="font-bubble mt-1 text-base leading-tight" style={{ color: step.done ? '#166534' : dark ? '#fff' : theme.text }}>
                  {step.label}
                </p>
                <p className="font-round mt-1 text-xs font-bold" style={{ color: step.done ? '#15803D' : dark ? 'rgba(255,255,255,0.52)' : `${theme.text}77` }}>
                  {step.done ? 'Done' : index === doneCount ? 'Next' : 'Waiting'}
                </p>
              </motion.button>
            ))}
          </div>

          <div className="mt-3">
            <AiHintButton
              ageGroup={ageGroup}
              theme={theme}
              profileName={profileName}
              nextLabel={nextLabel}
              doneCount={doneCount}
              totalCount={totalCount}
              roomScore={roomScore}
              dark={dark}
            />
          </div>
        </motion.div>

        <YaagviRoom
          theme={theme}
          roomScore={roomScore}
          stickersCount={stickersCount}
          dark={dark}
          profileName={profileName}
        />
      </div>
    </section>
  )
}
