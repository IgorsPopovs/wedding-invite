const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',        // главный файл
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: 'raw-loader',       // чтобы импортировать HTML как строку
      },
    ],
  },
  target: 'webworker',           // для Cloudflare Workers
};