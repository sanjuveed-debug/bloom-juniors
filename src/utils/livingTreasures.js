import { PROJECT_ADVENTURES } from './projectAdventures.js'
import { normaliseTreasureCollection } from './treasureRewards.js'

function normalizeAgeGroup(ageGroup) {
  return PROJECT_ADVENTURES[ageGroup] ? ageGroup : 'early'
}

const DEFAULT_ROOM_POSITIONS = [
  { x: 12, y: 66 }, { x: 82, y: 65 }, { x: 18, y: 28 }, { x: 76, y: 25 },
  { x: 35, y: 72 }, { x: 64, y: 72 }, { x: 34, y: 30 }, { x: 66, y: 31 },
]

const PERSONALITIES = [
  { motion: 'bounce', verb: 'BOUNCE', accent: '#f97316', mood: 'celebrate', line: name => `${name} bounced into action. Tap again and watch it leap!` },
  { motion: 'spin', verb: 'SPIN', accent: '#7c3aed', mood: 'guide', line: name => `${name} found a secret turning path. Round and round it goes!` },
  { motion: 'glow', verb: 'GLOW', accent: '#eab308', mood: 'story', line: name => `${name} is glowing with a memory from your adventure.` },
  { motion: 'wiggle', verb: 'WIGGLE', accent: '#ec4899', mood: 'celebrate', line: name => `${name} is doing its happiest treasure-room wiggle!` },
  { motion: 'float', verb: 'FLOAT', accent: '#0891b2', mood: 'story', line: name => `${name} feels light as a cloud. It is floating just for you.` },
  { motion: 'pulse', verb: 'POWER UP', accent: '#059669', mood: 'guide', line: name => `${name} powered up. Your room remembers that you earned it.` },
  { motion: 'sway', verb: 'DANCE', accent: '#db2777', mood: 'celebrate', line: name => `${name} heard the adventure music and started dancing!` },
  { motion: 'peek', verb: 'PEEK', accent: '#2563eb', mood: 'question', line: name => `${name} spotted something new. What do you think it can see?` },
]

export const TREASURE_SET_COPY = {
  toddler: { name: 'Treehouse Surprise Set', game: 'Rainbow Treasure Parade', icon: '🌈', action: 'START THE PARADE' },
  early: { name: 'Skyship Souvenir Set', game: 'Star Route Memory', icon: '🚀', action: 'START STAR ROUTE' },
  junior: { name: 'Explorer Evidence Set', game: 'Headquarters Signal Sequence', icon: '🧭', action: 'START SIGNAL SEQUENCE' },
}

function hashString(value = '') {
  let hash = 2166136261
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function getTreasurePersonality(item, ageGroup = 'early') {
  const age = normalizeAgeGroup(ageGroup)
  const hash = hashString(item?.id || item?.name)
  const personality = PERSONALITIES[(hash + ['toddler', 'early', 'junior'].indexOf(age)) % PERSONALITIES.length]
  const name = item?.name || 'Your treasure'
  return { ...personality, duration: 1.35 + (hash % 80) / 100, reaction: personality.line(name) }
}

export function getTreasureSet(ageGroup = 'early') {
  const age = normalizeAgeGroup(ageGroup)
  const adventures = PROJECT_ADVENTURES[age] || []
  return {
    ageGroup: age,
    ...(TREASURE_SET_COPY[age] || TREASURE_SET_COPY.early),
    items: adventures.map(adventure => ({ ...adventure.souvenir, destination: adventure.title })),
  }
}

export function getTreasureSetProgress(collection, ageGroup = 'early') {
  const current = normaliseTreasureCollection(collection)
  const set = getTreasureSet(ageGroup)
  const ownedIds = new Set(current.items.map(item => item.id))
  const owned = set.items.filter(item => ownedIds.has(item.id))
  return { ...set, owned, count: owned.length, required: set.items.length, unlocked: set.items.length > 0 && owned.length === set.items.length }
}

export function placeLivingTreasure(collection, item, position) {
  const current = normaliseTreasureCollection(collection)
  if (!item?.id || !current.items.some(owned => owned.id === item.id)) return current
  const existing = current.roomLayout[item.id]
  const fallback = DEFAULT_ROOM_POSITIONS[Object.keys(current.roomLayout).length % DEFAULT_ROOM_POSITIONS.length]
  const now = Date.now()
  return {
    ...current,
    roomLayout: {
      ...current.roomLayout,
      [item.id]: {
        x: Math.max(6, Math.min(90, Number(position?.x ?? existing?.x ?? fallback.x))),
        y: Math.max(14, Math.min(78, Number(position?.y ?? existing?.y ?? fallback.y))),
        scale: Number(existing?.scale) || 1,
        placedAt: existing?.placedAt || now,
        updatedAt: now,
      },
    },
    roomLayoutUpdatedAt: now,
  }
}

export function moveLivingTreasure(collection, itemId, position) {
  const current = normaliseTreasureCollection(collection)
  if (!current.roomLayout[itemId]) return current
  return placeLivingTreasure(current, current.items.find(item => item.id === itemId), position)
}

export function removeLivingTreasure(collection, itemId) {
  const current = normaliseTreasureCollection(collection)
  if (!current.roomLayout[itemId]) return current
  const roomLayout = { ...current.roomLayout }
  delete roomLayout[itemId]
  return { ...current, roomLayout, roomLayoutUpdatedAt: Date.now() }
}

export function interactWithLivingTreasure(collection, itemId, at = Date.now()) {
  const current = normaliseTreasureCollection(collection)
  if (!current.items.some(item => item.id === itemId)) return current
  const previous = current.treasureInteractions[itemId] || {}
  return {
    ...current,
    treasureInteractions: {
      ...current.treasureInteractions,
      [itemId]: { count: (Number(previous.count) || 0) + 1, lastAt: at },
    },
  }
}

export function recordTreasureSecretGame(collection, ageGroup, score, total, at = Date.now()) {
  const current = normaliseTreasureCollection(collection)
  const set = getTreasureSetProgress(current, ageGroup)
  if (!set.unlocked) return { collection: current, recorded: false, firstPerfect: false }
  const previous = current.secretGames[set.ageGroup] || {}
  const safeScore = Math.max(0, Math.min(Number(total) || 0, Number(score) || 0))
  const firstPerfect = safeScore === total && !previous.perfectAt
  return {
    recorded: true,
    firstPerfect,
    collection: {
      ...current,
      sparkleDust: current.sparkleDust + (firstPerfect ? 25 : 0),
      secretGames: {
        ...current.secretGames,
        [set.ageGroup]: {
          plays: (Number(previous.plays) || 0) + 1,
          best: Math.max(Number(previous.best) || 0, safeScore),
          total,
          lastPlayedAt: at,
          perfectAt: previous.perfectAt || (firstPerfect ? at : null),
        },
      },
    },
  }
}
