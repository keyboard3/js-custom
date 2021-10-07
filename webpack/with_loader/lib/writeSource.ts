import { isContextModule } from "./util";

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
export default function (module: Partial<Module | ContextModule>, options: Partial<Options>, toRealId: (id: number) => Module["realId"]) {
	var result;
	if (isContextModule(module)) {
		/** 建立 contextModule 模块内容，返回一个闭包函数，使得可以通过文件名来代理访问到实际模块 */
		if (module.requireMap) {
			var extensions = (options.resolve && options.resolve.extensions) || [".web.js", ".js"];
			var extensionsAccess = [];
			extensions.forEach(function (ext) {
				extensionsAccess.push("map[name+\"" +
					ext.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") +
					"\"]");
			});
			var realRequireMap = {};
			Object.keys(module.requireMap).sort().forEach(function (file) {
				realRequireMap[file] = toRealId(module.requireMap[file]);
			});

			result = "/***/module.exports = function(name) {\n" +
				"/***/\tvar map = " + JSON.stringify(realRequireMap) + ";\n" +
				"/***/\treturn require(" + extensionsAccess.join("||") + "||name);\n" +
				"/***/};";
		} else
			return;
	} else {
		var freeVars: { [key: string]: CommonJsRequireDependency } = {};
		var replaces: SourceReplaceItem[] = []; // { from: 123, to: 125, value: "4" }
		var modulePrepends = [];
		var moduleAppends = [];
		if (module.requires) {
			module.requires.forEach(genReplaceRequire);
		}
		if (module.contexts) {
			module.contexts.forEach(genContextReplaces);
		}
		if (module.asyncs) {
			module.asyncs.forEach(function genReplacesAsync(asyncItem) {
				var oldFreeVars = freeVars;
				freeVars = {};
				if (asyncItem.requires) {
					asyncItem.requires.forEach(genReplaceRequire);
				}
				if (asyncItem.asyncs) {
					asyncItem.asyncs.forEach(genReplacesAsync);
				}
				if (asyncItem.contexts) {
					asyncItem.contexts.forEach(genContextReplaces);
				}
				/** 将 require.ensure([],()=>{}) => require.ensure(id,()=>{}) */
				if (asyncItem.namesRange) {
					replaces.push({
						from: asyncItem.namesRange[0],
						to: asyncItem.namesRange[1],
						value: ((asyncItem.chunkId || "0") + "")
					});
				}
				if (asyncItem.blockRange) {
					genReplacesFreeVars(asyncItem.blockRange, freeVars);
				}
				freeVars = oldFreeVars;
			});
		}
		genReplacesFreeVars(null, freeVars);
		replaces.sort(function (a, b) {
			return b.from - a.from;
		});
		var source = module.source;
		result = [source];
		replaces.forEach(function (repl) {
			var remSource = result.shift();
			result.unshift(
				remSource.substr(0, repl.from),
				repl.value,
				remSource.substr(repl.to + 1)
			);
		});
		result = result.join("");
		function genReplaceRequire(requireItem: CommonJsRequireDependency) {
			if (requireItem.id !== undefined && toRealId(requireItem.id) !== undefined) {
				var prefix = "";
				/** 添加注释的模块名 */
				if (requireItem.name)
					prefix += "/* " + requireItem.name + " */";

				if (requireItem.expressionRange) {
					/** require(xx)*/
					replaces.push({
						from: requireItem.expressionRange[0],
						to: requireItem.expressionRange[1],
						value: "require(" + prefix + toRealId(requireItem.id) + ")" + (requireItem.append || "")
					});
				} else if (requireItem.valueRange) {
					/** require(condition?"moduleA","moduleB") */
					replaces.push({
						from: requireItem.valueRange[0],
						to: requireItem.valueRange[1],
						value: prefix + toRealId(requireItem.id)
					});
				} else if (requireItem.variable) {
					/** var a = $; variable=$ */
					if (!freeVars[requireItem.variable]) {
						freeVars[requireItem.variable] = requireItem;
					}
				}
			}
		}
		function genContextReplaces(contextItem: RequireContextDependency) {
			var postfix = "";
			var prefix = "";
			if (contextItem.name)
				prefix += "/* " + contextItem.name + " */";
			if (contextItem.require) {
				/** require("a/name"+xx)*/
				//第一步替换的是调用者 require=> require(id)
				replaces.push({
					from: contextItem.calleeRange[0],
					to: contextItem.calleeRange[1],
					value: "require(" + prefix + (((contextItem.id && toRealId(contextItem.id)) || JSON.stringify("context: " + contextItem.name || "context failed")) + "") + ")"
				});
				//第二步替换的是参数("a/name"+xx)=>("./"+xx);
				if (contextItem.replace)
					replaces.push({
						from: contextItem.replace[0][0],
						to: contextItem.replace[0][1],
						value: JSON.stringify(contextItem.replace[1])
					});
			} else {
				/** require.context("./templates") => require(id) */
				replaces.push({
					from: contextItem.expressionRange[0],
					to: contextItem.expressionRange[1],
					value: "require(" + prefix + (((contextItem.id && toRealId(contextItem.id)) || JSON.stringify("context: " + contextItem.name || "context failed")) + "") + ")" + postfix
				});
			}
		}
		function genReplacesFreeVars(blockRange: ExprRange | null, freeVars: { [key: string]: CommonJsRequireDependency }) {
			var keys = Object.keys(freeVars);
			let values: CommonJsRequireDependency[] = [];
			var removeKeys = [];
			keys.forEach(function (key, idx) {
				/** 如果变量指向的模块就是当前模块就移除 */
				if (freeVars[key].id === module.id) {
					removeKeys.push(idx);
				} else {
					values.push(freeVars[key]);
				}
			});
			removeKeys.reverse().forEach(function (idx) {
				keys.splice(idx, 1);
			});
			if (keys.length === 0) return;
			let strValues: string[] = [];
			/** 将所有变量依赖都替换成 require(xx) */
			values.forEach(function (requireItem, idx) {
				if (requireItem.id !== undefined && toRealId(requireItem.id) !== undefined) {
					var prefix = "";
					if (requireItem.name)
						prefix += "/* " + requireItem.name + " */";
					strValues[idx] = "require(" + prefix + toRealId(requireItem.id) + ")" + (requireItem.append || "");
				}
			});
			var start = "/* WEBPACK FREE VAR INJECTION */ (function(" + keys.join(",") + ") {";
			var end = "/* WEBPACK FREE VAR INJECTION */ }(" + strValues.join(",") + "))"
			/** 给回调函数体内报一个函数作用域，注入这些变量 require */
			if (blockRange) {
				replaces.push({
					from: blockRange[0],
					to: blockRange[0] - 1,
					value: start
				});
				replaces.push({
					from: blockRange[1],
					to: blockRange[1] - 1,
					value: end
				});
			} else {
				modulePrepends.unshift("/******/ " + start + "\n");
				moduleAppends.push("\n/******/ " + end);
			}
		}
	}
	var minimized = uglify(result, (module as Partial<Module>).filename);
	module.size = minimized.length;
	if (options.debug) {
		if (options.minimize) {
			result = minimized;
		}
		result = [
			"eval(",
			JSON.stringify(result.join("")),
			"\n\n// WEBPACK FOOTER //\n",
			"// module.id = ", module.id, "\n",
			"// module.realId = ", module.realId, "\n",
			"// module.chunks = ", module.chunks.join(", "), "\n",
			"//@ sourceURL=webpack-module://", encodeURI((module as Module).filename).replace(/%5C|%2F/g, "/"),
			")"].join("");
	}
	var finalResult = [];
	finalResult.push.apply(finalResult, modulePrepends);
	finalResult.push(result);
	finalResult.push.apply(finalResult, moduleAppends);
	return finalResult.join("");
}

function uglify(input: string, filename?: string) {
	var uglify = require("uglify-js");
	var source: string;
	try {
		source = uglify.parser.parse(input);
		source = uglify.uglify.ast_mangle(source);
		source = uglify.uglify.ast_squeeze(source);
		source = uglify.uglify.gen_code(source);
	} catch (e) {
		throw new Error(filename + " @ Line " + e.line + ", Col " + e.col + ", " + e.message);
		return input;
	}
	return source;
}