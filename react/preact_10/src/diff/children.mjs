import { diff, unmount, applyRef } from './index.mjs';
import { coerceToVNode } from '../create-element.mjs';
import { EMPTY_OBJ, EMPTY_ARR } from '../constants.mjs';
import { removeNode } from '../util.mjs';
import { getDomSibling } from '../component.mjs';

/**
 * diff 虚拟节点的子节点
 * @param {import('../internal').PreactElement} parentDom 子元素被差异化的 DOM 元素
 * @param {import('../internal').VNode} newParentVNode 其子节点应与 oldParentVNode 不同的新虚拟节点
 * @param {import('../internal').VNode} oldParentVNode 其子节点应该与 newParentVNode 不同的旧虚拟节点
 * @param {object} context 当前上下文对象
 * @param {boolean} isSvg 此 DOM 节点是否为 SVG 节点
 * @param {Array<import('../internal').PreactElement>} excessDomChildren
 * @param {Array<import('../internal').Component>} mounts 已安装的组件列表
 * @param {Node | Text} oldDom 当前附加的 DOM 元素应该放置任何新的 DOM 元素。
 * 第一次渲染时可能为“null”（hydate 时除外）。在比较具有兄弟的 Fragment 时，可以是兄弟 DOM 元素。在大多数情况下，
 * 它以 `oldChildren[0]._dom` 开头。
 * @param {boolean} isHydrating 是否处于水合状态
 */
