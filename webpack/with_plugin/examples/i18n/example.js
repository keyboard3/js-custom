/**
 * I18nPlugin
 *  compiler.plugin "compilation": 常见一个新的 complication
 *    给 complication.dependencyTemplates 添加 ConstDependency 类的模板处理方法，用来替换源码的
 *  compiler.parser.plugin "call __": 监听如果调用 __()方法
 *    "Hello World" 作为参数从 localization json 中获得映射值
 *    添加 ConstDependency 到 module.dependencies 中。目的是将这个调用表达式替换成 i18n 映射之后的字符串
 *  在 Compilation.createChunkAssets 构建产物 chunk js 文件内容
 *  JSONMainTemplate.render -> FunctionModuleTemplate.render -> NormalModule.source
 *    会调用 module.dependencies 并使用 complication.dependencyTemplates 中的模板来替换源码
 */
console.log(__("Hello World"));
console.log(__("Missing Text"));