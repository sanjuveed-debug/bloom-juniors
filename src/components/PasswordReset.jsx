import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

export default function PasswordReset({ onUpdatePassword, resetLinkError = '' }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const expiredMessage = useMemo(() => {
    if (!resetLinkError) return ''
    const clean = resetLinkError.replace(/\+/g, ' ')
    if (/expired|invalid|access_denied/i.test(clean)) {
      return 'This password reset link is invalid or has expired. Please request a fresh reset email from the login screen.'
    }
    return clean
  }, [resetLinkError])

  const goToLogin = () => {
    window.history.replaceState({}, document.title, '/')
    window.location.reload()
  }

  const handleSubmit = async () => {
    setError('')
    setMessage('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const result = await onUpdatePassword(password)
    setLoading(false)
    if (result?.ok) {
      setMessage(result.message || 'Password updated. Please log in again.')
      setPassword('')
      setConfirm('')
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname)
        window.location.reload()
      }, 1400)
    } else {
      setError(result?.message || 'Could not update password.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #13052c 0%, #2d0a5e 55%, #071b39 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur"
      >
        <div className="text-center">
          <div className="text-5xl mb-3">🛡️</div>
          <h1 className="font-bubble text-white text-3xl">Reset password</h1>
          <p className="font-round mt-2 text-sm font-bold leading-6 text-white/65">
            Choose a new parent account password. Your 4-digit parent PIN stays the same.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {expiredMessage ? (
            <>
              <div className="rounded-2xl border border-amber-200/30 bg-amber-100/15 px-4 py-4">
                <p className="font-round text-sm font-bold leading-6 text-amber-100">
                  {expiredMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={goToLogin}
                className="w-full py-4 rounded-2xl font-bubble text-white text-xl"
                style={{ background: 'linear-gradient(135deg, #38bdf8, #ec4899)', boxShadow: '0 6px 20px rgba(236,72,153,0.35)' }}
              >
                Back to log in
              </button>
            </>
          ) : (
            <>
          <div>
            <label className="font-round text-sm font-bold text-white block mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="8+ characters"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="font-round text-sm font-bold text-white block mb-1">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={event => setConfirm(event.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none placeholder:text-white/30"
            />
          </div>

          {(error || message) && (
            <p className={`font-round text-sm text-center ${message ? 'text-emerald-200' : 'text-red-300'}`}>
              {message || error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bubble text-white text-xl disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ff7a18, #ff2d55)', boxShadow: '0 6px 20px rgba(255,45,85,0.4)' }}
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
