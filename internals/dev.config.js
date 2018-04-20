/**
 * 生产环境配置
 */
const webpack = require('webpack')
const { root, context, dist, static } = require('./path')
const pkg = require('../package.json')

module.exports = {
  rules: [
    {
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [
              require('autoprefixer')({
                browsers: ['last 2 versions'],
              }),
            ],
          },
        },
      ],
    },
  ],
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    contentBase: [static, dist],
    compress: true,
    hot: true,
    overlay: true,
    host: '0.0.0.0',
    port: 8080,
    proxy: pkg.proxy,
  },
}
