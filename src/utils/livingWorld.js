import { normaliseTreasureCollection } from './treasureRewards.js'
import { normalizeWonderWorld } from './wonderWorld.js'

export const LIVING_WORLD_AGE_COPY = {
  toddler: {
    eyebrow: 'My growing play world',
    intro: 'Plant, play, and put your treasures in your world.',
    discoveries: 'My magic friends',
  },
  early: {
    eyebrow: 'A world that remembers',
    intro: 'Grow surprises, hatch a friend, and decorate with treasures you earned.',
    discoveries: 'My discoveries',
  },
  junior: {
    eyebrow: 'My living explorer base',
    intro: 'Grow rare discoveries, display expedition rewards, and build your trophy wall.',
    discoveries: 'Discovery collection',
  },
}

export function getLivingWorldScore(progress = {}) {
  if (Number.isFinite(Number(progress?.totalStars))) return Math.max(0, Number(progress.totalStars))
  return Object.values(progress || {}).reduce((total, entry) => {
    const stars = entry && typeof entry === 'object' ? Number(entry.stars) : 0
    return total + (Number.isFinite(stars) ? Math.max(0, stars) : 0)
  }, 0)
}

export function getLivingWorldSummary(progress = {}) {
  const treasures = normaliseTreasureCollection(progress?.treasureCollection)
  const world = normalizeWonderWorld(progress?.wonderWorld)
  return {
    treasureCount: treasures.items.length,
    equippedCount: Object.values(treasures.equipped).filter(Boolean).length,
    discoveryCount: world.discoveries.length,
    plantedCount: world.plots.filter(Boolean).length,
    score: getLivingWorldScore(progress),
  }
}
