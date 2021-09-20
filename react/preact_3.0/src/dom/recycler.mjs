import { ATTR_KEY } from '../constants.mjs';
import { hasOwnProperty, memoize } from '../util.mjs';
import { setAccessor } from './index.mjs';

/** DOM node pool, keyed on nodeName. */

let nodes = {};

let normalizeName = memoize(name => name.toUpperCase());


export function collectNode(node) {
	cleanNode(node);
	let name = normalizeName(node.nodeName),
		list = nodes[name];
	if (list) list.push(node);
	else nodes[name] = [node];
}


export function createNode(nodeName) {
	let name = normalizeName(nodeName),
		list = nodes[name],
		node = list && list.pop() || document.createElement(nodeName);
	node[ATTR_KEY] = {};
	return node;
}


function cleanNode(node) {
	if (node.parentNode) node.parentNode.removeChild(node);

	if (node.nodeType===3) return;

	delete node._component;
	delete node._componentConstructor;

	let attrs = node[ATTR_KEY];
	for (let i in attrs) {
		if (hasOwnProperty.call(attrs, i)) {
			setAccessor(node, i, null, attrs[i]);
		}
	}
	node[ATTR_KEY] = null;

	// if (node.childNodes.length>0) {
	// 	console.warn(`Warning: Recycler collecting <${node.nodeName}> with ${node.childNodes.length} children.`);
	// 	toArray(node.childNodes).forEach(recycler.collect);
	// }
}
