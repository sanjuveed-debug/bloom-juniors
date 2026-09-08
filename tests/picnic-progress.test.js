import test from 'node:test'
import assert from 'node:assert/strict'
import { applyPicnicAction, mergePicnicProgress, normalizePicnicProgress } from '../src/utils/picnicProgress.js'
import { mergeProgress, saveCloudProgress } from '../src/services/cloudStore.js'

function solve(progress = {}, helped = false) {
  let p = progress
  let at = 100
  const act = action => { p = applyPicnicAction(p, action, at++) }
  if (helped) act({ type: 'HELP' })
  for (const places of [[0, 1, 3, 4], [1, 3, 5]]) {
    for (const to of places) act({ type: 'PLACE', to })
    act({ type: 'SUBMIT' }); act({ type: 'NEXT' })
  }
  return p
}
test('profile progress resumes placements without importing anonymous data', () => {
  const p = applyPicnicAction({}, { type: 'PLACE', to: 0 }, 10)
  assert.equal(normalizePicnicProgress(JSON.parse(JSON.stringify(p.picnic))).state.placements[0], true)
  assert.equal(normalizePicnicProgress().state.placements[0], false)
})
test('completion atomically saves evidence and exactly one learning session', () => {
  const p = solve({ totalStars: 7 }, true)
  assert.equal(p.sessions.length, 1)
  assert.equal(p.sessions[0].firstTryCorrect, 1)
  assert.equal(p.sessions[0].supportedCorrect, 1)
  assert.equal(p.totalStars, 7)
  assert.equal(p.picnic.state.report.results[0].helped, true)
  assert.equal(applyPicnicAction(p, { type: 'NEXT' }).sessions.length, 1)
})
test('replay preserves first recap and does not duplicate progress', () => {
  const p = solve({}, true)
  const replay = solve(applyPicnicAction(p, { type: 'REPLAY' }, 150))
  assert.deepEqual(replay.picnic.state.report, p.picnic.state.report)
  assert.equal(replay.sessions.length, 1)
})
test('a newer unfinished device cannot erase completed evidence', () => {
  const completed = solve().picnic
  const stale = applyPicnicAction({}, { type: 'PLACE', to: 0 }, 999).picnic
  assert.deepEqual(mergePicnicProgress(completed, stale), completed)
  assert.deepEqual(mergePicnicProgress(stale, completed), completed)
})
test('incorrect feedback survives an action for the child to see', () => {
  let p = applyPicnicAction({}, { type: 'PLACE', to: 2 })
  p = applyPicnicAction(p, { type: 'SUBMIT' })
  assert.deepEqual(p.picnic.state.feedback.extra, [2])
  assert.equal(p.sessions.length, 0)
})
test('cloud merging deduplicates the first visit completed on two devices', () => {
  const a = solve({}, true)
  const b = solve()
  b.sessions[0].date += 500
  b.picnic.completedAt += 500
  b.picnic.updatedAt += 500
  const merged = mergeProgress(a, b)
  assert.equal(merged.sessions.filter(s => s.activityId === 'picnic-first').length, 1)
  assert.equal(merged.picnic.state.report.results[0].helped, true)
})
test('a missing auth session cannot silently report a successful cloud save', async () => {
  await assert.rejects(saveCloudProgress('picnic-test-no-auth', {}), /Sign in again/)
})
