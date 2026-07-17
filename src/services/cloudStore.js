import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { mergeWonderWorld } from '../utils/wonderWorld.js'
import { mergeCompanionPowers } from '../utils/companionPowers.js'
import { mergeAdventureDirector } from '../utils/adventureDirector.js'
import { mergeDreamProject } from '../utils/dreamProject.js'
import { mergeParentHighFives } from '../utils/parentHighFives.js'
import { mergeProjectAdventures } from '../utils/projectAdventures.js'
import { mergeTreasureLoadouts } from '../utils/treasureLoadout.js'
import { mergeChildInterest } from '../utils/childInterest.js'

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

export function generateClassCode(className = 'CLASS') {
  const prefix = String(className || 'CLASS')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(3)), n => chars[n % chars.length]).join('')
  return `${prefix}-${suffix}`
}

const MODULE_KEYS = [
  // Early years
  'phonics', 'math', 'tricky', 'arcade', 'logic', 'shapes', 'davinci',
  'anatomy', 'science', 'worldgk', 'exercise', 'planets',
  // Tiny Stars
  'bodyparts', 'colours', 'numbers', 'fruits', 'animals', 'alphabet', 'quizshow',
  // Junior Explorers
  'timestables', 'fractions', 'wordproblems', 'piggybank', 'reading', 'spelling',
  'grammar', 'ks2science', 'worldmap', 'spirituality', 'games',
]
export const CLASS_SESSION_KEY = 'eduapp_class_session_v1'

function loadClassSession(profileId = '') {
  try {
    const session = JSON.parse(localStorage.getItem(CLASS_SESSION_KEY) || 'null')
    if (!session?.profile?.id || !session?.sessionToken) return null
    if (profileId && session.profile.id !== profileId) return null
    return session
  } catch {
    return null
  }
}

