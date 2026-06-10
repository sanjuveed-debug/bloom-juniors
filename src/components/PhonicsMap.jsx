import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'

// RWI-aligned sound sets
const SET0 = [
  { key: 'm', emoji: '🐭', label: 'm' },
  { key: 'a', emoji: '🐜', label: 'a' },
  { key: 's', emoji: '🐍', label: 's' },
  { key: 'd', emoji: '🐕', label: 'd' },
  { key: 't', emoji: '🌳', label: 't' },
  { key: 'i', emoji: '🦔', label: 'i' },
  { key: 'n', emoji: '🌙', label: 'n' },
  { key: 'p', emoji: '🐷', label: 'p' },
  { key: 'g', emoji: '🐊', label: 'g' },
  { key: 'o', emoji: '🍊', label: 'o' },
  { key: 'c', emoji: '🐱', label: 'c' },
  { key: 'k', emoji: '🪁', label: 'k' },
  { key: 'u', emoji: '☔', label: 'u' },
  { key: 'b', emoji: '🐻', label: 'b' },
  { key: 'f', emoji: '🦊', label: 'f' },
  { key: 'e', emoji: '🥚', label: 'e' },
  { key: 'l', emoji: '🦁', label: 'l' },
  { key: 'h', emoji: '🏠', label: 'h' },
  { key: 'r', emoji: '🐀', label: 'r' },
  { key: 'j', emoji: '🃏', label: 'j' },
  { key: 'v', emoji: '🎻', label: 'v' },
  { key: 'y', emoji: '🪀', label: 'y' },
  { key: 'w', emoji: '🌊', label: 'w' },
  { key: 'z', emoji: '⚡', label: 'z' },
  { key: 'x', emoji: '🎯', label: 'x' },
]

const SET1_AREA = {
  key: 'set1',
  name: 'Special Friends Cave',
  emoji: '🦎',
  sounds: 'sh · ch · th · qu · ng · nk',
  unlockAt: 3,
  color: '#7C3AED',
  bg: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
  desc: 'Two letters, one sound',
}

const SET2_AREA = {
  key: 'set2',
  name: 'Vowel Island',
  emoji: '🏝️',
  sounds: 'ay · ee · igh · ow · oo · ar · or',
  unlockAt: 5,
  color: '#0369A1',
  bg: 'linear-gradient(135deg, #0C4A6E, #0EA5E9)',
  desc: 'Long vowel sounds',
}

const SET3_AREA = {
  key: 'set3',
  name: 'Magic Sounds Forest',
  emoji: '🌲',
  sounds: 'a-e · i-e · o-e · ea · oi · ur · er',
  unlockAt: 8,
  color: '#059669',
  bg: 'linear-gradient(135deg, #064E3B, #059669)',
  desc: 'Split digraphs & more',
}

// IPA phoneme SSML for each RWI Set 0 sound.
// Using <phoneme alphabet="ipa"> so Azure Neural TTS produces the pure phoneme
// rather than reading the letter name (e.g. "ess" for "s").
// Continuants get a length mark (ː) so they're audible; stops use the bare phoneme.
const SOUND_IPA = {
  m: 'mː',  a: 'æ',  s: 'sː',  d: 'd',   t: 't',
  i: 'ɪ',   n: 'nː', p: 'p',   g: 'ɡ',   o: 'ɒ',
  c: 'k',   k: 'k',  u: 'ʌ',   b: 'b',   f: 'fː',
  e: 'ɛ',   l: 'lː', h: 'h',   r: 'r',   j: 'dʒ',
  v: 'vː',  y: 'jɛ', w: 'w',   z: 'zː',  x: 'ks',
}

function phonemeSsml(key) {
  const ipa = SOUND_IPA[key]
  if (!ipa) return null
  return `<phoneme alphabet="ipa" ph="${ipa}">${key}</phoneme>`
}

// Estimate how many Set 0 tiles are lit based on score
// ~3 stars per sound mastered is a reasonable heuristic
function getMasteredCount(phonicsProgress) {
  const score = phonicsProgress?.score || 0
  const played = phonicsProgress?.played || 0
  // Give at least 3 tiles per session played, capped at 25
  return Math.min(SET0.length, Math.max(Math.floor(score / 3), played * 3))
}

function SoundTile({ sound, lit, idx, onTap }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.03, type: 'spring', stiffness: 320, damping: 20 }}
      whileTap={{ scale: 0.85 }}
      onClick={() => onTap(sound)}
      className="relative flex flex-col items-center justify-center rounded-[16px]"
      style={{
        width: 52,
        height: 56,
        background: lit
          ? 'linear-gradient(145deg, #FDE68A, #F59E0B)'
          : 'rgba(255,255,255,0.08)',
        border: `2px solid ${lit ? '#F59E0B' : 'rgba(255,255,255,0.14)'}`,
        boxShadow: lit ? '0 0 14px rgba(245,158,11,0.55), 0 4px 10px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.25)',
      }}
    >
      {lit && (
        <motion.div
          className="absolute inset-0 rounded-[14px]"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)' }}
        />
      )}
      <span style={{ fontSize: 18, lineHeight: 1 }}>{sound.emoji}</span>
      <span
        className="font-bubble mt-0.5 leading-none"
        style={{ fontSize: 14, color: lit ? '#78350F' : 'rgba(255,255,255,0.5)' }}
      >
        {sound.label}
      </span>
    </motion.button>
  )
}

