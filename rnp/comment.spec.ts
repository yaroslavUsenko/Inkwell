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

// @SuccessfulAddComment
test('@SuccessfulAddComment - successful add comment to a Blog/Post', async ({
  page,
}) => {
  await loginUser(page)
  await page.getByRole('link', { name: 'Читати' }).first().click()
  await page.getByRole('textbox', { name: 'Write your comment...' }).click()
  await page
    .getByRole('textbox', { name: 'Write your comment...' })
    .fill("n'landv'fqr")
  await page.getByRole('button', { name: 'Add Comment' }).click()
  await page.getByText('Comment added to the Post').click()
})
