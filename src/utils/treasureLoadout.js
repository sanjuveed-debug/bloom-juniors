import { normaliseTreasureCollection } from './treasureRewards.js'

export const TREASURE_EVOLUTION_STAGES = [
  { level: 1, need: 0, name: 'New Explorer', aura: '#fbbf24', accessory: '✨' },
  { level: 2, need: 25, name: 'Adventure Ready', aura: '#22c55e', accessory: '⚡' },
  { level: 3, need: 60, name: 'Legendary Helper', aura: '#a855f7', accessory: '👑' },
]

export const TREASURE_QUEST_PATHS = {
  toddler: ['bodyparts', 'colours', 'shapes', 'numbers', 'animals', 'fruits', 'alphabet'],
  early: ['phonics', 'math', 'shapes', 'science', 'story', 'davinci', 'worldgk', 'exercise', 'planets'],
  junior: ['timestables', 'spelling', 'science', 'reading', 'worldmap', 'grammar', 'fractions', 'wordproblems', 'spirituality'],
}

export const TREASURE_QUEST_REWARDS = {
  toddler: [
    { id: 'giggle-spark', name: 'Giggle Spark', icon: '🌈', description: 'A rainbow giggle follows this treasure into every game.' },
    { id: 'tiny-parade', name: 'Tiny Treasure Parade', icon: '🎈', description: 'Your helper celebrates with a tiny floating parade.' },
    { id: 'sunny-footprints', name: 'Sunny Footprints', icon: '🐾', description: 'Golden footprints remember this treasure adventure.' },
  ],
  early: [
    { id: 'star-compass', name: 'Star Compass Trail', icon: '🧭', description: 'A permanent star trail glows around this treasure.' },
    { id: 'storybook-glow', name: 'Storybook Glow', icon: '📖', description: 'This treasure can open a magical story glow.' },
    { id: 'secret-doorbell', name: 'Secret Doorbell', icon: '🔔', description: 'A secret chime celebrates the treasure’s next journey.' },
  ],
  junior: [
    { id: 'aurora-signal', name: 'Aurora Signal', icon: '🌌', description: 'An aurora signal marks this treasure as a proven explorer.' },
    { id: 'master-trail', name: 'Master Explorer Trail', icon: '🗺️', description: 'A permanent expedition trail follows this treasure.' },
    { id: 'explorer-crest', name: 'Explorer Crest', icon: '🏅', description: 'A rare crest records a completed treasure expedition.' },
  ],
}

export const TREASURE_MODULE_NAMES = {
  bodyparts: 'Wiggle Meadow', colours: 'Rainbow Garden', shapes: 'Shape River', numbers: 'Counting Falls', animals: 'Animal Jungle', fruits: 'Fruit Orchard', alphabet: 'Letter Tree',
  phonics: 'Echo Jungle', math: 'Number Falls', science: 'Wonder Springs', story: 'Story Tree', davinci: 'Rainbow Mountain', worldgk: 'World Lookout', exercise: 'Movement Meadow', planets: 'Moon Camp',
  timestables: 'Multiplier Mine', spelling: 'Word Woods', reading: 'Story Ruins', worldmap: 'Atlas Lookout', grammar: 'Grammar Grove', fractions: 'Fraction Falls', wordproblems: 'Problem Pass', spirituality: 'Wisdom Temple',
}

const QUEST_REQUIRED = { toddler: 3, early: 4, junior: 5 }

function hashString(value = '') {
  return [...String(value)].reduce((hash, char) => ((hash * 33) + char.charCodeAt(0)) >>> 0, 17)
}

const EXACT_POWERS = {
  'junior-telescope': { id: 'focus', name: 'Explorer Focus', icon: '🔭', description: 'Makes the useful choices easier to study.' },
  'paintbrush-wand': { id: 'palette', name: 'Colour Magic', icon: '🖌️', description: 'Paints this round with a magical moving glow.' },
  'rainbow-backpack': { id: 'clue', name: 'Backpack Clue', icon: '🎒', description: 'At level 2, gently hides one unlikely choice.' },
  'moon-boots': { id: 'bounce', name: 'Brave Bounce', icon: '🥾', description: 'Adds a courage shield and a playful celebration.' },
  'story-crown': { id: 'story', name: 'Story Spark', icon: '👑', description: 'Turns the challenge into a tiny narrated quest.' },
}

const SLOT_POWERS = {
  buddy: { id: 'cheer', name: 'Friendship Cheer', icon: '💛', description: 'Your friend cheers beside you when a clue feels tricky.' },
  tool: { id: 'focus', name: 'Explorer Focus', icon: '🔎', description: 'Adds a gentle focus effect without giving away the answer.' },
  outfit: { id: 'bounce', name: 'Courage Spark', icon: '✨', description: 'Adds a brave new look and a celebration boost.' },
  room: { id: 'memory', name: 'Memory Spark', icon: '🌟', description: 'Brings a treasure-room memory into this challenge.' },
}

