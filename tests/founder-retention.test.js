import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildFounderRetentionReport,
  retentionCalendarDayDiff,
} from '../src/utils/founderRetention.js'
import {
  answerRetentionFeedback,
  dismissRetentionFeedback,
  getRetentionFeedbackPrompt,
  mergeRetentionFeedback,
} from '../src/utils/retentionFeedback.js'
import {
  mergeRetentionTelemetry,
  recordActivationTelemetry,
  recordAvatarWorkshopTelemetry,
  recordRetentionOpen,
} from '../src/utils/retentionTelemetry.js'
import { onRequestGet } from '../functions/api/founder-retention.js'

const noon = day => new Date(`2026-07-${String(day).padStart(2, '0')}T12:00:00Z`).getTime()

function profile(id, day, ageGroup = 'early', userId = `user-${id}`) {
  return {
    id,
    user_id: userId,
    age_group: ageGroup,
    created_at: new Date(noon(day)).toISOString(),
  }
}

function progress(profileId, days, userId = `user-${profileId}`, extra = {}) {
  return {
    profile_id: profileId,
    user_id: userId,
    progress: {
      sessions: days.map((day, index) => ({ module: index % 2 ? 'math' : 'phonics', date: noon(day) })),
      ...extra,
    },
  }
}

test('calendar-day retention uses exact eligible D1, D3, and D7 cohorts', () => {
  const report = buildFounderRetentionReport({
    profiles: [
      profile('a', 20, 'early'),
      profile('b', 20, 'toddler'),
      profile('c', 26, 'junior'),
      profile('d', 27, 'early'),
      profile('school', 20, 'early', 'teacher'),
    ],
    progressRows: [
      progress('a', [20, 21, 23, 27]),
      progress('b', [20]),
      progress('c', [26]),
      progress('d', [27]),
      progress('school', [20, 21], 'teacher'),
    ],
    guardians: [
      { user_id: 'teacher', school_id: 'school-1', registered_at: new Date(noon(20)).toISOString() },
      { user_id: 'family-a', school_id: null, registered_at: new Date(noon(26)).toISOString() },
      { user_id: 'family-b', school_id: null, registered_at: new Date(noon(27)).toISOString() },
    ],
    authUsers: [
      { id: 'family-a', created_at: new Date(noon(26)).toISOString() },
      { id: 'family-b', created_at: new Date(noon(27)).toISOString() },
      { id: 'unlinked', created_at: new Date(noon(26)).toISOString() },
    ],
  }, { now: new Date(noon(27)), timezone: 'UTC', rangeDays: 30 })

  assert.equal(report.summary.totalProfiles, 4)
  assert.deepEqual(report.summary.d1, { day: 1, eligible: 3, retained: 1, rate: 33 })
  assert.deepEqual(report.summary.d3, { day: 3, eligible: 2, retained: 1, rate: 50 })
  assert.deepEqual(report.summary.d7, { day: 7, eligible: 2, retained: 1, rate: 50 })
  assert.equal(report.summary.newToday, 1)
  assert.equal(report.summary.totalFamilyAccounts, 2)
  assert.equal(report.summary.registeredToday, 1)
  assert.equal(report.summary.totalAuthAccounts, 3)
  assert.equal(report.summary.authCreatedYesterday, 2)
  assert.equal(report.summary.incompleteCreatedYesterday, 1)
  assert.equal(report.daily.at(-1).registrations, 1)
  assert.equal(report.summary.activeToday, 2)
  assert.equal(retentionCalendarDayDiff('2026-07-20', '2026-07-27'), 7)
})

test('local timezone controls cohort dates at the UTC boundary', () => {
  const sessionAt = new Date('2026-07-26T21:30:00Z').getTime()
  const report = buildFounderRetentionReport({
    profiles: [{ id: 'a', user_id: 'u', age_group: 'early', created_at: '2026-07-26T21:00:00Z' }],
    progressRows: [{ profile_id: 'a', user_id: 'u', progress: { sessions: [{ module: 'phonics', date: sessionAt }] } }],
  }, {
    now: new Date('2026-07-27T12:00:00Z'),
    timezone: 'Asia/Dubai',
    rangeDays: 7,
  })
  assert.equal(report.today, '2026-07-27')
  assert.equal(report.summary.newToday, 1)
  assert.equal(report.summary.sameDayActivation, 1)
  assert.equal(report.summary.d1.eligible, 0)
})

