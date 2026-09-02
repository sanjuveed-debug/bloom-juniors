import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech.js'
import { trackEvent } from '../utils/analytics.js'
import {
  LEAVES_GREEN_ID,
  completeWonderWhyDiscovery,
  normalizeWonderWhy,
} from '../utils/wonderWhy.js'

const PREDICTIONS = [
  { id: 'painted', label: 'The leaf is painted green', symbol: '🎨' },
  { id: 'reflects', label: 'Green light bounces from it', symbol: '↗' },
  { id: 'makes', label: 'The leaf makes green light', symbol: '✨' },
]

const COLOURS = [
  { id: 'red', label: 'Red', colour: '#ef4444', result: 'absorbed' },
  { id: 'blue', label: 'Blue', colour: '#2563eb', result: 'absorbed' },
  { id: 'green', label: 'Green', colour: '#22c55e', result: 'reflected' },
]

const STEP_COPY = [
  'Here is today’s wonder. Why do most leaves look green? What do you predict?',
  'Look closely. White sunlight carries many colours into the leaf.',
  'Test each colour of light. Which colour comes back toward our eyes?',
  'Leaves contain chlorophyll. It absorbs lots of red and blue light, but reflects more green light. That reflected green light reaches our eyes.',
  'Discovery complete. Be a leaf detective away from the screen and look for all the colours a leaf can hold.',
]

