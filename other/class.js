`
class MyLib extends Function {
  constructor() {
    super();
    this.num=10;
  }
  add(a,b) {
    return a+b;
  }
  static reduce(a,b) {
    return a-b;
  }
}
`
/** 类装饰器 */
function checkClass(target) {
  console.log("checkClass", target);
}
/** 方法装饰器 */
function SkipServer() {
  return function (target, propertyKey, descriptor) {
    let oldFunc = descriptor.value;
    descriptor.value = function () {
      console.log("params", arguments);
      return oldFunc.apply(this, arguments);
    }
  }
}
/** 作用域隔离 */
var MyLibFactory = checkClass((_MyLibFactory = function (_Math) {
  //
  MyLib.prototype = Object.create(_Math.prototype, { "constructor": { value: MyLib } });

  var _super = Object.getPrototypeOf(MyLib.prototype);
  function MyLib() {
    _super.constructor.apply(this);
    this.num = 10;
  }

  /**应用装饰器 */
  const applyDecorotorArgs = [MyLib.prototype, "add", {
    value: function (a, b) { return a + b }
  }];
  SkipServer().apply(this, applyDecorotorArgs);
  Object.defineProperty.apply(this, applyDecorotorArgs);

  MyLib.reduce = function (a, b) {
    return a - b;
  }
  return MyLib;
}(Function))) || _MyLibFactory;
const mylib = new MyLibFactory();
mylib.add(1, 2);
console.log(mylib);