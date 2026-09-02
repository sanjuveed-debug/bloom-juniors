import {
  HOME_TO_WORLD_ARTIFACT,
  HOME_TO_WORLD_LESSONS,
  HOME_TO_WORLD_ORDER,
  getHomeToWorldLesson,
} from '../data/homeToWorldCurriculum.js'

export function normalizeHomeToWorld(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    version: 1,
    completed: source.completed && typeof source.completed === 'object' ? source.completed : {},
    artifact: source.artifact?.id === HOME_TO_WORLD_ARTIFACT.id ? source.artifact : null,
    updatedAt: Math.max(0, Number(source.updatedAt) || 0),
  }
}

export function isHomeToWorldLessonUnlocked(value = {}, lessonId) {
  const index = HOME_TO_WORLD_ORDER.indexOf(lessonId)
  if (index < 0) return false
  if (index === 0) return true
  return Boolean(normalizeHomeToWorld(value).completed[HOME_TO_WORLD_ORDER[index - 1]])
}

export function completeHomeToWorldLesson(value = {}, lessonId, {
  choice = '',
  evidence = [],
  reflection = '',
  ageGroup = 'early',
  completedAt = Date.now(),
} = {}) {
  const current = normalizeHomeToWorld(value)
  const lesson = getHomeToWorldLesson(lessonId, ageGroup)
  if (!lesson || !isHomeToWorldLessonUnlocked(current, lessonId)) {
    return { state: current, firstCompletion: false, journeyCompleted: false }
  }

  const previous = current.completed[lessonId]
  const completed = {
    ...current.completed,
    [lessonId]: {
      id: lessonId,
      day: lesson.day,
      title: lesson.title,
      choice: choice || previous?.choice || '',
      evidence: [...new Set([...(previous?.evidence || []), ...evidence])],
      reflection: reflection || previous?.reflection || '',
      ageGroup: previous?.ageGroup || ageGroup,
      offline: lesson.offline,
      parentPrompt: lesson.parentPrompt,
      completedAt: previous?.completedAt || completedAt,
      lastVisitedAt: completedAt,
    },
  }
  const journeyCompleted = HOME_TO_WORLD_ORDER.every(id => completed[id])
  const artifact = journeyCompleted
    ? current.artifact || {
        ...HOME_TO_WORLD_ARTIFACT,
        earnedAt: completedAt,
        entries: HOME_TO_WORLD_ORDER.map(id => ({
          id,
          title: completed[id].title,
          choice: completed[id].choice,
          reflection: completed[id].reflection,
        })),
      }
    : current.artifact

  return {
    state: {
      version: 1,
      completed,
      artifact,
      updatedAt: Math.max(current.updatedAt, completedAt),
    },
    firstCompletion: !previous,
    journeyCompleted,
  }
}

export function getHomeToWorldView(progress = {}, ageGroup = 'early') {
  const state = normalizeHomeToWorld(progress.homeToWorld)
  const lessons = HOME_TO_WORLD_LESSONS.map(lesson => ({
    ...getHomeToWorldLesson(lesson.id, ageGroup),
    completed: Boolean(state.completed[lesson.id]),
    unlocked: isHomeToWorldLessonUnlocked(state, lesson.id),
    record: state.completed[lesson.id] || null,
  }))
  const completed = lessons.filter(lesson => lesson.completed).length
  return {
    state,
    lessons,
    completed,
    total: lessons.length,
    progressPercent: Math.round((completed / lessons.length) * 100),
    nextLesson: lessons.find(lesson => !lesson.completed && lesson.unlocked) || null,
    complete: completed === lessons.length,
    artifact: state.artifact,
    recent: Object.values(state.completed)
      .sort((left, right) => (right.completedAt || 0) - (left.completedAt || 0))
      .slice(0, 3),
  }
}

export function mergeHomeToWorld(local = {}, cloud = {}) {
  const left = normalizeHomeToWorld(local)
  const right = normalizeHomeToWorld(cloud)
  const completed = {}

  for (const id of new Set([...Object.keys(left.completed), ...Object.keys(right.completed)])) {
    const localItem = left.completed[id]
    const cloudItem = right.completed[id]
    if (!localItem) completed[id] = cloudItem
    else if (!cloudItem) completed[id] = localItem
    else {
      const newest = (localItem.lastVisitedAt || localItem.completedAt || 0) >=
        (cloudItem.lastVisitedAt || cloudItem.completedAt || 0) ? localItem : cloudItem
      completed[id] = {
        ...cloudItem,
        ...localItem,
        ...newest,
        completedAt: Math.min(localItem.completedAt || Infinity, cloudItem.completedAt || Infinity),
        evidence: [...new Set([...(cloudItem.evidence || []), ...(localItem.evidence || [])])],
      }
    }
  }

  const leftArtifact = left.artifact
  const rightArtifact = right.artifact
  return {
    version: 1,
    completed,
    artifact: leftArtifact && rightArtifact
      ? (leftArtifact.earnedAt <= rightArtifact.earnedAt ? leftArtifact : rightArtifact)
      : leftArtifact || rightArtifact,
    updatedAt: Math.max(left.updatedAt, right.updatedAt),
  }
}
