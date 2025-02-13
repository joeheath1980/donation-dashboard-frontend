const webpack = require('webpack');

module.exports = function override(config, env) {
  // DefinePlugin for explicit variable injection
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL), // CORRECTED
    }),
  ]);

  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    process: require.resolve("process/browser"),
    zlib: require.resolve("browserify-zlib"),
    stream: require.resolve("stream-browserify"),
    util: require.resolve("util/"),
    buffer: require.resolve("buffer/"),
    asset: require.resolve("assert/"),
  };

  // ProvidePlugin for automatic loading of 'process' and 'Buffer'
  config.plugins = config.plugins.concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  // Handle .mjs files
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    },
  ];

  return config;
};