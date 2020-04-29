const { dirname, join } = require("path");
const { transform } = require("@babel/core");

const folder = join(dirname(__dirname), "src");

exports.instrumentTsCode = (code, filename) => {
  if (!filename.startsWith(folder) || !/\.ts$/.test(filename)) {
    return code;
  }
  code = transform(code, {
    generatorOpts: {
      decoratorsBeforeExport: true,
    },
    filename,
    plugins: [
      ["@babel/plugin-syntax-decorators", { decoratorsBeforeExport: true }],
      "@babel/plugin-syntax-typescript",
      "babel-plugin-istanbul",
    ],
  }).code;
  code = code.replace(/function (cov_\w+)\(\)/, "var $1 = function()");
  return code;
};