export function diffChildren(parentDom, newParentVNode, oldParentVNode, context, isSvg, excessDomChildren, mounts, oldDom, isHydrating) {
	let i, j, oldVNode, newDom, sibDom, firstChildDom, refs;

	// This is a compression of oldParentVNode!=null && oldParentVNode != EMPTY_OBJ && oldParentVNode._children || EMPTY_ARR
	// as EMPTY_OBJ._children should be `undefined`.
	let oldChildren = (oldParentVNode && oldParentVNode._children) || EMPTY_ARR;

	let oldChildrenLength = oldChildren.length;

	/**
	 * 	只有在非常特定的地方才应该调用这个逻辑（顶级`render` 和`diffElementNodes`）。在这些情况下，我使用 `EMPTY_OBJ` 
	 * 来表示何时调用 `diffChildren`。我不能为此使用 `null`，因为 `null` 是 `oldDom` 的有效值，这可能意味着跳到这个逻辑‘
	 * （例如，如果安装一个新树，其中旧的 DOM 应该被忽略（通常用于 Fragment）。
	 */
	if (oldDom == EMPTY_OBJ) {
		if (excessDomChildren != null) {
			oldDom = excessDomChildren[0];
		}
		else if (oldChildrenLength) {
			oldDom = getDomSibling(oldParentVNode, 0);
		}
		else {
			oldDom = null;
		}
	}

	i = 0;
	newParentVNode._children = toChildArray(newParentVNode._children, childVNode => {

		if (childVNode != null) {
			childVNode._parent = newParentVNode;
			childVNode._depth = newParentVNode._depth + 1;

			// 检查我们是否在 oldChildren 中找到了相应的元素。
			// 如果找到，则通过设置为 `undefined` 来删除数组项。
			// 我们使用 `undefined`，因为 `null` 是为空占位符（空洞）保留的。
			oldVNode = oldChildren[i];

			if (oldVNode === null || (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type)) {
				oldChildren[i] = undefined;
			}
			else {
				// Either oldVNode === undefined or oldChildrenLength > 0,
				// so after this loop oldVNode == null or oldVNode is a valid value.
				for (j = 0; j < oldChildrenLength; j++) {
					oldVNode = oldChildren[j];
					// 如果 childVNode 是 unkeyed，我们只匹配类似的 unkeyed 节点，否则我们通过 key 匹配。
					// 我们总是按类型匹配（在任何一种情况下）。
					if (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
						oldChildren[j] = undefined;
						break;
					}
					oldVNode = null;
				}
			}

			oldVNode = oldVNode || EMPTY_OBJ;

			// 将旧元素转换为新元素，但不要将其附加到 dom 中
			newDom = diff(parentDom, childVNode, oldVNode, context, isSvg, excessDomChildren, mounts, null, oldDom, isHydrating);

			if ((j = childVNode.ref) && oldVNode.ref != j) {
				(refs || (refs = [])).push(j, childVNode._component || newDom, childVNode);
			}

			//只有当 vnode 没有被上面的 `diff()` 卸载时才继续。
			if (newDom != null) {
				if (firstChildDom == null) {
					firstChildDom = newDom;
				}

				if (childVNode._lastDomChild != null) {
					/**
					 * 只有 Fragment 或组件 像 VNodes 这样的 return Fragment 将有一个非空的 _lastDomChild。
					 * 从这个 Fragment 的 DOM 树的末尾继续比较。
					 */
					newDom = childVNode._lastDomChild;

					/**
					 * 	及早清理 _lastDomChild。我们不需要持久化这个值，因为它只被 `diffChildren` 
					 * 用来确定在对组件和 Fragment 进行比较后在哪里恢复差异。
					 */
					childVNode._lastDomChild = null;
				}
				else if (excessDomChildren == oldVNode || newDom != oldDom || newDom.parentNode == null) {
					// NOTE: excessDomChildren==oldVNode above:
					// 是它的精简实现 excessDomChildren==null && oldVNode==null!
					// 值只有在 `null` 时才具有相同的类型。

					outer: if (oldDom == null || oldDom.parentNode !== parentDom) {
						parentDom.appendChild(newDom);
					}
					else {
						// `j<oldChildrenLength; j+=2` is an alternative to `j++<oldChildrenLength/2`
						for (sibDom = oldDom, j = 0; (sibDom = sibDom.nextSibling) && j < oldChildrenLength; j += 2) {
							if (sibDom == newDom) {
								break outer;
							}
						}
						parentDom.insertBefore(newDom, oldDom);
					}
					/**
					 * 	当没有值存在时，浏览器将从`textContent` 推断选项的`value`。这基本上绕过了我们的代码，
					 * 稍后在 `diff()` 中设置它。它在所有浏览器中都能正常工作，除了 IE11，它会破坏设置“select.value”。
					 * 在那里它将始终设置为空字符串。重新应用选项值将解决该问题，因此可能存在一些未正确更新的内部数据结构。
					 * 	为了修复它，我们确保重置推断值，以便我们自己在 `diff()` 中的值检查不会被跳过。
					 */
					if (newParentVNode.type == 'option') {
						parentDom.value = '';
					}
				}

				oldDom = newDom.nextSibling;

				if (typeof newParentVNode.type == 'function') {
					// 此时，如果 childVNode._lastDomChild 存在, 然后
					// newDom = childVNode._lastDomChild per line 101. 
					// 否则它和 childVNode._dom 一样，意味着这个组件只返回一个 DOM 节点
					newParentVNode._lastDomChild = newDom;
				}
			}
		}

		i++;
		return childVNode;
	});

	newParentVNode._dom = firstChildDom;

	// 删除不属于任何 vnode 的子节点。
	if (excessDomChildren != null && typeof newParentVNode.type !== 'function') for (i = excessDomChildren.length; i--;) if (excessDomChildren[i] != null) removeNode(excessDomChildren[i]);

	// 如果有，请删除剩余的 oldChildren。
	for (i = oldChildrenLength; i--;) if (oldChildren[i] != null) unmount(oldChildren[i], oldChildren[i]);

	// 仅在卸载后设置引用
	if (refs) {
		for (i = 0; i < refs.length; i++) {
			applyRef(refs[i], refs[++i], refs[++i]);
		}
	}
}

/**
 * 展平并循环遍历虚拟节点的子节点
 * @param {import('../index').ComponentChildren} children 虚拟节点的未展平的子节点
 * @param {(vnode: import('../internal').VNode) => import('../internal').VNode} [callback]
 * 在将每个子项添加到展平列表之前为每个子项调用的函数。
 * @param {import('../internal').VNode[]} [flattened] 要修改的孩子的平面数组
 * @returns {import('../internal').VNode[]}
 */
export function toChildArray(children, callback, flattened) {
	if (flattened == null) flattened = [];

	if (children == null || typeof children === 'boolean') {
		if (callback) flattened.push(callback(null));
	}
	else if (Array.isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			toChildArray(children[i], callback, flattened);
		}
	}
	else {
		flattened.push(callback ? callback(coerceToVNode(children)) : children);
	}

	return flattened;
}
