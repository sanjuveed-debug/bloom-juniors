import { formatLocalDate } from './date.js'
import { FOUNDING_PILOT_CAMPAIGN, FOUNDING_PILOT_SOURCE } from './foundingPilot.js'

const INSTALL_ID_KEY = 'eduapp_installation_id_v1'
const UTM_KEY = 'eduapp_utm_v1'
const FIRST_SEEN_AT_KEY = 'eduapp_first_seen_at_v1'
const DAILY_NOTIFY_PREFIX = 'eduapp_usage_notify_v1'
const GUARDIAN_KEY = 'eduapp_guardian_v1'
const RETENTION_STATE_PREFIX = 'eduapp_retention_state_v1'
const RETENTION_ACTIVITY_KEY = 'eduapp_retention_pending_activity_v1'

function getTodayStamp(date = new Date()) {
  return formatLocalDate(date)
}

function getProfileKey(profileName) {
  return String(profileName || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'unknown'
}

function getRetentionKey(profileId) {
  return `${RETENTION_STATE_PREFIX}:${String(profileId || 'default').slice(0, 120)}`
}

function calendarDayDiff(fromDate, toDate) {
  const parse = value => {
    const [year, month, day] = String(value || '').split('-').map(Number)
    return Date.UTC(year || 1970, (month || 1) - 1, day || 1)
  }
  return Math.max(0, Math.round((parse(toDate) - parse(fromDate)) / 86400000))
}

function getDeviceLabel() {
  try {
    const ua = navigator.userAgent || ''
    if (ua.includes('iPhone')) return 'iPhone'
    if (ua.includes('iPad')) return 'iPad'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('Mac')) return 'Mac'
    if (ua.includes('Windows')) return 'Windows'
  } catch {}
  return 'Desktop'
}

function getOrCreateInstallationId() {
  try {
    const existing = localStorage.getItem(INSTALL_ID_KEY)
    if (existing) return existing

    const nextId = globalThis.crypto?.randomUUID?.()
      || `visitor-${Math.random().toString(36).slice(2, 10)}`

    localStorage.setItem(INSTALL_ID_KEY, nextId)
    return nextId
  } catch {
    return 'visitor-unknown'
  }
}

function getFirstSeenAt() {
  try {
    const existing = localStorage.getItem(FIRST_SEEN_AT_KEY)
    if (existing) return { firstSeenAt: existing, isNewInstall: false }

    const now = new Date().toISOString()
    localStorage.setItem(FIRST_SEEN_AT_KEY, now)
    return { firstSeenAt: now, isNewInstall: true }
  } catch {
    return { firstSeenAt: new Date().toISOString(), isNewInstall: false }
  }
}

function getDailyNotifyKey(profileName) {
  return `${DAILY_NOTIFY_PREFIX}:${getProfileKey(profileName)}`
}

function hasNotifiedToday(profileName) {
  try {
    const today = getTodayStamp()
    return localStorage.getItem(getDailyNotifyKey(profileName)) === today
  } catch {
    return false
  }
}

function markNotifiedToday(profileName) {
  try {
    localStorage.setItem(getDailyNotifyKey(profileName), getTodayStamp())
  } catch {
    // Ignore storage failures; the next app open can retry the notification.
  }
}

function getGuardianDetails() {
  try {
    const raw = localStorage.getItem(GUARDIAN_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw)
    return {
      guardianName: String(parsed.guardianName || ''),
      guardianEmail: String(parsed.email || ''),
      guardianRelationship: String(parsed.relationship || ''),
    }
  } catch {
    return {}
  }
}

// ── UTM attribution ───────────────────────────────────────────────────────────
// Captures UTM params on first landing and persists them for the session so
// B2B campaign attribution (e.g. Arcadia school outreach) survives navigation.
export function captureAndGetUtm() {
  try {
    const params = new URLSearchParams(globalThis.location?.search || '')
    const source   = params.get('utm_source')
    const medium   = params.get('utm_medium')
    const campaign = params.get('utm_campaign')
    const content  = params.get('utm_content')
    const term     = params.get('utm_term')

    if (source || medium || campaign) {
      const utm = { source, medium, campaign, content, term, capturedAt: new Date().toISOString() }
      if (source !== 'return_push' && source !== 'push_test' && source !== 'return_reminder') {
        localStorage.setItem(UTM_KEY, JSON.stringify(utm))
      }
      return utm
    }

    const persisted = localStorage.getItem(UTM_KEY)
    return persisted ? JSON.parse(persisted) : {}
  } catch {
    return {}
  }
}

