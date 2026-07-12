import { formatLocalDate } from './date.js'

export const WONDER_SEEDS = [
  { id: 'rainbow', name: 'Rainbow Seed', icon: '🌈', color: '#f43f83', discoveries: ['Prism Blossom', 'Rainbow Bell', 'Colour-Comet Flower'] },
  { id: 'moonberry', name: 'Moonberry Seed', icon: '🌙', color: '#7c3aed', discoveries: ['Moonberry Lantern', 'Starlight Pod', 'Dreamberry Bloom'] },
  { id: 'giggle', name: 'Giggle Seed', icon: '✨', color: '#16a34a', discoveries: ['Giggle Puff Tree', 'Ticklebell Tree', 'Bouncy Bloom'] },
  { id: 'cloud', name: 'Cloud Seed', icon: '☁️', color: '#0ea5e9', discoveries: ['Cloud Candy Vine', 'Raindrop Lantern', 'Sky Pillow Plant'] },
]

export function normalizeWonderWorld(value = {}) {
  return {
    version: 1,
    seedClaims: value.seedClaims || {},
    plots: Array.from({ length: 3 }, (_, index) => value.plots?.[index] || null),
    discoveries: Array.isArray(value.discoveries) ? value.discoveries : [],
  }
}

export function grantWonderSeed(value, claimKey, source = 'learning') {
  const world = normalizeWonderWorld(value)
  if (!claimKey || world.seedClaims[claimKey]) return world
  return {
    ...world,
    seedClaims: {
      ...world.seedClaims,
      [claimKey]: { at: Date.now(), source },
    },
  }
}

export function getAvailableSeedAwards(value) {
  const world = normalizeWonderWorld(value)
  const used = new Set([
    ...world.plots.filter(Boolean).map(plot => plot.awardId),
    ...world.discoveries.map(item => item.awardId),
  ])
  return Object.keys(world.seedClaims).filter(id => !used.has(id))
}

export function plantWonderSeed(value, plotIndex, seedId, today = formatLocalDate()) {
  const world = normalizeWonderWorld(value)
  const awardId = getAvailableSeedAwards(world)[0]
  if (!awardId || world.plots[plotIndex] || !WONDER_SEEDS.some(seed => seed.id === seedId)) return world
  const plots = [...world.plots]
  plots[plotIndex] = { awardId, seedId, plantedDate: today, plantedAt: Date.now() }
  return { ...world, plots }
}

export function isWonderPlotReady(plot, today = formatLocalDate()) {
  return Boolean(plot?.plantedDate && plot.plantedDate !== today)
}

function hashString(value = '') {
  return [...value].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7)
}

export function revealWonderPlot(value, plotIndex, today = formatLocalDate()) {
  const world = normalizeWonderWorld(value)
  const plot = world.plots[plotIndex]
  if (!isWonderPlotReady(plot, today)) return { world, discovery: null }
  const seed = WONDER_SEEDS.find(item => item.id === plot.seedId) || WONDER_SEEDS[0]
  const name = seed.discoveries[hashString(plot.awardId) % seed.discoveries.length]
  const discovery = {
    id: `discovery:${plot.awardId}`,
    awardId: plot.awardId,
    seedId: plot.seedId,
    name,
    revealedAt: Date.now(),
    revealedDate: today,
  }
  const plots = [...world.plots]
  plots[plotIndex] = null
  return {
    world: { ...world, plots, discoveries: [...world.discoveries, discovery].slice(-60) },
    discovery,
  }
}

export function mergeWonderWorld(localValue, cloudValue) {
  const local = normalizeWonderWorld(localValue)
  const cloud = normalizeWonderWorld(cloudValue)
  const seedClaims = { ...cloud.seedClaims, ...local.seedClaims }
  const discoveriesByAward = new Map()
  for (const item of [...cloud.discoveries, ...local.discoveries]) {
    if (!item?.awardId) continue
    const current = discoveriesByAward.get(item.awardId)
    if (!current || (item.revealedAt || 0) > (current.revealedAt || 0)) discoveriesByAward.set(item.awardId, item)
  }
  const discoveries = [...discoveriesByAward.values()].sort((a, b) => (a.revealedAt || 0) - (b.revealedAt || 0)).slice(-60)
  const discoveredAwards = new Set(discoveries.map(item => item.awardId))
  const activeByAward = new Map()
  for (const plot of [...cloud.plots, ...local.plots].filter(Boolean)) {
    if (!plot.awardId || discoveredAwards.has(plot.awardId)) continue
    const current = activeByAward.get(plot.awardId)
    if (!current || (plot.plantedAt || 0) > (current.plantedAt || 0)) activeByAward.set(plot.awardId, plot)
  }
  const active = [...activeByAward.values()].sort((a, b) => (a.plantedAt || 0) - (b.plantedAt || 0)).slice(-3)
  return { version: 1, seedClaims, plots: [active[0] || null, active[1] || null, active[2] || null], discoveries }
}
