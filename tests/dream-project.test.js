import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DREAM_PROJECTS,
  buildDreamProjectStage,
  getDreamProjectState,
  mergeDreamProject,
  normalizeDreamProject,
} from '../src/utils/dreamProject.js'

test('each age band receives its own six-stage dream project', () => {
  const expected = {
    toddler: 'rainbow-treehouse',
    early: 'magic-skyship',
    junior: 'explorer-headquarters',
  }
  for (const [age, projectId] of Object.entries(expected)) {
    const result = getDreamProjectState({}, age)
    assert.equal(result.project.id, projectId)
    assert.equal(result.project.stages.length, 6)
    assert.equal(DREAM_PROJECTS[age].materials.length, 4)
  }
})

test('every child begins with one build bundle and can make the first piece', () => {
  const state = getDreamProjectState({}, 'toddler')
  assert.equal(state.availableBundles, 1)
  assert.equal(state.canBuild, true)
  const result = buildDreamProjectStage({}, 'toddler', '', 100)
  assert.equal(result.dreamProject.stage, 1)
  assert.equal(result.dreamProject.spentBundles, 1)
  assert.equal(result.dreamProject.history[0].name, 'Strong magic tree')
})

test('a child choice is saved as part of the permanent build', () => {
  const first = buildDreamProjectStage({ totalStars: 24 }, 'early', '', 100)
  const second = buildDreamProjectStage(first, 'early', 'star', 200)
  assert.equal(second.dreamProject.stage, 2)
  assert.equal(second.dreamProject.choices[2], 'star')
  assert.equal(second.dreamProject.history[1].choiceId, 'star')
})

test('learning earns material bundles and stage recipes become more ambitious', () => {
  const noLearning = buildDreamProjectStage({}, 'junior', '', 100)
  assert.equal(getDreamProjectState(noLearning, 'junior').canBuild, false)
  const learning = getDreamProjectState({ ...noLearning, totalStars: 24 }, 'junior')
  assert.equal(learning.availableBundles, 2)
  assert.equal(learning.canBuild, true)
  const stageTwo = buildDreamProjectStage({ ...noLearning, totalStars: 24 }, 'junior', 'maps', 200)
  assert.equal(getDreamProjectState(stageTwo, 'junior').nextCost, 2)
})

test('all six permanent stages can be completed without a daily time gate', () => {
  let progress = { totalStars: 500 }
  for (let index = 0; index < 6; index += 1) {
    progress = buildDreamProjectStage(progress, 'early', index === 1 ? 'round' : index === 3 ? 'garden' : '', index + 1)
  }
  const final = getDreamProjectState(progress, 'early')
  assert.equal(final.completed, true)
  assert.equal(final.progressPercent, 100)
  assert.equal(progress.dreamProject.history.length, 6)
})

test('cloud merge keeps the furthest build, choices and unique history', () => {
  const merged = mergeDreamProject(
    { projectId: 'magic-skyship', stage: 3, choices: { 2: 'star' }, spentBundles: 4, history: [{ id: 'one', builtAt: 1 }], updatedAt: 3 },
    { projectId: 'magic-skyship', stage: 2, choices: { 4: 'garden' }, spentBundles: 2, history: [{ id: 'two', builtAt: 2 }], updatedAt: 2 },
  )
  assert.equal(merged.stage, 3)
  assert.deepEqual(merged.choices, { 2: 'star', 4: 'garden' })
  assert.deepEqual(merged.history.map(item => item.id), ['one', 'two'])
  assert.equal(normalizeDreamProject(null).stage, 0)
})
