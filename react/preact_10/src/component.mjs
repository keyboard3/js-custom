import { assign } from './util.mjs';
import { diff, commitRoot } from './diff/index.mjs';
import options from './options.mjs';
import { Fragment } from './create-element.mjs';

/**
 * 基本组件类。提供`setState()`和`forceUpdate()`，触发渲染
 * @param {object} props 初始组件 props
 * @param {object} context 来自父组件的初始上下文 getChildContext
 */
export function Component(props, context) {
	this.props = props;
	this.context = context;
	// this.constructor // When component is functional component, this is reset to functional component
	// if (this.state==null) this.state = {};
	// this.state = {};
	// this._dirty = true;
	// this._renderCallbacks = []; // Only class components

	// Other properties that Component will have set later,
	// shown here as commented out for quick reference
	// this.base = null;
	// this._context = null;
	// this._vnode = null;
	// this._nextState = null; // Only class components
	// this._processingException = null; // Always read, set only when handling error
	// this._pendingError = null; // Always read, set only when handling error. This is used to indicate at diffTime to set _processingException
}

/**
 * 更新组件状态并安排重新渲染。
 * @param {object | ((s: object, p: object) => object)} 更新状态属性的 hash，
 * 以使用新值或给定当前 state 和 props 的函数进行更新，并返回新的部分状态
 * @param {() => void} [callback] 组件状态更新后要调用的函数
 */
Component.prototype.setState = function(update, callback) {
	// 仅在第一次复制到 nextState 时克隆状态。
	let s = (this._nextState!==this.state && this._nextState) || (this._nextState = assign({}, this.state));

	// 如果 update() 原地改变状态, 跳过拷贝:
	if (typeof update!=='function' || (update = update(s, this.props))) {
		assign(s, update);
	}

	// 如果 updater function 函数返回 null，则跳过更新
	if (update==null) return;

	if (this._vnode) {
		this._force = false;
		if (callback) this._renderCallbacks.push(callback);
		enqueueRender(this);
	}
};

/**
 * 立即执行组件的同步重新渲染
 * @param {() => void} [callback] 组件重新渲染后要调用的函数
 */
Component.prototype.forceUpdate = function(callback) {
	if (this._vnode) {
		// 设置渲染模式，以便我们可以区分渲染请求的来源。我们需要这个是因为 forceUpdate 不应该调用 shouldComponentUpdate
		if (callback) this._renderCallbacks.push(callback);
		this._force = true;
		enqueueRender(this);
	}
};

/**
 * 接受 `props` 和 `state`，并返回一个新的 Virtual DOM 树来构建。
 * 虚拟 DOM 一般通过 [JSX] 构建(http://jasonformat.com/wtf-is-jsx).
 * @param {object} props Props (eg: JSX attributes) received from parent
 * element/component
 * @param {object} state 组件的当前状态
 * @param {object} context 上下文对象，由最近的祖先的`getChildContext()` 返回
 * @returns {import('./hooks.mjs').ComponentChildren | void}
 */
Component.prototype.render = Fragment;

/**
 * @param {import('./internal').VNode} vnode
 * @param {number | null} [childIndex]
 */
export function getDomSibling(vnode, childIndex) {
	if (childIndex == null) {
		// 使用 childIndex==null 作为信号从 vnode 的兄弟节点恢复搜索
		return vnode._parent
			? getDomSibling(vnode._parent, vnode._parent._children.indexOf(vnode) + 1)
			: null;
	}

	let sibling;
	for (; childIndex < vnode._children.length; childIndex++) {
		sibling = vnode._children[childIndex];

		if (sibling != null && sibling._dom != null) {
			/**
			 * 	由于 updateParentDomPointers 保持 _dom 指针正确，我们可以依靠 _dom 来告诉我们这个子树是否包含渲染的 DOM 节点，
			 * 以及第一个渲染的 DOM 节点是什么
			 */
			return sibling._dom;
		}
	}

	/**
	 *	 如果我们到了这里，我们还没有在这个 vnode 的子节点中找到一个 DOM 节点。我们必须从这个 vnode 的兄弟节点（在它的父节点 _children 数组中）
	 * 恢复, 如果我们没有搜索 DOM VNode 则只爬上并搜索父节点（意味着我们到达了开始搜索的原始 vnode 的 DOM 父节点）
	 */
	return typeof vnode.type === 'function' ? getDomSibling(vnode) : null;
}

/**
 * 就地触发组件的重新渲染。
 * @param {import('./internal').Component} c 要重新渲染的组件
 */
function renderComponent(component) {
	let vnode = component._vnode,
		oldDom = vnode._dom,
		parentDom = component._parentDom,
		force = component._force;
	component._force = false;
	if (parentDom) {
		let mounts = [];
		let newDom = diff(parentDom, vnode, assign({}, vnode), component._context, parentDom.ownerSVGElement!==undefined, null, mounts, force, oldDom == null ? getDomSibling(vnode) : oldDom);
		commitRoot(mounts, vnode);

		if (newDom != oldDom) {
			updateParentDomPointers(vnode);
		}
	}
}

/**
 * @param {import('./internal').VNode} vnode
 */
function updateParentDomPointers(vnode) {
	if ((vnode = vnode._parent) != null && vnode._component != null) {
		vnode._dom = vnode._component.base = null;
		for (let i = 0; i < vnode._children.length; i++) {
			let child = vnode._children[i];
			if (child != null && child._dom != null) {
				vnode._dom = vnode._component.base = child._dom;
				break;
			}
		}

		return updateParentDomPointers(vnode);
	}
}

/**
 * The render queue
 * @type {Array<import('./internal').Component>}
 */
let q = [];

/**
 * 异步调度回调
 * @type {(cb) => void}
 */
const defer = typeof Promise=='function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;

/*
 * 	`Component.debounce` 的值必须异步调用传入的回调。重要的是 Preact 的贡献者可以一致地推断对 `setState` 等的调用做了什么，以及何时应用它们的效果。
 * 有关设计异步 API 的更多信息，请参阅下面的链接。
 * * [Designing APIs for Asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony)
 * * [Callbacks synchronous and asynchronous](https://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/)
 */

let prevDebounce = options.debounceRendering;

/**
 * 将组件的重新渲染入队
 * @param {import('./internal').Component} c 要重新渲染的组件
 */
export function enqueueRender(c) {
	if ((!c._dirty && (c._dirty = true) && q.push(c) === 1) ||
	    (prevDebounce !== options.debounceRendering)) {
		prevDebounce = options.debounceRendering;
		(options.debounceRendering || defer)(process);
	}
}

/** 通过重新渲染所有排队的组件来刷新渲染队列 */
function process() {
	let p;
	q.sort((a, b) => b._vnode._depth - a._vnode._depth);
	while ((p=q.pop())) {
		// forceUpdate 的回调参数在此处重用以指示非强制更新。
		if (p._dirty) renderComponent(p);
	}
}
