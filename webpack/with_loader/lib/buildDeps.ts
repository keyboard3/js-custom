/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import parse from "./parse"
import resolve, { context as ResolveContext } from "./resolve"
import fs from "fs";
import path from "path";;
import { isModule } from './util';

/**
 * context: current directory
 * mainModule: the entrance module
 * options:
 * callback: function(err, result)
 */
type Callback = (err: any, result?: any) => void;
export default buildDeps;
function buildDeps(context: string, mainModule: string, callback: Callback): void;
function buildDeps(context: string, mainModule: string, options: Partial<Options>, callback: Callback): void;
function buildDeps(context: string, mainModule: string, optionsOrCallback: Partial<Options> | Callback, callback?: Callback) {
	let options: Partial<Options>;
	if (!callback) {
		callback = optionsOrCallback as Callback;
		options = {};
	}
	if (!options) options = {};

	var depTree: Partial<DepTree> = {
		warnings: [],
		errors: [],
		modules: {},
		modulesById: {},
		chunks: {},
		nextModuleId: 0,
		nextChunkId: 0,
		chunkModules: {} // used by checkObsolete
	}
	var mainModuleId;
	/** 通过入口的模块递归解析出所有依赖的模块 */
	addModule(depTree, context, mainModule, options, { type: "main" }, function (err, id) {
		if (err) {
			callback(err);
			return;
		}
		mainModuleId = id;
		buildTree();
	});
	/** 根据已经解析所有依赖的模块，分析出所有拆分的 chunk (独立js文件包含那些模块) */
	function buildTree() {
		/** 拆分入口 chunk 和资源 chunk */
		addChunk(depTree, depTree.modulesById[mainModuleId], options);
		createRealIds(depTree, options);
		for (var chunkId in depTree.chunks) {
			/** 检查每个 chunk 的模块，保证资源包请求链上不会出现重复的模块，不会出现空以及重复的资源包 */
			removeParentsModules(depTree, depTree.chunks[chunkId]);
			removeChunkIfEmpty(depTree, depTree.chunks[chunkId]);
			checkObsolete(depTree, depTree.chunks[chunkId]);
		}
		// cleanup
		delete depTree.chunkModules;
		depTree.modulesByFile = depTree.modules;
		depTree.modules = depTree.modulesById;
		delete depTree.modulesById;
		delete depTree.nextModuleId;
		delete depTree.nextChunkId;
		// return
		callback(null, depTree);
	}
}
/**
 * 连续通过 loaders 处理模块内容
 * @param request 完整的模块绝对路径，包括 loaders
 * @param loaders 
 * @param filenames 模块的资源文件绝对路径
 * @param contents 模块的资源文件内容
 * @param options 
 * @param callback 经过 loaders 处理过之后的模块内容回调
 * @returns 
 */
