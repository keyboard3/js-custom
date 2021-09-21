import { EMPTY_OBJ, EMPTY_ARR } from './constants.mjs';
import { commitRoot, diff } from './diff/index.mjs';
import { createElement, Fragment } from './create-element.mjs';
import options from './options.mjs';

const IS_HYDRATE = EMPTY_OBJ;

/**
 * 将 Preact 虚拟节点渲染为 DOM 元素
 * @param {import('./index').ComponentChild} vnode 要渲染的虚拟节点
 * @param {import('./internal').PreactElement} parentDom 要渲染到的 DOM 元素
 * @param {Element | Text} [replaceNode] 尝试重新使用以 `replaceNode` 为根的现有 DOM 树
 */
export function render(vnode, parentDom, replaceNode) {
	if (options._root) options._root(vnode, parentDom);

	let isHydrating = replaceNode === IS_HYDRATE;
	let oldVNode = isHydrating ? null : replaceNode && replaceNode._children || parentDom._children;
	vnode = createElement(Fragment, null, [vnode]);

	let mounts = [];
	diff(
		parentDom,
		isHydrating ? parentDom._children = vnode : (replaceNode || parentDom)._children = vnode,
		oldVNode || EMPTY_OBJ,
		EMPTY_OBJ,
		parentDom.ownerSVGElement !== undefined,
		replaceNode && !isHydrating
			? [replaceNode]
			: oldVNode
				? null
				: EMPTY_ARR.slice.call(parentDom.childNodes),
		mounts,
		false,
		replaceNode || EMPTY_OBJ,
		isHydrating,
	);
	commitRoot(mounts, vnode);
}

/**
 * 使用来自 Preact 虚拟节点的数据更新现有 DOM 元素
 * @param {import('./index').ComponentChild} vnode 要渲染的虚拟节点
 * @param {import('./internal').PreactElement} parentDom 要更新的 DOM 元素
 */
export function hydrate(vnode, parentDom) {
	render(vnode, parentDom, IS_HYDRATE);
}
