import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'

const MASCOT_IMAGE = '/yaagvi-mascot-single.webp'

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

function YaagviRoom({ theme, roomScore, stickersCount, dark, profileName }) {
  const decorations = useMemo(() => ([
    { label: 'Reading rug', need: 0, emoji: '📚' },
    { label: 'Star lamp', need: 5, emoji: '⭐' },
    { label: 'Trophy shelf', need: 15, emoji: '🏆' },
    { label: 'Game poster', need: 30, emoji: '🎮' },
  ]), [])

  const unlocked = decorations.filter(item => roomScore >= item.need)
  const next = decorations.find(item => roomScore < item.need)

  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-4"
      style={{
        background: dark
          ? 'linear-gradient(145deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05))'
          : `linear-gradient(145deg, ${theme.primary}16, #ffffff 72%)`,
        border: dark ? '1.5px solid rgba(255,255,255,0.16)' : `1.5px solid ${theme.primary}22`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-round text-xs font-black uppercase tracking-[0.18em]" style={{ color: dark ? 'rgba(255,255,255,0.52)' : `${theme.text}88` }}>
            Reward Room
          </p>
          <p className="font-bubble mt-1 text-2xl leading-tight" style={{ color: dark ? '#fff' : theme.text }}>
            {profileName ? `${profileName}'s Room` : "Reward Room"}
          </p>
          <p className="font-round mt-1 text-sm font-bold leading-5" style={{ color: dark ? 'rgba(255,255,255,0.62)' : `${theme.text}99` }}>
            Earn stars to decorate the room.
          </p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-lg">
          <p className="font-bubble text-lg leading-none" style={{ color: theme.primary }}>{roomScore}</p>
          <p className="font-round text-[10px] font-black uppercase tracking-wider text-slate-400">points</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {decorations.map(item => {
          const isOpen = roomScore >= item.need
          return (
            <div
              key={item.label}
              className="flex min-h-[74px] flex-col items-center justify-center rounded-[18px] p-2 text-center"
              style={{
                background: isOpen ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.12)',
                border: isOpen ? `1.5px solid ${theme.primary}35` : '1.5px dashed rgba(148,163,184,0.5)',
                opacity: isOpen ? 1 : 0.55,
              }}
            >
              <span className="text-2xl leading-none">{isOpen ? item.emoji : '🔒'}</span>
              <p className="font-round mt-1 text-xs font-bold leading-4" style={{ color: isOpen ? '#334155' : dark ? 'rgba(255,255,255,0.7)' : '#64748B' }}>
                {item.label}
              </p>
              {!isOpen && (
                <p className="font-round text-[10px] font-bold" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
                  {item.need} pts
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-round text-xs font-bold" style={{ color: dark ? 'rgba(255,255,255,0.6)' : `${theme.text}88` }}>
          {next ? `${next.need - roomScore} more points to unlock ${next.label}` : 'All room rewards unlocked'}
        </p>
        <p className="font-bubble text-xs" style={{ color: theme.primary }}>
          {unlocked.length}/{decorations.length} open
        </p>
      </div>
      {stickersCount > 0 && (
        <p className="font-round mt-2 text-xs font-bold" style={{ color: dark ? 'rgba(255,255,255,0.55)' : `${theme.text}77` }}>
          Sticker book: {stickersCount} rewards collected
        </p>
      )}
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
                Habit Builder
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
