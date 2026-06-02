import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { hydrateProgressData } from '../hooks/useProgress'
import { formatLocalDate } from '../utils/date'

function loadProfileProgress(profileId) {
  try {
    const raw = localStorage.getItem(`eduapp_progress_${profileId}`)
    return raw ? hydrateProgressData(JSON.parse(raw)) : hydrateProgressData()
  } catch { return hydrateProgressData() }
}

function getTodayStatus(progress) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySessions = (progress.sessions || []).filter(s => s.date >= today.getTime())
  if (todaySessions.length === 0) return 'not-started'
  if (todaySessions.length >= 2) return 'done'
  return 'in-progress'
}

const STATUS = {
  'done':        { label: 'Done ✓',      color: '#22C55E', bg: '#22C55E18', border: '#22C55E30' },
  'in-progress': { label: 'In progress', color: '#F59E0B', bg: '#F59E0B18', border: '#F59E0B30' },
  'not-started': { label: 'Not started', color: '#6B7280', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
}

const AGE_LABEL = { toddler: 'Nursery (3–4)', early: 'Reception (4–6)', junior: 'KS2 (7–9)' }

const StudentCard = React.memo(function StudentCard({ student, onSelect, index }) {
  const s = STATUS[student.status]
  const ageLabel = AGE_LABEL[student.ageGroup || 'early']
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
      <div className="flex items-center gap-1.5 flex-wrap mt-auto">
        <span className="font-round text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.3)', color: s.color, border: `1px solid ${s.color}40` }}>
          {s.label}
        </span>
      </div>
      {student.todayModules.length > 0 && (
        <p className="font-round text-white/25 text-xs">
          {student.todayModules.slice(0, 3).join(' · ')}
        </p>
      )}
      <p className="font-round text-white/20 text-xs">⭐ {student.totalStars} total</p>
    </motion.button>
  )
})

export default function ClassroomDashboard({ profiles, guardian, onSelectStudent, onAddStudent, onBack, onLogout }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const studentsWithStatus = useMemo(() => {
    return profiles.map(profile => {
      const progress = loadProfileProgress(profile.id)
      const status = getTodayStatus(progress)
      const todayDate = formatLocalDate()
      const todaySessions = (progress.sessions || []).filter(s => {
        const d = new Date(s.date)
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` === todayDate
      })
      return {
        ...profile,
        status,
        totalStars: progress.totalStars || 0,
        todayModules: [...new Set(todaySessions.map(s => s.module))],
      }
    })
  }, [profiles])

  const searchTerm = search.trim().toLowerCase()
  const filtered = studentsWithStatus
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => !searchTerm || s.name.toLowerCase().includes(searchTerm))
  const doneCount = studentsWithStatus.filter(s => s.status === 'done').length
  const inProgressCount = studentsWithStatus.filter(s => s.status === 'in-progress').length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0c1a2e 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-safe pt-5 pb-4 sticky top-0 z-10" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-lg">🏫</span>
              <p className="font-round text-white/40 text-xs uppercase tracking-wider">Classroom Mode</p>
            </div>
            <h1 className="font-bubble text-white text-xl">
              Good morning{guardian?.guardianName ? `, ${guardian.guardianName.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="font-round text-white/30 text-xs mt-0.5">{today}</p>
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
            <a href="/curriculum-map" target="_blank" className="font-round text-blue-400/60 text-xs hover:text-blue-400 transition-colors">
              📄 Curriculum Map
            </a>
          </div>
        </div>

        {/* Daily summary */}
        <div className="flex gap-2 mt-3">
          {[
            { label: 'Completed', value: doneCount, color: '#22C55E' },
            { label: 'In progress', value: inProgressCount, color: '#F59E0B' },
            { label: 'Total', value: profiles.length, color: 'rgba(255,255,255,0.5)' },
          ].map(stat => (
            <div key={stat.label} className="flex-1 rounded-xl px-2 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-bubble text-xl" style={{ color: stat.color }}>{stat.value}</p>
              <p className="font-round text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search — shown when roster exceeds 15 students */}
        {profiles.length > 15 && (
          <div className="mt-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students…"
              className="w-full font-round text-sm text-white placeholder-white/25 bg-transparent rounded-2xl pl-8 pr-3 py-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'not-started', label: 'Not started' },
            { key: 'in-progress', label: 'In progress' },
            { key: 'done', label: 'Done' },
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
      </div>

      {/* Student grid */}
      <div className="px-4 pt-4 pb-28">
        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🎒</p>
            <p className="font-bubble text-white text-xl mb-2">No students yet</p>
            <p className="font-round text-white/40 text-sm mb-6">Add your class to get started</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onAddStudent}
              className="px-6 py-3 rounded-2xl font-bubble text-white"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              + Add First Student
            </motion.button>
          </div>
        ) : (
          <>
            {filtered.length === 0 && (
              <p className="text-center font-round text-white/30 text-sm py-8">No students in this category</p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((student, i) => (
                <StudentCard key={student.id} student={student} onSelect={onSelectStudent} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Add student button */}
        {profiles.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAddStudent}
            className="w-full mt-4 py-4 rounded-2xl font-bubble text-white/50 text-base flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)' }}
          >
            <span className="text-lg">+</span> Add Student
          </motion.button>
        )}
      </div>
    </div>
  )
}
