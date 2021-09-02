const presets = [
  [
    "@babel/env",
    {
      // 只会加载我们目标浏览器的 js 引擎不支持标准语法转化的插件
      targets: {
        edge: "17",
        firefox: "60",
        chrome: "67",
        safari: "11.1",
      },
      // false: 表示不载入 polyfill 模块
      // entry: 代码入口一次性载入 polyfill 模块
      // usage: 表示按需载入 polyfill 的模块。在模块文件的顶层载入它
      useBuiltIns: "usage",
      corejs: "3.6.4",
    },
  ],
];

module.exports = { presets };