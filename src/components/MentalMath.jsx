import { useState } from 'react'

const rounds = [
  { a: 2, b: 1 }, { a: 3, b: 2 }, { a: 4, b: 1 },
  { a: 5, b: 2 }, { a: 6, b: 3 },
]

export default function MentalMath({ onComplete }) {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState('look')
  const [firstTry, setFirstTry] = useState(0)
  const [missed, setMissed] = useState(false)
  const round = rounds[step]
  const answer = round.a + round.b

  function pick(value) {
    if (phase !== 'think') return
    if (value === answer) {
      const correct = firstTry + (missed ? 0 : 1)
      setFirstTry(correct)
      setPhase('explain')
      if (step === rounds.length - 1) onComplete(correct, rounds.length)
    } else setMissed(true)
  }

  return <section className="mx-auto max-w-md px-5 text-center font-round" aria-label="Mental maths activity">
    <p className="text-sm font-bold text-amber-700">Thinking with numbers · {step + 1} of {rounds.length}</p>
    <h1 className="font-bubble text-3xl mt-3 text-slate-800">How many altogether?</h1>
    <p className="mt-2 text-slate-600">Look at the groups. Hide them when you are ready, then work it out in your head.</p>
    <div className="rounded-3xl bg-white shadow-md p-6 my-5 min-h-44 flex flex-col justify-center" aria-live="polite">
      {phase === 'look' || phase === 'explain' ? <>
        <div className="flex justify-center gap-5 text-3xl" aria-label={`${round.a} blue dots and ${round.b} orange dots`}>
          <span className="flex flex-wrap justify-center max-w-32 gap-1" aria-hidden="true">{Array.from({ length: round.a }, (_, i) => <span key={i} className="text-blue-500">●</span>)}</span>
          <span className="text-slate-400" aria-hidden="true">+</span>
          <span className="flex flex-wrap justify-center max-w-32 gap-1" aria-hidden="true">{Array.from({ length: round.b }, (_, i) => <span key={i} className="text-orange-500">●</span>)}</span>
        </div>
        <p className="mt-4 text-xl font-bold">{round.a} + {round.b}{phase === 'explain' ? ` = ${answer}` : ' = ?'}</p>
      </> : <p className="text-3xl font-bold">{round.a} + {round.b} = ?</p>}
    </div>
    {phase === 'look' && <button className="bubble-btn px-6 py-3" onClick={() => setPhase('think')}>Hide the dots</button>}
    {phase === 'think' && <>
      <div className="grid grid-cols-3 gap-3" aria-label="Choose an answer">
        {[answer - 1, answer + 1, answer].map(value =>
          <button key={value} className="rounded-2xl bg-white border-2 border-amber-300 py-4 text-2xl font-bold text-slate-800" onClick={() => pick(value)}>{value}</button>)}
      </div>
      {missed && <p role="status" className="mt-4 text-slate-700">Good try. You can look again, then have another go.</p>}
      <button className="mt-4 underline text-slate-700" onClick={() => setPhase('look')}>Show the dots again</button>
    </>}
    {phase === 'explain' && <>
      <p role="status" className="text-slate-700">{round.a} and {round.b} make {answer}. You can picture the two groups joining.</p>
      {step < rounds.length - 1 ? <button className="bubble-btn px-6 py-3 mt-5" onClick={() => { setStep(step + 1); setMissed(false); setPhase('look') }}>Next idea</button>
        : <p className="mt-5 text-slate-700">Try it together: put a few small objects in two hands. Hide them and ask how many there are altogether.</p>}
    </>}
  </section>
}
