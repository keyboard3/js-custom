[![webpack](http://webpack.github.com/assets/logo.png)](http://webpack.github.com)

[documentation](https://github.com/webpack/docs/wiki)

# Introduction

webpack 是一个模块打包器。主要目的是捆绑 javascript 文件以在浏览器中使用。

**TL;DR**

- 打包 [CommonJs](http://www.commonjs.org/specs/modules/1.0/), [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) and/or [Labeled Modules](https://github.com/labeledmodules/labeled-modules-spec/wiki) 模块. (even combined)
- 可以创建单个包或一堆按需加载的块，以减少初始加载时间。
- 编译时解析依赖关系，这使得运行时非常小
- loader 可以在编译时预处理文件，i. e. coffee-script 到 javascript

Check the [documentation](https://github.com/webpack/docs/wiki) if you want to know more...

# Examples

Take a look at the `examples` folder.

# Features

- loaders 是链式的
- loaders 可以在 node.js 运行且可以做一堆东西
- 使用内容散列命名文件的选项
- watch 模式
- 插件系统，扩展 webpack 或构建一个完全不同的 Compiler
- 接口
- 带参数的 CLI
- 带有配置文件的 CLI，仍然可以使用参数
- 可用作 node.js 的库
- 可用作 grunt 插件
- 浏览器替代品
- 一些 node.js 模块的浏览器替代品

* see also
* [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware)
* [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
* [enhanced-resolve](https://github.com/webpack/enhanced-resolve) and
* [enhanced-require](https://github.com/webpack/enhanced-require)

## 一个小例子，什么是可能的

```javascript
var commonjs = require("./commonjs");
require: "./labeled";
define(["amd-module", "./file"], function(amdModule, file) {
	require(["big-module/big/file"], function(big) {
		// AMD require 作为分割点
		// 并且“big-module/big/file”仅在请求时下载
		var stuff = require("../my/stuff");
		// 依赖项也会自动分块
	});
});

require("coffee!./cup.coffee");
/*
loader 语法允许为常见的东西处理文件，你可以将 RegExps 绑定到loader
如果您还将“.coffee”添加到默认扩展名
你可以这么写：
*/
require("./cup");

function loadTemplate(name) {
	return require("./templates/" + name ".jade");
	/*
	编译时支持动态要求我们找出可以在这里请求的内容“./templates”中与 /^.*\.jade$/ 匹配的所有内容
	(也可以在子目录中)
	*/
}

require("imports?_=underscore!../loaders/my-ejs-loader!./template.html");
// 你可以使用 loader 链
// 您可以使用查询参数配置 loader 并且 loader 的解析类似模块

// ...you can combine everything
function loadTemplateAsync(name, callback) {
	require(["bundle?lazy!./templates/" + name + ".jade"], function(templateBundle) {
		templateBundle(callback);
	});
}
```

## Tests

您可以使用 `npm test` 运行单元测试. [![build status](https://secure.travis-ci.org/webpack/webpack.png)](http://travis-ci.org/webpack/webpack)

您可以运行浏览器测试：

```
cd test/browsertests
node build
```

and open `tests.html` in browser.

## Contribution

欢迎您通过编写问题或拉取请求来做出贡献。
如果您开源自己的加载程序或 web 模块，那就太好了。 :)

也欢迎您纠正任何拼写错误或任何语言问题，因为我的英语并不完美...

## License

Copyright (c) 2012-2013 Tobias Koppers

MIT (http://www.opensource.org/licenses/mit-license.php)

## Dependencies

- [esprima](http://esprima.org/)
- [enhanced-resolve](https://github.com/webpack/enhanced-resolve)
- [uglify-js](https://github.com/mishoo/UglifyJS)
- [mocha](https://github.com/visionmedia/mocha)
- [should](https://github.com/visionmedia/should.js)
- [optimist](https://github.com/substack/node-optimist)
- [async](https://github.com/caolan/async)
- [mkdirp](http://esprima.org/)
- [clone](https://github.com/pvorb/node-clone)

[![Dependency Status](https://david-dm.org/webpack/webpack.png)](https://david-dm.org/webpack/webpack)

## 作者 [Next steps for 0.9](https://github.com/webpack/webpack/issues/41) 思考

### 问题

Webpack 变得比最初设计的更大（就像许多其他不断发展的项目一样；）），并且当前的设计不再适合计划的功能......

因此，重要的一步必须是对更好的设计进行大的重构！

这也会导致 API 更改，因为当前的 API 在某些方面很奇怪，并且许多选项没有逻辑命名/排序/分类。 （我将提供一个已弃用的向后兼容 API，将警告作为迁移提示）

很酷，我们有很多测试，以便我们可以测试新设计。我将在 0.9 中仅添加一些新功能，但我将为源映射和热代码替换准备设计。如果我们能和 enhanced-require 共享更多的代码就好了。

我将把一些东西从 enhanced-resolve 中移出，以保持这个库的可重用性。

这个（API）的东西很奇怪，会被改变：

- 为什么 resolve 对象中有 loader 选项？
- postprocess 很奇怪。 OO-解决方案：扩展工厂类。
- 为什么选项对象中有这么多选项？让它更有条理。
  和这个（内部）的东西：
- 解析不是（好）可扩展的，不可重用的和糟糕的代码。
- 扩展输出源很奇怪
- 复杂的模块间优化很困难

### 设计现状：

webpack 功能将保持向后兼容。

有新的公共 Compiler 类封装了整个过程。它提供了方便的方法 run 和 watch。

Compiler 为每次运行创建一个 Compilation 实例。它构建依赖树并将其拆分为块和其他资产。它提供了方法 process(context: String, entry: Dependency, callback) 和 getStats()。它还提供对属性条目的访问： Module chunks: Chunk[] modules: Module[] assets: Object<String, String | Buffer>。

Dependency 类层次结构当前具有子类 ModuleDependency（源中每种外观类型的子类，即 CommonJsRequireDependency、AMDRequireDependency 等）和 ContextDependency（也有子类）。

在 Compilation 中，您可以将 Dependency 类映射到 ModuleFactory 和 DependencyTemplate。 ModuleFactory 通过解析从依赖项创建模块。一旦模块具有 id，DependencyTemplate 指定依赖项的输出源。 Compiler 为映射进行设置。

一些类继承自 Tapable 接口，这意味着它们提供了用于扩展的插件接口。当前类 Compiler、Compilation 和 Parser。 IE。解析器很愚蠢，只是询问插件是否要对静态分析的方法进行方法调用。

所以 Compiler 创建一个 Parser 并将静态分析的方法映射到返回 Dependencys 的函数。

Compilation 要求插件优化块。 Compiler 添加了一些基本插件，用于删除父模块中引用的模块并删除空块。当前的 maxChunks 选项将产生一个合并模块的插件。 （这里是整合待办事项列表上的一些东西的好地方，比如剩余的块）

MainTemplate、ChunkTemplate 和 ModuleTemplate 将进行输出，因此您可以将它们子类化以提供自己的东西。 （SingleMainTemplate、JsonpMainTemplate、JsonpChunkTemplate、FunctionModuleTemplate、EvalDevToolModuleTemplateDecorator 由 Compiler 提供和设置）。模板还可以提供插件接口来扩展它们。

此外，node.js / IO 特定的东西在类 NodeCompiler、NodeFileEmitter、NodeResolver 和 NodeSubProcessExecutor 中。我希望有人会实现一个 NodeThreadsAGoGoExecutor 😄 。那会好很多。

还有更多的东西，这只是一个概述。任何意见？任何应该可以扩展的东西？

### loader 是最好的东西:) 并且会留下来。

我想我会在没有 loader 的情况下发布 webpack，你必须安装你需要的每个 loader ......所以它保持更轻量级。

webpack 的标准用法将是（和以前一样）webpack 方法：

```js
webpack(
  {
    context: __dirname,
    entry: "./file.js",
    output: {
      path: path.join(__dirname, "public"),
      filename: "mybundle.js",
    },
  },
  function (err, stats) {
    if (err) throw err;
    console.log(
      stats.toString({
        colors: true,
      })
    );
  }
);
```

选项已被重构。有一个插件接口，所以我希望很多东西都可以移动到插件中。 （在 options.plugins 中）

解析后更改路径的示例插件：

```js
function MyPlugin() {}
module.exports = MyPlugin;
MyPlugin.prototype.apply = function (compiler) {
  compiler.resolver.plugin("module-resolved", function (result, callback) {
    callback(null, result.replace(/x/g, "y"));
  });
};
```

```js
var MyPlugin = require("./myPlugin.js");
webpack(
  {
    // ...
    plugins: [new MyPlugin()],
  },
  callback
);
```

另一种（更高级的）方式是 Compiler API，由 webpack 方法内部使用：（我对此还不满意，但这是目前的状态）

```js
var c = new Compiler();
c.context = __dirname;
c.entry = new SingleEntryDependency("./file.js");
// or: new SingleEntryPlugin(__dirname, "./file.js").apply(c);
c.options.output = {
  path: path.join(__dirname, "public"),
  filename: "mybundle.js",
};
// or: new OutputLocationPlugin(path.join(__dirname, "public"), "mybundle.js").apply(c);
new NodeEnvironmentPlugin().apply(c);
new JsonpTemplatePlugin().apply(c);
new FunctionModulePlugin().apply(c);
new EvalDevToolModulePlugin().apply(c);
new MyPlugin().apply(c);
c.run(function (err, stats) {
  // ...
});
```

插件系统的意图是一个库可以提供一个插件来进行配置......即。一个将扩展绑定到正确 loader 的 jade 插件。用户只需要使用插件。 （也许与 --use jade-plugin 一起使用）

### Compiler 接口

```js
var compiler = new Compiler();
// <- Attach plugins to the compiler
// Choose one of "run", "watch" oder "compile"
compiler.compile(function (err, compilation) {
  /* ... */
}); // 编译并返回一个 compilation
compiler.run(function (err, stats) {
  /* ... */
}); // 编译并写入文件
compiler.watch(function (err, stats) {
  /* ... */
}); // like run,但在变化时重新运行
```

至少你必须附加这个插件：

- 一个环境插件，i.e NodeEnvironment
- 输出格式插件，i.e. JsonpTemplatePlugin 和 FunctionModulePlugin
- entry 插件，i.e SingleEntryPlugin

更好的是，如果您附加一个 require 样式的插件，i. e. CommonJsPlugin ;)

一些插件需要选项。

例子：

```js
var compiler = new Compiler();
var context = __dirname; // root for resolving entry and shortening stuff
var plugins = [
  new NodeEnvironmentPlugin(outputPath, resolveOptions),
  new JsonpTemplatePlugin({ filename: "bundle.js" }),
  new FunctionModulePlugin(context),
  new SingleEntryPlugin(context, "./entry.js"),
  new CommonJsPlugin(),
];
plugins.forEach(function (p) {
  p.apply(compiler);
});
compiler.run(function (err, stats) {
  if (err) return console.error(err);
  console.log(stats.toString({ colors: true }));
});
```
这将是一个非常基本的构建。

webpack 函数是一个助手，它通过传递的选项对象决定附加哪些插件。

## [beta 0.9 公告](https://github.com/webpack/webpack/issues/60)
0.8 -> 0.9 是一次重大的重构。

测试版现在在 master 分支上。

webpack 现在有一个带有插件系统的 OO 设计。基本功能也组织为插件。

新功能：
- 插件
- 更好的上下文检测
- 多个入口点 -> 具有共享块的多个包
- require.context 有更多参数 [另一个对 require.context(./somedir) 的请求](https://github.com/webpack/webpack/issues/38)
- CLI 在当前目录中加载 webpack.config.js
- 更多 CLI 选项
- 删除了默认 loader

变动：
- 配置对象更改
- 简化接口 webpack(options, callback)
- 每个 loader 都必须显式绑定。 webpack 中不包含任何内容。更模块化！
- ...

已完成的待办事项：
- watch mode
- 多入口点 [将多个入口点添加到一个包中 #15](https://github.com/webpack/webpack/issues/15)
- 配置自动上下文 RegExps[关闭动态解析require #59](https://github.com/webpack/webpack/issues/59)
- 文档 [增强 webpack 演示 #51](https://github.com/webpack/webpack/issues/51)[文档](https://github.com/webpack/webpack/issues/56)
- enhanced-require
- graph/tools
