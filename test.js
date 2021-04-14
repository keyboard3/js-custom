const Promise = require("./promise.js");
console.log("Promise",Promise)
//测试Promise
new Promise((resolve, reject) => {
  console.log(0);
  resolve(0);
}).then((val) => {
  val++;
  console.log(val);
  throw "错误了"
  return val;
}).catch((err) => {
  console.log("err", err);
  return "ok"
}).then((val) => {
  console.log(val);
});