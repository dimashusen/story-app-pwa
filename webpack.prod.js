const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// const path = require('path'); // Kita tidak perlu ini lagi
// const { InjectManifest } = require('workbox-webpack-plugin'); // 1. HAPUS IMPOR INI

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

    // 2. HAPUS SELURUH BLOK PLUGIN INI
    // new InjectManifest({
    //   swSrc: path.resolve(__dirname, 'src/scripts/sw.js'),
    //   swDest: './sw.js',
    // }),
  ],

  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin()],
    splitChunks: { chunks: 'all' },
  },
});