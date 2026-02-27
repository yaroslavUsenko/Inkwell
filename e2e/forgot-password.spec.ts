import { test, expect } from '@playwright/test'

// @SuccessfulForgotPassword
test('@SuccessfulForgotPassword - successful submit of forgot password form with valid email', async ({ page }) => {
  await page.goto('http://localhost:5173/login')
  await page.goto('http://localhost:5173/forgot-password')
  await page.getByRole('textbox', { name: 'Email' }).click()
  await page.getByRole('textbox', { name: 'Email' }).fill('asdf@example.com')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page).toHaveURL('http://localhost:5173/forgot-password')
})

// @failedForgotPassword
test('@failedForgotPassword - failed submit of forgot password form with non-existent email', async ({ page }) => {
  await page.goto('http://localhost:5173/login')
  await page.goto('http://localhost:5173/forgot-password')
  await page.getByRole('textbox', { name: 'Email' }).click()
  await page.getByRole('textbox', { name: 'Email' }).fill('asdf.invalid@example.com')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page).toHaveURL('http://localhost:5173/forgot-password')
  await expect(page.getByText('No account with that email address exists.')).toBeVisible()
})
