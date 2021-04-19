var PENDING = 'pending';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';
var asyncRun = typeof window !== undefined ? setTimeout : window.queueMicrotask;
function Promise(executor) {
  this.status = PENDING;
  this.notifyResultList = [];
  this.notifyErrorList = [];
  this.value = null;
  this.reason = null;
  var that = this;
  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
  function resolve(value) {
    if (that.status !== PENDING) return;
    that.value = value;
    that.status = FULFILLED;
    for (let notifyResult of that.notifyResultList) {
      notifyResult(that.value);
    }
  }
  function reject(error) {
    if (that.status !== PENDING) return;
    that.reason = error;
    that.status = REJECTED;
    for (let notifyError of that.notifyErrorList) {
      notifyError(that.reason);
    }
  }
}
Promise.prototype.then = function (onFulfilled, onRejected) {
  var promise1 = this;
  var promise2 = new Promise((resolve, reject) => {
    switch (promise1.status) {
      case PENDING:
        promise1.notifyResultList.push(notifyResult);
        promise1.notifyErrorList.push(notifyError);
        break;
      case FULFILLED:
        notifyResult(promise1.value);
        break;
      case REJECTED:
        notifyError(promise1.reason);
        break;
    }
    function notifyResult(value) {
      if (!onFulfilled) return resolvePromiseX(promise2, value, resolve, reject);
      asyncRun(function () {
        try {
          if (typeof onFulfilled == "function") {
            var x = onFulfilled(value);
            resolvePromiseX(promise2, x, resolve, reject);
          } else resolvePromiseX(promise2, value, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }
    function notifyError(reason) {
      if (!onRejected) return reject(reason);
      asyncRun(function () {
        try {
          if (typeof onRejected == "function") {
            var x = onRejected(reason);
            resolvePromiseX(promise2, x, resolve, reject);
          } else reject(reason)
        } catch (error) {
          reject(error);
        }
      });
    }
  });
  return promise2;
}
function resolvePromiseX(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'))
  }
  if (x instanceof Promise) {
    return x.then(function (val) {
      resolvePromiseX(promise, val, resolve, reject)
    }, reject);
  }
  if (typeof x == "object" || typeof x == "function") {
    if (x == null) return resolve(x);
    try {
      var then = x.then;
    } catch (error) {
      return reject(error);
    }
    if (typeof then == "function") {
      try {
        var promiseCalled = false;
        return then.call(x, resolvePromise, rejectPromise);
        function resolvePromise(y) {
          if (promiseCalled) return;
          promiseCalled = true;
          resolvePromiseX(promise, y, resolve, reject);
        }
        function rejectPromise(r) {
          if (promiseCalled) return;
          promiseCalled = true;
          reject(r);
        }
      } catch (error) {
        if (promiseCalled) return;
        return reject(error);
      }
    }
  }
  resolve(x);
}
Promise.prototype.catch = function (onRejected) {
  this.then(null, onRejected);
}
Promise.prototype.finally = function (onFinally) {
  this.then(function () { }, function () { })
}
Promise.resolve = function (val) {
  if (val instanceof Promise) return val;
  return new Promise(function (resolve) {
    resolve(val);
  });
}
Promise.reject = function (reason) {
  return new Promise(function (_, reject) {
    reject(reason);
  });
}
Promise.deferred = function () {
  var value = {};
  value.promise = new Promise(function (resolve, reject) {
    value.resolve = resolve;
    value.reject = reject;
  });
  return value;
}
module.exports = Promise