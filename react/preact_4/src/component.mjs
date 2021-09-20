import { hook } from './hooks.mjs';
import { extend, clone, isFunction } from './util.mjs';
import { createLinkedState } from './linked-state.mjs';
import { triggerComponentRender, renderComponent } from './vdom/component.mjs';

/** Base Component 类，用于创建组件的 ES6 类方法
 *	@public
 *
 *	@example
 *	class MyFoo extends Component {
 *		render(props, state) {
 *			return <div />;
 *		}
 *	}
 */
export default function Component(props, context) {
	/** @private */
	this._dirty = this._disableRendering = false;
	/** @private */
	this._linkedStates = {};
	/** @private */
	this._renderCallbacks = [];
	/** @public */
	this.prevState = this.prevProps = this.prevContext = this.base = this._parentComponent = this._component = null;
	/** @public */
	this.context = context || null;
	/** @type {object} */
	this.props = props || {};
	/** @type {object} */
	this.state = hook(this, 'getInitialState') || {};
}


extend(Component.prototype, {

	/** 返回一个 `boolean` 值，指示组件在接收到给定的 `props` 和 `state` 时是否应该重新渲染。
	 *	@param {object} nextProps
	 *	@param {object} nextState
	 *	@param {object} nextContext
	 *	@returns {Boolean} should the component re-render
	 *	@name shouldComponentUpdate
	 *	@function
	 */
	// shouldComponentUpdate() {
	// 	return true;
	// },


	/** 返回一个在调用时设置状态属性的函数。
	 *	使用相同的参数重复调用 linkState() 会返回一个缓存的链接函数。
	 *
	 *	提供一些内置的特殊情况:
	 *		- 复选框和单选按钮链接它们的布尔值“checked”
	 *		- input 自动链接它们的 `value` 属性
	 *		- 如果在元素上找不到，事件路径将回退到任何关联的组件
	 *		- 如果链接值是一个函数，将调用它并使用结果
	 *
	 *	@param {string} key				要设置的路径 - 可以是点标记的深键
	 *	@param {string} [eventPath]		如果设置，则尝试在传递给 linksState setter 的对象内的给定点标记路径中查找新状态值。
	 *	@returns {function} linkStateSetter(e)
	 *
	 *	@example Update a "text" state value when an input changes:
	 *		<input onChange={ this.linkState('text') } />
	 *
	 *	@example Set a deep state value on click
	 *		<button onClick={ this.linkState('touch.coords', 'touches.0') }>Tap</button
	 */
	linkState(key, eventPath) {
		let c = this._linkedStates,
			cacheKey = key + '|' + (eventPath || '');
		return c[cacheKey] || (c[cacheKey] = createLinkedState(this, key, eventPath));
	},


	/** 通过将属性从 `state` 复制到 `this.state` 来更新组件状态。
	 *	@param {object} state		要使用新值更新的状态属性的 hash
	 */
	setState(state, callback) {
		let s = this.state;
		if (!this.prevState) this.prevState = clone(s);
		extend(s, isFunction(state) ? state(s, this.props) : state);
		/** 渲染结束的回调 */
		if (callback) this._renderCallbacks.push(callback);
		triggerComponentRender(this);
	},


	/** 立即执行组件的同步重新渲染。
	 *	@private
	 */
	forceUpdate() {
		renderComponent(this);
	},


	/** 接受 `props` 和 `state`，并返回一个新的 Virtual DOM 树来构建。
	 *	虚拟 DOM 一般通过 [JSX] 构建(http://jasonformat.com/wtf-is-jsx).
	 *	@param {object} props		从父元素/组件接收的 props（例如：JSX 属性）
	 *	@param {object} state		组件的当前状态
	 *	@returns VNode
	 */
	render() {
		return null;
	}

});
