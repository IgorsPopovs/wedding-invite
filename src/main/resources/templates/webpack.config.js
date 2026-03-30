import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  entry: './src/worker/index.js',
  output: {
    filename: 'worker.js',
    path: path.resolve('./dist'),
    libraryTarget: 'module',
    publicPath: '/',
  },
  experiments: { outputModule: true },
  module: { rules: [{ test: /\.html$/i, loader: 'html-loader' }] },
  mode: 'production',
  target: 'webworker',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/public/index.html', to: 'index.html' },
        { from: './src/public/index.html', to: 'wedding-invite/index.html' },
        { from: './src/public', to: '.' },
      ],
    }),
  ],
};

