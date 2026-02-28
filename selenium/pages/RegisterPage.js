'use strict'

const { By } = require('selenium-webdriver')
const BasePage = require('./BasePage')

/**
 * RegisterPage — Page Object for /register
 *
 * HTML structure (Register.jsx):
 *   <input id="username" name="username" />
 *   <input id="email"    name="email"    />
 *   <input id="password" name="password" type="password" />
 *   <input id="confirm"  name="confirm"  type="password" />
 *   <button type="submit" class="btn auth-submit-btn" disabled={isDisabled}>Register Now</button>
 *   <p class="error">{apiError}</p>
 *   <span class="field-hint-error">{validationError}</span>
 */
class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver)
  }

  // ── Locators ──────────────────────────────────────────────────────────────
  get usernameInput() { return By.id('username') }
  get emailInput()    { return By.id('email') }
  get passwordInput() { return By.id('password') }
  get confirmInput()  { return By.id('confirm') }
  get submitButton()  { return By.css('button[type="submit"]') }
  get apiError()      { return By.css('.error') }
  get fieldError()    { return By.css('.field-hint-error') }

  // ── Actions ───────────────────────────────────────────────────────────────

  async open() {
    await this.navigate('/register')
  }

  async fillUsername(val) { await this.fillInput(this.usernameInput, val) }
  async fillEmail(val)    { await this.fillInput(this.emailInput, val) }
  async fillPassword(val) { await this.fillInput(this.passwordInput, val) }
  async fillConfirm(val)  { await this.fillInput(this.confirmInput, val) }

  async clickSubmit() {
    await this.clickElement(this.submitButton)
  }

  /**
   * Complete registration flow.
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {string} [confirm]  Defaults to password
   */
  async register(username, email, password, confirm) {
    await this.fillUsername(username)
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.fillConfirm(confirm ?? password)
    await this.clickSubmit()
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async isSubmitDisabled() {
    return this.isButtonDisabled(this.submitButton)
  }

  async getApiErrorText() {
    return this.getElementText(this.apiError)
  }

  async getFieldErrorText() {
    return this.getElementText(this.fieldError)
  }

  async isFieldErrorVisible() {
    return this.isElementVisible(this.fieldError)
  }
}

module.exports = RegisterPage
