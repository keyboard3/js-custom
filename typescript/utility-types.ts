/** 
 * TypeScript 提供了几种实用程序类型来促进常见的类型转换。这些实用程序可在全球范围内使用。
 */

() => {
  /**
   * Partial<Type>
   * 构造一个 Type 的所有属性都设置为 optional 的类型。此实用程序将返回表示给定类型的所有子集的类型。
   */
  interface Todo {
    title: string;
    description: string;
  }
  function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
    return { ...todo, ...fieldsToUpdate };
  }
  const todo1 = {
    title: "organize desk",
    description: "clear clutter",
  };
  const todo2 = updateTodo(todo1, {
    description: "throw out trash",
  });
  //自己实现
  type MyPartial<T> = {
    [Property in keyof T]?: T[Property];
  }
  const todo3: MyPartial<Todo> = { description: "hello" };
}
() => {
  /**
   * Required<Type>
   * 构造一个由 Type 设置为 required 的所有属性组成的类型。与部分相反。
   */
  interface Props {
    a?: number;
    b?: string;
  }
  const obj: Props = { a: 5 };
  const obj2: Required<Props> = { a: 5 };
  //自己实现
  type MyRequired<T> = {
    [Property in keyof T]-?: T[Property];
  }
  const obj3: MyRequired<Props> = { a: 5 };
}
() => {
  /**
   * Readonly<Type>
   * 构造一个类型，其中 Type 的所有属性都设置为 readonly，这意味着不能重新分配构造类型的属性。
   */
  interface Todo {
    title: string;
  }
  const todo: Readonly<Todo> = {
    title: "Delete inactive users",
  };
  todo.title = "Hello";
  /** 
   * 此实用程序可用于表示将在运行时失败的赋值表达式（即尝试重新分配冻结对象的属性时）。 
   * Object.freeze
   */
  function freeze<Type>(obj: Type): Readonly<Type>;

  type MyReadonly<T> = {
    readonly [Property in keyof T]: T[Property];
  }
  const todo2: MyReadonly<Todo> = {
    title: "test"
  }
  todo2.title = "my test";
}
() => {
  /**
   * Record<Keys,Type>
   * 构造一个对象类型，其属性键为 Keys，属性值为 Type。此实用程序可用于将一种类型的属性映射到另一种类型。
   */
  interface CatInfo {
    age: number;
    breed: string;
  }
  type CatName = "miffy" | "boris" | "mordred";
  const cats: Record<CatName, CatInfo> = {
    miffy: { age: 10, breed: "Persian" },
    boris: { age: 5, breed: "Maine Coon" },
    mordred: { age: 16, breed: "British Shorthair" },
  };
  cats.boris;
  //自己实现
  type MyRecord<T extends string, D> = {
    [Property in T]: D
  }
  const cats2: MyRecord<CatName, CatInfo> = {
    miffy: { age: 10, breed: "Persian" },
    boris: { age: 5, breed: "Maine Coon" },
    mordred: { age: 16, breed: "British Shorthair" },
  }
  cats2.miffy;
}
() => {
  /**
   * Pick<Type, Keys>
   * 通过从 Type 中选取一组属性键（字符串文字或字符串文字的并集）来构造一个类型。
   */
  interface Todo {
    title: string;
    description: string;
    completed: boolean;
  }
  type TodoPreview = Pick<Todo, "title" | "completed">;
  const todo: TodoPreview = {
    title: "Clean room",
    completed: false,
  };
  todo;
  //自己实现
  type MyPick<T, D> = {
    [Property in keyof T as Property extends D ? Property : never]: T[Property];
  }
  const todo2: MyPick<Todo, "title" | "completed"> = {
    title: "Clean room",
    completed: false,
  }
}
() => {
  /**
   * Omit<Type, Keys>
   * 通过从 Type 中选取所有属性然后删除键（字符串文字或字符串文字的并集）来构造一个类型。
   */
  interface Todo {
    title: string;
    description: string;
    completed: boolean;
    createdAt: number;
  }
  type TodoPreview = Omit<Todo, "description">;
  const todo: TodoPreview = {
    title: "Clean room",
    completed: false,
    createdAt: 1615544252770,
  };
  todo;

  //自己实现
  type MyOmit<T, D> = {
    [Property in keyof T as Property extends D ? never : Property]: T[Property]
  }
  type TodoInfo = MyOmit<Todo, "completed" | "createdAt">;
  const todoInfo: TodoInfo = {
    title: "Pick up kids",
    description: "Kindergarten closes at 5pm",
  };
  todoInfo;
}
() => {
  /**
   * Exclude<Type, ExcludedUnion>
   * 通过从 Type 中排除所有可分配给 ExcludedUnion 的联合成员来构造一个类型。
   */
  type T0 = Exclude<"a" | "b" | "c", "a">;
  type T1 = Exclude<"a" | "b" | "c", "a" | "b">;
  type T2 = Exclude<string | number | (() => void), Function>;

  //自己实现
  type MyExclude<T, D> = T extends D ? never : T;
  type T3 = MyExclude<"a" | "b" | "c", "a">;
  type T4 = MyExclude<string | number | (() => void), Function>;
}
() => {
  /**
   * Extract<Type, Union>
   * 通过从 Type 中提取可分配给 Union 的所有联合成员来构造一个类型。
   */
  type T0 = Extract<"a" | "b" | "c", "a" | "f">;
  type T1 = Extract<string | number | (() => void), Function>;

  //自己实现
  type MyExtract<T, D> = T extends D ? T : never;
  type T2 = MyExtract<"a" | "b" | "c", "a" | "f">;
  type T3 = MyExtract<string | number | (() => void), Function>;
}
() => {
  /**
   * NonNullable<Type>
   * 通过从 Type 中排除 null 和 undefined 来构造一个类型。
   */
  type T0 = NonNullable<string | number | undefined>;
  type T1 = NonNullable<string[] | null | undefined>;

  type MyNonNullable<T> = T extends undefined | null ? never : T;
  type T2 = MyNonNullable<string | number | undefined | null>;
}