export function mergeProgress(local = {}, cloud = {}) {
  // The fresher snapshot supplies ordinary preferences and UI state. Earned
  // progress is merged explicitly below and therefore can never move backwards.
  const localRevision = Number(local.revision || 0)
  const cloudRevision = Number(cloud.revision || 0)
  const localUpdatedAt = Number(local.updatedAt || 0)
  const cloudUpdatedAt = Number(cloud.updatedAt || 0)
  const localIsNewer = localRevision > cloudRevision ||
    (localRevision === cloudRevision && localUpdatedAt >= cloudUpdatedAt)
  const newer = localIsNewer ? local : cloud
  const older = localIsNewer ? cloud : local
  // Sessions: union by timestamp — avoids silently dropping offline sessions
  const cloudSessions = Array.isArray(cloud.sessions) ? cloud.sessions : []
  const localSessions = Array.isArray(local.sessions) ? local.sessions : []
  const cloudTimes = new Set(cloudSessions.map(s => s.date))
  const merged = [...cloudSessions]
  for (const s of localSessions) {
    if (!cloudTimes.has(s.date)) merged.push(s)
  }
  merged.sort((a, b) => (a.date || 0) - (b.date || 0))

  // Stickers can be earned on the child device while a parent is composing a
  // high-five elsewhere. Keep the union so a later parent save cannot erase it.
  const mergedStickers = []
  const seenStickers = new Set()
  for (const sticker of [...(cloud.stickers || []), ...(local.stickers || [])]) {
    const key = sticker.highFiveId || `${sticker.type || ''}:${sticker.emoji || ''}:${sticker.date || ''}`
    if (seenStickers.has(key)) continue
    seenStickers.add(key)
    mergedStickers.push(sticker)
  }

  // Module scores: take max so progress never goes backwards on either device
  const mergedModules = {}
  for (const key of MODULE_KEYS) {
    const l = local[key] || {}
    const c = cloud[key] || {}
    mergedModules[key] = {
      ...(localIsNewer ? c : l), ...(localIsNewer ? l : c),
      score:   Math.max(l.score   || 0, c.score   || 0),
      level:   Math.max(l.level   || 1, c.level   || 1),
      played:  Math.max(l.played  || 0, c.played  || 0),
      correct: Math.max(l.correct || 0, c.correct || 0),
    }
  }

  // Adaptive mastery lives inside the existing progress JSON. Merge per skill
  // so a newer session on one device does not erase another device's journey.
  const localSkills = local.learningJourney?.skills || {}
  const cloudSkills = cloud.learningJourney?.skills || {}
  const mergedSkills = {}
  for (const key of new Set([...Object.keys(cloudSkills), ...Object.keys(localSkills)])) {
    const l = localSkills[key] || {}, c = cloudSkills[key] || {}
    const newest = (l.lastPlayedAt || 0) >= (c.lastPlayedAt || 0) ? l : c
    mergedSkills[key] = {
      ...c, ...l, ...newest,
      attempts: Math.max(l.attempts || 0, c.attempts || 0),
      correct: Math.max(l.correct || 0, c.correct || 0),
      recentQuestions: [...new Set([...(l.recentQuestions || []), ...(c.recentQuestions || [])])].slice(0, 80),
      misconceptions: { ...(c.misconceptions || {}), ...(l.misconceptions || {}) },
    }
  }
  const localTreasures = local.treasureCollection || { items: [], claims: {} }
  const cloudTreasures = cloud.treasureCollection || { items: [], claims: {} }
  const mergedTreasureItems = []
  const seenTreasureKeys = new Set()
  for (const item of [...(localTreasures.items || []), ...(cloudTreasures.items || [])]) {
    const key = item.id
    if (!item.id || seenTreasureKeys.has(key)) continue
    seenTreasureKeys.add(key); mergedTreasureItems.push(item)
  }
  const treasureHistory = []
  const seenTreasureClaims = new Set()
  for (const entry of [...(cloudTreasures.history || []), ...(localTreasures.history || [])]) {
    const key = entry.claimKey || `${entry.id}:${entry.earnedAt || 0}`
    if (!entry.id || seenTreasureClaims.has(key)) continue
    seenTreasureClaims.add(key); treasureHistory.push(entry)
  }
  const newestTreasureState = (localTreasures.lastClaimDate || '') >= (cloudTreasures.lastClaimDate || '')
    ? localTreasures
    : cloudTreasures
  const eggHatches = []
  const seenEggHatches = new Set()
  for (const hatch of [...(cloudTreasures.eggHatches || []), ...(localTreasures.eggHatches || [])]) {
    const key = hatch.id || `${hatch.companionId}:${(hatch.claimKeys || []).join('|')}`
    if (!key || seenEggHatches.has(key)) continue
    seenEggHatches.add(key); eggHatches.push(hatch)
  }
  const treasureInteractions = {}
  for (const itemId of new Set([
    ...Object.keys(cloudTreasures.treasureInteractions || {}),
    ...Object.keys(localTreasures.treasureInteractions || {}),
  ])) {
    const localInteraction = localTreasures.treasureInteractions?.[itemId] || {}
    const cloudInteraction = cloudTreasures.treasureInteractions?.[itemId] || {}
    treasureInteractions[itemId] = {
      count: Math.max(localInteraction.count || 0, cloudInteraction.count || 0),
      lastAt: Math.max(localInteraction.lastAt || 0, cloudInteraction.lastAt || 0),
    }
  }
  const secretGames = {}
  for (const age of new Set([
    ...Object.keys(cloudTreasures.secretGames || {}),
    ...Object.keys(localTreasures.secretGames || {}),
  ])) {
    const localGame = localTreasures.secretGames?.[age] || {}
    const cloudGame = cloudTreasures.secretGames?.[age] || {}
    secretGames[age] = {
      plays: Math.max(localGame.plays || 0, cloudGame.plays || 0),
      best: Math.max(localGame.best || 0, cloudGame.best || 0),
      total: Math.max(localGame.total || 0, cloudGame.total || 0),
      lastPlayedAt: Math.max(localGame.lastPlayedAt || 0, cloudGame.lastPlayedAt || 0),
      perfectAt: localGame.perfectAt || cloudGame.perfectAt || null,
    }
  }
  const newestRoom = (localTreasures.roomLayoutUpdatedAt || 0) >= (cloudTreasures.roomLayoutUpdatedAt || 0)
    ? localTreasures
    : cloudTreasures

  const mergedMoodLog = Object.values([...((cloud.moodLog || [])), ...((local.moodLog || []))]
    .reduce((byDate, entry) => {
      if (!entry?.date) return byDate
      if (!byDate[entry.date] || (entry.at || 0) >= (byDate[entry.date].at || 0)) byDate[entry.date] = entry
      return byDate
    }, {})).sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-60)

  const mergedStruggles = {}
  for (const moduleId of new Set([...Object.keys(cloud.struggles || {}), ...Object.keys(local.struggles || {})])) {
    const items = new Map()
    for (const entry of [...(cloud.struggles?.[moduleId] || []), ...(local.struggles?.[moduleId] || [])]) {
      if (!entry?.item) continue
      const previous = items.get(entry.item)
      if (!previous || (entry.count || 0) > (previous.count || 0)) items.set(entry.item, entry)
    }
    mergedStruggles[moduleId] = [...items.values()].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 20)
  }

  const localLiving = local.livingAdventure || {}
  const cloudLiving = cloud.livingAdventure || {}
  const livingCompleted = [...new Set([...(cloudLiving.completed || []), ...(localLiving.completed || [])])]
    .sort((a, b) => a - b)
  const newestLiving = (localLiving.lastReward?.at || localLiving.launched?.at || 0) >=
    (cloudLiving.lastReward?.at || cloudLiving.launched?.at || 0) ? localLiving : cloudLiving

  const mergedGallery = []
  const galleryKeys = new Set()
  for (const artwork of [...(cloud.artGallery || []), ...(local.artGallery || [])]) {
    const key = artwork?.id || artwork?.createdAt || artwork?.date
    if (!key || galleryKeys.has(key)) continue
    galleryKeys.add(key)
    mergedGallery.push(artwork)
  }

  const mergedArcadeLevels = {}
  for (const gameId of new Set([...Object.keys(cloud.arcadeLevels || {}), ...Object.keys(local.arcadeLevels || {})])) {
    mergedArcadeLevels[gameId] = Math.max(cloud.arcadeLevels?.[gameId] || 1, local.arcadeLevels?.[gameId] || 1)
  }

  return {
    ...older,
    ...newer,
    ...mergedModules,
    sessions:   merged.slice(-50),
    stickers:   mergedStickers.sort((a, b) => (a.date || 0) - (b.date || 0)).slice(-200),
    totalStars: Math.max(local.totalStars || 0, cloud.totalStars || 0),
    stars:      Math.max(local.stars      || 0, cloud.stars      || 0),
    ks2Xp:      Math.max(local.ks2Xp      || 0, cloud.ks2Xp      || 0),
    toddlerTreasurePoints: Math.max(local.toddlerTreasurePoints || 0, cloud.toddlerTreasurePoints || 0),
    loginStreak: Math.max(local.loginStreak || 0, cloud.loginStreak || 0),
    revision:   Math.max(localRevision, cloudRevision),
    updatedAt:  Math.max(localUpdatedAt, cloudUpdatedAt),
    moodLog: mergedMoodLog,
    struggles: mergedStruggles,
    sacredCompleted: [...new Set([...(cloud.sacredCompleted || []), ...(local.sacredCompleted || [])])],
    arcadeLevels: mergedArcadeLevels,
    artGallery: mergedGallery.slice(-80),
    livingAdventure: livingCompleted.length || Object.keys(newestLiving).length
      ? { ...cloudLiving, ...localLiving, ...newestLiving, completed: livingCompleted }
      : undefined,
    learningJourney: {
      ...(cloud.learningJourney || {}),
      ...(local.learningJourney || {}),
      version: 1,
      updatedAt: Math.max(local.learningJourney?.updatedAt || 0, cloud.learningJourney?.updatedAt || 0),
      skills: mergedSkills,
    },
    treasureCollection: {
      items: mergedTreasureItems.sort((a,b)=>(a.earnedAt||0)-(b.earnedAt||0)),
      claims: { ...(cloudTreasures.claims || {}), ...(localTreasures.claims || {}) },
      equipped: { ...(cloudTreasures.equipped || {}), ...(localTreasures.equipped || {}) },
      history: treasureHistory.sort((a,b)=>(a.earnedAt||0)-(b.earnedAt||0)).slice(-90),
      eggHatches: eggHatches.sort((a,b)=>(a.earnedAt||0)-(b.earnedAt||0)).slice(-30),
      sparkleDust: Math.max(localTreasures.sparkleDust || 0, cloudTreasures.sparkleDust || 0),
      claimStreak: newestTreasureState.claimStreak || 0,
      lastClaimDate: newestTreasureState.lastClaimDate || '',
      roomLayout: newestRoom.roomLayout || {},
      roomLayoutUpdatedAt: newestRoom.roomLayoutUpdatedAt || 0,
      treasureInteractions,
      secretGames,
      treasureLoadout: mergeTreasureLoadouts(localTreasures.treasureLoadout, cloudTreasures.treasureLoadout),
    },
    wonderWorld: mergeWonderWorld(local.wonderWorld, cloud.wonderWorld),
    companionPowers: mergeCompanionPowers(local.companionPowers, cloud.companionPowers),
    adventureDirector: mergeAdventureDirector(local.adventureDirector, cloud.adventureDirector),
    dreamProject: mergeDreamProject(local.dreamProject, cloud.dreamProject),
    projectAdventures: mergeProjectAdventures(local.projectAdventures, cloud.projectAdventures),
    parentHighFives: mergeParentHighFives(local.parentHighFives, cloud.parentHighFives),
    childInterest: mergeChildInterest(local.childInterest, cloud.childInterest),
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
    .select('guardian_name, relationship, email, phone, consent_accepted, registered_at, school_id, class_id, teacher_role, class_name, schools(name), school_classes(name, age_group, class_code)')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    guardianName:  data.guardian_name,
    relationship:  data.relationship,
    email:         data.email,
    phone:         data.phone || '',
    pin:           '',
    hasParentPin:  true,
    consentAccepted: data.consent_accepted,
    registeredAt:  data.registered_at,
    classroomMode: Boolean(data.school_id),
    schoolId:      data.school_id   || null,
    classId:       data.class_id    || null,
    schoolName:    data.schools?.name || '',
    teacherRole:   data.teacher_role || '',
    className:     data.school_classes?.name || data.class_name || '',
    classCode:     data.school_classes?.class_code || '',
  }
}

