import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { sessionSeedFor, seededShuffle } from '../../utils/seededRandom'

const COUNTRIES = [
  { country: 'France',       flag: '🇫🇷', continent: 'Europe',   capital: 'Paris',        opts: ['Paris', 'Lyon', 'Brussels', 'Rome']           },
  { country: 'Japan',        flag: '🇯🇵', continent: 'Asia',     capital: 'Tokyo',        opts: ['Tokyo', 'Osaka', 'Seoul', 'Beijing']          },
  { country: 'Brazil',       flag: '🇧🇷', continent: 'S. America', capital: 'Brasília',   opts: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Lima'] },
  { country: 'Egypt',        flag: '🇪🇬', continent: 'Africa',   capital: 'Cairo',        opts: ['Cairo', 'Nairobi', 'Accra', 'Tunis']          },
  { country: 'Australia',    flag: '🇦🇺', continent: 'Oceania',  capital: 'Canberra',     opts: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'] },
  { country: 'India',        flag: '🇮🇳', continent: 'Asia',     capital: 'New Delhi',    opts: ['Mumbai', 'New Delhi', 'Kolkata', 'Bangalore']  },
  { country: 'Germany',      flag: '🇩🇪', continent: 'Europe',   capital: 'Berlin',       opts: ['Munich', 'Frankfurt', 'Berlin', 'Hamburg']    },
  { country: 'Canada',       flag: '🇨🇦', continent: 'N. America', capital: 'Ottawa',     opts: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal']  },
  { country: 'South Africa', flag: '🇿🇦', continent: 'Africa',   capital: 'Pretoria',     opts: ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban'] },
  { country: 'China',        flag: '🇨🇳', continent: 'Asia',     capital: 'Beijing',      opts: ['Shanghai', 'Beijing', 'Hong Kong', 'Chengdu'] },
  { country: 'Italy',        flag: '🇮🇹', continent: 'Europe',   capital: 'Rome',         opts: ['Rome', 'Milan', 'Naples', 'Florence']         },
  { country: 'Mexico',       flag: '🇲🇽', continent: 'N. America', capital: 'Mexico City', opts: ['Guadalajara', 'Mexico City', 'Cancún', 'Monterrey'] },
  { country: 'Russia',       flag: '🇷🇺', continent: 'Europe/Asia', capital: 'Moscow',    opts: ['Moscow', 'St Petersburg', 'Vladivostok', 'Kazan'] },
  { country: 'Kenya',        flag: '🇰🇪', continent: 'Africa',   capital: 'Nairobi',      opts: ['Nairobi', 'Mombasa', 'Accra', 'Lagos']        },
  { country: 'Argentina',    flag: '🇦🇷', continent: 'S. America', capital: 'Buenos Aires', opts: ['Buenos Aires', 'Santiago', 'Montevideo', 'Lima'] },
]

const HARDER_COUNTRIES = [
  { country: 'Portugal',    flag: '🇵🇹', continent: 'Europe',   capital: 'Lisbon',         opts: ['Lisbon', 'Porto', 'Madrid', 'Barcelona']        },
  { country: 'Thailand',    flag: '🇹🇭', continent: 'Asia',     capital: 'Bangkok',        opts: ['Bangkok', 'Hanoi', 'Jakarta', 'Kuala Lumpur']    },
  { country: 'Nigeria',     flag: '🇳🇬', continent: 'Africa',   capital: 'Abuja',          opts: ['Lagos', 'Abuja', 'Accra', 'Nairobi']             },
  { country: 'New Zealand', flag: '🇳🇿', continent: 'Oceania',  capital: 'Wellington',     opts: ['Auckland', 'Wellington', 'Canberra', 'Sydney']   },
  { country: 'Peru',        flag: '🇵🇪', continent: 'S. America', capital: 'Lima',         opts: ['Lima', 'Bogotá', 'Quito', 'La Paz']              },
  { country: 'Sweden',      flag: '🇸🇪', continent: 'Europe',   capital: 'Stockholm',      opts: ['Stockholm', 'Oslo', 'Copenhagen', 'Helsinki']    },
  { country: 'Pakistan',    flag: '🇵🇰', continent: 'Asia',     capital: 'Islamabad',      opts: ['Karachi', 'Islamabad', 'Lahore', 'New Delhi']     },
  { country: 'Morocco',     flag: '🇲🇦', continent: 'Africa',   capital: 'Rabat',          opts: ['Rabat', 'Casablanca', 'Tunis', 'Algiers']        },
  { country: 'Colombia',    flag: '🇨🇴', continent: 'S. America', capital: 'Bogotá',       opts: ['Bogotá', 'Medellín', 'Lima', 'Caracas']          },
  { country: 'Saudi Arabia',flag: '🇸🇦', continent: 'Asia',     capital: 'Riyadh',         opts: ['Riyadh', 'Dubai', 'Abu Dhabi', 'Kuwait City']    },
]

export default function WorldMapModule({ theme, onDone, onBack, played = 0 }) {
  const pool = played >= 3 ? [...COUNTRIES, ...HARDER_COUNTRIES] : COUNTRIES
  const questions = useMemo(() => seededShuffle([...pool], sessionSeedFor('worldmap', played)).slice(0, 12), [played])
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const curr = questions[q]
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const missedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const handle = (ans) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = ans === curr.capital
    const ns = score + (correct && !missedRef.current ? 1 : 0)
    if (!correct) missedRef.current = true
    if (correct) confetti({ particleCount: 50, spread: 70, origin: { x: 0.5, y: 0.4 } })
    setFeedback({ correct, ans: correct ? curr.capital : null })
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (!correct) {
        lockedRef.current = false
        return
      }
      if (q + 1 >= questions.length) {
        completedRef.current = true
        onDone(ns, questions.length, { questions })
      } else {
        setQ(q + 1)
        missedRef.current = false
        lockedRef.current = false
      }
    }, 1300)
    timersRef.current.push(id)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ background: theme.accent, width: `${(q / questions.length) * 100}%` }} />
        </div>
        <span className="font-round text-white/60 text-sm">{q + 1}/{questions.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        <div className="w-full max-w-sm p-6 rounded-3xl text-center" style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
          <motion.div className="text-8xl mb-3"
            key={curr.country}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}>
            {curr.flag}
          </motion.div>
          <p className="font-bubble text-white text-2xl mb-1">{curr.country}</p>
          <span className="font-round text-xs px-2 py-0.5 rounded-full" style={{ background: `${theme.primary}40`, color: theme.accent }}>
            🌍 {curr.continent}
          </span>
          <p className="font-round text-white/50 text-sm mt-3">What is the capital city?</p>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`px-6 py-3 rounded-2xl font-bubble text-lg text-white ${feedback.correct ? 'bg-green-500/80' : 'bg-orange-500/70'}`}>
              {feedback.correct ? `✓ ${feedback.ans}!` : '✗ Use the flag and continent clue, then try again'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {curr.opts.map(opt => (
            <motion.button key={opt} data-companion-answer={opt === curr.capital ? 'correct' : 'wrong'} whileTap={{ scale: 0.88 }} onClick={() => handle(opt)}
              className="py-4 rounded-2xl font-round text-white text-sm text-center"
              style={{
                background: feedback?.correct && opt === curr.capital ? '#22C55E30' : theme.card,
                border: feedback?.correct && opt === curr.capital ? '2px solid #22C55E' : `2px solid ${theme.primary}30`,
              }}>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
