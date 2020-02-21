const jasmineReporters = require('jasmine-reporters');

beforeAll(async function() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 2 * 60 * 1000;

  jasmine.getEnv().addReporter(new jasmineReporters.TerminalReporter({
    verbosity: 3,
    color: true,
    showStack: true
  }));

  var junitReporter = new jasmineReporters.JUnitXmlReporter({
    savePath: 'test-results',
    consolidateAll: false
  });
  jasmine.getEnv().addReporter(junitReporter);
});
