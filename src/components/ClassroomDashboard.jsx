import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { hydrateProgressData } from '../hooks/useProgress'
import { formatLocalDate } from '../utils/date'
import { MODULES_BY_AGE, getClassroomLesson, setClassroomLesson, clearClassroomLesson } from '../utils/classroomLesson'
import { clearCloudClassLesson, loadCloudClassLesson, loadCloudProgress, regenerateCloudClassCode, saveCloudClassLesson } from '../services/cloudStore'
import SchoolInviteModal from './SchoolInviteModal'
import TermlyReport from './TermlyReport'
import { buildCohortInsights } from '../utils/cohortInsights'

const KS2_MODULE_IDS = ['timestables','fractions','wordproblems','reading','spelling','grammar','science','worldmap','spirituality']

const MODULE_INFO = {
  phonics:'🎤', math:'🔢', tricky:'⭐', story:'📖', shapes:'🔷', logic:'🧩',
  science:'🔬', worldgk:'🌍', exercise:'🏃', planets:'🪐', davinci:'🎨',
  anatomy:'🫀', sacred:'🕌', piggybank:'🐷', arcade:'🎮',
  timestables:'✖️', fractions:'½', reading:'📖', spelling:'✏️',
  grammar:'🔤', wordproblems:'🧩', worldmap:'🌍', spirituality:'🕉️',
  animals:'🐘', colours:'🎨', numbers:'🔢', fruits:'🍎', bodyparts:'🖐️',
}

function getWeeklyStats(progress) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const sessions = (progress.sessions || []).filter(s => s.date >= sevenDaysAgo)
  const moduleIds = [...new Set(sessions.map(s => s.module))]
  const stars = sessions.reduce((sum, s) => sum + (s.stars || 0), 0)
  const totals = sessions.reduce((acc, s) => {
    acc.correct += Number(s.correct) || 0
    acc.total += Number(s.total) || 0
    return acc
  }, { correct: 0, total: 0 })
  const accuracy = totals.total > 0 ? Math.round((totals.correct / totals.total) * 100) : null
  const struggleEntries = Object.entries(progress.struggles || {})
    .filter(([, count]) => (Number(count) || 0) > 0)
    .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))
    .slice(0, 3)
  const needsSupport = Boolean(
    struggleEntries.length ||
    (totals.total >= 5 && accuracy !== null && accuracy < 60)
  )
  const dayStrings = new Set(sessions.map(s => new Date(s.date).toDateString()))
  // Build last-7-days activity map
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0)
    return { label: ['S','M','T','W','T','F','S'][d.getDay()], active: dayStrings.has(d.toDateString()) }
  })
  return { sessions: sessions.length, moduleIds, stars, daysActive: dayStrings.size, last7, accuracy, struggles: struggleEntries, needsSupport }
}

function loadProfileProgress(profileId) {
  try {
    const raw = localStorage.getItem(`eduapp_progress_${profileId}`)
    return raw ? hydrateProgressData(JSON.parse(raw)) : hydrateProgressData()
  } catch { return hydrateProgressData() }
}

function getTodayStatus(progress, todayKey) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySessions = (progress.sessions || []).filter(s => s.date >= today.getTime())
  if (todaySessions.length === 0) {
    // Also check KS2 lastPlayedDate
    const ks2Done = KS2_MODULE_IDS.some(id => progress[id]?.lastPlayedDate === todayKey)
    if (!ks2Done) return 'not-started'
    return 'in-progress'
  }
  if (todaySessions.length >= 2) return 'done'
  return 'in-progress'
}

