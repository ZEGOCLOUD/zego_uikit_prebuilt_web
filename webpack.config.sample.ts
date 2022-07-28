import * as path from "path";
import * as webpack from "webpack";
// in case you run into any typescript error when configuring `devServer`
import "webpack-dev-server";
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
import FileManagerPlugin from "filemanager-webpack-plugin";

const config: webpack.Configuration = {
  mode: "development",
  entry: "./sample/index.ts",
  devServer: {
    static: {
      directory: path.join(__dirname, "sample"),
    },
    compress: true,
    port: 9002,
    https: true,
  },
  output: {
    filename: "index.build.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // transpileOnly: true,
              // appendTsSuffixTo: ["\\.vue$"],
              // happyPackMode: false,
            },
          },
        ],
      },
    ],
  },
};
export default config;
