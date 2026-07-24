import { ENDLESS_MODULES } from './adventureDirector.js'
import { formatLocalDate } from './date.js'

export const CHILD_INTEREST_VERSION = 1
const MAX_EVENTS = 180
const QUICK_EXIT_SECONDS = 35

function hash(value = '') {
  let output = 2166136261
  for (const char of String(value)) {
    output ^= char.charCodeAt(0)
    output = Math.imul(output, 16777619)
  }
  return output >>> 0
}

function safeAge(ageGroup) {
  return ENDLESS_MODULES[ageGroup] ? ageGroup : 'early'
}

function eventId(type, moduleId, at, source = '') {
  return `${type}:${moduleId}:${at}:${hash(source)}`
}

export function normalizeChildInterest(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  const seen = new Set()
  const events = []
  for (const event of Array.isArray(source.events) ? source.events : []) {
    if (!event?.moduleId || !event?.type || !Number(event.at)) continue
    const id = event.id || eventId(event.type, event.moduleId, event.at, event.source)
    if (seen.has(id)) continue
    seen.add(id)
    events.push({ ...event, id, at: Number(event.at), duration: Math.max(0, Number(event.duration) || 0) })
  }
  events.sort((a, b) => a.at - b.at)
  let active = source.active?.moduleId && Number(source.active.startedAt)
    ? { moduleId: source.active.moduleId, startedAt: Number(source.active.startedAt), source: source.active.source || 'choice' }
    : null
  if (active && events.some(event => event.moduleId === active.moduleId && event.at >= active.startedAt && (event.type === 'complete' || event.type === 'exit'))) active = null
  return { version: CHILD_INTEREST_VERSION, active, events: events.slice(-MAX_EVENTS) }
}

function append(value, event, active) {
  const state = normalizeChildInterest(value)
  return normalizeChildInterest({ ...state, active, events: [...state.events, event].slice(-MAX_EVENTS) })
}

export function recordInterestStart(value, moduleId, { source = 'choice', at = Date.now() } = {}) {
  if (!moduleId) return normalizeChildInterest(value)
  let state = normalizeChildInterest(value)
  if (state.active && state.active.moduleId !== moduleId) {
    state = recordInterestExit(state, state.active.moduleId, { at, reason: 'switched' })
  }
  const event = { id: eventId('start', moduleId, at, source), type: 'start', moduleId, source, at }
  return append(state, event, { moduleId, source, startedAt: at })
}

export function recordInterestComplete(value, moduleId, { at = Date.now(), duration, score = 0 } = {}) {
  if (!moduleId) return normalizeChildInterest(value)
  const state = normalizeChildInterest(value)
  const seconds = Math.max(0, Number.isFinite(Number(duration)) ? Number(duration) : state.active?.moduleId === moduleId ? Math.round((at - state.active.startedAt) / 1000) : 0)
  const event = { id: eventId('complete', moduleId, at, String(score)), type: 'complete', moduleId, at, duration: seconds, score: Math.max(0, Number(score) || 0) }
  return append(state, event, state.active?.moduleId === moduleId ? null : state.active)
}

export function recordInterestExit(value, moduleId, { at = Date.now(), duration, reason = 'back' } = {}) {
  if (!moduleId) return normalizeChildInterest(value)
  const state = normalizeChildInterest(value)
  if (state.active?.moduleId !== moduleId) return state
  const seconds = Math.max(0, Number.isFinite(Number(duration)) ? Number(duration) : state.active?.moduleId === moduleId ? Math.round((at - state.active.startedAt) / 1000) : 0)
  const event = { id: eventId('exit', moduleId, at, reason), type: 'exit', moduleId, at, duration: seconds, quick: seconds < QUICK_EXIT_SECONDS, reason }
  return append(state, event, state.active?.moduleId === moduleId ? null : state.active)
}

