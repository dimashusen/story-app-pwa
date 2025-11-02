const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { GenerateSW } = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new GenerateSW({
      swDest: './sw.js',
      clientsClaim: true,
      skipWaiting: true,
      importScripts: ['./sw-push.js'],
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://story-api.dicoding.dev/v1/    '),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxAgeSeconds: 60 * 60 * 24 },
          },
        },
        {
          urlPattern: ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/stories/    '),
          handler: 'CacheFirst',
          options: {
            cacheName: 'story-image-cache',
            expiration: { maxEntries: 50 },
          },
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin()],
    splitChunks: { chunks: 'all' },
  },
});