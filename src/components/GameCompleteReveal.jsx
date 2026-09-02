import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import YaagviCharacter from './YaagviCharacter.jsx'

const COPY = {
  toddler: { eyebrow: 'YOU FOUND IT!', title: 'Happy treasure dance!', continue: 'Next adventure', replay: 'Play again', next: 'One more little surprise is waiting.' },
  early: { eyebrow: 'TRAIL COMPLETE', title: 'You moved the adventure!', continue: 'Continue adventure', replay: 'Replay this game', next: 'A new clue is waiting on your trail.' },
  junior: { eyebrow: 'MISSION COMPLETE', title: 'Expedition progress saved!', continue: 'Continue expedition', replay: 'Retry this mission', next: 'Your next expedition clue is ready.' },
}

const RETURN_COPY = {
  toddler: 'Tomorrow, Yaagvi will bring one new little surprise.',
  early: 'Tomorrow, a new clue and one short adventure will be ready.',
  junior: 'Tomorrow, the next expedition clue will be ready to investigate.',
}

const SPARKLES = [
  [8, 18, 0], [19, 64, .18], [31, 12, .34], [43, 74, .12], [58, 18, .28],
  [69, 66, .42], [82, 13, .16], [91, 55, .32], [14, 42, .5], [76, 39, .56],
]

