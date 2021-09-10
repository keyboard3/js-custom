/**
 * ***** 原语 *******
 * javaScript有三个非常常用的原语：string，number，和boolean。每个在 TypeScript 中都有对应的类型。
 * 如您所料，这些名称与您typeof在这些类型的值上使用 JavaScript运算符时看到的名称相同
 */

/**
 * ***** 数组 *******
 * 要指定像 一样的数组类型[1, 2, 3]，可以使用语法number[]; 此语法适用于 any 类型（例如string[]，字符串数组等）。
 * 你也可以看到这写成Array<number>，这意味着同样的事情。T<U>当我们介绍泛型时，我们将了解更多有关语法的信息
 */

/**
 * ***** any *******
 * 当一个值是 type 是 any，你可以访问它的任何属性（反过来又是 type any），像函数一样调用它，
 * 将它分配给（或从） any 类型的值，或者几乎任何其他语法上的东西合法的：
 * 当您不指定类型，并且 TypeScript 无法从上下文推断它时，编译器通常会默认为any.
 * 但是，您通常希望避免这种情况，因为any没有进行类型检查。使用编译器标志noImplicitAny将任何隐式标记any为错误。
 */

/**
 * ***** 变量上的类型注释 *******
 * 当您使用const, var, 或声明变量时let，您可以选择添加类型注释来显式指定变量的类型：
 * let myName: string = "Alice";
 * 但是，在大多数情况下，这不是必需的。只要有可能，TypeScript 就会尝试自动推断代码中的类型。例如，根据初始化器的类型推断变量的类型：
 * 大多数情况下，您不需要明确学习推理规则。如果您刚开始，请尝试使用比您想象的更少的类型注释 - 您可能会惊讶于 TypeScript 完全了解正在发生的事情所需的数量如此之少。
 */
// No type annotation needed -- 'myName' inferred as type 'string'
let myName = "Alice";

/**
 * ***** 函数 *******
 *
 *  "参数类型注释"
 * 声明函数时，可以在每个参数后添加类型注解，以声明函数接受的参数类型。参数类型注释位于参数名称之后：
 * 当参数具有类型注释时，将检查该函数的参数：
 * 即使您的参数上没有类型注释，TypeScript 仍会检查您是否传递了正确数量的参数。(默认推断 any)
 * 
 * "返回类型注释"
 * 您还可以添加返回类型注释。返回类型注释出现在参数列表之后：
 * 与变量类型注释非常相似，您通常不需要返回类型注释，因为 TypeScript 会根据其return语句推断函数的返回类型。
 * 上面例子中的类型注释不会改变任何东西。某些代码库会出于文档目的明确指定返回类型，以防止意外更改，或仅出于个人喜好。
 */
function getFavoriteNumber(): number {
  return 26;
}
/**
 * "匿名函数
 * 匿名函数与函数声明有点不同。当一个函数出现在 TypeScript 可以确定它将如何被调用的地方时，该函数的参数会自动指定类型。
 * 即使参数s没有类型注释，TypeScript 也会使用forEach函数的类型以及数组的推断类型来确定类型s将具有。
 * 这个过程称为上下文类型，因为函数发生在其中的上下文通知它应该具有什么类型。
 * 与推理规则类似，您不需要明确了解这是如何发生的，但了解它确实发生可以帮助您注意何时不需要类型注释。
 */
// No type annotations here, but TypeScript can spot the bug
const names = ["Alice", "Bob", "Eve"];
names.forEach(function (s) {
  console.log(s.toUpperCase());
});
names.forEach((s) => {
  console.log(s.toUpperCase());
});

/**
 * ***** 对象类型 *******
 * 除了基出原语类型，您将遇到的最常见的类型是对象类型。这指的是任何带有属性的 JavaScript 值，几乎是所有属性！要定义对象类型，我们只需列出其属性及其类型。
 * 在这里，我们使用具有两个属性（x 和 y）的类型来注释参数，这两个属性都是 number 类型。您可以使用 , 或 ;分隔属性，最后一个分隔符是可选的
 * 每个属性的类型部分也是可选的。如果您不指定类型，则将假定为 any 类型。
 */
// The parameter's type annotation is an object type
function printCoord(pt: { x: number; y: number }) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });

/**
 * "可选属性"
 * 对象类型还可以指定其部分或全部属性是可选的。为此，添加一个 ?在属性名称之后：
 */
