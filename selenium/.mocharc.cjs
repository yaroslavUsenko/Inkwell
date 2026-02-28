// Mocha configuration for Selenium WebDriver tests
'use strict'

module.exports = {
  // test file pattern (executed alphabetically → sequential order)
  spec: 'tests/**/*.test.js',
  // each test may take up to 30 s (browser interactions are slow)
  timeout: 30_000,
  // human-readable output in the terminal
  reporter: 'spec',
  // run tests sequentially so that blog-post tests create data
  // before comment tests rely on it
  parallel: false,
}
