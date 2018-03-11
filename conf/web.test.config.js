var path = require("path");
var Config = require("webpack-config").Config;

module.exports = new Config()
  .extend({
    "./conf/web.base.config.js": function(config) {
      delete config.entry;
      return config;
    }
  })
  .merge({
    devtool: "#inline-source-map",
    mode: "development"
  });
