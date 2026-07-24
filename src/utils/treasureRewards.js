const DAY_MS = 24 * 60 * 60 * 1000

export const TREASURE_ITEMS = [
  {
    id: 'explorer-dolly',
    name: 'Explorer Yaagvi Dolly',
    kind: 'dolly',
    slot: 'buddy',
    rarity: 'special',
    image: '/yaagvi-3d-wave.png',
    video: '/yaagvi-3d-wave.webm',
    message: 'Your very own explorer dolly! She can join every new adventure.',
  },
  { id: 'rainbow-backpack', name: 'Rainbow Adventure Bag', kind: 'outfit', slot: 'outfit', rarity: 'common', emoji: '🎒', message: 'A magical bag for carrying clues and discoveries.' },
  { id: 'junior-telescope', name: 'Explorer Telescope', kind: 'tool', slot: 'tool', rarity: 'common', emoji: '🔭', message: 'Use it to search for the next hidden world.' },
  { id: 'jungle-elephant', name: 'Pocket Elephant', kind: 'pet', slot: 'buddy', rarity: 'common', emoji: '🐘', message: 'A gentle jungle friend who remembers every trail.' },
  { id: 'moon-boots', name: 'Moon Bounce Boots', kind: 'outfit', slot: 'outfit', rarity: 'common', emoji: '🥾', message: 'Tiny moon boots for enormous explorer jumps.' },
  { id: 'paintbrush-wand', name: 'Paintbrush Wand', kind: 'tool', slot: 'tool', rarity: 'common', emoji: '🖌️', message: 'Paint a little colour into every new world.' },
  { id: 'cloud-puppy', name: 'Cloud Puppy', kind: 'pet', slot: 'buddy', rarity: 'common', emoji: '🐶', message: 'A soft little friend who follows brave explorers.' },
  { id: 'secret-door', name: 'Secret Garden Door', kind: 'decor', slot: 'room', rarity: 'common', emoji: '🚪', message: 'Place it in your room and imagine where it leads.' },
  { id: 'moon-fox', name: 'Starlight Fox', kind: 'pet', slot: 'buddy', rarity: 'rare', emoji: '🦊', message: 'A tiny glowing friend hatched from the moon egg.' },
  { id: 'story-crown', name: 'Storymaker Crown', kind: 'outfit', slot: 'outfit', rarity: 'rare', emoji: '👑', message: 'For brave readers and brilliant storytellers.' },
  { id: 'mermaid-cape', name: 'Ocean Explorer Cape', kind: 'outfit', slot: 'outfit', rarity: 'rare', emoji: '🧜‍♀️', message: 'A shimmering cape from the hidden ocean kingdom.' },
  { id: 'starship-bed', name: 'Starship Dream Bed', kind: 'decor', slot: 'room', rarity: 'rare', emoji: '🚀', message: 'Turn your treasure room into a launch pad for dreams.' },
]

export const MYSTERY_EGG_COMPANIONS = [
  { id: 'egg-cloud-dragon', name: 'Dazzle the Cloud Dragon', kind: 'pet', slot: 'buddy', rarity: 'special', emoji: '🐉', message: 'Dazzle makes a tiny rainbow whenever you try something brave.' },
  { id: 'egg-moon-bunny', name: 'Mimi the Moon Bunny', kind: 'pet', slot: 'buddy', rarity: 'special', emoji: '🐰', message: 'Mimi carries moonlight into every bedtime adventure.' },
  { id: 'egg-star-panda', name: 'Pip the Star Panda', kind: 'pet', slot: 'buddy', rarity: 'special', emoji: '🐼', message: 'Pip celebrates every clever answer with a sparkling tumble.' },
  { id: 'egg-pocket-unicorn', name: 'Twinkle the Pocket Unicorn', kind: 'pet', slot: 'buddy', rarity: 'special', emoji: '🦄', message: 'Twinkle finds secret paths that only kind explorers can see.' },
  { id: 'egg-ocean-otter', name: 'Bubbles the Ocean Otter', kind: 'pet', slot: 'buddy', rarity: 'special', emoji: '🦦', message: 'Bubbles brings a splash of play to difficult missions.' },
  { id: 'egg-firefly-fox', name: 'Glow the Firefly Fox', kind: 'pet', slot: 'buddy', rarity: 'special', emoji: '🦊', message: 'Glow lights up one new mystery every day.' },
]

