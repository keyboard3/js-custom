import options from './options.mjs';
import VNode from './vnode.mjs';
import { hook } from './hooks.mjs';
import { empty } from './util.mjs';


/** JSX/hyperscript reviver
 *	@see http://jasonformat.com/wtf-is-jsx
 *	@public
 *  @example
 *  /** @jsx h *\/
 *  import { render, h } from 'preact';
 *  render(<span>foo</span>, document.body);
 */
export default function h(nodeName, attributes, ...args) {
	let children,
		sharedArr = [],
		len = args.length,
		arr, lastSimple;
	if (len) {
		children = [];
		for (let i=0; i<len; i++) {
			let p = args[i];
			if (empty(p)) continue;
			if (p.join) {
				arr = p;
			}
			else {
				arr = sharedArr;
				arr[0] = p;
			}
			for (let j=0; j<arr.length; j++) {
				let child = arr[j],
					simple = !empty(child) && !(child instanceof VNode);
				if (simple) child = String(child);
				if (simple && lastSimple) {
					children[children.length-1] += child;
				}
				else if (!empty(child)) {
					children.push(child);
				}
				lastSimple = simple;
			}
		}
	}

	if (attributes && attributes.children) {
		delete attributes.children;
	}

	let p = new VNode(nodeName, attributes || undefined, children || undefined);
	hook(options, 'vnode', p);
	return p;
}
