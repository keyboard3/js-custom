/**
 * 装饰器其实就是对类语法糖编译过程暴露的hook
 * 类装饰器在语法糖完成对构造函数的之后，对类中的属性等进行修改
 * 属性装饰器则是在对定义构造函数的prototype上defineProperty之前调用它修改好
 */
@checkClass
class Person2 {
  @checkProperty age = 18;
}

function checkClass(target) {
  console.log("target", target);
}
function checkProperty() {
  return function (target, propertyKey, descriptor) {
    console.log("checkProperty", propertyKey)
  }
}

const hello = new Person2();
console.log(hello);