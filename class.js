function Annotation(templateData) {
    var s = templateData.raw[0];
    console.log("".padStart(4, "=") + s + "".padEnd(4, "="));
}

Annotation`类的数据类型就是 函数，类本身指向构造函数`
class Point {
}
console.log(typeof Point);
console.log(Point === Point.prototype.constructor);
console.log((new Point()).constructor == Point.prototype.constructor)
Annotation`一次性向类添加多个方法`
Object.assign(Point.prototype, {
    toString() { },
    ["toValue"]() { }
})
const pointA = new Point();
console.log(pointA.toString, pointA.toValue);
Annotation`类的所有定义方法都是不可枚举的`
class Point1 { toString() { } }
console.log(Object.keys(Point1.prototype));//返回自身可枚举的属性的数组
console.log(Object.getOwnPropertyNames(Point1.prototype));//返回自身包括不可枚举的属性名的数组(不包括symbol)
Annotation`取值函数和存值函数都在prototype上`
class MyClass {
    get prop() { return 'getter' };
    set prop(value) { console.log('setter:' + value) };
}
console.log(Reflect.getOwnPropertyDescriptor(MyClass.prototype, "prop"))
Annotation`立即执行class表达式`
var person = new class { constructor(name) { this.name = name } }('张三');
console.log(person.name);
Annotation`使用Proxy获取方法的时候自动绑定this`
class Logger {
    printName(name = "there") {
        this.print(`Hello ${name}`);
    }
    print(text) {
        console.log(text);
    }
}
function selfish(target) {
    const cache = new WeakMap();
    const handler = {
        get(target, key) {
            const value = Reflect.get(target, key);
            if (typeof value !== 'function') return value;
            if (!cache.has(value)) {
                cache.set(value, value.bind(target));
            }
            return cache.get(value);
        }
    }
    const proxy = new Proxy(target, handler);
    return proxy;
}
selfish(new Logger()).printName()

Annotation`静态方法this指向的是类，可以非静态方法重名`
class Foo {
    static bar() {
        this.baz();
    }
    static baz() {
        console.log('hello');
    }
    baz() {
        console.log('world');
    }
}
Foo.bar();
Annotation`静态方法可以被子类继承调用`
class Foo2 {
    static age = 100;
    static classMethod() {
        return 'hello' + this.age;
    }
}

class Bar extends Foo2 {
    static classMethod() {
        return console.log(super.classMethod() + ', too');
    }
}

Bar.classMethod() // "hello, too"

Annotation`私有属性`
class IncreasingCounter {
    #count = 0;
    get value() {
        console.log('Getting the current value!');
        return this.#count;
    }
    increment() {
        this.#count++;
    }
}
const counter = new IncreasingCounter();
// counter.#count // 语法错误
counter.increment();
console.log(counter.value);

Annotation`私有属性可以在类的内部引用`
class Foo3 {
    #privateValue = 42;
    static getPrivateValue(foo) {
        return foo.#privateValue;
    }
}

console.log(Foo3.getPrivateValue(new Foo3()));

Annotation`使用new.target来判断调用者是不是通过new或者Reflect.construct调用`
function Person(name) {
    if (new.target !== undefined) {
        this.name = name;
    } else {
        throw new Error('必须使用 new 命令生成实例');
    }
}
try {
    var person = new Person('张三'); // 正确
    console.log(person);
    var notAPerson = Person.call(person, '张三');  // 报错
    console.log(notAPerson);
} catch (err) {
    console.error(err.message);
}

Annotation`设计出父类只能被继承，不能被实例化的类`
class Shape {
    constructor() {
        if (new.target === Shape) {
            throw new Error('本类不能实例化');
        }
    }
}

class Rectangle extends Shape {
    constructor(length, width) {
        super();
        // ...
    }
}

try {
    var y = new Rectangle(3, 4);  // 正确
    console.log(y);
    var x = new Shape();  // 报错
} catch (err) {
    console.error(err.message);
}

Annotation`类的继承`
class PointNew {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class ColorPoint extends PointNew {
    constructor(x, y, color) {
        super(x, y); // 调用父类的constructor(x, y)
        this.color = color;
    }

    toString() {
        return this.color + ' ' + super.toString(); // 调用父类的toString()
    }
}
var colorPoint1 = new ColorPoint();
console.log(colorPoint1 instanceof ColorPoint, colorPoint1 instanceof PointNew)
Annotation`静态类继承`
class A {
    constructor() {
        this.x = 1;
    }
    static print() {
        console.log(this.x);
    }
}

class B extends A {
    constructor() {
        super();
        this.x = 2;
    }
    static m() {
        super.print();
    }
}

B.x = 3;
B.m() // 3

Annotation`class的__proto__和prototype`
/**
 * 类作为一个对象，子类的原型是父类[构造函数继承]
 * 类作为一个构造函数，子类的prototype是父类的prototype的实例 [方法继承]
 * C.__proto__->B.__proto__->A.__proto__->()
 * 
 * c1.__proto__
 * C.prototype [B]
 *    constructor: class C
 *     __proto__: [A] =>B.prototype
 *          constructor: class B
 *          __proto__: Object =>A.prototype
 *              constructor: class A
 *              __proto__: Object
 */
class A1 {
}
class B1 extends A1 {
}
var b1 = new B1();
console.log("构造函数的继承：",Reflect.getPrototypeOf(b1), B1.__proto__ === A1) // true
console.log("方法的继承：", B1.prototype.__proto__ === A1.prototype)

Annotation`类的继承实现`
function A2() { }
function B2() { }
Reflect.setPrototypeOf(B2.prototype, A2.prototype);
Reflect.setPrototypeOf(B2, A2);
var b2 = new B2();
console.log("构造函数的继承：", B2.__proto__ === A2) // true
console.log("方法的继承：", B2.prototype.__proto__ === A2.prototype)

Annotation`将多个类混入另一个类`
function mix(...mixins) {
    class Mix {
        constructor() {
            for (let mixin of mixins) {
                copyProperties(this, new mixin()); // 拷贝实例属性
            }
        }
    }

    for (let mixin of mixins) {
        copyProperties(Mix, mixin); // 拷贝静态属性
        copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
    }

    return Mix;
}

function copyProperties(target, source) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== 'constructor'
            && key !== 'prototype'
            && key !== 'name'
        ) {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}
class Loggable {
    log() { }
}
class Serializable {
    serial() { }
}
class DistributedEdit extends mix(Loggable, Serializable) {
    // ...
}
var distributed = new DistributedEdit();
console.log(distributed instanceof DistributedEdit, distributed instanceof Loggable)