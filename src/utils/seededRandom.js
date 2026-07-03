// Mulberry32 — fast 32-bit seeded PRNG
export function mulberry32(seed) {
  let s = seed >>> 0
  return function () {
    s += 0x6D2B79F5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// djb2-style hash of a string → unsigned 32-bit int
function hashStr(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  }
  return h
}

// Returns a numeric seed unique to today's date + an optional namespace string
export function dailySeedFor(namespace = '') {
  const d = new Date()
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return hashStr(dateStr + namespace)
}

// Fisher-Yates shuffle driven by a deterministic seed
export function seededShuffle(arr, seed) {
  const rng = mulberry32(seed)
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Toddler "growth" level based on how many times a module has been played —
// used to give parents a visible sign that practice is getting a little longer/tougher.
export function getToddlerLevel(played = 0) {
  if (played < 3) return 1
  if (played < 6) return 2
  return 3
}

// Session length grows with level (capped to the available pool size)
export function getToddlerSessionSize(level, poolSize) {
  const sizes = { 1: 4, 2: 6, 3: 8 }
  return Math.min(sizes[level] || 6, poolSize)
}