function execLoaders(request: string, loaders: string[], filenames: string[], contents: string[], options: Partial<Options>, callback: Callback) {
	if (loaders.length === 0)
		callback(null, contents[0]);
	else {
		var loaderFunctions = [];
		try {
			loaders.forEach(function (name) {
				/** require 导入 loader 函数 */
				var loader = require(name);
				loaderFunctions.push(loader);
			});
		} catch (e) {
			callback(e);
			return;
		}
		function nextLoader(...argumentList: any[]): void;
		function nextLoader() {
			var args = Array.prototype.slice.apply(arguments);
			var err = args.shift();
			if (err) {
				callback(err);
				return;
			}
			if (loaderFunctions.length > 0) {
				try {
					var async = false;
					/** 提供给 loader 的 this 上下文 */
					var context = {
						request: request,
						filenames: filenames,
						exec: function (code, filename) {
							var Module = require("module");
							var m = new Module("exec in " + request, module);
							m.filename = filenames[0];
							m._compile(code, filename);
							return m.exports;
						},
						resolve: function (context, path, cb) {
							resolve(context, "!" + path, options.resolve, cb);
						},
						async: function () {
							async = true;
							return nextLoader;
						},
						callback: function () {
							async = true;
							nextLoader.apply(null, arguments);
						},
						web: true,
						debug: options.debug,
						minimize: options.minimize,
						values: undefined,
						options: options
					};
					/** 取出最近的 loader 函数将上一个结果丢进去, apply 接收的是一个参数数组 */
					var retVal = loaderFunctions.pop().apply(context, args);
					if (!async)
						nextLoader(retVal === undefined ? new Error("loader did not return a value") : null, retVal);
				} catch (e) {
					callback("Loader throwed exeception: " + e);
					return;
				}
			} else {
				callback(null, args[0]);
			}
		}
		contents.unshift(null);
		nextLoader.apply(null, contents);
	}

}
/** 根据依赖的模块名解析出模块对象 */
function addModule(depTree: Partial<DepTree>, context: string, moduleName: string, options: Partial<Options>, reason: ModuleReason, callback: Callback) {
	resolve(context || path.dirname(moduleName), moduleName, options.resolve, resolved);
	function resolved(err, filename?: string) {
		if (err) {
			callback(err);
			return;
		}
		if (depTree.modules[filename]) {
			depTree.modules[filename].reasons.push(reason);
			callback(null, depTree.modules[filename].id);
		} else {
			var module: Partial<Module> = depTree.modules[filename] = {
				id: depTree.nextModuleId++,
				filename: filename,
				reasons: [reason]
			};
			depTree.modulesById[module.id] = module;
			var filenameWithLoaders = filename;
			var loaders = filename.split(/!/g);
			filename = loaders.pop();
			fs.readFile(filename, "utf-8", function (err, content) {
				if (err) {
					callback(err);
					return;
				}
				execLoaders(filenameWithLoaders, loaders, [filename], [content], options, processJs);
				function processJs(err, source) {
					if (err) {
						callback(err);
						return;
					}
					var deps: ModuleDeps;
					try {
						deps = parse(source, options.parse);
					} catch (e) {
						callback("File \"" + filenameWithLoaders + "\" parsing failed: " + e);
						return;
					}
					module.requires = deps.requires || [];
					module.asyncs = deps.asyncs || [];
					module.contexts = deps.contexts || [];
					module.source = source;

					/** 模块内的所有依赖的 require，同模块不同位置的依赖 */
					var requires: { [key: CommonJsRequireDependency["name"]]: CommonJsRequireDependency[] } = {};
					/** 非异步中，直接引用的模块 */
					var directRequire: { [key: CommonJsRequireDependency["name"]]: boolean } = {};
					/** 模块内所有依赖的 require.context */
					var contexts: { context: RequireContextDependency, module: Partial<Module> }[] = [];
					/** 非异步中的 直接引用的 require.context */
					var directContexts: { [key: RequireContextDependency["name"]]: boolean } = {};
					function add(r: CommonJsRequireDependency) {
						requires[r.name] = requires[r.name] || [];
						requires[r.name].push(r);
					}
					function addContext(m: Partial<Module>) {
						return function (c) {
							contexts.push({ context: c, module: m });
						}
					}
					if (module.requires) {
						module.requires.forEach(add);
						module.requires.forEach(function (r) {
							directRequire[r.name] = true;
						});
					}
					if (module.contexts) {
						module.contexts.forEach(addContext(module));
						module.contexts.forEach(function (c) {
							directContexts[c.name] = true;
						});
					}
					/** 递归解析异步中的所有 require 和 require.context */
					if (module.asyncs)
						module.asyncs.forEach(function addAsync(c: RequireEnsureDependencyBlock) {
							if (c.requires)
								c.requires.forEach(add);
							if (c.asyncs)
								c.asyncs.forEach(addAsync);
							if (c.contexts)
								c.contexts.forEach(addContext(c));
						});
					let requiresNames = Object.keys(requires);
					var count = requiresNames.length + contexts.length + 1;
					var errors = [];
					/** 顺序解析当前模块内的所有 require(moduleName) 依赖的模块。包括异步回调中的 require */
					if (requiresNames.length)
						requiresNames.forEach(function (moduleName) {
							var reason = {
								type: directRequire[moduleName] ? "require" : "async require",
								count: requires[moduleName].length,
								filename: filename
							} as const;
							addModule(depTree, path.dirname(filename), moduleName, options, reason, function (err, moduleId) {
								if (err) {
									depTree.errors.push("Cannot find module '" + moduleName + "'\n " + err +
										"\n @ " + filename + " (line " + requires[moduleName][0].line + ", column " + requires[moduleName][0].column + ")");
								} else {
									/** 给这个同名的依赖都赋值上解析完的模块 id */
									requires[moduleName].forEach(function (requireItem) {
										requireItem.id = moduleId;
									});
								}
								endOne();
							});
						});
					/** 顺序解析当前模块内的所有 require.context(dirname)。包括异步回调中的 require.context */
					if (contexts) {
						contexts.forEach(function (contextObj) {
							var context = contextObj.context;
							var module = contextObj.module;
							var reason = {
								type: directContexts[context.name] ? "context" : "async context",
								filename: filename
							} as const;
							/** 上下文模块内自动会 commonJs 依赖目录下的所有文件 */
							addContextModule(depTree, path.dirname(filename), context.name, options, reason, function (err, contextModuleId: number) {
								if (err) {
									depTree.errors.push("Cannot find context '" + context.name + "'\n " + err +
										"\n @ " + filename + " (line " + context.line + ", column " + context.column + ")");
								} else {
									/** 给模块的 commonJs 依赖上添加一个上下文模块的 id */
									context.id = contextModuleId;
									module.requires.push({ id: context.id });
								}
								endOne();
							});
							if (context.warn) {
								depTree.warnings.push(filename + " (line " + context.line + ", column " + context.column + "): " +
									"implicit use of require.context(\".\") is not recommended.");
							}
						});
					}
					endOne();
					function endOne() {
						count--;
						if (count === 0) {
							if (errors.length) {
								callback(errors.join("\n"));
							} else {
								callback(null, module.id);
							}
						}
					}
				}
			});
		}
	}
}

