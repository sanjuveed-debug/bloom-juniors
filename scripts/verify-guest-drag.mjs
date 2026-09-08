import {chromium,expect} from '@playwright/test'
import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
await mkdir('tmp',{recursive:true})
const origin=process.argv[2]||'http://127.0.0.1:5173'
const browser=await chromium.launch({headless:true})
try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'})
 const page=await context.newPage(),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/*',r=>{const u=new URL(r.request().url());return u.origin!==origin||u.pathname.startsWith('/api/')?r.abort():r.continue()})
 const b=name=>page.getByRole('button',{name,exact:true})
 await page.goto(origin+'/play')
 await expect(b('Take an apple')).toBeVisible({timeout:30000})
 await page.evaluate(()=>localStorage.setItem('eduapp_progress_isolation','untouched'))
 const client=await context.newCDPSession(page)
 const touch=async(type,x,y)=>client.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1}],modifiers:0})
 const count=async name=>Number(await page.getByRole('region',{name:`${name}'s place`}).locator('.collection-controls>span').textContent())
 const drag=async(name,{cancel=false,outside=false}={})=>{
  const target=page.getByRole('region',{name:`${name}'s place`}).locator('.collection-answer')
  await target.scrollIntoViewIfNeeded()
  const src=await b('Take an apple').boundingBox(),to=await target.boundingBox()
  const x=src.x+src.width/2,y=src.y+src.height/2,tx=outside?4:to.x+to.width/2,ty=outside?25:to.y+to.height/2
  await touch('touchStart',x,y)
  for(let n=1;n<=10;n++){await touch('touchMove',x+(tx-x)*n/10,y+(ty-y)*n/10);await page.waitForTimeout(12)}
  await expect(page.locator('.collection-drag-ghost')).toBeVisible()
  if(!outside)await expect(page.getByRole('region',{name:`${name}'s place`})).toHaveAttribute('data-drop-active','true')
  await touch(cancel?'touchCancel':'touchEnd',tx,ty)
  await expect(page.locator('.collection-drag-ghost')).toHaveCount(0)
 }
 await drag('Pip');assert.equal(await count('Pip'),1)
 await drag('Wren',{cancel:true});assert.equal(await count('Wren'),0)
 await drag('Wren',{outside:true});assert.equal(await count('Wren'),0)
 await drag('Wren');assert.equal(await count('Wren'),1)
 await page.reload();assert.equal(await count('Pip'),1);assert.equal(await count('Wren'),1)
 await b('Take an apple').click();await page.getByRole('region',{name:"Momo's place"}).locator('.collection-answer').click()
 assert.equal(await count('Momo'),1)
 await page.screenshot({path:'tmp/guest-drag-mobile.png',fullPage:true})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await b('Let\u2019s check together \u2713').click();await b('Try a new arrangement \u2192').click()
 for(const name of ['Bo','Momo','Pip','Wren'])await drag(name)
 await b('Let\u2019s check together \u2713').click();await b('Take the idea home \u2192').click()
 await b('See our discovery \u2192').click()
 await expect(page.getByRole('heading',{name:'A little discovery, together.'})).toBeVisible()
 await expect(page.getByRole('link',{name:'Explore with a parent account \u2192'})).toHaveAttribute('href','/?app=1')
 await expect(page.getByRole('link',{name:'Tell Sanju by email \u2197'})).toHaveAttribute('href',/^mailto:/)
 assert.equal(await page.evaluate(()=>localStorage.getItem('eduapp_progress_isolation')),'untouched')
 assert.equal(await page.evaluate(()=>localStorage.getItem('yaagvi_progress_v1')),null)
 await page.screenshot({path:'tmp/guest-recap-mobile.png',fullPage:true})
 assert.deepEqual(errors,[])
 console.log('PASS: genuine Chromium touch drag, highlighted targets, pointer cancellation, outside drop, no duplicate placements, tap alternative, reload, two rounds, no-account recap/CTA, profile-storage isolation, mobile fit and no runtime errors; external requests blocked.')
}finally{await browser.close()}
