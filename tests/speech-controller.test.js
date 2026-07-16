import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpeechController, getAzureTtsEndpoint, preprocessSpeechText } from '../src/lib/speechController.js'

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function makeAudio() {
  return {
    paused: true,
    played: [],
    load() {},
    pause() { this.paused = true },
    removeAttribute() { this.src = '' },
    play() {
      this.paused = false
      this.played.push(this.src)
      this.onplay?.()
      return Promise.resolve()
    },
  }
}

function audioResponse(id) {
  return {
    ok: true,
    headers: { get: () => 'audio/mpeg' },
    blob: async () => ({ id }),
  }
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

test('local development uses the deployed Azure proxy, never browser speech synthesis', () => {
  assert.equal(
    getAzureTtsEndpoint({ hostname: '127.0.0.1' }),
    'https://bloomjuniors.com/api/tts?v=5'
  )
  assert.equal(getAzureTtsEndpoint({ hostname: 'bloomjuniors.com' }), '/api/tts?v=5')
})

test('speech text cleanup removes emoji and repairs repeated punctuation', () => {
  assert.equal(preprocessSpeechText('Great job!! 🎉  Try A & B...'), 'Great job! Try A and B.')
  assert.equal(preprocessSpeechText('Count one — then two'), 'Count one, then two')
})

test('latest speech request wins even when an older Azure response finishes later', async () => {
  const requests = new Map()
  const audio = makeAudio()
  const controller = createSpeechController({
    createAudio: () => audio,
    getCachedImpl: async () => null,
    setCachedImpl: async () => {},
    createObjectURL: blob => `blob:${blob.id}`,
    revokeObjectURL: () => {},
    endpoint: () => '/api/tts',
    fetchImpl: async (_url, options) => {
      const text = JSON.parse(options.body).text
      const gate = deferred()
      requests.set(text, { ...gate, signal: options.signal })
      return gate.promise
    },
  })

  controller.speak('screen-a', 'Old page voice')
  await flush()
  controller.speak('screen-b', 'New page voice')
  await flush()

  assert.equal(requests.get('Old page voice').signal.aborted, true)
  requests.get('New page voice').resolve(audioResponse('new'))
  await flush()
  assert.deepEqual(audio.played, ['blob:new'])

  requests.get('Old page voice').resolve(audioResponse('old'))
  await flush()
  assert.deepEqual(audio.played, ['blob:new'])
})

test('releasing a screen cancels its pending Azure voice before playback', async () => {
  const gate = deferred()
  const audio = makeAudio()
  const controller = createSpeechController({
    createAudio: () => audio,
    getCachedImpl: async () => null,
    setCachedImpl: async () => {},
    createObjectURL: blob => `blob:${blob.id}`,
    revokeObjectURL: () => {},
    endpoint: () => '/api/tts',
    fetchImpl: async () => gate.promise,
  })

  controller.speak('leaving-screen', 'This must not follow me')
  await flush()
  controller.release('leaving-screen')
  gate.resolve(audioResponse('late'))
  await flush()

  assert.deepEqual(audio.played, [])
  assert.equal(controller.getState().activeOwner, null)
})