declare function f1(arg: { a: number; b: string }): void;
()=>{
  /** 
   * Parameters<Type>
   * 根据函数类型 Type 的参数中使用的类型构造元组类型。
   */
   type T0 = Parameters<() => string>;
   type T1 = Parameters<(s: string) => void>;
   type T2 = Parameters<<T>(arg: T) => T>;
   type T3 = Parameters<typeof f1>;
   type T4 = Parameters<any>;
   type T5 = Parameters<never>;
   type T6 = Parameters<string>;
   type T7 = Parameters<Function>;

   //自己实现
   type MyParameters<T extends (...args:any)=>any> = T extends (...args:infer Params)=>void?Params:never;
   type T10 = MyParameters<() => string>;
   type T11 = MyParameters<(s: string) => string>;
   type T13 = MyParameters<typeof f1>;
   type T16 = MyParameters<string>;
}

()=>{
  /**
   * ConstructorParameters<Type>
   * 从构造函数类型的类型构造元组或数组类型。它生成一个包含所有参数类型的元组类型（或者如果 Type 不是函数，则类型 never ）。
   */
   type T0 = ConstructorParameters<ErrorConstructor>;
   type T1 = ConstructorParameters<FunctionConstructor>;
   type T2 = ConstructorParameters<RegExpConstructor>;
   type T3 = ConstructorParameters<any>;
   type T4 = ConstructorParameters<Function>;

   //自己实现
   type MyConstructorParameters<T extends {
     new(...args:any): any;
   }> = T extends {
    new(...args:infer Params): any;
   }? Params:never;
   type T10 = MyConstructorParameters<ErrorConstructor>;
   type T11 = MyConstructorParameters<FunctionConstructor>;
   type T12 = MyConstructorParameters<RegExpConstructor>;
   type T13 = MyConstructorParameters<any>;
   type T14 = MyConstructorParameters<Function>;
}

()=>{
  /**
   * ReturnType<Type>
   * 构造一个由函数 Type 的返回类型组成的类型。
   */
   type T0 = ReturnType<() => string>;
   type T1 = ReturnType<(s: string) => void>;
   type T2 = ReturnType<<T>() => T>;
   type T3 = ReturnType<<T extends U, U extends number[]>() => T>;
   type T4 = ReturnType<typeof f1>;
   type T5 = ReturnType<any>;
   type T6 = ReturnType<never>;
   type T7 = ReturnType<string>;
   type T8 = ReturnType<Function>;

   //自己实现
   type MyReturnType<T extends (...args:any)=>any> = T extends (...args:any)=>infer Return?Return:never;
   type T10 = MyReturnType<() => string>;
   type T11 = MyReturnType<(s: string) => void>;
   type T12 = MyReturnType<<T>() => T>;
   type T13 = MyReturnType<<T extends U, U extends number[]>() => T>;
   type T14 = MyReturnType<typeof f1>;
   type T15 = MyReturnType<any>;
   type T16 = MyReturnType<never>;
   type T17 = MyReturnType<string>;
   type T18 = MyReturnType<Function>;
}

