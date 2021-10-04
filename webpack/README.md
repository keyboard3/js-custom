# Webpack

## init Commit 0.1 版本

- 通过解析文件 AST 的 require 及 require.esure 建立了 modules 有向依赖图
- 通过 modules 依赖关系 建立 chunk 的 modules 以及 chunk 的继承关系
- 根据 chunk 的继承关系确认实际 chunk include 的模块，以及清理空 include 的 chunks
- 根据 chunks 来生成 chunk 文件，0 是入口 chunk(管理 modules 映射实体和 require ), 其他则是注入 chunk

## with loader 0.3 版本

- 初步 loader loader2.js!loader1.js!file.js ：最后产物 loader2 会转换成 js 内容，处理成 js 模块参与到 chunk 打包结果中
- 内置 loader 根据扩展名来，json,coffe 会帮他们拼接好上面的模块路由形式
- 有些外部模块如 json 和 coffee 这些会有导出，但是 style-loader 则不会导出，在引用模块的时候会向全局 document 上加 css 样式

## with plugin 0.9 版本
- webpack() 创建 compiler,并 run 来编译整个过程, 还可以 compile.watch 重复编译
- run 中会调用 compile 并创建新的 compilation 来管理这次的编译过程
- 开始 make, 消息丢给 SingleEntryPlugin
- SingleEntryPlugin 调用 compilation.addEntry
- addEntry 就开始递归:
  - moduleFactory.create 准备 loader 的 module 配置对象
  - buildModule 开始解析语法树构建模块及其依赖
  - 然后 processModuleDependencies 处理模块依赖，重复上面的步骤
- 处理完所有 Module 之后，开始创建入口的 chunk, 将入口 module 加入
- processDependenciesBlockForChunk 从入口 module 开始
  - 同步依赖递归添加到 chunk 上
  - 异步的 block 则创建新 chunk 然后递归这个过程
- 所有的 chunk 创建完毕之后，交给最后的封装过程 seal 去调用优化 chunk 的相关插件
  - optimize-chunk-assets 消息由 UglifyJsPlugin 监听，将 chunks 内容混淆压缩之后丢给 assets
  - ProgressPlugin 监听上面这个消息，更新进度到 0.8
- emitAssets 最后将编译产生的 assets 写到文件输出系统中
- 最后编译过程的统计信息 stats 通过 done 消息发送出去

