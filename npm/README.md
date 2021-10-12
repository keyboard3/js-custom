# [npm](https://docs.npmjs.com/cli/v7/commands/npm)
javascript 包管理器

## 概要
```
npm <command> [args]
```
## 版本
7.0.0

## 描述
npm 是 Node JavaScript 平台的包管理器。它将模块放在适当的位置，以便 node 可以找到它们，并智能地管理依赖冲突。

它非常可配置以支持各种用例。最常见的是，您使用它来发布、发现、安装和开发 node 程序。

运行 npm help 以获取可用命令的列表。

## 重点
默认情况下，npm 预先配置 npm public registry 为 https://registry.npmjs.org。npm public registry 的使用受 https://docs.npmjs.com/policies/terms 上提供的使用条款的约束。

您可以将 npm 配置为使用您喜欢的任何兼容 registry，甚至可以运行您自己的 registry。使用他人的 registry 受其使用条款的约束。

## 简介
你可能有 npm 是因为你想安装东西。

您最有可能想要在任何 node 程序中运行的第一件事是 npm install 来安装其依赖项。

您还可以运行 npm install bleger 来安装最新版本的“blegg”。查看 npm install 了解更多信息。它可以做很多事情。

使用 npm search 命令显示公共注册表中可用的所有内容。使用 npm ls 显示您已安装的所有内容。

## 依赖关系
如果包使用 git URL 列出依赖项，npm 将使用 git 命令安装该依赖项，如果未安装，则会生成错误。

如果 npm 尝试安装的包之一是 native node 模块并且需要编译 C++ 代码，npm 将使用 node-gyp 执行该任务。对于 Unix 系统，node-gyp 需要 Python、make 和像 GCC 这样的构建链。在 Windows 上，需要 Python 和 Microsoft Visual Studio C++。有关更多信息，请访问 node-gyp 存储库和 node-gyp Wiki。

## 目录
查看[folders](./folders.md)以了解 npm 文件夹结构。

特别是，npm 有两种操作模式：
- 本地模式: npm 将包安装到当前项目目录中，默认为当前工作目录。包安装到 ./node_modules，bins 安装到 ./node_modules/.bin。
- 全局模式: npm 将软件包安装到 `$npm_config_prefix/lib/node_modules` 的安装前缀中，并将 bin 安装到 `$npm_config_prefix/bin` 中。

本地模式是默认模式。在任何命令上使用 -g 或 --global 以在全局模式下运行。

## 开发者使用
如果您使用 npm 开发和发布代码，请查看以下帮助主题：
- json: 创建 package.json 文件, 看 [package.json](./package.json)
- link: 将您当前的工作代码链接到 Node 的路径，这样您就不必每次进行更改时都重新安装。[npm link](./link.md)
- install: 如果您不需要符号链接，最好安装一些它们。特别是，从 registry 安装其他人的代码是通过 [npm install](./install.md) 完成的
- adduser: 创建帐户或登录。执行此操作时，npm 会将凭据存储在用户配置文件 config 文件中。
- publish: 使用 [npm publish](./publish.md) 命令将您的代码上传到 registry。

## 配置
npm 是极其可配置的。它从 5 个地方读取其配置选项。
- 命令行开关：使用 --key val 设置配置。所有键都有一个值，即使它们是布尔值（配置解析器在解析时不知道选项是什么）。如果您不提供值 (--key)，则该选项设置为布尔值 true。

- 环境变量：通过在环境变量中为名称添加 `npm_config_` 前缀来设置任何配置。例如，导出 `npm_config_key=val`。

- 用户配置：`$HOME/.npmrc` 中的文件是一个 ini 格式的配置列表。如果存在，则对其进行解析。如果在 cli 或 env 中设置了 `userconfig` 选项，则将使用该文件。

- 全局配置: 在 `./etc/npmrc` 找到的文件, 如果找到，将解析相对于全局前缀。有关全局前缀的更多信息，请参阅 [npm prefix]()。如果在 cli、env 或用户配置中设置了 `globalconfig` 选项，则会改为解析该文件。

有关更多信息，请参阅 [config](./config.md)