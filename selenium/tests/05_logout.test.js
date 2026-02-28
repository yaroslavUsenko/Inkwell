'use strict'

const { assert } = require('chai')
const { buildDriver } = require('../utils/driver')
const LoginPage = require('../pages/LoginPage')
const HomePage  = require('../pages/HomePage')

const VALID_EMAIL    = 'usenko.0265@gmail.com'
const VALID_PASSWORD = '654321'

describe('Logout', function () {
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

  // ── @SuccessfulLogout ──────────────────────────────────────────────────────

  it('@SuccessfulLogout — clicking Logout redirects to /login', async function () {
    // Step 1: Login
    await loginPage.open()
    await loginPage.screenshot('01_login_page_before_logout')

    await loginPage.login(VALID_EMAIL, VALID_PASSWORD)

    // Wait for Logout button — confirms home page is rendered
    await homePage.waitForHome()
    await loginPage.screenshot('02_logged_in_home')

    assert.isTrue(await homePage.isLoggedIn(), 'User should be logged in (Logout button visible)')

    // Step 2: Click Logout
    await homePage.clickLogout()
    await homePage.screenshot('03_logout_clicked')

    // Step 3: Verify redirect to /login
    // '/login' is specific enough — it does NOT appear in any other route
    await loginPage.waitForUrl('/login')
    await loginPage.screenshot('04_redirected_to_login')

    const url = await loginPage.getCurrentUrl()
    assert.include(url, '/login', 'URL should contain /login after logout')

    assert.isFalse(await homePage.isLoggedIn(), 'Logout button should not be visible after logout')
    await loginPage.screenshot('05_logged_out_confirmed')
  })
})
