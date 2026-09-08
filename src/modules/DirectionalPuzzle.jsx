import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { useModuleStart } from '../hooks/useModuleStart'
import { THEMES } from '../themes'

const GRID_SIZE = 5
const AVATARS = {
  bloom: '🐷', aurora: '❄️', marina: '⛵', rumi: '⭐'
}
const GOALS = {
  bloom: '💦', aurora: '🏰', marina: '🏝️', rumi: '🎤'
}
const OBSTACLES = ['🌳', '🗿', '🌊', '🔮']

// All levels verified solvable (solution path noted in comments)
const LEVELS = [
  // 1: R,R,R,D,D,D  or  D,D,D,R,R,R
  { id: 1,  grid: 4, start: [0,0], goal: [3,3], walls: [[1,1],[2,2]],                                               name: 'Easy Island' },
  // 2: D,D,D,D,R,R,R,R
  { id: 2,  grid: 5, start: [0,0], goal: [4,4], walls: [[1,0],[1,1],[2,3],[3,1]],                                   name: 'Jungle Path' },
  // 3: R,R,R,R  (walls create a corridor)
  { id: 3,  grid: 5, start: [0,2], goal: [4,2], walls: [[1,1],[1,3],[2,1],[2,3],[3,1],[3,3]],                       name: 'Maze Adventure' },
  // 4: R,R,R,R,D,D,D,D  (walls block left/bottom forcing right-then-down)
  { id: 4,  grid: 5, start: [0,0], goal: [4,4], walls: [[0,2],[0,3],[0,4],[1,4],[2,4]],                             name: 'The Long Way Round' },
  // 5: R,R,R,R,U,U,U,U  (diagonal walls force outer path)
  { id: 5,  grid: 5, start: [0,4], goal: [4,0], walls: [[1,3],[2,2],[3,1]],                                         name: 'Staircase Climb' },
  // 6: D,D,D,D,R,R,R,R  (vertical wall blocks middle shortcut)
  { id: 6,  grid: 5, start: [0,0], goal: [4,4], walls: [[2,0],[2,1],[2,2],[1,3],[3,3]],                             name: 'Blocked Middle' },
  // 7: L,D,L,D,D,R,R,D  (direct path blocked, must go around left side)
  { id: 7,  grid: 5, start: [2,0], goal: [2,4], walls: [[2,1],[1,2],[3,2]],                                         name: 'The Long Walk' },
  // 8: D,D,D,D,D,R,R,R,R,R  (two wall barriers leave only outer path)
  { id: 8,  grid: 6, start: [0,0], goal: [5,5], walls: [[1,0],[1,1],[1,2],[1,3],[3,2],[3,3],[3,4]],                 name: 'Two Walls' },
  // 9: R,U,U,U,U,U,R,R,R,R  (walls block right side going up)
  { id: 9,  grid: 6, start: [0,5], goal: [5,0], walls: [[2,4],[2,3],[2,2],[2,1],[4,4],[4,3],[4,2]],                 name: 'Up and Over' },
  // 10: D,D,L,L,D,D,L,D,L,L  (switchback through gaps in walls)
  { id: 10, grid: 6, start: [5,0], goal: [0,5], walls: [[3,0],[3,1],[2,2],[2,3],[1,4]],                             name: 'Switchback' },
  // 11: R,D,D,R,D,D,R,D,D,R,R  (three blocked zones force zigzag)
  { id: 11, grid: 6, start: [0,0], goal: [5,5], walls: [[0,2],[0,3],[0,4],[2,0],[2,1],[4,2],[4,3],[4,4]],           name: 'The Zigzag' },
  // 12: R,R,R,R,R,D,D,D,D,D  (diagonal wall forces outer edge)
  { id: 12, grid: 6, start: [0,0], goal: [5,5], walls: [[1,1],[2,2],[3,3],[4,4],[1,3],[3,1]],                       name: 'Diagonal Maze' },
]

const DIRS = [
  { label: '⬆️', dir: [0,-1], name: 'Up' },
  { label: '⬇️', dir: [0,1], name: 'Down' },
  { label: '⬅️', dir: [-1,0], name: 'Left' },
  { label: '➡️', dir: [1,0], name: 'Right' },
]

