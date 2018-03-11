var process = require("process");

var travis = process.env.TRAVIS;

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine"],

    // list of files / patterns to load in the browser
    files: ["./test/tests.js"],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "test/*tests.js": ["webpack", "sourcemap"]
    },

    webpack: require("./webpack.config.js"),
    webpackMiddleware: {
      stats: {
        chunks: false
      }
    },

    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots", "jasmine-diff", "coverage", "kjhtml"],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["Chrome", "Firefox"],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: travis ? 4 : undefined,

    coverageReporter: {
      type: "json",
      dir: "coverage/"
    },

    jasmineDiffReporter: {
      multiline: true
    }
  });

  if (travis) {
    var customLaunchers = {
      // see https://www.browserstack.com/list-of-browsers-and-platforms?product=automate
      chrome_latest: {
        base: "BrowserStack",
        browser: "Chrome",
        os: "Windows",
        os_version: "10"
      },
      firefox_latest: {
        base: "BrowserStack",
        browser: "firefox",
        os: "Windows",
        os_version: "10"
      },
      opera_latest: {
        base: "BrowserStack",
        browser: "opera",
        os: "Windows",
        os_version: "7"
      },
      ie_latest: {
        base: "BrowserStack",
        os: "Windows",
        os_version: "8.1",
        browser: "ie",
        browser_version: "11.0"
      },
      ie_10: {
        base: "BrowserStack",
        os: "Windows",
        os_version: "8",
        browser: "ie",
        browser_version: "10.0"
      },
      edge_latest: {
        base: "BrowserStack",
        browser: "Edge",
        os: "Windows",
        os_version: "10"
      },
      safari_latest: {
        base: "BrowserStack",
        browser: "safari",
        os: "OS X",
        os_version: "El Capitan"
      },
      ios_latest: {
        base: "BrowserStack",
        browser: "iPhone",
        device: "iPhone X",
        os: "ios",
        os_version: "11.0"
      },
      ios_10: {
        base: "BrowserStack",
        browser: "iPhone",
        device: "iPhone 7",
        os: "ios",
        os_version: "10.3"
      },
      ios_9: {
        base: "BrowserStack",
        browser: "iPhone",
        device: "iPhone 6S",
        os: "ios",
        os_version: "9.1"
      },
      ios_8: {
        base: "BrowserStack",
        browser: "iPhone",
        device: "iPhone 6",
        os: "ios",
        os_version: "8.3"
      },
      ios_7: {
        base: "BrowserStack",
        os: "ios",
        os_version: "7.0",
        browser: "iphone",
        device: "iPhone 5S"
      },
      /*android_5: { Not working at the moment, investigate
                      base: "BrowserStack",
                      browser: "android",
                      device: "Google Nexus 5",
                      os: "android",
                      os_version: "5.0"
                  },*/
      android_44_chrome: {
        base: "BrowserStack",
        browser: "android",
        device: "Samsung Galaxy S5",
        os: "android",
        os_version: "4.4"
      }
    };

    config.set({
      customLaunchers: customLaunchers,
      browserStack: {
        project: "Parallel.ES Tests",
        username: process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
        startTunnel: false,
        tunnelIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
        build: process.env.TRAVIS_BUILD_NUMBER + " - " + process.env.TRAVIS_BRANCH
      },
      browsers: Object.keys(customLaunchers),
      captureTimeout: 300000,
      browserNoActivityTimeout: 300000,
      browserDisconnectTimeout: 300000,
      browserDisconnectTolerance: 3,
      reporters: ["dots", "jasmine-diff", "coverage"],
      singleRun: true
    });
  }
};
