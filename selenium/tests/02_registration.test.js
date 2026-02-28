'use strict'

const { assert } = require('chai')
const { buildDriver } = require('../utils/driver')
const RegisterPage = require('../pages/RegisterPage')
const HomePage     = require('../pages/HomePage')

describe('Registration', function () {
  this.timeout(30_000)

  let driver
  let registerPage
  let homePage

  before(async function () {
    driver       = await buildDriver()
    registerPage = new RegisterPage(driver)
    homePage     = new HomePage(driver)
  })

  after(async function () {
    await driver.quit()
  })

  // ── @SuccessfulRegistration ────────────────────────────────────────────────

  it('@SuccessfulRegistration — valid data creates account and redirects home', async function () {
    // Use a timestamp-based email so each test run creates a unique user
    const uniqueEmail = `selenium.${Date.now()}@example.com`
    const username    = `sel${Date.now()}`

    await registerPage.open()
    await registerPage.screenshot('01_register_page_opened')

    await registerPage.fillUsername(username)
    await registerPage.screenshot('02_username_filled')

    await registerPage.fillEmail(uniqueEmail)
    await registerPage.screenshot('03_email_filled')

    await registerPage.fillPassword('Selenium@1234')
    await registerPage.fillConfirm('Selenium@1234')
    await registerPage.screenshot('04_passwords_filled')

    await registerPage.clickSubmit()
    await registerPage.screenshot('05_submit_clicked')

    // After successful registration the app navigates to /.
    // Wait for Logout button — confirms redirect AND render completed.
    await homePage.waitForHome()
    await registerPage.screenshot('06_redirected_home')

    assert.isTrue(await homePage.isLoaded(), 'Home page should be shown after registration')
    assert.isTrue(await homePage.isLoggedIn(), 'User should be logged in after registration')
  })

  // ── @DisabledRegistration — form validation ────────────────────────────────

  it('@DisabledRegistration — submit disabled when username is blank', async function () {
    await registerPage.open()
    await registerPage.screenshot('07_register_fresh')

    // Focus then leave username blank; fill the rest
    await registerPage.clickElement(registerPage.usernameInput)
    await registerPage.fillEmail('valid@example.com')
    await registerPage.fillPassword('Selenium@1234')
    await registerPage.fillConfirm('Selenium@1234')
    await registerPage.screenshot('08_blank_username')

    const isDisabled = await registerPage.isSubmitDisabled()
    assert.isTrue(isDisabled, 'Submit should be disabled with blank username')

    const isError = await registerPage.isFieldErrorVisible()
    assert.isTrue(isError, 'Username required error should be visible')
    await registerPage.screenshot('09_username_error_visible')
  })

  it('@DisabledRegistration — submit disabled when email is invalid', async function () {
    await registerPage.open()
    await registerPage.screenshot('10_register_for_email_test')

    await registerPage.fillUsername('seleniumuser')
    await registerPage.fillEmail('not-an-email') // invalid
    await registerPage.fillPassword('Selenium@1234')
    await registerPage.fillConfirm('Selenium@1234')
    await registerPage.screenshot('11_invalid_email_entered')

    const isDisabled = await registerPage.isSubmitDisabled()
    assert.isTrue(isDisabled, 'Submit should be disabled with invalid email')

    const errorText = await registerPage.getFieldErrorText()
    assert.include(errorText, 'not valid', 'Email validation error should mention "not valid"')
    await registerPage.screenshot('12_email_error_visible')
  })

  it('@DisabledRegistration — submit disabled when passwords do not match', async function () {
    await registerPage.open()
    await registerPage.screenshot('13_register_passwords_test')

    await registerPage.fillUsername('seleniumuser')
    await registerPage.fillEmail('valid2@example.com')
    await registerPage.fillPassword('Selenium@1234')
    await registerPage.fillConfirm('DifferentPass@1')
    // Blur confirm field
    await registerPage.clickElement(registerPage.usernameInput)
    await registerPage.screenshot('14_passwords_mismatch')

    const isDisabled = await registerPage.isSubmitDisabled()
    assert.isTrue(isDisabled, 'Submit should be disabled when passwords do not match')

    const errorText = await registerPage.getFieldErrorText()
    assert.include(errorText, 'not the same', 'Password mismatch error should mention "not the same"')
    await registerPage.screenshot('15_mismatch_error_visible')
  })
})
