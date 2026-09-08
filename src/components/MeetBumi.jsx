import { useState } from 'react'
import BumiCharacter from './BumiCharacter'

export default function MeetBumi() {
  const [reaction, setReaction] = useState({ state: 'wave', id: 0 })
  return <section className="meet-bumi" aria-label="Meet Bumi and Yaagvi">
    <BumiCharacter reactionKey={reaction.id} state={reaction.state} size={130}/>
    <div><h3>Meet Bumi</h3><p>Bumi is your child’s learning companion. Yaagvi is the explorer at the heart of our stories.</p><p>Bloom began with a dad inspired by his daughter Yaagvi’s curiosity.</p></div>
    <div className="meet-bumi-actions">{[['wave', 'Wave'], ['think', 'Think'], ['celebrate', 'Celebrate']].map(([state, label]) => <button key={state} onClick={() => setReaction(previous => ({ state, id: previous.id + 1 }))}>{label}</button>)}</div>
  </section>
}
