const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0))
const smooth = n => { const x = clamp(n, 0, 1); return x * x * (3 - 2 * x) }
function envelope(t, duration) { return smooth(t / 260) * (1 - smooth((t - duration + 350) / 350)) }
export function getBumiGaze(x, y, rect) {
  const dx = x - (rect.left + rect.width / 2)
  const dy = y - (rect.top + rect.height * .55)
  if (Math.hypot(dx, dy) > Math.max(400, rect.width * 1.6)) return { x: 0, y: 0 }
  return { x: clamp(dx / Math.max(100, rect.width), -1, 1), y: clamp(dy / Math.max(100, rect.height), -1, 1) }
}
export function getBumiMotion(state, elapsed, { reduced = false, talking = false, autoIdle = null } = {}) {
  const t = Math.max(0, Number(elapsed) || 0)
  const duration = autoIdle > 0 ? Math.min(autoIdle, 2100) : 2100
  const e = reduced ? 1 : envelope(t, duration)
  const wave = state === 'wave' ? e : 0
  const think = ['think', 'point', 'read'].includes(state) ? e : 0
  const joy = ['clap', 'dance', 'celebrate'].includes(state) ? e : 0
  // Unevenly spaced blinks, smoothly closing and opening rather than frame swaps.
  const cycle = t % 13700
  const blink = reduced ? 1 : 1 - .96 * Math.max(...[3200, 7900, 8180, 12300].map(at => Math.max(0, 1 - Math.abs(cycle - at) / 115)))
  const breath = reduced ? 0 : Math.sin(t / 870) * .009 + Math.sin(t / 1730) * .003
  return {
    blink, scaleX: 1 - breath * .45, scaleY: 1 + breath,
    lean: (reduced ? 0 : Math.sin(t / 1200) * .7) - 4 * think - 2 * wave,
    lift: reduced ? 0 : -18 * joy * Math.max(0, Math.sin((t - 250) / 240)) + (state === 'nod' ? Math.sin(t / 150) * 5 * e : 0),
    leaf: (reduced ? 0 : Math.sin(t / 690) * 2.4 + Math.sin(t / 330) * .7) + wave * 3 - think * 6,
    leftArm: 128 * wave + (reduced ? 0 : Math.sin(t / 100) * 12 * wave + Math.sin(t / 980) * 2) + joy * 133,
    rightArm: 110 * think - 130 * joy + (reduced ? 0 : Math.sin(t / 1100 + 1) * 2),
    rightArmScale: 1 - .38 * think,
    faceX: think * 2, faceY: -think * 2, brow: -think * 5 - joy * 3,
    mouth: clamp(joy + wave * .18 + (!reduced && talking ? .35 + .3 * Math.sin(t / 85) : 0), 0, 1),
  }
}
