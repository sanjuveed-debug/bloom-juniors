import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { PROFILE_COLORS } from '../hooks/useProfiles'

const EMOJI_OPTIONS = ['⭐', '🦄', '🌈', '🎵', '🌸', '🎮', '🚀', '🦋', '🎨', '🌟', '🐬', '🦊']

const AGE_GROUP_META = {
  toddler: { label: 'Tiny Stars', range: '3-4', emoji: '🧸', color: '#FF9A3C' },
  early:   { label: 'Little Stars', range: '4-6', emoji: '🌟', color: '#8B00FF' },
  junior:  { label: 'Super Kids', range: '7-9', emoji: '🚀', color: '#E21C1C' },
}

export default function ProfileSelector({
  profiles,
  allProfilesCount = profiles.length,
  ageGroup = 'early',
  onSelect,
  onCreateNew,
  onDelete,
  onBack,
  onLogout,
  autoCreate = false,
  maxProfiles = 2,
  classroomMode = false,
}) {
  void allProfilesCount
  const canAddProfile = profiles.length < maxProfiles
  const [creating, setCreating] = useState(autoCreate || (profiles.length === 0 && canAddProfile))
  const [name, setName] = useState('')
  const [colorIdx, setColorIdx] = useState(0)
  const [emojiIdx, setEmojiIdx] = useState(0)
  const [nameError, setNameError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [logoutTarget, setLogoutTarget] = useState(false)
  const selectingRef = useRef(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  useEffect(() => {
    if (profiles.length === 0 && canAddProfile) setCreating(true)
  }, [profiles.length, canAddProfile])

  const handleSelect = (profile) => {
    if (selectingRef.current) return
    selectingRef.current = true
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors: [PROFILE_COLORS[profile.colorIdx]?.color || '#8B00FF', '#FFD700', '#FF6B9D'],
    })
    timerRef.current = setTimeout(() => onSelect(profile.id), 500)
  }

  const handleCreate = () => {
    if (!canAddProfile) {
      setNameError(`You can add up to ${maxProfiles} players only. Delete a player first.`)
      return
    }

    const trimmed = name.trim()
    if (!trimmed) { setNameError('Please enter a name!'); return }
    if (trimmed.length > 14) { setNameError('Name too long (max 14 letters)'); return }
    if (profiles.some(profile => profile.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      setNameError(`${trimmed} is already in this class.`)
      return
    }

    const newId = onCreateNew(trimmed, colorIdx, EMOJI_OPTIONS[emojiIdx], ageGroup)
    if (!newId) {
      setNameError(`You can add up to ${maxProfiles} players only. Delete a player first.`)
      return
    }

    if (selectingRef.current) return
    selectingRef.current = true
    confetti({
      particleCount: 120,
      spread: 120,
      origin: { x: 0.5, y: 0.4 },
      colors: [PROFILE_COLORS[colorIdx].color, '#FFD700', '#FF6B9D'],
    })
    timerRef.current = setTimeout(() => {
      if (classroomMode) {
        selectingRef.current = false
        onBack?.()
      } else {
        onSelect(newId)
      }
    }, 600)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete?.(deleteTarget.id)
    setDeleteTarget(null)
    if (profiles.length <= 1) setCreating(true)
  }

  return (
    <div className="min-h-screen overflow-y-auto scroll-ios flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1a0533 0%, #2d0a5e 50%, #0a1a3d 100%)' }}>

      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div key={i} className="fixed text-sm pointer-events-none select-none"
          style={{ left: `${(i * 13 + 3) % 95}%`, top: `${(i * 7 + 2) % 90}%`, zIndex: 0 }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5 + (i % 4) * 0.5, repeat: Infinity, delay: i * 0.2 }}>
          {['✨', '⭐', '💫', '🌟'][i % 4]}
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center pt-safe pb-10 px-4 flex-1">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 w-full max-w-md">
          {onBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="absolute left-4 top-safe font-round text-white/60 text-sm flex items-center gap-1 mt-3"
            >
              ← Back
            </motion.button>
          )}
          {onLogout && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLogoutTarget(true)}
              className="absolute right-4 top-safe mt-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 font-round text-xs font-bold text-white/70 shadow-lg"
            >
              Log out
            </motion.button>
          )}
          <motion.div className="text-5xl mb-2 inline-block"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
            {AGE_GROUP_META[ageGroup]?.emoji || '🌟'}
          </motion.div>
          <div className="relative mx-auto mb-3 flex w-full max-w-sm flex-col items-center">
            <motion.img
              src="/yaagvi-mascot.webp"
              alt="Bloom Juniors learning guide"
              className="h-32 w-auto object-contain object-left drop-shadow-2xl"
              draggable={false}
              animate={{ y: [0, -6, 0], rotate: [0, -1.5, 1.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative z-10 order-first mb-2 max-w-[260px] rounded-[24px] border border-white/70 bg-white px-3 py-2 text-left shadow-2xl"
              initial={{ opacity: 0, x: 14, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <p className="font-bubble text-base leading-tight text-[#2d0a5e]">
                {creating ? 'I am Yaagvi, your mascot!' : 'Tap your name!'}
              </p>
              <p className="font-round mt-1 text-[11px] font-bold leading-4 text-slate-600">
                {creating ? 'Make your player and I will guide your mission.' : 'I will take you to today\'s adventure.'}
              </p>
            </motion.div>
          </div>
          <h1 className="font-bubble text-white text-3xl drop-shadow-lg"
            style={{ textShadow: '0 0 30px rgba(255,215,0,0.8)' }}>
            {creating ? 'Create Profile' : "Who's Playing? 👋"}
          </h1>
          <p className="font-round mt-1 text-sm font-bold"
            style={{ color: AGE_GROUP_META[ageGroup]?.color || '#FFD700' }}>
            {AGE_GROUP_META[ageGroup]?.label} · Ages {AGE_GROUP_META[ageGroup]?.range}
          </p>
          {!creating && (
            <p className="font-round text-yellow-300 text-base mt-1 font-bold">
              Tap your name to start!
            </p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!creating && (
            <motion.div key="profiles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm flex flex-col gap-4">
              {profiles.map((profile, idx) => {
                const col = PROFILE_COLORS[profile.colorIdx] || PROFILE_COLORS[0]
                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                    className="relative rounded-3xl shadow-xl"
                    style={{
                      background: col.bg,
                      boxShadow: `0 8px 30px ${col.color}60`,
                      border: '3px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => handleSelect(profile)}
                      className="w-full flex items-center gap-4 p-4 pr-16 rounded-3xl"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner">
                        {profile.emoji || '⭐'}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-bubble text-white text-2xl drop-shadow truncate">{profile.name}</p>
                        <p className="font-round text-white/80 text-xs">Tap to play!</p>
                      </div>
                      <motion.span className="text-3xl"
                        animate={{ x: [0, 6, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                        →
                      </motion.span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.86 }}
                      onClick={() => setDeleteTarget(profile)}
                      aria-label={`Delete ${profile.name}`}
                      className="absolute right-3 top-3 w-10 h-10 rounded-2xl bg-black/25 text-white font-bubble text-lg flex items-center justify-center border border-white/20"
                    >
                      ×
                    </motion.button>
                  </motion.div>
                )
              })}

              {canAddProfile ? (
                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: profiles.length * 0.1 + 0.1 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setCreating(true)}
                  className="flex items-center gap-4 p-4 rounded-3xl"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '2px dashed rgba(255,255,255,0.35)',
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                    +
                  </div>
                  <p className="font-bubble text-white/80 text-xl">Add New Player</p>
                </motion.button>
              ) : (
                <div
                  className="rounded-3xl p-4 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '2px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <p className="font-bubble text-white text-lg">{maxProfiles} player limit reached</p>
                  <p className="font-round text-white/70 text-sm mt-1">
                    Delete a player before adding another.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {creating && canAddProfile && (
            <motion.div key="create" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} className="w-full max-w-sm flex flex-col gap-5">

              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-3xl flex flex-col items-center justify-center shadow-xl"
                  style={{ background: PROFILE_COLORS[colorIdx].bg }}>
                  <span className="text-4xl">{EMOJI_OPTIONS[emojiIdx]}</span>
                  <span className="font-bubble text-white text-xs mt-1 px-1 text-center leading-tight truncate w-full">
                    {name || '...'}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-round text-white/80 text-sm mb-1 text-center">What is your name?</p>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError('') }}
                  placeholder="Enter name..."
                  maxLength={14}
                  className="w-full px-4 py-3 rounded-2xl font-bubble text-xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: nameError ? '2px solid #EF4444' : '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    outline: 'none',
                  }}
                  autoFocus
                />
                {nameError && <p className="text-red-400 font-round text-sm text-center mt-1">{nameError}</p>}
              </div>

              <div>
                <p className="font-round text-white/80 text-sm mb-2 text-center">Pick an emoji!</p>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map((em, i) => (
                    <motion.button key={em} whileTap={{ scale: 0.85 }}
                      onClick={() => setEmojiIdx(i)}
                      className="aspect-square rounded-2xl flex items-center justify-center text-2xl"
                      style={{
                        background: emojiIdx === i ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)',
                        border: emojiIdx === i ? '2px solid white' : '2px solid transparent',
                      }}>
                      {em}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-round text-white/80 text-sm mb-2 text-center">Pick a colour!</p>
                <div className="flex gap-2 justify-center">
                  {PROFILE_COLORS.map((col, i) => (
                    <motion.button key={col.name} whileTap={{ scale: 0.85 }}
                      onClick={() => setColorIdx(i)}
                      className="w-10 h-10 rounded-full shadow-lg"
                      style={{
                        background: col.bg,
                        border: colorIdx === i ? '3px solid white' : '3px solid transparent',
                        boxShadow: colorIdx === i ? `0 0 0 2px ${col.color}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {profiles.length > 0 && (
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCreating(false)}
                    className="flex-1 py-3 rounded-2xl font-bubble text-white"
                    style={{ background: 'rgba(255,255,255,0.15)' }}>
                    Back
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleCreate}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white shadow-lg"
                  style={{ background: PROFILE_COLORS[colorIdx].bg }}>
                  Let's Go! 🚀
                </motion.button>
              </div>
            </motion.div>
          )}

          {creating && !canAddProfile && (
            <motion.div
              key="limit"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-5 text-center"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <p className="font-bubble text-white text-2xl">{maxProfiles} player limit reached</p>
              <p className="font-round text-white/75 text-sm mt-2">
                You can keep up to {maxProfiles} players. Delete a player first, then Add New Player will appear.
              </p>
              <div className="mt-4 flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setCreating(false)}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  Show Players
                </motion.button>
                {onBack && (
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={onBack}
                    className="flex-1 py-3 rounded-2xl font-bubble text-white"
                    style={{ background: 'linear-gradient(135deg, #FF9A3C, #FF1D8E)' }}
                  >
                    Back
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {logoutTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 24 }}
              style={{
                background: 'linear-gradient(160deg, #351367, #18072f)',
                border: '2px solid rgba(255,255,255,0.18)',
              }}
            >
              <p className="font-bubble text-white text-2xl">Log out?</p>
              <p className="font-round text-white/75 text-sm mt-2">
                This will close the parent session and return to the login screen.
              </p>
              <div className="flex gap-3 mt-5">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setLogoutTarget(false)}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={onLogout}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white"
                  style={{ background: 'linear-gradient(135deg, #FF7A18, #FF2D55)' }}
                >
                  Log out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 24 }}
              style={{
                background: 'linear-gradient(160deg, #351367, #18072f)',
                border: '2px solid rgba(255,255,255,0.18)',
              }}
            >
              <p className="font-bubble text-white text-2xl">Delete {deleteTarget.name}?</p>
              <p className="font-round text-white/75 text-sm mt-2">
                This removes this player and their progress from this device and cloud account.
              </p>
              <div className="flex gap-3 mt-5">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  Keep
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white"
                  style={{ background: 'linear-gradient(135deg, #FF4D6D, #C9184A)' }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
