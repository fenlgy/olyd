var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var opn = require('opn')

const chalk = require('chalk');

var webpackConfig = require('./webpack.config.js');

webpackConfig.entry.index = "webpack-dev-server/client?http://localhost:9000/";

console.log(webpackConfig)

let compiler;


const hotUpdate =  process.argv.indexOf('--ie8') === -1

function setupCompiler(host, port, protocol) {

  if (!hotUpdate){
    // ie8 不使用热加载, 但需配置es3ify
      webpackConfig.module.postLoaders = [
      {
        test: /\.(js|jsx)$/,
        include: [/node_modules/,/src/,/samples/],
        loaders: ['es3ify'],
      },
    ]
  }
  
  compiler = webpack(webpackConfig);

  compiler.plugin('done', function(stats) {

    console.log(stats)

  });
}

function runDevServer(host, port, protocol) {

  var server = new WebpackDevServer(compiler, {
      compress: true,
      clientLogLevel: 'none',
      contentBase: "./dist",//本地服务器所加载的页面所在的目录
      publicPath: '/',
      hot: true,
      quiet: true,
      watchOptions: {
          ignored: /node_modules/,
      },
  });


  server.listen(port, function(err) {
    if(err) {
      return console.log(err);
    }

    console.log(chalk.cyan('Starting the development server...'));
    console.log();
    opn('http://localhost:9000/')
  });
}

function run(port) {
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const host = require('quick-local-ip').getLocalIP4();
  setupCompiler(host, port, protocol);
  runDevServer(host, port, protocol);
}

run(9000);


