function clampInteger(value, min, max) {
  const number = Math.round(Number(value) || 0)
  return Math.max(min, Math.min(max, number))
}

export function buildNumberWorldCompletion({
  firstTryCorrect = 0,
  supportedCorrect = 0,
  totalRounds = 10,
  struggles = [],
  operation = null,
  questionSignatures = [],
} = {}) {
  const total = Math.max(1, Math.round(Number(totalRounds) || 1))
  const independent = clampInteger(firstTryCorrect, 0, total)
  const supported = clampInteger(supportedCorrect, 0, total - independent)

  return {
    stars: independent,
    sessionData: {
      total,
      correct: independent,
      firstTryCorrect: independent,
      supportedCorrect: supported,
      completedCorrect: independent + supported,
      struggles: Array.isArray(struggles) ? struggles : [],
      op: operation,
      questionSignatures: Array.isArray(questionSignatures) ? questionSignatures : [],
    },
  }
}
