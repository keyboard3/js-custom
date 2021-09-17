const NODE_ELEMENT = 1;// 一个 元素 节点，例如 <p> 和 <div>
const NODE_TEXT = 3;// Element 或者 Attr 中实际的  文字

const EMPTY = {};
const NO_RENDER = { render: false };
const SYNC_RENDER = { renderSync: true };
const DOM_RENDER = { build: true };
const NON_DIMENSION_PROPS = `
	boxFlex boxFlexGroup columnCount fillOpacity flex flexGrow
	flexPositive flexShrink flexNegative fontWeight lineClamp
	lineHeight opacity order orphans strokeOpacity widows zIndex zoom
`.trim().split(/\s+/g).reduce((acc, prop) => (acc[prop] = true, acc), {});

let slice = Array.prototype.slice,
	options = {
		syncComponentUpdates: true
	},
	hooks = {};

export { options, hooks };


export function render(component, parent) {
	let built = build(null, component),
		c = built._component;
	if (c) hook(c, 'componentWillMount');
	parent.appendChild(built);
	if (c) hook(c, 'componentDidMount');
	return build;
}


hooks.vnode = ({ attributes }) => {
	if (!attributes) return;

	let s = attributes.style;
	if (s && !s.substring) {
		attributes.style = styleObjToCss(s);
	}

	let c = attributes['class'];
	if (attributes.hasOwnProperty('className')) {
		c = attributes['class'] = attributes.className;
		delete attributes.className;
	}
	if (c && !c.substring) {
		attributes['class'] = hashToClassName(c);
	}
};

function styleObjToCss(s) {
	let str = '',
		sep = ': ',
		term = '; ';
	for (let prop in s) {
		if (s.hasOwnProperty(prop)) {
			let val = s[prop];
			str += jsToCss(prop);
			str += sep;
			str += val;
			if (typeof val === 'number' && !NON_DIMENSION_PROPS.hasOwnProperty(prop)) {
				str += 'px';
			}
			str += term;
		}
	}
	return str;
}

function hashToClassName(c) {
	let str = '';
	for (let prop in c) {
		if (c[prop]) {
			if (str) str += ' ';
			str += prop;
		}
	}
	return str;
}

let jsToCss = s => s.replace(/([A-Z])/, '-$1').toLowerCase();


/** 提供类似于React的API的基础组件 */
export class Component {
	constructor() {
		this._dirty = false;
		/** 调用开发者的方法来初始化组件的 props 和 state 数据源 */
		this.props = hook(this, 'getDefaultProps') || {};
		this.state = hook(this, 'getInitialState') || {};
		hook(this, 'initialize');
	}

	shouldComponentUpdate(nextProps, state) {
		return true;
	}
	/**
	 * 合并旧的和新的state
	 * 并触发异步渲染这个节点
	 */
	setState(state) {
		extend(this.state, state);
		this.triggerRender();
	}
	/** 根据传入新 props 来设置组件的 nextProps 属性 */
	setProps(props, opts = EMPTY) {
		/** 在调用上面的钩子函数时标记这个节点不用重渲染（可能因为还没准备好） */
		let d = this._disableRendering === true;
		this._disableRendering = true;
		/** 在触发渲染之前可以通过 componentWillReceiveProps 钩子函数来重置新 props 的属性 */
		hook(this, 'componentWillReceiveProps', props, this.props);
		//this.props = props;
		this.nextProps = props;
		this._disableRendering = d;
		/** 调用方可以要求同步重新渲染该节点 */
		if (opts.renderSync === true && options.syncComponentUpdates === true) {
			this._render();
		}
		/** 默认情况下是加入队列，异步渲染 */
		else if (opts.render !== false) {
			this.triggerRender();
		}
	}
	/** 标识该节点脏了,需要重渲染。加入队列异步渲染 */
	triggerRender() {
		if (this._dirty !== true) {
			this._dirty = true;
			renderQueue.add(this);
		}
	}
	/** 基础组件实例渲染元素是简单的 div 标签容器的包装 */
	render(props, state) {
		return h('div', { component: this.constructor.name }, props.children);
	}
	/** 组件节点的核心渲染过程，包括回调各个钩子函数 */
	_render(opts = EMPTY) {
		if (this._disableRendering === true) return;
		//重置脏标记回初始值
		this._dirty = false;
		/** 调用 shouldComponentUpdate 钩子函数来让开发者来做性能优化 */
		if (this.base && hook(this, 'shouldComponentUpdate', this.nextProps, this.state) === false) {
			//不让更新，但 props 数据需要被更新
			this.props = this.nextProps;
			return;
		}
		/** 确认渲染之后，更新 props 数据 */
		this.props = this.nextProps;
		/** 在调用 render 之前 回调 componentWillUpdate */
		hook(this, 'componentWillUpdate');
		/** 调用 render 方法来获得当前节点重渲染之后的 vNode(虚拟节点) */
		let rendered = hook(this, 'render', this.props, this.state);

		if (this.base || opts.build === true) {
			/** 将 vNode 经过缓存映射成真实的 dom 节点 */
			let base = build(this.base, rendered);
			/** 对比这个 dom 节点和之前的 dom 节点 */
			if (this.base && base !== this.base) {
				/** 不一样就将这个新节点插入到父节点中，然后删除旧节点 */
				this.base.parentNode.insertBefore(base, this.base);
				this.base.parentNode.removeChild(this.base);
			}
			/** 更新组件节点的 dom 引用 */
			this.base = base;
		}
		/** render 之后回调告知开发者渲染更新结束 */
		hook(this, 'componentDidUpdate');
	}
}

