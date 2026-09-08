import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { applyCollectionAction } from '../src/utils/collectionAdventure.js'
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='127.0.0.1'&&!u.pathname.startsWith('/api/')?r.continue():r.abort()})
 const b=name=>page.getByRole('button',{name,exact:true})
 const open=async()=>{await b('Parents').click();for(const n of ['1','2','3','4'])await b(n).click();await expect(page.getByRole('region',{name:'Learning at a glance'})).toBeVisible()}
 await page.goto('http://127.0.0.1:5173/test-picnic-profile.html')
 await open()
 const recap=page.getByRole('region',{name:'Learning at a glance'})
 await expect(recap).toContainText('No saved progress')
 await recap.getByRole('button').click()
 await expect(page.getByRole('region',{name:'Your next activity'})).toBeVisible()
 const p=applyCollectionAction({},'basket',{type:'HELP'},Date.now())
 await page.evaluate(p=>localStorage.setItem('yaagvi_progress_v1',JSON.stringify(p)),p)
 await page.reload();await open()
 await expect(recap).toContainText('0 of 2 rounds completed')
 await expect(recap).toContainText('Opened the demonstration in 1 round')
 await expect(recap).toContainText('Suggested next: Pack the Basket')
 await expect(page.getByText('More weekly insights',{exact:true})).toBeVisible()
 await recap.scrollIntoViewIfNeeded()
 await recap.screenshot({path:'tmp/parent-at-a-glance-mobile.png'})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await page.setViewportSize({width:1440,height:900})
 await page.screenshot({path:'tmp/parent-at-a-glance-desktop.png',fullPage:true})
 await recap.getByRole('button').click()
 await expect(page.getByRole('region',{name:'Your next activity'})).toContainText('Pack the Basket')
 assert.deepEqual(errors,[])
 console.log('PASS: PIN-gated empty/partial parent overview, evidence, recommended saved activity, mobile fit and return to child home; synthetic local progress only.')
}finally{await browser.close()}
