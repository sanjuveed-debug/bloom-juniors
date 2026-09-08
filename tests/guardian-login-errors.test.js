import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse } from '@babel/parser'
import vm from 'node:vm'
const source = readFileSync(new URL('../src/components/GuardianLogin.jsx', import.meta.url), 'utf8')
const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] })
const functions = []
function visit(node) {
  if (!node || typeof node !== 'object') return
  if (node.type === 'ArrowFunctionExpression') functions.push(source.slice(node.start, node.end))
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === 'object') visit(value)
  }
}
visit(ast)
for (const kind of ['login', 'recovery']) {
  test(`${kind} callback rejection clears the loading state and offers a retry`, async () => {
    const changes = {}
    const context = { loginPending: {current: false}, fullLogin: true, email: 'test@example.test', guardianEmail: '', password: 'test-only-password', pin: '1234', isSupabaseConfigured: true,
      onLogin: async () => { throw new Error('offline') }, onForgot: async () => { throw new Error('offline') },
      setLoading: value => { changes.loading = value }, setResetting: value => { changes.resetting = value },
      setError: value => { changes.error = value }, setNotice: () => {}, setPin: value => { changes.pin = value }, setShaking: () => {}, setTimeout,
    }
    const code = functions.find(code => code.includes(kind === 'login' ? 'await onLogin(' : 'await onForgot?.'))
    assert.ok(code)
    await vm.runInNewContext(`(${code})()`, context)
    assert.equal(changes[kind === 'login' ? 'loading' : 'resetting'], false)
    assert.match(changes.error, /unavailable/)
    if (kind === 'login') assert.equal(changes.pin, '')
  })
}
