import test from 'node:test'
import assert from 'node:assert/strict'
import { createProgressSyncQueue } from '../src/utils/progressSyncQueue.js'

const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b }); return { promise, resolve, reject } }
function harness(save) {
  let outbox = null, successes = 0, errors = 0
  const q = createProgressSyncQueue({ save,
    persist: data => { outbox = data }, clear: data => { if (outbox === data) outbox = null },
    onSuccess: () => successes++, onError: () => errors++,
    setTimer: () => 1, cancelTimer: () => {}, wait: async () => {},
  })
  return { q, get outbox() { return outbox }, get successes() { return successes }, get errors() { return errors } }
}
test('queued progress is durable before the debounce runs', async () => {
  const calls = []
  const h = harness(async data => calls.push(data))
  h.q.schedule({ revision: 1 })
  assert.equal(h.outbox.revision, 1)
  assert.equal(calls.length, 0)
  await h.q.dispose()
  assert.equal(calls.length, 1)
  assert.equal(h.outbox, null)
  assert.equal(h.successes, 0)
})
test('in-flight older write cannot acknowledge newer progress', async () => {
  const first = deferred(), second = deferred(), calls = []
  const h = harness(data => { calls.push(data); return calls.length === 1 ? first.promise : second.promise })
  h.q.schedule({ revision: 1 })
  const flush = h.q.flush()
  h.q.schedule({ revision: 2 })
  assert.equal(calls.length, 1)
  first.resolve()
  await Promise.resolve(); await Promise.resolve()
  assert.equal(h.outbox.revision, 2)
  assert.equal(h.successes, 0)
  second.resolve(); await flush
  assert.deepEqual(calls.map(p => p.revision), [1, 2])
  assert.equal(h.outbox, null)
})
test('failed writes stay durable and recover on the next flush', async () => {
  let offline = true, calls = 0
  const h = harness(async () => { calls++; if (offline) throw new Error('offline') })
  h.q.schedule({ revision: 3 }); await h.q.flush()
  assert.equal(calls, 3)
  assert.equal(h.outbox.revision, 3)
  assert.equal(h.errors, 1)
  offline = false; await h.q.flush()
  assert.equal(h.outbox, null)
  assert.equal(h.successes, 1)
})
test('failed older upload never overwrites a newer outbox payload', async () => {
  const first = deferred()
  const calls = []
  const h = harness(data => { calls.push(data.revision); return calls.length === 1 ? first.promise : Promise.reject(new Error('offline')) })
  h.q.schedule({ revision: 1 }); const flush = h.q.flush()
  h.q.schedule({ revision: 2 }); first.reject(new Error('offline'))
  await flush
  assert.equal(h.outbox.revision, 2)
  assert.deepEqual(calls, [1, 2, 2, 2])
})
test('profile disposal retains failed pending work without notifying the new profile', async () => {
  const h = harness(async () => { throw new Error('offline') })
  h.q.schedule({ revision: 4 }); await h.q.dispose()
  assert.equal(h.outbox.revision, 4)
  assert.equal(h.errors, 0)
})
