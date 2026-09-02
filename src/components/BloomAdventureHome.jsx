import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import YaagviCharacter from './YaagviCharacter.jsx'
import { useSpeech } from '../hooks/useSpeech.js'
import { getDailyJourneyWeek, getUnifiedDailyJourneyState } from '../utils/dailyJourney.js'
import {
  chooseWeeklyBloomPath,
  getWeeklyBloomAdventureView,
  launchWeeklyBloomChapter,
  normalizeWeeklyBloomAdventure,
} from '../utils/weeklyBloomAdventure.js'
import { getFoundationSeasonMapState } from '../utils/wonderWhy.js'
import { getAgeFoundationLesson } from '../data/foundationAdventureAges.js'
import { formatLocalDate } from '../utils/date.js'
import { trackEvent, trackEventOnce } from '../utils/analytics.js'
import { recordActivationTelemetry, recordJourneyTelemetry } from '../utils/retentionTelemetry.js'
import { hasCompletedFirstMission } from '../utils/returnReminder.js'
import { getStarterPathState } from '../utils/starterPath.js'

const PALETTES = {
  toddler: { ink: '#421a0c', accent: '#d93670', warm: '#e85d20', surface: '#fff3d7', night: '#552344' },
  early: { ink: '#321348', accent: '#6931a8', warm: '#d9446d', surface: '#f6ecff', night: '#32154b' },
  junior: { ink: '#28150d', accent: '#78351f', warm: '#8c355f', surface: '#f5e8cc', night: '#2b1937' },
}

function WeekRhythm({ week }) {
  return (
    <div className="flex gap-1.5" aria-label={`${week.activeDays} active days in the last seven`}>
      {week.days.map(day => (
        <span key={day.key} className="text-center">
          <span className={`grid h-7 w-7 place-items-center rounded-md border font-round text-[10px] font-black ${
            day.played
              ? 'border-emerald-300 bg-emerald-300 text-emerald-950'
              : day.today
                ? 'border-amber-300 text-amber-200'
                : 'border-white/20 text-white/45'
          }`}>
            {day.played ? '✓' : day.label}
          </span>
        </span>
      ))}
    </div>
  )
}

function JourneyStop({ icon, label, note, state, active }) {
  const done = state === 'done'
  return (
    <div className="min-w-0 text-center" data-state={state}>
      <span className={`mx-auto grid h-10 w-10 place-items-center rounded-full border-2 text-lg ${
        done
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : active
            ? 'border-amber-300 bg-amber-100 text-[#43200d] shadow-[0_0_0_4px_rgba(253,211,77,.2)]'
            : 'border-white/20 bg-white/10 text-white/55'
      }`}>
        {done ? '✓' : icon}
      </span>
      <p className={`mt-1 truncate font-round text-[10px] font-black ${active || done ? 'text-white' : 'text-white/50'}`}>{label}</p>
      <p className="truncate font-round text-[9px] text-white/45">{note}</p>
    </div>
  )
}

