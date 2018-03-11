var path = require("path");
var Config = require("webpack-config").Config;

module.exports = new Config().extend("./conf/web.test.config.js").merge({
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "istanbul-instrumenter-loader?esModules=true",
        enforce: "post",
        include: path.resolve("./src"),
        exclude: path.resolve("./src/browser/worker-slave/index")
      }
    ]
  }
});
