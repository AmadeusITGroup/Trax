if (process.env.COVERAGE === "true") {
  const fs = require("fs");
  const { instrumentTsCode } = require("./tsCodeInstrument");

  // override readFileSync to provide instrumented files:
  const trueReadFileSync = fs.readFileSync;
  fs.readFileSync = (...args) => {
    let code = trueReadFileSync(...args);
    if (typeof code === "string") {
      code = instrumentTsCode(code, args[0]);
    }
    return code;
  };
}
require("ts-node").register();
