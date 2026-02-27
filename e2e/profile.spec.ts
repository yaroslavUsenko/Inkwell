import { expect, test } from '@playwright/test'

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

// @EdiProfile
test('@EdiProfile - successful edit of profile', async ({ page }) => {
  await loginUser(page)
  await page.getByRole('link', { name: 'My Profile' }).click()
  await page.getByRole('textbox', { name: 'First Name' }).click()
  await page.getByRole('textbox', { name: 'First Name' }).fill('ashis')
  await page.getByRole('textbox', { name: 'Last Name' }).click()
  await page.getByRole('textbox', { name: 'Last Name' }).fill('raj')
  await page.getByRole('textbox', { name: 'Age' }).click()
  await page.getByRole('textbox', { name: 'Age' }).fill('25')
  await page.getByRole('combobox', { name: 'Gender' }).selectOption('Male')
  await page.getByRole('textbox', { name: 'Address' }).click()
  await page.getByRole('textbox', { name: 'Address' }).fill('E-605')
  await page.getByRole('textbox', { name: 'Website' }).click()
  await page
    .getByRole('textbox', { name: 'Website' })
    .fill('https://example.com')
  await page.getByRole('button', { name: 'Update Profile' }).click()
  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(page.getByText('Profile updated successfully!')).toBeVisible()
})

// @ViewProfile
test('@ViewProfile - successful view of profile page', async ({ page }) => {
  await loginUser(page)
  await page.getByRole('link', { name: 'My Profile' }).click()
  await expect(
    page.getByRole('heading', { name: 'Your Profile' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'My Profile' })).toHaveClass(
    /active/,
  )
  await expect(page.getByRole('heading', { name: 'ashis raj' })).toBeVisible()
  await expect(page.getByText('Email: usenko.0265@gmail.com')).toBeVisible()
  await expect(page.getByText('Age: 25')).toBeVisible()
  await expect(page.getByText('Gender: Male')).toBeVisible()
  await expect(page.getByText('Address: E-')).toBeVisible()
  await expect(page.getByText('Website: https://example.com')).toBeVisible()
})
