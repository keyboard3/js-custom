/**
 * https://tc39.es/ecma262/#sec-declarations-and-the-variable-statement
 * ”暂时性死区“
 * let 和 const 声明定义了作用域为运行执行上下文的 LexicalEnvironment 的变量。
 * 变量在其包含的 Environment Record 被实例化时创建，但在变量的 LexicalBinding 之前不能以任何方式访问。
 * 当 LexicalBinding 被求值时，一个由 LexicalBinding 和 Initializer 定义的变量被分配了它的 Initializer 的 AssignmentExpression 的值，
 * 而不是在创建变量时。如果 let 声明中的 LexicalBinding 没有初始值设定项，则在评估 LexicalBinding 时会为变量分配未定义的值。
 * 
 * https://tc39.es/ecma262/#sec-block
 * 静态语法定义：
 *    1.如果LexicallyDeclaredNames(块内声明变量)在函数中已经存在相同的变量声明就抛出SyntaxError
 *    2.如果LexicallyDeclaredNames(块内声明变量)遇到var声明也抛出SyntaxError
 * 动态语义：
 *    保存当前函数的执行上下文为oldEnv
 *    创建新的声明环境blockEnv(oldEnv)
 *    进入block环境执行语句 (statementList,blockEnv)
 *    记录执行结果到blockValue
 *    还原oldEnv到当前执行上下文
 *    return blockValue
 */
function f() {
  {
    // console.log(x);//”暂时性死区“
    let x;
    {
      // console.log(x);//”暂时性死区“
      // 当babel识别是cosnt let在块级作用域内声明时，会将同名的x重命名成_x
      const x = "sneaky";
      // 这个块级作用域内会将x符号都替换成_x
      x = "foo";
      // var x="34"; 通过静态语义2 SyntaxError
    }
    // 这个还是外层声明的x符号
    x = "bar";
    // 同静态语义1 SyntaxError
    // let x = "inner";
  }
}
f();