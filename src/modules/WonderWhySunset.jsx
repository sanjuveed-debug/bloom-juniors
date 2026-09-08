import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech.js'
import { trackEvent } from '../utils/analytics.js'
import {
  completeWonderDiscovery,
  normalizeWonderWhy,
  SUNSET_RED_ID,
} from '../utils/wonderWhy.js'

const PREDICTIONS = [
  { id: 'cooler', label: 'The Sun becomes cooler', symbol: '🌡️' },
  { id: 'air', label: 'Sunlight travels through more air', symbol: '↗' },
  { id: 'painted', label: 'Clouds paint the Sun orange', symbol: '🎨' },
]

const PATHS = [
  { id: 'noon', label: 'High Sun', distance: 'Short air path', colour: '#f8cf42' },
  { id: 'sunset', label: 'Low Sun', distance: 'Long air path', colour: '#ef6a32' },
]

const STEP_COPY = [
  'Why does the Sun look red or orange at sunset? Make your prediction.',
  'The Sun itself has not changed colour. At sunset, its light travels through much more air before reaching us.',
  'Compare the short path at noon with the long path at sunset.',
  'Air scatters more blue light away from the long path. More red and orange light continues to our eyes, so the low Sun looks warmer.',
  'Your sunset discovery is saved. Watch the sky safely as the Sun gets low, but never stare directly at the Sun.',
]

