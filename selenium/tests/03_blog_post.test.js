'use strict'

const { assert } = require('chai')
const { buildDriver } = require('../utils/driver')
const LoginPage      = require('../pages/LoginPage')
const HomePage       = require('../pages/HomePage')
const CreatePostPage = require('../pages/CreatePostPage')

const VALID_EMAIL    = 'usenko.0265@gmail.com'
const VALID_PASSWORD = '654321'

describe('Blog Post', function () {
  this.timeout(30_000)

  let driver
  let loginPage
  let homePage
  let createPostPage

  before(async function () {
    driver         = await buildDriver()
    loginPage      = new LoginPage(driver)
    homePage       = new HomePage(driver)
    createPostPage = new CreatePostPage(driver)

    // Login once before all tests in this suite
    await loginPage.open()
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD)
    // Wait for Logout button — '/' is in every URL so urlContains('/') is unreliable
    await homePage.waitForHome()
  })

  after(async function () {
    await driver.quit()
  })

  // ── @SuccessfulLandOnAddBlogPost ───────────────────────────────────────────

  it('@SuccessfulLandOnAddBlogPost — click "Add New Post" opens the create page', async function () {
    await homePage.open()
    await homePage.screenshot('01_home_before_click')

    await homePage.clickAddNewPost()
    await homePage.screenshot('02_clicked_add_new_post')

    // Wait until URL changes to /posts/create (specific enough — not ambiguous)
    await createPostPage.waitForUrl('/posts/create')
    await createPostPage.screenshot('03_create_post_page')

    const isLoaded = await createPostPage.isLoaded()
    assert.isTrue(isLoaded, 'Create Post page should show "Add New Post" heading')

    const url = await createPostPage.getCurrentUrl()
    assert.include(url, '/posts/create', 'URL should contain /posts/create')
  })

  // ── @SuccessfulAddBlogPost ─────────────────────────────────────────────────

  it('@SuccessfulAddBlogPost — fill form and submit creates a new post', async function () {
    await createPostPage.open()
    await createPostPage.screenshot('04_create_page_fresh')

    await createPostPage.fillTitle('Selenium Test Post')
    await createPostPage.screenshot('05_title_filled')

    await createPostPage.fillDescription('Created by Selenium WebDriver automated test')
    await createPostPage.screenshot('06_description_filled')

    await createPostPage.fillBody(
      'This post was created automatically during a Selenium WebDriver test run. ' +
      'It verifies that authenticated users can create blog posts via the UI.',
    )
    await createPostPage.screenshot('07_body_filled')

    await createPostPage.clickSubmit()
    await createPostPage.screenshot('08_submit_clicked')

    // Wait for Logout button to confirm redirect to / completed
    await homePage.waitForHome()
    await createPostPage.screenshot('09_redirected_home')

    assert.isTrue(await homePage.isLoaded(), 'Should be back on the Home page')

    // Toast appears briefly; grab it before it disappears
    const isToast = await homePage.isToastVisible()
    assert.isTrue(isToast, 'Success toast "Blog Post posted successfully!" should appear')

    const toastText = await homePage.getToastText()
    assert.include(toastText, 'successfully', 'Toast text should include "successfully"')
    await homePage.screenshot('10_success_toast_visible')
  })
})
