const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  stats: 'errors-only',
  bail: true,
  entry: {
    roseworx: path.resolve(__dirname, './compiled.js'),
  },
  output: {
  	path: path.join(__dirname, './compiled'),
    filename: '[name].app.js',
    chunkFilename: '[name].app.chunk.js'
  },
  plugins: [
  	new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].app.css'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss/i,
        use : [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer')({grid:true})
                ]
              }
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};