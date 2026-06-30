import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { isValidEmail } from '../utils/guardian'
import { isSupabaseConfigured } from '../lib/supabase.js'

const TEXT = '#422006'
const TEXT_MUTED = 'rgba(66,32,6,0.62)'
const TEXT_FAINT = 'rgba(66,32,6,0.42)'
const PRIMARY = '#C2410C'
const TEAL = '#0F766E'
const PAGE_BG = 'linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 50%, #FFF7ED 100%)'
const INPUT_STYLE = { background: '#FFFFFF', border: '1.5px solid rgba(66,32,6,0.16)', color: TEXT }

const RELATIONSHIP_OPTIONS = [
  'Mother',
  'Father',
  'Guardian',
  'Grandparent',
  'Teacher / Carer',
]

const CHILD_AGE_GROUPS = [
  { id: 'toddler', label: 'Tiny Stars', range: '3-4', emoji: '🧸', helper: 'Tap, colours, shapes, numbers' },
  { id: 'early', label: 'Little Stars', range: '4-6', emoji: '🌟', helper: 'Phonics, maths, stories, art' },
  { id: 'junior', label: 'Super Kids', range: '7-9', emoji: '🚀', helper: 'Maths, reading, science, games' },
]

export default function GuardianSetup({ onComplete, authError, onLogin, onTeacherSetup }) {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    guardianName: '',
    relationship: 'Parent',
    childName: '',
    childAgeGroup: '',
    email: '',
    accountPassword: '',
    confirmAccountPassword: '',
    pin: '',
    confirmPin: '',
    consentAccepted: false,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const pinPreview = useMemo(
    () => form.pin.replace(/\D/g, '').slice(0, 4),
    [form.pin],
  )

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.guardianName.trim()) nextErrors.guardianName = 'Please enter the parent or guardian name.'
    if (!form.relationship.trim()) nextErrors.relationship = 'Please choose the relationship.'
    if (!form.childName.trim()) nextErrors.childName = 'Please enter the child name.'
    if (form.childName.trim().length > 14) nextErrors.childName = 'Name too long (max 14 letters).'
    if (!form.childAgeGroup) nextErrors.childAgeGroup = 'Please choose the child age range.'
    if (!isValidEmail(form.email)) nextErrors.email = 'Please enter a valid email address.'
    if (isSupabaseConfigured) {
      if (form.accountPassword.length < 8) nextErrors.accountPassword = 'Use at least 8 characters for secure login.'
      if (form.confirmAccountPassword !== form.accountPassword) nextErrors.confirmAccountPassword = 'Password does not match.'
    }
    if (pinPreview.length !== 4) nextErrors.pin = 'Please choose a 4-digit parent PIN.'
    if (form.confirmPin.replace(/\D/g, '').slice(0, 4) !== pinPreview) {
      nextErrors.confirmPin = 'PIN does not match.'
    }
    if (!form.consentAccepted) {
      nextErrors.consentAccepted = 'Parent or guardian consent is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSubmitting(true)

    const payload = {
      guardianName: form.guardianName,
      relationship: form.relationship,
      childName: form.childName.trim(),
      childAgeGroup: form.childAgeGroup,
      email: form.email,
      accountPassword: form.accountPassword,
      pin: pinPreview,
      consentAccepted: true,
      registeredAt: new Date().toISOString(),
      pageUrl: globalThis.location?.href || '',
      language: navigator.language || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      localTimestamp: new Date().toLocaleString('en-GB', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      userAgent: navigator.userAgent || 'unknown',
    }

    try {
      await fetch('/api/guardian-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianName: payload.guardianName,
          relationship: payload.relationship,
          childName: payload.childName,
          childAgeGroup: payload.childAgeGroup,
          email: payload.email,
          registeredAt: payload.registeredAt,
          pageUrl: payload.pageUrl,
          language: payload.language,
          timezone: payload.timezone,
          localTimestamp: payload.localTimestamp,
          userAgent: payload.userAgent,
        }),
        keepalive: true,
      }).catch(() => {})

      await onComplete(payload)
      setDone(true)
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: error?.message || 'Registration failed. Please try again.',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: PAGE_BG }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
        className="text-center max-w-sm">
        <div className="text-7xl mb-5">✅</div>
        <h2 className="font-bubble text-3xl mb-3" style={{ color: TEXT }}>You're registered!</h2>
        <p className="font-round text-sm mb-8" style={{ color: TEXT_MUTED }}>
          Please log in with your email and PIN to continue.
        </p>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={onLogin}
          className="w-full py-4 rounded-2xl font-bubble text-white text-xl"
          style={{ background: PRIMARY, boxShadow: '0 8px 22px rgba(194,65,12,0.3)' }}>
          Go to Login →
        </motion.button>
      </motion.div>
    </div>
  )

  return (
    <div
      className="min-h-screen overflow-y-auto px-4 py-8"
      style={{ background: PAGE_BG }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[32px] p-6"
          style={{ background: '#FFFFFF', border: '1px solid rgba(66,32,6,0.10)', boxShadow: '0 8px 30px rgba(66,32,6,0.08)' }}
        >
          <div className="text-center">
            <div className="text-5xl">🛡️</div>
            <h1 className="mt-3 font-bubble text-3xl" style={{ color: TEXT }}>Parent Setup</h1>
            <p className="mt-2 font-round text-sm" style={{ color: TEXT_MUTED }}>
              Before a child starts playing, a parent or guardian must register.
              This keeps child progress private and lets support contact the household if needed.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {onLogin && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="rounded-2xl px-6 py-3 font-bubble text-base text-white shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ background: PRIMARY, boxShadow: '0 8px 20px rgba(194,65,12,0.25)' }}
                >
                  Already registered? Log in
                </button>
              )}
              {onTeacherSetup && (
                <button
                  type="button"
                  onClick={onTeacherSetup}
                  className="rounded-2xl px-5 py-3 font-bubble text-sm text-white shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ background: TEAL, boxShadow: '0 8px 20px rgba(15,118,110,0.25)' }}
                >
                  🏫 I'm a teacher
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Parent or Guardian Name</span>
              <input
                type="text"
                value={form.guardianName}
                onChange={(event) => updateField('guardianName', event.target.value)}
                className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                style={INPUT_STYLE}
                placeholder="Full name"
                autoFocus
              />
              {errors.guardianName && <p className="mt-1 font-round text-xs text-red-600">{errors.guardianName}</p>}
            </label>

            <label className="block">
              <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Relationship</span>
              <select
                value={form.relationship}
                onChange={(event) => updateField('relationship', event.target.value)}
                className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                style={INPUT_STYLE}
              >
                <option value="Parent">Parent</option>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.relationship && <p className="mt-1 font-round text-xs text-red-600">{errors.relationship}</p>}
            </label>

            <div className="rounded-3xl p-4" style={{ background: '#FFF7ED', border: '1px solid rgba(66,32,6,0.10)' }}>
              <p className="font-round text-sm font-bold" style={{ color: TEXT }}>First Child Profile</p>
              <p className="mt-1 font-round text-xs font-bold" style={{ color: TEXT_FAINT }}>
                This decides which learning world appears after login. You can add one more player later.
              </p>

              <label className="mt-4 block">
                <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Child Name</span>
                <input
                  type="text"
                  value={form.childName}
                  onChange={(event) => updateField('childName', event.target.value.slice(0, 14))}
                  className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                  style={INPUT_STYLE}
                  placeholder="Child name"
                  maxLength={14}
                />
                <div className="mt-1 flex justify-between gap-3">
                  {errors.childName ? (
                    <p className="font-round text-xs text-red-600">{errors.childName}</p>
                  ) : (
                    <span />
                  )}
                  <p className="font-round text-xs font-bold" style={{ color: TEXT_FAINT }}>{form.childName.length}/14</p>
                </div>
              </label>

              <div className="mt-4">
                <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Age Range</span>
                <div className="mt-2 grid gap-2">
                  {CHILD_AGE_GROUPS.map((group) => {
                    const selected = form.childAgeGroup === group.id
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => updateField('childAgeGroup', group.id)}
                        className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-transform hover:scale-[1.01]"
                        style={{
                          borderColor: selected ? PRIMARY : 'rgba(66,32,6,0.14)',
                          background: selected ? 'rgba(194,65,12,0.08)' : '#FFFFFF',
                        }}
                      >
                        <span className="text-2xl">{group.emoji}</span>
                        <span className="flex-1">
                          <span className="block font-bubble text-lg" style={{ color: TEXT }}>
                            {group.label} <span className="font-round text-xs" style={{ color: TEXT_MUTED }}>Ages {group.range}</span>
                          </span>
                          <span className="block font-round text-xs font-bold" style={{ color: TEXT_MUTED }}>{group.helper}</span>
                        </span>
                        <span className="font-bubble text-lg" style={{ color: PRIMARY }}>{selected ? '✓' : ''}</span>
                      </button>
                    )
                  })}
                </div>
                {errors.childAgeGroup && <p className="mt-1 font-round text-xs text-red-600">{errors.childAgeGroup}</p>}
              </div>
            </div>

            <label className="block">
              <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Email Address</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                style={INPUT_STYLE}
                placeholder="name@example.com"
                inputMode="email"
              />
              {errors.email && <p className="mt-1 font-round text-xs text-red-600">{errors.email}</p>}
            </label>

            {isSupabaseConfigured && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Account Password</span>
                  <input
                    type="password"
                    value={form.accountPassword}
                    onChange={(event) => updateField('accountPassword', event.target.value)}
                    className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                    style={INPUT_STYLE}
                    placeholder="8+ characters"
                    autoComplete="new-password"
                  />
                  {errors.accountPassword && <p className="mt-1 font-round text-xs text-red-600">{errors.accountPassword}</p>}
                </label>

                <label className="block">
                  <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Confirm Password</span>
                  <input
                    type="password"
                    value={form.confirmAccountPassword}
                    onChange={(event) => updateField('confirmAccountPassword', event.target.value)}
                    className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                    style={INPUT_STYLE}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                  {errors.confirmAccountPassword && <p className="mt-1 font-round text-xs text-red-600">{errors.confirmAccountPassword}</p>}
                </label>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Choose Parent PIN</span>
                <input
                  type="password"
                  value={form.pin}
                  onChange={(event) => updateField('pin', event.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                  style={INPUT_STYLE}
                  placeholder="4 digits"
                  inputMode="numeric"
                />
                {errors.pin && <p className="mt-1 font-round text-xs text-red-600">{errors.pin}</p>}
              </label>

              <label className="block">
                <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Confirm PIN</span>
                <input
                  type="password"
                  value={form.confirmPin}
                  onChange={(event) => updateField('confirmPin', event.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                  style={INPUT_STYLE}
                  placeholder="Repeat PIN"
                  inputMode="numeric"
                />
                {errors.confirmPin && <p className="mt-1 font-round text-xs text-red-600">{errors.confirmPin}</p>}
              </label>
            </div>

            <label className="flex items-start gap-3 rounded-2xl p-4" style={{ background: '#FFF7ED', border: '1px solid rgba(66,32,6,0.10)' }}>
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(event) => updateField('consentAccepted', event.target.checked)}
                className="mt-1 h-4 w-4 rounded"
                style={{ borderColor: 'rgba(66,32,6,0.3)' }}
              />
              <span className="font-round text-sm" style={{ color: TEXT_MUTED }}>
                I am the parent or guardian of the child registered here. I consent to the collection and storage of my contact details and my child's learning progress data as described in the{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: TEXT }}>Privacy Policy</a>.
              </span>
            </label>
            {errors.consentAccepted && (
              <p className="font-round text-xs text-red-600">{errors.consentAccepted}</p>
            )}
            {errors.form && (
              <p className="font-round text-sm text-red-600">{errors.form}</p>
            )}
            {authError && (
              <p className="font-round text-sm text-red-600">{authError}</p>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 w-full rounded-2xl px-4 py-3 font-bubble text-lg text-white disabled:opacity-60"
            style={{ background: PRIMARY }}
          >
            {submitting ? 'Saving...' : 'Register Parent Access'}
          </motion.button>

          <p className="mt-3 text-center font-round text-xs" style={{ color: TEXT_FAINT }}>
            The parent PIN unlocks Parent Zone later.
          </p>
          <p className="mt-2 text-center font-round text-xs">
            <a href="/privacy" className="font-bold underline decoration-2 underline-offset-4" style={{ color: TEXT_MUTED }}>
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
