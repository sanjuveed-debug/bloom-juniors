import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { YAAGVI_ATLAS, YAAGVI_IDLE, getYaagviAnimation, getYaagviFrame } from '../utils/yaagviAnimation'
import './yaagvi-character.css'
import BumiCharacter from './BumiCharacter'
import { useLearningCompanion } from './LearningCompanionContext'

export default function LearningCharacter(props) {
  const companion = useLearningCompanion()
  return companion === 'bumi' ? <BumiCharacter {...props} talking={props.talking ?? props.speaking ?? false} /> : <YaagviCharacter {...props} />
}

function YaagviCharacter({ state = 'idle', size = 180, speech = null,
  autoIdle = null, style = {}, className = '', imageStyle = {}, imageClassName = '', atlasSrc = YAAGVI_ATLAS }) {
  const wrapperRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [frame, setFrame] = useState({ row: 0, column: 0 })
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    const atlas = new Image()
    atlas.onload = () => { if (!cancelled) setLoaded(true) }
    atlas.src = atlasSrc
    return () => { cancelled = true; atlas.onload = null }
  }, [atlasSrc])

  useEffect(() => {
    let inView = true
    const sync = () => setPaused(document.hidden || !inView)
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })
    if (wrapperRef.current) observer?.observe(wrapperRef.current)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [])

  const clock = useRef({ elapsed: 0, last: null })
  useEffect(() => {
    clock.current = { elapsed: 0, last: null }
    setFrame({ row: 0, column: 0 })
  }, [state])

  useEffect(() => {
    const animation = getYaagviAnimation(state)
    if (!animation || !loaded || reducedMotion || paused) {
      clock.current.last = null
      if (reducedMotion) setFrame({ row: 0, column: 0 })
      return
    }
    let raf
    const tick = time => {
      if (clock.current.last !== null) clock.current.elapsed += time - clock.current.last
      clock.current.last = time
      const next = getYaagviFrame(animation, clock.current.elapsed)
      const done = next.done || (autoIdle && clock.current.elapsed >= autoIdle)
      const visible = done ? { row: 0, column: 0 } : next
      setFrame(previous => previous.row === visible.row && previous.column === visible.column ? previous : visible)
      if (!done) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); clock.current.last = null }
  }, [state, loaded, reducedMotion, paused, autoIdle])

  const px = typeof size === 'number' ? `${size}px` : size
  return <div ref={wrapperRef} className={`yaagvi-wrap ${className}`} style={{ width: px, height: px, ...style }}>
    {loaded || atlasSrc !== YAAGVI_ATLAS ? <div role="img" aria-label="Yaagvi" className={`yaagvi-animated ${imageClassName}`}
      style={{ backgroundImage: `url(${atlasSrc})`, backgroundPosition: `${frame.column * 20}% ${frame.row * 100 / 3}%`, ...imageStyle }}/>
      : <img src={YAAGVI_IDLE} alt="Yaagvi" draggable={false} className={`yaagvi-reference ${imageClassName}`} style={imageStyle}/>}
    {speech && <div className="yaagvi-speech">{speech}</div>}
  </div>
}