export function normaliseTreasureCollection(collection) {
  const source = collection && typeof collection === 'object' ? collection : {}
  return {
    items: Array.isArray(source.items) ? source.items : [],
    claims: source.claims && typeof source.claims === 'object' ? source.claims : {},
    equipped: source.equipped && typeof source.equipped === 'object' ? source.equipped : {},
    history: Array.isArray(source.history) ? source.history : [],
    eggHatches: Array.isArray(source.eggHatches) ? source.eggHatches : [],
    sparkleDust: Math.max(0, Number(source.sparkleDust) || 0),
    claimStreak: Math.max(0, Number(source.claimStreak) || 0),
    lastClaimDate: typeof source.lastClaimDate === 'string' ? source.lastClaimDate : '',
    roomLayout: source.roomLayout && typeof source.roomLayout === 'object' ? source.roomLayout : {},
    roomLayoutUpdatedAt: Math.max(0, Number(source.roomLayoutUpdatedAt) || 0),
    treasureInteractions: source.treasureInteractions && typeof source.treasureInteractions === 'object' ? source.treasureInteractions : {},
    secretGames: source.secretGames && typeof source.secretGames === 'object' ? source.secretGames : {},
    treasureLoadout: source.treasureLoadout && typeof source.treasureLoadout === 'object' ? source.treasureLoadout : {},
  }
}

export function getMysteryEggProgress(collection, required = 3) {
  const current = normaliseTreasureCollection(collection)
  const usedClaimKeys = new Set(current.eggHatches.flatMap(hatch => hatch.claimKeys || []))
  const historyKeys = current.history
    .filter(entry => entry.source !== 'secret-world')
    .map(entry => entry.claimKey)
    .filter(Boolean)
  const allClaimKeys = [...new Set([...historyKeys, ...Object.keys(current.claims)])].sort()
  const availableClaimKeys = allClaimKeys.filter(key => !usedClaimKeys.has(key))
  const claimKeys = availableClaimKeys.slice(0, required)
  return {
    cycle: current.eggHatches.length + 1,
    feeds: Math.min(required, claimKeys.length),
    required,
    ready: claimKeys.length >= required,
    claimKeys,
  }
}

export function hatchMysteryEgg(collection, { earnedAt = Date.now(), required = 3 } = {}) {
  const current = normaliseTreasureCollection(collection)
  const progress = getMysteryEggProgress(current, required)
  if (!progress.ready) return { collection: current, item: null, hatched: false, duplicate: false }

  const companion = MYSTERY_EGG_COMPANIONS[current.eggHatches.length % MYSTERY_EGG_COMPANIONS.length]
  const duplicate = current.items.some(item => item.id === companion.id)
  const item = { ...companion, earnedAt, source: 'mystery-egg' }
  return {
    item: companion,
    hatched: true,
    duplicate,
    collection: {
      ...current,
      items: duplicate ? current.items : [...current.items, item],
      sparkleDust: current.sparkleDust + (duplicate ? 20 : 0),
      eggHatches: [...current.eggHatches, {
        id: `${companion.id}:${progress.cycle}`,
        companionId: companion.id,
        claimKeys: progress.claimKeys,
        earnedAt,
        duplicate,
      }].slice(-30),
    },
  }
}

function dateFromClaimKey(claimKey = '') {
  return String(claimKey).match(/(\d{4}-\d{2}-\d{2})$/)?.[1] || ''
}

function dayNumber(dateString) {
  const [year, month, day] = String(dateString).split('-').map(Number)
  if (!year || !month || !day) return null
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS)
}

function dayDifference(from, to) {
  const start = dayNumber(from)
  const end = dayNumber(to)
  return start == null || end == null ? null : end - start
}

export function deriveTreasureClaimStreak(claims = {}) {
  const dates = [...new Set(Object.keys(claims).map(dateFromClaimKey).filter(Boolean))].sort()
  if (!dates.length) return { streak: 0, lastClaimDate: '' }
  let streak = 1
  for (let index = dates.length - 1; index > 0; index -= 1) {
    if (dayDifference(dates[index - 1], dates[index]) !== 1) break
    streak += 1
  }
  return { streak, lastClaimDate: dates[dates.length - 1] }
}

export function getTreasureStreakProgress(collection) {
  const normalised = normaliseTreasureCollection(collection)
  const derived = deriveTreasureClaimStreak(normalised.claims)
  const streak = normalised.claimStreak || derived.streak
  const lastClaimDate = normalised.lastClaimDate || derived.lastClaimDate
  const rareUnlocked = streak > 0 && streak % 7 === 0
  return {
    streak,
    lastClaimDate,
    progress: rareUnlocked ? 7 : streak % 7,
    remaining: rareUnlocked ? 0 : 7 - (streak % 7),
    rareUnlocked,
  }
}

