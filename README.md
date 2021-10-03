# js-custom
- [react](./react): `preact 的 breack change 实现的解读`
  - [preact 1 ](./react/preact_1): `最早单文件的优雅实现`
  - [preact 4](./react/preact_4): `代码重构拆分及性能优化`
  - [preact 10](./react/preact_10): `优化 diff 算法以及支持 hooks`
  - [react 1.3](./react_1.3): `最早的 react 版本`
- [webpack](./webpack)
  - [init commit 0.1](./webpack/init_commit): `浏览器模块核心打包过程, 多模块代码被单文件管理，构建模块映射对象，模块内的代码require从映射对象上找。异步就是通过jsonp将模块连接到这个全局映射对象上`
  - [with loader 0.3](./webpack/with_loader): `支持通过 loader 链来构建非 js 模块，也支持 json,coffe 扩展自动识别 loader`
  - [with plugin 0.9](./webpack/with_plugin): `重大重构，整个构建功能依赖 plugin 来扩展`
- [requirejs](./requirejs)
  - [init commit 版本](./webpack/init_commit): `与webpack自动包装异步模块，同样的逻辑。异步jsonp加载包含模块代码回调函数的执行结果给上下文`
- [TypeScript](./typescript): `官方案例实践`

  - [面向 js 开发](./typescript/for-js-programmer.ts)
  - [面向 java/c# 开发](./typescript/for-java-csharp-programmer.ts)
  - [基础类型](./typescript/basic-types.ts)
  - [日常类型](./typescript/everyday-types.ts)
  - [缩小类型](./typescript/narrowing.ts)
  - [函数细节](./typescript/functions.ts)
  - [对象类型](./typescript/objects.ts)
  - [类型操作](./type-manipulation)
    - [泛型](./type-manipulation-generics.ts)
    - [类型操作](./type-manipulation-other.ts):`keyof 类型操作符、typeof 类型操作符、索引访问操作符、条件类型、映射类型、模板字面量类型`
  - [模块](./typescript/modules/index.ts)
  - - [ ] 类
  - - [ ] 引用：`工具类型、装饰器，声明合并，枚举，迭代器和函数生成器、JSX，Mixins、模块、模块解析、命名空间、命名空间和模块、Symbols、三斜线指令、类型兼容、类型推理、变量声明`
      - [工具类型](./typescript/utility-types.ts): `除了ThisType以及字面量类型的操作工具类型，其他工具均用通过类型操作符自己实现了一份`
  - - [ ] 声明文件
      - [声明引用](./typescript/declaration/declaration-refrence.ts)
  - - [ ] 项目配置
- [Babel](./babel): `官方案例实践, 支持 make 动态构建`
  - [多种方式应用配置](./babel/es6-features/config.mjs)
  - [箭头函数示例及说明](./babel/es6-features/arrowFun.js)
  - [Symbol 示例及说明](./babel/es6-features/symbol.js)
  - [let/const 示例及说明](./babel/es6-features/letConst.js)
  - [对象及数组解构示例及说明](./babel/es6-features/destructuring.js)
  - [函数参数的 default/rest/spread 示例及说明](./babel/es6-features/defaultRestSpread.js)
  - [迭代器和 for of 示例及说明](./babel/es6-features/iteratorsForOf.js)
  - [函数生成器示例及说明](./babel/es6-features/generator.js)
  - [promise 示例及说明](./babel/es6-features/promise.js)
  - [asyncAwait 示例及说明](./babel/es6-features/asyncAwait.js)
  - [class 示例及说明](./babel/es6-features/class.js)
  - [对象字面量示例及说明](./babel/es6-features/objectLiterals.js)
  - [尾调用说明](./babel/es6-features/tailCall.js): babel 示例中还是依赖了引擎的实现，但是目前就 safari(JavascriptCore)支持，实际上鸡肋。感觉可以通过识别无局部变量声明，且最后语句调用自身就可以认为是尾调用则接管掉函数，由中间的优化函数来触发，具体可见"es6 标准入门"中 [tco 实现](../es6/tail-call-one.mjs)
- [其他](./other)
  - [promise](./other/promise.js)
  - [简易栈机虚拟机实现](./other/virtual-stack.ts)
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
