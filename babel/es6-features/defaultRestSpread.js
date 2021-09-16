/**
 * default
 * Functions -> FormalParameterList -> FormalParameter -> BindingElement 
 *  -> BindingPattern Initializer(opt), Initializer = AssignmentExpression
 * 大意是给 environment 绑定参数符号的初始化的值，函数调用的时候可以临时覆盖参数值上去
 */
function f(x, y = 12) {
  // 如果 y 参数没有传递 y=12
  return x + y;
}
f(3) == 15

/**
 * rest
 * Function Defintions -> Parameter lists
 * https://tc39.es/ecma262/#prod-FunctionRestParameter
 * FormalParameters : FormalParameterList , FunctionRestParameter
 *    大意是在 environment 中迭代剩余的参数列表，创建个新的参数
 */
function f2(x, ...y) {
  // y 是一个数组
  // y.length => (arguments.length <= 1 ? 0 : arguments.length - 1)
  return x * y.length;
}
f2(3, "hello", true) == 6

/**
 * spread
 * left-hand-side expr -> Function Call -> Argument list
 * https://tc39.es/ecma262/#sec-runtime-semantics-argumentlistevaluation
 * 解析 ArgumentList: ...AssignmentExpression 到 arguments
 *    创建个新的空list
 *    解析AssignmentExpression结果并包装成迭代器对象
 *    循环迭代器给list赋值
 * EvalueCall(func,ref,arguments,tailCall)
 * 
 * Babel: 
 * apply() 是es3提出来的，可以通过指定this以及args参数数组调用函数
 * es5 开始可以使用类数组对象(迭代器对象)
 * call() 不同的是，接收的不是参数数据而是参数列表,f3.apply(void 0,1,2,3);
 * f3.apply(void 0, [1, 2, 3]) == 6;
 */
function f3(x, y, z) {
  return x + y + z;
}
f3(...[1, 2, 3]) == 6