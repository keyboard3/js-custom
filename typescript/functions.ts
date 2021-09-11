/**
 *  函数是任何应用程序的基本构建块，无论它们是本地函数、从另一个模块导入还是类上的方法。
 * 它们也是值，就像其他值一样，TypeScript 有很多方法来描述如何调用函数。让我们学习如何编写描述函数的类型。
 */

() => {
  /**
   * ***** 函数类型表达式 *******
   * 描述函数的最简单方法是使用函数类型表达式。这些类型在语法上类似于箭头函数：
   */
  function greeter(fn: (a: string) => void) {
    fn("Hello, World");
  }
  function printToConsole(s: string) {
    console.log(s);
  }
  greeter(printToConsole);
}
() => {
  /**
   * 语法 (a: string) => void 表示“带有一个名为 a 的参数的函数，类型为 string，没有返回值”。就像函数声明一样，如果未指定参数类型，则它隐式为 any。
   * 请注意，参数名称是必需的。函数类型 (string) => void 表示“一个函数，其参数名为字符串，类型为 any”！
   * 当然，我们可以使用类型别名来命名函数类型：
   */
  type GreetFunction = (a: string) => void;
  function greeter(fn: GreetFunction) {
    // ...
  }
}
() => {
  /**
   * ***** 调用签名 *******
   * 在 JavaScript 中，函数除了可调用之外还可以有属性。但是，函数类型表达式语法不允许声明属性。如果我们想用属性来描述一些可调用的东西，我们可以在对象类型中写一个调用签名：
   * 请注意，与函数类型表达式相比，语法略有不同 - 在参数列表和返回类型之间使用 : 而不是 =>。
   */
  type DescribableFunction = {
    description: string;
    (someArg: number): boolean;
  };
  function doSomething(fn: DescribableFunction) {
    console.log(fn.description + " returned " + fn(6));
  }
}

