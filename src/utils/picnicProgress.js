import { newPicnic, picnicReducer, restorePicnic } from './picnicAdventure.js'

export function normalizePicnicProgress(value) {
  return { state: restorePicnic(JSON.stringify(value?.state || newPicnic())), updatedAt: Number(value?.updatedAt) || 0, completedAt: Number(value?.completedAt) || 0 }
}

// A completed first visit must survive a stale device's unfinished snapshot.
export function mergePicnicProgress(a, b) {
  const left = normalizePicnicProgress(a)
  const right = normalizePicnicProgress(b)
  if (Boolean(left.state.report) !== Boolean(right.state.report)) return left.state.report ? left : right
  const newer = left.updatedAt >= right.updatedAt ? left : right
  if (left.state.report && right.state.report) {
    const first = (left.completedAt || left.updatedAt) <= (right.completedAt || right.updatedAt) ? left : right
    return { ...newer, completedAt: first.completedAt, state: { ...newer.state, report: first.state.report } }
  }
  return newer
}

export function applyPicnicAction(progress, action, at = Date.now()) {
  const previous = normalizePicnicProgress(progress.picnic)
  const state = picnicReducer(previous.state, action)
  if (state === previous.state) return progress
  let sessions = progress.sessions || []
  if (!previous.state.report && state.report && !sessions.some(s => s.activityId === 'picnic-first')) {
    sessions = [...sessions, {
      ...state.report, date: at, module: 'math', activityId: 'picnic-first',
      title: 'The Picnic', stars: 0, duration: 0,
    }]
  }
  return { ...progress, picnic: { state, updatedAt: at, completedAt: previous.completedAt || (state.report ? at : 0) }, sessions }
}
