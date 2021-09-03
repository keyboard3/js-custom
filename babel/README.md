# Babel
[官方地址](https://babeljs.io/docs/en/)

## 库
- @babel/cli:
 用户通过命令行工具调用 babel-core api。它目的是更为方便的通过命令行的方式使用 babel 转义代码

- @babel/core:
 用户通过引入 babel-core 的源码编程的方式调用 api。它能够让人更加灵活的处理或定制 babel 的能力

- @babel/polyfill
 补充目标浏览器缺少的新 ECMAScript标准要求的功能，模拟这些应该由运行时环境提供的对象和方法
 env 的 useBuiltIns 的 usage 选项可以优化，只包含需要的 polyfill

- @babel/plugin-transform-runtime
 对于第三方库的作者来说 @babel/polyfill 太重，会引入我们不需要的功能，从而污染全局环境。
 它可以重用 Babel 注入的辅助代码节省大小

## 配置
 - babel.config.json: `当使用的是 monorepo(多项目仓库) 或者你想编译 node_modules. babel 推荐使用它`
 - .babelrc.json: `只想编译项目的一部分`
 - package.json