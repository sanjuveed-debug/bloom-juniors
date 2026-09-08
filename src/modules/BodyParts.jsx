import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { useVisibilityTimers } from '../hooks/useVisibilityTimers'
import { THEMES } from '../themes'
import { dailySeedFor, seededShuffle } from '../utils/seededRandom'

const PARTS = {
  head:      { name: 'Head',      emoji: '🧠', colour: '#FCD34D', fact: 'Your head holds your amazing brain! It controls everything you do — thinking, moving, and feeling.', fun: 'Your brain has about 100 billion nerve cells!' },
  eyes:      { name: 'Eyes',      emoji: '👁️',  colour: '#60A5FA', fact: 'Your eyes let you see all the beautiful colours in the world. They work like a camera!', fun: 'Your eyes can see over 10 million different colours!' },
  ears:      { name: 'Ears',      emoji: '👂', colour: '#F472B6', fact: 'Your ears help you hear sounds — music, voices, and the world around you.', fun: 'Your ears also help you balance so you don\'t fall over!' },
  nose:      { name: 'Nose',      emoji: '👃', colour: '#86EFAC', fact: 'Your nose lets you smell flowers, food, and everything around you. It also cleans the air you breathe.', fun: 'You can smell over 1 trillion different smells!' },
  mouth:     { name: 'Mouth',     emoji: '👄', colour: '#FCA5A5', fact: 'Your mouth helps you talk, eat, and smile! Your tongue helps you taste sweet, sour, salty and bitter.', fun: 'You have about 10,000 taste buds on your tongue!' },
  neck:      { name: 'Neck',      emoji: '🫀', colour: '#A5F3FC', fact: 'Your neck connects your head to your body. It lets you turn your head to look around.', fun: 'A giraffe\'s neck has the same number of bones as yours — just 7!' },
  shoulders: { name: 'Shoulders', emoji: '💪', colour: '#C4B5FD', fact: 'Your shoulders connect your arms to your body. They can move in almost any direction!', fun: 'The shoulder is the most flexible joint in your whole body!' },
  chest:     { name: 'Chest',     emoji: '❤️', colour: '#FCA5A5', fact: 'Inside your chest are your heart and lungs. Your heart pumps blood and your lungs help you breathe.', fun: 'Your heart beats about 100,000 times every single day!' },
  tummy:     { name: 'Tummy',     emoji: '🍎', colour: '#FCD34D', fact: 'Your tummy is where food goes after you eat. It breaks food down so your body can use it for energy.', fun: 'Your stomach acid is strong enough to dissolve metal!' },
  arms:      { name: 'Arms',      emoji: '🦾', colour: '#6EE7B7', fact: 'Your arms help you reach, hug, throw, and carry things. They have muscles that get stronger with exercise!', fun: 'Each arm has 30 bones from your shoulder to your fingertips!' },
  hands:     { name: 'Hands',     emoji: '🖐️', colour: '#F9A8D4', fact: 'Your hands are amazing! Each hand has 27 bones. They help you draw, write, clap, and hug.', fun: 'Your fingerprints are completely unique — no one in the world has the same ones!' },
  legs:      { name: 'Legs',      emoji: '🦵', colour: '#86EFAC', fact: 'Your legs help you walk, run, jump, and dance! The thigh bone is the biggest bone in your body.', fun: 'Your leg muscles are the strongest muscles in your whole body!' },
  knees:     { name: 'Knees',     emoji: '🦿', colour: '#C4B5FD', fact: 'Your knees are joints that help you bend your legs. They work like a hinge on a door!', fun: 'Your knee is the largest joint in your body!' },
  feet:      { name: 'Feet',      emoji: '🦶', colour: '#FCD34D', fact: 'Your feet help you stand, walk, and keep your balance. Each foot has 26 bones!', fun: 'The soles of your feet have more sweat glands than anywhere else!' },
  brain:     { name: 'Brain',     emoji: '🧠', colour: '#F9A8D4', fact: 'Your brain is the control centre of your whole body. It thinks, remembers, and sends messages everywhere.', fun: 'Your brain uses 20% of all the energy your body makes!' },
  heart:     { name: 'Heart',     emoji: '❤️', colour: '#FB7185', fact: 'Your heart is a powerful muscle that pumps blood around your body. It never stops working!', fun: 'Your heart is about the same size as your fist!' },
  lungs:     { name: 'Lungs',     emoji: '🫁', colour: '#93C5FD', fact: 'You have two lungs that help you breathe. They take in oxygen and breathe out carbon dioxide.', fun: 'If you spread your lungs flat they would cover a whole tennis court!' },
  spine:     { name: 'Spine',     emoji: '🦴', colour: '#D1D5DB', fact: 'Your spine holds you upright and protects your spinal cord. It\'s made of 33 small bones called vertebrae.', fun: 'You are actually taller in the morning than in the evening!' },
}

