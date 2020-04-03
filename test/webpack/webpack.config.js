const path = require("path");

module.exports = [{
    mode: 'development',
    target: 'node',
    entry: {
        "test.specs": "./test/trax/testapp.ts"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(ts|js)$/,
                loader: "./webpack-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname)
    }
}];