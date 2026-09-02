import { getWeeklyBloomAdventureView } from './weeklyBloomAdventure.js'
import { isValidReturnTarget } from './returnDeepLink.js'
import { getFoundationSeasonMapState } from './wonderWhy.js'
import { getFoundationSeasonWeekByLesson } from '../data/foundationSeasonCurriculum.js'

const FALLBACK_MODULES = {
  toddler: [
    { id: 'alphabet', label: 'Letter Tree' },
    { id: 'numbers', label: 'Counting Falls' },
    { id: 'animals', label: 'Animal Jungle' },
  ],
  early: [
    { id: 'phonics', label: 'Sound Pop' },
    { id: 'math', label: 'Number World' },
    { id: 'story', label: 'Story Room' },
  ],
  junior: [
    { id: 'reading', label: 'Story Ruins' },
    { id: 'timestables', label: 'Number Castle' },
    { id: 'science', label: 'Science Lab' },
  ],
}

function cleanName(value) {
  return String(value || 'Your child').trim().slice(0, 40) || 'Your child'
}

function pickFallback(progress, ageGroup) {
  const modules = FALLBACK_MODULES[ageGroup] || FALLBACK_MODULES.early
  return [...modules].sort((left, right) => {
    const leftDate = String(progress[left.id]?.lastPlayedDate || '')
    const rightDate = String(progress[right.id]?.lastPlayedDate || '')
    if (leftDate !== rightDate) return leftDate.localeCompare(rightDate)
    return (Number(progress[left.id]?.played) || 0) - (Number(progress[right.id]?.played) || 0)
  })[0]
}

function variantIndex(seed, count) {
  const value = String(seed || '')
    .split('')
    .reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7)
  return value % count
}

export function buildPersonalizedReminder({ progress = {}, profile = {}, now = new Date() }) {
  const ageGroup = ['toddler', 'early', 'junior'].includes(profile.age_group)
    ? profile.age_group
    : 'early'
  const name = cleanName(profile.name)
  const foundation = getFoundationSeasonMapState(progress, now)
  const hasStartedFoundation = foundation.completed > 0 && !foundation.complete
  if (hasStartedFoundation && foundation.nextLesson) {
    const nextMeta = getFoundationSeasonWeekByLesson(foundation.nextLesson.id) || foundation.currentWeek
    return {
      title: `A new question is ready for ${name}`,
      body: `${foundation.nextLesson.shortQuestion} Continue Week ${nextMeta.weekNumber} in Bloom.`,
      target: 'wonderwhy',
      moduleLabel: 'Foundation Season',
      content: `foundation_${ageGroup}_week${nextMeta.weekNumber}_day${nextMeta.dayNumber}`,
      chapter: nextMeta.title,
    }
  }
  const weekly = getWeeklyBloomAdventureView(progress, ageGroup, now.getTime())
  const weeklyModule = weekly.chapter?.module
  const module = weeklyModule && isValidReturnTarget(ageGroup, weeklyModule.id)
    ? weeklyModule
    : pickFallback(progress, ageGroup)
  const hasChapter = Boolean(weekly.chapter && weeklyModule?.id === module.id)
  const seed = `${profile.id || name}:${now.toISOString().slice(0, 10)}:${module.id}`
  const variation = variantIndex(seed, 3)

  const copy = {
    toddler: [
      {
        title: `A tiny adventure is ready for ${name}`,
        body: `${module.label} has a new surprise to discover together.`,
      },
      {
        title: `${module.label} is ready`,
        body: `One little learning adventure is waiting for ${name}.`,
      },
      {
        title: `Yaagvi found something new`,
        body: `${name} can continue in ${module.label} when you are ready.`,
      },
    ],
    early: [
      {
        title: hasChapter ? `${weekly.chapter.title} is waiting` : `${module.label} is ready`,
        body: `${name} can continue the Bloom adventure in ${module.label}.`,
      },
      {
        title: `A new clue is ready for ${name}`,
        body: `Continue the adventure with one short ${module.label} activity.`,
      },
      {
        title: `${module.label} has the next clue`,
        body: `${name}'s Bloom adventure is ready to continue.`,
      },
    ],
    junior: [
      {
        title: hasChapter ? `New mission: ${weekly.chapter.title}` : `New mission in ${module.label}`,
        body: `${name} can continue the expedition in ${module.label}.`,
      },
      {
        title: `${module.label} mission ready`,
        body: `The next Bloom Beacon clue is ready for ${name}.`,
      },
      {
        title: `Expedition update for ${name}`,
        body: `Continue the next short challenge in ${module.label}.`,
      },
    ],
  }[ageGroup][variation]

  return {
    ...copy,
    target: module.id,
    moduleLabel: module.label,
    content: `${hasChapter ? 'weekly' : 'recommended'}_${ageGroup}_v${variation + 1}_${module.id}`,
    chapter: hasChapter ? weekly.chapter.title : '',
  }
}

export function buildReminderDeepLink(recommendation, source = 'return_push') {
  const params = new URLSearchParams({
    app: '1',
    target: recommendation.target,
    utm_source: source,
    utm_medium: source === 'return_push' || source === 'push_test' ? 'push' : 'email',
    utm_content: recommendation.content,
  })
  return `${source === 'return_push' || source === 'push_test' ? '/' : 'https://bloomjuniors.com/'}?${params.toString()}`
}
