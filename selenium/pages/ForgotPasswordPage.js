'use strict'

const { By } = require('selenium-webdriver')
const BasePage = require('./BasePage')

/**
 * ForgotPasswordPage — Page Object for /forgot-password
 *
 * HTML structure (ForgotPassword.jsx):
 *   <h1 class="auth-card-title">Forgot password?</h1>
 *   <input id="email" type="email" />
 *   <button type="submit" class="btn auth-submit-btn">Submit</button>
 *   <p class="error">{error}</p>
 *   <div class="auth-sent-state">…</div>   ← shown after successful submit
 */
class ForgotPasswordPage extends BasePage {
  constructor(driver) {
    super(driver)
  }

  // ── Locators ──────────────────────────────────────────────────────────────
  get emailInput()    { return By.id('email') }
  get submitButton()  { return By.css('button[type="submit"]') }
  get errorMessage()  { return By.css('.error') }
  get sentState()     { return By.css('.auth-sent-state') }

  // ── Actions ───────────────────────────────────────────────────────────────

  async open() {
    await this.navigate('/forgot-password')
  }

  async fillEmail(email) {
    await this.fillInput(this.emailInput, email)
  }

  async clickSubmit() {
    await this.clickElement(this.submitButton)
  }

  async submitForgotPassword(email) {
    await this.fillEmail(email)
    await this.clickSubmit()
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async getErrorText() {
    return this.getElementText(this.errorMessage)
  }

  async isErrorVisible() {
    return this.isElementVisible(this.errorMessage)
  }

  async isSentStateVisible() {
    return this.isElementVisible(this.sentState)
  }
}

module.exports = ForgotPasswordPage
