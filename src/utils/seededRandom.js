// Mulberry32 — fast 32-bit seeded PRNG
function mulberry32(seed) {
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
