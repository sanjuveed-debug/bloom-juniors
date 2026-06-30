import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isSupabaseConfigured } from '../lib/supabase.js'

const TEXT = '#422006'
const TEXT_MUTED = 'rgba(66,32,6,0.62)'
const TEXT_FAINT = 'rgba(66,32,6,0.42)'
const PRIMARY = '#C2410C'
const BG = 'linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 50%, #FFF7ED 100%)'
const CARD_STYLE = { background: '#FFFFFF', border: '1px solid rgba(66,32,6,0.10)', boxShadow: '0 8px 30px rgba(66,32,6,0.08)' }
const INPUT_STYLE = { background: '#FFF7ED', border: '1.5px solid rgba(66,32,6,0.16)', color: TEXT, fontSize: '1rem' }

export default function GuardianLogin({ guardianName, guardianEmail = '', authError, onLogin, onForgot, onResetPin, onRegister }) {
  const [email, setEmail]     = useState(guardianEmail || '')
  const [password, setPassword] = useState('')
  const [pin, setPin]         = useState('')
  const [fullLogin, setFullLogin] = useState(!guardianName)
  const [error, setError]     = useState('')
  const [shaking, setShaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [notice, setNotice] = useState('')

  // PIN reset flow
  const [pinResetMode, setPinResetMode] = useState(false)
  const [prEmail, setPrEmail]     = useState(guardianEmail || '')
  const [prPassword, setPrPassword] = useState('')
  const [prNewPin, setPrNewPin]   = useState('')
  const [prLoading, setPrLoading] = useState(false)
  const [prError, setPrError]     = useState('')
  const [prSuccess, setPrSuccess] = useState('')

  const handlePrPin = (digit) => {
    if (prNewPin.length >= 4) return
    setPrNewPin(p => p + digit)
    setPrError('')
  }

  const handlePrDelete = () => setPrNewPin(p => p.slice(0, -1))

  const handlePinReset = async () => {
    setPrError('')
    if (prNewPin.length !== 4) { setPrError('Enter a new 4-digit PIN.'); return }
    setPrLoading(true)
    try {
      const result = await onResetPin?.(prEmail, prPassword, prNewPin)
      if (result?.ok) {
        setPrSuccess(result.message || 'PIN updated!')
      } else {
        setPrError(result?.message || 'Could not reset PIN. Please try again.')
      }
    } catch {
      setPrError('PIN reset is unavailable right now. Please check your connection and try again.')
    } finally {
      setPrLoading(false)
    }
  }

  const exitPinReset = () => {
    setPinResetMode(false)
    setPrPassword('')
    setPrNewPin('')
    setPrError('')
    setPrSuccess('')
  }

  const pinDots = pin.padEnd(4, '·')

  const handlePin = (digit) => {
    if (pin.length >= 4) return
    setPin(p => p + digit)
    setError('')
  }

  const handleDelete = () => setPin(p => p.slice(0, -1))

  const handleLogin = async () => {
    if (fullLogin && !email.trim()) { setError('Please enter your email address.'); return }
    if (fullLogin && isSupabaseConfigured && password.length < 8) { setError('Please enter your account password.'); return }
    if (pin.length !== 4) { setError('Please enter your 4-digit PIN.'); return }
    setLoading(true)
    // Small delay so the button feels responsive
    await new Promise(r => setTimeout(r, 350))
    const ok = await onLogin(fullLogin ? email.trim() : '', pin, fullLogin ? password : '')
    setLoading(false)
    if (!ok) {
      setError(fullLogin ? 'Email, password, or PIN is incorrect. Please try again.' : 'PIN is incorrect. Please try again.')
      setPin('')
      setShaking(true)
      setTimeout(() => setShaking(false), 600)
    }
  }

  if (pinResetMode) {
    return (
      <div
        className="min-h-screen overflow-y-auto flex flex-col items-center justify-center px-4 py-10"
        style={{ background: BG }}
      >
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <motion.div className="text-5xl mb-3 inline-block"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>🔑</motion.div>
            <h1 className="font-bubble text-3xl" style={{ color: TEXT }}>Reset PIN</h1>
            <p className="font-round text-sm mt-1" style={{ color: TEXT_MUTED }}>Verify your account, then choose a new PIN</p>
          </div>

          <div className="w-full rounded-3xl p-6 space-y-5" style={CARD_STYLE}>
            {prSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">✅</div>
                <p className="font-bubble text-xl" style={{ color: TEXT }}>{prSuccess}</p>
                <button onClick={exitPinReset}
                  className="w-full py-4 rounded-2xl font-bubble text-white text-xl"
                  style={{ background: PRIMARY, boxShadow: '0 8px 22px rgba(194,65,12,0.3)' }}>
                  Back to login
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="pin-reset-email" className="font-round text-sm font-bold block mb-1" style={{ color: TEXT }}>Email Address</label>
                  <input id="pin-reset-email" type="email" value={prEmail}
                    onChange={e => { setPrEmail(e.target.value); setPrError('') }}
                    placeholder="name@example.com" inputMode="email" autoComplete="email"
                    className="w-full rounded-2xl px-4 py-3 font-round outline-none"
                    style={INPUT_STYLE} />
                </div>

                <div>
                  <label htmlFor="pin-reset-password" className="font-round text-sm font-bold block mb-1" style={{ color: TEXT }}>Account Password</label>
                  <input id="pin-reset-password" type="password" value={prPassword}
                    onChange={e => { setPrPassword(e.target.value); setPrError('') }}
                    placeholder="Your account password" autoComplete="current-password"
                    className="w-full rounded-2xl px-4 py-3 font-round outline-none"
                    style={INPUT_STYLE} />
                </div>

                <div>
                  <label className="font-round text-sm font-bold block mb-2" style={{ color: TEXT }}>New 4-digit PIN</label>
                  <div className="flex justify-center gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bubble border-2 transition-all"
                        style={{
                          background: prNewPin.length > i ? 'rgba(194,65,12,0.12)' : '#FFF7ED',
                          border: prNewPin.length > i ? `2px solid ${PRIMARY}80` : '2px solid rgba(66,32,6,0.14)',
                          color: TEXT,
                        }}>
                        {prNewPin.length > i ? '●' : ''}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                      k === '' ? <div key={i} /> :
                      <motion.button key={i} whileTap={{ scale: 0.88 }}
                        onClick={() => k === '⌫' ? handlePrDelete() : handlePrPin(String(k))}
                        className="py-4 rounded-2xl font-bubble text-xl"
                        style={{
                          background: k === '⌫' ? 'rgba(220,38,38,0.08)' : '#FFF7ED',
                          border: '1px solid rgba(66,32,6,0.14)',
                          color: TEXT,
                        }}>
                        {k}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {prError && (
                    <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="font-round text-sm text-center text-red-600">{prError}</motion.p>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={handlePinReset} disabled={prLoading || prNewPin.length !== 4 || !prPassword}
                  className="w-full py-4 rounded-2xl font-bubble text-white text-xl disabled:opacity-50"
                  style={{ background: PRIMARY, boxShadow: '0 8px 22px rgba(194,65,12,0.3)' }}>
                  {prLoading ? 'Saving…' : 'Save New PIN'}
                </motion.button>

                <button onClick={exitPinReset}
                  className="w-full font-round text-xs text-center transition-colors" style={{ color: TEXT_FAINT }}>
                  ← Back to login
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen overflow-y-auto flex flex-col items-center justify-center px-4 py-10"
      style={{ background: BG }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div className="text-6xl mb-3 inline-block"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
            🛡️
          </motion.div>
          <h1 className="font-bubble text-3xl" style={{ color: TEXT }}>
            Welcome back!
          </h1>
          {guardianName && (
            <p className="font-round text-sm mt-1" style={{ color: TEXT_MUTED }}>
              {fullLogin ? 'Signing in as ' : 'Enter PIN for '}
              <span className="font-bold" style={{ color: PRIMARY }}>{guardianName}</span>
            </p>
          )}
        </div>

        <div className="w-full rounded-3xl p-6 space-y-5" style={CARD_STYLE}>

          {fullLogin && (
            <div>
              <label htmlFor="guardian-login-email" className="font-round text-sm font-bold block mb-1" style={{ color: TEXT }}>Email Address</label>
              <input
                id="guardian-login-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && pin.length === 4 && handleLogin()}
                placeholder="name@example.com"
                inputMode="email"
                autoComplete="email"
                className="w-full rounded-2xl px-4 py-3 font-round outline-none"
                style={INPUT_STYLE}
              />
            </div>
          )}

          {fullLogin && isSupabaseConfigured && (
            <div>
              <label htmlFor="guardian-login-password" className="font-round text-sm font-bold block mb-1" style={{ color: TEXT }}>Account Password</label>
              <input
                id="guardian-login-password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && pin.length === 4 && handleLogin()}
                placeholder="Your account password"
                autoComplete="current-password"
                className="w-full rounded-2xl px-4 py-3 font-round outline-none"
                style={INPUT_STYLE}
              />
            </div>
          )}

          {/* PIN display */}
          <div>
            <label className="font-round text-sm font-bold block mb-2" style={{ color: TEXT }}>Parent PIN</label>
            <motion.div
              animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex justify-center gap-4 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bubble border-2 transition-all"
                  style={{
                    background: pin.length > i ? 'rgba(194,65,12,0.12)' : '#FFF7ED',
                    border: pin.length > i ? `2px solid ${PRIMARY}80` : '2px solid rgba(66,32,6,0.14)',
                    color: TEXT,
                  }}>
                  {pin.length > i ? '●' : ''}
                </div>
              ))}
            </motion.div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                k === '' ? <div key={i} /> :
                <motion.button key={i} whileTap={{ scale: 0.88 }}
                  onClick={() => k === '⌫' ? handleDelete() : handlePin(String(k))}
                  className="py-4 rounded-2xl font-bubble text-xl"
                  style={{
                    background: k === '⌫' ? 'rgba(220,38,38,0.08)' : '#FFF7ED',
                    border: '1px solid rgba(66,32,6,0.14)',
                    color: TEXT,
                  }}>
                  {k}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {(error || authError || notice) && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="font-round text-sm text-center"
                style={{ color: notice && !error && !authError ? '#15803D' : '#DC2626' }}>
                {error || authError || notice}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Login button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bubble text-white text-xl disabled:opacity-60"
            style={{ background: PRIMARY, boxShadow: '0 8px 22px rgba(194,65,12,0.3)' }}>
            {loading ? 'Checking...' : fullLogin ? 'Log In' : 'Unlock'}
          </motion.button>

          {guardianName && (
            <button
              type="button"
              onClick={() => {
                setFullLogin(value => !value)
                setError('')
                setPin('')
              }}
              className="w-full rounded-2xl py-3 font-round text-sm font-bold transition-colors"
              style={{ border: '1px solid rgba(66,32,6,0.14)', background: '#FFF7ED', color: TEXT_MUTED }}
            >
              {fullLogin ? `Use PIN for ${guardianName}` : 'Use a different account'}
            </button>
          )}

          {/* Forgot PIN */}
          {onResetPin && (
            <button onClick={() => { setPinResetMode(true); setPrEmail(email || guardianEmail || '') }}
              className="w-full font-round text-xs text-center transition-colors" style={{ color: TEXT_FAINT }}>
              Forgot PIN? Reset it here
            </button>
          )}

          {/* Forgot password */}
          <button onClick={async () => {
            setError('')
            setNotice('')
            setResetting(true)
            const result = await onForgot?.((email || guardianEmail).trim())
            setResetting(false)
            if (typeof result === 'string') setError(result)
            else if (result?.ok) setNotice(result.message)
            else if (result?.message) setError(result.message)
          }}
            className="w-full font-round text-xs text-center mt-1 transition-colors"
            style={{ color: TEXT_FAINT }}
            disabled={resetting}>
            {resetting ? 'Sending reset email...' : 'Forgot password? Send reset email'}
          </button>

          {onRegister && (
            <button
              type="button"
              onClick={onRegister}
              className="w-full rounded-2xl py-3 font-round text-sm font-bold transition-colors"
              style={{ border: '1px solid rgba(66,32,6,0.14)', background: '#FFF7ED', color: TEXT_MUTED }}
            >
              New parent? Register access
            </button>
          )}

          <a
            href="/privacy"
            className="block text-center font-round text-xs font-bold underline underline-offset-4 transition-colors"
            style={{ color: TEXT_FAINT }}
          >
            Privacy Policy
          </a>
        </div>
      </motion.div>
    </div>
  )
}
