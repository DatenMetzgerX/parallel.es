var Config = require("webpack-config").Config;
var path = require("path");
var webpack = require("webpack");

module.exports = new Config().merge({
  entry: {
    parallel: "./src/api/node.ts",
    "parallel-slave": "./src/node/worker-slave/index.ts"
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        loader: "tslint-loader"
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
                        node: 8
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
    ],

    noParse: [/src\/node\/worker\/node-worker-slave-file-name.ts/]
  },

  target: "node",

  output: {
    library: "parallel-es",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "../dist/node")
  },

  node: {
    __dirname: false
  },

  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"]
  },

  plugins: [
    new webpack.DefinePlugin({
      SLAVE_FILE_NAME: 'require.resolve("parallel-es/dist/node-slave.parallel.js")'
    })
  ]
});
