import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isSupabaseConfigured } from '../lib/supabase.js'

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
        style={{ background: 'linear-gradient(160deg, #13052c 0%, #2d0a5e 55%, #071b39 100%)' }}
      >
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <motion.div className="text-5xl mb-3 inline-block"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>🔑</motion.div>
            <h1 className="font-bubble text-white text-3xl drop-shadow-lg">Reset PIN</h1>
            <p className="font-round text-white/60 text-sm mt-1">Verify your account, then choose a new PIN</p>
          </div>

          <div className="w-full rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur space-y-5">
            {prSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">✅</div>
                <p className="font-bubble text-white text-xl">{prSuccess}</p>
                <button onClick={exitPinReset}
                  className="w-full py-4 rounded-2xl font-bubble text-white text-xl"
                  style={{ background: 'linear-gradient(135deg,#ff7a18,#ff2d55)', boxShadow: '0 6px 20px rgba(255,45,85,0.4)' }}>
                  Back to login
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="font-round text-sm font-bold text-white block mb-1">Email Address</label>
                  <input type="email" value={prEmail}
                    onChange={e => { setPrEmail(e.target.value); setPrError('') }}
                    placeholder="name@example.com" inputMode="email" autoComplete="email"
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none placeholder:text-white/30"
                    style={{ fontSize: '1rem' }} />
                </div>

                <div>
                  <label className="font-round text-sm font-bold text-white block mb-1">Account Password</label>
                  <input type="password" value={prPassword}
                    onChange={e => { setPrPassword(e.target.value); setPrError('') }}
                    placeholder="Your account password" autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none placeholder:text-white/30"
                    style={{ fontSize: '1rem' }} />
                </div>

                <div>
                  <label className="font-round text-sm font-bold text-white block mb-2">New 4-digit PIN</label>
                  <div className="flex justify-center gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bubble border-2 transition-all"
                        style={{
                          background: prNewPin.length > i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          border: prNewPin.length > i ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.15)',
                          color: 'white',
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
                        className="py-4 rounded-2xl font-bubble text-white text-xl"
                        style={{
                          background: k === '⌫' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}>
                        {k}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {prError && (
                    <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="font-round text-sm text-center text-red-300">{prError}</motion.p>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={handlePinReset} disabled={prLoading || prNewPin.length !== 4 || !prPassword}
                  className="w-full py-4 rounded-2xl font-bubble text-white text-xl disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#ff7a18,#ff2d55)', boxShadow: '0 6px 20px rgba(255,45,85,0.4)' }}>
                  {prLoading ? 'Saving…' : 'Save New PIN'}
                </motion.button>

                <button onClick={exitPinReset}
                  className="w-full font-round text-white/45 text-xs text-center hover:text-white/70 transition-colors">
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
      style={{ background: 'linear-gradient(160deg, #13052c 0%, #2d0a5e 55%, #071b39 100%)' }}
    >
      {/* Background stars */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div key={i} className="fixed pointer-events-none select-none text-sm"
          style={{ left: `${(i * 13 + 5) % 94}%`, top: `${(i * 7 + 3) % 88}%`, zIndex: 0 }}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2 + (i % 4) * 0.5, repeat: Infinity, delay: i * 0.2 }}>
          {['✨','⭐','💫','🌟'][i % 4]}
        </motion.div>
      ))}

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
          <h1 className="font-bubble text-white text-3xl drop-shadow-lg"
            style={{ textShadow: '0 0 30px rgba(255,215,0,0.7)' }}>
            Welcome back!
          </h1>
          {guardianName && (
            <p className="font-round text-white/60 text-sm mt-1">
              {fullLogin ? 'Signing in as ' : 'Enter PIN for '}
              <span className="text-yellow-300 font-bold">{guardianName}</span>
            </p>
          )}
        </div>

        <div className="w-full rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur space-y-5">

          {fullLogin && (
            <div>
              <label className="font-round text-sm font-bold text-white block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && pin.length === 4 && handleLogin()}
                placeholder="name@example.com"
                inputMode="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none placeholder:text-white/30"
                style={{ fontSize: '1rem' }}
              />
            </div>
          )}

          {fullLogin && isSupabaseConfigured && (
            <div>
              <label className="font-round text-sm font-bold text-white block mb-1">Account Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && pin.length === 4 && handleLogin()}
                placeholder="Your account password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none placeholder:text-white/30"
                style={{ fontSize: '1rem' }}
              />
            </div>
          )}

          {/* PIN display */}
          <div>
            <label className="font-round text-sm font-bold text-white block mb-2">Parent PIN</label>
            <motion.div
              animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex justify-center gap-4 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bubble border-2 transition-all"
                  style={{
                    background: pin.length > i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                    border: pin.length > i ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.15)',
                    color: 'white',
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
                  className="py-4 rounded-2xl font-bubble text-white text-xl"
                  style={{
                    background: k === '⌫' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
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
                className={`font-round text-sm text-center ${notice && !error && !authError ? 'text-emerald-200' : 'text-red-300'}`}>
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
            style={{ background: 'linear-gradient(135deg, #ff7a18, #ff2d55)', boxShadow: '0 6px 20px rgba(255,45,85,0.4)' }}>
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
              className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 font-round text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {fullLogin ? `Use PIN for ${guardianName}` : 'Use a different account'}
            </button>
          )}

          {/* Forgot PIN */}
          {onResetPin && (
            <button onClick={() => { setPinResetMode(true); setPrEmail(email || guardianEmail || '') }}
              className="w-full font-round text-white/45 text-xs text-center hover:text-white/70 transition-colors">
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
            className="w-full font-round text-white/45 text-xs text-center mt-1 hover:text-white/70 transition-colors"
            disabled={resetting}>
            {resetting ? 'Sending reset email...' : 'Forgot password? Send reset email'}
          </button>

          {onRegister && (
            <button
              type="button"
              onClick={onRegister}
              className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 font-round text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              New parent? Register access
            </button>
          )}

          <a
            href="/privacy"
            className="block text-center font-round text-xs font-bold text-white/45 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/70"
          >
            Privacy Policy
          </a>
        </div>
      </motion.div>
    </div>
  )
}
