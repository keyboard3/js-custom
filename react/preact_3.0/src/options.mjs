import { styleObjToCss, hashToClassName } from './util.mjs';

/** Global options
 *	@public
 *	@namespace options {Object}
 */
export default {

	/** If `true`, `prop` changes trigger synchronous component updates.
	 *	@boolean
	 */
	syncComponentUpdates: true,

	/** Processes all created VNodes.
	 *	@param {VNode} vnode	A newly-created VNode to normalize/process
	 *	@protected
	 */
	vnode(n) {
		let attrs = n.attributes;
		if (!attrs) return;

		// normalize className to class.
		let p = attrs.className;
		if (p) attrs['class'] = p;
		delete attrs.className;

		normalize(attrs, 'class', hashToClassName);
		normalize(attrs, 'style', styleObjToCss);
	}
};


function normalize(obj, prop, fn) {
	let v = obj[prop];
	if (v && typeof v!=='string') {
		obj[prop] = fn(v);
	}
}
