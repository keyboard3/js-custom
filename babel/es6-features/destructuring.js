/**
 * https://tc39.es/ecma262/#sec-destructuring-binding-patterns
 * 递归解构绑定符号
 * 
 * BindingPattern:
 *    ObjectBindingPattern
 *    ArrayBindingPattern
 * 
 * ArrayBindingPattern:
 *    ...BindingRestElement
 *    BindingElementList
 *    BindingElementList , ...BindingRestElement
 * 
 * BindingElement:
 *    SingleNameBinding
 *    BindingPattern Initializer(opt)
 * 
 * SingleNameBinding:
 *    BindingIdentifier Initialize(opt)
 * 
 * BindingIdentifier
 *    Identifier
 * 
 * babel 会自动转义成逐个变量赋值
 */
var [a, , b] = [1, 2, 3];
a === 1;
b === 3;

/**
 * ObjectBindingPattern:
 *    {}
 *    BindingRestProperty
 *    BindingPropertyList
 *    BindingPropertyList , BindingRestProperty
 * 
 * BindingRestProperty : ... BindingIdentifier
 * 
 * BindingPropertyList
 *    BindingProperty
 *    BindingPropertyList BindingProperty
 * 
 * BindingProperty
 *    SingleNameBinding
 *    PropertyName : BindingElement
 * 
 * PropertyName
 *    LiteralPropertyName
 *    ComputedPropertyName
 * 
 * LiteralPropertyName
 *    IdentifierName
 *    StringLiteral
 *    NumericLiteral
 * 
 * ComputedPropertyName
 *    AssignmentExpression
 * 
 * babel 解析给指定变量赋值 b = _getASTNode.lhs.op,
 */
var { op: a, lhs: { op: b }, rhs: c }
  = getASTNode()

// 对象匹配的简写
// 在作用域中绑定 `op`, `lhs` and `rhs`
var { op, lhs, rhs } = getASTNode()

// 可用于参数位置
function g({ name: x }) {
  console.log(x);
}
g({ name: 5 })

// 解构失败
var [a] = [];
a === undefined;

// 解构失败时使用默认值
var [a = 1] = [];
a === 1;

// 解构 + 默认参数，见上面的对象解构
function r({ x, y, w = 10, h = 10 }) {
  return x + y + w + h;
}
r({ x: 1, y: 2 }) === 23