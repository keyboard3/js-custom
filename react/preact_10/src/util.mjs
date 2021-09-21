/**
 * 将属性从 `props` 分配给 `obj`
 * @template O, P obj 和 props 类型
 * @param {O} obj 要将属性复制到的对象
 * @param {P} props 要从中复制属性的对象
 * @returns {O & P}
 */
export function assign(obj, props) {
	for (let i in props) obj[i] = props[i];
	return /** @type {O & P} */ (obj);
}

/**
 * 	如果附加，则从其父节点中删除子节点。这是不支持`Element.prototype.remove()`的IE11的解决方法。
 * 使用这个函数比包含一个专用的 polyfill 要小。
 * @param {Node} node 要删除的节点
 */
export function removeNode(node) {
	let parentNode = node.parentNode;
	if (parentNode) parentNode.removeChild(node);
}
