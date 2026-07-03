import { useState, useEffect, useRef } from 'react'

const POSES = {
  idle:      '/yaagvi-poses/idle.png',
  wave:      '/yaagvi-poses/wave.png',
  celebrate: '/yaagvi-poses/celebrate.png',
  dance:     '/yaagvi-poses/dance.png',
  point:     '/yaagvi-poses/point.png',
  think:     '/yaagvi-poses/think.png',
  read:      '/yaagvi-poses/read.png',
  clap:      '/yaagvi-poses/clap.png',
}

// CSS injected once
const STYLE_ID = 'yaagvi-styles'
const CSS = `
  .yaagvi-wrap {
    position: relative;
    display: inline-block;
    user-select: none;
  }
  .yaagvi-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity 0.25s ease;
  }
  .yaagvi-img.fade-out { opacity: 0; }
  .yaagvi-img.fade-in  { opacity: 1; }

  /* Idle — gentle float */
  .yaagvi-anim-idle {
    animation: yaagvi-float 3s ease-in-out infinite;
  }
  @keyframes yaagvi-float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }

  /* Wave — the image already waves, add a gentle rock */
  .yaagvi-anim-wave {
    animation: yaagvi-rock 0.6s ease-in-out infinite;
    transform-origin: bottom center;
  }
  @keyframes yaagvi-rock {
    0%,100% { transform: rotate(-3deg); }
    50%      { transform: rotate(3deg); }
  }

  /* Celebrate — fast bounce */
  .yaagvi-anim-celebrate {
    animation: yaagvi-bounce 0.5s ease-in-out infinite;
  }
  @keyframes yaagvi-bounce {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-16px) scale(1.05); }
  }

  /* Dance — energetic hop with slight lean */
  .yaagvi-anim-dance {
    animation: yaagvi-dance 0.45s ease-in-out infinite;
    transform-origin: bottom center;
  }
  @keyframes yaagvi-dance {
    0%      { transform: translateY(0) rotate(-4deg); }
    25%     { transform: translateY(-18px) rotate(0deg); }
    50%     { transform: translateY(0) rotate(4deg); }
    75%     { transform: translateY(-18px) rotate(0deg); }
    100%    { transform: translateY(0) rotate(-4deg); }
  }

  /* Point — gentle forward pulse */
  .yaagvi-anim-point {
    animation: yaagvi-point 1s ease-in-out infinite;
    transform-origin: bottom center;
  }
  @keyframes yaagvi-point {
    0%,100% { transform: translateX(0) scale(1); }
    50%      { transform: translateX(6px) scale(1.03); }
  }

  /* Think — slow sway */
  .yaagvi-anim-think {
    animation: yaagvi-sway 2s ease-in-out infinite;
    transform-origin: bottom center;
  }
  @keyframes yaagvi-sway {
    0%,100% { transform: rotate(-2deg); }
    50%      { transform: rotate(2deg); }
  }

  /* Read — gentle nod */
  .yaagvi-anim-read {
    animation: yaagvi-nod 2.5s ease-in-out infinite;
  }
  @keyframes yaagvi-nod {
    0%,100% { transform: translateY(0); }
    40%      { transform: translateY(-4px); }
    70%      { transform: translateY(2px); }
  }

  /* Clap — quick scale pulse */
  .yaagvi-anim-clap {
    animation: yaagvi-clap 0.35s ease-in-out infinite;
  }
  @keyframes yaagvi-clap {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.08); }
  }

  /* Speech bubble */
  .yaagvi-speech {
    position: absolute;
    top: -12px;
    right: -10px;
    transform: translateX(100%);
    background: #fff;
    border: 2.5px solid #C2410C;
    border-radius: 16px 16px 16px 4px;
    padding: 8px 14px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #422006;
    white-space: nowrap;
    max-width: 200px;
    white-space: normal;
    line-height: 1.35;
    box-shadow: 0 3px 12px rgba(194,65,12,0.18);
    animation: yaagvi-bubble-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events: none;
  }
  .yaagvi-speech::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 14px;
    border: 5px solid transparent;
    border-right-color: #C2410C;
  }
  .yaagvi-speech::after {
    content: '';
    position: absolute;
    left: -6px;
    top: 15px;
    border: 4px solid transparent;
    border-right-color: #fff;
  }
  @keyframes yaagvi-bubble-in {
    from { opacity: 0; transform: translateX(100%) scale(0.8); }
    to   { opacity: 1; transform: translateX(100%) scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .yaagvi-anim-idle,
    .yaagvi-anim-wave,
    .yaagvi-anim-celebrate,
    .yaagvi-anim-dance,
    .yaagvi-anim-point,
    .yaagvi-anim-think,
    .yaagvi-anim-read,
    .yaagvi-anim-clap {
      animation: none;
    }
  }
`

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
}

/**
 * YaagviCharacter
 *
 * Props:
 *   state    — 'idle' | 'wave' | 'celebrate' | 'dance' | 'point' | 'think' | 'read' | 'clap'
 *   size     — number (px width) or string CSS value. Default: 180
 *   speech   — string | null  Optional speech bubble text
 *   autoIdle — number | null  ms after which state resets to 'idle' (e.g. 2500)
 *   style    — extra inline styles for the wrapper
 *   className
 */
export default function YaagviCharacter({
  state = 'idle',
  size = 180,
  speech = null,
  autoIdle = null,
  style = {},
  className = '',
}) {
  const [currentState, setCurrentState] = useState(state)
  const [visible, setVisible] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(POSES[state] ?? POSES.idle)
  const timerRef = useRef(null)

  useEffect(() => { injectStyles() }, [])

  useEffect(() => {
    if (state === currentState) return
    // crossfade
    setVisible(false)
    const t = setTimeout(() => {
      setCurrentState(state)
      setCurrentSrc(POSES[state] ?? POSES.idle)
      setVisible(true)
    }, 250)
    return () => clearTimeout(t)
  }, [state])

  useEffect(() => {
    if (!autoIdle || currentState === 'idle') return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentState('idle')
        setCurrentSrc(POSES.idle)
        setVisible(true)
      }, 250)
    }, autoIdle)
    return () => clearTimeout(timerRef.current)
  }, [currentState, autoIdle])

  const px = typeof size === 'number' ? `${size}px` : size

  return (
    <div
      className={`yaagvi-wrap ${className}`}
      style={{ width: px, height: px, ...style }}
    >
      <img
        src={currentSrc}
        alt="Yaagvi"
        className={`yaagvi-img yaagvi-anim-${currentState} ${visible ? 'fade-in' : 'fade-out'}`}
        draggable={false}
      />
      {speech && visible && (
        <div className="yaagvi-speech">{speech}</div>
      )}
    </div>
  )
}
