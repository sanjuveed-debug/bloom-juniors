import test from 'node:test'
import assert from 'node:assert/strict'
import { resumeDiscovery } from '../src/utils/resumeDiscovery.js'
import { applyFloatDiscovery } from '../src/utils/floatDiscovery.js'
import { applyShadowDiscovery } from '../src/utils/shadowDiscovery.js'
import { applyPicnicAction } from '../src/utils/picnicProgress.js'
import { mergeProgress } from '../src/services/cloudStore.js'

test('a first visit has no unfinished discovery', () => {
  assert.equal(resumeDiscovery(), null)
})
test('an unfinished experiment outranks an older picnic and survives a fresh-device merge', () => {
  let progress = applyPicnicAction({}, { type: 'PLACE', to: 0 }, 100)
  progress = applyFloatDiscovery(progress, { type: 'PREDICT', floats: true }, 200)
  assert.equal(resumeDiscovery(progress).id, 'float-discovery')
  assert.equal(resumeDiscovery(mergeProgress({}, progress)).id, 'float-discovery')
  progress = applyShadowDiscovery(progress, { type: 'PREDICT', prediction: 'Bigger' }, 300)
  assert.deepEqual(resumeDiscovery(progress), { id: 'shadow-discovery', note: 'Pick up at experiment 1 of 3.' })
  progress = applyPicnicAction(progress, { type: 'PLACE', to: 1 }, 400)
  assert.equal(resumeDiscovery(progress).id, 'picnic')
})
test('completed experiments leave the resume card; replay becomes resumable', () => {
  let progress = {}
  for (let round = 0; round < 4; round++) {
    progress = applyFloatDiscovery(progress, { type: 'PREDICT', floats: true }, 100 + round * 3)
    progress = applyFloatDiscovery(progress, { type: 'DROP' }, 101 + round * 3)
    progress = applyFloatDiscovery(progress, { type: 'NEXT' }, 102 + round * 3)
  }
  assert.equal(resumeDiscovery(progress), null)
  progress = applyFloatDiscovery(progress, { type: 'REPLAY' }, 200)
  assert.equal(resumeDiscovery(progress).id, 'float-discovery')
  assert.equal(progress.sessions.length, 1)
})
test('resume text follows the saved round, and malformed science state cannot become a suggestion', () => {
  let progress = applyFloatDiscovery({}, { type: 'PREDICT', floats: true }, 100)
  progress = applyFloatDiscovery(progress, { type: 'DROP' }, 101)
  progress = applyFloatDiscovery(progress, { type: 'NEXT' }, 102)
  assert.equal(resumeDiscovery(progress).note, 'Pick up at experiment 2 of 4.')
  assert.equal(resumeDiscovery({ floatDiscovery: { round: 9, updatedAt: 999 }, shadowDiscovery: { updatedAt: Infinity } }), null)
})
