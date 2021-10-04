/** 
 * ComponentPlugin
 *  compiler.resolvers.normal.plugin "module": resolve 模块时，找到实际的模块地址 a-component/component.json
 *  compiler.plugin "normal-module-factory": 监听在 compile 时准备 newCompilationParams()
 *    在 "after-resolve" 是确定了 module 配置决定解析之前修改配置的一次机会
 *    对比 "module" 时记录下的 componentFile 和 data 匹配
 *    给 data 添加 loader: component-loader.js?{\"styles\":\"!/style-loader/index.js!/css-loader/index.js![file]\"}
 * component-loader.js
 *    转义component.json内容成
 *    require(\"!..style-loader/index.js!/../css-loader/index.js!./style.css\");
 *    module.exports = require(\"./index.js\");
 */
console.log(require("a-component"));
console.log(require("b-component"));
console.log(require("c-component"));
