import test from 'node:test'
import assert from 'node:assert/strict'

import {
  markReturnReminderSent,
  mergeReturnReminder,
  normalizeReturnReminder,
  hasCompletedFirstMission,
  shouldOfferFirstMissionReturnSetup,
  shouldSendReturnReminder,
} from '../src/utils/returnReminder.js'
import { onRequestPost } from '../functions/api/daily-reminders.js'
import { recordActivationTelemetry } from '../src/utils/retentionTelemetry.js'

const dueProgress = {
  lastLoginDate: '2026-07-24',
  returnReminder: {
    enabled: true,
    time: '18:00',
    timezone: 'UTC',
    lastSentDate: '',
  },
}

test('normalizes invalid reminder values to a safe default', () => {
  assert.deepEqual(normalizeReturnReminder({ enabled: 1, time: '29:90' }), {
    enabled: false,
    pushEnabled: false,
    pushSubscription: null,
    time: '18:00',
    timezone: 'UTC',
    lastSentDate: '',
    setupStatus: '',
    setupUpdatedAt: 0,
    reactivationCampaign: '',
    reactivationSentAt: 0,
    updatedAt: 0,
  })
})

test('first-session activation events are durable and idempotent', () => {
  let telemetry = recordActivationTelemetry({}, {
    type: 'activation_dashboard_view',
    date: '2026-08-06',
    at: 100,
  })
  telemetry = recordActivationTelemetry(telemetry, {
    type: 'activation_dashboard_view',
    date: '2026-08-06',
    at: 200,
  })
  telemetry = recordActivationTelemetry(telemetry, {
    type: 'activation_primary_tap',
    date: '2026-08-06',
    module: 'phonics',
    at: 300,
  })
  assert.equal(telemetry.events.length, 2)
  assert.deepEqual(telemetry.events.map(event => event.type), [
    'activation_dashboard_view',
    'activation_primary_tap',
  ])
})

test('offers return setup only after a completed first mission', () => {
  assert.equal(hasCompletedFirstMission({}), false)
  assert.equal(shouldOfferFirstMissionReturnSetup({}), false)

  const completed = { sessions: [{ module: 'phonics', date: 1 }] }
  assert.equal(hasCompletedFirstMission(completed), true)
  assert.equal(shouldOfferFirstMissionReturnSetup(completed), true)
  assert.equal(shouldOfferFirstMissionReturnSetup(completed, { classroomMode: true }), false)
  assert.equal(shouldOfferFirstMissionReturnSetup({
    ...completed,
    returnReminder: { enabled: true },
  }), false)
  assert.equal(shouldOfferFirstMissionReturnSetup({
    ...completed,
    returnReminder: { setupStatus: 'dismissed' },
  }), false)
})

test('normalizes and cloud-merges first-mission setup state', () => {
  const normalized = normalizeReturnReminder({ setupStatus: 'email', setupUpdatedAt: 150 })
  assert.equal(normalized.setupStatus, 'email')
  assert.equal(normalized.setupUpdatedAt, 150)
  assert.equal(normalizeReturnReminder({ setupStatus: 'unknown' }).setupStatus, '')

  const merged = mergeReturnReminder(
    { setupStatus: 'dismissed', setupUpdatedAt: 100, updatedAt: 100 },
    { enabled: true, setupStatus: 'email', setupUpdatedAt: 200, updatedAt: 200 },
  )
  assert.equal(merged.setupStatus, 'email')
  assert.equal(merged.setupUpdatedAt, 200)
})

test('sends only after the selected local time when there was no visit today', () => {
  assert.equal(shouldSendReturnReminder(dueProgress, new Date('2026-07-25T17:59:00Z')), false)
  assert.equal(shouldSendReturnReminder(dueProgress, new Date('2026-07-25T18:00:00Z')), true)
  assert.equal(shouldSendReturnReminder(
    { ...dueProgress, lastLoginDate: '2026-07-25' },
    new Date('2026-07-25T18:00:00Z'),
  ), false)
})

test('marks a reminder as sent once for the local calendar day', () => {
  const now = new Date('2026-07-25T18:15:00Z')
  const next = markReturnReminderSent(dueProgress, now)
  assert.equal(next.returnReminder.lastSentDate, '2026-07-25')
  assert.equal(shouldSendReturnReminder(next, now), false)
})

test('cloud merge keeps the newest preference and latest delivery marker', () => {
  const merged = mergeReturnReminder(
    { enabled: false, time: '17:00', timezone: 'Asia/Dubai', lastSentDate: '', updatedAt: 300 },
    { enabled: true, time: '18:00', timezone: 'UTC', lastSentDate: '2026-07-25', updatedAt: 200 },
  )
  assert.equal(merged.enabled, false)
  assert.equal(merged.time, '17:00')
  assert.equal(merged.lastSentDate, '2026-07-25')
  assert.equal(merged.updatedAt, 300)
})

test('daily reminder endpoint rejects requests without the cron secret', async () => {
  const response = await onRequestPost({
    request: new Request('https://example.com/api/daily-reminders', { method: 'POST' }),
    env: { CRON_SECRET: 'a'.repeat(32) },
  })
  assert.equal(response.status, 401)
})

test('daily reminder endpoint emails due families and records delivery', async () => {
  const originalFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options })
    const href = String(url)
    if (href.includes('/child_progress?')) {
      return Response.json([{
        user_id: 'guardian-1',
        profile_id: 'child-1',
        progress: {
          ...dueProgress,
          lastLoginDate: '2020-01-01',
          returnReminder: {
            ...dueProgress.returnReminder,
            time: '00:00',
          },
          weeklyBloomAdventure: { chapter: 2 },
        },
      }])
    }
    if (href.includes('/child_profiles?')) {
      return Response.json([{
        id: 'child-1',
        user_id: 'guardian-1',
        name: 'Ava',
        age_group: 'early',
      }])
    }
    if (href.includes('/guardian_profiles?')) {
      return Response.json([{
        user_id: 'guardian-1',
        email: 'parent@example.com',
        school_id: null,
      }])
    }
    if (href === 'https://api.resend.com/emails') return Response.json({ id: 'email-1' })
    if (href.includes('/child_progress?user_id=')) return new Response(null, { status: 204 })
    throw new Error(`Unexpected request: ${href}`)
  }

  try {
    const response = await onRequestPost({
      request: new Request('https://example.com/api/daily-reminders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${'a'.repeat(32)}` },
      }),
      env: {
        CRON_SECRET: 'a'.repeat(32),
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-key',
        RESEND_API_KEY: 'resend-key',
        USAGE_NOTIFY_FROM: 'Bloom Juniors <hello@example.com>',
      },
    })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      ok: true,
      checked: 1,
      due: 1,
      sent: 1,
      emailSent: 1,
      pushSent: 0,
      failed: 0,
      eligibility: {
        emailEnabled: 1,
        pushEnabled: 0,
        disabled: 0,
        visitedToday: 0,
        beforeTime: 0,
        alreadySent: 0,
      },
    })
    const emailCall = calls.find(call => call.url === 'https://api.resend.com/emails')
    assert.ok(emailCall)
    const email = JSON.parse(emailCall.options.body)
    assert.match(email.subject, /Story Leaf|Story Room|Ava|clue/i)
    assert.match(email.html, /target=story/)
    assert.match(email.html, /utm_content=weekly_early_v\d_story/)
    assert.ok(calls.some(call => call.options.method === 'PATCH'))
  } finally {
    globalThis.fetch = originalFetch
  }
})
