import { motion } from 'framer-motion'
import { getFoundationSeasonMapState, normalizeWonderWhy } from '../utils/wonderWhy.js'
import { getAgeFoundationLesson } from '../data/foundationAdventureAges.js'

export default function WonderOfDay({ progress = {}, ageGroup = 'early', onOpen }) {
  const book = normalizeWonderWhy(progress.wonderWhy)
  const season = getFoundationSeasonMapState(progress)
  const lesson = getAgeFoundationLesson(season.currentLesson, ageGroup)
  const completedCount = season.completed
  const isSaved = Boolean(book.discoveries[lesson.id])
  const display = season.complete
    ? {
        visual: season.artifact.emoji,
        accent: '#6d3db0',
        surface: '#f5efff',
        shortQuestion: season.artifact.name,
      }
    : lesson

  return (
    <section className="mx-auto mt-4 w-full max-w-7xl px-3 sm:px-5" data-testid="wonder-of-day">
      <motion.button
        type="button"
        onClick={onOpen}
        whileTap={{ scale: 0.985 }}
        className="grid w-full overflow-hidden rounded-lg border-2 text-left shadow-[0_10px_26px_rgba(48,36,58,.14)] sm:grid-cols-[180px_1fr_auto]"
        style={{ borderColor: display.accent, background: display.surface || '#f5fff7' }}
      >
        {display.image ? (
          <img src={display.image} alt="" className="h-28 w-full object-cover sm:h-full" />
        ) : (
          <span
            className="grid h-28 w-full place-items-center text-6xl text-white sm:h-full"
            style={{ background: display.accent }}
            aria-hidden="true"
          >
            {display.visual}
          </span>
        )}
        <span className="flex min-w-0 flex-col justify-center px-4 py-3">
          <span className="font-round text-[11px] font-black uppercase tracking-[.16em]" style={{ color: display.accent }}>
            {season.complete
              ? 'Season complete · 28 discoveries'
              : `${lesson.modeLabel || 'Foundation adventure'} · Week ${season.currentWeek.weekNumber}: ${season.currentWeek.title} · Day ${season.currentWeek.dayNumber} of 7`}
          </span>
          <span className="mt-1 font-bubble text-xl leading-tight text-[#173b2b] sm:text-2xl">
            {display.shortQuestion}
          </span>
          <span className="mt-1 font-round text-sm font-bold text-[#456756]">
            {season.complete
              ? season.artifact.message
              : season.completedToday
                ? `Tomorrow: ${season.nextLesson?.shortQuestion || 'a new question'}`
              : lesson.familyMission
                ? 'Weekend family mission: investigate, make, and talk together.'
                : `${completedCount} discoveries saved · ${season.progressPercent}% of the season`}
          </span>
        </span>
        <span className="m-3 self-center rounded-lg px-4 py-3 text-center font-round text-sm font-black text-white" style={{ background: display.accent }}>
          {season.complete ? 'View map' : season.completedToday ? 'View map' : isSaved ? 'Open again' : lesson.familyMission ? 'Start mission' : 'Start'}
        </span>
      </motion.button>
    </section>
  )
}
