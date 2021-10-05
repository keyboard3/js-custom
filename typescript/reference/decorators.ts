/**
  随着 TypeScript 和 ES6 中 Classes 的引入，现在存在一些需要额外功能来支持注释或修改类和类成员的场景。
  装饰器提供了一种为类声明和成员添加注释和元编程语法的方法。
  装饰器是 JavaScript 的第 2 阶段提案，可作为 TypeScript 的实验性功能使用。
  NOTE 装饰器是一项实验性功能，可能会在未来版本中更改。

  要启用对装饰器的实验性支持，您必须在命令行或 tsconfig.json 中启用 ExperimentDecorators 编译器选项：
  命令行:
    tsc --target ES5 --experimentalDecorators
  tsconfig.json:
    {
      "compilerOptions": {
        "target": "ES5",
        "experimentalDecorators": true
      }
    }
 */
/**
  装饰器
  装饰器是一种特殊的声明，可以附加到类声明、方法、访问器、属性或参数。
  装饰器使用@expression 形式，其中表达式必须计算为一个函数，该函数将在运行时调用，并带有有关装饰声明的信息。
  例如，给定装饰器@sealed，我们可以编写如下的sealed 函数：
 */
function sealed(target: any) {
  // do something with 'target' ...
}
/**
  装饰工厂
  如果我们想自定义装饰器如何应用于声明，我们可以编写一个装饰器工厂。装饰器工厂只是一个返回表达式的函数，该表达式将在运行时被装饰器调用。
  我们可以用以下方式编写一个装饰工厂：
 */
function color(value: string) {
  // this is the decorator factory, it sets up
  // the returned decorator function
  return function (target: any) {
    // this is the decorator
    // do something with 'target' and 'value'...
  };
}
/**
  装饰器组合
  多个装饰器可以应用于一个声明，例如在一行上：
    @f @g x
  在多行上：
    @f
    @g
    x
  当多个装饰器应用于单个声明时，它们的评估类似于数学中的函数组合。在这个模型中，当组合函数 f 和 g 时，得到的组合 (f ∘ g)(x) 等价于 f(g(x))。
  因此，在 TypeScript 中对单个声明评估多个装饰器时，将执行以下步骤：
    1. 每个装饰器的表达式都是从上到下计算的。
    2. 然后将结果作为函数从下到上调用。
  如果我们使用装饰器工厂，我们可以通过以下示例观察此评估顺序：
 */
function first() {
  console.log("first(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): called");
  };
}

function second() {
  console.log("second(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): called");
  };
}

class ExampleClass {
  @first()
  @second()
  method() { }
}
/**
  装饰器评估
  对于如何应用应用于类内部各种声明的装饰器，有一个明确定义的顺序：
    1. 每个实例成员都应用参数装饰器，然后是方法、访问器或属性装饰器。
    2. 每个静态成员都应用参数装饰器，然后是方法、访问器或属性装饰器。
    3. 参数装饰器应用于构造函数。
    4. 类装饰器应用于类。
 */
/**
  类装饰器是在类声明之前声明的。类装饰器应用于类的构造函数，可用于观察、修改或替换类定义。类装饰器不能在声明文件或任何其他环境上下文中使用（例如在 declare class）。
  类装饰器的表达式将在运行时作为函数调用，装饰类的构造函数作为其唯一参数。
  如果类装饰器返回一个值，它将用提供的构造函数替换类声明。
  注意 如果您选择返回一个新的构造函数，您必须注意维护原始原型。在运行时应用装饰器的逻辑不会为您执行此操作。
  以下是应用于 BugReport 类的类装饰器 (@sealed) 的示例：
 */
@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
/** 我们可以使用以下函数声明来定义 @sealed 装饰器： */
function sealed2(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}
/**
  当@sealed 被执行时，它将密封构造函数和它的原型，因此在运行时通过访问 BugReport.prototype 或通过在 BugReport 本身上定义属性
（注意 ES2015类实际上只是基于原型的构造函数的语法糖）。此装饰器不会阻止类对 BugReport 进行子类化。
  接下来，我们有一个示例说明如何覆盖构造函数以设置新的默认值。
 */
