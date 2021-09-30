/**
 * 数组类型支持：对象，数组，循环引用
 * @param {*} obj 克隆对象
 * @param {*} cacheMap 循环引用的缓存Map
 */
function deepClone(obj, cacheMap) {
  if (typeof obj != "object") return obj;
  const newObj = Array.isArray(obj) ? [] : {};
  cacheMap.set(obj, newObj);
  for (let key in obj) {
    let newValue = cacheMap.get(obj[key]);
    if (!newValue) newValue = deepClone(obj[key], cacheMap);
    newObj[key] = newValue;
  }
  return newObj;
}
const wang = {
  name: "baba",
  age: 45,
  children: [
    {
      name: "c1",
      age: 11,
    }
  ]
}
for (let item of wang.children) {
  item.parent = wang;
}
const wang2 = deepClone(wang, new Map());
console.log(wang == wang2, wang2);