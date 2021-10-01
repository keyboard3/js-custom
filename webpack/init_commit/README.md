# modules-webpack

## 目标

作为开发人员，您希望重用现有代码.

与 node.js 和 web 一样，所有文件都已经使用相同的语言，但是让浏览器的代码使用 node.js 的模块系统需要额外的工作。

`webpack` 的目标是将 CommonJs 模块捆绑到可以通过 `<script>` 标签加载的 javascript 文件中。

连接所有 require 的文件有一个缺点：在页面加载时需要下载（和执行）许多代码。

因此，`webpack` 使用 `require.ensure` 函数将您的代码自动拆分为多个按需加载的包。这对开发人员来说几乎是透明的，只需一个函数调用。依赖性已为您解决。结果是更小的初始代码下载，从而导致更快的页面加载。

**TL;DR**

- 打包 CommonJs 模块
- 按需创建多个文件
- 自己管理依赖
- 在大 web 应用的页面加载更快

## Example

```javascript
// a.js
var b = require("./b");
b.stuff("It works");

// b.js
exports.stuff = function (text) {
  console.log(text);
};
```

are compiled to

```javascript
(/* small webpack header */)
({
0: function(module, exports, require) {

	var b = require(1);
	b.stuff("It works");

},
1: function(module, exports, require) {

	exports.stuff = function(text) {
		console.log(text);
	}

}
})
```

## 浏览器替换

场景是浏览器 require 其他代码而不是 node.js 的情况.
`webpack` 允许模块开发人员指定在 `webpack` 编译过程中使用的替换

`web_modules` 中的模块替换了 `node_modules` 中的模块。
`filename.web.js` 在没有文件扩展名的情况下在 require 时替换 `filename.js`。

TODO 在选项中指定替换

## 限制

### `require`-function

由于在运行之前解决了依赖关系：:

- `require` 不应该被覆盖
- `require` 不应该被间接调用 `var r = require; r("./a");`
- `require` 的参数应该是字面量。`"./abc" + "/def"` 允许支持多行
- `require.ensure` 与 `require` 具有相同的限制，传递给 `require.ensure` 的函数应该在调用中内联。

TODO 允许变量传递给 `require`，如 `require("./templates/" + mytemplate)`
(这将导致除了映射表之外还包含匹配此模式的所有模块)

### node.js specific modules

由于像 `fs` 这样的 node.js 特定模块在浏览器中不起作用，它们不会被 include 并导致错误.
如果您使用它们，您应该将它们替换为自己的模块.

```
web_modules
  fs
  path
  ...
```

## Code Splitting

### Example

```javascript
var a = require("a");
var b = require("b");
require.ensure(["c"], function (require) {
  require("b").xyz();
  var d = require("d");
});
```

```
File 1: web.js
- 模块 a 和依赖的代码
- 模块 b 和依赖的代码

File 2: 1.web.js
- 模块 c 和依赖项的代码（但未使用代码）
- 模块 d 和依赖项的代码
```

有关确切输出，请参阅 [details](modules-webpack/tree/master/example)

## Usage

### Shell

`webpack` 提供命令行:

在 `npm install webpack -g` 之后你可以使用 `webpack` 命令

如果不带参数调用它会打印一个用法：

```
Usage: webpack <options> <input> <output>

Options:
  --single             禁止代码分割                        [boolean]  [default: false]
  --min                使用 uglifyjs 压缩代码              [boolean]  [default: false]
  --filenames          将文件名输出到文件中                  [boolean]  [default: false]
  --options            选项 JSON 文件                      [string]
  --script-src-prefix  JavaScript 加载的路径前缀            [string]
  --libary             将 exports 存储到此变量中             [string]
```

### Programmatically Usage

`webpack(context, moduleName, [options], callback)`
`webpack(absoluteModulePath, [options], callback)`

#### `options`

您可以将此选项对象保存在 JSON 文件中，并将其与 shell 命令一起使用。

`outputJsonpFunction`
用于加载 chunk 的 JSONP 函数

`scriptSrcPrefix`
加载 chunk 的路径

`outputDirectory`
将文件写入此目录（绝对路径）

`output`
将第一个 chunk 写入此文件

`outputPostfix`
将 chunk 写入名为 chunkId 的文件加上 outputPostfix

`libary`
输入文件的 exports 存储在此变量中

`minimize`
使用 uglify-js 最小化输出

`includeFilenames`
添加输入文件的绝对文件名作为注释

#### `callback`

`function(err, source / stats)`
`source` if `options.output` is not set
else `stats` as json see [example](/modules-webpack/tree/master/example)

## medikoo/modules-webmake

`webpack` 最初打算作为 @medikoo 的 `webmake` 的 fork，因此它与它分享了几个想法。

然而`webpack`有很大的不同:

`webpack` 用数字替换模块名称和路径。 `webmake` 不这样做，并在客户端解决要求。
`webmake` 的这种设计旨在支持变量作为 require 调用的参数。
`webpack` 在编译时解析 requires 并且在客户端没有解析代码。这导致较小的包。
作为参数的变量将被不同地处理并且有更多的限制。

`webmake` 中基于前一个的另一个限制是模块必须在当前包范围内。
在`webpack` 中，这不是限制。

`webmake` 的设计导致所有同名模块重叠。如果不同的子模块依赖于同一模块的特定版本，这可能会出现问题。行为也不同于 node.js 的行为，因为 node.js 为子模块中的每个实例安装一个模块，而`webmake` 导致它们合并为一个只安装一次的模块。在`webpack` 中，情况并非如此。不同版本不重叠，模块多次安装。但是在`webpack` 中，如果一个模块在多个模块中使用，这可能（当前）导致重复代码。我想面对这个问题（TODO）。

`webmake` 做（目前）不支持代码拆分。

## Tests

你可以运行 `node_modules/.bin/vows` 的单元测试。

您可以运行浏览器测试：

```
cd test/browsertests
node build
```

并在浏览器中打开`test.html`。文件中一定有几个OK，没有FAIL。

TODO 更多的测试

## Contribution

欢迎您通过编写问题或拉取请求来做出贡献。

也欢迎您纠正任何拼写错误或任何语言问题，因为我的英语不太好...

## License

MIT
