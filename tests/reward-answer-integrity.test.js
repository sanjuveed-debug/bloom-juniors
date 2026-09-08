import test from 'node:test'
import assert from 'node:assert/strict'
import { getExerciseCompletionReward } from '../src/utils/moduleScoring.js'
import { uniqueAnswerOptions, isWorldAnswerCorrect } from '../src/utils/worldQuizOptions.js'
import { readFileSync } from 'node:fs'
import { parse } from '@babel/parser'
import vm from 'node:vm'

test('completing only the final exercise cannot award eight completions', () => {
  for (const completedExercises of [[], [7], [0, 2, 4, 7], [7,7,7,7,7,7,7,7], [0,1,2,3,4,5,6,99]]) {
    assert.equal(getExerciseCompletionReward({ sessionMode: 'full', exerciseIndex: 7, totalExercises: 8, completedExercises }), null)
  }
})
test('full-workout bonus requires all eight distinct exercises', () => {
  const reward = getExerciseCompletionReward({ sessionMode: 'full', exerciseIndex: 7, totalExercises: 8, completedExercises: [0,1,2,3,4,5,6,7,7] })
  assert.equal(reward.stars, 5)
  assert.equal(reward.sessionData.correct, 8)
})
test('shared currencies produce one visible option and equivalent values are accepted', () => {
  const france = { name: 'France', currency: 'Euro' }, germany = { name: 'Germany', currency: 'Euro' }
  const options = uniqueAnswerOptions(france, [germany, { currency: 'US Dollar' }, { currency: 'US Dollar' }, { currency: 'Pound Sterling' }, { currency: 'Dirham' }], 'currency')
  assert.deepEqual(options.map(item => item.currency), ['Euro', 'US Dollar', 'Pound Sterling', 'Dirham'])
  assert.equal(isWorldAnswerCorrect(germany, { correct: france, answerKey: 'currency' }), true)
  assert.equal(isWorldAnswerCorrect(germany, { correct: france, answerKey: 'name' }), false)
})
test('answer comparison retains capital and history semantics', () => {
  assert.equal(isWorldAnswerCorrect({capital:'Paris'}, {correct:{capital:'Paris'},answerKey:'capital'}), true)
  assert.equal(isWorldAnswerCorrect('1969', {correct:{yearLabel:'1969'},answerKey:'history'}), true)
  assert.equal(isWorldAnswerCorrect('1970', {correct:{yearLabel:'1969'},answerKey:'history'}), false)
})

test('the actual country question generator offers four distinct answer labels across regions', () => {
  const source = readFileSync(new URL('../src/modules/WorldGK.jsx', import.meta.url), 'utf8')
  const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] })
  const declarations = ast.program.body.filter(node =>
    node.type === 'FunctionDeclaration' && ['shuffle','getQuestionPool','makeQuestion'].includes(node.id.name)
    || node.type === 'VariableDeclaration' && node.declarations.some(item => item.id.name === 'COUNTRIES'))
  const { COUNTRIES, makeQuestion } = vm.runInNewContext(`${declarations.map(node=>source.slice(node.start,node.end)).join('\n')};({COUNTRIES,makeQuestion})`, { uniqueAnswerOptions, Date, Math })
  for (const mode of ['Currencies','Capitals','Flags']) {
    for (const region of new Set(COUNTRIES.map(item=>item.region))) {
      for (let run = 0; run < 20; run++) {
        const question = makeQuestion(COUNTRIES.filter(item=>item.region===region), mode)
        assert.equal(question.options.length, 4)
        assert.equal(new Set(question.options.map(item=>item[question.answerKey])).size, 4)
        assert.equal(question.options.filter(item=>isWorldAnswerCorrect(item,question)).length, 1)
      }
    }
  }
})
