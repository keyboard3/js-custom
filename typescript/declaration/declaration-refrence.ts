/**
 * 本指南的目的是教您如何编写高质量的定义文件。本指南的结构是显示某些 API 的文档，以及该 API 的示例用法，并解释如何编写相应的声明。
 * 这些示例按复杂性大致递增的顺序排列。
 */
/**
 * ***** 具有属性的对象 *******
 * 全局变量 myLib 有一个函数 makeGreeting 用于创建Greeting，以及一个属性 numberOfGreetings 指示到目前为止所做的Greeting的数量。
 */
let result = myLib.makeGreeting("hello, world");
console.log("The computed greeting is:" + result);
let count = myLib.numberOfGreetings;
/**
 * 使用declare 命名空间来描述通过点分表示法访问的类型或值。
 */
declare namespace myLib {
  function makeGreeting(s: string): string;
  let numberOfGreetings: number;
}
/**
 * ***** 重载函数 *******
 * getWidget 函数接受一个数字并返回一个 Widget，或者接受一个字符串并返回一个 Widget 数组。
 */
type Widget = {}
{
  let x: Widget = getWidget(43);
  let arr: Widget[] = getWidget("all of them");
}
//声明
declare function getWidget(n: number): Widget;
declare function getWidget(s: string): Widget[];

/**
 * ***** 可重用类型（接口） *******
 * 指定Greeting时，必须传递 GreetingSettings 对象。该对象具有以下属性：
 * 1 - greeting: 必填字符串
 * 2 - duration：可选的时间长度（以毫秒为单位）
 * 3 - color：可选字符串，例如'#ff00ff'
 */
greet({
  greeting: "hello world",
  duration: 4000
});
//声明
interface GreetingSettings {
  greeting: string;
  duration?: number;
  color?: string;
}
declare function greet(setting: GreetingSettings): void;

/**
 * ***** 可重用类型（类型别名） *******
 * 在任何需要Greeting的地方，您都可以提供一个字符串、一个返回字符串的函数或一个 Greeter 实例。
 */
function getGreeting() {
  return "howdy";
}

class Greeter1 { }
class MyGreeter extends Greeter1 { }
greet("hello");
greet(getGreeting);
greet(new MyGreeter());

/** 您可以使用类型别名为类型进行速记： */
type GreetingLike = string | (() => string) | MyGreeter;
declare function greet(g: GreetingLike): void;

/**
 * ***** 组织类型 *******
 * greeter对象可以log到文件或显示警报。您可以向 .log(...) 提供 LogOptions，向 .alert(...) 提供警报选项
 */
class Greeter {
  constructor(val: string) { }
  log: (options: GreetingLib.LogOptions) => void;
  alert: (options: GreetingLib.AlertOptions) => void
}

const g = new Greeter("Hello");
g.log({ verbose: true });
g.alert({ modal: false, title: "Current Greeting" });
/** 使用命名空间来组织类型。 */
declare namespace GreetingLib {
  interface LogOptions {
    verbose?: boolean;
  }
  interface AlertOptions {
    modal: boolean;
    title?: string;
    color?: string;
  }
}
/** 您还可以在一个声明中创建嵌套命名空间： */
declare namespace GreetingLib.Options {
  // Refer to via GreetingLib.Options.Log
  interface Log {
    verbose?: boolean;
  }
  interface Alert {
    modal: boolean;
    title?: string;
    color?: string;
  }
}

/**
 * ***** 类 *******
 * 您可以通过实例化 Greeter 对象来创建Greeter，或者通过从它扩展来创建定制的Greeter。
 */
const myGreeter = new Greeter2("hello, world");
myGreeter.greeting = "howdy";
myGreeter.showGreeting();
class SpecialGreeter extends Greeter2 {
  constructor() {
    super("Very special greetings");
  }
}
/** 使用declare class 来描述一个类或class类对象。类可以具有属性和方法以及构造函数。 */
declare class Greeter2 {
  constructor(greeting: string);
  greeting: string;
  showGreeting(): void;
}

/**
 * ***** 全局变量 *******
 * 全局变量 foo 包含存在的 widgets 数量。
 */
console.log("Half the number of widgets is " + foo / 2);
/** 使用declare var 来声明变量。如果变量是只读的，可以使用declare const。如果变量是块范围的，您还可以使用 declare let 。 */
declare var foo: number;

/**
 * ***** 全局函数 *******
 * 您可以使用字符串调用函数 greet 来向用户显示greeting。
 */
greet("hello, world");
/** 使用declare function 来声明函数。 */
declare function greet(greeting: string): void;