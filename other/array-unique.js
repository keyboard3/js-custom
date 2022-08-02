/**
 * 面试题: 数组去重逻辑
 * 对象根据内容判断是否相同
 */

function unique(obj) {
  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      let item = obj[i];
      let newItem = unique(item);
      obj[i] = newItem;
      for (let j = obj.length - 1; j > i; j--) {
        if (isEqual(newItem, obj[j])) {
          obj.splice(j, 1);
          break;
        }
      }
    }
  } else if (typeof obj == "object" && obj != null) {
    Reflect.ownKeys(obj).forEach(key => obj[key] = unique(obj[key]));
  }
  return obj;
}
function isEqual(obj1, obj2) {
  if (typeof obj1 != typeof obj2) return false;
  if (Array.isArray(obj1) != Array.isArray(obj2)) return false;
  if (typeof obj1 != "object") return obj1 == obj2;
  if (obj1 == null || obj2 == null) return obj1 == obj2;
  if (obj1.length != obj2.length) return false;

  if (Array.isArray(obj1)) {
    for (let i = 0; i < obj1.length; i++)
      if (!isEqual(obj1[i], obj2[i])) return false;
    return true;
  }
  for (let key of Reflect.ownKeys(obj1)) {
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}
let array = [1, 2, 1, "1", "1", { a: 1, b: 2 }, { b: 2, a: 1 }, { c: [1, 2, 4, 2] }, null, null, undefined, {}, {}];
unique(array);

console.log(array);