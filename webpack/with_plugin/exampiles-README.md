# examples

## commonjs

演示一个非常简单的程序的示例

## code-splitting

示例演示了一个非常简单的代码拆分案例。

## require.resolve

示例演示如何使用 `require.resolve` 和 `require.cache` 清除模块的缓存。

## require.context

演示在“require”中使用变量时自动创建上下文的示例。

## code-splitted-require.context

演示代码拆分环境中的上下文的示例。

## code-splitted-require.context-amd

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

## loader

示例演示 loader 的使用。

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

## coffee-script

示例演示用 coffee-script 脚本编写的代码。

## code-splitting-bundle-loader

通过构建器 loader 演示代码拆分的示例

## names-chucks

演示 chunk 与命名 chunk 合并的示例

## component

演示了如何导入自定义组件的示例

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

## labeled-modules

演示标记模块的示例

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
## mixed

演示混合 CommonJs、A​​MD 和标记模块的示例

## web-worker

演示使用 webpack 和 worker-loader 创建 WebWorker 的示例。

## i18n

演示本地化的示例。

I18nPlugin
*  compiler.plugin "compilation": 常见一个新的 complication
*    给 complication.dependencyTemplates 添加 ConstDependency 类的模板处理方法，用来替换源码的
*  compiler.parser.plugin "call __": 监听如果调用 __()方法
*    "Hello World" 作为参数从 localization json 中获得映射值
*    添加 ConstDependency 到 module.dependencies 中。目的是将这个调用表达式替换成 i18n 映射之后的字符串
*  在 Compilation.createChunkAssets 构建产物 chunk js 文件内容
*  JSONMainTemplate.render -> FunctionModuleTemplate.render -> NormalModule.source
*    会调用 module.dependencies 并使用 complication.dependencyTemplates 中的模板来替换源码
# Requests

如果您认为缺少示例，请将其报告为问题。 :)

# Build

每个示例目录中有一个 `build.js` 文件。

使用示例目录中的 node 运行它以编译它和 README.md 文件。