// ── Body SVG ──────────────────────────────────────────────────────────────────
// viewBox "0 0 280 520" — wider so nothing clips
// Character centered in the wide box with room on both sides for labels

function BodySVG({ selected, onSelect, mode }) {
  const skin   = mode === 'xray' ? '#1E293B' : '#FBBF24'
  const hair   = mode === 'xray' ? '#334155' : '#7C3AED'
  const shirt  = mode === 'xray' ? '#0F172A' : '#3B82F6'
  const pants  = mode === 'xray' ? '#0F172A' : '#1D4ED8'
  const bone   = '#E2E8F0'

  const tap = (id) => onSelect(id)
  const glow = (id) => selected === id

  // Pulsing highlight ring
  const Ring = ({ id, cx, cy, rx, ry, shape = 'ellipse' }) => {
    if (!glow(id)) return null
    const col = PARTS[id]?.colour || '#FCD34D'
    if (shape === 'circle') return (
      <motion.circle cx={cx} cy={cy} r={rx}
        fill={col + '44'} stroke={col} strokeWidth="4"
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 0.8, repeat: Infinity }} />
    )
    return (
      <motion.ellipse cx={cx} cy={cy} rx={rx} ry={ry || rx}
        fill={col + '44'} stroke={col} strokeWidth="4"
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 0.8, repeat: Infinity }} />
    )
  }

  // Large invisible tap target
  const Hit = ({ id, shape, ...props }) => {
    const interactionProps = {
      role: 'button',
      tabIndex: 0,
      'aria-label': PARTS[id]?.name || id,
      'data-body-part': id,
      style: { cursor: 'pointer' },
      onClick: () => tap(id),
      onKeyDown: event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          tap(id)
        }
      },
    }
    if (shape === 'circle') return (
      <circle {...props} {...interactionProps} fill="transparent" />
    )
    if (shape === 'rect') return (
      <rect {...props} {...interactionProps} fill="transparent" />
    )
    return (
      <ellipse {...props} {...interactionProps} fill="transparent" />
    )
  }

  return (
    <svg viewBox="0 0 280 520" width="100%" height="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>

      {/* ── BACKGROUND body (non-interactive base shapes) ─────────────────── */}

      {/* Left arm */}
      <rect x="44" y="168" width="28" height="88" rx="14" fill={skin} />
      <rect x="42" y="250" width="26" height="68" rx="13" fill={skin} />
      {/* Right arm */}
      <rect x="208" y="168" width="28" height="88" rx="14" fill={skin} />
      <rect x="212" y="250" width="26" height="68" rx="13" fill={skin} />
      {/* Hands */}
      <ellipse cx="57"  cy="324" rx="18" ry="11" fill={skin} />
      <ellipse cx="223" cy="324" rx="18" ry="11" fill={skin} />

      {/* Torso */}
      <rect x="90" y="150" width="100" height="108" rx="22" fill={shirt} />
      {/* Shorts */}
      <rect x="90" y="252" width="100" height="72" rx="16" fill={pants} />
      <line x1="140" y1="252" x2="140" y2="324" stroke={mode === 'xray' ? '#0F172A' : '#1E3A8A'} strokeWidth="3" />
      {/* Waistband */}
      <rect x="90" y="250" width="100" height="10" rx="5" fill={mode === 'xray' ? '#0F172A' : '#1E40AF'} />

      {/* Left leg */}
      <rect x="96"  y="318" width="34" height="100" rx="17" fill={skin} />
      {/* Right leg */}
      <rect x="150" y="318" width="34" height="100" rx="17" fill={skin} />
      {/* Socks */}
      <rect x="96"  y="402" width="34" height="18" rx="9" fill="white" />
      <rect x="150" y="402" width="34" height="18" rx="9" fill="white" />
      {/* Shoes */}
      <ellipse cx="113" cy="424" rx="26" ry="12" fill={mode === 'xray' ? '#1E293B' : '#374151'} />
      <ellipse cx="167" cy="424" rx="26" ry="12" fill={mode === 'xray' ? '#1E293B' : '#374151'} />
      <ellipse cx="115" cy="421" rx="20" ry="8"  fill={mode === 'xray' ? '#1E293B' : '#4B5563'} />
      <ellipse cx="169" cy="421" rx="20" ry="8"  fill={mode === 'xray' ? '#1E293B' : '#4B5563'} />

      {/* Knee caps */}
      <circle cx="113" cy="380" r="10" fill={mode === 'xray' ? '#0F172A' : skin} stroke={skin} strokeWidth="2" />
      <circle cx="167" cy="380" r="10" fill={mode === 'xray' ? '#0F172A' : skin} stroke={skin} strokeWidth="2" />

      {/* Neck */}
      <rect x="126" y="132" width="28" height="26" rx="10" fill={skin} />

      {/* Head */}
      <circle cx="140" cy="98" r="48" fill={skin} />
      {/* Hair */}
      <path d="M92,90 Q140,50 188,90 Q182,62 140,57 Q98,62 92,90Z" fill={hair} />
      {/* Ears */}
      <ellipse cx="92"  cy="100" rx="9" ry="13" fill={skin} />
      <ellipse cx="188" cy="100" rx="9" ry="13" fill={skin} />
      {/* Inner ear */}
      {mode !== 'xray' && <>
        <ellipse cx="92"  cy="100" rx="5" ry="8" fill="#F59E0B" opacity="0.5" />
        <ellipse cx="188" cy="100" rx="5" ry="8" fill="#F59E0B" opacity="0.5" />
      </>}

      {/* ── FACE ─────────────────────────────────────────────────────────── */}
      {mode !== 'xray' && <>
        {/* Eye whites */}
        <ellipse cx="126" cy="94" rx="11" ry="12" fill="white" />
        <ellipse cx="154" cy="94" rx="11" ry="12" fill="white" />
        {/* Iris */}
        <circle cx="127" cy="95" r="7" fill="#1F2937" />
        <circle cx="155" cy="95" r="7" fill="#1F2937" />
        {/* Shine */}
        <circle cx="129" cy="93" r="3" fill="white" />
        <circle cx="157" cy="93" r="3" fill="white" />
        {/* Eyebrows */}
        <path d="M116,83 Q126,78 136,83" fill="none" stroke={hair} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M144,83 Q154,78 164,83" fill="none" stroke={hair} strokeWidth="3.5" strokeLinecap="round" />
        {/* Nose */}
        <ellipse cx="140" cy="108" rx="6" ry="5" fill="#F59E0B" opacity="0.7" />
        {/* Smile */}
        <path d="M126,118 Q140,132 154,118" fill="none" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
        {/* Cheeks */}
        <ellipse cx="112" cy="114" rx="12" ry="8" fill="#FCA5A5" opacity="0.55" />
        <ellipse cx="168" cy="114" rx="12" ry="8" fill="#FCA5A5" opacity="0.55" />
      </>}

      {/* ── X-RAY SKELETON ────────────────────────────────────────────────── */}
      {mode === 'xray' && <>
        {/* Skull outline */}
        <circle cx="140" cy="98" r="42" fill="none" stroke={bone} strokeWidth="3" />
        <ellipse cx="140" cy="120" rx="18" ry="11" fill="none" stroke={bone} strokeWidth="2.5" />
        {/* Jaw */}
        <path d="M122,120 Q140,132 158,120" fill="none" stroke={bone} strokeWidth="2.5" />
        {/* Spine */}
        <line x1="140" y1="150" x2="140" y2="322" stroke={bone} strokeWidth="5" strokeDasharray="10 5" strokeLinecap="round" />
        {/* Ribcage */}
        {[175, 192, 209, 226].map(y => (<>
          <path key={`rl${y}`} d={`M140,${y} Q114,${y+9} 102,${y+5}`} fill="none" stroke={bone} strokeWidth="2.5" strokeLinecap="round" />
          <path key={`rr${y}`} d={`M140,${y} Q166,${y+9} 178,${y+5}`} fill="none" stroke={bone} strokeWidth="2.5" strokeLinecap="round" />
        </>))}
        {/* Collarbone */}
        <path d="M108,155 Q140,148 172,155" fill="none" stroke={bone} strokeWidth="3" strokeLinecap="round" />
        {/* Shoulder joints */}
        <circle cx="100" cy="164" r="10" fill="none" stroke={bone} strokeWidth="2.5" />
        <circle cx="180" cy="164" r="10" fill="none" stroke={bone} strokeWidth="2.5" />
        {/* Humerus */}
        <line x1="58"  y1="170" x2="56"  y2="254" stroke={bone} strokeWidth="4" strokeLinecap="round" />
        <line x1="222" y1="170" x2="224" y2="254" stroke={bone} strokeWidth="4" strokeLinecap="round" />
        {/* Radius/ulna */}
        <line x1="56"  y1="254" x2="54"  y2="318" stroke={bone} strokeWidth="3" strokeLinecap="round" />
        <line x1="224" y1="254" x2="226" y2="318" stroke={bone} strokeWidth="3" strokeLinecap="round" />
        {/* Pelvis */}
        <ellipse cx="140" cy="305" rx="44" ry="22" fill="none" stroke={bone} strokeWidth="3" />
        {/* Femurs */}
        <line x1="113" y1="322" x2="113" y2="402" stroke={bone} strokeWidth="5" strokeLinecap="round" />
        <line x1="167" y1="322" x2="167" y2="402" stroke={bone} strokeWidth="5" strokeLinecap="round" />
        {/* Knee caps */}
        <circle cx="113" cy="380" r="9" fill="none" stroke={bone} strokeWidth="3" />
        <circle cx="167" cy="380" r="9" fill="none" stroke={bone} strokeWidth="3" />
        {/* Shin */}
        <line x1="113" y1="389" x2="113" y2="420" stroke={bone} strokeWidth="4" strokeLinecap="round" />
        <line x1="167" y1="389" x2="167" y2="420" stroke={bone} strokeWidth="4" strokeLinecap="round" />
        {/* Organs */}
        {/* Brain */}
        <ellipse cx="140" cy="90" rx="36" ry="30" fill="none" stroke="#F9A8D4" strokeWidth="2.5" strokeDasharray="6 3" />
        <path d="M118,80 Q128,68 140,73 Q152,68 162,80" fill="none" stroke="#F9A8D4" strokeWidth="2" />
        {/* Heart */}
        <path d="M131,188 Q124,180 124,188 Q124,198 140,210 Q156,198 156,188 Q156,180 149,188 Q145,180 140,186 Q135,180 131,188Z"
          fill="none" stroke="#FB7185" strokeWidth="2.5" />
        {/* Lungs */}
        <ellipse cx="115" cy="198" rx="16" ry="26" fill="none" stroke="#93C5FD" strokeWidth="2.5" />
        <ellipse cx="165" cy="198" rx="16" ry="26" fill="none" stroke="#93C5FD" strokeWidth="2.5" />
      </>}

      {/* ── GLOWING SELECTION RINGS ───────────────────────────────────────── */}
      <Ring id="head"      cx={140} cy={98}  rx={50} shape="circle" />
      <Ring id="eyes"      cx={140} cy={94}  rx={36} ry={18} />
      <Ring id="ears"      cx={92}  cy={100} rx={12} ry={16} />
      <Ring id="nose"      cx={140} cy={108} rx={12} ry={10} />
      <Ring id="mouth"     cx={140} cy={120} rx={18} ry={10} />
      <Ring id="neck"      cx={140} cy={145} rx={20} ry={14} />
      <Ring id="shoulders" cx={140} cy={162} rx={58} ry={18} />
      <Ring id="chest"     cx={140} cy={190} rx={46} ry={34} />
      <Ring id="tummy"     cx={140} cy={240} rx={44} ry={26} />
      <Ring id="arms"      cx={58}  cy={254} rx={18} ry={50} />
      <Ring id="hands"     cx={57}  cy={324} rx={22} ry={14} />
      <Ring id="legs"      cx={113} cy={362} rx={24} ry={50} />
      <Ring id="knees"     cx={113} cy={380} rx={18} ry={16} />
      <Ring id="feet"      cx={113} cy={424} rx={30} ry={16} />
      {mode === 'xray' && <>
        <Ring id="brain"   cx={140} cy={90}  rx={40} ry={34} />
        <Ring id="heart"   cx={140} cy={196} rx={20} ry={24} />
        <Ring id="lungs"   cx={140} cy={198} rx={56} ry={30} />
        <Ring id="spine"   cx={140} cy={240} rx={16} ry={80} />
      </>}

      {/* ── HIT TARGETS (invisible, on top) ──────────────────────────────── */}
      {/* Head */}
      <Hit id="head"      shape="circle" cx={140} cy={98}  r={52} />
      {/* Eyes */}
      <Hit id="eyes"      shape="rect"   x={110}  y={78}   width={60} height={30} rx="12" />
      {/* Ears */}
      <Hit id="ears"      shape="ellipse" cx={92}  cy={100} rx={20} ry={26} />
      <Hit id="ears"      shape="ellipse" cx={188} cy={100} rx={20} ry={26} />
      {/* Nose */}
      <Hit id="nose"      shape="ellipse" cx={140} cy={108} rx={16} ry={14} />
      {/* Mouth */}
      <Hit id="mouth"     shape="rect"    x={118}  y={114}  width={44} height={18} rx="9" />
      {/* Neck */}
      <Hit id="neck"      shape="rect"    x={120}  y={130}  width={40} height={26} rx="12" />
      {/* Shoulders */}
      <Hit id="shoulders" shape="rect"    x={82}   y={148}  width={116} height={26} rx="12" />
      {/* Chest */}
      <Hit id="chest"     shape="rect"    x={90}   y={160}  width={100} height={64} rx="14" />
      {/* Tummy */}
      <Hit id="tummy"     shape="rect"    x={90}   y={222}  width={100} height={72} rx="14" />
      {/* Arms */}
      <Hit id="arms"      shape="rect"    x={36}   y={158}  width={46} height={112} rx="20" />
      <Hit id="arms"      shape="rect"    x={198}  y={158}  width={46} height={112} rx="20" />
      {/* Hands */}
      <Hit id="hands"     shape="ellipse" cx={57}  cy={324} rx={28} ry={18} />
      <Hit id="hands"     shape="ellipse" cx={223} cy={324} rx={28} ry={18} />
      {/* Legs */}
      <Hit id="legs"      shape="rect"    x={84}   y={316}  width={48} height={80} rx="20" />
      <Hit id="legs"      shape="rect"    x={148}  y={316}  width={48} height={80} rx="20" />
      {/* Knees */}
      <Hit id="knees"     shape="circle"  cx={113} cy={380} r={22} />
      <Hit id="knees"     shape="circle"  cx={167} cy={380} r={22} />
      {/* Feet */}
      <Hit id="feet"      shape="ellipse" cx={113} cy={424} rx={30} ry={18} />
      <Hit id="feet"      shape="ellipse" cx={167} cy={424} rx={30} ry={18} />
      {/* X-Ray organs */}
      {mode === 'xray' && <>
        <Hit id="brain" shape="ellipse" cx={140} cy={90}  rx={40} ry={34} />
        <Hit id="heart" shape="ellipse" cx={140} cy={196} rx={22} ry={26} />
        <Hit id="lungs" shape="ellipse" cx={115} cy={198} rx={20} ry={30} />
        <Hit id="lungs" shape="ellipse" cx={165} cy={198} rx={20} ry={30} />
        <Hit id="spine" shape="rect"    x={128}  y={148}  width={24} height={180} rx="12" />
      </>}

      {/* ── PART NAME LABELS (inside SVG, no clipping) ────────────────────── */}
      {mode !== 'xray' && selected && PARTS[selected] && (
        <motion.g initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          <rect x={92} y={460} width={96} height={28} rx={14}
            fill={PARTS[selected].colour} opacity={0.95} />
          <text x={140} y={479} textAnchor="middle" fill="#1F2937"
            fontSize="13" fontWeight="bold" fontFamily="sans-serif">
            {PARTS[selected].emoji} {PARTS[selected].name}
          </text>
        </motion.g>
      )}
      {mode === 'xray' && selected && PARTS[selected] && (
        <motion.g initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          <rect x={92} y={460} width={96} height={28} rx={14}
            fill={PARTS[selected].colour} opacity={0.9} />
          <text x={140} y={479} textAnchor="middle" fill="#1F2937"
            fontSize="13" fontWeight="bold" fontFamily="sans-serif">
            {PARTS[selected].emoji} {PARTS[selected].name}
          </text>
        </motion.g>
      )}
    </svg>
  )
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
const QUIZ_POOL = ['head','eyes','ears','nose','mouth','chest','arms','hands','legs','feet','knees','shoulders']
function makeQuiz() {
  return seededShuffle([...QUIZ_POOL], dailySeedFor('bodyparts')).slice(0, 8)
    .map(id => ({ id, question: `Tap the ${PARTS[id].name}!` }))
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BodyParts({ avatar, onAddStars, onBack, profileName }) {
  const theme     = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()

  const [mode,     setMode]     = useState('body')
  const [selected, setSelected] = useState(null)
  const [screen,   setScreen]   = useState('explore')
  const [quiz,     setQuiz]     = useState([])
  const [qIdx,     setQIdx]     = useState(0)
  const [score,    setScore]    = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [done,     setDone]     = useState(false)
  const lockedRef   = useRef(false)
  const completedRef = useRef(false)
  const missedRef = useRef(false)
  const strugglesRef = useRef([])
  const { track }   = useVisibilityTimers()

  const part = selected ? PARTS[selected] : null

  const handleTap = (id) => {
    setSelected(id)
    const p = PARTS[id]
    if (!p) return
    if (screen === 'quiz') { handleQuizTap(id); return }
    speak(`${p.name}! ${p.fact}`, { mood: 'instruct' })
  }

  const startQuiz = () => {
    const q = makeQuiz()
    lockedRef.current = false
    completedRef.current = false
    missedRef.current = false
    strugglesRef.current = []
    setQuiz(q); setQIdx(0); setScore(0); setFeedback(null); setDone(false); setSelected(null)
    setScreen('quiz')
    speak(`Quiz time! ${q[0].question}`, { mood: 'question' })
  }

  const handleQuizTap = (id) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = quiz[qIdx]?.id === id
    const nextScore = score + (correct && !missedRef.current ? 1 : 0)
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      setScore(nextScore)
      speak(`Yes! That's the ${PARTS[id].name}! Brilliant!`, { mood: 'celebrate' })
      confetti({ particleCount: 40, spread: 60, origin: { x: 0.5, y: 0.5 } })
    } else {
      if (!missedRef.current) strugglesRef.current.push(quiz[qIdx].question)
      missedRef.current = true
      speak(`Good try. That is the ${PARTS[id].name}. Listen to the clue and tap another body part.`, { mood: 'instruct' })
    }
    track(() => {
      if (!correct) {
        setFeedback(null); setSelected(null); lockedRef.current = false
        return
      }
      const next = qIdx + 1
      if (next >= quiz.length) {
        completedRef.current = true
        setDone(true)
        onAddStars('anatomy', nextScore >= 6 ? 3 : nextScore >= 4 ? 2 : 1, { total: quiz.length, correct: nextScore, struggles: strugglesRef.current })
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.5, y: 0.3 } })
        speak(`Fantastic ${profileName || 'explorer'}! Quiz done! You got ${nextScore} out of ${quiz.length}!`, { mood: 'celebrate' })
      } else {
        setQIdx(next); setFeedback(null); setSelected(null)
        missedRef.current = false
        speak(quiz[next].question, { mood: 'question' })
        lockedRef.current = false
      }
    }, 1400)
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  if (screen === 'quiz' && done) {
    const s = score
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280 }}>
          <div className="text-7xl mb-3">🧠</div>
          <h2 className="font-bubble text-3xl shimmer-text mb-2">Quiz Done!</h2>
          <p className="font-round text-xl mb-1" style={{ color: theme.text }}>{s}/{quiz.length} correct!</p>
          <div className="text-4xl my-3">{'⭐'.repeat(s >= 6 ? 3 : s >= 4 ? 2 : 1)}</div>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => { setScreen('explore'); setSelected(null); setFeedback(null) }}
            className="bubble-btn px-8 py-4 text-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            Explore More 🔍
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const xrayParts = ['brain', 'heart', 'lungs', 'spine']
  const bodyParts = ['head','eyes','ears','nose','mouth','neck','shoulders','chest','tummy','arms','hands','legs','knees','feet']
  const currentParts = mode === 'xray' ? xrayParts : bodyParts

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-safe pb-2 shrink-0">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <p className="font-bubble text-lg" style={{ color: theme.primary }}>🫀 My Body</p>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={screen === 'quiz'
            ? () => { setScreen('explore'); setFeedback(null); setSelected(null) }
            : startQuiz}
          className="px-3 py-1.5 rounded-xl font-round text-xs font-bold shadow"
          style={{
            background: screen === 'quiz'
              ? theme.card
              : `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            color: screen === 'quiz' ? theme.text : '#fff',
          }}>
          {screen === 'quiz' ? '← Explore' : '🧠 Quiz'}
        </motion.button>
      </div>

      {/* ── Mode tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 pb-2 shrink-0">
        {[{ id: 'body', label: '🧍 Body' }, { id: 'xray', label: '🦴 X-Ray' }].map(m => (
          <motion.button key={m.id} whileTap={{ scale: 0.93 }}
            onClick={() => { setMode(m.id); setSelected(null) }}
            className="flex-1 py-2.5 rounded-2xl font-round text-sm font-bold"
            style={{
              background: mode === m.id
                ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
                : theme.card,
              color: mode === m.id ? '#fff' : theme.text,
            }}>
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* ── Quiz question banner ───────────────────────────────────────────── */}
      <AnimatePresence>
        {screen === 'quiz' && !done && (
          <motion.div key={qIdx}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-4 mb-1 px-4 py-2.5 rounded-2xl text-center shrink-0"
            style={{ background: theme.card, border: `2px solid ${theme.primary}55` }}>
            <p className="font-bubble text-sm" style={{ color: theme.primary }}>
              Q{qIdx + 1}/{quiz.length}: {quiz[qIdx]?.question}
            </p>
            {feedback && (
              <p className="font-round text-sm mt-0.5 font-bold"
                style={{ color: feedback === 'correct' ? '#22c55e' : '#ef4444' }}>
                {feedback === 'correct' ? '✓ Brilliant!' : '✗ Not quite!'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Body figure — centered, fills width ───────────────────────────── */}
      <div className="flex-1 flex flex-col items-center overflow-hidden px-2"
        style={{ minHeight: 0 }}>
        <div className="w-full flex items-center justify-center"
          style={{ height: 'min(55vh, 380px)' }}>
          <BodySVG selected={selected} onSelect={handleTap} mode={mode} />
        </div>

        {/* ── Info card ─────────────────────────────────────────────────────── */}
        <div className="w-full px-4 flex flex-col gap-2 pb-4 overflow-y-auto scroll-ios">

          {/* Tap hint */}
          {!selected && (
            <div className="rounded-2xl p-3 text-center"
              style={{ background: theme.card }}>
              <p className="text-2xl mb-1">{screen === 'quiz' ? '🎯' : '👆'}</p>
              <p className="font-round text-sm" style={{ color: theme.text }}>
                {screen === 'quiz'
                  ? quiz[qIdx]?.question
                  : 'Tap any part of the body to learn about it!'}
              </p>
            </div>
          )}

          {/* Part detail card */}
          <AnimatePresence mode="wait">
            {part && (
              <motion.div key={selected}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl overflow-hidden shadow-md"
                style={{ background: theme.card }}>
                <div className="px-4 py-2.5 flex items-center gap-2"
                  style={{ background: part.colour + '33', borderBottom: `2px solid ${part.colour}55` }}>
                  <span className="text-2xl">{part.emoji}</span>
                  <p className="font-bubble text-base" style={{ color: theme.primary }}>{part.name}</p>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <p className="font-round text-sm leading-relaxed" style={{ color: theme.text }}>{part.fact}</p>
                  <div className="rounded-xl p-2.5" style={{ background: part.colour + '22' }}>
                    <p className="font-round text-xs font-bold mb-0.5" style={{ color: theme.primary }}>✨ Fun fact!</p>
                    <p className="font-round text-xs" style={{ color: theme.text }}>{part.fun}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Part chip pills */}
          {screen === 'explore' && (
            <div className="rounded-2xl p-3" style={{ background: theme.card }}>
              <p className="font-bubble text-xs mb-2" style={{ color: theme.primary }}>
                {mode === 'xray' ? '🦴 Tap to explore inside' : '🧍 Tap to explore'}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentParts.map(id => (
                  <motion.button key={id} whileTap={{ scale: 0.9 }}
                    onClick={() => handleTap(id)}
                    className="px-3 py-1.5 rounded-full font-round text-xs font-bold"
                    style={{
                      background: selected === id ? PARTS[id].colour : PARTS[id].colour + '33',
                      color: selected === id ? '#1F2937' : theme.text,
                      border: `1.5px solid ${PARTS[id].colour}`,
                    }}>
                    {PARTS[id].emoji} {PARTS[id].name}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
