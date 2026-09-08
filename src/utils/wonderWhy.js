import { normalizeFoundationProfile } from './foundationProfile.js'
import { formatLocalDate } from './date.js'
import {
  FOUNDATION_SEASON_ID,
  FOUNDATION_SEASON_ORDER,
  FOUNDATION_SEASON_WEEKS,
  FOUNDATION_SEASON_EXTENSION_LESSONS,
  getFoundationSeasonWeekByLesson,
} from '../data/foundationSeasonCurriculum.js'

export const FOUNDATION_SEASON_ARTIFACT = {
  id: 'foundation-compass-v1',
  name: 'Foundation Compass',
  emoji: '🧭',
  message: 'A compass built from questions, evidence, roots, care, and imagination.',
}

export const LEAVES_GREEN_ID = 'leaves-green-v1'
export const SUNSET_RED_ID = 'sunset-red-v1'

export const LEAVES_GREEN_PROMPT =
  'Why do most leaves look green?'
export const SUNSET_RED_PROMPT =
  'Why does the Sun look red or orange at sunset?'

export const WONDER_LESSONS = [
  {
    id: LEAVES_GREEN_ID,
    question: LEAVES_GREEN_PROMPT,
    shortQuestion: 'Why do most leaves look green?',
    image: 'https://bloom-juniors.pages.dev/wonder-leaf-20260726.png',
    accent: '#167a4a',
    surface: '#eaf8ef',
    visual: '🌿',
    strands: ['world-systems', 'thinking-communication'],
    arcs: ['living-things', 'matter-force-energy'],
    predictions: [
      { id: 'painted', label: 'The leaf is painted green', symbol: '🎨' },
      { id: 'reflects', label: 'Green light is reflected', symbol: '↗' },
      { id: 'makes', label: 'The leaf creates green light', symbol: '✨' },
    ],
    story: 'White sunlight carries many colours. Chlorophyll inside a leaf absorbs much of the red and blue light while more green light reflects toward our eyes.',
    activityPrompt: 'Find the three parts of the light journey',
    clues: [
      { id: 'sunlight', label: 'Sunlight arrives', symbol: '☀️' },
      { id: 'leaf', label: 'The leaf absorbs light', symbol: '🌿' },
      { id: 'eyes', label: 'Green reaches our eyes', symbol: '👁️' },
    ],
    explanation: 'Chlorophyll helps plants capture light energy. It absorbs lots of red and blue light but reflects more green, which is why most leaves look green.',
    offline: 'Compare young and old leaves outside with a grown-up. Record every colour you notice without picking the leaves.',
    parentQuestion: 'What clues might explain why some leaves are red, yellow, or patterned?',
  },
  {
    id: SUNSET_RED_ID,
    question: SUNSET_RED_PROMPT,
    shortQuestion: 'Why does the Sun look orange at sunset?',
    image: 'https://bloom-juniors.pages.dev/wonder-sunset-20260726.png',
    accent: '#c94f22',
    surface: '#fff5e9',
    visual: '🌅',
    strands: ['world-systems', 'thinking-communication'],
    arcs: ['matter-force-energy', 'earth-sky-time'],
    predictions: [
      { id: 'cooler', label: 'The Sun becomes cooler', symbol: '🌡️' },
      { id: 'air', label: 'Light travels through more air', symbol: '↗' },
      { id: 'painted', label: 'Clouds paint the Sun orange', symbol: '🎨' },
    ],
    story: 'At sunset, sunlight crosses much more atmosphere before reaching us. More blue light scatters away from the direct path while more red and orange light continues to our eyes.',
    activityPrompt: 'Find the three parts of the sunset light path',
    clues: [
      { id: 'low-sun', label: 'Low Sun', symbol: '🌇' },
      { id: 'long-air', label: 'Long path through air', symbol: '〰️' },
      { id: 'warm-light', label: 'Warm light reaches us', symbol: '🟠' },
    ],
    explanation: 'The Sun itself has not changed colour. Its longer path through the atmosphere scatters more blue light away, leaving the direct light looking warmer.',
    offline: 'Compare the sky several minutes apart with a grown-up. Never stare directly at the Sun.',
    parentQuestion: 'Which sky colours change first as sunset approaches?',
  },
  {
    id: 'bridge-strong-v1',
    question: 'How can a bridge hold so much weight?',
    shortQuestion: 'How can a bridge hold so much weight?',
    visual: '🌉',
    accent: '#246b8e',
    surface: '#eaf7fb',
    strands: ['thinking-communication', 'world-systems'],
    arcs: ['matter-force-energy', 'making-serving-creating'],
    predictions: [
      { id: 'thick', label: 'Only very thick bridges work', symbol: '🧱' },
      { id: 'shape', label: 'Shapes spread the force', symbol: '🔺' },
      { id: 'light', label: 'Light bridges are always stronger', symbol: '🪶' },
    ],
    story: 'Imagine every person and car pushing down on one small spot. A bridge would bend. Builders use arches, triangles, beams, and cables to share that push across many connected parts.',
    activityPrompt: 'Find the three load-sharing shapes',
    clues: [
      { id: 'triangle', label: 'Triangle', symbol: '🔺' },
      { id: 'arch', label: 'Arch', symbol: '🌈' },
      { id: 'beam', label: 'Beam', symbol: '➖' },
    ],
    explanation: 'Strong structures spread forces along connected paths and into the ground. Shape matters as much as the amount of material.',
    offline: 'Build two paper bridges between books. Fold one sheet into ridges and compare how many coins each bridge can hold.',
    parentQuestion: 'Where can you spot triangles, arches, or beams in buildings near home?',
  },
  {
    id: 'family-story-time-v1',
    question: 'How does a family story travel through time?',
    shortQuestion: 'How does a family story travel through time?',
    visual: '🧵',
    accent: '#9b4c35',
    surface: '#fff1eb',
    strands: ['roots-culture-meaning', 'people-place-time'],
    arcs: ['family-roots-belonging', 'how-life-changed'],
    predictions: [
      { id: 'books', label: 'Only through history books', symbol: '📚' },
      { id: 'people', label: 'People retell and record it', symbol: '🗣️' },
      { id: 'unchanged', label: 'Stories never change at all', symbol: '🔒' },
    ],
    story: 'A memory can move from a grandparent to a parent and then to a child. Photos, recipes, letters, songs, objects, and places can help people remember details and ask better questions.',
    activityPrompt: 'Choose three kinds of family evidence',
    clues: [
      { id: 'photo', label: 'A photograph', symbol: '📷' },
      { id: 'recipe', label: 'A recipe', symbol: '🥣' },
      { id: 'voice', label: 'A recorded voice', symbol: '🎙️' },
    ],
    explanation: 'Stories connect identity to time and place. Historians compare memories with objects and records because every storyteller sees events from a particular point of view.',
    offline: 'Ask a grown-up about one game, meal, journey, or celebration they remember from childhood. Draw one detail you want to keep.',
    parentQuestion: 'Which family story should never be lost?',
    reviewCategory: 'roots',
  },
  {
    id: 'maps-choices-v1',
    question: 'Why do different maps show different things?',
    shortQuestion: 'Why do maps make choices?',
    visual: '🗺️',
    accent: '#2d6b55',
    surface: '#edf8f2',
    strands: ['people-place-time', 'thinking-communication'],
    arcs: ['home-to-world', 'language-stories-ideas'],
    predictions: [
      { id: 'everything', label: 'Every map shows everything', symbol: '🌍' },
      { id: 'purpose', label: 'The maker chooses for a purpose', symbol: '🎯' },
      { id: 'decoration', label: 'Maps are only decoration', symbol: '🖼️' },
    ],
    story: 'A train map makes stations easy to follow but may bend real distances. A weather map highlights clouds and wind. A map is a tool made by someone for a particular job.',
    activityPrompt: 'Match three useful map clues',
    clues: [
      { id: 'route', label: 'A route line', symbol: '〰️' },
      { id: 'key', label: 'A symbol key', symbol: '🔑' },
      { id: 'direction', label: 'A direction arrow', symbol: '🧭' },
    ],
    explanation: 'Maps communicate selected information about place. Asking who made a map, when, and why helps us understand both what it shows and what it leaves out.',
    offline: 'Draw a map from your bed to the kitchen. Include only the clues another person needs to follow it.',
    parentQuestion: 'What would a visitor need on a useful map of your neighbourhood?',
  },
  {
    id: 'languages-words-v1',
    question: 'Why do languages use different words?',
    shortQuestion: 'Why do languages use different words?',
    visual: '💬',
    accent: '#6d3db0',
    surface: '#f5efff',
    strands: ['roots-culture-meaning', 'thinking-communication'],
    arcs: ['language-stories-ideas', 'family-roots-belonging'],
    predictions: [
      { id: 'mistake', label: 'Some languages are mistakes', symbol: '✕' },
      { id: 'communities', label: 'Communities shaped them over time', symbol: '👥' },
      { id: 'one-person', label: 'One person invented every language', symbol: '☝️' },
    ],
    story: 'People build language together over many generations. Words travel, change sound, and gain new meanings when communities meet. No language is a broken version of another.',
    activityPrompt: 'Find three ways people communicate',
    clues: [
      { id: 'speech', label: 'Spoken words', symbol: '🗣️' },
      { id: 'sign', label: 'Signed words', symbol: '🤟' },
      { id: 'writing', label: 'Written words', symbol: '✍️' },
    ],
    explanation: 'Languages carry ideas, humour, memories, and belonging. Learning how another person speaks their name or greeting is a way to show respect.',
    offline: 'Collect one greeting from each language spoken by family or friends. Practise saying or signing it respectfully.',
    parentQuestion: 'Which word from your family language carries a meaning that is hard to translate?',
    reviewCategory: 'culture',
  },
  {
    id: 'fair-rules-v1',
    question: 'Does fair always mean everyone gets the same?',
    shortQuestion: 'Does fair always mean the same?',
    visual: '⚖️',
    accent: '#a26713',
    surface: '#fff8e5',
    strands: ['self-relationships-agency', 'thinking-communication'],
    arcs: ['me-and-my-mind', 'making-serving-creating'],
    predictions: [
      { id: 'same', label: 'Fair always means exactly the same', symbol: '=' },
      { id: 'needs', label: 'Fair can consider different needs', symbol: '🤝' },
      { id: 'winner', label: 'The winner decides what is fair', symbol: '🏆' },
    ],
    story: 'Three children want to see over a wall. Giving each the same box is equal, but the shortest child still cannot see. A fair solution pays attention to the goal and each person’s needs.',
    activityPrompt: 'Choose three clues for a fair decision',
    clues: [
      { id: 'listen', label: 'Listen to everyone', symbol: '👂' },
      { id: 'goal', label: 'Name the shared goal', symbol: '🎯' },
      { id: 'reason', label: 'Give a reason', symbol: '💡' },
    ],
    explanation: 'Fairness is not a single rule. We compare needs, rights, effort, and shared goals, then explain our reasons and listen when others disagree.',
    offline: 'Choose one small family job and discuss a fair way to share it. Explain why your plan is fair.',
    parentQuestion: 'When has your child noticed that equal and fair are not quite the same?',
  },
  {
    id: 'money-journey-v1',
    question: 'Where does money go after we spend it?',
    shortQuestion: 'Where does money go after we spend it?',
    visual: '🪙',
    accent: '#9a5b20',
    surface: '#fff4dc',
    strands: ['self-relationships-agency', 'people-place-time'],
    arcs: ['number-pattern-measure', 'making-serving-creating'],
    predictions: [
      { id: 'vanish', label: 'It disappears forever', symbol: '✨' },
      { id: 'moves', label: 'It moves through people and businesses', symbol: '🔄' },
      { id: 'shop', label: 'It always stays in the shop', symbol: '🏪' },
    ],
    story: 'When a family buys bread, the shop can pay workers, the baker, rent, transport, and taxes. Money helps people exchange work and goods, and the same money can move many times.',
    activityPrompt: 'Build the bread money journey',
    clues: [
      { id: 'shop', label: 'Shop', symbol: '🏪' },
      { id: 'baker', label: 'Baker', symbol: '🧑‍🍳' },
      { id: 'farm', label: 'Farm', symbol: '🌾' },
    ],
    explanation: 'Spending is part of a system. Our choices can support needs, savings, workers, local businesses, and the resources used to make a product.',
    offline: 'Pick one item at home and trace who may have helped make, move, and sell it.',
    parentQuestion: 'How does your family decide whether something is a need, a useful want, or a saving goal?',
  },
  ...FOUNDATION_SEASON_EXTENSION_LESSONS,
]

