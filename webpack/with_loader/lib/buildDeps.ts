/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import parse from "./parse"
import resolve, { context as ResolveContext } from "./resolve"
import fs from "fs";
import path from "path";;

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
	addModule(depTree, context, mainModule, options, { type: "main" }, function (err, id) {
		if (err) {
			callback(err);
			return;
		}
		mainModuleId = id;
		buildTree();
	});
	function buildTree() {
		addChunk(depTree, depTree.modulesById[mainModuleId], options);
		createRealIds(depTree, options);
		for (var chunkId in depTree.chunks) {
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

function execLoaders(request: string, loaders: string[], filenames: string[], contents: string[], options: Partial<Options>, callback: Callback) {
	if (loaders.length === 0)
		callback(null, contents[0]);
	else {
		var loaderFunctions = [];
		try {
			loaders.forEach(function (name) {
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

function addModule(depTree: Partial<DepTree>, context: string, moduleName: string, options: Partial<Options>, reason: Reason, callback: Callback) {
	resolve(context || path.dirname(moduleName), moduleName, options.resolve, resolved);
	function resolved(err, filename) {
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
					var deps;
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

					var requires = {}, directRequire = {};
					var contexts = [], directContexts = {};
					function add(r) {
						requires[r.name] = requires[r.name] || [];
						requires[r.name].push(r);
					}
					function addContext(m) {
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
					if (module.asyncs)
						module.asyncs.forEach(function addAsync(c) {
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
									requires[moduleName].forEach(function (requireItem) {
										requireItem.id = moduleId;
									});
								}
								endOne();
							});
						});
					if (contexts) {
						contexts.forEach(function (contextObj) {
							var context = contextObj.context;
							var module = contextObj.module;
							var reason = {
								type: directContexts[context.name] ? "context" : "async context",
								filename: filename
							} as const;
							addContextModule(depTree, path.dirname(filename), context.name, options, reason, function (err, contextModuleId) {
								if (err) {
									depTree.errors.push("Cannot find context '" + context.name + "'\n " + err +
										"\n @ " + filename + " (line " + context.line + ", column " + context.column + ")");
								} else {
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

function addContextModule(depTree: Partial<DepTree>, context: string, contextModuleName: string, options: Partial<Options>, reason: Reason, callback: Callback) {
	ResolveContext(context, contextModuleName, options.resolve, resolved);
	function resolved(err, dirname) {
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
			function doDir(dirname, moduleName, done) {
				fs.readdir(dirname, function (err, list) {
					if (err) {
						done(err);
					} else {
						var count = list.length + 1;
						var errors = [];
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
						list.forEach(function (file) {
							var filename = path.join(dirname, file);
							fs.stat(filename, function (err, stat) {
								if (err) {
									errors.push(err);
									endOne();
								} else {
									if (stat.isDirectory()) {
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
										if (!match && loaders.length === 0) {
											endOne();
											return;
										}
										var moduleReason = {
											type: "context",
											filename: reason.filename
										};
										addModule(depTree, dirname, prependLoaders + filename, options, reason, function (err, moduleId) {
											if (err) {
												depTree.warnings.push("A file in context was excluded because of error: " + err);
												endOne();
											} else {
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
			doDir(dirname, ".", function (err) {
				if (err) {
					callback(err);
					return;
				}
				callback(null, contextModule.id);
			});
		}
	}
}

function createRealIds(depTree: Partial<DepTree>, options: Partial<Options>) {
	var sortedModules = [];
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
		if (typeof a.filename === "string" || typeof b.filename === "string") {
			if (typeof a.filename !== "string")
				return -1;
			if (typeof b.filename !== "string")
				return 1;
			if (a.filename === b.filename)
				return 0;
			return (a.filename < b.filename) ? -1 : 1;
		}
		if (a.dirname === b.dirname)
			return 0;
		return (a.dirname < b.dirname) ? -1 : 1;
	});
	sortedModules.forEach(function (modu, idx) {
		modu.realId = idx + 1;
	});
}

function addChunk(depTree: Partial<DepTree>, chunkStartPoint: Partial<Module>, options: Partial<Options>) {
	var chunk = {
		id: depTree.nextChunkId++,
		modules: {},
		context: chunkStartPoint
	};
	depTree.chunks[chunk.id] = chunk;
	if (chunkStartPoint) {
		chunkStartPoint.chunkId = chunk.id;
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
		if (context.requires) {
			context.requires.forEach(function (requireItem) {
				if (requireItem.id)
					addModuleToChunk(depTree, depTree.modulesById[requireItem.id], chunkId, options);
			});
		}
		if (context.asyncs) {
			context.asyncs.forEach(function (context) {
				var subChunk
				if (context.chunkId) {
					subChunk = depTree.chunks[context.chunkId];
				} else {
					subChunk = addChunk(depTree, context, options);
				}
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