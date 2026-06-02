import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function isMissingAuthSession(error) {
  const message = String(error?.message || '').toLowerCase()
  const name = String(error?.name || '').toLowerCase()
  return (
    name.includes('authsessionmissing') ||
    message.includes('auth session missing') ||
    message.includes('session missing')
  )
}

function isRecoverableAuthError(error) {
  const message = String(error?.message || '').toLowerCase()
  return (
    isMissingAuthSession(error) ||
    message.includes('jwt expired') ||
    message.includes('invalid jwt') ||
    message.includes('refresh token') ||
    message.includes('not authenticated')
  )
}

function toJsonSafe(value) {
  try {
    return JSON.parse(JSON.stringify(value || {}))
  } catch {
    return {}
  }
}

const MODULE_KEYS = ['phonics', 'math', 'tricky', 'arcade', 'logic', 'shapes', 'davinci', 'anatomy', 'science', 'worldgk', 'exercise', 'planets']

function mergeProgress(local, cloud) {
  // Sessions: union by timestamp — avoids silently dropping offline sessions
  const cloudSessions = Array.isArray(cloud.sessions) ? cloud.sessions : []
  const localSessions = Array.isArray(local.sessions) ? local.sessions : []
  const cloudTimes = new Set(cloudSessions.map(s => s.date))
  const merged = [...cloudSessions]
  for (const s of localSessions) {
    if (!cloudTimes.has(s.date)) merged.push(s)
  }
  merged.sort((a, b) => (a.date || 0) - (b.date || 0))

  // Module scores: take max so progress never goes backwards on either device
  const mergedModules = {}
  for (const key of MODULE_KEYS) {
    const l = local[key] || {}
    const c = cloud[key] || {}
    mergedModules[key] = {
      ...c, ...l,
      score:   Math.max(l.score   || 0, c.score   || 0),
      level:   Math.max(l.level   || 1, c.level   || 1),
      played:  Math.max(l.played  || 0, c.played  || 0),
      correct: Math.max(l.correct || 0, c.correct || 0),
    }
  }

  return {
    ...cloud,
    ...local,
    ...mergedModules,
    sessions:   merged.slice(-50),
    totalStars: Math.max(local.totalStars || 0, cloud.totalStars || 0),
    stars:      Math.max(local.stars      || 0, cloud.stars      || 0),
  }
}

export async function getCloudUserId() {
  if (!isSupabaseConfigured) return null
  // getSession() reads from local cache (no network call) — avoids 401 race conditions
  // right after SIGNED_IN fires before the JWT is fully propagated to the server validator
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}

export async function loadCloudGuardian() {
  const userId = await getCloudUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('guardian_profiles')
    .select('guardian_name, relationship, email, phone, parent_pin, consent_accepted, registered_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    guardianName: data.guardian_name,
    relationship: data.relationship,
    email: data.email,
    phone: data.phone || '',
    pin: data.parent_pin,
    consentAccepted: data.consent_accepted,
    registeredAt: data.registered_at,
  }
}

export async function saveCloudGuardian(guardian) {
  const userId = await getCloudUserId()
  if (!userId) return null

  const row = {
    user_id: userId,
    guardian_name: guardian.guardianName,
    relationship: guardian.relationship,
    email: guardian.email,
    phone: guardian.phone || '',
    parent_pin: guardian.pin,
    consent_accepted: guardian.consentAccepted,
    registered_at: guardian.registeredAt,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('guardian_profiles')
    .upsert(row, { onConflict: 'user_id' })

  if (error) throw error
  return row
}

export async function loadCloudProfiles() {
  const userId = await getCloudUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('child_profiles')
    .select('id, name, color_idx, age_group, emoji, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    colorIdx: row.color_idx,
    ageGroup: row.age_group,
    emoji: row.emoji,
    createdAt: new Date(row.created_at).getTime(),
  }))
}

export async function saveCloudProfile(profile) {
  const userId = await getCloudUserId()
  if (!userId) return null

  const { error } = await supabase
    .from('child_profiles')
    .upsert({
      id: profile.id,
      user_id: userId,
      name: profile.name,
      color_idx: profile.colorIdx || 0,
      age_group: profile.ageGroup || 'early',
      emoji: profile.emoji || null,
      created_at: profile.createdAt ? new Date(profile.createdAt).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) throw error
  return profile
}

export async function deleteCloudProfile(profileId) {
  const userId = await getCloudUserId()
  if (!userId) return

  const progressResult = await supabase
    .from('child_progress')
    .delete()
    .eq('user_id', userId)
    .eq('profile_id', profileId)
  if (progressResult.error) throw progressResult.error

  const profileResult = await supabase
    .from('child_profiles')
    .delete()
    .eq('user_id', userId)
    .eq('id', profileId)
  if (profileResult.error) throw profileResult.error
}

export async function loadCloudProgress(profileId) {
  const userId = await getCloudUserId()
  if (!userId || !profileId) return null

  const { data, error } = await supabase
    .from('child_progress')
    .select('progress')
    .eq('user_id', userId)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error) throw error
  if (!data?.progress) return null
  return data.progress
}

export async function saveCloudProgress(profileId, progress) {
  const userId = await getCloudUserId()
  if (!userId || !profileId) return null

  const { data: profile, error: profileError } = await supabase
    .from('child_profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('id', profileId)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile) return null

  // Merge with any existing cloud state so offline sessions from other devices are preserved
  let toSave = progress
  try {
    const { data: existing } = await supabase
      .from('child_progress')
      .select('progress')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .maybeSingle()
    if (existing?.progress) {
      toSave = mergeProgress(progress, existing.progress)
    }
  } catch {
    // merge failed — fall through and save local state as-is
  }

  const { error } = await supabase
    .from('child_progress')
    .upsert({
      user_id: userId,
      profile_id: profileId,
      progress: toJsonSafe(toSave),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,profile_id' })

  if (error) throw error
  return toSave
}
