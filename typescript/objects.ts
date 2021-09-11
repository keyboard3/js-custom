/**
 * ***** 对象类型 *******
 * 在 JavaScript 中，我们分组和传递数据的基本方式是通过对象。在 TypeScript 中，我们通过 object 类型来表示它们。
 */
() => {
  /** 正如我们所见，它们可以是匿名的： */
  function greet(person: { name: string; age: number }) {
    return "Hello " + person.name;
  }
}
() => {
  /** 或者它们可以使用 interface 命名 */
  interface Person {
    name: string;
    age: number;
  }

  function greet(person: Person) {
    return "Hello " + person.name;
  }
}
() => {
  /** 或者 type 定义别名 */
  type Person = {
    name: string;
    age: number;
  };

  function greet(person: Person) {
    return "Hello " + person.name;
  }
}
/**
 * 在上面的所有三个示例中，我们编写的函数接受 object 包含属性 name（必须是 string）和 age（必须是 number）的对象。
 */

/**
 * ***** 属性修饰符 *******
 * 对象类型中的每个属性都可以指定几项内容：类型、属性是否可选以及是否可以写入该属性。
 */
() => {


  () => {
    /**
     * "可选属性"
     * 很多时候，我们会发现自己在处理可能具有属性集的对象。在这些情况下，我们可以通过在名称末尾添加问号 (?) 将这些属性标记为可选。
     */
    function getShape(): Shape {
      return {} as Shape;
    }
    interface PaintOptions {
      shape: Shape;
      xPos?: number;
      yPos?: number;
    }
    function paintShape(opts: PaintOptions) {
      // ...
    }
    const shape = getShape();
    paintShape({ shape });
    paintShape({ shape, xPos: 100 });
    paintShape({ shape, yPos: 100 });
    paintShape({ shape, xPos: 100, yPos: 100 });

    /**
     *  在这个例子中，xPos 和 yPos 都被认为是可选的。我们可以选择提供其中任何一个，因此上面对paintShape 的每个调用都是有效的。
     * 所有可选性真正说的是，如果设置了属性，它最好有一个特定的类型。
     *  我们也可以从这些属性中读取——但是当我们在 strictNullChecks 下读取时，TypeScript 会告诉我们它们可能是未定义的。
     */
    function paintShape2(opts: PaintOptions) {
      let xPos = opts.xPos;
      let yPos = opts.yPos;
      // ...
    }
    /** 在 JavaScript 中，即使该属性从未设置过，我们仍然可以访问它——它只会给我们一个 undefined 值。我们可以专门处理 undefined 。*/
    function paintShape3(opts: PaintOptions) {
      let xPos = opts.xPos === undefined ? 0 : opts.xPos;
      let yPos = opts.yPos === undefined ? 0 : opts.yPos;
      // ...
    }
    /** 请注意，这种为未指定值设置默认值的模式非常普遍，以至于 JavaScript 具有支持它的语法。 */
    function paintShape4({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
      console.log("x coordinate at", xPos);
      console.log("y coordinate at", yPos);
      // ...
    }
    /**
     *  这里我们对paintShape的参数使用了解构模式，并为xPos和yPos提供了默认值。现在 xPos 和 yPos 都肯定存在于paintShape 的主体中，
     * 但对于paintShape 的任何调用者来说都是可选的。
     *  请注意，目前无法在解构模式中放置类型注释。这是因为以下语法在 JavaScript 中已经意味着不同的东西。
     */
    function draw({ shape: Shape, xPos: number = 100 /*...*/ }) {
      render(shape);
      render(xPos);
    }
    /**
     * 在对象解构模式中，shape:Shape 的意思是“获取属性 shape 并将其在本地重新定义为名为 Shape 的变量。同样 xPos: number 创建一个名为 number 的变量，其值基于参数的 xPos。
     */
  }

  () => {
    /**
     * ***** readonly 属性 *******
     * 对于 TypeScript，属性也可以标记为只读。虽然它不会在运行时改变任何行为，但在类型检查期间不能写入标记为只读的属性。
     */
    interface SomeType {
      readonly prop: string;
    }
    function doSomething(obj: SomeType) {
      // We can read from 'obj.prop'.
      console.log(`prop has the value '${obj.prop}'.`);
      // But we can't re-assign it.
      obj.prop = "hello";
    }
    /** 使用 readonly 修饰符并不一定意味着一个值是完全不可变的——或者换句话说，它的内部内容不能改变。这只是意味着属性本身不能被重写。*/
    interface Home {
      readonly resident: { name: string; age: number };
    }
    function visitForBirthday(home: Home) {
      // 可以对 'home.resident' 读取和更新值
      console.log(`Happy birthday ${home.resident.name}!`);
      home.resident.age++;
    }
    function evict(home: Home) {
      // 但是不能覆写 'home.resident' 属性上的值
      home.resident = {
        name: "Victor the Evictor",
        age: 42,
      };
    }
    /**
     *  管理对 readonly 含义的期望很重要。在 TypeScript 的开发期间就对象应该想好如何使用很有用的。 
     * TypeScript 在检查这些类型是否兼容时不会考虑这两种类型的属性是否为只读，因此只读属性也可以通过别名更改。
     */
    interface Person {
      name: string;
      age: number;
    }
    interface ReadonlyPerson {
      readonly name: string;
      readonly age: number;
    }
    //Person类型不指定，自动推断出的writablePerson的匿名类型，也会修改readonlyPerson指定的readonly属性
    let writablePerson: Person = {
      name: "Person McPersonface",
      age: 42,
    };
    // works
    let readonlyPerson: ReadonlyPerson = writablePerson;
    console.log(readonlyPerson.age); // prints '42'
    writablePerson.age++;
    console.log(readonlyPerson.age); // prints '43'
  }
  () => {
    /**
     * ***** 索引签名 *******
     * 有时您事先并不知道类型属性的所有名称，但您确实知道值的形状。
     * 在这些情况下，您可以使用索引签名来描述可能值的类型，例如：
     */
    function getStringArray() {
      return { 0: "hello" }
    }
    interface StringArray {
      [index: number]: string;
    }
    const myArray: StringArray = getStringArray();
    const secondItem = myArray[1];
    /**
     * 上面，我们有一个 StringArray interface，它有一个索引签名。此索引签名指出，当 StringArray 用 number 索引时，它将返回一个string。
     * 索引签名属性类型必须是“string”或“number”。
     * 
     *  可以支持两种类型的索引器，但从 number 索引器返回的类型必须是从 string 索引器返回的类型的子类型。这是因为当使用 `number` 进行索引时，
     * JavaScript 实际上会在索引到对象之前将其转换为 `string`。这意味着使用`100`（一个`number`）进行索引与使用`“100”`（一个`string`）进行索引是一样的，因此两者需要保持一致。
     */
    interface Animal {
      name: string;
    }
    interface Dog extends Animal {
      breed: string;
    }
    // Error: indexing with a numeric string might get you a completely separate type of Animal!
    interface NotOkay {
      [x: number]: Animal;
      [x: string]: Dog;
    }
    interface Okay {
      [x: number]: Dog;
      [x: string]: Animal;
    }
    /**
     *  虽然字符串索引签名是一种描述“字典”模式的强大方式，但它们也强制所有属性匹配它们的返回类型。这是因为字符串索引声明 obj.property 也可用作 obj["property"]。
     * 在下面的例子中，name 的类型与字符串索引的类型不匹配，类型检查器给出了一个错误：
     */
    interface NumberDictionary {
      [index: string]: number;
      length: number; // ok
      name: string;
    }
    /** 但是，如果索引签名是属性类型的并集，则可以接受不同类型的属性：*/
    interface NumberOrStringDictionary {
      [index: string]: number | string;
      length: number; // ok, length is a number
      name: string; // ok, name is a string
    }
    {
      /** 
       * 最后，您可以将索引签名设为只读，以防止对其索引进行赋值： 
       * 你不能设置 myArray[2] 因为索引签名是只读的。
       */
      function getReadOnlyStringArray() {
        return { 1: "hello" };
      }
      interface ReadonlyStringArray {
        readonly [index: number]: string;
      }
      let myArray: ReadonlyStringArray = getReadOnlyStringArray();
      myArray[2] = "Mallory";
    }
  }
}

() => {
  /**
   * ***** 扩展类型 *******
   * 拥有可能是其他类型的更具体版本的类型是很常见的。例如，我们可能有一个 BasicAddress 类型，它描述了在美国发送信件和包裹所需的字段。
   */
  interface BasicAddress {
    name?: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  }
  /** 在某些情况下，这就足够了，但如果一个地址的建筑物有多个单元，则地址通常有一个与之关联的单元号。然后我们可以描述一个 AddressWithUnit。*/
  interface AddressWithUnit extends BasicAddress {
    unit: string;
  }
  /**
   *  interface 上的 extends 关键字允许我们有效地从其他命名类型复制成员，并添加我们想要的任何新成员。这对于减少我们必须编写的类型声明样板的数量，
   * 以及表明同一属性的几个不同声明可能相关的意图非常有用。例如，AddressWithUnit 不需要重复 street 属性，并且因为 street 源自 BasicAddress，读者会知道这两种类型以某种方式相关。
   *  interface 也可以扩展自多个类型。
   */
  interface Colorful {
    color: string;
  }
  interface Circle {
    radius: number;
  }
  interface ColorfulCircle extends Colorful, Circle { }
  const cc: ColorfulCircle = {
    color: "red",
    radius: 42,
  };
}

() => {
  /**
   * ***** 交叉类型 *******
   * interface 允许我们通过扩展其他类型来构建新类型。 TypeScript 提供了另一种称为交集类型的构造，主要用于组合现有的对象类型。
   * 交集类型使用 & 运算符定义。
   */
  interface Colorful {
    color: string;
  }
  interface Circle {
    radius: number;
  }
  type ColorfulCircle = Colorful & Circle;
  /**
   * 在这里，我们将 Color 和 Circle 相交以产生一种新类型，该类型具有 Color 和 Circle 的所有成员。
   */
  function draw(circle: Colorful & Circle) {
    console.log(`Color was ${circle.color}`);
    console.log(`Radius was ${circle.radius}`);
  }
  // okay
  draw({ color: "blue", radius: 42 });
  // oops
  draw({ color: "red", raidus: 42 });
}
/**
 * ***** interface 对比 交叉类型 *******
 *  我们只是研究了两种组合相似但实际上略有不同的类型的方法。对于接口，我们可以使用 extends 子句从其他类型扩展，并且我们能够对交集做类似的事情并用类型别名命名结果。
 * 两者之间的主要区别在于如何处理冲突，而这种区别通常是您在接口和交叉类型的类型别名之间选择一个而不是另一个的主要原因之一。
 */

() => {
  /**
   * ***** 泛型对象类型 *******
   * 让我们想象一个可以包含任何值的 Box 类型，string、number等
   */
  {
    interface Box {
      contents: any;
    }
  }
  /**
   * 现在，contents 属性被输入为any，这可行，但可能会导致事故。
   * 我们可以改为使用 unknown ，但这意味着在我们已经知道内容类型的情况下，我们需要进行预防性检查，或者使用容易出错的类型断言。
   */
  {
    interface Box {
      contents: unknown;
    }
    let x: Box = {
      contents: "hello world",
    };
    // we could check 'x.contents'
    if (typeof x.contents === "string") {
      console.log(x.contents.toLowerCase());
    }
    // or we could use a type assertion
    console.log((x.contents as string).toLowerCase());
  }
  /** 一种安全的方法是为每种类型的内容构建不同的 Box 类型。*/
  interface NumberBox {
    contents: number;
  }
  interface StringBox {
    contents: string;
  }
  interface BooleanBox {
    contents: boolean;
  }
  () => {
    /** 但这意味着我们必须创建不同的函数或函数的重载来对这些类型进行操作。*/
    function setContents(box: StringBox, newContents: string): void;
    function setContents(box: NumberBox, newContents: number): void;
    function setContents(box: BooleanBox, newContents: boolean): void;
    function setContents(box: { contents: any }, newContents: any) {
      box.contents = newContents;
    }
  }

  /**
   * 这是很多样板。此外，我们以后可能需要引入新的类型和重载。这令人沮丧，因为我们的 Box 类型和重载实际上都是相同的。
   * 相反，我们可以创建一个声明类型参数的泛型 Box 类型。
   */
  interface Box<Type> {
    contents: Type;
  }
  /**
   * 您可能会将此读作“Box 的 Type 参数用于 contents 属性的 Type 类型”。稍后，当我们引用 Box 时，我们必须给出一个类型参数来代替 Type。
   */
  let box: Box<string>;

  /**
   *  将 Box 视为真实类型的模板，其中 Type 是一个占位符，它将被其他类型替换。当 TypeScript 看到 Box<string> 时，它会用 string 替换 Box<Type> 中的每个 Type 实例，
   * 并最终使用类似 { contents: string } 的东西。换句话说， Box<string> 和我们之前的 StringBox 工作方式相同。
   */
  let boxA: Box<string> = { contents: "hello" };
  boxA.contents;
  let boxB: StringBox = { contents: "world" };
  boxB.contents;

  /** Box 是可重用的，因为 Type 可以用任何东西代替。这意味着当我们需要一个新类型的盒子时，我们根本不需要声明一个新的 Box 类型（尽管我们当然可以，如果我们愿意的话）。*/
  interface Apple {
    // ....
  }
  // Same as '{ contents: Apple }'.
  type AppleBox = Box<Apple>;

  () => {
    /** 这也意味着我们可以通过使用泛型函数来完全避免重载。 */
    function setContents<Type>(box: Box<Type>, newContents: Type) {
      box.contents = newContents;
    }
  }

  /**
   * 值得注意的是，类型别名也可以是泛型的。我们可以定义我们的新 Box<Type> 接口，它是：
   */
  {
    type Box<Type> = {
      contents: Type;
    };
  }
  /**
   * 由于与接口不同，类型别名不仅可以描述对象类型，还可以使用它们来编写其他类型的泛型辅助类型。
   */
  type OrNull<Type> = Type | null;
  type OneOrMany<Type> = Type | Type[];
  type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>;
  type OneOrManyOrNullStrings = OneOrManyOrNull<string>;

  /**
   * "Array 类型"
   * 通用对象类型通常是某种容器类型，它们独立于它们包含的元素类型工作。数据结构以这种方式工作是理想的，这样它们就可以在不同的数据类型中重用。
   * 事实证明，在本手册中，我们一直在使用一种类型：数组类型。每当我们写出像 number[] 或 string[] 这样的类型时，这实际上只是 Array<number> 和 Array<string> 的简写。
   */
  function doSomething(value: Array<string>) {
    // ...
  }
  let myArray: string[] = ["hello", "world"];
  // either of these work!
  doSomething(myArray);
  doSomething(new Array("hello", "world"));

  /** 很像上面的 Box 类型，Array 本身是一个泛型类型。 */
  interface Array<Type> {
    /** Gets or sets the length of the array.*/
    length: number;
    /** Removes the last element from an array and returns it.*/
    pop(): Type | undefined;
    /** Appends new elements to an array, and returns the new length of the array.*/
    push(...items: Type[]): number;
    // ...
  }

  /** 
   *  现代 JavaScript 还提供了其他通用数据结构，如 Map<K, V>、Set<T> 和 Promise<T>。这一切真正意味着，由于 Map、Set 和 Promise 的行为方式，
   * 它们可以与任何类型的集合一起使用。
   *  与 Array 不同，没有我们可以使用的 ReadonlyArray 构造函数。
   */
  new ReadonlyArray("red", "green", "blue");
  /** 相反，我们可以将常规数组分配给 ReadonlyArrays。 */
  const roArray: ReadonlyArray<string> = ["red", "green", "blue"];

  /** 正如 TypeScript 为带有 Type[] 的 Array<Type> 提供速记语法一样，它也为带有 readonly Type[] 的 ReadonlyArray<Type> 提供了速记语法。 */
  function doStuff(values: readonly string[]) {
    // We can read from 'values'...
    const copy = values.slice();
    console.log(`The first value is ${values[0]}`);

    // ...but we can't mutate 'values'.
    values.push("hello!");
  }

  /** 最后要注意的是，与 readonly 属性修饰符不同，可分配性在常规数组和 ReadonlyArrays 之间不是双向的。 */
  {
    let x: readonly string[] = [];
    let y: string[] = [];
    x = y;
    y = x;
  }

  () => {
    /**
     * "元组类型"
     * 元组类型是另一种数组类型，它确切地知道它包含多少元素，以及它在特定位置包含哪些类型。
     */
    type StringNumberPair = [string, number];
    /**
     *  这里，StringNumberPair 是字符串和数字的元组类型。与 ReadonlyArray 一样，它在运行时没有表示，但对 TypeScript 很重要。
     * 对于类型系统，StringNumberPair 描述了数组，其 0 索引包含一个字符串，其 1 索引包含一个数字。
     */
    function doSomething(pair: [string, number]) {
      const a = pair[0];
      const b = pair[1];
      // ...
    }
    doSomething(["hello", 42]);

    /** 如果我们尝试索引超过元素的数量，我们会得到一个错误。 */
    function doSomething2(pair: [string, number]) {
      const c = pair[2];
    }

    /** 我们还可以使用 JavaScript 的数组解构来解构元组。 */
    function doSomething3(stringHash: [string, number]) {
      const [inputString, hash] = stringHash;
      console.log(inputString);
      console.log(hash);
    }

    /**
     * 元组类型在大量基于约定的 API 中很有用，其中每个元素的含义都是“显而易见的”。这使我们在解构变量时可以灵活地命名变量。在上面的示例中，我们可以将元素 0 和 1 命名为我们想要的任何名称。
     * 但是，由于并非每个用户都对显而易见的事情持有相同的看法，因此可能值得重新考虑使用具有描述性属性名称的对象是否对您的 API 更好。
     */

    {
      /**
       * 除了这些长度检查之外，像这样的简单元组类型等价于声明特定索引属性的数组版本类型，以及声明长度为number字面量类型的类型。
       */
      interface StringNumberPair {
        // specialized properties
        length: 2;
        0: string;
        1: number;
        // Other 'Array<string | number>' members...
        slice(start?: number, end?: number): Array<string | number>;
      }
      const pair: StringNumberPair = ["hello", 2];
    }
    {
      /**
       * 您可能感兴趣的另一件事是元组可以通过写出一个问号（? 在元素的类型之后）来具有可选属性。可选的元组元素只能放在最后，也会影响长度的类型。
       */
      type Either2dOr3d = [number, number, number?];
      function setCoordinate(coord: Either2dOr3d) {
        const [x, y, z] = coord;
        console.log(`Provided coordinates had ${coord.length} dimensions`);
      }
    }
    {
      /** 
       * 元组也可以有rest元素，这些元素必须是数组/元组类型。
       * StringNumberBooleans 描述了一个元组，它的前两个元素分别是字符串和数字，但后面可能有任意数量的布尔值。
       */
      type StringNumberBooleans = [string, number, ...boolean[]];
      /** StringBooleansNumber 描述了一个元组，它的第一个元素是字符串，然后是任意数量的布尔值并以数字结尾。*/
      type StringBooleansNumber = [string, ...boolean[], number];
      /** BooleansStringNumber 描述了一个元组，它的起始元素是任意数量的布尔值，并以一个字符串和一个数字结尾。 */
      type BooleansStringNumber = [...boolean[], string, number];
      /** 带有 rest 元素的元组没有固定的“长度”——它只有一组在不同位置的众所周知的元素。 */
      const a: StringNumberBooleans = ["hello", 1];
      const b: StringNumberBooleans = ["beautiful", 2, true];
      const c: StringNumberBooleans = ["world", 3, true, false, true, false, true];

      /** 为什么 optional 和 rest 元素可能有用？好吧，它允许 TypeScript 将元组与参数列表对应起来。元组类型可用于其余参数和参数，以便以下内容：*/
      function readButtonInput(...args: [string, number, ...boolean[]]) {
        const [name, version, ...input] = args;
        // const version2 = args[1];
        // ...
      }
      /** 相当于 */
      function readButtonInput2(name: string, version: number, ...input: boolean[]) {
        // ...
      }
      /** 当您想要使用带有剩余参数的可变数量的参数，并且您需要最少数量的元素，但又不想引入中间变量时，这很方便。*/
    }

    () => {
      /**
       * "只读的元祖"
       * 关于元组类型的最后一个注意事项 - 元组类型具有只读变体，并且可以通过在它们前面粘贴一个只读修饰符来指定 - 就像数组速记语法一样。
       * 正如您所料，在 TypeScript 中不允许写入只读元组的任何属性
       */
      function doSomething(pair: readonly [string, number]) {
        pair[0] = "hello!";
      }
      /**
       * 在大多数代码中，元组往往被创建并保持不变，因此在可能的情况下将类型注释为只读元组是一个很好的默认设置。鉴于将使用只读元组类型推断具有 const 断言的数组文字，这也很重要。
       */
      let point = [3, 4];
      function distanceFromOrigin([x, y]: [number, number]) {
        return Math.sqrt(x ** 2 + y ** 2);
      }
      distanceFromOrigin(point);
      /**
       *  在这里， distanceFromOrigin 从不修改其元素，但需要一个可变元组。由于 point 的类型被推断为 readonly [3, 4]，它不会与 [number, number] 兼容，
       * 因为该类型不能保证 point 的元素不会发生变异。
       */
    }
  }
}