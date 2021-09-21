import { EMPTY_OBJ, EMPTY_ARR } from '../constants.mjs';
import { Component, enqueueRender } from '../component.mjs';
import { Fragment } from '../create-element.mjs';
import { diffChildren, toChildArray } from './children.mjs';
import { diffProps } from './props.mjs';
import { assign, removeNode } from '../util.mjs';
import options from '../options.mjs';

/**
 * diff 两个虚拟节点并对 DOM 应用适当的更改
 * @param {import('../internal').PreactElement} parentDom DOM 元素的父元素
 * @param {import('../internal').VNode} newVNode 新的虚拟节点
 * @param {import('../internal').VNode} oldVNode 旧的虚拟节点
 * @param {object} context 当前上下文对象
 * @param {boolean} isSvg 此元素是否为 SVG 节点
 * @param {Array<import('../internal').PreactElement>} excessDomChildren
 * @param {Array<import('../internal').Component>} mounts 新安装的组件列表
 * @param {Element | Text} oldDom 当前附加的 DOM 元素应该放置任何新的 DOM 元素。
 * 第一次渲染时可能为“null”（补水时除外）。在比较具有兄弟的 Fragment 时，可以是兄弟 DOM 元素。
 * 在大多数情况下，它以 `oldChildren[0]._dom` 开头。
 * @param {boolean} isHydrating 是否处于水合状态
 */
export function diff(parentDom, newVNode, oldVNode, context, isSvg, excessDomChildren, mounts, force, oldDom, isHydrating) {
	let tmp, newType = newVNode.type;

	// 当通过 createElement 时，它将对象构造函数分配为未定义。这是为了防止 JSON 注入。
	if (newVNode.constructor !== undefined) return null;

	if (tmp = options._diff) tmp(newVNode);

	try {
		outer: if (typeof newType==='function') {
			let c, isNew, oldProps, oldState, snapshot, clearProcessingException;
			let newProps = newVNode.props;

			// createContext api 所必需的。设置此属性会将上下文值作为`this.context` 传递给该组件。
			tmp = newType.contextType;
			let provider = tmp && context[tmp._id];
			let cctx = tmp ? (provider ? provider.props.value : tmp._defaultValue) : context;

			// 获取组件并将其设置为 `c`
			if (oldVNode._component) {
				c = newVNode._component = oldVNode._component;
				clearProcessingException = c._processingException = c._pendingError;
			}
			else {
				// 实例化新组件
				if ('prototype' in newType && newType.prototype.render) {
					newVNode._component = c = new newType(newProps, cctx); // eslint-disable-line new-cap
				}
				else {
					newVNode._component = c = new Component(newProps, cctx);
					c.constructor = newType;
					c.render = doRender;
				}
				if (provider) provider.sub(c);

				c.props = newProps;
				if (!c.state) c.state = {};
				c.context = cctx;
				c._context = context;
				isNew = c._dirty = true;
				c._renderCallbacks = [];
			}

			// 调用 getDerivedStateFromProps
			if (c._nextState==null) {
				c._nextState = c.state;
			}
			if (newType.getDerivedStateFromProps!=null) {
				assign(c._nextState==c.state ? (c._nextState = assign({}, c._nextState)) : c._nextState, newType.getDerivedStateFromProps(newProps, c._nextState));
			}

			// 调用预渲染生命周期方法
			if (isNew) {
				if (newType.getDerivedStateFromProps==null && c.componentWillMount!=null) c.componentWillMount();
				if (c.componentDidMount!=null) mounts.push(c);
			}
			else {
				if (newType.getDerivedStateFromProps==null && force==null && c.componentWillReceiveProps!=null) {
					c.componentWillReceiveProps(newProps, cctx);
				}

				if (!force && c.shouldComponentUpdate!=null && c.shouldComponentUpdate(newProps, c._nextState, cctx)===false) {
					c.props = newProps;
					c.state = c._nextState;
					c._dirty = false;
					c._vnode = newVNode;
					newVNode._dom = oldDom!=null ? oldDom!==oldVNode._dom ? oldDom : oldVNode._dom : null;
					newVNode._children = oldVNode._children;
					for (tmp = 0; tmp < newVNode._children.length; tmp++) {
						if (newVNode._children[tmp]) newVNode._children[tmp]._parent = newVNode;
					}
					break outer;
				}

				if (c.componentWillUpdate!=null) {
					c.componentWillUpdate(newProps, c._nextState, cctx);
				}
			}

			oldProps = c.props;
			oldState = c.state;

			c.context = cctx;
			c.props = newProps;
			c.state = c._nextState;
			/** hooks 的上下文记录当前组件 */
			if (tmp = options._render) tmp(newVNode);

			c._dirty = false;
			c._vnode = newVNode;
			c._parentDom = parentDom;

			tmp = c.render(c.props, c.state, c.context);
			let isTopLevelFragment = tmp != null && tmp.type == Fragment && tmp.key == null;
			newVNode._children = toChildArray(isTopLevelFragment ? tmp.props.children : tmp);

			if (c.getChildContext!=null) {
				context = assign(assign({}, context), c.getChildContext());
			}

			if (!isNew && c.getSnapshotBeforeUpdate!=null) {
				snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
			}

			diffChildren(parentDom, newVNode, oldVNode, context, isSvg, excessDomChildren, mounts, oldDom, isHydrating);

			c.base = newVNode._dom;

			while (tmp=c._renderCallbacks.pop()) {
				if (c._nextState) { c.state = c._nextState; }
				tmp.call(c);
			}

			// 不要在挂载时或当我们通过 `shouldComponentUpdate` 退出时调用 componentDidUpdate
			if (!isNew && oldProps!=null && c.componentDidUpdate!=null) {
				c.componentDidUpdate(oldProps, oldState, snapshot);
			}

			if (clearProcessingException) {
				c._pendingError = c._processingException = null;
			}
		}
		else {
			newVNode._dom = diffElementNodes(oldVNode._dom, newVNode, oldVNode, context, isSvg, excessDomChildren, mounts, isHydrating);
		}
		/** hooks 的 layoutEffects 调用时机，在同一帧内被调用 */
		if (tmp = options.diffed) tmp(newVNode);
	}
	catch (e) {
		options._catchError(e, newVNode, oldVNode);
	}

	return newVNode._dom;
}

