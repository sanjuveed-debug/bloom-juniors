import {chromium,expect} from '@playwright/test'
import assert from 'node:assert/strict'
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce'})
 await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname!=='127.0.0.1'||u.pathname.startsWith('/api/')?r.abort():r.continue()})
 const b=name=>page.getByRole('button',{name,exact:true})
 const mouseDrag=async(src,target)=>{await target.scrollIntoViewIfNeeded();const a=await src.boundingBox(),z=await target.boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(z.x+z.width/2,z.y+z.height/2,{steps:15});await page.mouse.up()}
 await page.goto('http://127.0.0.1:5173/test-picnic-profile.html')
 await b('Play with Bumi').click()
 await mouseDrag(page.getByRole('button',{name:/^Take a plate/}),b("Place plate at Pip's place"))
 await expect(b("Remove plate from Pip's place")).toBeVisible()
 await mouseDrag(b("Remove plate from Pip's place"),b("Place plate at Wren's place"))
 await expect(b("Place plate at Pip's place")).toBeVisible();await expect(b("Remove plate from Wren's place")).toBeVisible()
 await b('Back to home').click()
 await page.getByRole('navigation',{name:'Your picnic adventure path'}).getByRole('button',{name:/Pack the Basket/}).click()
 const apples=page.getByRole('region',{name:'apples in our basket'}),pears=page.getByRole('region',{name:'pears in our basket'})
 await mouseDrag(b('Take a pear'),apples.locator('.collection-answer'));await expect(apples.locator('.collection-controls>span')).toHaveText('0')
 await mouseDrag(b('Take a pear'),pears.locator('.collection-answer'));await expect(pears.locator('.collection-controls>span')).toHaveText('1')
 await b('Take an apple').focus();await page.keyboard.press('Space');await apples.locator('.collection-answer').focus();await page.keyboard.press('Enter')
 await expect(apples.locator('.collection-controls>span')).toHaveText('1')
 await page.keyboard.press('Enter');await expect(apples.locator('.collection-controls>span')).toHaveText('0')
 console.log('PASS: mouse plate placement and relocation; wrong fruit target rejected; mouse fruit drop once; keyboard pick/place/remove.')
}finally{await browser.close()}
