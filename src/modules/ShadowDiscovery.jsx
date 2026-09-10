import { useState } from 'react'
import BumiCharacter from '../components/BumiCharacter.jsx'
import ActivityVoiceControls from '../components/ActivityVoiceControls.jsx'
import AdventureFinishChoices from '../components/AdventureFinishChoices.jsx'
import { useSpeech } from '../hooks/useSpeech.js'
import { useActivityNarration } from '../hooks/useActivityNarration.js'
import { SHADOW_ROUNDS, SHADOW_HOME_PROMPT, normalizeShadowDiscovery, applyShadowDiscovery, shadowGeometry } from '../utils/shadowDiscovery.js'
import './shadow-discovery.css'

function ShadowStage({ position, off }) {
  const { lightX, radius } = shadowGeometry(position)
  return <svg className="shadow-stage" viewBox="0 0 900 360" role="img" aria-label={off ? 'Torch off. The wall is dark, with no torch shadow.' : `Torch shining past a card onto a wall. ${position > 50 ? 'A large' : 'A small'} shadow is on the wall.`}>
    <defs><linearGradient id="shadow-room" x2="0" y2="1"><stop stopColor="#202439"/><stop offset="1" stopColor="#41415a"/></linearGradient><linearGradient id="shadow-beam"><stop stopColor="#ffe6a5" stopOpacity=".7"/><stop offset="1" stopColor="#fff0bc" stopOpacity=".18"/></linearGradient></defs>
    <rect width="900" height="360" rx="28" fill="url(#shadow-room)"/>
    <path d="M0 290H900V360H0Z" fill="#343347"/><path d="M35 307H755" stroke="#72708a" strokeDasharray="5 10"/>
    <path d="M770 28L852 52V322L770 298Z" fill={off ? '#595968' : '#fff1c6'}/>
    {!off && <><path d={`M${lightX} 160L800 30V290Z`} fill="url(#shadow-beam)"/><path d={`M480 132L800 ${160-radius}V${160+radius}L480 188Z`} fill="#242437" opacity=".65"/><path d={`M${lightX} 160L800 ${160-radius}M${lightX} 160L800 ${160+radius}`} stroke="#f9d680" strokeWidth="2" strokeDasharray="7 7" opacity=".7"/><ellipse data-shadow-radius={radius.toFixed(2)} cx="800" cy="160" rx="22" ry={radius} fill="#242437"/></>}
    <path d="M480 180V286" stroke="#aa7656" strokeWidth="9"/><ellipse cx="480" cy="160" rx="10" ry="28" fill="#e9a678" stroke="#ffd6a8" strokeWidth="3"/>
    <g transform={`translate(${lightX} 160)`}><rect x="-70" y="-15" width="55" height="30" rx="8" fill="#e6aa67"/><path d="M-20 -15L0 -25V25L-20 15Z" fill="#a5c9cb"/><ellipse cy="0" rx="5" ry="25" fill={off ? '#728a99' : '#fff3b9'}/><rect x="-51" y="-20" width="17" height="7" rx="3" fill="#faf0d3"/></g>
    <g fill="#fff5dc" fontSize="20" fontFamily="Nunito, sans-serif" textAnchor="middle"><text x={lightX-25} y="335">Torch</text><text x="480" y="335">Card</text><text x="809" y="350">Wall</text></g>
  </svg>
}

