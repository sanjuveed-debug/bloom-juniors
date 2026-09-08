import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { getBumiGaze, getBumiMotion } from '../utils/bumiMotion'
import './bumi-character.css'

const PARTS = ['body', 'leaves', 'arm-left', 'arm-right', 'eye', 'pupil', 'smile', 'mouth', 'brows']
const asset = part => `/bumi/rig-v2/${part}.webp`
function Part({ name, className = '' }) { return <img className={`bumi-part ${className}`} src={asset(name)} alt="" draggable={false}/> }

export default function BumiCharacter({ state = 'idle', reactionKey = 0, size = 180, speech, autoIdle, talking = false, attentionTarget = null, style = {}, className = '' }) {
  const root = useRef(null)
  const animations = useRef([])
  const [paused, setPaused] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    const element = root.current
    const fit = () => {
      const rig = element?.querySelector('.bumi-rig')
      if (!rig) return
      const side = Math.min(element.clientWidth, element.clientHeight)
      if (side > 0) { rig.style.width = `${side}px`; rig.style.height = `${side}px` }
    }
    fit()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit)
    if (element) observer?.observe(element)
    window.addEventListener('resize', fit)
    return () => { observer?.disconnect(); window.removeEventListener('resize', fit) }
  }, [])
  useEffect(() => {
    let count = 0, cancelled = false
    const images = PARTS.map(part => {
      const img = new Image()
      img.onload = () => { count++; if (!cancelled && count === PARTS.length) setLoaded(true) }
      img.onerror = () => { if (!cancelled) setFailed(true) }
      img.src = asset(part); return img
    })
    return () => { cancelled = true; images.forEach(img => { img.onload = null; img.onerror = null }) }
  }, [])
  useEffect(() => {
    let visible = true
    const sync = () => setPaused(document.hidden || !visible)
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    if (root.current) observer?.observe(root.current)
    document.addEventListener('visibilitychange', sync); sync()
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [])
  useEffect(() => {
    if (paused || reduced || !loaded || attentionTarget) return
    const look = event => {
      const rect = root.current?.getBoundingClientRect()
      if (!rect) return
      const next = getBumiGaze(event.clientX, event.clientY, rect)
      root.current.style.setProperty('--gaze-x', `${next.x * 13}%`)
      root.current.style.setProperty('--gaze-y', `${next.y * 10}%`)
      root.current.style.setProperty('--face-x', `${next.x * 1.1}%`)
      root.current.style.setProperty('--face-y', `${next.y * .65}%`)
    }
    const rest = () => { for (const key of ['--gaze-x', '--gaze-y', '--face-x', '--face-y']) root.current?.style.setProperty(key, '0%') }
    window.addEventListener('pointermove', look, { passive: true })
    window.addEventListener('pointerdown', look, { passive: true })
    document.addEventListener('pointerleave', rest)
    window.addEventListener('blur', rest)
    return () => { window.removeEventListener('pointermove', look); window.removeEventListener('pointerdown', look); document.removeEventListener('pointerleave', rest); window.removeEventListener('blur', rest) }
  }, [paused, reduced, loaded, Boolean(attentionTarget)])
  useEffect(() => {
    const node = root.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const active = attentionTarget && !paused && !reduced && loaded
    const x = active ? Math.max(-1, Math.min(1, (attentionTarget.x - rect.left - rect.width / 2) / Math.max(100, rect.width))) : 0
    const y = active ? Math.max(-1, Math.min(1, (attentionTarget.y - rect.top - rect.height / 2) / Math.max(100, rect.height))) : 0
    node.style.setProperty('--gaze-x', `${x * 13}%`)
    node.style.setProperty('--gaze-y', `${y * 10}%`)
    node.style.setProperty('--face-x', `${x * 1.1}%`)
    node.style.setProperty('--face-y', `${y * .65}%`)
  }, [attentionTarget?.x, attentionTarget?.y, paused, reduced, loaded])
  useEffect(() => {
    const node = root.current
    if (!node || !loaded) return
    const duration = autoIdle > 0 ? Math.min(autoIdle, 2100) : 2100
    const tracks = { '.bumi-reaction': [], '.bumi-leaves': [], '.bumi-arm-left': [], '.bumi-arm-right': [], '.bumi-brows': [], '.bumi-mouth': [], '.bumi-smile': [] }
    const count = reduced ? 1 : 60
    for (let i = 0; i <= count; i++) {
      const t = duration * i / count
      const m = getBumiMotion(state, t, { reduced, autoIdle })
      const idle = getBumiMotion('idle', t, { reduced })
      tracks['.bumi-reaction'].push({ transform: 'translateY(' + m.lift / 4 + '%) rotate(' + (m.lean - idle.lean) + 'deg)' })
      tracks['.bumi-leaves'].push({ transform: 'rotate(' + (m.leaf - idle.leaf) + 'deg)' })
      tracks['.bumi-arm-left'].push({ transform: 'rotate(' + (m.leftArm - idle.leftArm) + 'deg)' })
      tracks['.bumi-arm-right'].push({ transform: 'rotate(' + (m.rightArm - idle.rightArm) + 'deg) scaleY(' + m.rightArmScale + ')' })
      tracks['.bumi-brows'].push({ transform: 'translateY(' + m.brow + '%)' })
      tracks['.bumi-mouth'].push({ opacity: m.mouth })
      tracks['.bumi-smile'].push({ opacity: 1 - m.mouth })
    }
    animations.current = Object.entries(tracks).map(([selector, frames]) => node.querySelector(selector).animate(frames, { duration: reduced ? 1 : duration, fill: reduced ? 'forwards' : 'none', easing: 'linear' }))
    return () => { animations.current.forEach(animation => animation.cancel()); animations.current = [] }
  }, [state, reduced, loaded, autoIdle, reactionKey])
  useEffect(() => {
    animations.current.forEach(animation => {
      if (animation.playState === 'finished') return
      if (paused) animation.pause()
      else animation.play()
    })
  }, [paused, loaded, state, reduced, autoIdle, reactionKey])
  const px = typeof size === 'number' ? `${size}px` : size
  return <div ref={root} className={`bumi-wrap yaagvi-wrap ${className}`} data-bumi-state={state} data-bumi-talking={talking && !reduced ? 'true' : 'false'} data-bumi-rig="v2" data-bumi-paused={paused || reduced ? 'true' : 'false'} style={{ width: px, height: px, ...style }}>
    {failed ? <span className="bumi-fallback">Bumi</span> : <div className="bumi-rig" role="img" aria-label="Bumi, your learning companion" style={{ visibility: loaded ? 'visible' : 'hidden' }}>
      <div className="bumi-body-motion"><div className="bumi-reaction">
        <Part name="leaves" className="bumi-leaves"/>
        <Part name="arm-left" className="bumi-arm-left"/>
        <Part name="arm-right" className="bumi-arm-right"/>
        <Part name="body" className="bumi-body"/>
        <div className="bumi-face">
          <Part name="brows" className="bumi-brows"/>
          {['left', 'right'].map(side => <div className={`bumi-eye bumi-eye-${side}`} key={side}><Part name="eye"/><div className="bumi-gaze"><Part name="pupil"/></div></div>)}
          <Part name="smile" className="bumi-smile"/>
          <Part name="mouth" className="bumi-mouth"/>
        </div>
      </div></div>
    </div>}
    {speech && <div className="yaagvi-speech">{speech}</div>}
  </div>
}
