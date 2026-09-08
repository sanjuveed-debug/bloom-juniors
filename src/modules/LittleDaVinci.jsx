import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { THEMES } from '../themes'

// ── Colour palette ────────────────────────────────────────────────────────────
const COLORS = [
  '#EF4444','#F97316','#EAB308','#22C55E','#14B8A6',
  '#3B82F6','#8B5CF6','#EC4899','#FFFFFF','#1F2937',
  '#FCD34D','#6EE7B7','#A5B4FC','#FCA5A5','#86EFAC',
  '#7DD3FC','#F0ABFC','#D97706','#78716C','#BE185D',
]
const STAMPS = ['🌟','❤️','🌈','🦋','🌸','⭐','🐝','🦄','🐱','🐸','☀️','🌺']
const BRUSH_SIZES = [{ label:'Tiny', value:3 },{ label:'Small', value:8 },{ label:'Big', value:18 },{ label:'Huge', value:35 }]

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? [parseInt(r[1],16), parseInt(r[2],16), parseInt(r[3],16)] : [0,0,0]
}

// ── SVG Coloring page templates ───────────────────────────────────────────────
// All have white fills + thick black outlines — perfect coloring-book style
const T = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340"><rect width="300" height="340" fill="white"/>${body}</svg>`

const TEMPLATES = [
  {
    id:'cat', label:'Cat', emoji:'🐱',
    svg: T(`
      <polygon points="62,128 90,52 128,128" fill="white" stroke="black" stroke-width="9" stroke-linejoin="round"/>
      <polygon points="172,128 210,52 238,128" fill="white" stroke="black" stroke-width="9" stroke-linejoin="round"/>
      <circle cx="150" cy="192" r="118" fill="white" stroke="black" stroke-width="9"/>
      <ellipse cx="108" cy="172" rx="24" ry="18" fill="white" stroke="black" stroke-width="6"/>
      <ellipse cx="192" cy="172" rx="24" ry="18" fill="white" stroke="black" stroke-width="6"/>
      <ellipse cx="108" cy="172" rx="10" ry="16" fill="black"/>
      <ellipse cx="192" cy="172" rx="10" ry="16" fill="black"/>
      <circle cx="104" cy="167" r="4" fill="white"/>
      <circle cx="188" cy="167" r="4" fill="white"/>
      <polygon points="150,212 138,228 162,228" fill="white" stroke="black" stroke-width="5" stroke-linejoin="round"/>
      <path d="M138,228 Q128,246 150,240 Q172,246 162,228" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
      <line x1="72" y1="218" x2="134" y2="218" stroke="black" stroke-width="4" stroke-linecap="round"/>
      <line x1="68" y1="230" x2="132" y2="226" stroke="black" stroke-width="4" stroke-linecap="round"/>
      <line x1="166" y1="218" x2="228" y2="218" stroke="black" stroke-width="4" stroke-linecap="round"/>
      <line x1="168" y1="226" x2="232" y2="230" stroke="black" stroke-width="4" stroke-linecap="round"/>
    `)
  },
  {
    id:'dog', label:'Dog', emoji:'🐶',
    svg: T(`
      <ellipse cx="56" cy="168" rx="40" ry="74" fill="white" stroke="black" stroke-width="9" transform="rotate(-12 56 168)"/>
      <ellipse cx="244" cy="168" rx="40" ry="74" fill="white" stroke="black" stroke-width="9" transform="rotate(12 244 168)"/>
      <ellipse cx="150" cy="165" rx="112" ry="108" fill="white" stroke="black" stroke-width="9"/>
      <ellipse cx="150" cy="228" rx="58" ry="42" fill="white" stroke="black" stroke-width="7"/>
      <ellipse cx="150" cy="212" rx="24" ry="17" fill="black"/>
      <circle cx="143" cy="215" r="5" fill="white"/>
      <circle cx="157" cy="215" r="5" fill="white"/>
      <path d="M150,228 Q128,252 114,242" fill="none" stroke="black" stroke-width="6" stroke-linecap="round"/>
      <path d="M150,228 Q172,252 186,242" fill="none" stroke="black" stroke-width="6" stroke-linecap="round"/>
      <circle cx="106" cy="152" r="24" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="194" cy="152" r="24" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="110" cy="154" r="13" fill="black"/>
      <circle cx="198" cy="154" r="13" fill="black"/>
      <circle cx="106" cy="150" r="5" fill="white"/>
      <circle cx="194" cy="150" r="5" fill="white"/>
      <path d="M90,133 Q106,124 122,133" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
      <path d="M178,133 Q194,124 210,133" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
    `)
  },
  {
    id:'butterfly', label:'Butterfly', emoji:'🦋',
    svg: T(`
      <ellipse cx="88" cy="128" rx="82" ry="105" fill="white" stroke="black" stroke-width="9" transform="rotate(-18 88 128)"/>
      <ellipse cx="212" cy="128" rx="82" ry="105" fill="white" stroke="black" stroke-width="9" transform="rotate(18 212 128)"/>
      <ellipse cx="92" cy="248" rx="56" ry="68" fill="white" stroke="black" stroke-width="8" transform="rotate(22 92 248)"/>
      <ellipse cx="208" cy="248" rx="56" ry="68" fill="white" stroke="black" stroke-width="8" transform="rotate(-22 208 248)"/>
      <circle cx="86" cy="110" r="26" fill="white" stroke="black" stroke-width="5"/>
      <circle cx="214" cy="110" r="26" fill="white" stroke="black" stroke-width="5"/>
      <circle cx="94" cy="240" r="18" fill="white" stroke="black" stroke-width="5"/>
      <circle cx="206" cy="240" r="18" fill="white" stroke="black" stroke-width="5"/>
      <ellipse cx="150" cy="188" rx="16" ry="80" fill="white" stroke="black" stroke-width="8"/>
      <circle cx="150" cy="110" r="22" fill="white" stroke="black" stroke-width="7"/>
      <path d="M145,92 Q130,58 118,42" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
      <circle cx="118" cy="42" r="8" fill="black"/>
      <path d="M155,92 Q170,58 182,42" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
      <circle cx="182" cy="42" r="8" fill="black"/>
    `)
  },
  {
    id:'flower', label:'Flower', emoji:'🌸',
    svg: T(`
      <rect x="142" y="222" width="16" height="108" rx="8" fill="white" stroke="black" stroke-width="7"/>
      <ellipse cx="112" cy="270" rx="42" ry="20" fill="white" stroke="black" stroke-width="6" transform="rotate(-32 112 270)"/>
      <ellipse cx="188" cy="286" rx="42" ry="20" fill="white" stroke="black" stroke-width="6" transform="rotate(32 188 286)"/>
      <ellipse cx="150" cy="80" rx="36" ry="62" fill="white" stroke="black" stroke-width="8"/>
      <ellipse cx="150" cy="80" rx="36" ry="62" fill="white" stroke="black" stroke-width="8" transform="rotate(60 150 163)"/>
      <ellipse cx="150" cy="80" rx="36" ry="62" fill="white" stroke="black" stroke-width="8" transform="rotate(120 150 163)"/>
      <ellipse cx="150" cy="80" rx="36" ry="62" fill="white" stroke="black" stroke-width="8" transform="rotate(180 150 163)"/>
      <ellipse cx="150" cy="80" rx="36" ry="62" fill="white" stroke="black" stroke-width="8" transform="rotate(240 150 163)"/>
      <ellipse cx="150" cy="80" rx="36" ry="62" fill="white" stroke="black" stroke-width="8" transform="rotate(300 150 163)"/>
      <circle cx="150" cy="163" r="44" fill="white" stroke="black" stroke-width="8"/>
      <circle cx="150" cy="153" r="9" fill="black"/>
      <circle cx="164" cy="162" r="9" fill="black"/>
      <circle cx="159" cy="177" r="9" fill="black"/>
      <circle cx="141" cy="177" r="9" fill="black"/>
      <circle cx="136" cy="162" r="9" fill="black"/>
    `)
  },
  {
    id:'sun', label:'Sun', emoji:'☀️',
    svg: T(`
      <line x1="150" y1="18" x2="150" y2="62" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="222" y1="42" x2="198" y2="78" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="264" y1="112" x2="226" y2="124" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="258" y1="196" x2="218" y2="183" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="208" y1="258" x2="187" y2="228" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="150" y1="278" x2="150" y2="236" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="92" y1="258" x2="113" y2="228" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="42" y1="196" x2="82" y2="183" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="36" y1="112" x2="74" y2="124" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <line x1="78" y1="42" x2="102" y2="78" stroke="black" stroke-width="9" stroke-linecap="round"/>
      <circle cx="150" cy="150" r="88" fill="white" stroke="black" stroke-width="9"/>
      <circle cx="118" cy="136" r="13" fill="black"/>
      <circle cx="182" cy="136" r="13" fill="black"/>
      <circle cx="113" cy="131" r="5" fill="white"/>
      <circle cx="177" cy="131" r="5" fill="white"/>
      <path d="M116,172 Q150,198 184,172" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
      <circle cx="100" cy="164" r="16" fill="none" stroke="black" stroke-width="4" stroke-dasharray="4 3"/>
      <circle cx="200" cy="164" r="16" fill="none" stroke="black" stroke-width="4" stroke-dasharray="4 3"/>
    `)
  },
  {
    id:'rocket', label:'Rocket', emoji:'🚀',
    svg: T(`
      <rect x="105" y="105" width="90" height="152" rx="20" fill="white" stroke="black" stroke-width="8"/>
      <path d="M105,105 Q150,22 195,105Z" fill="white" stroke="black" stroke-width="8" stroke-linejoin="round"/>
      <path d="M105,198 L58,268 L105,248Z" fill="white" stroke="black" stroke-width="7" stroke-linejoin="round"/>
      <path d="M195,198 L242,268 L195,248Z" fill="white" stroke="black" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="150" cy="162" r="30" fill="white" stroke="black" stroke-width="7"/>
      <circle cx="150" cy="162" r="14" fill="white" stroke="black" stroke-width="5"/>
      <ellipse cx="138" cy="272" rx="18" ry="28" fill="white" stroke="black" stroke-width="6"/>
      <ellipse cx="162" cy="272" rx="18" ry="28" fill="white" stroke="black" stroke-width="6"/>
      <ellipse cx="150" cy="280" rx="12" ry="20" fill="white" stroke="black" stroke-width="5"/>
      <text x="38" y="76" font-size="24" fill="black" font-family="serif">★</text>
      <text x="232" y="110" font-size="20" fill="black" font-family="serif">★</text>
      <text x="46" y="175" font-size="16" fill="black" font-family="serif">★</text>
    `)
  },
  {
    id:'house', label:'House', emoji:'🏠',
    svg: T(`
      <rect x="40" y="168" width="220" height="162" rx="6" fill="white" stroke="black" stroke-width="8"/>
      <polygon points="18,178 150,42 282,178" fill="white" stroke="black" stroke-width="8" stroke-linejoin="round"/>
      <rect x="196" y="56" width="30" height="68" fill="white" stroke="black" stroke-width="7"/>
      <rect x="118" y="242" width="64" height="88" rx="8" fill="white" stroke="black" stroke-width="7"/>
      <circle cx="172" cy="288" r="6" fill="black"/>
      <rect x="56" y="202" width="56" height="50" rx="6" fill="white" stroke="black" stroke-width="6"/>
      <line x1="84" y1="202" x2="84" y2="252" stroke="black" stroke-width="4"/>
      <line x1="56" y1="227" x2="112" y2="227" stroke="black" stroke-width="4"/>
      <rect x="188" y="202" width="56" height="50" rx="6" fill="white" stroke="black" stroke-width="6"/>
      <line x1="216" y1="202" x2="216" y2="252" stroke="black" stroke-width="4"/>
      <line x1="188" y1="227" x2="244" y2="227" stroke="black" stroke-width="4"/>
      <circle cx="210" cy="45" r="12" fill="white" stroke="black" stroke-width="5"/>
      <circle cx="222" cy="30" r="16" fill="white" stroke="black" stroke-width="5"/>
      <circle cx="237" cy="18" r="10" fill="white" stroke="black" stroke-width="4"/>
    `)
  },
  {
    id:'fish', label:'Fish', emoji:'🐠',
    svg: T(`
      <path d="M58,170 L12,118 L12,222Z" fill="white" stroke="black" stroke-width="8" stroke-linejoin="round"/>
      <ellipse cx="172" cy="170" rx="118" ry="88" fill="white" stroke="black" stroke-width="9"/>
      <path d="M132,88 Q162,52 200,86" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
      <path d="M148,252 Q172,292 202,254" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
      <path d="M155,170 Q138,208 175,224 Q186,192 155,170Z" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="240" cy="152" r="25" fill="white" stroke="black" stroke-width="7"/>
      <circle cx="245" cy="149" r="14" fill="black"/>
      <circle cx="241" cy="145" r="5" fill="white"/>
      <path d="M272,174 Q288,190 272,202" fill="none" stroke="black" stroke-width="6" stroke-linecap="round"/>
      <path d="M158,138 Q174,128 190,138" fill="none" stroke="black" stroke-width="4"/>
      <path d="M142,156 Q158,146 174,156" fill="none" stroke="black" stroke-width="4"/>
      <path d="M176,156 Q192,146 208,156" fill="none" stroke="black" stroke-width="4"/>
      <path d="M158,174 Q174,164 190,174" fill="none" stroke="black" stroke-width="4"/>
      <path d="M142,192 Q158,182 174,192" fill="none" stroke="black" stroke-width="4"/>
      <path d="M176,192 Q192,182 208,192" fill="none" stroke="black" stroke-width="4"/>
    `)
  },
  {
    id:'dinosaur', label:'Dinosaur', emoji:'🦕',
    svg: T(`
      <path d="M228,185 Q282,175 280,222 Q278,252 248,246 L222,226Z" fill="white" stroke="black" stroke-width="8" stroke-linejoin="round"/>
      <ellipse cx="152" cy="208" rx="82" ry="72" fill="white" stroke="black" stroke-width="9"/>
      <rect x="116" y="102" width="54" height="92" rx="26" fill="white" stroke="black" stroke-width="9"/>
      <ellipse cx="115" cy="90" rx="72" ry="50" fill="white" stroke="black" stroke-width="9"/>
      <path d="M52,98 L136,98" stroke="black" stroke-width="6" stroke-linecap="round"/>
      <polygon points="74,98 81,114 90,98" fill="white" stroke="black" stroke-width="4"/>
      <polygon points="96,98 104,114 112,98" fill="white" stroke="black" stroke-width="4"/>
      <circle cx="90" cy="73" r="18" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="93" cy="71" r="10" fill="black"/>
      <circle cx="90" cy="68" r="4" fill="white"/>
      <ellipse cx="53" cy="88" rx="6" ry="4" fill="black"/>
      <path d="M136,182 Q108,174 100,196 Q114,208 136,202Z" fill="white" stroke="black" stroke-width="6" stroke-linejoin="round"/>
      <rect x="106" y="262" width="34" height="72" rx="17" fill="white" stroke="black" stroke-width="7"/>
      <rect x="162" y="262" width="34" height="72" rx="17" fill="white" stroke="black" stroke-width="7"/>
      <polygon points="148,142 140,112 160,142" fill="white" stroke="black" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="160,127 153,97 170,127" fill="white" stroke="black" stroke-width="5" stroke-linejoin="round"/>
    `)
  },
  {
    id:'elephant', label:'Elephant', emoji:'🐘',
    svg: T(`
      <ellipse cx="50" cy="158" rx="52" ry="82" fill="white" stroke="black" stroke-width="9"/>
      <ellipse cx="250" cy="158" rx="52" ry="82" fill="white" stroke="black" stroke-width="9"/>
      <circle cx="150" cy="152" r="112" fill="white" stroke="black" stroke-width="9"/>
      <path d="M102,228 Q72,278 88,314 Q100,330 116,318 Q132,334 152,308 Q140,278 124,252" fill="white" stroke="black" stroke-width="9" stroke-linejoin="round"/>
      <ellipse cx="130" cy="314" rx="22" ry="14" fill="white" stroke="black" stroke-width="6"/>
      <path d="M107,216 Q74,238 70,264 Q84,270 95,254 Q100,238 114,228" fill="white" stroke="black" stroke-width="6"/>
      <path d="M166,228 Q188,238 194,254 Q204,270 218,264 Q218,238 186,216" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="104" cy="128" r="21" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="107" cy="126" r="12" fill="black"/>
      <circle cx="103" cy="122" r="4" fill="white"/>
      <circle cx="196" cy="128" r="21" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="199" cy="126" r="12" fill="black"/>
      <circle cx="195" cy="122" r="4" fill="white"/>
      <path d="M124,198 Q150,214 176,198" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
    `)
  },
  {
    id:'unicorn', label:'Unicorn', emoji:'🦄',
    svg: T(`
      <path d="M166,58 Q218,78 232,138 Q238,178 222,218" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="138" cy="196" rx="106" ry="122" fill="white" stroke="black" stroke-width="9"/>
      <ellipse cx="92" cy="252" rx="52" ry="38" fill="white" stroke="black" stroke-width="7"/>
      <ellipse cx="82" cy="254" rx="7" ry="5" fill="black"/>
      <ellipse cx="106" cy="254" rx="7" ry="5" fill="black"/>
      <polygon points="183,162 164,38 204,162" fill="white" stroke="black" stroke-width="8" stroke-linejoin="round"/>
      <line x1="170" y1="138" x2="197" y2="138" stroke="black" stroke-width="4"/>
      <line x1="172" y1="114" x2="196" y2="114" stroke="black" stroke-width="4"/>
      <line x1="176" y1="88" x2="194" y2="88" stroke="black" stroke-width="4"/>
      <polygon points="204,112 224,54 244,118" fill="white" stroke="black" stroke-width="7" stroke-linejoin="round"/>
      <ellipse cx="152" cy="192" rx="26" ry="22" fill="white" stroke="black" stroke-width="6"/>
      <ellipse cx="154" cy="193" rx="14" ry="16" fill="black"/>
      <circle cx="150" cy="188" r="5" fill="white"/>
      <line x1="130" y1="175" x2="122" y2="166" stroke="black" stroke-width="3" stroke-linecap="round"/>
      <line x1="145" y1="171" x2="141" y2="162" stroke="black" stroke-width="3" stroke-linecap="round"/>
      <line x1="162" y1="172" x2="163" y2="162" stroke="black" stroke-width="3" stroke-linecap="round"/>
      <path d="M98,88 Q124,58 144,88 Q118,108 138,128" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
      <path d="M82,103 Q104,72 124,98 Q106,122 124,144" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
      <path d="M66,268 Q92,284 122,268" fill="none" stroke="black" stroke-width="6" stroke-linecap="round"/>
    `)
  },
  {
    id:'star', label:'Star', emoji:'⭐',
    svg: T(`
      <polygon points="150,22 178,112 272,112 198,168 224,262 150,206 76,262 102,168 28,112 122,112" fill="white" stroke="black" stroke-width="9" stroke-linejoin="round"/>
      <circle cx="124" cy="158" r="14" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="128" cy="155" r="8" fill="black"/>
      <circle cx="124" cy="152" r="3" fill="white"/>
      <circle cx="176" cy="158" r="14" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="180" cy="155" r="8" fill="black"/>
      <circle cx="176" cy="152" r="3" fill="white"/>
      <path d="M130,182 Q150,198 170,182" fill="none" stroke="black" stroke-width="6" stroke-linecap="round"/>
      <circle cx="106" cy="176" r="12" fill="none" stroke="black" stroke-width="3" stroke-dasharray="3 3"/>
      <circle cx="194" cy="176" r="12" fill="none" stroke="black" stroke-width="3" stroke-dasharray="3 3"/>
    `)
  },
]

