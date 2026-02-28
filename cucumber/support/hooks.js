'use strict'

const { Before, After } = require('@cucumber/cucumber')

Before({ timeout: 30000 }, async function () {
  await this.openBrowser()
})

After(async function () {
  await this.closeBrowser()
})
