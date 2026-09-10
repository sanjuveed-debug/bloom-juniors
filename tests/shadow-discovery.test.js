import test from 'node:test'
import assert from 'node:assert/strict'
import { SHADOW_ROUNDS, applyShadowDiscovery as act, normalizeShadowDiscovery, newShadowDiscovery, shadowGeometry } from '../src/utils/shadowDiscovery.js'
import { parentLearningSnapshot } from '../src/utils/parentLearningSnapshot.js'
import { mergeProgress } from '../src/services/cloudStore.js'
function finish(at=10){let p={};for(const r of SHADOW_ROUNDS){p=act(p,{type:'PREDICT',prediction:r.choices[0]},at++);p=act(p,r.id==='off'?{type:'OFF'}:{type:'MOVE',position:r.target},at++);p=act(p,{type:'NEXT'},at++)}return p}
test('shadow experiments require a prediction and an actual target movement',()=>{
 const start={};assert.equal(act(start,{type:'MOVE',position:100}),start)
 let p=act(start,{type:'PREDICT',prediction:'Smaller'},1)
 p=act(p,{type:'MOVE',position:50},2);assert.equal(p.shadowDiscovery.phase,'test');assert.equal(p.shadowDiscovery.observations.length,0)
 assert.equal(act(p,{type:'NEXT'}),p)
 p=act(p,{type:'MOVE',position:100},3);assert.equal(p.shadowDiscovery.phase,'observe');assert.equal(p.shadowDiscovery.observations[0].prediction,'Smaller')
 assert.equal(act(p,{type:'MOVE',position:100}),p)
 assert.deepEqual(normalizeShadowDiscovery(JSON.parse(JSON.stringify(p.shadowDiscovery))),p.shadowDiscovery)
})
test('shadow replay and cloud merge keep one original completion',()=>{
 let p=finish();const recap=parentLearningSnapshot(p);assert.equal(recap.firstVisit,true);assert.equal(recap.observations.length,3)
 p=act(p,{type:'REPLAY'},50);assert.deepEqual(parentLearningSnapshot(p).observations,recap.observations)
 const merged=mergeProgress(p,finish(30));assert.equal(merged.sessions.filter(s=>s.activityId==='shadow-discovery-first').length,1)
 assert.equal(merged.sessions[0].date,18);assert.equal(merged.shadowDiscovery.phase,'predict');assert.equal(merged.shadowDiscovery.updatedAt,50)
 assert.equal(parentLearningSnapshot(p,'junior').active,false);assert.equal(parentLearningSnapshot(p,'toddler').active,false)
})
test('corrupt shadow records cannot fabricate completion',()=>{
 for(const value of [{round:2,phase:'complete',observations:[]},{round:99}, {...newShadowDiscovery(),phase:'observe'}, {...newShadowDiscovery(),observations:[{id:'off',prediction:'It stays'}]}])assert.deepEqual(normalizeShadowDiscovery(value),newShadowDiscovery())
 assert.equal(parentLearningSnapshot({sessions:[{module:'shadow-discovery',activityId:'shadow-discovery-first',observations:[{id:'bad'},{},{}],date:20}]}).active,false)
})
test('point light geometry enlarges the shadow as torch approaches fixed card',()=>{
 let previous=0;for(let p=0;p<=100;p+=10){const g=shadowGeometry(p);assert.ok(g.radius>previous);assert.ok(g.lightX<480);previous=g.radius}
 assert.equal(shadowGeometry(100).radius,28*440/120)
})