// ── Premium (Stripe) ──────────────────────────────────────────────────────────

export async function loadPremiumStatus() {
  const userId = await getCloudUserId()
  if (!userId) return null
  const { data } = await supabase
    .from('guardian_profiles')
    .select('premium_status')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.premium_status || null
}

// Opens the Stripe customer portal (manage/cancel subscription).
export async function openBillingPortal() {
  const userId = await getCloudUserId()
  if (!userId) throw new Error('Sign in required')
  const resp = await fetch('/api/stripe-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || !data.url) throw new Error(data.error || 'Could not open billing portal')
  window.location.assign(data.url)
}

// Starts a Stripe Checkout subscription and redirects the browser to it.
export async function startPremiumCheckout(email) {
  const userId = await getCloudUserId()
  if (!userId) throw new Error('Sign in required')
  const resp = await fetch('/api/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || !data.url) throw new Error(data.error || 'Could not start checkout')
  window.location.assign(data.url)
}

export async function saveCloudGuardian(guardian, { includePin = false } = {}) {
  const userId = await getCloudUserId()
  if (!userId) return null

  const row = {
    user_id:         userId,
    guardian_name:   guardian.guardianName,
    relationship:    guardian.relationship,
    email:           guardian.email,
    phone:           guardian.phone || '',
    consent_accepted: guardian.consentAccepted,
    registered_at:   guardian.registeredAt,
    updated_at:      new Date().toISOString(),
    school_id:       guardian.schoolId   || null,
    class_id:        guardian.classId    || null,
    teacher_role:    guardian.teacherRole || null,
    class_name:      guardian.className  || null,
  }

  const { error } = await supabase
    .from('guardian_profiles')
    .upsert(row, { onConflict: 'user_id' })

  if (error) throw error
  return row
}

export async function ensureCloudClass(schoolId, className, ageGroup = 'early') {
  const userId = await getCloudUserId()
  const cleanName = String(className || '').trim().slice(0, 80)
  if (!userId || !schoolId || !cleanName) return null

  const existing = await supabase
    .from('school_classes')
    .select('id, name, age_group, class_code')
    .eq('school_id', schoolId)
    .eq('name', cleanName)
    .maybeSingle()

  if (existing.error) throw existing.error
  if (existing.data?.id && !existing.data.class_code) {
    const classCode = generateClassCode(cleanName)
    await supabase
      .from('school_classes')
      .update({ class_code: classCode, updated_at: new Date().toISOString() })
      .eq('id', existing.data.id)
    existing.data.class_code = classCode
  }
  if (existing.data?.id) return {
    id: existing.data.id,
    name: existing.data.name,
    ageGroup: existing.data.age_group || ageGroup,
    classCode: existing.data.class_code || '',
  }

  const classCode = generateClassCode(cleanName)
  const { data, error } = await supabase
    .from('school_classes')
    .insert({
      school_id: schoolId,
      name: cleanName,
      age_group: ageGroup || 'early',
      class_code: classCode,
      created_by: userId,
      updated_at: new Date().toISOString(),
    })
    .select('id, name, age_group, class_code')
    .single()

  if (error) throw error
  return { id: data.id, name: data.name, ageGroup: data.age_group || ageGroup, classCode: data.class_code || classCode }
}

export async function loadCloudClasses(schoolId) {
  const userId = await getCloudUserId()
  if (!userId || !schoolId) return []

  const { data, error } = await supabase
    .from('school_classes')
    .select('id, name, age_group, class_code, created_at')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    ageGroup: row.age_group || 'early',
    classCode: row.class_code || '',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
  }))
}