export function normaliseTreasureLoadout(loadout) {
  const source = loadout && typeof loadout === 'object' ? loadout : {}
  return {
    activeByModule: source.activeByModule && typeof source.activeByModule === 'object' ? source.activeByModule : {},
    itemProgress: source.itemProgress && typeof source.itemProgress === 'object' ? source.itemProgress : {},
    history: Array.isArray(source.history) ? source.history : [],
    quests: source.quests && typeof source.quests === 'object' ? source.quests : {},
    questHistory: Array.isArray(source.questHistory) ? source.questHistory : [],
    questRewards: source.questRewards && typeof source.questRewards === 'object' ? source.questRewards : {},
    updatedAt: Math.max(0, Number(source.updatedAt) || 0),
  }
}

export function getTreasureEvolution(itemProgress = {}) {
  const xp = Math.max(0, Number(itemProgress.xp) || 0)
  const stage = [...TREASURE_EVOLUTION_STAGES].reverse().find(entry => xp >= entry.need) || TREASURE_EVOLUTION_STAGES[0]
  const next = TREASURE_EVOLUTION_STAGES.find(entry => entry.need > xp) || null
  const start = stage.need
  const span = Math.max(1, (next?.need ?? stage.need) - start)
  return {
    ...stage,
    xp,
    next,
    progressPercent: next ? Math.min(100, Math.round(((xp - start) / span) * 100)) : 100,
  }
}

export function getTreasurePower(item = {}) {
  return EXACT_POWERS[item.id] || SLOT_POWERS[item.slot] || SLOT_POWERS.room
}

export function getOwnedTreasureItems(collection) {
  return normaliseTreasureCollection(collection).items.filter(item => item?.id)
}

function preferredTreasureId(collection, items) {
  const equipped = collection.equipped || {}
  return ['tool', 'buddy', 'outfit', 'room'].map(slot => equipped[slot]).find(id => items.some(item => item.id === id)) || items[0]?.id || ''
}

export function getActiveTreasure(collection, moduleId = '') {
  const current = normaliseTreasureCollection(collection)
  const loadout = normaliseTreasureLoadout(current.treasureLoadout)
  const items = getOwnedTreasureItems(current)
  if (!items.length) return null
  const selectedId = loadout.activeByModule[moduleId] || preferredTreasureId(current, items)
  const item = items.find(candidate => candidate.id === selectedId) || items[0]
  const itemProgress = loadout.itemProgress[item.id] || {}
  return { item, power: getTreasurePower(item), evolution: getTreasureEvolution(itemProgress), itemProgress }
}

export function setActiveTreasure(collection, moduleId, itemId, at = Date.now()) {
  const current = normaliseTreasureCollection(collection)
  if (!moduleId || !current.items.some(item => item?.id === itemId)) return current
  const treasureLoadout = normaliseTreasureLoadout(current.treasureLoadout)
  return {
    ...current,
    treasureLoadout: {
      ...treasureLoadout,
      activeByModule: { ...treasureLoadout.activeByModule, [moduleId]: itemId },
      updatedAt: at,
    },
  }
}

function awardXp(collection, { moduleId, itemId, amount, eventId, type, at }) {
  const current = normaliseTreasureCollection(collection)
  const treasureLoadout = normaliseTreasureLoadout(current.treasureLoadout)
  if (!itemId || !current.items.some(item => item?.id === itemId) || !eventId) return { collection: current, awarded: false, evolved: false }
  if (treasureLoadout.history.some(entry => entry.eventId === eventId)) return { collection: current, awarded: false, evolved: false }
  const previous = treasureLoadout.itemProgress[itemId] || {}
  const previousEvolution = getTreasureEvolution(previous)
  const nextProgress = {
    ...previous,
    xp: Math.max(0, Number(previous.xp) || 0) + Math.max(0, Number(amount) || 0),
    plays: Math.max(0, Number(previous.plays) || 0) + (type === 'learning-win' ? 1 : 0),
    powerUses: Math.max(0, Number(previous.powerUses) || 0) + (type === 'power-use' ? 1 : 0),
    lastUsedAt: at,
    modules: [...new Set([...(previous.modules || []), moduleId].filter(Boolean))].slice(-30),
  }
  const nextEvolution = getTreasureEvolution(nextProgress)
  return {
    awarded: true,
    evolved: nextEvolution.level > previousEvolution.level,
    evolution: nextEvolution,
    collection: {
      ...current,
      treasureLoadout: {
        ...treasureLoadout,
        itemProgress: { ...treasureLoadout.itemProgress, [itemId]: nextProgress },
        history: [...treasureLoadout.history, { eventId, itemId, moduleId, amount, type, at }].slice(-120),
        updatedAt: at,
      },
    },
  }
}

