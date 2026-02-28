'use strict'

const { By } = require('selenium-webdriver')
const BasePage = require('./BasePage')

/**
 * HomePage — Page Object for / (root)
 *
 * HTML structure (Home.jsx + Navbar.jsx):
 *   <h1>All Posts</h1>
 *   <a href="/posts/create" class="navbar-btn-new">Add New Post</a>
 *   <a class="navbar-avatar-link">My Profile</a>
 *   <button class="navbar-logout-btn">Logout</button>
 *   <a class="card-action-btn">Читати</a>   ← first post "Read" link
 *   <div class="toast">{successMessage}</div>
 */
class HomePage extends BasePage {
  constructor(driver) {
    super(driver)
  }

  // ── Locators ──────────────────────────────────────────────────────────────
  get pageHeading()    { return By.css('h1') }
  get addNewPostLink() { return By.css('a[href="/posts/create"]') }
  get myProfileLink()  { return By.css('a.navbar-avatar-link') }
  get logoutButton()   { return By.css('button.navbar-logout-btn') }
  get firstReadLink()  { return By.css('a.card-action-btn') }
  get toast()          { return By.css('.toast') }

  // ── Actions ───────────────────────────────────────────────────────────────

  async open() {
    await this.navigate('/')
  }

  async clickAddNewPost() {
    await this.clickElement(this.addNewPostLink)
  }

  async clickMyProfile() {
    await this.clickElement(this.myProfileLink)
  }

  async clickLogout() {
    await this.clickElement(this.logoutButton)
  }

  /** Click the "Читати" link on the first post card. */
  async clickFirstPost() {
    await this.clickElement(this.firstReadLink)
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async isLoaded() {
    try {
      const el = await this.waitForElement(this.pageHeading, 8_000)
      const text = await el.getText()
      return text.includes('All Posts')
    } catch {
      return false
    }
  }

  /**
   * Wait until the Home page is fully rendered after a redirect.
   *
   * WHY this exists:
   *   `until.urlContains('/')` resolves immediately for ANY URL because every
   *   URL contains '/'. Waiting for the Logout button (only present when the
   *   user is authenticated and the React app has finished rendering) is a
   *   reliable signal that the redirect AND the component mount both completed.
   *
   * @param {number} [timeout=15000]
   */
  async waitForHome(timeout = 15_000) {
    await this.waitForElement(this.logoutButton, timeout)
  }

  async isLoggedIn() {
    return this.isElementPresent(this.logoutButton)
  }

  async getToastText() {
    return this.getElementText(this.toast)
  }

  async isToastVisible() {
    return this.isElementVisible(this.toast)
  }

  async hasAnyPost() {
    return this.isElementPresent(this.firstReadLink)
  }
}

module.exports = HomePage