function SpeakerButton({ speaking, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={speaking ? 'Narration is playing' : 'Hear this page'}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white/70 bg-[#173b2b] text-xl text-white shadow-lg"
    >
      {speaking ? 'Ⅱ' : '🔊'}
    </button>
  )
}

export default function WonderWhyLeaves({
  profileName = 'Explorer',
  progress = {},
  onUpdateProgress,
  onAddStars,
  onBack,
}) {
  const saved = normalizeWonderWhy(progress.wonderWhy).discoveries[LEAVES_GREEN_ID]
  const [step, setStep] = useState(saved ? 4 : 0)
  const [prediction, setPrediction] = useState(saved?.prediction || '')
  const [tested, setTested] = useState(saved?.testedColours || [])
  const [activeColour, setActiveColour] = useState('')
  const { speak, speaking } = useSpeech()

  const testedAll = COLOURS.every(colour => tested.includes(colour.id))
  const active = useMemo(() => COLOURS.find(colour => colour.id === activeColour), [activeColour])

  const moveTo = nextStep => {
    setStep(nextStep)
    speak(STEP_COPY[nextStep])
  }

  const choosePrediction = id => {
    setPrediction(id)
    speak(id === 'reflects'
      ? 'Good thinking. Let’s investigate whether green light bounces back.'
      : 'That is a thoughtful prediction. Let’s investigate.')
    trackEvent('wonder_why_prediction', { lesson_id: LEAVES_GREEN_ID, prediction: id })
  }

  const testColour = colour => {
    const next = [...new Set([...tested, colour.id])]
    setTested(next)
    setActiveColour(colour.id)
    speak(colour.result === 'reflected'
      ? 'Green light is reflected. It bounces back toward our eyes!'
      : `${colour.label} light is mostly absorbed by the chlorophyll.`)
    trackEvent('wonder_why_light_test', { lesson_id: LEAVES_GREEN_ID, colour: colour.id })
  }

  const complete = () => {
    const result = completeWonderWhyDiscovery(progress.wonderWhy, {
      prediction,
      testedColours: tested,
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
      lesson_id: LEAVES_GREEN_ID,
      first_completion: result.firstCompletion,
      prediction,
    })
    setStep(4)
    speak(`${profileName}, your discovery is saved in your Wonder Book.`)
  }

  const title = step === 4 && saved ? 'Your Wonder Book' : 'Wonder Why'

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eaf8ef] text-[#173b2b]" data-testid="wonder-why-lesson">
      <header className="sticky top-0 z-20 border-b border-[#b9dbc6] bg-[#eaf8ef]/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to dashboard"
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-2xl font-black shadow-sm"
          >
            ←
          </button>
          <div className="min-w-0 text-center">
            <p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-[#167a4a]">
              Discovery {Math.min(step + 1, 5)} of 5
            </p>
            <h1 className="font-bubble text-2xl leading-none">{title}</h1>
          </div>
          <SpeakerButton speaking={speaking} onClick={() => speak(STEP_COPY[step])} />
        </div>
        <div className="mx-auto mt-3 flex max-w-sm gap-1" aria-label={`Step ${step + 1} of 5`}>
          {STEP_COPY.map((_, index) => (
            <span
              key={index}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: index <= step ? '#22a568' : '#c9dfd1' }}
            />
          ))}
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-105px)] max-w-5xl items-center px-3 py-5 sm:px-5">
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            className="w-full"
          >
            {step === 0 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#167a4a]">Make a prediction</p>
                <h2 className="mt-2 font-bubble text-4xl leading-tight sm:text-5xl">Why do most leaves look green?</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {PREDICTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => choosePrediction(option.id)}
                      className="min-h-32 rounded-lg border-2 bg-white p-4 text-center shadow-sm"
                      style={{ borderColor: prediction === option.id ? '#15945a' : '#c7dfd0' }}
                    >
                      <span className="block text-4xl">{option.symbol}</span>
                      <span className="mt-2 block font-round text-base font-black">{option.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!prediction}
                  onClick={() => moveTo(1)}
                  className="mt-6 min-h-12 rounded-lg bg-[#167a4a] px-7 font-round font-black text-white disabled:opacity-40"
                >
                  Look closer →
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="grid items-center gap-5 md:grid-cols-[1.2fr_.8fr]">
                <img
                  src="https://bloom-juniors.pages.dev/wonder-leaf-20260726.png"
                  alt="Sunlight entering a leaf while green light reflects toward a child"
                  className="aspect-video w-full rounded-lg object-cover shadow-xl"
                />
                <div>
                  <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#167a4a]">Observe</p>
                  <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl">Sunlight carries many colours</h2>
                  <p className="mt-3 font-round text-lg font-bold leading-relaxed text-[#426454]">
                    The leaf does not paint sunlight green. Something inside the leaf changes which colours reach our eyes.
                  </p>
                  <button type="button" onClick={() => moveTo(2)} className="mt-5 min-h-12 rounded-lg bg-[#167a4a] px-6 font-round font-black text-white">
                    Test the light →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#167a4a]">Light experiment</p>
                <h2 className="mt-2 font-bubble text-3xl sm:text-4xl">Tap each colour</h2>
                <div className="relative mx-auto mt-5 aspect-[16/9] max-w-2xl overflow-hidden rounded-lg bg-[#dff4df] shadow-lg">
                  <img src="https://bloom-juniors.pages.dev/wonder-leaf-20260726.png" alt="" className="h-full w-full object-cover" />
                  {active && (
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, scale: .8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 px-4 py-3 font-round text-base font-black shadow-lg"
                      style={{ color: active.colour }}
                    >
                      {active.result === 'reflected'
                        ? 'Green is reflected back toward our eyes!'
                        : `${active.label} is mostly absorbed inside the leaf.`}
                    </motion.div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {COLOURS.map(colour => (
                    <button
                      key={colour.id}
                      type="button"
                      onClick={() => testColour(colour)}
                      className="min-h-14 rounded-lg border-2 bg-white font-round font-black shadow-sm"
                      style={{ borderColor: tested.includes(colour.id) ? colour.colour : '#bfd4c7', color: colour.colour }}
                    >
                      <span className="mr-2 inline-block h-4 w-4 rounded-full align-middle" style={{ background: colour.colour }} />
                      {colour.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!testedAll}
                  onClick={() => moveTo(3)}
                  className="mt-6 min-h-12 rounded-lg bg-[#167a4a] px-7 font-round font-black text-white disabled:opacity-40"
                >
                  I tested them all →
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto grid max-w-4xl items-center gap-6 md:grid-cols-[.8fr_1.2fr]">
                <div className="rounded-lg bg-[#173b2b] p-6 text-center text-white shadow-xl">
                  <div className="text-7xl">🌿</div>
                  <p className="mt-3 font-bubble text-3xl">Chlorophyll</p>
                  <p className="mt-2 font-round text-sm font-bold text-white/75">The green helper inside leaves</p>
                </div>
                <div>
                  <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#167a4a]">The foundation idea</p>
                  <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl">Green light bounces to our eyes</h2>
                  <p className="mt-3 font-round text-lg font-bold leading-relaxed text-[#426454]">
                    Chlorophyll helps plants capture sunlight to make food. It absorbs lots of red and blue light, but reflects more green light. That reflected green light is what we see.
                  </p>
                  <button type="button" onClick={complete} className="mt-5 min-h-12 rounded-lg bg-[#167a4a] px-6 font-round font-black text-white">
                    Save my discovery
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-sm font-black uppercase tracking-[.16em] text-[#167a4a]">Discovery saved</p>
                <h2 className="mt-2 font-bubble text-4xl leading-tight sm:text-5xl">Why leaves look green</h2>
                <img src="https://bloom-juniors.pages.dev/wonder-leaf-20260726.png" alt="The completed green leaf discovery" className="mx-auto mt-5 aspect-video w-full max-w-xl rounded-lg object-cover shadow-xl" />
                <p className="mx-auto mt-5 max-w-2xl font-round text-lg font-bold leading-relaxed text-[#426454]">
                  Chlorophyll absorbs lots of red and blue light. More green light reflects from the leaf and reaches our eyes.
                </p>
                <div className="mx-auto mt-5 max-w-2xl rounded-lg border-2 border-[#e2b62f] bg-[#fff9d9] p-4 text-left">
                  <p className="font-round text-xs font-black uppercase tracking-[.14em] text-[#815f00]">Try it in real life</p>
                  <p className="mt-1 font-round text-base font-black text-[#554315]">
                    Find two leaves. Are they exactly the same green? Look at the front, back, veins, and edges.
                  </p>
                  <p className="mt-3 border-t border-[#dccb77] pt-3 font-round text-sm font-bold text-[#6b591f]">
                    Grown-up question: What other colours can you spot in leaves near home?
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => moveTo(2)} className="min-h-12 rounded-lg border-2 border-[#167a4a] bg-white px-5 font-round font-black text-[#167a4a]">
                    Try light again
                  </button>
                  <button type="button" onClick={onBack} className="min-h-12 rounded-lg bg-[#167a4a] px-6 font-round font-black text-white">
                    Back to Bloom
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  )
}