/** 添加上下文模块，目的只是将目录下的所有有效模块打包 */
function addContextModule(depTree: Partial<DepTree>, context: string, contextModuleName: string, options: Partial<Options>, reason: ModuleReason, callback: Callback) {
	ResolveContext(context, contextModuleName, options.resolve, resolved);
	function resolved(err, dirname: string) {
		if (err) {
			callback(err);
			return;
		}
		if (depTree.modules[dirname]) {
			depTree.modules[dirname].reasons.push(reason);
			callback(null, depTree.modules[dirname].id);
		} else {
			var contextModule: Partial<ContextModule> = depTree.modules[dirname] = {
				name: contextModuleName,
				dirname: dirname,
				id: depTree.nextModuleId++,
				requireMap: {},
				requires: [],
				reasons: [reason]
			};
			depTree.modulesById[contextModule.id] = contextModule;
			var contextModuleNameWithLoaders = dirname;
			var loaders = dirname.split(/!/g);
			dirname = loaders.pop();
			var prependLoaders = loaders.length === 0 ? "" : loaders.join("!") + "!";
			var extensions = (options.resolve && options.resolve.extensions) || [".web.js", ".js"];
			/** 当 dirname 全部被处理完成之后回调告知 contextModule.id */
			doDir(dirname, ".", function (err) {
				if (err) {
					callback(err);
					return;
				}
				callback(null, contextModule.id);
			});
			function doDir(dirname: string, moduleName: string, done: (err?: any) => void) {
				fs.readdir(dirname, function (err, list) {
					if (err) {
						done(err);
					} else {
						var count = list.length + 1;
						var errors = [];
						/** 直到这个目录下的所有文件都被处理过，才结束这个目录的回调 */
						function endOne(err?: any) {
							if (err) {
								errors.push(err);
							}
							count--;
							if (count == 0) {
								if (errors.length > 0)
									done(errors.join("\n"));
								else
									done();
							}
						}
						/** 递归将目录下的所有文件都添加到 contextModule 的requires commonJs 依赖中 */
						list.forEach(function (file) {
							var filename = path.join(dirname, file);
							fs.stat(filename, function (err, stat) {
								if (err) {
									errors.push(err);
									endOne();
								} else {
									if (stat.isDirectory()) {
										/** 不处理第三方模块目录 */
										if (file === "node_modules" || file === "web_modules")
											endOne();
										else
											doDir(filename, moduleName + "/" + file, endOne);
									} else {
										var match = false;
										if (loaders.length === 0)
											extensions.forEach(function (ext) {
												if (file.substr(file.length - ext.length) === ext)
													match = true;
												if (options.resolve && options.resolve.loaders)
													options.resolve.loaders.forEach(function (loader) {
														if (loader.test.test(filename))
															match = true;
													});
											});
										/** 如果发现这个文件不是资源文件也没有 loader 匹配 */
										if (!match && loaders.length === 0) {
											endOne();
											return;
										}
										var moduleReason = {
											type: "context",
											filename: reason.filename
										} as const;
										addModule(depTree, dirname, prependLoaders + filename, options, moduleReason, function (err, moduleId) {
											if (err) {
												depTree.warnings.push("A file in context was excluded because of error: " + err);
												endOne();
											} else {
												/** 目录下有效的模块文件被解析成模块添加到 contextModule 上 */
												contextModule.requires.push({ id: moduleId });
												contextModule.requireMap[moduleName + "/" + file] = moduleId;
												endOne();
											}
										});
									}
								}
							});
						});
						endOne();
					}
				});
			}
		}
	}
}
/** 按照模块字符串名排序，设置模块 realId */
function createRealIds(depTree: Partial<DepTree>, options: Partial<Options>) {
	var sortedModules: Partial<ContextModule | Module>[] = [];
	for (var id in depTree.modulesById) {
		if ("" + id === "0") continue;
		var module = depTree.modulesById[id];
		var usages = 1;
		module.reasons.forEach(function (reason) {
			usages += reason.count ? reason.count : 1;
		});
		module.usages = usages;
		sortedModules.push(module);
	}
	depTree.modulesById[0].realId = 0;
	sortedModules.sort(function (a, b) {
		if (a.chunks && b.chunks &&
			(a.chunks.indexOf(0) !== -1 || b.chunks.indexOf(0) !== -1)) {
			if (a.chunks.indexOf(0) === -1)
				return 1;
			if (b.chunks.indexOf(0) === -1)
				return -1;
		}
		var diff = b.usages - a.usages;
		if (diff !== 0) return diff;
		if (isModule(a) || isModule(b)) {
			if (!isModule(a)) return -1;
			if (!isModule(b)) return 1;
			if (a.filename === b.filename)
				return 0;
			return (a.filename < b.filename) ? -1 : 1;
		}
		if (a.dirname === b.dirname)
			return 0;
		return (a.dirname < b.dirname) ? -1 : 1;
	});
	sortedModules.forEach(function (module, idx) {
		module.realId = idx + 1;
	});
}
/** 添加分包的 chunk, 入口模块以及模块内所有异步入口。异步的 chunk 只是为了打包资源模块 */
function addChunk(depTree: Partial<DepTree>, chunkStartPoint: Partial<Module> | Partial<RequireEnsureDependencyBlock>, options: Partial<Options>) {
	var chunk: Partial<Chunk> = {
		id: depTree.nextChunkId++,
		modules: {},
		context: chunkStartPoint
	};
	depTree.chunks[chunk.id] = chunk;
	if (chunkStartPoint) {
		chunkStartPoint.chunkId = chunk.id;
		/** 从主模块/异步依赖块，递归附加模块以及拆包 */
		addModuleToChunk(depTree, chunkStartPoint, chunk.id, options);
	}
	return chunk;
}

