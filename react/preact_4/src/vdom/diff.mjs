import { TEXT_CONTENT, UNDEFINED_ELEMENT, EMPTY } from '../constants.mjs';
import { hasOwnProperty, toArray, empty, toLowerCase, isString, isFunction } from '../util.mjs';
import { deepHook } from '../hooks.mjs';
import { isSameNodeType } from './index.mjs';
import { isFunctionalComponent, buildFunctionalComponent } from './functional-component.mjs';
import { buildComponentFromVNode } from './component.mjs';
import { appendChildren, getAccessor, setAccessor, getNodeAttributes, getNodeType } from '../dom/index.mjs';
import { unmountComponent } from './component.mjs';
import { createNode, collectNode } from '../dom/recycler.mjs';


/** 
 *  将给定 vnode（及其深子节点）中的差异应用于真实的 DOM 节点.
 *	@param {Element} [dom=null]	 一个 DOM 节点变成 vnode 形状
 *	@param {VNode} vnode			代表所需 DOM 结构的 VNode（具有形成树的后代）
 *	@returns {Element} dom			创建/修改后的 dom
 *	@private
 */
export default function diff(dom, vnode, context, component) {
	/** 如果是纯函数组件则不断展开直到得到实际的 vnode */
	while (isFunctionalComponent(vnode)) {
		vnode = buildFunctionalComponent(vnode, context);
	}
	/** 展开之后的 vnode 是 class 组件的话，则得到 dom */
	if (isFunction(vnode.nodeName)) {
		return buildComponentFromVNode(dom, vnode, context);
	}
	/** 处理简单的文本叶子节点 */
	if (isString(vnode)) {
		if (dom) {
			let type = getNodeType(dom);
			if (type === 3) {
				dom[TEXT_CONTENT] = vnode;
				return dom;
			}
			else if (type === 1) {
				collectNode(dom);
			}
		}
		return document.createTextNode(vnode);
	}

	/** 将 DOM 节点变形为看起来像给定的 VNode。如果 DOM 不存在则创建. */
	// function diffNode(dom, vnode, context, component) {
	let out = dom,
		nodeName = vnode.nodeName || UNDEFINED_ELEMENT;

	if (!dom) {
		out = createNode(nodeName);
	}
	else if (toLowerCase(dom.nodeName) !== nodeName) {
		out = createNode(nodeName);
		// 将子节点移动到替换节点
		appendChildren(out, toArray(dom.childNodes));
		// 回收元素节点
		recollectNodeTree(dom);
	}

	let attrs = vnode.attributes,
		ref = component && attrs && attrs.ref;
	if (ref) {
		let refs = component.refs || (component.refs = {});
		refs[ref] = out._component || out;
	}

	innerDiffNode(out, vnode, context, component);

	return out;
}


/** 将 VNode 和 DOM 节点之间的子节点和属性更改应用到 DOM. */
function innerDiffNode(dom, vnode, context, component) {
	let children,
		keyed,
		keyedLen = 0,
		len = dom.childNodes.length,
		childrenLen = 0;
	if (len) {
		children = [];
		for (let i = 0; i < len; i++) {
			let child = dom.childNodes[i],
				props = child._component && child._component.props,
				key = props ? props.key : getAccessor(child, 'key');
			if (!empty(key)) {
				if (!keyed) keyed = {};
				keyed[key] = child;
				keyedLen++;
			}
			else {
				children[childrenLen++] = child;
			}
		}
	}


	diffAttributes(dom, vnode);


	let vchildren = vnode.children,
		vlen = vchildren && vchildren.length,
		min = 0;
	if (vlen) {
		for (let i = 0; i < vlen; i++) {
			let vchild = vchildren[i],
				child;

			// if (isFunctionalComponent(vchild)) {
			// 	vchild = buildFunctionalComponent(vchild);
			// }

			// 尝试根据键匹配查找节点
			if (keyedLen) {
				let attrs = vchild.attributes,
					key = attrs && attrs.key;
				if (!empty(key) && keyed.hasOwnProperty(key)) {
					child = keyed[key];
					keyed[key] = null;
					keyedLen--;
				}
			}

			// 尝试从现有子节点中提取相同类型的节点
			if (!child && min < childrenLen) {
				for (let j = min; j < childrenLen; j++) {
					let c = children[j];
					if (c && isSameNodeType(c, vchild)) {
						child = c;
						children[j] = null;
						if (j === childrenLen - 1) childrenLen--;
						if (j === min) min++;
						break;
					}
				}
			}

			// morph the matched/found/created DOM child to match vchild (deep)
			child = diff(child, vchild, context, component);

			if (dom.childNodes[i] !== child) {
				let c = child.parentNode !== dom && child._component,
					next = dom.childNodes[i + 1];
				if (c) deepHook(c, 'componentWillMount');
				if (next) {
					dom.insertBefore(child, next);
				}
				else {
					dom.appendChild(child);
				}
				if (c) deepHook(c, 'componentDidMount');
			}
		}
	}


	if (keyedLen) {
		/*eslint guard-for-in:0*/
		for (let i in keyed) if (keyed.hasOwnProperty(i) && keyed[i]) {
			children[childrenLen++] = keyed[i];
		}
	}

	// 移除孤儿
	if (min < childrenLen) {
		removeOrphanedChildren(dom, children);
	}
}


/** 回收在所需 VTree 中未引用的子项 */
export function removeOrphanedChildren(out, children, unmountOnly) {
	for (let i = children.length; i--;) {
		let child = children[i];
		if (child) {
			recollectNodeTree(child, unmountOnly);
		}
	}
}


/** 从根开始回收整个节点树. */
export function recollectNodeTree(node, unmountOnly) {
	// @TODO: 需要调用 Preact 是否应该删除不是自己创建的节点。
	// Currently it *does* remove them. Discussion: https://github.com/developit/preact/issues/39
	//if (!node[ATTR_KEY]) return;

	let component = node._component;
	if (component) {
		unmountComponent(node, component);
	}
	else {
		if (!unmountOnly) {
			if (getNodeType(node) !== 1) {
				let p = node.parentNode;
				if (p) p.removeChild(node);
				return;
			}

			collectNode(node);
		}

		let c = node.childNodes;
		if (c && c.length) {
			removeOrphanedChildren(node, c, unmountOnly);
		}
	}
}


/** 将 VNode 的属性差异应用到给定的 DOM 节点. */
function diffAttributes(dom, vnode) {
	let old = getNodeAttributes(dom) || EMPTY,
		attrs = vnode.attributes || EMPTY,
		name, value;

	// removed
	for (name in old) {
		if (empty(attrs[name])) {
			setAccessor(dom, name, null);
		}
	}

	// new & updated
	if (attrs !== EMPTY) {
		for (name in attrs) {
			if (hasOwnProperty.call(attrs, name)) {
				value = attrs[name];
				if (!empty(value) && value != getAccessor(dom, name)) {
					setAccessor(dom, name, value);
				}
			}
		}
	}
}
