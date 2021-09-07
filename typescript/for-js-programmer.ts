/**
 * ts 理解 js 在许多情况下自动生成类型，声明变量初始化值时, ts 将值作为该变量的类型 
 * 不需要显示声明，可以推断出 helloworld 是 string 类型
 *  */
let helloworld = "Hello world";

/**
 * ***** 定义类型 *******
 * 尽管 ts 可以推断出类型，但是对于动态编程的情况就无法推断。比如网络接口的数据类型
 * ts 支持对 js 扩展语法，通过 interface 来告诉 ts 是什么类型
 */

/** 可以类型推断出包含 name:string 和 id:number */
var user = {
  name: "Hayes",
  id: 0
}

/** 
 * 你也可以通过 interface 来描述 object 的类型
 * 在变量声明语句 left hide 跟着 : TypeName 来声明变量的类型
 * */
interface User {
  name: string,
  id: number
}

/** 如果你提供的对象字面量不符合 interface, ts 会给你警告 */
var user: User = {
  name: "Hayes",
  id: 0
}

/** 因为 js 支持 class 语法的面向对象编程，你可以使用 interface 来声明 class 创建的对象 */
class UserAccount {
  name: string;
  id: number;
  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}
var user: User = new UserAccount("Murphy", 1);

/** 你可以使用 interface 来声明函数的返回值的类型以及参数的类型 */
function getAdminUser(): User {
  return user;
}
function deleteUser(user: User) { }

/**
 * ts 除了支持 js 的基础类型 boolean,bigint,null,number,string,symbol,undefined 可以在 interface 中声明
 * 还扩展了 any, unknown, never, void
 * any: 万能类型(只是在出现的地方关闭类型检查器)
 * unknown: 不知道类型，但使用的时候必须转换成明确的类型。场景比较适合通用动态类型接口，如JSON字符串函数转换返回值的类型
 * never: 一个不存在的类型，多用于 Unions，不影响联合的结果
 * void: 函数可以返回 undefined 或者没有返回值
 */

/**
 * ***** 组合类型 *******
 * 在 ts 中，你可以通过组合简单的类型变为复杂的类型。Unions(联合)和 Generics(泛型)
 */

/** Unions 联合类型，可以声明类型是许多类型中的某个 */
type MyBool = true | false;
type WindowStates = "open" | "closed" | "minimized";
type LockStates = "locked" | "unlocked";
type PositiveOddNumbersUnderTen = 1 | 3 | 5 | 7 | 9;

/** 用联合类型来处理不同的类型 */
function wrapInArray(obj: string | string[]) {
  if (typeof obj == "string") {
    return [obj];
  }
  return obj;
}

/** 
 * Generics 泛型
 * 泛型为类型提供变量。常见的例子是数组。没有泛型的数组可以包含任何东西，带有泛型的数组可以描述数组包含的值
 */
type normalArray = [];
type StringArray = Array<string>;
type NumberArray = Array<number>;
type ObjectWithNameArray = Array<{ name: string }>;

/** 你可以在自己的类型上使用泛型 */
interface Backpack<Type> {
  add: (obj: Type) => void;
  get: () => Type
}
/** 告诉 ts 有一个名为 backpack 的常量的快捷方式, 不用担心它来自哪里 */
declare const backpack: Backpack<string>;
/** object 是个 string，因为我们在上面声明了 string 作为 Backpack 的变量 */
const object = backpack.get();
/** 所以你无法传递 number 给 add 函数 */
// backpack.add(2);

/**
 * ***** 结构类型系统 *******
 * ts 的核心原则是类型检查侧重于值的形状。有时被称为“鸭子类型”或“结构类型”
 * 在结构类型系统中，如果两个对象有相同的形状，它们就可以被认为是相同的类型
 */
interface Point {
  x: number;
  y: number;
}
function logPoint(p: Point) {
  console.log(`${p.x},${p.y}`);
}
/** 类创建的对象和对象字面量在对比形状上没有区别 */
const point = { x: 12, y: 26 };
logPoint(point);