export function getStoredUtm() {
  try {
    const raw = localStorage.getItem(UTM_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// ── GA funnel events ──────────────────────────────────────────────────────────
// Silent funnel tracking via gtag (no user interaction needed). Key events:
//   sign_up            — guardian account created
//   first_activity     — first ever completed activity on this device
//   activity_complete  — every completed learning activity
//   demo_complete      — landing-page demo finished

const FIRST_ACTIVITY_KEY = 'eduapp_first_activity_done_v1'

export function trackEvent(name, params = {}) {
  try {
    const utm = getStoredUtm()
    const utmParams = utm.source ? {
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
    } : {}
    if (typeof window.gtag === 'function') window.gtag('event', name, { ...utmParams, ...params })
  } catch {}
}

export function trackEventOnce(key, name, params = {}, scope = 'session') {
  try {
    const storage = scope === 'local' ? localStorage : sessionStorage
    const storageKey = `eduapp_event_once_v1:${String(key || name).slice(0, 160)}`
    if (storage.getItem(storageKey)) return false
    storage.setItem(storageKey, new Date().toISOString())
    trackEvent(name, params)
    return true
  } catch {
    trackEvent(name, params)
    return true
  }
}

export function trackRetentionOpen({ profileId, ageGroup = 'unknown' }, now = new Date()) {
  try {
    if (!profileId) return null
    const today = getTodayStamp(now)
    const params = new URLSearchParams(globalThis.location?.search || '')
    const currentSource = params.get('utm_source') || ''
    const currentCampaign = params.get('utm_campaign') || ''
    const reminderContent = String(params.get('utm_content') || '').slice(0, 100)
    const notificationType = currentSource === 'push_test'
      ? 'test'
      : currentSource === 'return_push'
        ? 'daily_reminder'
        : ''
    const emailReminderOpen = currentSource === 'return_reminder'

    if (notificationType) {
      trackEventOnce(
        `notification-open:${profileId}:${today}:${notificationType}`,
        'notification_open',
        { notification_type: notificationType, reminder_content: reminderContent, age_group: ageGroup },
      )
    }
    if (emailReminderOpen) {
      trackEventOnce(
        `email-reminder-open:${profileId}:${today}`,
        'email_reminder_open',
        { age_group: ageGroup },
      )
    }

    const key = getRetentionKey(profileId)
    const previous = JSON.parse(localStorage.getItem(key) || 'null') || {}
    const firstActiveDate = previous.firstActiveDate || today
    const lastActiveDate = previous.lastActiveDate || ''
    const daysSinceFirst = calendarDayDiff(firstActiveDate, today)
    const daysSinceLast = lastActiveDate ? calendarDayDiff(lastActiveDate, today) : 0
    const isNewDay = lastActiveDate !== today
    const returnSource = notificationType
      ? 'notification'
      : emailReminderOpen
        ? 'email'
        : currentSource === FOUNDING_PILOT_SOURCE && currentCampaign === FOUNDING_PILOT_CAMPAIGN
          ? FOUNDING_PILOT_SOURCE
        : daysSinceLast > 0
          ? 'organic'
          : 'same_day'

    if (isNewDay) {
      trackEvent('daily_active_profile', {
        age_group: ageGroup,
        days_since_first: daysSinceFirst,
        days_since_last: daysSinceLast,
        return_source: returnSource,
      })
      if ([1, 3, 7, 14, 30].includes(daysSinceFirst)) {
        trackEventOnce(`exact-d${daysSinceFirst}:${profileId}`, `retention_day_${daysSinceFirst}`, {
          age_group: ageGroup,
          days_since_first: daysSinceFirst,
          return_source: returnSource,
        }, 'local')
      }

      const activeDates = [...new Set([...(previous.activeDates || []), today])].slice(-35)
      localStorage.setItem(key, JSON.stringify({
        firstActiveDate,
        lastActiveDate: today,
        activeDates,
      }))
    }

    if (notificationType || emailReminderOpen || daysSinceLast > 0) {
      sessionStorage.setItem(RETENTION_ACTIVITY_KEY, JSON.stringify({
        profileId,
        returnSource,
        notificationType,
        reminderContent,
        daysSinceLast,
      }))
    }

    return { today, daysSinceFirst, daysSinceLast, returnSource, isNewDay }
  } catch {
    return null
  }
}

export function trackActivityComplete(moduleId, ageGroup, profileId = '') {
  trackEvent('activity_complete', { module: moduleId, age_group: ageGroup })
  try {
    const pending = JSON.parse(sessionStorage.getItem(RETENTION_ACTIVITY_KEY) || 'null')
    if (pending && (!profileId || !pending.profileId || pending.profileId === profileId)) {
      trackEvent('return_activity', {
        module: moduleId,
        age_group: ageGroup,
        return_source: pending.returnSource || 'organic',
        notification_type: pending.notificationType || 'none',
        reminder_content: pending.reminderContent || 'none',
        days_since_last: Number(pending.daysSinceLast) || 0,
      })
      sessionStorage.removeItem(RETENTION_ACTIVITY_KEY)
    }
    if (!localStorage.getItem(FIRST_ACTIVITY_KEY)) {
      localStorage.setItem(FIRST_ACTIVITY_KEY, new Date().toISOString())
      trackEvent('first_activity', { module: moduleId, age_group: ageGroup })
    }
  } catch {}
}

export function logSessionStart({ profileName, avatar }) {
  try {
    if (hasNotifiedToday(profileName)) return

    const { firstSeenAt, isNewInstall } = getFirstSeenAt()
    const utm = captureAndGetUtm()
    const body = {
      profileName: profileName || 'Unknown',
      avatar: avatar || 'none',
      device: getDeviceLabel(),
      visitorId: getOrCreateInstallationId(),
      firstSeenAt,
      isNewInstall,
      pageUrl: globalThis.location?.href || '',
      language: navigator.language || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      localTimestamp: new Date().toLocaleString('en-GB', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      userAgent: navigator.userAgent || 'unknown',
      utmSource: utm.source || null,
      utmMedium: utm.medium || null,
      utmCampaign: utm.campaign || null,
      ...getGuardianDetails(),
    }

    fetch('/api/usage-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    })
      .then((response) => {
        if (response.ok) markNotifiedToday(profileName)
      })
      .catch(() => {})
  } catch {}
}
