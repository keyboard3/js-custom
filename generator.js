function Annotation(templateData) {
    var s = templateData.raw[0];
    console.log("".padStart(4, "=") + s + "".padEnd(4, "="));
}

Annotation`flat偏平化数组`
var arr = [1, [[2, 3], 4], [5, 6]];
var flat = function* (a) {
    for (var item of a) {
        if (typeof item !== 'number') {
            yield* flat(item);
        } else {
            yield item;
        }
    }
};

for (var f of flat(arr)) {
    console.log(f);
}

Annotation`yield在表达式中需要在圆括号`
function* demo() {
    console.log('Hello1' + (yield 1));
    console.log('Hello2' + (yield 123));
}
var it = demo();
it.next();
it.next();
it.next();

Annotation`Generator直接赋给对象的遍历器函数`
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
    yield 1;
    yield 2;
    yield 3;
}
console.log([...myIterable]);

Annotation`循环生成器自己`
function* gen() {
    yield 1;
}
gen[Symbol.iterator] = gen;
console.log([...gen]);

Annotation`next方法的参数`
var fun = function* () {
    for (let i = 0; true; i++) {
        var reset = yield i;
        console.log("reset", i, reset);
    }
}
var g = fun();
console.log(g.next("走你"));
console.log(g.next("把结果丢给你，继续往下走1"));
console.log(g.next("把结果丢给你，继续往下走2"));

Annotation`第一次就能够调用，只是将含义做了调整，调用了wrapped就默认执行了第1步`
function wrapper(generatorFunction) {
    return function (...args) {
        let generatorObject = generatorFunction(...args);
        generatorObject.next();
        return generatorObject;
    }
}
const wrapped = wrapper(function* () {
    console.log(`First input:${yield}`);
    return 'DONE';
});
wrapped().next('hello!');

Annotation`return结果不被for of接受`
function* foo() {
    yield 1;
    yield 2;
    return 3;
}

for (let v of foo()) {
    console.log(v);
}

Annotation`实现斐波那契数列`
function* fibonacci() {
    let [prev, curr] = [0, 1];
    for (; ;) {
        yield curr;
        [prev, curr] = [curr, prev + curr];
    }
}

for (let n of fibonacci()) {
    if (n > 100) break;
    console.log(n);
}

Annotation`给对象加上for of循环`
function* ObjectEntries(obj) {
    let keys = Reflect.ownKeys(obj);
    for (let key of keys) {
        yield [key, obj[key]];
    }
}
for (let [key, value] of ObjectEntries({ first: 'Jane', last: 'Doe' })) {
    console.log(key, value);
}

Annotation`throw接住报错`
var g = function* () {
    try {
        yield;
    } catch (e) {
        console.log('内部捕获', e);
    }
};

var i = g();
i.next();

try {
    i.throw('a');
    i.throw('b');
} catch (e) {
    console.log('外部捕获', e);
}

Annotation`如果Generator内部执行过程报错，没有被内部捕获，就无法继续执行。继续next回得到done`
var fun = function* () {
    yield 1;
    console.log('throwing an exception');
    throw new Error('generator broke!');
    yield 2;
    yield 3;
}

function log(generator) {
    var v;
    console.log('starting generator');
    try {
        v = generator.next();
        console.log('第一次运行next方法', v);
    } catch (err) {
        console.log('捕捉错误', v);
    }
    try {
        v = generator.next();
        console.log('第二次运行next方法', v);
    } catch (err) {
        console.log('捕捉错误', v);
    }
    try {
        v = generator.next();
        console.log('第三次运行next方法', v);
    } catch (err) {
        console.log('捕捉错误', v);
    }
    console.log('caller done');
}

log(fun());

Annotation`协调return语句`
function* numbers() {
    yield 1;
    try {
        yield 2;
        yield 3;
    } finally {
        yield 4;
        yield 5;
    }
    yield 6;
}
var g = numbers();
console.log(g.next())// { value: 1, done: false }
console.log(g.next())// { value: 2, done: false }
console.log(g.return(7)) // { value: 4, done: false }
console.log(g.next())// { value: 5, done: false }
console.log(g.next())// { value: 7, done: true }

Annotation`yield* 调用Generator`
function* foo() {
    yield 'a';
    yield 'b';
}

function* bar() {
    yield 'x';
    yield* foo();
    yield 'y';
}

for (let v of bar()) {
    console.log(v);
}
Annotation`遍历完全二叉树`

// 下面是二叉树的构造函数，
// 三个参数分别是左树、当前节点和右树
function Tree(left, label, right) {
    this.left = left;
    this.label = label;
    this.right = right;
}

// 下面是中序（inorder）遍历函数。
// 由于返回的是一个遍历器，所以要用generator函数。
// 函数体内采用递归算法，所以左树和右树要用yield*遍历
function* inorder(t) {
    if (t) {
        yield* inorder(t.left);
        yield t.label;
        yield* inorder(t.right);
    }
}

// 下面生成二叉树
function make(array) {
    // 判断是否为叶节点
    if (array.length == 1) return new Tree(null, array[0], null);
    return new Tree(make(array[0]), array[1], make(array[2]));
}
let tree = make([[['a'], 'b', ['c']], 'd', [['e'], 'f', ['g']]]);

// 遍历二叉树
var result = [];
for (let node of inorder(tree)) {
    result.push(node);
}

console.log(result);


Annotation`拿到Generator的this对象`
var F = function* () {
    this.a = 1;
    yield this.b = 2;
    yield this.c = 3;
}
var obj = {};
var f = F.call(obj);
f.next();
f.next();
f.next();

console.log(obj);

Annotation`设计被new出的对象是一个迭代器对象`
var gen = function* () {
    this.a = 1;
    yield this.b = 2;
    yield this.c = 3;
}

var F = function () {
    return gen.call(gen.prototype);
}

var f = new F();

f.next();  // Object {value: 2, done: false}
f.next();  // Object {value: 3, done: false}
f.next();  // Object {value: undefined, done: true}
console.log(f, Reflect.getPrototypeOf(f));

Annotation`状态机`
var clock = function* () {
    while (true) {
        console.log('Tick!');
        yield;
        console.log('Tock!');
        yield;
    }
}

Annotation`同步执行异步操作`
var main = function* () {
    var result = yield request("http://some.url");
    var resp = JSON.parse(result);
    console.log(resp.value);
}
var it = main();
var request = function (url) {
    setTimeout(() => {
        it.next('{"value":"hello"}');
    }, 0);
}
it.next();