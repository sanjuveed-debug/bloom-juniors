import { normalizeRetentionTelemetry } from './retentionTelemetry.js'
import { normalizeReturnReminder } from './returnReminder.js'

const DAY_MS = 86400000

export const REACTIVATION_CAMPAIGN_ID = 'first-mission-return-v1'
export const REACTIVATION_INACTIVE_DAYS = 3

export function isInternalTestEmail(email) {
  const value = String(email || '').trim().toLowerCase()
  return value.startsWith('sanju.veed+') || value.includes('uat') || value.endsWith('@test.com')
}

function latestActivityAt(progress = {}) {
  const sessionTimes = Array.isArray(progress.sessions)
    ? progress.sessions.map(session => Number(session?.date) || 0)
    : []
  const telemetryTimes = normalizeRetentionTelemetry(progress.retentionTelemetry).events
    .map(event => Number(event?.at) || 0)
  return Math.max(0, Number(progress.lastVisit) || 0, ...sessionTimes, ...telemetryTimes)
}

export function buildReactivationCandidates({
  profiles = [],
  progressRows = [],
  guardians = [],
  authUsers = [],
} = {}, {
  now = new Date(),
  inactiveDays = REACTIVATION_INACTIVE_DAYS,
  campaignId = REACTIVATION_CAMPAIGN_ID,
} = {}) {
  const nowAt = new Date(now).getTime()
  const inactiveBefore = nowAt - Math.max(1, Number(inactiveDays) || REACTIVATION_INACTIVE_DAYS) * DAY_MS
  const authByUser = new Map(authUsers.map(user => [user?.id, user]))
  const guardianByUser = new Map(guardians.map(guardian => [guardian?.user_id, guardian]))
  const profileByKey = new Map(profiles.map(profile => [`${profile?.user_id}:${profile?.id}`, profile]))
  const rowsByUser = new Map()

  progressRows.forEach(row => {
    const rows = rowsByUser.get(row?.user_id) || []
    rows.push(row)
    rowsByUser.set(row?.user_id, rows)
  })

  const candidates = []
  for (const [userId, rows] of rowsByUser) {
    const guardian = guardianByUser.get(userId)
    const authUser = authByUser.get(userId)
    const email = String(guardian?.email || authUser?.email || '').trim().toLowerCase()
    if (!guardian || guardian.school_id || !email || isInternalTestEmail(email)) continue

    const alreadySent = rows.some(row => {
      const reminder = normalizeReturnReminder(row?.progress?.returnReminder)
      return reminder.reactivationCampaign === campaignId && reminder.reactivationSentAt > 0
    })
    if (alreadySent) continue

    const eligible = rows
      .map(row => {
        const profile = profileByKey.get(`${userId}:${row?.profile_id}`)
        const progress = row?.progress && typeof row.progress === 'object' ? row.progress : {}
        const reminder = normalizeReturnReminder(progress.returnReminder)
        const lastActiveAt = latestActivityAt(progress)
        return { userId, email, guardian, profile, row, progress, reminder, lastActiveAt }
      })
      .filter(item => item.profile && !item.profile.school_id)
      .filter(item => item.reminder.enabled)
      .filter(item => Array.isArray(item.progress.sessions) && item.progress.sessions.length > 0)
      .filter(item => item.lastActiveAt > 0 && item.lastActiveAt <= inactiveBefore)
      .sort((left, right) => right.lastActiveAt - left.lastActiveAt)

    if (eligible[0]) candidates.push(eligible[0])
  }

  return candidates
}

export function markReactivationSent(progress = {}, {
  campaignId = REACTIVATION_CAMPAIGN_ID,
  sentAt = Date.now(),
} = {}) {
  const reminder = normalizeReturnReminder(progress.returnReminder)
  return {
    ...progress,
    returnReminder: {
      ...reminder,
      reactivationCampaign: campaignId,
      reactivationSentAt: Number(sentAt) || Date.now(),
      updatedAt: Number(sentAt) || Date.now(),
    },
  }
}
