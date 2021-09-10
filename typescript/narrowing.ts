/**
 * ***** 缩小 *******
 * 缩小类型(使用联合类型)
 */
/** 假设我们有一个名为 padLeft 的函数 */
function padLeft1(padding: number | string, input: string): string {
  throw new Error("Not implemented yet!");
}
/**
 * 如果 padding 是一个数字，它会将其视为我们想要在输入前添加的空格数。
 * 如果 padding 是一个字符串，它应该只是在输入之前添加 padding。
 * 让我们尝试实现向 padLeft 传递一个数字进行填充时的逻辑。
 */
function padLeft(padding: number | string, input: string) {
  if (typeof padding === "number") {
    //(parameter) padding:number
    return new Array(padding + 1).join(" ") + input;
  }
  //(parameter) padding:string
  return padding + input;
}
/**
 *  如果这看起来像是无趣的 JavaScript 代码，那就是重点。除了我们放置的注释之外，这个 TypeScript 代码看起来像 JavaScript。
 * 这个想法是 TypeScript 的类型系统旨在使编写典型的 JavaScript 代码尽可能容易，而无需向后兼容以获得类型安全。
 *  虽然它看起来可能不多，但实际上这里有很多事情要做。就像 TypeScript 如何使用静态类型分析运行时值一样，它将类型分析覆盖在 JavaScript 的运行时控制流结构上，
 * 如 if/else、条件三元组、循环、真值检查等，这些都会影响这些类型。
 *  在我们的 if 检查中，TypeScript 看到 typeof padding === "number" 并将其理解为一种称为类型保护的特殊代码形式。 
 * TypeScript 遵循可能的执行路径，我们的程序可以采用这些路径来分析给定位置的值的最具体可能类型。它着眼于这些特殊检查（称为类型保护）和赋值，并将类型细化为比声明的类型更具体的类型的过程称为缩小。
 * 在许多编辑器中，我们可以观察这些类型的变化，我们甚至会在我们的示例中这样做。
 */

/**
 * ***** typeof 类型守卫 *******
 * 正如我们所见，JavaScript 支持 typeof 运算符，它可以提供有关我们在运行时拥有的值类型的非常基本的信息。 TypeScript 期望它返回一组特定的字符串：
 * "string","number","bigint","boolean","symbol","undefined","object","function"
 *  就像我们在 padLeft 中看到的那样，这个运算符经常出现在许多 JavaScript 库中，TypeScript 可以理解它以缩小不同分支中的类型。
 *  在 TypeScript 中，检查 typeof 返回的值是一种类型保护。因为 TypeScript 对 typeof 如何操作不同的值进行编码，所以它知道它在 JavaScript 中的一些怪癖。
 * 例如，请注意在上面的列表中，typeof 不返回字符串 null。查看以下示例：
 */
function printAll(strs: string | string[] | null) {
  if (typeof strs === "object") {
    //Object is possibly 'null'.
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  } else {
    // do nothing
  }
}
/**
 *  在 printAll 函数中，我们尝试检查 strs 是否为对象以查看它是否为数组类型（现在可能是强调数组是 JavaScript 中的对象类型的好时机）。
 * 但事实证明，在 JavaScript 中，typeof null 实际上是“对象”！这是历史上的不幸事故之一。
 *  有足够经验的用户可能不会感到惊讶，但并不是每个人都在 JavaScript 中遇到过这种情况；幸运的是，TypeScript 让我们知道 strs 只缩小到 string[] | null 而不仅仅是 string[]。
 */

/**
 * ***** 真值性缩小 *******
 *  真值可能不是你会在字典中找到的一个词，但它是你在 JavaScript 中会听到的很多东西。
 *  在 JavaScript 中，我们可以在条件、&&、||、if 语句、布尔否定 (!) 等中使用任何表达式。例如，if 语句不希望它们的条件总是具有boolean。
 */
