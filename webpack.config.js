const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
var ignorePlugin = new webpack.IgnorePlugin(/\.\/src\/jquery/)
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

function resolve (relativePath) {
  return path.resolve(__dirname, relativePath)
}

module.exports = {
  entry: {
    // vendor: ['react','react-dom','./src/reactRouter.js','echarts'],
    index: [resolve('demos/index.js')],
  },
  output: {
    path: resolve('dist'),//打包后的文件存放的地方
    pathinfo: true,
    filename: '[name].js',//打包后输出文件的文件名
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  externals: {
    jquery: 'window.$',
    $: 'window.$'
  },
  devtool: 'source-map', // 便于调试
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        include: [resolve('src'),resolve('demos')],
        loader: 'babel'
      },
      {
        test: /\.less$/,
        // loader: 'style!css!postcss!less'
        loader: ExtractTextPlugin.extract('style','css!postcss!less')
      },
        {
          test:/\.(gif|png|jpg|jpeg)/,
            loader:'url'
        }
    ],
  },
  postcss: function () {
    return [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 8'
        ],
      }),
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'lib',
      inject: true,
      template: resolve('demos/index.html'),
    }),
    ignorePlugin,
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('style.css'),
    // new CaseSensitivePathsPlugin(),
    // new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.js', minChunks: Infinity}),
  ],
  devServer: {
    contentBase: './dist', // 指定本地文件夹提供给服务器
    colors: true, // 设置为true，使终端输出的文件为彩色
    historyApiFallback: false, // 如果设置为true，所有的跳转将指向index.html
    inline: true, // 设置为true，当源文件改变时会自动刷新页面
    hot: true,
    port: '8080' // 设置默认监听端口，如果省略，默认为”8080“
  }
}