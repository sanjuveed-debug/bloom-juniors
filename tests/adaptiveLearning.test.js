import test from 'node:test'
import assert from 'node:assert/strict'
import { recordAdaptiveSession, getSkillJourney, generateArithmeticQuestions } from '../src/utils/adaptiveLearning.js'

test('adaptive difficulty rises after two strong sessions',()=>{
  let progress={}
  progress=recordAdaptiveSession(progress,'math',{total:10,correct:9})
  progress=recordAdaptiveSession(progress,'math',{total:10,correct:10})
  const skill=getSkillJourney(progress,'math')
  assert.equal(skill.difficulty,2)
  assert.equal(skill.attempts,20)
  assert.equal(skill.correct,19)
})

test('generated arithmetic avoids recent question signatures',()=>{
  const first=generateArithmeticQuestions({moduleId:'math',count:8,seed:42})
  const progress={learningJourney:{skills:{math:{recentQuestions:first.map(q=>q.signature),difficulty:1}}}}
  const second=generateArithmeticQuestions({moduleId:'math',count:8,seed:42,progress})
  assert.equal(second.some(q=>first.some(old=>old.signature===q.signature)),false)
})
