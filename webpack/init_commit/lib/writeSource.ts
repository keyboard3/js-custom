export default function (module: Partial<Module>) {
	var replaces: SourceReplaceItem[] = []; // { from: 123, to: 125, value: "4" }
	function genReplaceRequire(requireItem: PickArray<Module["requires"]>) {
		if (requireItem.nameRange && requireItem.id !== undefined) {
			/** 最终替换 require(**) 成 require(module.id) */
			replaces.push({
				from: requireItem.nameRange[0],
				to: requireItem.nameRange[1],
				value: "" + requireItem.id
			});
		}
	}
	if (module.requires) {
		module.requires.forEach(genReplaceRequire);
	}
	if (module.asyncs) {
		module.asyncs.forEach(function genReplacesAsync(asyncItem) {
			if (asyncItem.requires) {
				asyncItem.requires.forEach(genReplaceRequire);
			}
			if (asyncItem.asyncs) {
				asyncItem.asyncs.forEach(genReplacesAsync);
			}
			/** 最终替换 require.ensure([**],) 成 require.ensure(chunkId,) */
			if (asyncItem.namesRange) {
				replaces.push({
					from: asyncItem.namesRange[0],
					to: asyncItem.namesRange[1],
					value: ((asyncItem.chunkId || "0") + "")
				});
			}
		});
	}
	replaces.sort(function (a, b) {
		return b.from - a.from;
	});
	var source = module.source;
	var result = [source];
	replaces.forEach(function (repl) {
		var remSource = result.shift();
		/** 将模块内容的依赖的部分都替换成最终依赖(浏览器中) */
		result.unshift(
			remSource.substr(0, repl.from),
			repl.value,
			remSource.substr(repl.to + 1)
		);
	});
	return result.join("");
}