import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isValidEmail } from '../utils/guardian'

const STEP_MODE = 'mode'
const STEP_SCHOOL = 'school'
const STEP_INVITE = 'invite'
const STEP_DETAILS = 'details'
const STEP_DONE = 'done'

const TEXT = '#422006'
const TEXT_MUTED = 'rgba(66,32,6,0.62)'
const TEXT_FAINT = 'rgba(66,32,6,0.42)'
const PRIMARY = '#C2410C'
const TEAL = '#0F766E'
const BG = 'linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 50%, #FFF7ED 100%)'
const INPUT_STYLE = { background: '#FFFFFF', border: '1.5px solid rgba(66,32,6,0.16)', color: TEXT, fontSize: '1rem' }

const AGE_CLASS_OPTIONS = [
  { id: 'toddler', label: 'Nursery', sub: 'Ages 3-4, EYFS', tag: 'N' },
  { id: 'early', label: 'Reception & KS1', sub: 'Ages 4-6, Year 1-2', tag: 'R' },
  { id: 'junior', label: 'KS2', sub: 'Ages 7-9, Year 3-5', tag: 'K' },
]

function ChoiceBadge({ children, tone = 'teal' }) {
  const styles = {
    teal: {
      background: 'rgba(15,118,110,0.10)',
      border: '1px solid rgba(15,118,110,0.25)',
      color: TEAL,
    },
    orange: {
      background: 'rgba(194,65,12,0.08)',
      border: '1px solid rgba(194,65,12,0.22)',
      color: PRIMARY,
    },
    muted: {
      background: 'rgba(66,32,6,0.05)',
      border: '1px solid rgba(66,32,6,0.12)',
      color: TEXT_MUTED,
    },
  }
  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-round text-xs font-black uppercase tracking-wider"
      style={styles[tone] || styles.teal}
    >
      {children}
    </span>
  )
}

