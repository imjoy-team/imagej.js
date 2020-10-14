const path = require('path')
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
// const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const WorkboxPlugin = require('workbox-webpack-plugin');

const config = (env, argv) => ({
  mode: 'development',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'imagej',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    port: 9090,
    host: '0.0.0.0',
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  plugins: [
    // new CleanWebpackPlugin(['dist']),
    new CopyPlugin([{
        from: path.resolve(__dirname, 'src', 'assets'),
        to: path.resolve(__dirname, 'dist', 'assets')
      },
      {
        from: path.resolve(__dirname, 'src', 'CNAME')
      },
      {
        from: path.resolve(__dirname, 'src', 'style.css')
      },
      {
        from: path.resolve(__dirname, 'src', 'manifest.webmanifest')
      }
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src', 'index.html'),
      inject: true
    }),
    new HtmlReplaceWebpackPlugin([{
      pattern: 'IJ_VERSION',
      replacement: require("./package.json").version
    }]),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: new RegExp('https://cjrtnc.leaningtech.com/.*'),
          handler: 'CacheFirst'
        },
        {
          urlPattern: new RegExp('https://stackpath.bootstrapcdn.com/font-awesome/.*'),
          handler: 'CacheFirst'
        },
        {
          urlPattern: new RegExp('https://cdnjs.cloudflare.com/.*'),
          handler: 'CacheFirst'
        },
        {
          urlPattern: new RegExp('https://imjoy.io/static/.*'),
          handler: 'NetworkFirst'
        },
        {
          urlPattern: new RegExp('https://static.imjoy.io/.*'),
          handler: 'NetworkFirst'
        },
        {
          urlPattern: new RegExp('/.*'),
          handler: 'NetworkFirst'
        }, 
        {
          urlPattern: new RegExp('/ij153/.*'),
          handler: 'NetworkFirst'
        }, 
        {
          urlPattern: new RegExp('/ij211/.*'),
          handler: 'NetworkFirst'
        },
        {
          // debugging
          urlPattern: new RegExp('/sockjs-node.*'),
          handler: 'NetworkOnly'
        }, 
      ]
    }),
    // new WriteFilePlugin(),
  ],
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['last 2 Chrome versions']
                  },
                  useBuiltIns: 'entry',
                  corejs: '3.0.0',
                  modules: false,
                },
              ],
            ],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
})

module.exports = config