export function nextTreasure(collectionOrItems = [], { weekly = false } = {}) {
  const items = Array.isArray(collectionOrItems)
    ? collectionOrItems
    : normaliseTreasureCollection(collectionOrItems).items
  const ownedIds = new Set(items.map(item => item?.id).filter(Boolean))
  const commonPool = TREASURE_ITEMS.filter(item => item.rarity !== 'rare')
  const rarePool = TREASURE_ITEMS.filter(item => item.rarity === 'rare')
  const pools = weekly ? [rarePool, commonPool] : [commonPool, rarePool]
  for (const pool of pools) {
    const available = pool.find(item => !ownedIds.has(item.id))
    if (available) return available
  }
  const crystalNumber = items.filter(item => item?.id?.startsWith('star-crystal-')).length + 1
  return {
    id: `star-crystal-${crystalNumber}`,
    name: `Star Crystal ${crystalNumber}`,
    kind: 'crystal',
    slot: 'room',
    rarity: weekly ? 'rare' : 'special',
    emoji: '💎',
    message: 'A brand-new crystal for your growing explorer collection.',
  }
}

export function claimTreasureReward(collection, { claimKey, source = 'daily-path', earnedAt = Date.now() } = {}) {
  const current = normaliseTreasureCollection(collection)
  if (!claimKey || current.claims[claimKey]) {
    const existingId = current.claims[claimKey]
    return { collection: current, item: current.items.find(item => item.id === existingId) || null, claimed: false, duplicate: false, weekly: false }
  }

  const claimDate = dateFromClaimKey(claimKey)
  const derived = deriveTreasureClaimStreak(current.claims)
  const previousDate = current.lastClaimDate || derived.lastClaimDate
  const previousStreak = current.claimStreak || derived.streak
  const difference = previousDate && claimDate ? dayDifference(previousDate, claimDate) : null
  const nextStreak = difference === 1 ? previousStreak + 1 : difference === 0 ? previousStreak : 1
  const weekly = nextStreak > 0 && nextStreak % 7 === 0
  const reward = nextTreasure(current.items, { weekly })
  const duplicate = current.items.some(item => item.id === reward.id)
  const earnedItem = { ...reward, earnedAt, source, weekly }
  const nextItems = duplicate ? current.items : [...current.items, earnedItem]
  const sparkleDust = current.sparkleDust + (duplicate ? 10 : 0)

  return {
    item: reward,
    claimed: true,
    duplicate,
    weekly,
    collection: {
      ...current,
      items: nextItems,
      claims: { ...current.claims, [claimKey]: reward.id },
      history: [...current.history, { id: reward.id, claimKey, source, earnedAt, weekly, duplicate }].slice(-90),
      sparkleDust,
      claimStreak: nextStreak,
      lastClaimDate: claimDate || current.lastClaimDate,
    },
  }
}

export function claimWonderTreasureReward(collection, discovery, details = {}, earnedAt = Date.now()) {
  const current = normaliseTreasureCollection(collection)
  if (!discovery?.id) return { collection: current, item: null, claimed: false, duplicate: false }
  const claimKey = `wonder:${discovery.id}`
  const previous = current.history.find(entry => entry.claimKey === claimKey)
  if (previous) {
    return {
      collection: current,
      item: current.items.find(item => item.id === previous.id) || null,
      claimed: false,
      duplicate: Boolean(previous.duplicate),
    }
  }

  const slug = String(discovery.name || discovery.seedId || 'wonder')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const item = {
    id: `wonder-${slug}`,
    name: details.treasure || `${discovery.name} Keepsake`,
    kind: 'decor',
    slot: 'room',
    rarity: 'special',
    emoji: details.icon || '✨',
    message: `A magical keepsake grown by your ${discovery.name}.`,
  }
  const duplicate = current.items.some(owned => owned.id === item.id)
  return {
    item,
    claimed: true,
    duplicate,
    collection: {
      ...current,
      items: duplicate ? current.items : [...current.items, { ...item, earnedAt, source: 'secret-world' }],
      history: [...current.history, { id: item.id, claimKey, source: 'secret-world', earnedAt, duplicate }].slice(-90),
      sparkleDust: current.sparkleDust + (duplicate ? 10 : 0),
    },
  }
}

export function equipTreasureReward(collection, item) {
  const current = normaliseTreasureCollection(collection)
  if (!item?.id || !item?.slot || !current.items.some(owned => owned.id === item.id)) return current
  return { ...current, equipped: { ...current.equipped, [item.slot]: item.id } }
}