export default function ShadowDiscovery({ progress = {}, update, onBack, guest = false }) {
  const state=normalizeShadowDiscovery(progress.shadowDiscovery)
  const item=SHADOW_ROUNDS[state.round]
  const speech=useSpeech()
  const [freePosition,setFreePosition]=useState(0)
  const [freeOff,setFreeOff]=useState(false)
  const complete=state.phase==='complete'
  const dispatch=action=>update(p=>applyShadowDiscovery(p,action))
  const cue=complete ? 'You changed a shadow! Light travels from the torch. The card blocks some of it. Move the torch and look again, or finish for now.' : state.phase==='predict' ? `${item.question} ${item.choices.join(', or ')}? Every guess is worth testing.` : state.phase==='test' ? item.id==='off' ? 'Tap the switch to turn off the torch. Watch the wall.' : `Slide the torch all the way ${item.id==='closer' ? 'towards the card' : 'away from the card'}. Or tap ${item.action}. The card stays still.` : item.explanation
  const voice=useActivityNarration({...speech,cue:`${state.round}-${state.phase}`,text:cue})
  return <main className="shadow-page">
    <header className="shadow-header"><button onClick={onBack}>← Adventures</button><span>DISCOVER WITH BUMI</span><ActivityVoiceControls voice={voice}/></header>
    <section className="shadow-lab">
      <div className="shadow-title"><p>THE LITTLE LIGHT THEATRE · AGES 4–6</p><h1>{complete ? 'Small torch. Big discovery.' : 'How can we change a shadow?'}</h1><p>{complete ? 'Your shadow journal' : `Experiment ${state.round+1} of 3 · ${state.phase==='predict' ? 'Make a prediction' : state.phase==='test' ? 'Try it yourself' : 'Look what changed'}`}</p></div>
      <div className="shadow-guide"><BumiCharacter size={110} state={state.phase==='observe'||complete ? 'nod' : 'think'} talking={speech.speaking}/><p role="status">{cue}</p></div>
      <div className="shadow-board"><ShadowStage position={complete ? freePosition : state.position} off={complete ? freeOff : item.id==='off'&&state.phase==='observe'}/></div>
      <div className="shadow-actions">
        {complete ? <><h2>Look again. You control the light.</h2><label className="shadow-slider">Move the torch<input type="range" min="0" max="100" value={freePosition} onChange={e=>setFreePosition(Number(e.target.value))} aria-label="Explore torch position" disabled={freeOff}/><span>Farther from card <b>Closer to card</b></span></label><button className="shadow-secondary" onClick={()=>setFreeOff(v=>!v)}>{freeOff ? 'Switch on the torch' : 'Switch off the torch'}</button><div className="shadow-journal">{SHADOW_ROUNDS.map(r=><div key={r.id}><strong>{r.action}</strong><span>{r.result}</span></div>)}</div><div className="shadow-home"><h3>Make a shadow show together</h3><p>{SHADOW_HOME_PROMPT}</p><button className="shadow-secondary" onClick={()=>speech.speak(SHADOW_HOME_PROMPT)}>Hear the home idea</button></div><p className="shadow-small">{guest ? 'Saved in this browser only.' : 'Your first completed discovery is saved with this child profile.'} Predictions are not scored.</p><AdventureFinishChoices onFinish={onBack} onReplay={()=>{setFreePosition(0);setFreeOff(false);dispatch({type:'REPLAY'})}}/><details><summary>For grown-ups: how this model works</summary><p>This side-view model uses one small light source, an opaque card and a fixed wall. It shows shadow size, not soft edges or other lights. The dashed lines show where light just passes the card. A real torch may make softer shadows.</p><a href="https://www.sciencebuddies.org/stem-activities/change-the-size-of-a-shadow" target="_blank" rel="noreferrer">Try the Science Buddies shadow activity</a></details></>
        : state.phase==='predict' ? <div className="shadow-predictions">{item.choices.map((choice,i)=><button key={choice} onClick={()=>dispatch({type:'PREDICT',prediction:choice})}><span aria-hidden="true">{item.id==='off' ? i===0 ? '●' : '○' : i===0 ? '⬤' : '•'}</span>{choice}</button>)}</div>
        : state.phase==='test' ? <>{item.id!=='off'&&<label className="shadow-slider">Slide the torch and watch<input type="range" min="0" max="100" value={state.position} onChange={e=>dispatch({type:'MOVE',position:Number(e.target.value)})} aria-label="Torch position"/><span>Farther from card <b>Closer to card</b></span></label>}<button className="shadow-primary" onClick={()=>dispatch(item.id==='off'?{type:'OFF'}:{type:'MOVE',position:item.target})}>{item.action} {item.id==='off' ? '◉' : item.id==='closer' ? '→' : '←'}</button></>
        : <><p className="shadow-observation">{item.result === 'It disappears' ? 'No torch light. No torch shadow.' : `The shadow became ${item.result.toLowerCase()}.`}</p><button className="shadow-primary" onClick={()=>dispatch({type:'NEXT'})}>{state.round===2 ? 'See our discoveries' : 'Next experiment'} →</button></>}
      </div>
    </section>
  </main>
}
