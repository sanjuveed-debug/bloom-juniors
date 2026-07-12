const clamp=(n,min,max)=>Math.max(min,Math.min(max,n))

export function getSkillJourney(progress={},skillId='general') {
  return progress.learningJourney?.skills?.[skillId]||{
    attempts:0,correct:0,mastery:0,difficulty:1,successStreak:0,struggleStreak:0,
    recentQuestions:[],misconceptions:{},lastPlayedAt:null,
  }
}

export function questionSignature(moduleId,question) {
  const raw=typeof question==='string'?question:JSON.stringify(question||{})
  let hash=2166136261
  for(let i=0;i<raw.length;i++){hash^=raw.charCodeAt(i);hash=Math.imul(hash,16777619)}
  return `${moduleId}:${(hash>>>0).toString(36)}`
}

export function rememberQuestion(progress,moduleId,question,maxRecent=80) {
  const skill=getSkillJourney(progress,moduleId), signature=questionSignature(moduleId,question)
  return updateJourneySkill(progress,moduleId,{recentQuestions:[signature,...skill.recentQuestions.filter(x=>x!==signature)].slice(0,maxRecent)})
}

export function selectFreshQuestions(pool,progress,moduleId,count,seed=Date.now()) {
  const recent=new Set(getSkillJourney(progress,moduleId).recentQuestions||[])
  const scored=pool.map((question,index)=>({question,index,fresh:!recent.has(questionSignature(moduleId,question)),score:seededScore(seed,index)}))
  scored.sort((a,b)=>Number(b.fresh)-Number(a.fresh)||a.score-b.score)
  return scored.slice(0,count).map(x=>x.question)
}

function seededScore(seed,index){let x=(Number(seed)+index*2654435761)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}

function updateJourneySkill(progress,skillId,patch) {
  const journey=progress.learningJourney||{version:1,skills:{},updatedAt:null}
  const previous=getSkillJourney(progress,skillId)
  return {...progress,learningJourney:{...journey,version:1,updatedAt:Date.now(),skills:{...journey.skills,[skillId]:{...previous,...patch}}}}
}

export function recordAdaptiveSession(progress,moduleId,session={}) {
  const previous=getSkillJourney(progress,moduleId)
  const total=Math.max(1,Number(session.total)||1), correct=clamp(Number(session.correct)||0,0,total)
  const accuracy=correct/total, attempts=previous.attempts+total, allCorrect=previous.correct+correct
  const successStreak=accuracy>=.8?previous.successStreak+1:0
  const struggleStreak=accuracy<.55?previous.struggleStreak+1:0
  let difficulty=previous.difficulty||1
  if(successStreak>=2)difficulty=clamp(difficulty+1,1,10)
  if(struggleStreak>=2)difficulty=clamp(difficulty-1,1,10)
  const evidence=Math.min(1,attempts/30), mastery=Math.round(((allCorrect/attempts)*.8+evidence*.2)*100)
  const misconceptions={...(previous.misconceptions||{})}
  for(const item of session.struggles||[]){const key=String(item?.skill||item?.question||item).slice(0,100);if(key)misconceptions[key]=(misconceptions[key]||0)+1}
  const recent=[...(session.questionSignatures||[]),...(previous.recentQuestions||[])].filter((x,i,a)=>x&&a.indexOf(x)===i).slice(0,80)
  return updateJourneySkill(progress,moduleId,{attempts,correct:allCorrect,mastery,difficulty,successStreak,struggleStreak,recentQuestions:recent,misconceptions,lastAccuracy:Math.round(accuracy*100),lastPlayedAt:Date.now()})
}

export function getAdaptiveMix(progress,moduleId) {
  const skill=getSkillJourney(progress,moduleId), level=skill.difficulty||1
  return {level,current:6,confidence:2,challenge:2,mastery:skill.mastery||0}
}

export function generateArithmeticQuestions({moduleId='math',operation='add',count=10,progress={},seed=Date.now()}) {
  const {level}=getAdaptiveMix(progress,moduleId), rng=makeRng(seed+level*7919), max=level<=2?5:level<=4?10:level<=6?20:level<=8?50:100
  const recent=new Set(getSkillJourney(progress,moduleId).recentQuestions||[]), out=[], seen=new Set()
  for(let guard=0;out.length<count&&guard<500;guard++){
    let a=1+Math.floor(rng()*max),b=1+Math.floor(rng()*max),answer,prompt
    if(operation==='subtract'){if(b>a)[a,b]=[b,a];answer=a-b;prompt=`${a} − ${b}`}
    else if(operation==='multiply'){a=2+Math.floor(rng()*Math.min(11,level+3));b=1+Math.floor(rng()*12);answer=a*b;prompt=`${a} × ${b}`}
    else{answer=a+b;prompt=`${a} + ${b}`}
    const q={prompt,answer,a,b,operation,difficulty:level},sig=questionSignature(moduleId,q)
    if(!seen.has(sig)&&!recent.has(sig)){seen.add(sig);out.push({...q,signature:sig})}
  }
  return out
}

function makeRng(seed){let s=Number(seed)>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