function printName(obj: { first: string; last?: string }) {
  // ...
}
// Both OK
printName({ first: "Bob" });
printName({ first: "Alice", last: "Alisson" });
/**
 * 在 JavaScript 中，如果您访问一个不存在的属性，您将获得 undefined 值而不是运行时错误。
 * 因此，当您从可选属性中读取时，您必须在使用它之前检查 undefined。
 */
function printName(obj: { first: string; last?: string }) {
  // Error - might crash if 'obj.last' wasn't provided!
  console.log(obj.last.toUpperCase());
  if (obj.last !== undefined) {
    // OK
    console.log(obj.last.toUpperCase());
  }
  // A safe alternative using modern JavaScript syntax:
  console.log(obj.last?.toUpperCase());
}

/**
 * ***** 联合类型 *******
 * TypeScript 的类型系统允许您使用多种运算符从现有类型中构建新类型。现在我们知道如何编写几种类型，是时候开始以有趣的方式组合它们了。
 *
 * "定义联合类型"
 * 您可能会看到的第一种组合类型的方法是联合类型。联合类型是由两个或多个其他类型组成的类型，表示可能是这些类型中的任何一种的值。我们将这些类型中的每一种都称为联合的成员。
 */
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
// OK
printId(101);
// OK
printId("202");
// Error
printId({ myID: 22342 });

/**
 * "使用联合类型"
 * 提供一个匹配联合类型的值很容易——只需提供一个匹配联合任何成员的类型。如果你有一个联合类型的值，你如何使用它？
 * 如果联合的每个成员都有效，TypeScript 将只允许你使用联合做一些事情。例如，如果您有联合字符串 |数字，您不能使用仅适用于字符串的方法：
 */
function printId(id: number | string) {
  console.log(id.toUpperCase());
}
/**
 * 解决方案是用代码缩小联合，就像在没有类型注释的 JavaScript 中一样。当 TypeScript 可以根据代码结构为值推断出更具体的类型时，就会发生缩小。
 * 例如，TypeScript 知道只有一个字符串值才会有一个 typeof 值“string”：
 */
function printId2(id: number | string) {
  if (typeof id === "string") {
    // In this branch, id is of type 'string'
    console.log(id.toUpperCase());
  } else {
    // Here, id is of type 'number'
    console.log(id);
  }
}
/**
 * 另一个例子是使用像 Array.isArray 这样的函数：
 */
function welcomePeople(x: string[] | string) {
  if (Array.isArray(x)) {
    // Here: 'x' is 'string[]'
    console.log("Hello, " + x.join(" and "));
  } else {
    // Here: 'x' is 'string'
    console.log("Welcome lone traveler " + x);
  }
}
/**
 * 请注意，在 else 分支中，我们不需要做任何特殊的事情——如果 x 不是 string[]，那么它一定是一个 string。
 * 有时你会有一个 Union，所有成员都有一些共同点。例如，数组和字符串都有slice方法。如果联合中的每个成员都有一个共同的属性，则可以使用该属性而不会缩小范围：
 * number | string 是通过取每种类型的值的并集而组成的。请注意，给定两个集合，每个集合都有相应的事实，只有这些事实的交集适用于集合本身的并集
 */
function getFirstThree(x: number[] | string) {
  return x.slice(0, 3);
}

/**
 * *****  type  *******
 * 我们一直在通过直接在类型注释中编写对象类型和联合类型来使用它们。这很方便，但是想要多次使用同一个类型并用一个名称来引用它是很常见的。
 *  type 是 - 任何类型的名称。 type 的语法是：
 */