// ── Template gallery ──────────────────────────────────────────────────────────
function TemplateGallery({ onSelect, onSkip, theme }) {
  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      <div className="flex items-center justify-between px-4 pt-safe pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onSkip}
          className="px-4 py-2 rounded-xl font-round text-sm"
          style={{ background: theme.card, color: theme.text }}>
          ✏️ Free Draw
        </motion.button>
        <p className="font-bubble text-lg" style={{ color: theme.primary }}>Pick a Picture!</p>
        <div className="w-24" />
      </div>
      <p className="font-round text-sm text-center mb-4 opacity-70" style={{ color: theme.text }}>
        Choose a picture and fill it with colours!
      </p>
      <div className="grid grid-cols-3 gap-3 px-4 pb-6">
        {TEMPLATES.map(t => (
          <motion.button key={t.id} whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(t)}
            className="rounded-2xl p-3 flex flex-col items-center gap-2 shadow-md"
            style={{ background: theme.card, minHeight: 110 }}>
            {/* mini SVG preview */}
            <img
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.svg)}`}
              alt={t.label}
              className="w-full rounded-xl"
              style={{ height: 70, objectFit: 'contain' }}
            />
            <span className="font-bubble text-xs text-center" style={{ color: theme.text }}>{t.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LittleDaVinci({ avatar, onBack, profileName, onAddStars, onUpdateProgress, progress }) {
  const theme     = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()

  const canvasRef     = useRef(null)
  const isDrawing     = useRef(false)
  const lastPos       = useRef(null)
  const bgColorRef    = useRef('#FFFBF0')
  const drawTokenRef  = useRef(0)
  const unsavedStrokeRef = useRef(true)

  const [color,          setColor]          = useState('#EF4444')
  const [brushSize,      setBrushSize]      = useState(8)
  const [tool,           setTool]           = useState('pen')
  const [stamp,          setStamp]          = useState('🌟')
  const [showStamps,     setShowStamps]     = useState(false)
  const [showColors,     setShowColors]     = useState(false)
  const [savedMsg,       setSavedMsg]       = useState(false)
  const [screen,         setScreen]         = useState('gallery') // gallery | draw
  const [activeTemplate, setActiveTemplate] = useState(null)

  // ── canvas init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr  = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.fillStyle = bgColorRef.current
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [screen]) // re-init when screen switches to 'draw'

  // ── draw template onto canvas ───────────────────────────────────────────────
  const drawTemplate = useCallback((template) => {
    if (!template) return
    const canvas = canvasRef.current
    if (!canvas) return
    const token = ++drawTokenRef.current
    const ctx  = canvas.getContext('2d')
    const dpr  = window.devicePixelRatio || 1
    const w    = canvas.width  / dpr
    const h    = canvas.height / dpr
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
    bgColorRef.current = '#FFFFFF'
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(template.svg)}`
    const img = new window.Image()
    img.onload = () => {
      if (drawTokenRef.current !== token) return
      if (!canvasRef.current || canvasRef.current !== canvas) return
      ctx.drawImage(img, 0, 0, w, h)
    }
    img.onerror = () => {
      if (drawTokenRef.current !== token) return
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, w, h)
    }
    img.src = url
  }, [])

  useEffect(() => {
    return () => { drawTokenRef.current += 1 }
  }, [])

  const selectTemplate = useCallback((template) => {
    setActiveTemplate(template)
    setScreen('draw')
    speak(`Let's colour this ${template.label}! Pick a colour and paint!`, { mood: 'celebrate' })
    // drawTemplate is called via useEffect after screen switches
  }, [speak])

  // After screen becomes 'draw', paint the template (canvas is ready after re-init)
  useEffect(() => {
    if (screen === 'draw' && activeTemplate) {
      // Small delay so canvas init effect runs first
      const t = setTimeout(() => drawTemplate(activeTemplate), 80)
      return () => clearTimeout(t)
    }
    if (screen === 'draw' && !activeTemplate) {
      speak(`Welcome to the art studio, ${profileName || 'artist'}! Pick a colour and start creating!`, { mood: 'celebrate' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, activeTemplate])

  // ── coordinate helper ───────────────────────────────────────────────────────
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  // ── flood fill ──────────────────────────────────────────────────────────────
  const floodFill = useCallback((cssX, cssY) => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const dpr    = window.devicePixelRatio || 1
    const px     = Math.round(cssX * dpr)
    const py     = Math.round(cssY * dpr)
    const W      = canvas.width
    const H      = canvas.height

    if (px < 0 || px >= W || py < 0 || py >= H) return

    const imageData = ctx.getImageData(0, 0, W, H)
    const data      = imageData.data
    const si        = (py * W + px) * 4
    const tR = data[si], tG = data[si+1], tB = data[si+2]
    const [fR, fG, fB] = hexToRgb(color)

    if (tR === fR && tG === fG && tB === fB) return

    const TOL = 28
    const matches = (i) =>
      Math.abs(data[i]   - tR) <= TOL &&
      Math.abs(data[i+1] - tG) <= TOL &&
      Math.abs(data[i+2] - tB) <= TOL

    const visited = new Uint8Array(W * H)
    const stack   = [py * W + px]
    visited[py * W + px] = 1

    while (stack.length) {
      const pos = stack.pop()
      const x0  = pos % W
      const y0  = (pos / W) | 0
      const i   = pos * 4
      data[i] = fR; data[i+1] = fG; data[i+2] = fB; data[i+3] = 255

      if (x0 > 0   && !visited[pos-1] && matches((pos-1)*4)) { visited[pos-1]=1; stack.push(pos-1) }
      if (x0 < W-1 && !visited[pos+1] && matches((pos+1)*4)) { visited[pos+1]=1; stack.push(pos+1) }
      if (y0 > 0   && !visited[pos-W] && matches((pos-W)*4)) { visited[pos-W]=1; stack.push(pos-W) }
      if (y0 < H-1 && !visited[pos+W] && matches((pos+W)*4)) { visited[pos+W]=1; stack.push(pos+W) }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [color])

  // ── drawing ─────────────────────────────────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault()
    const pos = getPos(e)

    if (tool === 'stamp') {
      const ctx = canvasRef.current.getContext('2d')
      const sz  = brushSize * 3.5
      ctx.font = `${sz}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(stamp, pos.x, pos.y)
      unsavedStrokeRef.current = true
      return
    }

    if (tool === 'fill') {
      floodFill(pos.x, pos.y)
      unsavedStrokeRef.current = true
      return
    }

    isDrawing.current = true
    unsavedStrokeRef.current = true
    lastPos.current   = pos
    const ctx    = canvasRef.current.getContext('2d')
    const radius = (tool === 'eraser' ? brushSize * 2.5 : brushSize) / 2
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = tool === 'eraser' ? bgColorRef.current : color
    ctx.fill()
  }, [tool, stamp, brushSize, color, floodFill])

  const draw = useCallback((e) => {
    e.preventDefault()
    if (!isDrawing.current || tool === 'stamp' || tool === 'fill') return
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? bgColorRef.current : color
    ctx.lineWidth   = tool === 'eraser' ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }, [tool, color, brushSize])

  const stopDraw = useCallback(() => { isDrawing.current = false }, [])

  // ── Clear / Start Fresh ─────────────────────────────────────────────────────
  const clearCanvas = () => {
    if (activeTemplate) {
      drawTemplate(activeTemplate)
      speak('All clear! Start colouring again!', { mood: 'instruct' })
    } else {
      const canvas = canvasRef.current
      const ctx    = canvas.getContext('2d')
      const dpr    = window.devicePixelRatio || 1
      bgColorRef.current = '#FFFBF0'
      ctx.fillStyle = '#FFFBF0'
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr)
      speak('Clean canvas! Let\'s make something new!', { mood: 'instruct' })
    }
  }

  const changeTemplate = () => {
    setActiveTemplate(null)
    setScreen('gallery')
  }

  const saveToGallery = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const dataUrl = canvas.toDataURL('image/png', 0.7)
      const existing = progress?.artGallery || []
      const entry = {
        id: `art-${Date.now()}`,
        dataUrl,
        createdAt: Date.now(),
        template: activeTemplate?.label || 'Free Draw',
      }
      const next = [entry, ...existing].slice(0, 20)
      onUpdateProgress?.({ artGallery: next })
      confetti({ particleCount: 80, spread: 120, origin: { x: 0.5, y: 0.5 } })
      setSavedMsg(true)
      if (unsavedStrokeRef.current) {
        onAddStars?.('davinci', 2, { total: 1, correct: 1, struggles: [], stayOnModule: true })
        unsavedStrokeRef.current = false
        speak('Saved to your gallery! You earned two stars!', { mood: 'celebrate' })
      } else {
        speak('Saved again! Draw something new to earn more stars!', { mood: 'instruct' })
      }
      setTimeout(() => setSavedMsg(false), 3000)
    } catch (err) {
      console.warn('save art failed', err)
    }
  }

  const downloadArt = () => {
    const canvas  = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    // iOS Safari doesn't support programmatic download via <a> — open in new tab instead
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    if (isIOS) {
      window.open(dataUrl, '_blank')
    } else {
      const link = document.createElement('a')
      link.download = `${profileName || 'my'}-masterpiece.png`
      link.href = dataUrl
      link.click()
    }
    confetti({ particleCount: 100, spread: 120, origin: { x: 0.5, y: 0.4 } })
    setSavedMsg(true)
    speak('Your masterpiece has been saved! You are a true artist!', { mood: 'celebrate' })
    setTimeout(() => setSavedMsg(false), 3000)
  }

  const TOOLS = [
    { id:'pen',    emoji:'✏️', label:'Draw'  },
    { id:'fill',   emoji:'🪣', label:'Fill'  },
    { id:'eraser', emoji:'🧹', label:'Erase' },
    { id:'stamp',  emoji:'🌟', label:'Stamp' },
  ]

  // ── Gallery screen ──────────────────────────────────────────────────────────
  if (screen === 'gallery') {
    return (
      <div className="min-h-screen flex flex-col"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center justify-between px-4 pt-safe pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <p className="font-bubble text-xl" style={{ color: theme.primary }}>🎨 Little Da Vinci</p>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => { setActiveTemplate(null); setScreen('draw') }}
            className="px-3 py-2 rounded-xl font-round text-xs font-bold shadow"
            style={{ background: theme.primary, color: '#fff' }}>
            ✏️ Free Draw
          </motion.button>
        </div>

        <p className="font-round text-sm text-center mb-4 opacity-70" style={{ color: theme.text }}>
          Pick a picture and fill it with colours! 🖌️
        </p>

        <div className="grid grid-cols-3 gap-3 px-4 pb-8">
          {TEMPLATES.map(t => (
            <motion.button key={t.id} whileTap={{ scale: 0.92 }}
              onClick={() => selectTemplate(t)}
              className="rounded-2xl overflow-hidden shadow-md flex flex-col items-center"
              style={{ background: theme.card }}>
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.svg)}`}
                alt={t.label}
                className="w-full"
                style={{ height: 80, objectFit: 'contain', padding: '6px' }}
              />
              <p className="font-bubble text-xs py-1.5" style={{ color: theme.text }}>{t.label}</p>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ── Drawing screen ──────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 pb-1 shrink-0 gap-2 pt-safe-sm">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow text-lg shrink-0"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>

        {activeTemplate ? (
          <motion.button whileTap={{ scale: 0.93 }}
            onClick={changeTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-round text-xs font-bold shadow"
            style={{ background: theme.card, color: theme.primary }}>
            🖼️ {activeTemplate.label} · Change
          </motion.button>
        ) : (
          <span className="font-bubble text-base" style={{ color: theme.primary }}>✏️ Free Draw</span>
        )}

        <div className="flex gap-1.5 shrink-0">
          {/* Start Fresh */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={clearCanvas}
            className="flex items-center gap-1 px-3 py-2 rounded-full font-round text-xs font-bold shadow"
            style={{ background: '#FEF3C7', color: '#D97706' }}>
            🔄 Fresh
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={saveToGallery}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow text-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: 'white' }}
            title="Save to My Gallery">⭐</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={downloadArt}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow text-lg"
            style={{ background: theme.card }}>💾</motion.button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 mx-3 my-1 rounded-2xl overflow-hidden shadow-xl relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none block"
          style={{ cursor: tool === 'fill' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'crosshair' }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />

        {/* Colour Pages button overlay — shown when in free draw mode */}
        {!activeTemplate && (
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setScreen('gallery')}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-full font-round text-xs font-bold shadow-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#fff' }}>
            🖼️ Colour Pages
          </motion.button>
        )}

        <AnimatePresence>
          {savedMsg && (
            <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-5 py-2 rounded-full font-bubble shadow-lg">
              🎉 Masterpiece saved!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom toolbar */}
      <div className="shrink-0 mx-3 mb-3 rounded-2xl p-3 shadow-lg flex flex-col gap-2"
        style={{ background: theme.card }}>

        {/* Tools */}
        <div className="flex gap-2 justify-center">
          {TOOLS.map(t => (
            <motion.button key={t.id} whileTap={{ scale: 0.9 }}
              onClick={() => { setTool(t.id); setShowStamps(t.id === 'stamp'); setShowColors(false) }}
              className="flex flex-col items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: tool === t.id ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` : theme.bg,
                color: tool === t.id ? 'white' : theme.text,
                minWidth: 52,
              }}>
              <span className="text-xl">{t.id === 'stamp' ? stamp : t.emoji}</span>
              <span>{t.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Stamp picker */}
        <AnimatePresence>
          {showStamps && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
              exit={{ height:0, opacity:0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {STAMPS.map(s => (
                  <motion.button key={s} whileTap={{ scale:0.85 }}
                    onClick={() => setStamp(s)}
                    className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: stamp === s ? theme.primary+'33' : theme.bg,
                             border: stamp === s ? `2px solid ${theme.primary}` : '2px solid transparent' }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Colour + brush row */}
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale:0.9 }}
            onClick={() => setShowColors(c => !c)}
            className="w-9 h-9 rounded-full border-4 border-white shadow-md shrink-0"
            style={{ background: color }} />

          <div className="flex gap-1.5">
            {BRUSH_SIZES.map(b => (
              <motion.button key={b.value} whileTap={{ scale:0.85 }}
                onClick={() => setBrushSize(b.value)}
                className="rounded-full flex items-center justify-center"
                style={{ width:28, height:28, background: brushSize === b.value ? theme.primary : theme.bg }}>
                <span className="rounded-full bg-white block"
                  style={{ width: Math.min(b.value, 20), height: Math.min(b.value, 20) }} />
              </motion.button>
            ))}
          </div>

          {/* BG colour chips */}
          <div className="flex gap-1.5 ml-auto">
            {['#FFFBF0','#F0F9FF','#F0FDF4','#FFF0F5','#FFFDE7'].map(bg => (
              <motion.button key={bg} whileTap={{ scale:0.85 }}
                onClick={() => { bgColorRef.current = bg; const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio||1; ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width/dpr,canvas.height/dpr); if(activeTemplate) drawTemplate(activeTemplate) }}
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ background: bg }} />
            ))}
          </div>
        </div>

        {/* Full palette */}
        <AnimatePresence>
          {showColors && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
              exit={{ height:0, opacity:0 }} className="overflow-hidden">
              <div className="grid grid-cols-10 gap-1.5 pt-1">
                {COLORS.map(c => (
                  <motion.button key={c} whileTap={{ scale:0.8 }}
                    onClick={() => { setColor(c); setShowColors(false) }}
                    className="w-full aspect-square rounded-full border-2"
                    style={{ background:c, borderColor: color===c ? theme.primary : 'transparent',
                             boxShadow: c==='#FFFFFF' ? '0 0 0 1px #ccc' : 'none' }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
