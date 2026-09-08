import {
  FOUNDATION_STRANDS,
  MODULE_FOUNDATION_TAGS,
} from '../data/foundationCurriculum.js'
import { normalizeFoundationProfile } from './foundationProfile.js'
import { formatLocalDate } from './date.js'

export const FOUNDATION_MODULE_CATALOG = {
  toddler: [
    { id: 'alphabet', label: 'Letter Tree', emoji: '🔤', role: 'essential' },
    { id: 'numbers', label: 'Counting Falls', emoji: '🔢', role: 'essential' },
    { id: 'shapes', label: 'Shape River', emoji: '🔷', role: 'essential' },
    { id: 'colours', label: 'Rainbow Garden', emoji: '🎨', role: 'foundation' },
    { id: 'animals', label: 'Animal Jungle', emoji: '🐘', role: 'foundation' },
    { id: 'fruits', label: 'Fruit Orchard', emoji: '🍎', role: 'foundation' },
    { id: 'bodyparts', label: 'Wiggle Meadow', emoji: '🖐️', role: 'foundation' },
  ],
  early: [
    { id: 'phonics', label: 'Sound Pop', emoji: '🎤', role: 'essential', free: true },
    { id: 'math', label: 'Number World', emoji: '🔢', role: 'essential', free: true },
    { id: 'tricky', label: 'Star Catch', emoji: '⭐', role: 'essential', free: true },
    { id: 'story', label: 'Story Room', emoji: '📖', role: 'essential', free: true },
    { id: 'science', label: 'Wonder Lab', emoji: '🔬', role: 'foundation' },
    { id: 'worldgk', label: 'World Explorer', emoji: '🌍', role: 'foundation' },
    { id: 'planets', label: 'Planet World', emoji: '🪐', role: 'foundation' },
    { id: 'anatomy', label: 'My Body', emoji: '🫀', role: 'foundation' },
    { id: 'sacred', label: 'Sacred Stories', emoji: '🕊️', role: 'foundation', sensitive: true },
    { id: 'shapes', label: 'Shape World', emoji: '🔷', role: 'foundation', free: true },
    { id: 'logic', label: 'Puzzle Quest', emoji: '🧩', role: 'foundation', free: true },
    { id: 'davinci', label: 'Da Vinci Studio', emoji: '🎨', role: 'foundation', free: true },
    { id: 'exercise', label: 'Fun Exercise', emoji: '🏃', role: 'foundation', free: true },
    { id: 'shop', label: 'Coin Shop', emoji: '🛍️', role: 'foundation' },
    { id: 'piggybank', label: 'Piggy Bank', emoji: '🐷', role: 'foundation', free: true },
  ],
  junior: [
    { id: 'timestables', label: 'Times Tables', emoji: '✖️', role: 'essential', free: true },
    { id: 'fractions', label: 'Fractions', emoji: '½', role: 'essential' },
    { id: 'wordproblems', label: 'Word Problems', emoji: '🧩', role: 'essential' },
    { id: 'reading', label: 'Reading', emoji: '📖', role: 'essential', free: true },
    { id: 'spelling', label: 'Spelling', emoji: '✏️', role: 'essential', free: true },
    { id: 'grammar', label: 'Grammar', emoji: '🔤', role: 'essential' },
    { id: 'science', label: 'Science Quest', emoji: '🔬', role: 'foundation' },
    { id: 'worldmap', label: 'World Map', emoji: '🌍', role: 'foundation' },
    { id: 'spirituality', label: 'World Faiths', emoji: '🕊️', role: 'foundation', sensitive: true },
    { id: 'piggybank', label: 'Piggy Bank', emoji: '🐷', role: 'foundation' },
    { id: 'exercise', label: 'Movement', emoji: '🏃', role: 'foundation', free: true },
  ],
}

function hash(value = '') {
  let output = 2166136261
  for (const char of String(value)) {
    output ^= char.charCodeAt(0)
    output = Math.imul(output, 16777619)
  }
  return output >>> 0
}

function sessionCounts(progress = {}, assignedDate = '') {
  const counts = {}
  const recent = []
  for (const session of progress.sessions || []) {
    if (!session?.module) continue
    const at = Number(session.date) || 0
    if (at && assignedDate && formatLocalDate(new Date(at)) === assignedDate) continue
    counts[session.module] = (counts[session.module] || 0) + 1
    recent.push({ id: session.module, at })
  }
  recent.sort((a, b) => b.at - a.at)
  return { counts, recent: recent.slice(0, 4).map(item => item.id) }
}

