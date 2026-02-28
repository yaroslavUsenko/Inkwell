'use strict'

const fs = require('fs')
const path = require('path')

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots')

/**
 * Take a screenshot and save it to selenium/screenshots/.
 *
 * The filename format is:  <timestamp>_<safe-label>.png
 * so screenshots appear in chronological order and are easy to trace
 * back to the test step that produced them.
 *
 * @param {import('selenium-webdriver').WebDriver} driver
 * @param {string} label  Short description of the current test step
 * @returns {Promise<string>} Absolute path to the saved file
 */
async function takeScreenshot(driver, label) {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  }

  // Sanitise label → safe filename fragment
  const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)
  const filename = `${Date.now()}_${safeLabel}.png`
  const filepath = path.join(SCREENSHOTS_DIR, filename)

  const base64data = await driver.takeScreenshot()
  fs.writeFileSync(filepath, base64data, 'base64')

  console.log(`    [screenshot] ${filename}`)
  return filepath
}

module.exports = { takeScreenshot }
