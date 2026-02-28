'use strict'

const { By } = require('selenium-webdriver')
const BasePage = require('./BasePage')

/**
 * CreatePostPage — Page Object for /posts/create
 *
 * HTML structure (CreatePost.jsx):
 *   <h1 class="form-card-title">Add New Post</h1>
 *   <input  id="title"       name="title"       />
 *   <input  id="description" name="description" />
 *   <textarea id="body"      name="body"        />
 *   <button type="submit" class="btn">Add Post</button>
 *   <p class="error">{error}</p>
 */
class CreatePostPage extends BasePage {
  constructor(driver) {
    super(driver)
  }

  // ── Locators ──────────────────────────────────────────────────────────────
  get pageHeading()      { return By.css('.form-card-title') }
  get titleInput()       { return By.id('title') }
  get descriptionInput() { return By.id('description') }
  get bodyTextarea()     { return By.id('body') }
  get submitButton()     { return By.css('button[type="submit"]') }
  get errorMessage()     { return By.css('.error') }

  // ── Actions ───────────────────────────────────────────────────────────────

  async open() {
    await this.navigate('/posts/create')
  }

  async fillTitle(val)       { await this.fillInput(this.titleInput, val) }
  async fillDescription(val) { await this.fillInput(this.descriptionInput, val) }
  async fillBody(val)        { await this.fillInput(this.bodyTextarea, val) }

  async clickSubmit() {
    await this.clickElement(this.submitButton)
  }

  /**
   * Complete post creation flow.
   * @param {string} title
   * @param {string} description
   * @param {string} body
   */
  async createPost(title, description, body) {
    await this.fillTitle(title)
    await this.fillDescription(description)
    await this.fillBody(body)
    await this.clickSubmit()
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async isLoaded() {
    try {
      const el = await this.waitForElement(this.pageHeading, 8_000)
      const text = await el.getText()
      return text.includes('Add New Post')
    } catch {
      return false
    }
  }

  async getErrorText() {
    return this.getElementText(this.errorMessage)
  }
}

module.exports = CreatePostPage
