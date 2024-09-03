const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      https: require.resolve('https-browserify'),
      zlib: require.resolve('browserify-zlib'),
      fs: false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ]
};