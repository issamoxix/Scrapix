module.exports = {
  entry: "./",
  module: {
    // Use `ts-loader` on any file that ends in '.ts'
    rules: [
      {
        test: /\.ts$/,
        use: "jsdom",
        exclude: /node_modules/,
      },
    ],
  },
  // Bundle '.ts' files as well as '.js' files.
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  output: {
    filename: "main.js",
    path: `${process.cwd()}/dist`,
  },
};
