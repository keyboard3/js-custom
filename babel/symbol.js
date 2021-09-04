/**
 * https://262.ecma-international.org/11.0/#sec-ecmascript-language-types-symbol-type
 * Symbol 类型是所有可用作 Object 属性键的非字符串值的集合 (6.1.7)。 
 * 每个可能的 Symbol 值都是唯一且不可变的。 
 * 每个 Symbol 值都不可改变地包含一个名为 [[Description]] 的关联值，该值要么是未定义的，要么是一个字符串值。
 */
(function () {
  //函数作用域内部持有symbol引用
  //https://tc39.es/ecma262/#sec-symbol-constructor
  //key本质是一个新的对象，因为每个对象重新创建，所以独一无二
  var key = Symbol("key");

  //给构造函数的实例指定symbol作为私有属性，外部因为无法访问到symbol引用，所以覆盖该私有属性
  function MyClass(privateData) {
    this[key] = privateData;
  }

  MyClass.prototype = {
    getKey: function () {
      return this[key];
    }
  };

  //有些Symbol的特性需要js引擎才能支持的，如typeof关键字
  //chrome 38、edge 12等以下不支持，会转成_typeof(key) 
  //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol
  typeof key === "symbol"
})();

/**
 * Symbol对象则通过 require("core-js/modules/es6.symbol.js") 来polyfill提供运行时对象。模拟各种标准约定的特性
 * https://github.com/zloirock/core-js#ecmascript-symbol
 * https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.js
 **/
var c = new MyClass("hello")
//通过字符串key无法定位到symbol("key")属性
c["key"] === undefined