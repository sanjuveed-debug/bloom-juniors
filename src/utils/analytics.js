import { formatLocalDate } from './date.js'

const INSTALL_ID_KEY = 'eduapp_installation_id_v1'
const UTM_KEY = 'eduapp_utm_v1'
const FIRST_SEEN_AT_KEY = 'eduapp_first_seen_at_v1'
const DAILY_NOTIFY_PREFIX = 'eduapp_usage_notify_v1'
const GUARDIAN_KEY = 'eduapp_guardian_v1'

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
function captureAndGetUtm() {
  try {
    const params = new URLSearchParams(globalThis.location?.search || '')
    const source   = params.get('utm_source')
    const medium   = params.get('utm_medium')
    const campaign = params.get('utm_campaign')
    const content  = params.get('utm_content')
    const term     = params.get('utm_term')

    if (source || medium || campaign) {
      const utm = { source, medium, campaign, content, term, capturedAt: new Date().toISOString() }
      localStorage.setItem(UTM_KEY, JSON.stringify(utm))
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

export function trackActivityComplete(moduleId, ageGroup) {
  trackEvent('activity_complete', { module: moduleId, age_group: ageGroup })
  try {
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
