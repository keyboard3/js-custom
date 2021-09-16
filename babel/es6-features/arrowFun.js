/**
 * 在解析执行到函数调用表达式
 * https://262.ecma-international.org/11.0/#sec-evaluatecall
 * 1. 获取到函数符号指向的定义函数的对象
 * 2. 检查这个函数是否有this对象，没有就解析调用者符号
 * 3. 没有的话，递归这个过程确定了this对象
 * 4. 设置函数调用时的this对象
 * 5. 解析函数内部代码符号时，遇到this符号就会解析到当前作用域下的this对象
 * 
 * https://262.ecma-international.org/11.0/#table-16
 * 普通函数调用因为没有this对象，每次调用会去解析调用链定位到this对象
 * 在解析箭头函数表达式时，箭头函数的 Environment Record 的 this 指向了父级函数的 this
 * 
 * QuickJS: 定义新函数 JS_PARSE_FUNC_ARROW fd
 *      fd->has_arguments_binding = func_type != JS_PARSE_FUNC_ARROW
 *      fd->has_this_binding = fd->has_arguments_binding
 *      fd->this_var_idx = add_var_this(ctx, fd); //这里会从父级的fd获取到索引
 * 
 * babel 简化成 es5 实现时，会将 this 符号调用调换成 _this，这个 _this 则从词法作用域上绑定
 * 通过替换 this 符号也就避免了调用放不经意的改动了函数的 this 符号的指向
 const people = {
  say: function () {
    var _this = this;
    console.log("say this", this);
    return function () {
      console.log("inner this", _this);
    };
  }
};
 */

/**
 * npx babel babel/src/arrow-functions.js -o babel/build/arrow-functions.js --plugins=@babel/plugin-transform-arrow-functions
 * 通过 plugin-transform-arrow-functions 插件将 es6 标准的箭头函数简化，兼容 es5 的函数声明赋值表达式
 *
 * npx babel babel/src/arrow-functions.js -o babel/build/arrow-functions.js --presets=@babel/env
 * preset 预先确定了一组插件，省略了手动一个个添加独立的插件。也可以创建自己的预设来定义自己的插件组合。
 * env 默认包含所有支持最新标准的插件（支持 es6->next）。可以通过配置文件来传递可选参数来细粒度的控制插件
 */

// Expression bodies
var odds = evens.map(v => v + 1);
var nums = evens.map((v, i) => v + i);

// Statement bodies
nums.forEach(v => {
  if (v % 5 === 0)
    fives.push(v);
});

// Lexical this
var bob = {
  _name: "Bob",
  _friends: [],
  printFriends() {
    this._friends.forEach(f =>
      console.log(this._name + " knows " + f));
  }
};

// Lexical arguments
function square() {
  let example = () => {
    let numbers = [];
    for (let number of arguments) {
      numbers.push(number * number);
    }

    return numbers;
  };

  return example();
}

square(2, 4, 7.5, 8, 11.5, 21); // returns: [4, 16, 56.25, 64, 132.25, 441]