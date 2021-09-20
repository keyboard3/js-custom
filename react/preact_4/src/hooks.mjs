import options from './options.mjs';


/** 在 `options` 导出上调用一个 hook. */
export function optionsHook(name, a, b) {
	return hook(options, name, a, b);
}


/** 如果存在，则调用带有参数的“hook”方法。
 *	@private
 */
export function hook(obj, name, a, b, c) {
	let fn = obj[name];
	if (fn && fn.call) return fn.call(obj, a, b, c);
}


/** 在组件和子组件上调用 hook()（递归）
 *	@private
 */
export function deepHook(obj, type) {
	do {
		hook(obj, type);
	} while ((obj=obj._component));
}
