'use strict'

const { assert } = require('chai')
const { buildDriver } = require('../utils/driver')
const LoginPage = require('../pages/LoginPage')
const HomePage  = require('../pages/HomePage')

const VALID_EMAIL    = 'usenko.0265@gmail.com'
const VALID_PASSWORD = '654321'

describe('Login', function () {
  this.timeout(30_000)

  let driver
  let loginPage
  let homePage

  before(async function () {
    driver    = await buildDriver()
    loginPage = new LoginPage(driver)
    homePage  = new HomePage(driver)
  })

  after(async function () {
    await driver.quit()
  })

  // ── @SuccessfulLogin ───────────────────────────────────────────────────────

  it('@SuccessfulLogin — valid credentials redirect to home page', async function () {
    await loginPage.open()
    await loginPage.screenshot('01_login_page_opened')

    await loginPage.fillUsername(VALID_EMAIL)
    await loginPage.screenshot('02_username_filled')

    await loginPage.fillPassword(VALID_PASSWORD)
    await loginPage.screenshot('03_password_filled')

    await loginPage.clickSubmit()
    await loginPage.screenshot('04_submit_clicked')

    // Wait until the Logout button appears — this confirms the redirect to /
    // completed AND React has rendered the authenticated navbar.
    // NOTE: waitForUrl('/') would be wrong — '/' is a substring of every URL.
    await homePage.waitForHome()
    await loginPage.screenshot('05_after_redirect')

    assert.isTrue(await homePage.isLoaded(), 'Home page heading "All Posts" should be visible')
    assert.isTrue(await homePage.isLoggedIn(), 'Logout button should appear after login')
  })

  // ── @failedLogin ──────────────────────────────────────────────────────────

  it('@failedLogin — wrong credentials show error message', async function () {
    await loginPage.open()
    await loginPage.screenshot('06_login_page_fresh')

    await loginPage.fillUsername('wrong@example.com')
    await loginPage.fillPassword('wrongpassword')
    await loginPage.screenshot('07_wrong_credentials_filled')

    await loginPage.clickSubmit()
    await loginPage.screenshot('08_submit_with_wrong_credentials')

    // Should stay on /login and show error
    const url = await loginPage.getCurrentUrl()
    assert.include(url, '/login', 'URL should remain /login after failed login')

    const isError = await loginPage.isServerErrorVisible()
    assert.isTrue(isError, 'Server error message should be visible')

    const errorText = await loginPage.getServerErrorText()
    assert.include(errorText, 'Invalid', 'Error should mention "Invalid"')
    await loginPage.screenshot('09_error_message_shown')
  })

  // ── @DisabledLogin ────────────────────────────────────────────────────────

  it('@DisabledLogin — submit button disabled when username is blank', async function () {
    await loginPage.open()
    await loginPage.screenshot('10_empty_form')

    // Fill only password — leave username empty
    await loginPage.fillPassword(VALID_PASSWORD)
    // Click username area then away to trigger blur/touched
    await loginPage.clickElement(loginPage.usernameInput)
    await loginPage.clickElement(loginPage.passwordInput)
    await loginPage.screenshot('11_password_only_filled')

    const isDisabled = await loginPage.isSubmitDisabled()
    assert.isTrue(isDisabled, 'Submit button should be disabled when username is empty')
    await loginPage.screenshot('12_button_disabled_confirmed')
  })

  it('@DisabledLogin — submit button disabled when password is blank', async function () {
    await loginPage.open()
    await loginPage.screenshot('13_empty_form_again')

    await loginPage.fillUsername(VALID_EMAIL)
    // Focus password then click away without filling it
    await loginPage.clickElement(loginPage.passwordInput)
    await loginPage.clickElement(loginPage.usernameInput)
    await loginPage.screenshot('14_username_only_filled')

    const isDisabled = await loginPage.isSubmitDisabled()
    assert.isTrue(isDisabled, 'Submit button should be disabled when password is empty')
    await loginPage.screenshot('15_button_disabled_password_missing')
  })
})
