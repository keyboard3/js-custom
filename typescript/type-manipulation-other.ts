{
  /**
   * ***** Keyof 类型操作符 *******
   * keyof 运算符采用对象类型并生成其键的string或number 字面量联合：
   */
  type Point = { x: number; y: number };
  type P = keyof Point;

  /**
 * 如果类型具有string或number索引签名，则 keyof 将返回这些类型：
 */
  type Arrayish = { [n: number]: unknown };
  type A = keyof Arrayish;
  const aObj: Arrayish = { 0: "hello" };

  type Mapish = { [k: string]: boolean };
  type M = keyof Mapish;//因为string key还兼容number
  /**
   * 请注意，在此示例中，M 是 string | number — 这是因为 JavaScript 对象键总是被强制转换为字符串，因此 obj[0] 始终与 obj["0"] 相同。
   * 当与映射类型结合使用时，keyof 类型变得特别有用，我们稍后会详细了解。
   */
}
{
  /**
   * ***** Typeof 类型操作符 *******
   * JavaScript 已经有一个 typeof 运算符可以在表达式上下文中使用：
   */
  // Prints "string"
  console.log(typeof "Hello world");
  /** TypeScript 添加了一个 typeof 运算符，您可以在类型上下文中使用它来引用变量或属性的类型： */
  let s = "hello";
  let n: typeof s;
  /**
   *  这对于基本类型不是很有用，但是结合其他类型运算符，您可以使用 typeof 方便地表达许多模式。例如，让我们从预定义类型 ReturnType<T> 开始。
   * 它接受一个函数类型并产生它的返回类型：
   */
  type Predicate = (x: unknown) => boolean;
  type K = ReturnType<Predicate>;
  let k: K = {} as any;//bool
  () => {
    /** 如果我们尝试在函数名上使用 ReturnType，我们会看到一个指导性错误： */
    function f() {
      return { x: 10, y: 3 };
    }
    type P = ReturnType<f>;
  }
  () => {
    /** 请记住，值和类型不是一回事。要引用值 f 的类型，我们使用 typeof： */
    function f() {
      return { x: 10, y: 3 };
    }
    type P = ReturnType<typeof f>;
  }

  /**
   * "限制"
   * TypeScript 有意限制了可以使用 typeof 的表达式类型。
   * 具体来说，在标识符（即变量名）或其属性上使用 typeof 是合法的。这有助于避免编写您认为正在执行但实际上不是：
   */
  function msgbox() { }
  // Meant to use = ReturnType<typeof msgbox>
  let shouldContinue: typeof msgbox("Are you sure you want to continue?");
}
() => {
  /**
   * ***** 索引访问类型 *******
   * 我们可以使用索引访问类型来查找另一种类型的特定属性：
   */
  type Person = { age: number; name: string; alive: boolean };
  type Age = Person["age"];
  /** 索引类型本身就是一种类型，因此我们可以完全使用 unions、keyof 或其他类型： */
  {
    type I1 = Person["age" | "name"];
    type I2 = Person[keyof Person];
    type AliveOrName = "alive" | "name";
    type I3 = Person[AliveOrName];
  }
  /** 如果您尝试索引不存在的属性，您甚至会看到错误： */
  {
    type I1 = Person["alve"];
  }

  /** 使用任意类型进行索引的另一个示例是使用 number 来获取数组元素的类型。我们可以将其与 typeof 结合使用，以方便地捕获数组字面量的元素类型：*/
  const MyArray = [
    { name: "Alice", age: 15 },
    { name: "Bob", age: 23 },
    { name: "Eve", age: 38 },
  ];
  {
    type Person = typeof MyArray[number];
    type Age = typeof MyArray[number]["age"];
    type Age2 = Person["age"];
  }
  {
    /** 您只能在索引时使用类型，这意味着您不能使用 const 来进行变量引用： */
    const key = "age";
    type Age = Person[key];
  }
  {
    /** 但是，您可以为类似的重构风格使用类型别名： */
    type key = "age";
    type Age = Person[key];
  }
}
() => {
  /**
   * ***** 条件类型 *******
   * 在大多数有用程序的核心，我们必须根据输入做出决策。 JavaScript 程序也不例外，但考虑到值可以轻松自省，这些决定也基于输入的类型。条件类型有助于描述输入和输出类型之间的关系。
   */
  interface Animal {
    live(): void;
  }
  interface Dog extends Animal {
    woof(): void;
  }
  type Example1 = Dog extends Animal ? number : string;
  type Example2 = RegExp extends Animal ? number : string;

  {
    type a = "1" & "2";
    type b = a & "0";
    type c = b extends a ? number : string;//number
  }
  {
    type a = { name: 'a', com: "0" };
    type b = a | { age: 10, com: "0" };
    type c = b extends a ? number : string;//string
  }
  /** 
   * 条件类型的形式有点像 JavaScript 中的条件表达式 (condition ? trueExpression : falseExpression)： 
   * SomeType extends OtherType ? TrueType : FalseType;
   * 
   * 当 extends 左边的类型可以赋值给右边的类型时，你会在第一个分支（“true”分支）中得到类型；否则你会在后一个分支（“false”分支）中得到类型。
   * 从上面的例子来看，条件类型可能不会立即有用——我们可以告诉自己 Dog 是否扩展了 Animal 并选择了数字或字符串！但是条件类型的强大之处在于将它们与泛型一起使用。
   * 
   * 例如，让我们采用以下 createLabel 函数：
   */
  interface IdLabel {
    id: number /* some fields */;
  }
  interface NameLabel {
    name: string /* other fields */;
  }
  () => {
    function createLabel(id: number): IdLabel;
    function createLabel(name: string): NameLabel;
    function createLabel(nameOrId: string | number): IdLabel | NameLabel;
    function createLabel(nameOrId: string | number): IdLabel | NameLabel {
      throw "unimplemented";
    }
    let a = createLabel("typescript");
    let b = createLabel(2.8);
    let c = createLabel(Math.random() ? "hello" : 42);
  }
  /**
   * createLabel 的这些重载描述了一个 JavaScript 函数，该函数根据其输入类型进行选择。请注意以下几点：
   *  1. 如果库必须在其 API 中一遍又一遍地做出相同的选择，这将变得很麻烦。
   *  2. 我们必须创建三个重载：一个用于确定类型时的每种情况（一个用于string，一个用于number），另一个用于最一般的情况（采用string | number）。
   * 对于 createLabel 可以处理的每个新类型，重载的数量呈指数增长。
   * 
   * 相反，我们可以将该逻辑编码为条件类型：
   */
  type NameOrId<T extends number | string> = T extends number
    ? IdLabel
    : NameLabel;
  /** 然后我们可以使用该条件类型将我们的重载简化为没有重载的单个函数。 */
  function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
    throw "unimplemented";
  }
  {
    let a = createLabel("typescript");
    let b = createLabel(2.8);
    /**
     * 因为分配条件类型的特殊行为，联合类型会单独作为独立类型去处理，最后联合。这样[T]就会让条件处理的时候作为一个类型（联合类型）处理
     */
    let c = createLabel(Math.random() ? "hello" : 42);//IdLabel|NameLabel

    let dValue: string | number = "test";
    let d = createLabel(dValue)//NameLabel。跟最上面的重载还不一样
  }

  /**
   * "条件类型约束"
   * 通常，条件类型中的检查会为我们提供一些新信息。就像使用类型保护进行缩小可以为我们提供更具体的类型一样，条件类型的真正分支将通过我们检查的类型进一步限制泛型。
   * 例如，让我们采取以下措施：
   */
  {
    type MessageOf<T> = T["message"];
  }
  {
    /**
     * 在这个例子中，TypeScript 错误是因为 T 不知道有一个叫做 message 的属性。我们可以约束 T，TypeScript 就不会再抱怨了：
     */
    type MessageOf<T extends { message: unknown }> = T["message"];
    interface Email {
      message: string;
    }
    type EmailMessageContents = MessageOf<Email>;
  }
  {
    /**
     * 但是，如果我们希望 MessageOf 接受任何类型，并且如果消息属性不可用，则默认为 never 之类的东西怎么办？我们可以通过移除约束并引入条件类型来做到这一点：
     */
    type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;
    interface Email {
      message: string;
    }
    interface Dog {
      bark(): void;
    }
    type EmailMessageContents = MessageOf<Email>;
    type DogMessageContents = MessageOf<Dog>;
  }
  {
    /**
     * 在 true 分支中，TypeScript 知道 T 将有一个 message 属性。
     * 作为另一个例子，我们还可以编写一个名为 Flatten 的类型，它将数组类型扁平化为它们的元素类型，否则将它们单独放置：
     * 当 Flatten 被赋予一个数组类型时，它使用带有数字的索引访问来获取 string[] 的元素类型。否则，它只返回给定的类型。
     */
    type Flatten<T> = T extends any[] ? T[number] : T;
    // Extracts out the element type.
    type Str = Flatten<string[]>;
    // Leaves the type alone.
    type Num = Flatten<number>;
  }

  {
    /**
     * "在条件类型中进行推断"
     *  我们刚刚发现自己使用条件类型来应用约束，然后提取出类型。这最终成为一个如此常见的操作，条件类型使它更容易。
     *  条件类型为我们提供了一种使用 infer 关键字从我们在真实分支中比较的类型进行推断的方法。例如，我们可以在 Flatten 中推断元素类型，
     * 而不是使用索引访问类型“手动”获取它：
     */
    type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
    /**
     *  在这里，我们使用 infer 关键字声明性地引入了一个名为 Item 的新泛型类型变量，而不是指定如何在 true 分支中检索 T 的元素类型。
     * 这使我们不必考虑如何挖掘和探索我们感兴趣的类型的结构。
     *  我们可以使用 infer 关键字编写一些有用的辅助类型别名。例如，对于简单的情况，我们可以从函数类型中提取返回类型：
     */
    type GetReturnType<Type> = Type extends (...args: never[]) => infer Return
      ? Return
      : never;
    type Num = GetReturnType<() => number>;
    type Str = GetReturnType<(x: string) => string>;
    type Bools = GetReturnType<(a: boolean, b: boolean) => boolean[]>;
    type Never = GetReturnType<number>;
    /**
     * 当从具有多个调用签名的类型（例如重载函数的类型）进行推断时，会从最后一个签名（这可能是最宽松的包罗万象的情况）进行推断。无法根据参数类型列表执行重载决议。
     */
    declare function stringOrNum(x: string): number;
    declare function stringOrNum(x: number): string;
    declare function stringOrNum(x: string | number): string | number;
    type T1 = ReturnType<typeof stringOrNum>;
  }
  () => {
    /**
     * ***** 分配条件类型 *******
     * 当条件类型作用于泛型类型时，当给定联合类型时，它们会变成分布式的。例如，采取以下措施：
     */
    {
      type ToArray<Type> = Type extends any ? Type[] : never;
    }
    {
      /** 如果我们将联合类型插入 ToArray，则条件类型将应用于该联合的每个成员。 */
      type ToArray<Type> = Type extends any ? Type[] : never;
      type StrArrOrNumArr = ToArray<string | number>;
      /** StrArrOrNumArr 发生了什么： */
      // string | number;
      /** 并映射到联合的每个成员类型，有效地： */
      // ToArray<string> | ToArray<number>;
      /** 这给我们留下了： */
      // string[] | number[];

      /** 通常，分配性是所需的行为。为避免这种行为，您可以用方括号将 extends 关键字的每一侧括起来。 */
      {
        type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;
        // 'StrArrOrNumArr' is no longer a union.
        type StrArrOrNumArr = ToArrayNonDist<string | number>;
      }
    }
  }
}

