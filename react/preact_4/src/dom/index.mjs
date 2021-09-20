import { ATTR_KEY, EMPTY } from '../constants.mjs';
import { hasOwnProperty, memoize } from '../util.mjs';
import { optionsHook } from '../hooks.mjs';


export function ensureNodeData(node) {
	return node[ATTR_KEY] || (node[ATTR_KEY] = {});
}


export function getNodeType(node) {
	return node.nodeType;
}


/** 将多个子节点附加到一个节点。
 *	在附加 2 个或更多子项时使用文档片段进行批处理
 *	@private
 */
export function appendChildren(parent, children) {
	let len = children.length,
		many = len>2,
		into = many ? document.createDocumentFragment() : parent;
	for (let i=0; i<len; i++) into.appendChild(children[i]);
	if (many) parent.appendChild(into);
}



/** 检索渲染属性的值
 *	@private
 */
export function getAccessor(node, name, value, cache) {
	if (name!=='type' && name!=='style' && name in node) return node[name];
	let attrs = node[ATTR_KEY];
	if (cache!==false && attrs && hasOwnProperty.call(attrs, name)) return attrs[name];
	if (name==='class') return node.className;
	if (name==='style') return node.style.cssText;
	return value;
}



/** 在给定节点上设置命名属性，对某些名称和 event handlers 具有特殊行为。
 *	如果 `value` 为 `null`，attribute/handler 将被删除。
 *	@param {Element} node	要转换的元素
 *	@param {string} name	要设置的名称/键，例如事件或属性名称
 *	@param {any} value		属性值，例如用作 event handler
 *	@param {any} previousValue	为此名称/节点对设置的最后一个值
 *	@private
 */
export function setAccessor(node, name, value) {
	if (name==='class') {
		node.className = value || '';
	}
	else if (name==='style') {
		node.style.cssText = value || '';
	}
	else if (name==='dangerouslySetInnerHTML') {
		node.innerHTML = value.__html;
	}
	else if (name==='key' || (name in node && name!=='type')) {
		node[name] = value;
	}
	else {
		setComplexAccessor(node, name, value);
	}

	ensureNodeData(node)[name] = value;
}


/** 对于没有显式行为的 props，将其作为 event handlers 或者 attributes 应用于节点。
 *	@private
 */
function setComplexAccessor(node, name, value) {
	if (name.substring(0,2)==='on') {
		let type = normalizeEventName(name),
			l = node._listeners || (node._listeners = {}),
			fn = !l[type] ? 'add' : !value ? 'remove' : null;
		if (fn) node[fn+'EventListener'](type, eventProxy);
		l[type] = value;
		return;
	}

	let type = typeof value;
	if (value===null) {
		node.removeAttribute(name);
	}
	else if (type!=='function' && type!=='object') {
		node.setAttribute(name, value);
	}
}



/** 将事件代理到 hooked event handlers
 *	@private
 */
function eventProxy(e) {
	let fn = this._listeners[normalizeEventName(e.type)];
	if (fn) return fn.call(this, optionsHook('event', e) || e);
}



/** 将事件名称/类型转换为小写并去除任何“on*”前缀。
 *	@function
 *	@private
 */
let normalizeEventName = memoize(t => t.replace(/^on/i,'').toLowerCase());



/** 获取节点属性的 hashmap，优先使用 preact 缓存的属性值而不是 DOM 的
 *	@private
 */
export function getNodeAttributes(node) {
	return node[ATTR_KEY] || getRawNodeAttributes(node) || EMPTY;
	// let list = getRawNodeAttributes(node),
	// 	l = node[ATTR_KEY];
	// return l && list ? extend(list, l) : (l || list || EMPTY);
}


/**  获取节点的属性作为 hashmap，无论类型如何。
 *	@private
 */
function getRawNodeAttributes(node) {
	let list = node.attributes;
	if (!list || !list.getNamedItem) return list;
	return getAttributesAsObject(list);
}


/** 将 DOM `.attributes` NamedNodeMap 转换为 hashmap。
 *	@private
 */
function getAttributesAsObject(list) {
	let attrs;
	for (let i=list.length; i--; ) {
		let item = list[i];
		if (!attrs) attrs = {};
		attrs[item.name] = item.value;
	}
	return attrs;
}