function moduleScore(module, profile, counts, recent, date, role) {
  const tags = MODULE_FOUNDATION_TAGS[module.id] || { strands: [], arcs: [] }
  const priorityMatches = tags.strands.filter(id => profile.priorities.includes(id)).length
  const interestMatches = tags.arcs.filter(id => profile.interests.includes(id)).length
  const recentPenalty = recent.includes(module.id) ? 8 - recent.indexOf(module.id) : 0
  const underuse = Math.max(0, 8 - (counts[module.id] || 0))
  const stableVariation = hash(`${date}:${role}:${module.id}`) % 7
  return underuse * 2 + priorityMatches * 6 + interestMatches * 4 + stableVariation - recentPenalty
}

function allowedModules(ageGroup, progress, premium) {
  const profile = normalizeFoundationProfile(progress.foundationProfile)
  return (FOUNDATION_MODULE_CATALOG[ageGroup] || FOUNDATION_MODULE_CATALOG.early).filter(module => {
    if (!premium && ageGroup !== 'toddler' && !module.free) return false
    if (!module.sensitive) return true
    if (progress.hideSacred || profile.beliefMode === 'pause-faith') return false
    return profile.previewMode === 'standard'
  })
}

export function getFoundationDailyPath(progress = {}, ageGroup = 'early', {
  premium = true,
  classroomLesson = null,
  date = formatLocalDate(),
} = {}) {
  const age = FOUNDATION_MODULE_CATALOG[ageGroup] ? ageGroup : 'early'
  const catalog = allowedModules(age, progress, premium)

  if (Array.isArray(classroomLesson) && classroomLesson.length >= 2) {
    const selected = classroomLesson.map(id => catalog.find(module => module.id === id)).filter(Boolean)
    if (selected.length >= 2) {
      return {
        essential: selected[0],
        foundation: selected[1],
        modules: selected.slice(0, 2),
        source: 'classroom',
      }
    }
  }

  const profile = normalizeFoundationProfile(progress.foundationProfile)
  // Today's completions must not change the remaining assignment mid-journey.
  const { counts, recent } = sessionCounts(progress, date)
  const rank = role => catalog
    .filter(module => module.role === role)
    .map(module => ({ module, score: moduleScore(module, profile, counts, recent, date, role) }))
    .sort((a, b) => b.score - a.score || a.module.id.localeCompare(b.module.id))[0]?.module

  const essential = rank('essential') || catalog[0]
  const foundation = rank('foundation') || catalog.find(module => module.id !== essential?.id) || essential
  const foundationTags = MODULE_FOUNDATION_TAGS[foundation?.id] || { strands: [], arcs: [] }

  return {
    essential,
    foundation,
    modules: [essential, foundation].filter(Boolean),
    source: profile.updatedAt ? 'foundation-profile' : 'balanced-default',
    targetStrand: foundationTags.strands[0] || '',
    targetArc: foundationTags.arcs[0] || '',
  }
}

export function getFoundationProgress(progress = {}, now = Date.now()) {
  const profile = normalizeFoundationProfile(progress.foundationProfile)
  const totals = Object.fromEntries(FOUNDATION_STRANDS.map(strand => [
    strand.id,
    { ...strand, experiences: 0, recentExperiences: 0, lastAt: 0, priority: profile.priorities.includes(strand.id) },
  ]))
  const recentCutoff = now - 28 * 86400000

  for (const session of progress.sessions || []) {
    const at = Number(session?.date) || 0
    const tags = Array.isArray(session?.foundationStrands)
      ? { strands: session.foundationStrands }
      : MODULE_FOUNDATION_TAGS[session?.module]
    if (!tags) continue
    for (const strandId of tags.strands) {
      if (!totals[strandId]) continue
      totals[strandId].experiences += 1
      totals[strandId].recentExperiences += at >= recentCutoff ? 1 : 0
      totals[strandId].lastAt = Math.max(totals[strandId].lastAt, at)
    }
  }

  return FOUNDATION_STRANDS.map(strand => {
    const item = totals[strand.id]
    const status = item.recentExperiences >= 4
      ? 'Well explored'
      : item.recentExperiences >= 1
        ? 'Developing'
        : item.experiences > 0
          ? 'Ready to revisit'
          : 'Not explored yet'
    return {
      ...item,
      status,
      coverage: Math.min(100, item.recentExperiences * 25),
    }
  })
}