function SpeakerButton({ speaking, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={speaking ? 'Narration is playing' : 'Hear this page'} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white/70 bg-[#642710] text-xl text-white shadow-lg">
      {speaking ? 'Ⅱ' : '🔊'}
    </button>
  )
}

export default function WonderWhySunset({
  profileName = 'Explorer',
  progress = {},
  onUpdateProgress,
  onAddStars,
  onBack,
}) {
  const saved = normalizeWonderWhy(progress.wonderWhy).discoveries[SUNSET_RED_ID]
  const [step, setStep] = useState(saved ? 4 : 0)
  const [prediction, setPrediction] = useState(saved?.prediction || '')
  const [tested, setTested] = useState(saved?.testedColours || [])
  const [activePath, setActivePath] = useState('')
  const { speak, speaking } = useSpeech()
  const active = useMemo(() => PATHS.find(path => path.id === activePath), [activePath])
  const testedAll = PATHS.every(path => tested.includes(path.id))

  const moveTo = nextStep => {
    setStep(nextStep)
    speak(STEP_COPY[nextStep])
  }

  const choosePrediction = id => {
    setPrediction(id)
    speak(id === 'air'
      ? 'Good thinking. Let’s compare how far sunlight travels through the air.'
      : 'That is a thoughtful prediction. Let’s investigate.')
    trackEvent('wonder_why_prediction', { lesson_id: SUNSET_RED_ID, prediction: id })
  }

  const testPath = path => {
    setTested(current => [...new Set([...current, path.id])])
    setActivePath(path.id)
    speak(path.id === 'sunset'
      ? 'The low Sun has a long path through the air. Much more blue light scatters away.'
      : 'The high Sun has a shorter path through the air, so more colours arrive together.')
    trackEvent('wonder_why_path_test', { lesson_id: SUNSET_RED_ID, path: path.id })
  }

  const complete = () => {
    const result = completeWonderDiscovery(progress.wonderWhy, SUNSET_RED_ID, {
      prediction,
      testedColours: tested,
      familyPrompt: 'How does the sky change from five minutes before sunset to five minutes after?',
    })
    onUpdateProgress?.({ wonderWhy: result.state })
    if (result.firstCompletion) {
      onAddStars?.('wonderwhy', 3, {
        total: 1,
        correct: 1,
        struggles: [],
        stayOnModule: true,
      })
    }
    trackEvent('wonder_why_complete', {
      lesson_id: SUNSET_RED_ID,
      first_completion: result.firstCompletion,
      prediction,
    })
    setStep(4)
    speak(`${profileName}, your sunset discovery is saved in your Wonder Book.`)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fff5e9] text-[#4a210f]" data-testid="wonder-why-sunset">
      <header className="sticky top-0 z-20 border-b border-[#efc39f] bg-[#fff5e9]/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button type="button" onClick={onBack} aria-label="Back to dashboard" className="grid h-11 w-11 place-items-center rounded-full bg-white text-2xl font-black shadow-sm">←</button>
          <div className="min-w-0 text-center">
            <p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-[#c94f22]">Discovery {Math.min(step + 1, 5)} of 5</p>
            <h1 className="font-bubble text-2xl leading-none">{step === 4 && saved ? 'Your Wonder Book' : 'Wonder Why'}</h1>
          </div>
          <SpeakerButton speaking={speaking} onClick={() => speak(STEP_COPY[step])} />
        </div>
        <div className="mx-auto mt-3 flex max-w-sm gap-1" aria-label={`Step ${step + 1} of 5`}>
          {STEP_COPY.map((_, index) => <span key={index} className="h-1.5 flex-1 rounded-full" style={{ background: index <= step ? '#ef6a32' : '#ead1bd' }} />)}
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-105px)] max-w-5xl items-center px-3 py-5 sm:px-5">
        <AnimatePresence mode="wait">
          <motion.section key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="w-full">
            {step === 0 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#c94f22]">Make a prediction</p>
                <h2 className="mt-2 font-bubble text-4xl leading-tight sm:text-5xl">Why does the Sun look orange at sunset?</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {PREDICTIONS.map(option => (
                    <button key={option.id} type="button" onClick={() => choosePrediction(option.id)} className="min-h-32 rounded-lg border-2 bg-white p-4 text-center shadow-sm" style={{ borderColor: prediction === option.id ? '#df5928' : '#ead0bb' }}>
                      <span className="block text-4xl">{option.symbol}</span>
                      <span className="mt-2 block font-round text-base font-black">{option.label}</span>
                    </button>
                  ))}
                </div>
                <button type="button" disabled={!prediction} onClick={() => moveTo(1)} className="mt-6 min-h-12 rounded-lg bg-[#c94f22] px-7 font-round font-black text-white disabled:opacity-40">Watch the light →</button>
              </div>
            )}

            {step === 1 && (
              <div className="grid items-center gap-5 md:grid-cols-[1.2fr_.8fr]">
                <img src="https://bloom-juniors.pages.dev/wonder-sunset-20260726.png" alt="Sunset light travelling through the atmosphere while blue light scatters away" className="aspect-video w-full rounded-lg object-cover shadow-xl" />
                <div>
                  <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#c94f22]">Observe</p>
                  <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl">The light takes a longer journey</h2>
                  <p className="mt-3 font-round text-lg font-bold leading-relaxed text-[#744b38]">When the Sun is low, its light crosses much more of our atmosphere before reaching your eyes.</p>
                  <button type="button" onClick={() => moveTo(2)} className="mt-5 min-h-12 rounded-lg bg-[#c94f22] px-6 font-round font-black text-white">Compare the paths →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#c94f22]">Path experiment</p>
                <h2 className="mt-2 font-bubble text-3xl sm:text-4xl">Tap both Sun positions</h2>
                <div className="mt-5 overflow-hidden rounded-lg bg-[#143f78] p-4 shadow-xl">
                  <div className="relative h-52 overflow-hidden rounded-lg bg-[linear-gradient(#2e88d1,#f6b95d)]">
                    <span className="absolute bottom-0 left-0 right-0 h-12 bg-[#4f6c3e]" />
                    {active && (
                      <>
                        <motion.span initial={{ scale: .5 }} animate={{ scale: 1 }} className="absolute grid h-16 w-16 place-items-center rounded-full bg-[#ffd85c] text-3xl shadow-[0_0_28px_#ffd85c]" style={active.id === 'noon' ? { top: 20, left: '45%' } : { bottom: 30, left: 24 }}>☀</motion.span>
                        <motion.span initial={{ width: 0 }} animate={{ width: active.id === 'noon' ? '38%' : '72%' }} className="absolute right-8 top-1/2 h-2 origin-right rounded-full" style={{ background: active.colour }} />
                      </>
                    )}
                    <span className="absolute right-3 top-[43%] text-4xl">👁️</span>
                  </div>
                  {active && <p className="mt-3 font-round text-base font-black text-white">{active.distance}: {active.id === 'sunset' ? 'more blue scatters away' : 'more colours stay together'}</p>}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {PATHS.map(path => (
                    <button key={path.id} type="button" onClick={() => testPath(path)} className="min-h-14 rounded-lg border-2 bg-white font-round font-black shadow-sm" style={{ borderColor: tested.includes(path.id) ? path.colour : '#dec7b4', color: path.colour }}>{path.label}</button>
                  ))}
                </div>
                <button type="button" disabled={!testedAll} onClick={() => moveTo(3)} className="mt-6 min-h-12 rounded-lg bg-[#c94f22] px-7 font-round font-black text-white disabled:opacity-40">I compared both →</button>
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto grid max-w-4xl items-center gap-6 md:grid-cols-[.8fr_1.2fr]">
                <div className="rounded-lg bg-[#173f78] p-6 text-center text-white shadow-xl">
                  <div className="text-7xl">🌅</div>
                  <p className="mt-3 font-bubble text-3xl">A longer path</p>
                  <p className="mt-2 font-round text-sm font-bold text-white/75">Blue scatters away; warm colours continue</p>
                </div>
                <div>
                  <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#c94f22]">The foundation idea</p>
                  <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl">Air spreads blue light around</h2>
                  <p className="mt-3 font-round text-lg font-bold leading-relaxed text-[#744b38]">At sunset, sunlight travels through more air. More blue light scatters away from the direct path, while more red and orange light continues toward our eyes.</p>
                  <button type="button" onClick={complete} className="mt-5 min-h-12 rounded-lg bg-[#c94f22] px-6 font-round font-black text-white">Save my discovery</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#c94f22]">Discovery saved</p>
                <h2 className="mt-2 font-bubble text-4xl leading-tight sm:text-5xl">Why sunsets look warm</h2>
                <img src="https://bloom-juniors.pages.dev/wonder-sunset-20260726.png" alt="The completed sunset light discovery" className="mx-auto mt-5 aspect-video w-full max-w-xl rounded-lg object-cover shadow-xl" />
                <p className="mx-auto mt-5 max-w-2xl font-round text-lg font-bold leading-relaxed text-[#744b38]">A long trip through the air scatters more blue light away. More red and orange light reaches our eyes.</p>
                <div className="mx-auto mt-5 max-w-2xl rounded-lg border-2 border-[#e6a72e] bg-[#fff6d8] p-4 text-left">
                  <p className="font-round text-xs font-black uppercase tracking-[.14em] text-[#865d00]">Try it in real life</p>
                  <p className="mt-1 font-round text-base font-black text-[#5c3d16]">Watch the colours in the sky change as the Sun gets low. Never stare directly at the Sun.</p>
                  <p className="mt-3 border-t border-[#dfc978] pt-3 font-round text-sm font-bold text-[#6d541e]">Grown-up question: How does the sky change from five minutes before sunset to five minutes after?</p>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => moveTo(2)} className="min-h-12 rounded-lg border-2 border-[#c94f22] bg-white px-5 font-round font-black text-[#c94f22]">Compare again</button>
                  <button type="button" onClick={onBack} className="min-h-12 rounded-lg bg-[#c94f22] px-6 font-round font-black text-white">Back to Bloom</button>
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  )
}
