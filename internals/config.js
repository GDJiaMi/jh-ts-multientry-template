const webpack = require('webpack')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path').posix
const getEnviroment = require('./env')
const {
  root,
  context,
  dist,
  static,
  pageExt,
} = require('./path')
const pkg = require('../package.json')

module.exports = (env, argv) => {
  const isProduction = !!env.production
  const enviroments = getEnviroment(isProduction ? 'production' : 'development')
  const $ = (development, production) =>
    isProduction ? production : development

  const envConfig = $(require('./dev.config'), require('./prod.config'))
  const webpackConfig = {
    context,
    mode: $('development', 'production'),
    devtool: enviroments.raw.SOURCE_MAP === 'false' ? false : $('inline-source-map', 'source-map'),
    entry: async () => {
      const pages = getPages(pageExt)
      const entries = {
        vendor: pkg.vendor || [],
      }
      pages.forEach(pagePath => {
        const fileName = path.basename(pagePath, pageExt)
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
      publicPath: enviroments.raw.PUBLIC_URL,
    },
    resolve: {
      modules: ['node_modules', context],
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        react: "preact-compat",
        "react-dom": "preact-compat"
      }
    },
    module: {
      rules: [{
        oneOf: [
          // typescript
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
          // pug loader
          {
            test: /\.pug$/,
            use: [{
              loader: 'pug-loader',
              options: {
                root: context,
              },
            }, ],
          },
          // svg sprite
          {
            test: /\.icon\.svg$/,
            use: [{
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
      }, ],
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
      new webpack.DefinePlugin(enviroments.stringified),
      ...genTemplatePlugin(isProduction, enviroments.raw),
      ...(envConfig.plugins || []),
    ],
    devServer: envConfig.devServer,
    performance: envConfig.performance,
  }

  return webpackConfig
}

function getPages(ext) {
  return glob.sync(path.join(context, `*${ext}`))
}

// 生成*.html 文件
function genTemplatePlugin(isProduction, templateParameters, ext) {
  ext = ext || pageExt
  const pages = getPages(ext)
  return pages.map(pagePath => {
    const name = path.basename(pagePath, ext)
    const filename = path.basename(pagePath, ext)
    return new HtmlWebpackPlugin({
      templateParameters,
      filename: filename + '.html',
      inject: true,
      chunks: ['vendor', 'commons', name],
      template: pagePath,
      minify: isProduction ? {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
      } : undefined,
    })
  })
}