test('report is aggregate-only and never exposes profile names or identifiers', () => {
  const report = buildFounderRetentionReport({
    profiles: [{ ...profile('secret-id', 27), name: 'Private Child Name' }],
    progressRows: [progress('secret-id', [27])],
    guardians: [{ user_id: 'private-parent', registered_at: new Date(noon(27)).toISOString() }],
  }, { now: new Date(noon(27)), timezone: 'UTC' })
  const serialized = JSON.stringify(report)
  assert.equal(serialized.includes('Private Child Name'), false)
  assert.equal(serialized.includes('secret-id'), false)
  assert.equal(serialized.includes('user-secret-id'), false)
  assert.equal(serialized.includes('private-parent'), false)
})

test('activation funnel excludes obvious test accounts and counts families once', () => {
  const report = buildFounderRetentionReport({
    authUsers: [
      { id: 'real-family', email: 'parent@example.com', created_at: new Date(noon(27)).toISOString() },
      { id: 'uat-family', email: 'sanju.veed+flowuat@gmail.com', created_at: new Date(noon(27)).toISOString() },
    ],
    guardians: [
      { user_id: 'real-family', school_id: null, registered_at: new Date(noon(27)).toISOString() },
      { user_id: 'uat-family', school_id: null, registered_at: new Date(noon(27)).toISOString() },
    ],
    profiles: [
      profile('real-a', 27, 'early', 'real-family'),
      profile('real-b', 27, 'toddler', 'real-family'),
      profile('uat-a', 27, 'early', 'uat-family'),
    ],
    progressRows: [
      progress('real-a', [27], 'real-family'),
      progress('real-b', [], 'real-family'),
      progress('uat-a', [27], 'uat-family'),
    ],
  }, { now: new Date(noon(27)), timezone: 'UTC' })

  assert.equal(report.summary.excludedTestAccounts, 1)
  assert.equal(report.summary.totalAuthAccounts, 1)
  assert.equal(report.summary.totalFamilyAccounts, 1)
  assert.equal(report.summary.totalProfiles, 2)
  assert.equal(report.summary.familiesWithProfiles, 1)
  assert.equal(report.summary.firstMission, 1)
  assert.equal(report.summary.activatedFamilies, 1)
  assert.deepEqual(
    report.funnel.map(step => [step.id, step.count, step.rate]),
    [
      ['auth_accounts', 1, 100],
      ['guardian_saved', 1, 100],
      ['child_created', 1, 100],
      ['first_mission', 1, 100],
    ],
  )
  assert.equal(JSON.stringify(report).includes('uat-family'), false)
  assert.equal(JSON.stringify(report).includes('sanju.veed+flowuat@gmail.com'), false)
})