export default function TeacherSetup({ inviteToken = null, onComplete, onBack, onLogin }) {
  const startStep = inviteToken ? STEP_INVITE : STEP_MODE

  const [step, setStep] = useState(startStep)
  const [mode, setMode] = useState(inviteToken ? 'join' : 'create')
  const [inviteInfo, setInviteInfo] = useState(null)
  const [inviteError, setInviteError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    schoolName: '',
    guardianName: '',
    email: '',
    accountPassword: '',
    confirmPassword: '',
    pin: '',
    confirmPin: '',
    className: '',
    classAgeGroup: 'early',
  })

  const pinPreview = useMemo(() => form.pin.replace(/\D/g, '').slice(0, 4), [form.pin])
  const confirmPinPreview = useMemo(() => form.confirmPin.replace(/\D/g, '').slice(0, 4), [form.confirmPin])

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
    setErrors(e => ({ ...e, [key]: '', form: '' }))
  }

  const validateDetails = () => {
    const nextErrors = {}
    if (!form.guardianName.trim()) nextErrors.guardianName = 'Please enter your name.'
    if (!isValidEmail(form.email)) nextErrors.email = 'Please enter a valid email address.'
    if (form.accountPassword.length < 8) nextErrors.accountPassword = 'Use at least 8 characters.'
    if (form.confirmPassword !== form.accountPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    if (pinPreview.length !== 4) nextErrors.pin = 'Please choose a 4-digit teacher PIN.'
    if (confirmPinPreview !== pinPreview) nextErrors.confirmPin = 'PINs do not match.'
    if (!form.className.trim()) nextErrors.className = 'Please enter a class name.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateDetails()) return
    setSubmitting(true)
    try {
      await onComplete({
        guardianName: form.guardianName.trim(),
        email: form.email.trim().toLowerCase(),
        accountPassword: form.accountPassword,
        pin: pinPreview,
        className: form.className.trim(),
        classAgeGroup: form.classAgeGroup,
        schoolName: mode === 'create' ? form.schoolName.trim() : undefined,
        schoolId: inviteInfo?.schoolId || undefined,
        schoolName2: inviteInfo?.schoolName || undefined,
        inviteToken: inviteToken || undefined,
      })
      setStep(STEP_DONE)
    } catch (err) {
      setErrors({ form: err?.message || 'Registration failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const title =
    step === STEP_MODE ? 'Teacher Access' :
    mode === 'join' && inviteInfo ? `Join ${inviteInfo.schoolName}` :
    mode === 'create' ? 'Create Your School' :
    'Teacher Setup'

  const subtitle =
    step === STEP_MODE ? 'Sign in, create a school, or use an invite link' :
    mode === 'join' && inviteInfo ? 'Complete your details to set up your classroom' :
    mode === 'create' ? 'Set up Bloom Juniors for your school' :
    'Get your classroom up and running'

  if (step === STEP_DONE) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center max-w-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl font-bubble"
            style={{ background: 'rgba(15,118,110,0.10)', color: TEAL }}>OK</div>
          <h2 className="font-bubble text-3xl mb-3" style={{ color: TEXT }}>Your classroom is ready!</h2>
          <p className="font-round text-sm mb-3" style={{ color: TEXT_MUTED }}>Loading your class dashboard...</p>
          <div className="w-8 h-8 rounded-full border-4 animate-spin mx-auto" style={{ borderColor: 'rgba(66,32,6,0.15)', borderTopColor: TEAL }} />
        </motion.div>
      </div>
    )
  }

  if (step === STEP_INVITE && !inviteInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        {inviteError ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl font-bubble"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>!</div>
            <h2 className="font-bubble text-2xl mb-3" style={{ color: TEXT }}>Invite not valid</h2>
            <p className="font-round text-sm mb-6" style={{ color: TEXT_MUTED }}>{inviteError}</p>
            <button onClick={onBack} className="font-round text-sm transition-colors" style={{ color: TEXT_FAINT }}>
              Back
            </button>
          </motion.div>
        ) : (
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-4 animate-spin mx-auto mb-4" style={{ borderColor: 'rgba(66,32,6,0.15)', borderTopColor: TEAL }} />
            <p className="font-round text-sm" style={{ color: TEXT_MUTED }}>Checking your invite...</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto px-4 py-8" style={{ background: BG }}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[32px] p-6"
          style={{ background: '#FFFFFF', border: '1px solid rgba(66,32,6,0.10)', boxShadow: '0 8px 30px rgba(66,32,6,0.08)' }}
        >
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl font-bubble text-lg shadow-sm"
              style={{ background: 'rgba(15,118,110,0.10)', border: '1px solid rgba(15,118,110,0.25)', color: TEAL }}>
              BJ
            </div>
            <h1 className="mt-3 font-bubble text-3xl" style={{ color: TEXT }}>{title}</h1>
            <p className="mt-2 font-round text-sm" style={{ color: TEXT_MUTED }}>{subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {step === STEP_MODE && (
              <motion.div
                key="mode"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="grid gap-3"
              >
                {onLogin && (
                  <button
                    onClick={onLogin}
                    className="w-full rounded-3xl p-5 text-left transition-transform hover:scale-[1.01]"
                    style={{ background: 'rgba(15,118,110,0.06)', border: '1.5px solid rgba(15,118,110,0.28)' }}
                  >
                    <div className="flex items-center gap-4">
                      <ChoiceBadge tone="teal">In</ChoiceBadge>
                      <div>
                        <p className="font-bubble text-lg" style={{ color: TEXT }}>Sign in to teacher account</p>
                        <p className="font-round text-sm mt-0.5" style={{ color: TEXT_MUTED }}>I already have a school or classroom account</p>
                      </div>
                      <span className="ml-auto font-bold text-xl" style={{ color: TEXT_FAINT }}>&gt;</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => { setMode('create'); setStep(STEP_SCHOOL) }}
                  className="w-full rounded-3xl p-5 text-left transition-transform hover:scale-[1.01]"
                  style={{ background: 'rgba(194,65,12,0.06)', border: '1.5px solid rgba(194,65,12,0.28)' }}
                >
                  <div className="flex items-center gap-4">
                    <ChoiceBadge tone="orange">New</ChoiceBadge>
                    <div>
                      <p className="font-bubble text-lg" style={{ color: TEXT }}>Create a school</p>
                      <p className="font-round text-sm mt-0.5" style={{ color: TEXT_MUTED }}>I'm the first teacher - set up our school and invite colleagues</p>
                    </div>
                    <span className="ml-auto font-bold text-xl" style={{ color: TEXT_FAINT }}>&gt;</span>
                  </div>
                </button>

                <button
                  onClick={() => setErrors({ form: 'To join an existing school, open the invite link sent by your school admin.' })}
                  className="w-full rounded-3xl p-5 text-left transition-transform hover:scale-[1.01]"
                  style={{ background: '#FFF7ED', border: '1.5px solid rgba(66,32,6,0.12)' }}
                >
                  <div className="flex items-center gap-4">
                    <ChoiceBadge tone="muted">Link</ChoiceBadge>
                    <div>
                      <p className="font-bubble text-lg" style={{ color: TEXT }}>Join with invite link</p>
                      <p className="font-round text-sm mt-0.5" style={{ color: TEXT_MUTED }}>Open the invite link from your school admin</p>
                    </div>
                    <span className="ml-auto font-bold text-xl" style={{ color: TEXT_FAINT }}>&gt;</span>
                  </div>
                </button>

                {errors.form && <p className="font-round text-sm text-red-600 text-center">{errors.form}</p>}

                {onBack && (
                  <button onClick={onBack} className="w-full font-round text-xs text-center mt-2 transition-colors" style={{ color: TEXT_FAINT }}>
                    Back to parent login
                  </button>
                )}
              </motion.div>
            )}

            {step === STEP_SCHOOL && (
              <motion.div
                key="school"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="grid gap-4"
              >
                <label className="block">
                  <span className="font-round text-sm font-bold" style={{ color: TEXT }}>School name</span>
                  <input
                    type="text"
                    value={form.schoolName}
                    onChange={e => update('schoolName', e.target.value)}
                    placeholder="e.g. Greenfield Primary School"
                    maxLength={120}
                    className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none"
                    style={INPUT_STYLE}
                    autoFocus
                  />
                  {errors.schoolName && <p className="mt-1 font-round text-xs text-red-600">{errors.schoolName}</p>}
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(STEP_MODE)}
                    className="flex-1 py-3 rounded-2xl font-round text-sm font-bold transition-colors"
                    style={{ color: TEXT_MUTED, border: '1px solid rgba(66,32,6,0.15)' }}
                  >
                    Back
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (!form.schoolName.trim()) {
                        setErrors({ schoolName: 'Please enter your school name.' })
                        return
                      }
                      setStep(STEP_DETAILS)
                    }}
                    className="flex-1 py-3 rounded-2xl font-bubble text-white text-base"
                    style={{ background: TEAL }}
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === STEP_DETAILS && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="grid gap-4"
              >
                {inviteInfo && (
                  <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(15,118,110,0.08)', border: '1px solid rgba(15,118,110,0.22)' }}>
                    <ChoiceBadge tone="teal">Join</ChoiceBadge>
                    <div>
                      <p className="font-round text-xs" style={{ color: TEXT_FAINT }}>Joining</p>
                      <p className="font-bubble text-base" style={{ color: TEXT }}>{inviteInfo.schoolName}</p>
                    </div>
                  </div>
                )}

                <label className="block">
                  <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Your full name</span>
                  <input type="text" value={form.guardianName} onChange={e => update('guardianName', e.target.value)} placeholder="Ms. Smith" className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none" style={INPUT_STYLE} autoFocus={!inviteInfo} />
                  {errors.guardianName && <p className="mt-1 font-round text-xs text-red-600">{errors.guardianName}</p>}
                </label>

                <label className="block">
                  <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Work email</span>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="teacher@school.co.uk" inputMode="email" readOnly={Boolean(inviteInfo?.email)} className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none" style={{ ...INPUT_STYLE, opacity: inviteInfo?.email ? 0.6 : 1 }} />
                  {errors.email && <p className="mt-1 font-round text-xs text-red-600">{errors.email}</p>}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Password</span>
                    <input type="password" value={form.accountPassword} onChange={e => update('accountPassword', e.target.value)} placeholder="8+ characters" autoComplete="new-password" className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none" style={INPUT_STYLE} />
                    {errors.accountPassword && <p className="mt-1 font-round text-xs text-red-600">{errors.accountPassword}</p>}
                  </label>
                  <label className="block">
                    <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Confirm password</span>
                    <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat password" autoComplete="new-password" className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none" style={INPUT_STYLE} />
                    {errors.confirmPassword && <p className="mt-1 font-round text-xs text-red-600">{errors.confirmPassword}</p>}
                  </label>
                </div>

                <div>
                  <span className="font-round text-sm font-bold" style={{ color: TEXT }}>Teacher PIN</span>
                  <p className="font-round text-xs mb-2" style={{ color: TEXT_FAINT }}>Used to switch between pupils on shared devices</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <input type="password" value={form.pin} onChange={e => update('pin', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4 digits" inputMode="numeric" className="w-full rounded-2xl px-4 py-3 font-round outline-none" style={INPUT_STYLE} />
                      {errors.pin && <p className="mt-1 font-round text-xs text-red-600">{errors.pin}</p>}
                    </label>
                    <label className="block">
                      <input type="password" value={form.confirmPin} onChange={e => update('confirmPin', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Confirm PIN" inputMode="numeric" className="w-full rounded-2xl px-4 py-3 font-round outline-none" style={INPUT_STYLE} />
                      {errors.confirmPin && <p className="mt-1 font-round text-xs text-red-600">{errors.confirmPin}</p>}
                    </label>
                  </div>
                </div>

                <div className="rounded-3xl p-4" style={{ background: '#FFF7ED', border: '1px solid rgba(66,32,6,0.10)' }}>
                  <p className="font-round text-sm font-bold mb-3" style={{ color: TEXT }}>Your class</p>
                  <label className="block mb-3">
                    <span className="font-round text-xs font-bold" style={{ color: TEXT_MUTED }}>Class name</span>
                    <input type="text" value={form.className} onChange={e => update('className', e.target.value)} placeholder="e.g. Year 1 - Oak, Reception - Blue" maxLength={60} className="mt-1 w-full rounded-2xl px-4 py-3 font-round outline-none text-sm" style={INPUT_STYLE} />
                    {errors.className && <p className="mt-1 font-round text-xs text-red-600">{errors.className}</p>}
                  </label>

                  <p className="font-round text-xs font-bold mb-2" style={{ color: TEXT_MUTED }}>Age group</p>
                  <div className="grid gap-2">
                    {AGE_CLASS_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => update('classAgeGroup', opt.id)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-transform hover:scale-[1.01]"
                        style={{
                          background: form.classAgeGroup === opt.id ? 'rgba(15,118,110,0.10)' : '#FFFFFF',
                          border: `1.5px solid ${form.classAgeGroup === opt.id ? TEAL : 'rgba(66,32,6,0.14)'}`,
                        }}
                      >
                        <ChoiceBadge tone="teal">{opt.tag}</ChoiceBadge>
                        <div className="flex-1 min-w-0">
                          <p className="font-round text-sm font-bold leading-tight" style={{ color: TEXT }}>{opt.label}</p>
                          <p className="font-round text-xs mt-0.5" style={{ color: TEXT_FAINT }}>{opt.sub}</p>
                        </div>
                        {form.classAgeGroup === opt.id && <span className="font-bold text-sm" style={{ color: TEAL }}>Selected</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {errors.form && <p className="font-round text-sm text-red-600 text-center">{errors.form}</p>}

                <div className="flex gap-3">
                  {!inviteToken && (
                    <button onClick={() => setStep(mode === 'create' ? STEP_SCHOOL : STEP_MODE)} className="flex-1 py-3 rounded-2xl font-round text-sm font-bold transition-colors" style={{ color: TEXT_MUTED, border: '1px solid rgba(66,32,6,0.15)' }}>
                      Back
                    </button>
                  )}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-2xl font-bubble text-white text-lg disabled:opacity-60" style={{ background: TEAL }}>
                    {submitting ? 'Setting up...' : 'Create Classroom'}
                  </motion.button>
                </div>

                <p className="text-center font-round text-xs" style={{ color: TEXT_FAINT }}>Your PIN unlocks student-switching on shared tablets.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
