import * as path from "path";
import * as webpack from "webpack";
// in case you run into any typescript error when configuring `devServer`
import "webpack-dev-server";
import FileManagerPlugin from "filemanager-webpack-plugin";
// @ts-ignore
import TerserPlugin from "terser-webpack-plugin";
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const version = require('./public/package.json').version;
console.log('===version', version);
const config: webpack.Configuration = {
	mode: "production",
	entry: "./src/sdk/index.tsx",
	devtool: false,
	output: {
		filename: "zego-uikit-prebuilt.js",
		path: path.resolve(__dirname, "./ZegoUIKitPrebuilt"),
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
						// options: {
						// 	sourceMap: false,
						// },
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
	optimization: {
		// minimize: false,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {
						drop_console: ["log", "info", "warn"],
					},
					// compress: false,
					// keep_fnames: true
				},
			}),
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			SDK_ENV: JSON.stringify(true),
			"process.env.REACT_APP_MOBILE": JSON.stringify("no"),
			// SDK_VERSION: JSON.stringify(version),
		}),
		new CleanWebpackPlugin(),
		new FileManagerPlugin({
			events: {
				onStart: {
					delete: ["./ZegoUIKitPrebuilt/zego-uikit-prebuilt.js", "./ZegoUIKitPrebuilt/sdk"],
				},
				onEnd: {
					copy: [
						{
							source: "./public/1On1Call.html",
							destination: "./ZegoUIKitPrebuilt/1On1Call.html",
						},
						{
							source: "./public/groupCall.html",
							destination: "./ZegoUIKitPrebuilt/groupCall.html",
						},
						{
							source: "./public/liveStream.html",
							destination: "./ZegoUIKitPrebuilt/liveStream.html",
						},
						{
							source: "./public/videoConference.html",
							destination: "./ZegoUIKitPrebuilt/videoConference.html",
						},
						{
							source: "./public/package.json",
							destination: "./ZegoUIKitPrebuilt/package.json",
						},
						{
							source: "./public/index.d.ts",
							destination: "./ZegoUIKitPrebuilt/index.d.ts",
						},
					],
					delete: ["ZegoUIKitPrebuilt/util.d.ts"],
				},
			},
		}),
	],
	externals: {
		"zego-superboard-web": "zego-superboard-web",
		"zego-zim-web": "zego-zim-web",
	},
}
export default config;
