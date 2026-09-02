import {
  SCIENCE_INVESTIGATION_LESSONS,
  SCIENCE_INVESTIGATION_ORDER,
  SCIENCE_INVESTIGATION_TRAILS,
  getScienceLesson,
} from '../data/scienceInvestigationCurriculum.js'

export const SCIENCE_FIELD_JOURNAL_ARTIFACT = {
  id: 'science-field-journal-v1',
  name: 'Science Field Journal',
  emoji: '📓',
  message: 'Sixteen investigations built from predictions, evidence, explanations, and real-world tests.',
}

export function normalizeScienceInvestigations(value = {}) {
  return {
    version: 1,
    completed: value?.completed && typeof value.completed === 'object' ? value.completed : {},
    trailBadges: value?.trailBadges && typeof value.trailBadges === 'object' ? value.trailBadges : {},
    artifact: value?.artifact?.id === SCIENCE_FIELD_JOURNAL_ARTIFACT.id ? value.artifact : null,
    updatedAt: Math.max(0, Number(value?.updatedAt) || 0),
  }
}

export function isScienceLessonUnlocked(value = {}, lessonId) {
  const state = normalizeScienceInvestigations(value)
  const lesson = getScienceLesson(lessonId)
  const trail = SCIENCE_INVESTIGATION_TRAILS.find(item => item.id === lesson?.trailId)
  if (!lesson || !trail) return false
  const index = trail.lessonIds.indexOf(lessonId)
  return index === 0 || Boolean(state.completed[trail.lessonIds[index - 1]])
}

export function completeScienceInvestigation(value = {}, lessonId, {
  prediction = '',
  evidence = [],
  reflection = '',
  completedAt = Date.now(),
} = {}) {
  const current = normalizeScienceInvestigations(value)
  const lesson = getScienceLesson(lessonId)
  if (!lesson || !isScienceLessonUnlocked(current, lessonId)) {
    return { state: current, firstCompletion: false, trailCompleted: false, seasonCompleted: false }
  }
  const previous = current.completed[lessonId]
  const completed = {
    ...current.completed,
    [lessonId]: {
      id: lessonId,
      trailId: lesson.trailId,
      question: lesson.question,
      prediction: prediction || previous?.prediction || '',
      evidence: [...new Set([...(previous?.evidence || []), ...evidence])],
      reflection: reflection || previous?.reflection || '',
      activity: lesson.activity,
      parentPrompt: lesson.parentPrompt,
      completedAt: previous?.completedAt || completedAt,
      lastVisitedAt: completedAt,
    },
  }
  const trail = SCIENCE_INVESTIGATION_TRAILS.find(item => item.id === lesson.trailId)
  const trailCompleted = trail.lessonIds.every(id => completed[id])
  const seasonCompleted = SCIENCE_INVESTIGATION_ORDER.every(id => completed[id])

  return {
    state: {
      ...current,
      completed,
      trailBadges: trailCompleted
        ? {
            ...current.trailBadges,
            [trail.id]: current.trailBadges[trail.id] || { ...trail.badge, earnedAt: completedAt },
          }
        : current.trailBadges,
      artifact: seasonCompleted
        ? current.artifact || { ...SCIENCE_FIELD_JOURNAL_ARTIFACT, earnedAt: completedAt }
        : current.artifact,
      updatedAt: Math.max(current.updatedAt, completedAt),
    },
    firstCompletion: !previous,
    trailCompleted,
    seasonCompleted,
  }
}

export function getScienceInvestigationView(progress = {}) {
  const state = normalizeScienceInvestigations(progress.scienceInvestigations)
  const completedIds = new Set(Object.keys(state.completed))
  const trails = SCIENCE_INVESTIGATION_TRAILS.map(trail => {
    const lessons = trail.lessonIds.map(getScienceLesson).filter(Boolean)
    const completed = lessons.filter(lesson => completedIds.has(lesson.id)).length
    const nextLesson = lessons.find(lesson => !completedIds.has(lesson.id)) || null
    return {
      ...trail,
      lessons,
      completed,
      total: lessons.length,
      complete: completed === lessons.length,
      nextLesson,
      rewardBadge: trail.badge,
      badge: state.trailBadges[trail.id] || null,
    }
  })
  const completed = SCIENCE_INVESTIGATION_LESSONS.filter(lesson => completedIds.has(lesson.id)).length

  return {
    state,
    trails,
    lessons: SCIENCE_INVESTIGATION_LESSONS,
    completed,
    total: SCIENCE_INVESTIGATION_LESSONS.length,
    progressPercent: Math.round((completed / SCIENCE_INVESTIGATION_LESSONS.length) * 100),
    complete: completed === SCIENCE_INVESTIGATION_LESSONS.length,
    artifact: state.artifact,
    recent: Object.values(state.completed)
      .sort((left, right) => (right.completedAt || 0) - (left.completedAt || 0))
      .slice(0, 4),
  }
}

export function mergeScienceInvestigations(local = {}, cloud = {}) {
  const left = normalizeScienceInvestigations(local)
  const right = normalizeScienceInvestigations(cloud)
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
    trailBadges: { ...right.trailBadges, ...left.trailBadges },
    artifact: leftArtifact && rightArtifact
      ? (leftArtifact.earnedAt <= rightArtifact.earnedAt ? leftArtifact : rightArtifact)
      : leftArtifact || rightArtifact,
    updatedAt: Math.max(left.updatedAt, right.updatedAt),
  }
}
