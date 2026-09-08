import test from 'node:test'
import assert from 'node:assert/strict'
import { COLLECTION_ADVENTURES, applyCollectionAction, normalizeCollection } from '../src/utils/collectionAdventure.js'
import { mergeProgress } from '../src/services/cloudStore.js'
const act=(p,type,index)=>applyCollectionAction(p,'tiny',{type,index},(p.collectionAdventures?.tiny?.updatedAt||0)+1)
const finish=p=>{for(let i=p.collectionAdventures?.tiny?.state.round||0;i<4;i++){p=act(p,'CHOOSE',COLLECTION_ADVENTURES.tiny.rounds[i].targets.indexOf(1));p=act(p,'NEXT')}return p}
test('Tiny Stars matches and sorts across four turns with truthful help evidence',()=>{
 let p=act({},'CHOOSE',1);p=act(p,'CHOOSE',1)
 assert.equal(p.collectionAdventures.tiny.state.attempts,1)
 p=act(p,'HELP');p=finish(p)
 const s=p.collectionAdventures.tiny.state
 assert.equal(s.phase,'complete');assert.equal(s.report.firstTryCorrect,3);assert.equal(s.report.supportedCorrect,1)
 assert.equal(s.report.results.length,4);assert.equal(p.sessions.length,1);assert.equal(p.sessions[0].module,'shapes');assert.equal(p.sessions[0].stars,0)
 assert.equal(normalizeCollection(p.collectionAdventures.tiny,'tiny').state.phase,'complete')
})
test('Tiny Stars reload retains a choice and help; invalid rounds reset',()=>{
 let p=act({},'CHOOSE',1);p=act(p,'HELP')
 const saved=JSON.parse(JSON.stringify(p.collectionAdventures.tiny))
 assert.equal(normalizeCollection(saved,'tiny').state.helped,true)
 assert.equal(normalizeCollection(saved,'tiny').state.feedback,'retry')
 saved.state.round=99;assert.equal(normalizeCollection(saved,'tiny').state.round,0)
 assert.deepEqual(act({},'CHOOSE',9),{})
})
test('Tiny Stars first report survives replay, stale writes and duplicate sessions',()=>{
 const p=finish({});const replay=finish(act(p,'REPLAY'))
 assert.deepEqual(replay.collectionAdventures.tiny.state.report,p.collectionAdventures.tiny.state.report)
 assert.equal(replay.sessions.length,1)
 const stale=act({},'CHOOSE',1);stale.collectionAdventures.tiny.updatedAt=9999
 stale.sessions=[{...p.sessions[0],date:9999}]
 const merged=mergeProgress(p,stale)
 assert.ok(merged.collectionAdventures.tiny.state.report);assert.equal(merged.sessions.length,1)
})
