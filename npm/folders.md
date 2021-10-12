# [folders](https://docs.npmjs.com/cli/v7/configuring-npm/folders)
npm 的文件夹结构

## 描述

npm 将各种东西放在您的计算机上。这就是它的工作。
这份文件会告诉你它放在哪里。

### tl;dr
- 本地安装（默认）：将东西放在当前包根目录的 ./node_modules 中。
- 全局安装（使用 -g）：将东西放在 /usr/local 或 node 安装的地方
- 如果您要 require() 它，请在本地安装它。
- 如果要在命令行上运行它，请全局安装它。
- 如果两者都需要，则在两个地方都安装它，或者使用 npm link。

### prefix 配置
prefix 配置默认为安装 node 的位置。在大多数系统上，这是 /usr/local。在 Windows 上，它是 %AppData%\npm。在 Unix 系统上，它是上一级，因为 node 通常安装在 {prefix}/bin/node 而不是 {prefix}/node.exe。

设置 global 标志后，npm 会将内容安装到此 prefix 中。如果未设置，则使用当前包的根目录，如果不在包中，则使用当前工作目录。

### Node Modules
包被放入 prefix 下的 node_modules 文件夹中。在本地安装时，这意味着您可以使用 require("packagename") 加载其主模块，或使用 require("packagename/lib/path/to/sub/module") 加载其他模块。

Unix 系统上的全局安装转到 {prefix}/lib/node_modules。 Windows 上的全局安装转到 {prefix}/node_modules（即没有 lib 文件夹。）
