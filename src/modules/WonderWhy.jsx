import { useEffect, useState } from 'react'
import WonderWhyLeaves from './WonderWhyLeaves.jsx'
import WonderWhySunset from './WonderWhySunset.jsx'
import FoundationAdventure from './FoundationAdventure.jsx'
import FoundationSeasonMap from '../components/FoundationSeasonMap.jsx'
import { getAgeFoundationLesson } from '../data/foundationAdventureAges.js'
import { getFoundationSeasonWeekByLesson } from '../data/foundationSeasonCurriculum.js'
import { trackEvent } from '../utils/analytics.js'
import {
  getDailyFoundationAdventure,
  getFoundationSeasonView,
  LEAVES_GREEN_ID,
  normalizeWonderWhy,
  SUNSET_RED_ID,
  WONDER_LESSONS,
} from '../utils/wonderWhy.js'

function WonderBook({ progress, ageGroup = 'early', onChoose, onBack }) {
  const discoveries = normalizeWonderWhy(progress.wonderWhy).discoveries
  const season = getFoundationSeasonView(progress)

  return (
    <main className="min-h-screen bg-[#f7f3ff] px-3 py-5 text-[#2f1747] sm:px-5" data-testid="wonder-book">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center gap-4">
          <button type="button" onClick={onBack} aria-label="Back to dashboard" className="grid h-11 w-11 place-items-center rounded-full bg-white text-2xl font-black shadow-sm">←</button>
          <div>
            <p className="font-round text-xs font-black uppercase tracking-[.16em] text-[#7754a0]">My discoveries</p>
            <h1 className="font-bubble text-3xl">Wonder Book</h1>
          </div>
        </header>

        <p className="mt-6 font-round text-base font-bold text-[#6f5b80]">
          {season.complete
            ? `${season.artifact.emoji} ${season.artifact.name} earned. Every page began with one of your questions.`
            : `${season.completed} of ${season.total} discoveries saved across four connected weeks.`}
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#dfd5e8]">
          <div className="h-full rounded-full bg-[#6d3db0]" style={{ width: `${season.progressPercent}%` }} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {season.lessons.map((baseLesson, index) => {
            const lesson = getAgeFoundationLesson(baseLesson, ageGroup)
            const saved = discoveries[lesson.id]
            return (
              <button
                key={lesson.id}
                type="button"
                disabled={!saved}
                onClick={() => onChoose(lesson.id)}
                className="overflow-hidden rounded-lg border-2 bg-white text-left shadow-md disabled:opacity-45"
                style={{ borderColor: saved ? lesson.accent : '#cfc7d5' }}
              >
                {lesson.image ? (
                  <img src={lesson.image} alt="" className="aspect-video w-full object-cover" />
                ) : (
                  <span
                    className="grid aspect-video w-full place-items-center text-7xl text-white"
                    style={{ background: lesson.accent }}
                    aria-hidden="true"
                  >
                    {lesson.visual}
                  </span>
                )}
                <span className="block p-4">
                  <span className="font-round text-xs font-black uppercase tracking-[.14em]" style={{ color: saved ? lesson.accent : '#766d7d' }}>
                    Discovery {index + 1} {saved ? 'saved' : 'waiting'}
                  </span>
                  <span className="mt-1 block font-bubble text-2xl leading-tight">{lesson.shortQuestion}</span>
                  <span className="mt-2 block font-round text-sm font-bold text-[#71617c]">
                    {saved ? 'Open this page again' : 'Complete the earlier wonder first'}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default function WonderWhy(props) {
  const ageGroup = props.ageGroup || 'early'
  const [activeLesson, setActiveLesson] = useState('map')
  const activeMeta = getFoundationSeasonWeekByLesson(activeLesson)

  useEffect(() => {
    if (!activeMeta) return
    trackEvent('foundation_season_day_open', {
      lesson_id: activeLesson,
      week: activeMeta.weekNumber,
      day: activeMeta.dayNumber,
      age_group: ageGroup,
    })
  }, [activeLesson, ageGroup])

  const trackedProps = {
    ...props,
    onBack: () => setActiveLesson('map'),
    onAddStars: (module, stars, sessionData) => {
      if (activeMeta) {
        const completedLesson = WONDER_LESSONS.find(item => item.id === activeLesson)
        trackEvent('foundation_season_day_complete', {
          lesson_id: activeLesson,
          week: activeMeta.weekNumber,
          day: activeMeta.dayNumber,
          age_group: ageGroup,
          family_mission: Boolean(completedLesson?.familyMission),
        })
        if (activeMeta.dayNumber === 7) {
          trackEvent('foundation_season_week_complete', {
            week: activeMeta.weekNumber,
            age_group: ageGroup,
          })
        }
      }
      props.onAddStars?.(module, stars, sessionData)
    },
  }

  if (activeLesson === 'map') {
    return (
      <FoundationSeasonMap
        progress={props.progress}
        ageGroup={ageGroup}
        profileName={props.profileName}
        onOpenLesson={setActiveLesson}
        onOpenBook={() => setActiveLesson('book')}
        onBack={props.onBack}
      />
    )
  }
  if (ageGroup === 'early' && activeLesson === LEAVES_GREEN_ID) {
    return <WonderWhyLeaves {...trackedProps} />
  }
  if (ageGroup === 'early' && activeLesson === SUNSET_RED_ID) {
    return <WonderWhySunset {...trackedProps} />
  }
  const lesson = WONDER_LESSONS.find(item => item.id === activeLesson)
  if (lesson) {
    return <FoundationAdventure {...trackedProps} lesson={getAgeFoundationLesson(lesson, ageGroup)} ageGroup={ageGroup} />
  }
  return <WonderBook progress={props.progress} ageGroup={ageGroup} onChoose={setActiveLesson} onBack={() => setActiveLesson('map')} />
}
