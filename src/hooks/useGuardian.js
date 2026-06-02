import { useCallback, useEffect, useState } from 'react'
import {
  loadGuardian, normalizeGuardianData, saveGuardian,
  loadSession, createSession, clearSession, clearGuardian, verifyGuardianLogin,
} from '../utils/guardian'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { loadCloudGuardian, saveCloudGuardian } from '../services/cloudStore.js'

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

      await saveCloudGuardian(next)
    }

    saveGuardian(next)
    setGuardian(next)
    return next
  }, [])

  const login = useCallback(async (email, pin, accountPassword) => {
    setAuthError('')
    const localGuardian = loadGuardian()
    const requestedEmail = email?.trim() || localGuardian?.email || ''

    if (localGuardian && !accountPassword && verifyGuardianLogin(localGuardian, requestedEmail, pin)) {
      const s = createSession()
      setGuardian(localGuardian)
      setSession(s)
      return true
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
          await saveCloudGuardian(localGuardian)
          cloudGuardian = localGuardian
        }
      }
      const cleanPin = String(pin || '').replace(/\D/g, '').slice(0, 4)
      if (!cloudGuardian || cloudGuardian.pin !== cleanPin) {
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
    const updated = { ...base, pin: cleanNewPin }

    try { await saveCloudGuardian(updated) } catch {}
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

  return {
    guardian,
    isLoggedIn,
    initializing,
    authError,
    registerGuardian,
    login,
    logout,
    startNewRegistration,
    sendPasswordReset,
    resetPin,
    updateAccountPassword,
    updateGuardian,
  }
}
