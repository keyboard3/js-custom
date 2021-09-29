console.log("===main");
const sayHello = require("./c");
sayHello();
require.ensure(["./a"], function (require) {
  var sayHello = require("./a");
  sayHello();
});
require.ensure(["./b"], function (require) {
  var sayHello = require("./b");
  sayHello();
});