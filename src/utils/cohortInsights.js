// Anonymised cohort analytics for the teacher dashboard and termly report.
// Phonics phases mirror SoundPop's RWI set unlock thresholds (sessionsPlayed),
// and curriculum areas map modules onto the EYFS framework so reports speak
// the language nurseries (and KHDA inspectors) expect.

export const PHONICS_PHASES = [
  {
    phase: 1,
    label: 'Set 1 letter sounds',
    short: 'Letter sounds',
    dm: 'Says a sound for each letter of the alphabet (single-letter GPCs)',
  },
  {
    phase: 2,
    label: 'Set 1 special friends',
    short: 'Digraphs',
    dm: 'Reads digraphs — two letters making one sound (sh, ch, th, ng…)',
  },
  {
    phase: 3,
    label: 'Set 2 vowel sounds',
    short: 'Set 2 vowels',
    dm: 'Blends sounds into words, including long vowel sounds (ay, ee, igh…)',
  },
  {
    phase: 4,
    label: 'Set 3 vowel sounds',
    short: 'Set 3 vowels',
    dm: 'Reads words with alternative vowel spellings (ea, oi, aw, ur…)',
  },
]

export function getPhonicsPhase(progress) {
  const played = progress?.phonics?.sessionsPlayed || 0
  if (played >= 8) return PHONICS_PHASES[3]
  if (played >= 5) return PHONICS_PHASES[2]
  if (played >= 3) return PHONICS_PHASES[1]
  return PHONICS_PHASES[0]
}

export const EYFS_AREAS = [
  { id: 'cl',    emoji: '🗣️', label: 'Communication & Language' },
  { id: 'lit',   emoji: '📖', label: 'Literacy' },
  { id: 'maths', emoji: '🔢', label: 'Mathematics' },
  { id: 'utw',   emoji: '🌍', label: 'Understanding the World' },
  { id: 'ead',   emoji: '🎨', label: 'Expressive Arts & Design' },
  { id: 'pd',    emoji: '🏃', label: 'Physical Development' },
]

const MODULE_AREA = {
  // Literacy
  phonics: 'lit', tricky: 'lit', story: 'lit', alphabet: 'lit',
  reading: 'lit', spelling: 'lit', grammar: 'lit',
  // Mathematics
  math: 'maths', shapes: 'maths', logic: 'maths', numbers: 'maths',
  piggybank: 'maths', shop: 'maths', timestables: 'maths',
  fractions: 'maths', wordproblems: 'maths',
  // Understanding the World
  science: 'utw', worldgk: 'utw', planets: 'utw', anatomy: 'utw',
  sacred: 'utw', worldmap: 'utw', spirituality: 'utw',
  // Communication & Language (toddler vocabulary)
  animals: 'cl', colours: 'cl', fruits: 'cl', bodyparts: 'cl',
  // Expressive Arts & Design
  davinci: 'ead',
  // Physical Development
  exercise: 'pd',
}

function startOfWeek(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = (date.getDay() + 6) % 7 // Monday = 0
  date.setDate(date.getDate() - day)
  return date
}

export function getTermLabel(d = new Date()) {
  const m = d.getMonth()
  const term = m >= 8 ? 'Autumn Term' : m <= 2 ? 'Spring Term' : 'Summer Term'
  return `${term} ${d.getFullYear()}`
}

// entries: [{ ageGroup, progress }] — one per pupil, names never needed here
export function buildCohortInsights(entries) {
  const pupils = entries.length
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000

  // ── Phonics phase distribution ──
  const phaseDistribution = PHONICS_PHASES.map(p => ({ ...p, count: 0 }))
  let phonicsStarted = 0
  entries.forEach(({ progress }) => {
    if ((progress?.phonics?.sessionsPlayed || 0) > 0 || (progress?.phonics?.played || 0) > 0) phonicsStarted++
    const phase = getPhonicsPhase(progress)
    phaseDistribution[phase.phase - 1].count++
  })

  // ── Last 4 calendar weeks (Mon–Sun), oldest first ──
  const thisWeekStart = startOfWeek(new Date())
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const start = new Date(thisWeekStart)
    start.setDate(start.getDate() - (3 - i) * 7)
    const end = start.getTime() + 7 * DAY
    return {
      start: start.getTime(),
      end,
      label: `w/c ${start.getDate()} ${start.toLocaleDateString('en-GB', { month: 'short' })}`,
      isCurrent: i === 3,
      sessions: 0,
      activePupils: 0,
      correct: 0,
      total: 0,
      accuracy: null,
    }
  })
  entries.forEach(({ progress }) => {
    const sessions = progress?.sessions || []
    weeks.forEach(week => {
      const inWeek = sessions.filter(s => s.date >= week.start && s.date < week.end)
      if (inWeek.length > 0) week.activePupils++
      week.sessions += inWeek.length
      inWeek.forEach(s => {
        week.correct += Number(s.correct) || 0
        week.total += Number(s.total) || 0
      })
    })
  })
  weeks.forEach(week => {
    week.accuracy = week.total > 0 ? Math.round((week.correct / week.total) * 100) : null
  })

  // ── EYFS area engagement (last 28 days) ──
  const cutoff = now - 28 * DAY
  const areas = EYFS_AREAS.map(a => ({ ...a, pupilsEngaged: 0, sessions: 0, correct: 0, total: 0, accuracy: null }))
  const areaById = Object.fromEntries(areas.map(a => [a.id, a]))
  entries.forEach(({ progress }) => {
    const recent = (progress?.sessions || []).filter(s => s.date >= cutoff)
    const touched = new Set()
    recent.forEach(s => {
      const area = areaById[MODULE_AREA[s.module]]
      if (!area) return
      area.sessions++
      area.correct += Number(s.correct) || 0
      area.total += Number(s.total) || 0
      touched.add(area.id)
    })
    touched.forEach(id => { areaById[id].pupilsEngaged++ })
  })
  areas.forEach(a => {
    a.accuracy = a.total > 0 ? Math.round((a.correct / a.total) * 100) : null
  })

  // ── Headline totals ──
  const last7 = weeks[3]
  const prev7 = weeks[2]
  const totalStars = entries.reduce((sum, { progress }) => sum + (progress?.totalStars || 0), 0)
  const allRecent = entries.flatMap(({ progress }) => (progress?.sessions || []).filter(s => s.date >= cutoff))
  const accTotals = allRecent.reduce((acc, s) => {
    acc.correct += Number(s.correct) || 0
    acc.total += Number(s.total) || 0
    return acc
  }, { correct: 0, total: 0 })

  return {
    pupils,
    phonicsStarted,
    phaseDistribution,
    weeks,
    areas: areas.filter(a => a.sessions > 0 || ['lit', 'maths'].includes(a.id)),
    totalStars,
    sessions28: allRecent.length,
    accuracy28: accTotals.total > 0 ? Math.round((accTotals.correct / accTotals.total) * 100) : null,
    weekDelta: {
      sessions: last7.sessions - prev7.sessions,
      activePupils: last7.activePupils - prev7.activePupils,
    },
  }
}