() => {
  /**
   * ***** 构造签名 *******
   * JavaScript 函数也可以使用 new 运算符调用。 TypeScript 将这些称为构造函数，因为它们通常会创建一个新对象。您可以通过在调用签名前添加 new 关键字来编写构造签名：
   */
  type SomeConstructor = {
    new(s: string): SomeObject;
  };
  function fn(ctor: SomeConstructor) {
    return new ctor("hello");
  }
  /**
   * 一些对象，比如 JavaScript 的 Date 对象，可以使用或不使用 new 来调用。您可以任意组合相同类型的调用和构造签名：
   */
  interface CallOrConstruct {
    new(s: string): Date;
    (n?: number): number;
  }
}
() => {
  /**
   * ***** 泛型函数 *******
   * 编写一个函数，其中输入的类型与输出的类型相关，或者两个输入的类型以某种方式相关。让我们考虑一个返回数组第一个元素的函数：
   */
  function firstElement(arr: any[]) {
    return arr[0];
  }
  () => {
    /**
     * 这个函数完成了它的工作，但不幸的是返回类型为 any。如果函数返回数组元素的类型会更好。
     * 在 TypeScript 中，当我们想要描述两个值之间的对应关系时，会使用泛型。我们通过在函数签名中声明一个类型参数来做到这一点：
     */
    function firstElement<Type>(arr: Type[]): Type {
      return arr[0];
    }
    /**
     * 通过向这个函数添加一个类型参数 Type 并在两个地方使用它，我们在函数的输入（数组）和输出（返回值）之间创建了一个链接。现在当我们调用它时，会出现一个更具体的类型：
     */
    // s is of type 'string'
    const s = firstElement(["a", "b", "c"]);
    // n is of type 'number'
    const n = firstElement([1, 2, 3]);
  }
  () => {
    /**
     * ***** 推导 *******
     * 请注意，我们不必在此示例中指定 Type。类型由 TypeScript 推断 - 自动选择。
     * 我们也可以使用多个类型参数。例如，地图的独立版本如下所示：
     */
    function map<Input, Output>(arr: Input[], func: (arg: Input) => Output): Output[] {
      return arr.map(func);
    }
    // Parameter 'n' is of type 'string'
    // 'parsed' is of type 'number[]'
    const parsed = map(["1", "2", "3"], (n) => parseInt(n));
    /**
     * 请注意，在此示例中，TypeScript 可以根据函数表达式的返回值（数字）推断 Input 类型参数的类型（来自给定的字符串数组）以及 Output 类型参数的类型。
     */
  }
  () => {
    /**
     * ***** 约束 *******
     *  我们已经编写了一些可以处理任何类型值的通用函数。有时我们想关联两个值，但只能对某个值的子集进行操作。在这种情况下，我们可以使用约束来限制类型参数可以接受的类型种类。
     *  让我们编写一个函数，返回两个值中较长的一个。为此，我们需要一个长度属性，它是一个数字。我们通过编写 extends 子句将类型参数限制为该类型：
     */
    function longest<Type extends { length: number }>(a: Type, b: Type) {
      if (a.length >= b.length) {
        return a;
      } else {
        return b;
      }
    }

    // longerArray is of type 'number[]'
    const longerArray = longest([1, 2], [1, 2, 3]);
    // longerString is of type 'alice' | 'bob'
    const longerString = longest("alice", "bob");
    // Error! Numbers don't have a 'length' property
    const notOK = longest(10, 100);
    /**
     *  在这个例子中，有一些有趣的事情需要注意。我们允许 TypeScript 推断最长的返回类型。返回类型推断也适用于泛型函数。
     *  因为我们将 Type 限制为 { length: number }，所以我们可以访问 a 和 b 参数的 .length 属性。
     * 如果没有类型约束，我们将无法访问这些属性，因为这些值可能是没有长度属性的其他类型。
     *  longArray 和longerString 的类型是根据参数推断出来的。请记住，泛型都是将两个或多个具有相同类型的值关联起来！
     *  最后，正如我们所希望的，对longest(10, 100) 的调用被拒绝，因为数字类型没有.length 属性。
     */
  }
  () => {
    /**
     * ***** 使用受约束的值 *******
     * 这是使用通用约束时的常见错误：
     */
    function minimumLength<Type extends { length: number }>(
      obj: Type,
      minimum: number
    ): Type {
      if (obj.length >= minimum) {
        return obj;
      } else {
        return { length: minimum };
      }
    }
    /**
     *  看起来这个函数没问题——Type 被限制为 {length: number}，并且该函数返回 Type 或匹配该约束的值。问题是该函数承诺返回与传入相同类型的对象，
     * 而不仅仅是某些与约束匹配的对象。如果这段代码是合法的，你可以写出绝对行不通的代码：
     */
    // 'arr' gets value { length: 6 }
    const arr = minimumLength([1, 2, 3], 6);
    // and crashes here because arrays have
    // a 'slice' method, but not the returned object!
    console.log(arr.slice(0));
  }
  () => {
    /**
     * ***** 指定类型参数 *******
     * TypeScript 通常可以在泛型调用中推断出预期的类型参数，但并非总是如此。例如，假设您编写了一个函数来组合两个数组：
     * 
     * "下推类型参数"
     * 以下是编写看起来相似的函数的两种方法：
     */
    function firstElement1<Type>(arr: Type[]) {
      return arr[0];
    }
    function firstElement2<Type extends any[]>(arr: Type) {
      return arr[0];
    }
    // a: number (good)
    const a = firstElement1([1, 2, 3]);
    // b: any (bad)
    const b = firstElement2([1, 2, 3]);

    /**
     *  乍一看，这些似乎相同，但 firstElement1 是编写此函数的更好方法。它的推断返回类型是 Type，但 firstElement2 的推断返回类型是 any，
     * 因为 TypeScript 必须使用约束类型解析 arr[0] 表达式，而不是在调用期间“等待”解析元素。
     *  规则：如果可能，使用类型参数本身而不是约束它
     */
    /**
     * "使用更少的类型参数"
     * 这是另一对类似的函数：
     */
    function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
      return arr.filter(func);
    }
    function filter2<Type, Func extends (arg: Type) => boolean>(
      arr: Type[],
      func: Func
    ): Type[] {
      return arr.filter(func);
    }
    /**
     *  我们创建了一个不关联两个值的类型参数 Func。这总是一个危险信号，因为这意味着想要指定类型参数的调用者必须无缘无故地手动指定一个额外的类型参数。 
     * Func 不会做任何事情，只会让函数更难阅读和推理！
     *  规则：始终使用尽可能少的类型参数
     */
    const c = filter1([1, 2, 3], (item => item > 0));
    const d = filter2([1, 2, 3], (item => item > 0));//多出了一个参数类型，让函数难阅读

    /**
     * "类型参数应该出现两次"
     * 有时我们会忘记一个函数可能不需要是泛型的：
     */
    function greet<Str extends string>(s: Str) {
      console.log("Hello, " + s);
    }
    greet("world");
    /** 我们可以很容易地编写一个更简单的版本：*/
    function greet2(s: string) {
      console.log("Hello, " + s);
    }
    /**
     * 请记住，类型参数用于关联多个值的类型。如果一个类型参数在函数签名中只使用一次，它就没有任何关系。
     * 规则：如果一个类型参数只出现在一个位置，强烈重新考虑你是否真的需要它
     */
  }
}
() => {
  /**
   * ***** 可选参数 *******
   * JavaScript 中的函数通常采用可变数量的参数。例如， number 的 toFixed 方法采用可选的数字计数：
   */
  function f(n: number) {
    console.log(n.toFixed()); // 0 arguments
    console.log(n.toFixed(3)); // 1 argument
  }
  /**
   * 我们可以在 TypeScript 中通过使用 ? 将参数标记为可选来对此进行建模：
   */
  () => {
    function f(x?: number) {
      // ...
    }
    f(); // OK
    f(10); // OK
  }
  /**
   * 尽管参数被指定为类型 number，但 x 参数实际上将具有类型 number | undefined 因为 JavaScript 中未指定的参数会得到 undefined 的值。
   * 您还可以提供参数默认值：
   */
  () => {
    function f(x = 10) {
      // ...
    }
  }
  /**
   * 现在在 f 的主体中，x 将具有类型 number，因为任何未定义的参数都将被替换为 10。请注意，当参数是可选的时，调用者总是可以传递 undefiend，因为这只是模拟了一个“缺失”的参数：
   */
  () => {
    declare function f(x?: number): void;
    // cut
    // All OK
    f();
    f(10);
    f(undefined);
  }

  () => {
    /**
     * "回调中的可选参数"
     * 一旦你了解了可选参数和函数类型表达式，在编写调用回调的函数时很容易犯以下错误：
     */
    function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
      for (let i = 0; i < arr.length; i++) {
        callback(arr[i], i);
      }
    }
    /** 人们在编写索引时通常打算做什么？作为可选参数，他们希望这两个调用都是合法的：*/
    myForEach([1, 2, 3], (a) => console.log(a));
    myForEach([1, 2, 3], (a, i) => console.log(a, i));
    /** 这实际上意味着回调可能会被一个参数调用。换句话说，函数定义说实现可能是这样的：*/
    function myForEach2(arr: any[], callback: (arg: any, index?: number) => void) {
      for (let i = 0; i < arr.length; i++) {
        // I don't feel like providing the index today
        callback(arr[i]);
      }
    }
    /** 反过来，TypeScript 将强制执行此含义并发出实际上不可能的错误： */
    myForEach2([1, 2, 3], (a, i) => {
      console.log(i.toFixed());
    });
    /**
     * 在 JavaScript 中，如果您调用的函数参数多于参数数量，则额外的参数将被简单地忽略。 TypeScript 的行为方式相同。参数较少（相同类型）的函数总是可以代替参数较多的函数。
     * 为回调编写函数类型时，切勿编写可选​​参数，除非您打算在不传递该参数的情况下调用该函数
     */
  }
}

