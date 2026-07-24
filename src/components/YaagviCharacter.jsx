import { useState, useEffect, useRef } from 'react'

// Cache-busting query so Cloudflare's CDN (and browsers) don't keep serving
// the pre-transparency version of these assets from a prior deploy — public/
// files keep the same filename across deploys, so the CDN cache never
// invalidates on its own when only the file content changes.
const ASSET_VERSION = 'v2'
const POSES = {
  idle:      `/yaagvi-poses/idle.png?${ASSET_VERSION}`,
  wave:      `/yaagvi-poses/wave.png?${ASSET_VERSION}`,
  celebrate: `/yaagvi-poses/celebrate.png?${ASSET_VERSION}`,
  dance:     `/yaagvi-poses/dance.png?${ASSET_VERSION}`,
  point:     `/yaagvi-poses/point.png?${ASSET_VERSION}`,
  think:     `/yaagvi-poses/think.png?${ASSET_VERSION}`,
  read:      `/yaagvi-poses/read.png?${ASSET_VERSION}`,
  clap:      `/yaagvi-poses/clap.png?${ASSET_VERSION}`,
  'think-alt': `/yaagvi-poses/think-alt.png?${ASSET_VERSION}`,
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

  /* Dashboard presentation — crop the source art into a living character portal. */
  .yaagvi-dashboard {
    border-radius: 50%;
    isolation: isolate;
  }
  .yaagvi-dashboard::before,
  .yaagvi-dashboard::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    pointer-events: none;
  }
  .yaagvi-dashboard::before {
    background: conic-gradient(from 0deg, #FDE047, #38BDF8, #F472B6, #FDE047);
    animation: yaagvi-orbit 5s linear infinite;
    z-index: -2;
  }
  .yaagvi-dashboard::after {
    inset: -3px;
    background: rgba(255,255,255,0.82);
    z-index: -1;
    box-shadow: 0 14px 38px rgba(15,23,42,0.28), 0 0 28px rgba(253,224,71,0.28);
  }
  .yaagvi-dashboard .yaagvi-img {
    border-radius: 50%;
    object-fit: cover;
    object-position: 50% 18%;
    clip-path: circle(49% at 50% 50%);
  }
  @keyframes yaagvi-orbit { to { transform: rotate(360deg); } }

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

  /* Think-alt — slow sway, same rhythm as think */
  .yaagvi-anim-think-alt {
    animation: yaagvi-sway 2s ease-in-out infinite;
    transform-origin: bottom center;
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
    .yaagvi-anim-clap,
    .yaagvi-anim-think-alt {
      animation: none;
    }
    .yaagvi-dashboard::before { animation: none; }
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
 *   state    — 'idle' | 'wave' | 'celebrate' | 'dance' | 'point' | 'think' | 'think-alt' | 'read' | 'clap'
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
  imageStyle = {},
  imageClassName = '',
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
        className={`yaagvi-img yaagvi-anim-${currentState} ${visible ? 'fade-in' : 'fade-out'} ${imageClassName}`}
        style={imageStyle}
        draggable={false}
      />
      {speech && visible && (
        <div className="yaagvi-speech">{speech}</div>
      )}
    </div>
  )
}
