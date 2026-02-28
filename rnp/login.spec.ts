import { expect, test } from '@playwright/test'

// @SuccessfulLogin
test('@SuccessfulLogin - successful login with valid credentials', async ({
  page,
}) => {
  await page.goto('http://localhost:5173/login')
  await page.getByRole('textbox', { name: 'Username' }).click()
  await page
    .getByRole('textbox', { name: 'Username' })
    .fill('usenko.0265@gmail.com')
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill('654321')
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page.getByRole('heading', { name: 'All Posts' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Add New Post' })).toBeVisible()
})

// @failedLogin
test('@failedLogin - failed login with wrong credentials: araj / !23', async ({
  page,
}) => {
  await page.goto('http://localhost:5173/login')
  await page.getByRole('textbox', { name: 'Username' }).click()
  await page.getByRole('textbox', { name: 'Username' }).fill('araj')
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill('!23')
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page).toHaveURL('http://localhost:5173/login')
  await expect(
    page.getByText('Invalid username/password, Try again!'),
  ).toBeVisible()
})

test('@failedLogin - failed login with uppercase username: ARAJ / !23', async ({
  page,
}) => {
  await page.goto('http://localhost:5173/login')
  await page.getByRole('textbox', { name: 'Username' }).click()
  await page.getByRole('textbox', { name: 'Username' }).fill('ARAJ')
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill('!23')
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page).toHaveURL('http://localhost:5173/login')
  await expect(
    page.getByText('Invalid username/password, Try again!'),
  ).toBeVisible()
})

test('@failedLogin - failed login with mixed-case username: aRaJ / !23', async ({
  page,
}) => {
  await page.goto('http://localhost:5173/login')
  await page.getByRole('textbox', { name: 'Username' }).click()
  await page.getByRole('textbox', { name: 'Username' }).fill('aRaJ')
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill('!23')
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page).toHaveURL('http://localhost:5173/login')
  await expect(
    page.getByText('Invalid username/password, Try again!'),
  ).toBeVisible()
})

test('@failedLogin - failed login with wrong username: Test / !23', async ({
  page,
}) => {
  await page.goto('http://localhost:5173/login')
  await page.getByRole('textbox', { name: 'Username' }).click()
  await page.getByRole('textbox', { name: 'Username' }).fill('Test')
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill('!23')
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page).toHaveURL('http://localhost:5173/login')
  await expect(
    page.getByText('Invalid username/password, Try again!'),
  ).toBeVisible()
})

// @DisabledLogin
test('@DisabledLogin - form error and Log In button disabled when username is blank', async ({
  page,
}) => {
  await page.goto('http://localhost:5173/login')
  await page.getByRole('textbox', { name: 'Username' }).click()
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill('Asdf@1234')
  await expect(
    page.getByText('The username is required and cannot be empty'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Log In' })).toBeDisabled()
  await page.getByRole('button', { name: 'Log In' }).click({ force: true })
  await expect(page).toHaveURL('http://localhost:5173/login')
})

test('@DisabledLogin - form error and Log In button disabled when password is blank', async ({
  page,
}) => {
  await page.goto('http://localhost:5173/login')
  await page.getByRole('textbox', { name: 'Username' }).click()
  await page.getByRole('textbox', { name: 'Username' }).fill('araj')
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Username' }).click()
  await expect(
    page.getByText('The Password is required and cannot be empty'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Log In' })).toBeDisabled()
  await page.getByRole('button', { name: 'Log In' }).click({ force: true })
  await expect(page).toHaveURL('http://localhost:5173/login')
})