() => {
  /**
   * ***** 函数重载 *******
   * 一些 JavaScript 函数可以在各种参数计数和类型中调用。例如，您可能会编写一个函数来生成一个 Date，它采用时间戳（一个参数）或月/日/年规范（三个参数）。
   * 在 TypeScript 中，我们可以通过编写重载签名来指定一个可以以不同方式调用的函数。为此，请编写一些函数签名（通常为两个或更多），然后是函数体：
   */
  function makeDate(timestamp: number): Date;
  function makeDate(m: number, d: number, y: number): Date;
  function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
    if (d !== undefined && y !== undefined) {
      return new Date(y, mOrTimestamp, d);
    } else {
      return new Date(mOrTimestamp);
    }
  }
  const d1 = makeDate(12345678);
  const d2 = makeDate(5, 5, 5);
  const d3 = makeDate(1, 3);
  /**
   * 在这个例子中，我们写了两个重载：一个接受一个参数，另一个接受三个参数。前两个签名称为重载签名。
   * 然后，我们编写了一个具有兼容签名的函数实现。函数有一个实现签名，但是这个签名不能被直接调用。即使我们写了一个在必需参数后面有两个可选参数的函数，它也不能用两个参数调用！
   */

  /**
   * "重载签名和实现签名"
   * 这是混淆的常见来源。通常人们会写这样的代码，但不明白为什么会出现错误：
   */
  () => {
    function fn(x: string): void;
    function fn() {
      // ...
    }
    // Expected to be able to call with zero arguments
    fn();
  }
  /**
   * 同样，用于编写函数体的签名无法从外部“看到”。
   * 从外部看不到实现的签名。编写重载函数时，应始终在函数实现上方有两个或多个签名。
   * 实现签名还必须与重载签名兼容。例如，这些函数有错误，因为实现签名没有以正确的方式匹配重载：
   */
  () => {
    function fn(x: boolean): void;
    // Argument type isn't right
    function fn(x: string): void;
    function fn(x: boolean) { }
  }
  () => {
    function fn(x: string): string;
    // Return type isn't right
    function fn(x: number): boolean;
    function fn(x: string | number) {
      return "oops";
    }
  }
  /**
   * "好的重载"
   * 与泛型一样，在使用函数重载时也应遵循一些准则。遵循这些原则将使您的函数更易于调用、更易于理解和更易于实现。
   * 让我们考虑一个返回字符串或数组长度的函数：
   */
  () => {
    function len(s: string): number;
    function len(arr: any[]): number;
    function len(x: any) {
      return x.length;
    }
    /**
     * 这个功能不错；我们可以用字符串或数组调用它。但是，我们不能使用可能是字符串或数组的值来调用它，因为 TypeScript 只能将函数调用解析为单个重载：
     */
    len(""); // OK
    len([0]); // OK
    len(Math.random() > 0.5 ? "hello" : [0]);
    /**
     * 因为两个重载具有相同的参数计数和相同的返回类型，我们可以改为编写函数的非重载版本：
     */
    function len2(x: any[] | string) {
      return x.length;
    }
    /**
     * 这好多了！调用者可以使用任何一种值调用它，作为额外的好处，我们不必找出正确的实现签名。
     * 在可能的情况下，始终更喜欢具有联合类型的参数而不是重载
     */
  }

  /**
   * ***** 在函数中声明this *******
   * TypeScript 将通过代码流分析推断函数中的 this 应该是什么，例如在以下内容中：
   */
  const user = {
    id: 123,
    admin: false,
    becomeAdmin: function () {
      this.admin = true;
    },
  };
  type User = typeof user;
  /**
   *  TypeScript 理解函数 user.becomeAdmin 有一个对应的 this，即外部对象 user。这，呵呵，对于很多情况来说已经足够了，但是在很多情况下，
   * 您需要更多地控制 this 代表的对象。 JavaScript 规范规定你不能有一个名为 this 的参数，因此 TypeScript 使用该语法空间让你在函数体中声明 this 的类型。
   */
  function getDB() {
    return {} as DB;
  }
  interface DB {
    filterUsers(filter: (this: User) => boolean): User[];
  }
  const db = getDB();
  const admins = db.filterUsers(function (this: User) {//这里的this参数类型声明，编译时会被移除
    return this.admin;
  });
  /**
   * 这种模式在回调风格的 API 中很常见，其中另一个对象通常控制何时调用您的函数。请注意，您需要使用函数而不是箭头函数来获得此行为：
   * 因为在es语义里，这里的this是静态作用域的父级this，所以无法声明其this类型
   */
  const admins2 = db.filterUsers(() => this.admin);
}