function hash(value = '') {
  let output = 2166136261
  for (const char of String(value)) {
    output ^= char.charCodeAt(0)
    output = Math.imul(output, 16777619)
  }
  return output >>> 0
}

export function getDailyFoundationAdventure(progress = {}, date = formatLocalDate()) {
  const book = normalizeWonderWhy(progress.wonderWhy)
  const assigned = WONDER_LESSONS.find(lesson => lesson.id === book.dailyAssignments[date])
  if (assigned) return assigned
  const profile = normalizeFoundationProfile(progress.foundationProfile)
  const ordered = FOUNDATION_SEASON_ORDER
    .map(id => WONDER_LESSONS.find(lesson => lesson.id === id))
    .filter(Boolean)
  const allowed = ordered.filter(lesson => isFoundationLessonAllowed(lesson, profile, book.reviewApprovals))
  return allowed.find(lesson => !book.discoveries[lesson.id]) || allowed[hash(date) % Math.max(allowed.length, 1)] || ordered[0]
}

function isFoundationLessonAllowed(lesson, profile, approvals = {}) {
  if (!lesson?.reviewCategory) return true
  if (approvals[lesson.id]) return true
  if (lesson.reviewCategory === 'faith' && profile.beliefMode === 'pause-faith') return false
  if (profile.previewMode === 'preview-all') return false
  if (profile.previewMode === 'preview-roots') {
    return !['roots', 'culture', 'faith'].includes(lesson.reviewCategory)
  }
  return true
}

