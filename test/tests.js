var browser = require("../src/api/browser");

var testsContext = require.context(".", true, /specs\.ts$/);
testsContext.keys().forEach(testsContext);
