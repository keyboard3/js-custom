/** 保留一个组件池以供重用，以组件名称为键。
 *	Note: 由于组件名称不是唯一的，甚至不一定可用，因此它们主要是一种分片形式。
 *	@private
 */
const components = {};


export function collectComponent(component) {
	let name = component.constructor.name,
		list = components[name];
	if (list) list.push(component);
	else components[name] = [component];
}


export function createComponent(ctor, props, context) {
	let list = components[ctor.name],
		len = list && list.length,
		c;
	for (let i=0; i<len; i++) {
		c = list[i];
		if (c.constructor===ctor) {
			list.splice(i, 1);
			return c;
		}
	}
	return new ctor(props, context);
}
