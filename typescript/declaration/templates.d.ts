
/**
 Modules .d.ts
  将 JavaScript 与示例 DTS 进行比较
  常见的 CommonJS 模式
  使用 CommonJS 模式的模块使用 module.exports 来描述导出的值, 例如，这是一个导出函数和数值常量的模块：
    const maxInterval = 12;
    function getArrayLength(arr: any) {
      return arr.length;
    }
    module.exports = {
      getArrayLength,
      maxInterval,
    };
*/
/** 这可以通过以下 .d.ts 来描述： */
export function getArrayLength(arr: any[]): number;
export const maxInterval2: 12;
/**
  .d.ts 语法有意看起来像 ES Modules 语法。 ES Modules 在 2019 年被 TC39 批准，虽然它已经通过转译器提供了很长时间，
但是如果你有一个使用 ES Modules 的 JavaScript 代码库：
    export function getArrayLength(arr) {
      return arr.length;
    }
  这将具有以下 .d.ts 等效项：
    export function getArrayLength(arr: any[]): number;
 */
/**
  默认导出
  在 CommonJS 中，您可以导出任何值作为默认导出，例如这里是一个正则表达式模块：
    module.exports = /hello( world)?/;
  可以用以下 .d.ts 来描述：
    declare const helloWorld: RegExp;
    export default helloWorld;
  或一个数字：
    module.exports = 3.142;

    declare const pi: number;
    export default pi;

  CommonJS 中的一种导出方式是导出函数。因为函数也是一个对象，所以可以添加额外的字段并将其包含在导出中。
    function getArrayLength(arr) {
      return arr.length;
    }
    getArrayLength.maxInterval = 12;
    module.exports = getArrayLength;
  可以用以下方式描述：
    export default function getArrayLength(arr: any[]): number;
    export const maxInterval: 12;

  请注意，在 .d.ts 文件中使用 export default 需要 esModuleInterop: true 才能工作。如果您的项目中不能有 esModuleInterop: true，
例如当您向绝对类型提交 PR 时，您将不得不改用 export= 语法。这种较旧的语法更难使用，但适用于任何地方。以下是必须使用 export= 编写上述示例的方式：
    declare function getArrayLength(arr: any[]): number;
    declare namespace getArrayLength {
      declare const maxInterval: 12;
    }
    export = getArrayLength;
  有关其工作原理的详细信息，请参阅模块：函数以及模块参考页面。
 */
/**
  处理许多消费 import
  有很多方法可以在现代消费代码中导入模块：
    const fastify = require("fastify");
    const { fastify } = require("fastify");
    import fastify = require("fastify");
    import * as Fastify from "fastify";
    import { fastify, FastifyInstance } from "fastify";
    import fastify from "fastify";
    import fastify, { FastifyInstance } from "fastify";

  涵盖所有这些情况需要 JavaScript 代码实际支持所有这些模式。为了支持许多这些模式，CommonJS 模块需要看起来像：
  class FastifyInstance {}
  function fastify() {
    return new FastifyInstance();
  }
  fastify.FastifyInstance = FastifyInstance;
  // Allows for { fastify }
  fastify.fastify = fastify;
  // Allows for strict ES Module support
  fastify.default = fastify;
  // Sets the default export
  module.exports = fastify;
 */
/**
  模块中的类型
  您可能希望为不存在的 JavaScript 代码提供类型
    function getArrayMetadata(arr) {
      return {
        length: getArrayLength(arr),
        firstObject: arr[0],
      };
    }
    module.exports = {
      getArrayMetadata,
    };
  这可以描述为：
 */
export type ArrayMetadata = {
  length: number;
  firstObject: any | undefined;
};
export function getArrayMetadata(arr: any[]): ArrayMetadata;
/**
  现在数组的类型传播到 ArrayMetadata 类型。
  然后，模块的使用者可以使用 TypeScript 代码或 JSDoc 导入中的 import or import type 重新使用导出的类型。
 */
/**
  模块代码中的命名空间
  试图描述 JavaScript 代码的运行时关系可能很棘手。当类似 ES 模块的语法没有提供足够的工具来描述导出时，您可以使用命名空间。
  例如，您可能有足够复杂的类型来描述您选择在 .d.ts 中命名它们：
 */
// 这表示在运行时可用的 JavaScript 类
export class API {
  constructor(baseURL: string);
  getInfo(opts: API.InfoRequest): API.InfoResponse;
}
// 此命名空间与 API 类合并，并允许使用者和此文件具有嵌套在它们自己的部分中的类型。
declare namespace API {
  export interface InfoRequest {
    id: string;
  }
  export interface InfoResponse {
    width: number;
    height: number;
  }
}
//要了解名称空间如何在 .d.ts 文件中工作，请阅读 .d.ts 深入了解。 https://www.typescriptlang.org/docs/handbook/declaration-files/deep-dive.html
/**
  可选的全局使用
  您可以使用 export as namespace 来声明您的模块将在 UMD 上下文中的全局范围内可用：
    export as namespace moduleName;
 */
/**
  参考示例
  为了让您了解所有这些部分是如何组合在一起的，这里有一个参考 .d.ts 在制作新模块时开始
 */
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>
/*~ 这是模块模板文件。您应该将其重命名为 index.d.ts
 *~ 并将其放在与模块同名的文件夹中。
 *~ 例如，如果你正在为“super-greeter”编写一个文件，这个文件应该是“super-greeter/index.d.ts”
 */
/*~ 如果此模块是在模块加载器环境之外加载时公开全局变量“myLib”的 UMD 模块，请在此处声明全局变量
 *~ 否则，删除此声明。
 */
export as namespace myLib;
/*~ 如果此模块导出函数，请像这样声明它们。
 */
export function myFunction(a: string): string;
export function myOtherFunction(a: number): number;
/*~ 您可以通过导入模块来声明可用的类型 */
export interface SomeType {
  name: string;
  length: number;
  extras?: string[];
}
/*~ 您可以使用 const、let 或 var 声明模块的属性 */
export const myField: number;

/**
  库文件布局
  声明文件的布局应该反映库的布局。
  一个库可以由多个模块组成，例如
    myLib
    +---- index.js
    +---- foo.js
    +---- bar
          +---- index.js
          +---- baz.js
  这些可以导入为
    var a = require("myLib");
    var b = require("myLib/foo");
    var c = require("myLib/bar");
    var d = require("myLib/bar/baz");
  因此，您的声明文件应该是
  @types/myLib
  +---- index.d.ts
  +---- foo.d.ts
  +---- bar
         +---- index.d.ts
         +---- baz.d.ts
 */
/**
  测试你的类型
  如果您打算将这些更改提交给绝对类型化供所有人也使用，那么我们建议您：
    1. 在 node_modules/@types/[libname] 中创建一个新文件夹
    2. 在该文件夹中创建一个 index.d.ts，并将示例复制到
    3. 看看你对模块的使用在哪里中断，并开始填写 index.d.ts
    4. 如果您满意，请克隆绝对类型/绝对类型并按照自述文件中的说明进行操作。
  除此以外
    1. 在源代码树的根目录中创建一个新文件：[libname].d.ts
    2. 添加 declare module "[libname]" { }
    3. 在声明模块的大括号内添加模板，看看你的用法在哪里中断
 */