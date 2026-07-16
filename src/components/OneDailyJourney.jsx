import React from 'react'
import { motion } from 'framer-motion'
import { getDailyJourneyState } from '../utils/dailyJourney.js'

export { getDailyJourneyState } from '../utils/dailyJourney.js'

const AGE_STYLES = {
  toddler: {
    eyebrow: "Yaagvi's little treasure hunt",
    title: name => `Ready, ${name || 'explorer'}?`,
    description: 'Play two tiny adventures. Then open a real treasure.',
    accent: '#ef476f',
    accentTwo: '#ff7a2f',
    ink: '#421a0c',
    soft: '#fff2d5',
  },
  early: {
    eyebrow: "Today's moon-egg mission",
    title: name => `${name || 'Explorer'}, your next clue is ready`,
    description: 'Finish two adventures to move the story and reveal your treasure.',
    accent: '#7a3bad',
    accentTwo: '#ec4899',
    ink: '#32113f',
    soft: '#f8e9ff',
  },
  junior: {
    eyebrow: "Today's expedition",
    title: name => `Agent ${name || 'Explorer'}, continue the trail`,
    description: 'Complete two focused missions. Recover today’s expedition treasure.',
    accent: '#7d321f',
    accentTwo: '#b86a2f',
    ink: '#2c160d',
    soft: '#fff1d5',
  },
}

