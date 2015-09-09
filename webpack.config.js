var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000',
    'webpack/hot/only-dev-server',
    './js/app.js',
    './less/app.less'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  debug: true,
  module: {
    loaders: [
      {
        test: path.join(__dirname, 'js'),
        loaders: ['react-hot', 'babel?stage=0']
      },
      {
        test: path.join(__dirname, 'less'),
        loader: 'style!css!less'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
