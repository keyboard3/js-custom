const sayHelloC = require("./c");
module.exports = function sayHelloB() {
  console.log("hello b");
  sayHelloC();
}