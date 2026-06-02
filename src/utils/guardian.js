const GUARDIAN_KEY = 'eduapp_guardian_v1'
const SESSION_KEY  = 'eduapp_session_v1'
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function cleanText(value, maxLength = 80) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0, 120)
}

function cleanPhone(value) {
  return String(value || '').trim().replace(/[^\d+()\-\s]/g, '').replace(/\s+/g, ' ').slice(0, 32)
}

function cleanPin(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 4)
}

// Proper email validation — requires valid local part, domain, and TLD (2+ letters)
export function isValidEmail(value) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(String(value || '').trim())
}

export function normalizeGuardianData(source = {}) {
  return {
    guardianName:    cleanText(source.guardianName),
    relationship:    cleanText(source.relationship, 40),
    email:           cleanEmail(source.email),
    phone:           cleanPhone(source.phone),
    pin:             cleanPin(source.pin),
    consentAccepted: Boolean(source.consentAccepted),
    registeredAt:    String(source.registeredAt || new Date().toISOString()),
    classroomMode:   Boolean(source.classroomMode),
  }
}

export function isGuardianRegistered(guardian) {
  return Boolean(
    guardian?.guardianName &&
    guardian?.relationship &&
    guardian?.email &&
    guardian?.pin?.length === 4 &&
    guardian?.consentAccepted,
  )
}

export function loadGuardian() {
  try {
    const raw = localStorage.getItem(GUARDIAN_KEY)
    if (!raw) return null
    const parsed = normalizeGuardianData(JSON.parse(raw))
    return isGuardianRegistered(parsed) ? parsed : null
  } catch { return null }
}

export function saveGuardian(guardian) {
  try {
    localStorage.setItem(GUARDIAN_KEY, JSON.stringify(normalizeGuardianData(guardian)))
  } catch {}
}

export function clearGuardian() {
  try { localStorage.removeItem(GUARDIAN_KEY) } catch {}
}

// ── Session management ────────────────────────────────────────────────────────

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.expiresAt || Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch { return null }
}

export function createSession() {
  const session = { loggedInAt: Date.now(), expiresAt: Date.now() + SESSION_DURATION_MS }
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch {}
  return session
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

// Returns true if PIN + email both match the registered guardian
export function verifyGuardianLogin(guardian, email, pin) {
  if (!guardian) return false
  return (
    guardian.email === cleanEmail(email) &&
    guardian.pin   === cleanPin(pin)
  )
}