() => {
  /**
   * ***** 其他需要了解的类型 *******
   * 在使用函数类型时，您还需要识别一些经常出现的其他类型。像所有类型一样，您可以在任何地方使用它们，但这些在函数上下文中尤其重要。
   */

  /**
   * "void"
   * void 表示不返回值的函数的返回值。只要函数没有任何 return 语句，或者没有从这些 return 语句中返回任何显式值，它就是推断类型：
   * 在 JavaScript 中，不返回任何值的函数将隐式返回 undefined 值。但是，在 TypeScript 中 void 和 undefined 不是一回事。本章末尾有更多详细信息。
   * void 与 undefined 不同。
   */
  // The inferred return type is void
  function noop() {
    return;
  }

  /**
   * "object"
   *  特殊的 obect 类型， 指的是任何非原始值（string, number, bigint, boolean, symbol, null, or undefined）。
   * 这不同于空对象类型{}，也不同于全局类型Object。你很可能永远不会使用 Object.
   *  object is not Object. Always use object!
   *  请注意，在 JavaScript 中，函数值是对象：它们有属性，在其原型链中有 Object.prototype，是 instanceof Object，您可以对它们调用 Object.keys，等等。
   * 因此，函数类型被认为是 TypeScript 中的对象。
   */

  /**
   * "unknown"
   * 未知类型代表任何值。这类似于 any 类型，但更安全，因为使用未知值做任何事情都是不合法的：
   */
  function f1(a: any) {
    a.b(); // OK
  }
  function f2(a: unknown) {
    a.b();
  }
  /**
   * 这在描述函数类型时很有用，因为您可以描述接受任何值的函数，而函数体中没有任何值。
   * 相反，您可以描述一个返回未知类型值的函数：
   */
  function safeParse(s: string): unknown {
    return JSON.parse(s);
  }
  // Need to be careful with 'obj'!
  const obj = safeParse("someRandomString");

  /**
   * "never"
   * 一些函数从不返回值：
   */
  function fail(msg: string): never {
    throw new Error(msg);
  }
  /**
   * never 类型表示从未观察到的值。在返回类型中，这意味着函数抛出异常或终止程序的执行。
   * 当 TypeScript 确定联合中没有任何东西时， never 也会出现。
   */
  function fn(x: string | number) {
    if (typeof x === "string") {
      // do something
    } else if (typeof x === "number") {
      // do something else
    } else {
      x; // has type 'never'!
    }
  }

  /**
   * "Function"
   * 全局类型 Function 描述了bind, call, apply等属性，以及 JavaScript 中所有函数值上存在的其他属性。它还具有始终可以调用 Function 类型的值的特殊属性；这些调用返回 any：
   * 这是一个无类型的函数调用，通常最好避免，因为返回 any 类型都是不安全的。
   * 如果您需要接受任意函数但不打算调用它，则类型 () => void 通常更安全。
   */
  function doSomething(f: Function) {
    // new f(); //没有构造函数签名
    f(1, 2, 3);
  }
}

