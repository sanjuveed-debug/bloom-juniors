const RETURN_TARGETS = {
  toddler: new Set(['colours', 'shapes', 'numbers', 'animals', 'fruits', 'bodyparts', 'alphabet', 'quizshow', 'wonderwhy']),
  early: new Set(['phonics', 'math', 'tricky', 'story', 'shapes', 'logic', 'wonderwhy']),
  junior: new Set(['timestables', 'fractions', 'reading', 'spelling', 'wordproblems', 'grammar', 'science', 'worldmap', 'spirituality', 'piggybank', 'exercise', 'wonderwhy']),
}

export function getReturnDeepLinkTarget(ageGroup, search = globalThis.location?.search || '') {
  const age = RETURN_TARGETS[ageGroup] ? ageGroup : 'early'
  const target = String(new URLSearchParams(search).get('target') || '')
  return RETURN_TARGETS[age].has(target) ? target : ''
}

export function consumeReturnDeepLinkTarget(ageGroup) {
  const target = getReturnDeepLinkTarget(ageGroup)
  if (!target) return ''
  try {
    const url = new URL(globalThis.location.href)
    url.searchParams.delete('target')
    globalThis.history?.replaceState?.(globalThis.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  } catch {}
  return target
}

export function isValidReturnTarget(ageGroup, target) {
  const age = RETURN_TARGETS[ageGroup] ? ageGroup : 'early'
  return RETURN_TARGETS[age].has(String(target || ''))
}
