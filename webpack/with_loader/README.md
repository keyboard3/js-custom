# modules-webpack

作为开发者你一定希望复用已存在的代码。

node.js 和 web 的所有文件都是相同的语言, 但是浏览器要使用 node.js 的模块系统却要做很多额外的工作。

`webpack` 的目标是打包 CommonJs 的模块到 js 文件，可以通过 `<script>` 标签加载。

简单的链接所有 require 的文件有个缺点，在页面加载的时候就下载了很多代码(包括执行)。

因此 `webpack` 使用 `require.ensure` function ([CommonJs/Modules/Async/A](http://wiki.commonjs.org/wiki/Modules/Async/A)) 来分割代码，自动打包成多个 chunk 文件按需加载。这个过程对于开发者是透明的。依赖关系帮你解决了。结果是页面加载时可以帮你加载更少的代码。

在 web 开发中另外很常见的需求是许多文件在发送给客户端时需要预处理(比如. 模板文件)。它给编译步骤带来了复杂性。

`webpack` 支持 loaders 在 include 它们之前预处理这些文件。作为开发者的你可以像使用其他模块一样引用这些文件。

[![build status](https://secure.travis-ci.org/sokra/modules-webpack.png)](http://travis-ci.org/sokra/modules-webpack)

**TL;DR**

* 面向浏览器打包 CommonJs 模块。
* 在客户端上复用服务端代码 (node.js)
* 为按需加载创建多个文件 (在大型 web 应用或者面向移动端请求时提供更快的页面加载)
* 在编译时管理依赖 (不需要在运行解析)
* loaders 可以预处理文件

## 目标

- 让 node.js 和浏览器开发一致
- 优化代码大小 (面向移动端请求)
  - 在下载时减少代码大小
  - 按需下载代码
- 运行只需要很少的配置，但提供的可配置项很全
  - 如果使用特定的 node 库会加载 polyfills
  - 针对 node 内置的库提供替代品

# Example

See [example webapp](http://sokra.github.com/modules-webpack-example/).

## Simple Example

``` javascript
// a.js
var b = require("./b");
b.stuff("It works");

// b.js
exports.stuff = function(text) {
	console.log(text);
}
```

are compiled to (reformatted)

``` javascript
(/* small webpack header */)
({
0: function(module, exports, require) {

	var b = require(1);
	b.stuff("It works");

},
1: function(module, exports, require) {

	exports.stuff = function(text) {
		console.log(text)
	}

}
})
```

## Code Splitting

### Example

``` javascript
var a = require("a");
var b = require("b");
require.ensure(["c"], function(require) {
	require("b").xyz();
	var d = require("d");
});
```

```
File 1: web.js
- code of that file
- code of module a and dependencies
- code of module b and dependencies

File 2: 1.web.js
- code of module c and dependencies (but code is not used)
- code of module d and dependencies
```

应用初始化时只需要 `web.js`。当 `require.ensure` 调用时会加载 `1.web.js`。当第二个 `1.web.js` 加载完成之后，它的回调函数会立刻执行。

See [details](/sokra/modules-webpack/tree/master/examples/code-splitting) for exact output.

See [more examples](/sokra/modules-webpack/tree/master/examples).

## Reusing node.js code

`webpack` 支持许多为 node.js 环境编写的代码。

开箱即用的一些例子：

* `require("./templates/" + templateName);`
* `require(condition ? "moduleA" : condition2 ? "moduleB" : "./localStuff");`
* `function xyz(require) { require("text"); } xyz(function(a) { console.log(a) });`
* `var r = require; r("./file");` with warning
* `function xyz(require) { require("./file"); } xyz(require);` with warning
* `try { require("missingModule"); } catch(e) { console.log("missing") }` with warning
* `var require = function(a) { console.log(a) }; require("text");`
* `if(condition) require("optionalModule")` with warning if missing

## Browser replacements

有些特殊场景 require 需要的是浏览器代码而不是 node.js的。
`webpack` 允许模块开发者在 `webpack` 编译过程中指定 node.js 的 web 替代模块。
`web_modules` 会替代 `node_modules`的模块。如果 require 的模块没有文件扩展名则 `filename.web.js` 会替代 `filename.js`。

in options: `alias: { "http": "http-browserify" }`

in shell: `--alias http=http-browserify`

## Contexts

如果在编译时我们不知道所需的模块会出现问题。
一个解决方案是 `require.context` 函数会将目录作为参数并返回一个类似于 `require` 行为的方法（仅当用于该目录时的文件）。
在编译时会引用整个目录，所以你可以访问它下面的所有文件。

### Example

比如有个模板文件的目录，模板用于编译 js 文件。通过模板名可以加载一个模板。

``` javascript
var requireTemplate = require.context("./templates");
function getTemplate(templateName) {
	return requireTemplate("./" + templateName);
}
```
另外当你在使用 `require` 方法时使用了变量或者其他不可解析的东西时，`webpack` 会自动的使用 `require.context` 方法。

意思如下面的示例的行为：

``` javascript
function getTemplate(templateName) {
	return require("./templates/" + templateName);
}
// is compiled like: return require.context("./templates")("./"+templateName)
// which compiles to: return require(123)("./"+templateName)
```

See [details](/sokra/modules-webpack/tree/master/examples/require.context) for complete example.

当存储 `require` 方法到变量中或者将它作为参数传递，`webpack` 会转成 `require.context(".")` 来兼容。

这种情况下回发出警告。

*警告: 目录下的代码都会被编译. 所以使用它小心.*

## Loaders

你可以使用 loader 语法来在打包到 js 代码之前预处理文件。

下面的例子是使用 raw loader 来加载纯文本内容：

``` javascript
var content = require("raw!./file.txt");
```
多个 loader 可以使用 ! 来分隔。loader plugin 的解析使用正常的 require 调用，但是需要有不同的默认扩展名。

raw loader plugin 会检索 `raw-webpack-web-loader`, `raw-webpack-loader`, `raw-web-loader`, `raw-loader`, `raw` 等模块，以及下面的文件：`index.webpack-web-loader.js`, `index.webpack-loader.js`, `index.web-loader.js`, `index.loader.js`, `index`, `index.js`.

注意如果在 node.js 中使用，web- 的版本会被忽略。

See [example](/sokra/modules-webpack/tree/master/examples/loader).

下面的 loader 已经包括在 webpack 中:

* `raw`: 加载文本文件 (as utf-8)
* `json` (default at `.json`): 加载 json 文件作为 JSON 对象
* `jade` (default at `.jade`): 加载 jade 模板并返回一个函数
* `coffee` (default at `.coffee`): 加载 coffee-script 成 javascript
* `css`: 加载具有解析导入的 css 文件并返回 css 代码
* `less`: 加载并编译一个less文件并返回css代码
* `val`: 将代码作为模块执行并将导出视为 javascript 代码
* `bundle`: 将请求包装在 `require.ensure` 块中
* `style`: 将 javascript 执行结果添加到 DOM
* `script`: 在全局上下文中执行一次 javascript 文件（如在脚本标记中），不解析 require。使用它来包含一个库. ex. `require("script!./jquery.min.js")`. 这是同步的，所以 `$` 变量在 require 之后可用。
* (`.css` defaults to `style!css` loader, 所以所有的 css 规则都被添加到 DOM)
* (`.less` defaults to `style!css!val!less` loader, 所以所有的 less 规则都被添加到 DOM 中)

See docs for loader in github repo of the loader.

## TL;DR

``` javascript
var a = require("a"); // require modules
var b = require("./b"); // and files
                          // like in node.js

// polyfill require method to use the new members in node.js too
require = require("webpack/require-polyfill")(require.valueOf());

// create a lazy loaded bundle
require.ensure([], function(require) {
	var c = require("c");

	// require json
	var packageJson = require("../package.json");

	// or jade templates, coffee-script, and many more with own loaders
	var result = require("./template.jade")(require("./dataFrom.coffee"));

	// files are compiled to javascript and packed into the bundle...
});
```

... and compile from the shell with:

```
webpack lib/input.js js/output.js
```

try `--min` to minimize with `uglify-js`.

## Limitations

### `require`-function

* `require` 不应被覆盖，除了 polyfill
* `require.ensure` 不应被覆盖或间接调用
* `require.context` 不应被覆盖或间接调用
* the argument to `require.context` should be a literal or addition of multiple literals
* `require.context` 的参数应该是一个字面量或多个字面量相加
* `require` 的间接调用应该访问的是当前目录的文件：这会引发异常：`var r = require; r("../file");`

如果使用错误，以下情况可能会导致结果文件中**太多代码**

* 间接调用 `require`: `var r = require; r("./file");`. 它会包括整个目录.
* `require.context`. 它也会包括整个目录.
* require 参数中使用表达式: `require(variable)`. 也会包括整个目录. (except from `?:`-operator `require(condition ? "a" : "b")`)
* 传递给 `require.ensure` 的函数未在调用中内联. 在内联函数中 require 会移动到第二个包中。


### node.js specific modules

由于像 `fs` 这样的 node.js 特定模块在浏览器中不起作用（默认情况下）它们不被包含并导致异常。

如果你想使用它们，你应该用自己的模块替换它们

对于一些简单的模块是包含在 `webpack` 中的替换。

并不是每个人都需要昂贵的替代品，因此默认情况下不包括在内。

您需要指定 `--alias [module]=[replacement]` 才能使用它们。

如果您使用它而不提供替换，则会发出警告说缺少某些模块。

一些功劳归于 browserify 贡献者，您可以使用他们提供的替代品。

包括简单的替换：

* `assert`: node.js 版本的副本，小改动
* `buffer`: node-browserify 版本的副本
* `buffer_ieee754`: node-browserify 版本的副本
* `child_process`: 禁止
* `events`: node.js 版本的副本
* `path`: node.js 版本的副本
* `punycode`: node.js 版本的副本, 删除了一行 (http://mths.be/punycode by @mathias)
* `querystring`: node.js 版本的副本
* `string_decoder`: node.js 版本的副本
* `url`: node.js 版本的副本
* `util`: node.js 版本的副本

这是可能有用的替换列表: (故意不是默认)

* `http=http-browserify`
* `vm=vm-browserify`
* TODO 提供更多替代品

## Usage

### Shell

`webpack` 提供了一个命令行界面:

在 `npm install webpack -g` 之后你可以使用 `webpack` 命令

如果不带参数调用它会打印用法:

```
Usage: webpack <options> <input> <output>

Options:
  --single             禁用代码拆分                                   [boolean]  [default: false]
  --min                使用 uglifyjs 将其最小化                       [boolean]  [default: false]
  --filenames          将文件名输出到文件中                            [boolean]  [default: false]
  --options            JSON 配置文件                                 [string]
  --script-src-prefix  JavaScript 加载的路径前缀                      [string]
  --libary             将导出存储到此变量中                            [string]
  --colors             带颜色的输出统计数据                            [boolean]  [default: false]
  --json               将统计信息输出为 JSON                          [boolean]  [default: false]
  --by-size            在统计信息中按大小对模块进行排序                  [boolean]  [default: false]
  --verbose            在统计数据中的输出依赖项                         [boolean]  [default: false]
  --alias              为模块设置别名. ex. http=http-browserify       [string]
  --debug              将调试信息打印到输出文件                         [boolean]  [default: false]
  --watch              在更改时重新编译（loader 除外）                  [boolean]  [default: false]
  --progress           编译时显示进度                                 [boolean]  [default: false]
```

### Programmatically Usage

``` javascript
webpack(context, moduleName, [options], callback)
webpack(absoluteModulePath, [options], callback)
```

#### `options`

您还可以将此选项对象保存在 JSON 文件中，并将其与 shell 命令一起使用。

`outputJsonpFunction`

用于加载 chunk 的 JSONP 函数

`scriptSrcPrefix`

加载 chunk 的路径

`outputDirectory`

将文件写入此目录（绝对路径）

`output`

将第一个 chunk 写入此文件

`outputPostfix`

将块写入名为 chunkId 的文件加上 outputPostfix

`libary`

输入文件的导出存储在此变量中

`minimize`

使用 uglify-js 最小化输出

`debug`

将调试信息打印到输出文件。

`watch`

在更改时重新编译（loader 除外）

`includeFilenames`

添加输入文件的绝对文件名作为注释

`resolve.alias` (object)

更换一个模块. ex. `{"old-module": "new-module"}`

`resolve.paths` (array)

搜索路径

`resolve.extensions` (object)

文件的可能扩展名

default: `["", ".webpack.js", ".web.js", ".js"]`

`resolve.loaders` (array)

loader 映射的扩展. ex. `[{test: /\.extension$/, loader: "myloader"}]`

如果没有设置其他 loader 设置，则加载与 RegExp 匹配的文件

`resolve.loaderExtensions` (array)

loader 的可能扩展

default: `[".webpack-web-loader.js", ".webpack-loader.js", ".web-loader.js", ".loader.js", "", ".js"]`

`resolve.loaderPostfixes` (array)

loader 可能的后缀

default: `["-webpack-web-loader", "-webpack-loader", "-web-loader", "-loader", ""]`

`parse.overwrites` (object)

用模块替换的自由模块变量. ex. `{ "$": "jquery" }`

#### `callback`

`function(err, source / stats)`
`source` if `options.output` is not set
else `stats` as json see [example](/sokra/modules-webpack/tree/master/examples/code-splitting)

## Bonus features

### File hash

你可以在 `scriptSrcPrefix`、`output`、`outputDirectory`、`outputPostfix` 和 shell 参数中使用 `[hash]`。

`webpack` 将在写入时将其替换为文件的哈希值。

### From shell

结合选项 `--colors --watch --progress` 以获得漂亮的 shell 编译。

## 对比

<table>
 <tr>
  <th>
	Feature
  </th>
  <th>
	sokra/<br/>modules-<br/>webpack
  </th>
  <th>
	medikoo/<br/>modules-<br/>webmake
  </th>
  <th>
	substack/<br/>node-<br/>browserify
  </th>
 </tr>

 <tr>
  <td>
	一个 bundle 文件
  </td>
  <td>
	yes
  </td>
  <td>
	yes
  </td>
  <td>
	yes
  </td>
 </tr>

 <tr>
  <td>
	多个 bundle 文件，用于代码分割
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	间接 require
	<code>var r = require; r("./file");</code>
  </td>
  <td>
	整个目录
  </td>
  <td>
	通过配置引入
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	在 require 中的参数联合
	<code>require("./fi" + "le")</code>
  </td>
  <td>
	yes
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	require (local) 使用变量
	<code>require("./templates/"+template)</code>
  </td>
  <td>
	yes, 完整的目录引入
  </td>
  <td>
	通过配置引入
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	variables in require (global)
	<code>require(moduleName)</code>
  </td>
  <td>
	no
  </td>
  <td>
	通过配置引入
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	node buildin libs
	<code>require("http");</code>
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
  <td>
	yes
  </td>
 </tr>

 <tr>
  <td>
	<code>process</code> polyfill
  </td>
  <td>
	yes, on demand
  </td>
  <td>
	no
  </td>
  <td>
	yes, ever
  </td>
 </tr>

 <tr>
  <td>
	<code>module</code> polyfill
  </td>
  <td>
	yes, on demand
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	<code>require.resolve</code>
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
  <td>
	yes
  </td>
 </tr>

 <tr>
  <td>
	<code>global</code> to <code>window</code> mapping
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	requirable files
  </td>
  <td>
	filesystem
  </td>
  <td>
	directory scope
  </td>
  <td>
	filesystem
  </td>
 </tr>

 <tr>
  <td>
  不同的模块相同的名字
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
  <td>
	yes
  </td>
 </tr>

 <tr>
  <td>
	消除重复代码
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	require JSON
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	plugins
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
  <td>
	yes
  </td>
 </tr>

 <tr>
  <td>
	loaders
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
 </tr>

 <tr>
  <td>
	compile coffee script
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
  <td>
	yes
  </td>
 </tr>

 <tr>
  <td>
	watch mode
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
  <td>
	yes
  </td>
 </tr>

 <tr>
  <td>
	debug mode
  </td>
  <td>
	yes
  </td>
  <td>
	no
  </td>
  <td>
	yes
  </td>
 </tr>

 <tr>
  <td>
	libaries
  </td>
  <td>
	on global obj
  </td>
  <td>
	no
  </td>
  <td>
	requirable
  </td>
 </tr>

 <tr>
  <td>
	browser replacements
  </td>
  <td>
	<code>web_modules</code> and <code>.web.js</code>
  </td>
  <td>
	no
  </td>
  <td>
	by alias config option
  </td>
 </tr>

 <tr>
  <td>
	编译时缺少（可选）模块
  </td>
  <td>
	yes, emit warnings
  </td>
  <td>
	no
  </td>
  <td>
	no
  </td>
 </tr>
</table>


## Tests

您可以使用 `npm test` 运行单元测试。

您可以运行浏览器测试：

```
cd test/browsertests
node build
```

并在浏览器中打开`test.html`。文件中必须有几个 OK，没有 FAIL，也没有 RED 框。

## Contribution

欢迎您通过编写问题或拉取请求来做出贡献。

如果你开源你自己的 loader 或者 webmodules 那就太好了. :)

也欢迎您纠正任何拼写错误或任何语言问题
, 因为我的英语并不完美...

## Future plans

* node.js 内置模块的更多 polyfill，但可选
* `require("webpack/require-polyfill.install")` 为所有模块安装
* require 支持协议 `require("http://...")`
* 如果您有更多想法，请写一个问题...

## License

MIT (http://www.opensource.org/licenses/mit-license.php)