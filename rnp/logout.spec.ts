import { test } from '@playwright/test'

async function loginUser(page) {
  await page.goto('http://localhost:5173/login')
  await page.getByRole('textbox', { name: 'Username' }).click()
  await page
    .getByRole('textbox', { name: 'Username' })
    .fill('usenko.0265@gmail.com')
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill('654321')
  await page.getByRole('button', { name: 'Log In' }).click()
  await page.waitForURL('http://localhost:5173/')
}

// @SuccessfulLogout
test('@SuccessfulLogout - successful logout and redirect to login page', async ({
  page,
}) => {
  await loginUser(page)
  await page.getByRole('button', { name: 'Logout' }).click()
  await page.waitForURL('http://localhost:5173/login')
})
