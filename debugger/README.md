# debug in vscode
## 参考文章
- [node.js 调试指南](https://nodejs.org/zh-cn/docs/guides/debugging-getting-started/)
- [深入理解 Node.js Inspector](https://zhuanlan.zhihu.com/p/396463046)
- [Node 调试指南](https://nodejs.org/zh-cn/docs/guides/debugging-getting-started/)
- [vscode Node.js Debugging - SourceMap](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_source-maps)

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


## [vscode-js-debug](https://github.com/microsoft/vscode-js-debug)
这是一个基于 [DAP](https://microsoft.github.io/debug-adapter-protocol/) 的 JavaScript 调试器。它可以调试 Node.js、Chrome、Edge、WebView2、VS Code 扩展等。自 1.46 以来，它一直是 Visual Studio Code 中的默认 JavaScript 调试器，并逐渐在 Visual Studio 中推出。

### Nightly Extension
随附的 VS Code 版本在其发布时包括 js-debug 版本，但是您可能需要安装我们的 nightly build 以获取最新的修复和功能。nightly build 在每天下午 5 点 PST 运行，有更改（[请参阅管道](https://dev.azure.com/vscode/VS%20Code%20debug%20adapters/_build?definitionId=28)）。要获得构建：
- 打开扩展视图（ctrl+shift+x）并搜索@builtin @id:ms-vscode.js-debug
- 右键单击 JavaScript Debugger 扩展并禁用它。
- 在扩展视图中搜索 @id:ms-vscode.js-debug-nightly。
- 安装那个扩展。

### What's new?
在 js-debug 中，我们的目标是为现代应用程序提供丰富的调试，不需要或只需要最少的配置。下面是 js-debug 带来的一些新特性：

#### 调试子进程和 workers
在 Node.js 中，会自动调试子进程。在浏览器中，服务工作者、网络工作者和 iframe 也将被调试。
![](https://github.com/microsoft/vscode-js-debug/blob/main/resources/readme/web-worker.png)

在调试 worker 时，您还可以单步执行 postMessage() 调用。

#### 在终端中调试 Node.js 进程
您可以使用我们改进后的自动附加来调试您在终端中运行的任何 Node.js 进程。如果自动附加未打开，您可以运行命令 Debug: Toggle Auto Attach 将其打开。下次运行 npm start 之类的命令时，我们将对其进行调试。
![](https://github.com/microsoft/vscode-js-debug/blob/main/resources/readme/auto-attach.png)

启用后，您可以通过单击屏幕底部状态栏中的“自动连接：开/关”按钮来切换“自动连接”。

您还可以通过 Debug: Create JavaScript Debug Terminal 命令创建用于调试的一次性终端。

在之前的调试器中，您必须记住在运行命令时添加 --inspect 标志，并且由于附件是异步的，因此无法在程序的早期命中断点。

#### 分析支持
您可以在 VS Code 中本地捕获和查看性能分析文件，方法是单击“调用堆栈”视图中的 ⚪ 按钮，或通过“调试：获取性能分析文件”命令。或通过 Debug: Take Performance Profile 命令。通过 VS Code 收集的分析文件信息是 sourcemap-aware。
![](https://github.com/microsoft/vscode-js-debug/blob/main/resources/readme/flame-chart.png)

### 简单的 npm 脚本调试
您可以通过单击 package.json 中显示的代码镜头来调试 npm 脚本，或者通过运行 Debug: Debug NPM Script command/
![](https://github.com/microsoft/vscode-js-debug/raw/main/resources/readme/npm-code-lens.png)

您可以在 debug.javascript.codelens.npmScripts 设置中配置代码镜头的显示位置和显示位置。

#### 浏览器自动调试
默认情况下，您通过 JavaScript 调试终端（Debug: Create JavaScript Debug Terminal 命令）单击的任何链接都将在调试模式下打开。如果您愿意，可以通过将 debug.javascript.debugByLinkOptions 分别设置为 always 或 off 来为所有终端启用或禁用它。
![](https://github.com/microsoft/vscode-js-debug/raw/main/resources/readme/link-debugging.gif)

#### 仪表断点
调试 Web 应用程序时，您可以在“浏览器断点”视图中从 VS Code 配置检测断点。
![](https://github.com/microsoft/vscode-js-debug/raw/main/resources/readme/instrumentation-breakpoints.png)
![](https://github.com/microsoft/vscode-js-debug/raw/main/resources/readme/instrumentation-breakpoints2.png)

#### 调试控制台中更好的自动补全
调试控制台中的自动补全已得到显着改进。对于比 VS Code 以前能够处理的更复杂的表达式，您可以期待更好的建议。
![](https://github.com/microsoft/vscode-js-debug/raw/main/resources/readme/repl-improvements.png)

#### 返回值拦截
在函数的 return 语句中，您可以使用、检查和修改 $returnValue。
![](https://github.com/microsoft/vscode-js-debug/raw/main/resources/readme/returnvalue.png)

请注意，您可以使用和修改 $returnValue 上的属性，但不能将其分配给——它实际上是一个 const 变量。

#### 顶级 await
您可以在调试控制台的顶层使用 await。
![](https://github.com/microsoft/vscode-js-debug/raw/main/resources/readme/top-level-await.png)

但是，与 Chrome 开发者工具一样，如果您在断点暂停时使用 await，您只会得到一个挂起的 Promise。这是因为 JavaScript 事件循环在断点处暂停。

#### 漂亮的打印压缩的源码
调试器现在可以漂亮地打印文件，在处理压缩的源时特别有用。当您进入或打开看起来压缩的文件时，它会显示一个提示，您还可以通过 Debug: Pretty print for debugging 命令手动触发漂亮的打印。
![](https://code.visualstudio.com/assets/updates/1_43/js-debug-pretty-printing.gif)

您可以通过选择从不关闭建议提示，或将设置 debug.javascript.suggestPrettyPrinting 更改为 false。

#### 支持 Microsoft Edge 和 WebView2
我们支持通过 pwa-msedge 调试类型启动新的 Microsoft Edge 浏览器。它支持与 chrome 相同的所有配置设置。
![](https://github.com/microsoft/vscode-js-debug/raw/main/resources/readme/webview2.png)

随之而来的是对桌面 Windows 应用程序中的 WebView2 控件的支持。查看我们的 webview 演示以了解如何设置。

#### 更好的源映射和断点行为
Js-debug 有一套重写的源映射处理和断点解析逻辑。在更多情况下，这会导致更可靠的断点行为。例如：
- 我们保证在击中断点之前设置断点，在以前的场景中没有发生这种情况。
- 我们可以处理多个编译文件中存在的源。这在处理 Web 应用程序中的拆分包时很常见。
- 我们现在支持就地转译（例如 ts-node 和 @babel/register）。

#### 在调用堆栈视图中复制值
VS Code 长期以来一直有从变量视图“复制值”的操作。但是，以前这会因对象或长值而被截断。VS Code 和 js-debug 中的更改使我们能够无损地将完整表达式复制为 JSON。

#### 其他小东西
js-debug 是 JavaScript 调试器的干净的重写，所以有很多小的改进。这里还有一些不值得他们自己标题的内容：
- 现在改进了控制台输出。 Promises、ArrayViews/ArrayBuffers 和其他复杂的数据结构得到更好的支持。
- 日志点断点现在支持复杂的表达式和语句。抛出的错误会被打印出来，而不是被默默吃掉。
- 您现在可以在 Node.js runtimeVersion 中指定部分版本。以前您需要指定完整版本，例如 12.3.4。现在，您可以指定 12，我们将使用系统上安装的最新 12.*。
- 通过“附加到 Node.js 进程”命令附加时，现在支持源映射。
- 为了在 monorepos 和多部分应用程序中获得更快的性能和更好的开箱即用行为，已经进行了一些改进。
- 现在支持 console.group() API 集。
- 您可以在启动浏览器时将 stable、canary 或 dev 作为 runtimeExecutables 传递。我们将尽最大努力在您的机器上发现和使用指定的版本。
- 您现在可以将 Node.js program 设置为带有其他扩展名或没有扩展名的文件，而无需解决方法。
- 现在支持重新启动帧请求。
- 现在可以使用像 inspect() 和 copy() 这样的命令行 API。
