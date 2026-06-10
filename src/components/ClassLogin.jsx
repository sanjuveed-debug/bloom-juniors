import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CLASS_SESSION_KEY } from '../services/cloudStore.js'
import { PROFILE_COLORS } from '../hooks/useProfiles.js'

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
}

function displayCode(value) {
  const clean = normalizeCode(value)
  if (clean.length <= 4) return clean
  return `${clean.slice(0, 4)}-${clean.slice(4, 7)}`
}

export default function ClassLogin({ onStart }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [classInfo, setClassInfo] = useState(null)

  const shownCode = useMemo(() => displayCode(code), [code])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const codeParam = params.get('code')
    if (codeParam) setCode(normalizeCode(codeParam))
  }, [])

  const lookup = async () => {
    const clean = displayCode(code)
    if (clean.length < 5) {
      setError('Ask your teacher for the class code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`/api/class-roster?code=${encodeURIComponent(clean)}`)
      const result = await resp.json().catch(() => ({}))
      if (!resp.ok || !result.ok || !result.classId) throw new Error(result.error || 'Class not found')
      setClassInfo(result)
    } catch (err) {
      setClassInfo(null)
      setError(err.message || 'Class not found')
    } finally {
      setLoading(false)
    }
  }

  const selectPupil = (pupil) => {
    const session = {
      classCode: classInfo.classCode,
      classId: classInfo.classId,
      className: classInfo.className,
      schoolId: classInfo.schoolId,
      schoolName: classInfo.schoolName,
      sessionToken: pupil.sessionToken,
      profile: {
        id: pupil.id,
        name: pupil.name,
        emoji: pupil.emoji,
        ageGroup: pupil.ageGroup || 'early',
        colorIdx: pupil.colorIdx || 0,
        createdAt: pupil.createdAt || Date.now(),
        schoolId: classInfo.schoolId,
        classId: classInfo.classId,
      },
    }
    try { localStorage.setItem(CLASS_SESSION_KEY, JSON.stringify(session)) } catch {}
    onStart(session)
  }

  return (
    <div className="min-h-screen overflow-y-auto px-4 py-8 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #13052c 0%, #24115e 52%, #071b39 100%)' }}>
      <div className="w-full max-w-3xl">
        <div className="text-center mb-7">
          <motion.img
            src="/yaagvi-mascot.webp"
            alt="Bloom Juniors guide"
            className="mx-auto h-28 w-auto object-contain drop-shadow-2xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
          <h1 className="font-bubble text-4xl text-white mt-3">Find your class</h1>
          <p className="font-round text-white/55 text-sm mt-2">Type the code your teacher gives you.</p>
        </div>

        {!classInfo && (
          <div className="mx-auto max-w-md rounded-[32px] bg-white p-5 shadow-2xl">
            <label htmlFor="class-code" className="font-round text-xs font-bold uppercase tracking-wider text-slate-500">
              Class code
            </label>
            <input
              id="class-code"
              value={shownCode}
              onChange={event => setCode(normalizeCode(event.target.value))}
              onKeyDown={event => { if (event.key === 'Enter') lookup() }}
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              className="mt-2 w-full rounded-3xl border-2 border-indigo-100 bg-indigo-50 px-5 py-5 text-center font-bubble text-4xl uppercase tracking-[0.12em] text-indigo-700 outline-none focus:border-indigo-400"
              placeholder="ABCD-123"
            />
            {error && <p className="font-round mt-3 text-center text-sm font-bold text-red-500">{error}</p>}
            <button
              type="button"
              onClick={lookup}
              disabled={loading}
              className="mt-5 w-full rounded-3xl px-5 py-4 font-bubble text-xl text-white shadow-xl disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              {loading ? 'Checking...' : 'Show my class'}
            </button>
          </div>
        )}

        {classInfo && (
          <div>
            <div className="mb-4 flex flex-col items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-center sm:flex-row sm:text-left">
              <div>
                <p className="font-round text-xs font-bold uppercase tracking-wider text-indigo-200/70">{classInfo.schoolName}</p>
                <h2 className="font-bubble text-2xl text-white">{classInfo.className}</h2>
              </div>
              <button
                type="button"
                onClick={() => { setClassInfo(null); setError('') }}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 font-round text-sm font-bold text-white/70"
              >
                Change code
              </button>
            </div>

            {classInfo.pupils?.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {classInfo.pupils.map((pupil, index) => {
                  const color = PROFILE_COLORS[pupil.colorIdx] || PROFILE_COLORS[index % PROFILE_COLORS.length]
                  return (
                    <motion.button
                      key={pupil.id}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => selectPupil(pupil)}
                      className="min-h-[150px] rounded-[32px] p-4 text-left shadow-2xl"
                      style={{
                        background: color.bg,
                        border: '3px solid rgba(255,255,255,0.28)',
                      }}
                    >
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 text-4xl shadow-inner">
                        {pupil.emoji || '*'}
                      </div>
                      <p className="font-bubble text-2xl leading-tight text-white drop-shadow">{pupil.name}</p>
                      <p className="font-round mt-1 text-sm font-bold text-white/75">Tap your card</p>
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-7 text-center">
                <p className="font-bubble text-2xl text-slate-800">No pupils yet</p>
                <p className="font-round mt-2 text-sm text-slate-500">Ask your teacher to add pupils to this class.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
