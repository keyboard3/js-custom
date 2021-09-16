/**
 * https://262.ecma-international.org/11.0/#sec-class-definitions
 * 
 * babel 转义逻辑
 *    将构造函数重命名为SkinnedMesh，然后将SkinnedMesh的prototype指向了个新对象，新对象的prototype是THREE.Mesh.prototype
 *    构造_super函数对象，便于父类构造函数初始化以及父类的方法属性获取
 *    在SkinnedMesh构造函数内将_super作为普通函数调用为当前的this对象创建父类的属性
 *    然后将剩余的属性丢给this
 *    给SkinnedMesh对象创建原型可被继承的方法update，以及直接挂在构造函数上的静态方法defaultMatrix
 */
class SkinnedMesh extends THREE.Mesh {
    constructor(geometry, materials) {
      super(geometry, materials);
  
      this.idMatrix = SkinnedMesh.defaultMatrix();
      this.bones = [];
      this.boneMatrices = [];
      //...
    }
    update(camera) {
      //...
      console.log("camera")
      super.update();
    }
    static defaultMatrix() {
      return new THREE.Matrix4();
    }
  }