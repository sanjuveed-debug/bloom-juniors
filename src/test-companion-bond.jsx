import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AdventureModuleFrame from './components/AdventureModuleFrame.jsx'
import './index.css'

const params = new URLSearchParams(window.location.search)
const ageGroup = params.get('age') || 'early'
const moduleId = params.get('module') || 'math'
const questReady = params.get('quest') === 'ready'

function Harness() {
  const [homeCount,setHomeCount] = useState(0)
  const [progress,setProgress] = useState({
    totalStars: 48,
    treasureCollection: {
      items: [
        { id: 'moon-fox', name: 'Starlight Fox', slot: 'buddy', emoji: '🦊' },
        { id: 'junior-telescope', name: 'Explorer Telescope', slot: 'tool', emoji: '🔭' },
        { id: 'rainbow-backpack', name: 'Rainbow Adventure Bag', slot: 'outfit', emoji: '🎒' },
      ],
      equipped: { buddy: 'moon-fox', tool: 'junior-telescope' },
      ...(questReady ? { treasureLoadout: { itemProgress: { 'junior-telescope': { xp: 25 } } } } : {}),
    },
  })
  useEffect(()=>{ window.__treasureProgress = progress },[progress])
  useEffect(()=>{ window.__gameFeelHomeCount = homeCount },[homeCount])
  const finish=(showReward=false)=>{
    const eventId=`harness:${Date.now()}`
    setProgress(current=>({...current,totalStars:current.totalStars+5}))
    window.dispatchEvent(new CustomEvent('yaagvi:celebrate',{detail:{module:moduleId,stars:5,eventId}}))
    if(showReward) window.dispatchEvent(new CustomEvent('bloom:game-complete',{detail:{module:moduleId,stars:3,correct:4,total:4,reward:'A new treasure-map clue was saved.'}}))
  }
  return <AdventureModuleFrame moduleId={moduleId} ageGroup={ageGroup} progress={progress} onUpdateProgress={setProgress} onMap={()=>setHomeCount(value=>value+1)}>
    <div className="mx-auto max-w-xl p-8 text-center"><h1 className="font-bubble text-3xl">Companion Learning Test</h1><p className="mt-2 font-round">What is 4 + 4?</p><div className="mt-5 grid grid-cols-3 gap-3"><button data-companion-answer="wrong" className="rounded-2xl bg-white p-4 font-bubble">6</button><button data-companion-answer="correct" className="rounded-2xl bg-white p-4 font-bubble">8</button><button data-companion-answer="wrong" className="rounded-2xl bg-white p-4 font-bubble">9</button></div><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={()=>finish(false)} className="rounded-2xl bg-emerald-500 px-6 py-4 font-bubble text-white">Finish a learning win</button><button onClick={()=>finish(true)} className="rounded-2xl bg-fuchsia-600 px-6 py-4 font-bubble text-white">Finish and show reward</button></div></div>
  </AdventureModuleFrame>
}

createRoot(document.getElementById('root')).render(<Harness/>)
