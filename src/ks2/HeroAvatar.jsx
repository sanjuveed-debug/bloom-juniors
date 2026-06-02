import React from 'react'

// Axel — lightning tech hero, blue circuit helmet with yellow goggle lenses
function Axel({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <defs>
        <radialGradient id="ax-bg" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1a3fa8" />
          <stop offset="100%" stopColor="#050e2a" />
        </radialGradient>
        <radialGradient id="ax-goggle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="100%" stopColor="#e08800" />
        </radialGradient>
        <filter id="ax-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="ax-circle"><circle cx="60" cy="60" r="58" /></clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#ax-bg)" stroke="#0a1a66" strokeWidth="2" />
      {/* Helmet top */}
      <path d="M16 52 Q16 12 60 8 Q104 12 104 52 L100 38 Q88 6 60 6 Q32 6 20 38Z" fill="#102080" clipPath="url(#ax-circle)" />
      {/* Circuit lines on helmet */}
      <path d="M20 40 L30 40 L30 32 L50 32" fill="none" stroke="#4488ff" strokeWidth="1.2" opacity="0.6" />
      <path d="M100 40 L90 40 L90 32 L70 32" fill="none" stroke="#4488ff" strokeWidth="1.2" opacity="0.6" />
      <circle cx="30" cy="40" r="2.5" fill="#4488ff" opacity="0.8" />
      <circle cx="90" cy="40" r="2.5" fill="#4488ff" opacity="0.8" />
      {/* Visor band */}
      <rect x="18" y="44" width="84" height="26" rx="8" fill="#0a1860" />
      {/* Goggle lenses */}
      <ellipse cx="41" cy="57" rx="15" ry="11" fill="url(#ax-goggle)" filter="url(#ax-glow)" />
      <ellipse cx="79" cy="57" rx="15" ry="11" fill="url(#ax-goggle)" filter="url(#ax-glow)" />
      <ellipse cx="41" cy="57" rx="10" ry="7" fill="#fff8aa" opacity="0.5" />
      <ellipse cx="79" cy="57" rx="10" ry="7" fill="#fff8aa" opacity="0.5" />
      {/* Goggle shine */}
      <ellipse cx="37" cy="53" rx="4" ry="2.5" fill="white" opacity="0.6" />
      <ellipse cx="75" cy="53" rx="4" ry="2.5" fill="white" opacity="0.6" />
      {/* Lightning bolt on forehead */}
      <polygon points="60,16 54,28 60,26 54,40 66,26 60,28" fill="#ffe566" filter="url(#ax-glow)" />
      {/* Lower face/chin */}
      <path d="M22 70 Q22 100 60 106 Q98 100 98 70Z" fill="#102080" clipPath="url(#ax-circle)" />
      {/* Mouth grille */}
      {[0,5,10].map(i => (
        <line key={i} x1="44" y1={80+i} x2="76" y2={80+i} stroke="#4488ff" strokeWidth="1" opacity="0.5" />
      ))}
    </svg>
  )
}

