const path = require("path");

module.exports = {
  devtool: "eval-source-map",
  mode: "production",
  // entry: "./src/index.ts",
  entry: "./src/ticket_check.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    // filename: "bundle.js",
    filename: "ticket_check.js",
    path: path.resolve(__dirname, "static/dist/"),
  },
};
