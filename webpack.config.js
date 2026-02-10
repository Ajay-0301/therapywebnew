const path = require('path');

module.exports = {
  entry: {
    auth: './src/auth.ts',
    dashboard: './src/dashboard.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
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
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
  devServer: {
    static: './',
    port: 8080,
    open: true,
    hot: true,
  },
};
