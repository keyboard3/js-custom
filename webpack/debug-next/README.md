# 前言
- 第一步
	- make install: `会在同项目级别获取 webpack 仓库源码`
	- make: `第一个指令 main, 会在当前项目中关联 webpack 仓库`
	- make v[number]: `指定 webpack 仓库 v1/v2/v3/v4/v5 版本，并初始化好 node_modules`
	- make 5.0.0-rc.6: `指定具体 webpack 仓库源码的 tagName，并初始化 node_modules`
- 第二步
	- 进入 .vscode/launch.json 调整你想要 debug 的 example
	- 在当前项目的 webpack 软连接文件夹浏览源码, 在自己感兴趣的位置加上断点
	- 然后开始 vscode 的 debug 模式, 以 example 为入口调试 webpack 仓库源码
# Examples
## Aggressive Merging
[aggressive-merging](aggressive-merging) 

## Chunk
[chunkhash](chunkhash)

[common-chunk-and-vendor-chunk](common-chunk-and-vendor-chunk)

[explicit-vendor-chunk](explicit-vendor-chunk)

[extra-async-chunk-advanced](extra-async-chunk-advanced)

[extra-async-chunk](extra-async-chunk)

[code-splitting-specify-chunk-name](code-splitting-specify-chunk-name)

[move-to-parent](move-to-parent)

[multiple-commons-chunks](multiple-commons-chunks)

[multiple-entry-points-commons-chunk-css-bundle](multiple-entry-points-commons-chunk-css-bundle)

[named-chunks](named-chunks) example demonstrating merging of chunks with named chunks

[two-explicit-vendor-chunks](two-explicit-vendor-chunks)

## Code Splitted
[code-splitted-css-bundle](code-splitted-css-bundle)

[code-splitted-require.context-amd](code-splitted-require.context-amd) example demonstrating contexts in a code-split environment with AMD.

- v0.9
```
示例演示了 AMD 代码拆分环境中的上下文。

- webpack() 启动 调用 new WebpackOptionsApply().process(options, compiler)
- compiler.apply(...new AMDPlugin(options.amd))
    - 注册 AMDRequireContextDependency-factory: contextModuleFactory
    - 注册 AMDRequireItemDependency-factory: normalModuleFactory
- new AMDRequireDependenciesBlockParserPlugin().apply(compiler.parser);
    - 监听语句 "call require" 调用, 遇到 2 个参数即 require(["../require.context/templates/"+templateName], function(tmpl) {..}
    - 执行参数 evaluateExpression(二元表达式+)，得到结果 "../require.context/templates/"
    - 创建异步 block AMDRequireDependenciesBlock 丢到当前主模块中
    - 创建依赖 AMDRequireContextDependency 丢入上面的异步 block 中
- Complication 解析完主模块(NormalModule), 然后解析 processModuleDependencies
    - addDependenciesBlock 会将异步 block 中的依赖都展开一起解析
    - dependencyFactories 读取到了 contextModuleFactory 获得了 contextModule 配置
    - 执行 module.build (contextModule), 执行 resolveDependencies
    - 会得到 module.dependencies 都是 AMDRequireItemDependency
    - 递归 normalModuleFactory 的产生 module 的过程
```

[code-splitted-require.context](code-splitted-require.context) example demonstrating contexts in a code-split environment.

## Code Splitting
[code-splitting](code-splitting) example demonstrating a very simple case of Code Splitting.

[code-splitting-bundle-loader](code-splitting-bundle-loader) example demonstrating Code Splitting through the builder loader

[code-splitting-harmony](code-splitting-harmony) 

[code-splitting-native-import-context](code-splitting-native-import-context) 

[code-splitting-specify-chunk-name](code-splitting-specify-chunk-name)

## Coffee Script
[coffee-script](coffee-script) example demonstrating code written in coffee-script.

## CommonJS
[commonjs](commonjs) example demonstrating a very simple program

## Css Bundle
[css-bundle](css-bundle)

[multiple-entry-points-commons-chunk-css-bundle](multiple-entry-points-commons-chunk-css-bundle)

## DLL
[dll](dll)

[dll-user](dll-user)

## Externals
[externals](externals)

## Harmony
[harmony](harmony)

[code-splitting-harmony](code-splitting-harmony)

[harmony-interop](harmony-interop)

[harmony-library](harmony-library)

[harmony-unused](harmony-unused)

## HTTP2 Aggressive Splitting
[http2-aggressive-splitting](http2-aggressive-splitting)

## Hybrid Routing
[hybrid-routing](hybrid-routing)

## i18n
[i18n](i18n) example demonstrating localization.

