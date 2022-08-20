const timeout = ms => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve();
  }, ms);
});

const ajax1 = () => timeout(2000).then(() => {
  console.log('1');
  return 1;
});

const ajax2 = () => timeout(1000).then(() => {
  console.log('2');
  return 2;
});

const ajax3 = () => timeout(2000).then(() => {
  console.log('3');
  return 3;
});

const mergePromise = ajaxArray => {
  // 在这里实现你的代码
  return new Promise((resolve, reject) => {
    let promise = Promise.resolve();
    let results = [];
    for (let ajax of ajaxArray) {
      promise = promise.then(ajax).then(res => results.push(res));
    }
    promise.then(() => resolve(results), reject);
  });
};


// Promise.resolve().then(ajax1).then(ajax2).then(ajax3);
mergePromise([ajax1, ajax2, ajax3]).then(data => {
  console.log('done');
  console.log(data); // data 为 [1, 2, 3]
});

// 要求分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]