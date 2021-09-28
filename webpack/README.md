# Webpack

* 通过解析文件 AST 的 require 及 require.esure 建立了modules 有向依赖图
* 通过 modules 依赖关系 建立 chunk 的 modules 以及 chunk 的继承关系
* 根据 chunk 的继承关系确认实际 chunk include 的模块，以及清理空 include 的 chunks
* 根据 chunks 来生成 chunk 文件，0 是入口 chunk(管理 modules 映射实体和 require ), 其他则是注入 chunk