import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import BumiCharacter from '../components/BumiCharacter.jsx'
import ActivityVoiceControls from '../components/ActivityVoiceControls.jsx'
import AdventureFinishChoices from '../components/AdventureFinishChoices.jsx'
import { useSpeech } from '../hooks/useSpeech.js'
import { useActivityNarration } from '../hooks/useActivityNarration.js'
import { usePlayDrag } from '../hooks/usePlayDrag.js'
import { FLOAT_OBJECTS, normalizeFloatDiscovery, applyFloatDiscovery } from '../utils/floatDiscovery.js'
import './float-discovery.css'

function ObjectArt({ id }) { return <span aria-hidden="true" className={`float-object float-object-${id}`}><i/><b/></span> }
const HOME_PROMPT = 'With a grown-up, try a cork and a large stone in a shallow bowl of water. Guess first, then test. Ask: what changed when we made the clay into a boat?'

export default function FloatDiscovery({ progress = {}, update, onBack, guest = false }) {
  const state = normalizeFloatDiscovery(progress.floatDiscovery)
  const item = FLOAT_OBJECTS[state.round]
  const speech = useSpeech()
  const reduced = useReducedMotion()
  const board = useRef(null)
  const [settled, setSettled] = useState(state.phase === 'observe')
  const [selected, setSelected] = useState(false)
  const dispatch = action => update(p => applyFloatDiscovery(p, action))
  const drop = () => { if (state.phase !== 'drop') return; setSettled(false); setSelected(false); dispatch({ type: 'DROP' }) }
  const drag = usePlayDrag({ enabled: state.phase === 'drop', scope: board, onDrop: drop })
  useEffect(() => {
    if (state.phase !== 'observe') { setSettled(false); return }
    const timer = setTimeout(() => setSettled(true), reduced ? 30 : 1900)
    return () => clearTimeout(timer)
  }, [state.phase, state.round, reduced])
  const complete = state.phase === 'complete'
  const narration = complete ? `You tested four ideas! Water pushes up on things. Shape matters too. ${HOME_PROMPT}`
    : state.phase === 'predict' ? `${item.question} Tap the picture for float, or the picture for sink. Every guess is worth testing.`
    : state.phase === 'drop' ? `Let us find out! Drag ${item.name} into the water. Or tap it, then tap the water.`
    : settled ? item.explanation : 'Watch what happens in the water.'
  const voice = useActivityNarration({ ...speech, cue: `${state.round}-${state.phase}-${settled}`, text: narration })
  const next = () => { setSelected(false); dispatch({ type: 'NEXT' }) }
  return <main className="float-page">
    <header className="float-header"><button onClick={onBack} aria-label="Back to adventures">&#8592; Adventures</button><span>DISCOVER WITH BUMI</span><ActivityVoiceControls voice={voice}/></header>
    <section className="float-lab">
      <div className="float-heading"><p>THE LITTLE WATER LAB <span>AGES 4–6</span></p><h1>{complete ? 'A little shape. A big discovery.' : 'Will it float?'}</h1><div className="float-progress" aria-label={`${complete ? 4 : state.round + 1} of 4 experiments`}>{FLOAT_OBJECTS.map((o,i) => <span key={o.id} className={i <= state.round ? 'is-current' : ''}>{i+1}</span>)}</div></div>
      {complete ? <div className="float-finish"><BumiCharacter size={150} state="celebrate" autoIdle={1800} talking={speech.speaking}/><h2>You guessed. You tested. You noticed.</h2><div className="float-journal">{FLOAT_OBJECTS.map(o => <div key={o.id}><ObjectArt id={o.id}/><strong>{o.label}</strong><span>{o.floats ? 'Floated on top' : 'Sank down'}</span></div>)}</div><p>Water pushes up on things. The same clay can sink as a ball and float as a hollow boat.</p><div className="float-home"><strong>Try a little water wonder at home</strong><p>{HOME_PROMPT}</p></div><p className="float-small">{guest ? 'This discovery is saved in this browser.' : 'Your first set of observations is saved with this child profile.'} This visit records exploration, not mastery.</p><AdventureFinishChoices onFinish={onBack} onReplay={()=>dispatch({type:'REPLAY'})}/><details><summary>For grown-ups: the science</summary><p>These are four illustrated examples, not a physics simulator. Floating depends on an object’s overall density and the water it displaces. The hollow clay boat shown stays upright and keeps water out; flooding or changing the shape may make it sink.</p><a href="https://www.teachengineering.org/activities/duk_boat_mary_act" target="_blank" rel="noreferrer">Science background: TeachEngineering</a></details></div>
      : <>
        <div className="float-stage" ref={board}>
          <div className="float-scenery" aria-hidden="true"><span/><span/><span/></div>
          <div className="float-guide"><BumiCharacter size={145} state={state.phase === 'observe' ? settled ? 'nod' : 'think' : drag.ghost ? 'point' : 'idle'} reactionKey={`${state.round}-${state.phase}-${settled}`} talking={speech.speaking} attentionTarget={drag.ghost ? {x:drag.ghost.x,y:drag.ghost.y} : null}/><p role="status">{state.phase === 'predict' ? item.question : state.phase === 'drop' ? 'Put it in the water. Let’s find out!' : settled ? item.explanation : 'Watch closely…'}</p></div>
          <button className={`float-tank ${drag.over !== null ? 'is-over' : ''}`} data-play-drop="water" aria-label="Put the object in the water" disabled={state.phase !== 'drop'} onClick={drop}>
            <span className="float-tank-back"/>
            {state.phase === 'observe' && <span key={item.id} className={`float-test-object ${item.floats ? 'will-float' : 'will-sink'}`}><ObjectArt id={item.id}/></span>}
            <span className="float-water"><i/><i/><i/></span><span className="float-waterline"/>
            {state.phase === 'observe' && <span className="float-ripple"/>}
            <span className="float-tank-label">{state.phase === 'drop' ? selected ? 'Tap the water ↓' : 'Drop here ↓' : 'What do you notice?'}</span>
          </button>
          <div className="float-shelf"><button className={`float-source ${selected ? 'is-selected' : ''}`} {...drag.bind(item.id)} disabled={state.phase !== 'drop'} onClick={()=>setSelected(v=>!v)} aria-label={`Pick up ${item.name}`} aria-pressed={selected}><ObjectArt id={item.id}/></button><strong>{item.label}</strong></div>
        </div>
        <div className="float-actions">
          {state.phase === 'predict' ? <><p>What do you think?</p><div className="float-predictions">{[true,false].map(floats=><button key={String(floats)} onClick={()=>dispatch({type:'PREDICT',floats})}><span className={`float-choice-picture ${floats ? 'up' : 'down'}`} aria-hidden="true"><i/><b>{floats ? '↑' : '↓'}</b></span><strong>{floats ? 'Float on top' : 'Sink down'}</strong></button>)}</div></> : state.phase === 'drop' ? <p>Drag it into the water, or tap the object and the water.</p> : <><p>{settled ? 'A guess helps us explore. There is no wrong guess.' : 'Let’s watch together.'}</p><button className="float-next" disabled={!settled} onClick={next}>{state.round === 2 ? 'Shape it into a boat →' : state.round === 3 ? 'See our discoveries →' : 'Try the next object →'}</button></>}
        </div>
      </>}
    </section>
    {drag.ghost && <div className="float-drag-ghost" style={{left:drag.ghost.x,top:drag.ghost.y}}><ObjectArt id={item.id}/></div>}
  </main>
}