function getUsersOnlineMessage(numUsersOnline: number) {
  if (numUsersOnline) {
    return `There are ${numUsersOnline} online now!`;
  }
  return "Nobody's here. :(";
}
/**
 * 在 JavaScript 中，像 if 这样的构造首先将它们的条件“强制”为布尔值以理解它们，然后根据结果是真还是假来选择它们的分支。值像
 * 0,NaN,"" (空字符串),0n (bigint版本的0),null,undefined 都被认为是false。其他值为true。
 * 你始终可以通过布尔函数运行值或使用较短的双布尔否定将值强制转换为布尔值。 （后者的优点是 TypeScript 推断出一个狭窄的文字布尔类型为真，而将第一个推断为布尔类型。）
 */
// both of these result in 'true'
const value1 = Boolean("hello"); // type: boolean, value: true
const value2 = !!"world"; // type: true, value: true
/**
 * 利用这种行为是相当流行的，尤其是在防范 null 或 undefined 之类的值时。例如，让我们尝试将它用于我们的 printAll 函数。
 * 你会注意到我们已经通过检查 strs 是否为真消除了上面的错误。这至少可以防止我们在运行代码时出现可怕的错误，例如：
 */
function printAll2(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}
/**
 *  但请记住，对原语的真值检查通常容易出错。例如，考虑编写 printAll 的不同尝试
 *  我们将整个函数体包装在一个真实的检查中，但这有一个微妙的缺点：我们可能不再正确处理空字符串的情况。
 *  TypeScript 在这里根本不会伤害我们，但是如果您对 JavaScript 不太熟悉，这种行为值得注意。 TypeScript 通常可以帮助您及早发现错误，
 * 但是如果您选择对某个值不做任何处理，那么它可以做的就只有这么多，而不会过于规范。如果需要，您可以确保使用 linter 处理此类情况。
 * 
 */
function printAll3(strs: string | string[] | null) {
  // !!!!!!!!!!!!!!!!
  //  DON'T DO THIS!
  //   KEEP READING
  // !!!!!!!!!!!!!!!!
  if (strs) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {//空字符串会不会被处理
      console.log(strs);
    }
  }
}
/** 关于通过真值缩小的最后一句话是布尔否定通过!符号来过滤类型，在false分支。*/
function multiplyAll(
  values: number[] | undefined,
  factor: number
): number[] | undefined {
  if (!values) {
    return values;
  } else {
    return values.map((x) => x * factor);
  }
}
/**
 * ***** 相等缩小 *******
 * TypeScript 还使用 switch 语句和相等检查，如 ===、!==、== 和 != 来缩小类型。例如：
 */
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // We can now call any 'string' method on 'x' or 'y'.
    x.toUpperCase();
    // (method) String.toUpperCase(): string
    y.toLowerCase();
    // (method) String.toLowerCase(): string
  } else {
    console.log(x);
    // (parameter) x: string | number
    console.log(y);
    // (parameter) y: string | boolean
  }
}
/**
 *  当我们在上面的例子中检查 x 和 y 是否相等时，TypeScript 知道它们的类型也必须相等。
 * 由于字符串是 x 和 y 都可以采用的唯一常见类型，因此 TypeScript 知道 x 和 y 必须是第一个分支中的字符串。
 *  检查特定的文字值（而不是变量）也有效。在我们关于真值缩小的部分中，我们编写了一个容易出错的 printAll 函数，因为它意外地没有正确处理空字符串。
 * 相反，我们可以做一个特定的检查来阻止空值，并且 TypeScript 仍然正确地从 strs 的类型中删除空值。
 */
