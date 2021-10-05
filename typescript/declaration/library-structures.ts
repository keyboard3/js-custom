/**
  库结构
  从广义上讲，您构建声明文件的方式取决于库的使用方式。在 JavaScript 中提供库供使用的方法有很多种，您需要编写声明文件来匹配它。
本指南介绍了如何识别公共库模式，以及如何编写与该模式对应的声明文件。
  每种类型的主要库结构模式在模板部分都有一个相应的文件。您可以从这些模板开始，以帮助您更快地前进。
 */
/**
  识别库的种类
  首先，我们将回顾 TypeScript 声明文件可以表示的库类型。我们将简要展示每种库的使用方式、编写方式，并列出一些来自现实世界的示例库。
  确定库的结构是编写其声明文件的第一步。我们将提供有关如何根据其用法和代码识别结构的提示。根据库的文档和组织，一个可能比另一个更容易。
我们建议使用您觉得更舒服的那个。
 */
/**
  你应该找什么？
  在查看您正在尝试输入的库时要问自己的问题。
    1. 你如何获得库的？例如，您只能通过 npm 或仅从 CDN 获取它吗？
    2. 你会如何导入它？它是否添加了一个全局对象？它使用 require 或 import/export 语句吗？
 */
/**
  不同类型库的较小样本
  模块化库
  几乎每个现代 Node.js 库都属于模块家族。这些类型的库只能在带有模块加载器的 JS 环境中工作。例如，express 只适用于 Node.js，必须使用 CommonJS 的 require 函数加载。
  ECMAScript 2015（也称为 ES2015、ECMAScript 6 和 ES6）、CommonJS 和 RequireJS 具有类似的导入模块的概念。
  
  例如，在 JavaScript CommonJS (Node.js) 中，您将编写
    var fs = require("fs");
  在 TypeScript 或 ES6 中，import 关键字具有相同的用途：
    import * as fs from "fs";
  您通常会看到模块化库在其文档中包含以下行之一：
    var someLib = require("someLib");
    or
    define(..., ['someLib'], function(someLib) {
    });
  与全局模块一样，您可能会在 UMD 模块的文档中看到这些示例，因此请务必检查代码或文档。
 */
/**
  从代码中识别模块库
	模块化库通常至少具有以下一些内容：
		. 无条件调用 require or define
		. 声明像 import * as a from 'b'; or export c;
	他们很少有对 window or global 属性赋值
 */
/**
  模块模板
	模块有四个模板可用，module.d.ts、module-class.d.ts、module-function.d.ts 和 module-plugin.d.ts。
	您应该首先阅读 module.d.ts 以了解它们的工作方式。
	
	如果您的模块可以像函数一样调用，则使用模板 module-function.d.ts：
		const x = require("foo");
		// Note: calling 'x' as a function
		const y = x(42);
	
	如果您的模块可以使用 new 构建，请使用模板 module-class.d.ts：
		const x = require("bar");
		// Note: using 'new' operator on the imported variable
		const y = new x("hello");
	
	如果您有一个模块在导入时对其他模块进行更改，请使用模板 module-plugin.d.ts：
		const jest = require("jest");
		require("jest-matchers-files");
 */
/**
  全局库
	全局库是可以从全局范围访问的库（即不使用任何形式的导入）。
	许多库只是公开一个或多个全局变量以供使用。例如，如果您使用的是 jQuery，则可以通过简单地引用 $ 变量来使用它：
		$(() => {
			console.log("hello!");
		});
	您通常会在全局库的文档中看到有关如何在 HTML 脚本标签中使用该库的指南：
		<script src="http://a.great.cdn.for/someLib.js"></script>
	今天，大多数流行的全局可访问库实际上都写成 UMD 库（见下文）。
 */
