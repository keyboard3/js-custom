import options from './options.mjs';
import { setImmediate } from './util.mjs';
import { renderComponent } from './vdom/component.mjs';

/** Managed queue of dirty components to be re-rendered */

// items/itemsOffline swap on each rerender() call (just a simple pool technique)
let items = [],
	itemsOffline = [];

export function enqueueRender(component) {
	if (items.push(component)!==1) return;

	(options.debounceRendering || setImmediate)(rerender);
}


export function rerender() {
	if (!items.length) return;

	let currentItems = items,
		p;

	// swap online & offline
	items = itemsOffline;
	itemsOffline = currentItems;

	while( (p = currentItems.pop()) ) {
		if (p._dirty) renderComponent(p);
	}
}
