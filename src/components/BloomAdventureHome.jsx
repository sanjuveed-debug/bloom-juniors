import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech.js'
import { ADVENTURE_HOME_COPY, getAdventureHomeNext } from '../utils/adventureHome.js'
import { getInterestRecommendations } from '../utils/childInterest.js'

const PALETTES = {
  toddler: { ink: '#3b1607', accent: '#ef3f83', warm: '#ff7b29', sky: '#fff1c9', border: '#d88b42' },
  early: { ink: '#321348', accent: '#7c3aed', warm: '#f05a7e', sky: '#f4e8ff', border: '#a978d4' },
  junior: { ink: '#28150d', accent: '#6b2e62', warm: '#a33e18', sky: '#f4e5c7', border: '#70401f' },
}

// Where the Bloom Quiz Show lives in each age band's navigation
const QUIZ_TARGET = { toddler: 'quizshow', early: 'arcade', junior: 'games' }

export default function BloomAdventureHome({
  ageGroup = 'early', profileName = 'Explorer', progress = {}, dailyNext, dailyDone = 0,
  dailyRequired = 2, dailyClaimed = false, treasureCount = 0, libraryOpen = false,
  onNavigate, onClaimTreasure, onToggleLibrary, onOpenWorld, onOpenTreasureRoom,
}) {
  const age = ADVENTURE_HOME_COPY[ageGroup] ? ageGroup : 'early'
  const copy = ADVENTURE_HOME_COPY[age]
  const palette = PALETTES[age]
  const { speak, speaking } = useSpeech()
  const next = useMemo(() => getAdventureHomeNext({ progress, ageGroup: age, dailyNext, dailyDone, dailyRequired, dailyClaimed }), [progress, age, dailyNext, dailyDone, dailyRequired, dailyClaimed])
  const interests = useMemo(() => getInterestRecommendations(progress, age), [progress, age])
  const narration = `${profileName}, ${next.title}. ${next.subtitle} ${next.reward}.`
  const continueNow = () => next.action === 'claim' ? onClaimTreasure?.() : next.moduleId && onNavigate?.(next.moduleId, next.source || 'continue')

  return (
    <section className="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-5" data-testid={`adventure-home-${age}`}>
      <div className="relative overflow-hidden rounded-[32px] border-[3px] shadow-[0_18px_45px_rgba(74,39,20,.18)]" style={{ borderColor: palette.border, background: palette.sky }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: 'url(/treasure-map-bg.png)' }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(110deg, ${palette.sky} 5%, ${palette.sky}f2 46%, transparent 100%)` }} />
        <div className="relative grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.18fr_.82fr] lg:p-7">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-round text-[11px] font-black tracking-[.2em]" style={{ color: palette.warm }}>{copy.eyebrow}</p>
                <h2 className="mt-1 font-bubble text-3xl leading-tight sm:text-4xl" style={{ color: palette.ink }}>{copy.heading}</h2>
              </div>
              <button onClick={() => speak(narration)} aria-label={speaking ? 'Yaagvi is speaking' : 'Hear Yaagvi explain the next adventure'} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white bg-[#3a214c] text-lg text-white shadow-lg lg:hidden">{speaking ? '⏸' : '🔊'}</button>
            </div>

            <motion.button whileTap={{ scale: .98 }} onClick={continueNow} className="mt-4 flex min-h-[150px] w-full items-center gap-4 overflow-hidden rounded-[26px] p-4 text-left text-white shadow-xl sm:p-5" style={{ background: `linear-gradient(135deg, ${palette.warm}, ${palette.accent})` }}>
              <motion.span className="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] bg-white/20 text-5xl shadow-inner sm:h-24 sm:w-24 sm:text-6xl" animate={{ y: [0, -6, 0], rotate: [0, -2, 2, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>{next.emoji}</motion.span>
              <span className="min-w-0 flex-1">
                <span className="block font-round text-[10px] font-black uppercase tracking-[.18em] text-white/75">{copy.continueLabel}</span>
                <span className="mt-1 block font-bubble text-2xl leading-tight sm:text-3xl">{next.title}</span>
                <span className="mt-1 block font-round text-sm font-bold text-white/85">{next.subtitle}</span>
                <span className="mt-3 inline-flex rounded-full bg-white/18 px-3 py-1 font-round text-xs font-black">{next.reward}</span>
              </span>
              <span className="hidden text-3xl sm:block">→</span>
            </motion.button>

            <div className="mt-3 grid grid-cols-2 gap-3" data-testid="interest-choices">
              <motion.button data-testid="interest-favourite" whileTap={{ scale: .96 }} onClick={() => onNavigate?.(interests.favourite.id, 'favourite')} className="min-h-[112px] rounded-[22px] border-2 bg-white/95 p-4 text-left shadow-md" style={{ borderColor: `${palette.accent}66`, color: palette.ink }}>
                <span className="text-3xl" aria-hidden="true">{interests.favourite.emoji}</span>
                <span className="ml-2 font-bubble text-lg">My Favourite</span>
                <span className="mt-1 block font-round text-xs font-bold opacity-65">{interests.hasSignals ? `${interests.favourite.label} · chosen from real play` : `${interests.favourite.label} · starts learning after you play`}</span>
              </motion.button>
              <motion.button data-testid="interest-surprise" whileTap={{ scale: .96 }} onClick={() => onNavigate?.(interests.surprise.id, 'surprise')} className="min-h-[112px] rounded-[22px] border-2 bg-white/95 p-4 text-left shadow-md" style={{ borderColor: `${palette.warm}66`, color: palette.ink }}>
                <span className="text-3xl" aria-hidden="true">🎲</span>
                <span className="ml-2 font-bubble text-lg">Surprise Me</span>
                <span className="mt-1 block font-round text-xs font-bold opacity-65">{interests.surprise.label} · something less familiar</span>
              </motion.button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: .96 }} onClick={onToggleLibrary} className="min-h-[104px] rounded-[22px] border-2 bg-white/90 p-4 text-left shadow-md" style={{ borderColor: `${palette.accent}55`, color: palette.ink }}>
                <span className="text-3xl">🗺️</span><span className="ml-2 font-bubble text-lg">{copy.playLabel}</span>
                <span className="mt-1 block font-round text-xs font-bold opacity-60">{libraryOpen ? 'Close the full map' : copy.playHint}</span>
              </motion.button>
              <motion.button whileTap={{ scale: .96 }} onClick={onOpenWorld} className="min-h-[104px] rounded-[22px] border-2 bg-white/90 p-4 text-left shadow-md" style={{ borderColor: `${palette.warm}55`, color: palette.ink }}>
                <span className="text-3xl">🌱</span><span className="ml-2 font-bubble text-lg">{copy.worldLabel}</span>
                <span className="mt-1 block font-round text-xs font-bold opacity-60">{copy.worldHint}</span>
              </motion.button>
            </div>
            {dailyClaimed && dailyDone >= dailyRequired && (
              <motion.button data-testid="quiz-showcase" whileTap={{ scale: .97 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => onNavigate?.(QUIZ_TARGET[age], 'quiz-showcase')}
                className="mt-3 flex w-full items-center gap-4 rounded-[22px] border-2 border-[#fbbf24] bg-gradient-to-r from-[#3b1355] to-[#6d28d9] p-4 text-left text-white shadow-lg">
                <motion.span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl" animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>🎤</motion.span>
                <span className="min-w-0 flex-1">
                  <span className="block font-round text-[10px] font-black uppercase tracking-[.18em] text-[#fbbf24]">Tonight on the Bloom Stage</span>
                  <span className="mt-0.5 block font-bubble text-xl leading-tight sm:text-2xl">Yaagvi&rsquo;s quiz show is ready!</span>
                  <span className="mt-0.5 block font-round text-xs font-bold text-white/80">Take your seat, {profileName} — climb the prize lights.</span>
                </span>
                <span className="text-2xl">→</span>
              </motion.button>
            )}
          </div>

          <div className="relative hidden min-h-[330px] items-end justify-center lg:flex">
            <motion.div className="absolute bottom-4 h-16 w-64 rounded-[50%] bg-[#6b341d]/15 blur-md" animate={{ scaleX: [1, .84, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
            <motion.div className="relative h-[325px] w-[260px]" animate={{ y: [0, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
              <img src="/yaagvi-3d-wave.png" alt="Yaagvi, your adventure guide" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
              <video className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" autoPlay muted loop playsInline preload="metadata" poster="/yaagvi-3d-wave.png" aria-hidden="true"><source src="/yaagvi-3d-wave.webm" type="video/webm" /></video>
            </motion.div>
            <button onClick={() => speak(narration)} aria-label={speaking ? 'Yaagvi is speaking' : 'Hear Yaagvi explain the next adventure'} className="absolute right-2 top-2 grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-[#3a214c] text-xl text-white shadow-lg">{speaking ? '⏸' : '🔊'}</button>
            <button onClick={onOpenTreasureRoom} className="absolute bottom-3 right-2 rounded-full bg-[#3a214c] px-4 py-2 font-round text-xs font-black text-white shadow-lg">🎁 {treasureCount} treasures</button>
          </div>
        </div>
      </div>
    </section>
  )
}
