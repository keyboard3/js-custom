/** 不考虑兼容性，优先采用语义更准确的写法 */
Function.prototype._bind = function () {
  /** 因为 arguments 是类 Array 对象，所以没有 slice 这类方法，需要借助数组原型方法转换 */
  const args = Array.from(arguments);
  const thisObj = args[0];
  const bindArgs = args.slice(1); //[].slice.call/Array.prototype.slice.call

  const self = this;
  const NewFunc = function () {
    /**
     * 判断是否是new 构造函数
     * es6 new.target属性允许你检测函数或构造方法是否是通过new运算符被调用的。在通过new运算符被初始化的函数或构造方法中，new.target返回一个指向构造方法或函数的引用。在普通的函数调用中，new.target 的值是undefined。
     * 1. new.target == NewFunc 
     * 根据构造函数的执行过程，this 对象的 __proto__ 指向了 NewFunc 的 protoype，所以如果是 new 操作，那么 this 对象一定是符合 instanceof 运算符
     * 2. this instanceof NewFunc / this.constructor == NewFunc
     */
    const isNew = new.target == NewFunc;
    const args = bindArgs.concat(Array.from(arguments));
    if (!isNew) return self.apply(thisObj, args);

    let newObj = Object.create(NewFunc.prototype); //或者 new Function(`return new xx(args list)`)
    self.apply(newObj, args);
    return newObj; // 如果函数作为构造函数调用，内部没有return 或者return 非对象引用类型，调用方拿到的都是 this value, 否则调用放拿到的就是 return 的对象
  }
  //保证正确的继承链
  NewFunc.prototype = self.prototype;
  return NewFunc;
}

function hello(name, description) {
  console.log("age", this.age, "name", name, "description", description);
}
function Persion(age) {
  this.name2 = "panyile";
  this.action = "fuck";
  this.age = age;
}

const FakePerison = Persion._bind(null);
const a = new FakePerison(15);
const b = new Persion(15);

console.log(a instanceof Pers);