/**
  从代码中识别全局库
    全局库代码通常非常简单。一个全局的“Hello, world”库可能如下所示：
			function createGreeting(s) {
				return "Hello, " + s;
			}
		或者像这样：
			// Web
			window.createGreeting = function (s) {
				return "Hello, " + s;
			};
			// Node
			global.createGreeting = function (s) {
				return "Hello, " + s;
			};
			// Potentially any runtime
			globalThis.createGreeting = function (s) {
				return "Hello, " + s;
			};
		在查看全局库的代码时，您通常会看到：
			. 顶级 var 语句或函数声明
			. 对 window.someName 的一项或多项赋值
			. DOM 原语的假设 document or window 存在
		你不会看到：
			. 检查或使用像 require 或 define 这样的模块加载器
			. 形式为 var fs = require("fs"); 的 CommonJS/Node.js 风格的导入；
			. define(...)
			. 描述如何 require 或 import 库的文档

		全局库的例子
		因为通常很容易将全局库变成 UMD 库，所以很少有流行的库仍然以全局风格编写。
		但是，小型且需要 DOM（或没有依赖项）的库可能仍然是全局的。

		全局库模板
		模板文件 global.d.ts 定义了一个示例库 myLib。请务必阅读“防止名称冲突”脚注。
 */

/**
 	UMD
  UMD 模块既可以用作模块（通过导入），也可以用作全局模块（在没有模块加载器的环境中运行时）
	许多流行的库，例如 Moment.js，都是以这种方式编写的。例如，在 Node.js 或使用 RequireJS 中，您将编写：
		import moment = require("moment");
		console.log(moment.format());
	而在普通浏览器环境中，您将编写：
		console.log(moment.format());
	
	识别 UMD 库
	UMD 模块检查模块加载器环境的存在。这是一个很容易发现的模式，看起来像这样：
		(function (root, factory) {
			if (typeof define === "function" && define.amd) {
					define(["libName"], factory);
			} else if (typeof module === "object" && module.exports) {
					module.exports = factory(require("libName"));
			} else {
					root.returnExports = factory(root.libName);
			}
		}(this, function (b) {
	如果你在库的代码中看到 typeof define、typeof window 或 typeof 模块的测试，特别是在文件的顶部，它几乎总是一个 UMD 库。
	UMD 库的文档通常还会演示一个“在 Node.js 中使用”示例显示 require 和一个“在浏览器中使用”示例显示使用 <script> 标签加载脚本。

	UMD 库示例
  大多数流行的库现在都以 UMD 包的形式提供。示例包括 jQuery、Moment.js、lodash 等等。

	模板
	使用 module-plugin.d.ts 模板。
 */
/**
  消耗依赖
  您的库可能具有多种依赖项。本节展示如何将它们导入到声明文件中。
 */
/**
  对全局库的依赖
  如果您的库依赖于全局库，请使用 /// <reference types="..." /> 指令：
		/// <reference types="someLib" />
		function getThing(): someLib.thing;
 */
/**
  对模块的依赖
  如果您的库依赖于某个模块，请使用导入语句：
	  import * as moment from "moment";
		function getThing(): moment;
 */
/**
  对 UMD 库的依赖
  来自全局库的
	如果您的全局库依赖于 UMD 模块，请使用 /// <reference types 指令：
		/// <reference types="moment" />
		function getThing(): moment;
	
	来自模块或 UMD 库
	如果您的模块或 UMD 库依赖于 UMD 库，请使用导入语句：
		import * as someLib from "someLib";
  不要使用 /// <reference 指令来声明对 UMD 库的依赖！
 */
/**
  脚注
	防止名称冲突
	请注意，在编写全局声明文件时，可以在全局范围内定义多种类型。我们强烈反对这样做，因为当一个项目中有许多声明文件时，它可能会导致无法解决的名称冲突。
  要遵循的简单规则是仅声明由库定义的任何全局变量命名的类型。例如，如果库定义了全局值“cats”，你应该写
		declare namespace cats {
			interface KittySettings {}
		}
	但不是
		// at top-level
		interface CatsKittySettings {}
	该指南还确保可以在不破坏声明文件用户的情况下将库转换为 UMD。
 */
/**
	ES6 对模块调用签名的影响
	  许多流行的库，例如 Express，在导入时将自己公开为可调用函数。例如，典型的 Express 用法如下所示：
			import exp = require("express");
			var app = exp();
		在符合 ES6 的模块加载器中，顶级对象（这里作为 exp 导入）只能有属性；顶级模块对象永远无法调用。
		这里最常见的解决方案是为可调用/可构造对象定义 default 导出；
		模块加载器通常会自动检测这种情况并用 default 导出替换顶级对象。
		如果您的 tsconfig.json 中有 "esModuleInterop": true，TypeScript 可以为您处理这个问题。
 */