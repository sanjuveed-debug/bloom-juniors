export const MARKET_BUDGET = 12
export const MARKET_ITEMS = [
  {id:'apple',name:'Apples',single:'apple',price:2,group:'fruit',colour:'#d97055'},
  {id:'banana',name:'Bananas',single:'banana',price:1,group:'fruit',colour:'#e8ba4a'},
  {id:'water',name:'Water',single:'water',price:1,group:'drink',colour:'#83b4cb'},
  {id:'juice',name:'Juice',single:'juice',price:3,group:'drink',colour:'#e59b53'},
]
export const MARKET_REASONS = [
  {id:'save',label:'I kept some coins for another day.'},
  {id:'use',label:'I used all 12 coins to cover everyone.'},
  {id:'mix',label:'I chose a mix of fruits.'},
  {id:'enjoy',label:'I chose things I think my friends would enjoy.'},
]
export const marketTotals = counts => ({
  cost: MARKET_ITEMS.reduce((sum,item)=>sum+counts[item.id]*item.price,0),
  fruit: counts.apple+counts.banana, drink: counts.water+counts.juice,
})
export const marketReasons = counts => {const {cost}=marketTotals(counts);return MARKET_REASONS.filter(r=>r.id==='enjoy'||r.id==='save'&&cost<12||r.id==='use'&&cost===12||r.id==='mix'&&counts.apple>0&&counts.banana>0)}
export const newMarket = () => ({version:1,phase:'plan',counts:{apple:0,banana:0,water:0,juice:0},answer:'',attempts:{plan:0,total:0,change:0},helped:{plan:false,total:false,change:false},lastKeys:{plan:null,total:null,change:null},feedback:null,report:null})
const validCounts=c=>c&&MARKET_ITEMS.every(i=>Number.isInteger(c[i.id])&&c[i.id]>=0&&c[i.id]<=4)
const validEvidence=(v,boolean=false)=>v&&['plan','total','change'].every(k=>boolean?typeof v[k]==='boolean':Number.isInteger(v[k])&&v[k]>=0)
const countsKey=c=>MARKET_ITEMS.map(i=>c[i.id]).join(',')
const covered=c=>{const t=marketTotals(c);return t.fruit===4&&t.drink===4}
const affordable=c=>covered(c)&&marketTotals(c).cost<=12
function cleanReport(r){
 if(!r||!validCounts(r.counts)||!affordable(r.counts)||!validEvidence(r.attempts)||!validEvidence(r.helped,true)||!['plan','total','change'].every(k=>r.attempts[k]>0)||!marketReasons(r.counts).some(v=>v.id===r.reason))return null
 const cost=marketTotals(r.counts).cost
 return {counts:{...r.counts},cost,left:12-cost,reason:r.reason,attempts:{...r.attempts},helped:{...r.helped}}
}
export function normalizeMarket(value){
 const fresh=newMarket(),s=value?.state
 const report=cleanReport(s?.report)
 const valid=s?.version===1&&['plan','total','change','reason','complete'].includes(s.phase)&&validCounts(s.counts)&&validEvidence(s.attempts)&&validEvidence(s.helped,true)&&typeof s.answer==='string'&&/^\d{0,2}$/.test(s.answer)
   &&s.lastKeys&&['plan','total','change'].every(k=>s.lastKeys[k]===null||typeof s.lastKeys[k]==='string'&&s.lastKeys[k].length<80)
   &&(s.phase==='plan'||covered(s.counts))&&(!['change','reason','complete'].includes(s.phase)||affordable(s.counts))
   &&(!['change','reason','complete'].includes(s.phase)||s.attempts.total>0)&&(!['reason','complete'].includes(s.phase)||s.attempts.change>0)
   &&(s.phase!=='complete'||report)
 if(!valid)return {state:{...fresh,report},updatedAt:0,completedAt:report?Number(value?.completedAt)||0:0}
 return {state:{...fresh,phase:s.phase,counts:{...s.counts},answer:s.answer,attempts:{...s.attempts},helped:{...s.helped},lastKeys:{...s.lastKeys},feedback:['quantity','empty','total','change','budget'].includes(s.feedback)?s.feedback:null,report},updatedAt:Number(value.updatedAt)||0,completedAt:Number(value.completedAt)||0}
}
function checked(s,stage,key){return {...s,attempts:{...s.attempts,[stage]:s.attempts[stage]+(s.lastKeys[stage]===key?0:1)},lastKeys:{...s.lastKeys,[stage]:key}}}
export function marketReducer(s,a){
 if(a.type==='REPLAY'&&s.phase==='complete')return {...newMarket(),report:s.report}
 if(s.phase==='complete')return s
 if(a.type==='EDIT')return {...s,phase:'plan',answer:'',feedback:null}
 if(a.type==='HELP'&&['plan','total','change'].includes(s.phase))return {...s,helped:{...s.helped,[s.phase]:true}}
 if(a.type==='QUANTITY'&&s.phase==='plan'){
  if(!MARKET_ITEMS.some(i=>i.id===a.id)||![1,-1].includes(a.delta))return s
  const count=s.counts[a.id]+a.delta;if(count<0||count>4)return s
  return {...s,counts:{...s.counts,[a.id]:count},feedback:null}
 }
 if(a.type==='CHECK_PLAN'&&s.phase==='plan'){
  if(!Object.values(s.counts).some(Boolean))return {...s,feedback:'empty'}
  const next=checked(s,'plan',countsKey(s.counts))
  return covered(s.counts)?{...next,phase:'total',answer:'',feedback:null}:{...next,feedback:'quantity'}
 }
 if(a.type==='ANSWER'&&['total','change'].includes(s.phase)&&typeof a.value==='string'&&/^\d{0,2}$/.test(a.value))return {...s,answer:a.value,feedback:null}
 if(a.type==='CHECK'&&['total','change'].includes(s.phase)){
  if(!s.answer)return {...s,feedback:'empty'}
  const next=checked(s,s.phase,countsKey(s.counts)+':'+s.answer),cost=marketTotals(s.counts).cost
  if(Number(s.answer)!==(s.phase==='total'?cost:12-cost))return {...next,feedback:s.phase}
  if(cost>12)return {...next,phase:'plan',answer:'',feedback:'budget'}
  return {...next,phase:s.phase==='total'?'change':'reason',answer:'',feedback:null}
 }
 if(a.type==='FINISH'&&s.phase==='reason'&&marketReasons(s.counts).some(r=>r.id===a.reason))return {...s,phase:'complete',report:s.report||cleanReport({...s,reason:a.reason})}
 return s
}
export function applyMarketAction(progress,action,at=Date.now()){
 const old=normalizeMarket(progress.marketMission),state=marketReducer(old.state,action)
 if(state===old.state)return progress
 let sessions=progress.sessions||[]
 if(!old.state.report&&state.report&&!sessions.some(s=>s.activityId==='market-first')){
  const firstTryCorrect=['total','change'].filter(k=>state.report.attempts[k]===1&&!state.report.helped[k]).length
  sessions=[...sessions,{date:at,module:'piggybank',activityId:'market-first',title:'The picnic budget',total:2,correct:firstTryCorrect,firstTryCorrect,supportedCorrect:2-firstTryCorrect,completedCorrect:2,stars:0,duration:0}]
 }
 return {...progress,sessions,marketMission:{state,updatedAt:at,completedAt:old.completedAt||(state.report?at:0)}}
}
export function mergeMarket(a,b){
 const left=normalizeMarket(a),right=normalizeMarket(b)
 let chosen=left.updatedAt>=right.updatedAt?left:right
 if(!!left.state.report!==!!right.state.report)chosen=left.state.report?left:right
 else if(left.state.report&&right.state.report){const first=(left.completedAt||left.updatedAt)<=(right.completedAt||right.updatedAt)?left:right;chosen={...chosen,completedAt:first.completedAt,state:{...chosen.state,report:first.state.report}}}
 return chosen
}