export default function DirectionalPuzzle({ avatar, progress, onAddStars, onBack, profileName }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()
  const startSignal = useModuleStart('logic')
  const [levelIndex, setLevelIndex] = useState(() =>
    Math.max(0, Math.min(progress?.logic?.maxLevel || 0, LEVELS.length - 1))
  )
  const [pos, setPos] = useState(() => {
    const safeIdx = Math.max(0, Math.min(progress?.logic?.maxLevel || 0, LEVELS.length - 1))
    return [...LEVELS[safeIdx].start]
  })
  const [sequence, setSequence] = useState([])
  const [running, setRunning] = useState(false)
  const [trail, setTrail] = useState([])
  const [status, setStatus] = useState('idle') // idle | success | fail
  const [score, setScore] = useState(0)
  const runRef = useRef(false)

  const level = LEVELS[Math.max(0, Math.min(levelIndex, LEVELS.length - 1))]
  const gridSize = level.grid
  const heroEmoji = AVATARS[avatar] || '⭐'
  const goalEmoji = GOALS[avatar] || '🎯'

  const isWall = (x, y) => level.walls.some(([wx, wy]) => wx === x && wy === y)
  const isGoal = (x, y) => x === level.goal[0] && y === level.goal[1]

  useEffect(() => {
    setPos([...level.start])
    setSequence([])
    setTrail([])
    setStatus('idle')
    if (startSignal) speak(`Level ${level.id}: ${level.name}. Help get to the goal. Add your moves, then press Go`, { mood: 'instruct' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, startSignal])

  const addMove = useCallback((dir) => {
    if (running) return
    setSequence(prev => [...prev, dir])
    speak(dir.name, { rate: 1.1 })
  }, [running, speak])

  const removeLastMove = useCallback(() => {
    setSequence(prev => prev.slice(0, -1))
  }, [])

  const runSequence = useCallback(async () => {
    if (running || sequence.length === 0) return
    setRunning(true)
    runRef.current = true
    setStatus('idle')
    setTrail([])

    let [cx, cy] = [...level.start]
    setPos([cx, cy])
    speak('Running', { mood: 'celebrate' })

    for (let i = 0; i < sequence.length; i++) {
      if (!runRef.current) break
      await new Promise(r => setTimeout(r, 500))
      const [dx, dy] = sequence[i].dir
      const nx = cx + dx, ny = cy + dy

      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize || isWall(nx, ny)) {
        speak('Oh no. Hit a wall. Try a different path', { mood: 'instruct' })
        setStatus('fail')
        setRunning(false)
        runRef.current = false
        return
      }
      cx = nx; cy = ny
      setPos([cx, cy])
      setTrail(t => [...t, [cx, cy]])

      if (isGoal(cx, cy)) {
        speak(`Amazing ${profileName || 'superstar'}. You made it in ${i + 1} moves. You are a coding genius`, { mood: 'celebrate' })
        setStatus('success')
        const newScore = score + 1
        setScore(newScore)
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.5, y: 0.5 } })
        setRunning(false)
        runRef.current = false
        onAddStars('logic', 2, {
          total: 1,
          correct: 1,
          struggles: [],
          maxLevel: levelIndex + 1,
          stayOnModule: true,
        })
        return
      }
    }

    if (status !== 'success') {
      speak("Didn't reach the goal yet. Try more moves", { mood: 'instruct' })
      setStatus('fail')
    }
    setRunning(false)
    runRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, sequence, level, gridSize, speak, onAddStars, score])

  const reset = () => {
    runRef.current = false
    setRunning(false)
    setPos([...level.start])
    setSequence([])
    setTrail([])
    setStatus('idle')
  }

  const nextLevel = () => {
    if (levelIndex < LEVELS.length - 1) setLevelIndex(l => l + 1)
    else { speak(`${profileName || 'You'} completed all levels. You are a coding superstar`, { mood: 'celebrate' }); onBack() }
  }

  const cellSize = Math.floor(280 / gridSize)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <div className="text-center">
          <p className="font-round text-xs font-bold" style={{ color: theme.text }}>
            Level {level.id}: {level.name}
          </p>
          <p className="font-bubble text-sm" style={{ color: theme.primary }}>⭐ {score} solved</p>
        </div>
        <div className="text-2xl">{heroEmoji}</div>
      </div>

      {/* Instructions */}
      <div className="mx-4 mb-2 p-3 rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
        <p className="font-round text-white text-sm text-center">
          Help {heroEmoji} reach {goalEmoji}! Add moves → Press Go!
        </p>
      </div>

      {/* Grid */}
      <div className="flex justify-center my-2">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`, gap: 3 }}>
          {Array.from({ length: gridSize }).map((_, row) =>
            Array.from({ length: gridSize }).map((_, col) => {
              const isHero = pos[0] === col && pos[1] === row
              const isG = isGoal(col, row)
              const isW = isWall(col, row)
              const isT = trail.some(([tx, ty]) => tx === col && ty === row)
              const isStart = level.start[0] === col && level.start[1] === row

              return (
                <motion.div
                  key={`${col}-${row}`}
                  className="flex items-center justify-center rounded-lg text-xl"
                  style={{
                    width: cellSize, height: cellSize,
                    background: isW ? '#374151' : isG ? `${theme.accent}30` : isT ? `${theme.primary}20` : isStart ? `${theme.secondary}30` : '#fff',
                    border: `2px solid ${isG ? theme.accent : isW ? '#1F2937' : isT ? theme.primary : theme.secondary}`,
                  }}
                  animate={isHero ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isHero ? Infinity : 0 }}
                >
                  {isW ? OBSTACLES[((col + row) * 3) % OBSTACLES.length] :
                   isHero ? heroEmoji :
                   isG ? goalEmoji :
                   isT ? '·' : ''}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Sequence display */}
      <div className="mx-4 mb-2 min-h-[48px] p-2 rounded-2xl flex flex-wrap gap-1 items-center"
        style={{ background: theme.card, border: `2px solid ${theme.secondary}` }}>
        {sequence.length === 0
          ? <p className="font-round text-sm opacity-50 w-full text-center" style={{ color: theme.text }}>Add your moves below!</p>
          : sequence.map((s, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="text-xl bg-white rounded-lg px-1 py-0.5 shadow-sm">
              {s.label}
            </motion.span>
          ))
        }
      </div>

      {/* Direction buttons */}
      <div className="px-4 mb-2">
        <div className="grid grid-cols-4 gap-2 mb-2">
          {DIRS.map(d => (
            <motion.button
              key={d.name}
              whileTap={{ scale: 0.85 }}
              onClick={() => addMove(d)}
              disabled={running}
              className="py-3 rounded-2xl text-2xl shadow-md font-bold"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
            >
              {d.label}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={removeLastMove} disabled={running || sequence.length === 0}
            className="flex-1 py-3 rounded-2xl font-bubble text-sm disabled:opacity-40"
            style={{ background: '#EF4444', color: 'white' }}>
            ↩ Undo
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={reset} disabled={running}
            className="flex-1 py-3 rounded-2xl font-bubble text-sm disabled:opacity-40"
            style={{ background: '#F59E0B', color: 'white' }}>
            🔄 Reset
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={runSequence}
            disabled={running || sequence.length === 0}
            className="flex-1 py-3 rounded-2xl font-bubble text-sm disabled:opacity-40"
            style={{ background: '#22C55E', color: 'white' }}>
            ▶ Go!
          </motion.button>
        </div>
      </div>

      {/* Status */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-3xl p-8 mx-8 text-center shadow-2xl">
              <div className="text-7xl mb-3">🎉</div>
              <h2 className="font-bubble text-3xl shimmer-text mb-3">You Did It!</h2>
              <motion.button whileTap={{ scale: 0.9 }} onClick={nextLevel}
                className="bubble-btn px-8 py-4 text-xl"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                {levelIndex < LEVELS.length - 1 ? 'Next Level →' : 'Finish! 🏆'}
              </motion.button>
            </div>
          </motion.div>
        )}
        {status === 'fail' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-orange-400 px-6 py-3 rounded-2xl shadow-xl z-50"
          >
            <p className="font-bubble text-white text-lg">Try again! You've got this! 💪</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
