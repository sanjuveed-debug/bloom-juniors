import { formatLocalDate } from './date.js'

export const WONDER_SEEDS = [
  { id: 'rainbow', name: 'Rainbow Seed', icon: '🌈', color: '#f43f83', discoveries: ['Prism Blossom', 'Rainbow Bell', 'Colour-Comet Flower'] },
  { id: 'moonberry', name: 'Moonberry Seed', icon: '🌙', color: '#7c3aed', discoveries: ['Moonberry Lantern', 'Starlight Pod', 'Dreamberry Bloom'] },
  { id: 'giggle', name: 'Giggle Seed', icon: '✨', color: '#16a34a', discoveries: ['Giggle Puff Tree', 'Ticklebell Tree', 'Bouncy Bloom'] },
  { id: 'cloud', name: 'Cloud Seed', icon: '☁️', color: '#0ea5e9', discoveries: ['Cloud Candy Vine', 'Raindrop Lantern', 'Sky Pillow Plant'] },
]

export const WONDER_DISCOVERY_DETAILS = {
  'Prism Blossom': { accent: '#f43f83', icon: '🌈', treasure: 'Prism Petal Lamp', reaction: 'Whoosh! Its petals paint a rainbow across the sky.' },
  'Rainbow Bell': { accent: '#f59e0b', icon: '🔔', treasure: 'Rainbow Chime', reaction: 'Ding-a-ling! A tiny rainbow dances to its song.' },
  'Colour-Comet Flower': { accent: '#38bdf8', icon: '☄️', treasure: 'Colour Comet Globe', reaction: 'Zoom! It sends a sparkling colour comet around your world.' },
  'Moonberry Lantern': { accent: '#8b5cf6', icon: '🏮', treasure: 'Moonberry Night Light', reaction: 'Glow, glow! The berries light a secret path to the moon.' },
  'Starlight Pod': { accent: '#4338ca', icon: '⭐', treasure: 'Pocket Starlight Pod', reaction: 'Pop! A pocketful of stars twinkles hello.' },
  'Dreamberry Bloom': { accent: '#c026d3', icon: '🫐', treasure: 'Dreamberry Pillow', reaction: 'Yawn! It whispers a silly, sparkly dream.' },
  'Giggle Puff Tree': { accent: '#22c55e', icon: '😄', treasure: 'Giggle Puff Buddy', reaction: 'Hee-hee! The whole tree jiggles when you tickle it.' },
  'Ticklebell Tree': { accent: '#84cc16', icon: '🎐', treasure: 'Ticklebell Chime', reaction: 'Ting, tickle, ting! Its bells laugh with you.' },
  'Bouncy Bloom': { accent: '#10b981', icon: '🟢', treasure: 'Bouncy Bloom Ball', reaction: 'Boing! It bounces higher every time you tap it.' },
  'Cloud Candy Vine': { accent: '#0ea5e9', icon: '🍬', treasure: 'Cloud Candy Jar', reaction: 'Puff! A sweet cloud curls into a funny shape.' },
  'Raindrop Lantern': { accent: '#2563eb', icon: '💧', treasure: 'Raindrop Lantern', reaction: 'Plip-plop! Glowing raindrops play a tiny tune.' },
  'Sky Pillow Plant': { accent: '#7dd3fc', icon: '☁️', treasure: 'Sky Pillow', reaction: 'Floof! The softest cloud gives your world a hug.' },
}

const GROWTH_STAGE_DELAY_MS = 30 * 60 * 1000

export function getWonderDiscoveryDetails(name = '') {
  return WONDER_DISCOVERY_DETAILS[name] || { accent: '#16a34a', icon: '✨', treasure: `${name || 'Wonder'} Keepsake`, reaction: 'Sparkle! Your discovery is happy to see you.' }
}

export function getWonderGrowthStage(plot, today = formatLocalDate(), now = Date.now()) {
  if (!plot?.plantedDate) return { id: 'empty', step: 0, label: 'Empty plot', progress: 0 }
  if (plot.plantedDate !== today) return { id: 'ready', step: 3, label: 'Ready to discover', progress: 100 }
  if (Math.max(0, now - (Number(plot.plantedAt) || now)) >= GROWTH_STAGE_DELAY_MS) {
    return { id: 'sprout', step: 2, label: 'A magical sprout appeared', progress: 66 }
  }
  return { id: 'seed', step: 1, label: 'Tucked into the soil', progress: 33 }
}

function pruneCompanionQuests(value = {}) {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).slice(-60))
}

export function normalizeWonderWorld(value = {}) {
  return {
    version: 2,
    seedClaims: value.seedClaims || {},
    plots: Array.from({ length: 3 }, (_, index) => value.plots?.[index] || null),
    discoveries: Array.isArray(value.discoveries) ? value.discoveries : [],
    companionQuests: pruneCompanionQuests(value.companionQuests),
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
  return getWonderGrowthStage(plot, today).id === 'ready'
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

export function interactWithWonderDiscovery(value, discoveryId, at = Date.now()) {
  const world = normalizeWonderWorld(value)
  if (!discoveryId) return world
  let changed = false
  const discoveries = world.discoveries.map(item => {
    if (item.id !== discoveryId) return item
    changed = true
    return { ...item, interactionCount: (Number(item.interactionCount) || 0) + 1, lastInteractedAt: at }
  })
  return changed ? { ...world, discoveries } : world
}

export function mergeWonderWorld(localValue, cloudValue) {
  const local = normalizeWonderWorld(localValue)
  const cloud = normalizeWonderWorld(cloudValue)
  const seedClaims = { ...cloud.seedClaims, ...local.seedClaims }
  const discoveriesByAward = new Map()
  for (const item of [...cloud.discoveries, ...local.discoveries]) {
    if (!item?.awardId) continue
    const current = discoveriesByAward.get(item.awardId)
    const itemUpdatedAt = Math.max(item.revealedAt || 0, item.lastInteractedAt || 0)
    const currentUpdatedAt = Math.max(current?.revealedAt || 0, current?.lastInteractedAt || 0)
    if (!current || itemUpdatedAt >= currentUpdatedAt) discoveriesByAward.set(item.awardId, item)
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
  const companionQuests = {}
  for (const date of new Set([...Object.keys(cloud.companionQuests), ...Object.keys(local.companionQuests)])) {
    const localQuest = local.companionQuests[date] || {}
    const cloudQuest = cloud.companionQuests[date] || {}
    const newest = (localQuest.updatedAt || localQuest.completedAt || 0) >= (cloudQuest.updatedAt || cloudQuest.completedAt || 0) ? localQuest : cloudQuest
    const found = [...new Set([...(cloudQuest.found || []), ...(localQuest.found || [])])]
    const completedAt = Math.max(cloudQuest.completedAt || 0, localQuest.completedAt || 0)
      || (found.length >= (newest.required || 99) ? (newest.updatedAt || Date.now()) : null)
    companionQuests[date] = {
      ...cloudQuest,
      ...localQuest,
      ...newest,
      found,
      completedAt,
    }
    if (completedAt && !seedClaims[`companion:${date}`]) seedClaims[`companion:${date}`] = { at: completedAt, source: 'companion-quest' }
  }
  return { version: 2, seedClaims, plots: [active[0] || null, active[1] || null, active[2] || null], discoveries, companionQuests: pruneCompanionQuests(companionQuests) }
}
