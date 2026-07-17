import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const results = []
const check=(label,ok)=>{results.push({label,ok});console.log(`${ok?'PASS':'FAIL'} - ${label}`)}

for (const age of ['toddler','early','junior']) {
  const page=await browser.newPage({viewport:{width:390,height:844}})
  await page.goto(`http://127.0.0.1:5173/test-companion-bond.html?age=${age}`,{waitUntil:'networkidle'})
  const badge=page.getByTestId('companion-badge')
  check(`${age}: selected companion follows into the module`,await badge.getAttribute('aria-label')==='Starlight Fox, friendship level 2')
  check(`${age}: game header has no phone overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth))
  await badge.click({force:true})
  check(`${age}: companion responds when tapped`,await page.getByText(age==='toddler'?'Let’s play!':age==='junior'?/ready for math/:/learning beside you/).count()>0)
  const power=page.getByTestId('companion-power')
  check(`${age}: companion power starts charged`,(await power.getAttribute('aria-label'))?.endsWith('3 charges'))
  await power.click({force:true})
  check(`${age}: companion removes an unlikely answer`,await page.locator('[data-companion-hidden="true"]').count() >= 1)
  check(`${age}: using the power consumes one charge`,(await power.getAttribute('aria-label'))?.endsWith('2 charges'))
  await page.getByRole('button',{name:'Finish a learning win'}).click()
  check(`${age}: companion reacts to increased learning progress`,await page.getByText(age==='toddler'?'We grew together!':age==='junior'?/Bond \+5/:/learning win.*\+5/i).count()>0)
  await page.close()
}

await browser.close()
const failed=results.filter(result=>!result.ok)
console.log(`\n${results.length-failed.length}/${results.length} companion checks passed.`)
if(failed.length)process.exit(1)
