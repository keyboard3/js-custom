import { SYNC_RENDER, DOM_RENDER, NO_RENDER, EMPTY, EMPTY_BASE } from '../constants.mjs';
import options from '../options.mjs';
import { clone, isFunction } from '../util.mjs';
import { hook, deepHook } from '../hooks.mjs';
import { enqueueRender } from '../render-queue.mjs';
import { getNodeProps } from './index.mjs';
import diff from './diff.mjs';
import { removeOrphanedChildren } from './diff.mjs';
import { createComponent, collectComponent } from './component-recycler.mjs';

/** 将组件标记为脏并排队渲染。
 *	@param {Component} component
 *	@private
 */
export function triggerComponentRender(component) {
	if (!component._dirty) {
		component._dirty = true;
		enqueueRender(component);
	}
}

/** 设置组件的`props`（通常派生自 JSX 属性）。
 *	@param {Object} props
 *	@param {Object} [opts]
 *	@param {boolean} [opts.renderSync=false]	If `true` and {@link options.syncComponentUpdates} is `true`, triggers synchronous rendering.
 *	@param {boolean} [opts.render=true]			If `false`, no render will be triggered.
 */
export function setComponentProps(component, props, opts, context) {
	let d = component._disableRendering;
	component._disableRendering = true;

	opts = opts || EMPTY;

	if (context) {
		if (!component.prevContext) component.prevContext = clone(component.context);
		component.context = context;
	}

	if (component.base) {
		hook(component, 'componentWillReceiveProps', props, component.context);
	}

	if (!component.prevProps) component.prevProps = clone(component.props);
	component.props = props;

	component._disableRendering = d;

	if (opts.render !== false) {
		if (opts.renderSync || options.syncComponentUpdates !== false) {
			renderComponent(component);
		}
		else {
			triggerComponentRender(component);
		}
	}
}

/** 渲染一个组件，触发必要的生命周期事件并考虑高阶组件。
 *	@param {Component} component
 *	@param {Object} [opts]
 *	@param {boolean} [opts.build=false]		如果为 true ，则组件将构建并存储一个 DOM 节点（如果尚未与之关联）。
 *	@private
 */
export function renderComponent(component, opts) {
	if (component._disableRendering) return;

	let skip, rendered,
		props = component.props,
		state = component.state,
		context = component.context,
		previousProps = component.prevProps || props,
		previousState = component.prevState || state,
		previousContext = component.prevContext || context,
		isUpdate = component.base;
	/** 如果已经生成过 dom 则只需要更新 */
	if (isUpdate) {
		/** 将组件的 props 和 state 正确的设置成变更之前的 props 和 state */
		component.props = previousProps;
		component.state = previousState;
		component.context = previousContext;
		if (hook(component, 'shouldComponentUpdate', props, state, context) === false) {
			/** 回调开发者的 shouldComponentUpdate 传递新的 props 和 state 作为参数，对比之前的判断是否需要更新 */
			skip = true;
		} else {
			/** 如果需要更新，则告知开发者 componentWillUpdate */
			hook(component, 'componentWillUpdate', props, state, context);
		}
		/** 更新组件的 props 和 state */
		component.props = props;
		component.state = state;
		component.context = context;
	}
	/** 进入渲染过程，将 prev** 这些状态重置 */
	component.prevProps = component.prevState = component.prevContext = null;
	component._dirty = false;

	if (!skip) {
		/** 调用 class 组件的渲染逻辑，得到 vnode */
		rendered = hook(component, 'render', props, state, context);

		let childComponent = rendered && rendered.nodeName,
			childContext = component.getChildContext ? component.getChildContext() : context,
			toUnmount, base;

		if (isFunction(childComponent) && childComponent.prototype.render) {
			/** 
			 * 似乎好像没啥卵用，这种情况是组件直接套组件了，diff 也能覆盖这种情况，具体为啥这样设计不知道
			 * component._component 是组件的直接子组件
			 */

			let inst = component._component;
			if (inst && inst.constructor !== childComponent) {
				toUnmount = inst;
				inst = null;
			}

			let childProps = getNodeProps(rendered);

			if (inst) {
				setComponentProps(inst, childProps, SYNC_RENDER, childContext);
			}
			else {
				inst = createComponent(childComponent, childProps, childContext);
				inst._parentComponent = component;
				component._component = inst;
				if (component.base) deepHook(inst, 'componentWillMount');
				setComponentProps(inst, childProps, NO_RENDER, childContext);
				renderComponent(inst, DOM_RENDER);
				if (component.base) deepHook(inst, 'componentDidMount');
			}

			base = inst.base;
		}
		else {
			let cbase = component.base;

			// 销毁高阶组件链接
			toUnmount = component._component;
			if (toUnmount) {
				cbase = component._component = null;
			}
			/** diff 旧 dom 和新 vnode 得到新 dom  */
			if (component.base || (opts && opts.build)) {
				base = diff(cbase, rendered || EMPTY_BASE, childContext, component);
			}
		}
		/** 如果新 dom 和旧 dom 不是同一个，则从 dom 树中替换掉 */
		if (component.base && base !== component.base) {
			let p = component.base.parentNode;
			if (p) p.replaceChild(base, component.base);
		}

		if (toUnmount) {
			unmountComponent(toUnmount.base, toUnmount);
		}

		/** 将组件实例绑定到 dom 上，方便未来 diff 新的 vnode */
		component.base = base;
		if (base) {
			let componentRef = component,
				t = component;
			while ((t = t._parentComponent)) { componentRef = t; }
			base._component = componentRef;
			base._componentConstructor = componentRef.constructor;
		}
		/** 组件更新完毕，通知开发者 */
		if (isUpdate) {
			hook(component, 'componentDidUpdate', previousProps, previousState, previousContext);
		}
	}
	/** 组件渲染结束，调用 setState 时的回调 */
	let cb = component._renderCallbacks, fn;
	if (cb) while ((fn = cb.pop())) fn();

	return rendered;
}

