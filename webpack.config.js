const path = require('path');

module.exports = {
  entry: [
      './src/site/_assets/js/disqus-comments.js',
      './src/site/_assets/js/static-youtube-embed.js',
      './src/site/_assets/js/load-more.js',
      './node_modules/instant.page/instantpage.js',
      './src/site/_assets/css/bundle.scss',
  ],
  module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        },
        {
            test: /\.scss$/,
            exclude: /(node_modules)/,
            use: [
                {
                    loader: 'file-loader',
                    options: { outputPath: 'css/', name: '[name].min.css' }
                },

                {
                  loader: 'sass-loader',
                  options: {
                    sassOptions: {
                        outputStyle: 'compressed'
                    }
                  }
                },
            ]
        }
    ]
  },
  output: {
    path: path.resolve(__dirname, '_site/assets/'),
    filename: 'main.js'
  }
};