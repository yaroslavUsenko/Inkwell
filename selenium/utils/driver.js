'use strict'

const { Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

/**
 * Build and return a configured ChromeDriver instance.
 *
 * Set environment variable HEADLESS=true (or CI=true) to run without
 * a visible browser window — required for CI/CD pipelines.
 *
 * selenium-webdriver ≥ 4.16 includes a built-in Selenium Manager that
 * downloads the correct chromedriver automatically, so no separate
 * chromedriver package is required.
 */
async function buildDriver() {
  const options = new chrome.Options()

  if (process.env.HEADLESS === 'true' || process.env.CI) {
    options.addArguments(
      '--headless=new',        // Chrome 112+ headless mode
      '--no-sandbox',          // required in Linux containers
      '--disable-dev-shm-usage', // avoids /dev/shm size issues in Docker
      '--disable-gpu',
      '--window-size=1280,800',
    )
  }

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()
}

module.exports = { buildDriver }