/** 将 VNode 引用的 Component 应用到 DOM。
 *	@param {Element} dom	要转换的 DOM 节点
 *	@param {VNode} vnode	一个引用组件的 VNode
 *	@returns {Element} dom	创建/转换的元素
 *	@private
 */
export function buildComponentFromVNode(dom, vnode, context) {
	let c = dom && dom._component;
	/** 一直递归这个 dom 的组件实例的父级，直到找到 vnode 的组件实例 */
	let isOwner = c && dom._componentConstructor === vnode.nodeName;
	while (c && !isOwner && (c = c._parentComponent)) {
		isOwner = c.constructor === vnode.nodeName;
	}

	if (isOwner) {
		/** 改变组件的属性，同步渲染 diff 到 dom 树 */
		setComponentProps(c, getNodeProps(vnode), SYNC_RENDER, context);
		dom = c.base;
	}
	else {
		/** 如果没有新 vnode 的实例和旧 dom 创建的组件实例不是同一个，则将旧 dom 的组件实例卸载掉 */
		if (c) {
			unmountComponent(dom, c);
			dom = null;
		}
		/** 依赖旧 dom 和 vnode 创建个新的 dom */
		dom = createComponentFromVNode(vnode, dom, context);
	}

	return dom;
}

/** 实例化并渲染一个组件，给定一个 VNode，其 nodeName 是一个构造函数。
 *	@param {VNode} vnode
 *	@private
 */
function createComponentFromVNode(vnode, dom, context) {
	/** 知道组件函数以及属性创建组件实例 */
	let props = getNodeProps(vnode);
	let component = createComponent(vnode.nodeName, props, context);
	/** 给刚创建的组件实例补全 base */
	if (dom && !component.base) component.base = dom;
	/** 设置组件实例的 props,渲染组件得到 dom 节点 */
	setComponentProps(component, props, NO_RENDER, context);
	renderComponent(component, DOM_RENDER);

	// let node = component.base;
	//if (!node._component) {
	//	node._component = component;
	//	node._componentConstructor = vnode.nodeName;
	//}

	return component.base;
}

/** 从 DOM 中删除一个组件并回收它。
 *	@param {Element} dom			从中卸载给定组件的 DOM 节点
 *	@param {Component} component	要卸载的 Component 实例
 *	@private
 */
export function unmountComponent(dom, component, remove) {
	// console.warn('unmounting mismatched component', component);

	deepHook(component, 'componentWillUnmount');
	if (dom._component === component) {
		delete dom._component;
		delete dom._componentConstructor;
	}
	let base = component.base;
	if (base) {
		if (remove !== false) {
			let p = base.parentNode;
			if (p) p.removeChild(base);
		}
		removeOrphanedChildren(base, base.childNodes, true);
	}
	component._parentComponent = null;
	deepHook(component, 'componentDidUnmount');
	collectComponent(component);
}