type Point2 = {
  x: number;
  y: number;
};
// Exactly the same as the earlier example
function printCoord2(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord2({ x: 100, y: 100 });

/** 实际上，您可以使用 type 为任何类型命名，而不仅仅是对象类型。例如， type 可以命名联合类型： */
type ID = number | string;

/**
 * 请注意，别名只是别名 - 您不能使用 type 来创建相同类型的不同/不同“版本”。当您使用别名时，就像您编写了别名类型一样。
 * 换句话说，这段代码可能看起来不合法，但根据 TypeScript 是可以的，因为这两种类型都是同一类型的别名：
 */
type UserInputSanitizedString = string;

function sanitizeInput(str: string): UserInputSanitizedString {
  return sanitize(str);
}

// Create a sanitized input
let userInput = sanitizeInput(getInput());

// 仍然可以用字符串重新分配
userInput = "new input";

/**
 * *****  interfaece  *******
 *  interfaece 声明是另一种命名对象类型的方法：
 */
interface Point {
  x: number;
  y: number;
}

function printCoord3(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}

printCoord3({ x: 100, y: 100 });

/**
 * 就像我们在上面使用 type 时一样，该示例就像我们使用了匿名对象类型一样工作。 
 * TypeScript 只关心我们传递给 printCoord3 的值的结构——它只关心它是否具有预期的属性。
 * 只关心类型的结构和功能是我们将 TypeScript 称为结构类型类型系统的原因。
 */

/**
 * "type 和 interfaece 之间的差异"
 *  type 和 interfaece 非常相似，在很多情况下你可以自由选择它们。 interfaece 的几乎所有功能都在 type 中可用，
 * 关键区别在于 type 不能重新打开以添加​​新属性与始终可扩展的 interface。
 */
/** Interface  扩展 */
function getBear() {
  return { name: "", honey: false }
}
interface Animal {
  name: string
}
interface Bear extends Animal {
  honey: boolean
}
const bear = getBear()
bear.name
bear.honey
/** Type  扩展 */
type Animal1 = {
  name: string
}
type Bear1 = Animal & {
  honey: boolean
}
const bear1 = getBear();
bear.name;
bear.honey;

/** 添加新字段到已存在的 interface 中 */
interface Window {
  title: string
}
interface Window {
  ts: string;
}
const src = 'const a = "Hello World"';
window.ts = "hello";
/** type 创建之后不能改变 */
type Window2 = {
  title: string
}
type Window2 = {
  ts: string
}

// Error: Duplicate identifier 'Window'.

/**
 * ***** type 断言 *******
 * 有时您会获得有关 TypeScript 不知道的值类型的信息。
 * 例如，如果你使用 document.getElementById，TypeScript 只知道这会返回某种 HTMLElement，但你可能知道你的页面总是有一个带有给定 ID 的 HTMLCanvasElement。
 */
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
/**
 * 与类型注释一样，类型断言由编译器删除，不会影响代码的运行时行为。
 * 您还可以使用尖括号语法（除非代码在 .tsx 文件中），它是等效的：
 * 提醒：因为类型断言在编译时被移除，所以没有与类型断言相关联的运行时检查。如果类型断言错误，则不会产生异常或空值。
 */
const myCanvas2 = <HTMLCanvasElement>document.getElementById("main_canvas");
/** 
 * TypeScript 只允许类型断言转换为更具体或不太具体的类型版本。此规则可防止“不可能”的强制，例如：
 * 有时，此规则可能过于保守，并且会禁止可能有效的更复杂的强制转换。如果发生这种情况，您可以使用两个断言，首先是 any（或未知，我们将在后面介绍），然后是所需的类型：
 */
const x = "hello" as number;
const a = (expr as any) as T;

/**
 * ***** 字面量类型 *******
 * ”字符串字面量类型“
 * 除了一般类型的字符串和数字外，我们还可以在类型位置引用特定的字符串和数字。
 * 考虑这一点的一种方法是考虑 JavaScript 如何以不同的方式声明变量。 var 和 let 都允许更改变量中保存的内容，而 const 则不允许。这反映在 TypeScript 如何为文字创建类型上。
 */
let changingString = "Hello World";
changingString = "Olá Mundo";
// Because `changingString` can represent any possible string, that
// is how TypeScript describes it in the type system
changingString;

const constantString = "Hello World";
// Because `constantString` can only represent 1 possible string, it
// has a literal type representation
constantString;
/** 就其本身而言，字面量类型并不是很有价值：*/
{
  let x: "hello" = "hello";
  // OK
  x = "hello";
  // ...
  x = "howdy";
}
/**
 * 但是通过将文字组合成联合，你可以表达一个更有用的概念——例如，只接受一组特定已知值的函数：
 * 拥有一个只能有一个值的变量并没有多大用处！
 */
function printText(s: string, alignment: "left" | "right" | "center") {
  // ...
}
printText("Hello, world", "left");
printText("G'day, mate", "centre")
/** "数字字面量类型" */
function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1;
}
/** 当然，您可以将这些与非字面量类型结合使用： */
interface Options {
  width: number;
}
function configure(x: Options | "auto") {
  // ...
}
configure({ width: 100 });
configure("auto");
configure("automatic");
/**
 * "bool字面量类型"
 * 还有一种字面量类型：布尔。只有两种bool 字面量类型，正如您可能猜到的，它们是 true 和 false 类型。类型 boolean 本身实际上只是 union true | 的别名。错误的。
 */