export default function BloomAdventureHome({
  ageGroup = 'early',
  profileName = 'Explorer',
  progress = {},
  dailyNext,
  dailySteps = [],
  dailyDone = 0,
  dailyRequired = 2,
  dailyClaimed = false,
  treasureCount = 0,
  libraryOpen = false,
  onNavigate,
  onClaimTreasure,
  onToggleLibrary,
  onOpenWorld,
  onOpenWonder,
  onOpenTreasureRoom,
  onUpdateProgress,
}) {
  const age = PALETTES[ageGroup] ? ageGroup : 'early'
  const palette = PALETTES[age]
  const { speak, speaking } = useSpeech()
  const fallbackSteps = dailyNext
    ? [{ module: dailyNext, done: dailyDone > 0 }]
    : []
  const steps = dailySteps.length ? dailySteps.slice(0, dailyRequired) : fallbackSteps
  const weekly = useMemo(() => getWeeklyBloomAdventureView(progress, age), [age, progress])
  const season = useMemo(() => getFoundationSeasonMapState(progress), [progress])
  const wonder = useMemo(
    () => season.complete ? null : getAgeFoundationLesson(season.currentLesson, age),
    [age, season],
  )
  const week = useMemo(() => getDailyJourneyWeek(progress), [progress])
  const journey = getUnifiedDailyJourneyState({
    steps,
    doneCount: dailyDone,
    required: dailyRequired,
    claimed: dailyClaimed,
    weeklyStatus: weekly.status,
    wonderCompleted: season.completedToday || season.complete,
  })
  const firstMission = !hasCompletedFirstMission(progress)
  const starterPath = getStarterPathState(progress, age, steps.map(step => step.module).filter(Boolean))
  const firstModule = starterPath.module || journey.learning.nextStep?.module || steps[0]?.module || dailyNext

  useEffect(() => {
    if (!onUpdateProgress) return
    const saved = normalizeWeeklyBloomAdventure(progress.weeklyBloomAdventure, age)
    if (JSON.stringify(saved) === JSON.stringify(weekly.state)) return
    onUpdateProgress({ weeklyBloomAdventure: weekly.state })
  }, [age, onUpdateProgress, progress.weeklyBloomAdventure, weekly.state])

  useEffect(() => {
    trackEventOnce(`daily-journey-view:${age}:${formatLocalDate()}`, 'daily_journey_view', {
      age_group: age,
      learning_done: journey.learning.completed,
      learning_required: dailyRequired,
      weekly_status: weekly.status,
      wonder_complete: season.completedToday,
    }, 'local')
  }, [age, dailyRequired, journey.learning.completed, season.completedToday, weekly.status])

  useEffect(() => {
    if (!firstMission || !onUpdateProgress) return
    const nextTelemetry = recordActivationTelemetry(progress.retentionTelemetry, {
      type: 'activation_dashboard_view',
      date: formatLocalDate(),
      at: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    })
    if (JSON.stringify(nextTelemetry) !== JSON.stringify(progress.retentionTelemetry)) {
      onUpdateProgress({ retentionTelemetry: nextTelemetry })
      trackEvent('activation_dashboard_view', { age_group: age })
    }
  }, [age, firstMission, onUpdateProgress, progress.retentionTelemetry])

  useEffect(() => {
    if (!journey.complete) return
    trackEventOnce(`daily-journey-complete:${age}:${formatLocalDate()}`, 'daily_journey_complete', {
      age_group: age,
      active_days_7: week.activeDays,
    }, 'local')
    if (!onUpdateProgress) return
    const nextTelemetry = recordJourneyTelemetry(progress.retentionTelemetry, {
      type: 'journey_complete',
      date: formatLocalDate(),
      at: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      oncePerDay: true,
    })
    if (JSON.stringify(nextTelemetry) !== JSON.stringify(progress.retentionTelemetry)) {
      onUpdateProgress({ retentionTelemetry: nextTelemetry })
    }
  }, [age, journey.complete, onUpdateProgress, progress.retentionTelemetry, week.activeDays])

  const chapter = weekly.chapter
  const selectedChoice = chapter ? weekly.state.choices[weekly.state.chapter] : ''
  const currentLearning = journey.learning.nextStep?.module || dailyNext
  const primaryTitle = journey.primary.type === 'weekly'
    ? weekly.status === 'active' ? chapter?.title : `Chapter ${weekly.state.chapter + 1}: ${chapter?.title}`
    : journey.primary.type === 'learning'
      ? currentLearning?.label || 'Today\'s learning'
      : journey.primary.type === 'treasure'
        ? 'Your treasure is ready'
        : journey.primary.type === 'wonder'
          ? wonder?.shortQuestion || 'Today\'s Wonder'
          : 'Choose your next adventure'
  const primaryDescription = journey.primary.type === 'weekly'
    ? chapter?.story
    : journey.primary.type === 'learning'
      ? `${journey.learning.completed} of ${dailyRequired} learning stops complete.`
      : journey.primary.type === 'treasure'
        ? 'Both learning stops are complete. Open the reward you earned.'
        : journey.primary.type === 'wonder'
          ? 'A short question to investigate, explain, and discuss together.'
          : 'Today\'s core journey is complete. Extra activities stay open.'
  const primaryIcon = journey.primary.type === 'weekly'
    ? chapter?.module?.emoji || '📖'
    : journey.primary.type === 'learning'
      ? currentLearning?.emoji || '⭐'
      : journey.primary.type === 'treasure'
        ? '🎁'
        : journey.primary.type === 'wonder'
          ? wonder?.visual || '💡'
          : '🧭'

  const choosePath = choiceId => {
    const state = chooseWeeklyBloomPath({ ...progress, weeklyBloomAdventure: weekly.state }, age, choiceId)
    trackEvent('daily_journey_story_choice', {
      age_group: age,
      chapter: weekly.state.chapter + 1,
      choice_id: choiceId,
    })
    onUpdateProgress?.({ weeklyBloomAdventure: state })
  }

  const startWeekly = () => {
    if (weekly.needsChoice || weekly.waiting || weekly.complete || !chapter) return
    const state = launchWeeklyBloomChapter({ ...progress, weeklyBloomAdventure: weekly.state }, age)
    onUpdateProgress?.({ weeklyBloomAdventure: state })
    trackEvent('daily_journey_step_start', {
      age_group: age,
      step_type: 'weekly',
      module: state.active?.moduleId || chapter.module.id,
    })
    onNavigate?.(state.active?.moduleId || chapter.module.id, 'daily-journey')
  }

  const runPrimary = () => {
    trackEvent('daily_journey_primary_tap', {
      age_group: age,
      action: journey.primary.type,
      learning_done: journey.learning.completed,
    })
    onUpdateProgress?.({
      retentionTelemetry: recordJourneyTelemetry(progress.retentionTelemetry, {
        type: 'journey_action',
        date: formatLocalDate(),
        action: journey.primary.type,
        module: journey.primary.moduleId || currentLearning?.id || chapter?.module?.id || '',
        at: Date.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      }),
    })
    if (journey.primary.type === 'weekly') startWeekly()
    else if (journey.primary.type === 'learning') onNavigate?.(journey.primary.moduleId || currentLearning?.id, 'daily-journey')
    else if (journey.primary.type === 'treasure') onClaimTreasure?.()
    else if (journey.primary.type === 'wonder') onOpenWonder?.()
    else onToggleLibrary?.()
  }

  const runStarterMission = () => {
    const moduleId = firstModule?.id
    if (!moduleId) return
    const now = Date.now()
    const shared = {
      date: formatLocalDate(),
      module: moduleId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    }
    let telemetry = progress.retentionTelemetry
    if (firstMission) {
      telemetry = recordActivationTelemetry(telemetry, {
        ...shared,
        type: 'activation_primary_tap',
        at: now,
      })
      telemetry = recordActivationTelemetry(telemetry, {
        ...shared,
        type: 'activation_activity_started',
        at: now + 1,
      })
    } else {
      telemetry = recordJourneyTelemetry(telemetry, {
        type: 'starter_path_action',
        date: shared.date,
        action: `step_${starterPath.step}`,
        module: moduleId,
        at: now,
        timezone: shared.timezone,
      })
    }
    onUpdateProgress?.({ retentionTelemetry: telemetry })
    if (firstMission) {
      trackEvent('activation_primary_tap', { age_group: age, module: moduleId })
      trackEvent('activation_activity_started', { age_group: age, module: moduleId })
    }
    trackEvent('starter_path_primary_tap', { age_group: age, module: moduleId, step: starterPath.step })
    onNavigate?.(moduleId, firstMission ? 'first-mission' : 'starter-path')
  }

  const narration = `${profileName}, your next step is ${primaryTitle}. ${primaryDescription || ''}`
  const weeklyDoneToday = weekly.waiting || weekly.state.lastCompletedDate === formatLocalDate()
  const learningDone = journey.learning.completed >= dailyRequired
  const wonderDone = season.completedToday || season.complete
  const activeType = journey.primary.type

  if (starterPath.active) {
    const firstTitle = firstModule?.label || 'Your first adventure'
    const firstIcon = firstModule?.emoji || '⭐'
    const firstNarration = `${profileName}, starter step ${starterPath.step} is ${firstTitle}. It is one short activity, and I will help you.`
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-5" data-testid={`adventure-home-${age}`}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-lg border-2 shadow-[0_18px_45px_rgba(49,26,18,.2)]"
          style={{ borderColor: palette.accent, background: palette.surface }}
        >
          <div className="grid items-center gap-5 p-5 text-white sm:p-7 md:grid-cols-[1fr_220px]" style={{ background: palette.night }}>
            <div className="min-w-0">
              <p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-amber-200">{firstMission ? 'Your first Bloom adventure' : 'Your Bloom starter path'}</p>
              <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl">{profileName}, {firstMission ? 'let\'s begin' : 'your next step is ready'}</h2>
              <p className="mt-2 max-w-xl font-round text-sm font-bold leading-6 text-white/75">One short activity. Continue from where you stopped, with no penalty for a missed day.</p>
              <div className="mt-4 flex gap-1.5" data-testid="starter-path-progress" aria-label={`${starterPath.completed} of ${starterPath.total} starter steps complete`}>
                {starterPath.steps.map(item => (
                  <span
                    key={item.number}
                    className={`grid h-8 w-8 place-items-center rounded-md border-2 font-round text-xs font-black ${item.state === 'done' ? 'border-emerald-300 bg-emerald-300 text-emerald-950' : item.state === 'active' ? 'border-amber-300 bg-amber-100 text-[#43200d]' : 'border-white/20 bg-white/10 text-white/45'}`}
                  >
                    {item.state === 'done' ? '✓' : item.number}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden h-44 justify-center md:flex">
              <YaagviCharacter state="point" size="100%" imageClassName="drop-shadow-2xl" />
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg text-4xl text-white shadow-md" style={{ background: palette.accent }}>{firstIcon}</span>
              <div className="min-w-0">
                <p className="font-round text-[10px] font-black uppercase tracking-[.16em]" style={{ color: palette.warm }}>Starter step {starterPath.step} of {starterPath.total}</p>
                <h3 className="mt-1 font-bubble text-2xl leading-tight" style={{ color: palette.ink }}>{firstTitle}</h3>
                <p className="mt-1 font-round text-sm font-bold opacity-70" style={{ color: palette.ink }}>
                  {firstMission ? 'Finish one activity to earn the first Bloom Coin.' : 'Finish this activity to move one step forward.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:w-80">
              <button
                type="button"
                onClick={() => speak(firstNarration)}
                aria-label={speaking ? 'Yaagvi is speaking' : 'Hear the first step'}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border-2 bg-white text-xl"
                style={{ borderColor: `${palette.accent}55`, color: palette.accent }}
              >
                {speaking ? '⏸' : '🔊'}
              </button>
              <motion.button
                data-testid={firstMission ? 'first-mission-primary' : 'starter-path-primary'}
                whileTap={{ scale: .97 }}
                type="button"
                onClick={runStarterMission}
                className="min-h-14 min-w-0 flex-1 rounded-lg px-4 font-bubble text-lg text-white shadow-lg"
                style={{ background: palette.accent }}
              >
                {firstMission ? 'Start' : 'Continue'} {firstTitle}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-5" data-testid={`adventure-home-${age}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-lg border-2 shadow-[0_14px_35px_rgba(49,26,18,.18)]"
        style={{ borderColor: palette.accent, background: palette.surface }}
      >
        <div className="grid gap-5 p-4 text-white sm:p-5 lg:grid-cols-[1fr_250px]" style={{ background: palette.night }}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-amber-200">Today&apos;s learning journey</p>
                <h2 className="mt-1 font-bubble text-2xl leading-tight sm:text-3xl">{profileName}, one step at a time</h2>
                <p className="mt-1 font-round text-xs font-bold text-white/65">No penalty for a missed day. Continue from where you stopped.</p>
              </div>
              <div>
                <WeekRhythm week={week} />
                <p className="mt-1 text-right font-round text-[10px] font-bold text-white/45">{week.activeDays} active day{week.activeDays === 1 ? '' : 's'} this week</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <JourneyStop icon="📖" label="Chapter" note={`${weekly.completed}/${weekly.total}`} state={weeklyDoneToday || weekly.complete ? 'done' : 'waiting'} active={activeType === 'weekly'} />
              <JourneyStop icon="⭐" label="Learn" note={`${journey.learning.completed}/${dailyRequired}`} state={learningDone ? 'done' : 'waiting'} active={activeType === 'learning'} />
              <JourneyStop icon="💡" label="Wonder" note={wonderDone ? 'explored' : 'bonus'} state={wonderDone ? 'done' : 'waiting'} active={activeType === 'wonder'} />
              <JourneyStop icon="🎁" label="Treasure" note={dailyClaimed ? 'opened' : 'waiting'} state={dailyClaimed ? 'done' : 'waiting'} active={activeType === 'treasure'} />
            </div>
          </div>

          <div className="hidden items-end justify-center lg:flex">
            <div className="relative h-44 w-40">
              <YaagviCharacter state={journey.complete ? 'celebrate' : 'point'} size="100%" className="absolute inset-0" imageClassName="drop-shadow-2xl" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg text-3xl text-white shadow-md" style={{ background: palette.accent }}>{primaryIcon}</span>
            <div className="min-w-0">
              <p className="font-round text-[10px] font-black uppercase tracking-[.16em]" style={{ color: palette.warm }}>Next step</p>
              <h3 className="mt-1 font-bubble text-xl leading-tight sm:text-2xl" style={{ color: palette.ink }}>{primaryTitle}</h3>
              <p className="mt-1 font-round text-sm font-bold leading-5 opacity-70" style={{ color: palette.ink }}>{primaryDescription}</p>
              {journey.primary.type === 'weekly' && weekly.memory && (
                <p className="mt-2 border-l-2 pl-3 font-round text-xs font-bold opacity-60" style={{ borderColor: palette.warm, color: palette.ink }}>{weekly.memory}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 lg:w-72">
            <button
              type="button"
              onClick={() => speak(narration)}
              aria-label={speaking ? 'Yaagvi is speaking' : 'Hear the next step'}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border-2 bg-white text-xl"
              style={{ borderColor: `${palette.accent}55`, color: palette.accent }}
            >
              {speaking ? '⏸' : '🔊'}
            </button>
            <motion.button
              data-testid="daily-journey-primary"
              whileTap={{ scale: .97 }}
              type="button"
              disabled={weekly.needsChoice && journey.primary.type === 'weekly'}
              onClick={runPrimary}
              className="min-h-14 min-w-0 flex-1 rounded-lg px-4 font-bubble text-base text-white shadow-lg disabled:opacity-45"
              style={{ background: palette.accent }}
            >
              {journey.primary.label} →
            </motion.button>
          </div>
        </div>

        {weekly.needsChoice && chapter?.choice && (
          <div className="border-t p-4 sm:p-5" style={{ borderColor: `${palette.accent}25` }}>
            <p className="font-round text-xs font-black" style={{ color: palette.ink }}>{chapter.choice.prompt}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {chapter.choice.options.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choosePath(option.id)}
                  className="min-h-12 rounded-lg border-2 bg-white px-3 font-round text-sm font-black"
                  style={{ color: palette.ink, borderColor: selectedChoice === option.id ? palette.accent : `${palette.accent}30` }}
                >
                  <span className="mr-2 text-lg">{option.emoji}</span>{option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid border-t sm:grid-cols-[1fr_auto_auto]" style={{ borderColor: `${palette.accent}25` }}>
          <button type="button" onClick={onOpenWonder} className="min-h-14 px-4 text-left font-round text-xs font-black" style={{ color: palette.ink }}>
            <span className="mr-2 text-lg">{wonder?.visual || '💡'}</span>
            {wonderDone ? 'Wonder explored today' : wonder?.shortQuestion || 'Explore today\'s Wonder'}
          </button>
          <button type="button" onClick={onOpenTreasureRoom || onOpenWorld} className="min-h-14 border-t px-5 font-round text-xs font-black sm:border-l sm:border-t-0" style={{ color: palette.ink, borderColor: `${palette.accent}25` }}>🎁 {treasureCount} treasures</button>
          <button type="button" onClick={onToggleLibrary} aria-expanded={libraryOpen} className="min-h-14 border-t px-5 font-round text-xs font-black sm:border-l sm:border-t-0" style={{ color: palette.accent, borderColor: `${palette.accent}25` }}>{libraryOpen ? 'Close activities ↑' : 'All activities ↓'}</button>
        </div>
      </motion.div>
    </section>
  )
}