export function approveFoundationSeasonLesson(value = {}, lessonId, approved = true) {
  const current = normalizeWonderWhy(value)
  if (!FOUNDATION_SEASON_ORDER.includes(lessonId)) return current
  return {
    ...current,
    reviewApprovals: {
      ...current.reviewApprovals,
      [lessonId]: Boolean(approved),
    },
  }
}

export function getFoundationSeasonView(progress = {}, date = formatLocalDate()) {
  const book = normalizeWonderWhy(progress.wonderWhy)
  const profile = normalizeFoundationProfile(progress.foundationProfile)
  const lessons = FOUNDATION_SEASON_ORDER
    .map(id => WONDER_LESSONS.find(lesson => lesson.id === id))
    .filter(Boolean)
  const completedIds = new Set(lessons.filter(lesson => book.discoveries[lesson.id]).map(lesson => lesson.id))
  const heldLessons = lessons.filter(lesson =>
    lesson.reviewCategory &&
    !book.discoveries[lesson.id] &&
    !isFoundationLessonAllowed(lesson, profile, book.reviewApprovals)
  )
  const currentLesson = getDailyFoundationAdventure(progress, date)
  const week = getFoundationSeasonWeekByLesson(currentLesson?.id) || {
    ...FOUNDATION_SEASON_WEEKS[0],
    weekIndex: 0,
    weekNumber: 1,
    dayIndex: 0,
    dayNumber: 1,
  }
  const weekCompleted = week.lessonIds.filter(id => completedIds.has(id)).length
  const complete = completedIds.size >= lessons.length

  return {
    id: FOUNDATION_SEASON_ID,
    title: 'Foundations of Everything',
    lessons,
    currentLesson,
    currentWeek: week,
    completed: completedIds.size,
    total: lessons.length,
    progressPercent: Math.round((completedIds.size / Math.max(lessons.length, 1)) * 100),
    weekCompleted,
    weekTotal: week.lessonIds.length,
    familyMissionsCompleted: lessons.filter(lesson => lesson.familyMission && completedIds.has(lesson.id)).length,
    familyMissionsTotal: lessons.filter(lesson => lesson.familyMission).length,
    heldLessons,
    complete,
    artifact: complete ? (book.seasonArtifact || FOUNDATION_SEASON_ARTIFACT) : null,
  }
}

