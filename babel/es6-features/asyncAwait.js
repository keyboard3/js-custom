/**
 * https://262.ecma-international.org/11.0/#sec-async-function-definitions
 * 
 * QuickJs 内部的async-await基本和函数生成器的实现基本一致
 * babel 转义后也是复用函数生成器的转义代码
 *    函数内部执行依靠函数生成器的控制权转换
 *    而await的结果是promise，交由包装控制器来执行promise的任务
 *    promise任务执行完触发迭代器执行函数内部下一个代码块
 *    函数的返回结果也会被统一包装成Promise对象
 * 
 * 实现过函数生成器+Promise+自动控制器：https://github.com/keyboard3/js-custom/blob/main/es6/generator.mjs
 * 
 function load() {
  return _load.apply(this, arguments);
 }
 function _load() {
  _load = _asyncToGenerator(...)//函数生成器代码
  return _load.apply(this, arguments);
 }
 */
async function control() {
  await load();
}
async function load() {
  setTimeout(() => {
    console.log(2);
  }, 20);
}