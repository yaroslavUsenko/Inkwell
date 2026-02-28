'use strict'

const { By } = require('selenium-webdriver')
const BasePage = require('./BasePage')

/**
 * PostDetailPage — Page Object for /posts/:id
 *
 * HTML structure (PostDetail.jsx):
 *   <article class="post-full">
 *     <h1>{post.title}</h1>
 *   </article>
 *   <section class="comments-section">
 *     <form class="form comment-form">
 *       <input  name="name"    placeholder="Your name"          />
 *       <textarea name="message" placeholder="Write your comment..." />
 *       <button type="submit" class="btn btn-sm">Add Comment</button>
 *     </form>
 *   </section>
 */
class PostDetailPage extends BasePage {
  constructor(driver) {
    super(driver)
  }

  // ── Locators ──────────────────────────────────────────────────────────────
  get postTitle()        { return By.css('article.post-full h1') }
  get commentNameInput() { return By.css('.comment-form input[name="name"]') }
  get commentBodyInput() { return By.css('.comment-form textarea[name="message"]') }
  get addCommentBtn()    { return By.css('.comment-form button[type="submit"]') }
  get commentError()     { return By.css('.comment-form .error') }

  // ── Actions ───────────────────────────────────────────────────────────────

  async fillCommentName(val) {
    await this.fillInput(this.commentNameInput, val)
  }

  async fillCommentBody(val) {
    await this.fillInput(this.commentBodyInput, val)
  }

  async clickAddComment() {
    await this.clickElement(this.addCommentBtn)
  }

  /**
   * Full add-comment flow.
   * @param {string} name
   * @param {string} body
   */
  async addComment(name, body) {
    await this.fillCommentName(name)
    await this.fillCommentBody(body)
    await this.clickAddComment()
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async getPostTitle() {
    return this.getElementText(this.postTitle)
  }

  async isCommentFormVisible() {
    return this.isElementVisible(this.commentBodyInput)
  }
}

module.exports = PostDetailPage