// Blaze — fire warrior, orange/amber visor with flame crest
function Blaze({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <defs>
        <radialGradient id="bl-bg" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#7a1a00" />
          <stop offset="100%" stopColor="#1a0500" />
        </radialGradient>
        <radialGradient id="bl-visor" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#cc3300" />
        </radialGradient>
        <radialGradient id="bl-flame" cx="50%" cy="90%" r="80%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="60%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#cc0000" />
        </radialGradient>
        <filter id="bl-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="bl-circle"><circle cx="60" cy="60" r="58" /></clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#bl-bg)" stroke="#3a0a00" strokeWidth="2" />
      {/* Helmet shell */}
      <path d="M18 56 Q18 10 60 8 Q102 10 102 56 L98 36 Q85 6 60 6 Q35 6 22 36Z" fill="#5a1200" clipPath="url(#bl-circle)" />
      {/* Flame crest on top */}
      <path d="M46 22 Q50 6 60 10 Q55 16 58 20 Q62 8 68 14 Q64 18 67 22 Q70 10 76 16 Q70 22 72 28 Q66 20 60 24 Q54 20 48 28Z" fill="url(#bl-flame)" filter="url(#bl-glow)" clipPath="url(#bl-circle)" />
      {/* Visor */}
      <path d="M22 48 Q22 36 60 34 Q98 36 98 48 L94 68 Q80 80 60 80 Q40 80 26 68Z" fill="url(#bl-visor)" />
      {/* Visor glow lines */}
      <path d="M30 56 Q60 50 90 56" fill="none" stroke="#FFE566" strokeWidth="1.2" opacity="0.5" />
      <path d="M28 62 Q60 57 92 62" fill="none" stroke="#FFE566" strokeWidth="1" opacity="0.3" />
      {/* Eyes — glowing amber slits */}
      <path d="M32 52 L48 48 L48 56 L32 60Z" fill="#FFE566" filter="url(#bl-glow)" />
      <path d="M88 52 L72 48 L72 56 L88 60Z" fill="#FFE566" filter="url(#bl-glow)" />
      {/* Chin / lower helm */}
      <path d="M30 78 Q30 104 60 108 Q90 104 90 78Z" fill="#5a1200" clipPath="url(#bl-circle)" />
      {/* Chin vents */}
      <path d="M44 90 L50 86 L56 90 L50 94Z" fill="#FF6600" opacity="0.6" />
      <path d="M64 90 L70 86 L76 90 L70 94Z" fill="#FF6600" opacity="0.6" />
    </svg>
  )
}

// Nova — space explorer, cosmic purple with crystal star crown
function Nova({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <defs>
        <radialGradient id="nv-bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2e0050" />
          <stop offset="100%" stopColor="#080018" />
        </radialGradient>
        <radialGradient id="nv-skin" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f5c5a3" />
          <stop offset="100%" stopColor="#d4956a" />
        </radialGradient>
        <linearGradient id="nv-crystal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8b4ff" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6600cc" />
        </linearGradient>
        <filter id="nv-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="nv-circle"><circle cx="60" cy="60" r="58" /></clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#nv-bg)" stroke="#1a0040" strokeWidth="2" />
      {/* Stars in background */}
      {[[20,20],[95,25],[15,80],[100,75],[50,12],[75,90]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.5" />
      ))}
      {/* Hair — dark flowing */}
      <path d="M20 54 Q20 12 60 8 Q100 12 100 54 Q98 22 60 16 Q22 22 20 54Z" fill="#1a0a3a" clipPath="url(#nv-circle)" />
      <path d="M20 58 Q15 85 22 112" fill="none" stroke="#1a0a3a" strokeWidth="20" strokeLinecap="round" clipPath="url(#nv-circle)" />
      <path d="M100 58 Q105 85 98 112" fill="none" stroke="#1a0a3a" strokeWidth="20" strokeLinecap="round" clipPath="url(#nv-circle)" />
      {/* Face */}
      <ellipse cx="60" cy="62" rx="28" ry="32" fill="url(#nv-skin)" />
      {/* Crystal star crown */}
      <path d="M32 38 Q60 20 88 38 Q82 30 60 26 Q38 30 32 38Z" fill="url(#nv-crystal)" />
      <polygon points="60,18 63,26 70,26 64,31 66,38 60,33 54,38 56,31 50,26 57,26" fill="#e8b4ff" filter="url(nv-glow)" />
      {/* Star gems on crown */}
      <circle cx="38" cy="36" r="3" fill="#e8b4ff" filter="url(#nv-glow)" />
      <circle cx="82" cy="36" r="3" fill="#e8b4ff" filter="url(#nv-glow)" />
      {/* Eyes — violet */}
      <ellipse cx="46" cy="54" rx="9" ry="7" fill="#7c3aed" />
      <ellipse cx="74" cy="54" rx="9" ry="7" fill="#7c3aed" />
      <ellipse cx="46" cy="54" rx="5" ry="4.5" fill="#4c1d95" />
      <ellipse cx="74" cy="54" rx="5" ry="4.5" fill="#4c1d95" />
      <circle cx="44" cy="52" r="2" fill="white" opacity="0.8" />
      <circle cx="72" cy="52" r="2" fill="white" opacity="0.8" />
      {/* Eyebrows */}
      <path d="M38 47 Q46 43 54 46" fill="none" stroke="#3a1a60" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 46 Q74 43 82 47" fill="none" stroke="#3a1a60" strokeWidth="2" strokeLinecap="round" />
      {/* Nose + smile */}
      <path d="M58 60 Q60 65 62 60" fill="none" stroke="#c08060" strokeWidth="1.2" />
      <path d="M50 74 Q60 80 70 74" fill="#cc4488" stroke="#aa2266" strokeWidth="0.5" />
      {/* Cosmic shoulder armour hints */}
      <path d="M24 96 Q60 88 96 96 Q86 104 60 106 Q34 104 24 96Z" fill="url(#nv-crystal)" opacity="0.7" clipPath="url(#nv-circle)" />
    </svg>
  )
}

