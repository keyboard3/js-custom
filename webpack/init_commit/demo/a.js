module.exports = function sayHelloA() {
  console.log("hello a");
  const sayHelloC = require("./c");
  sayHelloC();
}