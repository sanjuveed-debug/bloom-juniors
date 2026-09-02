import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAgeFoundationLesson } from '../data/foundationAdventureAges.js'
import { FOUNDATION_SEASON_WEEKS } from '../data/foundationSeasonCurriculum.js'
import {
  getFoundationSeasonMapState,
  normalizeWonderWhy,
} from '../utils/wonderWhy.js'
import { trackEvent } from '../utils/analytics.js'

const WORLD_VISUALS = ['🌍', '🧵', '🤝', '🛠️']

function LessonMarker({ lesson, dayNumber, saved, current, held, onOpen }) {
  const enabled = saved || current
  const label = saved
    ? `Replay day ${dayNumber}: ${lesson.shortQuestion}`
    : current
      ? `Start day ${dayNumber}: ${lesson.shortQuestion}`
      : held
        ? `Day ${dayNumber} waiting for grown-up preview`
        : `Day ${dayNumber} is not open yet`

  return (
    <motion.button
      type="button"
      whileTap={enabled ? { scale: 0.9 } : undefined}
      disabled={!enabled}
      onClick={() => onOpen(lesson.id)}
      aria-label={label}
      className="relative grid aspect-square w-full place-items-center rounded-full border-2 font-bubble text-sm shadow-sm disabled:cursor-default"
      style={{
        borderColor: saved || current ? lesson.accent : '#cfc9d3',
        background: saved ? lesson.accent : current ? '#fff' : '#eeeaf0',
        color: saved ? '#fff' : current ? lesson.accent : '#8b8290',
      }}
    >
      <span aria-hidden="true">{saved ? '✓' : held ? '🔒' : current ? lesson.visual : dayNumber}</span>
      {lesson.familyMission && (
        <span
          className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#ffd75b] text-[10px] text-[#573600] shadow"
          aria-hidden="true"
        >
          ★
        </span>
      )}
    </motion.button>
  )
}

