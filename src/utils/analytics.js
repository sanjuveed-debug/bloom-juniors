import { formatLocalDate } from './date.js'

const INSTALL_ID_KEY = 'eduapp_installation_id_v1'
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

export function logSessionStart({ profileName, avatar }) {
  try {
    if (hasNotifiedToday(profileName)) return

    const { firstSeenAt, isNewInstall } = getFirstSeenAt()
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
