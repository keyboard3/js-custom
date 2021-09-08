/**
 * ***** 静态类型检查 *******
 *   静态类型系统描述了当我们运行程序时我们的值的形状和行为（预期）。
 * ts 这样的类型检查器使用这些信息来在代码运行之前告诉我们代码中的错误
 */

/**
 * ***** 非故障异常 *******
 *  ES 规范中明确说明了语言在遇到意外情况下如何表现。但 JS 引擎并没有严格遵守这些行为。
 * 比如规范要求在尝试调用不可调用的东西应该抛出错误，但 JS 却是返回 undefined。
 *  静态类型系统会将即使不会立刻出现异常的有效 JS 代码标记为错误。
 */
var user = {
  name: "Daniel",
  age: 25
}
user.location;

/** ts 捕获了很多合法的错误 */
/** 错误书写 */
var announcement = "Hello World!";
// 你很快发现很多错别字
announcement.toLocaleLowercase();
announcement.toLocalLowerCase();
// 我们可能正确的想写这个
announcement.toLocaleLowerCase();

/** 未调用的函数 */
function flipCoin() {
  return Math.random < 0.5;
}

/** 基础逻辑错误 */
var value = Math.random() < 0.5 ? "a" : "b";
if (value !== "a") {
  //...
} else if (value == "b") {
  // 这块逻辑无法访问
}

/**
 * ***** 类型工具 *******
 *  ts 可以在当我们犯错时捕获错误，还可以在犯错的第一时间给出修正建议。
 *  类型检查器有信息来检查比如我们正在访问变量和其他属性的正确属性，一旦有了
 * 这些信息，它还可以开始建议您可能想要使用的属性。
 *  核心类型检查器可以在你编辑器输入的时提供错误消息和代码自动填充。这个能力经常被人提到
 *  ts 除了键入时的错误提示及代码自动填充，还提供”快速修复“自动修复错误、重构轻松组织代码、
 * 跳转到变量定义或查找给定变量的所有引用的有用导航功能。
 */

/**
 * ***** tsc, ts 的编译器 *******
 *  tsc 类型检查器默认情况下会打印错误，但不会阻止 ts 代码的转义。ts 的核心价值观之一是你比它更了解自己
 *  重申一下，类型检查会限制代码能够运行的case, 所以需要平衡类型检查可以接受的case。大多数情况这没有问题
 *  在从 JS 向 TS 迁移的过程中，原来的代码可以运行，因为检查错误不让编译通过，不合适
 *  当个人能力可以驾驭这些错误时，可以要求 ts 严格一点，使用 --noEmitOnError 编译选项，就不会编译生成 js
 */

/**
 * ***** 显示类型 *******
 *  记住我们不需要总是显示的加类型注释，在很多情况下 ts 是可以推断出实际类型的。当类型系统最终会推断出相同的类型时，
 * 最好不要添加类型描述。
 */

/**
 * ***** 擦除类型 *******
 *  类型注释不是 ES 规范的一部分，没有任何浏览器或运行时可以不加修饰地运行 ts。这也是 ts 需要编译器的原因-它需要某种方式
 * 来剥离或者转换任何 ts 特定的代码。大多数 ts 特定代码都被删除，同样，类型注释也会被完全删除
 */

/**
 * ***** 降级 *******
 * ts 默认翻译目标是 ES3, 可以通过 --target 标记指定目标 ES 版本, --target es2015 表示目标环境支持 ES2015
 * 现在大多数浏览器都支持 ES2015 了，除非需要兼容非常古老的浏览器
 */

/**
 * ***** 严格 *******
 *  ts 默认类型是可选的，推理采用最宽松的类型(any)，并检查潜在的 null/undefined 情况。如果正在迁移项目，是理想的第一步
 *  ts 有几个可以开关类型检查严格标志，除非另有说明，否则我们所有的示例都将在启用这些标志的情况下编写。
 * CLI 中的 --strict 标志，或 tsconfig.json 中的 "strict":true 同时切换它们。
 * 还可以通过 noImplicityAny 和 strictNullChecks 来独立控制它们
 */

/*
 * "noImplicitAny"
 * 使用 any 不会出现什么影响，只是让开发体验回到了原始的 js, 但是这违背了 ts 的初衷。打开 noImplicitAny 将对推断出 any 地方认为错误
 */
function fn(s) {
  // No error?
  console.log(s.subtr(3));
}
fn(42);

/*
 * "strictNullChecks"
 * 默认任何类型都接受 null 和 undefined，但是忘记处理 null 和 undefined 会造成许多 bug
 * strictNullChecks 标记让 null 和 undefined 处理更加明确，不会忘记处理它们
 */
declare const loggedInUsername: string;

const users = [
  { name: "Oby", age: 12 },
  { name: "Heera", age: 32 },
];

const loggedInUser = users.find((u) => u.name === loggedInUsername);
console.log(loggedInUser.age);