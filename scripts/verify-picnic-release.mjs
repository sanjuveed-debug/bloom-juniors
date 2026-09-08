import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const origin = process.argv[2] || 'https://bloomjuniors.com'
const html = await (await fetch(origin, { cache: 'no-store' })).text()
const localHtml = await readFile('dist/index.html', 'utf8')
const main = localHtml.match(/src="(\/assets\/main-[^"]+\.js)"/)[1]
assert.ok(html.includes(main), 'Live HTML must serve the final main bundle')
const files = [main, '/sw.js', '/picnic-friends-v1.webp', '/bumi/avatar-v1.webp']
for (const path of files) {
  const response = await fetch(origin + path)
  assert.equal(response.status, 200)
  const remote = Buffer.from(await response.arrayBuffer())
  const local = await readFile('dist' + path)
  const hash = data => createHash('sha256').update(data).digest('hex')
  assert.equal(hash(remote), hash(local), path)
}
console.log(JSON.stringify({ origin, main, matched: files.length }))
