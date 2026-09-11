import { normalizeFloatDiscovery } from './floatDiscovery.js'
import { normalizeShadowDiscovery } from './shadowDiscovery.js'
import { normalizePicnicProgress } from './picnicProgress.js'
import { normalizeCollection } from './collectionAdventure.js'

// Choose from saved activity state, not app-level timestamps such as login.
// No new record is needed: the same choice can be made after cloud hydration.
export function resumeDiscovery(progress = {}) {
  const water = normalizeFloatDiscovery(progress.floatDiscovery)
  const shadow = normalizeShadowDiscovery(progress.shadowDiscovery)
  const picnic = normalizePicnicProgress(progress.picnic)
  const candidates = [
    { id: 'float-discovery', state: water, updatedAt: water.updatedAt, note: `Pick up at experiment ${water.round + 1} of 4.` },
    { id: 'shadow-discovery', state: shadow, updatedAt: shadow.updatedAt, note: `Pick up at experiment ${shadow.round + 1} of 3.` },
    { id: 'picnic', ...picnic, note: 'Your picnic is just where you left it.' },
    ...['basket', 'snacks'].map(id => ({ id, ...normalizeCollection(progress.collectionAdventures?.[id], id), note: 'Your collection is just where you left it.' })),
  ]
  const latest = candidates
    .filter(item => Number.isFinite(item.updatedAt) && item.updatedAt > 0 && item.state.phase !== 'complete')
    .sort((a, b) => b.updatedAt - a.updatedAt)[0]
  return latest ? { id: latest.id, note: latest.note } : null
}
