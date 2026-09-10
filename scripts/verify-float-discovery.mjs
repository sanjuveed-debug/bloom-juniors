import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
const origin='http://127.0.0.1:5173'
const browser=await chromium.launch({headless:true})
try {
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true})
 const page=await context.newPage(),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort())
 await page.goto(origin+'/play/float',{waitUntil:'domcontentloaded'})
 await expect(page.getByRole('heading',{name:'Will it float?',exact:true,level:1})).toBeVisible()
 await page.evaluate(async()=>{const {speechController}=await import('/src/lib/speechController.js');window.spoken=[];speechController.speak=(_o,text)=>window.spoken.push(text)})
 await page.screenshot({path:'tmp/float-predict-mobile.png',fullPage:true})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 const float=page.getByRole('button',{name:'Float on top',exact:true}),water=page.getByRole('button',{name:'Put the object in the water'})
 await expect(water).toBeDisabled()
 await float.click()
 const client=await context.newCDPSession(page)
 const drag=async(cancel=false)=>{
  const source=page.locator('.float-source');await source.scrollIntoViewIfNeeded()
  const a=await source.boundingBox(),b=await water.boundingBox();const x=a.x+a.width/2,y=a.y+a.height/2,tx=b.x+b.width/2,ty=b.y+b.height/2
  const send=(type,x,y)=>client.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1}]})
  await send('touchStart',x,y);for(let i=1;i<=8;i++)await send('touchMove',x+(tx-x)*i/8,y+(ty-y)*i/8)
  await expect(page.locator('.float-drag-ghost')).toBeVisible()
  await send(cancel?'touchCancel':'touchEnd',tx,ty)
 }
 await drag(true);await expect(water).toBeEnabled()
 await drag();await expect(page.locator('.float-test-object.will-float')).toBeVisible()
 await expect(page.getByRole('button',{name:'Try the next object'})).toBeEnabled()
 await expect.poll(()=>page.evaluate(()=>window.spoken.at(-1))).toMatch(/cork floats/)
 await page.screenshot({path:'tmp/float-result-mobile.png',fullPage:true})
 await page.getByRole('button',{name:'Try the next object'}).click()
 await page.reload();await expect(page.getByRole('status')).toContainText('pebble')
 for(let round=1;round<4;round++){
  await page.getByRole('button',{name:'Sink down',exact:true}).click()
  await page.locator('.float-source').click();await water.click()
  await expect(page.locator(`.float-test-object.${round===3?'will-float':'will-sink'}`)).toBeVisible()
  await page.getByRole('button',{name:round===1?'Try the next object':round===2?'Shape it into a boat':'See our discoveries'}).click()
 }
 await expect(page.getByRole('heading',{name:'You guessed. You tested. You noticed.'})).toBeVisible()
 await page.reload();await expect(page.locator('.float-journal>div')).toHaveCount(4)
 await page.getByRole('button',{name:'Change a shadow with Bumi'}).click()
 await expect(page.getByRole('heading',{name:'How can we change a shadow?'})).toBeVisible()
 await page.getByRole('button',{name:'Adventures',exact:false}).click()
 await expect(page.locator('.float-journal>div')).toHaveCount(4)
 await page.getByRole('button',{name:'Play again',exact:true}).click();await expect(float).toBeVisible()
 await page.emulateMedia({reducedMotion:'reduce'});await float.click();await water.click()
 await expect(page.getByRole('button',{name:'Try the next object'})).toBeEnabled()
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'tmp/float-desktop.png',fullPage:true})
 assert.equal(errors.length,0,errors.join('\n'))
 await page.goto(origin+'/test-picnic-profile.html',{waitUntil:'domcontentloaded'})
 await page.getByRole('button',{name:'Explore',exact:true}).click()
 await page.getByRole('button',{name:/Will it float/}).click()
 await expect(page.getByRole('heading',{name:'Will it float?',exact:true,level:1})).toBeVisible()
 console.log('PASS: gated prediction, touch drag/cancel, narration, float/sink, four rounds, reload/resume/recap, replay, reduced motion, mobile fit, profile Explore entry, no runtime errors')
} finally {await browser.close()}
