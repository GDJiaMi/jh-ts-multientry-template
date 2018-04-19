const webpack = require('webpack')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path').posix
const { root, context, dist, static } = require('./path')
const pkg = require('../package.json')

module.exports = (env, argv) => {
  const isProduction = !!env.production
  const $ = (development, production) =>
    isProduction ? production : development

  const envConfig = $(require('./dev.config'), require('./prod.config'))
  const webpackConfig = {
    context,
    mode: $('development', 'production'),
    devtool: $('inline-source-map', 'source-map'),
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
      filename: 'static/js/[name].[hash:8].js',
      chunkFilename: 'static/js/[name].[hash:8].js',
      path: dist,
      pathinfo: true,
    },
    resolve: {
      modules: ['node_modules', context],
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          oneOf: [
            // typescript
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
            // svg sprite
            {
              test: /\.icon\.svg$/,
              use: [
                {
                  loader: 'svg-sprite-loader',
                  options: {
                    esModule: false,
                  },
                },
                'svgo-loader',
              ],
            },
            // images
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg/],
              loader: 'url-loader',
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            ...(envConfig.rules || []),
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              loader: 'file-loader',
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
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
      ...(envConfig.optimization || {}),
    },
    plugins: [
      new CleanWebpackPlugin('dist', {
        root,
      }),
      ...genTemplatePlugin(isProduction),
      ...(envConfig.plugins || []),
    ],
  }

  return webpackConfig
}

function getPages() {
  return glob.sync(path.join(context, '*.html'))
}

// 生成*.html 文件
function genTemplatePlugin(isProduction) {
  const pages = getPages()
  return pages.map(pagePath => {
    const name = path.basename(pagePath, '.html')
    const filename = path.basename(pagePath)
    return new HtmlWebpackPlugin({
      filename,
      inject: true,
      chunks: ['vendor', 'commons', name],
      template: pagePath,
      minify: isProduction
        ? {
            removeAttributeQuotes: true,
            removeComments: true,
            collapseWhitespace: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
          }
        : undefined,
    })
  })
}