function printAll4(strs: string | string[] | null) {
  if (strs !== null) {
    if (typeof strs === "object") {
      for (const s of strs) {
        //(parameter) strs: string[]
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
      //(parameter) strs: string
    }
  }
}
/**
 *  JavaScript 使用 == 和 != 的更松散的相等性检查也被正确地缩小了范围。如果您不熟悉，检查 something == null 是否实际上不仅检查它是否特别是值 null - 它还检查它是否可能 undefined。
 * 这同样适用于 == undefined：它检查一个值是 null 还是 undefined。
 */
interface Container {
  value: number | null | undefined;
}
function multiplyValue(container: Container, factor: number) {
  // Remove both 'null' and 'undefined' from the type.
  if (container.value != null) {
    console.log(container.value);
    // (property) Container.value: number
    // Now we can safely multiply 'container.value'.
    container.value *= factor;
  }
}

/**
 * ***** in 运算符缩小 *******
 *  Javascript 有一个运算符来确定对象是否具有带名称的属性：in 运算符。 TypeScript 将这一点作为缩小潜在类型的一种方式。
 *  例如，使用代码：x 中的“值”。其中“value”是字符串字面量，x 是联合类型。 “true”分支缩小了具有可选或必需属性值的 x 类型，而“false”分支缩小到具有可选或缺失属性值的类型。
 */
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }
  return animal.fly();
}
/**
 * 可选属性将存在于缩小的两侧，例如，人类可以游泳和飞行（使用正确的设备），因此应该出现在检查的两侧：
 */
{
  type Fish = { swim: () => void };
  type Bird = { fly: () => void };
  type Human = { swim?: () => void; fly?: () => void };
  function move1(animal: Fish | Bird | Human) {
    if ("swim" in animal) {
      animal;
      //  (parameter) animal: Fish | Human
    } else {
      animal;
      //  (parameter) animal: Bird | Human
    }
  }
}

/**
 * ***** instanceof 缩小 *******
 *  JavaScript 有一个运算符来检查一个值是否是另一个值的“实例”。更具体地说，在 JavaScript 中，x instanceof Foo 检查 x 的原型链是否包含 Foo.prototype。
 * 虽然我们不会在这里深入探讨，当我们进入类时你会看到更多这样的内容，但它们对于大多数可以用 new 构造的值仍然很有用。你可能已经猜到了，instanceof 也是一个类型保护，TypeScript 缩小了由 instanceofs 保护的分支。
 */
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
    // (parameter) x: Date
  } else {
    console.log(x.toUpperCase());
    // (parameter) x: string
  }
}

/**
 * ***** 赋值缩小 *******
 * 正如我们之前提到的，当我们为任何变量赋值时，TypeScript 会查看赋值的右侧并适当缩小左侧。
 */
{
  let x = Math.random() < 0.5 ? 10 : "hello world!";
  //  let x: string | number
  x = 1;
  console.log(x);
  // let x: number
  x = "goodbye!";
  console.log(x);
  // let x: string
}
/**
 *  请注意，这些分配中的每一个都是有效的。即使在我们第一次赋值后观察到的 x 类型变成了数字，我们仍然能够为 x 分配一个字符串。
 * 这是因为 x 的声明类型 - x 开头的类型 - 是 string | number，并且始终根据声明的类型检查可分配性。
 *  如果我们为 x 分配了一个布尔值，我们就会看到一个错误，因为它不是声明类型的一部分。
 */
{
  let x = Math.random() < 0.5 ? 10 : "hello world!";
  //  let x: string | number
  x = 1;
  console.log(x);
  // let x: number
  x = true;
  //Type 'boolean' is not assignable to type 'string | number'.
  console.log(x);
  // let x: string
}

/**
 * ***** 控制流分析 *******
 * 到目前为止，我们已经通过一些基本示例来说明 TypeScript 如何在特定分支中缩小范围。但是除了从每个变量中走出来并在 if、while、conditional 等中寻找类型保护之外，还有更多的事情要做。例如
 * 这种基于可达性的代码分析称为控制流分析，TypeScript 使用这种流分析在遇到类型保护和赋值时缩小类型。当分析一个变量时，控制流可以一次又一次地分裂和重新合并，并且可以观察到该变量在每个点都有不同的类型。
 */
() => {
  function example() {
    let x: string | number | boolean;
    x = Math.random() < 0.5;
    console.log(x);
    // let x: boolean
    if (Math.random() < 0.5) {
      x = "hello";
      console.log(x);
      // let x: string
    } else {
      x = 100;
      console.log(x);
      // let x: number
    }
    return x;
    // let x: string | number
  }
}

/**
 * ***** 使用类型谓词 *******
 * 到目前为止，我们已经使用现有的 JavaScript 构造来处理缩小问题，但是有时您希望更直接地控制整个代码中的类型更改方式。
 * 要定义用户定义的类型保护，我们只需要定义一个返回类型为类型谓词的函数：
 */
