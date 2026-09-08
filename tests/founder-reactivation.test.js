import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildReactivationCandidates,
  markReactivationSent,
  REACTIVATION_CAMPAIGN_ID,
} from '../src/utils/founderReactivation.js'
import { onRequestPost } from '../functions/api/founder-reactivation.js'

const now = new Date('2026-08-05T12:00:00Z')
const day = offset => now.getTime() + offset * 86400000

function dataSet() {
  return {
    profiles: [
      { id: 'eligible-child', user_id: 'eligible-family', name: 'Asha', age_group: 'early' },
      { id: 'disabled-child', user_id: 'disabled-family', name: 'Ben', age_group: 'early' },
      { id: 'test-child', user_id: 'test-family', name: 'Test', age_group: 'early' },
    ],
    progressRows: [
      {
        profile_id: 'eligible-child', user_id: 'eligible-family',
        progress: { sessions: [{ module: 'phonics', date: day(-5) }], returnReminder: { enabled: true } },
      },
      {
        profile_id: 'disabled-child', user_id: 'disabled-family',
        progress: { sessions: [{ module: 'phonics', date: day(-5) }], returnReminder: { enabled: false } },
      },
      {
        profile_id: 'test-child', user_id: 'test-family',
        progress: { sessions: [{ module: 'phonics', date: day(-5) }], returnReminder: { enabled: true } },
      },
    ],
    guardians: [
      { user_id: 'eligible-family', email: 'parent@example.com' },
      { user_id: 'disabled-family', email: 'disabled@example.com' },
      { user_id: 'test-family', email: 'sanju.veed+uat@gmail.com' },
    ],
    authUsers: [],
  }
}

test('reactivation candidates require consent, inactivity, and a real family account', () => {
  const source = dataSet()
  const candidates = buildReactivationCandidates(source, { now })
  assert.equal(candidates.length, 1)
  assert.equal(candidates[0].profile.id, 'eligible-child')

  source.progressRows[0].progress = markReactivationSent(source.progressRows[0].progress, {
    campaignId: REACTIVATION_CAMPAIGN_ID,
    sentAt: now.getTime(),
  })
  assert.equal(buildReactivationCandidates(source, { now }).length, 0)
})

test('founder reactivation endpoint sends once and returns aggregate results only', async () => {
  const source = dataSet()
  const env = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    FOUNDER_EMAILS: 'founder@example.com',
    RESEND_API_KEY: 'resend-key',
    USAGE_NOTIFY_FROM: 'Bloom <hello@example.com>',
  }
  const sentEmails = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url)
    if (value.includes('/auth/v1/user') && !value.includes('/admin/')) {
      return new Response(JSON.stringify({ id: 'founder', email: 'founder@example.com' }))
    }
    if (value.includes('/auth/v1/admin/users')) return new Response(JSON.stringify({ users: [] }))
    if (value.includes('/child_profiles')) return new Response(JSON.stringify(source.profiles))
    if (value.includes('/guardian_profiles')) return new Response(JSON.stringify(source.guardians))
    if (value.includes('/child_progress') && options.method === 'PATCH') {
      const patch = JSON.parse(options.body)
      source.progressRows[0].progress = patch.progress
      return new Response(null, { status: 204 })
    }
    if (value.includes('/child_progress')) return new Response(JSON.stringify(source.progressRows))
    if (value === 'https://api.resend.com/emails') {
      sentEmails.push({ headers: options.headers, body: JSON.parse(options.body) })
      return new Response(JSON.stringify({ id: 'email-1' }), { status: 200 })
    }
    throw new Error(`Unexpected request: ${value}`)
  }

  const makeRequest = () => new Request('https://app.test/api/founder-reactivation', {
    method: 'POST',
    headers: { Authorization: 'Bearer founder-token', 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaignId: REACTIVATION_CAMPAIGN_ID, confirm: 'send' }),
  })
  try {
    const first = await onRequestPost({ request: makeRequest(), env })
    assert.equal(first.status, 200)
    assert.deepEqual(await first.json(), {
      ok: true,
      campaignId: REACTIVATION_CAMPAIGN_ID,
      eligible: 1,
      attempted: 1,
      sent: 1,
      failed: 0,
    })
    assert.equal(sentEmails.length, 1)
    assert.equal(sentEmails[0].body.to[0], 'parent@example.com')
    assert.match(sentEmails[0].headers['Idempotency-Key'], /first-mission-return-v1/)

    const second = await onRequestPost({ request: makeRequest(), env })
    assert.equal(second.status, 200)
    assert.equal((await second.json()).sent, 0)
    assert.equal(sentEmails.length, 1)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('founder reactivation endpoint requires authentication and explicit confirmation', async () => {
  const env = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    FOUNDER_EMAILS: 'founder@example.com',
    RESEND_API_KEY: 'resend-key',
    USAGE_NOTIFY_FROM: 'Bloom <hello@example.com>',
  }
  const unauthorized = await onRequestPost({
    request: new Request('https://app.test/api/founder-reactivation', { method: 'POST' }),
    env,
  })
  assert.equal(unauthorized.status, 401)

  const originalFetch = globalThis.fetch
  globalThis.fetch = async url => {
    if (String(url).includes('/auth/v1/user')) {
      return new Response(JSON.stringify({ id: 'founder', email: 'founder@example.com' }))
    }
    throw new Error('Data should not be read without confirmation')
  }
  try {
    const response = await onRequestPost({
      request: new Request('https://app.test/api/founder-reactivation', {
        method: 'POST',
        headers: { Authorization: 'Bearer founder-token', 'Content-Type': 'application/json' },
        body: '{}',
      }),
      env,
    })
    assert.equal(response.status, 400)
  } finally {
    globalThis.fetch = originalFetch
  }
})
