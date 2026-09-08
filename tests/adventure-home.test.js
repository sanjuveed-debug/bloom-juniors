import test from 'node:test'
import assert from 'node:assert/strict'
import { ADVENTURE_HOME_COPY, getAdventureHomeNext } from '../src/utils/adventureHome.js'

for (const age of ['toddler', 'early', 'junior']) {
  test(`Adventure Home has age-specific copy for ${age}`, () => {
    assert.ok(ADVENTURE_HOME_COPY[age].heading)
  })
}

test('Adventure Home resumes an unfinished adventure before choosing something new', () => {
  const next = getAdventureHomeNext({ ageGroup: 'early', progress: { adventureDirector: { launched: { moduleId: 'math' } } }, dailyNext: { id: 'story', label: 'Story Room' } })
  assert.equal(next.source, 'unfinished')
  assert.equal(next.moduleId, 'math')
})

test('Adventure Home surfaces a treasure immediately when the daily path is complete', () => {
  const next = getAdventureHomeNext({ ageGroup: 'toddler', dailyDone: 2, dailyRequired: 2, dailyClaimed: false })
  assert.equal(next.action, 'claim')
})

test('Adventure Home uses the daily activity when there is no unfinished quest', () => {
  const next = getAdventureHomeNext({ ageGroup: 'junior', dailyNext: { id: 'reading', label: 'Book Kingdom', emoji: '📚' } })
  assert.equal(next.source, 'daily')
  assert.equal(next.moduleId, 'reading')
})

test('Adventure Home always supplies an endless activity if no daily activity exists', () => {
  const next = getAdventureHomeNext({ ageGroup: 'early', progress: {} })
  assert.equal(next.source, 'endless')
  assert.ok(next.moduleId)
})
