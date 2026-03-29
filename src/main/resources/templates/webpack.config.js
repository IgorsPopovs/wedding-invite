import path from 'path';

export default {
  entry: './src/worker/index.js',
  target: 'webworker',        // критично для CF Worker
  output: {
    filename: 'worker.js',
    path: path.resolve('./dist'),
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
};