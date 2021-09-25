/** 同步 */
const sayHelloA = require("./a");
sayHelloA();
/** 异步 */
require.ensure(["./b"], function (require) {
  var sayHelloB = require("./b");
  sayHelloB();
});