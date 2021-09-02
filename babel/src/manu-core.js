const babel = require("@babel/core");

const res = babel.transformSync("console.log('hello world')", {});
console.log(res);