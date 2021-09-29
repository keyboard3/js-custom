# Webpack

## init Commit 版本
* 通过解析文件 AST 的 require 及 require.esure 建立了modules 有向依赖图
* 通过 modules 依赖关系 建立 chunk 的 modules 以及 chunk 的继承关系
* 根据 chunk 的继承关系确认实际 chunk include 的模块，以及清理空 include 的 chunks
* 根据 chunks 来生成 chunk 文件，0 是入口 chunk(管理 modules 映射实体和 require ), 其他则是注入 chunk

## with loader 版本
* 初步loader loader2.js!loader1.js!file.js ：最后产物loader2会转换成js内容，处理成js模块参与到chunk打包结果中
* 内置loader 根据扩展名来，json,coffe 会帮他们拼接好上面的模块路由形式
* 有些外部模块如json和coffee这些会有导出，但是style-loader则不会导出，在引用模块的时候会向全局document上加css样式