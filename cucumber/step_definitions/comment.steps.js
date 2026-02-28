'use strict'

const { When } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')

When('I open the first blog post', async function () {
  // Click the "Читати" (Read) link on the first post card
  const link = await this.driver.wait(
    until.elementLocated(By.css('a.card-action-btn')),
    8000
  )
  await link.click()
  await this.driver.wait(until.urlContains('/posts/'), 8000)
})

When('I write the comment {string}', async function (commentText) {
  const textarea = await this.driver.wait(
    until.elementLocated(By.css('textarea[name="message"]')),
    8000
  )
  await textarea.clear()
  await textarea.sendKeys(commentText)
})

When('I click the Add Comment button', async function () {
  const btn = await this.driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space(text())='Add Comment']")),
    8000
  )
  await btn.click()
})
