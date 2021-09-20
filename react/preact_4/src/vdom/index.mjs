import { clone, toLowerCase, isFunction, isString, hasOwnProperty } from '../util.mjs';
import { isFunctionalComponent } from './functional-component.mjs';
import { getNodeType } from '../dom/index.mjs';


/** 检查两个节点是否等效。
 *	@param {Element} node
 *	@param {VNode} vnode
 *	@private
 */
export function isSameNodeType(node, vnode) {
	if (isFunctionalComponent(vnode)) return true;
	let nodeName = vnode.nodeName;
	if (isFunction(nodeName)) return node._componentConstructor===nodeName;
	if (getNodeType(node)===3) return isString(vnode);
	return toLowerCase(node.nodeName)===nodeName;
}


/**
 * 从 VNode 重建组件的 `props`。
 * 确保来自 `defaultProps` 的默认/回退值：
 * 添加了在 `vnode.attributes` 中不存在的 `defaultProps` 的自有属性。
 * @param {VNode} vnode
 * @returns {Object} props
 */
export function getNodeProps(vnode) {
	let props = clone(vnode.attributes),
		c = vnode.children;
	if (c) props.children = c;

	let defaultProps = vnode.nodeName.defaultProps;
	if (defaultProps) {
		for (let i in defaultProps) {
			if (hasOwnProperty.call(defaultProps, i) && !(i in props)) {
				props[i] = defaultProps[i];
			}
		}
	}

	return props;
}