export function commitRoot(mounts, root) {
	let c;
	while ((c = mounts.pop())) {
		try {
			c.componentDidMount();
		}
		catch (e) {
			options._catchError(e, c._vnode);
		}
	}

	if (options._commit) options._commit(root);
}

/**
 * Diff 表示 DOM 元素的两个虚拟节点
 * @param {import('../internal').PreactElement} dom 表示被差异化的虚拟节点的 DOM 元素
 * @param {import('../internal').VNode} newVNode 新的虚拟节点
 * @param {import('../internal').VNode} oldVNode 旧的虚拟节点
 * @param {object} context 当前上下文对象
 * @param {boolean} isSvg 此 DOM 节点是否为 SVG 节点
 * @param {*} excessDomChildren
 * @param {Array<import('../internal').Component>} mounts 新安装的组件列表
 * @param {boolean} isHydrating 是否处于水合状态
 * @returns {import('../internal').PreactElement}
 */
function diffElementNodes(dom, newVNode, oldVNode, context, isSvg, excessDomChildren, mounts, isHydrating) {
	let i;
	let oldProps = oldVNode.props;
	let newProps = newVNode.props;

	// 在树中下降时跟踪进入和退出 SVG 命名空间。
	isSvg = newVNode.type==='svg' || isSvg;

	if (dom==null && excessDomChildren!=null) {
		for (i=0; i<excessDomChildren.length; i++) {
			const child = excessDomChildren[i];
			if (child!=null && (newVNode.type===null ? child.nodeType===3 : child.localName===newVNode.type)) {
				dom = child;
				excessDomChildren[i] = null;
				break;
			}
		}
	}

	if (dom==null) {
		if (newVNode.type===null) {
			return document.createTextNode(newProps);
		}
		dom = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', newVNode.type) : document.createElement(newVNode.type);
		// 我们创建了一个新的父级，所以之前附加的子级都不能被重用：
		excessDomChildren = null;
	}

	if (newVNode.type===null) {
		if (oldProps !== newProps) {
			if (excessDomChildren!=null) excessDomChildren[excessDomChildren.indexOf(dom)] = null;
			dom.data = newProps;
		}
	}
	else if (newVNode!==oldVNode) {
		if (excessDomChildren!=null) {
			excessDomChildren = EMPTY_ARR.slice.call(dom.childNodes);
		}

		oldProps = oldVNode.props || EMPTY_OBJ;

		let oldHtml = oldProps.dangerouslySetInnerHTML;
		let newHtml = newProps.dangerouslySetInnerHTML;

		// During hydration, props are not diffed at all (including dangerouslySetInnerHTML)
		// @TODO 当 props 在这里不匹配时，我们应该在调试模式下发出警告。
		if (!isHydrating) {
			if (newHtml || oldHtml) {
				// 如果在重新渲染之间没有更改，请避免重新应用相同的“__html”
				if (!newHtml || !oldHtml || newHtml.__html!=oldHtml.__html) {
					dom.innerHTML = newHtml && newHtml.__html || '';
				}
			}
		}

		diffProps(dom, newProps, oldProps, isSvg, isHydrating);

		newVNode._children = newVNode.props.children;

		// 如果新的 vnode 没有危险的 SetInnerHTML，请区分其子节点
		if (!newHtml) {
			diffChildren(dom, newVNode, oldVNode, context, newVNode.type==='foreignObject' ? false : isSvg, excessDomChildren, mounts, EMPTY_OBJ, isHydrating);
		}

		// （如上，在补水期间不要区分 props）
		if (!isHydrating) {
			if (('value' in newProps) && newProps.value!==undefined && newProps.value !== dom.value) dom.value = newProps.value==null ? '' : newProps.value;
			if (('checked' in newProps) && newProps.checked!==undefined && newProps.checked !== dom.checked) dom.checked = newProps.checked;
		}
	}

	return dom;
}

