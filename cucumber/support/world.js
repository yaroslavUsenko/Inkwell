'use strict'

const { World, setWorldConstructor } = require('@cucumber/cucumber')
const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

class InkwellWorld extends World {
  constructor(options) {
    super(options)
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5173'
    this.driver = null
  }

  async openBrowser() {
    const opts = new chrome.Options()
    if (process.env.HEADLESS === 'true') {
      opts.addArguments(
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1280,800'
      )
    }
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(opts)
      .build()
    await this.driver.manage().setTimeouts({ implicit: 5000, pageLoad: 30000 })
  }

  async closeBrowser() {
    if (this.driver) {
      await this.driver.quit()
      this.driver = null
    }
  }

  async goto(path) {
    await this.driver.get(`${this.baseUrl}${path}`)
  }

  async findById(id) {
    return this.driver.findElement(By.id(id))
  }

  async findByCss(selector) {
    return this.driver.findElement(By.css(selector))
  }

  async waitForCss(selector, timeout = 8000) {
    return this.driver.wait(until.elementLocated(By.css(selector)), timeout)
  }

  async waitForXpath(xpath, timeout = 8000) {
    return this.driver.wait(until.elementLocated(By.xpath(xpath)), timeout)
  }

  async triggerBlur(element) {
    await this.driver.executeScript('arguments[0].blur()', element)
  }

  async currentUrl() {
    return this.driver.getCurrentUrl()
  }

  // Logs in the test user and waits for the home page to load
  async login(email = 'usenko.0265@gmail.com', password = '654321') {
    await this.goto('/login')
    const usernameEl = await this.findById('username')
    await usernameEl.sendKeys(email)
    const passwordEl = await this.findById('password')
    await passwordEl.sendKeys(password)
    const submitBtn = await this.findByCss('button[type="submit"]')
    await submitBtn.click()
    await this.driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'All Posts')]")),
      10000
    )
  }

  // Returns a short timestamp-based unique string for test data
  uniqueId() {
    return Date.now().toString(36)
  }
}

setWorldConstructor(InkwellWorld)
