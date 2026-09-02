import { motion } from 'framer-motion'
import {
  approveFoundationSeasonLesson,
  getFoundationSeasonView,
} from '../utils/wonderWhy.js'
import { FOUNDATION_SEASON_WEEKS } from '../data/foundationSeasonCurriculum.js'
import { trackEvent } from '../utils/analytics.js'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default function FoundationSeasonSummary({
  progress = {},
  profileName = 'Your child',
  onUpdateProgress,
}) {
  const season = getFoundationSeasonView(progress)
  const recentConversations = season.lessons
    .map(lesson => ({
      lesson,
      discovery: progress.wonderWhy?.discoveries?.[lesson.id],
    }))
    .filter(({ discovery }) => discovery?.completedAt >= Date.now() - WEEK_MS)
    .sort((left, right) => right.discovery.completedAt - left.discovery.completedAt)
    .slice(0, 4)

  const approve = lesson => {
    const wonderWhy = approveFoundationSeasonLesson(progress.wonderWhy, lesson.id, true)
    onUpdateProgress?.({ wonderWhy })
    trackEvent('foundation_season_preview_approved', {
      lesson_id: lesson.id,
      category: lesson.reviewCategory,
    })
  }

  return (
    <section className="mx-4 mb-4 overflow-hidden rounded-lg border border-[#d9cce5] bg-white shadow" data-testid="foundation-season-summary">
      <div className="bg-[#30243a] p-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-[#d8baf0]">Four-week foundation season</p>
            <h2 className="mt-1 font-bubble text-2xl">Foundations of Everything</h2>
            <p className="mt-1 font-round text-xs font-bold leading-relaxed text-white/70">
              {season.complete
                ? `${profileName} completed all 28 connected discoveries.`
                : `${season.completed} of ${season.total} discoveries · Week ${season.currentWeek.weekNumber}: ${season.currentWeek.title}`}
            </p>
          </div>
          <div className="shrink-0 text-center">
            <span className="block text-4xl">{season.complete ? season.artifact.emoji : '🧭'}</span>
            <span className="font-round text-[10px] font-black text-white/70">{season.progressPercent}%</span>
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${season.progressPercent}%` }}
            className="h-full rounded-full bg-[#62d5ad]"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 border-b border-[#e6dfea]">
        {FOUNDATION_SEASON_WEEKS.map((week, index) => {
          const completed = week.lessonIds.filter(id => progress.wonderWhy?.discoveries?.[id]).length
          const active = index === season.currentWeek.weekIndex && !season.complete
          return (
            <div key={week.id} className="px-2 py-3 text-center" style={{ background: active ? `${week.colour}12` : 'white' }}>
              <p className="font-round text-[9px] font-black uppercase text-[#77647f]">Week {index + 1}</p>
              <p className="mt-1 font-bubble text-lg" style={{ color: week.colour }}>{completed}/7</p>
            </div>
          )
        })}
      </div>

      <div className="p-4">
        {season.complete ? (
          <div className="flex items-center gap-3">
            <span className="text-5xl">{season.artifact.emoji}</span>
            <div>
              <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#6d3db0]">Permanent season artifact</p>
              <h3 className="font-bubble text-xl text-[#30243a]">{season.artifact.name}</h3>
              <p className="mt-1 font-round text-xs font-bold text-[#74647d]">{season.artifact.message}</p>
            </div>
          </div>
        ) : (
          <>
            <p className="font-round text-[10px] font-black uppercase tracking-[.14em]" style={{ color: season.currentWeek.colour }}>
              Next connected question
            </p>
            <h3 className="mt-1 font-bubble text-xl leading-tight text-[#30243a]">{season.currentLesson.shortQuestion}</h3>
            <p className="mt-2 font-round text-xs font-bold text-[#74647d]">
              {season.weekCompleted}/7 this week · {season.familyMissionsCompleted}/{season.familyMissionsTotal} family missions complete
            </p>
          </>
        )}

        {recentConversations.length > 0 && (
          <div className="mt-4 border-t border-[#e6dfea] pt-4" data-testid="foundation-weekly-conversations">
            <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#26755b]">
              This week's conversations
            </p>
            <div className="mt-2 grid gap-3">
              {recentConversations.map(({ lesson }) => (
                <div key={lesson.id} className="flex gap-3">
                  <span className="text-2xl" aria-hidden="true">{lesson.visual}</span>
                  <div>
                    <p className="font-round text-xs font-black text-[#30243a]">{lesson.shortQuestion}</p>
                    <p className="mt-0.5 font-round text-[11px] font-bold leading-relaxed text-[#74647d]">
                      Ask together: {lesson.parentQuestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {season.heldLessons.length > 0 && (
          <div className="mt-4 border-t border-[#e6dfea] pt-4" data-testid="foundation-review-queue">
            <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#9b4c35]">Waiting for your preview</p>
            <p className="mt-1 font-round text-xs font-bold leading-relaxed text-[#74647d]">
              These roots, culture, or faith-related lessons will not be assigned until you approve them.
            </p>
            <div className="mt-3 grid gap-2">
              {season.heldLessons.map(lesson => (
                <div key={lesson.id} className="flex items-center gap-3 border-t border-[#eee8f1] py-2 first:border-0">
                  <span className="text-2xl">{lesson.visual}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-round text-xs font-black text-[#30243a]">{lesson.shortQuestion}</p>
                    <p className="font-round text-[10px] font-bold uppercase text-[#8a768f]">{lesson.reviewCategory}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => approve(lesson)}
                    className="min-h-10 shrink-0 rounded-md bg-[#6d3db0] px-3 font-round text-xs font-black text-white"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
