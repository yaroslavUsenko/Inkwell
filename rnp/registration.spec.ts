import { expect, test } from '@playwright/test'

test.describe('Registration', () => {
  // ── Happy path ────────────────────────────────────────────────────────────

  test.describe('@SuccessfulRegistration', () => {
    test('redirects to home with nav after valid credentials', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('textbox', { name: 'Username' }).fill('asdf.asdf')
      await page.getByRole('textbox', { name: 'Email' }).fill('asdf.asdf@example.com')
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Asdf@1234')
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Asdf@1234')
      await page.getByRole('button', { name: 'Register Now' }).click()

      await expect(page).toHaveURL('/')
      await expect(page.getByRole('heading', { name: 'All Posts' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Add New Post' })).toBeVisible()
    })
  })

  // ── Form validation ───────────────────────────────────────────────────────

  test.describe('@DisabledRegistration', () => {
    test('shows error and disables submit when username is blank', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('textbox', { name: 'Username' }).click()
      await page.getByRole('textbox', { name: 'Email' }).fill('asdf.asdf@example.com')
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Asdf@1234')
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Asdf@1234')

      await expect(
        page.getByText('The username is required and cannot be empty'),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Register Now' })).toBeDisabled()
      await page.getByRole('button', { name: 'Register Now' }).click({ force: true })
      await expect(page).toHaveURL('/register')
    })

    test('shows error and disables submit when email is blank', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('textbox', { name: 'Username' }).fill('asdf')
      await page.getByRole('textbox', { name: 'Email' }).click()
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Asdf@1234')
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Asdf@1234')

      await expect(
        page.getByText('The email is required and cannot be empty'),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Register Now' })).toBeDisabled()
      await page.getByRole('button', { name: 'Register Now' }).click({ force: true })
      await expect(page).toHaveURL('/register')
    })

    test('shows error and disables submit when email is invalid', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('textbox', { name: 'Username' }).fill('asdf')
      await page.getByRole('textbox', { name: 'Email' }).fill('asdf')
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Asdf@1234')
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Asdf@1234')

      await expect(page.getByText('The email address is not valid')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Register Now' })).toBeDisabled()
      await page.getByRole('button', { name: 'Register Now' }).click({ force: true })
      await expect(page).toHaveURL('/register')
    })

    test('shows error and disables submit when confirm password is blank', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('textbox', { name: 'Username' }).fill('asdf')
      await page.getByRole('textbox', { name: 'Email' }).fill('asdf.asdf@example.com')
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Asdf@1234')
      await page.getByRole('textbox', { name: 'Confirm Password' }).click()
      await page.getByRole('textbox', { name: 'Password', exact: true }).click()

      await expect(
        page.getByText('The confirm password is required and cannot be empty'),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Register Now' })).toBeDisabled()
      await page.getByRole('button', { name: 'Register Now' }).click({ force: true })
      await expect(page).toHaveURL('/register')
    })

    test('shows error and disables submit when password is blank', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('textbox', { name: 'Username' }).fill('asdf')
      await page.getByRole('textbox', { name: 'Email' }).fill('asdf.asdf@example.com')
      await page.getByRole('textbox', { name: 'Password', exact: true }).click()
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Asdf@1234')
      await page.getByRole('textbox', { name: 'Password', exact: true }).click()

      await expect(
        page.getByText('The password and its confirm are not the same'),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Register Now' })).toBeDisabled()
      await page.getByRole('button', { name: 'Register Now' }).click({ force: true })
      await expect(page).toHaveURL('/register')
    })
  })
})
