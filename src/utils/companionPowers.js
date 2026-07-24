import { getCompanionBond } from './companionBond.js'

export const COMPANION_POWER_VERSION = 1
export const COMPANION_POWER_MAX_CHARGES = 3
export const COMPANION_POWER_POINTS_PER_CHARGE = 10

const POWER_BY_LEVEL = {
  1: { id: 'guide-glow', name: 'Guide Glow', icon: '💡' },
  2: { id: 'clue-compass', name: 'Clue Compass', icon: '🧭' },
  3: { id: 'magic-lens', name: 'Magic Lens', icon: '🔎' },
  4: { id: 'guardian-light', name: 'Guardian Light', icon: '🛡️' },
  5: { id: 'legendary-light', name: 'Legendary Light', icon: '✨' },
}

export function normalizeCompanionPowers(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  const hasCharges = source.charges !== null && source.charges !== undefined && Number.isFinite(Number(source.charges))
  const hasCheckpoint = source.earnedCheckpoint !== null && source.earnedCheckpoint !== undefined && Number.isFinite(Number(source.earnedCheckpoint))
  return {
    version: COMPANION_POWER_VERSION,
    totalUsed: Math.max(0, Math.round(Number(source.totalUsed) || 0)),
    charges: hasCharges ? Math.max(0, Math.min(COMPANION_POWER_MAX_CHARGES, Math.round(Number(source.charges)))) : null,
    earnedCheckpoint: hasCheckpoint ? Math.max(0, Math.round(Number(source.earnedCheckpoint))) : null,
    activations: Array.isArray(source.activations) ? source.activations.filter(Boolean).slice(-60) : [],
  }
}

export function getCompanionPowerState(progress = {}, ageGroup = 'early') {
  const bond = getCompanionBond(progress)
  const saved = normalizeCompanionPowers(progress.companionPowers)
  // Every child starts with one try. Continued learning earns another charge
  // every ten friendship points, with a small three-charge bank.
  const totalEarned = 1 + Math.floor(bond.points / COMPANION_POWER_POINTS_PER_CHARGE)
  const checkpoint = saved.earnedCheckpoint === null ? totalEarned : saved.earnedCheckpoint
  const banked = saved.charges === null
    ? Math.max(0, Math.min(COMPANION_POWER_MAX_CHARGES, totalEarned - saved.totalUsed))
    : saved.charges
  const newlyEarned = Math.max(0, totalEarned - checkpoint)
  const available = Math.max(0, Math.min(COMPANION_POWER_MAX_CHARGES, banked + newlyEarned))
  const pointsIntoCharge = bond.points % COMPANION_POWER_POINTS_PER_CHARGE
  const power = POWER_BY_LEVEL[bond.stage.level] || POWER_BY_LEVEL[1]
  const removeCount = bond.stage.level >= 4 ? 2 : bond.stage.level >= 2 || ageGroup === 'toddler' ? 1 : 0

  return {
    ...saved,
    bond,
    power,
    available,
    maxCharges: COMPANION_POWER_MAX_CHARGES,
    pointsIntoCharge,
    pointsToNext: COMPANION_POWER_POINTS_PER_CHARGE - pointsIntoCharge,
    totalEarned,
    removeCount,
    revealCorrect: bond.stage.level >= 3 && ageGroup !== 'junior',
  }
}

export function spendCompanionPower(progress = {}, detail = {}) {
  const state = getCompanionPowerState(progress, detail.ageGroup)
  if (state.available <= 0) return progress
  const activation = {
    id: detail.id || `${Date.now()}-${state.totalUsed + 1}`,
    at: Number(detail.at) || Date.now(),
    moduleId: String(detail.moduleId || ''),
    ageGroup: String(detail.ageGroup || 'early'),
    powerId: state.power.id,
    effect: String(detail.effect || 'focus'),
  }
  return {
    ...progress,
    companionPowers: {
      version: COMPANION_POWER_VERSION,
      totalUsed: state.totalUsed + 1,
      charges: state.available - 1,
      earnedCheckpoint: state.totalEarned,
      activations: [...state.activations, activation].slice(-60),
    },
  }
}

export function mergeCompanionPowers(localValue = {}, cloudValue = {}) {
  const local = normalizeCompanionPowers(localValue)
  const cloud = normalizeCompanionPowers(cloudValue)
  const seen = new Set()
  const activations = []
  for (const entry of [...cloud.activations, ...local.activations]) {
    const key = entry?.id || `${entry?.at || 0}:${entry?.moduleId || ''}:${entry?.powerId || ''}`
    if (!key || seen.has(key)) continue
    seen.add(key)
    activations.push(entry)
  }
  activations.sort((a, b) => (a.at || 0) - (b.at || 0))
  const totalUsed = Math.max(local.totalUsed, cloud.totalUsed, activations.length)
  const numericBanks = [local.charges, cloud.charges].filter(Number.isFinite)
  const concurrentExtra = Math.max(0, totalUsed - Math.max(local.totalUsed, cloud.totalUsed))
  const charges = numericBanks.length
    ? Math.max(0, Math.min(...numericBanks) - concurrentExtra)
    : null
  return {
    version: COMPANION_POWER_VERSION,
    totalUsed,
    charges,
    earnedCheckpoint: Math.max(local.earnedCheckpoint || 0, cloud.earnedCheckpoint || 0) || null,
    activations: activations.slice(-60),
  }
}
