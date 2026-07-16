import { normaliseTreasureCollection } from './treasureRewards.js'
import { normalizeWonderWorld } from './wonderWorld.js'

export const COMPANION_BOND_STAGES = [
  { level: 1, name: 'New Friend', need: 0, next: 20, aura: '#f9a8d4', accessory: '🌱', ability: 'Waves hello' },
  { level: 2, name: 'Trail Buddy', need: 20, next: 50, aura: '#60a5fa', accessory: '🧭', ability: 'Finds hidden clues' },
  { level: 3, name: 'Magic Partner', need: 50, next: 100, aura: '#a78bfa', accessory: '✨', ability: 'Celebrates every learning win' },
  { level: 4, name: 'World Guardian', need: 100, next: 180, aura: '#34d399', accessory: '🛡️', ability: 'Protects the Living World' },
  { level: 5, name: 'Legendary Friend', need: 180, next: null, aura: '#facc15', accessory: '👑', ability: 'Unlocks a legendary glow' },
]

export function getActiveCompanion(progress = {}) {
  const collection = normaliseTreasureCollection(progress?.treasureCollection)
  const equippedId = collection.equipped?.buddy
  const equipped = collection.items.find(item => item.id === equippedId)
  const firstBuddy = collection.items.find(item => item.slot === 'buddy')
  return equipped || firstBuddy || {
    id: 'yaagvi-guide',
    name: 'Yaagvi',
    slot: 'buddy',
    image: '/yaagvi-3d-wave.png',
    message: 'Your explorer guide is ready for every learning adventure.',
  }
}

export function getCompanionLearningPoints(progress = {}) {
  const canonical = Number(progress?.totalStars)
  let points = Number.isFinite(canonical) ? Math.max(0, canonical) : 0
  if (!points) {
    points = Object.values(progress || {}).reduce((sum, entry) => {
      if (!entry || typeof entry !== 'object') return sum
      const stars = Math.max(0, Number(entry.stars) || 0)
      const played = Math.min(20, Math.max(0, Number(entry.played) || 0))
      return sum + stars + played
    }, 0)
  }
  const world = normalizeWonderWorld(progress?.wonderWorld)
  const completedQuests = Object.values(world.companionQuests).filter(quest => quest?.completedAt).length
  return Math.max(0, Math.round(points + world.discoveries.length * 3 + completedQuests * 8 + Math.min(14, Number(progress?.loginStreak) || 0)))
}

export function getCompanionBond(progress = {}) {
  const points = getCompanionLearningPoints(progress)
  const stage = [...COMPANION_BOND_STAGES].reverse().find(item => points >= item.need) || COMPANION_BOND_STAGES[0]
  const next = COMPANION_BOND_STAGES.find(item => item.need > points) || null
  const span = next ? next.need - stage.need : 1
  const progressPercent = next ? Math.min(100, Math.round(((points - stage.need) / span) * 100)) : 100
  return { companion: getActiveCompanion(progress), points, stage, next, progressPercent }
}
