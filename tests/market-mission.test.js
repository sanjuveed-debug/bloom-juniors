import test from 'node:test'
import assert from 'node:assert/strict'
import {applyMarketAction,marketTotals,marketReasons,normalizeMarket,mergeMarket} from '../src/utils/marketMission.js'
import {mergeProgress} from '../src/services/cloudStore.js'
const act=(p,type,extra={})=>applyMarketAction(p,{type,...extra},(p.marketMission?.updatedAt||0)+1)
function basket(counts,p={}){for(const [id,n]of Object.entries(counts))for(let i=0;i<n;i++)p=act(p,'QUANTITY',{id,delta:1});return p}
function answer(p,n){return act(act(p,'ANSWER',{value:String(n)}),'CHECK')}
function finish(p){p=act(p,'CHECK_PLAN');const cost=marketTotals(p.marketMission.state.counts).cost;p=answer(p,cost);p=answer(p,12-cost);return act(p,'FINISH',{reason:'enjoy'})}
test('market accepts every affordable basket, including exact budget and saved coins',()=>{
 let valid=0
 for(let apple=0;apple<=4;apple++)for(let juice=0;juice<=4;juice++){
  const counts={apple,banana:4-apple,water:4-juice,juice},cost=marketTotals(counts).cost
  if(cost>12)continue
  const p=finish(basket(counts));valid++
  assert.equal(p.marketMission.state.phase,'complete');assert.equal(p.marketMission.state.report.left,12-cost)
  assert.equal(p.sessions.length,1);assert.equal(p.sessions[0].correct,2);assert.equal(p.sessions[0].stars,0)
 }
 assert.equal(valid,9)
})
test('over-budget plan requires revision after a correct calculation',()=>{
 let p=act(basket({apple:4,juice:4}),'CHECK_PLAN');p=answer(p,20)
 assert.equal(p.marketMission.state.phase,'plan');assert.equal(p.marketMission.state.feedback,'budget')
 for(let i=0;i<4;i++){p=act(p,'QUANTITY',{id:'juice',delta:-1});p=act(p,'QUANTITY',{id:'water',delta:1})}
 p=finish(p);assert.equal(p.marketMission.state.report.cost,12);assert.equal(p.marketMission.state.report.attempts.total,2)
 assert.ok(!marketReasons(p.marketMission.state.counts).some(r=>r.id==='save'))
})
test('empty answers, invalid quantities and unchanged checks cannot inflate progress',()=>{
 let p=act({},'CHECK_PLAN');assert.equal(p.marketMission.state.attempts.plan,0)
 assert.deepEqual(act({},'QUANTITY',{id:'fake',delta:1}),{})
 p=basket({apple:1},p);p=act(p,'CHECK_PLAN');p=act(p,'CHECK_PLAN')
 assert.equal(p.marketMission.state.phase,'plan');assert.equal(p.marketMission.state.attempts.plan,1)
 p=basket({apple:3,water:4},p);p=act(p,'CHECK_PLAN');p=act(p,'CHECK')
 assert.equal(p.marketMission.state.attempts.total,0)
 p=answer(p,11);p=act(p,'CHECK');assert.equal(p.marketMission.state.attempts.total,1)
 p=act(p,'ANSWER',{value:'-1'});assert.equal(p.marketMission.state.answer,'11')
})
test('reload preserves stage, typed answer and support; corrupt state recovers safely',()=>{
 let p=act(basket({banana:4,water:4}),'CHECK_PLAN');p=act(p,'HELP');p=act(p,'ANSWER',{value:'7'})
 const saved=JSON.parse(JSON.stringify(p.marketMission))
 assert.equal(normalizeMarket(saved).state.answer,'7');assert.equal(normalizeMarket(saved).state.helped.total,true)
 saved.state.counts.apple=-1;assert.equal(normalizeMarket(saved).state.phase,'plan')
 p=answer(p,8);p=answer(p,4);p=act(p,'FINISH',{reason:'save'})
 assert.equal(p.sessions[0].firstTryCorrect,1);assert.equal(p.marketMission.state.report.reason,'save')
})
test('replay, duplicate finish and stale cloud snapshots preserve the first recap',()=>{
 const p=finish(basket({banana:4,water:4}));let replay=act(p,'REPLAY');replay=finish(basket({apple:4,water:4},replay))
 assert.deepEqual(replay.marketMission.state.report,p.marketMission.state.report);assert.equal(replay.sessions.length,1)
 assert.equal(act(replay,'FINISH',{reason:'use'}).sessions.length,1)
 const stale=basket({apple:1});stale.marketMission.updatedAt=9999;stale.sessions=[{...p.sessions[0],date:9999}]
 const merged=mergeProgress(p,stale);assert.deepEqual(merged.marketMission.state.report,p.marketMission.state.report);assert.equal(merged.sessions.length,1)
 assert.ok(mergeMarket(p.marketMission,undefined).state.report)
})
