import { assign } from './util.mjs';
import { EMPTY_ARR } from './constants.mjs';
import { createVNode } from './create-element.mjs';

/**
 * 克隆给定的 VNode，可选择添加 attributes/props 并替换其子节点。
 * @param {import('./internal').VNode} vnode 要克隆的虚拟 DOM 元素
 * @param {object} props 克隆时添加的 attributes/props
 * @param {Array<import('./index').ComponentChildren>} rest 任何附加参数都将用作替换子项。
 */
export function cloneElement(vnode, props) {
	props = assign(assign({}, vnode.props), props);
	if (arguments.length>2) props.children = EMPTY_ARR.slice.call(arguments, 2);
	return createVNode(vnode.type, props, props.key || vnode.key, props.ref || vnode.ref);
}
