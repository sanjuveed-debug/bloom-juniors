import React, { useMemo } from 'react'
import { getDailyJourneyWeek } from '../utils/dailyJourney.js'
import { formatLocalDate } from '../utils/date.js'
import { getFoundationDailyPath } from '../utils/foundationRecommendations.js'
import { getWeeklyBloomAdventureView } from '../utils/weeklyBloomAdventure.js'
import { getFoundationSeasonMapState } from '../utils/wonderWhy.js'
import { getAgeFoundationLesson } from '../data/foundationAdventureAges.js'
import { getStarterPathState } from '../utils/starterPath.js'

export default function DailyJourneyParentSummary({
  progress = {},
  profileName = 'Your child',
  ageGroup = 'early',
  now = Date.now(),
}) {
  const view = useMemo(() => {
    const date = formatLocalDate(new Date(now))
    const path = getFoundationDailyPath(progress, ageGroup, { date })
    const completedIds = new Set(
      (progress.sessions || [])
        .filter(session => Number(session?.date) > 0 && formatLocalDate(new Date(session.date)) === date)
        .map(session => session.module),
    )
    const assignments = path.modules.slice(0, 2)
    const completed = assignments.filter(module => completedIds.has(module.id)).length
    const week = getDailyJourneyWeek(progress, now)
    const weekly = getWeeklyBloomAdventureView(progress, ageGroup, now)
    const season = getFoundationSeasonMapState(progress, date)
    const wonder = season.complete ? null : getAgeFoundationLesson(season.currentLesson, ageGroup)
    return { assignments, completed, week, weekly, season, wonder }
  }, [ageGroup, now, progress])

  const starter = getStarterPathState(progress, ageGroup)
  if (starter.active) return (
    <section className="mx-4 mb-4 overflow-hidden rounded-lg border border-emerald-900/15 bg-white shadow-sm" data-testid="parent-daily-journey">
      <div className="bg-[#123f36] p-4 text-white">
        <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-emerald-200">Today&apos;s journey</p>
        <h2 className="mt-1 font-bubble text-xl">{profileName}&apos;s next starter step</h2>
        <p className="mt-1 font-round text-sm text-white/80">{starter.completed} of {starter.total} activities completed. One short activity is enough for this visit.</p>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <div>
          <p className="font-round text-xs font-black uppercase text-slate-500">Next together</p>
          <h3 className="mt-1 font-bubble text-lg text-slate-900">{starter.module?.label}</h3>
          <p className="mt-1 font-round text-sm text-slate-700">{starter.learning}</p>
        </div>
        <div>
          <p className="font-round text-xs font-black uppercase text-slate-500">Talk together</p>
          <p className="mt-1 font-round text-sm font-bold text-slate-800">{starter.parentPrompt}</p>
          <p className="mt-2 font-round text-xs text-slate-600">Completed steps stay saved. Missing a day never removes progress.</p>
        </div>
      </div>
    </section>
  )

  const status = view.completed >= view.assignments.length && view.assignments.length
    ? 'Learning complete'
    : view.completed
      ? 'Journey underway'
      : 'Ready to begin'

  return (
    <section className="mx-4 mb-4 overflow-hidden rounded-lg border border-emerald-900/15 bg-white shadow-sm" data-testid="parent-daily-journey">
      <div className="grid gap-4 bg-[#123f36] p-4 text-white sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-emerald-200">Today&apos;s journey</p>
          <h2 className="mt-1 font-bubble text-xl">{status} for {profileName}</h2>
          <p className="mt-1 font-round text-xs font-bold text-white/70">
            {view.completed}/{view.assignments.length || 2} learning stops · {view.season.completedToday ? 'Wonder explored' : 'Wonder still available'}
          </p>
        </div>
        <div className="flex gap-1.5" aria-label={`${view.week.activeDays} active days in the last seven`}>
          {view.week.days.map(day => (
            <span key={day.key} className="text-center">
              <span className={`grid h-7 w-7 place-items-center rounded-md border text-[10px] font-black ${day.played ? 'border-emerald-300 bg-emerald-300 text-emerald-950' : day.today ? 'border-amber-300 text-amber-200' : 'border-white/20 text-white/45'}`}>
                {day.played ? '✓' : day.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-4">
          <p className="font-round text-[10px] font-black uppercase tracking-wider text-slate-500">Learning stops</p>
          <p className="mt-1 font-bubble text-base text-slate-900">
            {view.assignments.map(module => module.label).join(' + ') || 'Two balanced activities'}
          </p>
        </div>
        <div className="p-4">
          <p className="font-round text-[10px] font-black uppercase tracking-wider text-slate-500">Seven-day story</p>
          <p className="mt-1 font-bubble text-base text-slate-900">{view.weekly.completed}/{view.weekly.total} chapters</p>
        </div>
        <div className="p-4">
          <p className="font-round text-[10px] font-black uppercase tracking-wider text-slate-500">Talk together</p>
          <p className="mt-1 font-round text-sm font-bold leading-5 text-slate-800">
            {view.wonder?.parentPrompt || 'Ask what felt easiest, what was tricky, and what your child wants to explore tomorrow.'}
          </p>
        </div>
      </div>
    </section>
  )
}