export function getInterestStats(value = {}, ageGroup = 'early') {
  const state = normalizeChildInterest(value)
  const catalogue = ENDLESS_MODULES[safeAge(ageGroup)]
  const stats = Object.fromEntries(catalogue.map(module => [module.id, { module, starts: 0, completes: 0, exits: 0, quickExits: 0, totalDuration: 0, lastAt: 0, lastCompletedAt: 0 }]))
  for (const event of state.events) {
    if (!stats[event.moduleId]) continue
    const item = stats[event.moduleId]
    item.lastAt = Math.max(item.lastAt, event.at)
    if (event.type === 'start') item.starts += 1
    if (event.type === 'complete') {
      item.completes += 1
      item.totalDuration += event.duration || 0
      item.lastCompletedAt = Math.max(item.lastCompletedAt, event.at)
    }
    if (event.type === 'exit') {
      item.exits += 1
      item.quickExits += event.quick ? 1 : 0
      item.totalDuration += event.duration || 0
    }
  }
  return stats
}

function moduleEngagement(item) {
  if (!item) return -Infinity
  const completionRate = item.starts ? item.completes / item.starts : 0
  const replayBonus = Math.max(0, item.starts - 1) * 2.5
  const durationBonus = Math.min(6, item.totalDuration / 180)
  return item.completes * 6 + item.starts * 1.5 + replayBonus + completionRate * 5 + durationBonus - item.quickExits * 4
}

export function getInterestRecommendations(progress = {}, ageGroup = 'early', now = Date.now()) {
  const age = safeAge(ageGroup)
  const state = normalizeChildInterest(progress.childInterest)
  const stats = getInterestStats(state, age)
  const catalogue = ENDLESS_MODULES[age]
  const active = state.active && now - state.active.startedAt < 6 * 60 * 60 * 1000
    ? catalogue.find(module => module.id === state.active.moduleId)
    : null
  const ranked = Object.values(stats)
    .filter(item => item.starts > 0 || item.completes > 0)
    .sort((a, b) => moduleEngagement(b) - moduleEngagement(a) || b.lastAt - a.lastAt)
  const favourite = ranked[0]?.module || catalogue
    .map(module => ({ module, played: Number(progress[module.id]?.played) || 0 }))
    .sort((a, b) => b.played - a.played)[0]?.module || catalogue[0]
  const excluded = new Set([active?.id, favourite?.id].filter(Boolean))
  const candidates = catalogue.filter(module => !excluded.has(module.id))
  const leastSeen = candidates.sort((a, b) => (stats[a.id]?.starts || 0) - (stats[b.id]?.starts || 0) || (stats[a.id]?.lastAt || 0) - (stats[b.id]?.lastAt || 0))
  const smallestStarts = stats[leastSeen[0]?.id]?.starts || 0
  const surprisePool = leastSeen.filter(module => (stats[module.id]?.starts || 0) === smallestStarts)
  const seed = hash(`${formatLocalDate(new Date(now))}:${age}:${state.events.length}`)
  const surprise = surprisePool[seed % Math.max(1, surprisePool.length)] || catalogue.find(module => module.id !== favourite?.id) || catalogue[0]
  return { continue: active, favourite, surprise, hasSignals: state.events.length > 0, stats }
}

export function getParentInterestInsight(progress = {}, ageGroup = 'early') {
  const recommendations = getInterestRecommendations(progress, ageGroup)
  const ranked = Object.values(recommendations.stats).filter(item => item.starts > 0).sort((a, b) => moduleEngagement(b) - moduleEngagement(a))
  const friction = [...ranked].filter(item => item.starts >= 2).sort((a, b) => (b.quickExits / b.starts) - (a.quickExits / a.starts))[0]
  return {
    ready: recommendations.hasSignals,
    favourite: ranked[0]?.module || recommendations.favourite,
    exploring: recommendations.surprise,
    friction: friction && friction.quickExits > 0 ? friction.module : null,
    sessionsObserved: normalizeChildInterest(progress.childInterest).events.filter(event => event.type === 'start').length,
  }
}

export function mergeChildInterest(localValue = {}, cloudValue = {}) {
  const local = normalizeChildInterest(localValue)
  const cloud = normalizeChildInterest(cloudValue)
  const active = [local.active, cloud.active].filter(Boolean).sort((a, b) => b.startedAt - a.startedAt)[0] || null
  return normalizeChildInterest({ active, events: [...cloud.events, ...local.events] })
}
