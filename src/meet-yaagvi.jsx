import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import YaagviCharacter from './components/YaagviCharacter'
import './index.css'
import './meet-yaagvi.css'

const QUESTIONS = [
  { count: 3, item: 'apple', icon: '🍎', options: [2,3,4], prompt: 'How many apples can you count?' },
  { count: 4, item: 'star', icon: '⭐', options: [4,2,5], prompt: 'How many stars are shining?' },
  { count: 5, item: 'flower', icon: '🌼', options: [3,6,5], prompt: 'How many flowers are growing?' },
]
function MeetYaagvi() {
  const [step, setStep] = useState(-1)
  const [reaction, setReaction] = useState({ state: 'wave', id: 0 })
  const [message, setMessage] = useState('Hello! I am Yaagvi. Let’s discover something together.')
  const [solved, setSolved] = useState(false)
  const [counted, setCounted] = useState([])
  const react = state => setReaction(previous => ({ state, id: previous.id + 1 }))
  const question = QUESTIONS[step]
  const start = () => { setStep(0); setSolved(false); setCounted([]); setMessage('Touch each apple as you count.'); react('wave') }
  const answer = value => {
    if (solved) return
    if (value === question.count) { setSolved(true); setMessage(`Yes, ${value}! You counted every ${question.item}.`); react('clap') }
    else { setMessage('Let’s count slowly. Touch each one, then try again.'); react('think') }
  }
  const next = () => {
    setStep(step + 1); setSolved(false); setCounted([])
    if (step === QUESTIONS.length - 1) { setMessage('You did it! Now find five things to count in your room.'); react('celebrate') }
    else { setMessage('A new discovery! What can you count?'); react('wave') }
  }
  return <main className="meet-page">
    <header className="meet-header"><a href="/" aria-label="Bloom Juniors home">🌷 BLOOM JUNIORS</a><span>A little adventure • Ages 4–6</span></header>
    <section className="meet-card">
      <div className="meet-companion"><div className="meet-mascot"><YaagviCharacter key={reaction.id} state={reaction.state} size="100%"/></div><p className="meet-message" role="status">{message}</p></div>
      <div className="meet-activity">
        {step < 0 ? <><p className="meet-eyebrow">SMALL DISCOVERIES. BIG SMILES.</p><h1>A friend for every little “I did it!”</h1><p>Count, try again and celebrate with Yaagvi. Start a short adventure together.</p><button className="meet-primary" onClick={start}>Let’s play together →</button><p className="meet-note">No account needed. No timer. Take your time.</p><div className="meet-gestures" aria-label="Meet Yaagvi"><button onClick={()=>{react('wave');setMessage('Hello, explorer!')}}>👋 Say hello</button><button onClick={()=>{react('think');setMessage('Hmm… what could we discover?')}}>💭 Think together</button><button onClick={()=>{react('clap');setMessage('A little cheer for trying!')}}>👏 A little cheer</button><button onClick={()=>{react('celebrate');setMessage('Let’s celebrate a discovery!')}}>✨ Celebrate</button></div></>
        : question ? <><p className="meet-eyebrow">DISCOVERY {step + 1} OF 3</p><h1>{question.prompt}</h1><p>Tap each one to keep your place.</p><div className="meet-objects">{Array.from({length:question.count},(_,index)=><button key={index} aria-label={`${question.item} ${index+1}`} aria-pressed={counted.includes(index)} onClick={()=>setCounted(previous=>previous.includes(index)?previous:[...previous,index])}>{question.icon}{counted.includes(index)&&<small>{counted.indexOf(index)+1}</small>}</button>)}</div><div className="meet-answers" aria-label="Choose how many">{question.options.map(value=><button key={value} disabled={solved} onClick={()=>answer(value)}>{value}</button>)}</div>{solved && <button className="meet-primary" onClick={next}>{step === 2 ? 'Finish our adventure' : 'Next discovery →'}</button>}</>
        : <><p className="meet-eyebrow">A DISCOVERY TO KEEP</p><h1>Look what you can do.</h1><p>You explored groups of three, four and five. Now take your counting into the real world.</p><div className="meet-parent"><strong>Try together</strong><p>“Can you find five things in this room? What happens if we take one away?”</p></div><a className="meet-primary" href="/">Explore Bloom Juniors →</a><button className="meet-again" onClick={start}>Play again</button><p className="meet-note">This short demo does not save learning progress.</p></>}
      </div>
    </section>
    <footer>Made for curious children and the grown-ups beside them. <a href="/privacy">Privacy</a></footer>
  </main>
}
createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user"><MeetYaagvi/></MotionConfig>)
