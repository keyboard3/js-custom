/** LabelModulePlugin
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
 */
require: "./increment";
var a = 1;
increment(a); // 2