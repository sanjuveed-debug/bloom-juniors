import { FOUNDATION_ARCS, FOUNDATION_STRANDS } from '../data/foundationCurriculum.js'

export const FOUNDATION_PROFILE_VERSION = 1
export const FOUNDATION_PREVIEW_MODES = ['standard', 'preview-roots', 'preview-all']
export const FOUNDATION_BELIEF_MODES = ['family-and-world', 'world-overview', 'pause-faith']

const validStrands = new Set(FOUNDATION_STRANDS.map(strand => strand.id))
const validArcs = new Set(FOUNDATION_ARCS.map(arc => arc.id))

function cleanList(value, { max = 8, allowed } = {}) {
  const seen = new Set()
  const output = []
  for (const item of Array.isArray(value) ? value : []) {
    const clean = String(item || '').trim().replace(/\s+/g, ' ').slice(0, 60)
    if (!clean || seen.has(clean.toLowerCase()) || (allowed && !allowed.has(clean))) continue
    seen.add(clean.toLowerCase())
    output.push(clean)
    if (output.length >= max) break
  }
  return output
}

export function normalizeFoundationProfile(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    version: FOUNDATION_PROFILE_VERSION,
    roots: cleanList(source.roots, { max: 6 }),
    languages: cleanList(source.languages, { max: 6 }),
    traditions: cleanList(source.traditions, { max: 8 }),
    priorities: cleanList(source.priorities, { max: 3, allowed: validStrands }),
    interests: cleanList(source.interests, { max: 5, allowed: validArcs }),
    beliefMode: FOUNDATION_BELIEF_MODES.includes(source.beliefMode)
      ? source.beliefMode
      : 'family-and-world',
    previewMode: FOUNDATION_PREVIEW_MODES.includes(source.previewMode)
      ? source.previewMode
      : 'standard',
    notes: String(source.notes || '').trim().slice(0, 500),
    updatedAt: Math.max(0, Number(source.updatedAt) || 0),
  }
}

export function mergeFoundationProfile(local = {}, cloud = {}) {
  const left = normalizeFoundationProfile(local)
  const right = normalizeFoundationProfile(cloud)
  return left.updatedAt >= right.updatedAt ? left : right
}
