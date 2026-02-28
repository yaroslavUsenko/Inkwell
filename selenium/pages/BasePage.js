'use strict'

const { until } = require('selenium-webdriver')
const { takeScreenshot } = require('../utils/screenshot')

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const DEFAULT_TIMEOUT = 10_000

/**
 * BasePage — shared helpers used by every concrete Page Object.
 *
 * Page Object pattern:
 *   Each subclass represents a single page of the application and exposes
 *   only the high-level actions that a user can perform on that page.
 *   Raw WebDriver calls are hidden inside this base class, keeping test
 *   code free of low-level details.
 */
class BasePage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigate(path = '/') {
    await this.driver.get(`${BASE_URL}${path}`)
  }

  // ── Screenshot ────────────────────────────────────────────────────────────

  /**
   * Capture the current viewport and save it to selenium/screenshots/.
   * Call this after every meaningful test step.
   *
   * @param {string} label  Short description of the step (e.g. "01_login_page")
   */
  async screenshot(label) {
    return takeScreenshot(this.driver, label)
  }

  // ── Waits ─────────────────────────────────────────────────────────────────

  async waitForElement(locator, timeout = DEFAULT_TIMEOUT) {
    return this.driver.wait(until.elementLocated(locator), timeout)
  }

  async waitForElementVisible(locator, timeout = DEFAULT_TIMEOUT) {
    const el = await this.waitForElement(locator, timeout)
    await this.driver.wait(until.elementIsVisible(el), timeout)
    return el
  }

  async waitForUrl(fragment, timeout = DEFAULT_TIMEOUT) {
    await this.driver.wait(until.urlContains(fragment), timeout)
  }

  // ── Convenience getters ───────────────────────────────────────────────────

  async getCurrentUrl() {
    return this.driver.getCurrentUrl()
  }

  async getElementText(locator) {
    const el = await this.waitForElementVisible(locator)
    return el.getText()
  }

  async isElementPresent(locator) {
    try {
      const elements = await this.driver.findElements(locator)
      return elements.length > 0
    } catch {
      return false
    }
  }

  async isElementVisible(locator) {
    try {
      const elements = await this.driver.findElements(locator)
      if (elements.length === 0) return false
      return elements[0].isDisplayed()
    } catch {
      return false
    }
  }

  // ── Input helpers ─────────────────────────────────────────────────────────

  async fillInput(locator, value) {
    const el = await this.waitForElement(locator)
    await el.clear()
    await el.sendKeys(value)
  }

  async clickElement(locator) {
    const el = await this.waitForElement(locator)
    await el.click()
  }

  async isButtonDisabled(locator) {
    const el = await this.waitForElement(locator)
    const disabled = await el.getAttribute('disabled')
    return disabled !== null
  }
}

module.exports = BasePage