## [Esprima](https://github.com/jquery/esprima) 1.0 README
**Esprima** 是一个高性能，符合 ECMAScript 标准的语法解析器，它使用 es 编写（总所周知的 javascript）. Esprima 由 [Ariya Hidayat](http://twitter.com/ariyahidayat) 创建并维护，同时还包括[其他贡献者](https://github.com/ariya/esprima/contributors).

Esprima 可以运行在浏览器 (IE 6+, Firefox 1+, Safari 3+, Chrome 1+, Konqueror 4.6+, Opera 8+) 和 Node.js 上

特性：
- 完全支持 [ECMAScript 5.1](http://www.ecma-international.org/publications/standards/Ecma-262.htm)(ECMA-262)
- 合理的[语法树格式](http://esprima.org/doc/index.html#ast)，与 Mozilla [Parser AST](https://developer.mozilla.org/en/SpiderMonkey/Parser_API) 兼容
- 大量的单元测试 (> 550 [unit tests](http://esprima.org/test/) 100% 的语句覆盖)
- 可选跟踪语法 node 的 location (基于行和列的索引)
- 对 ES6/Harmony 的实验支持 (module, class, destructuring, ...)
- Esprima 速度极快（请参阅 [基准套件](http://esprima.org/test/benchmarks.html)）
- 它比 UglifyJS v1 快 3 倍，并且仍然可以与新一代快速解析器[竞争](http://esprima.org/test/compare.html)
### 应用
Esprima 是许多流行的 JavaScript 开发工具的基础：
- 代码覆盖率分析: [node-cover](https://github.com/itay/node-cover), [Istanbul](https://github.com/yahoo/Istanbul)
- 文档工具: [JFDoc](https://github.com/thejohnfreeman/jfdoc), [JSDuck](https://github.com/senchalabs/jsduck)
- 语言扩展 [LLJS](http://mbebenita.github.com/LLJS/) (low-level JS)
- ES6/Harmony 转译器 [Six](https://github.com/matthewrobb/six), [Harmonizr](https://github.com/jdiamond/harmonizr)
- Eclipse Orion 智能编辑 ([大纲视图](https://github.com/aclement/esprima-outline), [内容辅助](http://contraptionsforprogramming.blogspot.com/2012/02/better-javascript-content-assist-in.html))
- 源码修改：[Esmorph](https://github.com/ariya/esmorph), [Code Painter](https://github.com/fawek/codepainter)
- 源转换: [node-falafel](https://github.com/substack/node-falafel), [Esmangle](https://github.com/Constellation/esmangle), [escodegen](https://github.com/Constellation/escodegen)

## UglifyJS v2 初始 README
[UglifyJS](https://github.com/mishoo/UglifyJS) 是一种流行的 JavaScript
解析器/压缩器/美化器，它本身是用 JavaScript 编写的。v1 经过实战测试并用于许多生产系统。
解析器是 [包含在 chromium 的 WebKit 中](http://src.chromium.org/multivm/trunk/webkit/Source/WebCore/inspector/front-end/UglifyJS/parse-js.js)。

两年内，UglifyJS 在 Github 上获得了超过 3000 颗星和数百个错误
由于一个伟大且不断扩大的社区，已经被识别和修复。

我会说 v1 非常稳定。但是，它的架构不能延伸得更远。一些功能很难添加，例如 sourcemap 或在压缩的 AST 中保留注释。
我从5月开始工作在 v2上，但我很快就放弃了，因为我没有时间。是什么促使我恢复它正在调查添加 sourcemap 的难度（一个
[越来越流行](https://github.com/mishoo/UglifyJS/issues/315)
功能要求）。

### 状态和目标
简而言之，v2 的目标是：
- 更好的模块化、更干净和更易于维护的代码； （✓ 已经更好了）
- 解析器为节点生成对象而不是数组； (✓ 完成)
- 在所有节点中存储位置信息； (✓ 完成)
- 更好的 scope 表示和管理器； (✓ 完成)
- 更好的代码生成器； (✓ 完成)
- 压缩选项至少与 v1 一样好； (⌛ 进行中)
- 支持生成 sourcemap
- 更好的回归测试； (⌛ 进行中)
- 保留特定注释的能力；
- 与 UglifyJS v1 兼容的命令行实用程序；
- AST 节点层次结构和 API 的文档。

长期目标——除了压缩 JavaScript：

- 提供一个检查工具 (开始)
- 以简单的 JSON 格式转储 AST 以及信息的功能，这可能对编辑器（例如 Emacs）有用；
- 为Emacs编写一个次要的JS模式来突出明显的错误，定位符号，定义或警告意外的全局变量；
- 支持像 Closure 那样的类型注释（虽然我正在考虑一个
  语法不同于注释；目前还没有大的计划）。

### 节点对象
v1 使用数组来表示 AST 节点。
该模型适用于大多数操作，但只能在节点中添加附加信息，完成了我不太喜欢的 hack（你_可以_将属性添加到数组，就好像它是一个对象，但这只是一个肮脏的 hack；还有这样的属性没有在压缩器中传播）。

在 v2 中，我转而采用更“面向对象”的方法。节点是对象，还有一个旨在在实践中有用的继承树。
例如在 v1 中为了查看节点是否为中止语句，我们可能会做这样的事情：
```js
if (node[0] == "return"
    || node[0] == "throw"
    || node[0] == "break"
    || node[0] == "continue") aborts();
```
在 v2 中，它们都继承自基类 `AST_Jump`，所以我可以说：
```js
if (node instanceof AST_Jump) aborts();
```

解析器被 `_heavily_` 修改为支持新的节点类型，但是你仍然可以找到与 v1 中相同的代码布局，我相信它稳定的。除了解析器，UglifyJS 的其他部分都重写了从头开始。

解析器本身变慢了（430ms 而不是我通常的 650K 上的 330ms
测试文件）。

### 关于 Esprima 的一句话

[Esprima](http://esprima.org/) 是一个非常好的 JavaScript 解析器。它
支持 EcmaScript 5.1，它声称“比 UglifyJS 快 3 倍” 解析js”。我认为这很酷，我考虑使用 Esprima，UglifyJS v2，但后来我做了一些测试。


在我的 650K 测试文件中，UglifyJS v1 的解析器需要 330 毫秒，而 Esprima 大约需要
250 毫秒。这并不完全是“快 3 倍”，但确实非常好！但是，我注意到在默认配置中 Esprima 不保留位置，节点中的信息。启用它，解析时间增加到 680 毫秒。

有些人会声称这是一个公平的[比较](http://esprima.org/test/compare.html)，因为 UglifyJS 没有保留位置信息，但这并不完全准确。它是真的，`parse()` 函数不会将位置传播到 AST 中，除非你设置了 `embed_tokens`，但词法分析器 _always_ 将它存储在令牌。

启用 `embed_tokens` 让 UglifyJS 在 400 毫秒内完成，这仍然很多比 Esprima 的 680ms 更好。

在 v2 中，我们始终在 AST 节点中维护位置信息和注释，
这就是为什么 v2 中的解析器在该文件上花费大约 430 毫秒（有些
毫秒会丢失，因为创建对象节点比创建 array 的工作更多）。我可能会尝试加快速度，尽管我不确定是否值得。 对于我来说 在 430 毫秒内解析 650K（在我相当过时的机器上）以获得
具有完整位置/范围信息和注释的客观 AST 似乎足够好。

...