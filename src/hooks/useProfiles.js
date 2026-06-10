import { useState, useCallback, useEffect, useRef } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { deleteCloudProfile, loadCloudProfiles, saveCloudProfile } from '../services/cloudStore.js'
import { reportSyncError } from '../utils/syncStatus.js'

const PROFILES_KEY = 'eduapp_profiles_v1'
const ACTIVE_KEY   = 'eduapp_active_profile'

export const PROFILE_COLORS = [
  { bg: 'linear-gradient(135deg, #8B00FF, #C77DFF)', color: '#8B00FF', name: 'Purple' },
  { bg: 'linear-gradient(135deg, #FF1D8E, #FF7DC0)', color: '#FF1D8E', name: 'Pink'   },
  { bg: 'linear-gradient(135deg, #00B4FF, #7DD8FF)', color: '#00B4FF', name: 'Blue'   },
  { bg: 'linear-gradient(135deg, #00C9A7, #5EEAD4)', color: '#00C9A7', name: 'Teal'   },
  { bg: 'linear-gradient(135deg, #FF9A3C, #FFD93D)', color: '#FF9A3C', name: 'Orange' },
  { bg: 'linear-gradient(135deg, #22C55E, #6BCB77)', color: '#22C55E', name: 'Green'  },
]

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (!raw) {
      // Migrate existing single-profile data
      const legacy = localStorage.getItem('yaagvi_progress_v1')
      if (legacy) {
        const defaultProfile = [{ id: 'profile_yaagvi', name: 'Yaagvi', colorIdx: 0, createdAt: Date.now() }]
        localStorage.setItem(PROFILES_KEY, JSON.stringify(defaultProfile))
        // Copy legacy progress to new key
        localStorage.setItem('eduapp_progress_profile_yaagvi', legacy)
        return defaultProfile
      }
      return []
    }
    return JSON.parse(raw)
  } catch { return [] }
}

function loadActiveId() {
  const stored = localStorage.getItem(ACTIVE_KEY)
  if (stored) return stored
  // Auto-select if only one profile
  const profiles = loadProfiles()
  if (profiles.length === 1) return profiles[0].id
  return null
}

function saveProfiles(profiles) {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)) } catch {}
}

function saveActiveId(id) {
  try { localStorage.setItem(ACTIVE_KEY, id || '') } catch {}
}

function clearStoredProfiles() {
  try {
    localStorage.removeItem(PROFILES_KEY)
    localStorage.removeItem(ACTIVE_KEY)
  } catch {}
}

