export const BUMI_ATLAS = '/bumi/reactions-v1.webp'
const wave = [0, 2, 3, 2, 3, 2, 0]
const sequences = { wave, think: [0, 4, 4, 4, 4, 0], point: [0, 4, 4, 4, 4, 0], read: [0, 4, 4, 4, 4, 0], celebrate: [0, 5, 5, 5, 5, 5, 0], clap: [0, 5, 5, 5, 5, 0], dance: [0, 5, 5, 5, 5, 5, 0] }
export function getBumiFrame(state, elapsed, reducedMotion = false, autoIdle = null) {
  const sequence = sequences[state]
  if (reducedMotion) return sequence ? sequence[1] : 0
  const time = Math.max(0, Number(elapsed) || 0)
  const duration = sequence ? Math.min(sequence.length * 190, autoIdle > 0 ? autoIdle : Infinity) : 0
  if (sequence && time < duration) return sequence[Math.floor(time / 190)]
  // A brief real closed-eye pose, with a long quiet interval between blinks.
  return (time - duration) % 5200 >= 5020 ? 1 : 0
}
