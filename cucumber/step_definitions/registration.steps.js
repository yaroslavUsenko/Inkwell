'use strict'

const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('assert')

Given('I open the registration page', async function () {
  await this.goto('/register')
})

// ── Unique-data steps (for @SuccessfulRegistration) ───────────────────────────

When('I fill in registration username with a unique value', async function () {
  const field = await this.findById('username')
  await field.sendKeys(`user_${this.uniqueId()}`)
  await this.triggerBlur(field)
})

When('I fill in registration email with a unique value', async function () {
  const field = await this.findById('email')
  await field.sendKeys(`user_${this.uniqueId()}@example.com`)
  await this.triggerBlur(field)
})

// ── Fixed-value steps (used in @DisabledRegistration scenarios) ───────────────

When('I fill in registration username with {string}', async function (username) {
  const field = await this.findById('username')
  await field.clear()
  await field.sendKeys(username)
  await this.triggerBlur(field)
})

When('I fill in registration email with {string}', async function (email) {
  const field = await this.findById('email')
  await field.clear()
  await field.sendKeys(email)
  await this.triggerBlur(field)
})

When('I fill in registration password with {string}', async function (password) {
  const field = await this.findById('password')
  await field.clear()
  await field.sendKeys(password)
  await this.triggerBlur(field)
})

When('I fill in registration confirm password with {string}', async function (confirm) {
  const field = await this.findById('confirm')
  await field.clear()
  await field.sendKeys(confirm)
  await this.triggerBlur(field)
})

// ── Blur-without-value steps (trigger validation on empty fields) ─────────────

When('I focus and leave the registration username field empty', async function () {
  const field = await this.findById('username')
  await field.click()
  const emailField = await this.findById('email')
  await emailField.click() // blur username
})

When('I focus and leave the registration email field empty', async function () {
  const field = await this.findById('email')
  await field.click()
  const passwordField = await this.findById('password')
  await passwordField.click() // blur email
})

// ── Submit ────────────────────────────────────────────────────────────────────

When('I click the Register Now button', async function () {
  const btn = await this.findByCss('button[type="submit"]')
  await btn.click()
})

// ── Assertions ────────────────────────────────────────────────────────────────

Then('the Register Now button should be disabled', async function () {
  const btn = await this.findByCss('button[type="submit"]')
  const disabled = await btn.getAttribute('disabled')
  assert.ok(disabled !== null, 'Register Now button should be disabled')
})