/** jsx hyperscript generator
 *  To use, add the directive:
 *  /** @jsx h *\/
 *  import { render, h } from 'react-compat';
 *  render(<span>foo</span>, document.body);
 */
export function h(nodeName, attributes, ...args) {
	let children = null,
		sharedArr = [],
		arr, lastSimple;
	if (args.length) {
		children = [];
		for (let i = 0; i < args.length; i++) {
			if (Array.isArray(args[i])) {
				arr = args[i];
			}
			else {
				arr = sharedArr;
				arr[0] = args[i];
			}
			for (let j = 0; j < arr.length; j++) {
				let child = arr[j];
				let simple = notEmpty(child) && !isVNode(child);
				if (simple) child = String(child);
				if (simple && lastSimple) {
					children[children.length - 1] += child;
				}
				else if (child !== null && child !== undefined) {
					children.push(child);
				}
				lastSimple = simple;
			}
		}
	}

	let p = new VNode(nodeName, attributes, children);
	hook(hooks, 'vnode', p);
	return p;
}
class VNode {
	constructor(nodeName, attributes, children) {
		this.nodeName = nodeName;
		this.attributes = attributes;
		this.children = children;
	}
}
VNode.prototype.__isVNode = true;

/** 优雅的调用沟子函数的方法 */
function hook(obj, name, ...args) {
	let fn = obj[name];
	if (fn && typeof fn === 'function') return fn.apply(obj, args);
}

function isVNode(obj) {
	return obj && obj.__isVNode === true;
}

function notEmpty(x) {
	return x !== null && x !== undefined;
}

/** 判断 dom 节点和 vnode 是否需要重新创建新的 dom 节点 */
function isSameNodeType(node, vnode) {
	/** dom 是文本节点和 vnode 是字符串，则可以复用这个文本节点 */
	if (node.nodeType === NODE_TEXT) {
		return typeof vnode === 'string';
	}
	let nodeName = vnode.nodeName;
	/** 如果 vnode 是函数构建的，则对比 dom 上挂的_componentConstructor 是否是同一个 */
	if (typeof nodeName === 'function') return node._componentConstructor === nodeName;
	/** 如果是 html 的标签节点，就对比 dom 和 vnode 节点名称是否一致 */
	return node.nodeName.toLowerCase() === nodeName;
}

/** 根据旧 dom 和新的 vnode 来构建出 dom 节点和组件 */
function buildComponentFromVNode(dom, vnode) {
	/** 如果这个旧 dom 之前是组件管理的，c 就是组件节点实例 */
	let c = dom && dom._component;
	if (c && dom._componentConstructor === vnode.nodeName) {
		/** vnode 和 dom 节点是同一个组件管理，就将虚拟节点的属性同步到 dom 节点 */
		let props = getNodeProps(vnode);
		c.setProps(props, SYNC_RENDER);
		return dom;
	}
	else {
		/** 如果不是同一个组件管理的，就认为旧 dom 的组件实例可以移除了，卸载该组件 */
		if (c) unmountComponent(dom, c);
		/** 根据 vnode 创建新的 dom 及组件 */
		return createComponentFromVNode(vnode)
	}
}

