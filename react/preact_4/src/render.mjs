import diff from './vdom/diff.mjs';
import { deepHook } from './hooks.mjs';

/** 将 JSX 渲染成一个 `parent` 元素。
 *	@param {VNode} vnode		要渲染的 (JSX) VNode
 *	@param {Element} parent		要渲染到的 DOM 元素
 *	@param {Element} [merge]	在 merge 时，尝试重新使用以现有 DOM 树为根
 *	@public
 *
 *	@example
 *	// render a div into <body>:
 *	render(<div id="hello">hello!</div>, document.body);
 *
 *	@example
 *	// render a "Thing" component into #foo:
 *	const Thing = ({ name }) => <span>{ name }</span>;
 *	render(<Thing name="one" />, document.querySelector('#foo'));
 */
export default function render(vnode, parent, merge) {
	let existing = merge && merge._component && merge._componentConstructor===vnode.nodeName,
		built = diff(merge, vnode),
		c = !existing && built._component;

	if (c) deepHook(c, 'componentWillMount');

	if (built.parentNode!==parent) {
		parent.appendChild(built);
	}

	if (c) deepHook(c, 'componentDidMount');

	return built;
}