function reportableClassDecorator<T extends { new(...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    reportingURL = "http://www...";
  };
}

@reportableClassDecorator
class BugReport2 {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}

const bug = new BugReport2("Needs dark mode");
console.log(bug.title); // Prints "Needs dark mode"
console.log(bug.type); // Prints "report"

// Note that the decorator _does not_ change the TypeScript type
// and so the new property `reportingURL` is not known
// to the type system:
bug.reportingURL;

/**
  方法装饰器
  方法装饰器是在方法声明之前声明的。装饰器应用于方法的属性描述符，可用于观察、修改或替换方法定义。方法装饰器不能在声明文件、重载或任何其他环境上下文中使用（例如在声明类中）。
  方法装饰器的表达式将在运行时作为函数调用，带有以下三个参数：
    1. 静态成员的类的构造函数，或实例成员的类的原型。
    2. 成员的名字
    3. 成员的属性描述符。
  注意 如果您的脚本目标小于 ES5，则属性描述符将是未定义的。
  
  如果方法装饰器返回一个值，它将用作该方法的属性描述符。
  注意 如果您的脚本目标小于 ES5，则忽略返回值。
  以下是应用于 Greeter 类上的方法的方法装饰器 (@enumerable) 的示例：
 */
class Greeter11 {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}
/**
  这里的@enumerable(false) 装饰器是一个装饰器工厂。当@enumerable(false) 装饰器被调用时，它会修改属性描述符的可枚举属性。
 */

/**
  访问器装饰器
  访问器装饰器是在访问器声明之前声明的。访问器装饰器应用于访问器的属性描述符，可用于观察、修改或替换访问器的定义。
不能在声明文件或任何其他环境上下文中使用访问器装饰器（例如在声明类中）
  注意 TypeScript 不允许同时修饰单个成员的 get 和 set 访问器。相反，成员的所有装饰器必须应用于按文档顺序指定的第一个访问器。
这是因为装饰器适用于属性描述符，它结合了 get 和 set 访问器，而不是单独的每个声明。
  访问器装饰器的表达式将在运行时作为函数调用，具有以下三个参数：
    1. 静态成员的类的构造函数，或实例成员的类的原型。
    2. 成员的名称
    3. 成员的属性描述符。
  注意 如果您的脚本目标小于 ES5，则属性描述符将是未定义的。
  如果访问器装饰器返回一个值，它将用作成员的属性描述符。
  注意 如果您的脚本目标小于 ES5，则忽略返回值。
  以下是应用于 Point 类成员的访问器装饰器 (@configurable) 的示例：
 */
class Point11 {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @configurable(false)
  get x() {
    return this._x;
  }

  @configurable(false)
  get y() {
    return this._y;
  }
}
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}

/**
  属性装饰器是在属性声明之前声明的。属性装饰器不能在声明文件或任何其他环境上下文中使用（例如在声明类中）。
  属性装饰器的表达式将在运行时作为函数调用，带有以下两个参数：
    1. 静态成员的类的构造函数，或实例成员的类的原型。
    2. 成员的名称
  注意 由于属性装饰器在 TypeScript 中是如何初始化的，所以没有提供属性描述符作为属性装饰器的参数。这是因为当前在定义原型成员时没有描述实例属性的机制，
也没有办法观察或修改属性的初始值设定项。返回值也被忽略。因此，属性装饰器只能用于观察已为类声明了特定名称的属性。
  我们可以使用此信息来记录有关该属性的元数据，如下例所示：
 */
class Greeter {
  @format("Hello, %s")
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    let formatString = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
import "reflect-metadata";
const formatMetadataKey = Symbol("format");
function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}
function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
/**
  这里的@format("Hello, %s") 装饰器是一个装饰器工厂。当@format("Hello, %s") 被调用时，它使用反射元数据库中的 Reflect.metadata 函数为属性添加一个元数据条目。
调用 getFormat 时，它会读取格式的元数据值。
  注意 此示例需要reflect-metadata 库。有关reflect-metadata 库的更多信息，请参阅元数据。
 */

