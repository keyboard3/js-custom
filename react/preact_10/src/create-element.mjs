import options from './options.mjs';
import { assign } from './util.mjs';

/**
  * 创建一个虚拟节点（用于 JSX）
  * @param {import('./internal').VNode["type"]} type 此虚拟节点的节点名称或组件构造函数
  * @param {object | null | undefined} [props] 虚拟节点的属性
  * @param {Array<import('./index.mjs').ComponentChildren>} [children] 虚拟节点的孩子
  * @returns {import('./internal').VNode}
  */
export function createElement(type, props, children) {
	props = assign({}, props);

	if (arguments.length>3) {
		children = [children];
		// https://github.com/preactjs/preact/issues/1916
		for (let i=3; i<arguments.length; i++) {
			children.push(arguments[i]);
		}
	}
	if (children!=null) {
		props.children = children;
	}

	// “类型”在开发过程中可能未定义。需要检查，以便我们可以使用调试助手显示一个很好的错误消息
	if (type!=null && type.defaultProps!=null) {
		for (let i in type.defaultProps) {
			if (props[i]===undefined) props[i] = type.defaultProps[i];
		}
	}
	let ref = props.ref;
	let key = props.key;
	if (ref!=null) delete props.ref;
	if (key!=null) delete props.key;

	return createVNode(type, props, key, ref);
}

/**
 * 创建一个 VNode（由 Preact 内部使用）
 * @param {import('./internal').VNode["type"]} type 此虚拟节点的节点名称或组件构造函数
 * @param {object | string | number | null} props 此虚拟节点的属性。
 * 如果这个虚拟节点代表一个文本节点，这是节点的文本（字符串或数字）。
 * @param {string | number | null} key 此虚拟节点的键，在将其与其子节点进行比较时使用
 * @param {import('./internal').VNode["ref"]} ref 将接收对其创建的子项的引用的 ref 属性
 * @returns {import('./internal').VNode}
 */
export function createVNode(type, props, key, ref) {
	// 如果对象是从同一调用站点分配的，V8 似乎更擅长检测类型形状
	// 不要内联到 createElement 和 coerceToVNode！
	const vnode = {
		type,
		props,
		key,
		ref,
		_children: null,
		_parent: null,
		_depth: 0,
		_dom: null,
		_lastDomChild: null,
		_component: null,
		constructor: undefined
	};

	if (options.vnode) options.vnode(vnode);

	return vnode;
}

export function createRef() {
	return {};
}

export function Fragment(props) {
	return props.children;
}

/**
 * 检查参数是否是有效的 Preact VNode。
 * @param {*} vnode
 * @returns {vnode is import('./internal').VNode}
 */
export const isValidElement = vnode => vnode!=null && vnode.constructor === undefined;

/**
 * 将不受信任的值强制转换为 VNode
 * 具体来说，这应该用于任何用户可以提供布尔值、字符串或数字的地方，而不是需要 VNode 或组件的地方
 * @param {boolean | string | number | import('./internal').VNode} possibleVNode 一个可能的 VNode
 * @returns {import('./internal').VNode | null}
 */
export function coerceToVNode(possibleVNode) {
	if (possibleVNode == null || typeof possibleVNode === 'boolean') return null;
	if (typeof possibleVNode === 'string' || typeof possibleVNode === 'number') {
		return createVNode(null, possibleVNode, null, null);
	}

	// 如果 vnode 已经被使用，则克隆它
	if (possibleVNode._dom!=null || possibleVNode._component!=null) {
		let vnode = createVNode(possibleVNode.type, possibleVNode.props, possibleVNode.key, null);
		vnode._dom = possibleVNode._dom;
		return vnode;
	}

	return possibleVNode;
}
