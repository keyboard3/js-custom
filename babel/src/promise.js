Promise.resolve().then(() => {
    console.log("hello world");
})
Array.from([2, 3, 3]);

/**
 * polyfill 为了能够正常使用新的内置构造函数(Promise/WeakMap)、 静态方法(Array.from/Object.assgin)、实例方法(Array.prototye.includes).
 * polyfill 会添到加全局scope 甚至像 String 这样的原生构造函数
 */