// Zoom — wind speed runner, green/gold with aerodynamic helm and speed trails
function Zoom({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <defs>
        <radialGradient id="zm-bg" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#004d00" />
          <stop offset="100%" stopColor="#001a00" />
        </radialGradient>
        <radialGradient id="zm-helm" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#065f2e" />
        </radialGradient>
        <radialGradient id="zm-visor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <filter id="zm-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="zm-circle"><circle cx="60" cy="60" r="58" /></clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#zm-bg)" stroke="#003300" strokeWidth="2" />
      {/* Speed trails left side */}
      {[38,46,54,62].map((y,i) => (
        <line key={i} x1="4" y1={y} x2={14+i*3} y2={y} stroke="#22c55e" strokeWidth="2" opacity={0.3+i*0.1} clipPath="url(#zm-circle)" />
      ))}
      {/* Aerodynamic helmet */}
      <path d="M22 58 Q22 10 60 8 Q98 10 98 58 L94 40 Q80 6 60 6 Q40 6 26 40Z" fill="url(#zm-helm)" />
      {/* Helmet fin/crest */}
      <path d="M55 8 Q60 2 65 8 L63 24 L60 22 L57 24Z" fill="#16a34a" />
      {/* Visor — wide aerodynamic band */}
      <path d="M20 50 Q20 40 60 38 Q100 40 100 50 L96 66 Q82 74 60 74 Q38 74 24 66Z" fill="url(#zm-visor)" />
      {/* Visor shine */}
      <path d="M28 50 Q60 45 92 50" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
      {/* Eye glows inside visor */}
      <ellipse cx="42" cy="56" rx="10" ry="7" fill="#fde68a" filter="url(#zm-glow)" opacity="0.7" />
      <ellipse cx="78" cy="56" rx="10" ry="7" fill="#fde68a" filter="url(#zm-glow)" opacity="0.7" />
      {/* Chin piece */}
      <path d="M28 72 Q28 104 60 108 Q92 104 92 72Z" fill="url(#zm-helm)" clipPath="url(#zm-circle)" />
      {/* Chin vents */}
      {[0,6,12].map(i => (
        <line key={i} x1="44" y1={82+i} x2="76" y2={82+i} stroke="#86efac" strokeWidth="1.2" opacity="0.5" />
      ))}
      {/* Speed number badge */}
      <circle cx="60" cy="97" r="9" fill="#fde68a" />
      <text x="60" y="101" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#7c3500">1</text>
    </svg>
  )
}

const AVATAR_MAP = { axel: Axel, blaze: Blaze, nova: Nova, zoom: Zoom }

export default function HeroAvatar({ hero, size = 120 }) {
  const Component = AVATAR_MAP[hero]
  if (!Component) return null
  return <Component size={size} />
}