test('acquisition report connects first-touch source to activation and retention without identifiers', () => {
  const report = buildFounderRetentionReport({
    authUsers: [
      {
        id: 'chatgpt-family',
        email: 'one@example.com',
        created_at: new Date(noon(20)).toISOString(),
        user_metadata: { acquisition: { source: 'chatgpt.com', landingPath: '/families', timezone: 'Asia/Dubai' } },
      },
      {
        id: 'direct-family',
        email: 'two@example.com',
        created_at: new Date(noon(20)).toISOString(),
        user_metadata: { acquisition: { source: 'direct', landingPath: '/', timezone: 'Europe/London' } },
      },
    ],
    guardians: [
      { user_id: 'chatgpt-family', registered_at: new Date(noon(20)).toISOString() },
      { user_id: 'direct-family', registered_at: new Date(noon(20)).toISOString() },
    ],
    profiles: [
      profile('chatgpt-child', 20, 'early', 'chatgpt-family'),
      profile('direct-child', 20, 'early', 'direct-family'),
    ],
    progressRows: [
      progress('chatgpt-child', [20, 21], 'chatgpt-family'),
      progress('direct-child', [], 'direct-family'),
    ],
  }, { now: new Date(noon(27)), timezone: 'UTC' })

  const chatgpt = report.acquisition.sources.find(row => row.id === 'chatgpt.com')
  const direct = report.acquisition.sources.find(row => row.id === 'direct')
  assert.deepEqual(
    [chatgpt.accounts, chatgpt.parentSetups, chatgpt.profileFamilies, chatgpt.activatedFamilies, chatgpt.activationRate],
    [1, 1, 1, 1, 100],
  )
  assert.equal(chatgpt.d1.rate, 100)
  assert.equal(direct.activationRate, 0)
  assert.equal(report.acquisition.trackedAccounts, 2)
  assert.equal(JSON.stringify(report.acquisition).includes('chatgpt-family'), false)
  assert.equal(JSON.stringify(report.acquisition).includes('chatgpt-child'), false)
})

test('Day 3 and Day 7 parent prompts appear once and persist answers or dismissals', () => {
  const base = { sessions: [{ module: 'phonics', date: noon(20) }] }
  const d3 = getRetentionFeedbackPrompt(base, new Date(noon(23)))
  assert.equal(d3.id, 'd3')
  const answered = answerRetentionFeedback({}, 'd3', 'time', noon(23))
  assert.equal(getRetentionFeedbackPrompt({ ...base, retentionFeedback: answered }, new Date(noon(23))), null)
  const d7 = getRetentionFeedbackPrompt({ ...base, retentionFeedback: answered }, new Date(noon(27)))
  assert.equal(d7.id, 'd7')
  const dismissed = dismissRetentionFeedback(answered, 'd7', noon(27))
  assert.equal(getRetentionFeedbackPrompt({ ...base, retentionFeedback: dismissed }, new Date(noon(30))), null)
})

test('feedback and telemetry cloud merge retain independent device records', () => {
  const localFeedback = answerRetentionFeedback({}, 'd3', 'time', noon(23))
  const cloudFeedback = dismissRetentionFeedback({}, 'd7', noon(27))
  const mergedFeedback = mergeRetentionFeedback(localFeedback, cloudFeedback)
  assert.equal(mergedFeedback.d3.answer, 'time')
  assert.equal(mergedFeedback.d7.status, 'dismissed')

  const localTelemetry = recordRetentionOpen({}, { date: '2026-07-26', source: 'organic', at: noon(26) })
  const cloudTelemetry = recordRetentionOpen({}, { date: '2026-07-27', source: 'notification', at: noon(27) })
  const mergedTelemetry = mergeRetentionTelemetry(localTelemetry, cloudTelemetry)
  assert.equal(mergedTelemetry.events.length, 2)
  assert.deepEqual(mergedTelemetry.events.map(event => event.date), ['2026-07-26', '2026-07-27'])
})

test('workshop telemetry uses stable ids to prevent repeated taps inflating the funnel', () => {
  let telemetry = recordAvatarWorkshopTelemetry({}, {
    type: 'avatar_workshop_opened',
    date: '2026-07-27',
    at: noon(27),
  })
  telemetry = recordAvatarWorkshopTelemetry(telemetry, {
    type: 'avatar_workshop_opened',
    date: '2026-07-27',
    at: noon(27) + 1000,
  })
  telemetry = recordAvatarWorkshopTelemetry(telemetry, {
    type: 'avatar_item_equipped',
    date: '2026-07-27',
    itemId: 'sunny-cap',
    at: noon(27) + 2000,
  })
  telemetry = recordAvatarWorkshopTelemetry(telemetry, {
    type: 'avatar_item_equipped',
    date: '2026-07-27',
    itemId: 'sunny-cap',
    at: noon(27) + 3000,
  })

  assert.equal(telemetry.events.length, 2)
  assert.deepEqual(telemetry.events.map(event => event.type), [
    'avatar_workshop_opened',
    'avatar_item_equipped',
  ])
})

