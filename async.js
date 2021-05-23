//async-await函数生成器的建议实现
const Promise = require("./promise");

function getFoo() {
  return new Promise(function (resolve, reject) {
    resolve('foo');
  });
}
var g = function* () {
  try {
    var foo = yield getFoo();
    console.log("getFoo value:", foo);
  } catch (err) {
    console.error(err);
  }
}
function run(generator) {
  var it = generator();
  //控制函数生成器继续走，直到函数生成器结束
  function go(result) {
    if (result.done) return result.value;
    return result.value.then(function (value) {
      return go(it.next(value));
    }, function (error) {
      return go(it.throw(error));
    })
  }
  go(it.next());
}
run(g);