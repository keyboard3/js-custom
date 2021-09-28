const sayHelloC = require("./c");
module.exports = function sayHelloA() {
  console.log("hello a");
  sayHelloC();
}