const optInKey = (profileId) => `bj_digest_optin_${profileId}`
const sentKey  = (profileId) => `bj_digest_sent_${profileId}`

export function isDigestOptedIn(profileId) {
  return localStorage.getItem(optInKey(profileId)) === 'true'
}

export function setDigestOptIn(profileId, value) {
  localStorage.setItem(optInKey(profileId), String(value))
}

export function shouldSendAutoDigest(profileId) {
  if (!isDigestOptedIn(profileId)) return false
  const lastSent = localStorage.getItem(sentKey(profileId))
  if (!lastSent) return true
  const daysSince = (Date.now() - new Date(lastSent).getTime()) / (1000 * 60 * 60 * 24)
  return daysSince >= 7
}

export function markDigestSent(profileId) {
  localStorage.setItem(sentKey(profileId), new Date().toISOString())
}

const MODULE_INFO = {
  phonics:  { emoji: '🎤', label: 'Sound Pop',       color: '#FF6B9D' },
  math:     { emoji: '🔢', label: 'Number World',    color: '#F59E0B' },
  tricky:   { emoji: '⭐', label: 'Star Catch',       color: '#A78BFA' },
  story:    { emoji: '📖', label: 'Story Room',       color: '#34D399' },
  logic:    { emoji: '🧩', label: 'Puzzle Quest',     color: '#60A5FA' },
  shop:     { emoji: '🛍️', label: 'Coin Shop',        color: '#A78BFA' },
  science:  { emoji: '🔬', label: 'Wonder Lab',       color: '#C4B5FD' },
  worldgk:  { emoji: '🌍', label: 'World Explorer',   color: '#7DD3FC' },
  planets:  { emoji: '🪐', label: 'Planet World',     color: '#3B82F6' },
  anatomy:  { emoji: '🫀', label: 'My Body',           color: '#FB7185' },
  davinci:  { emoji: '🎨', label: 'Da Vinci Studio',  color: '#FCD34D' },
  exercise: { emoji: '🏃', label: 'Fun Exercise',     color: '#FCA5A5' },
}

export function buildDigestPayload({ progress, profileName, parentEmail }) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weekSessions = (progress.sessions || []).filter(s => s.date >= sevenDaysAgo)

  const moduleMap = {}
  weekSessions.forEach(s => {
    if (!moduleMap[s.module]) moduleMap[s.module] = { sessions: 0, totalAccuracy: 0, stars: 0 }
    moduleMap[s.module].sessions++
    moduleMap[s.module].totalAccuracy += (s.accuracy || 0)
    moduleMap[s.module].stars += (s.stars || 0)
  })

  const modules = Object.entries(moduleMap).map(([id, d]) => ({
    ...(MODULE_INFO[id] || { emoji: '📚', label: id, color: '#8B00FF' }),
    sessions: d.sessions,
    accuracy: d.sessions > 0 ? Math.round(d.totalAccuracy / d.sessions) : 0,
    stars: d.stars,
  })).sort((a, b) => b.stars - a.stars)

  const stats = {
    stars: weekSessions.reduce((s, x) => s + (x.stars || 0), 0),
    minutes: Math.round(weekSessions.reduce((s, x) => s + (x.duration || 0), 0) / 60),
    sessions: weekSessions.length,
  }

  const now = new Date()
  const weekAgo = new Date(sevenDaysAgo)
  const period = `${weekAgo.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`

  return {
    parentEmail,
    parentName: 'Parent',
    childName: profileName || 'Your child',
    period,
    stats,
    modules,
    topModule: modules[0] || null,
    streakDays: progress.loginStreak || 0,
  }
}

export async function sendDigestEmail(payload) {
  const res = await fetch('/api/weekly-digest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.ok
}
