import { test, expect } from '@playwright/test'

// @FailedResetPassword
test('@FailedResetPassword - password reset token is invalid or has expired', async ({ page }) => {
  await page.goto('http://localhost:5173/reset-password/invalidtoken')
  await expect(page).toHaveURL('http://localhost:5173/forgot-password')
  await expect(page.getByText('Password reset token is invalid or has expired.')).toBeVisible()
})
