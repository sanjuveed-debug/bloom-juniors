import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isValidEmail } from '../utils/guardian'

// ── Step constants ───────────────────────────────────────────────────────────
const STEP_MODE    = 'mode'      // Create school or join via invite
const STEP_SCHOOL  = 'school'    // School name (create flow)
const STEP_INVITE  = 'invite'    // Checking invite token (join flow)
const STEP_DETAILS = 'details'   // Name, email, password, PIN, class
const STEP_DONE    = 'done'

const AGE_CLASS_OPTIONS = [
  { id: 'toddler', label: 'Nursery',           sub: 'Ages 3–4 · EYFS',         emoji: '🧸' },
  { id: 'early',   label: 'Reception & KS1',   sub: 'Ages 4–6 · Year 1–2',     emoji: '🌟' },
  { id: 'junior',  label: 'KS2',               sub: 'Ages 7–9 · Year 3–5',     emoji: '🚀' },
]

// ── TeacherSetup ─────────────────────────────────────────────────────────────
export default function TeacherSetup({ inviteToken = null, onComplete, onBack }) {
  const startStep = inviteToken ? STEP_INVITE : STEP_MODE

  const [step,          setStep]         = useState(startStep)
  const [mode,          setMode]         = useState(inviteToken ? 'join' : null)   // 'create' | 'join'
  const [inviteInfo,    setInviteInfo]   = useState(null)   // { schoolId, schoolName, email }
  const [inviteError,   setInviteError]  = useState('')
  const [submitting,    setSubmitting]   = useState(false)
  const [errors,        setErrors]       = useState({})

  const [form, setForm] = useState({
    schoolName:      '',
    guardianName:    '',
    email:           '',
    accountPassword: '',
    confirmPassword: '',
    pin:             '',
    confirmPin:      '',
    className:       '',
    classAgeGroup:   'early',
  })

  const pinPreview        = useMemo(() => form.pin.replace(/\D/g, '').slice(0, 4), [form.pin])
  const confirmPinPreview = useMemo(() => form.confirmPin.replace(/\D/g, '').slice(0, 4), [form.confirmPin])

  // ── Check invite token on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!inviteToken) return
    setStep(STEP_INVITE)
    fetch(`/api/teacher-invite-check?token=${encodeURIComponent(inviteToken)}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setInviteInfo(data)
          setForm(f => ({ ...f, email: data.email || '' }))
          setStep(STEP_DETAILS)
        } else {
          setInviteError(data.error || 'This invite link is not valid.')
          setStep(STEP_INVITE)
        }
      })
      .catch(() => {
        setInviteError('Could not check invite. Check your connection and try again.')
        setStep(STEP_INVITE)
      })
  }, [inviteToken])

  const update = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  // ── Validate details step ──────────────────────────────────────────────────
  const validateDetails = () => {
    const errs = {}
    if (!form.guardianName.trim()) errs.guardianName = 'Please enter your name.'
    if (!isValidEmail(form.email)) errs.email = 'Please enter a valid email address.'
    if (form.accountPassword.length < 8) errs.accountPassword = 'Use at least 8 characters.'
    if (form.confirmPassword !== form.accountPassword) errs.confirmPassword = 'Passwords do not match.'
    if (pinPreview.length !== 4) errs.pin = 'Please choose a 4-digit teacher PIN.'
    if (confirmPinPreview !== pinPreview) errs.confirmPin = 'PINs do not match.'
    if (!form.className.trim()) errs.className = 'Please enter a class name.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validateDetails()) return
    setSubmitting(true)
    try {
      await onComplete({
        guardianName:    form.guardianName.trim(),
        email:           form.email.trim().toLowerCase(),
        accountPassword: form.accountPassword,
        pin:             pinPreview,
        className:       form.className.trim(),
        classAgeGroup:   form.classAgeGroup,
        // Create flow
        schoolName:   mode === 'create' ? form.schoolName.trim() : undefined,
        // Join flow
        schoolId:     inviteInfo?.schoolId   || undefined,
        schoolName2:  inviteInfo?.schoolName || undefined,
        inviteToken:  inviteToken            || undefined,
      })
      setStep(STEP_DONE)
    } catch (err) {
      setErrors({ form: err?.message || 'Registration failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const BG = 'linear-gradient(160deg, #0a0a1f 0%, #130a2e 50%, #06101f 100%)'

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (step === STEP_DONE) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: BG }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
        className="text-center max-w-sm">
        <div className="text-7xl mb-5">✅</div>
        <h2 className="font-bubble text-white text-3xl mb-3">Classroom ready!</h2>
        <p className="font-round text-white/70 text-sm mb-8">
          Log in with your email and PIN to manage your class.
        </p>
      </motion.div>
    </div>
  )

  // ── CHECKING INVITE ────────────────────────────────────────────────────────
  if (step === STEP_INVITE && !inviteInfo) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: BG }}>
      {inviteError ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="font-bubble text-white text-2xl mb-3">Invite not valid</h2>
          <p className="font-round text-white/60 text-sm mb-6">{inviteError}</p>
          <button onClick={onBack}
            className="font-round text-white/50 text-sm hover:text-white/80 transition-colors">
            ← Back
          </button>
        </motion.div>
      ) : (
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-indigo-400 animate-spin mx-auto mb-4" />
          <p className="font-round text-white/60 text-sm">Checking your invite…</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen overflow-y-auto px-4 py-8" style={{ background: BG }}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur"
        >

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl">🏫</div>
            <h1 className="mt-2 font-bubble text-3xl text-white">
              {mode === 'join' && inviteInfo
                ? `Join ${inviteInfo.schoolName}`
                : mode === 'create'
                ? 'Create Your School'
                : 'Teacher Setup'}
            </h1>
            <p className="mt-2 font-round text-sm text-white/60">
              {mode === 'join' && inviteInfo
                ? 'Complete your details to set up your classroom'
                : mode === 'create'
                ? 'Set up Bloom Juniors for your school'
                : 'Get your classroom up and running'}
            </p>
          </div>

          {/* ── STEP: MODE PICKER ─────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
          {step === STEP_MODE && (
            <motion.div key="mode"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="grid gap-3">
              <button
                onClick={() => { setMode('create'); setStep(STEP_SCHOOL) }}
                className="w-full rounded-3xl p-5 text-left transition-transform hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.3))', border: '1.5px solid rgba(99,102,241,0.4)' }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🏗️</span>
                  <div>
                    <p className="font-bubble text-white text-lg">Create a school</p>
                    <p className="font-round text-white/55 text-sm mt-0.5">I'm the first teacher — set up our school and invite colleagues</p>
                  </div>
                  <span className="ml-auto font-bold text-white/40 text-xl">›</span>
                </div>
              </button>

              <button
                onClick={() => { setMode('join'); setStep(STEP_DETAILS) }}
                className="w-full rounded-3xl p-5 text-left transition-transform hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)' }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🔗</span>
                  <div>
                    <p className="font-bubble text-white text-lg">Join my school</p>
                    <p className="font-round text-white/55 text-sm mt-0.5">My school coordinator already set it up — I have an invite link</p>
                  </div>
                  <span className="ml-auto font-bold text-white/40 text-xl">›</span>
                </div>
              </button>

              {onBack && (
                <button onClick={onBack}
                  className="w-full font-round text-white/35 text-xs text-center mt-2 hover:text-white/60 transition-colors">
                  ← Back to parent login
                </button>
              )}
            </motion.div>
          )}

          {/* ── STEP: SCHOOL NAME (create flow) ───────────────────────────── */}
          {step === STEP_SCHOOL && (
            <motion.div key="school"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="grid gap-4">
              <label className="block">
                <span className="font-round text-sm font-bold text-white">School name</span>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={e => update('schoolName', e.target.value)}
                  placeholder="e.g. Greenfield Primary School"
                  maxLength={120}
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none"
                  style={{ fontSize: '1rem' }}
                  autoFocus
                />
                {errors.schoolName && <p className="mt-1 font-round text-xs text-red-300">{errors.schoolName}</p>}
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(STEP_MODE)}
                  className="flex-1 py-3 rounded-2xl font-round text-sm font-bold text-white/60 border border-white/15 hover:bg-white/8 transition-colors">
                  ← Back
                </button>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!form.schoolName.trim()) { setErrors({ schoolName: 'Please enter your school name.' }); return }
                    setStep(STEP_DETAILS)
                  }}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white text-base"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP: PERSONAL DETAILS ────────────────────────────────────── */}
          {step === STEP_DETAILS && (
            <motion.div key="details"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="grid gap-4">

              {/* School badge (join flow only) */}
              {inviteInfo && (
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <span className="text-2xl">🏫</span>
                  <div>
                    <p className="font-round text-white/50 text-xs">Joining</p>
                    <p className="font-bubble text-white text-base">{inviteInfo.schoolName}</p>
                  </div>
                </div>
              )}

              <label className="block">
                <span className="font-round text-sm font-bold text-white">Your full name</span>
                <input
                  type="text"
                  value={form.guardianName}
                  onChange={e => update('guardianName', e.target.value)}
                  placeholder="Ms. Smith"
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none"
                  style={{ fontSize: '1rem' }}
                  autoFocus={!inviteInfo}
                />
                {errors.guardianName && <p className="mt-1 font-round text-xs text-red-300">{errors.guardianName}</p>}
              </label>

              <label className="block">
                <span className="font-round text-sm font-bold text-white">Work email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="teacher@school.co.uk"
                  inputMode="email"
                  readOnly={Boolean(inviteInfo?.email)}
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none"
                  style={{ fontSize: '1rem', opacity: inviteInfo?.email ? 0.6 : 1 }}
                />
                {errors.email && <p className="mt-1 font-round text-xs text-red-300">{errors.email}</p>}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="font-round text-sm font-bold text-white">Password</span>
                  <input
                    type="password"
                    value={form.accountPassword}
                    onChange={e => update('accountPassword', e.target.value)}
                    placeholder="8+ characters"
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none"
                    style={{ fontSize: '1rem' }}
                  />
                  {errors.accountPassword && <p className="mt-1 font-round text-xs text-red-300">{errors.accountPassword}</p>}
                </label>
                <label className="block">
                  <span className="font-round text-sm font-bold text-white">Confirm password</span>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none"
                    style={{ fontSize: '1rem' }}
                  />
                  {errors.confirmPassword && <p className="mt-1 font-round text-xs text-red-300">{errors.confirmPassword}</p>}
                </label>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-round text-sm font-bold text-white">Teacher PIN</span>
                </div>
                <p className="font-round text-white/40 text-xs mb-2">Used to switch between pupils on shared devices</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <input
                      type="password"
                      value={form.pin}
                      onChange={e => update('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="4 digits"
                      inputMode="numeric"
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none"
                      style={{ fontSize: '1rem' }}
                    />
                    {errors.pin && <p className="mt-1 font-round text-xs text-red-300">{errors.pin}</p>}
                  </label>
                  <label className="block">
                    <input
                      type="password"
                      value={form.confirmPin}
                      onChange={e => update('confirmPin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Confirm PIN"
                      inputMode="numeric"
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none"
                      style={{ fontSize: '1rem' }}
                    />
                    {errors.confirmPin && <p className="mt-1 font-round text-xs text-red-300">{errors.confirmPin}</p>}
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="font-round text-sm font-bold text-white mb-3">Your class</p>
                <label className="block mb-3">
                  <span className="font-round text-xs font-bold text-white/60">Class name</span>
                  <input
                    type="text"
                    value={form.className}
                    onChange={e => update('className', e.target.value)}
                    placeholder="e.g. Year 1 – Oak, Reception – Blue"
                    maxLength={60}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none text-sm"
                    style={{ fontSize: '1rem' }}
                  />
                  {errors.className && <p className="mt-1 font-round text-xs text-red-300">{errors.className}</p>}
                </label>

                <p className="font-round text-xs font-bold text-white/60 mb-2">Age group</p>
                <div className="grid gap-2">
                  {AGE_CLASS_OPTIONS.map(opt => (
                    <button key={opt.id} type="button"
                      onClick={() => update('classAgeGroup', opt.id)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-transform hover:scale-[1.01]"
                      style={{
                        background: form.classAgeGroup === opt.id ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${form.classAgeGroup === opt.id ? '#818CF8' : 'rgba(255,255,255,0.12)'}`,
                      }}>
                      <span className="text-xl">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-round text-white text-sm font-bold leading-tight">{opt.label}</p>
                        <p className="font-round text-white/45 text-xs mt-0.5">{opt.sub}</p>
                      </div>
                      {form.classAgeGroup === opt.id && <span className="text-indigo-300 font-bold text-sm">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {errors.form && <p className="font-round text-sm text-red-300 text-center">{errors.form}</p>}

              <div className="flex gap-3">
                {!inviteToken && (
                  <button onClick={() => setStep(mode === 'create' ? STEP_SCHOOL : STEP_MODE)}
                    className="flex-1 py-3 rounded-2xl font-round text-sm font-bold text-white/60 border border-white/15 hover:bg-white/8 transition-colors">
                    ← Back
                  </button>
                )}
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white text-lg disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  {submitting ? 'Setting up…' : 'Create Classroom →'}
                </motion.button>
              </div>

              <p className="text-center font-round text-xs text-white/35">
                Your PIN unlocks student-switching on shared tablets.
              </p>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
