import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech.js'
import { trackEvent } from '../utils/analytics.js'
import { normalizeFoundationProfile } from '../utils/foundationProfile.js'
import {
  completeHomeToWorldLesson,
  getHomeToWorldView,
} from '../utils/homeToWorld.js'

const REFLECTIONS = {
  toddler: [
    { id: 'noticed', label: 'I noticed something new' },
    { id: 'connected', label: 'I can point to the connection' },
    { id: 'question', label: 'I have another question' },
  ],
  early: [
    { id: 'changed', label: 'My prediction changed' },
    { id: 'matched', label: 'The clues fit my prediction' },
    { id: 'connected', label: 'I found a new connection' },
  ],
  junior: [
    { id: 'supported', label: 'The evidence supports my claim' },
    { id: 'changed', label: 'The evidence changed my claim' },
    { id: 'needed', label: 'I need more evidence' },
  ],
}

function ProgressHeader({ view, onBack }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to dashboard"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-xl font-black text-slate-700"
        >
          ←
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-teal-700">
            People, place and time
          </p>
          <h1 className="font-bubble text-xl leading-tight text-slate-950 sm:text-2xl">
            <span className="sm:hidden">Home to World</span>
            <span className="hidden sm:inline">From Home to the World</span>
          </h1>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bubble text-lg text-slate-950">{view.completed}/{view.total}</p>
          <p className="font-round text-[10px] font-black uppercase text-slate-500">discoveries</p>
        </div>
      </div>
      <div className="mx-auto mt-3 h-2 max-w-5xl overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${view.progressPercent}%` }} />
      </div>
    </header>
  )
}

