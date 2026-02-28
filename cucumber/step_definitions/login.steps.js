'use strict'

const { Given, When, Then } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const assert = require('assert')

Given('I open the login page', async function () {
  await this.goto('/login')
})

// ── Form interaction ──────────────────────────────────────────────────────────

When('I enter {string} in the username field', async function (username) {
  const field = await this.findById('username')
  await field.clear()
  await field.sendKeys(username)
})

When('I enter {string} in the password field', async function (password) {
  const field = await this.findById('password')
  await field.clear()
  await field.sendKeys(password)
})

When('I click the Log In button', async function () {
  const btn = await this.findByCss('button[type="submit"]')
  await btn.click()
})

// Trigger blur on username without entering anything (touch → empty = validation error)
When('I focus and leave the username field empty', async function () {
  const usernameField = await this.findById('username')
  await usernameField.click()
  // Click password field to blur username
  const passwordField = await this.findById('password')
  await passwordField.click()
})

// Trigger blur on password without entering anything
When('I focus and leave the password field empty', async function () {
  const passwordField = await this.findById('password')
  await passwordField.click()
  // Click username field to blur password
  const usernameField = await this.findById('username')
  await usernameField.click()
})

// ── Assertions ────────────────────────────────────────────────────────────────

Then('I should remain on the login page', async function () {
  const url = await this.currentUrl()
  assert.ok(url.includes('/login'), `Expected to stay on /login, got: ${url}`)
})

Then('I should see the error message {string}', async function (message) {
  const err = await this.driver.wait(
    until.elementLocated(By.css('.error')),
    8000
  )
  const text = await err.getText()
  assert.ok(text.includes(message), `Expected error "${message}", got: "${text}"`)
})

Then('the Log In button should be disabled', async function () {
  const btn = await this.findByCss('button[type="submit"]')
  const disabled = await btn.getAttribute('disabled')
  assert.ok(disabled !== null, 'Log In button should be disabled')
})