() => {
  /**
   * ***** Rest(...语法) 函数声明参数(Parameters) 和 函数调用参数(Arguments) *******
   * "Rest 函数声明参数"
   * 除了使用可选参数或重载来创建可以接受各种固定参数计数的函数之外，我们还可以使用剩余参数定义具有无限数量参数的函数。
   * rest 参数出现在所有其他参数之后，并使用 ... 语法：
   */
  function multiply(n: number, ...m: number[]) {
    return m.map((x) => n * x);
  }
  // 'a' gets value [10, 20, 30, 40]
  const a = multiply(10, 1, 2, 3, 4);
  /**
   * 在 TypeScript 中，这些参数上的类型注解是隐式的 any[] 而不是 any，并且给出的任何类型注解都必须是 Array<T> 或 T[] 的形式，或者是元组类型（我们将在后面学习） .
   */

  /**
   * "Rest 函数调用参数"
   * 相反，我们可以使用扩展语法从数组中提供可变数量的参数。例如，数组的 push 方法接受任意数量的参数：
   */
  const arr1 = [1, 2, 3];
  const arr2 = [4, 5, 6];
  arr1.push(...arr2);
  {
    /** 请注意，一般而言，TypeScript 不假设数组是不可变的。这可能会导致一些令人惊讶的行为：*/
    // Inferred type is number[] -- "an array with zero or more numbers",
    // not specifically two numbers
    const args = [8, 5];
    const angle = Math.atan2(...args);
  }
  {
    /** 这种情况的最佳解决方案取决于您的代码，但通常 const 上下文是最直接的解决方案：*/
    // Inferred as 2-length tuple
    const args = [8, 5] as const;
    // OK
    const angle = Math.atan2(...args);
  }
  /** 在针对较旧的运行时，使用 rest 参数可能需要打开 downlevelIteration。*/
}