const STATUS = {
  'done':        { label: 'Done ✓',      color: '#22C55E', bg: '#22C55E18', border: '#22C55E30' },
  'in-progress': { label: 'In progress', color: '#F59E0B', bg: '#F59E0B18', border: '#F59E0B30' },
  'not-started': { label: 'Not started', color: '#6B7280', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
}

const AGE_LABEL = { toddler: 'Nursery (3–4)', early: 'Reception/KS1 (4–6)', junior: 'KS2 (7–9)' }
const BULK_EMOJIS = ['⭐', '🦄', '🌈', '🎵', '🌸', '🎮', '🚀', '🦋', '🎨', '🌟', '🐬', '🦊']

function parseBulkPupils(text, defaultAgeGroup = 'early') {
  return String(text || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/,|\t/).map(part => part.trim()).filter(Boolean)
      const name = (parts[0] || '').replace(/^["']|["']$/g, '')
      const ageGroup = ['toddler', 'early', 'junior'].includes(parts[1]) ? parts[1] : defaultAgeGroup
      const emoji = parts.find(part => /\p{Extended_Pictographic}/u.test(part)) || BULK_EMOJIS[index % BULK_EMOJIS.length]
      return { name, ageGroup, emoji }
    })
}

function downloadCsv(filename, rows) {
  const csv = rows.map(row =>
    row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function BulkImportModal({ open, profiles, defaultAgeGroup, onClose, onImport }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  if (!open) return null

  const entries = parseBulkPupils(text, defaultAgeGroup)
  const existing = new Set(profiles.map(p => p.name.trim().toLowerCase()))
  const duplicateCount = entries.filter(entry => existing.has(entry.name.trim().toLowerCase())).length
  const remaining = Math.max(0, 30 - profiles.length)

  const handleImport = () => {
    const outcome = onImport(entries)
    setResult(outcome)
    if (outcome?.created?.length) setText('')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl rounded-t-3xl p-6 pb-10"
        style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%)', border: '1px solid rgba(99,102,241,0.3)', borderBottom: 'none' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="font-bubble text-white text-xl">Bulk import pupils</p>
            <p className="font-round text-white/45 text-xs mt-1">Paste one pupil per line. CSV format: name, age group, emoji. Age group is optional.</p>
          </div>
          <button onClick={onClose} className="font-round text-white/35 text-sm">✕</button>
        </div>

        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setResult(null) }}
          placeholder={"Emma\ne.g. Noah, early, 🌈\nAva, junior, 🚀"}
          className="w-full min-h-[180px] rounded-2xl bg-white/10 border border-white/15 p-4 font-round text-white placeholder-white/25 outline-none"
          style={{ fontSize: '1rem' }}
        />

        <div className="flex flex-wrap gap-3 mt-3 text-xs font-round">
          <span className="text-white/45">{entries.length} rows detected</span>
          <span className="text-white/45">{remaining} spaces left</span>
          {duplicateCount > 0 && <span className="text-orange-300">{duplicateCount} duplicate name(s) will be skipped</span>}
        </div>

        {result && (
          <div className="mt-4 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-round text-emerald-300 text-sm font-bold">{result.created?.length || 0} pupils imported</p>
            {result.rejected?.length > 0 && (
              <p className="font-round text-orange-300 text-xs mt-1">
                {result.rejected.length} skipped: {result.rejected.slice(0, 4).map(item => `${item.name || 'blank'} (${item.reason})`).join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-round text-white/45 text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button onClick={handleImport} disabled={entries.length === 0 || remaining === 0}
            className="flex-1 py-3 rounded-2xl font-bubble text-white text-base disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            Import pupils →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Lesson Setter ─────────────────────────────────────────────────────────────
function LessonSetter({ guardianId, schoolId, classId, className, todayKey, profiles, onLessonChange }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState([])

  const dominantAgeGroup = useMemo(() => {
    const counts = {}
    profiles.forEach(p => { const g = p.ageGroup || 'early'; counts[g] = (counts[g] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'early'
  }, [profiles])

  const modules = MODULES_BY_AGE[dominantAgeGroup] || MODULES_BY_AGE.early
  const current = getClassroomLesson(guardianId)
  const maxPicks = dominantAgeGroup === 'junior' ? 3 : 2

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < maxPicks ? [...prev, id] : prev
    )
  }

  const handleOpen = () => {
    setSelected(current || [])
    setOpen(true)
  }

  const handleSet = async () => {
    if (selected.length === 0) {
      clearClassroomLesson(guardianId)
      try { await clearCloudClassLesson(schoolId, className, todayKey, classId) } catch {}
    } else {
      setClassroomLesson(guardianId, selected)
      try { await saveCloudClassLesson(schoolId, className, todayKey, selected, classId) } catch {}
    }
    onLessonChange(selected)
    setOpen(false)
  }

  const handleClear = async () => {
    clearClassroomLesson(guardianId)
    try { await clearCloudClassLesson(schoolId, className, todayKey, classId) } catch {}
    onLessonChange(null)
    setOpen(false)
  }

  const currentModules = current
    ? current.map(id => modules.find(m => m.id === id)).filter(Boolean)
    : []

  return (
    <>
      {/* Banner */}
      <div className="mx-5 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: current ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', border: current ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-xl flex-shrink-0">📚</span>
        <div className="flex-1 min-w-0">
          <p className="font-round text-white/50 text-xs uppercase tracking-wider font-bold">Today's Lesson</p>
          {current && currentModules.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {currentModules.map(m => (
                <span key={m.id} className="font-round text-xs px-2 py-0.5 rounded-full text-white font-bold"
                  style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)' }}>
                  {m.emoji} {m.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-round text-white/30 text-sm mt-0.5">No lesson set — students see random daily path</p>
          )}
        </div>
        <motion.button whileTap={{ scale: 0.92 }} onClick={handleOpen}
          className="flex-shrink-0 font-round text-xs px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.25)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.4)' }}>
          {current ? 'Change' : 'Set lesson'}
        </motion.button>
      </div>

      {/* Picker modal */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setOpen(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
              style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%)', border: '1px solid rgba(99,102,241,0.3)', borderBottom: 'none' }}>

              <div className="flex items-center justify-between mb-1">
                <p className="font-bubble text-white text-lg">Set Today's Lesson</p>
                <button onClick={() => setOpen(false)} className="font-round text-white/30 text-sm">✕</button>
              </div>
              <p className="font-round text-white/40 text-xs mb-4">
                Pick up to {maxPicks} activities · all students in this class will see these today
              </p>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {modules.map(m => {
                  const isSelected = selected.includes(m.id)
                  const isDisabled = !isSelected && selected.length >= maxPicks
                  return (
                    <motion.button key={m.id} whileTap={{ scale: 0.93 }}
                      onClick={() => !isDisabled && toggle(m.id)}
                      className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                      style={{
                        background: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                        border: isSelected ? '1.5px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
                        opacity: isDisabled ? 0.4 : 1,
                      }}>
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="font-round text-white text-sm font-bold">{m.label}</span>
                      {isSelected && <span className="ml-auto text-indigo-300 text-sm font-bold">✓</span>}
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                {current && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleClear}
                    className="flex-1 py-3 rounded-2xl font-round text-sm text-white/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Clear lesson
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSet}
                  disabled={selected.length === 0}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white text-base"
                  style={{
                    background: selected.length > 0 ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.08)',
                    opacity: selected.length === 0 ? 0.5 : 1,
                    boxShadow: selected.length > 0 ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
                  }}>
                  Set for all students →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Student Card ──────────────────────────────────────────────────────────────
const StudentCard = React.memo(function StudentCard({ student, lessonModules, onSelect, index }) {
  const s = STATUS[student.status]
  const ageLabel = AGE_LABEL[student.ageGroup || 'early']

  const lessonStatus = lessonModules.map(m => ({
    ...m,
    done: student.todayModules.includes(m.id),
  }))

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => onSelect(student.id)}
      className="rounded-2xl p-4 text-left flex flex-col gap-2"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <div className="text-3xl">{student.emoji || '👤'}</div>
      <div>
        <p className="font-bubble text-white text-base leading-tight">{student.name}</p>
        <p className="font-round text-white/30 text-xs">{ageLabel}</p>
      </div>

      {/* Per-module lesson progress */}
      {lessonStatus.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-1">
          {lessonStatus.map(m => (
            <span key={m.id} className="font-round text-xs px-2 py-0.5 rounded-full"
              style={{
                background: m.done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)',
                color: m.done ? '#86EFAC' : 'rgba(255,255,255,0.35)',
                border: m.done ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}>
              {m.emoji} {m.done ? '✓' : '·'}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-auto">
          <span className="font-round text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.3)', color: s.color, border: `1px solid ${s.color}40` }}>
            {s.label}
          </span>
        </div>
      )}

      <p className="font-round text-white/20 text-xs">⭐ {student.totalStars}</p>
    </motion.button>
  )
})

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ClassroomDashboard({ profiles, guardian, onSelectStudent, onAddStudent, onBulkAddStudents, onUpdateGuardian, onBack, onLogout }) {
  const [filter,       setFilter]       = useState('all')
  const [search,       setSearch]       = useState('')
  const [showInvite,   setShowInvite]   = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [lessonVersion, setLessonVersion] = useState(0)
  const [view,         setView]         = useState('today') // 'today' | 'week' | 'insights'
  const [showReport,   setShowReport]   = useState(false)
  const [cloudProgressById, setCloudProgressById] = useState({})
  const [classCodeStatus, setClassCodeStatus] = useState('')
  const [regeneratingCode, setRegeneratingCode] = useState(false)

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const todayKey = formatLocalDate()

  const schoolId   = guardian?.schoolId   || null
  const schoolName = guardian?.schoolName || ''
  const isAdmin    = guardian?.teacherRole === 'admin'
  const className  = guardian?.className  || ''
  const classId    = guardian?.classId    || null
  const classCode  = guardian?.classCode  || ''
  const guardianId = guardian?.id         || guardian?.email || ''
  const classIsFull = profiles.length >= 30

  useEffect(() => {
    if (!schoolId || !className || !todayKey) return
    let active = true
    loadCloudClassLesson(schoolId, className, todayKey, classId)
      .then(moduleIds => {
        if (!active || !moduleIds) return
        setClassroomLesson(guardianId, moduleIds)
        setLessonVersion(v => v + 1)
      })
      .catch(() => {})
    return () => { active = false }
  }, [schoolId, classId, className, todayKey, guardianId])

  useEffect(() => {
    let active = true
    Promise.all(
      profiles.map(profile =>
        loadCloudProgress(profile.id)
          .then(progress => ({ id: profile.id, progress }))
          .catch(() => ({ id: profile.id, progress: null }))
      )
    ).then(results => {
      if (!active) return
      const next = {}
      results.forEach(({ id, progress }) => {
        if (!progress) return
        const hydrated = hydrateProgressData(progress)
        next[id] = hydrated
        try { localStorage.setItem(`eduapp_progress_${id}`, JSON.stringify(hydrated)) } catch {}
      })
      setCloudProgressById(next)
    })
    return () => { active = false }
  }, [profiles])

  // Re-read lesson when teacher sets/clears it
  const currentLesson = useMemo(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return getClassroomLesson(guardianId)
  // lessonVersion triggers re-read after teacher changes lesson
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardianId, lessonVersion])

  const dominantAgeGroup = useMemo(() => {
    const counts = {}
    profiles.forEach(p => { const g = p.ageGroup || 'early'; counts[g] = (counts[g] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'early'
  }, [profiles])

  const lessonModules = useMemo(() => {
    if (!currentLesson) return []
    const pool = MODULES_BY_AGE[dominantAgeGroup] || MODULES_BY_AGE.early
    return currentLesson.map(id => pool.find(m => m.id === id)).filter(Boolean)
  }, [currentLesson, dominantAgeGroup])

  const studentsWithStatus = useMemo(() => {
    return profiles.map(profile => {
      const progress = cloudProgressById[profile.id] || loadProfileProgress(profile.id)
      const status = getTodayStatus(progress, todayKey)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todaySessions = (progress.sessions || []).filter(s => s.date >= today.getTime())
      const completedIds = new Set(todaySessions.map(s => s.module))
      KS2_MODULE_IDS.forEach(id => {
        if (progress[id]?.lastPlayedDate === todayKey) completedIds.add(id)
      })
      return {
        ...profile,
        status,
        totalStars: progress.totalStars || 0,
        todayModules: [...completedIds],
        weekly: getWeeklyStats(progress),
      }
    })
  }, [profiles, todayKey, cloudProgressById])

  const insights = useMemo(() =>
    buildCohortInsights(profiles.map(p => ({
      ageGroup: p.ageGroup,
      progress: cloudProgressById[p.id] || loadProfileProgress(p.id),
    }))), [profiles, cloudProgressById])

  const supportCount = useMemo(() =>
    studentsWithStatus.filter(s => s.weekly.needsSupport).length, [studentsWithStatus])

  const searchTerm = search.trim().toLowerCase()
  const filtered = studentsWithStatus
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => !searchTerm || s.name.toLowerCase().includes(searchTerm))

  const doneCount       = studentsWithStatus.filter(s => s.status === 'done').length
  const inProgressCount = studentsWithStatus.filter(s => s.status === 'in-progress').length
  const pupilTabletUrl = classCode ? `/class?code=${encodeURIComponent(classCode)}` : '/class'
  const fullPupilTabletUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${pupilTabletUrl}`
    : pupilTabletUrl

  const handleCopyClassCode = async () => {
    if (!classCode) return
    try {
      await navigator.clipboard.writeText(classCode)
      setClassCodeStatus('Code copied')
    } catch {
      setClassCodeStatus('Copy failed')
    }
    window.setTimeout(() => setClassCodeStatus(''), 1800)
  }

  const handleCopyTabletLink = async () => {
    try {
      await navigator.clipboard.writeText(fullPupilTabletUrl)
      setClassCodeStatus('Link copied')
    } catch {
      setClassCodeStatus('Copy failed')
    }
    window.setTimeout(() => setClassCodeStatus(''), 1800)
  }

  const handleRegenerateClassCode = async () => {
    if (!classId || regeneratingCode) return
    const confirmed = window.confirm('Regenerate this class code? The old code will stop opening the pupil list for new tablets.')
    if (!confirmed) return
    setRegeneratingCode(true)
    setClassCodeStatus('')
    try {
      const updatedClass = await regenerateCloudClassCode(classId, className || 'Class')
      if (updatedClass?.classCode) {
        await onUpdateGuardian?.({ classCode: updatedClass.classCode })
        setClassCodeStatus('New code ready')
      }
    } catch {
      setClassCodeStatus('Could not regenerate')
    } finally {
      setRegeneratingCode(false)
      window.setTimeout(() => setClassCodeStatus(''), 2200)
    }
  }

  const handleExportCsv = () => {
    downloadCsv(`bloom-juniors-${className || 'class'}-${todayKey}.csv`, [
      ['Name', 'Age group', 'Today status', 'Stars', 'Today modules', 'Weekly sessions', 'Weekly stars', 'Weekly accuracy', 'Needs support', 'Struggles'],
      ...studentsWithStatus.map(student => [
        student.name,
        AGE_LABEL[student.ageGroup || 'early'],
        STATUS[student.status]?.label || student.status,
        student.totalStars,
        student.todayModules.join(' | '),
        student.weekly.sessions,
        student.weekly.stars,
        student.weekly.accuracy ?? '',
        student.weekly.needsSupport ? 'Yes' : 'No',
        student.weekly.struggles.map(([skill, count]) => `${skill}:${count}`).join(' | '),
      ]),
    ])
  }

  if (showReport) {
    return (
      <TermlyReport
        insights={insights}
        schoolName={schoolName}
        className={className}
        supportCount={supportCount}
        onClose={() => setShowReport(false)}
      />
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0c1a2e 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-safe pt-5 pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            {schoolName ? (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">🏫</span>
                <p className="font-round text-indigo-300/80 text-xs font-bold truncate max-w-[180px]">{schoolName}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-lg">🏫</span>
                <p className="font-round text-white/40 text-xs uppercase tracking-wider">Classroom Mode</p>
              </div>
            )}
            <h1 className="font-bubble text-white text-xl">
              Good morning{guardian?.guardianName ? `, ${guardian.guardianName.split(' ')[0]}` : ''}! 👋
            </h1>
            {className && <p className="font-round text-white/45 text-xs mt-0.5">📚 {className}</p>}
            {classCode && (
              <div className="mt-2 flex max-w-full flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5">
                  <span className="font-round text-[11px] font-bold uppercase tracking-wider text-emerald-200/70">Pupil tablet code</span>
                  <span className="font-bubble text-base tracking-wider text-emerald-100">{classCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyClassCode}
                  className="rounded-2xl px-3 py-1.5 font-round text-xs font-bold text-emerald-100 transition-colors hover:text-white"
                  style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(110,231,183,0.22)' }}
                >
                  Copy code
                </button>
                <a
                  href={pupilTabletUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl px-3 py-1.5 font-round text-xs font-bold text-indigo-100 transition-colors hover:text-white"
                  style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(165,180,252,0.24)' }}
                >
                  Open pupil tablet
                </a>
                <button
                  type="button"
                  onClick={handleCopyTabletLink}
                  className="rounded-2xl px-3 py-1.5 font-round text-xs font-bold text-white/55 transition-colors hover:text-white/80"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateClassCode}
                  disabled={regeneratingCode}
                  className="rounded-2xl px-3 py-1.5 font-round text-xs font-bold text-orange-100 transition-colors hover:text-white disabled:opacity-50"
                  style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(253,186,116,0.2)' }}
                >
                  {regeneratingCode ? 'Regenerating...' : 'Regenerate'}
                </button>
                {classCodeStatus && (
                  <span className="font-round text-xs font-bold text-white/45">{classCodeStatus}</span>
                )}
              </div>
            )}
            <p className="font-round text-white/25 text-xs mt-0.5">{today}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="font-round text-white/40 text-xs hover:text-white/70 transition-colors">
                  ← Exit Classroom
                </button>
              )}
              <button onClick={onLogout} className="font-round text-white/25 text-xs hover:text-white/50 transition-colors">
                Sign out
              </button>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && schoolId && (
                <button onClick={() => setShowInvite(true)}
                  className="font-round text-indigo-300/70 text-xs hover:text-indigo-300 transition-colors flex items-center gap-1">
                  ✉️ Invite colleague
                </button>
              )}
              <a href="/curriculum-map" target="_blank" className="font-round text-blue-400/60 text-xs hover:text-blue-400 transition-colors">
                📄 Curriculum Map
              </a>
            </div>
          </div>
        </div>

        {/* Daily summary */}
        <div className="flex gap-2 mt-3">
          {[
            { label: 'Completed', value: doneCount,        color: '#22C55E' },
            { label: 'In progress', value: inProgressCount, color: '#F59E0B' },
            { label: 'Not started', value: profiles.length - doneCount - inProgressCount, color: 'rgba(255,255,255,0.3)' },
            { label: 'Total', value: profiles.length, color: 'rgba(255,255,255,0.5)' },
          ].map(stat => (
            <div key={stat.label} className="flex-1 rounded-xl px-2 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-bubble text-xl" style={{ color: stat.color }}>{stat.value}</p>
              <p className="font-round text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        {profiles.length > 12 && (
          <div className="mt-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search pupils…"
              className="w-full font-round text-sm text-white placeholder-white/25 bg-transparent rounded-2xl pl-8 pr-3 py-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
          </div>
        )}

        {/* View toggle — Today / This Week */}
        <div className="flex gap-2 mt-3">
          {[{ key: 'today', label: '📅 Today' }, { key: 'week', label: '📊 This Week' }, { key: 'insights', label: '💡 Insights' }].map(v => (
            <button key={v.key} onClick={() => setView(v.key)}
              className="font-round text-xs px-4 py-1.5 rounded-full whitespace-nowrap transition-all font-bold"
              style={{
                background: view === v.key ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                color: view === v.key ? '#A5B4FC' : 'rgba(255,255,255,0.4)',
                border: view === v.key ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {onBulkAddStudents && !classIsFull && (
            <button onClick={() => setShowBulkImport(true)}
              className="font-round text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#86EFAC', border: '1px solid rgba(34,197,94,0.25)' }}>
              Import pupils
            </button>
          )}
          <button onClick={handleExportCsv}
            className="font-round text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Export CSV
          </button>
          <button onClick={() => setShowReport(true)}
            className="font-round text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.3)' }}>
            📋 Termly report
          </button>
        </div>

        {/* Filter tabs — today view only */}
        {view === 'today' && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {[
              { key: 'all',         label: `All (${profiles.length})` },
              { key: 'not-started', label: 'Not started' },
              { key: 'in-progress', label: 'In progress' },
              { key: 'done',        label: 'Done ✓' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="font-round text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
                style={{
                  background: filter === f.key ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: filter === f.key ? 'white' : 'rgba(255,255,255,0.4)',
                  border: filter === f.key ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lesson setter — shown when there are students */}
      {profiles.length > 0 && guardianId && (
        <LessonSetter
          guardianId={guardianId}
          schoolId={schoolId}
          classId={classId}
          className={className}
          todayKey={todayKey}
          profiles={profiles}
          onLessonChange={() => setLessonVersion(v => v + 1)}
        />
      )}

      {/* ── TODAY VIEW ─────────────────────────────────────────────────────── */}
      {view === 'today' && (
        <div className="px-4 pt-4 pb-28">
          {profiles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🎒</p>
              <p className="font-bubble text-white text-xl mb-2">No pupils yet</p>
              <p className="font-round text-white/40 text-sm mb-1">Add each pupil by name.</p>
              <p className="font-round text-white/30 text-xs mb-6">They will each get their own learning profile on this device.</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onAddStudent}
                className="px-6 py-3 rounded-2xl font-bubble text-white"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                + Add First Pupil
              </motion.button>
            </div>
          ) : (
            <>
              {filtered.length === 0 && (
                <p className="text-center font-round text-white/30 text-sm py-8">No students match this filter</p>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map((student, i) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    lessonModules={lessonModules}
                    onSelect={onSelectStudent}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
          {profiles.length > 0 && (
            classIsFull ? (
              <div
                className="w-full mt-4 py-4 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)' }}
              >
                <p className="font-bubble text-white/55 text-base">Class is full</p>
                <p className="font-round text-white/30 text-xs mt-1">30 pupils added. Delete a pupil before adding another.</p>
              </div>
            ) : (
              <motion.button whileTap={{ scale: 0.95 }} onClick={onAddStudent}
                className="w-full mt-4 py-4 rounded-2xl font-bubble text-white/50 text-base flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)' }}>
                <span className="text-lg">+</span> Add Pupil
              </motion.button>
            )
          )}
        </div>
      )}

      {/* ── THIS WEEK VIEW ──────────────────────────────────────────────────── */}
      {view === 'week' && (
        <div className="px-4 pt-4 pb-28">
          {profiles.length === 0 ? (
            <p className="text-center font-round text-white/30 text-sm py-16">No pupils added yet</p>
          ) : (
            <>
              {/* Weekly summary bar */}
              {(() => {
                const activeCount = studentsWithStatus.filter(s => s.weekly.daysActive > 0).length
                const totalSessions = studentsWithStatus.reduce((sum, s) => sum + s.weekly.sessions, 0)
                const notSeen = studentsWithStatus.filter(s => s.weekly.daysActive === 0)
                return (
                  <div className="rounded-2xl p-4 mb-4"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <p className="font-round text-white/50 text-xs uppercase tracking-wider mb-2">Week summary</p>
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <p className="font-bubble text-2xl text-white">{activeCount}<span className="font-round text-white/40 text-sm">/{profiles.length}</span></p>
                        <p className="font-round text-white/40 text-xs">pupils active</p>
                      </div>
                      <div>
                        <p className="font-bubble text-2xl text-indigo-300">{totalSessions}</p>
                        <p className="font-round text-white/40 text-xs">total sessions</p>
                      </div>
                      {notSeen.length > 0 && (
                        <div className="ml-auto">
                          <p className="font-bubble text-2xl text-orange-400">{notSeen.length}</p>
                          <p className="font-round text-orange-400/70 text-xs">not seen this week</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Not-seen alert */}
              {studentsWithStatus.some(s => s.weekly.daysActive === 0) && (
                <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3"
                  style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
                  <span className="text-xl">⚠️</span>
                  <p className="font-round text-orange-300 text-sm font-bold">
                    {studentsWithStatus.filter(s => s.weekly.daysActive === 0).map(s => s.name).join(', ')} — no activity this week
                  </p>
                </div>
              )}

              {/* Weekly rows */}
              <div className="flex flex-col gap-2">
                {[...studentsWithStatus]
                  .sort((a, b) => b.weekly.daysActive - a.weekly.daysActive || b.weekly.sessions - a.weekly.sessions)
                  .map((student, i) => {
                    const w = student.weekly
                    const level = w.daysActive >= 4 ? 'high' : w.daysActive >= 2 ? 'mid' : w.daysActive >= 1 ? 'low' : 'none'
                    const levelColor = { high: '#22C55E', mid: '#F59E0B', low: '#94A3B8', none: '#F97316' }[level]
                    const levelLabel = { high: 'Active', mid: 'Some days', low: 'Light', none: 'Not seen' }[level]
                    return (
                      <motion.div key={student.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="rounded-2xl p-3 flex items-center gap-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${levelColor}25` }}>
                        {/* Name */}
                        <span className="text-2xl">{student.emoji || '👤'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bubble text-white text-sm leading-tight truncate">{student.name}</p>
                          {/* 7-day dots */}
                          <div className="flex gap-1 mt-1">
                            {w.last7.map((day, di) => (
                              <div key={di} className="flex flex-col items-center gap-0.5">
                                <div className="w-4 h-4 rounded-full"
                                  style={{ background: day.active ? levelColor : 'rgba(255,255,255,0.08)' }} />
                                <span className="font-round text-white/25" style={{ fontSize: 8 }}>{day.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Module emojis */}
                        <div className="flex gap-0.5 flex-wrap justify-end max-w-[80px]">
                          {w.moduleIds.slice(0, 5).map(id => (
                            <span key={id} className="text-base">{MODULE_INFO[id] || '📚'}</span>
                          ))}
                          {w.needsSupport && (
                            <span className="font-round text-[10px] px-1.5 py-0.5 rounded-full text-orange-200"
                              style={{ background: 'rgba(251,146,60,0.16)', border: '1px solid rgba(251,146,60,0.28)' }}>
                              support
                            </span>
                          )}
                        </div>
                        {/* Stars */}
                        <div className="text-right shrink-0 min-w-[44px]">
                          <p className="font-bubble text-yellow-300 text-sm">⭐{w.stars}</p>
                          <p className="font-round text-xs mt-0.5 font-bold" style={{ color: levelColor }}>
                            {w.accuracy === null ? levelLabel : `${w.accuracy}%`}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── INSIGHTS VIEW — anonymised cohort analytics ─────────────────────── */}
      {view === 'insights' && (
        <div className="px-4 pt-4 pb-28">
          {profiles.length === 0 ? (
            <p className="text-center font-round text-white/30 text-sm py-16">No pupils added yet</p>
          ) : (
            <>
              {/* Headline week-over-week */}
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <p className="font-round text-white/50 text-xs uppercase tracking-wider mb-2">This week vs last week</p>
                <div className="flex gap-5 flex-wrap">
                  <div>
                    <p className="font-bubble text-2xl text-white">
                      {insights.weeks[3].sessions}
                      {insights.weekDelta.sessions !== 0 && (
                        <span className="font-round text-sm ml-1" style={{ color: insights.weekDelta.sessions > 0 ? '#34D399' : '#FB923C' }}>
                          {insights.weekDelta.sessions > 0 ? '▲' : '▼'}{Math.abs(insights.weekDelta.sessions)}
                        </span>
                      )}
                    </p>
                    <p className="font-round text-white/40 text-xs">sessions</p>
                  </div>
                  <div>
                    <p className="font-bubble text-2xl text-white">
                      {insights.weeks[3].activePupils}<span className="font-round text-white/40 text-sm">/{profiles.length}</span>
                      {insights.weekDelta.activePupils !== 0 && (
                        <span className="font-round text-sm ml-1" style={{ color: insights.weekDelta.activePupils > 0 ? '#34D399' : '#FB923C' }}>
                          {insights.weekDelta.activePupils > 0 ? '▲' : '▼'}{Math.abs(insights.weekDelta.activePupils)}
                        </span>
                      )}
                    </p>
                    <p className="font-round text-white/40 text-xs">pupils active</p>
                  </div>
                  <div>
                    <p className="font-bubble text-2xl text-emerald-300">{insights.accuracy28 !== null ? `${insights.accuracy28}%` : '—'}</p>
                    <p className="font-round text-white/40 text-xs">accuracy (4 wks)</p>
                  </div>
                </div>
              </div>

              {/* Phonics phase distribution */}
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="font-round text-white/50 text-xs uppercase tracking-wider mb-1">🎤 Phonics phases</p>
                <p className="font-round text-white/30 text-xs mb-3">Where the class is on the RWI sound progression</p>
                <div className="flex flex-col gap-2.5">
                  {insights.phaseDistribution.map(p => (
                    <div key={p.phase} className="flex items-center gap-3">
                      <span className="font-round text-white/60 text-xs w-28 flex-shrink-0">{p.short}</span>
                      <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${insights.pupils ? (p.count / insights.pupils) * 100 : 0}%`,
                          background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                        }} />
                      </div>
                      <span className="font-bubble text-white text-sm w-6 text-right">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* EYFS area coverage */}
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="font-round text-white/50 text-xs uppercase tracking-wider mb-3">📚 EYFS area coverage · last 4 weeks</p>
                <div className="flex flex-col gap-2">
                  {insights.areas.map(a => (
                    <div key={a.id} className="flex items-center gap-3">
                      <span className="font-round text-white/70 text-xs flex-1 truncate">{a.emoji} {a.label}</span>
                      <span className="font-round text-white/40 text-xs">{a.pupilsEngaged}/{insights.pupils} pupils</span>
                      <span className="font-bubble text-indigo-300 text-sm w-16 text-right">{a.sessions} sess</span>
                      <span className="font-round text-xs w-10 text-right" style={{ color: a.accuracy !== null && a.accuracy >= 75 ? '#34D399' : 'rgba(255,255,255,0.4)' }}>
                        {a.accuracy !== null ? `${a.accuracy}%` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly trend */}
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="font-round text-white/50 text-xs uppercase tracking-wider mb-3">📈 Sessions per week</p>
                <div className="flex flex-col gap-2">
                  {insights.weeks.map(w => {
                    const max = Math.max(1, ...insights.weeks.map(x => x.sessions))
                    return (
                      <div key={w.label} className="flex items-center gap-3">
                        <span className="font-round text-xs w-20 flex-shrink-0" style={{ color: w.isCurrent ? 'white' : 'rgba(255,255,255,0.35)' }}>{w.label}</span>
                        <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${(w.sessions / max) * 100}%`,
                            background: w.isCurrent ? 'linear-gradient(90deg, #10B981, #34D399)' : 'rgba(148,163,184,0.5)',
                          }} />
                        </div>
                        <span className="font-bubble text-white/70 text-xs w-8 text-right">{w.sessions}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Support flag + report CTA */}
              {supportCount > 0 && (
                <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3"
                  style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
                  <span className="text-xl">⚠️</span>
                  <p className="font-round text-orange-300 text-sm font-bold">
                    {supportCount} pupil{supportCount === 1 ? '' : 's'} flagged for extra support — see This Week tab
                  </p>
                </div>
              )}
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowReport(true)}
                className="w-full py-4 rounded-2xl font-bubble text-white text-base"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                📋 Open printable termly report →
              </motion.button>
              <p className="font-round text-white/25 text-xs text-center mt-2">
                Anonymised · EYFS-mapped · print or save as PDF for parents, leadership or KHDA visits
              </p>
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {showInvite && schoolId && (
          <SchoolInviteModal
            schoolId={schoolId}
            schoolName={schoolName || 'your school'}
            onClose={() => setShowInvite(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBulkImport && (
          <BulkImportModal
            open={showBulkImport}
            profiles={profiles}
            defaultAgeGroup={dominantAgeGroup}
            onClose={() => setShowBulkImport(false)}
            onImport={(entries) => onBulkAddStudents?.(entries) || { created: [], rejected: entries }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
