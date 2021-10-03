/**
 * I18nPlugin
 *  compiler.plugin "compilation": 常见一个新的 complication
 * TODO: 两个依赖上设置常量依赖有什么作用
 *  compiler.parser.plugin "call __": 监听如果调用 __()方法
 *    "Hello World"作为参数从 localization json 中获得映射值
 *    找不到向 module 中丢警告，结果就设置为参数
 *    将这个函数表达式替换成字符串常量了
 *    返回 true 告诉 parser 已经被消费掉了
 * TODO: 如何替将常量替换掉原来的函数调用的作为源码的
 */
console.log(__("Hello World"));
console.log(__("Missing Text"));