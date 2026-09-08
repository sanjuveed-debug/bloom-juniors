import { formatLocalDate } from './date.js'
import { normalizePushSubscription } from './pushSubscription.js'

export const DEFAULT_RETURN_REMINDER_TIME = '18:00'

const SETUP_STATUSES = new Set(['', 'dismissed', 'email', 'push'])

function validTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ''))
}

export function normalizeReturnReminder(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  const setupStatus = String(source.setupStatus || '')
  return {
    enabled: source.enabled === true,
    pushEnabled: source.pushEnabled === true && Boolean(normalizePushSubscription(source.pushSubscription)),
    pushSubscription: normalizePushSubscription(source.pushSubscription),
    time: validTime(source.time) ? source.time : DEFAULT_RETURN_REMINDER_TIME,
    timezone: String(source.timezone || 'UTC').slice(0, 80),
    lastSentDate: String(source.lastSentDate || ''),
    setupStatus: SETUP_STATUSES.has(setupStatus) ? setupStatus : '',
    setupUpdatedAt: Math.max(0, Number(source.setupUpdatedAt) || 0),
    reactivationCampaign: String(source.reactivationCampaign || '').slice(0, 80),
    reactivationSentAt: Math.max(0, Number(source.reactivationSentAt) || 0),
    updatedAt: Math.max(0, Number(source.updatedAt) || 0),
  }
}

export function hasCompletedFirstMission(progress = {}) {
  return Array.isArray(progress.sessions) && progress.sessions.some(session => (
    session && typeof session === 'object' && String(session.module || '').trim()
  ))
}

export function shouldOfferFirstMissionReturnSetup(progress = {}, { classroomMode = false } = {}) {
  if (classroomMode || !hasCompletedFirstMission(progress)) return false
  const reminder = normalizeReturnReminder(progress.returnReminder)
  return !reminder.enabled && !reminder.pushEnabled && !reminder.setupStatus
}

export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function getZonedDateTime(date = new Date(), timezone = 'UTC') {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const value = type => parts.find(part => part.type === type)?.value || ''
    return {
      date: `${value('year')}-${value('month')}-${value('day')}`,
      time: `${value('hour')}:${value('minute')}`,
    }
  } catch {
    return {
      date: formatLocalDate(date),
      time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    }
  }
}

export function shouldSendReturnReminder(progress = {}, now = new Date()) {
  return getReturnReminderEligibility(progress, now).due
}

export function getReturnReminderEligibility(progress = {}, now = new Date()) {
  const reminder = normalizeReturnReminder(progress.returnReminder)
  if (!reminder.enabled && !reminder.pushEnabled) return { due: false, reason: 'disabled' }

  const local = getZonedDateTime(now, reminder.timezone)
  if (reminder.lastSentDate === local.date) return { due: false, reason: 'already_sent', local }
  if (String(progress.lastLoginDate || '') === local.date) return { due: false, reason: 'visited_today', local }
  if (local.time < reminder.time) return { due: false, reason: 'before_time', local }
  return { due: true, reason: 'due', local }
}

export function markReturnReminderSent(progress = {}, now = new Date()) {
  const reminder = normalizeReturnReminder(progress.returnReminder)
  const local = getZonedDateTime(now, reminder.timezone)
  return {
    ...progress,
    returnReminder: {
      ...reminder,
      lastSentDate: local.date,
      updatedAt: now.getTime(),
    },
  }
}

export function mergeReturnReminder(localValue = {}, cloudValue = {}) {
  const local = normalizeReturnReminder(localValue)
  const cloud = normalizeReturnReminder(cloudValue)
  const newer = local.updatedAt >= cloud.updatedAt ? local : cloud
  const latestSentDate = [local.lastSentDate, cloud.lastSentDate]
    .filter(Boolean)
    .sort()
    .at(-1) || ''
  const latestReactivation = local.reactivationSentAt >= cloud.reactivationSentAt ? local : cloud

  return {
    ...newer,
    lastSentDate: latestSentDate,
    reactivationCampaign: latestReactivation.reactivationCampaign,
    reactivationSentAt: latestReactivation.reactivationSentAt,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
  }
}