export function activateTreasurePower(collection, { moduleId, itemId, eventId, at = Date.now() } = {}) {
  return awardXp(collection, { moduleId, itemId, amount: 2, eventId: eventId || `power:${moduleId}:${itemId}:${at}`, type: 'power-use', at })
}

export function awardTreasureLearningXp(collection, { moduleId, eventId, amount = 6, at = Date.now() } = {}) {
  const active = getActiveTreasure(collection, moduleId)
  if (!active) return { collection: normaliseTreasureCollection(collection), awarded: false, evolved: false }
  return awardXp(collection, { moduleId, itemId: active.item.id, amount, eventId, type: 'learning-win', at })
}

function makeTreasureQuest(itemId, ageGroup, cycle) {
  const path = TREASURE_QUEST_PATHS[ageGroup] || TREASURE_QUEST_PATHS.early
  const required = QUEST_REQUIRED[ageGroup] || QUEST_REQUIRED.early
  const start = hashString(`${itemId}:${ageGroup}:${cycle}`) % path.length
  const steps = Array.from({ length: required }, (_, index) => path[(start + index) % path.length])
  const rewards = TREASURE_QUEST_REWARDS[ageGroup] || TREASURE_QUEST_REWARDS.early
  return {
    id: `${itemId}:${ageGroup}:quest-${cycle}`,
    itemId,
    ageGroup,
    cycle,
    steps,
    completed: [],
    reward: rewards[(cycle - 1) % rewards.length],
  }
}

export function getTreasureQuest(collection, itemId, ageGroup = 'early') {
  const current = normaliseTreasureCollection(collection)
  const loadout = normaliseTreasureLoadout(current.treasureLoadout)
  const item = current.items.find(entry => entry?.id === itemId)
  if (!item) return null
  const itemProgress = loadout.itemProgress[itemId] || {}
  const evolution = getTreasureEvolution(itemProgress)
  const cycle = Math.max(0, Number(itemProgress.questWins) || 0) + 1
  const generated = makeTreasureQuest(itemId, ageGroup, cycle)
  const saved = loadout.quests[itemId]
  const quest = saved?.id === generated.id ? { ...generated, ...saved, reward: generated.reward } : generated
  const completed = [...new Set(quest.completed || [])].filter(moduleId => quest.steps.includes(moduleId))
  const nextModule = quest.steps.find(moduleId => !completed.includes(moduleId)) || null
  return {
    ...quest,
    completed,
    required: quest.steps.length,
    nextModule,
    nextName: nextModule ? (TREASURE_MODULE_NAMES[nextModule] || nextModule) : '',
    locked: evolution.level < 2,
    xpToUnlock: Math.max(0, TREASURE_EVOLUTION_STAGES[1].need - evolution.xp),
    progressPercent: Math.round((completed.length / Math.max(1, quest.steps.length)) * 100),
  }
}

export function getTreasureQuestRewards(collection, itemId, ageGroup = 'early') {
  const current = normaliseTreasureCollection(collection)
  const loadout = normaliseTreasureLoadout(current.treasureLoadout)
  const definitions = TREASURE_QUEST_REWARDS[ageGroup] || TREASURE_QUEST_REWARDS.early
  const ownedIds = new Set(loadout.questRewards[itemId] || [])
  return definitions.filter(reward => ownedIds.has(reward.id))
}

