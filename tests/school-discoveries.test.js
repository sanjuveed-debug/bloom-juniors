import test from 'node:test'
import assert from 'node:assert/strict'
import { getClassLessonSteps, MODULES_BY_AGE } from '../src/utils/classroomLesson.js'
import { applyShadowDiscovery } from '../src/utils/shadowDiscovery.js'
import { onRequestGet } from '../functions/api/class-lesson-load.js'
import { signClassSession } from '../functions/api/_class-session.js'

test('class discoveries are early-only and unrelated maths does not complete sharing', () => {
  assert(MODULES_BY_AGE.early.some(m => m.id === 'snacks'))
  assert(!MODULES_BY_AGE.toddler.some(m => m.id === 'snacks'))
  const steps = getClassLessonSteps({ sessions: [{ module: 'math', date: Date.now() }] }, ['snacks', 'shadow-discovery'])
  assert(steps.every(s => !s.done))
  assert.equal(getClassLessonSteps({}, ['shadow-discovery'], 'junior').length, 0)
})

test('only dated exact completions count; duplicate and unknown assignments are ignored', () => {
  const now = Date.now(), yesterday = now - 86400000
  const progress = { sessions: [{ module: 'math', activityId: 'snacks-first', date: now }, { module: 'shadow-discovery', date: yesterday }] }
  const steps = getClassLessonSteps(progress, ['snacks', 'snacks', 'shadow-discovery', 'unknown'])
  assert.equal(steps.length, 2)
  assert.equal(steps[0].done, true)
  assert.equal(steps[1].done, false)
})

test('a completed shadow replay counts on its new day without duplicating reward sessions', () => {
  const yesterday = Date.now() - 86400000
  const finish = (progress, at) => {
    for (const [prediction, type, position] of [['Bigger', 'MOVE', 100], ['Smaller', 'MOVE', 0], ['It disappears', 'OFF', 0]]) {
      progress = applyShadowDiscovery(progress, { type: 'PREDICT', prediction }, at)
      progress = applyShadowDiscovery(progress, { type, position }, at)
      progress = applyShadowDiscovery(progress, { type: 'NEXT' }, at)
    }
    return progress
  }
  let progress = finish({}, yesterday)
  assert.equal(getClassLessonSteps(progress, ['shadow-discovery'])[0].done, false)
  progress = applyShadowDiscovery(progress, { type: 'REPLAY' }, Date.now())
  assert.equal(getClassLessonSteps(progress, ['shadow-discovery'])[0].done, false)
  progress = finish(progress, Date.now())
  assert.equal(getClassLessonSteps(progress, ['shadow-discovery'])[0].done, true)
  assert.equal(progress.sessions.length, 1)
})

test('class lesson endpoint enforces signed pupil membership and class scope', async () => {
  const env = { SUPABASE_URL: 'https://synthetic.invalid', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-test-secret' }
  const token = await signClassSession(env.SUPABASE_SERVICE_ROLE_KEY, { profileId: 'pupil-a', classId: 'class-a', schoolId: 'school-a', exp: Math.floor(Date.now()/1000)+60 })
  const call = value => onRequestGet({ env, request: new Request('https://local.test/api/class-lesson-load?date=2026-09-11&classId=class-b', { headers: { 'X-Class-Session': value } }) })
  const original = globalThis.fetch
  const urls = []
  try {
    globalThis.fetch = async url => { urls.push(url); return Response.json(url.includes('child_profiles') ? [{ id: 'pupil-a' }] : [{ module_ids: ['shadow-discovery'] }]) }
    assert.equal((await call('invalid')).status, 401)
    assert.equal(urls.length, 0)
    assert.deepEqual(await (await call(token)).json(), { moduleIds: ['shadow-discovery'] })
    assert(urls.every(url => url.includes('school_id=eq.school-a') && url.includes('class_id=eq.class-a') && !url.includes('class-b')))
    globalThis.fetch = async () => Response.json([])
    assert.equal((await call(token)).status, 404)
    globalThis.fetch = async () => new Response('', { status: 500 })
    assert.equal((await call(token)).status, 502)
    const expired = await signClassSession(env.SUPABASE_SERVICE_ROLE_KEY, { profileId:'pupil-a', schoolId:'school-a', classId:'class-a', exp:1 })
    assert.equal((await call(expired)).status, 401)
  } finally { globalThis.fetch = original }
})
