const path = require('path');

module.exports = {
  entry: [
      './src/site/_assets/js/disqus-comments.js',
      './src/site/_assets/js/static-youtube-embed.js',
      './node_modules/instant.page/instantpage.js',
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
    ]
  },
  output: {
    path: path.resolve(__dirname, '_site/assets/'),
    filename: 'main.js'
  }
};