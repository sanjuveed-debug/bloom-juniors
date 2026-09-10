import test from 'node:test'
import assert from 'node:assert/strict'
import { parentLearningSnapshot } from '../src/utils/parentLearningSnapshot.js'
import { COLLECTION_ADVENTURES, applyCollectionAction } from '../src/utils/collectionAdventure.js'
import { newMarket } from '../src/utils/marketMission.js'
import { applyFloatDiscovery } from '../src/utils/floatDiscovery.js'
let clock=1
const act=(p,id,type,index)=>applyCollectionAction(p,id,{type,index},clock++)
function finish(id){let p={};for(const round of COLLECTION_ADVENTURES[id].rounds){p=act(p,id,'HELP');round.targets.forEach((n,i)=>{for(let j=0;j<n;j++)p=act(p,id,'ADD',i)});p=act(p,id,'SUBMIT');p=act(p,id,'NEXT')}return p}
test('empty records give age-specific starters without claiming completion',()=>{for(const age of ['toddler','early','junior']){const s=parentLearningSnapshot({},age);assert.equal(s.active,false);assert.match(s.completed,/No saved progress/);assert.ok(s.prompt);assert.ok(s.nextTitle)}})
test('unfinished work reports help without marking current round complete',()=>{const p=act({},'basket','HELP');const s=parentLearningSnapshot(p);assert.match(s.completed,/0 of 2/);assert.match(s.help,/1 round/);assert.equal(s.nextTitle,'Pack the Basket')})
test('completed and replayed summaries preserve first completion evidence',()=>{let p=finish('snacks');const before=parentLearningSnapshot(p);assert.match(before.completed,/2 of 2/);assert.match(before.help,/2 rounds/);p=act(p,'snacks','REPLAY');const after=parentLearningSnapshot(p);for(const key of ['completed','help','firstVisit','title'])assert.equal(after[key],before[key]);assert.equal(after.nextTitle,'Share the Snacks')})
test('age filtering prevents another age adventure becoming the summary',()=>{const p=finish('tiny');assert.equal(parentLearningSnapshot(p,'early').active,false);assert.equal(parentLearningSnapshot(p,'toddler').firstVisit,true)})
test('market partial record names the stage and working hint',()=>{const p={marketMission:{state:{...newMarket(),helped:{plan:true,total:false,change:false}},updatedAt:1}};const s=parentLearningSnapshot(p,'junior');assert.match(s.completed,/choosing a basket/);assert.match(s.help,/basket planning/);assert.equal(s.firstVisit,false)})

test('science prediction is not counted as an observed experiment',()=>{
 const p=applyFloatDiscovery({}, {type:'PREDICT',floats:false},100)
 const s=parentLearningSnapshot(p)
 assert.equal(s.title,'Will it float?');assert.match(s.completed,/0 of 4/);assert.deepEqual(s.observations,[])
 assert.equal(s.nextTitle,'Will it float?');assert.equal(s.firstVisit,false)
 for(const age of ['toddler','junior'])assert.equal(parentLearningSnapshot(p,age).active,false)
})

test('science recap preserves first predictions after replay and reload',()=>{
 let p={};let at=100
 for(let i=0;i<4;i++)for(const action of [{type:'PREDICT',floats:false},{type:'DROP'},{type:'NEXT'}])p=applyFloatDiscovery(p,action,at++)
 const before=parentLearningSnapshot(p)
 assert.match(before.completed,/Completed all 4/);assert.equal(before.firstVisit,true)
 assert.match(before.observations[0],/predicted sink; observed floating/)
 assert.match(before.help,/not scored/)
 p=applyFloatDiscovery(p,{type:'REPLAY'},at++)
 p=applyFloatDiscovery(p,{type:'PREDICT',floats:true},at++)
 assert.deepEqual(parentLearningSnapshot(JSON.parse(JSON.stringify(p))).observations,before.observations)
 assert.equal(parentLearningSnapshot({...p,floatDiscovery:undefined}).firstVisit,true)
 p=applyCollectionAction(p,'basket',{type:'HELP'},at++)
 assert.equal(parentLearningSnapshot(p).title,'Pack the Basket')
})

test('invalid science completion cannot become first-visit evidence',()=>{
 const p={sessions:[{module:'float-discovery',activityId:'float-discovery-first',date:100,observations:[]}]}
 assert.equal(parentLearningSnapshot(p).active,false)
})
