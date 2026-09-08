import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'
import { useModuleStart } from '../hooks/useModuleStart'
import { THEMES } from '../themes'
import {
  SCIENCE_INVESTIGATION_TRAILS,
  getScienceLesson,
} from '../data/scienceInvestigationCurriculum.js'
import {
  completeScienceInvestigation,
  getScienceInvestigationView,
  isScienceLessonUnlocked,
  normalizeScienceInvestigations,
} from '../utils/scienceInvestigations.js'
import { trackEvent } from '../utils/analytics.js'

const CATEGORIES = ['All', '🌤️ Sky', '🐾 Animals', '🌱 Plants', '🪐 Space', '🧍 Us', '🌍 Earth']

const QUESTIONS = [
  // Sky & Weather
  {
    cat: '🌤️ Sky', emoji: '🌈', color: '#F97316',
    q: 'Why do we see rainbows?',
    a: 'When sunlight shines through raindrops, it bends and splits into all the colours! That is why you see red, orange, yellow, green, blue, indigo and violet — the seven colours of the rainbow!',
  },
  {
    cat: '🌤️ Sky', emoji: '🌤️', color: '#38BDF8',
    q: 'Why is the sky blue?',
    a: 'Sunlight contains all colours, but when it travels through our air, tiny particles bounce blue light in all directions. So wherever you look up, you see blue! On other planets with different air, the sky looks a different colour.',
  },
  {
    cat: '🌤️ Sky', emoji: '⛈️', color: '#6B7280',
    q: 'Why does thunder happen?',
    a: 'Lightning rapidly heats the air around its path. The air expands suddenly and creates a pressure wave that travels to us as the sound of thunder.',
  },
  {
    cat: '🌤️ Sky', emoji: '❄️', color: '#BAE6FD',
    q: 'Why is snow white?',
    a: 'Each snowflake is made of tiny ice crystals. When light hits them, it bounces off in every direction and all the colours mix together — and mixed together, they look white! Same reason why clouds are white.',
  },
  {
    cat: '🌤️ Sky', emoji: '💨', color: '#94A3B8',
    q: 'Why does the wind blow?',
    a: 'The sun heats some parts of the Earth more than others. Warm air is lighter and floats upward, and cooler air rushes in to fill the gap. That rushing air is what we call wind!',
  },
  // Space
  {
    cat: '🪐 Space', emoji: '🌙', color: '#C4B5FD',
    q: 'Why does the moon look white?',
    a: 'The moon has no light of its own! It is like a giant mirror in space. It reflects the light from our Sun. Because the sun\'s light is white, the moon looks white or pale yellow — especially when it is high in the sky.',
  },
  {
    cat: '🪐 Space', emoji: '🌅', color: '#F59E0B',
    q: 'Why does the sun look orange at sunset?',
    a: 'When the sun is low in the sky, its light has to travel through much more air to reach your eyes. The air scatters away the blue light, leaving the warmer red and orange colours. That is why sunsets are so beautiful!',
  },
  {
    cat: '🪐 Space', emoji: '✨', color: '#A78BFA',
    q: 'Why do stars twinkle?',
    a: 'Stars are so far away that their light is just a tiny pinprick by the time it reaches Earth. As it travels through our wobbly atmosphere, pockets of warm and cool air bend the light in different directions — making it flicker and twinkle!',
  },
  {
    cat: '🪐 Space', emoji: '🪐', color: '#34D399',
    q: 'Why do planets orbit the sun?',
    a: 'The Sun is so massive that its gravity pulls everything towards it. But planets are moving sideways really fast at the same time. These two forces balance perfectly — the planet keeps falling towards the sun but always misses it. That is an orbit!',
  },
  // Animals
  {
    cat: '🐾 Animals', emoji: '🐕', color: '#F59E0B',
    q: 'Why do dogs wag their tails?',
    a: 'A wagging tail is a dog\'s way of saying "I am happy to see you!" Dogs use their tails to show lots of feelings — a high fast wag means excited and happy, while a low slow wag can mean they are feeling unsure.',
  },
  {
    cat: '🐾 Animals', emoji: '🐱', color: '#F97316',
    q: 'Why do cats purr?',
    a: 'Cats create a purr using repeating movements around the voice box. They may purr when relaxed, but also when stressed, injured, or seeking contact, so the surrounding behaviour matters.',
  },
  {
    cat: '🐾 Animals', emoji: '🐝', color: '#EAB308',
    q: 'Why do bees make honey?',
    a: 'Bees collect nectar from flowers and bring it back to their hive. They fan it with their wings to evaporate the water, turning it into thick, sweet honey. It is their food store for winter when there are no flowers!',
  },
  {
    cat: '🐾 Animals', emoji: '🦋', color: '#EC4899',
    q: 'Why do caterpillars turn into butterflies?',
    a: 'Inside the chrysalis, the caterpillar\'s body breaks down and rebuilds itself into a completely new shape — wings, antennae and all! Scientists call this metamorphosis. It is one of nature\'s most magical transformations!',
  },
  {
    cat: '🐾 Animals', emoji: '🦎', color: '#22C55E',
    q: 'Why do some animals change colour?',
    a: 'Chameleons mainly change colour for communication and temperature control, although colour can sometimes affect camouflage. Special skin structures change how different wavelengths of light reflect.',
  },
  // Plants
  {
    cat: '🌱 Plants', emoji: '🌿', color: '#22C55E',
    q: 'Why are leaves green?',
    a: 'Leaves contain a special green pigment called chlorophyll. Chlorophyll captures sunlight so the plant can make its own food from water and carbon dioxide. The green colour absorbs red and blue light — and reflects back the green!',
  },
  {
    cat: '🌱 Plants', emoji: '🍂', color: '#D97706',
    q: 'Why do leaves change colour in autumn?',
    a: 'As days get shorter and colder, trees stop making chlorophyll to save energy. The green colour fades and the hidden yellow and orange pigments appear! Some leaves even make new red pigment. Then the tree lets the leaves fall to save water.',
  },
  {
    cat: '🌱 Plants', emoji: '🌺', color: '#EC4899',
    q: 'Why do flowers smell nice?',
    a: 'Flowers produce sweet smells to attract bees, butterflies and other insects. When insects visit to drink the nectar, they accidentally carry pollen from flower to flower — helping plants make seeds. The insects get a snack, and the plant gets help!',
  },
  {
    cat: '🌱 Plants', emoji: '🌱', color: '#4ADE80',
    q: 'How does a tiny seed become a big tree?',
    a: 'A seed contains a tiny baby plant and all the food it needs to start growing. When it gets water, warmth and air, it wakes up! It sends roots down for water and a shoot up for light. Then using sunlight, water and carbon dioxide, it grows bigger and bigger!',
  },
  // Us (Human body)
  {
    cat: '🧍 Us', emoji: '🤧', color: '#60A5FA',
    q: 'Why do we sneeze?',
    a: 'When dust, pollen, infection, or another irritant activates sensors inside the nose, nerves trigger a coordinated burst of air. Covering a sneeze with a tissue or elbow helps reduce droplets spreading.',
  },
  {
    cat: '🧍 Us', emoji: '🥱', color: '#A78BFA',
    q: 'Why do we yawn?',
    a: 'Scientists do not yet have one complete explanation for yawning. It is linked with changes in alertness and may help regulate brain temperature. The old idea that yawning simply gives us more oxygen is not supported.',
  },
  {
    cat: '🧍 Us', emoji: '😴', color: '#818CF8',
    q: 'Why do we need to sleep?',
    a: 'While you sleep, your brain processes everything you learned during the day and stores it as memories. Your body also repairs muscles and fights off germs. Most children need 9 to 11 hours of sleep every night to grow and feel great!',
  },
  {
    cat: '🧍 Us', emoji: '🥶', color: '#67E8F9',
    q: 'Why do we get goosebumps?',
    a: 'When you are cold or scared, tiny muscles attached to your hairs pull them upright. In our hairy ancestors, this made their fur puff up to trap warm air. We still have the same reflex — but without much fur, it just gives us goosebumps!',
  },
  {
    cat: '🧍 Us', emoji: '🤔', color: '#F472B6',
    q: 'Why do fingers go wrinkly in water?',
    a: 'After time in water, the nervous system narrows blood vessels beneath fingertip skin, producing wrinkles. Better wet grip is one hypothesis for why this response evolved, and scientists continue to test it.',
  },
  // Earth
  {
    cat: '🌍 Earth', emoji: '🌊', color: '#0EA5E9',
    q: 'Why is the sea salty?',
    a: 'Rain washes tiny amounts of salt and minerals from rocks on land into rivers, which flow to the sea. Over millions and millions of years, the water evaporates into clouds (leaving the salt behind) but more salty water keeps arriving — so it gets saltier and saltier!',
  },
  {
    cat: '🌍 Earth', emoji: '🌋', color: '#EF4444',
    q: 'Why do volcanoes erupt?',
    a: 'Deep inside the Earth it is incredibly hot — hot enough to melt rock! This melted rock is called magma. When pressure builds up, the magma finds a weak spot in the Earth\'s crust and bursts through as lava, ash and gas. That is a volcanic eruption!',
  },
  {
    cat: '🌍 Earth', emoji: '🌏', color: '#22C55E',
    q: 'Why do we have different seasons?',
    a: 'The Earth is tilted at an angle as it travels around the Sun. When your part of the Earth leans towards the Sun, you get summer — longer, warmer days! When it leans away, you get winter. Spring and autumn are in between.',
  },
]

