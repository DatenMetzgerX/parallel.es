const webpack = require("webpack");
const Config = require("webpack-config").Config;
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = new Config().extend("conf/web.base.config.js").merge({
  devtool: "#source-map",
  mode: "production",
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          output: {
            comments: /WORKER_SLAVE_STATIC_FUNCTIONS_PLACEHOLDER/
          },
          mangle: {
            reserved: ["slaveFunctionLookupTable"]
          }
        }
      })
    ]
  }
});