test('founder report returns an aggregate Avatar Workshop conversion funnel', () => {
  let telemetry = {}
  for (const event of [
    { type: 'avatar_workshop_opened', date: '2026-07-27', at: noon(27) + 1000 },
    { type: 'avatar_item_unlocked', date: '2026-07-27', itemId: 'sunny-cap', at: noon(27) + 2000 },
    { type: 'avatar_item_equipped', date: '2026-07-27', itemId: 'sunny-cap', at: noon(27) + 3000 },
  ]) {
    telemetry = recordAvatarWorkshopTelemetry(telemetry, event)
  }
  const report = buildFounderRetentionReport({
    profiles: [profile('workshop', 27)],
    progressRows: [progress('workshop', [27], 'user-workshop', {
      avatarWorkshop: {
        awards: {
          '2026-07-27:phonics': {
            coins: 1,
            moduleId: 'phonics',
            date: '2026-07-27',
            awardedAt: noon(27),
          },
        },
        purchases: {
          'sunny-cap': { cost: 1, purchasedAt: noon(27) + 2000 },
        },
        equipped: { head: 'sunny-cap' },
      },
      retentionTelemetry: telemetry,
    })],
  }, { now: new Date(noon(27)), timezone: 'UTC', rangeDays: 7 })

  assert.equal(report.avatarWorkshop.coinAwards, 1)
  assert.deepEqual(
    report.avatarWorkshop.funnel.map(step => [step.id, step.count, step.rate]),
    [
      ['coin_earned', 1, 100],
      ['workshop_opened', 1, 100],
      ['item_unlocked', 1, 100],
      ['item_equipped', 1, 100],
    ],
  )
  assert.equal(JSON.stringify(report.avatarWorkshop).includes('workshop'), true)
  assert.equal(JSON.stringify(report).includes('user-workshop'), false)
})

test('founder report isolates the aggregate Founding Families pilot cohort', () => {
  const pilotTelemetry = recordRetentionOpen({}, {
    date: '2026-07-20',
    source: 'founding_pilot',
    at: noon(20),
  })
  const organicTelemetry = recordRetentionOpen({}, {
    date: '2026-07-20',
    source: 'organic',
    at: noon(20),
  })
  const report = buildFounderRetentionReport({
    profiles: [
      profile('pilot-a', 20),
      profile('pilot-b', 20),
      profile('organic', 20),
    ],
    progressRows: [
      progress('pilot-a', [20, 21, 23, 27], 'user-pilot-a', { retentionTelemetry: pilotTelemetry }),
      progress('pilot-b', [], 'user-pilot-b', { retentionTelemetry: pilotTelemetry }),
      progress('organic', [20, 21], 'user-organic', { retentionTelemetry: organicTelemetry }),
    ],
  }, { now: new Date(noon(27)), timezone: 'UTC', rangeDays: 30 })

  assert.equal(report.foundingPilot.profiles, 2)
  assert.equal(report.foundingPilot.activated, 1)
  assert.equal(report.foundingPilot.activationRate, 50)
  assert.deepEqual(report.foundingPilot.d1, { day: 1, eligible: 2, retained: 1, rate: 50 })
  assert.deepEqual(report.foundingPilot.d3, { day: 3, eligible: 2, retained: 1, rate: 50 })
  assert.deepEqual(report.foundingPilot.d7, { day: 7, eligible: 2, retained: 1, rate: 50 })
  assert.equal(JSON.stringify(report).includes('pilot-a'), false)
})

