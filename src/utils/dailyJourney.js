export function getDailyJourneyState({ steps = [], doneCount, required = 2, claimed = false } = {}) {
  const displaySteps = steps.filter(step => step?.module).slice(0, required)
  const completedFromSteps = displaySteps.filter(step => step.done).length
  const completed = Math.min(required, Math.max(0, Number.isFinite(doneCount) ? doneCount : completedFromSteps))
  const ready = completed >= required
  const nextStep = displaySteps.find(step => !step.done) || displaySteps[displaySteps.length - 1] || null
  return {
    steps: displaySteps,
    completed,
    ready,
    claimed: Boolean(claimed),
    nextStep,
    phase: claimed ? 'claimed' : ready ? 'ready' : 'playing',
  }
}

function localDateKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDailyJourneyWeek(progress = {}, now = Date.now()) {
  const end = new Date(now)
  end.setHours(12, 0, 0, 0)
  const playedDates = new Set(
    (progress.sessions || [])
      .map(session => Number(session?.date))
      .filter(Boolean)
      .map(timestamp => localDateKey(timestamp)),
  )
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (6 - index))
    const key = localDateKey(date)
    return {
      key,
      label: date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      played: playedDates.has(key),
      today: index === 6,
    }
  })

  return {
    days,
    activeDays: days.filter(day => day.played).length,
  }
}

export function getUnifiedDailyJourneyState({
  steps = [],
  doneCount,
  required = 2,
  claimed = false,
  weeklyStatus = 'waiting',
  wonderCompleted = false,
} = {}) {
  const learning = getDailyJourneyState({ steps, doneCount, required, claimed })
  const weeklyReady = ['active', 'available', 'choice'].includes(weeklyStatus)

  let primary = { type: 'explore', label: 'Choose another adventure' }
  if (learning.phase === 'ready') {
    primary = { type: 'treasure', label: 'Open today\'s treasure' }
  } else if (weeklyReady) {
    primary = {
      type: 'weekly',
      label: weeklyStatus === 'active' ? 'Continue today\'s chapter' : weeklyStatus === 'choice' ? 'Choose today\'s trail' : 'Start today\'s chapter',
    }
  } else if (learning.phase === 'playing') {
    primary = {
      type: 'learning',
      label: `Continue ${learning.nextStep?.module?.label || 'today\'s learning'}`,
      moduleId: learning.nextStep?.module?.id || '',
    }
  } else if (!wonderCompleted) {
    primary = { type: 'wonder', label: 'Explore today\'s Wonder' }
  }

  return {
    learning,
    primary,
    complete: learning.claimed && wonderCompleted && !weeklyReady,
  }
}
