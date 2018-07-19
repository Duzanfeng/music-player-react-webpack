var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: __dirname + '/app/index.js', //入口文件
	// devtool:'eval-source-map',
	output: {
		path: __dirname + '/dist',
		filename: 'js/[name].js'
	},
	devServer: {
    	contentBase: "/dist",//本地服务器所加载的页面所在的目录
    	historyApiFallback: true,//不跳转
    	inline: true,//实时刷新
        hot: true
  	},
	module: {
		rules: [
			{
			    test: /\.js$/,
			    use: {
			        loader: "babel-loader"
			    },
			    exclude: /node_modules/
			},
			{
				test: /\.(css|less)$/,
				use: [
				{
					loader: MiniCssExtractPlugin.loader,
					options:{
                        publicPath: '../'
                    }
				},
					'css-loader',
            		'postcss-loader',
					'less-loader'
				]
			},
			{
				test: /\.(png|jpg|gif|svg)$/i,
				use: [{
					loader: 'url-loader',
					options: {
						limit: 500,
						name: 'images/[name].[ext]'
					}
				}]
			}, 
			{
			    test: /\.(htm|html)$/i,
			    use: 'html-withimg-loader'
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.tpl.html',
			inject: 'body',
			filename: './index.html',
			hash: true
		}),
		new webpack.HotModuleReplacementPlugin(),//热加载插件
		// new CleanWebpackPlugin('dist/*.*', {
		// 	root: __dirname,
		// 	verbose: true,
		// 	dry: false
		// }),
		new MiniCssExtractPlugin({
		    filename: "css/[name].css",
		    chunkFilename: "[id].css"
		})
	]
}