export function useProfiles() {
  const [profiles, setProfiles] = useState(loadProfiles)
  const [activeId, setActiveId] = useState(loadActiveId)

  const applyCloudProfiles = useCallback((cloudProfiles) => {
    if (!cloudProfiles?.length) return false
    setProfiles(cloudProfiles)
    saveProfiles(cloudProfiles)
    setActiveId(prev => {
      if (prev && cloudProfiles.some(p => p.id === prev)) return prev
      const next = cloudProfiles.length === 1 ? cloudProfiles[0].id : null
      saveActiveId(next)
      return next
    })
    return true
  }, [])

  // Load cloud profiles on mount (handles page refresh when already signed in)
  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true
    loadCloudProfiles().then(cloudProfiles => {
      if (!active) return
      if (!applyCloudProfiles(cloudProfiles)) {
        loadProfiles().forEach(profile => saveCloudProfile(profile).catch(() => reportSyncError()))
      }
    }).catch(() => reportSyncError())

    return () => { active = false }
  }, [applyCloudProfiles])

  // Reload cloud profiles when user signs in (handles fresh-device login flow)
  useEffect(() => {
    if (!isSupabaseConfigured) return

    let cancelRetry = false
    let firstAttemptTimer = null

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Retry with back-off: JWT may not be accepted server-side for a brief window after SIGNED_IN fires
        const attempt = (n) => {
          if (cancelRetry) return
          loadCloudProfiles()
            .then(cloudProfiles => { if (!cancelRetry) applyCloudProfiles(cloudProfiles) })
            .catch(() => {
              if (cancelRetry) return
              if (n < 3) setTimeout(() => attempt(n + 1), 800 * n || 400)
              else reportSyncError()
            })
        }
        firstAttemptTimer = setTimeout(() => attempt(1), 700)
      }
    })

    return () => {
      cancelRetry = true
      clearTimeout(firstAttemptTimer)
      subscription.unsubscribe()
    }
  }, [applyCloudProfiles])

  const creatingRef = useRef(false)

  const createProfile = useCallback((name, colorIdx = 0, ageGroup = 'early', emoji = null, maxPerGroup = 2) => {
    if (creatingRef.current) return null
    const groupCount = profiles.filter(profile => (profile.ageGroup || 'early') === ageGroup).length
    if (groupCount >= maxPerGroup) return null

    creatingRef.current = true
    const id = crypto.randomUUID()
    const newProfile = { id, name: name.trim(), colorIdx, ageGroup, emoji, createdAt: Date.now() }
    setProfiles(prev => {
      const next = [...prev, newProfile]
      saveProfiles(next)
      return next
    })
    if (isSupabaseConfigured) saveCloudProfile(newProfile).catch(() => reportSyncError())
    // Release after the current microtask so a double-tap in the same render
    // cycle is blocked but a genuine second creation later is allowed
    window.setTimeout(() => { creatingRef.current = false }, 0)
    return id
  }, [profiles])

  const createProfilesBulk = useCallback((entries = [], ageGroup = 'early', maxPerGroup = 30) => {
    const currentGroup = profiles.filter(profile => (profile.ageGroup || 'early') === ageGroup)
    const existingNames = new Set(currentGroup.map(profile => profile.name.trim().toLowerCase()))
    const available = Math.max(0, maxPerGroup - currentGroup.length)
    const accepted = []
    const rejected = []

    for (const entry of entries) {
      if (accepted.length >= available) {
        rejected.push({ ...entry, reason: `Class limit is ${maxPerGroup}` })
        continue
      }

      const cleanName = String(entry?.name || '').trim().replace(/\s+/g, ' ').slice(0, 14)
      const nameKey = cleanName.toLowerCase()
      if (!cleanName) {
        rejected.push({ ...entry, reason: 'Missing name' })
        continue
      }
      if (existingNames.has(nameKey)) {
        rejected.push({ ...entry, reason: 'Duplicate name' })
        continue
      }

      existingNames.add(nameKey)
      accepted.push({
        id: crypto.randomUUID(),
        name: cleanName,
        colorIdx: Number.isFinite(entry?.colorIdx) ? entry.colorIdx : 0,
        ageGroup: entry?.ageGroup || ageGroup,
        emoji: entry?.emoji || null,
        createdAt: Date.now() + accepted.length,
      })
    }

    if (accepted.length > 0) {
      setProfiles(prev => {
        const next = [...prev, ...accepted]
        saveProfiles(next)
        return next
      })
      if (isSupabaseConfigured) {
        accepted.forEach(profile => saveCloudProfile(profile).catch(() => reportSyncError()))
      }
    }

    return { created: accepted, rejected }
  }, [profiles])

  const switchProfile = useCallback((id) => {
    setActiveId(id)
    saveActiveId(id)
  }, [])

  const deleteProfile = useCallback((id) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id)
      saveProfiles(next)
      return next
    })
    try { localStorage.removeItem(`eduapp_progress_${id}`) } catch {}
    if (isSupabaseConfigured) deleteCloudProfile(id).catch(() => reportSyncError())
    setActiveId(prev => {
      if (prev === id) { saveActiveId(null); return null }
      return prev
    })
  }, [])

  const updateProfile = useCallback((id, patch) => {
    setProfiles(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...patch } : p)
      saveProfiles(next)
      const changed = next.find(p => p.id === id)
      if (isSupabaseConfigured && changed) saveCloudProfile(changed).catch(() => reportSyncError())
      return next
    })
  }, [])

  const resetProfiles = useCallback(() => {
    clearStoredProfiles()
    setProfiles([])
    setActiveId(null)
  }, [])

  return {
    profiles,
    activeId,
    activeProfile: profiles.find(p => p.id === activeId) || null,
    createProfile,
    createProfilesBulk,
    switchProfile,
    deleteProfile,
    updateProfile,
    resetProfiles,
  }
}
