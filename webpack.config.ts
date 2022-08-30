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
  entry: "./src/sdk/index.tsx",
  devServer: {
    static: {
<<<<<<< HEAD
      directory: path.join(__dirname, "ZegoPrebuiltUIKit"),
=======
      directory: path.join(__dirname, "ZegoUIKitPrebuilt"),
>>>>>>> ae8a171 (🚀  fix  switch camera not working in some mobile)
    },
    compress: true,
    port: 9000,
    https: true,
  },
  output: {
<<<<<<< HEAD
    filename: "index.umd.js",
    path: path.resolve(__dirname, "./ZegoPrebuiltUIKit"),
=======
    filename: "zego-uikit-prebuilt.js",
    path: path.resolve(__dirname, "./ZegoUIKitPrebuilt"),
>>>>>>> ae8a171 (🚀  fix  switch camera not working in some mobile)
    libraryTarget: "umd",
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this",
    publicPath: "./",
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
      // {
      //   test: /\.css$/,
      //   use: ["style-loader", "css-loader"],
      // },
      /* {
                test: /\.(png|jpg|gif)$/, // 图片后缀名
                loader: 'url-loader?limit=8192&name=images/[hash:8].[name].[ext]',
            }, */

      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          // {
          //   loader: "resolve-url-loader",
          // },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: "asset/inline",
        loader: "url-loader",
        options: {
          limit: true,
          name: "video/[name].[ext]",
          esModule: false,
        },
      },

      {
        test: /\.(jpg|png|gif|bmp|jpeg)$/i,
        type: "asset/inline",
        // loader: "url-loader",
        // options: {
        //   limit: 81920,
        //   fallback: {
        //     loader: "file-loader",
        //     options: {
        //       name: "img/[name].[ext]",
        //     },
        //   },
        // },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_ENV: JSON.stringify(true),
      "process.env.REACT_APP_MOBILE": JSON.stringify("no"),
    }),
    new CleanWebpackPlugin(),
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: [
<<<<<<< HEAD
            "./ZegoPrebuiltUIKit/idex.umd,js",
            "./ZegoPrebuiltUIKit/sdk",
=======
            "./ZegoUIKitPrebuilt/zego-uikit-prebuilt.js",
            "./ZegoUIKitPrebuilt/sdk",
>>>>>>> ae8a171 (🚀  fix  switch camera not working in some mobile)
          ],
        },
        onEnd: {
          copy: [
            {
              //精简
              source: "./public/test.html",
<<<<<<< HEAD
              destination: "./ZegoPrebuiltUIKit/index.html",
=======
              destination: "./ZegoUIKitPrebuilt/index.html",
>>>>>>> ae8a171 (🚀  fix  switch camera not working in some mobile)
            },
            {
              //精简
              source: "./public/package.json",
<<<<<<< HEAD
              destination: "./ZegoPrebuiltUIKit/package.json",
            },
          ],
          delete: ["ZegoPrebuiltUIKit/util.d.ts"],
=======
              destination: "./ZegoUIKitPrebuilt/package.json",
            },
          ],
          delete: ["ZegoUIKitPrebuilt/util.d.ts"],
>>>>>>> ae8a171 (🚀  fix  switch camera not working in some mobile)
        },
      },
    }),
  ],
};
export default config;
