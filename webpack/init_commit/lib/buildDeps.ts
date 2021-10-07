import parse from "./parse"
import resolve from "./resolve"
import fs from "fs";
import path from "path";

/**
 * context: current directory
 * mainModule: the entrance module
 * options:
 * callback: function(err, result)
 */
type Callback = (err: any, result?: DepTree) => void;
export default function buildDeps(context: string, mainModule: string, optionsOrCallback: Partial<Options> | Callback, callback?: Callback) {
	var options = optionsOrCallback as Partial<Options>;
	if (!callback) {
		callback = optionsOrCallback as Callback;
		options = {};
	}
	if (!options) options = {} as Partial<Options>;

	var depTree: DepTree = {
		modules: {},
		modulesById: {},
		chunks: {},
		nextModuleId: 0,
		nextChunkId: 0,
		chunkModules: {} // used by checkObsolete
	}
	var mainModuleId: number;
	addModule(depTree, context, mainModule, options, function (err, id) {
		if (err) {
			callback(err);
			return;
		}
		mainModuleId = id;
		buildTree();
	});
	function buildTree() {
		addChunk(depTree, depTree.modulesById[mainModuleId], options);
		for (var chunkId in depTree.chunks) {
			removeParentsModules(depTree, depTree.chunks[chunkId]);
			removeChunkIfEmpty(depTree, depTree.chunks[chunkId]);
			checkObsolete(depTree, depTree.chunks[chunkId]);
		}
		callback(null, depTree);
	}
}

function addModule(depTree: DepTree, context: string, moduleName: string, options: Partial<Options>, callback) {
	resolve(context, moduleName, options.resolve, function (err, filename: string) {
		if (err) {
			callback(err);
			return;
		}
		if (depTree.modules[filename]) {
			callback(null, depTree.modules[filename].id);
		} else {
			var module: Partial<Module> = depTree.modules[filename] = {
				id: depTree.nextModuleId++,
				filename: filename
			};
			depTree.modulesById[module.id] = module;
			fs.readFile(filename, "utf-8", function (err, source) {
				if (err) {
					callback(err);
					return;
				}
				var deps = parse(source);
				module.requires = deps.requires || [];
				module.asyncs = deps.asyncs || [];
				module.source = source;

				var requires: { [key: NormalDependency["name"]]: NormalDependency[] } = {};
				function add(r: NormalDependency) {
					requires[r.name] = requires[r.name] || [];
					requires[r.name].push(r);
				}
				if (module.requires)
					module.requires.forEach(add);
				if (module.asyncs)
					module.asyncs.forEach(function addContext(c: AsyncDependency) {
						if (c.requires)
							c.requires.forEach(add);
						if (c.asyncs)
							c.asyncs.forEach(addContext);
					});
				var requiresNames = Object.keys(requires);
				var count = requiresNames.length;
				var errors = [];
				if (requiresNames.length)
					requiresNames.forEach(function (moduleName) {
						addModule(depTree, path.dirname(filename), moduleName, options, function (err, moduleId) {
							if (err) {
								errors.push(err + "\n @ " + filename + " (line " + requires[moduleName][0].line + ", column " + requires[moduleName][0].column + ")");
							} else {
								requires[moduleName].forEach(function (requireItem) {
									requireItem.id = moduleId;
								});
							}
							count--;
							if (count === 0) {
								if (errors.length) {
									callback(errors.join("\n"));
								} else {
									end();
								}
							}
						});
					});
				else end()
				function end() {
					callback(null, module.id);
				}
			});
		}
	});
}

function addChunk(depTree: DepTree, chunkStartPoint: Partial<Module>, options: Partial<Options>) {
	var chunk: Partial<Chunk> = {
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

function addModuleToChunk(depTree: DepTree, context: Partial<Module>, chunkId: number, options: Partial<Options>) {
	context.chunks = context.chunks || [];
	if (context.chunks.indexOf(chunkId) === -1) {
		context.chunks.push(chunkId);
		if (context.id !== undefined)
			depTree.chunks[chunkId].modules[context.id] = "include";
		if (context.requires) {
			context.requires.forEach(function (requireItem) {
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

function removeParentsModules(depTree: DepTree, chunk: Partial<Chunk>) {
	if (!chunk.parents) return;
	for (var moduleId in chunk.modules) {
		var inParent = false;
		chunk.parents.forEach(function (parentId) {
			if (depTree.chunks[parentId].modules[moduleId])
				inParent = true;
		});
		if (inParent) {
			chunk.modules[moduleId] = "in-parent";
		}
	}
}

function removeChunkIfEmpty(depTree: DepTree, chunk: Partial<Chunk>) {
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

function checkObsolete(depTree: DepTree, chunk: Partial<Chunk>) {
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