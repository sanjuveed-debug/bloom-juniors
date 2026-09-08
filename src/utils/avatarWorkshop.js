import { recordAvatarWorkshopTelemetry } from './retentionTelemetry.js'

export const AVATAR_WORKSHOP_ITEMS = [
  { id: 'starter-badge', name: 'Bloom Badge', emoji: '🌟', slot: 'badge', cost: 0, description: 'Your first explorer badge.' },
  { id: 'sunny-cap', name: 'Sunny Cap', emoji: '🧢', slot: 'head', cost: 1, description: 'A bright cap for new adventures.' },
  { id: 'wonder-glasses', name: 'Wonder Glasses', emoji: '👓', slot: 'face', cost: 2, description: 'Made for looking closely.' },
  { id: 'story-crown', name: 'Story Crown', emoji: '👑', slot: 'head', cost: 4, description: 'For brave readers and storytellers.' },
  { id: 'adventure-pack', name: 'Adventure Pack', emoji: '🎒', slot: 'back', cost: 5, description: 'Carry every clue you discover.' },
  { id: 'curiosity-scarf', name: 'Curiosity Scarf', emoji: '🧣', slot: 'back', cost: 6, description: 'A warm scarf for curious explorers.' },
  { id: 'moon-sparkles', name: 'Moon Sparkles', emoji: '✨', slot: 'effect', cost: 8, description: 'A trail of light for strong foundations.' },
]

const STARTER_ID = 'starter-badge'

function itemById(itemId) {
  return AVATAR_WORKSHOP_ITEMS.find(item => item.id === itemId)
}

export function normalizeAvatarWorkshop(value) {
  const source = value && typeof value === 'object' ? value : {}
  const awards = source.awards && typeof source.awards === 'object' ? source.awards : {}
  const purchases = source.purchases && typeof source.purchases === 'object' ? source.purchases : {}
  const owned = [...new Set([
    STARTER_ID,
    ...(Array.isArray(source.owned) ? source.owned : []),
    ...Object.keys(purchases),
  ])].filter(itemById)
  const equipped = {}

  for (const [slot, itemId] of Object.entries(source.equipped || {})) {
    const item = itemById(itemId)
    if (item?.slot === slot && owned.includes(itemId)) equipped[slot] = itemId
  }
  if (!equipped.badge) equipped.badge = STARTER_ID

  const earnedCoins = Object.values(awards).reduce(
    (sum, award) => sum + Math.max(0, Number(award?.coins) || 0),
    0
  )
  const spentCoins = Object.values(purchases).reduce(
    (sum, purchase) => sum + Math.max(0, Number(purchase?.cost) || 0),
    0
  )

  return {
    awards,
    purchases,
    owned,
    equipped,
    coins: Math.max(0, earnedCoins - spentCoins),
    lifetimeCoins: earnedCoins,
    updatedAt: Math.max(0, Number(source.updatedAt) || 0),
  }
}

export function awardBloomCoin(progress, moduleId, date, awardedAt = Date.now()) {
  const currentProgress = progress && typeof progress === 'object' ? progress : {}
  const workshop = normalizeAvatarWorkshop(currentProgress.avatarWorkshop)
  const cleanModule = String(moduleId || '').trim()
  const cleanDate = String(date || '').trim()
  const awardKey = cleanModule && cleanDate ? `${cleanDate}:${cleanModule}` : ''

  if (!awardKey || workshop.awards[awardKey]) {
    return {
      awarded: false,
      awardKey,
      workshop,
      progress: { ...currentProgress, avatarWorkshop: workshop },
    }
  }

  const nextWorkshop = normalizeAvatarWorkshop({
    ...workshop,
    awards: {
      ...workshop.awards,
      [awardKey]: { coins: 1, moduleId: cleanModule, date: cleanDate, awardedAt },
    },
    updatedAt: awardedAt,
  })

  return {
    awarded: true,
    awardKey,
    workshop: nextWorkshop,
    progress: {
      ...currentProgress,
      avatarWorkshop: nextWorkshop,
      retentionTelemetry: recordAvatarWorkshopTelemetry(currentProgress.retentionTelemetry, {
        type: 'bloom_coin_earned',
        date: cleanDate,
        module: cleanModule,
        at: awardedAt,
      }),
    },
  }
}

export function canEarnBloomCoin(value, moduleId, date) {
  const workshop = normalizeAvatarWorkshop(value)
  const cleanModule = String(moduleId || '').trim()
  const cleanDate = String(date || '').trim()
  return Boolean(cleanModule && cleanDate && !workshop.awards[`${cleanDate}:${cleanModule}`])
}

export function purchaseAvatarItem(value, itemId, purchasedAt = Date.now()) {
  const workshop = normalizeAvatarWorkshop(value)
  const item = itemById(itemId)
  if (!item) return { purchased: false, reason: 'missing', workshop }
  if (workshop.owned.includes(item.id)) return { purchased: false, reason: 'owned', workshop }
  if (workshop.coins < item.cost) return { purchased: false, reason: 'coins', workshop }

  const nextWorkshop = normalizeAvatarWorkshop({
    ...workshop,
    purchases: {
      ...workshop.purchases,
      [item.id]: { cost: item.cost, purchasedAt },
    },
    owned: [...workshop.owned, item.id],
    equipped: { ...workshop.equipped, [item.slot]: item.id },
    updatedAt: purchasedAt,
  })

  return { purchased: true, reason: 'purchased', item, workshop: nextWorkshop }
}

export function equipAvatarItem(value, itemId, equippedAt = Date.now()) {
  const workshop = normalizeAvatarWorkshop(value)
  const item = itemById(itemId)
  if (!item || !workshop.owned.includes(item.id)) {
    return { equipped: false, workshop }
  }

  const nextWorkshop = normalizeAvatarWorkshop({
    ...workshop,
    equipped: { ...workshop.equipped, [item.slot]: item.id },
    updatedAt: equippedAt,
  })
  return { equipped: true, item, workshop: nextWorkshop }
}

export function mergeAvatarWorkshops(localValue, cloudValue) {
  const local = normalizeAvatarWorkshop(localValue)
  const cloud = normalizeAvatarWorkshop(cloudValue)
  const newest = local.updatedAt >= cloud.updatedAt ? local : cloud

  return normalizeAvatarWorkshop({
    awards: { ...cloud.awards, ...local.awards },
    purchases: { ...cloud.purchases, ...local.purchases },
    owned: [...cloud.owned, ...local.owned],
    equipped: newest.equipped,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
  })
}

export function getEquippedAvatarItems(value) {
  const workshop = normalizeAvatarWorkshop(value)
  return Object.values(workshop.equipped).map(itemById).filter(Boolean)
}
