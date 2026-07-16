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
