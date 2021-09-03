const fn = () => 1;

// converted to
// var fn = function fn() {
//     return 1;
// };

/**
 * npx babel babel/src/transfrom-arrow-functions.js -o babel/build/transfrom-arrow-functions.js --plugins=@babel/plugin-transform-arrow-functions
 * 通过 plugin-transform-arrow-functions 插件将 es6 标准的箭头函数简化，兼容 es5 的函数声明赋值表达式
 * 
 * npx babel babel/src/transfrom-arrow-functions.js -o babel/build/transfrom-arrow-functions.js --presets=@babel/env
 * preset 预先确定了一组插件，省略了手动一个个添加独立的插件。也可以创建自己的预设来定义自己的插件组合。
 * env 默认包含所有支持最新标准的插件（支持 es6->next）。可以通过配置文件来传递可选参数来细粒度的控制插件
 */