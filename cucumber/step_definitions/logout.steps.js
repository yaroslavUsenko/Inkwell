'use strict'

const { When, Then } = require('@cucumber/cucumber')
const { until } = require('selenium-webdriver')
const assert = require('assert')

When('I click the logout button', async function () {
  const btn = await this.waitForCss('button.navbar-logout-btn')
  await btn.click()
})

Then('I should be on the login page', async function () {
  await this.driver.wait(until.urlContains('/login'), 8000)
  const url = await this.currentUrl()
  assert.ok(url.includes('/login'), `Expected /login, got: ${url}`)
})
