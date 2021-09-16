/**
 * https://tc39.es/ecma262/#sec-iteration
 * 对象具有Iterable接口
 *    Symbol.iterator：返回Iterator对象的函数
 * 对象具有Iteraotr接口
 *    "next": 返回的对象必须符合 IteratorResult 接口。
 * 对象具有IteratorResult接口
 *    "done": true 表示到达了迭代器末尾，false迭代器没结束
 *    "value": 任何es类型值，如果done是false，表示了当前迭代元素值，done是true的话，这就是迭代器返回值，也可以为undefined
 */
let fibonacci = {
  [Symbol.iterator]() {
    let pre = 0, cur = 1;
    return {
      next() {
        [pre, cur] = [cur, pre + cur];
        return { done: false, value: cur }
      }
    }
  }
}
/**
 * https://tc39.es/ecma262/#sec-runtime-semantics-forinofloopevaluation
 * for ( var ForBinding of AssignmentExpression ) Statement
 *    ForIn/OfHeadEvaluation(《》, AssignmentExpression, iterate) 得到 keyResult
 *    Return ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet)
 * 
 * ForIn/OfHeadEvaluation(《》, AssignmentExpression, iterate) 得到 keyResult
 *    解释执行AssignmentExpression得到exprValue
 *    Return GetIterator(exprValue, iteratorHint).
 * 
 * ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet)
 *    保存当前上下文的环境到oldEnv
 *    重复：
 *       调用keyResult.next()得到nextResult
 *       中间包括nextResult的异步情况的处理
 *       检查是否迭代结束，结束循环
 *       ...
 *       创建新的iterationEnv(oldEnv)
 *       ...
 *       让nextResult做符号绑定
 *       ...
 *       解释执行Statemnt
 *       还原oldEnv到上下文
 *       检查是否结束(continue...)
 * 
 * babel 会转义成普通的 for循环，检查每次迭代的done是否循环结束，然后取值value，不断调用迭代器next继续
 */
for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}