/**
  参数装饰器
  参数装饰器是在参数声明之前声明的。参数装饰器应用于类构造函数或方法声明的函数。参数装饰器不能在声明文件、重载或任何其他环境上下文中使用（例如在声明类中）。
  参数装饰器的表达式将在运行时作为函数调用，带有以下三个参数：
    1. 静态成员的类的构造函数，或实例成员的类的原型。
    2. 成员的名称
    3. 函数参数列表中参数的序数索引。
  注意 参数装饰器只能用于观察已在方法上声明的参数。
  参数装饰器的返回值被忽略。
  以下是应用于 BugReport 类成员的参数的参数装饰器 (@required) 的示例：
 */
class BugReport12 {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }

  @validate
  print(@required verbose: boolean) {
    if (verbose) {
      return `type: ${this.type}\ntitle: ${this.title}`;
    } else {
      return this.title;
    }
  }
}
import "reflect-metadata";
const requiredMetadataKey = Symbol("required");

function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value!;

  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, arguments);
  };
}
/**
  @required 装饰器添加一个元数据条目，将参数标记为必需的。然后@validate 装饰器将现有的greet 方法包装在一个函数中，该函数在调用原始方法之前验证参数。
  注意 此示例需要reflect-metadata 库。有关reflect-metadata 库的更多信息，请参阅元数据。
 */

/**
  元数据
  一些示例使用反射元数据库，它为实验性元数据 API 添加了一个 polyfill。这个库还不是 ECMAScript (JavaScript) 标准的一部分。
然而，一旦装饰器被正式采用为 ECMAScript 标准的一部分，这些扩展将被提议采用。
  你可以通过 npm 安装这个库：npm i reflect-metadata --save
  TypeScript 包括为具有装饰器的声明发出某些类型的元数据的实验性支持。
  要启用此实验性支持，您必须在命令行或 tsconfig.json 中设置 emitDecoratorMetadata 编译器选项：
  tsc --target ES5 --experimentalDecorators --emitDecoratorMetadata
  or 
  {
    "compilerOptions": {
      "target": "ES5",
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true
    }
  }
  启用后，只要导入了反射元数据库，就会在运行时公开其他设计时类型信息。
  我们可以在以下示例中看到这一点：
 */
class Point {
  constructor(public x: number, public y: number) { }
}

class Line {
  private _start: Point;
  private _end: Point;

  @validate
  set start(value: Point) {
    this._start = value;
  }

  get start() {
    return this._start;
  }

  @validate
  set end(value: Point) {
    this._end = value;
  }

  get end() {
    return this._end;
  }
}

function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
  let set = descriptor.set!;

  descriptor.set = function (value: T) {
    let type = Reflect.getMetadata("design:type", target, propertyKey);

    if (!(value instanceof type)) {
      throw new TypeError(`Invalid type, got ${typeof value} not ${type.name}.`);
    }

    set.call(this, value);
  };
}

const line = new Line()
line.start = new Point(0, 0)

// @ts-ignore
// line.end = {}

// Fails at runtime with:
// > Invalid type, got object not Point
/**
  TypeScript 编译器将使用 @Reflect.metadata 装饰器注入设计时类型信息。您可以将其视为等效于以下 TypeScript：
 */
class Line {
  private _start: Point;
  private _end: Point;
  @validate
  @Reflect.metadata("design:type", Point)
  set start(value: Point) {
    this._start = value;
  }
  get start() {
    return this._start;
  }
  @validate
  @Reflect.metadata("design:type", Point)
  set end(value: Point) {
    this._end = value;
  }
  get end() {
    return this._end;
  }
}
/**
 NOTE 装饰器元数据是一项实验性功能，可能会在未来版本中引入重大更改。
 */