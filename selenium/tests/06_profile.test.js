'use strict'

const { assert } = require('chai')
const { buildDriver } = require('../utils/driver')
const LoginPage   = require('../pages/LoginPage')
const HomePage    = require('../pages/HomePage')
const ProfilePage = require('../pages/ProfilePage')

const VALID_EMAIL    = 'usenko.0265@gmail.com'
const VALID_PASSWORD = '654321'

describe('Profile', function () {
  this.timeout(30_000)

  let driver
  let loginPage
  let homePage
  let profilePage

  before(async function () {
    driver      = await buildDriver()
    loginPage   = new LoginPage(driver)
    homePage    = new HomePage(driver)
    profilePage = new ProfilePage(driver)

    // Login before the test suite
    await loginPage.open()
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD)
    // Wait for Logout button — confirms redirect to / completed
    await homePage.waitForHome()
  })

  after(async function () {
    await driver.quit()
  })

  // ── @ViewProfile ───────────────────────────────────────────────────────────

  it('@ViewProfile — clicking "My Profile" opens the profile page', async function () {
    await homePage.open()
    await homePage.screenshot('01_home_before_profile')

    await homePage.clickMyProfile()
    await homePage.screenshot('02_my_profile_clicked')

    // '/profile/' is specific — safe to use urlContains
    await profilePage.waitForUrl('/profile/')
    await profilePage.screenshot('03_profile_page_loaded')

    const url = await profilePage.getCurrentUrl()
    assert.include(url, '/profile/', 'URL should contain /profile/')

    // The edit form should be visible for the owner
    const isEditVisible = await profilePage.isEditFormVisible()
    assert.isTrue(isEditVisible, '"Your Profile" edit form should be visible to the owner')
    await profilePage.screenshot('04_edit_form_visible')
  })

  // ── @EditProfile ───────────────────────────────────────────────────────────

  it('@EditProfile — fill and submit profile form saves changes', async function () {
    await homePage.open()
    await homePage.clickMyProfile()
    await profilePage.waitForUrl('/profile/')
    await profilePage.screenshot('05_profile_before_edit')

    await profilePage.fillFirstName('Selenium')
    await profilePage.screenshot('06_firstname_filled')

    await profilePage.fillLastName('Tester')
    await profilePage.screenshot('07_lastname_filled')

    await profilePage.fillAge('30')
    await profilePage.screenshot('08_age_filled')

    await profilePage.selectGender('Male')
    await profilePage.screenshot('09_gender_selected')

    await profilePage.fillAddress('Selenium City, 42')
    await profilePage.screenshot('10_address_filled')

    await profilePage.fillWebsite('https://selenium.dev')
    await profilePage.screenshot('11_website_filled')

    await profilePage.clickSubmit()
    await profilePage.screenshot('12_submit_clicked')

    // Wait for Logout button to confirm redirect to / completed
    await homePage.waitForHome()
    await profilePage.screenshot('13_redirected_home_after_profile')

    assert.isTrue(await homePage.isLoaded(), 'Should be on Home page after profile update')

    const isToast = await homePage.isToastVisible()
    assert.isTrue(isToast, 'Success toast should appear after profile update')

    const toastText = await homePage.getToastText()
    assert.include(toastText, 'Profile', 'Toast text should mention "Profile"')
    await homePage.screenshot('14_profile_update_toast')
  })
})
