import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

const AGE_GROUPS = [
  {
    id: 'toddler',
    label: 'Tiny Stars',
    range: 'Ages 3-4',
    emoji: '🧸',
    gradient: 'linear-gradient(135deg, #FF9A3C 0%, #FFD93D 58%, #FF6B9D 100%)',
    glow: '#FF9A3C',
    tagline: 'Tap, colours, shapes, numbers',
    guide: 'Tiny games first',
  },
  {
    id: 'early',
    label: 'Little Stars',
    range: 'Ages 4-6',
    emoji: '🌟',
    gradient: 'linear-gradient(135deg, #8B00FF 0%, #C77DFF 55%, #FF1D8E 100%)',
    glow: '#8B00FF',
    tagline: 'Phonics, maths, stories, art',
    guide: 'Daily adventure',
  },
  {
    id: 'junior',
    label: 'Super Kids',
    range: 'Ages 7-9',
    emoji: '🚀',
    gradient: 'linear-gradient(135deg, #E21C1C 0%, #1C4BE2 55%, #7B2FBE 100%)',
    glow: '#E21C1C',
    tagline: 'Maths, reading, science, games',
    guide: 'Power mission',
  },
]

export default function AgeGroupLanding({ onSelect, onLogout, profiles = [], adminMode = false, classroomMode = false, onUpdateGuardian }) {
  const [selected, setSelected] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const registeredAgeGroups = new Set(profiles.map(profile => profile.ageGroup || 'early'))
  const visibleAgeGroups = adminMode || profiles.length === 0
    ? AGE_GROUPS
    : AGE_GROUPS.filter(group => registeredAgeGroups.has(group.id))

  const handlePick = (group) => {
    setSelected(group.id)
    confetti({
      particleCount: 120,
      spread: 120,
      origin: { x: 0.5, y: 0.48 },
      colors: [group.glow, '#FFD700', '#FFFFFF'],
    })
    setTimeout(() => onSelect(group.id), 550)
  }

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice.catch(() => null)
    setInstallPrompt(null)
  }

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #080516 0%, #25064d 52%, #061633 100%)' }}
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none select-none text-sm"
          style={{ left: `${(i * 13 + 5) % 94}%`, top: `${(i * 7 + 3) % 88}%`, zIndex: 0 }}
          animate={{ opacity: [0.2, 0.85, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2 + (i % 4) * 0.6, repeat: Infinity, delay: i * 0.18 }}
        >
          {['✨', '⭐', '💫', '🌟', '🎇'][i % 5]}
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-8 pt-safe md:px-8">
        <div className="relative z-20 mb-5 flex w-full items-center justify-end gap-2">
          {installPrompt && (
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-2xl bg-white px-4 py-2.5 font-bubble text-xs text-[#2d0a5e] shadow-lg"
            >
              Install app
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowIntro(true)}
            className="rounded-2xl bg-gradient-to-r from-[#FFE45E] via-[#FFB347] to-[#FF5E7E] px-4 py-2.5 font-bubble text-xs text-[#2d0a5e] shadow-lg ring-2 ring-white/60"
          >
            Meet Yaagvi
          </button>

          {onUpdateGuardian && (
            <button
              type="button"
              onClick={() => setShowAdminPanel(true)}
              className="rounded-2xl border border-indigo-400/40 bg-indigo-500/20 px-4 py-2.5 font-round text-xs font-bold text-indigo-300 shadow-lg backdrop-blur"
            >
              ⚙ Settings
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="rounded-2xl border border-white/25 bg-white/16 px-4 py-2.5 font-round text-xs font-bold text-white shadow-lg backdrop-blur"
            >
              Log out
            </button>
          )}
        </div>

        <div className="flex w-full flex-1 flex-col md:flex-row md:items-center md:gap-8">
        <section className="flex flex-col items-center pt-3 text-center md:w-[44%] md:items-start md:pt-8 md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className="relative flex flex-col items-center md:items-start"
          >
            <motion.div
              className="relative z-10 mb-3 max-w-[310px] rounded-[26px] border border-white/70 bg-white px-4 py-3 text-left shadow-2xl"
              initial={{ opacity: 0, y: -10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <p className="font-bubble text-lg leading-tight text-[#2d0a5e] md:text-xl">
                Hi, I am Yaagvi, your mascot!
              </p>
              <p className="font-round mt-1 text-xs font-bold leading-5 text-slate-600 md:text-sm">
              I am your learning buddy. Pick your world and I will guide your mission today.
              </p>
              <span className="absolute -bottom-2 left-12 h-5 w-5 rotate-45 border-b border-r border-white/70 bg-white" />
            </motion.div>
            <motion.img
              src="/yaagvi-mascot.webp"
              alt="Yaagvi learning guide"
              className="h-[220px] w-auto object-contain object-left drop-shadow-2xl md:h-[330px]"
              draggable={false}
              animate={{ y: [0, -8, 0], rotate: [0, -1.5, 1.5, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 md:mt-6"
          >
            <p className="font-round text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
              Learning adventure
            </p>
            <h1
              className="mt-2 font-bubble text-4xl leading-tight text-white md:text-5xl"
              style={{ textShadow: '0 0 40px rgba(255,215,0,0.45)' }}
            >
              Choose your world
            </h1>
            <p className="mx-auto mt-2 max-w-sm font-round text-sm font-bold leading-6 text-white/65 md:mx-0">
              One child-friendly path, a mascot guide, and games that unlock after learning.
            </p>
          </motion.div>
        </section>

        <section className="mt-6 flex w-full flex-1 flex-col gap-4 pb-8 md:mt-0">
          {visibleAgeGroups.map((group, idx) => (
            <motion.button
              key={group.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.12, type: 'spring', stiffness: 260, damping: 22 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePick(group)}
              disabled={Boolean(selected)}
              className="relative min-h-[126px] overflow-hidden rounded-[32px] p-5 text-left shadow-2xl"
              style={{
                background: group.gradient,
                boxShadow: `0 16px 38px ${group.glow}35`,
                border: '2px solid rgba(255,255,255,0.28)',
                opacity: selected && selected !== group.id ? 0.52 : 1,
              }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.2) 50%, transparent 62%)' }}
                animate={{ x: ['-120%', '180%'] }}
                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3.2 + idx }}
              />

              <div className="relative z-10 flex items-center gap-4">
                <motion.div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-white/20 text-5xl shadow-inner"
                  animate={{ rotate: [0, 6, -6, 0], scale: selected === group.id ? [1, 1.16, 1] : 1 }}
                  transition={{ duration: selected === group.id ? 0.55 : 3, repeat: selected === group.id ? 0 : Infinity }}
                >
                  {group.emoji}
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bubble text-2xl leading-tight text-white drop-shadow md:text-3xl">
                      {group.label}
                    </p>
                    <span className="rounded-full bg-white/20 px-3 py-1 font-round text-xs font-black text-white">
                      {group.range}
                    </span>
                  </div>
                  <p className="font-round mt-1 text-sm font-bold text-white/88">
                    {group.tagline}
                  </p>
                  <p className="font-round mt-2 inline-flex rounded-full bg-black/16 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white/85">
                    {adminMode ? 'Admin view' : group.guide}
                  </p>
                </div>

                <motion.span
                  className="hidden text-4xl text-white/80 sm:block"
                  animate={{ x: [0, 7, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </div>
            </motion.button>
          ))}

          {!visibleAgeGroups.length && (
            <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 text-center shadow-xl">
              <p className="font-bubble text-2xl text-white">No player yet</p>
              <p className="font-round mt-2 text-sm font-bold leading-6 text-white/65">
                Create a child profile first, then this screen will show that child&apos;s age world.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 self-center justify-center">
            {classroomMode && onUpdateGuardian && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdateGuardian({ classroomMode: true })}
                className="rounded-full px-5 py-2 font-bubble text-sm text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                🏫 Classroom View
              </motion.button>
            )}
            <a
              href="/schools"
              className="rounded-full bg-white/10 px-4 py-2 font-round text-xs font-bold text-white/60 transition-colors hover:bg-white/15 hover:text-white"
            >
              For Schools
            </a>
            <a
              href="/privacy"
              className="rounded-full bg-white/10 px-4 py-2 font-round text-xs font-bold text-white/60 transition-colors hover:bg-white/15 hover:text-white"
            >
              Privacy Policy
            </a>
          </div>
        </section>
        </div>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-[28px] border border-white/15 bg-[#210942] p-5 text-center shadow-2xl"
          >
            <p className="font-bubble text-2xl text-white">Log out?</p>
            <p className="mt-2 font-round text-sm font-bold leading-6 text-white/70">
              You will return to the parent login screen.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="flex-1 rounded-2xl bg-white/10 py-3 font-bubble text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 rounded-2xl bg-gradient-to-r from-[#ff7a18] to-[#ff2d55] py-3 font-bubble text-white"
              >
                Log out
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAdminPanel && onUpdateGuardian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-[28px] border border-white/15 bg-[#1a0a3d] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bubble text-xl text-white">Admin Settings</p>
              <button type="button" onClick={() => setShowAdminPanel(false)}
                className="rounded-full bg-white/10 px-3 py-1 font-round text-xs text-white/60">
                Close
              </button>
            </div>
            <div className="rounded-2xl bg-white/8 border border-white/12 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bubble text-white text-base">🏫 Classroom Mode</p>
                  <p className="font-round text-white/50 text-xs mt-1">Replace the home screen with a teacher dashboard showing all student profiles and daily completion status.</p>
                  {classroomMode && (
                    <a href="/curriculum-map" target="_blank" rel="noreferrer"
                      className="font-round text-indigo-400 text-xs mt-2 block hover:text-indigo-300">
                      View Curriculum Map →
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateGuardian({ classroomMode: !classroomMode })}
                  className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
                  style={{ background: classroomMode ? '#6366F1' : 'rgba(255,255,255,0.15)' }}
                >
                  <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: classroomMode ? 'translateX(20px)' : 'translateX(0)' }} />
                </button>
              </div>
            </div>
            {classroomMode && (
              <p className="font-round text-indigo-300 text-xs mt-3 text-center">
                Classroom Mode is ON — log out and back in to see the teacher dashboard.
              </p>
            )}
          </motion.div>
        </div>
      )}

      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-[#FF7A18] to-[#FF2D88] px-5 py-4">
              <div>
                <p className="font-bubble text-2xl leading-none text-white">Meet Yaagvi</p>
                <p className="mt-1 font-round text-xs font-bold text-white/80">Your learning mascot</p>
              </div>
              <button
                type="button"
                onClick={() => setShowIntro(false)}
                className="rounded-full bg-white/20 px-3 py-1.5 font-round text-xs font-bold text-white"
              >
                Close
              </button>
            </div>

            <div className="bg-black">
              <video
                src="/tours/yaagvi-avatar-intro.mp4"
                controls
                autoPlay
                playsInline
                className="max-h-[68vh] w-full bg-black object-contain"
              />
            </div>

            <div className="px-5 py-4">
              <p className="font-round text-sm font-bold leading-6 text-slate-600">
                Watch the intro, then choose an age world to start today&apos;s mission.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
