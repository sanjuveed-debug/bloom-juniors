import test from 'node:test'
import assert from 'node:assert/strict'
import { createPausableTimers } from '../src/utils/pausableTimers.js'

function fixture() {
  let time = 0, id = 0
  const jobs = new Map()
  const timers = createPausableTimers({ now: () => time,
    schedule: (fn, delay) => { jobs.set(++id, { fn, at: time + delay }); return id },
    cancel: key => jobs.delete(key),
  })
  return { timers, advance(ms) {
    const end = time + ms
    while (true) {
      const next = [...jobs].filter(([, job]) => job.at <= end).sort((a, b) => a[1].at - b[1].at)[0]
      if (!next) break
      time = next[1].at; jobs.delete(next[0]); next[1].fn()
    }
    time = end
  } }
}

test('feedback resumes with remaining delay after backgrounding, exactly once', () => {
  const { timers, advance } = fixture(); let calls = 0
  timers.track(() => calls++, 1000)
  advance(400); timers.pause(); timers.pause(); advance(60000)
  assert.equal(calls, 0)
  timers.resume(); timers.resume(); advance(599); assert.equal(calls, 0)
  advance(1); assert.equal(calls, 1); advance(60000); assert.equal(calls, 1)
})
test('a timer scheduled while hidden waits for a full visible delay', () => {
  const { timers, advance } = fixture(); let calls = 0
  timers.pause(); timers.track(() => calls++, 800); advance(5000)
  timers.resume(); advance(799); assert.equal(calls, 0)
  advance(1); assert.equal(calls, 1)
})
test('unmount or cancellation discards paused callbacks', () => {
  const { timers, advance } = fixture(); let calls = 0
  timers.track(() => calls++, 800); advance(100); timers.pause(); timers.clearAll()
  timers.resume(); advance(10000); assert.equal(calls, 0)
})
test('multiple pauses preserve ordering and remaining visible time', () => {
  const { timers, advance } = fixture(); const calls = []
  timers.track(() => calls.push('first'), 400); timers.track(() => calls.push('second'), 800)
  advance(200); timers.pause(); advance(1000); timers.resume(); advance(200)
  assert.deepEqual(calls, ['first']); timers.pause(); advance(1000); timers.resume()
  advance(400); assert.deepEqual(calls, ['first', 'second'])
})
