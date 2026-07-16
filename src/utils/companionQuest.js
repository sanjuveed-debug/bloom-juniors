import { formatLocalDate } from './date.js'
import { grantWonderSeed, normalizeWonderWorld } from './wonderWorld.js'

export const COMPANION_QUESTS = [
  { id: 'fireflies', icon: '✨', singular: 'firefly', plural: 'fireflies', title: 'Firefly Rescue', rewardLabel: 'Glow Seed' },
  { id: 'moon-stars', icon: '⭐', singular: 'moon star', plural: 'moon stars', title: 'Lost Moon Stars', rewardLabel: 'Moon Seed' },
  { id: 'rainbow-feathers', icon: '🪶', singular: 'rainbow feather', plural: 'rainbow feathers', title: 'Rainbow Feather Trail', rewardLabel: 'Rainbow Seed' },
  { id: 'tiny-keys', icon: '🗝️', singular: 'tiny key', plural: 'tiny keys', title: 'The Tiny Key Mystery', rewardLabel: 'Secret Seed' },
]

const REQUIRED_BY_AGE = { toddler: 3, early: 4, junior: 5 }

function hashString(value = '') {
  return [...String(value)].reduce((hash, char) => ((hash * 33) + char.charCodeAt(0)) >>> 0, 11)
}

export function getCompanionQuest(value, { date = formatLocalDate(), ageGroup = 'early', buddyId = 'yaagvi' } = {}) {
  const world = normalizeWonderWorld(value)
  const saved = world.companionQuests[date] || {}
  const definition = COMPANION_QUESTS.find(item => item.id === saved.id)
    || COMPANION_QUESTS[hashString(`${date}:${buddyId}`) % COMPANION_QUESTS.length]
  const required = saved.required || REQUIRED_BY_AGE[ageGroup] || REQUIRED_BY_AGE.early
  return {
    ...definition,
    date,
    ageGroup: saved.ageGroup || ageGroup,
    buddyId: saved.buddyId || buddyId,
    required,
    found: [...new Set(saved.found || [])].slice(0, required),
    completedAt: saved.completedAt || null,
  }
}

export function findCompanionQuestMarker(value, markerId, options = {}, at = Date.now()) {
  const world = normalizeWonderWorld(value)
  const quest = getCompanionQuest(world, options)
  if (!Number.isInteger(markerId) || markerId < 0 || markerId >= quest.required || quest.completedAt || quest.found.includes(markerId)) {
    return { world, quest, newlyFound: false, completed: false }
  }
  const found = [...quest.found, markerId]
  const completed = found.length >= quest.required
  const savedQuest = {
    id: quest.id,
    buddyId: quest.buddyId,
    ageGroup: quest.ageGroup,
    required: quest.required,
    found,
    updatedAt: at,
    completedAt: completed ? at : null,
  }
  let nextWorld = {
    ...world,
    companionQuests: { ...world.companionQuests, [quest.date]: savedQuest },
  }
  if (completed) nextWorld = grantWonderSeed(nextWorld, `companion:${quest.date}`, 'companion-quest')
  return {
    world: nextWorld,
    quest: { ...quest, found, completedAt: savedQuest.completedAt },
    newlyFound: true,
    completed,
  }
}
