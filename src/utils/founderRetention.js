import { normalizeRetentionFeedback, RETENTION_FEEDBACK_PROMPTS } from './retentionFeedback.js'
import { normalizeRetentionTelemetry } from './retentionTelemetry.js'
import { normalizeReturnReminder } from './returnReminder.js'
import { normalizeAvatarWorkshop } from './avatarWorkshop.js'
import { countStarterPathCompletions, STARTER_PATH_LENGTH, STARTER_PATH_TRACKING_START } from './starterPath.js'
import { attributionLabel, normalizeAttribution } from './acquisition.js'
import {
  buildReactivationCandidates,
  isInternalTestEmail,
  REACTIVATION_CAMPAIGN_ID,
  REACTIVATION_INACTIVE_DAYS,
} from './founderReactivation.js'

const DAY_MS = 86400000
export const FIRST_SESSION_TRACKING_START = '2026-08-06'
export const ACQUISITION_TRACKING_START = '2026-08-10'

function dateKey(value, timezone = 'UTC') {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date)
    const get = type => parts.find(part => part.type === type)?.value || ''
    return `${get('year')}-${get('month')}-${get('day')}`
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

function parseDate(value) {
  const [year, month, day] = String(value || '').split('-').map(Number)
  return Date.UTC(year || 1970, (month || 1) - 1, day || 1)
}

export function retentionCalendarDayDiff(fromDate, toDate) {
  return Math.round((parseDate(toDate) - parseDate(fromDate)) / DAY_MS)
}

function percent(numerator, denominator) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : null
}

function dateRange(endDate, count) {
  const end = parseDate(endDate)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end - (count - 1 - index) * DAY_MS)
    return date.toISOString().slice(0, 10)
  })
}

function hasTreasureClaim(progress, ageGroup, date) {
  const claims = progress?.treasureCollection?.claims || {}
  return Boolean(claims[`${ageGroup}:${date}`])
}

function firstSession(sessions) {
  return sessions.reduce((earliest, session) => {
    const at = Number(session?.date) || 0
    return at && (!earliest || at < earliest) ? at : earliest
  }, 0)
}

function retentionMetric(children, day, today) {
  const eligible = children.filter(child =>
    child.firstActiveDate && retentionCalendarDayDiff(child.firstActiveDate, today) >= day
  )
  const retained = eligible.filter(child => child.activeDates.has(
    new Date(parseDate(child.firstActiveDate) + day * DAY_MS).toISOString().slice(0, 10),
  ))
  return { day, eligible: eligible.length, retained: retained.length, rate: percent(retained.length, eligible.length) }
}

function feedbackBreakdown(children, promptId) {
  const prompt = RETENTION_FEEDBACK_PROMPTS[promptId]
  const counts = Object.fromEntries(prompt.options.map(option => [option.id, 0]))
  let dismissed = 0
  children.forEach(child => {
    const record = child.feedback[promptId]
    if (record?.status === 'answered' && record.answer in counts) counts[record.answer] += 1
    if (record?.status === 'dismissed') dismissed += 1
  })
  const answered = Object.values(counts).reduce((sum, count) => sum + count, 0)
  return {
    id: promptId,
    question: prompt.question,
    answered,
    dismissed,
    options: prompt.options.map(option => ({ ...option, count: counts[option.id] })),
  }
}

