'use strict'

const { Given, Then } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const assert = require('assert')

// ── Auth ──────────────────────────────────────────────────────────────────────

Given('I am logged in with valid credentials', async function () {
  await this.login()
})

// ── Navigation assertions ─────────────────────────────────────────────────────

Then('I should be on the home page', async function () {
  await this.driver.wait(
    until.elementLocated(By.xpath("//h1[normalize-space(.)='All Posts']")),
    10000
  )
})

Then('I should see the {string} heading', async function (text) {
  const heading = await this.driver.wait(
    until.elementLocated(By.xpath(`//h1[normalize-space(.)='${text}']`)),
    8000
  )
  assert.ok(await heading.isDisplayed(), `Heading "${text}" should be visible`)
})

Then('I should see the logout button', async function () {
  const btn = await this.waitForCss('button.navbar-logout-btn')
  assert.ok(await btn.isDisplayed(), 'Logout button should be visible')
})

Then('I should see the {string} link', async function (text) {
  const link = await this.driver.wait(
    until.elementLocated(By.xpath(`//a[contains(normalize-space(.), '${text}')]`)),
    8000
  )
  assert.ok(await link.isDisplayed(), `Link "${text}" should be visible`)
})

// ── Validation assertions ─────────────────────────────────────────────────────

Then('I should see the field validation error {string}', async function (message) {
  const err = await this.driver.wait(
    until.elementLocated(
      By.xpath(`//span[contains(@class,'field-hint-error') and contains(.,'${message}')]`)
    ),
    8000
  )
  assert.ok(await err.isDisplayed(), `Validation error "${message}" should be visible`)
})

// ── Toast / success ───────────────────────────────────────────────────────────

Then('I should see the success message {string}', async function (message) {
  const toast = await this.driver.wait(
    until.elementLocated(By.css('.toast')),
    8000
  )
  const text = await toast.getText()
  assert.ok(text.includes(message), `Expected toast to contain "${message}", got: "${text}"`)
})