test('founder report builds a sequential First Mission Return Loop funnel', () => {
  const openAt = noon(26) + 1000
  const report = buildFounderRetentionReport({
    profiles: [profile('returned', 20), profile('enabled', 20), profile('inactive', 20)],
    progressRows: [
      progress('returned', [20, 26], 'user-returned', {
        returnReminder: { enabled: true, lastSentDate: '2026-07-26' },
        retentionTelemetry: {
          events: [{ id: 'return-open', type: 'open', source: 'email', date: '2026-07-26', at: openAt }],
        },
        sessions: [
          { module: 'phonics', date: noon(20) },
          { module: 'math', date: openAt + 1000 },
        ],
      }),
      progress('enabled', [20], 'user-enabled', { returnReminder: { enabled: true } }),
      progress('inactive', [20]),
    ],
  }, { now: new Date(noon(27)), timezone: 'UTC', rangeDays: 7 })

  assert.deepEqual(
    report.returnLoop.funnel.map(step => [step.id, step.count, step.rate]),
    [
      ['first_mission', 3, 100],
      ['reminder_enabled', 2, 67],
      ['reminder_delivered', 1, 50],
      ['reminder_opened', 1, 100],
      ['learning_resumed', 1, 100],
    ],
  )
})

test('founder report identifies the exact first-session loss for newly created profiles', () => {
  const createdAt = '2026-08-06T08:00:00Z'
  const eventDate = '2026-08-06'
  const event = (value, type, at) => recordActivationTelemetry(value, {
    type,
    date: eventDate,
    module: 'phonics',
    at,
  })
  let tappedTelemetry = event({}, 'activation_dashboard_view', 1)
  tappedTelemetry = event(tappedTelemetry, 'activation_primary_tap', 2)
  let startedTelemetry = event(tappedTelemetry, 'activation_activity_started', 3)
  const report = buildFounderRetentionReport({
    profiles: [
      { id: 'created', user_id: 'u-created', age_group: 'early', created_at: createdAt },
      { id: 'viewed', user_id: 'u-viewed', age_group: 'early', created_at: createdAt },
      { id: 'tapped', user_id: 'u-tapped', age_group: 'early', created_at: createdAt },
      { id: 'started', user_id: 'u-started', age_group: 'early', created_at: createdAt },
      { id: 'completed', user_id: 'u-completed', age_group: 'early', created_at: createdAt },
    ],
    progressRows: [
      { profile_id: 'viewed', user_id: 'u-viewed', progress: { retentionTelemetry: event({}, 'activation_dashboard_view', 1) } },
      { profile_id: 'tapped', user_id: 'u-tapped', progress: { retentionTelemetry: tappedTelemetry } },
      { profile_id: 'started', user_id: 'u-started', progress: { retentionTelemetry: startedTelemetry } },
      { profile_id: 'completed', user_id: 'u-completed', progress: { retentionTelemetry: startedTelemetry, sessions: [{ module: 'phonics', date: Date.parse('2026-08-06T09:00:00Z') }] } },
    ],
  }, { now: new Date('2026-08-06T12:00:00Z'), timezone: 'UTC', rangeDays: 7 })

  assert.deepEqual(
    report.firstSession.funnel.map(step => [step.id, step.count, step.rate]),
    [
      ['profile_created', 5, 100],
      ['dashboard_viewed', 4, 80],
      ['primary_tapped', 3, 75],
      ['activity_started', 2, 67],
      ['activity_completed', 1, 50],
    ],
  )
})

test('founder report shows where profiles stop across the seven-step starter path', () => {
  const createdAt = '2026-08-06T08:00:00Z'
  const sessions = count => Array.from({ length: count }, (_, index) => ({
    module: index % 2 ? 'math' : 'phonics',
    date: Date.parse(`2026-08-06T${String(9 + index).padStart(2, '0')}:00:00Z`),
  }))
  const report = buildFounderRetentionReport({
    profiles: [
      { id: 'none', user_id: 'u-none', age_group: 'early', created_at: createdAt },
      { id: 'one', user_id: 'u-one', age_group: 'early', created_at: createdAt },
      { id: 'three', user_id: 'u-three', age_group: 'early', created_at: createdAt },
      { id: 'seven', user_id: 'u-seven', age_group: 'early', created_at: createdAt },
    ],
    progressRows: [
      { profile_id: 'one', user_id: 'u-one', progress: { sessions: sessions(1) } },
      { profile_id: 'three', user_id: 'u-three', progress: { sessions: sessions(3) } },
      { profile_id: 'seven', user_id: 'u-seven', progress: { sessions: sessions(7) } },
    ],
  }, { now: new Date('2026-08-06T20:00:00Z'), timezone: 'UTC', rangeDays: 7 })

  assert.equal(report.starterPath.profiles, 4)
  assert.deepEqual(
    report.starterPath.funnel.map(step => [step.count, step.rate]),
    [[3, 75], [2, 67], [2, 100], [1, 50], [1, 100], [1, 100], [1, 100]],
  )
  assert.equal(JSON.stringify(report.starterPath).includes('u-seven'), false)
})

