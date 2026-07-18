import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'
import { useModuleStart } from '../hooks/useModuleStart'
import { THEMES } from '../themes'

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
    a: 'Lightning is incredibly hot — about five times hotter than the surface of the sun! It heats the air around it so fast that the air explodes outward with a big BOOM. That boom is thunder!',
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
    a: 'Cats purr by making their voice box vibrate really fast — about 25 to 150 times per second! They usually purr when they are happy and cosy. Scientists think purring might also help heal their own bones and muscles!',
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
    a: 'Animals like chameleons change colour to communicate their mood and to blend in with their surroundings. Their skin has special cells with different coloured pigments that can spread out or bunch together to change colour!',
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
    a: 'When something tickles the inside of your nose — like dust, pollen, or a cold germ — your body fires a superfast air blast to blow it out! A sneeze can travel at over 160 kilometres per hour. Always cover your mouth!',
  },
  {
    cat: '🧍 Us', emoji: '🥱', color: '#A78BFA',
    q: 'Why do we yawn?',
    a: 'Scientists are not completely sure, but one idea is that yawning helps cool your brain and get more oxygen into it when you are tired or bored. Yawning is also contagious — even reading about yawning can make you yawn!',
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
    a: 'Your nervous system actually causes your fingers to wrinkle on purpose! Scientists think wrinkly fingers give us a better grip on wet objects — like the treads on a car tyre. It is an ancient adaptation from when our ancestors lived near water!',
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

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function CuriousScience({ avatar, onBack, profileName, onAddStars }) {
  const theme  = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()
  const startSignal = useModuleStart('science')

  const [cat,       setCat]       = useState('All')
  const [revealed,  setRevealed]  = useState(new Set())
  const [flipped,   setFlipped]   = useState(null)
  const [shuffled]               = useState(() => shuffle(QUESTIONS))
  const [rewardedCount, setRewardedCount] = useState(0)
  const [completedCats, setCompletedCats] = useState(() => new Set())

  useEffect(() => {
    if (!startSignal) return
    speak(`Welcome to the Wonder Lab, ${profileName || 'scientist'}! Tap any card to discover why!`, { mood: 'celebrate' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal])

  const visible = shuffled.filter(q => cat === 'All' || q.cat === cat)

  const handleFlip = (q, i) => {
    const key = `${q.cat}-${i}`
    setFlipped(flipped === key ? null : key)
    if (!revealed.has(key)) {
      const nextRevealed = new Set([...revealed, key])
      setRevealed(nextRevealed)
      speak(q.a, { mood: 'story' })

      const newCount = nextRevealed.size
      const earned = Math.floor(newCount / 5) - rewardedCount
      if (earned > 0) {
        setRewardedCount(c => c + earned)
        onAddStars?.('science', earned, { total: QUESTIONS.length, correct: newCount, struggles: [], stayOnModule: true })
      }

      const catQuestions = QUESTIONS.filter(x => x.cat === q.cat)
      const revealedInCat = catQuestions.filter((cq) => {
        const ckey = shuffled.findIndex(s => s === cq)
        return ckey >= 0 && nextRevealed.has(`${cq.cat}-${shuffled.indexOf(cq)}`)
      })
      if (revealedInCat.length >= catQuestions.length && !completedCats.has(q.cat)) {
        setCompletedCats(prev => new Set([...prev, q.cat]))
        onAddStars?.('science', 2, { total: catQuestions.length, correct: catQuestions.length, struggles: [], stayOnModule: true })
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <div className="text-center">
          <p className="font-bubble text-xl" style={{ color: theme.primary }}>🔬 Wonder Lab</p>
          <p className="font-round text-xs opacity-60" style={{ color: theme.text }}>
            {revealed.size} / {QUESTIONS.length} discovered
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Category filter — horizontal scroll */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(c => (
          <motion.button key={c} whileTap={{ scale: 0.9 }}
            onClick={() => setCat(c)}
            className="shrink-0 px-3 py-1.5 rounded-full font-round text-sm font-bold whitespace-nowrap"
            style={{
              background: cat === c
                ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
                : theme.card,
              color: cat === c ? 'white' : theme.text,
            }}>
            {c}
          </motion.button>
        ))}
      </div>

      {/* Question cards grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 pb-6 overflow-y-auto scroll-ios">
        {visible.map((q, i) => {
          const key      = `${q.cat}-${i}`
          const isOpen   = flipped === key
          const isDone   = revealed.has(key)

          return (
            <motion.div key={key}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleFlip(q, i)}
                className="w-full text-left rounded-3xl overflow-hidden shadow-md"
                style={{ minHeight: isOpen ? 'auto' : 100 }}>
                {/* Question face */}
                <div className="p-4 flex items-start gap-3"
                  style={{
                    background: isOpen
                      ? `linear-gradient(135deg, ${q.color}CC, ${q.color}88)`
                      : theme.card,
                  }}>
                  <span className="text-4xl shrink-0">{q.emoji}</span>
                  <div className="flex-1">
                    <p className="font-round text-xs font-bold opacity-60 mb-1" style={{ color: theme.text }}>
                      {q.cat}
                    </p>
                    <p className="font-bubble text-base leading-snug" style={{ color: theme.text }}>
                      {q.q}
                    </p>
                  </div>
                  <span className="text-xl shrink-0">{isOpen ? '🔼' : isDone ? '✅' : '❓'}</span>
                </div>

                {/* Answer reveal */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1"
                      style={{ background: `${q.color}22` }}>
                      <p className="font-round text-sm leading-relaxed" style={{ color: theme.text }}>
                        {q.a}
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={e => { e.stopPropagation(); speak(q.a, { mood: 'story' }) }}
                        className="mt-2 bg-white/40 rounded-full px-3 py-1 text-xs font-round">
                        🔊 Hear it again
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
