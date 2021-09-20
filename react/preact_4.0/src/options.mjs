import { isFunction, isString, styleObjToCss, hashToClassName } from './util.mjs';

/** Global options
 *	@public
 *	@namespace options {Object}
 */
export default {

	/** If `true`, `prop` changes trigger synchronous component updates.
	 *	@name syncComponentUpdates
	 *	@type Boolean
	 *	@default true
	 */
	//syncComponentUpdates: true,

	/** Processes all created VNodes.
	 *	@param {VNode} vnode	A newly-created VNode to normalize/process
	 */
	vnode(n) {
		let attrs = n.attributes;
		if (!attrs || isFunction(n.nodeName)) return;

		// normalize className to class.
		let p = attrs.className;
		if (p) {
			attrs['class'] = p;
			delete attrs.className;
		}

		if (attrs['class']) normalize(attrs, 'class', hashToClassName);
		if (attrs.style) normalize(attrs, 'style', styleObjToCss);
	}
};


function normalize(obj, prop, fn) {
	let v = obj[prop];
	if (v && !isString(v)) {
		obj[prop] = fn(v);
	}
}