()=>{
  /**
   * InstanceType<Type>
   * 构造一个由 Type 中构造函数的实例类型组成的类型。
   */
   class C {
    x = 0;
    y = 0;
  }
  type T0 = InstanceType<typeof C>;
  type T1 = InstanceType<any>;
  type T2 = InstanceType<never>;
  type T3 = InstanceType<string>;
  type T4 = InstanceType<Function>;

  //自己实现
  type MyInstanceType<T extends {
    new (...args:any):any
  }> = T;
  type T10 = MyInstanceType<typeof C>;
  type T11 = MyInstanceType<any>;
  type T12 = MyInstanceType<never>;
  type T13 = MyInstanceType<string>;
  type T14 = MyInstanceType<Function>;
}
()=>{
  /**
   * ThisParameterType<Type>
   * 提取函数类型的 this 参数的类型，如果函数类型没有 this 参数，则未知。
   */
   function toHex(this: Number) {
    return this.toString(16);
  } 
  function numberToString(n: ThisParameterType<typeof toHex>) {
    return toHex.apply(n);
  }

  // 自己实现
  type MyThisParameterType<T extends (...args:any)=>any> =T extends (this:infer thisType,...args:any)=>any?thisType:never;
  function myNumberToString(n: MyThisParameterType<typeof toHex>) {
    return toHex.apply(n);
  }
}
()=>{
  /**
   * OmitThisParameter<Type>
   *  从 Type 中删除 this 参数。如果 Type 没有显式声明此参数，则结果只是 Type。否则，会从 Type 创建一个没有此参数的新函数类型。
   * 泛型被擦除，只有最后一个重载签名被传播到新的函数类型中。
   */
  function toHex(this: Number) {
    return this.toString(16);
  }
  const fiveToHex: OmitThisParameter<typeof toHex> = toHex.bind(5);
  console.log(fiveToHex());

  type MyOmitThisParameter<T extends (...args:any)=>any> = T extends (this:any,...args:infer Params)=>infer Return?(...args:Params)=>Return:T;
  const fiveToHex2: MyOmitThisParameter<typeof toHex> = toHex.bind(5);
  console.log(fiveToHex());
}
()=>{
  /**
   * ThisType<Type>
   * 此工具不返回转换后的类型。相反，它充当上下文这种类型的标记。请注意，必须启用 --noImplicitThis 标志才能使用此工具。
   */
   type ObjectDescriptor<D, M> = {
    data?: D;
    methods?: M & ThisType<D & M>; // Type of 'this' in methods is D & M
  };
  function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
    let data: object = desc.data || {};
    let methods: object = desc.methods || {};
    return { ...data, ...methods } as D & M;
  }
  let obj = makeObject({
    data: { x: 0, y: 0 },
    methods: {
      moveBy(dx: number, dy: number) {
        this.x += dx; // Strongly typed this
        this.y += dy; // Strongly typed this
      },
    },
  });
  obj.x = 10;
  obj.y = 20;
  obj.moveBy(5, 5);
  /**
   *  ts 内部支持字面量上下文类型，目前暂时没有想到方法自己实现
   *  在上面的例子中，makeObject 参数中的方法对象有一个上下文类型，包括 ThisType<D & M>，因此方法对象中方法中的 
   * this 类型是 { x: number, y: number } & { moveBy (dx: number, dy: number): number }.请注意，methods 属性的类型如何同时是方法中此类型的推理目标和源。
   *  ThisType<T> 标记接口只是一个在 lib.d.ts 中声明的空接口。除了在对象字面量的上下文类型中被识别之外，该接口的作用类似于任何空接口。
   */
}
()=>{
  /**
   * 以下有ts提供的字面量类型转换处理工具，无法自己实现
   * 内在字符串操作类型
   * Uppercase<StringType>
   * Lowercase<StringType>
   * Capitalize<StringType>
   * Uncapitalize<StringType>
   * 为了帮助围绕模板字符串文字进行字符串操作，TypeScript 包含一组可用于类型系统中的字符串操作的类型。您可以在模板文字类型文档中找到这些内容。
   */
}