/** 根据 vnode 创建 dom 并在 dom 上绑定组件实例 */
function createComponentFromVNode(vnode) {
	/** 通过工厂来创建组件的实例 */
	let component = componentRecycler.create(vnode.nodeName);
	/** 获取 vnode 的所有属性 */
	let props = getNodeProps(vnode);
	/** 将 props 数据同步到组件实例上 */
	component.setProps(props, NO_RENDER);
	/** 准备好 props 之后，渲染该组件的结果了 */
	component._render(DOM_RENDER);
	/** 渲染之后,结果 dom 挂在组件的 base 属性上 */
	let node = component.base;
	/** 然后将组件实例以及 nodeName(构造函数/标签节点名)挂上 dom 上 */
	node._component = component;
	node._componentConstructor = vnode.nodeName;
	return node;
}

/** dom 节点被移除，组件实例卸载 */
function unmountComponent(dom, component) {
	console.warn('unmounting mismatched component', component);
	/** 删除节点对组件实例的引用 */
	delete dom._component;
	/** 告知开发者组件将被卸载 */
	hook(component, 'componentWillUnmount');
	/** 让父 dom 节点从 dom 树中删除掉 */
	let base = component.base;
	if (base && base.parentNode) {
		base.parentNode.removeChild(base);
	}
	/** 告知开发者组件被卸载完成 */
	hook(component, 'componentDidUnmount');
	/** 回收组件实例 */
	componentRecycler.collect(component);
}

/** 将不同的虚拟节点以及递归子节点转换成真实的 DOM 节点 */
function build(dom, vnode) {
	let out = dom,
		nodeName = vnode.nodeName;
	/** 如果 vnode 是函数组织，则创建出 dom 和组件 */
	if (typeof nodeName === 'function') {
		return buildComponentFromVNode(dom, vnode);
	}
	/** 如果节点是字符串，则创建一个文本 dom */
	if (typeof vnode === 'string') {
		if (dom) {
			if (dom.nodeType === NODE_TEXT) {
				/** 旧 dom 是文本节点，则直接复用，替换节点的文本内容即可 */
				dom.textContent = vnode;
				return dom;
			} else {
				/** 如果是旧 dom 是元素节点则未来可以复用 */
				if (dom.nodeType === NODE_ELEMENT) recycler.collect(dom);
			}
		}
		/** 创建新文本 dom */
		return document.createTextNode(vnode);
	}

	if (!dom) {
		/** 如果之前没有 dom, 就从工厂中创建 dom */
		out = recycler.create(nodeName);
	} else if (dom.nodeName.toLowerCase() !== nodeName) {
		/** 如果旧的 dom 节点名和 vnode 节点不一致，则从工厂创建新的 dom */
		out = recycler.create(nodeName);
		/** TODO 将旧 dom 的子节点都迁移到新 dom 上 */
		appendChildren(out, slice.call(dom.childNodes));
		/** 如果旧节点是元素类型，就回收该 dom */
		if (dom.nodeType === NODE_ELEMENT) recycler.collect(dom);
	}

	// 应用属性
	let old = getNodeAttributes(out) || EMPTY,
		attrs = vnode.attributes || EMPTY;

	// 移除 dom 所有属性，保证够干净
	if (old !== EMPTY) {
		for (let name in old) {
			if (old.hasOwnProperty(name)) {
				let o = attrs[name];
				if (o === undefined || o === null || o === false) {
					setAccessor(out, name, null, old[name]);
				}
			}
		}
	}

	// 更新 dom 的所有属性
	if (attrs !== EMPTY) {
		for (let name in attrs) {
			if (attrs.hasOwnProperty(name)) {
				let value = attrs[name];
				if (value !== undefined && value !== null && value !== false) {
					//这个 prev 旧值没用到
					let prev = getAccessor(out, name, old[name]);
					if (value !== prev) {
						setAccessor(out, name, value, prev);
					}
				}
			}
		}
	}


	let children = slice.call(out.childNodes);
	let keyed = {};
	for (let i = children.length; i--;) {
		let t = children[i].nodeType;
		let key;
		if (t === NODE_TEXT) {
			key = t.key;
		} else if (t === NODE_ELEMENT) {
			key = children[i].getAttribute('key');
		} else continue;
		if (key) keyed[key] = children.splice(i, 1)[0];
	}
	let newChildren = [];

	if (vnode.children) {
		for (let i = 0, vlen = vnode.children.length; i < vlen; i++) {
			let vchild = vnode.children[i];
			let attrs = vchild.attributes;
			let key, child;
			if (attrs) {
				key = attrs.key;
				child = key && keyed[key];
			}
			/** 尝试从现有子节点中提取相同类型的节点 */
			if (!child) {
				let len = children.length;
				if (children.length) {
					for (let j = 0; j < len; j++) {
						if (isSameNodeType(children[j], vchild)) {
							child = children.splice(j, 1)[0];
							break;
						}
					}
				}
			}
			/** 变形 匹配/找到/创建的 DOM 子级以匹配 vchild（深度） */
			newChildren.push(build(child, vchild));
		}
	}

	/** 将构造/增强的有序列表应用于父级 */
	for (let i = 0, len = newChildren.length; i < len; i++) {
		/** 我们有意在此处重新引用 out.childNodes，因为它是一个实时数组（类似于实时 NodeList） */
		if (out.childNodes[i] !== newChildren[i]) {
			let child = newChildren[i],
				c = child._component,
				next = out.childNodes[i + 1];
			if (c) hook(c, 'componentWillMount');
			if (next) out.insertBefore(child, next);
			else out.appendChild(child);
			if (c) hook(c, 'componentDidMount');
		}
	}

	/** 移除孤儿节点，同时触发相应组件实例 */
	for (let i = 0, len = children.length; i < len; i++) {
		let child = children[i],
			c = child._component;
		if (c) hook(c, 'componentWillUnmount');
		child.parentNode.removeChild(child);
		if (c) {
			hook(c, 'componentDidUnmount');
			componentRecycler.collect(c);
		} else if (child.nodeType === NODE_ELEMENT) {
			recycler.collect(child);
		}
	}

	return out;
}


