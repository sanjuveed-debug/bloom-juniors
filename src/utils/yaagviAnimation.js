export const YAAGVI_ATLAS = '/yaagvi/reactions-atlas-v1.webp'
export const YAAGVI_IDLE = '/yaagvi/idle-v1.webp'
const wave = { row: 0, frames: [0,1,2,3,2,3,2,1,0], frameMs: 150 }
const think = { row: 1, frames: [0,1,2,3,3,2,1,0], frameMs: 180 }
const clap = { row: 2, frames: [0,1,2,1,0,1,2,1,0,5], frameMs: 120 }
const celebrate = { row: 3, frames: [0,1,2,4,4,4,2,1,0,5], frameMs: 130 }
const animations = { wave, think, point: think, read: think, clap, celebrate, dance: celebrate }
export function getYaagviAnimation(state) { return animations[state] || null }
export function getYaagviFrame(animation, elapsed) {
  if (!animation) return { row: 0, column: 0, done: true }
  const index = Math.min(animation.frames.length - 1, Math.floor(Math.max(0, elapsed) / animation.frameMs))
  return { row: animation.row, column: animation.frames[index], done: elapsed >= animation.frames.length * animation.frameMs }
}
