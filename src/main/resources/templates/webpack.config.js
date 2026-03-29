// webpack.config.js
import path from 'path';

export default {
  entry: './src/worker/index.js',
  output: {
    filename: 'worker.js',
    path: path.resolve('./dist'),
    libraryTarget: 'module',  // <-- важное для ES Module
    publicPath: '/',
  },
  experiments: {
    outputModule: true,       // <-- включаем поддержку ES Module
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  mode: 'production',
  target: 'webworker',         // <-- для Workers
};