function getSmallPet() {
  if (true) return { name: "", swim: () => { } };
  return { name: "", fly: () => { } };
}
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
/**
 * 在这个例子中，pet is Fish 是我们的类型谓词。谓词采用 parameterName is Type 形式，其中 parameterName 必须是当前函数签名中的参数名称。
 * 任何时候使用某个变量调用 isFish 时，如果原始类型兼容，TypeScript 都会将该变量缩小到该特定类型。
 */
// Both calls to 'swim' and 'fly' are now okay.
let pet = getSmallPet();
if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}
/**
 * 请注意，TypeScript 不仅知道 pet 是 if 分支中的 Fish；它也知道在 else 分支中，你没有 Fish，所以你必须有一个 Bird。
 * 您可以使用类型保护 isFish 来过滤 Fish | 数组。 Bird 并获得一个 Fish 数组：
 */
const zoo: (Fish | Bird)[] = [getSmallPet(), getSmallPet(), getSmallPet()];
const underWater1: Fish[] = zoo.filter(isFish);
// or, equivalently
const underWater2: Fish[] = zoo.filter(isFish) as Fish[];
// The predicate may need repeating for more complex examples
const underWater3: Fish[] = zoo.filter((pet): pet is Fish => {
  if (pet.name === "sharkey") return false;//正确的应该缺少name属性，这里忽略这个异常
  return isFish(pet);
});

/**
 * ***** 鉴别联合类型 *******
 *  到目前为止，我们看过的大多数示例都集中在使用字符串、布尔值和数字等简单类型来缩小单个变量的范围。虽然这很常见，但在 JavaScript 中的大部分时间我们将处理稍微复杂的结构。
 *  出于某种动机，让我们假设我们正在尝试对圆形和正方形等形状进行编码。圆形记录它们的半径，正方形记录它们的边长。我们将使用一个名为 kind 的字段来判断我们正在处理的形状。这是定义 Shape 的第一次尝试。
 */
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}
/**
 * 请注意，我们使用字符串字面量类型的联合：“circle”和“square”来告诉我们是否应该分别将形状视为圆形或方形。通过使用“圆圈” | "square" 而不是 string，我们可以避免拼写错误的问题。
 */
function handleShape(shape: Shape) {
  // oops!
  if (shape.kind === "rect") {
    // This condition will always return 'false' since the types '"circle" | "square"' and '"rect"' have no overlap.
    // ...
  }
}
/** 我们可以编写一个 getArea 函数，根据它处理的是圆形还是方形来应用正确的逻辑。我们将首先尝试处理圆圈。*/
() => {
  function getArea(shape: Shape) {
    return Math.PI * shape.radius ** 2;
    // Object is possibly 'undefined'.
  }
}
/** 在strictNullChecks 下会给我们一个错误——这是合适的，因为可能没有定义半径。但是如果我们对 kind 属性执行适当的检查呢？*/
() => {
  function getArea(shape: Shape) {
    if (shape.kind === "circle") {
      return Math.PI * shape.radius ** 2;
      // Object is possibly 'undefined'.
    }
  }
}
/** 嗯，TypeScript 仍然不知道在这里做什么。我们已经达到了比类型检查器更了解我们的值的地步。我们可以尝试使用非空断言（shape.radius 之后的一个！）来表示半径肯定存在。*/
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius! ** 2;
  }
}
/**
 *  但这感觉并不理想。我们不得不用那些非空断言 (!) 对类型检查器大喊大叫，以说服它 shape.radius 已定义，但如果我们开始移动代码，这些断言很容易出错。
 * 此外，在 strictNullChecks 之外，我们可能会意外地访问任何这些字段（因为在读取它们时只是假定可选属性始终存在）。我们绝对可以做得更好。
 *  这种 Shape 编码的问题在于，类型检查器无法根据 kind 属性知道是否存在 radius 或 sideLength。我们需要将我们知道的信息传达给类型检查器。考虑到这一点，让我们再次定义 Shape。
 */
