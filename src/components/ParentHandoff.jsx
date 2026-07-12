import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shareSuccessCard } from '../utils/successCardImage.js'
import { trackEvent } from '../utils/analytics.js'

const MODULE_LABELS = {
  phonics: { label: 'Sound Pop', emoji: '🎤', subject: 'phonics' },
  math:    { label: 'Number World', emoji: '🔢', subject: 'maths' },
  tricky:  { label: 'Star Catch', emoji: '⭐', subject: 'tricky words' },
  story:   { label: 'Story Room', emoji: '📖', subject: 'reading' },
  shapes:  { label: 'Shape World', emoji: '🔷', subject: 'shapes' },
  science: { label: 'Wonder Lab', emoji: '🔬', subject: 'science' },
  worldgk: { label: 'World Explorer', emoji: '🌍', subject: 'world knowledge' },
  planets: { label: 'Planet World', emoji: '🪐', subject: 'space' },
  anatomy: { label: 'My Body', emoji: '🫀', subject: 'the human body' },
  logic:   { label: 'Puzzle Quest', emoji: '🧩', subject: 'puzzles' },
  arcade:  { label: 'Game Arcade', emoji: '🎮', subject: 'reward games' },
  davinci: { label: 'Da Vinci Studio', emoji: '🎨', subject: 'art' },
}

const PHONICS_NEXT = [
  { minPlayed: 0,  text: 'Next up: more letter sounds (m, a, s, d, t)' },
  { minPlayed: 2,  text: 'Almost ready for Special Friends (sh, ch, th)' },
  { minPlayed: 3,  text: 'Next up: Special Friends Cave (sh, ch, th, qu)' },
  { minPlayed: 5,  text: 'Moving on to vowel sounds (ay, ee, igh, ow, oo)' },
  { minPlayed: 8,  text: 'Exploring split digraphs and long vowel patterns' },
]

function getPhonicsNext(played) {
  const match = [...PHONICS_NEXT].reverse().find(n => played >= n.minPlayed)
  return match?.text || PHONICS_NEXT[0].text
}

function buildAchievementData(progress, profileName, arcadeStatus) {
  const sessions = progress.sessions || []
  if (!sessions.length) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySessions = sessions.filter(s => s.date >= today.getTime())
  if (!todaySessions.length) return null

  // Most recent session today
  const latest = todaySessions[todaySessions.length - 1]
  const mod = MODULE_LABELS[latest.module]
  if (!mod) return null

  const starsToday = todaySessions.reduce((sum, s) => sum + (s.stars || 0), 0)
  const modulesPlayed = [...new Set(todaySessions.map(s => s.module))]
  const name = profileName || 'Your child'

  // Build headline
  const headline = modulesPlayed.length >= 2
    ? `${name} completed today's study pass! 🎉`
    : `${name} practised ${mod.subject} today`

  // Build what-they-did line
  let whatTheyDid = `Played ${mod.label}`
  if (starsToday > 0) whatTheyDid += ` and earned ${starsToday} star${starsToday !== 1 ? 's' : ''}`
  if (arcadeStatus.unlocked) whatTheyDid += '. Arcade pass unlocked!'

  // Build what's next line
  let whatsNext = ''
  if (latest.module === 'phonics') {
    whatsNext = getPhonicsNext(progress.phonics?.played || 0)
  } else if (latest.module === 'math') {
    const lvl = progress.math?.level || 1
    whatsNext = `Maths level ${lvl} — keep practising to reach level ${lvl + 1}`
  } else {
    const remaining = arcadeStatus.remainingModules
    if (remaining.length) {
      whatsNext = `Next learning step: ${remaining[0].label}`
    } else {
      whatsNext = 'All study steps done for today — great work!'
    }
  }

  const loginStreak = progress.loginStreak || 0
  const streakNote = loginStreak >= 2 ? `${loginStreak}-day learning streak 🔥` : null

  return {
    mod,
    headline,
    whatTheyDid,
    whatsNext,
    streakNote,
    starsToday,
    modulesPlayed,
    arcadeUnlocked: arcadeStatus.unlocked,
  }
}

