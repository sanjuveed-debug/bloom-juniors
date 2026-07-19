import { useCallback, useEffect, useState } from 'react'
import {
  loadGuardian, normalizeGuardianData, saveGuardian,
  loadSession, createSession, clearSession, clearGuardian, verifyGuardianLogin,
} from '../utils/guardian'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import {
  ensureCloudClass, loadCloudGuardian, saveCloudGuardian,
  updateCloudParentPin, verifyCloudParentPin,
} from '../services/cloudStore.js'
import { trackEvent } from '../utils/analytics.js'

const APP_ORIGIN =
  import.meta.env.VITE_APP_ORIGIN ||
  (window.location.hostname === 'localhost'
    ? 'https://bloomjuniors.com'
    : window.location.origin)
const PASSWORD_RESET_REDIRECT = `${APP_ORIGIN}/reset-password`

export function useGuardian() {
  const [guardian, setGuardian] = useState(loadGuardian)
  const [session, setSession] = useState(loadSession)
  const [initializing, setInitializing] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState('')

  const isLoggedIn = Boolean(guardian && session)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true

    async function hydrate() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!active) return

        if (!data.session) {
          setSession(null)
          return
        }

        let cloudGuardian = null
        try {
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          )
          cloudGuardian = await Promise.race([loadCloudGuardian(), timeout])
        } catch (error) {
          if (error.message !== 'timeout') {
            setAuthError('Cloud sync is unavailable. Local login can still work on this device.')
          }
        }
        if (!active) return

        if (cloudGuardian) {
          saveGuardian(cloudGuardian)
          setGuardian(cloudGuardian)
        }
        // Always restore session when Supabase session is valid, even if cloud fetch failed.
        // Prevents unnecessary re-login prompts when network is slow.
        const s = { loggedInAt: Date.now(), expiresAt: data.session.expires_at * 1000 }
        try { localStorage.setItem('eduapp_session_v1', JSON.stringify(s)) } catch {}
        setSession(s)
      } catch {
        if (active) {
          setAuthError('Login restore failed. Please sign in again.')
          setSession(null)
        }
      } finally {
        if (active) setInitializing(false)
      }
    }

    hydrate()

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!nextSession) {
        setSession(null)
        setGuardian(loadGuardian())
      } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        const s = { loggedInAt: Date.now(), expiresAt: nextSession.expires_at * 1000 }
        try { localStorage.setItem('eduapp_session_v1', JSON.stringify(s)) } catch {}
        setSession(s)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const registerGuardian = useCallback(async (data) => {
    setAuthError('')
    const next = normalizeGuardianData(data)

    if (isSupabaseConfigured && data.accountPassword) {
      const { error } = await supabase.auth.signUp({
        email: next.email,
        password: data.accountPassword,
        options: {
          data: {
            guardian_name: next.guardianName,
            relationship: next.relationship,
          },
        },
      })

      if (error) {
        setAuthError(error.message)
        throw error
      }

      await saveCloudGuardian(next, { includePin: true })
    }

    saveGuardian(next)
    setGuardian(next)
    trackEvent('sign_up', { method: 'guardian' })
    // Fire-and-forget welcome email
    fetch('/api/welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: next.email, name: next.guardianName }),
      keepalive: true,
    }).catch(() => {})
    return next
  }, [])

  // Teacher registration — creates/joins a school, sets classroomMode: true.
  // payload: { guardianName, email, accountPassword, pin, className, schoolName?, schoolId?, inviteToken? }
  // schoolName  → create a new school (caller becomes admin)
  // schoolId    → join an existing school via invite
  // inviteToken → the invite token to mark as accepted after registration
  const registerTeacher = useCallback(async (data) => {
    setAuthError('')
    if (!isSupabaseConfigured) {
      setAuthError('Cloud sync is required for teacher accounts.')
      throw new Error('Supabase not configured')
    }

    // 1. Create Supabase auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.accountPassword,
      options: { data: { guardian_name: data.guardianName, relationship: 'Teacher / Carer' } },
    })
    if (authError) {
      setAuthError(authError.message)
      throw authError
    }

    // Wait briefly for JWT to propagate before hitting the API
    await new Promise(r => setTimeout(r, 600))

    const session = (await supabase.auth.getSession()).data?.session
    const jwt = session?.access_token

    let schoolId   = data.schoolId   || null
    let schoolName = data.schoolName || data.schoolName2 || ''
    let teacherRole = data.inviteToken ? 'teacher' : data.schoolName ? 'admin' : 'teacher'

    // 2. Create school if this is the founding teacher
    if ((data.schoolName || data.inviteToken) && !jwt) {
      const message = 'Teacher setup needs an active login session. Please confirm email-login settings and try again.'
      setAuthError(message)
      throw new Error(message)
    }

    if (data.schoolName && !data.inviteToken && jwt) {
      const resp = await fetch('/api/teacher-create-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ schoolName: data.schoolName }),
      })
      const result = await resp.json().catch(() => ({}))
      if (!resp.ok || !result.schoolId) {
        const message = result.error || 'Could not create school. Please try again.'
        setAuthError(message)
        throw new Error(message)
      }
      schoolId   = result.schoolId
      schoolName = result.schoolName
    }

    if (!schoolId) {
      const message = 'Teacher setup could not attach a school. Please try again from the invite link.'
      setAuthError(message)
      throw new Error(message)
    }

    // 3. Save guardian profile with classroom + school data
    const baseTeacher = normalizeGuardianData({
      guardianName:    data.guardianName,
      relationship:    'Teacher / Carer',
      email:           data.email,
      pin:             data.pin,
      consentAccepted: true,
      registeredAt:    new Date().toISOString(),
      classroomMode:   true,
      schoolId,
      schoolName,
      teacherRole,
      className: data.className || '',
    })

    try {
      await saveCloudGuardian(baseTeacher, { includePin: true })
    } catch {
      const message = 'Could not save teacher profile to the cloud. Please check your connection and try again.'
      setAuthError(message)
      throw new Error(message)
    }

    let cloudClass = null
    try {
      cloudClass = await ensureCloudClass(schoolId, data.className || 'Class', data.classAgeGroup || 'early')
    } catch {
      const message = 'Could not create the classroom. Please check your connection and try again.'
      setAuthError(message)
      throw new Error(message)
    }

    const next = normalizeGuardianData({
      ...baseTeacher,
      classId: cloudClass?.id || null,
      className: cloudClass?.name || baseTeacher.className,
      classCode: cloudClass?.classCode || '',
    })

    try {
      await saveCloudGuardian(next)
    } catch {
      const message = 'Could not attach this teacher to the classroom. Please check your connection and try again.'
      setAuthError(message)
      throw new Error(message)
    }

    // 4. Accept invite (marks it used so it cannot be reused)
    if (data.inviteToken && jwt) {
      const acceptResp = await fetch('/api/teacher-invite-accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ token: data.inviteToken }),
      })
      const acceptResult = await acceptResp.json().catch(() => ({}))
      if (!acceptResp.ok) {
        const message = acceptResult.error || 'Could not accept teacher invite.'
        setAuthError(message)
        throw new Error(message)
      }
    }

    saveGuardian(next)
    setGuardian(next)
    return next
  }, [])

  const login = useCallback(async (email, pin, accountPassword) => {
    setAuthError('')
    const localGuardian = loadGuardian()
    const requestedEmail = email?.trim() || localGuardian?.email || ''

    if (localGuardian && !accountPassword) {
      if (verifyGuardianLogin(localGuardian, requestedEmail, pin)) {
        const s = createSession()
        setGuardian(localGuardian)
        setSession(s)
        return true
      }
      // Local PIN cache can go stale (e.g. the PIN was changed on another
      // device, or via a reset flow). Fall back to the cloud check using any
      // still-valid Supabase session before failing the quick-unlock outright.
      if (isSupabaseConfigured) {
        const cleanedPin = String(pin || '').replace(/\D/g, '').slice(0, 4)
        const { data: sessionData } = await supabase.auth.getSession()
        const hasCloudSession = Boolean(sessionData?.session?.access_token)
        let pinValid = false
        try { pinValid = await verifyCloudParentPin(cleanedPin) } catch {}
        if (pinValid) {
          const refreshed = { ...localGuardian, pin: cleanedPin }
          saveGuardian(refreshed)
          const s = createSession()
          setGuardian(refreshed)
          setSession(s)
          return true
        }
        // No live cloud session means we genuinely can't verify the PIN
        // remotely — that's not the same as "PIN is wrong," so say so
        // instead of leaving a correct PIN stuck behind a dead-end message.
        if (!hasCloudSession) {
          return 'Your saved sign-in has expired. Tap "Use a different account" below and sign in with your email and password.'
        }
      }
    }

    if (isSupabaseConfigured && accountPassword) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: requestedEmail,
        password: accountPassword,
      })

      if (error) {
        setAuthError(error.message)
        return false
      }

      let cloudGuardian = null
      try {
        cloudGuardian = await loadCloudGuardian()
      } catch (error) {
        setAuthError('Cloud sync is unavailable. Local login can still work on this device.')
      }
      if (!cloudGuardian) {
        if (verifyGuardianLogin(localGuardian, email, pin)) {
          await saveCloudGuardian(localGuardian, { includePin: true })
          cloudGuardian = localGuardian
        }
      }
      const cleanPin = String(pin || '').replace(/\D/g, '').slice(0, 4)
      let pinValid = false
      try { pinValid = await verifyCloudParentPin(cleanPin) } catch {}
      if (!cloudGuardian || !pinValid) {
        await supabase.auth.signOut()
        setAuthError('Parent PIN is incorrect.')
        return false
      }

      saveGuardian(cloudGuardian)
      setGuardian(cloudGuardian)
      setSession({ loggedInAt: Date.now(), expiresAt: data.session.expires_at * 1000 })
      return true
    }

    const g = localGuardian
    if (!verifyGuardianLogin(g, email, pin)) return false
    const s = createSession()
    setGuardian(g)
    setSession(s)
    return true
  }, [])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    clearSession()
    setSession(null)
  }, [])

  const startNewRegistration = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    clearSession()
    clearGuardian()
    setSession(null)
    setGuardian(null)
    setAuthError('')
  }, [])

  const sendPasswordReset = useCallback(async (email) => {
    setAuthError('')
    const cleanEmail = String(email || '').trim()
    if (!cleanEmail) {
      const message = 'Enter your email address first, then tap Forgot password.'
      setAuthError(message)
      return { ok: false, message }
    }
    if (!isSupabaseConfigured) {
      const message = 'Cloud password reset is not available on this device.'
      setAuthError(message)
      return { ok: false, message }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: PASSWORD_RESET_REDIRECT,
    })

    if (error) {
      setAuthError(error.message)
      return { ok: false, message: error.message }
    }

    return {
      ok: true,
      message: 'Password reset email sent. Open the email link, then choose a new password.',
    }
  }, [])

  const resetPin = useCallback(async (email, accountPassword, newPin) => {
    setAuthError('')
    if (!isSupabaseConfigured) return { ok: false, message: 'PIN reset requires cloud sync.' }

    const cleanEmail = String(email || '').trim()
    const cleanNewPin = String(newPin || '').replace(/\D/g, '').slice(0, 4)

    if (!cleanEmail)          return { ok: false, message: 'Enter your email address.' }
    if (!accountPassword)     return { ok: false, message: 'Enter your account password.' }
    if (cleanNewPin.length !== 4) return { ok: false, message: 'PIN must be exactly 4 digits.' }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: accountPassword,
    })
    if (signInError) return { ok: false, message: 'Email or password is incorrect.' }

    let cloudGuardian = null
    try { cloudGuardian = await loadCloudGuardian() } catch {}

    const localGuardian = loadGuardian()
    const base = cloudGuardian || localGuardian || {}
    const updated = { ...base, pin: cleanNewPin, hasParentPin: true }

    try {
      const changed = await updateCloudParentPin(cleanNewPin)
      if (!changed) throw new Error('PIN update failed')
    } catch {
      await supabase.auth.signOut()
      return { ok: false, message: 'Could not update PIN. Please try again.' }
    }
    saveGuardian(updated)
    setGuardian(updated)

    await supabase.auth.signOut()
    clearSession()
    setSession(null)

    return { ok: true, message: 'PIN updated! Log in with your new PIN.' }
  }, [])

  const updateAccountPassword = useCallback(async (password) => {
    setAuthError('')
    if (!isSupabaseConfigured) return { ok: false, message: 'Cloud password reset is not available.' }
    if (String(password || '').length < 8) return { ok: false, message: 'Password must be at least 8 characters.' }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setAuthError(error.message)
      return { ok: false, message: error.message }
    }

    await supabase.auth.signOut()
    clearSession()
    setSession(null)
    return { ok: true, message: 'Password updated. Please log in again.' }
  }, [])

  const updateGuardian = useCallback(async (patch) => {
    const updated = normalizeGuardianData({ ...(guardian || {}), ...patch })
    saveGuardian(updated)
    setGuardian(updated)
    if (isSupabaseConfigured) {
      try { await saveCloudGuardian(updated) } catch {}
    }
  }, [guardian])

  const verifyParentPin = useCallback(async (pin) => {
    const cleanPin = String(pin || '').replace(/\D/g, '').slice(0, 4)
    if (cleanPin.length !== 4) return false
    if (isSupabaseConfigured) {
      try { return await verifyCloudParentPin(cleanPin) } catch { return false }
    }
    return verifyGuardianLogin(guardian, guardian?.email, cleanPin)
  }, [guardian])

  return {
    guardian,
    isLoggedIn,
    initializing,
    authError,
    registerGuardian,
    registerTeacher,
    login,
    logout,
    startNewRegistration,
    sendPasswordReset,
    resetPin,
    updateAccountPassword,
    updateGuardian,
    verifyParentPin,
  }
}
