export const FOUNDING_PILOT_CAMPAIGN = 'founding_families_pilot'
export const FOUNDING_PILOT_SOURCE = 'founding_pilot'
export const FOUNDING_PILOT_KEY = 'eduapp_founding_pilot_v1'

export function getFoundingPilotState(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage.getItem(FOUNDING_PILOT_KEY) || 'null')
    if (!value?.enrolledAt) return null
    return {
      version: 1,
      enrolledAt: String(value.enrolledAt),
      campaign: FOUNDING_PILOT_CAMPAIGN,
    }
  } catch {
    return null
  }
}

export function enrollFoundingPilot(storage = globalThis.localStorage, now = new Date()) {
  const existing = getFoundingPilotState(storage)
  if (existing) return existing

  const next = {
    version: 1,
    enrolledAt: now.toISOString(),
    campaign: FOUNDING_PILOT_CAMPAIGN,
  }
  try {
    storage.setItem(FOUNDING_PILOT_KEY, JSON.stringify(next))
  } catch {}
  return next
}

export function getFoundingPilotStartUrl(origin = globalThis.location?.origin || '') {
  const params = new URLSearchParams({
    app: '1',
    utm_source: FOUNDING_PILOT_SOURCE,
    utm_medium: 'family_invite',
    utm_campaign: FOUNDING_PILOT_CAMPAIGN,
  })
  return `${String(origin).replace(/\/$/, '')}/?${params.toString()}`
}

