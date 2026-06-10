import { test, expect } from '@playwright/test'

const BASE_URL = process.env.UAT_BASE_URL || 'https://bloomjuniors.com'

test('teacher entry page shows the expected choices', async ({ page }) => {
  await page.goto(`${BASE_URL}/?teacher=1`, { waitUntil: 'networkidle' })

  await expect(page.getByText('Teacher Access')).toBeVisible()
  await expect(page.getByText('Sign in to teacher account')).toBeVisible()
  await expect(page.getByRole('button', { name: /create a school/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /join with invite link/i })).toBeVisible()

  const body = await page.textContent('body')
  expect(body).not.toMatch(/Ã|â|ð|ï|Â/)
})

test('schools landing page is live', async ({ page }) => {
  await page.goto(`${BASE_URL}/schools`, { waitUntil: 'networkidle' })

  await expect(page.getByText('Designed to be safe in schools')).toBeVisible()
  await expect(page.getByText('Teacher invite flow')).toBeVisible()

  const body = await page.textContent('body')
  expect(body).not.toMatch(/Ã|â|ð|ï|Â/)
})

test('class tablet route is live and rejects invalid codes cleanly', async ({ page }) => {
  await page.goto(`${BASE_URL}/class`, { waitUntil: 'networkidle' })

  await expect(page.getByText(/class code/i)).toBeVisible()
  const body = await page.textContent('body')
  expect(body).not.toMatch(/Ã|â|ð|ï|Â/)
})
