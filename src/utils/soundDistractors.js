// Sound banks overlap: a word must never be both an answer and a distractor.
// Conservatively exclude spellings of the target/equivalent graphemes too.
export function selectSoundDistractors(bank, targetKey, targetWord, activeKeys, rng = Math.random) {
  const targetKeys = [targetKey, ...(bank[targetKey]?.similar || [])]
  const excluded = new Set([targetWord, ...targetKeys.flatMap(key => bank[key]?.words || [])])
  const spellings = [...targetKeys]
  if (targetKeys.includes('s')) spellings.push('x', 'ce', 'ci', 'cy')
  if (targetKeys.includes('k') || targetKeys.includes('c')) spellings.push('x', 'q')
  if (targetKeys.includes('f')) spellings.push('ph')
  const patterns = spellings.map(key => {
    const grapheme = key.split('_')[0]
    return grapheme.includes('-') ? new RegExp(grapheme.split('-').join('.+')) : grapheme
  })
  const pool = [...new Set((activeKeys || Object.keys(bank))
    .filter(key => !targetKeys.includes(key))
    .flatMap(key => bank[key]?.words || []))]
    .filter(word => !excluded.has(word) && !patterns.some(pattern => typeof pattern === 'string' ? word.includes(pattern) : pattern.test(word)))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3)
}