- v0.9
```
I18nPlugin
*  compiler.plugin "compilation": 常见一个新的 complication
*    给 complication.dependencyTemplates 添加 ConstDependency 类的模板处理方法，用来替换源码的
*  compiler.parser.plugin "call __": 监听如果调用 __()方法
*    "Hello World" 作为参数从 localization json 中获得映射值
*    添加 ConstDependency 到 module.dependencies 中。目的是将这个调用表达式替换成 i18n 映射之后的字符串
*  在 Compilation.createChunkAssets 构建产物 chunk js 文件内容
*  JSONMainTemplate.render -> FunctionModuleTemplate.render -> NormalModule.source
*    会调用 module.dependencies 并使用 complication.dependencyTemplates 中的模板来替换源码
```

## Loader
[loader](loader) example demonstrating the usage of loaders.

- v0.9
```
./loader!./file: 
 - ./loader
    Make -> complication.addEntry -> ModuleFactory.create -> resolveRequestArray ->  compiler.loader (enhanced-resolve/lib/Resolver) -> Resolver.resolve -> doResolve -> FileAppendPlugin: resolver.plugin “file” -> addr = request.path+request.request 得到真实的文件地址
 - ./file
    Make -> complication.addEntry -> ModuleFactory.create -> resolvers.normal.resolve (enhanced-resolve/lib/Resolver) -> Resolver.resolve -> doResolve -> FileAppendPlugin: resolver.plugin “file” -> addr = request.path+request.request 得到真实的文件地址
- NormalModule.build
    - NormalModuleMixin.doBuild
    - loadPitch: 将 loader 解析 require 成 func
    - nextloader() -> runSyncOrAsync
        - content = func(prevContent)
        - nextLoader(nextFun, content)
```
## Mixed
[mixed](mixed) example demonstrating mixing CommonJs and AMD

## Multi Compiler
[multi-compiler](multi-compiler)

## Multi Part Library
[multi-part-library](multi-part-library)

## Multiple Entry Points
[multiple-entry-points](multiple-entry-points) example demonstrating multiple entry points with Code Splitting.

## Require Context
[require.context](require.context) example demonstrating automatic creation of contexts when using variables in `require`.

## Require Resolve
[require.resolve](require.resolve) example demonstrating how to cache clearing of modules with `require.resolve` and `require.cache`.

## Scope Hoisting
[scope-hoisting](scope-hoisting)

## Side Effects
[side-effects](side-effects)

## Source Map
[source-map](source-map)

## Web Worker
[web-worker](web-worker) example demonstrating creating WebWorkers with webpack and the worker-loader.

## 旧-component

演示了如何导入自定义组件的示例

- v0.9

```
ComponentPlugin
*  compiler.resolvers.normal.plugin "module": resolve 模块时，找到实际的模块地址 a-component/component.json
*  compiler.plugin "normal-module-factory": 监听在 compile 时准备 newCompilationParams()
    *  在 "after-resolve" 是确定了 module 配置决定解析之前修改配置的一次机会
    *  对比 "module" 时记录下的 componentFile 和 data 匹配
    *  给 data 添加 loader: component-loader.js?{\"styles\":\"!/style-loader/index.js!/css-loader/index.js![file]\"}
* component-loader.js
    *  转义component.json内容成
    *  require(\"!..style-loader/index.js!/../css-loader/index.js!./style.css\");
    *  module.exports = require(\"./index.js\");
```
## 旧-labeled-modules

演示标记模块的示例

- v0.9

```
LabelModulePlugin
* 因为 compiler,complication,parser 都有自己的消息通道，所以都继承自 taxable
* compiler.plugin "compilation"
    * 解析依赖时 LabeledModuleDependency 指定 normalModuleFactory (内置的模块解析方法)
    * 代码替换 LabeledModuleDependency 导入语法替换
    * 代码替换 LabeledExportsDependency 导出语法替换
    * 向 parser 丢 LabeledModuleDependencyParserPlugin 插件
* LabeledModuleDependencyParserPlugin
    * 监听 label require，label exports 语法 插入依赖实例
* Compilation.processModuleDependencies
    * 回去解析 dependencies 通过 dependencyFactories 获得  dependantModule 创建 module
    * 递归 processModuleDependencies 过程
```

# Requests
If you think an example is missing, please report it as issue. :)

# Building an Example
1. Run `npm install` in the root of the project.
2. Run `npm link webpack` in the root of the project.
3. Run `node build.js` in the specific example directory. (Ex: `cd examples/commonjs && node build.js`)

Note: To build all examples run `npm run build:examples`
