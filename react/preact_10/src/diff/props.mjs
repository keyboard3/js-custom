import { IS_NON_DIMENSIONAL } from '../constants.mjs';
import options from '../options.mjs';

/**
 * Diff VNode 的新旧属性并将更改应用于 DOM 节点
 * @param {import('../internal').PreactElement} dom 要应用更改的 DOM 节点
 * @param {object} newProps 新 props
 * @param {object} oldProps 旧 props
 * @param {boolean} isSvg 此节点是否为 SVG 节点
 * @param {boolean} hydrate 我们是否处于补水模式
 */
export function diffProps(dom, newProps, oldProps, isSvg, hydrate) {
	let i;

	for (i in oldProps) {
		if (!(i in newProps)) {
			setProperty(dom, i, null, oldProps[i], isSvg);
		}
	}

	for (i in newProps) {
		if ((!hydrate || typeof newProps[i]=='function') && i!=='value' && i!=='checked' && oldProps[i]!==newProps[i]) {
			setProperty(dom, i, newProps[i], oldProps[i], isSvg);
		}
	}
}

function setStyle(style, key, value) {
	if (key[0] === '-') {
		style.setProperty(key, value);
	}
	else {
		style[key] = typeof value==='number' && IS_NON_DIMENSIONAL.test(key)===false ? value+'px' : value==null ? '' : value;
	}
}

/**
 * 在 DOM 节点上设置属性值
 * @param {import('../internal').PreactElement} dom 要修改的 DOM 节点
 * @param {string} name 要设置的属性的名称
 * @param {*} value 将属性设置为的值
 * @param {*} oldValue 这个属性旧值
 * @param {boolean} isSvg 此 DOM 节点是否为 SVG 节点
 */
function setProperty(dom, name, value, oldValue, isSvg) {
	name = isSvg ? (name==='className' ? 'class' : name) : (name==='class' ? 'className' : name);

	if (name==='key' || name === 'children') {}
	else if (name==='style') {
		const s = dom.style;

		if (typeof value==='string') {
			s.cssText = value;
		}
		else {
			if (typeof oldValue==='string') {
				s.cssText = '';
				oldValue = null;
			}

			if (oldValue) for (let i in oldValue) {
				if (!(value && i in value)) {
					setStyle(s, i, '');
				}
			}

			if (value) for (let i in value) {
				if (!oldValue || value[i] !== oldValue[i]) {
					setStyle(s, i, value[i]);
				}
			}
		}

	}
	// Benchmark for comparison: https://esbench.com/bench/574c954bdb965b9a00965ac6
	else if (name[0]==='o' && name[1]==='n') {
		let useCapture = name !== (name=name.replace(/Capture$/, ''));
		let nameLower = name.toLowerCase();
		name = (nameLower in dom ? nameLower : name).slice(2);

		if (value) {
			if (!oldValue) dom.addEventListener(name, eventProxy, useCapture);
			(dom._listeners || (dom._listeners = {}))[name] = value;
		}
		else {
			dom.removeEventListener(name, eventProxy, useCapture);
		}
	}
	else if (
		name!=='list'
		&& name!=='tagName'
		// HTMLButtonElement.form and HTMLInputElement.form are read-only but can be set using
		// setAttribute
		&& name!=='form'
		&& !isSvg
		&& (name in dom)
	) {
		dom[name] = value==null ? '' : value;
	}
	else if (typeof value!=='function' && name!=='dangerouslySetInnerHTML') {
		if (name!==(name = name.replace(/^xlink:?/, ''))) {
			if (value==null || value===false) {
				dom.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());
			}
			else {
				dom.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);
			}
		}
		else if (value==null || value===false) {
			dom.removeAttribute(name);
		}
		else {
			dom.setAttribute(name, value);
		}
	}
}

/**
 * 将事件代理到挂钩的事件处理程序
 * @param {Event} e 来自浏览器的事件对象
 * @private
 */
function eventProxy(e) {
	return this._listeners[e.type](options.event ? options.event(e) : e);
}
