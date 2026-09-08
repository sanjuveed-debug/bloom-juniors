import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech.js'
import { trackEvent } from '../utils/analytics.js'
import { normalizeFoundationProfile } from '../utils/foundationProfile.js'
import {
  completeWonderDiscovery,
  normalizeWonderWhy,
} from '../utils/wonderWhy.js'

function SpeakerButton({ speaking, onClick, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={speaking ? 'Narration is playing' : 'Hear this page'}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white/70 text-xl text-white shadow-lg"
      style={{ background: accent }}
    >
      {speaking ? 'Ⅱ' : '🔊'}
    </button>
  )
}

export default function FoundationAdventure({
  lesson,
  ageGroup = 'early',
  profileName = 'Explorer',
  progress = {},
  onUpdateProgress,
  onAddStars,
  onBack,
}) {
  const saved = normalizeWonderWhy(progress.wonderWhy).discoveries[lesson.id]
  const profile = normalizeFoundationProfile(progress.foundationProfile)
  const [step, setStep] = useState(saved ? 4 : 0)
  const [prediction, setPrediction] = useState(saved?.prediction || '')
  const [tested, setTested] = useState(saved?.testedColours || [])
  const [finished, setFinished] = useState(Boolean(saved))
  const { speak, speaking } = useSpeech()

  const rootsContext = useMemo(() => {
    const details = [...profile.roots, ...profile.languages].slice(0, 2)
    return details.length ? `Your family profile includes ${details.join(' and ')}.` : ''
  }, [profile.languages, profile.roots])

  const narration = [
    `${lesson.question} What do you predict?`,
    lesson.story,
    `${lesson.activityPrompt}. Tap each clue and think about how it connects.`,
    lesson.explanation,
    `${profileName}, your discovery is saved. Away from the screen: ${lesson.offline}`,
  ]

  const moveTo = nextStep => {
    setStep(nextStep)
    speak(narration[nextStep])
  }

  const choosePrediction = option => {
    setPrediction(option.id)
    speak('That is a thoughtful prediction. Let us investigate.')
    trackEvent('foundation_adventure_prediction', {
      lesson_id: lesson.id,
      prediction: option.id,
    })
  }

  const testClue = clue => {
    setTested(current => [...new Set([...current, clue.id])])
    speak(`${clue.label}. Keep looking for the connection.`)
    trackEvent('foundation_adventure_clue', {
      lesson_id: lesson.id,
      clue: clue.id,
    })
  }

  const complete = () => {
    const result = completeWonderDiscovery(progress.wonderWhy, lesson.id, {
      prediction,
      testedColours: tested,
      familyPrompt: lesson.parentQuestion,
    })
    onUpdateProgress?.({ wonderWhy: result.state })
    if (result.firstCompletion) {
      onAddStars?.('wonderwhy', 3, {
        total: 1,
        correct: 1,
        struggles: [],
        stayOnModule: true,
        foundationStrands: lesson.strands,
        foundationArcs: lesson.arcs,
        foundationLessonId: lesson.id,
      })
    }
    trackEvent('foundation_adventure_complete', {
      lesson_id: lesson.id,
      first_completion: result.firstCompletion,
      strands: lesson.strands.join(','),
    })
    if (result.firstCompletion && lesson.familyMission) {
      trackEvent('foundation_season_family_mission_complete', {
        lesson_id: lesson.id,
      })
    }
    if (result.firstCompletion && result.state.seasonArtifact) {
      trackEvent('foundation_season_complete', {
        artifact_id: result.state.seasonArtifact.id,
      })
    }
    setFinished(true)
    setStep(4)
    speak(`${profileName}, your discovery is saved in your Wonder Book.`)
  }

  const allCluesFound = lesson.clues.every(clue => tested.includes(clue.id))
  const isToddler = ageGroup === 'toddler'
  const isJunior = ageGroup === 'junior'
  const stageCopy = isToddler
    ? ['Look and guess', 'Story time', 'Tap and find', 'What we found', 'Try it together']
    : isJunior
      ? ['Test a claim', 'Evidence briefing', 'Inspect the evidence', 'Build the explanation', 'Field investigation']
      : ['Make a prediction', 'A short story', 'Connect the clues', 'The foundation idea', 'Try it together']

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: lesson.surface, color: '#30243a' }}
      data-testid="foundation-adventure"
    >
      <header className="sticky top-0 z-20 border-b bg-white/90 px-3 py-3 backdrop-blur" style={{ borderColor: `${lesson.accent}40` }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button type="button" onClick={onBack} aria-label="Back to dashboard" className="grid h-11 w-11 place-items-center rounded-full bg-white text-2xl font-black shadow-sm">
            ←
          </button>
          <div className="min-w-0 text-center">
            <p className="font-round text-[10px] font-black uppercase tracking-[.18em]" style={{ color: lesson.accent }}>
              {lesson.modeLabel || 'Foundation adventure'} · {Math.min(step + 1, 5)} of 5
            </p>
            <h1 className="font-bubble text-xl leading-none sm:text-2xl">{finished ? 'Discovery saved' : 'Wonder, test, connect'}</h1>
          </div>
          <SpeakerButton speaking={speaking} onClick={() => speak(narration[step])} accent={lesson.accent} />
        </div>
        <div className="mx-auto mt-3 flex max-w-sm gap-1" aria-label={`Step ${step + 1} of 5`}>
          {narration.map((_, index) => (
            <span
              key={index}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: index <= step ? lesson.accent : '#ddd5e2' }}
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
                <p className="font-round text-sm font-black uppercase tracking-[.16em]" style={{ color: lesson.accent }}>{stageCopy[0]}</p>
                <div className="mt-2 text-6xl" aria-hidden="true">{lesson.visual}</div>
                <h2 className="mt-2 font-bubble text-4xl leading-tight sm:text-5xl">{lesson.question}</h2>
                {rootsContext && <p className="mt-2 font-round text-sm font-bold text-[#74647d]">{rootsContext}</p>}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {lesson.predictions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => choosePrediction(option)}
                      className="min-h-32 rounded-lg border-2 bg-white p-4 text-center shadow-sm"
                      style={{ borderColor: prediction === option.id ? lesson.accent : '#d8cfde' }}
                    >
                      <span className="block text-4xl">{option.symbol}</span>
                      <span className="mt-2 block font-round text-base font-black">{option.label}</span>
                    </button>
                  ))}
                </div>
                <button type="button" disabled={!prediction} onClick={() => moveTo(1)} className="mt-6 min-h-12 rounded-lg px-7 font-round font-black text-white disabled:opacity-40" style={{ background: lesson.accent }}>
                  {isToddler ? 'Let’s look →' : isJunior ? 'Investigate the claim →' : 'Follow the question →'}
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="mx-auto grid max-w-4xl items-center gap-6 md:grid-cols-[.75fr_1.25fr]">
                <div className="grid aspect-square place-items-center rounded-lg text-8xl text-white shadow-xl" style={{ background: lesson.accent }}>
                  {lesson.visual}
                </div>
                <div>
                  <p className="font-round text-sm font-black uppercase tracking-[.16em]" style={{ color: lesson.accent }}>{stageCopy[1]}</p>
                  <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl">Look for the hidden connection</h2>
                  <p className="mt-3 font-round text-lg font-bold leading-relaxed text-[#5f5068]">{lesson.story}</p>
                  <button type="button" onClick={() => moveTo(2)} className="mt-5 min-h-12 rounded-lg px-6 font-round font-black text-white" style={{ background: lesson.accent }}>
                    {isToddler ? 'Tap and find →' : isJunior ? 'Inspect the evidence →' : 'Try the activity →'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-sm font-black uppercase tracking-[.16em]" style={{ color: lesson.accent }}>{stageCopy[2]}</p>
                <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl">{lesson.activityPrompt}</h2>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {lesson.clues.map(clue => {
                    const selected = tested.includes(clue.id)
                    return (
                      <motion.button
                        key={clue.id}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => testClue(clue)}
                        className="min-h-36 rounded-lg border-2 bg-white p-3 shadow-sm"
                        style={{ borderColor: selected ? lesson.accent : '#d8cfde' }}
                      >
                        <span className="block text-5xl">{clue.symbol}</span>
                        <span className="mt-3 block font-round text-sm font-black">{selected ? 'Found: ' : ''}{clue.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
                <button type="button" disabled={!allCluesFound} onClick={() => moveTo(3)} className="mt-6 min-h-12 rounded-lg px-7 font-round font-black text-white disabled:opacity-40" style={{ background: lesson.accent }}>
                  {isToddler ? 'What did we find? →' : isJunior ? 'Build the explanation →' : 'Connect the idea →'}
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto grid max-w-4xl items-center gap-6 md:grid-cols-[.8fr_1.2fr]">
                <div className="rounded-lg p-7 text-center text-white shadow-xl" style={{ background: lesson.accent }}>
                  <div className="text-7xl">{lesson.visual}</div>
                  <p className="mt-3 font-bubble text-3xl">One big connection</p>
                </div>
                <div>
                  <p className="font-round text-sm font-black uppercase tracking-[.16em]" style={{ color: lesson.accent }}>{stageCopy[3]}</p>
                  <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl">{lesson.shortQuestion}</h2>
                  <p className="mt-3 font-round text-lg font-bold leading-relaxed text-[#5f5068]">{lesson.explanation}</p>
                  <button type="button" onClick={complete} className="mt-5 min-h-12 rounded-lg px-6 font-round font-black text-white" style={{ background: lesson.accent }}>
                    Save my discovery
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-sm font-black uppercase tracking-[.16em]" style={{ color: lesson.accent }}>Discovery saved</p>
                <div className="mt-2 text-7xl">{lesson.visual}</div>
                <h2 className="mt-3 font-bubble text-4xl leading-tight sm:text-5xl">{lesson.shortQuestion}</h2>
                <p className="mx-auto mt-4 max-w-2xl font-round text-lg font-bold leading-relaxed text-[#5f5068]">{lesson.explanation}</p>
                <div className="mx-auto mt-5 max-w-2xl rounded-lg border-2 bg-white p-4 text-left" style={{ borderColor: `${lesson.accent}80` }}>
                  <p className="font-round text-xs font-black uppercase tracking-[.14em]" style={{ color: lesson.accent }}>
                    {lesson.familyMission ? 'Weekend family mission' : 'Try it together away from the screen'}
                  </p>
                  <p className="mt-1 font-round text-base font-black text-[#403347]">{lesson.offline}</p>
                  <p className="mt-3 border-t pt-3 font-round text-sm font-bold text-[#66586d]">Grown-up question: {lesson.parentQuestion}</p>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => moveTo(2)} className="min-h-12 rounded-lg border-2 bg-white px-5 font-round font-black" style={{ borderColor: lesson.accent, color: lesson.accent }}>
                    Explore again
                  </button>
                  <button type="button" onClick={onBack} className="min-h-12 rounded-lg px-6 font-round font-black text-white" style={{ background: lesson.accent }}>
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
