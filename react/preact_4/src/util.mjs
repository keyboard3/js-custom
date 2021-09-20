import { NON_DIMENSION_PROPS } from './constants.mjs';


/** 将自己的属性从 `props` 复制到 `obj`。
 *	@returns obj
 *	@private
 */
export function extend(obj, props) {
	for (let i in props) if (hasOwnProperty.call(props, i)) {
		obj[i] = props[i];
	}
	return obj;
}


/** 快速克隆。注意：不会过滤掉非自己的属性。 */
export function clone(obj) {
	let out = {};
	/*eslint guard-for-in:0*/
	for (let i in obj) out[i] = obj[i];
	return out;
}


/** 为给定的函数创建一个缓存包装器。
 *  将回调函数调用的结果给缓存下来，避免多次调用
 *	@private
 */
export function memoize(fn, mem) {
	mem = mem || {};
	return k => hasOwnProperty.call(mem, k) ? mem[k] : (mem[k] = fn(k));
}


/** 从给定对象获取深度属性值，以点符号表示。
 *	@private
 */
export function delve(obj, key) {
	for (let p=key.split('.'), i=0; i<p.length && obj; i++) {
		obj = obj[p];
	}
	return obj;
}


/** 将类数组对象转换为数组
 *	@private
 */
export function toArray(obj) {
	let arr = [],
		i = obj.length;
	while (i--) arr[i] = obj[i];
	return arr;
}


/** @private is the given object a Function? */
export const isFunction = obj => 'function'===typeof obj;


/** @private is the given object a String? */
export const isString = obj => 'string'===typeof obj;


/** @private Safe reference to builtin hasOwnProperty */
export const hasOwnProperty = {}.hasOwnProperty;


/** Check if a value is `null` or `undefined`.
 *	@private
 */
export const empty = x => x==null;


/** 将样式的 obj 转换为 CSSText
 *	@private
 */
export function styleObjToCss(s) {
	let str = '';
	for (let prop in s) {
		if (hasOwnProperty.call(s, prop)) {
			let val = s[prop];
			if (!empty(val)) {
				str += jsToCss(prop);
				str += ': ';
				str += val;
				if (typeof val==='number' && !NON_DIMENSION_PROPS[prop]) {
					str += 'px';
				}
				str += '; ';
			}
		}
	}
	return str;
}



/** 将 CSS 类的 hash 对象转换为以空格分隔的 className 字符串
 *	@private
 */
export function hashToClassName(c) {
	let str = '';
	for (let prop in c) {
		if (c[prop]) {
			if (str) str += ' ';
			str += prop;
		}
	}
	return str;
}



/** 将 JavaScript 驼峰式 CSS 属性名称转换为 CSS 属性名称
 *	@private
 *	@function
 */
export const jsToCss = memoize( s => s.replace(/([A-Z])/,'-$1').toLowerCase() );


/** 只是一个记忆的 String.prototype.toLowerCase */
export const toLowerCase = memoize( s => s.toLowerCase() );

/**
 * 	requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。
 * 该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行
 * 	对于动画，rAF 非常优越。但是，它在基准测试中得分不佳 :(
 */
// export const setImmediate = typeof requestAnimationFrame==='function' ? requestAnimationFrame : setTimeout;

let ch;
try { ch = new MessageChannel(); } catch(e) {}

/** 尽快异步调用函数。
 *	@param {Function} callback
 */
export const setImmediate = ch ? ( f => {
	/** port2 postMessage,onmessage 异步响应这个消息 */
	ch.port1.onmessage = f;
	ch.port2.postMessage('');
}) : setTimeout;
/**
 * setTimeout(fn, 0)可以使用, 然而按照HTML规范, 嵌套深度超过5级的定时器, 会被限制在4ms , 他没有为setImmediate的天然及时性提供合适的polyfill.
 */