function Annotation(templateData) {
    var s = templateData.raw[0];
    console.log("".padStart(4, "=") + s + "".padEnd(4, "="));
}
Annotation`给对象添加遍历接口`
var obj = {
    data: ['hello', 'world'],
    [Symbol.iterator]() {
        const self = this;
        let index = 0;
        return {
            next() {
                if (index < self.data.length) {
                    return {
                        value: self.data[index++],
                        done: false
                    };
                } else {
                    return { value: undefined, done: true };
                }
            }
        }
    }
}
for (item of obj) {
    console.log(item);
}

Annotation`给类似数组的对象添加遍历接口`
var iterable = {
    0: 'a',
    1: 'b',
    2: 'c',
    length: 3,
    [Symbol.iterator]: Array.prototype[Symbol.iterator],
}
for (item of iterable) {
    console.log(item);
}
Annotation`使用while循环遍历`
var it = iterable[Symbol.iterator]();
var result = it.next();
while (!result.done) {
    console.log(result.value);
    result = it.next();
}

Annotation`yield* 跟可遍历结构，会调用遍历器接口`
var generator = function* () {
    yield 1;
    yield* [2, 3, 4];
    yield 5;
}
var iterator = generator();
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());

Annotation`Generator函数实现iterator`
var obj = {
    *[Symbol.iterator]() {
        yield 'hello';
        yield 'world';
    }
}
for (item of obj) {
    console.log(item);
}

Annotation`遍历器对象return`
function readLineSync() {
    return {
        [Symbol.iterator]() {
            return {
                next() {
                    return { done: false, value: "看后面" };
                },
                return() {
                    console.log("close");
                    return { done: true };
                }
            }
        }
    }
}
for (var item of readLineSync()) {
    console.log(item);
    break;
}
Annotation`for in 遍历继承对象的属性`
var obj = Object.assign(Object.create({ a: 1 }), { b: 2 });
for (prop in obj) {
    if (Reflect.hasOwnProperty(obj, prop)) console.log('ownProperty', prop)
    else console.log('super', prop);
}
Annotation`遍历Array,Set,Map的entries`
for (item of [1, 2].entries()) {
    console.log(item);
}
for (item of new Set([1, 2]).entries()) {
    console.log(item);
}
for (item of new Map([["first", 1], ["sencod", 2]]).entries()) {
    console.log(item);
}
Annotation`正确是被32位的UTF-16字符`
for (item of 'a\uD83D\uDC0A') {
    console.log(item);
}
Annotation`用yield将对象重新包装成可迭代对象`
function* entries(obj) {
    for (let key of Reflect.ownKeys(obj)) {
        yield [key, obj[key]];
    }
}
for (let [key, value] of entries({ a: 1, b: 2, c: 3 })) {
    console.log(key, '->', value);
}