export function advanceTreasureQuest(collection, { moduleId, itemId, ageGroup = 'early', eventId, at = Date.now() } = {}) {
  const current = normaliseTreasureCollection(collection)
  const loadout = normaliseTreasureLoadout(current.treasureLoadout)
  const quest = getTreasureQuest(current, itemId, ageGroup)
  if (!quest || quest.locked || !eventId || quest.nextModule !== moduleId || loadout.questHistory.some(entry => entry.eventId === eventId)) {
    return { collection: current, quest, advanced: false, completed: false }
  }
  const completedSteps = [...quest.completed, moduleId]
  const completed = completedSteps.length >= quest.required
  const previousProgress = loadout.itemProgress[itemId] || {}
  const questRewards = completed
    ? { ...loadout.questRewards, [itemId]: [...new Set([...(loadout.questRewards[itemId] || []), quest.reward.id])] }
    : loadout.questRewards
  const itemProgress = completed
    ? { ...loadout.itemProgress, [itemId]: { ...previousProgress, questWins: Math.max(0, Number(previousProgress.questWins) || 0) + 1, lastQuestAt: at } }
    : loadout.itemProgress
  const savedQuest = { ...quest, completed: completedSteps, updatedAt: at, completedAt: completed ? at : null }
  const nextCollection = {
    ...current,
    sparkleDust: current.sparkleDust + (completed ? 12 : 0),
    treasureLoadout: {
      ...loadout,
      quests: { ...loadout.quests, [itemId]: savedQuest },
      itemProgress,
      questRewards,
      questHistory: [...loadout.questHistory, { eventId, questId: quest.id, itemId, moduleId, completed, rewardId: completed ? quest.reward.id : null, at }].slice(-120),
      updatedAt: at,
    },
  }
  return {
    collection: nextCollection,
    quest: { ...savedQuest, required: quest.required, nextModule: completed ? null : quest.steps.find(step => !completedSteps.includes(step)), nextName: completed ? '' : TREASURE_MODULE_NAMES[quest.steps.find(step => !completedSteps.includes(step))] || '' },
    advanced: true,
    completed,
    reward: completed ? quest.reward : null,
  }
}

export function processTreasureLearningWin(collection, { moduleId, eventId, ageGroup = 'early', amount = 6, at = Date.now() } = {}) {
  const active = getActiveTreasure(collection, moduleId)
  if (!active) return { collection: normaliseTreasureCollection(collection), awarded: false, questAdvanced: false, questCompleted: false }
  const xpResult = awardTreasureLearningXp(collection, { moduleId, eventId, amount, at })
  if (!xpResult.awarded) return { ...xpResult, questAdvanced: false, questCompleted: false, quest: getTreasureQuest(xpResult.collection, active.item.id, ageGroup) }
  const questResult = advanceTreasureQuest(xpResult.collection, { moduleId, itemId: active.item.id, ageGroup, eventId, at })
  return {
    ...xpResult,
    collection: questResult.collection,
    quest: questResult.quest,
    questAdvanced: questResult.advanced,
    questCompleted: questResult.completed,
    questReward: questResult.reward,
  }
}

export function mergeTreasureLoadouts(localValue, cloudValue) {
  const local = normaliseTreasureLoadout(localValue)
  const cloud = normaliseTreasureLoadout(cloudValue)
  const newest = local.updatedAt >= cloud.updatedAt ? local : cloud
  const itemProgress = {}
  for (const id of new Set([...Object.keys(cloud.itemProgress), ...Object.keys(local.itemProgress)])) {
    const l = local.itemProgress[id] || {}, c = cloud.itemProgress[id] || {}
    const recent = (l.lastUsedAt || 0) >= (c.lastUsedAt || 0) ? l : c
    itemProgress[id] = {
      ...c, ...l, ...recent,
      xp: Math.max(l.xp || 0, c.xp || 0),
      plays: Math.max(l.plays || 0, c.plays || 0),
      powerUses: Math.max(l.powerUses || 0, c.powerUses || 0),
      questWins: Math.max(l.questWins || 0, c.questWins || 0),
      modules: [...new Set([...(c.modules || []), ...(l.modules || [])])].slice(-30),
    }
  }
  const history = []
  const seen = new Set()
  for (const entry of [...cloud.history, ...local.history]) {
    if (!entry?.eventId || seen.has(entry.eventId)) continue
    seen.add(entry.eventId); history.push(entry)
  }
  const questHistory = []
  const seenQuestEvents = new Set()
  for (const entry of [...cloud.questHistory, ...local.questHistory]) {
    if (!entry?.eventId || seenQuestEvents.has(entry.eventId)) continue
    seenQuestEvents.add(entry.eventId); questHistory.push(entry)
  }
  const quests = {}
  for (const itemId of new Set([...Object.keys(cloud.quests), ...Object.keys(local.quests)])) {
    const l = local.quests[itemId] || {}, c = cloud.quests[itemId] || {}
    quests[itemId] = (l.updatedAt || 0) >= (c.updatedAt || 0) ? l : c
  }
  const questRewards = {}
  for (const itemId of new Set([...Object.keys(cloud.questRewards), ...Object.keys(local.questRewards)])) {
    questRewards[itemId] = [...new Set([...(cloud.questRewards[itemId] || []), ...(local.questRewards[itemId] || [])])]
  }
  return {
    activeByModule: { ...cloud.activeByModule, ...newest.activeByModule },
    itemProgress,
    history: history.sort((a, b) => (a.at || 0) - (b.at || 0)).slice(-120),
    quests,
    questHistory: questHistory.sort((a, b) => (a.at || 0) - (b.at || 0)).slice(-120),
    questRewards,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
  }
}
