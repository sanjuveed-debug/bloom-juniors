import test from 'node:test'
import assert from 'node:assert/strict'
import { COLLECTION_ADVENTURES, applyCollectionAction, normalizeCollection, mergeCollections, nextAdventure } from '../src/utils/collectionAdventure.js'
import { mergeProgress } from '../src/services/cloudStore.js'
const act = (p, id, type, index) => applyCollectionAction(p, id, {type,index}, (p.collectionAdventures?.[id]?.updatedAt || 0) + 1)
function solve(p, id, helped = false) {
  if (helped) p = act(p, id, 'HELP')
  for (const round of COLLECTION_ADVENTURES[id].rounds) {
    round.targets.forEach((count, i) => { for (let j=0;j<count;j++) p=act(p,id,'ADD',i) })
    p=act(p,id,'SUBMIT'); p=act(p,id,'NEXT')
  }
  return p
}
for (const id of ['basket','snacks']) {
  test(`${id}: two rounds produce one truthful report and replay is idempotent`, () => {
    const p=solve({},id,true)
    assert.equal(p.collectionAdventures[id].state.report.firstTryCorrect,1)
    assert.equal(p.sessions.length,1)
    const again=solve(act(p,id,'REPLAY'),id)
    assert.deepEqual(again.collectionAdventures[id].state.report,p.collectionAdventures[id].state.report)
    assert.equal(again.sessions.length,1)
  })
  test(`${id}: empty checks and unchanged retries do not inflate attempts`, () => {
    let p=act({},id,'SUBMIT')
    assert.equal(p.collectionAdventures[id].state.attempts,0)
    p=act(p,id,'ADD',0);p=act(p,id,'SUBMIT');p=act(p,id,'SUBMIT')
    assert.equal(p.collectionAdventures[id].state.attempts,1)
    assert.equal(p.collectionAdventures[id].state.feedback,'retry')
    assert.equal(p.sessions.length,0)
  })
  test(`${id}: reload preserves help and answer; malformed state resets`, () => {
    let p=act({},id,'ADD',0);p=act(p,id,'HELP')
    const stored=JSON.parse(JSON.stringify(p.collectionAdventures[id]))
    assert.equal(normalizeCollection(stored,id).state.counts[0],1)
    assert.equal(normalizeCollection(stored,id).state.helped,true)
    stored.state.counts[0]=-2
    assert.equal(normalizeCollection(stored,id).state.counts[0],0)
  })
  test(`${id}: completion survives a stale device and unrelated adventure saves`, () => {
    const p=solve({},id)
    const stale=act({},id,'ADD',0)
    stale.collectionAdventures[id].updatedAt=999
    const merged=mergeProgress(p,stale)
    assert.ok(merged.collectionAdventures[id].state.report)
    assert.equal(merged.sessions.length,1)
    assert.deepEqual(mergeCollections(p.collectionAdventures,{})[id].state.report,p.collectionAdventures[id].state.report)
  })
}
test('sharing conserves the finite snack collection', () => {
  let p={}
  for(let i=0;i<9;i++)p=act(p,'snacks','ADD',0)
  assert.equal(p.collectionAdventures.snacks.state.counts[0],4)
  p=act(p,'snacks','REMOVE',0)
  assert.equal(p.collectionAdventures.snacks.state.counts[0],3)
})
test('path finds unfinished adventures then the next chapter', () => {
  assert.equal(nextAdventure({}),'picnic')
  const p={picnic:{state:{phase:'complete',report:{}},updatedAt:1}}
  assert.equal(nextAdventure(p),'basket')
  assert.equal(nextAdventure(solve(p,'basket')),'snacks')
  assert.equal(nextAdventure(solve(solve(p,'basket'),'snacks')),'phonics')
})
