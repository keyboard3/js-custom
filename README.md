# js-custom

- [简易栈机虚拟机实现](./virtual-stack.ts)
- [TypeScript](./typescript): `官方案例实践`
  - [面向 js 开发](./typescript/for-js-programmer.ts)
  - [面向 java/c# 开发](./typescript/for-java-csharp-programmer.ts)
- [Babel](./babel): `官方案例实践, 支持 make 动态构建`
  - [多种方式应用配置](./babel/config.mjs)
  - [箭头函数示例及说明](./babel/arrowFun.js)
  - [Symbol 示例及说明](./babel/symbol.js)
  - [let/const 示例及说明](./babel/letConst.js)
  - [对象及数组解构示例及说明](./babel/destructuring.js)
  - [函数参数的 default/rest/spread 示例及说明](./babel/defaultRestSpread.js)
  - [迭代器和 for of 示例及说明](./babel/iteratorsForOf.js)
  - [函数生成器示例及说明](./babel/generator.js)
  - [promise 示例及说明](./babel/promise.js)
  - [asyncAwait 示例及说明](./babel/asyncAwait.js)
  - [class 示例及说明](./babel/class.js)
  - [对象字面量示例及说明](./babel/objectLiterals.js)
  - [尾调用说明](./babel/tailCall.js): babel 示例中还是依赖了引擎的实现，但是目前就 safari(JavascriptCore)支持，实际上鸡肋。感觉可以通过识别无局部变量声明，且最后语句调用自身就可以认为是尾调用则接管掉函数，由中间的优化函数来触发，具体可见"es6 标准入门"中 [tco 实现](../es6/tail-call-one.mjs)
- [promise](./promise.js)
  - 相关文档
    - [使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
    - [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
    - [JS promise 基础](https://medium.com/@ramsunvtech/promises-of-promise-part-1-53f769245a53)
    - [JS Promise 实现库](https://medium.com/@ramsunvtech/js-promise-part-2-q-js-when-js-and-rsvp-js-af596232525c)
    - [Promise/A+标准](https://promisesaplus.com/#notes)
  - 跑 Promise/A+测试用例 872 项 `npm run promise`
- es6 标准入门示例
  - [尾调用优化实现](./es6/tail-call-one.mjs)
  - [简易模板编译实现](./es6/template-compile.mjs)
  - [tag 模板字符串实践](./es6/tagged-template.mjs)
  - [proxy 实践](./es6/proxy.mjs)
  - [async-await 的函数生成器简易实现](./es6/async.mjs)
  - [iterator 可迭代接口的实践](./es6/iterator.mjs)
  - [Generator feature 实践](./es6/generator.mjs)
  - [Class 的实践](./es6/class.mjs)
  - [module 模块加载实践](./es6/module.mjs)
  - [decorator 实践](./es6/decorator.js)
  - [ArrayBuffer 实践](./es6/array-buffer.mjs)
