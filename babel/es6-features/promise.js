/**
 * https://tc39.es/ecma262/#sec-promise-objects
 * 这里不需要语法转义，Promise是运行时提供，babel 可以提供 polyfill 实现。其核心目的为了解决回调地狱
 * babel 实现逻辑和 js 引擎实现没啥区别,进入微任务的队列方式不一样
 * babel 在node用的是 queueMicrotask，web用的是 MutationObserver
 * js 引擎可以直接加入任务队列，Quickjs是调用 JS_EnqueueJob
 * 
 * 我也用js实现了Promise A+标准的Promise对象 https://github.com/keyboard3/js-custom/blob/main/promise.js
 * 核心实现逻辑：Promise.then 接收了数据处理的resolve回调，then在内部创建新的Promise
 * 在初始化逻辑中向当前的Promise对象注册了结果处理函数，这个处理函数创建了异步任务，用执行resolve回调
 * 处理结束获得结果向自己的结果处理函数队列调用。
 * 这里的状态机有个差别是，第一个Promise的resolve是立刻执行的，然后等待异步任务调用
 */
function timeout(duration = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    })
}

var p = timeout(1000).then(() => {
    return timeout(2000);
}).then(() => {
    throw new Error("hmm");
}).catch(err => {
    return Promise.all([timeout(100), timeout(200)]);
})

/**
 * polyfill 为了能够正常使用新的内置构造函数(Promise/WeakMap)、 静态方法(Array.from/Object.assgin)、实例方法(Array.prototye.includes).
 * polyfill 会添到加全局scope 甚至像 String 这样的原生构造函数
 */