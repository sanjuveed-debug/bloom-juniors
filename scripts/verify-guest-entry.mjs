import {chromium,expect} from '@playwright/test'
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'})
 await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname!=='127.0.0.1'||u.pathname.startsWith('/api/')?r.abort():r.continue()})
 await page.goto('http://127.0.0.1:5173/')
 const play=page.getByRole('link',{name:'Play the picnic free',exact:true})
 await expect(play).toHaveAttribute('href','/play',{timeout:30000});await play.click()
 await expect(page.getByRole('button',{name:'Take an apple',exact:true})).toBeVisible({timeout:30000})
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'tmp/guest-start-mobile.png',fullPage:true})
 console.log('PASS: fresh public landing CTA opens playable /play without authentication.')
}finally{await browser.close()}
