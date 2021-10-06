/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import writeSource from "./writeSource";

export default writeChunk;
function writeChunk(depTree: DepTree, options: Partial<Options>): void;
function writeChunk(depTree: DepTree, chunk: Partial<Chunk>, options: Partial<Options>): void;
function writeChunk(depTree: DepTree, chunkOrOptions: Partial<Chunk | Options>, options?: Partial<Options>) {
	let chunk = chunkOrOptions as Partial<Chunk>;
	if (!options) {
		options = chunkOrOptions as Partial<Options>;
		chunk = null;
	}
	var buffer = [];
	var modules = chunk ? chunk.modules : depTree.modules;
	var includedModules = [];
	for (var moduleId in modules) {
		if (chunk) {
			if (chunk.modules[moduleId] !== "include")
				continue;
		}
		var module = depTree.modules[moduleId];
		includedModules.push(module);
	}
	includedModules.sort(function (a, b) { return a.realId - b.realId; });
	includedModules.forEach(function (module) {
		buffer.push("/******/");
		buffer.push(module.realId);
		buffer.push(": function(module, exports, require) {\n\n");
		if (options.includeFilenames) {
			buffer.push("/*** ");
			buffer.push(module.filename);
			buffer.push(" ***/\n\n");
		}
		buffer.push(writeSource(module, options, function (id) { return depTree.modules[id].realId }));
		buffer.push("\n\n/******/},\n/******/\n");
	});
	return buffer.join("");
}