function AreaTile({ area, unlocked, onNavigate, theme }) {
  const bodyText = theme?.text || '#1E1B4B'
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => unlocked && onNavigate('phonics')}
      className="relative w-full overflow-hidden rounded-[22px] p-4 text-left"
      style={{
        background: unlocked
          ? area.bg
          : (theme?.card || '#F5F3FF'),
        border: `2px solid ${area.color}${unlocked ? 'AA' : '55'}`,
        boxShadow: unlocked
          ? `0 8px 24px ${area.color}35`
          : `0 2px 10px rgba(0,0,0,0.08)`,
      }}
    >
      {/* Coloured left accent bar */}
      {!unlocked && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
          style={{ background: area.color }}
        />
      )}

      {unlocked && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%)' }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-2xl"
          style={{
            background: unlocked ? 'rgba(255,255,255,0.22)' : `${area.color}22`,
            border: `1.5px solid ${area.color}66`,
          }}
        >
          {unlocked ? area.emoji : '🔒'}
        </div>
        <div className="min-w-0">
          <p
            className="font-bubble text-base leading-tight"
            style={{ color: unlocked ? '#fff' : area.color }}
          >
            {area.name}
          </p>
          <p
            className="font-round text-xs font-bold mt-0.5"
            style={{ color: unlocked ? 'rgba(255,255,255,0.8)' : bodyText, opacity: unlocked ? 1 : 0.7 }}
          >
            {unlocked ? area.sounds : `Unlocks after ${area.unlockAt} Sound Pop sessions`}
          </p>
          {unlocked && (
            <p className="font-round text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {area.desc}
            </p>
          )}
        </div>
        {unlocked && (
          <span className="font-bubble text-white/70 text-xl ml-auto">→</span>
        )}
        {!unlocked && (
          <div
            className="ml-auto rounded-full px-2 py-0.5 font-bubble text-xs shrink-0"
            style={{ background: `${area.color}18`, color: area.color, border: `1px solid ${area.color}44` }}
          >
            Soon
          </div>
        )}
      </div>
    </motion.button>
  )
}

// onNavigate = gated navigator (for area tiles)
// onPlay     = direct navigator used by the Play button (always goes to phonics)
export default function PhonicsMap({ phonicsProgress, theme, onNavigate, onPlay }) {
  const { speak } = useSpeech()
  const [activeSound, setActiveSound] = useState(null)
  const played = phonicsProgress?.played || 0
  const masteredCount = getMasteredCount(phonicsProgress)

  const handleSoundTap = (sound) => {
    setActiveSound(sound.key)
    const ssmlInner = phonemeSsml(sound.key)
    if (ssmlInner) {
      speak(sound.key, { mood: 'phonics', ssmlInner })
    } else {
      speak(sound.label, { mood: 'phonics' })
    }
    setTimeout(() => setActiveSound(null), 1400)
  }

  const pct = Math.round((masteredCount / SET0.length) * 100)

  return (
    <section className="mx-auto mt-5 max-w-6xl px-4 md:px-6 xl:px-8">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p
            className="font-round text-xs font-black uppercase tracking-[0.18em]"
            style={{ color: `${theme.text}88` }}
          >
            Phonics Path
          </p>
          <p className="font-bubble text-xl leading-tight mt-0.5" style={{ color: theme.text }}>
            Mastery Map
          </p>
        </div>
        <button
          onClick={() => (onPlay || onNavigate)('phonics')}
          className="rounded-full px-4 py-2 font-bubble text-sm text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent || theme.secondary})` }}
        >
          Play
        </button>
      </div>

      {/* Set 0 tile grid */}
      <div
        className="rounded-[26px] p-4"
        style={{
          background: 'linear-gradient(160deg, #0B0F2A, #1A1550)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-bubble text-sm text-white leading-none">Letter Sounds</p>
            <p className="font-round text-xs text-white/50 mt-0.5">Set 0 · Tap to hear each sound</p>
          </div>
          <div className="text-right">
            <p className="font-bubble text-lg text-white leading-none">{Math.min(masteredCount, SET0.length)}/{SET0.length}</p>
            <p className="font-round text-[10px] text-white/45 mt-0.5">mastered</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{ background: 'linear-gradient(90deg, #F59E0B, #FDE68A)' }}
          />
        </div>

        {/* Sound tiles */}
        <div className="flex flex-wrap gap-2">
          {SET0.map((sound, idx) => (
            <SoundTile
              key={sound.key}
              sound={sound}
              lit={idx < masteredCount}
              idx={idx}
              onTap={handleSoundTap}
            />
          ))}
        </div>

        <AnimatePresence>
          {activeSound && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-2xl px-3 py-2 text-center font-bubble text-white"
              style={{ background: 'rgba(245,158,11,0.25)', border: '1px solid rgba(245,158,11,0.4)' }}
            >
              🔊 /{activeSound}/
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Area tiles */}
      <div className="mt-3 flex flex-col gap-2">
        <AreaTile area={SET1_AREA} unlocked={played >= SET1_AREA.unlockAt} onNavigate={onNavigate} theme={theme} />
        <AreaTile area={SET2_AREA} unlocked={played >= SET2_AREA.unlockAt} onNavigate={onNavigate} theme={theme} />
        <AreaTile area={SET3_AREA} unlocked={played >= SET3_AREA.unlockAt} onNavigate={onNavigate} theme={theme} />
      </div>

      {played < SET1_AREA.unlockAt && (
        <p className="mt-2 text-center font-round text-xs font-bold" style={{ color: `${theme.text}55` }}>
          {SET1_AREA.unlockAt - played} more Sound Pop session{SET1_AREA.unlockAt - played !== 1 ? 's' : ''} to unlock Special Friends Cave
        </p>
      )}
    </section>
  )
}
