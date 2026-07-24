import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import InteractiveYaagvi, { useYaagviReactions } from '../../components/InteractiveYaagvi'

const FAITHS = {
  'Hinduism 🕉️': {
    color: '#FF6B35',
    intro: 'Hinduism is one of the world\'s oldest religions, originating in India over 4,000 years ago. Hindus believe in one supreme power called Brahman, who appears in many forms as different gods and goddesses. The two great Hindu epics — the Ramayana and the Mahabharata — are full of incredible stories of gods, heroes, and wisdom.',
    stories: [
      {
        title: 'Rama and the Golden Deer 🦌',
        text: 'Prince Rama, his wife Sita and brother Lakshmana lived in a forest. One day Sita saw a beautiful golden deer and begged Rama to catch it. The deer was really the demon Ravana in disguise! While Rama chased it, Ravana kidnapped Sita. With the help of the monkey god Hanuman and an army of monkeys, Rama crossed the ocean to Lanka and rescued Sita. Good won over evil — and that is why we celebrate Diwali!'
      },
      {
        title: 'Ganesha and the Moon 🌙',
        text: 'Ganesha, the elephant-headed god, was riding his mouse mount one night when he tripped and his favourite sweets scattered everywhere. The moon laughed at him. Ganesha was so upset that he cursed the moon to disappear from the sky! The gods begged Ganesha to forgive the moon. He relented, but said the moon could only grow and shrink — never stay full forever. That is why the moon has phases!'
      },
      {
        title: 'Krishna and the Butter 🧈',
        text: 'As a child, Krishna loved butter so much that he would sneak into his mother Yashoda\'s kitchen and steal pots of butter for himself and his friends. Yashoda tried to catch him, but Krishna was magical and mischievous. When she finally caught him, she looked into his mouth and saw the entire universe inside! She realized her son was no ordinary child — he was Lord Vishnu himself, come to Earth.'
      },
      {
        title: 'Prahlada and the Pillar of Fire 🔥',
        text: 'Prahlada was a young boy who loved the god Vishnu with all his heart. His father, the demon king Hiranyakashipu, hated Vishnu and tried many times to kill Prahlada. Each time, Vishnu protected him. Finally, his evil aunt Holika tried to burn Prahlada in a fire — but the flames did not touch him! Instead, Holika was burned. We celebrate this story every year by lighting bonfires on Holi!'
      },
    ],
    questions: [
      { q: 'What is the holy book of Hinduism?', opts: ['The Bible', 'The Vedas', 'The Quran', 'The Guru Granth'], ans: 'The Vedas', fact: 'The Vedas are ancient sacred texts of Hinduism, written in Sanskrit. The Bhagavad Gita is also a very important Hindu scripture, containing wisdom spoken by Lord Krishna.' },
      { q: 'Which festival is known as the "Festival of Lights"?', opts: ['Eid', 'Diwali', 'Holi', 'Christmas'], ans: 'Diwali', fact: 'Diwali celebrates Rama\'s return home after defeating the demon Ravana and rescuing Sita. Lamps called diyas are lit to guide Rama home and to symbolise light over darkness.' },
      { q: 'What symbol is associated with Hinduism?', opts: ['Cross', 'Star of David', 'Om (ॐ)', 'Crescent'], ans: 'Om (ॐ)', fact: 'Om (also written Aum) is a sacred sound and symbol in Hinduism. It represents the sound of the universe and is chanted at the beginning of prayers and meditation.' },
      { q: 'What is the name of the Hindu god of wisdom with an elephant head?', opts: ['Vishnu', 'Shiva', 'Ganesha', 'Krishna'], ans: 'Ganesha', fact: 'Ganesha is the son of Lord Shiva and Goddess Parvati. He is the remover of obstacles and god of new beginnings. Hindus pray to Ganesha before starting any important task.' },
      { q: 'In the Ramayana, who kidnapped Sita?', opts: ['Hanuman', 'Ravana', 'Lakshmana', 'Vishnu'], ans: 'Ravana', fact: 'Ravana was the ten-headed demon king of Lanka. Lord Rama defeated Ravana with the help of Hanuman and an army of monkeys. This victory is celebrated as Dussehra — 20 days before Diwali.' },
      { q: 'Which monkey god helped Rama find Sita?', opts: ['Ganesh', 'Brahma', 'Hanuman', 'Indra'], ans: 'Hanuman', fact: 'Hanuman is one of the most beloved Hindu deities. He is known for his incredible strength, devotion to Rama, and bravery. He flew across the ocean and leapt to Lanka to find Sita!' },
      { q: 'Which Hindu festival is celebrated by throwing coloured powder?', opts: ['Diwali', 'Navratri', 'Holi', 'Baisakhi'], ans: 'Holi', fact: 'Holi is the festival of colours and spring! It celebrates the story of Prahlada — a boy whose devotion to Vishnu protected him from fire. Everyone throws bright colours to celebrate good over evil.' },
      { q: 'Which god is known as the preserver and protector in Hinduism?', opts: ['Brahma', 'Vishnu', 'Shiva', 'Indra'], ans: 'Vishnu', fact: 'In Hinduism, Brahma is the creator, Vishnu is the preserver, and Shiva is the destroyer. Vishnu has come to Earth many times in different forms (called avatars) — including Rama and Krishna — to restore goodness.' },
    ],
  },
  'Islam ☪️': {
    color: '#22C55E',
    intro: 'Islam is one of the world\'s major religions with over 1.8 billion followers called Muslims. Muslims believe in one God, called Allah in Arabic, and follow the teachings of the Prophet Muhammad (peace be upon him).',
    questions: [
      { q: 'What is the holy book of Islam?', opts: ['The Bible', 'The Vedas', 'The Quran', 'The Torah'], ans: 'The Quran', fact: 'The Quran is the sacred text of Islam. Muslims believe it contains the word of God as revealed to Prophet Muhammad. It is written in Arabic.' },
      { q: 'How many times a day do Muslims pray?', opts: ['Once', 'Three times', 'Five times', 'Seven times'], ans: 'Five times', fact: 'Muslims pray five times daily (Fajr, Dhuhr, Asr, Maghrib, Isha). Prayer is called Salah and is one of the Five Pillars of Islam.' },
      { q: 'What is the holy month when Muslims fast?', opts: ['Muharram', 'Ramadan', 'Shawwal', 'Rajab'], ans: 'Ramadan', fact: 'During Ramadan, Muslims fast from dawn to sunset. At the end of Ramadan, they celebrate Eid al-Fitr, a joyful festival with feasts and gifts.' },
      { q: 'What is the name of Islam\'s holiest city?', opts: ['Jerusalem', 'Medina', 'Mecca', 'Cairo'], ans: 'Mecca', fact: 'Mecca is in Saudi Arabia and is the birthplace of the Prophet Muhammad. Muslims around the world face Mecca when they pray.' },
    ],
  },
  'Christianity ✝️': {
    color: '#3B82F6',
    intro: 'Christianity is the world\'s largest religion with over 2 billion followers called Christians. Christians believe in one God and follow the teachings of Jesus Christ, who they believe is the Son of God.',
    questions: [
      { q: 'What is the holy book of Christianity?', opts: ['The Quran', 'The Bible', 'The Vedas', 'The Torah'], ans: 'The Bible', fact: 'The Bible has two parts: the Old Testament (shared with Judaism) and the New Testament, which tells the story of Jesus Christ and his teachings.' },
      { q: 'Which festival celebrates the birth of Jesus?', opts: ['Easter', 'Hanukkah', 'Christmas', 'Pentecost'], ans: 'Christmas', fact: 'Christmas is celebrated on 25 December to mark the birth of Jesus Christ. Christians attend church services, exchange gifts, and celebrate with family.' },
      { q: 'What symbol is associated with Christianity?', opts: ['Om', 'The Cross', 'The Star of David', 'The Crescent'], ans: 'The Cross', fact: 'The cross represents the crucifixion of Jesus. Christians believe Jesus died on the cross and rose from the dead, giving hope of eternal life to his followers.' },
      { q: 'Which Christian festival celebrates Jesus rising from the dead?', opts: ['Christmas', 'Palm Sunday', 'Easter', 'Advent'], ans: 'Easter', fact: 'Easter is the most important Christian festival. It celebrates the resurrection of Jesus Christ. Easter eggs represent new life and the empty tomb.' },
    ],
  },
  'Sikhism 🪯': {
    color: '#F59E0B',
    intro: 'Sikhism was founded in the Punjab region of India about 500 years ago by Guru Nanak. There are around 30 million Sikhs worldwide. Sikhs believe in one God and the teachings of ten Gurus.',
    questions: [
      { q: 'What is the Sikh holy book called?', opts: ['The Vedas', 'The Quran', 'The Guru Granth Sahib', 'The Bible'], ans: 'The Guru Granth Sahib', fact: 'The Guru Granth Sahib is the living holy scripture of Sikhism. It is treated with great reverence — Sikhs bow before it and it is given its own room in the Gurdwara.' },
      { q: 'What is the Sikh place of worship called?', opts: ['Mosque', 'Temple', 'Gurdwara', 'Church'], ans: 'Gurdwara', fact: 'Gurdwara means "door of the Guru." All Gurdwaras have a free kitchen called a Langar, where anyone can come and eat regardless of their background.' },
      { q: 'What festival do Sikhs celebrate with fireworks like Diwali?', opts: ['Baisakhi', 'Lohri', 'Gurpurab', 'Vaisakhi'], ans: 'Baisakhi', fact: 'Baisakhi (also called Vaisakhi) marks the founding of the Khalsa in 1699. It\'s also the Punjabi New Year and celebrated with dancing, music and prayer.' },
      { q: 'What is the 5K article Sikhs wear on their wrist called?', opts: ['Kesh', 'Kara', 'Kanga', 'Kachera'], ans: 'Kara', fact: 'The Kara is a steel bracelet worn by Sikhs. It is one of the 5 Ks (Panj Kakars) — Kesh, Kara, Kanga, Kachera, and Kirpan — symbols of Sikh faith.' },
    ],
  },
  'Buddhism ☸️': {
    color: '#EC4899',
    intro: 'Buddhism was founded about 2,500 years ago by Siddhartha Gautama, known as the Buddha, in ancient India. There are around 500 million Buddhists worldwide. Buddhism teaches the path to happiness and freedom from suffering.',
    questions: [
      { q: 'Who founded Buddhism?', opts: ['The Prophet Muhammad', 'Guru Nanak', 'Siddhartha Gautama', 'Jesus Christ'], ans: 'Siddhartha Gautama', fact: 'Siddhartha Gautama was a prince who gave up his wealth to seek the truth about life and suffering. After meditating under a Bodhi tree, he became the Buddha (the "Enlightened One").' },
      { q: 'What is the Buddhist place of worship called?', opts: ['Church', 'Temple or Vihara', 'Mosque', 'Gurdwara'], ans: 'Temple or Vihara', fact: 'Buddhists worship at temples or viharas (monasteries). They meditate, chant, and make offerings to statues of the Buddha.' },
      { q: 'What Buddhist concept means "treat others as you wish to be treated"?', opts: ['Karma', 'Nirvana', 'Dharma', 'Zen'], ans: 'Karma', fact: 'Karma means that your actions — good or bad — have consequences. Kind actions lead to good karma, bringing happiness; harmful actions lead to suffering.' },
      { q: 'What festival celebrates the Buddha\'s birth, enlightenment and death?', opts: ['Vesak', 'Losar', 'Songkran', 'Diwali'], ans: 'Vesak', fact: 'Vesak (also called Buddha Day) is celebrated on the full moon in May. Buddhists light lanterns, pray, and perform acts of kindness on this day.' },
    ],
  },
}

