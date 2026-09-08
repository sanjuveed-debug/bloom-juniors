import test from 'node:test'
import assert from 'node:assert/strict'
import { newFloatDiscovery, floatDiscoveryReducer as reduce, normalizeFloatDiscovery, applyFloatDiscovery, mergeFloatDiscovery } from '../src/utils/floatDiscovery.js'
test('water experiment requires a prediction and ignores duplicate drops',()=>{
 const start=newFloatDiscovery(); assert.equal(reduce(start,{type:'DROP'}),start)
 const ready=reduce(start,{type:'PREDICT',floats:false,at:1})
 const observed=reduce(ready,{type:'DROP',at:2})
 assert.equal(observed.observations[0].prediction,false)
 assert.equal(reduce(observed,{type:'DROP',at:3}),observed)
 assert.equal(normalizeFloatDiscovery(observed).phase,'observe')
})
test('four experiments preserve predictions and record one first exploration through replay',()=>{
 let p={sessions:[]};let at=10
 const play=()=>{for(let i=0;i<4;i++)for(const action of [{type:'PREDICT',floats:false},{type:'DROP'},{type:'NEXT'}])p=applyFloatDiscovery(p,action,at++)}
 play();assert.equal(p.floatDiscovery.phase,'complete');assert.equal(p.sessions.length,1);assert.equal(p.sessions[0].observations.length,4)
 p=applyFloatDiscovery(p,{type:'REPLAY'},at++);play();assert.equal(p.sessions.length,1)
})
test('corrupt or unfinished completion cannot become a completed discovery',()=>{
 assert.equal(normalizeFloatDiscovery({round:3,phase:'complete',observations:[]}).phase,'predict')
 assert.equal(normalizeFloatDiscovery({round:200}).round,0)
 const newer={...newFloatDiscovery(),updatedAt:20};assert.deepEqual(mergeFloatDiscovery(newer,{...newFloatDiscovery(),updatedAt:10}),newer)
})
