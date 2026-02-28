'use strict'

const { When, Then } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const assert = require('assert')

When('I click the {string} navigation link', async function (linkText) {
  const link = await this.driver.wait(
    until.elementLocated(By.xpath(`//a[contains(normalize-space(.), '${linkText}')]`)),
    8000
  )
  await link.click()
})

When('I fill in the post title with {string}', async function (title) {
  const field = await this.findById('title')
  await field.clear()
  await field.sendKeys(title)
})

When('I fill in the post description with {string}', async function (description) {
  const field = await this.findById('description')
  await field.clear()
  await field.sendKeys(description)
})

When('I fill in the post content with {string}', async function (content) {
  const field = await this.findById('body')
  await field.clear()
  await field.sendKeys(content)
})

When('I click the Add Post button', async function () {
  const btn = await this.findByCss('button[type="submit"]')
  await btn.click()
})

Then('I should be on the create post page', async function () {
  await this.driver.wait(until.urlContains('/posts/create'), 8000)
  const url = await this.currentUrl()
  assert.ok(url.includes('/posts/create'), `Expected /posts/create, got: ${url}`)
})
