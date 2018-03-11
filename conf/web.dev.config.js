var Config = require("webpack-config").Config;

module.exports = new Config().extend("conf/web.base.config.js").merge({
  devtool: "#source-map",
  mode: "development",
  devServer: {
    stats: {
      chunks: false
    }
  }
});