test('founder API requires a signed-in allowlisted account', async () => {
  const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service', FOUNDER_EMAILS: 'founder@example.com' }
  const unauthorized = await onRequestGet({
    request: new Request('https://app.test/api/founder-retention'),
    env,
  })
  assert.equal(unauthorized.status, 401)

  const originalFetch = globalThis.fetch
  globalThis.fetch = async url => {
    if (String(url).includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'u', email: 'other@example.com' }))
    throw new Error('Unexpected data request')
  }
  try {
    const forbidden = await onRequestGet({
      request: new Request('https://app.test/api/founder-retention', { headers: { Authorization: 'Bearer token' } }),
      env,
    })
    assert.equal(forbidden.status, 403)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('founder API returns aggregate retention data without names', async () => {
  const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service', FOUNDER_EMAILS: 'founder@example.com' }
  const originalFetch = globalThis.fetch
  globalThis.fetch = async url => {
    const value = String(url)
    if (value.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'founder', email: 'founder@example.com' }))
    if (value.includes('/child_profiles')) return new Response(JSON.stringify([{ ...profile('a', 27), name: 'Must Not Leak' }]))
    if (value.includes('/child_progress')) return new Response(JSON.stringify([progress('a', [27])]))
    if (value.includes('/guardian_profiles')) return new Response(JSON.stringify([
      { user_id: 'family', school_id: null, registered_at: new Date(noon(27)).toISOString() },
    ]))
    if (value.includes('/auth/v1/admin/users')) return new Response(JSON.stringify({
      users: [{ id: 'family', created_at: new Date(noon(27)).toISOString(), email: 'must-not-leak@example.com' }],
    }))
    return new Response('[]')
  }
  try {
    const response = await onRequestGet({
      request: new Request('https://app.test/api/founder-retention?days=7&timezone=UTC', { headers: { Authorization: 'Bearer token' } }),
      env,
    })
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.summary.totalProfiles, 1)
    assert.equal(body.summary.totalFamilyAccounts, 1)
    assert.equal(body.summary.totalAuthAccounts, 1)
    assert.equal(body.summary.excludedTestAccounts, 0)
    assert.equal(JSON.stringify(body).includes('Must Not Leak'), false)
    assert.equal(JSON.stringify(body).includes('must-not-leak@example.com'), false)
    assert.equal(JSON.stringify(body).includes('"id":"a"'), false)
  } finally {
    globalThis.fetch = originalFetch
  }
})


test('open-only profiles are eligible and exact D14/D30 preserve activation semantics', () => {
  const report = buildFounderRetentionReport({
    profiles: [{ id: 'a', user_id: 'u', age_group: 'early', created_at: '2026-07-01T12:00:00Z' }],
    progressRows: [{ profile_id: 'a', user_id: 'u', progress: {
      sessions: [],
      retentionTelemetry: { events: [1, 15, 31].map(day => ({
        id: `open-${day}`, type: 'open', date: `2026-07-${String(day).padStart(2, '0')}`,
        at: Date.UTC(2026, 6, day, 12),
      })) },
    } }],
  }, { now: new Date('2026-08-01T12:00:00Z'), timezone: 'UTC' })
  assert.deepEqual(report.summary.d14, { day: 14, eligible: 1, retained: 1, rate: 100 })
  assert.deepEqual(report.summary.d30, { day: 30, eligible: 1, retained: 1, rate: 100 })
  assert.equal(report.summary.firstMission, 0)
  assert.equal(report.summary.sameDayActivation, 0)
})
