const MAX_EVENTS = 120
const AVATAR_WORKSHOP_EVENT_TYPES = new Set([
  'bloom_coin_earned',
  'avatar_workshop_opened',
  'avatar_item_unlocked',
  'avatar_item_equipped',
])
const ACTIVATION_EVENT_TYPES = new Set([
  'activation_dashboard_view',
  'activation_primary_tap',
  'activation_activity_started',
  'activation_first_mission_completed',
])

function cleanEvent(event) {
  if (!event || typeof event !== 'object') return null
  const type = String(event.type || '').slice(0, 40)
  const date = String(event.date || '').slice(0, 10)
  if (!type || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  return {
    id: String(event.id || `${type}:${date}:${Number(event.at) || 0}`).slice(0, 160),
    type,
    date,
    at: Math.max(0, Number(event.at) || 0),
    source: String(event.source || 'organic').slice(0, 40),
    action: String(event.action || '').slice(0, 60),
    module: String(event.module || '').slice(0, 60),
    timezone: String(event.timezone || 'UTC').slice(0, 80),
  }
}

export function normalizeRetentionTelemetry(value = {}) {
  const events = Array.isArray(value?.events)
    ? value.events.map(cleanEvent).filter(Boolean)
    : []
  const unique = new Map()
  events.forEach(event => unique.set(event.id, event))
  return {
    version: 1,
    events: [...unique.values()]
      .sort((a, b) => a.at - b.at)
      .slice(-MAX_EVENTS),
  }
}

export function recordRetentionOpen(value, {
  date,
  source = 'organic',
  at = Date.now(),
  timezone = 'UTC',
} = {}) {
  const current = normalizeRetentionTelemetry(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return current
  const event = cleanEvent({
    id: `open:${date}:${source}`,
    type: 'open',
    date,
    source,
    at,
    timezone,
  })
  return normalizeRetentionTelemetry({ events: [...current.events, event] })
}

export function recordJourneyTelemetry(value, {
  type,
  date,
  action = '',
  module = '',
  at = Date.now(),
  timezone = 'UTC',
  oncePerDay = false,
} = {}) {
  const current = normalizeRetentionTelemetry(value)
  if (!type || !/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return current
  const id = oncePerDay
    ? `${type}:${date}`
    : `${type}:${date}:${action || module || 'event'}:${at}`
  const event = cleanEvent({ id, type, date, action, module, at, timezone })
  return normalizeRetentionTelemetry({ events: [...current.events, event] })
}

export function recordAvatarWorkshopTelemetry(value, {
  type,
  date,
  module = '',
  itemId = '',
  at = Date.now(),
  timezone = 'UTC',
} = {}) {
  const current = normalizeRetentionTelemetry(value)
  const cleanType = String(type || '')
  const cleanDate = String(date || '')
  const cleanModule = String(module || '').slice(0, 60)
  const cleanItemId = String(itemId || '').slice(0, 60)
  if (!AVATAR_WORKSHOP_EVENT_TYPES.has(cleanType) || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    return current
  }

  const id = cleanType === 'bloom_coin_earned'
    ? `${cleanType}:${cleanDate}:${cleanModule}`
    : cleanType === 'avatar_workshop_opened'
      ? `${cleanType}:${cleanDate}`
      : cleanType === 'avatar_item_unlocked'
        ? `${cleanType}:${cleanItemId}`
        : `${cleanType}:${cleanDate}:${cleanItemId}`
  const event = cleanEvent({
    id,
    type: cleanType,
    date: cleanDate,
    at,
    action: cleanItemId,
    module: cleanModule,
    timezone,
  })
  return normalizeRetentionTelemetry({ events: [...current.events, event] })
}

export function recordActivationTelemetry(value, {
  type,
  date,
  module = '',
  at = Date.now(),
  timezone = 'UTC',
} = {}) {
  const current = normalizeRetentionTelemetry(value)
  const cleanType = String(type || '')
  const cleanDate = String(date || '')
  if (!ACTIVATION_EVENT_TYPES.has(cleanType) || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    return current
  }
  const event = cleanEvent({
    id: `activation:${cleanType}`,
    type: cleanType,
    date: cleanDate,
    module: String(module || '').slice(0, 60),
    at,
    timezone,
  })
  return normalizeRetentionTelemetry({ events: [...current.events, event] })
}

export function mergeRetentionTelemetry(localValue = {}, cloudValue = {}) {
  const local = normalizeRetentionTelemetry(localValue)
  const cloud = normalizeRetentionTelemetry(cloudValue)
  return normalizeRetentionTelemetry({ events: [...cloud.events, ...local.events] })
}