export default function SpiritualityModule({ theme, onDone, onBack }) {
  const [faith, setFaith] = useState(null)
  const [phase, setPhase] = useState('intro') // intro | stories | quiz
  const [storyIdx, setStoryIdx] = useState(0)
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const missedRef = useRef(false)

  const { reaction: yaagviReaction, react: reactYaagvi } = useYaagviReactions({
    activityKey: `${faith}-${q}`,
    active: phase === 'quiz' && !feedback,
  })

  useEffect(() => { if (phase === 'quiz') reactYaagvi('question') }, [phase, q, reactYaagvi])

  const startFaith = (f) => {
    lockedRef.current = false
    completedRef.current = false
    missedRef.current = false
    setFaith(f); setPhase('intro'); setQ(0); setScore(0); setFeedback(null); setStoryIdx(0)
  }

  const handle = (ans) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const curr = FAITHS[faith].questions[q]
    const correct = ans === curr.ans
    const ns = score + (correct && !missedRef.current ? 1 : 0)
    if (!correct) missedRef.current = true
    if (correct) confetti({ particleCount: 45, spread: 65, origin: { x: 0.5, y: 0.4 } })
    reactYaagvi(correct ? 'correct' : 'wrong', correct ? { streak: ns % 3 === 0 ? 3 : 1 } : { attempt: 1 })
    setFeedback({ correct, fact: correct ? curr.fact : null, ns })
  }

  const advance = () => {
    if (completedRef.current) return
    const ns = feedback.ns
    setFeedback(null)
    if (!feedback.correct) {
      lockedRef.current = false
      return
    }
    if (q + 1 >= FAITHS[faith].questions.length) {
      completedRef.current = true
      reactYaagvi('complete')
      onDone(ns, FAITHS[faith].questions.length, { questions: FAITHS[faith].questions })
    } else {
      setQ(q + 1)
      missedRef.current = false
      lockedRef.current = false
    }
  }

  if (!faith) return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-lg">World Faiths</p>
      </div>
      <div className="flex-1 px-5 pt-6">
        <p className="font-round text-white/50 text-sm text-center mb-4">Explore the world's great religions</p>
        <div className="flex flex-col gap-3">
          {Object.keys(FAITHS).map((f, i) => (
            <motion.button key={f}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.96 }} onClick={() => startFaith(f)}
              className="p-4 rounded-2xl flex items-center gap-4 text-left"
              style={{ background: `${FAITHS[f].color}20`, border: `1px solid ${FAITHS[f].color}50` }}>
              <span className="text-3xl">{f.split(' ')[1]}</span>
              <div>
                <p className="font-bubble text-white text-lg">{f.split(' ')[0]}</p>
                <p className="font-round text-white/50 text-xs">
                {FAITHS[f].questions.length} questions{FAITHS[f].stories ? ` · ${FAITHS[f].stories.length} stories` : ''} · Learn & explore
              </p>
              </div>
              <span className="ml-auto text-white/40">→</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )

  const data = FAITHS[faith]
  const curr = data.questions[q]

  if (phase === 'intro') return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setFaith(null)} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-base">{faith}</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        <motion.div className="text-8xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          {faith.split(' ')[1]}
        </motion.div>
        <div className="w-full max-w-sm p-5 rounded-2xl" style={{ background: data.color + '20', border: `1px solid ${data.color}50` }}>
          <p className="font-round text-white/90 text-sm leading-relaxed">{data.intro}</p>
        </div>
        <div className="w-full max-w-sm flex flex-col gap-3">
          {data.stories && (
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPhase('stories')}
              className="w-full py-4 rounded-2xl font-bubble text-white text-lg"
              style={{ background: 'rgba(255,255,255,0.12)', border: `2px solid ${data.color}60` }}>
              📖 Read Stories ({data.stories.length})
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPhase('quiz')}
            className="w-full py-4 rounded-2xl font-bubble text-white text-xl"
            style={{ background: data.color, boxShadow: `0 6px 20px ${data.color}60` }}>
            Start Quiz →
          </motion.button>
        </div>
      </div>
    </div>
  )

  if (phase === 'stories') {
    const story = data.stories[storyIdx]
    return (
      <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
        <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPhase('intro')} className="font-round text-white/60 text-sm">← Back</motion.button>
          <p className="font-bubble text-white text-base">Stories · {storyIdx + 1}/{data.stories.length}</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
          <AnimatePresence mode="wait">
            <motion.div key={storyIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ border: `1px solid ${data.color}50` }}>
              <div className="px-5 py-4" style={{ background: data.color }}>
                <p className="font-bubble text-white text-lg leading-snug">{story.title}</p>
              </div>
              <div className="px-5 py-5" style={{ background: data.color + '15' }}>
                <p className="font-round text-white/90 text-sm leading-relaxed">{story.text}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-3 w-full max-w-sm">
            {storyIdx > 0 && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStoryIdx(i => i - 1)}
                className="flex-1 py-3 rounded-2xl font-round text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${data.color}40` }}>
                ← Previous
              </motion.button>
            )}
            {storyIdx < data.stories.length - 1 ? (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStoryIdx(i => i + 1)}
                className="flex-1 py-3 rounded-2xl font-bubble text-white"
                style={{ background: data.color }}>
                Next Story →
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPhase('quiz')}
                className="flex-1 py-3 rounded-2xl font-bubble text-white"
                style={{ background: data.color, boxShadow: `0 4px 16px ${data.color}60` }}>
                Start Quiz! 🎯
              </motion.button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPhase('intro')} className="font-round text-white/60 text-sm">← Intro</motion.button>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ background: data.color, width: `${(q / data.questions.length) * 100}%` }} />
        </div>
        <span className="font-round text-white/60 text-sm">{q + 1}/{data.questions.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        <InteractiveYaagvi reaction={yaagviReaction} placement="strip" className="max-w-sm" />
        <div className="w-full max-w-sm p-6 rounded-3xl text-center" style={{ background: theme.card, border: `1px solid ${data.color}40` }}>
          <p className="font-bubble text-white text-xl leading-snug">{curr.q}</p>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="w-full max-w-sm rounded-2xl overflow-hidden">
              <div className={`px-5 py-3 font-bubble text-lg text-white ${feedback.correct ? 'bg-green-500/80' : 'bg-orange-500/70'}`}>
                {feedback.correct ? '✓ Correct!' : '✗ Revisit the story idea and try again'}
              </div>
              <div className="px-5 py-3" style={{ background: `${data.color}20` }}>
                {feedback.correct && <>
                  <p className="font-round text-xs mb-1" style={{ color: data.color }}>🌟 Did you know?</p>
                  <p className="font-round text-white/80 text-sm">{feedback.fact}</p>
                </>}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={advance}
                  className="mt-3 w-full py-2.5 rounded-xl font-bubble text-white text-sm"
                  style={{ background: feedback.correct ? '#22C55E' : data.color }}
                >
                  {feedback.correct ? (q + 1 >= FAITHS[faith].questions.length ? 'Finish ✓' : 'Next →') : 'Try this question again'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {curr.opts.map(opt => (
            <motion.button key={opt} data-companion-answer={opt === curr.ans ? 'correct' : 'wrong'} whileTap={{ scale: 0.88 }} onClick={() => handle(opt)}
              className="py-4 px-3 rounded-2xl font-round text-white text-sm text-center leading-tight"
              style={{
                background: feedback?.correct && opt === curr.ans ? '#22C55E30' : theme.card,
                border: feedback?.correct && opt === curr.ans ? '2px solid #22C55E' : `1px solid ${data.color}40`,
              }}>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
