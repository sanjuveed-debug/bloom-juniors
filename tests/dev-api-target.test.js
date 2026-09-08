import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveDevApiTarget } from '../scripts/dev-api-target.mjs'

test('development never falls back to production APIs', () => {
  assert.equal(resolveDevApiTarget(), null)
  assert.equal(resolveDevApiTarget('http://127.0.0.1:8788'), 'http://127.0.0.1:8788')
  for (const value of ['https://bloomjuniors.com', 'https://localhost.example.test', 'http://user:password@localhost:8788', 'http://localhost:8788/api', 'file:///tmp/api']) {
    assert.throws(() => resolveDevApiTarget(value))
  }
})
