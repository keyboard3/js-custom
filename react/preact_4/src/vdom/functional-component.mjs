import { EMPTY_BASE } from '../constants.mjs';
import { getNodeProps } from './index.mjs';
import { isFunction } from '../util.mjs';


/** 检查 VNode 是否是对无状态功能组件的引用。
 *  一个函数组件被表示为一个 VNode，它的 `nodeName` 属性是一个函数的引用。
 *	如果该函数不是组件（即原型上没有 `.render()` 方法），则它被视为无状态功能组件。
 *	@param {VNode} vnode	A VNode
 *	@private
 */
export function isFunctionalComponent({ nodeName }) {
	return isFunction(nodeName) && !nodeName.prototype.render;
}



/** 从引用无状态功能组件的 VNode 构建结果 VNode。
 *	@param {VNode} vnode	具有作为对函数的引用的 `nodeName` 属性的 VNode.
 *	@private
 */
export function buildFunctionalComponent(vnode, context) {
	return vnode.nodeName(getNodeProps(vnode), context) || EMPTY_BASE;
}