interface Circle {
  kind: "circle";
  radius: number;
}
interface Square {
  kind: "square";
  sideLength: number;
}
() => {

  type Shape = Circle | Square;
  /**
   * 在这里，我们正确地将 Shape 分成了两种类型，它们的 kind 属性值不同，但是 radius 和 sideLength 在它们各自的类型中被声明为必需的属性。
   * 让我们看看当我们尝试访问 Shape 的半径时会发生什么。
   */
  function getArea(shape: Shape) {
    return Math.PI * shape.radius ** 2;
    // Property 'radius' does not exist on type 'Shape'.
    //   Property 'radius' does not exist on type 'Square'.
  }
  /**
   *  就像我们对 Shape 的第一个定义一样，这仍然是一个错误。当 radius 是可选的时，我们得到一个错误（仅在 strictNullChecks 中），因为 TypeScript 无法判断该属性是否存在。
   * 现在 Shape 是一个联合，TypeScript 告诉我们 shape 可能是一个 Square，而 Squares 没有定义半径！两种解释都是正确的，但只有我们新的 Shape 编码仍然会导致 strictNullChecks 之外的错误。
   *  但是如果我们再次尝试检查 kind 属性呢？
   */
  function getArea2(shape: Shape) {
    if (shape.kind === "circle") {
      return Math.PI * shape.radius ** 2;
      // (parameter) shape: Circle
    }
  }
  /**
   *  这摆脱了错误！当联合中的每个类型都包含具有字面量类型的公共属性时，TypeScript 认为这是一个可区分的联合，并且可以缩小联合的成员范围。
   *  在这种情况下， kind 是共同属性（这被认为是 Shape 的判别属性）。检查 kind 属性是否为“circle”，去掉了 Shape 中所有没有 kind 属性为“circle”类型的类型。将形状缩小到圆形类型。
   *  同样的检查也适用于 switch 语句。现在我们可以尝试编写我们完整的 getArea 而不会有任何麻烦！非空断言。
   */
  function getArea3(shape: Shape) {
    switch (shape.kind) {
      case "circle":
        return Math.PI * shape.radius ** 2;
      // (parameter) shape: Circle
      case "square":
        return shape.sideLength ** 2;
      // (parameter) shape: Square
    }
  }
  /**
   *  这里重要的是Shape的编码。向 TypeScript 传达正确的信息——Circle 和 Square 实际上是两种具有特定类型字段的独立类型——至关重要。
   * 这样做可以让我们编写类型安全的 TypeScript 代码，该代码看起来与我们本来会编写的 JavaScript 没有什么不同。从那里，类型系统能够做“正确”的事情并找出 switch 语句每个分支中的类型。
   *  顺便说一句，尝试使用上面的示例并删除一些返回关键字。你会看到类型检查可以帮助避免在 switch 语句中意外遇到不同子句时出现错误。
   *  有区别的联合不仅仅用于讨论圆形和方形。它们适用于在 JavaScript 中表示任何类型的消息传递方案，例如通过网络发送消息（客户端/服务器通信），或在状态管理框架中编码突变。
   */
}

/**
 * ***** never 类型 *******
 * 在缩小范围时，您可以将联合的选项减少到您已删除所有可能性并且一无所有的程度。在这些情况下，TypeScript 将使用 never 类型来表示不应该存在的状态。
 */

/**
 * ***** 穷举检查 *******
 * never 类型可分配给每种类型；但是，没有类型可以分配给 never（除了 never 本身）。这意味着您可以使用缩小并依靠从不出现在 switch 语句中进行详尽的检查。
 * 例如，向我们的 getArea 函数添​​加一个默认值，该函数试图将形状分配为 never 在尚未处理所有可能的情况时将引发。
 */
() => {
  type Shape = Circle | Square;

  function getArea(shape: Shape) {
    switch (shape.kind) {
      case "circle":
        return Math.PI * shape.radius ** 2;
      case "square":
        return shape.sideLength ** 2;
      default:
        const _exhaustiveCheck: never = shape;
        return _exhaustiveCheck;
    }
  }
}
/** 向 Shape union 添加新成员会导致 TypeScript 错误： */
interface Triangle {
  kind: "triangle";
  sideLength: number;
}
() => {
  type Shape = Circle | Square | Triangle;

  function getArea(shape: Shape) {
    switch (shape.kind) {
      case "circle":
        return Math.PI * shape.radius ** 2;
      case "square":
        return shape.sideLength ** 2;
      default:
        const _exhaustiveCheck: never = shape;
        // Type 'Triangle' is not assignable to type 'never'.
        return _exhaustiveCheck;
    }
  }
}