function ScienceMap({ progress, profileName, onBack, onOpenLesson, onOpenLibrary }) {
  const view = getScienceInvestigationView(progress)
  const state = normalizeScienceInvestigations(progress.scienceInvestigations)

  useEffect(() => {
    trackEvent('science_investigation_map_open', {
      completed: view.completed,
      trails_completed: view.trails.filter(trail => trail.complete).length,
    })
  }, [view.completed])

  return (
    <main className="min-h-screen bg-[#f5f3ef] pb-safe text-[#263239]" data-testid="science-investigation-map">
      <header className="bg-[#263239] px-3 pb-5 pt-safe text-white sm:px-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={onBack} aria-label="Back to adventure map" className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-xl">←</button>
            <div className="min-w-0 text-center">
              <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-[#7ee0ba]">Progressive science investigations</p>
              <h1 className="font-bubble text-2xl sm:text-3xl">🔬 Wonder Lab</h1>
            </div>
            <button type="button" onClick={onOpenLibrary} aria-label="Open Question Library" className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-xl">❓</button>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-bubble text-lg">{profileName || 'Scientist'}'s field path</p>
              <p className="font-round text-xs font-bold text-white/70">{view.completed} of {view.total} investigations · {view.trails.filter(trail => trail.complete).length} badges</p>
            </div>
            <span className="font-bubble text-xl text-[#7ee0ba]">{view.progressPercent}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
            <motion.div initial={{ width: 0 }} animate={{ width: `${view.progressPercent}%` }} className="h-full rounded-full bg-[#62d5ad]" />
          </div>
        </div>
      </header>

      {view.complete && view.artifact && (
        <section className="border-b border-[#d9d4ce] bg-white px-3 py-5 sm:px-5" data-testid="science-field-journal">
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <span className="text-6xl">{view.artifact.emoji}</span>
            <div>
              <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#6d3db0]">All trails complete</p>
              <h2 className="font-bubble text-2xl">{view.artifact.name}</h2>
              <p className="mt-1 font-round text-sm font-bold text-[#665f69]">{view.artifact.message}</p>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl">
        {view.trails.map((trail, trailIndex) => (
          <section key={trail.id} className="border-b border-[#d9d4ce] px-3 py-5 sm:px-5" style={{ background: trailIndex % 2 ? '#fff' : `${trail.colour}0c` }} data-testid={`science-trail-${trail.id}`}>
            <div className="grid gap-4 md:grid-cols-[250px_1fr] md:items-center">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg text-3xl text-white" style={{ background: trail.colour }}>{trail.emoji}</span>
                <div>
                  <p className="font-round text-[10px] font-black uppercase tracking-[.14em]" style={{ color: trail.colour }}>Trail {trailIndex + 1} · {trail.completed}/4</p>
                  <h2 className="font-bubble text-xl leading-tight">{trail.title}</h2>
                  {trail.complete && <p className="mt-1 font-round text-xs font-black text-[#167a4a]">✨ {trail.badge?.name || trail.rewardBadge.name}</p>}
                </div>
              </div>
              <div>
                <div className="relative grid grid-cols-4 gap-3">
                  <span className="absolute left-[10%] right-[10%] top-1/2 h-1 -translate-y-1/2 bg-[#d4cfd4]" aria-hidden="true" />
                  {trail.lessons.map((item, index) => {
                    const saved = Boolean(state.completed[item.id])
                    const unlocked = isScienceLessonUnlocked(state, item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => onOpenLesson(item.id)}
                        aria-label={saved ? `Review investigation ${index + 1}: ${item.question}` : unlocked ? `Start investigation ${index + 1}: ${item.question}` : `Investigation ${index + 1} is locked`}
                        className="relative z-10 mx-auto grid aspect-square w-full max-w-20 place-items-center rounded-full border-2 font-bubble text-lg shadow-sm disabled:cursor-default"
                        style={{
                          borderColor: saved || unlocked ? item.colour : '#cbc5cc',
                          background: saved ? item.colour : unlocked ? '#fff' : '#ece8ed',
                          color: saved ? '#fff' : unlocked ? item.colour : '#8c848e',
                        }}
                      >
                        {saved ? '✓' : unlocked ? item.emoji : '🔒'}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-3 font-round text-xs font-bold text-[#665f69]">{trail.question}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

function InvestigationPlayer({ lesson, progress, profileName, onUpdateProgress, onAddStars, onBack }) {
  const saved = normalizeScienceInvestigations(progress.scienceInvestigations).completed[lesson.id]
  const [step, setStep] = useState(saved ? 4 : 0)
  const [prediction, setPrediction] = useState(saved?.prediction || '')
  const [evidence, setEvidence] = useState(saved?.evidence || [])
  const [reflection, setReflection] = useState(saved?.reflection || '')
  const { speak, speaking } = useSpeech()
  const trail = SCIENCE_INVESTIGATION_TRAILS.find(item => item.id === lesson.trailId)
  const stages = ['Predict', 'Model', 'Evidence', 'Explain', 'Connect']

  useEffect(() => {
    trackEvent('science_investigation_open', { lesson_id: lesson.id, trail_id: lesson.trailId })
  }, [lesson.id, lesson.trailId])

  const go = next => {
    setStep(next)
    const narration = [
      `${lesson.question} What do you predict?`,
      lesson.story,
      'Inspect each piece of evidence. Think about how the clues connect.',
      lesson.explanation,
      `Away from the screen: ${lesson.activity}`,
    ]
    speak(narration[next], { mood: next === 4 ? 'celebrate' : 'story' })
  }

  const finish = () => {
    const result = completeScienceInvestigation(progress.scienceInvestigations, lesson.id, {
      prediction,
      evidence,
      reflection,
    })
    onUpdateProgress?.({ scienceInvestigations: result.state })
    if (result.firstCompletion) {
      onAddStars?.('science', 2, {
        total: 1,
        correct: 1,
        struggles: [],
        stayOnModule: true,
        foundationStrands: lesson.strands,
        foundationArcs: lesson.arcs,
        foundationLessonId: lesson.id,
      })
    }
    trackEvent('science_investigation_complete', {
      lesson_id: lesson.id,
      trail_id: lesson.trailId,
      first_completion: result.firstCompletion,
      trail_complete: result.trailCompleted,
      field_journal_complete: result.seasonCompleted,
    })
    go(4)
  }

  const allEvidence = lesson.evidence.every(item => evidence.includes(item.id))

  return (
    <main className="min-h-screen pb-safe text-[#263239]" style={{ background: `${lesson.colour}10` }} data-testid="science-investigation-player">
      <header className="sticky top-0 z-20 border-b bg-white/95 px-3 py-3 backdrop-blur" style={{ borderColor: `${lesson.colour}45` }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button type="button" onClick={onBack} aria-label="Back to investigation map" className="grid h-11 w-11 place-items-center rounded-full border bg-white text-xl">←</button>
          <div className="min-w-0 text-center">
            <p className="font-round text-[10px] font-black uppercase tracking-[.14em]" style={{ color: lesson.colour }}>{trail.title} · {stages[step]}</p>
            <h1 className="font-bubble text-xl">{step + 1} of 5</h1>
          </div>
          <button type="button" onClick={() => go(step)} aria-label={speaking ? 'Narration is playing' : 'Hear this investigation page'} className="grid h-11 w-11 place-items-center rounded-full text-xl text-white" style={{ background: lesson.colour }}>{speaking ? 'Ⅱ' : '🔊'}</button>
        </div>
        <div className="mx-auto mt-3 flex max-w-sm gap-1">{stages.map((_, index) => <span key={index} className="h-1.5 flex-1 rounded-full" style={{ background: index <= step ? lesson.colour : '#d8d2d8' }} />)}</div>
      </header>

      <div className="mx-auto flex min-h-[calc(100dvh-100px)] max-w-5xl items-center px-3 py-5 sm:px-5">
        <AnimatePresence mode="wait">
          <motion.section key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="w-full">
            {step === 0 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-xs font-black uppercase tracking-[.16em]" style={{ color: lesson.colour }}>Make a prediction</p>
                <div className="mt-2 text-6xl">{lesson.emoji}</div>
                <h2 className="mt-2 font-bubble text-4xl leading-tight sm:text-5xl">{lesson.question}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {lesson.predictionOptions.map(option => (
                    <button key={option.id} type="button" onClick={() => { setPrediction(option.id); speak(option.label) }} className="min-h-28 rounded-lg border-2 bg-white p-4 shadow-sm" style={{ borderColor: prediction === option.id ? lesson.colour : '#d2ccd4' }}>
                      <span className="block text-3xl">{option.symbol}</span>
                      <span className="mt-2 block font-round text-sm font-black">{option.label}</span>
                    </button>
                  ))}
                </div>
                <button type="button" disabled={!prediction} onClick={() => go(1)} className="mt-6 min-h-12 rounded-lg px-7 font-bubble text-white disabled:opacity-40" style={{ background: lesson.colour }}>Test my prediction →</button>
              </div>
            )}

            {step === 1 && (
              <div className="mx-auto grid max-w-4xl items-center gap-5 md:grid-cols-[.7fr_1.3fr]">
                <div className="grid aspect-square place-items-center rounded-lg text-8xl text-white shadow-lg" style={{ background: lesson.colour }}>{lesson.emoji}</div>
                <div>
                  <p className="font-round text-xs font-black uppercase tracking-[.16em]" style={{ color: lesson.colour }}>Build a useful model</p>
                  <h2 className="mt-2 font-bubble text-3xl">What might be happening underneath?</h2>
                  <p className="mt-3 font-round text-lg font-bold leading-relaxed text-[#5e5862]">{lesson.story}</p>
                  <button type="button" onClick={() => go(2)} className="mt-5 min-h-12 rounded-lg px-6 font-bubble text-white" style={{ background: lesson.colour }}>Inspect the evidence →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-xs font-black uppercase tracking-[.16em]" style={{ color: lesson.colour }}>Evidence check</p>
                <h2 className="mt-2 font-bubble text-3xl">Find the connected clues</h2>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {lesson.evidence.map(item => {
                    const found = evidence.includes(item.id)
                    return (
                      <button key={item.id} type="button" onClick={() => { setEvidence(current => [...new Set([...current, item.id])]); speak(item.label) }} className="min-h-36 rounded-lg border-2 bg-white p-3 shadow-sm" style={{ borderColor: found ? lesson.colour : '#d2ccd4' }}>
                        <span className="block text-5xl">{item.symbol}</span>
                        <span className="mt-3 block font-round text-sm font-black">{found ? 'Found: ' : ''}{item.label}</span>
                      </button>
                    )
                  })}
                </div>
                <button type="button" disabled={!allEvidence} onClick={() => go(3)} className="mt-6 min-h-12 rounded-lg px-7 font-bubble text-white disabled:opacity-40" style={{ background: lesson.colour }}>Build the explanation →</button>
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto max-w-3xl">
                <p className="font-round text-xs font-black uppercase tracking-[.16em]" style={{ color: lesson.colour }}>Explain from evidence</p>
                <h2 className="mt-2 font-bubble text-3xl leading-tight">{lesson.question}</h2>
                <p className="mt-4 font-round text-lg font-bold leading-relaxed text-[#5e5862]">{lesson.explanation}</p>
                <p className="mt-6 font-round text-sm font-black">What happened to your thinking?</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {[
                    ['matched', 'My prediction matched'],
                    ['changed', 'Evidence changed my mind'],
                    ['question', 'I have another question'],
                  ].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setReflection(id)} className="min-h-12 rounded-lg border-2 bg-white px-3 font-round text-sm font-black" style={{ borderColor: reflection === id ? lesson.colour : '#d2ccd4' }}>{label}</button>
                  ))}
                </div>
                <button type="button" disabled={!reflection} onClick={finish} className="mt-6 min-h-12 rounded-lg px-7 font-bubble text-white disabled:opacity-40" style={{ background: lesson.colour }}>Save to my Field Journal</button>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-round text-xs font-black uppercase tracking-[.16em]" style={{ color: lesson.colour }}>Investigation saved</p>
                <div className="mt-2 text-7xl">{lesson.emoji}</div>
                <h2 className="mt-3 font-bubble text-4xl">{lesson.question}</h2>
                <p className="mt-3 font-round text-lg font-bold leading-relaxed text-[#5e5862]">{lesson.explanation}</p>
                <div className="mt-5 rounded-lg border-2 bg-white p-4 text-left" style={{ borderColor: `${lesson.colour}80` }}>
                  <p className="font-round text-[10px] font-black uppercase tracking-[.14em]" style={{ color: lesson.colour }}>Try it away from the screen</p>
                  <p className="mt-1 font-round text-base font-black">{lesson.activity}</p>
                  <p className="mt-3 border-t pt-3 font-round text-sm font-bold text-[#665f69]">Talk together: {lesson.parentPrompt}</p>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => { setStep(0); setEvidence([]); setPrediction(''); setReflection('') }} className="min-h-12 rounded-lg border-2 bg-white px-5 font-bubble" style={{ borderColor: lesson.colour, color: lesson.colour }}>Investigate again</button>
                  <button type="button" onClick={onBack} className="min-h-12 rounded-lg px-6 font-bubble text-white" style={{ background: lesson.colour }}>Back to science trails</button>
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  )
}

function QuestionLibrary({ theme, speak, onBack }) {
  const [cat, setCat] = useState('All')
  const [flipped, setFlipped] = useState('')
  const visible = QUESTIONS.filter(item => cat === 'All' || item.cat === cat)

  return (
    <main className="min-h-screen bg-[#f5f3ef] pb-safe text-[#263239]" data-testid="science-question-library">
      <header className="sticky top-0 z-20 border-b bg-white/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button type="button" onClick={onBack} aria-label="Back to science trails" className="grid h-11 w-11 place-items-center rounded-full border text-xl">←</button>
          <div className="min-w-0 flex-1"><p className="font-round text-[10px] font-black uppercase tracking-[.14em]" style={{ color: theme.primary }}>Explore freely</p><h1 className="font-bubble text-2xl">Question Library</h1></div>
          <select value={cat} onChange={event => setCat(event.target.value)} aria-label="Question category" className="h-11 max-w-36 rounded-lg border bg-white px-2 font-round text-sm font-black">
            {CATEGORIES.map(item => <option key={item}>{item}</option>)}
          </select>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-3 px-3 py-5 sm:grid-cols-2 sm:px-5">
        {visible.map(item => {
          const open = flipped === item.q
          return (
            <button key={item.q} type="button" onClick={() => { setFlipped(open ? '' : item.q); if (!open) speak(item.a, { mood: 'story' }) }} className="overflow-hidden rounded-lg border bg-white text-left shadow-sm" style={{ borderColor: `${item.color}70` }}>
              <span className="flex items-start gap-3 p-4">
                <span className="text-4xl">{item.emoji}</span>
                <span className="min-w-0 flex-1"><span className="block font-round text-[10px] font-black uppercase" style={{ color: item.color }}>{item.cat}</span><span className="mt-1 block font-bubble text-lg leading-tight">{item.q}</span></span>
                <span aria-hidden="true">{open ? '−' : '+'}</span>
              </span>
              {open && <span className="block border-t p-4 font-round text-sm font-bold leading-relaxed text-[#5e5862]" style={{ background: `${item.color}0d` }}>{item.a}</span>}
            </button>
          )
        })}
      </div>
    </main>
  )
}

export default function CuriousScience({
  avatar,
  onBack,
  profileName,
  progress = {},
  onUpdateProgress,
  onAddStars,
}) {
  const theme = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()
  const startSignal = useModuleStart('science')
  const [screen, setScreen] = useState('map')
  const [lessonId, setLessonId] = useState('')

  useEffect(() => {
    if (!startSignal) return
    speak(`Welcome to Wonder Lab, ${profileName || 'scientist'}. Choose a science trail, make a prediction, and test the evidence.`, { mood: 'celebrate' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal])

  const activeLesson = getScienceLesson(lessonId)
  if (screen === 'lesson' && activeLesson) {
    return <InvestigationPlayer lesson={activeLesson} progress={progress} profileName={profileName} onUpdateProgress={onUpdateProgress} onAddStars={onAddStars} onBack={() => setScreen('map')} />
  }
  if (screen === 'library') return <QuestionLibrary theme={theme} speak={speak} onBack={() => setScreen('map')} />
  return <ScienceMap progress={progress} profileName={profileName} onBack={onBack} onOpenLesson={id => { setLessonId(id); setScreen('lesson') }} onOpenLibrary={() => setScreen('library')} />
}
