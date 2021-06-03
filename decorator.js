function Annotation(templateData) {
    var s = templateData.raw[0];
    console.log("".padStart(4, "=") + s + "".padEnd(4, "="));
}

Annotation`用来装饰整个类`
@testable
class MyTestableClass { }
function testable(target) {
    target.isTestable = true;
}
console.log(MyTestableClass.isTestable);

Annotation`用来接收多个参数`
function testableMuti(isTestable) {
    return function (target) {
        target.isTestable = isTestable;
    }
}
@testableMuti(true)
class MyTestableMutiClass { }
console.log(MyTestableMutiClass.isTestable);

Annotation`为类的原型添加方法`
function minxins(...list) {
    return function (target) {
        Object.assign(target.prototype, ...list);
    }
}
const Foo = {
    foo() { console.log('foo') }
}
@minxins(Foo)
class MyClass { }
let obj = new MyClass();
obj.foo();

Annotation`方法的装饰`
class Person {
    @readonly
    name() { return `${this.first} ${this.last}` }
}
function readonly(target, name, descriptor) {
    descriptor.writable = false;
    return descriptor;
}
var person = new Person();
try {
    person.name = "123";
} catch (err) {
    console.error(err.message);
}

Annotation`不可遍历`
class Person2 {
    @nonenumerable
    get kidCount() { return 2; }
}
function nonenumerable(target, name, descriptor) {
    descriptor.enumerable = false;
    return descriptor;
}
var person = new Person2();
console.log(person.kidCount, Reflect.ownKeys(person))

Annotation`输出日志`
class Math {
    @log
    add(a, b) {
        return a + b;
    }
}
function log(target, name, descriptor) {
    var oldValue = descriptor.value;

    descriptor.value = function () {
        console.log(`Calling ${name} with`, arguments);
        return oldValue.apply(this, arguments);
    };
    return descriptor;
}
const math = new Math();
math.add(2, 4);

Annotation`混入类`
class MyBaseClass { }
let MyMixin = (superclass) => class extends superclass {
    foo() {
        console.log('foo from MyMixin');
    }
};
class MyClass2 extends MyMixin(MyBaseClass) {
}
var myClass = new MyClass2();
myClass.foo();