export default function FoundationSeasonMap({
  progress = {},
  ageGroup = 'early',
  profileName = 'Explorer',
  onOpenLesson,
  onOpenBook,
  onBack,
}) {
  const book = normalizeWonderWhy(progress.wonderWhy)
  const season = getFoundationSeasonMapState(progress)
  const heldIds = new Set(season.heldLessons.map(lesson => lesson.id))
  const currentLesson = getAgeFoundationLesson(season.currentLesson, ageGroup)
  const nextLesson = season.nextLesson
    ? getAgeFoundationLesson(season.nextLesson, ageGroup)
    : null

  useEffect(() => {
    trackEvent('foundation_season_map_open', {
      completed: season.completed,
      status: season.complete
        ? 'complete'
        : season.completedToday
          ? 'return_tomorrow'
          : season.waitingForPreview
            ? 'parent_preview'
            : 'continue',
      age_group: ageGroup,
    })
  }, [ageGroup, season.complete, season.completed, season.completedToday, season.waitingForPreview])

  const continueToday = () => {
    if (!season.canContinue) return
    trackEvent('foundation_season_map_continue', {
      lesson_id: currentLesson.id,
      week: season.currentWeek.weekNumber,
      day: season.currentWeek.dayNumber,
      age_group: ageGroup,
    })
    onOpenLesson?.(currentLesson.id)
  }

  return (
    <main className="min-h-screen bg-[#f7f4f2] pb-28 text-[#30243a]" data-testid="foundation-season-map">
      <header className="bg-[#263239] px-3 pb-5 pt-safe text-white sm:px-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to dashboard"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-2xl"
            >
              ←
            </button>
            <div className="min-w-0 text-center">
              <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-[#7ee0ba]">
                Four-week foundation season
              </p>
              <h1 className="font-bubble text-2xl leading-tight sm:text-3xl">Foundations of Everything</h1>
            </div>
            <button
              type="button"
              onClick={onOpenBook}
              aria-label="Open Wonder Book"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-xl"
            >
              📖
            </button>
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-bubble text-lg">{profileName}'s question journey</p>
              <p className="font-round text-xs font-bold text-white/70">
                {season.completed} of {season.total} discoveries · {season.familyMissionsCompleted} family missions
              </p>
            </div>
            <span className="font-bubble text-xl text-[#7ee0ba]">{season.progressPercent}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${season.progressPercent}%` }}
              className="h-full rounded-full bg-[#62d5ad]"
            />
          </div>
        </div>
      </header>

      <section className="border-b border-[#ded7d2] bg-white px-3 py-5 sm:px-5" aria-live="polite">
        <div className="mx-auto grid max-w-6xl items-center gap-4 md:grid-cols-[1fr_auto]">
          {season.complete ? (
            <div className="flex items-center gap-4" data-testid="season-complete-state">
              <motion.span
                initial={{ rotate: -20, scale: 0.6 }}
                animate={{ rotate: 0, scale: 1 }}
                className="text-6xl"
              >
                {season.artifact.emoji}
              </motion.span>
              <div>
                <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#6d3db0]">Season complete</p>
                <h2 className="font-bubble text-3xl">{season.artifact.name}</h2>
                <p className="mt-1 max-w-xl font-round text-sm font-bold text-[#6f6473]">{season.artifact.message}</p>
              </div>
            </div>
          ) : season.completedToday ? (
            <div data-testid="season-tomorrow-state">
              <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#167a4a]">Today's discovery is saved</p>
              <h2 className="mt-1 font-bubble text-2xl">Come back tomorrow for a new question</h2>
              {nextLesson && (
                <p className="mt-2 font-round text-sm font-bold text-[#6f6473]">
                  Next clue: {nextLesson.shortQuestion}
                </p>
              )}
            </div>
          ) : season.waitingForPreview ? (
            <div data-testid="season-preview-state">
              <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#9b4c35]">Next discovery is being prepared</p>
              <h2 className="mt-1 font-bubble text-2xl">Ask your grown-up to open the next path</h2>
            </div>
          ) : (
            <div className="flex items-center gap-4" data-testid="season-today-state">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg text-4xl text-white" style={{ background: currentLesson.accent }}>
                {currentLesson.visual}
              </span>
              <div>
                <p className="font-round text-[10px] font-black uppercase tracking-[.14em]" style={{ color: currentLesson.accent }}>
                  Today's discovery · Week {season.currentWeek.weekNumber}, Day {season.currentWeek.dayNumber}
                </p>
                <h2 className="mt-1 font-bubble text-2xl leading-tight">{currentLesson.shortQuestion}</h2>
                {currentLesson.familyMission && (
                  <p className="mt-1 font-round text-xs font-black text-[#8a5a00]">★ Weekend family mission</p>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={season.complete ? onOpenBook : continueToday}
            disabled={!season.complete && !season.canContinue}
            className="hidden min-h-12 rounded-lg px-6 font-bubble text-base text-white shadow-md disabled:bg-[#aaa2ad] md:block"
            style={season.complete || season.canContinue ? { background: season.complete ? '#6d3db0' : currentLesson.accent } : undefined}
          >
            {season.complete ? 'Open my Wonder Book' : season.canContinue ? (currentLesson.familyMission ? 'Start family mission' : 'Continue today') : 'Today complete'}
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl">
        {FOUNDATION_SEASON_WEEKS.map((week, weekIndex) => {
          const weekLessons = week.lessonIds.map(id => season.lessons.find(lesson => lesson.id === id)).filter(Boolean)
          const completed = week.lessonIds.filter(id => book.discoveries[id]).length
          const weekComplete = completed === week.lessonIds.length
          const active = weekIndex === season.currentWeek.weekIndex && !season.complete

          return (
            <section
              key={week.id}
              className="border-b border-[#ded7d2] px-3 py-5 sm:px-5"
              style={{ background: active ? `${week.colour}0d` : '#f7f4f2' }}
              data-testid={`season-week-${weekIndex + 1}`}
            >
              <div className="grid gap-4 md:grid-cols-[240px_1fr] md:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg text-3xl text-white" style={{ background: week.colour }}>
                    {WORLD_VISUALS[weekIndex]}
                  </span>
                  <div>
                    <p className="font-round text-[10px] font-black uppercase tracking-[.14em]" style={{ color: week.colour }}>
                      Week {weekIndex + 1} · {completed}/7
                    </p>
                    <h2 className="font-bubble text-xl leading-tight">{week.title}</h2>
                    {weekComplete && (
                      <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mt-1 font-round text-xs font-black text-[#167a4a]">
                        ✨ Week complete
                      </motion.p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative grid grid-cols-7 gap-2">
                    <span className="absolute left-[5%] right-[5%] top-1/2 h-1 -translate-y-1/2 bg-[#d8d1d5]" aria-hidden="true" />
                    {weekLessons.map((lesson, dayIndex) => {
                      const saved = Boolean(book.discoveries[lesson.id])
                      const current = season.canContinue && lesson.id === season.currentLesson.id
                      return (
                        <div key={lesson.id} className="relative z-10">
                          <LessonMarker
                            lesson={lesson}
                            dayNumber={dayIndex + 1}
                            saved={saved}
                            current={current}
                            held={heldIds.has(lesson.id)}
                            onOpen={onOpenLesson}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 font-round text-xs font-bold leading-relaxed text-[#716773]">{week.question}</p>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#d8d1d5] bg-white/95 px-3 pb-safe pt-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <button type="button" onClick={onOpenBook} className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border-2 border-[#6d3db0] text-xl" aria-label="Open Wonder Book">
            📖
          </button>
          <button
            type="button"
            onClick={season.complete ? onOpenBook : continueToday}
            disabled={!season.complete && !season.canContinue}
            className="min-h-12 flex-1 rounded-lg px-4 font-bubble text-base text-white disabled:bg-[#aaa2ad]"
            style={season.complete || season.canContinue ? { background: season.complete ? '#6d3db0' : currentLesson.accent } : undefined}
          >
            {season.complete ? 'Open Wonder Book' : season.canContinue ? 'Continue today' : 'Come back tomorrow'}
          </button>
        </div>
      </div>
    </main>
  )
}