function addModuleToChunk(depTree: Partial<DepTree>, context: Partial<Module>, chunkId: number, options: Partial<Options>) {
	context.chunks = context.chunks || [];
	if (context.chunks.indexOf(chunkId) === -1) {
		context.chunks.push(chunkId);
		if (context.id !== undefined)
			depTree.chunks[chunkId].modules[context.id] = "include";
		/** 给模块内所有 commonJs 依赖模块都附加到当前包中 */
		if (context.requires) {
			context.requires.forEach(function (requireItem) {
				if (requireItem.id)
					addModuleToChunk(depTree, depTree.modulesById[requireItem.id], chunkId, options);
			});
		}
		/** 给模块内的异步块开始，分拆包 chunk */
		if (context.asyncs) {
			context.asyncs.forEach(function (context) {
				var subChunk
				if (context.chunkId) {
					subChunk = depTree.chunks[context.chunkId];
				} else {
					/** 异步块只是打包，以当前的异步块作为入口创建独立的 chunk */
					subChunk = addChunk(depTree, context, options);
				}
				/** 记录这个资源 chunk 的父级 */
				subChunk.parents = subChunk.parents || [];
				subChunk.parents.push(chunkId);
			});
		}
	}
}

function removeParentsModules(depTree: Partial<DepTree>, chunk: Partial<Chunk>) {
	if (!chunk.parents) return;
	for (var moduleId in chunk.modules) {
		var inParent = true;
		var checkedParents = {};
		chunk.parents.forEach(function checkParent(parentId) {
			if (!inParent) return;
			if (checkedParents[parentId]) return;
			checkedParents[parentId] = true;
			if (!depTree.chunks[parentId].modules[moduleId]) {
				var parents = depTree.chunks[parentId].parents;
				if (parents && parents.length > 0)
					parents.forEach(checkParent);
				else
					inParent = false;
			}
		});
		if (inParent) {
			chunk.modules[moduleId] = "in-parent";
		}
	}
}

function removeChunkIfEmpty(depTree: Partial<DepTree>, chunk: Partial<Chunk>) {
	var hasModules = false;
	for (var moduleId in chunk.modules) {
		if (chunk.modules[moduleId] === "include") {
			hasModules = true;
			break;
		}
	}
	if (!hasModules) {
		chunk.context.chunkId = null;
		chunk.empty = true;
	}
}

function checkObsolete(depTree: Partial<DepTree>, chunk: Partial<Chunk>) {
	var modules = [];
	for (var moduleId in chunk.modules) {
		if (chunk.modules[moduleId] === "include") {
			modules.push(moduleId);
		}
	}
	if (modules.length === 0) return;
	modules.sort();
	var moduleString = modules.join(" ");
	if (depTree.chunkModules[moduleString]) {
		chunk.equals = depTree.chunkModules[moduleString];
		if (chunk.context)
			chunk.context.chunkId = chunk.equals;
	} else
		depTree.chunkModules[moduleString] = chunk.id;
}