import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
const browser = await chromium.launch({ headless: true })
const cloud = new Map()
let offline = false
const mock = `export {mergeProgress} from '/src/services/cloudStore.js?passthrough';
export async function loadCloudProgress(id) { const r = await fetch('/__sync-review/'+id); if (!r.ok) throw Error('offline'); return r.json() }
export async function saveCloudProgress(id, data) { const r = await fetch('/__sync-review/'+id,{method:'POST',body:JSON.stringify(data)}); if (!r.ok) throw Error('offline'); return data }`
async function createDevice() {
  const context = await browser.newContext()
  await context.route('**/*', async route => {
    const u = new URL(route.request().url())
    if (u.hostname !== '127.0.0.1') return route.abort()
    // Exercise the cloud branch without requiring production credentials.
    if (u.pathname === '/src/lib/supabase.js') return route.fulfill({ contentType: 'text/javascript', body: 'export const isSupabaseConfigured = true; export const supabase = null;' })
    if (u.pathname === '/src/services/cloudStore.js' && !u.search.includes('passthrough')) return route.fulfill({ contentType: 'text/javascript', body: mock })
    if (u.pathname.startsWith('/__sync-review/')) {
      const id = u.pathname.split('/').pop()
      assert.ok(['qa-sync-a', 'qa-sync-b'].includes(id))
      if (offline) return route.fulfill({ status: 503, body: 'offline' })
      if (route.request().method() === 'POST') cloud.set(id, JSON.parse(route.request().postData()))
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(cloud.get(id) || null) })
    }
    if (u.pathname.startsWith('/api/')) return route.abort()
    return route.continue()
  })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:5173/test-progress-sync.html')
  await expect(page.getByRole('heading', {name:'qa-sync-a'})).toBeVisible()
  return { page, context }
}
try {
  const { page } = await createDevice()
  await page.getByRole('button', {name:'Add one'}).click()
  await expect(page.getByLabel('Saved count')).toHaveText('1')
  await page.getByRole('button', {name:'Switch profile'}).click()
  await expect.poll(() => cloud.get('qa-sync-a')?.syncReviewCount).toBe(1)
  await expect(page.getByLabel('Saved count')).toHaveText('0')
  offline = true
  await page.getByRole('button', {name:'Add one'}).click()
  await expect(page.getByLabel('Saved count')).toHaveText('1')
  const outbox = await page.evaluate(() => JSON.parse(localStorage.getItem('eduapp_sync_outbox_qa-sync-b')))
  assert.equal(outbox.syncReviewCount, 1)
  await page.reload()
  await page.getByRole('button', {name:'Switch profile'}).click()
  await expect(page.getByLabel('Saved count')).toHaveText('1')
  offline = false
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await expect.poll(() => cloud.get('qa-sync-b')?.syncReviewCount, {timeout:10000}).toBe(1)
  // Further work must continue syncing after recovery.
  await page.getByRole('button', {name:'Add one'}).click()
  await expect.poll(() => cloud.get('qa-sync-b')?.syncReviewCount, {timeout:10000}).toBe(2)
  const other = await createDevice()
  await expect(other.page.getByLabel('Saved count')).toHaveText('1')
  await other.page.getByRole('button', {name:'Switch profile'}).click()
  await expect(other.page.getByLabel('Saved count')).toHaveText('2')
  console.log('PASS: actual hook profile-switch flush, immediate durable outbox, offline reload, reconnection, profile isolation and a fresh browser context; synthetic backend only.')
} finally { await browser.close() }
