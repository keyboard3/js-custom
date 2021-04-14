function Promise(executor) {
  this.status = "pending";
  this.notifyResult = null;
  this.notifyError = null;
  this.result = null;
  this.error = null;
  var that = this;
  executor(resolve, reject);
  function resolve(result) {
    that.result = result;
    that.status = "completed";
    if (that.notifyResult) that.notifyResult(); //处理结束，告诉下一个
    else;//首次处理完，等待延迟触发
  }
  function reject(error) {
    that.error = error;
    that.status = "failed";
    if (that.notifyError) that.notifyError(); //出现异常，告诉下一个出现异常了
    else;//首次处理完，等待延迟触发
  }
}
//注册父级结果和异常订阅
Promise.prototype.register = function (resultSubscriber, errorSubscriber) {
  var parentPromise = this;
  var nextPromise = new Promise((resolve, reject) => {
    switch (parentPromise.status) {
      case "pending": //后续都没有处理，告诉前一个Promise，有结果通知我，正常和异常我都需要
        parentPromise.notifyResult = notifyResult; //告诉前面，正常的通过它来通知我。
        parentPromise.notifyError = notifyError; //告诉前面，异常的通过它来通知我
        break;
      case "completed":  //首次处理完, 延迟触发。一个目的是等待整个通知链路完成，开始从头通知
        notifyResult();
        break;
      case "failed": //首次处理完, 延迟触发。一个目的是等待整个通知链路完成，开始从头通知
        notifyError();
        break;
    }
    function notifyResult() {
      if (!resultSubscriber) return resolvePromiseVal(parentPromise.result); //我无法处理，但是我可以告诉下一个
      asyncRunResultSubscriber();
    }
    function notifyError() {
      if (!errorSubscriber) return reject(parentPromise.error); //我无法处理异常，但是我可以告诉下一个
      asyncRunErrorSubscriber();
    }
    function asyncRunResultSubscriber() {
      setTimeout(function () {
        try {
          var val = resultSubscriber(parentPromise.result); //我可以处理，处理完结果告诉下一个
          resolvePromiseVal(val);
        } catch (error) {
          reject(error);
        }
      });
    }
    function asyncRunErrorSubscriber() {
      setTimeout(function () {
        try {
          var val = errorSubscriber(parentPromise.error); //我可以处理异常，处理完结果告诉下一个
          resolvePromiseVal(val);
        } catch (error) {
          reject(error);
        }
      });
    }
    function resolvePromiseVal(value) {
      if (value && (typeof value === 'object' && value instanceof Promise)) {
        value.register(function (val) { resolve(val) }, function (error) { reject(error) });
      } else resolve(value);
    }
  });
  return nextPromise;
}
Promise.prototype.then = function (resultSubscriber) {
  return this.register(resultSubscriber, null);
}
Promise.prototype.catch = function (errorSubscriber) {
  return this.register(null, errorSubscriber);
}
module.exports = Promise