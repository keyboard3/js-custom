//HTML5 规范定义了结构化拷贝 structuredClone https://developer.mozilla.org/zh-CN/docs/Web/API/structuredClone

//WeakMap拷贝过程结束之后, 新对象和旧对象完全隔离，新对象在无人引用可以被垃圾回收掉
function deepClone(value, map = new WeakMap()) {
  //基础类型除了 object 之外(包括 null 对象) 值在 number,bool,undefined,string虚拟机中都是常量
  //symobl 全局唯一
  //function 对象存在闭包引用，本身也无法被拷贝
  if (typeof value !== 'object' || value === null) return value;

  //ES 规范中的构造函数prototype(Number,Date,Regex等)的属性都被定义 [[Enumerable]]: false, 除了 new Object(val)返回val自身之外，其他的构造函数都会返回一个新对象
  if (Reflect.ownKeys(value).length == 0 && value.constructor.name != Object.name) {
    map.set(value, new Function(`return new ${value.constructor.name}(${value.valueOf()})`)());
  }
  //用于处理属性循环引用，共同引用的情况
  if (map.has(value)) return map.get(value);
  let newObj = undefined;
  if (Array.isArray(value)) {
    newObj = [];
    for (let key in value) {
      newObj[key] = deepClone(value[key]);
    }
  } else {
    //还原对象的继承关系及属性描述符
    newObj = Object.create(Object.getPrototypeOf(value), Object.getOwnPropertyDescriptors(value));
    //枚举出对象的所有属性，包括 symbol 类型的属性
    Reflect.ownKeys(value).forEach(key => newObj[key] = deepClone(value[key]))
  }
  map.set(value, newObj);
  return newObj
}

let obj1 = {
  Age: new Number(29),
  age: 29,
  name: 'keyboard3',
  boolean: true,
  empty: undefined,
  nul: null,
  obj: { name: 'keyboard3', github: 'https://github.com/keyboard3' },
  array: [0, 1, 2, "124"],
  func: () => console.log('keyboard3:', obj1),
  date: new Date(100),
  regx: new RegExp('/keyboard3.com/ig'),
  [Symbol('keyboard3')]: 'Welcome follow keyboard3!',
};
let obj2 = deepClone(obj1, new WeakMap());

console.log(obj1 == obj2);
obj1.age = 24;
obj2.customFn();