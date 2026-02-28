'use strict'

const { assert } = require('chai')
const { buildDriver } = require('../utils/driver')
const LoginPage      = require('../pages/LoginPage')
const HomePage       = require('../pages/HomePage')
const PostDetailPage = require('../pages/PostDetailPage')

const VALID_EMAIL    = 'usenko.0265@gmail.com'
const VALID_PASSWORD = '654321'

describe('Comment', function () {
  this.timeout(30_000)

  let driver
  let loginPage
  let homePage
  let postDetailPage

  before(async function () {
    driver         = await buildDriver()
    loginPage      = new LoginPage(driver)
    homePage       = new HomePage(driver)
    postDetailPage = new PostDetailPage(driver)

    // Login before the test suite
    await loginPage.open()
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD)
    // Wait for Logout button — confirms redirect to / completed
    await homePage.waitForHome()
  })

  after(async function () {
    await driver.quit()
  })

  // ── @SuccessfulAddComment ──────────────────────────────────────────────────

  it('@SuccessfulAddComment — add a comment to the first available post', async function () {
    await homePage.open()
    await homePage.screenshot('01_home_page')

    // At least one post must exist (03_blog_post.test.js runs first and creates one)
    const hasPosts = await homePage.hasAnyPost()
    assert.isTrue(hasPosts, 'At least one post must exist to add a comment')

    await homePage.clickFirstPost()
    await homePage.screenshot('02_navigated_to_post')

    // Wait for the comment textarea to appear
    await postDetailPage.waitForElement(postDetailPage.commentBodyInput)
    await postDetailPage.screenshot('03_post_detail_loaded')

    const isFormVisible = await postDetailPage.isCommentFormVisible()
    assert.isTrue(isFormVisible, 'Comment form should be visible for logged-in users')

    await postDetailPage.fillCommentName('Selenium Tester')
    await postDetailPage.screenshot('04_comment_name_filled')

    await postDetailPage.fillCommentBody('Automated comment left by Selenium WebDriver test.')
    await postDetailPage.screenshot('05_comment_body_filled')

    await postDetailPage.clickAddComment()
    await postDetailPage.screenshot('06_add_comment_clicked')

    // App redirects to / with success toast after adding comment
    await homePage.waitForHome()
    await postDetailPage.screenshot('07_redirected_home_after_comment')

    const isToast = await homePage.isToastVisible()
    assert.isTrue(isToast, 'Success toast should appear after adding comment')

    const toastText = await homePage.getToastText()
    assert.include(toastText, 'Comment', 'Toast should mention "Comment"')
    await homePage.screenshot('08_comment_success_toast')
  })
})
