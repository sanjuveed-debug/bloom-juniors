// Advances to the next question only once the feedback speech finishes (or a
// safety timeout elapses), so the audio is never cut off mid-sentence.
export function speakThenAdvance(speak, text, speakOptions, advance, timersRef, opts = {}) {
  // Keep feedback audible without making the game feel frozen. Azure normally
  // completes well inside this window; the cap prevents a missing onEnd event
  // from swallowing a young child's next tap for several seconds.
  const { minMs = 650, maxMs = 2500 } = opts
  let settled = false
  let speechDone = false
  let minDone = false

  const track = (id) => {
    const bucket = timersRef.current
    if (Array.isArray(bucket)) bucket.push(id)
    else if (bucket?.add) bucket.add(id)
  }

  const tryAdvance = () => {
    if (settled || !speechDone || !minDone) return
    settled = true
    advance()
  }

  speak(text, { ...speakOptions, onEnd: () => { speechDone = true; tryAdvance() } })

  const minId = window.setTimeout(() => { minDone = true; tryAdvance() }, minMs)
  const maxId = window.setTimeout(() => {
    if (settled) return
    settled = true
    advance()
  }, maxMs)
  track(minId)
  track(maxId)
}
