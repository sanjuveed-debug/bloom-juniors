import test from 'node:test'
import assert from 'node:assert/strict'
import { selectSoundDistractors } from '../src/utils/soundDistractors.js'

test('overlapping banks never repeat or reject the target sound spelling', () => {
  const bank = { s:{words:['six','sun']}, x:{words:['six','box','max']}, a:{words:['sat','cat','mat']}, i:{words:['six','pig','pin']} }
  const options = selectSoundDistractors(bank,'s','six',Object.keys(bank),()=>0.3)
  assert.equal(options.length,3)
  assert.equal(new Set(options).size,3)
  assert.ok(options.every(word => !word.includes('s') && !word.includes('x')))
})
test('equivalent and split graphemes are conservatively excluded', () => {
  const bank = { 'a-e':{words:['cake'],similar:['ai']}, ai:{words:['rain']}, z:{words:['game','sail','dog','cup','hen']} }
  assert.deepEqual(new Set(selectSoundDistractors(bank,'a-e','cake',Object.keys(bank))),new Set(['dog','cup','hen']))
})
test('small pools return fewer fair options instead of duplicate answers', () => {
  assert.deepEqual(selectSoundDistractors({s:{words:['sun']},x:{words:['sun','box']}},'s','sun',['s','x']),[])
})