export default function GameCompleteReveal({ ageGroup = 'early', place, icon, result = {}, treasureMessage = '', onReplay, onContinue, onHome }) {
  const copy = COPY[ageGroup] || COPY.early
  const reducedMotion = useReducedMotion()
  const [phase, setPhase] = useState(reducedMotion ? 2 : 0)
  const stars = Math.max(1, Math.min(3, Number(result.stars) || (Number(result.total) > 0 ? Math.ceil((Number(result.correct) / Number(result.total)) * 3) : 3)))
  const scoreText = Number(result.total) > 0
    ? ageGroup === 'toddler'
      ? `All ${Number(result.total)} clues found!`
      : `${Math.max(0, Number(result.correct) || 0)} of ${Number(result.total)} clues solved`
    : 'Your journey has been saved'
  const nextTitle = result.starterPath?.complete
    ? 'Your full Bloom journey is ready.'
    : result.starterPath?.nextTitle || copy.next

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('bloom:fullscreen-overlay', { detail: { hidden: true } }))
    if (reducedMotion) return () => window.dispatchEvent(new CustomEvent('bloom:fullscreen-overlay', { detail: { hidden: false } }))
    const rewardTimer = window.setTimeout(() => setPhase(1), 520)
    const readyTimer = window.setTimeout(() => setPhase(2), 1420)
    return () => {
      window.clearTimeout(rewardTimer)
      window.clearTimeout(readyTimer)
      window.dispatchEvent(new CustomEvent('bloom:fullscreen-overlay', { detail: { hidden: false } }))
    }
  }, [reducedMotion])

  return (
    <motion.div
      data-testid="game-complete-reveal"
      className="fixed inset-0 z-[295] overflow-y-auto bg-[#241331]/90 px-3 pb-safe pt-safe backdrop-blur-md sm:grid sm:place-items-center sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[30px] border-[3px] border-[#ffd76b] bg-[#fff5df] shadow-2xl sm:rounded-[34px] sm:border-4"
        initial={{ y: 34, scale: .9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: .94 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url(/treasure-map-bg.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff9eb]/95 via-[#fff3d8]/95 to-[#f5d9ed]/95" />

        <div className="relative">
          <button
            type="button"
            aria-label="Skip celebration animation"
            onClick={() => setPhase(2)}
            className={`absolute right-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-full border-2 border-[#6d315d]/15 bg-white/85 font-bubble text-lg text-[#542045] shadow ${phase >= 2 ? 'invisible' : ''}`}
          >
            »
          </button>

          <div className="relative h-[210px] overflow-hidden border-b-2 border-[#e9ad4a]/25 bg-[radial-gradient(circle_at_50%_74%,#ffe36f_0%,#f5a7c8_34%,#7a3bad_100%)] sm:h-[280px]">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {SPARKLES.map(([left, top, delay], index) => (
                <motion.span
                  key={`${left}-${top}`}
                  className="absolute text-lg text-[#fff2a8] sm:text-2xl"
                  style={{ left: `${left}%`, top: `${top}%` }}
                  animate={reducedMotion ? {} : { scale: [0, 1.35, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.7, delay, repeat: Infinity, repeatDelay: .35 }}
                >
                  ✦
                </motion.span>
              ))}
            </div>

            <motion.div
              className="absolute -bottom-3 left-1 h-[190px] w-[145px] sm:left-10 sm:h-[270px] sm:w-[210px]"
              initial={{ x: -90, opacity: 0, rotate: -8 }}
              animate={{ x: 0, opacity: 1, rotate: phase === 0 ? -2 : 2 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            >
              <YaagviCharacter state={phase >= 1 ? 'celebrate' : 'wave'} size="100%" imageClassName="drop-shadow-2xl" />
            </motion.div>

            <motion.div
              data-testid="animated-reward-chest"
              className="absolute -bottom-2 right-0 h-[170px] w-[205px] sm:right-9 sm:h-[250px] sm:w-[300px]"
              initial={{ y: 95, scale: .62, opacity: 0, rotate: 8 }}
              animate={phase >= 1
                ? { y: 0, scale: 1, opacity: 1, rotate: 0 }
                : { y: 42, scale: .82, opacity: .3, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 190, damping: 16 }}
            >
              <motion.div
                className="absolute inset-[20%] rounded-full bg-[#ffe55c]/70 blur-2xl"
                animate={reducedMotion ? {} : { scale: [1, 1.28, 1], opacity: [.55, .9, .55] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <img src="/bloom-reward-chest-v1.webp" alt="An open Bloom treasure chest" className="relative h-full w-full object-contain drop-shadow-2xl" />
            </motion.div>

            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white/70 bg-[#3b174d]/85 px-4 py-2 font-round text-[10px] font-black uppercase tracking-[.16em] text-[#fff28a] shadow-lg sm:top-6 sm:text-xs"
                  initial={{ y: -18, scale: .7, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
                >
                  Treasure earned
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative p-5 sm:p-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : .18 }}>
              <p className="font-round text-[10px] font-black uppercase tracking-[.2em] text-[#a33e18] sm:text-xs">{copy.eyebrow}</p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="completion-title" className="font-bubble text-2xl leading-tight text-[#351407] sm:text-4xl">{copy.title}</h2>
                  <p className="mt-1 font-round text-sm font-bold text-[#7b4a2e]">{icon} {place}</p>
                </div>
                <div className="flex shrink-0 gap-0.5" aria-label={`${stars} stars earned`}>
                  {[1, 2, 3].map(value => (
                    <motion.span
                      key={value}
                      className={`text-2xl sm:text-4xl ${value <= stars ? '' : 'grayscale opacity-20'}`}
                      initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: reducedMotion ? 0 : .16 * value, type: 'spring' }}
                    >⭐</motion.span>
                  ))}
                </div>
              </div>
              <p className="mt-3 font-bubble text-lg text-[#542219] sm:text-xl">{scoreText}</p>
            </motion.div>

            <motion.div
              className="mt-4 border-y-2 border-[#e0b15d]/30 py-4"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 14 }}
            >
              <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-[#9b2457]">Your world changed</p>
              <p className="mt-1 font-round text-sm font-black text-[#694021]">🎁 {treasureMessage || result.reward || 'Treasure XP, quest progress, and your learning journey are saved.'}</p>
            </motion.div>

            <motion.div
              data-testid="completion-next-preview"
              className="mt-4 grid grid-cols-3 gap-1.5 text-center"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 12 }}
            >
              {[
                ['✓', 'Learned', ageGroup === 'toddler' ? 'Clues complete' : 'Result saved'],
                ['★', 'Treasure', 'Saved in your world'],
                ['→', 'Next', nextTitle],
              ].map(([symbol, label, detail], index) => (
                <div key={label} className={`min-w-0 border-t-4 px-1 pt-2 ${index === 2 ? 'border-[#e83f83]' : 'border-[#f3b640]'}`}>
                  <p className="font-bubble text-lg text-[#6d315d]">{symbol}</p>
                  <p className="font-round text-[9px] font-black uppercase text-[#542045] sm:text-[10px]">{label}</p>
                  <p className="mt-1 line-clamp-3 font-round text-[9px] font-bold leading-tight text-[#7b543d] sm:text-xs">{detail}</p>
                </div>
              ))}
            </motion.div>

            {result.starterPath ? (
              <motion.div
                className="mt-4 border-l-4 border-[#e83f83] bg-white/60 px-3 py-2.5 text-left"
                data-testid="starter-path-completion"
                initial={{ opacity: 0 }} animate={{ opacity: phase >= 2 ? 1 : 0 }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-round text-[10px] font-black uppercase text-[#9b2457]">Starter path</p>
                  <p className="font-round text-xs font-black text-[#542045]">{result.starterPath.completed} of {result.starterPath.total}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ead8e3]">
                  <motion.div
                    className="h-full rounded-full bg-[#e83f83]"
                    initial={{ width: 0 }} animate={{ width: `${Math.min(100, (result.starterPath.completed / result.starterPath.total) * 100)}%` }}
                    transition={{ delay: reducedMotion ? 0 : 1.25, duration: .65 }}
                  />
                </div>
                <p className="mt-2 font-round text-sm font-black text-[#542045]">{nextTitle}</p>
                <p className="mt-1 font-round text-xs font-bold text-[#7b543d]">
                  {result.firstMission
                    ? `${RETURN_COPY[ageGroup] || RETURN_COPY.early} A grown-up can save a gentle reminder after you continue.`
                    : 'Come back when you are ready. Missing a day never removes your progress.'}
                </p>
              </motion.div>
            ) : result.firstMission && (
              <motion.div
                className="mt-4 border-l-4 border-[#e83f83] bg-white/60 px-3 py-2.5 text-left"
                data-testid="first-mission-return-preview"
                initial={{ opacity: 0 }} animate={{ opacity: phase >= 2 ? 1 : 0 }}
              >
                <p className="font-round text-[10px] font-black uppercase text-[#9b2457]">Come back tomorrow</p>
                <p className="mt-0.5 font-round text-sm font-black text-[#542045]">{RETURN_COPY[ageGroup] || RETURN_COPY.early}</p>
                <p className="mt-1 font-round text-xs font-bold text-[#7b543d]">A grown-up can save a gentle reminder after you continue.</p>
              </motion.div>
            )}

            <motion.div
              className="mt-5 grid gap-2 sm:grid-cols-2"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 12 }}
              style={{ pointerEvents: phase >= 2 ? 'auto' : 'none' }}
            >
              <motion.button whileTap={{ scale: .96 }} onClick={onContinue} className="min-h-14 rounded-2xl bg-gradient-to-r from-[#f06a35] to-[#e83f83] px-5 font-bubble text-lg text-white shadow-lg">{copy.continue} →</motion.button>
              <motion.button whileTap={{ scale: .96 }} onClick={onReplay} className="min-h-14 rounded-2xl border-2 border-[#6d315d]/20 bg-white/85 px-5 font-bubble text-lg text-[#542045]">↻ {copy.replay}</motion.button>
            </motion.div>
            <button onClick={onHome} className="mt-3 min-h-11 w-full font-round text-sm font-black text-[#7b543d] underline decoration-2 underline-offset-4">Return to Bloom Home</button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
