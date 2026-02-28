'use strict'

const { By } = require('selenium-webdriver')
const BasePage = require('./BasePage')

/**
 * LoginPage — Page Object for /login
 *
 * HTML structure (Login.jsx):
 *   <input id="username" name="username" />
 *   <input id="password" name="password" type="password" />
 *   <button type="submit" class="btn auth-submit-btn" disabled={isDisabled}>Log In</button>
 *   <p class="error">{serverError}</p>
 *   <span class="field-hint-error">{validationError}</span>
 *
 * What to change if the element changes?
 *   Example: if the "Log In" button is wrapped in a <div class="btn-wrap"> or
 *   its ID changes from no-ID to id="login-btn", update the locator:
 *     OLD: By.css('button[type="submit"]')
 *     NEW: By.id('login-btn')   ← or By.css('.btn-wrap button')
 *   Because the Page Object centralises all locators, only THIS file needs
 *   updating — all test files that use LoginPage.clickSubmit() keep working.
 */
class LoginPage extends BasePage {
  constructor(driver) {
    super(driver)
  }

  // ── Locators (single place to update if the UI changes) ───────────────────
  get usernameInput() { return By.id('username') }
  get passwordInput() { return By.id('password') }
  get submitButton()  { return By.css('button[type="submit"]') }
  get serverError()   { return By.css('.error') }
  get fieldError()    { return By.css('.field-hint-error') }

  // ── Actions ───────────────────────────────────────────────────────────────

  async open() {
    await this.navigate('/login')
  }

  async fillUsername(username) {
    await this.fillInput(this.usernameInput, username)
  }

  async fillPassword(password) {
    await this.fillInput(this.passwordInput, password)
  }

  async clickSubmit() {
    await this.clickElement(this.submitButton)
  }

  /**
   * Full login action — fills both fields and clicks submit.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.fillUsername(username)
    await this.fillPassword(password)
    await this.clickSubmit()
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async isSubmitDisabled() {
    return this.isButtonDisabled(this.submitButton)
  }

  async getServerErrorText() {
    return this.getElementText(this.serverError)
  }

  async getFieldErrorText() {
    return this.getElementText(this.fieldError)
  }

  async isServerErrorVisible() {
    return this.isElementVisible(this.serverError)
  }

  async isFieldErrorVisible() {
    return this.isElementVisible(this.fieldError)
  }
}

module.exports = LoginPage
