# debug in vscode
## 参考文章
- [node.js 调试指南](https://nodejs.org/zh-cn/docs/guides/debugging-getting-started/)
- [深入理解 Node.js Inspector](https://zhuanlan.zhihu.com/p/396463046)
- [Node 调试指南](https://nodejs.org/zh-cn/docs/guides/debugging-getting-started/)

## 基本原理
Node.js 通过 --inspect 开启 inspector, 内部开启独立的线程启动 websoket 服务, 按照 inspector 协议来和调试客户端通信, 

## 调试场景
- sourcemap-ts: `vscode debug 混淆 js 通过 sourcemap 文件来针对源码 ts 调试`
- ts-file: `vscode 直接运行 ts 文件, 运行的翻译结果和 sourcemap 直接在内存中，调试则针对与源码 ts 文件`
- remote:
  - httpServerSimple.js: 
    - node --inspect ./remote/httpServerSimple.js: `chrome 开发者工具直接打开 Node 按钮调试源码，启动了默认端口 9229`
    - node --inspect=127.0.0.1:8888 ./remote/httpServerSimple.js
      - 浏览器输入: `devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=127.0.0.1:8888/df8213a0-02da-482d-afd3-9327c6e71450`
      - 自动探测: 打开 chrome://inspect/#devices 选择 configure 输入域名和端口号
        