() => {
  /**
   * ***** 函数声明参数解构 *******
   * 您可以使用参数解构方便地将作为参数提供的对象解包到函数体中的一个或多个局部变量中。在 JavaScript 中，它看起来像这样：
   */
  () => {
    function sum({ a, b, c }) {
      console.log(a + b + c);
    }
    sum({ a: 10, b: 3, c: 9 });
  }
  () => {
    /** 对象的类型注释遵循解构语法： */
    function sum({ a, b, c }: { a: number; b: number; c: number }) {
      console.log(a + b + c);
    }
  }
  () => {
    /** 这看起来有点冗长，但您也可以在这里使用命名类型： */
    // Same as prior example
    type ABC = { a: number; b: number; c: number };
    function sum({ a, b, c }: ABC) {
      console.log(a + b + c);
    }
  }
}

() => {
  /**
   * ***** 函数的可复制性 *******
   * "return void类型"
   * 函数的 void 返回类型会产生一些不寻常但预期的行为。
   * 返回类型为 void 的上下文类型不会强制函数不返回某些内容。另一种说法是具有 void 返回类型（类型 vf = () => void）的上下文函数类型，在实现时，可以返回任何其他值，但会被忽略。
   * 因此，类型 () => void 的以下实现是有效的：
   */
  type voidFunc = () => void;
  const f1: voidFunc = () => {
    return true;
  };
  const f2: voidFunc = () => true;
  const f3: voidFunc = function () {
    return true;
  };
  /** 而当这些函数之一的返回值分配给另一个变量时，它将保留 void 类型：*/
  const v1 = f1();
  const v2 = f2();
  const v3 = f3();
  /** 这种行为存在，因此即使 Array.prototype.push 返回一个数字并且 Array.prototype.forEach 方法需要一个返回类型为 void 的函数，以下代码也是有效的。*/
  const src = [1, 2, 3];
  const dst = [0];
  src.forEach((el) => dst.push(el));
  /** 还有另一种特殊情况需要注意，当字面量函数定义具有 void 返回类型时，该函数不得返回任何内容。 */
  () => {
    function f2(): void {
      // @ts-expect-error
      return true;
    }
    const f3 = function (): void {
      // @ts-expect-error
      return true;
    };
  }
}