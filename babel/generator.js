/**
 * https://tc39.es/ecma262/#sec-asyncgeneratorfunction-objects
 * 
 * babel 会将函数独立成一个回调，以 yield 作为分解语句的关键字，将语句拆解成switch的有顺序索引的label代码块
 * yield result 会转义成代码块的 return result，并将上下文context转移到下个label
 * context.send 可以拿到上一个 label 代码块的 return 结果
 * 外部由函数生成器返回的迭代器来控制回调内的代码块的执行权转移
 * 以上的整体通过代码块来转义执行权的逻辑有点类似于llvm的IR代码块，也更贴近汇编代码块跳转的思考逻辑。
 * 
 * Quickjs 遇到函数生成器会单独在堆上分配独立的栈帧，栈帧保存了指令的执行的索引位置以及栈帧的状态
 * 遇到 yield 指令会跳出将结果返回给调用者函数。下次next驱动函数执行会恢复它的执行环境
 */
var fibonacci = {
  [Symbol.iterator]: function* () {
    var pre = 0, cur = 1;//变量作用域会被转义到回调外层函数
    var a = yield 2;
    console.log(a);
    var b = yield 3;
    console.log(b);
    for (; ;) {
      var temp = pre;
      pre = cur;
      cur += temp;
      yield cur;
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}