export async function regenerateCloudClassCode(classId, className = 'CLASS') {
  const userId = await getCloudUserId()
  if (!userId || !classId) return null

  let lastError = null
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const classCode = generateClassCode(className)
    const { data, error } = await supabase
      .from('school_classes')
      .update({ class_code: classCode, updated_at: new Date().toISOString() })
      .eq('id', classId)
      .select('id, name, age_group, class_code')
      .single()

    if (!error) {
      return {
        id: data.id,
        name: data.name,
        ageGroup: data.age_group || 'early',
        classCode: data.class_code || classCode,
      }
    }
    lastError = error
    if (!String(error.message || '').toLowerCase().includes('duplicate')) break
  }

  throw lastError || new Error('Could not regenerate class code')
}

export async function loadCloudProfiles() {
  const userId = await getCloudUserId()
  if (!userId) return null

  let guardian = null
  try { guardian = await loadCloudGuardian() } catch {}

  let query = supabase
    .from('child_profiles')
    .select('id, name, color_idx, age_group, emoji, created_at, school_id, class_id')

  if (guardian?.schoolId && guardian?.classId) {
    query = query.eq('school_id', guardian.schoolId).eq('class_id', guardian.classId)
  } else {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    colorIdx: row.color_idx,
    ageGroup: row.age_group,
    emoji: row.emoji,
    schoolId: row.school_id || null,
    classId: row.class_id || null,
    createdAt: new Date(row.created_at).getTime(),
  }))
}