export function getFoundationSeasonMapState(progress = {}, date = formatLocalDate()) {
  const localDate = typeof date === 'string' ? date : formatLocalDate(date)
  const book = normalizeWonderWhy(progress.wonderWhy)
  const season = getFoundationSeasonView(progress, localDate)
  const currentSaved = Boolean(book.discoveries[season.currentLesson?.id])
  const completedToday = currentSaved && book.lastCompletedDate === localDate
  const tomorrow = new Date(`${localDate}T12:00:00`)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowDate = formatLocalDate(tomorrow)
  const nextLesson = completedToday && !season.complete
    ? getDailyFoundationAdventure(progress, tomorrowDate)
    : season.currentLesson
  const nextSaved = Boolean(book.discoveries[nextLesson?.id])
  const waitingForPreview = !season.complete && currentSaved && !completedToday && nextSaved

  return {
    ...season,
    date: localDate,
    completedToday,
    waitingForPreview,
    canContinue: !season.complete && !completedToday && !waitingForPreview && !currentSaved,
    nextLesson: season.complete || waitingForPreview ? null : nextLesson,
    tomorrowDate,
  }
}

export function normalizeWonderWhy(value = {}) {
  const discoveries = value?.discoveries && typeof value.discoveries === 'object'
    ? value.discoveries
    : {}

  return {
    version: 1,
    discoveries,
    lastCompletedDate: String(value?.lastCompletedDate || ''),
    dailyAssignments: value?.dailyAssignments && typeof value.dailyAssignments === 'object'
      ? Object.fromEntries(Object.entries(value.dailyAssignments).slice(-14))
      : {},
    reviewApprovals: value?.reviewApprovals && typeof value.reviewApprovals === 'object'
      ? value.reviewApprovals
      : {},
    seasonArtifact: value?.seasonArtifact?.id === FOUNDATION_SEASON_ARTIFACT.id
      ? value.seasonArtifact
      : null,
  }
}

