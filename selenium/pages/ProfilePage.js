'use strict'

const { By } = require('selenium-webdriver')
const BasePage = require('./BasePage')

/**
 * ProfilePage — Page Object for /profile/:id
 *
 * HTML structure (Profile.jsx):
 *   Profile card (read-only view):
 *     <h1 class="profile-card-name">...</h1>
 *     <span class="profile-field-label">Email:</span> {email}
 *     <span class="profile-field-label">Age:</span>   {age}
 *
 *   Edit form (shown only to the profile owner):
 *     <h2>Your Profile</h2>
 *     <input  name="firstname" />
 *     <input  name="lastname"  />
 *     <input  name="age"       />
 *     <select name="gender">…</select>
 *     <input  name="address"   />
 *     <input  name="website"   type="url" />
 *     <button type="submit" class="btn">Update Profile</button>
 *
 * Note: The profile URL is /profile/:userId — navigate here via the
 *       "My Profile" link in the Navbar, or directly if the ID is known.
 */
class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver)
  }

  // ── Locators — card (read-only) ───────────────────────────────────────────
  get profileName()    { return By.css('.profile-card-name') }
  get profileHeading() { return By.xpath('//h2[normalize-space()="Your Profile"]') }

  // ── Locators — edit form ──────────────────────────────────────────────────
  get firstNameInput() { return By.css('input[name="firstname"]') }
  get lastNameInput()  { return By.css('input[name="lastname"]') }
  get ageInput()       { return By.css('input[name="age"]') }
  get genderSelect()   { return By.css('select[name="gender"]') }
  get addressInput()   { return By.css('input[name="address"]') }
  get websiteInput()   { return By.css('input[name="website"]') }
  get submitButton()   { return By.css('button[type="submit"]') }
  get formError()      { return By.css('.error') }

  // ── Actions ───────────────────────────────────────────────────────────────

  async fillFirstName(val)  { await this.fillInput(this.firstNameInput, val) }
  async fillLastName(val)   { await this.fillInput(this.lastNameInput, val) }
  async fillAge(val)        { await this.fillInput(this.ageInput, val) }
  async fillAddress(val)    { await this.fillInput(this.addressInput, val) }
  async fillWebsite(val)    { await this.fillInput(this.websiteInput, val) }

  async selectGender(value) {
    const { Select } = require('selenium-webdriver/lib/select')
    const selectEl = await this.waitForElement(this.genderSelect)
    const select = new Select(selectEl)
    await select.selectByValue(value)
  }

  async clickSubmit() {
    await this.clickElement(this.submitButton)
  }

  /**
   * Fill and submit the profile edit form.
   * @param {{ firstname?, lastname?, age?, gender?, address?, website? }} data
   */
  async updateProfile(data) {
    if (data.firstname !== undefined) await this.fillFirstName(data.firstname)
    if (data.lastname  !== undefined) await this.fillLastName(data.lastname)
    if (data.age       !== undefined) await this.fillAge(data.age)
    if (data.gender    !== undefined) await this.selectGender(data.gender)
    if (data.address   !== undefined) await this.fillAddress(data.address)
    if (data.website   !== undefined) await this.fillWebsite(data.website)
    await this.clickSubmit()
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async isEditFormVisible() {
    return this.isElementVisible(this.profileHeading)
  }

  async getProfileNameText() {
    return this.getElementText(this.profileName)
  }
}

module.exports = ProfilePage