/**
 * 调用或更新 ref，具体取决于它是函数还是对象 ref。
 * @param {object|function} ref
 * @param {any} value
 * @param {import('../internal').VNode} vnode
 */
export function applyRef(ref, value, vnode) {
	try {
		if (typeof ref=='function') ref(value);
		else ref.current = value;
	}
	catch (e) {
		options._catchError(e, vnode);
	}
}

/**
 * 从树中卸载虚拟节点并应用 DOM 更改
 * @param {import('../internal').VNode} vnode 要卸载的虚拟节点
 * @param {import('../internal').VNode} parentVNode 发起卸载的 VNode 的父节点
 * @param {boolean} [skipRemove] 指示当前元素的父节点已从 DOM 分离的标志。
 */
export function unmount(vnode, parentVNode, skipRemove) {
	let r;
	if (options.unmount) options.unmount(vnode);

	if (r = vnode.ref) {
		applyRef(r, null, parentVNode);
	}

	let dom;
	if (!skipRemove && typeof vnode.type !== 'function') {
		skipRemove = (dom = vnode._dom)!=null;
	}

	vnode._dom = vnode._lastDomChild = null;

	if ((r = vnode._component)!=null) {
		if (r.componentWillUnmount) {
			try {
				r.componentWillUnmount();
			}
			catch (e) {
				options._catchError(e, parentVNode);
			}
		}

		r.base = r._parentDom = null;
	}

	if (r = vnode._children) {
		for (let i = 0; i < r.length; i++) {
			if (r[i]) unmount(r[i], parentVNode, skipRemove);
		}
	}

	if (dom!=null) removeNode(dom);
}

/** PFC 支持实例的 `.render()` 方法。 */
function doRender(props, state, context) {
	return this.constructor(props, context);
}

/**
 * 找到最接近抛出错误的错误边界并调用它
 * @param {object} error 抛出的值
 * @param {import('../internal').VNode} vnode 抛出被捕获的错误的 vnode（除了当这个参数是被卸载的最高父级时卸载）
 * @param {import('../internal').VNode} oldVNode 抛出的 vnode 的 oldVNode，如果这个 VNode 在 diffing 时抛出
 */
(options)._catchError = function (error, vnode, oldVNode) {

	/** @type {import('../internal').Component} */
	let component;

	for (; vnode = vnode._parent;) {
		if ((component = vnode._component) && !component._processingException) {
			try {
				if (component.constructor && component.constructor.getDerivedStateFromError!=null) {
					component.setState(component.constructor.getDerivedStateFromError(error));
				}
				else if (component.componentDidCatch!=null) {
					component.componentDidCatch(error);
				}
				else {
					continue;
				}
				return enqueueRender(component._pendingError = component);
			}
			catch (e) {
				error = e;
			}
		}
	}

	throw error;
};