function PlaceArtifact({ artifact, records }) {
  if (!artifact) return null
  return (
    <section
      data-testid="place-story-artifact"
      className="border-y border-rose-200 bg-rose-50 px-4 py-6"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-rose-700 text-4xl text-white shadow-sm">
            {artifact.emoji}
          </div>
          <div>
            <p className="font-round text-xs font-black uppercase tracking-[.14em] text-rose-700">Permanent project</p>
            <h2 className="font-bubble text-3xl text-slate-950">{artifact.name}</h2>
            <p className="font-round text-sm font-bold text-slate-600">{artifact.message}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {artifact.entries?.map(entry => (
            <div key={entry.id} className="border-l-4 border-rose-300 bg-white px-3 py-3">
              <p className="font-round text-sm font-black text-slate-900">{entry.title}</p>
              <p className="mt-1 font-round text-xs font-bold text-slate-500">
                {records[entry.id]?.reflection ? 'Evidence and reflection saved' : 'Place connection saved'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function JourneyMap({ view, profileName, roots, onBack, onOpenLesson, onOpenExplorer }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950" data-testid="home-to-world-map">
      <ProgressHeader view={view} onBack={onBack} />

      <section className="border-b border-sky-200 bg-sky-50 px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <p className="font-round text-xs font-black uppercase tracking-[.15em] text-sky-800">Your connected journey</p>
          <h2 className="mt-1 max-w-3xl font-bubble text-3xl leading-tight sm:text-4xl">
            Start with a place you know. Follow its connections outward.
          </h2>
          <p className="mt-2 max-w-3xl font-round text-sm font-bold leading-relaxed text-slate-600">
            {profileName}, each discovery adds evidence to one permanent place story. Nothing here is a list of facts to memorise.
          </p>
          {roots.length > 0 && (
            <p className="mt-3 border-l-4 border-violet-400 pl-3 font-round text-sm font-black text-violet-800">
              Family connections ready: {roots.join(' · ')}
            </p>
          )}
        </div>
      </section>

      <section className="px-3 py-5 sm:px-5">
        <div className="mx-auto grid max-w-5xl gap-3">
          {view.lessons.map((lesson, index) => {
            const isNext = view.nextLesson?.id === lesson.id
            return (
              <motion.button
                key={lesson.id}
                type="button"
                whileTap={lesson.unlocked ? { scale: 0.985 } : undefined}
                disabled={!lesson.unlocked}
                onClick={() => onOpenLesson(lesson)}
                aria-label={
                  lesson.completed
                    ? `Review day ${lesson.day}: ${lesson.title}`
                    : lesson.unlocked
                      ? `Start day ${lesson.day}: ${lesson.title}`
                      : `Day ${lesson.day} is locked: ${lesson.title}`
                }
                className="grid min-h-24 w-full grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border bg-white p-3 text-left shadow-sm disabled:opacity-55"
                style={{
                  borderColor: isNext ? lesson.colour : '#dbe3ea',
                  borderWidth: isNext ? 2 : 1,
                }}
                data-testid={`place-day-${lesson.day}`}
              >
                <span
                  className="grid h-14 w-14 place-items-center rounded-lg text-3xl"
                  style={{ background: `${lesson.colour}16`, color: lesson.colour }}
                >
                  {lesson.completed ? '✓' : lesson.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-round text-[10px] font-black uppercase tracking-[.13em]" style={{ color: lesson.colour }}>
                    Day {lesson.day} {isNext ? '· Next discovery' : ''}
                  </span>
                  <span className="mt-0.5 block font-bubble text-xl leading-tight">{lesson.title}</span>
                  <span className="mt-1 block font-round text-xs font-bold leading-snug text-slate-500">
                    {lesson.completed ? 'Saved in My Place Story' : lesson.unlocked ? lesson.question : 'Complete the previous discovery first'}
                  </span>
                </span>
                <span className="font-bubble text-xl text-slate-400">{lesson.unlocked ? '→' : '🔒'}</span>
              </motion.button>
            )
          })}
        </div>
      </section>

      <PlaceArtifact artifact={view.artifact} records={view.state.completed} />

      <section className="px-4 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-round text-xs font-black uppercase tracking-[.13em] text-slate-500">Extra practice</p>
            <p className="font-round text-sm font-bold text-slate-700">Flags, capitals, countries, and timeline quizzes remain available.</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenExplorer?.()}
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 font-round text-sm font-black text-slate-700"
          >
            Open country library
          </button>
        </div>
      </section>
    </main>
  )
}

function LessonFlow({
  lesson,
  profileName,
  savedRecord,
  onBack,
  onComplete,
}) {
  const [stage, setStage] = useState(savedRecord ? 3 : 0)
  const [choice, setChoice] = useState(savedRecord?.choice || '')
  const [evidence, setEvidence] = useState(savedRecord?.evidence || [])
  const [reflection, setReflection] = useState(savedRecord?.reflection || '')
  const [saved, setSaved] = useState(Boolean(savedRecord))
  const { speak, speaking } = useSpeech()
  const reflectionOptions = REFLECTIONS[lesson.ageGroup] || REFLECTIONS.early

  const narration = [
    `${lesson.question} Choose what you think before we inspect the clues.`,
    `${lesson.story} ${lesson.clues.map(clue => clue.label).join('. ')}.`,
    `${lesson.explanation} Choose the reflection that best matches your thinking.`,
    `${profileName}, this connection is saved. Away from the screen: ${lesson.offline}`,
  ]

  const moveTo = next => {
    setStage(next)
    speak(narration[next], { mood: next === 3 ? 'celebrate' : 'guide' })
  }

  const toggleEvidence = clue => {
    setEvidence(current => [...new Set([...current, clue.id])])
    speak(clue.label, { mood: 'instruct' })
    trackEvent('home_to_world_evidence', { lesson_id: lesson.id, evidence_id: clue.id })
  }

  const save = () => {
    const result = onComplete({ choice, evidence, reflection })
    setSaved(true)
    setStage(3)
    if (result.firstCompletion) {
      confetti({ particleCount: result.journeyCompleted ? 130 : 55, spread: 95, origin: { y: 0.45 } })
    }
    speak(`${profileName}, discovery ${lesson.day} is saved in My Place Story.`, { mood: 'celebrate' })
  }

  const allEvidence = lesson.clues.every(clue => evidence.includes(clue.id))

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: lesson.surface }} data-testid="home-to-world-lesson">
      <header className="sticky top-0 z-30 border-b bg-white/95 px-3 py-3 backdrop-blur" style={{ borderColor: `${lesson.colour}40` }}>
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to place journey"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-xl font-black"
          >
            ←
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="font-round text-[10px] font-black uppercase tracking-[.15em]" style={{ color: lesson.colour }}>
              Day {lesson.day} · {lesson.stageLabels[stage]}
            </p>
            <h1 className="truncate font-bubble text-xl text-slate-950">{lesson.title}</h1>
          </div>
          <button
            type="button"
            onClick={() => speak(narration[stage], { mood: 'guide' })}
            aria-label={speaking ? 'Narration is playing' : 'Hear this page'}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl text-white"
            style={{ background: lesson.colour }}
          >
            {speaking ? 'Ⅱ' : '🔊'}
          </button>
        </div>
        <div className="mx-auto mt-3 flex max-w-sm gap-1">
          {lesson.stageLabels.map((label, index) => (
            <span
              key={label}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: index <= stage ? lesson.colour : '#d7dee5' }}
            />
          ))}
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-104px)] max-w-4xl items-center px-3 py-6 sm:px-5">
        <AnimatePresence mode="wait">
          <motion.section
            key={stage}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            className="w-full"
          >
            {stage === 0 && (
              <div className="text-center">
                <p className="text-6xl">{lesson.icon}</p>
                <h2 className="mx-auto mt-3 max-w-3xl font-bubble text-4xl leading-tight text-slate-950 sm:text-5xl">{lesson.question}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {lesson.choices.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setChoice(option.id)
                        speak(option.label, { mood: 'question' })
                      }}
                      className="min-h-32 rounded-lg border-2 bg-white p-4 shadow-sm"
                      style={{ borderColor: choice === option.id ? lesson.colour : '#d7dee5' }}
                    >
                      <span className="block text-4xl">{option.icon}</span>
                      <span className="mt-2 block font-round text-base font-black text-slate-800">{option.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!choice}
                  onClick={() => moveTo(1)}
                  className="mt-6 min-h-12 rounded-lg px-7 font-round font-black text-white disabled:opacity-40"
                  style={{ background: lesson.colour }}
                >
                  Inspect the clues →
                </button>
              </div>
            )}

            {stage === 1 && (
              <div>
                <div className="grid items-center gap-5 md:grid-cols-[.72fr_1.28fr]">
                  <div className="grid aspect-square max-h-72 place-items-center rounded-lg text-8xl text-white shadow-sm" style={{ background: lesson.colour }}>
                    {lesson.icon}
                  </div>
                  <div>
                    <p className="font-round text-xs font-black uppercase tracking-[.14em]" style={{ color: lesson.colour }}>The place story</p>
                    <h2 className="mt-1 font-bubble text-3xl leading-tight text-slate-950">Look for how the parts connect</h2>
                    <p className="mt-3 font-round text-base font-bold leading-relaxed text-slate-600">{lesson.story}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                  {lesson.clues.map(clue => {
                    const found = evidence.includes(clue.id)
                    return (
                      <motion.button
                        key={clue.id}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleEvidence(clue)}
                        aria-label={clue.label}
                        className="min-h-36 rounded-lg border-2 bg-white p-3 text-center shadow-sm"
                        style={{ borderColor: found ? lesson.colour : '#d7dee5' }}
                      >
                        <span className="block text-4xl">{clue.icon}</span>
                        <span className="mt-2 block font-round text-xs font-black leading-snug text-slate-700">
                          {found ? 'Found: ' : ''}{clue.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    disabled={!allEvidence}
                    onClick={() => moveTo(2)}
                    className="mt-6 min-h-12 rounded-lg px-7 font-round font-black text-white disabled:opacity-40"
                    style={{ background: lesson.colour }}
                  >
                    Build the connection →
                  </button>
                </div>
              </div>
            )}

            {stage === 2 && (
              <div className="mx-auto max-w-3xl">
                <p className="font-round text-xs font-black uppercase tracking-[.14em]" style={{ color: lesson.colour }}>The foundation idea</p>
                <h2 className="mt-2 font-bubble text-4xl leading-tight text-slate-950">What do the clues help us explain?</h2>
                <p className="mt-4 border-l-4 bg-white px-4 py-4 font-round text-lg font-bold leading-relaxed text-slate-700" style={{ borderColor: lesson.colour }}>
                  {lesson.explanation}
                </p>
                <div className="mt-5 grid gap-2">
                  {reflectionOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setReflection(option.id)}
                      className="min-h-12 rounded-lg border-2 bg-white px-4 text-left font-round text-sm font-black text-slate-700"
                      style={{ borderColor: reflection === option.id ? lesson.colour : '#d7dee5' }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!reflection}
                  onClick={save}
                  className="mt-6 min-h-12 w-full rounded-lg px-7 font-round font-black text-white disabled:opacity-40"
                  style={{ background: lesson.colour }}
                >
                  {lesson.saveLabel}
                </button>
              </div>
            )}

            {stage === 3 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-7xl">{saved ? '🧭' : lesson.icon}</p>
                <p className="mt-3 font-round text-xs font-black uppercase tracking-[.15em]" style={{ color: lesson.colour }}>Discovery saved</p>
                <h2 className="mt-1 font-bubble text-4xl leading-tight text-slate-950 sm:text-5xl">{lesson.title}</h2>
                <p className="mx-auto mt-3 max-w-2xl font-round text-base font-bold leading-relaxed text-slate-600">{lesson.explanation}</p>
                <div className="mt-5 border-y border-slate-200 bg-white px-4 py-4 text-left">
                  <p className="font-round text-[10px] font-black uppercase tracking-[.14em]" style={{ color: lesson.colour }}>Away from the screen</p>
                  <p className="mt-1 font-round text-base font-black text-slate-800">{lesson.offline}</p>
                  <p className="mt-3 border-t border-slate-200 pt-3 font-round text-sm font-bold text-slate-600">
                    Grown-up question: {lesson.parentPrompt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onBack}
                  className="mt-6 min-h-12 rounded-lg px-7 font-round font-black text-white"
                  style={{ background: lesson.colour }}
                >
                  {lesson.day === 7 ? 'See My Place Story' : 'See the next discovery'}
                </button>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  )
}

export default function HomeToWorld({
  ageGroup = 'early',
  profileName = 'Explorer',
  progress = {},
  moduleId = 'worldgk',
  onUpdateProgress,
  onAddStars,
  onBack,
  onOpenExplorer,
}) {
  const [activeLessonId, setActiveLessonId] = useState(null)
  const view = getHomeToWorldView(progress, ageGroup)
  const profile = normalizeFoundationProfile(progress.foundationProfile)
  const roots = useMemo(() => [...profile.roots, ...profile.languages].slice(0, 4), [profile.languages, profile.roots])
  const activeLesson = view.lessons.find(lesson => lesson.id === activeLessonId)

  const complete = ({ choice, evidence, reflection }) => {
    const result = completeHomeToWorldLesson(progress.homeToWorld, activeLesson.id, {
      choice,
      evidence,
      reflection,
      ageGroup,
    })
    onUpdateProgress?.({ homeToWorld: result.state })
    if (result.firstCompletion) {
      onAddStars?.(moduleId, result.journeyCompleted ? 4 : 2, {
        total: 1,
        correct: 1,
        struggles: [],
        stayOnModule: true,
        suppressCompletionModal: true,
        foundationStrands: activeLesson.strands,
        foundationArcs: activeLesson.arcs,
        foundationLessonId: activeLesson.id,
      })
    }
    trackEvent('home_to_world_complete', {
      lesson_id: activeLesson.id,
      day: activeLesson.day,
      age_group: ageGroup,
      first_completion: result.firstCompletion,
      journey_complete: result.journeyCompleted,
    })
    return result
  }

  if (activeLesson) {
    return (
      <LessonFlow
        lesson={activeLesson}
        profileName={profileName}
        savedRecord={view.state.completed[activeLesson.id]}
        onBack={() => setActiveLessonId(null)}
        onComplete={complete}
      />
    )
  }

  return (
    <div>
      <JourneyMap
        view={view}
        profileName={profileName}
        roots={roots}
        onBack={onBack}
        onOpenLesson={lesson => {
          setActiveLessonId(lesson.id)
          trackEvent('home_to_world_start', {
            lesson_id: lesson.id,
            day: lesson.day,
            age_group: ageGroup,
          })
        }}
        onOpenExplorer={onOpenExplorer}
      />
    </div>
  )
}
