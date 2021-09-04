console.log("hello world!");

// converted to
// "use strict";
// console.log("hello world!");

/**
 * npx babel babel/src/hello.js -o babel/build/hello.js
 * 通过 babel-cli 指定某个文件转义。还可以指定目录逐个转义到目录中 -d
 */