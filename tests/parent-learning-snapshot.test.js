import test from 'node:test'
import assert from 'node:assert/strict'
import { parentLearningSnapshot } from '../src/utils/parentLearningSnapshot.js'
import { COLLECTION_ADVENTURES, applyCollectionAction } from '../src/utils/collectionAdventure.js'
import { newMarket } from '../src/utils/marketMission.js'
let clock=1
const act=(p,id,type,index)=>applyCollectionAction(p,id,{type,index},clock++)
function finish(id){let p={};for(const round of COLLECTION_ADVENTURES[id].rounds){p=act(p,id,'HELP');round.targets.forEach((n,i)=>{for(let j=0;j<n;j++)p=act(p,id,'ADD',i)});p=act(p,id,'SUBMIT');p=act(p,id,'NEXT')}return p}
test('empty records give age-specific starters without claiming completion',()=>{for(const age of ['toddler','early','junior']){const s=parentLearningSnapshot({},age);assert.equal(s.active,false);assert.match(s.completed,/No saved progress/);assert.ok(s.prompt);assert.ok(s.nextTitle)}})
test('unfinished work reports help without marking current round complete',()=>{const p=act({},'basket','HELP');const s=parentLearningSnapshot(p);assert.match(s.completed,/0 of 2/);assert.match(s.help,/1 round/);assert.equal(s.nextTitle,'Pack the Basket')})
test('completed and replayed summaries preserve first completion evidence',()=>{let p=finish('snacks');const before=parentLearningSnapshot(p);assert.match(before.completed,/2 of 2/);assert.match(before.help,/2 rounds/);p=act(p,'snacks','REPLAY');const after=parentLearningSnapshot(p);for(const key of ['completed','help','firstVisit','title'])assert.equal(after[key],before[key]);assert.equal(after.nextTitle,'Share the Snacks')})
test('age filtering prevents another age adventure becoming the summary',()=>{const p=finish('tiny');assert.equal(parentLearningSnapshot(p,'early').active,false);assert.equal(parentLearningSnapshot(p,'toddler').firstVisit,true)})
test('market partial record names the stage and working hint',()=>{const p={marketMission:{state:{...newMarket(),helped:{plan:true,total:false,change:false}},updatedAt:1}};const s=parentLearningSnapshot(p,'junior');assert.match(s.completed,/choosing a basket/);assert.match(s.help,/basket planning/);assert.equal(s.firstVisit,false)})