export default function OneDailyJourney({
  ageGroup = 'early',
  profileName,
  steps = [],
  nextAdventure,
  doneCount,
  required = 2,
  claimed = false,
  treasureCount = 0,
  streak = 0,
  onPlayNext,
  onClaimTreasure,
  onOpenTreasureRoom,
  onOpenWorld,
  exploreOpen = false,
  onToggleExplore,
}) {
  const style = AGE_STYLES[ageGroup] || AGE_STYLES.early
  const journey = getDailyJourneyState({ steps, doneCount, required, claimed })
  const primaryAdventure = journey.phase === 'claimed' && nextAdventure ? nextAdventure : journey.nextStep?.module
  const nextLabel = primaryAdventure?.shortLabel || primaryAdventure?.label || 'fresh challenge'
  const primaryLabel = journey.phase === 'ready'
    ? 'OPEN MY TREASURE'
    : journey.phase === 'claimed'
      ? 'CONTINUE EXPLORING'
      : `CONTINUE: ${nextLabel}`
  const primaryAction = journey.phase === 'ready'
    ? onClaimTreasure
    : journey.phase === 'claimed'
      ? () => document.getElementById('never-finished-adventure')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      : onPlayNext

  return (
    <section data-testid={`daily-journey-${ageGroup}`} className="mx-auto mt-5 max-w-6xl px-4 md:px-6 xl:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] border-2 shadow-2xl"
        style={{ borderColor: `${style.accentTwo}70`, background: style.soft }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/treasure-map-bg.png)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fff8e9]/[.98] via-[#fff4df]/[.93] to-[#ffe5bb]/[.78]" aria-hidden="true" />

        <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_270px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-round text-xs font-black uppercase tracking-[.2em]" style={{ color: style.accent }}>{style.eyebrow}</p>
              {streak > 0 && <span className="rounded-full bg-white/80 px-2.5 py-1 font-round text-xs font-black text-[#8b3d20] shadow-sm">🔥 {streak} day streak</span>}
            </div>
            <h2 className="mt-1 max-w-3xl font-bubble text-3xl leading-tight sm:text-4xl" style={{ color: style.ink }}>
              {journey.phase === 'ready' ? 'Your golden key is ready!' : journey.phase === 'claimed' ? 'Treasure found—your adventure continues!' : style.title(profileName)}
            </h2>
            <p className="mt-2 max-w-2xl font-round text-sm font-bold sm:text-base" style={{ color: `${style.ink}b8` }}>{style.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {journey.steps.map((step, index) => {
                const active = journey.phase === 'playing' && step === journey.nextStep
                return (
                  <button
                    type="button"
                    key={step.module.id}
                    onClick={() => !step.done && active && onPlayNext?.()}
                    className="relative min-h-[105px] rounded-[22px] border-2 bg-white/90 p-4 text-left shadow-md transition-transform active:scale-[.98]"
                    style={{ borderColor: step.done ? '#48a86b' : active ? style.accent : 'rgba(118,76,42,.18)' }}
                  >
                    <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full font-bubble text-xs text-white" style={{ background: step.done ? '#3ba464' : active ? style.accent : '#bfae96' }}>{step.done ? '✓' : index + 1}</span>
                    <span className="text-4xl" aria-hidden="true">{step.done ? '✅' : step.module.emoji}</span>
                    <p className="mt-2 pr-8 font-bubble text-lg leading-tight" style={{ color: style.ink }}>{step.module.label}</p>
                    <p className="mt-1 font-round text-xs font-black uppercase tracking-wider" style={{ color: step.done ? '#278454' : active ? style.accent : '#9b8069' }}>{step.done ? 'Adventure complete' : active ? 'Play this next' : 'Waiting for you'}</p>
                  </button>
                )
              })}
            </div>

            <motion.button
              data-testid="daily-journey-primary"
              whileTap={{ scale: .97 }}
              onClick={primaryAction}
              disabled={!primaryAction}
              className="mt-5 min-h-16 w-full rounded-2xl px-5 font-bubble text-lg text-white shadow-xl disabled:opacity-50 sm:text-xl"
              style={{ background: `linear-gradient(100deg, ${style.accentTwo}, ${style.accent})` }}
            >
              {journey.phase === 'ready' ? '🗝️ ' : '▶ '}{primaryLabel} →
            </motion.button>
          </div>

          <div className="rounded-[28px] border-2 border-white/70 bg-[#3a1d27]/90 p-5 text-center text-white shadow-xl backdrop-blur-sm">
            <motion.div
              className="mx-auto grid h-28 w-28 place-items-center rounded-full border-4 border-[#ffe07c] bg-gradient-to-b from-[#fff5c3] to-[#ffc15a] text-6xl shadow-[0_0_30px_rgba(255,209,74,.55)]"
              animate={journey.phase === 'ready' ? { scale: [1, 1.08, 1], rotate: [-3, 3, -3] } : { y: [0, -5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              {journey.phase === 'claimed' ? '🎁' : journey.phase === 'ready' ? '🗝️' : '🧰'}
            </motion.div>
            <p className="mt-3 font-round text-[11px] font-black uppercase tracking-[.18em] text-[#ffd979]">Today’s treasure</p>
            <p className="mt-1 font-bubble text-xl">{journey.completed}/{required} adventures</p>
            <div className="mt-3 flex gap-2" aria-label={`${journey.completed} of ${required} adventures complete`}>
              {Array.from({ length: required }).map((_, index) => <span key={index} className={`h-3 flex-1 rounded-full ${index < journey.completed ? 'bg-[#ffd34f]' : 'bg-white/20'}`} />)}
            </div>
            <p className="mt-3 font-round text-xs font-bold text-white/70">{journey.phase === 'claimed' ? `${treasureCount} treasures now belong to you` : 'A collectible comes out when both are complete'}</p>
          </div>
        </div>

        <div className="relative grid border-t border-[#7b4c32]/15 bg-[#fffaf0]/90 sm:grid-cols-2">
          <button type="button" onClick={onOpenWorld || onOpenTreasureRoom} className="min-h-16 px-4 font-bubble text-sm text-[#35621f] hover:bg-white">🌍 My Living World <span className="font-round text-xs text-[#8a634d]">· {treasureCount} treasure{treasureCount === 1 ? '' : 's'}</span></button>
          <button type="button" onClick={onToggleExplore} aria-expanded={exploreOpen} className="min-h-16 border-t border-[#7b4c32]/10 px-4 font-bubble text-sm text-[#5b2a70] hover:bg-white sm:border-l sm:border-t-0">🗺️ {exploreOpen ? 'Hide extra games' : 'Explore more games'} {exploreOpen ? '↑' : '↓'}</button>
        </div>
      </motion.div>
    </section>
  )
}
