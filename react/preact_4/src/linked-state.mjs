import { empty, isString, isFunction, delve } from './util.mjs';

/** 创建一个设置给定状态属性的事件处理函数。
 *	@param {Component} component	应该更新状态的组件
 *	@param {string} key				在组件状态下更新的点标记键路径
 *	@param {string} eventPath	 应从事件或组件中检索的值的点符号键路径
 *	@returns {function} linkedStateHandler
 *	@private
 */
export function createLinkedState(component, key, eventPath) {
	let path = key.split('.'),
		p0 = path[0],
		len = path.length;
	return function(e) {
		let t = this,
			s = component.state,
			obj = s,
			v, i;
		if (isString(eventPath)) {
			v = delve(e, eventPath);
			if (empty(v) && (t=t._component)) {
				v = delve(t, eventPath);
			}
		}
		else {
			v = (t.nodeName+t.type).match(/^input(checkbox|radio)$/i) ? t.checked : t.value;
		}
		if (isFunction(v)) v = v.call(t);
		if (len>1) {
			for (i=0; i<len-1; i++) {
				obj = obj[path[i]] || (obj[path[i]] = {});
			}
			obj[path[i]] = v;
			v = s[p0];
		}
		component.setState({ [p0]: v });
	};
}