let renderQueue = {
	items: [],
	itemsOffline: [],
	pending: false,
	add(component) {
		if (renderQueue.items.push(component) !== 1) return;

		let d = hooks.debounceRendering;
		if (d) d(renderQueue.process);
		else setTimeout(renderQueue.process, 0);
	},
	process() {
		let items = renderQueue.items,
			len = items.length;
		if (!len) return;
		renderQueue.items = renderQueue.itemsOffline;
		renderQueue.items.length = 0;
		renderQueue.itemsOffline = items;
		while (len--) {
			if (items[len]._dirty) {
				items[len]._render();
			}
		}
	}
};

let rerender = renderQueue.process;
export { rerender };


/** 支持回收 DOM 节点工厂 */
let recycler = {
	nodes: {},
	collect(node) {
		let name = node.nodeName;
		/** 将 dom 节点从浏览器中的 dom 树中移除 */
		recycler.clean(node);
		/** 将 dom 节点对象放到该相应节点名的对象池中，以便未来可以复用 */
		let list = recycler.nodes[name] || (recycler.nodes[name] = []);
		list.push(node);
	},
	create(nodeName) {
		/** 从回收的对象池中找，存在就返回第一个 */
		let list = recycler.nodes[nodeName];
		if (list && list.length) {
			return list.splice(0, 1)[0];
		}
		/** 没有就创建新的 dom 节点 */
		return document.createElement(nodeName);
	},
	clean(node) {
		/** 移除 dom 节点 */
		node.remove();
		/** 还要移除节点上属性数据，因为 dom 实例会被服用，但属性不会服用，需要清空。也便于垃圾回收 */
		if (node.attributes) {
			let attrs = getNodeAttributes(node);
			for (let attr in attrs) if (attrs.hasOwnProperty(attr)) {
				node.removeAttribute(attr);
			}
		}
		// if (node.childNodes.length>0) {
		// 	console.warn(`Warning: Recycler collecting <${node.nodeName}> with ${node.childNodes.length} children.`);
		// 	slice.call(node.childNodes).forEach(recycler.collect);
		// }
	}
};

/** 组件实例工厂 */
let componentRecycler = {
	components: {},
	collect(component) {
		//回收该组件实例引用，便于未来创建该对象的时候可以复用该对象
		let name = component.constructor.name;
		let list = componentRecycler.components[name] || (componentRecycler.components[name] = []);
		list.push(component);
	},
	create(ctor) {
		let name = ctor.name,
			list = componentRecycler.components[name];
		//如果之前回收过该组件实例的话就返回第一个
		if (list && list.length) {
			return list.splice(0, 1)[0];
		}
		//否则就创建该组件
		return new ctor();
	}
};

/**
 * 将 children 添加到 parent dom 上
 * 应该是为了性能优化：2个以内直接丢到 parent上，多个就委托到 fragment 上
 */
