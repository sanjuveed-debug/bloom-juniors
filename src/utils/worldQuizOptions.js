// Compare what the child can see, not the country object behind an answer.
export function uniqueAnswerOptions(correct, candidates, answerKey, limit = 4) {
  const options = [correct]
  const seen = new Set([correct[answerKey]])
  for (const candidate of candidates) {
    const label = candidate[answerKey]
    if (!label || seen.has(label)) continue
    seen.add(label)
    options.push(candidate)
    if (options.length >= limit) break
  }
  return options
}

export function isWorldAnswerCorrect(option, question) {
  return question.answerKey === 'history'
    ? option === question.correct.yearLabel
    : option?.[question.answerKey] === question.correct[question.answerKey]
}
