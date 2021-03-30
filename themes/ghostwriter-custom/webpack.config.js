const path = require('path');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    site: path.join(__dirname, 'static', 'styles', 'site'),
    syntax: path.join(__dirname, 'static', 'styles', 'syntax'),
  },
  resolve: {
    modules: [
      'node_modules'
    ],
    extensions: ['.scss'],
  },
  output: {
    path: path.join(__dirname, 'static', 'dist'),
  },
  plugins: [
    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      }
    ]
  }
};

