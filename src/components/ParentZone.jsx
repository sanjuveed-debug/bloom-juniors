import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEMES } from '../themes'
import { isDigestOptedIn, setDigestOptIn, buildDigestPayload, sendDigestEmail, markDigestSent } from '../utils/weeklyDigest.js'

const MAX_PIN_ATTEMPTS = 5
const PIN_LOCKOUT_MS = 5 * 60 * 1000

const MODULES_INFO = [
  { id: 'phonics', label: 'Phonics',      emoji: '🎤', color: '#FF6B9D' },
  { id: 'math',    label: 'Maths',        emoji: '🔢', color: '#F59E0B' },
  { id: 'tricky',  label: 'Tricky Words', emoji: '⭐', color: '#FFD700' },
  { id: 'story',   label: 'Story Room',   emoji: '📖', color: '#34D399' },
  { id: 'logic',   label: 'Logic',        emoji: '🧩', color: '#60A5FA' },
  { id: 'shop',    label: 'Coin Shop',    emoji: '🛍️', color: '#A78BFA' },
]

const STICKER_TYPES = [
  { emoji: '⭐', label: 'Star' },
  { emoji: '🌟', label: 'Gold Star' },
  { emoji: '🦄', label: 'Unicorn' },
  { emoji: '🌈', label: 'Rainbow' },
  { emoji: '🏆', label: 'Trophy' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '🌸', label: 'Flower' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function fmtDuration(secs) {
  if (!secs) return '—'
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

function fmtTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function AccuracyRing({ accuracy, color, size = 56 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - (accuracy || 0) / 100)
  const ringColor = accuracy >= 80 ? '#22C55E' : accuracy >= 60 ? '#F59E0B' : '#EF4444'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={ringColor} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

export default function ParentZone({ avatar, progress, profileId, onBack, onSetChallenge, onAddSticker, onReset, onSwitchProfiles, profileName, profileAgeGroup, parentPin, onUpdateProgress, onUpdateProfile, onLogout, guardianEmail, onUpdateGuardian, classroomMode }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [pinAttempts, setPinAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [tab, setTab] = useState('analytics')
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetPin, setResetPin] = useState('')
  const [reportEmail, setReportEmail] = useState(guardianEmail || '')
  const [reportStatus, setReportStatus] = useState('idle')
  const [profileDraft, setProfileDraft] = useState({ name: profileName || '', ageGroup: profileAgeGroup || 'early' })
  const [editSaved, setEditSaved] = useState(false)
  const [digestOptIn, setDigestOptInState] = useState(() => isDigestOptedIn(profileId))
  const pinTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(pinTimerRef.current), [])
  const expectedPin = String(parentPin || '')
  const isLockedOut = lockedUntil > Date.now()
  const lockoutSeconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))

  const sessions = progress.sessions || []
  const struggles = progress.struggles || {}

  // Today's data
  const today = useMemo(() => {
    const midnight = new Date(); midnight.setHours(0, 0, 0, 0)
    return sessions.filter(s => s.date >= midnight.getTime())
  }, [sessions])

  const todayStars    = today.reduce((sum, s) => sum + (s.stars || 0), 0)
  const todayMinutes  = Math.round(today.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)
  const todayAccuracy = today.length > 0
    ? Math.round(today.reduce((sum, s) => sum + (s.accuracy || 0), 0) / today.length)
    : 0

  // 7-day heatmap
  const heatmap = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      const nextDay = new Date(d); nextDay.setDate(nextDay.getDate() + 1)
      const daySessions = sessions.filter(s => s.date >= d.getTime() && s.date < nextDay.getTime())
      return {
        label: DAYS[d.getDay()],
        count: daySessions.length,
        stars: daySessions.reduce((sum, s) => sum + (s.stars || 0), 0),
        isToday: i === 6,
      }
    })
  }, [sessions])

  const maxCount = Math.max(1, ...heatmap.map(d => d.count))

  // Module accuracy (from sessions)
  const moduleAccuracy = useMemo(() => {
    return MODULES_INFO.map(mod => {
      const modSessions = sessions.filter(s => s.module === mod.id && s.total > 0)
      if (!modSessions.length) return { ...mod, accuracy: null, sessionCount: 0 }
      const avg = Math.round(modSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / modSessions.length)
      return { ...mod, accuracy: avg, sessionCount: modSessions.length }
    })
  }, [sessions])

  // Top struggles across all modules
  const topStruggles = useMemo(() => {
    const all = []
    MODULES_INFO.forEach(mod => {
      const items = struggles[mod.id] || []
      items.forEach(s => all.push({ ...s, module: mod.id, emoji: mod.emoji, color: mod.color }))
    })
    return all.sort((a, b) => b.count - a.count).slice(0, 5)
  }, [struggles])

  const handlePin = useCallback((digit) => {
    if (!expectedPin || isLockedOut) return
    setPinError(false)
    setPin(prev => {
      if (prev.length >= 4) return prev
      const next = `${prev}${digit}`.slice(0, 4)
      if (next.length === 4) {
        clearTimeout(pinTimerRef.current)
        pinTimerRef.current = window.setTimeout(() => {
          if (next === expectedPin) {
            setPinAttempts(0)
            setLockedUntil(0)
            setUnlocked(true)
            setPin('')
            return
          }
          setPinAttempts(prevAttempts => {
            const attempts = prevAttempts + 1
            if (attempts >= MAX_PIN_ATTEMPTS) setLockedUntil(Date.now() + PIN_LOCKOUT_MS)
            return attempts
          })
          setPinError(true)
          setPin('')
        }, next === expectedPin ? 300 : 400)
      }
      return next
    })
  }, [expectedPin, isLockedOut])

  const handleSetChallenge = useCallback(() => {
    if (!selectedChallenge) return
    onSetChallenge(selectedChallenge)
    setSelectedChallenge(null)
  }, [selectedChallenge, onSetChallenge])

  const sendProgressReport = useCallback(async () => {
    if (!reportEmail.includes('@') || reportStatus === 'sending') return
    setReportStatus('sending')
    try {
      const ok = await sendDigestEmail(buildDigestPayload({ progress, profileName, parentEmail: reportEmail }))
      if (ok) markDigestSent(profileId)
      setReportStatus(ok ? 'done' : 'error')
    } catch {
      setReportStatus('error')
    }
  }, [reportEmail, reportStatus, progress, profileName, profileId])

  const getModuleScore = (id) => {
    const mod = progress[id]
    if (!mod) return { score: 0, percent: 0 }
    const score = mod.score || 0
    return { score, percent: Math.min(100, score * 2) }
  }

  // PIN screen
  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="absolute top-12 left-4 w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xs">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🔒</div>
            <h2 className="font-bubble text-3xl shimmer-text">Parent Zone</h2>
            <p className="font-round text-sm mt-1 opacity-70" style={{ color: theme.text }}>Enter your parent PIN to continue</p>
          </div>

          {!expectedPin && (
            <p className="mb-4 rounded-2xl bg-red-500/12 px-4 py-3 text-center font-round text-sm font-bold text-red-500">
              Parent PIN is not set for this account. Please register again or contact support.
            </p>
          )}

          <div className="flex justify-center gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i}
                animate={pinError ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: pin.length > i ? theme.primary : theme.card,
                  border: `3px solid ${pinError ? '#EF4444' : pin.length > i ? theme.accent : theme.secondary}`
                }}>
                {pin.length > i && <div className="w-3 h-3 rounded-full bg-white" />}
              </motion.div>
            ))}
          </div>
          {pinError && !isLockedOut && (
            <p className="text-red-500 font-round text-center text-sm mb-3">
              Wrong PIN. {Math.max(0, MAX_PIN_ATTEMPTS - pinAttempts)} tries left.
            </p>
          )}
          {isLockedOut && (
            <p className="text-red-500 font-round text-center text-sm mb-3">
              Too many wrong attempts. Try again in {lockoutSeconds}s.
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((digit, i) => (
              <motion.button key={i}
                whileTap={{ scale: digit !== '' ? 0.88 : 1 }}
                onClick={() => {
                  if (digit === '⌫') setPin(p => p.slice(0, -1))
                  else if (digit !== '') handlePin(String(digit))
                }}
                disabled={digit === '' || !expectedPin || isLockedOut}
                className="h-14 rounded-2xl font-bubble text-2xl shadow-md disabled:opacity-0"
                style={{ background: digit === '⌫' ? '#EF4444' : theme.card, color: theme.text }}>
                {digit}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  const TABS = [
        { id: 'analytics', label: 'Stats' },
        { id: 'map',       label: 'Progress' },
        { id: 'quiz',      label: 'Challenge' },
        { id: 'stickers',  label: 'Stickers' },
  ]

  return (
    <div className="min-h-screen pb-8" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <h1 className="font-bubble text-2xl shimmer-text">Parent Zone 🔓</h1>
        <div className="text-2xl">👨‍👩‍👧</div>
      </div>

      {/* Summary banner */}
      <div className="mx-4 p-4 rounded-3xl shadow-lg mb-3"
        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
        <p className="font-bubble text-white text-lg">{profileName || 'Learner'}'s Report</p>
        <div className="flex gap-4 mt-2">
          <div className="text-center">
            <p className="font-bubble text-3xl text-white">{progress.totalStars || 0}</p>
            <p className="font-round text-white/80 text-xs">Total Stars</p>
          </div>
          <div className="text-center">
            <p className="font-bubble text-3xl text-white">{sessions.length}</p>
            <p className="font-round text-white/80 text-xs">Sessions</p>
          </div>
          <div className="text-center">
            <p className="font-bubble text-3xl text-white">{progress.stickers?.length || 0}</p>
            <p className="font-round text-white/80 text-xs">Stickers</p>
          </div>
          <div className="text-center">
            <p className="font-bubble text-3xl text-white">{progress.shop?.coins || 0}</p>
            <p className="font-round text-white/80 text-xs">Coins</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto pb-1">
        {TABS.map(t => (
          <motion.button key={t.id} whileTap={{ scale: 0.9 }}
            onClick={() => setTab(t.id)}
            className="flex-shrink-0 px-3 py-2 rounded-2xl font-bubble text-xs"
            style={{
              background: tab === t.id ? theme.primary : theme.card,
              color: tab === t.id ? 'white' : theme.text
            }}>
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-4 flex flex-col gap-4">

            {/* Today's Story — human-readable narrative */}
            {today.length > 0 && (() => {
              const playedIds = [...new Set(today.map(s => s.module))]
              const modLines = playedIds.map(id => {
                const info = MODULES_INFO.find(m => m.id === id)
                const sess = today.filter(s => s.module === id)
                const hasScored = sess.some(s => s.total > 0)
                const avg = hasScored
                  ? Math.round(sess.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sess.filter(s => s.total > 0).length)
                  : null
                const count = sess.length
                return info
                  ? `${info.emoji} ${info.label}${count > 1 ? ` ×${count}` : ''}${avg !== null ? ` (${avg}%)` : ''}`
                  : id
              })
              const topStruggle = topStruggles[0]
              const struggleLine = topStruggle
                ? ` Still working on "${topStruggle.item}" in ${MODULES_INFO.find(m => m.id === topStruggle.module)?.label || topStruggle.module}.`
                : ''
              const starsLine = todayStars > 0 ? `, earning ${todayStars} star${todayStars !== 1 ? 's' : ''}` : ''
              const timeLine = todayMinutes > 0 ? ` in ${todayMinutes} min` : ''
              return (
                <div className="rounded-3xl p-4 shadow" style={{ background: theme.card }}>
                  <p className="font-bubble text-base mb-1" style={{ color: theme.text }}>Today's Story 📖</p>
                  <p className="font-round text-sm leading-6" style={{ color: theme.text, opacity: 0.85 }}>
                    {profileName || 'Your child'} played {modLines.join(' and ')}{starsLine}{timeLine}.{struggleLine}
                  </p>
                </div>
              )
            })()}

            {/* Today's snapshot */}
            <div>
              <p className="font-bubble text-lg mb-2" style={{ color: theme.text }}>Today's Snapshot ☀️</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Sessions',  value: today.length,     emoji: '🎮', color: '#8B5CF6' },
                  { label: 'Stars',     value: todayStars,       emoji: '⭐', color: '#F59E0B' },
                  { label: 'Minutes',   value: todayMinutes || 0, emoji: '⏱', color: '#06B6D4' },
                  { label: 'Accuracy',  value: `${todayAccuracy}%`, emoji: '🎯', color: '#22C55E' },
                ].map((card, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-3 shadow text-center"
                    style={{ background: card.color + '18', border: `2px solid ${card.color}40` }}>
                    <div className="text-2xl mb-1">{card.emoji}</div>
                    <p className="font-bubble text-2xl" style={{ color: card.color }}>{card.value}</p>
                    <p className="font-round text-xs opacity-70" style={{ color: theme.text }}>{card.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 7-day heatmap */}
            <div className="rounded-3xl p-4 shadow" style={{ background: theme.card }}>
              <p className="font-bubble text-base mb-3" style={{ color: theme.text }}>Last 7 Days 📅</p>
              <div className="flex gap-1 justify-between">
                {heatmap.map((day, i) => {
                  const intensity = day.count / maxCount
                  const dotSize = 10 + Math.round(intensity * 24)
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="rounded-full flex items-center justify-center"
                        style={{
                          width: dotSize, height: dotSize,
                          background: day.count > 0 ? theme.primary : '#E5E7EB',
                          opacity: day.count > 0 ? 0.4 + intensity * 0.6 : 1,
                          border: day.isToday ? `2px solid ${theme.accent}` : 'none',
                        }} />
                      <p className="font-round text-center leading-none"
                        style={{ fontSize: 9, color: day.isToday ? theme.primary : theme.text, opacity: day.isToday ? 1 : 0.6 }}>
                        {day.label}
                      </p>
                      {day.count > 0 && (
                        <p className="font-round text-center leading-none"
                          style={{ fontSize: 8, color: theme.primary }}>
                          {day.count}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mood calendar */}
            {(progress.moodLog || []).length > 0 && (
              <div className="rounded-3xl p-4 shadow" style={{ background: theme.card }}>
                <p className="font-bubble text-base mb-3" style={{ color: theme.text }}>Mood Check-ins 💛</p>
                <div className="flex gap-1 justify-between flex-wrap">
                  {(progress.moodLog || []).slice(-14).map((entry, i) => (
                    <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: 32 }}>
                      <span className="text-2xl">{entry.emoji}</span>
                      <p className="font-round" style={{ fontSize: 9, color: theme.text, opacity: 0.7 }}>
                        {entry.date.split('-').slice(1).join('/')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Module accuracy rings */}
            <div className="rounded-3xl p-4 shadow" style={{ background: theme.card }}>
              <p className="font-bubble text-base mb-3" style={{ color: theme.text }}>Module Accuracy 🎯</p>
              <div className="grid grid-cols-3 gap-3">
                {moduleAccuracy.map(mod => (
                  <div key={mod.id} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <AccuracyRing accuracy={mod.accuracy ?? 0} color={mod.color} size={56} />
                      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(0deg)' }}>
                        <span className="font-bubble text-xs" style={{ color: mod.color }}>
                          {mod.accuracy !== null ? `${mod.accuracy}%` : '—'}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg">{mod.emoji}</span>
                    <p className="font-round text-center leading-none"
                      style={{ fontSize: 9, color: theme.text, opacity: 0.7 }}>
                      {mod.label}
                    </p>
                    {mod.sessionCount > 0 && (
                      <p className="font-round text-center leading-none"
                        style={{ fontSize: 8, color: theme.text, opacity: 0.5 }}>
                        {mod.sessionCount} sessions
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Session log */}
            <div className="rounded-3xl p-4 shadow" style={{ background: theme.card }}>
              <p className="font-bubble text-base mb-3" style={{ color: theme.text }}>Recent Sessions 📋</p>
              {sessions.length === 0 ? (
                <p className="font-round text-sm text-center opacity-50" style={{ color: theme.text }}>
                  No sessions yet. Start playing!
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...sessions].reverse().slice(0, 10).map((s, i) => {
                    const mod = MODULES_INFO.find(m => m.id === s.module) || {}
                    const accColor = (s.accuracy || 0) >= 80 ? '#22C55E' : (s.accuracy || 0) >= 60 ? '#F59E0B' : '#EF4444'
                    return (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-2xl"
                        style={{ background: (mod.color || '#999') + '12' }}>
                        <span className="text-xl">{mod.emoji || '🎮'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-round text-xs font-bold truncate" style={{ color: theme.text }}>
                            {mod.label || s.module}
                          </p>
                          <p className="font-round opacity-60 leading-none" style={{ fontSize: 10, color: theme.text }}>
                            {fmtDate(s.date)} · {fmtTime(s.date)} · {fmtDuration(s.duration)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-bubble text-sm" style={{ color: '#F59E0B' }}>⭐{s.stars || 0}</span>
                          {s.total > 0 && (
                            <span className="font-round rounded-lg px-1.5 py-0.5 text-white"
                              style={{ fontSize: 9, background: accColor }}>
                              {s.accuracy ?? 0}%
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Struggle panel */}
            {topStruggles.length > 0 && (
              <div className="rounded-3xl p-4 shadow" style={{ background: theme.card }}>
                <p className="font-bubble text-base mb-1" style={{ color: theme.text }}>Needs More Practice 💪</p>
                <p className="font-round text-xs opacity-60 mb-3" style={{ color: theme.text }}>
                  Items {profileName || 'they'} got wrong most often
                </p>
                <div className="flex flex-col gap-2">
                  {topStruggles.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-2xl"
                      style={{ background: s.color + '15', border: `1.5px solid ${s.color}40` }}>
                      <span className="text-xl">{s.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bubble text-sm" style={{ color: theme.text }}>{s.item}</p>
                        <p className="font-round opacity-60 leading-none" style={{ fontSize: 10, color: theme.text }}>
                          wrong {s.count}× · {MODULES_INFO.find(m => m.id === s.module)?.label}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bubble text-xs"
                        style={{ background: s.color }}>
                        {s.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── PROGRESS TAB ── */}
        {tab === 'map' && (
          <motion.div key="map" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-4 flex flex-col gap-3">
            {MODULES_INFO.map(mod => {
              const { score, percent } = getModuleScore(mod.id)
              const modSessions = sessions.filter(s => s.module === mod.id)
              const avgAcc = modSessions.length > 0
                ? Math.round(modSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / modSessions.length)
                : null
              return (
                <div key={mod.id} className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                      style={{ background: mod.color + '30' }}>
                      {mod.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-bubble text-sm" style={{ color: theme.text }}>{mod.label}</p>
                      <p className="font-round text-xs opacity-60" style={{ color: theme.text }}>
                        {score} stars · {modSessions.length} sessions
                        {avgAcc !== null ? ` · ${avgAcc}% avg` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bubble text-xl" style={{ color: mod.color }}>{percent}%</p>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      style={{ background: `linear-gradient(90deg, ${mod.color}, ${mod.color}AA)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* ── CHALLENGE TAB ── */}
        {tab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-4">
            <div className="p-4 rounded-3xl shadow mb-4" style={{ background: theme.card }}>
              <p className="font-bubble text-lg mb-1" style={{ color: theme.text }}>🎯 Set Daily Challenge</p>
              <p className="font-round text-sm opacity-70 mb-3" style={{ color: theme.text }}>
                Choose a module {profileName || 'your child'} must complete today to unlock stickers!
              </p>

              {progress.dailyChallenge && (
                <div className="mb-3 p-3 rounded-2xl"
                  style={{ background: progress.challengeCompleted ? '#D1FAE5' : `${theme.primary}20` }}>
                  <p className="font-round text-sm font-bold" style={{ color: theme.text }}>
                    Current: {MODULES_INFO.find(m => m.id === progress.dailyChallenge)?.label}
                    {progress.challengeCompleted ? ' ✅ Completed!' : ' ⏳ In progress...'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                {MODULES_INFO.map(mod => (
                  <motion.button key={mod.id} whileTap={{ scale: 0.93 }}
                    onClick={() => setSelectedChallenge(mod.id)}
                    className="p-3 rounded-2xl text-left flex items-center gap-2"
                    style={{
                      background: selectedChallenge === mod.id ? mod.color : mod.color + '20',
                      border: `2px solid ${mod.color}`,
                    }}>
                    <span className="text-2xl">{mod.emoji}</span>
                    <span className="font-round text-xs font-bold"
                      style={{ color: selectedChallenge === mod.id ? 'white' : theme.text }}>
                      {mod.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <motion.button whileTap={{ scale: 0.9 }}
                onClick={handleSetChallenge}
                disabled={!selectedChallenge}
                className="w-full py-3 rounded-2xl font-bubble text-white disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                Set Today's Challenge 🎯
              </motion.button>
            </div>

            {/* Session Timer */}
            <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
              <p className="font-bubble text-lg mb-1" style={{ color: theme.text }}>⏱ Session Timer</p>
              <p className="font-round text-sm opacity-70 mb-3" style={{ color: theme.text }}>
                Set how long {profileName || 'your child'} can play before a break reminder.
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bubble text-3xl" style={{ color: theme.primary }}>
                  {progress.sessionMinutes || 30}
                </span>
                <span className="font-round text-sm opacity-70" style={{ color: theme.text }}>minutes</span>
              </div>
              <input
                type="range" min={10} max={60} step={5}
                value={progress.sessionMinutes || 30}
                onChange={e => onUpdateProgress?.({ sessionMinutes: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between font-round text-xs opacity-50 mt-1" style={{ color: theme.text }}>
                <span>10 min</span><span>60 min</span>
              </div>
            </div>

            {/* Sacred Stories toggle */}
            <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="font-bubble text-base mb-0.5" style={{ color: theme.text }}>🕉️ Sacred Stories</p>
                  <p className="font-round text-xs opacity-60" style={{ color: theme.text }}>
                    Show or hide the World Faiths & Stories module for this profile.
                  </p>
                </div>
                <button
                  onClick={() => onUpdateProgress?.({ hideSacred: !progress.hideSacred })}
                  className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                  style={{ background: progress.hideSacred ? '#d1d5db' : '#8B00FF' }}
                >
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: progress.hideSacred ? 'translateX(0)' : 'translateX(20px)' }} />
                </button>
              </div>
            </div>

            {/* Progress Report */}
            <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-bubble text-lg" style={{ color: theme.text }}>📧 Email Progress Report</p>
                <div className="flex items-center gap-2">
                  <span className="font-round text-xs opacity-60" style={{ color: theme.text }}>Weekly auto</span>
                  <button
                    onClick={() => {
                      const next = !digestOptIn
                      setDigestOptIn(profileId, next)
                      setDigestOptInState(next)
                    }}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ background: digestOptIn ? '#8B00FF' : '#d1d5db' }}
                  >
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                      style={{ transform: digestOptIn ? 'translateX(20px)' : 'translateX(0)' }} />
                  </button>
                </div>
              </div>
              <p className="font-round text-sm opacity-70 mb-3" style={{ color: theme.text }}>
                {digestOptIn
                  ? `Auto-sending every week to ${reportEmail || 'your email'}.`
                  : `Send a weekly summary of ${profileName || "your child"}'s learning to any email.`}
              </p>
              {reportStatus === 'done' ? (
                <div className="rounded-2xl p-3 text-center" style={{ background: '#22c55e18', border: '1.5px solid #22c55e44' }}>
                  <p className="font-bubble text-base" style={{ color: '#16a34a' }}>✅ Report sent!</p>
                  <p className="font-round text-xs mt-1 opacity-70" style={{ color: theme.text }}>Check your inbox.</p>
                  <button onClick={() => setReportStatus('idle')} className="font-round text-xs mt-2 underline opacity-50" style={{ color: theme.text }}>Send another</button>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={reportEmail}
                    onChange={e => { setReportEmail(e.target.value); if (reportStatus === 'error') setReportStatus('idle') }}
                    placeholder="parent@email.com"
                    className="w-full rounded-2xl px-4 py-2.5 font-round text-sm mb-2 outline-none"
                    style={{ background: theme.bg, border: `1.5px solid ${theme.primary}40`, color: theme.text }}
                  />
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={sendProgressReport}
                    disabled={reportStatus === 'sending'}
                    className="w-full py-3 rounded-2xl font-bubble text-white disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                    {reportStatus === 'sending' ? 'Sending…' : 'Send Progress Report 📧'}
                  </motion.button>
                  {reportStatus === 'error' && (
                    <p className="font-round text-xs text-red-400 mt-2 text-center">Failed to send. Check email and try again.</p>
                  )}
                </>
              )}
            </div>

            {/* Edit Player */}
            {onUpdateProfile && (
              <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
                <p className="font-bubble text-lg mb-3" style={{ color: theme.text }}>✏️ Edit Player</p>
                <label className="font-round text-xs opacity-60 mb-1 block" style={{ color: theme.text }}>Name</label>
                <input
                  value={profileDraft.name}
                  maxLength={14}
                  onChange={e => { setProfileDraft(d => ({ ...d, name: e.target.value })); setEditSaved(false) }}
                  className="w-full rounded-2xl px-4 py-3 font-round text-sm mb-3 outline-none"
                  style={{ background: theme.bg, border: `1.5px solid ${theme.primary}40`, color: theme.text }}
                />
                <label className="font-round text-xs opacity-60 mb-1 block" style={{ color: theme.text }}>Age Group</label>
                <select
                  value={profileDraft.ageGroup}
                  onChange={e => { setProfileDraft(d => ({ ...d, ageGroup: e.target.value })); setEditSaved(false) }}
                  className="w-full rounded-2xl px-4 py-3 font-round text-sm mb-3 outline-none"
                  style={{ background: theme.bg, border: `1.5px solid ${theme.primary}40`, color: theme.text }}
                >
                  <option value="toddler">Tiny Stars (3–4)</option>
                  <option value="early">Little Stars (4–6)</option>
                  <option value="junior">Super Kids (7–9)</option>
                </select>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={!profileDraft.name.trim()}
                  onClick={() => {
                    if (!profileDraft.name.trim()) return
                    onUpdateProfile({ name: profileDraft.name.trim(), ageGroup: profileDraft.ageGroup })
                    setEditSaved(true)
                  }}
                  className="w-full py-3 rounded-2xl font-bubble text-white disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                  {editSaved ? '✅ Saved!' : 'Save Changes'}
                </motion.button>
              </div>
            )}

            {/* Switch Profiles */}
            {onSwitchProfiles && (
              <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
                <p className="font-bubble text-lg mb-1" style={{ color: theme.text }}>👤 Switch Player</p>
                <p className="font-round text-sm opacity-70 mb-3" style={{ color: theme.text }}>
                  Go back to the player selection screen to add or switch profiles.
                </p>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => { setUnlocked(false); onSwitchProfiles() }}
                  className="w-full py-3 rounded-2xl font-bubble text-white"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                  Switch Player 👤
                </motion.button>
              </div>
            )}

            {/* Classroom Mode */}
            {onUpdateGuardian && (
              <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="font-bubble text-base mb-0.5" style={{ color: theme.text }}>🏫 Classroom Mode</p>
                    <p className="font-round text-xs opacity-60 mb-1" style={{ color: theme.text }}>
                      Replace the home screen with a teacher dashboard — see every student's daily completion at a glance.
                    </p>
                    {classroomMode && (
                      <a href="/curriculum-map" target="_blank"
                        className="font-round text-xs underline"
                        style={{ color: theme.accent }}>
                        View Curriculum Alignment PDF →
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => onUpdateGuardian({ classroomMode: !classroomMode })}
                    className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                    style={{ background: classroomMode ? '#6366F1' : '#d1d5db' }}
                  >
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                      style={{ transform: classroomMode ? 'translateX(20px)' : 'translateX(0)' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Log Out */}
            {onLogout && (
              <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
                <p className="font-bubble text-lg mb-1" style={{ color: theme.text }}>🔒 Log Out</p>
                <p className="font-round text-sm opacity-70 mb-3" style={{ color: theme.text }}>
                  End your parent session. You'll need your email and PIN to log back in.
                </p>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => { setUnlocked(false); onLogout() }}
                  className="w-full py-3 rounded-2xl font-bubble text-white"
                  style={{ background: 'linear-gradient(135deg, #6B7280, #374151)' }}>
                  Log Out 🔒
                </motion.button>
              </div>
            )}

            {/* Reset */}
            <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
              <p className="font-bubble text-lg mb-1 text-red-500">⚠️ Reset Progress</p>
              <p className="font-round text-sm opacity-70 mb-3" style={{ color: theme.text }}>
                This will delete all of {profileName || 'this profile'}'s stars, stickers, sessions and progress. Cannot be undone!
              </p>
              {!showResetConfirm ? (
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-3 rounded-2xl font-bubble text-white"
                  style={{ background: '#EF4444' }}>
                  Reset All Progress
                </motion.button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="password"
                    inputMode="numeric"
                    value={resetPin}
                    onChange={e => setResetPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Re-enter parent PIN"
                    className="w-full rounded-2xl border border-red-200 bg-white/70 px-4 py-3 text-center font-round font-bold outline-none"
                  />
                  <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => { setShowResetConfirm(false); setResetPin('') }}
                    className="flex-1 py-3 rounded-2xl font-bubble text-white"
                    style={{ background: '#9CA3AF' }}>
                    Cancel
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }}
                    disabled={resetPin !== expectedPin}
                    onClick={() => { onReset(); setResetPin(''); setShowResetConfirm(false); setUnlocked(false); onBack() }}
                    className="flex-1 py-3 rounded-2xl font-bubble text-white"
                    style={{ background: resetPin === expectedPin ? '#DC2626' : '#FCA5A5' }}>
                    Yes, Reset!
                  </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STICKERS TAB ── */}
        {tab === 'stickers' && (
          <motion.div key="stickers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-4">
            <div className="p-4 rounded-3xl shadow mb-4" style={{ background: theme.card }}>
              <p className="font-bubble text-lg mb-3" style={{ color: theme.text }}>🌟 Give a Sticker</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {STICKER_TYPES.map(s => (
                  <motion.button key={s.emoji} whileTap={{ scale: 0.85 }}
                    onClick={() => onAddSticker({ type: 'gift', emoji: s.emoji, label: s.label })}
                    className="aspect-square rounded-2xl flex items-center justify-center text-3xl shadow"
                    style={{ background: theme.card, border: `2px solid ${theme.secondary}` }}>
                    {s.emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-3xl shadow" style={{ background: theme.card }}>
              <p className="font-bubble text-lg mb-3" style={{ color: theme.text }}>
                Sticker Book ({progress.stickers?.length || 0})
              </p>
              {(progress.stickers?.length || 0) === 0
                ? <p className="font-round text-sm text-center opacity-50" style={{ color: theme.text }}>
                    No stickers yet! Keep playing to earn some!
                  </p>
                : (
                  <div className="flex flex-wrap gap-2">
                    {(progress.stickers || []).map((s, i) => (
                      <motion.div key={i}
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="text-3xl w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm"
                        style={{ background: theme.bg }}>
                        {s.emoji || '⭐'}
                      </motion.div>
                    ))}
                  </div>
                )
              }
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

