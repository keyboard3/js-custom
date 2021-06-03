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
for (var prop in obj) {
    if (Reflect.hasOwnProperty(obj, prop)) console.log('ownProperty', prop)
    else console.log('super', prop);
}
Annotation`遍历Array,Set,Map的entries`
for (var item of [1, 2].entries()) {
    console.log(item);
}
for (var item of new Set([1, 2]).entries()) {
    console.log(item);
}
for (var item of new Map([["first", 1], ["sencod", 2]]).entries()) {
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

Annotation`异步遍历器`
function createAsyncIterable(array) {
    return {
        [Symbol.asyncIterator]() {
            return {
                next() {
                    return new Promise(function (resolve, reject) {
                        setTimeout(() => {
                            let item = array.pop();
                            resolve({ value: item, done: !item });
                        }, 1000);
                    });
                }
            };
        }
    }
}
async function awaitF() {
    const asyncIterable = createAsyncIterable(['a', 'b']);
    const asyncIterator = asyncIterable[Symbol.asyncIterator]();

    console.log('await next', await asyncIterator.next());
    console.log('await next', await asyncIterator.next());
    console.log('await next', await asyncIterator.next());
}
awaitF();

Annotation`for await ...of 异步遍历`;
for await (const x of createAsyncIterable(['1', '2'])) {
    console.log('异步遍历', x);
}
Annotation`for await of 同步遍历`;
(async function () {
    for await (const x of ['a', 'b']) {
        console.log('同步遍历', x);
    }
})();

Annotation`异步遍历读文件`
import path from "path";
import fs from "fs";
async function main(inputFilePath) {
    const readStream = fs.createReadStream(
        inputFilePath,
        { encoding: 'utf8', highWaterMark: 1024 }
    );

    for await (const chunk of readStream) {
        console.log('>>> ' + chunk);
    }
    console.log('### DONE ###');
}
main(path.resolve("./resource/hello.txt"));

Annotation`异步Generator函数`
async function* gen() {
    yield 'hello';
}
for await (const item of gen()) {
    console.log("异步Generator", item);
}

Annotation`同步遍历Generator函数`
var map = function* (iterable, func) {
    const iter = iterable[Symbol.iterator]();
    while (true) {
        const { value, done } = iter.next();
        if (done) break;
        yield func(value);
    }
}
var handle = (value) => {
    return value * 2;
}
for (let item of map([1, 2], handle)) {
    console.log("同步遍历Generator函数", item);
}
Annotation`异步遍历Generator函数`
var map = async function* (iterable, func) {
    const iter = iterable[Symbol.asyncIterator]();
    while (true) {
        const { value, done } = await iter.next();
        if (done) break;
        yield func(value);
    }
}
var handle = (value) => {
    return "****" + value + "****";
}
for await (var item of map(createAsyncIterable(['a', 'b']), handle)) {
    console.log("异步遍历Generator函数", item);
}

Annotation`异步readLine函数`
async function fileOpen(path) {
    return {
        EOF: false,
        count: 3,
        async readLine() {
            this.count--;
            if (this.count <= 0) {
                this.EOF = true;
                return "";
            }
            return `count${this.count}`
        },
        async close() {
            this.EOF = false;
            this.count = 3;
        }
    }
}
async function* readLines(path) {
    let file = await fileOpen(path);
    try {
        while (!file.EOF) {
            yield await file.readLine();
        }
    } finally {
        await file.close();
    }
}
for await (const line of readLines("")) {
    console.log(line);
}
Annotation`附加>`
async function* prefixLines(asyncIterable) {
    for await (const line of asyncIterable) {
        yield '> ' + line;
    }
}
for await (const line of prefixLines(readLines(""))) {
    console.log(line);
}

Annotation`异步函数执行器`
async function takeAsync(asyncIterable, count = Infinity) {
    const result = [];
    for await (var item of asyncIterable) {
        result.push(item)
    }
    // const iterator = asyncIterable[Symbol.asyncIterator]();
    // while (result.length < count) {
    //     const { value, done } = await iterator.next();
    //     if (done) break;
    //     result.push(value);
    // }
    return result;
}
async function f() {
    async function* gen() {
        yield 'a';
        yield 'b';
        yield 'c';
    }

    return await takeAsync(gen());
}
console.log(await f())

Annotation`yield* 异步遍历器`
async function* gen1() {
    yield 'a';
    yield 'b';
    return 2;
}

async function* gen2() {
    // result 最终会等于 2
    const result = yield* gen1();
}
for await (const x of gen2()) {
    console.log(x);
}