export async function saveCloudProfile(profile) {
  const userId = await getCloudUserId()
  if (!userId) return null
  let guardian = null
  try { guardian = await loadCloudGuardian() } catch {}

  const { error } = await supabase
    .from('child_profiles')
    .upsert({
      id: profile.id,
      user_id: userId,
      name: profile.name,
      color_idx: profile.colorIdx || 0,
      age_group: profile.ageGroup || 'early',
      emoji: profile.emoji || null,
      school_id: profile.schoolId || guardian?.schoolId || null,
      class_id: profile.classId || guardian?.classId || null,
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
    .eq('profile_id', profileId)
  if (progressResult.error) throw progressResult.error

  const profileResult = await supabase
    .from('child_profiles')
    .delete()
    .eq('id', profileId)
  if (profileResult.error) throw profileResult.error
}

export async function loadCloudProgress(profileId) {
  const userId = await getCloudUserId()
  if (!profileId) return null
  if (!userId) {
    const classSession = loadClassSession(profileId)
    if (!classSession) return null
    const resp = await fetch(`/api/class-progress-load?profileId=${encodeURIComponent(profileId)}`, {
      headers: { 'X-Class-Session': classSession.sessionToken },
    })
    if (!resp.ok) throw new Error('Class progress load failed')
    const result = await resp.json().catch(() => ({}))
    return result.progress || null
  }

  const { data, error } = await supabase
    .from('child_progress')
    .select('progress, updated_at')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (error) throw error
  if (!data?.[0]?.progress) return null
  return data[0].progress
}

export async function saveCloudProgress(profileId, progress) {
  const userId = await getCloudUserId()
  if (!profileId) return null
  if (!userId) {
    const classSession = loadClassSession(profileId)
    if (!classSession) return null
    const resp = await fetch('/api/class-progress-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Class-Session': classSession.sessionToken,
      },
      body: JSON.stringify({ profileId, progress }),
    })
    if (!resp.ok) throw new Error('Class progress save failed')
    return progress
  }

  const { data: profile, error: profileError } = await supabase
    .from('child_profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile) return null

  // Merge with any existing cloud state so offline sessions from other devices are preserved
  let toSave = progress
  const { data: existing, error: existingError } = await supabase
      .from('child_progress')
      .select('progress, updated_at')
      .eq('profile_id', profileId)
      .order('updated_at', { ascending: false })
      .limit(1)
  // Never turn a read failure into a destructive write. The caller keeps the
  // payload in the durable outbox and retries after connectivity recovers.
  if (existingError) throw existingError
  if (existing?.[0]?.progress) {
    toSave = mergeProgress(progress, existing[0].progress)
  }
  if (includePin) row.parent_pin = guardian.pin

  const { error } = await supabase
    .from('child_progress')
    .upsert({
      user_id: profile.user_id || userId,
      profile_id: profileId,
      progress: toJsonSafe(toSave),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,profile_id' })

  if (error) throw error
  return toSave
}

export async function loadCloudClassLesson(schoolId, className, dateKey, classId = null) {
  const userId = await getCloudUserId()
  if (!userId || !schoolId || !dateKey) return null

  let query = supabase
    .from('class_lessons')
    .select('module_ids')
    .eq('school_id', schoolId)
    .eq('lesson_date', dateKey)

  query = classId ? query.eq('class_id', classId) : query.eq('class_name', className || '')

  const { data, error } = await query.maybeSingle()

  if (error) throw error
  return Array.isArray(data?.module_ids) ? data.module_ids : null
}

export async function saveCloudClassLesson(schoolId, className, dateKey, moduleIds, classId = null) {
  const userId = await getCloudUserId()
  if (!userId || !schoolId || !dateKey) return null

  const row = {
    school_id: schoolId,
    class_id: classId || null,
    class_name: className || '',
    lesson_date: dateKey,
    module_ids: Array.isArray(moduleIds) ? moduleIds : [],
    updated_by: userId,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('class_lessons')
    .upsert(row, { onConflict: 'school_id,class_name,lesson_date' })

  if (error) throw error
  return row
}

async function callParentPin(action, pin) {
  if (!isSupabaseConfigured) return false
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return false
  const response = await fetch('/api/parent-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, pin }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Parent PIN service unavailable')
  return action === 'verify' ? Boolean(result.valid) : Boolean(result.ok)
}

export function verifyCloudParentPin(pin) {
  return callParentPin('verify', pin)
}

export function updateCloudParentPin(pin) {
  return callParentPin('set', pin)
}

export async function clearCloudClassLesson(schoolId, className, dateKey, classId = null) {
  const userId = await getCloudUserId()
  if (!userId || !schoolId || !dateKey) return null

  let query = supabase
    .from('class_lessons')
    .delete()
    .eq('school_id', schoolId)
    .eq('lesson_date', dateKey)

  query = classId ? query.eq('class_id', classId) : query.eq('class_name', className || '')

  const { error } = await query

  if (error) throw error
  return true
}
