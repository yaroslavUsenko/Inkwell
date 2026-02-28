module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['support/**/*.js', 'step_definitions/**/*.js'],
    format: [
      'progress-bar',
      'html:reports/report.html',
      'json:reports/report.json'
    ],
    formatOptions: { snippetInterface: 'async-await' }
  }
}
