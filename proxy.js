function Annotation(templateData) {
  var s = templateData.raw[0];
  console.log("".padStart(4, "=") + s + "".padEnd(4, "="));
}
Annotation`实现操作的链式调用,最终用get调用`
var pipe = (function () {
  return function (value) {
    var funcStack = [];
    var oproxy = new Proxy({}, {
      get: function (pipeObject, fnName) {
        if (fnName in Reflect.ownKeys(pipeObject)) {
          if (typeof pipeObject[fnName] == "function") return pipeObject[fnName].bind(pipeObject);
          return Reflect.get(pipeObject, fnName);
        }
        if (fnName == 'get') {
          return funcStack.reduce(function (val, fn) {
            return fn(val);
          }, value);
        }
        funcStack.push(global[fnName]);
        return oproxy;
      }
    });
    return oproxy;
  }
}());

double = n => n * 2;
pow = n => n * n;
reverseInt = n => n.toString().split("").reverse().join("") | 0;
console.log(pipe(3).double.pow.reverseInt.get);

Annotation`apply()`
var target = function () { return 'I am the target'; };
var handler = {
  apply: function () {
    return 'I am the proxy';
  }
}
var p = new Proxy(target, handler);
console.log(p());

Annotation`has`
var handler = {
  has(target, key) {
    if (key[0] === "_") return false;
    return key in target;
  }
}
var target = { _prop: 'foo', prop: 'foo' };
var proxy = new Proxy(target, handler);
console.log('_proxy' in proxy);

Annotation`has preventExtensions(obj)`
try {
  var obj = { a: 10 };
  Object.preventExtensions(obj);
  var p = new Proxy(obj, {
    has: function (target, prop) {
      return false;
    }
  })
  console.log('a' in p);//TypeError is thrown
} catch (err) {
  console.error(err.message);
}
Annotation`defineProperty`
var handler = {
  defineProperty(target, key, descriptor) {
    return false;
  }
}
try {
  var target = {};
  var proxy = new Proxy(target, handler);
  proxy.foo = 'bar'; //没有报错，只是添加不上去
  console.log(proxy)
} catch (err) {
  console.error(err.message);
}
Annotation`ownKeys autoFilter`
var target = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.for('secret')]: '4',
}
Object.defineProperty(target, 'key', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: 'static'
});
var handler = {
  ownKeys(target) {
    return ['a', 'd', Symbol.for('secret'), 'key'];
  }
}
var proxy = new Proxy(target, handler);
console.log(Object.keys(proxy));

Annotation`Proxy.revocable()访问一次代理权取消`
var target = {};
var handler = {};
var { proxy, revoke } = Proxy.revocable(target, handler);
proxy.foo = 123;
console.log(proxy.foo);
revoke();
try {
  proxy.foo //TypeError: Revoked
} catch (err) {
  console.error(err.message);
}

Annotation`this问题`
var _name = new WeakMap();
class Person {
  constructor(name) {
    _name.set(this, name);
  }
  get name() {
    return _name.get(this);
  }
}
var jane = new Person('Jane');
console.log(jane.name);//Jane
var proxy = new Proxy(jane, {});
console.log(proxy.name);//undefined

Annotation`this绑定原始对象`
var target = new Date('2015-01-01');
var handler = {
  get(target, prop) {
    if (prop === 'getDate') return target.getDate.bind(target);
    return Reflect.get(target, prop);
  }
}
var proxy = new Proxy(target, handler);
console.log(proxy.getDate());