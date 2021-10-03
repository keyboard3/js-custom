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