export function buildFounderRetentionReport({
  profiles = [],
  progressRows = [],
  guardians = [],
  authUsers = [],
} = {}, {
  now = new Date(),
  timezone = 'UTC',
  rangeDays = 30,
} = {}) {
  const safeTimezone = String(timezone || 'UTC').slice(0, 80)
  const today = dateKey(now, safeTimezone)
  const testUsers = new Set(
    authUsers.filter(user => isInternalTestEmail(user?.email)).map(user => user?.id).filter(Boolean)
  )
  const schoolUsers = new Set(guardians.filter(guardian => guardian?.school_id).map(guardian => guardian.user_id))
  const authById = new Map(authUsers.map(user => [user?.id, user]))
  const familyAccounts = guardians
    .filter(guardian => !guardian?.school_id && !testUsers.has(guardian?.user_id))
    .map(guardian => ({
      userId: guardian?.user_id,
      registeredDate: guardian?.registered_at ? dateKey(guardian.registered_at, safeTimezone) : '',
      acquisition: normalizeAttribution(authById.get(guardian?.user_id)?.user_metadata?.acquisition),
    }))
  const guardianUserIds = new Set(familyAccounts.map(account => account.userId).filter(Boolean))
  const authAccounts = authUsers
    .filter(user => !testUsers.has(user?.id) && !schoolUsers.has(user?.id))
    .map(user => ({
      createdDate: user?.created_at ? dateKey(user.created_at, safeTimezone) : '',
      linkedToGuardian: guardianUserIds.has(user?.id),
      userId: user?.id,
      acquisition: normalizeAttribution(user?.user_metadata?.acquisition),
    }))
  const rowByProfile = new Map(progressRows.map(row => [`${row.user_id}:${row.profile_id}`, row]))
  const children = profiles
    .filter(profile => !profile?.school_id && !schoolUsers.has(profile?.user_id) && !testUsers.has(profile?.user_id))
    .map(profile => {
      const row = rowByProfile.get(`${profile.user_id}:${profile.id}`) || {}
      const progress = row.progress && typeof row.progress === 'object' ? row.progress : {}
      const sessions = (progress.sessions || [])
        .filter(session => Number(session?.date) > 0 && session?.module)
        .sort((a, b) => Number(a.date) - Number(b.date))
      const activeDates = new Set(sessions.map(session => dateKey(Number(session.date), safeTimezone)).filter(Boolean))
      normalizeRetentionTelemetry(progress.retentionTelemetry).events
        .filter(event => event.type === 'open')
        .forEach(event => activeDates.add(event.date))
      const firstAt = firstSession(sessions)
      return {
        userId: profile.user_id,
        ageGroup: String(profile.age_group || 'early'),
        createdDate: dateKey(profile.created_at || profile.createdAt || row.updated_at || now, safeTimezone),
        progress,
        sessions,
        activeDates,
        firstActiveDate: firstAt ? dateKey(firstAt, safeTimezone) : '',
        reminder: normalizeReturnReminder(progress.returnReminder),
        telemetry: normalizeRetentionTelemetry(progress.retentionTelemetry),
        feedback: normalizeRetentionFeedback(progress.retentionFeedback),
      }
    })

  const firstMission = children.filter(child => child.sessions.length > 0)
  const sameDayActivation = firstMission.filter(child => child.firstActiveDate === child.createdDate)
  const familiesWithProfiles = new Set(children.map(child => child.userId).filter(Boolean))
  const activatedFamilies = new Set(firstMission.map(child => child.userId).filter(Boolean))
  const newToday = children.filter(child => child.createdDate === today)
  const registeredToday = familyAccounts.filter(account => account.registeredDate === today)
  const authCreatedToday = authAccounts.filter(account => account.createdDate === today)
  const authCreatedYesterday = authAccounts.filter(account => retentionCalendarDayDiff(account.createdDate, today) === 1)
  const incompleteAuthAccounts = authAccounts.filter(account => !account.linkedToGuardian)
  const incompleteCreatedYesterday = incompleteAuthAccounts.filter(
    account => retentionCalendarDayDiff(account.createdDate, today) === 1
  )
  const activeToday = children.filter(child => child.activeDates.has(today))
  const d1 = retentionMetric(children, 1, today)
  const d3 = retentionMetric(children, 3, today)
  const d7 = retentionMetric(children, 7, today)
  const pilotChildren = children.filter(child => child.telemetry.events.some(
    event => event.type === 'open' && event.source === 'founding_pilot'
  ))
  const pilotActivated = pilotChildren.filter(child => child.sessions.length > 0)
  const recentDates = dateRange(today, Math.max(7, Math.min(90, Number(rangeDays) || 30)))
  const hasRecentWorkshopEvent = (child, type) => child.telemetry.events.some(
    event => event.type === type && recentDates.includes(event.date)
  )
  const earnedCoinProfiles = children.filter(child => {
    const workshop = normalizeAvatarWorkshop(child.progress.avatarWorkshop)
    return Object.values(workshop.awards).some(award => recentDates.includes(String(award?.date || '')))
      || hasRecentWorkshopEvent(child, 'bloom_coin_earned')
  })
  const workshopOpenedProfiles = earnedCoinProfiles.filter(child =>
    hasRecentWorkshopEvent(child, 'avatar_workshop_opened')
  )
  const itemUnlockedProfiles = workshopOpenedProfiles.filter(child => {
    const workshop = normalizeAvatarWorkshop(child.progress.avatarWorkshop)
    return Object.values(workshop.purchases).some(purchase =>
      recentDates.includes(dateKey(Number(purchase?.purchasedAt) || 0, safeTimezone))
    ) || hasRecentWorkshopEvent(child, 'avatar_item_unlocked')
  })
  const itemEquippedProfiles = itemUnlockedProfiles.filter(child =>
    hasRecentWorkshopEvent(child, 'avatar_item_equipped')
  )
  const workshopFunnel = [
    { id: 'coin_earned', label: 'Earned a Bloom Coin', count: earnedCoinProfiles.length, rate: earnedCoinProfiles.length ? 100 : null },
    { id: 'workshop_opened', label: 'Opened Avatar Workshop', count: workshopOpenedProfiles.length, rate: percent(workshopOpenedProfiles.length, earnedCoinProfiles.length) },
    { id: 'item_unlocked', label: 'Unlocked an item', count: itemUnlockedProfiles.length, rate: percent(itemUnlockedProfiles.length, workshopOpenedProfiles.length) },
    { id: 'item_equipped', label: 'Equipped an item', count: itemEquippedProfiles.length, rate: percent(itemEquippedProfiles.length, itemUnlockedProfiles.length) },
  ]

  const daily = recentDates.map(date => {
    const active = children.filter(child => child.activeDates.has(date)).length
    const completions = children.reduce((sum, child) =>
      sum + child.sessions.filter(session => dateKey(Number(session.date), safeTimezone) === date).length, 0)
    const newProfiles = children.filter(child => child.createdDate === date).length
    const registrations = familyAccounts.filter(account => account.registeredDate === date).length
    return { date, active, completions, newProfiles, registrations }
  })

  const stageCounts = {
    not_started: 0,
    first_stop: 0,
    reward_ready: 0,
    treasure_opened: 0,
    full_journey: 0,
  }
  children.forEach(child => {
    const todayModules = new Set(
      child.sessions
        .filter(session => dateKey(Number(session.date), safeTimezone) === today)
        .map(session => session.module),
    )
    const wonderDone = child.progress?.wonderWhy?.lastCompletedDate === today
    const treasure = hasTreasureClaim(child.progress, child.ageGroup, today)
    if (treasure && wonderDone) stageCounts.full_journey += 1
    else if (treasure) stageCounts.treasure_opened += 1
    else if (todayModules.size >= 2) stageCounts.reward_ready += 1
    else if (todayModules.size === 1) stageCounts.first_stop += 1
    else stageCounts.not_started += 1
  })

  const ages = ['toddler', 'early', 'junior'].map(ageGroup => {
    const group = children.filter(child => child.ageGroup === ageGroup)
    const groupFirst = group.filter(child => child.sessions.length > 0)
    return {
      ageGroup,
      profiles: group.length,
      activated: groupFirst.length,
      activationRate: percent(groupFirst.length, group.length),
      d1: retentionMetric(group, 1, today),
      d3: retentionMetric(group, 3, today),
      d7: retentionMetric(group, 7, today),
    }
  })

  const moduleMap = new Map()
  children.forEach(child => child.sessions.forEach(session => {
    const module = String(session.module)
    const current = moduleMap.get(module) || { module, completions: 0, profiles: new Set(), last7: 0 }
    current.completions += 1
    current.profiles.add(child)
    const sessionDate = dateKey(Number(session.date), safeTimezone)
    if (retentionCalendarDayDiff(sessionDate, today) >= 0 && retentionCalendarDayDiff(sessionDate, today) < 7) current.last7 += 1
    moduleMap.set(module, current)
  }))
  const modules = [...moduleMap.values()]
    .map(item => ({ module: item.module, completions: item.completions, uniqueProfiles: item.profiles.size, last7: item.last7 }))
    .sort((a, b) => b.last7 - a.last7 || b.completions - a.completions)
    .slice(0, 15)

  const pushEnabled = children.filter(child => child.reminder.pushEnabled).length
  const emailEnabled = children.filter(child => child.reminder.enabled).length
  const sentToday = children.filter(child => child.reminder.lastSentDate === today).length
  const notificationOpens = children.reduce((sum, child) =>
    sum + child.telemetry.events.filter(event =>
      event.type === 'open' &&
      ['notification', 'email'].includes(event.source) &&
      recentDates.includes(event.date)
    ).length, 0)
  const notificationReturns = children.filter(child =>
    child.telemetry.events.some(event =>
      event.type === 'open' &&
      ['notification', 'email'].includes(event.source) &&
      child.sessions.some(session =>
        dateKey(Number(session.date), safeTimezone) === event.date &&
        Number(session.date) >= event.at
      )
    )
  ).length
  const reminderEnabledProfiles = firstMission.filter(child => child.reminder.enabled || child.reminder.pushEnabled)
  const reminderDeliveredProfiles = reminderEnabledProfiles.filter(child => recentDates.includes(child.reminder.lastSentDate))
  const reminderOpenedProfiles = reminderDeliveredProfiles.filter(child => child.telemetry.events.some(event =>
    event.type === 'open' && ['notification', 'email'].includes(event.source) && recentDates.includes(event.date)
  ))
  const learningResumedProfiles = reminderOpenedProfiles.filter(child => child.telemetry.events.some(event =>
    event.type === 'open' &&
    ['notification', 'email'].includes(event.source) &&
    recentDates.includes(event.date) &&
    child.sessions.some(session => dateKey(Number(session.date), safeTimezone) === event.date && Number(session.date) >= event.at)
  ))
  const returnLoopFunnel = [
    { id: 'first_mission', label: 'Completed first mission', count: firstMission.length, rate: firstMission.length ? 100 : null },
    { id: 'reminder_enabled', label: 'Enabled a return reminder', count: reminderEnabledProfiles.length, rate: percent(reminderEnabledProfiles.length, firstMission.length) },
    { id: 'reminder_delivered', label: 'Received a reminder', count: reminderDeliveredProfiles.length, rate: percent(reminderDeliveredProfiles.length, reminderEnabledProfiles.length) },
    { id: 'reminder_opened', label: 'Opened from reminder', count: reminderOpenedProfiles.length, rate: percent(reminderOpenedProfiles.length, reminderDeliveredProfiles.length) },
    { id: 'learning_resumed', label: 'Resumed learning', count: learningResumedProfiles.length, rate: percent(learningResumedProfiles.length, reminderOpenedProfiles.length) },
  ]
  const reactivationCandidates = buildReactivationCandidates(
    { profiles, progressRows, guardians, authUsers },
    { now, inactiveDays: REACTIVATION_INACTIVE_DAYS, campaignId: REACTIVATION_CAMPAIGN_ID },
  )
  const activationCohort = children.filter(child => child.createdDate >= FIRST_SESSION_TRACKING_START)
  const hasActivationEvent = (child, type) => child.telemetry.events.some(event => event.type === type)
  const dashboardViewed = activationCohort.filter(child =>
    hasActivationEvent(child, 'activation_dashboard_view') || child.sessions.length > 0
  )
  const primaryTapped = dashboardViewed.filter(child =>
    hasActivationEvent(child, 'activation_primary_tap') || child.sessions.length > 0
  )
  const activityStarted = primaryTapped.filter(child =>
    hasActivationEvent(child, 'activation_activity_started') || child.sessions.length > 0
  )
  const firstActivityCompleted = activityStarted.filter(child => child.sessions.length > 0)
  const firstSessionFunnel = [
    { id: 'profile_created', label: 'Child profile created', count: activationCohort.length, rate: activationCohort.length ? 100 : null },
    { id: 'dashboard_viewed', label: 'First dashboard shown', count: dashboardViewed.length, rate: percent(dashboardViewed.length, activationCohort.length) },
    { id: 'primary_tapped', label: 'First activity tapped', count: primaryTapped.length, rate: percent(primaryTapped.length, dashboardViewed.length) },
    { id: 'activity_started', label: 'Activity started', count: activityStarted.length, rate: percent(activityStarted.length, primaryTapped.length) },
    { id: 'activity_completed', label: 'Activity completed', count: firstActivityCompleted.length, rate: percent(firstActivityCompleted.length, activityStarted.length) },
  ]
  const starterCohort = children.filter(child => child.createdDate >= STARTER_PATH_TRACKING_START)
  const starterCounts = new Map(starterCohort.map(child => [
    child,
    countStarterPathCompletions(child.progress, child.ageGroup),
  ]))
  const starterPathFunnel = Array.from({ length: STARTER_PATH_LENGTH }, (_, index) => {
    const step = index + 1
    const count = starterCohort.filter(child => starterCounts.get(child) >= step).length
    const previous = step === 1
      ? starterCohort.length
      : starterCohort.filter(child => starterCounts.get(child) >= step - 1).length
    return {
      id: `starter_${step}`,
      label: `Completed starter step ${step}`,
      count,
      rate: percent(count, previous),
    }
  })

  const acquisitionSources = [...new Set(authAccounts.map(account => account.acquisition.source))]
    .map(source => {
      const accounts = authAccounts.filter(account => account.acquisition.source === source)
      const userIds = new Set(accounts.map(account => account.userId).filter(Boolean))
      const savedFamilies = familyAccounts.filter(account => userIds.has(account.userId))
      const sourceChildren = children.filter(child => userIds.has(child.userId))
      const profileFamilies = new Set(sourceChildren.map(child => child.userId).filter(Boolean))
      const sourceActivatedFamilies = new Set(
        sourceChildren.filter(child => child.sessions.length > 0).map(child => child.userId).filter(Boolean)
      )
      return {
        id: source,
        label: attributionLabel(source),
        accounts: accounts.length,
        parentSetups: savedFamilies.length,
        profileFamilies: profileFamilies.size,
        activatedFamilies: sourceActivatedFamilies.size,
        activationRate: percent(sourceActivatedFamilies.size, profileFamilies.size),
        d1: retentionMetric(sourceChildren, 1, today),
        d3: retentionMetric(sourceChildren, 3, today),
        d7: retentionMetric(sourceChildren, 7, today),
      }
    })
    .sort((a, b) => b.accounts - a.accounts || a.label.localeCompare(b.label))

  const acquisitionBreakdown = (field, fallback) => [...new Set(authAccounts.map(account => account.acquisition[field] || fallback))]
    .map(value => {
      const accounts = authAccounts.filter(account => (account.acquisition[field] || fallback) === value)
      const userIds = new Set(accounts.map(account => account.userId).filter(Boolean))
      return {
        id: value,
        label: value,
        accounts: accounts.length,
        activatedFamilies: new Set(
          firstMission.filter(child => userIds.has(child.userId)).map(child => child.userId).filter(Boolean)
        ).size,
      }
    })
    .sort((a, b) => b.accounts - a.accounts || a.label.localeCompare(b.label))
    .slice(0, 10)

  return {
    generatedAt: new Date(now).toISOString(),
    timezone: safeTimezone,
    today,
    rangeDays: recentDates.length,
    summary: {
      totalFamilyAccounts: familyAccounts.length,
      registeredToday: registeredToday.length,
      totalAuthAccounts: authAccounts.length,
      authCreatedToday: authCreatedToday.length,
      authCreatedYesterday: authCreatedYesterday.length,
      incompleteAuthAccounts: incompleteAuthAccounts.length,
      incompleteCreatedYesterday: incompleteCreatedYesterday.length,
      excludedTestAccounts: testUsers.size,
      familiesWithProfiles: familiesWithProfiles.size,
      activatedFamilies: activatedFamilies.size,
      totalProfiles: children.length,
      newToday: newToday.length,
      activeToday: activeToday.length,
      firstMission: firstMission.length,
      firstMissionRate: percent(firstMission.length, children.length),
      sameDayActivation: sameDayActivation.length,
      sameDayActivationRate: percent(sameDayActivation.length, children.length),
      d1,
      d3,
      d7,
    },
    funnel: [
      { id: 'auth_accounts', label: 'Login accounts created', count: authAccounts.length, rate: authAccounts.length ? 100 : null },
      { id: 'guardian_saved', label: 'Parent setup saved', count: familyAccounts.length, rate: percent(familyAccounts.length, authAccounts.length) },
      { id: 'child_created', label: 'Created a child profile', count: familiesWithProfiles.size, rate: percent(familiesWithProfiles.size, familyAccounts.length) },
      { id: 'first_mission', label: 'Completed a first mission', count: activatedFamilies.size, rate: percent(activatedFamilies.size, familiesWithProfiles.size) },
    ],
    foundingPilot: {
      profiles: pilotChildren.length,
      activated: pilotActivated.length,
      activationRate: percent(pilotActivated.length, pilotChildren.length),
      d1: retentionMetric(pilotChildren, 1, today),
      d3: retentionMetric(pilotChildren, 3, today),
      d7: retentionMetric(pilotChildren, 7, today),
    },
    daily,
    journeyStages: [
      { id: 'not_started', label: 'No learning today', count: stageCounts.not_started },
      { id: 'first_stop', label: 'Stopped after one activity', count: stageCounts.first_stop },
      { id: 'reward_ready', label: 'Reward ready, not opened', count: stageCounts.reward_ready },
      { id: 'treasure_opened', label: 'Treasure opened', count: stageCounts.treasure_opened },
      { id: 'full_journey', label: 'Learning + Wonder complete', count: stageCounts.full_journey },
    ],
    ages,
    modules,
    notifications: {
      pushEnabled,
      emailEnabled,
      sentToday,
      opens: notificationOpens,
      learningReturns: notificationReturns,
    },
    returnLoop: { funnel: returnLoopFunnel },
    reactivation: {
      campaignId: REACTIVATION_CAMPAIGN_ID,
      inactiveDays: REACTIVATION_INACTIVE_DAYS,
      eligible: reactivationCandidates.length,
    },
    firstSession: {
      trackingStartedAt: FIRST_SESSION_TRACKING_START,
      funnel: firstSessionFunnel,
    },
    starterPath: {
      trackingStartedAt: STARTER_PATH_TRACKING_START,
      profiles: starterCohort.length,
      funnel: starterPathFunnel,
    },
    acquisition: {
      trackingStartedAt: ACQUISITION_TRACKING_START,
      trackedAccounts: authAccounts.filter(account => account.acquisition.source !== 'unknown').length,
      totalAccounts: authAccounts.length,
      sources: acquisitionSources,
      landingPages: acquisitionBreakdown('landingPath', 'Pre-tracking / unknown'),
      timezones: acquisitionBreakdown('timezone', 'Pre-tracking / unknown'),
    },
    avatarWorkshop: {
      funnel: workshopFunnel,
      coinAwards: children.reduce((sum, child) => {
        const workshop = normalizeAvatarWorkshop(child.progress.avatarWorkshop)
        return sum + Object.values(workshop.awards).filter(award =>
          recentDates.includes(String(award?.date || ''))
        ).length
      }, 0),
      uniqueProfiles: earnedCoinProfiles.length,
    },
    feedback: [
      feedbackBreakdown(children, 'd3'),
      feedbackBreakdown(children, 'd7'),
    ],
    definitions: {
      cohortStart: 'The local calendar date of a child profile\'s first completed learning session.',
      retention: 'Exact calendar-day return after the first completed session. Only eligible profiles are included.',
      foundingPilot: 'Profiles are included only when their first app entry carries the Founding Families pilot campaign marker.',
      privacy: 'Aggregate counts only. Child names, guardian emails, and profile identifiers are never returned.',
    },
  }
}
