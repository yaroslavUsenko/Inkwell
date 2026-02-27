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

// @SuccessfulLandOnAddBlogPost
test('@SuccessfulLandOnAddBlogPost - successful landing on Add a Blog/Post page', async ({
  page,
}) => {
  await loginUser(page)
  await page.getByRole('link', { name: 'Add New Post' }).click()
  await expect(page).toHaveURL('http://localhost:5173/posts/create')
  await expect(
    page.getByRole('heading', { name: 'Add New Post' }),
  ).toBeVisible()
})

// @SuccessfulAddBlogPost
test('@SuccessfulAddBlogPost - successful creation of a Blog/Post', async ({
  page,
}) => {
  await loginUser(page)
  await page.getByRole('link', { name: 'Add New Post' }).click()
  await page.getByRole('textbox', { name: 'Title' }).click()
  await page.getByRole('textbox', { name: 'Title' }).fill('Title')
  await page.getByRole('textbox', { name: 'Description' }).click()
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('some short description')
  await page.getByRole('textbox', { name: 'Content' }).click()
  await page.getByRole('textbox', { name: 'Content' }).fill('some body')
  await page.getByRole('button', { name: 'Add Post' }).click()
  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(page.getByText('Blog Post posted successfully!')).toBeVisible()
})
