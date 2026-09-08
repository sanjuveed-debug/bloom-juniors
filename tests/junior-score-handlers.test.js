import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { parse } from '@babel/parser'

// Execute the actual component handlers, with render snapshots and queued timers.
// This tests score/progression contracts, not DOM, speech or React scheduling.
const modules = ['Fractions', 'Grammar', 'WorldMap', 'WordProblems', 'Reading', 'Science', 'Spirituality', 'Spelling']
function handlers(name) {
  const source = readFileSync(new URL(`../src/ks2/modules/${name}Module.jsx`, import.meta.url), 'utf8')
  const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] })
  const found = {}
  function visit(node) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'VariableDeclarator' && ['handle', 'handleSubmit', 'advance'].includes(node.id?.name)) {
      found[node.id.name] = source.slice(node.init.start, node.init.end)
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') visit(value)
    }
  }
  visit(ast)
  return found
}

for (const name of modules) {
  for (const misses of [[], [0, 2], [0, 1, 2, 3, 4, 5]]) {
    test(`${name}: six-question score with ${misses.length} supported answers`, () => {
      const functions = handlers(name)
      const state = { score: 0, q: 0, feedback: null, input: '' }
      const questions = Array.from({ length: 6 }, () => ({ ans: 'yes', type: 'yes', capital: 'yes', word: 'yes', fact: 'example' }))
      const timers = [], results = []
      const noop = () => {}
      const context = vm.createContext({
        questions, problems: questions, words: questions, passage: { questions }, FAITHS: { demo: { questions } }, faith: 'demo',
        lockedRef: { current: false }, completedRef: { current: false }, missedRef: { current: false }, timersRef: { current: [] },
        confetti: noop, reactYaagvi: noop, setPhase: noop, setHint: noop, setShowHint: noop, setShowWorking: noop,
        setScore: value => { state.score = value }, setQ: value => { state.q = value },
        setFeedback: value => { state.feedback = value }, setInput: value => { state.input = value },
        setResult: value => results.push(value), onDone: (score, total) => results.push({ score, total }),
        window: { setTimeout: callback => { timers.push(callback); return timers.length } },
      })
      const invoke = (key, answer) => {
        context.snapshot = { ...state, input: answer || state.input, current: questions[state.q], curr: questions[state.q] }
        return vm.runInContext(`(({score,q,feedback,input,current,curr}) => (${functions[key]}))(snapshot)`, context)(answer)
      }
      const settle = () => {
        while (timers.length) timers.shift()()
        if (functions.advance) invoke('advance')
      }
      const answerKey = name === 'Spelling' ? 'handleSubmit' : 'handle'
      for (let q = 0; q < questions.length; q++) {
        if (misses.includes(q)) {
          invoke(answerKey, 'no')
          settle()
          assert.equal(state.q, q, 'a mistake must not skip the question')
        }
        invoke(answerKey, 'yes')
        invoke(answerKey, 'yes') // Same-frame repeated tap must not double count.
        settle()
      }
      assert.equal(results.length, 1, 'one completion per run')
      assert.equal(results[0].score, 6 - misses.length)
      assert.equal(results[0].total, 6)
      assert.equal(state.score, 6 - misses.length, 'visible score retains all independent answers')
    })
  }
}
