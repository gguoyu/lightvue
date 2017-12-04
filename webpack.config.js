/**
 * Created by birdguo on 2017/11/28.
 */
var path = require('path')

module.exports = {
	entry: './src/entries/index.js',
	output: {
		filename: './dist/v1.3.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					{
						loader: "babel-loader",
						options: {
							"presets": ["es2015"]
						}
					}
				],
				include: __dirname,
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		modules: [
			path.resolve('./src')
		]
	}
}
