function Annotation(templateData) {
  var s = templateData.raw[0];
  console.log("".padStart(4, "=") + s + "".padEnd(4, "="));
}

Annotation`循环依次执行await Promise`
var db = { post: (val) => console.log(`依次循环 ${val.toString()}`) };
var dbFuc = async function (db) {
  let docs = [{}, {}, {}];

  for (let doc of docs) {
    await db.post(doc);
  }
}

var dbFun = async function (db) {
  let docs = [{}, {}, {}];
  await docs.reduce(async (_, doc) => {
    await _;
    await db.post(doc);
  }, undefined);
}
dbFuc(db);

Annotation`async实现原理`
var spawn = function (genF) {
  return new Promise(function (resolve, reject) {
    const gen = genF();
    step(function () { return gen.next(undefined) });
    function step(nextF) {
      let next;
      try {
        next = nextF();
      } catch (err) {
        return reject(err);
      }
      if (next.done) return resolve(next.value);
      Promise.resolve(next.value).then(function (v) {
        step(function () { return gen.next(v) });
      }, function (e) {
        step(function () { return gen.throw(e) });
      })
    }
  })
}
// async function fn(args) {}
var fn = function (args) {
  return spawn(function* () {
    var a = yield 2;
    console.log('async实现原理', a);
  });
}
fn();

/**
 * 假定某个 DOM 元素上面，部署了一系列的动画，前一个动画结束，才能开始后一个。
 * 如果当中有一个动画出错，就不再往下执行，返回上一个成功执行的动画的返回值。
 */
//Promise 写法，异步同步执行以及错误处理都被包含在Promise的then和throw API中。一下子没法直观的观察的代码含义
function chainAnimationsPromise(elem, animations) {

  // 变量ret用来保存上一个动画的返回值
  let ret = null;

  // 新建一个空的Promise
  let p = Promise.resolve();

  // 使用then方法，添加所有动画
  for (let anim of animations) {
    p = p.then(function (val) {
      ret = val;
      return anim(elem);
    });
  }

  // 返回一个部署了错误捕捉机制的Promise
  return p.catch(function (e) {
    /* 忽略错误，继续执行 */
  }).then(function () {
    return ret;
  });
}
//Generator的写法，包裹的函数内部语义非常清晰，没有任何为了达到异步而必须强侵入代码表述的API
//但是Generator的构建却包含了为了实现它的API
function chainAnimationsGenerator(elem, animations) {
  return spawn(function* () {
    let ret = null;
    try {
      for (let anim of animations) {
        ret = yield anim(elem);
      }
    } catch (e) {
      /* 忽略错误，继续执行 */
    }
    return ret;
  });
}
//async函数直接将构建的api都内置语言里，提供关键字来调用
async function chainAnimationsAsync(elem, animations) {
  let ret = null;
  try {
    for (let anim of animations) {
      ret = await anim(elem);
    }
  } catch (e) {
    /* 忽略错误，继续执行 */
  }
  return ret;
}

/**
 * 按顺序完成异步操作。依次远程读取一组URL，然后按照读取的顺序输出结果
 */
var logInOrder = function (urls) {
  //远程读取所有URL
  const textPromise = urls.map(url => fetch(url).then(res => res.text()))
  //按次序输出
  textPromise.reduce((chain, textPromise) => {
    return chain.then(() => textPromise).then(text => console.log(text));
  }, Promise.resolve());
}
//async的按次序读
var logInOrder = async function (urls) {
  for (const url of urls) {
    const response = await fetch(url);
    console.log(await response.text());
  }
}
//并发读
var logInOrder = async function (urls) {
  // 并发读取远程URL
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });

  // 按次序等待 打印结果
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }
}

await new Promise(r => setTimeout(r, 1000));
console.log("X2");