import ActivityVoiceControls from '../components/ActivityVoiceControls.jsx'
import { useActivityNarration } from '../hooks/useActivityNarration.js'
import AdventureFinishChoices from '../components/AdventureFinishChoices.jsx'
import { usePlayDrag } from '../hooks/usePlayDrag.js'
import { useEffect, useRef, useState } from 'react'
import YaagviCharacter from '../components/YaagviCharacter.jsx'
import { useSpeech } from '../hooks/useSpeech.js'
import { COLLECTION_ADVENTURES, normalizeCollection, applyCollectionAction, checkCollection } from '../utils/collectionAdventure.js'
import './collection-adventure.css'

function Fruit({ pear = false }) { return <span aria-hidden="true" className={`collection-fruit ${pear ? 'is-pear' : ''}`} /> }
function Friend({ name }) {
  const i = ['Pip', 'Wren', 'Momo', 'Bo'].indexOf(name)
  return <span aria-hidden="true" className="collection-friend" style={{ backgroundPosition: `${i % 3 * 50}% ${Math.floor(i / 3) * 100}%` }} />
}
export default function CollectionAdventure({ id, progress, update, onBack, onNext, guest = false }) {
  const config = COLLECTION_ADVENTURES[id]
  const { state } = normalizeCollection(progress.collectionAdventures?.[id], id)
  const round = config.rounds[state.round]
  const [demonstrating, setDemonstrating] = useState(false)
  const scene = useRef(null)
  const [selectedFruit, setSelectedFruit] = useState(null)
  const [placement, setPlacement] = useState(null)
  const [greeting, setGreeting] = useState(0)
  const { speak, stopSpeaking, speaking, primeSpeech } = useSpeech()
  const complete = state.phase === 'complete', success = state.phase === 'celebrate'
  const dispatch = action => { const at = Date.now(); update(p => applyCollectionAction(p, id, action, at)) }
  const remaining = round.total - state.counts.reduce((a,b) => a+b, 0)
  const place = (fruit, target) => {
    const index = Number(target)
    if (success || complete || demonstrating || remaining <= 0 || !Number.isInteger(index) || index < 0 || index >= round.labels.length) return
    if (id === 'basket' && index !== fruit) return
    dispatch({type:'ADD',index}); setPlacement({index,key:Date.now()}); setSelectedFruit(null)
  }
  const drag = usePlayDrag({enabled:!success && !complete && !demonstrating && remaining > 0,scope:scene,onDrop:place})
  const issues = checkCollection(state)
  const firstIssue = issues.find(i => i.extra || i.missing)
  let message = selectedFruit !== null ? 'Now tap a basket or a plate.' : 'Drag a fruit to a place. Or tap the fruit, then a place.'
  if (state.feedback === 'empty') message = 'Choose something to put in the picnic first.'
  if (state.feedback === 'retry' && firstIssue) message = id === 'basket'
    ? firstIssue.missing ? `Look at the list for ${firstIssue.label}. Your basket needs ${firstIssue.missing} more.` : `There are ${firstIssue.extra} extra ${firstIssue.label}. Put some back.`
    : firstIssue.missing ? `${firstIssue.label} is still waiting for an apple.` : `${firstIssue.label} has more than one. Put the extra back for now.`
  if (success) message = id === 'basket' ? 'The basket matches our list. We are ready to go!' : 'Everyone has one. One apple is left in the basket!'
  if (complete) message = 'You noticed, checked and made it work. Let’s take that idea home.'
  if (demonstrating) message = 'The dotted pictures show what we need. Count each one with me, then try your own answer.'
  if (!success && !complete && !demonstrating && drag.ghost) message = drag.over !== null ? `Let go to place it ${id === 'basket' ? 'with' : 'for'} ${round.labels[Number(drag.over)]}.` : 'Move the fruit to a basket or plate.'
  else if (!success && !complete && !demonstrating && placement && state.feedback !== 'retry') message = id === 'basket' ? `${state.counts[placement.index]} ${round.labels[placement.index]} in the basket. Check the picture list.` : `${round.labels[placement.index]} has ${state.counts[placement.index]} ${state.counts[placement.index] === 1 ? 'apple' : 'apples'}. Does everyone have one?`
  useEffect(() => { if (!placement) return; const timer = setTimeout(() => setPlacement(null), 2600); return () => clearTimeout(timer) }, [placement])
  const spokenInstruction = complete ? `${config.idea} ${config.prompt}` : success || demonstrating || state.feedback === 'retry' || state.feedback === 'empty' ? message : `${round.instruction} ${id === 'basket' ? 'Look at the picture list. Drag an apple or a pear to its basket. You can tap the fruit, then its basket.' : 'Give each friend one apple. Drag an apple onto a plate. You can tap the apple, then a plate.'} When you are ready, tap Let's check together.`
  const reaction = success || complete ? 'celebrate' : demonstrating || drag.ghost ? 'point' : state.feedback === 'retry' ? 'think' : placement ? 'nod' : greeting ? 'wave' : 'idle'
  useEffect(() => { setDemonstrating(false); setSelectedFruit(null); setPlacement(null); drag.cancel(); stopSpeaking() }, [id, state.round, state.phase, stopSpeaking])
  const voice = useActivityNarration({ cue: `${id}-${state.round}-${state.phase}-${state.attempts}-${state.feedback}-${demonstrating}`, text: spokenInstruction, speak, stopSpeaking, primeSpeech })
  return <main className="collection-page">
    <header className="collection-header"><button onClick={onBack}>← My adventures</button><span>YAAGVI’S ADVENTURES</span><ActivityVoiceControls voice={voice} /></header>
    <section ref={scene} className={`collection-scene ${success ? 'collection-success' : ''}`}>
      <div className="collection-heading"><p>THE WILLOW CLEARING · {complete ? 'DISCOVERED' : `${state.round + 1} OF 2`}</p><h1>{complete ? config.title : round.title}</h1><p>{complete ? config.idea : round.instruction}</p></div>
      <aside className="collection-guide"><button aria-label="Say hello to Bumi" onClick={() => setGreeting(n => n + 1)}><YaagviCharacter size={115} attentionTarget={drag.ghost ? { x: drag.ghost.x, y: drag.ghost.y } : null} state={reaction} reactionKey={`${state.round}-${state.attempts}-${state.feedback}-${demonstrating}-${greeting}-${placement?.key}`} talking={speaking} /></button><p role="status" aria-live="polite">{message}</p></aside>
      {complete ? <div className="collection-complete"><span className="collection-seal" aria-hidden="true">✓</span><h2>A little idea for the real world</h2><p>{config.prompt}</p><p className="collection-small">{guest ? 'Your grown-up can see this discovery without an account.' : 'Your grown-up can find the first-visit recap in Parents \u2192 Weekly Story.'}</p><AdventureFinishChoices nextLabel={guest ? 'See our discovery \u2192' : id === 'basket' ? 'Next: Share the Snacks \u2192' : 'Next: Sound Pop \u2192'} onContinue={() => { stopSpeaking(); onNext() }} onFinish={() => { stopSpeaking(); onBack() }} onReplay={() => dispatch({ type: 'REPLAY' })} /></div> : <>
        {id === 'basket' && <div className="collection-list" aria-label="Our picnic list"><strong>OUR PICTURE LIST</strong>{round.labels.map((label, i) => <div key={label}><span>{round.targets[i]} {label}</span><span className="collection-fruits">{Array.from({length:round.targets[i]}, (_, j) => <Fruit key={j} pear={i === 1} />)}</span></div>)}</div>}
        {id === 'snacks' && <div className="collection-list"><strong>APPLES LEFT IN THE BASKET: {round.total - state.counts.reduce((a,b) => a+b, 0)}</strong><span className="collection-fruits">{Array.from({length:round.total - state.counts.reduce((a,b) => a+b, 0)}, (_, j) => <Fruit key={j}/>)}</span></div>}
        {!success && <div className="collection-pantry" aria-label="Fruit to take"><p>TAKE A FRUIT <span>Drag it, or tap then choose a place.</span></p><div>{(id === 'basket' ? [0,1] : [0]).map(fruit => <button key={fruit} className={`collection-drag-source ${selectedFruit === fruit ? 'selected' : ''}`} disabled={demonstrating || remaining <= 0} aria-pressed={selectedFruit === fruit} aria-label={`Take ${fruit ? 'a pear' : 'an apple'}`} {...drag.bind(fruit)} onClick={()=>setSelectedFruit(selectedFruit===fruit?null:fruit)}><Fruit pear={fruit===1}/><span>{fruit ? 'Pear' : 'Apple'}</span><b aria-hidden="true">&#8599;</b></button>)}</div></div>}
        <div className={`collection-stations ${id === 'snacks' ? 'sharing' : ''}`}>
          {round.labels.map((label, i) => <section key={label} className={`collection-station ${state.feedback === 'retry' && (issues[i].missing || issues[i].extra) ? 'needs-check' : ''}`} aria-label={id === 'basket' ? `${label} in our basket` : `${label}'s place`}
            data-play-drop={i} data-drop-active={drag.over === String(i) ? 'true' : undefined}>

            {id === 'snacks' && <Friend name={label} />}<h2>{label}</h2>
            <button type="button" disabled={success || demonstrating} onClick={()=>{if(selectedFruit!==null)place(selectedFruit,String(i));else if(state.counts[i]>0)dispatch({type:'REMOVE',index:i})}} className={`collection-answer ${placement?.index === i ? 'just-placed' : ''} ${demonstrating ? 'show-demo' : ''}`} aria-label={guest && !demonstrating ? `${selectedFruit!==null ? 'Add an apple to' : state.counts[i] ? 'Remove an apple from' : 'Give an apple to'} ${label}` : demonstrating ? `Example: ${round.targets[i]} ${label}` : `${state.counts[i]} placed`}>
              {(demonstrating ? Array.from({length:round.targets[i]}) : Array.from({length:state.counts[i]})).map((_, j) => <Fruit key={`${j}-${j===state.counts[i]-1?placement?.key:0}`} pear={id === 'basket' && i === 1} />)}
              {!demonstrating && state.counts[i] === 0 && <span>Put here</span>}
            </button>
            {!success && <div className="collection-controls"><button aria-label={`Remove one from ${label}`} disabled={demonstrating || !state.counts[i]} onClick={() => dispatch({type:'REMOVE',index:i})}>−</button><span>{state.counts[i]}</span><button aria-label={`Add one to ${label}`} disabled={demonstrating || state.counts.reduce((a,b) => a+b,0) >= round.total} onClick={() => dispatch({type:'ADD',index:i})}>+</button></div>}
          </section>)}
        </div>
        <div className="collection-actions">{success ? <button className="collection-primary" onClick={() => dispatch({type:'NEXT'})}>{state.round === 0 ? 'Try a new arrangement →' : 'Take the idea home →'}</button> : demonstrating ? <button className="collection-primary" onClick={() => setDemonstrating(false)}>Now I’ll try</button> : <><button className="collection-primary" onClick={() => dispatch({type:'SUBMIT'})}>Let’s check together ✓</button><button className="collection-secondary" onClick={() => { dispatch({type:'HELP'}); setDemonstrating(true) }}>Show me how</button></>}</div>
      </>}
      <footer>{guest ? 'Take your time. This sample stays in this browser.' : 'Your adventure belongs to this child profile.'}</footer>
    </section>
    {drag.ghost && <div className="collection-drag-ghost" style={{left:drag.ghost.x,top:drag.ghost.y}}><Fruit pear={drag.ghost.payload===1}/></div>}
  </main>
}
