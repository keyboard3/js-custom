/**
 * https://tc39.es/ecma262/#sec-tail-position-calls
 * 
 * 尾部位置调用必须在调用目标函数之前释放与当前正在执行的函数执行上下文相关联的任何瞬态内部资源，或者重用这些资源以支持目标函数。
 * 由于全局支持尾调用的复杂性和性能影响，仅支持显式自引用尾递归。由于其他错误而删除，并将重新实现。
 */
"use strict";
function factorial(n, acc = 1) {
  /**
   * 在这里使用 "use strict" 会出现 SyntaxError: Illegal 'use strict' directive in function with non-simple parameter list
   * 参考 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors/Strict_Non_Simple_Params
   */
  // "use strict"
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);
}

// 在现在的大多数实现中的堆栈溢出，
// 在es6之后这是安全的
factorial(100000)