/**
 * ***** 字面量引用 *******
 * 当您使用对象初始化变量时，TypeScript 假定该对象的属性稍后可能会更改值。例如，如果你写了这样的代码：
 */
const obj2 = { counter: 0 };
if (1) {
  obj2.counter = 1;
}
/**
 * TypeScript 不认为将 1 分配给以前为 0 的字段是错误的。另一种说法是 obj.counter 必须具有类型 number，而不是 0，因为类型用于确定读取和写入行为。
 * 同样适用于字符串
 */
function handleRequest(url: string, method: "GET" | "POST") { }
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
/**
 * 在上面的例子中，req.method 被推断为字符串，而不是“GET”。因为代码可以在 req 的创建和 handleRequest 的调用之间进行评估，
 * 它可以为 req.method 分配一个像“GUESS”这样的新字符串，TypeScript 认为这段代码有错误。
 */
/** 您可以通过在任一位置添加类型断言来更改推理 */
// Change 1 表示“我打算让 req.method 始终具有文字类型“GET””，从而防止在此之后将“GUESS”分配给该字段
const req2 = { url: "https://example.com", method: "GET" as "GET" };
// Change 2 表示“我知道出于其他原因 req.method 具有值“GET””
handleRequest(req.url, req.method as "GET");
/** 您可以使用 as const 将整个对象转换为类型字面量： */
const req3 = { url: "https://example.com", method: "GET" } as const;
handleRequest(req.url, req3.method);
/** as const 后缀的作用类似于 const，但对于类型系统，确保为所有属性分配字面量类型，而不是更通用的版本，如字符串或数字。*/

/**
 * ***** null 和 undefined *******
 * JavaScript 有两个原始值用于表示不存在或未初始化的值：null 和 undefined。
 * TypeScript 有两个对应的同名类型。这些类型的行为取决于您是否启用了 strictNullChecks 选项。
 * 
 * ”关闭strictNullChecks“
 * 仍然可以正常访问可能为null 或undefined 的值，并且可以将值null 和undefined 分配给任何类型的属性。
 * 这类似于没有空检查的语言（例如 C#、Java）的行为方式。缺乏对这些值的检查往往是错误的主要来源；如果在他们的代码库中这样做可行，我们总是建议人们打开 strictNullChecks。
 * 
 * ”启用strictNullChecks“
 * 当值为空或未定义时，您需要在对该值使用方法或属性之前测试这些值。就像在使用可选属性之前检查 undefined 一样，我们可以使用缩小来检查可能为 null 的值：
 */
function doSomething(x: string | null) {
  if (x === null) {
    // do nothing
  } else {
    console.log("Hello, " + x.toUpperCase());
  }
}
/**
 * "非空断言运算符!"
 * TypeScript 也有一种特殊的语法，可以在不进行任何显式检查的情况下从类型中删除 null 和 undefined。写作 ！在任何表达式实际上是一个类型断言之后，该值不为空或未定义：
 * 就像其他类型断言一样，这不会改变代码的运行时行为，因此仅使用 !当您知道该值不能为空或未定义时。
 */
function liveDangerously(x?: number | null) {
  // No error
  console.log(x!.toFixed());
}

/**
 * ***** 枚举 *******
 * 枚举是 TypeScript 添加到 JavaScript 的一项功能，它允许描述一个值，该值可能是一组可能的命名常量之一。
 * 与大多数 TypeScript 功能不同，这不是 JavaScript 的类型级别添加，而是添加到语言和运行时的内容。
 * 因此，这是一个您应该知道存在的功能，但除非您确定，否则请不要使用。您可以在枚举参考页面中阅读有关枚举的更多信息。
 */

/**
 * ***** 不太常见的原语 *******
 * 值得一提的是 JavaScript 中在类型系统中表示的其他原语。虽然我们不会在这里深入。
 */
/**
 * ""bigint"
 * 从 ES2020 开始，JavaScript 中有一个用于非常大整数的原语 BigInt：
 */
// Creating a bigint via the BigInt function
const oneHundred: bigint = BigInt(100);
// Creating a BigInt via the literal syntax
const anotherHundred: bigint = 100n;
/**
 * "Symbol"
 * JavaScript 中有一个原语用于通过函数 Symbol() 创建全局唯一引用：
 */
const firstName = Symbol("name");
const secondName = Symbol("name");
if (firstName === secondName) {
}