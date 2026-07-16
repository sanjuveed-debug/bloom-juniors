export function buildNumberLineWindow(current, answer, windowSize = 10) {
  const safeCurrent = Math.max(0, Math.round(Number(current) || 0))
  const safeAnswer = Math.max(0, Math.round(Number(answer) || 0))
  const size = Math.max(5, Math.round(Number(windowSize) || 10))
  const largest = Math.max(safeCurrent, safeAnswer)
  const smallest = Math.min(safeCurrent, safeAnswer)

  if (largest < size) return Array.from({ length: size }, (_, index) => index)

  let start = Math.max(0, smallest - Math.floor((size - 2) / 2))
  if (largest > start + size - 1) start = largest - size + 2
  return Array.from({ length: size }, (_, index) => start + index)
}
