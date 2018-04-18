const webpack = require('webpack')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path').posix
const pkg = require('../package.json')

const context = path.join(path.resolve(__dirname, '../'), 'src')

module.exports = {
  context,
  devtool: 'source-map',
  entry: async () => {
    const pages = getPages()
    const entries = {
      vendor: pkg.vendor || [],
    }
    pages.forEach(pagePath => {
      const fileName = path.basename(pagePath, '.html')
      const entry = `./js/entries/${fileName}.tsx`
      entries[fileName] = entry
    })

    return entries
  },
  output: {
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].js',
    path: path.resolve(__dirname, '../dist'),
    pathinfo: true,
  },
  resolve: {
    modules: ['node_modules', context],
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    splitChunks: {
      name: true,
      cacheGroups: {
        // 第三方共有包
        vendor: {
          name: 'vendor',
          test: /node_modules/,
          reuseExistingChunk: false,
          chunks: 'initial',
          minChunks: 2,
          enforce: true, // 强制
          priority: 10,
        },
        // 应用内共有包
        commons: {
          test: /src/,
          name: 'commons',
          chunks: 'all',
          reuseExistingChunk: false,
          minChunks: 2,
          priority: 10,
        },
        default: false,
      },
    },
  },
  plugins: [...genTemplatePlugin()],
}

function getPages() {
  return glob.sync(path.join(context, '*.html'))
}

// 生成*.html 文件
function genTemplatePlugin() {
  const pages = getPages()
  return pages.map(pagePath => {
    const name = path.basename(pagePath, '.html')
    const filename = path.basename(pagePath)
    return new HtmlWebpackPlugin({
      filename,
      inject: true,
      chunks: ['vendor', 'commons', name],
      template: pagePath,
    })
  })
}
