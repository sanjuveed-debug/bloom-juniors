import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert/strict'
import { parse } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { applyPicnicAction } from '../src/utils/picnicProgress.js'

// Credentials remain in the existing ignored local configuration, never output.
Object.assign(process.env, parse(await readFile('.env.local', 'utf8')))
const localLogin = await readFile('scripts/live-commercial-audit.cjs', 'utf8')
const email = process.env.BLOOM_TEST_EMAIL || localLogin.match(/const EMAIL = '([^']+)'/)[1]
const password = process.env.BLOOM_TEST_PASSWORD || localLogin.match(/const PASSWORD = '([^']+)'/)[1]
const { supabase } = await import('../src/lib/supabase.js')
const { saveCloudProfile, saveCloudProgress, deleteCloudProfile } = await import('../src/services/cloudStore.js')
const fresh = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } })
const id = randomUUID()
let created = false
let phase = 'login'
try {
  for (const client of [supabase, fresh]) {
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Test authentication failed')
  }
  phase = 'temporary-profile'
  await saveCloudProfile({ id, name: 'QA Picnic Sync', ageGroup: 'early', createdAt: Date.now() })
  created = true
  phase = 'partial-save'
  let progress = applyPicnicAction({}, { type: 'PLACE', to: 0 })
  await saveCloudProgress(id, progress)
  const read = async () => {
    const { data, error } = await fresh.from('child_progress').select('progress').eq('profile_id', id).single()
    if (error) throw new Error('Fresh session read failed')
    return data.progress
  }
  let restored = await read()
  assert.equal(restored.picnic.state.placements[0], true)
  phase = 'completion-save'
  for (const places of [[1, 3, 4], [1, 3, 5]]) {
    for (const to of places) progress = applyPicnicAction(progress, { type: 'PLACE', to })
    progress = applyPicnicAction(progress, { type: 'SUBMIT' })
    progress = applyPicnicAction(progress, { type: 'NEXT' })
  }
  await saveCloudProgress(id, progress)
  restored = await read()
  assert.equal(restored.picnic.state.report.results.length, 2)
  assert.equal(restored.sessions.filter(s => s.activityId === 'picnic-first').length, 1)
  phase = 'stale-device-save'
  await saveCloudProgress(id, applyPicnicAction({}, { type: 'PLACE', to: 2 }))
  restored = await read()
  assert.equal(restored.picnic.state.report.results.length, 2)
  console.log('PASS: real API partial resume, completed recap, one session and stale-device preservation using two independent authenticated clients.')
} catch {
  console.error(`FAILED at ${phase}; no credentials or response data logged.`)
  process.exitCode = 1
} finally {
  if (created) {
    try {
      await deleteCloudProfile(id)
      const { data, error } = await fresh.from('child_profiles').select('id').eq('id', id)
      if (error || data.length) throw new Error('Cleanup not verified')
      console.log('Temporary test profile removed; existing child profiles untouched.')
    } catch { console.error(`Cleanup needs attention for temporary profile ${id}`); process.exitCode = 1 }
  }
  // Revoke only these new sessions, never all sessions on the founder account.
  await Promise.allSettled([supabase.auth.signOut({ scope: 'local' }), fresh.auth.signOut({ scope: 'local' })])
}
