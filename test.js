const Promise = require("./promise.js");
//测试Promise
new Promise((resolve, reject) => {
  console.log(0);
  resolve(10);
}).then((val) => {
  return new Promise((resolve, reject) => {
    console.log("new Promise")
    setTimeout(() => {
      console.log("new Promise setTimeout", val)
      resolve(val + 3);
    }, 1000);
  }).then((val2) => {
    throw "new promise error"
    console.log("new Promise then", val2)
    return val2;
  });
}).then((val) => {
  console.log("end" + val);
}).catch(err => {
  console.log("catch end error", err)
});