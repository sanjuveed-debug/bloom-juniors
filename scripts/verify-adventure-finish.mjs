import {chromium,expect} from '@playwright/test'
import assert from 'node:assert/strict'
import {COLLECTION_ADVENTURES,applyCollectionAction} from '../src/utils/collectionAdventure.js'
let p={},t=1
for(const round of COLLECTION_ADVENTURES.snacks.rounds){round.targets.forEach((n,i)=>{for(let j=0;j<n;j++)p=applyCollectionAction(p,'snacks',{type:'ADD',index:i},t++)});p=applyCollectionAction(p,'snacks',{type:'SUBMIT'},t++);p=applyCollectionAction(p,'snacks',{type:'NEXT'},t++)}
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'})
 await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='127.0.0.1'&&!u.pathname.startsWith('/api/')?r.continue():r.abort()})
 await page.goto('http://127.0.0.1:5173/test-picnic-profile.html')
 await expect(page.getByRole('region',{name:'Your next activity'})).toBeVisible({timeout:30000})
 await page.evaluate(p=>localStorage.setItem('yaagvi_progress_v1',JSON.stringify({...JSON.parse(localStorage.getItem('yaagvi_progress_v1')||'{}'),...p})),p);await page.reload()
 const open=()=>page.getByRole('navigation',{name:'Your picnic adventure path'}).getByRole('button',{name:/Share the Snacks/}).click()
 await open()
 const choices=page.getByRole('region',{name:'Choose what happens next'})
 await expect(choices).toBeVisible()
 await choices.screenshot({path:'tmp/adventure-finish-mobile.png'})
 await page.getByRole('button',{name:'Finish for now',exact:true}).click()
 await expect(page.getByRole('region',{name:'Your next activity'})).toBeVisible()
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yaagvi_progress_v1')))
 assert.deepEqual(saved.collectionAdventures.snacks.state.report,p.collectionAdventures.snacks.state.report)
 await page.reload();await expect(page.getByRole('region',{name:'Your next activity'})).toBeVisible({timeout:30000});await open()
 await page.getByRole('button',{name:'Next: Sound Pop \u2192',exact:true}).click()
 await expect(page.locator('.collection-scene')).toHaveCount(0)
 await expect(page.getByText('Sound Pop',{exact:true}).first()).toBeVisible({timeout:15000})
 console.log('PASS: completed sharing offers both choices; finish/reload preserves report; explicit next opens Sound Pop. Synthetic local-only progress.')
}finally{await browser.close()}
