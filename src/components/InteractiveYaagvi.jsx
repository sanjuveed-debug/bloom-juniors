import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import YaagviCharacter from './YaagviCharacter'
import { getYaagviReaction } from '../utils/yaagviReactions'

export function useYaagviReactions({
  activityKey,
  active = false,
  inactivityMs = 8500,
} = {}) {
  const counterRef = useRef(0)
  const returnTimerRef = useRef(null)
  const inactivityTimerRef = useRef(null)
  const [reaction, setReaction] = useState(() => ({
    id: 0,
    ...getYaagviReaction('ready'),
  }))

  const react = useCallback((event, context = {}) => {
    const next = getYaagviReaction(event, context)
    counterRef.current += 1
    clearTimeout(returnTimerRef.current)
    setReaction({ id: counterRef.current, ...next })

    if (next.duration > 0) {
      returnTimerRef.current = window.setTimeout(() => {
        counterRef.current += 1
        setReaction({
          id: counterRef.current,
          ...getYaagviReaction('question'),
        })
      }, next.duration)
    }
  }, [])

  useEffect(() => {
    clearTimeout(inactivityTimerRef.current)
    if (active) {
      inactivityTimerRef.current = window.setTimeout(() => {
        react('inactive')
      }, inactivityMs)
    }
    return () => clearTimeout(inactivityTimerRef.current)
  }, [activityKey, active, inactivityMs, react])

  useEffect(() => () => {
    clearTimeout(returnTimerRef.current)
    clearTimeout(inactivityTimerRef.current)
  }, [])

  return { reaction, react }
}

const SPARKLES = ['⭐', '✨', '🌟', '💛', '✨', '⭐']

export default function InteractiveYaagvi({
  reaction,
  placement = 'fixed',
  className = '',
}) {
  const reduceMotion = useReducedMotion()
  const isCelebrating = ['clap', 'celebrate', 'dance'].includes(reaction?.state)
  const isInline = placement === 'inline'
  const isStrip = placement === 'strip'

  return (
    <div
      data-testid="interactive-yaagvi"
      data-yaagvi-state={reaction?.state || 'idle'}
      aria-live="polite"
      className={`${isInline
        ? 'relative flex items-end justify-center min-h-[190px] w-full'
        : isStrip
          ? 'relative flex items-center gap-2 sm:gap-4 min-h-[86px] w-full mb-3 rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 sm:px-5 shadow-sm'
          : 'fixed bottom-safe-buddy left-2 sm:left-4 z-30 h-[150px] w-[230px] sm:h-[180px] sm:w-[300px]'
      } pointer-events-none ${className}`}
    >
      <AnimatePresence>
        {reaction?.speech && (
          <motion.div
            key={`speech-${reaction.id}`}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.86 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            className={`${isInline
              ? 'absolute top-0 left-1/2 -translate-x-1/2'
              : isStrip
                ? 'relative order-2'
                : 'absolute left-[72px] sm:left-[102px] bottom-[78px] sm:bottom-[98px]'
            } max-w-[165px] sm:max-w-[205px] rounded-2xl rounded-bl-md border-2 border-amber-500 bg-white px-3 py-2 shadow-xl`}
          >
            <p className="font-bubble text-[13px] sm:text-sm leading-snug text-amber-950">
              {reaction.speech}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${isInline
        ? 'relative mt-12'
        : isStrip
          ? 'relative order-1 shrink-0 self-end'
          : 'absolute bottom-0 left-0'
      } ${isStrip ? 'w-[64px] h-[78px] sm:w-[74px] sm:h-[88px]' : 'w-[92px] h-[112px] sm:w-[126px] sm:h-[150px]'}`}>
        <YaagviCharacter
          key={`pose-${reaction?.id || 0}`}
          state={reaction?.state || 'idle'}
          size="100%"
          style={{ height: '100%' }}
          imageStyle={{ mixBlendMode: 'multiply' }}
        />

        <AnimatePresence>
          {isCelebrating && !reduceMotion && SPARKLES.map((sparkle, index) => {
            const angle = (index / SPARKLES.length) * Math.PI * 2
            return (
              <motion.span
                key={`${reaction.id}-${index}`}
                className="absolute left-1/2 top-1/2 text-lg sm:text-xl"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.2 }}
                animate={{
                  x: Math.cos(angle) * (55 + (index % 2) * 15),
                  y: Math.sin(angle) * (55 + (index % 3) * 10),
                  opacity: 0,
                  scale: 1.25,
                  rotate: index % 2 ? 160 : -160,
                }}
                transition={{ duration: 1.1, delay: index * 0.06 }}
              >
                {sparkle}
              </motion.span>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
