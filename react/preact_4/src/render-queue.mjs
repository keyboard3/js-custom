import options from './options.mjs';
import { setImmediate } from './util.mjs';
import { renderComponent } from './vdom/component.mjs';

/** 要重新渲染的脏组件的托管队列 */

/**
 * 每次 rerender() 调用时的 items/itemsOffline 交换（只是一个简单的池技术）
 * 暂时没有看出来，双队列有啥好处
 */
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
