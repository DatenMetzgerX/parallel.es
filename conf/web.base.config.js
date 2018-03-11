var Config = require("webpack-config").Config;
var path = require("path");

module.exports = new Config().merge({
  entry: {
    parallel: "./src/api/browser.ts"
  },

  output: {
    library: "parallel-es",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "../dist/browser")
  },

  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"]
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        loader: "tslint-loader"
      },
      {
        loader: "worker-loader",
        test: path.join(__dirname, "../src/browser/worker-slave/index.ts"),
        options: {
          name: "parallel-slave.js"
        }
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: "awesome-typescript-loader",
            query: {
              useBabel: true,
              babelOptions: {
                presets: [
                  [
                    "babel-preset-env",
                    {
                      targets: {
                        browsers: "defaults"
                      },
                      useBuiltIns: "usage",
                      modules: false
                    }
                  ]
                ]
              }
            }
          }
        ]
      }
    ]
  }
});
