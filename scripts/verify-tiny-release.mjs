import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const origin=process.argv[2]||'https://bloomjuniors.com'
const html=await (await fetch(origin,{cache:'no-store'})).text()
const local=await readFile('dist/index.html','utf8')
const main=local.match(/src="(\/assets\/main-[^"]+\.js)"/)[1]
assert.ok(html.includes(main))
const tiny=(await readdir('dist/assets')).filter(f=>/^ToddlerApp-.*\.(js|css)$/.test(f)).map(f=>'/assets/'+f)
assert.equal(tiny.length,2)
for(const file of [main,...tiny,'/sw.js']){
 const response=await fetch(origin+file);assert.equal(response.status,200)
 const sha=data=>createHash('sha256').update(data).digest('hex')
 assert.equal(sha(Buffer.from(await response.arrayBuffer())),sha(await readFile('dist'+file)))
}
for(const file of ['test-tiny-profile.html','test-picnic-profile.html'])await assert.rejects(access('dist/'+file))
console.log(JSON.stringify({origin,main,tiny,matched:4,testFixturesExcluded:true}))
