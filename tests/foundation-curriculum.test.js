import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CULTURE_AND_FAITH_GUARDRAILS,
  FOUNDATION_AGE_BANDS,
  FOUNDATION_ARCS,
  FOUNDATION_BIG_IDEAS,
  FOUNDATION_FORMATS,
  FOUNDATION_STRANDS,
  MODULE_FOUNDATION_TAGS,
  getFoundationCoverage,
  getFoundationOutcomes,
} from '../src/data/foundationCurriculum.js'

test('every foundation arc has outcomes for all three age bands', () => {
  for (const arc of FOUNDATION_ARCS) {
    for (const age of Object.keys(FOUNDATION_AGE_BANDS)) {
      assert.ok(Array.isArray(arc[age]) && arc[age].length >= 1, `${arc.id} needs ${age} outcomes`)
    }
  }
})

test('all arc strand and big-idea references are valid', () => {
  const strands = new Set(FOUNDATION_STRANDS.map(strand => strand.id))
  const bigIdeas = new Set(FOUNDATION_BIG_IDEAS)

  for (const arc of FOUNDATION_ARCS) {
    arc.strands.forEach(strand => assert.ok(strands.has(strand), `${arc.id}: unknown strand ${strand}`))
    arc.bigIdeas.forEach(idea => assert.ok(bigIdeas.has(idea), `${arc.id}: unknown big idea ${idea}`))
  }
})

test('every strand is developed through multiple connected arcs', () => {
  for (const strand of getFoundationCoverage()) {
    assert.ok(strand.arcs.length >= 3, `${strand.id} needs at least three arcs`)
  }
})

test('age outcome lookup falls back safely and culture guardrails are explicit', () => {
  assert.ok(getFoundationOutcomes('living-things', 'early').length > 0)
  assert.deepEqual(
    getFoundationOutcomes('living-things', 'unknown'),
    getFoundationOutcomes('living-things', 'early'),
  )
  assert.ok(CULTURE_AND_FAITH_GUARDRAILS.length >= 6)
})

test('every current playable module has valid foundation tags', () => {
  const currentModules = [
    'colours', 'shapes', 'numbers', 'animals', 'fruits', 'bodyparts', 'alphabet', 'quizshow',
    'phonics', 'math', 'tricky', 'story', 'worldgk', 'science', 'planets', 'anatomy', 'shop',
    'logic', 'arcade', 'davinci', 'exercise', 'sacred', 'piggybank', 'wonderwhy',
    'timestables', 'fractions', 'wordproblems', 'reading', 'spelling', 'grammar',
    'worldmap', 'spirituality', 'games',
  ]
  const strandIds = new Set(FOUNDATION_STRANDS.map(strand => strand.id))
  const arcIds = new Set(FOUNDATION_ARCS.map(arc => arc.id))

  for (const moduleId of currentModules) {
    const tags = MODULE_FOUNDATION_TAGS[moduleId]
    assert.ok(tags, `${moduleId} needs foundation tags`)
    assert.ok(tags.strands.length > 0 && tags.strands.every(id => strandIds.has(id)))
    assert.ok(tags.arcs.length > 0 && tags.arcs.every(id => arcIds.has(id)))
    assert.ok(tags.bigIdeas.length > 0 && tags.bigIdeas.every(id => FOUNDATION_BIG_IDEAS.includes(id)))
    assert.ok(tags.formats.length > 0 && tags.formats.every(id => FOUNDATION_FORMATS.includes(id)))
  }
})
