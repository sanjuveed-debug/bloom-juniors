import { buildFounderRetentionReport } from '../../src/utils/founderRetention.js'
import { authenticateFounder, json, readAuthUsers, readRows } from './_founder-auth.js'

function safeTimezone(value) {
  const timezone = String(value || 'UTC').slice(0, 80)
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format()
    return timezone
  } catch {
    return 'UTC'
  }
}

export async function onRequestGet({ request, env }) {
  const auth = await authenticateFounder(request, env)
  if (auth.error) return auth.error
  const { supabaseUrl, serviceKey } = auth

  const url = new URL(request.url)
  const timezone = safeTimezone(url.searchParams.get('timezone'))
  const requestedRange = Number(url.searchParams.get('days')) || 30
  const rangeDays = [7, 30, 90].includes(requestedRange) ? requestedRange : 30

  try {
    const [profiles, progressRows, guardians, authUsers] = await Promise.all([
      readRows(supabaseUrl, serviceKey, 'child_profiles', 'id,user_id,age_group,created_at,school_id'),
      readRows(supabaseUrl, serviceKey, 'child_progress', 'user_id,profile_id,progress,updated_at'),
      readRows(supabaseUrl, serviceKey, 'guardian_profiles', 'user_id,email,school_id,registered_at'),
      readAuthUsers(supabaseUrl, serviceKey),
    ])
    const report = buildFounderRetentionReport(
      { profiles, progressRows, guardians, authUsers },
      { now: new Date(), timezone, rangeDays },
    )
    return json(report)
  } catch {
    return json({ error: 'Could not load retention data' }, 502)
  }
}