export function completeWonderDiscovery(value = {}, lessonId, {
  prediction = '',
  testedColours = [],
  completedAt = Date.now(),
  completedDate = formatLocalDate(new Date(completedAt)),
  familyPrompt = '',
} = {}) {
  const current = normalizeWonderWhy(value)
  const lesson = WONDER_LESSONS.find(item => item.id === lessonId) || WONDER_LESSONS[0]
  const previous = current.discoveries[lesson.id]
  const nextDiscoveries = {
    ...current.discoveries,
    [lesson.id]: {
      id: lesson.id,
      question: lesson.question,
      prediction: prediction || previous?.prediction || '',
      testedColours: [...new Set([
        ...(previous?.testedColours || []),
        ...testedColours,
      ])],
      explanationVersion: 1,
      completedAt: previous?.completedAt || completedAt,
      lastVisitedAt: completedAt,
      familyPrompt: familyPrompt || previous?.familyPrompt || '',
    },
  }
  const seasonComplete = FOUNDATION_SEASON_ORDER.every(id => nextDiscoveries[id])

  return {
    state: {
      ...current,
      discoveries: nextDiscoveries,
      lastCompletedDate: completedDate,
      dailyAssignments: {
        ...current.dailyAssignments,
        [completedDate]: lesson.id,
      },
      seasonArtifact: seasonComplete
        ? current.seasonArtifact || { ...FOUNDATION_SEASON_ARTIFACT, earnedAt: completedAt }
        : current.seasonArtifact,
    },
    firstCompletion: !previous,
  }
}

export function completeWonderWhyDiscovery(value = {}, options = {}) {
  return completeWonderDiscovery(value, LEAVES_GREEN_ID, {
    familyPrompt: 'What other colours can you spot in leaves near home?',
    ...options,
  })
}

export function getNextWonderLesson(progress = {}) {
  const book = normalizeWonderWhy(progress.wonderWhy)
  return WONDER_LESSONS.find(lesson => !book.discoveries[lesson.id]) || null
}

export function mergeWonderWhy(local = {}, cloud = {}) {
  const left = normalizeWonderWhy(local)
  const right = normalizeWonderWhy(cloud)
  const discoveries = {}

  for (const id of new Set([
    ...Object.keys(left.discoveries),
    ...Object.keys(right.discoveries),
  ])) {
    const localItem = left.discoveries[id]
    const cloudItem = right.discoveries[id]
    if (!localItem) discoveries[id] = cloudItem
    else if (!cloudItem) discoveries[id] = localItem
    else {
      const newest = (localItem.lastVisitedAt || localItem.completedAt || 0)
        >= (cloudItem.lastVisitedAt || cloudItem.completedAt || 0)
        ? localItem
        : cloudItem
      discoveries[id] = {
        ...cloudItem,
        ...localItem,
        ...newest,
        completedAt: Math.min(
          localItem.completedAt || Number.MAX_SAFE_INTEGER,
          cloudItem.completedAt || Number.MAX_SAFE_INTEGER,
        ),
        testedColours: [...new Set([
          ...(cloudItem.testedColours || []),
          ...(localItem.testedColours || []),
        ])],
      }
    }
  }

  return {
    version: 1,
    discoveries,
    lastCompletedDate: [left.lastCompletedDate, right.lastCompletedDate]
      .filter(Boolean)
      .sort()
      .at(-1) || '',
    dailyAssignments: {
      ...left.dailyAssignments,
      ...right.dailyAssignments,
    },
    reviewApprovals: {
      ...left.reviewApprovals,
      ...right.reviewApprovals,
    },
    seasonArtifact: left.seasonArtifact && right.seasonArtifact
      ? (left.seasonArtifact.earnedAt <= right.seasonArtifact.earnedAt ? left.seasonArtifact : right.seasonArtifact)
      : left.seasonArtifact || right.seasonArtifact,
  }
}