function appendChildren(parent, children) {
	let len = children.length;
	if (len <= 2) {
		parent.appendChild(children[0]);
		if (len === 2) parent.appendChild(children[1]);
		return;
	}
	/**
	 * DocumentFragments 是DOM节点。它们不是主DOM树的一部分。通常的用例是创建文档片段，将元素附加到文档片段，然后将文档片段附加到DOM树。在DOM树中，文档片段被其所有的子元素所代替。
		 * 因为文档片段存在于内存中，并不在DOM树中，所以将子元素插入到文档片段时不会引起页面回流（对元素位置和几何上的计算）。因此，使用文档片段通常会带来更好的性能。
	 */
	let frag = document.createDocumentFragment();
	for (let i = 0; i < len; i++) frag.appendChild(children[i]);
	parent.appendChild(frag);
}


function getAccessor(node, name, value) {
	if (name === 'class') return node.className;
	if (name === 'style') return node.style.cssText;
	return value;
	//return getComplexAccessor(node, name, value);
}

// function getComplexAccessor(node, name, value) {
// 	let uc = 'g'+nameToAccessor(name).substring(1);
// 	if (node[uc] && typeof node[uc]==='function') {
// 		return node[uc]();
// 	}
// 	return value;
// }


/** 
 * 尝试通过访问器方法设置，回退到 setAttribute()。
 * 自动检测和添加/删除基于以“on”开头的“属性”的事件处理程序。
 * 如果`value=null`，则触发属性/处理程序移除。
 * class 和 style 就直接覆盖
 */
function setAccessor(node, name, value, old) {
	if (name === 'class') {
		node.className = value;
	} else if (name === 'style') {
		node.style.cssText = value;
	} else {
		setComplexAccessor(node, name, value, old);
	}
}

/**
 * TODO 当 dom 的事件被触发，找到这个事件的类型有谁在监听
 */
function eventProxy(e) {
	let l = this._listeners,
		fn = l[e.type.toLowerCase()];
	if (fn) return fn.call(l, hook(hooks, 'event', e) || e);
}

/**
 * 自动检测和添加/删除基于以“on”开头的“属性”的事件处理程序。
 * 如果`value=null`，则触发属性/处理程序移除。
 * old 参数暂时没有用到
 */
function setComplexAccessor(node, name, value, old) {
	if (name.substring(0, 2) === 'on') {
		let type = name.substring(2).toLowerCase(),
			l = node._listeners || (node._listeners = {});
		if (!l[type]) node.addEventListener(type, eventProxy);
		l[type] = value;
		return;
	}

	let uc = nameToAccessor(name);
	/** 如果有 setXXX 方法就直接调用。否则就用最原始的 setAttibute/remoteAttribute */
	if (node[uc] && typeof node[uc] === 'function') {
		node[uc](value);
	} else if (value !== null) {
		node.setAttribute(name, value);
	} else {
		node.removeAttribute(name);
	}
}
/**
 * 获得属性的 dom 设置方法的名称，通过名称缓存拿
 */
function nameToAccessor(name) {
	let c = nameToAccessorCache[name];
	if (!c) {
		c = 'set' + name.charAt(0).toUpperCase() + name.substring(1);
		nameToAccessorCache[name] = c;
	}
	return c;
}
let nameToAccessorCache = {};


function getNodeAttributes(node) {
	let list = node.attributes;
	/** 没有 getNamedItem api 的话，返回的是一个对象 */
	if (!list.getNamedItem) return list;
	/** 有的话，list 是 NamedNodeMap 结构，需要转换 */
	if (list.length) return getAttributesAsObject(list);
}
/** 将 dom 的 NamedNodeMap 属性转成对象 */
function getAttributesAsObject(list) {
	let attrs = {};
	for (let i = list.length; i--;) {
		let item = list[i];
		attrs[item.name] = item.value;
	}
	return attrs;
}
/** 将 vnode 上的属性以及children/text 都放到 props 上 */
function getNodeProps(vnode) {
	let props = extend({}, vnode.attributes);
	if (vnode.children) {
		props.children = vnode.children;
	}
	if (vnode.text) {
		props._content = vnode.text;
	}
	return props;
}
/** 将属性展开重新赋值拷贝成新的一份 */
function extend(obj, props) {
	for (let i in props) if (props.hasOwnProperty(i)) {
		obj[i] = props[i];
	}
	return obj;
}