() => {
  /**
   * ***** 映射类型 *******
   * 当您不想重复自己时，有时一种类型需要基于另一种类型。
   * 映射类型建立在索引签名的语法之上，用于声明尚未提前声明的属性类型：
   */
  type OnlyBoolsAndHorses = {
    [key: string]: boolean | Horse;
  };
  const conforms: OnlyBoolsAndHorses = {
    del: true,
    rodney: false,
  };
  /** 映射类型是一种泛型类型，它使用 PropertyKey 的联合（通常通过 keyof 创建）来迭代键以创建类型： */
  type OptionsFlags<Type> = {
    [Property in keyof Type]: boolean;
  };
  /** 在此示例中，OptionsFlags 将从类型 Type 中获取所有属性并将它们的值更改为布尔值。 */
  type FeatureFlags = {
    darkMode: () => void;
    newUserProfile: () => void;
  };
  type FeatureOptions = OptionsFlags<FeatureFlags>;

  /**
   * "映射修饰符"
   * 在映射期间可以应用两个额外的修饰符：readonly 和 ?分别影响可变性和可选性。
   * 您可以通过添加 - 或 + 前缀来删除或添加这些修饰符。如果不添加前缀，则假定为 +。
   */
  // Removes 'readonly' attributes from a type's properties
  type CreateMutable<Type> = {
    -readonly [Property in keyof Type]: Type[Property];
  };
  type LockedAccount = {
    readonly id: string;
    readonly name: string;
  };
  type UnlockedAccount = CreateMutable<LockedAccount>;

  // Removes 'optional' attributes from a type's properties
  type Concrete<Type> = {
    [Property in keyof Type]-?: Type[Property];
  };
  type MaybeUser = {
    id: string;
    name?: string;
    age?: number;
  };
  type User = Concrete<MaybeUser>;

  () => {
    /**
     * ***** 通过 as 重新映射 key *******
     * 在 TypeScript 4.1 及更高版本中，您可以使用映射类型中的 as 子句重新映射映射类型中的键：
     */
    type MappedTypeWithNewProperties<Type> = {
      [Properties in keyof Type as NewKeyType]: Type[Properties]
    }
    /** 您可以利用模板字面量类型等功能从先前的属性名称创建新的属性名称：*/
    type Getters<Type> = {
      [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
    };
    interface Person {
      name: string;
      age: number;
      location: string;
    }
    type LazyPerson = Getters<Person>;
    /** 您可以通过条件类型生成 never 来过滤键： */
    // Remove the 'kind' property
    type RemoveKindField<Type> = {
      [Property in keyof Type as Exclude<Property, "kind" | "radius">]: Type[Property]
    };
    interface Circle {
      kind: "circle";
      radius: number;
    }
    type KindlessCircle = RemoveKindField<Circle>;
  }
  () => {
    /**
     * "进一步探索"
     * 映射类型与此类型操作部分中的其他功能配合良好，例如，这里是使用条件类型的映射类型，根据对象是否将属性 pii 设置为字面量 true，返回 true 或 false：
     */
    type ExtractPII<Type> = {
      [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;
    };
    type DBFields = {
      id: { format: "incrementing" };
      name: { type: string; pii: true };
    };
    type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>;
  }
}
() => {
  /**
   * ***** 模板字面量类型 *******
   * 模板字面量类型建立在字符串字面量类型之上，并且能够通过联合扩展为多个字符串。
   * 它们与 JavaScript 中的模板字面量字符串具有相同的语法，但用于类型位置。当与具体字面量类型一起使用时，模板字面量通过连接内容产生新的字符串字面量类型。
   */
  type World = "world";
  type Greeting = `hello ${World}`;
  /** 当在插值位置使用联合时，类型是可以由每个联合成员表示的每个可能的字符串字面量的集合： */
  type EmailLocaleIDs = "welcome_email" | "email_heading";
  type FooterLocaleIDs = "footer_title" | "footer_sendoff";
  type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
  /** 对于模板字面量中的每个插值位置，联合交叉相乘： */
  {
    type Lang = "en" | "ja" | "pt";
    type LocaleMessageIDs = `${Lang}_${AllLocaleIDs}`;
  }
  /** 我们通常建议人们对大型字符串联合使用提前生成，但这在较小的情况下很有用。 */

  () => {
    /**
     * ***** 在类型中联合字符串 *******
     * 模板字面量的强大之处在于根据类型中的现有字符串定义新字符串。
     * 例如，JavaScript 中的一个常见模式是根据对象当前拥有的字段来扩展对象。我们将为函数提供一个类型定义，该函数增加了对 on 函数的支持，让您知道值何时发生变化：
     */
    const person = makeWatchedObject({
      firstName: "Saoirse",
      lastName: "Ronan",
      age: 26,
    });
    person.on("firstNameChanged", (newValue) => {
      console.log(`firstName was changed to ${newValue}!`);
    });
    /**
     * 请注意，在侦听事件“firstNameChanged”，而不仅仅是“firstName”时，模板字面量提供了一种在类型系统内处理此类字符串操作的方法：
     */
    type PropEventSource<Type> = {
      on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
    };
    /// Create a "watched object" with an 'on' method
    /// so that you can watch for changes to properties.
    declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;
    /** 有了这个，我们可以构建一些在给定错误属性时出错的东西： */
    person.on("firstNameChanged", () => { });
    // It's typo-resistent
    person.on("firstName", () => { });
    () => {
      /**
       * "使用模板字面量进行推理"
       * 请注意，最后一个示例没有重用原始值的类型。回调使用了 any。模板字面量类型可以从替换位置推断出来。
       * 我们可以使我们的最后一个示例通用，以从 eventName 字符串的部分推断出关联的属性。
       */
      type PropEventSource<Type> = {
        on<Key extends string & keyof Type>
          (eventName: `${Key}Changed`, callback: (newValue: Type[Key]) => void): void;
      };
      declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;
      const person = makeWatchedObject({
        firstName: "Saoirse",
        lastName: "Ronan",
        age: 26
      });
      person.on("firstNameChanged", newName => {
        console.log(`new name is ${newName.toUpperCase()}`);
      });
      person.on("ageChanged", newAge => {
        if (newAge < 0) {
          console.warn("warning! negative age");
        }
      })
      /** 
       *  这里我们就做成了泛型方法。
       *  当用户使用字符串“firstNameChanged”调用时，TypeScript 将尝试推断 Key 的正确类型。为此，它会将 Key 与“Changed”之前的内容进行匹配，
       * 并推断出字符串“firstName”。一旦 TypeScript 计算出out, on 方法可以获取原始对象上 firstName 的类型，在这种情况下是字符串。
       * 类似地，当使用“ageChanged”调用时，TypeScript 会找到属性 age 的类型，即数字。
       *  推理可以以不同的方式组合，通常是解构字符串，并以不同的方式重建它们。
       */
    }
  }
  () => {
    /**
     * ***** 内置的字符串操作类型 *******
     * 为了帮助进行字符串操作，TypeScript 包含一组可用于字符串操作的类型。这些类型内置于编译器中以提高性能，并且无法在 TypeScript 包含的 .d.ts 文件中找到。
     */
    () => {
      /** 
       * "Uppercase<StringType>"
       * 将字符串中的每个字符转换为大写版本。
       */
      type Greeting = "Hello, world"
      type ShoutyGreeting = Uppercase<Greeting>
      type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`
      type MainID = ASCIICacheKey<"my_app">
    }
    () => {
      /**
       * "Lowercase<StringType>"
       * 将字符串中的每个字符转换为等效的小写字母。
       */
      type Greeting = "Hello, world"
      type QuietGreeting = Lowercase<Greeting>
      type ASCIICacheKey<Str extends string> = `id-${Lowercase<Str>}`
      type MainID = ASCIICacheKey<"MY_APP">
    }
    () => {
      /**
       * "Capitalize<StringType>"
       * 将字符串中的第一个字符转换为等效的大写字符。
       */
      type LowercaseGreeting = "hello, world";
      type Greeting = Capitalize<LowercaseGreeting>;
    }
    () => {
      /**
       * "Uncapitalize<StringType>"
       * 将字符串中的第一个字符转换为等效的小写字符。
       */
      type UppercaseGreeting = "HELLO WORLD";
      type UncomfortableGreeting = Uncapitalize<UppercaseGreeting>;
    }
  }
}