function ShareButton({ data }) {
  const [busy, setBusy] = useState(false)
  const handleShare = async () => {
    if (busy) return
    setBusy(true)
    trackEvent('share_card', { module: data.mod?.id })
    try { await shareSuccessCard({ ...data, emoji: data.mod?.emoji }) } catch {}
    setBusy(false)
  }
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleShare}
      disabled={busy}
      className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] py-3.5 font-bubble text-base text-white shadow-lg disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 8px 20px rgba(37,211,102,0.35)' }}
    >
      <span style={{ fontSize: 20 }}>💬</span>
      {busy ? 'Preparing…' : 'Share the win'}
    </motion.button>
  )
}

function ShareCard({ data, profileName, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-[32px] p-6 text-center"
        style={{
          background: 'linear-gradient(160deg, #0B1426 0%, #1A1060 50%, #0B1426 100%)',
          border: '2px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 40 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.4), transparent)' }}
        />

        {/* Bloom Juniors badge */}
        <div className="relative z-10">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[22px]"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', boxShadow: '0 12px 30px rgba(124,58,237,0.5)' }}>
            <span style={{ fontSize: 36 }}>{data.mod.emoji}</span>
          </div>

          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <img src="/yaagvi-mascot-single.webp" alt="" className="h-5 w-5 rounded-full object-cover" />
            <span className="font-round text-xs font-bold text-white/70">Bloom Juniors</span>
          </div>

          <h2 className="font-bubble mt-3 text-2xl leading-tight text-white">
            {data.headline}
          </h2>

          <div className="mt-4 rounded-[20px] p-4 text-left"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-round text-sm font-bold leading-5 text-white/80">
              ✅ {data.whatTheyDid}
            </p>
            <p className="font-round mt-2 text-sm font-bold leading-5 text-white/60">
              📚 {data.whatsNext}
            </p>
            {data.streakNote && (
              <p className="font-round mt-2 text-sm font-bold text-amber-400">
                {data.streakNote}
              </p>
            )}
          </div>

          {data.starsToday > 0 && (
            <div className="mt-3 flex items-center justify-center gap-1">
              {Array.from({ length: Math.min(data.starsToday, 10) }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 400 }}
                  style={{ fontSize: 20 }}
                >⭐</motion.span>
              ))}
              {data.starsToday > 10 && (
                <span className="font-bubble text-white/60 text-sm ml-1">+{data.starsToday - 10}</span>
              )}
            </div>
          )}

          <p className="mt-4 font-round text-xs text-white/35">bloomjuniors.com · EYFS aligned</p>

          <ShareButton data={data} />
        </div>

        <button
          onClick={onClose}
          className="relative z-10 mt-5 font-round text-sm font-bold text-white/40"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function ParentHandoff({ progress, profileName, arcadeStatus, theme }) {
  const [showShare, setShowShare] = useState(false)

  const data = buildAchievementData(progress, profileName, arcadeStatus)
  if (!data) return null

  const handleShow = () => {
    setShowShare(true)
  }

  return (
    <>
      <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="relative overflow-hidden rounded-[26px] p-4"
          style={{
            background: data.arcadeUnlocked
              ? 'linear-gradient(135deg, rgba(16,185,129,0.14), rgba(124,58,237,0.14))'
              : `linear-gradient(135deg, ${theme.primary}12, ${theme.primary}06)`,
            border: `1.5px solid ${data.arcadeUnlocked ? '#34D39944' : theme.primary + '28'}`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${theme.primary}22, transparent)` }}
          />

          <div className="relative z-10 flex items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-2xl"
              style={{ background: `${theme.primary}22`, border: `1.5px solid ${theme.primary}33` }}
            >
              {data.mod.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-round text-xs font-black uppercase tracking-[0.16em]"
                style={{ color: `${theme.text}77` }}>
                Today's Achievement
              </p>
              <p className="font-bubble mt-0.5 text-lg leading-tight" style={{ color: theme.text }}>
                {data.whatTheyDid}
              </p>
              <p className="font-round mt-1 text-xs font-bold leading-4" style={{ color: `${theme.text}66` }}>
                {data.whatsNext}
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleShow}
            className="relative z-10 mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] py-3 font-bubble text-base text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent || theme.secondary || '#EC4899'})`,
              boxShadow: `0 8px 20px ${theme.primary}40`,
            }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span style={{ fontSize: 20 }}>🤍</span>
            Show someone you love!
          </motion.button>
        </motion.div>
      </section>

      <AnimatePresence>
        {showShare && (
          <ShareCard data={data} profileName={profileName} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
