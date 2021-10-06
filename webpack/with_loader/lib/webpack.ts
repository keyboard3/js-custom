

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import buildDeps from "./buildDeps";
import writeChunk from "./writeChunk";
import path from "path";
import fs, { readFileSync } from "fs";

var templateAsync = readFileSync(path.join(__dirname, "templateAsync.js"));
var templateSingle = readFileSync(path.join(__dirname, "templateSingle.js"));
/*
	webpack(context, moduleName, options, callback);
	webpack(context, moduleName, callback);
	webpack(absoluteModulePath, options, callback);
	webpack(absoluteModulePath, callback);

	callback: function(err, source / stats)
		source if options.output is not set
		else stats json

	options:
	- outputJsonpFunction
		 JSONP function used to load chunks
	- scriptSrcPrefix
		 Path from where chunks are loaded
	- outputDirectory
		 write files to this directory (absolute path)
	- output
		 write first chunk to this file
	- outputPostfix
		 write chunks to files named chunkId plus outputPostfix
	- library
		 exports of input file are stored in this variable
	- minimize
		 minimize outputs with uglify-js
	- includeFilenames
		 add absolute filenames of input files as comments
	- resolve.alias (object)
		 replace a module. ex {"old-module": "new-module"}
	- resolve.extensions (object)
		 possible extensions for files
	- resolve.paths (array)
		 search paths
	- resolve.loaders (array)
		 extension to loader mappings
		 {test: /\.extension$/, loader: "myloader"}
		 loads files that matches the RegExp to the loader if no other loader set
	- parse.overwrites (object)
		 free module varables which are replaced with a module
		 ex. { "$": "jquery" }
*/

export default webpack;
type Callback = (err, sourceOrStats?: string | Partial<Stat>) => void
function webpack(context: string, moduleName: string, options: Partial<Options>, callback: Callback): void;
function webpack(context: string, moduleName: string, callback: Callback): void;
function webpack(absoluteModulePath: string, options: Partial<Options>, callback: Callback): void;
function webpack(absoluteModulePath: string, callback: Callback): void;
function webpack(context: string, moduleNameOrOptionsOrCallback: string | Partial<Options> | Callback, optionsOrCallback?: Partial<Options> | Callback, callback?: Callback): void {
	let options = optionsOrCallback as Partial<Options>;
	let moduleName = moduleNameOrOptionsOrCallback as string;
	if (typeof moduleNameOrOptionsOrCallback === "object") {
		callback = optionsOrCallback as Callback;
		options = moduleNameOrOptionsOrCallback as Partial<Options>;
		moduleName = "./" + path.basename(context);
		context = path.dirname(context);
	}
	if (typeof moduleNameOrOptionsOrCallback === "function") {
		callback = moduleNameOrOptionsOrCallback as Callback;
		options = {};
		moduleName = "./" + path.basename(context);
		context = path.dirname(context);
	}
	if (!callback) {
		callback = optionsOrCallback as Callback;
		options = {};
	}
	options.parse = options.parse || {};
	options.parse.overwrites = options.parse.overwrites || {};
	options.parse.overwrites.process = options.parse.overwrites.process || ("__webpack_process");
	options.parse.overwrites.module = options.parse.overwrites.module || ("__webpack_module+(module)");
	options.parse.overwrites.console = options.parse.overwrites.console || ("__webpack_console");
	options.parse.overwrites.global = options.parse.overwrites.global || ("__webpack_global");
	options.parse.overwrites.Buffer = options.parse.overwrites.Buffer || ("buffer+.Buffer");
	options.parse.overwrites["__dirname"] = options.parse.overwrites["__dirname"] || ("__webpack_dirname");
	options.parse.overwrites["__filename"] = options.parse.overwrites["__filename"] || ("__webpack_filename");
	options.resolve = options.resolve || {};
	options.resolve.paths = options.resolve.paths || [];
	options.resolve.paths.push(path.join(path.dirname(__dirname), "buildin"));
	options.resolve.paths.push(path.join(path.dirname(__dirname), "buildin", "web_modules"));
	options.resolve.paths.push(path.join(path.dirname(__dirname), "buildin", "node_modules"));
	options.resolve.paths.push(path.join(path.dirname(__dirname), "node_modules"));
	options.resolve.alias = options.resolve.alias || {};
	options.resolve.loaders = options.resolve.loaders || [];
	options.resolve.loaders.push({ test: /\.coffee$/, loader: "coffee" });
	options.resolve.loaders.push({ test: /\.json$/, loader: "json" });
	options.resolve.loaders.push({ test: /\.jade$/, loader: "jade" });
	options.resolve.loaders.push({ test: /\.css$/, loader: "style!css" });
	options.resolve.loaders.push({ test: /\.less$/, loader: "style!less" });
	buildDeps(context, moduleName, options, function (err, depTree) {
		if (err) {
			callback(err);
			return;
		}
		var buffer: any[] | string | Partial<Stat> = [];
		if (options.output) {
			if (!options.outputJsonpFunction)
				options.outputJsonpFunction = "webpackJsonp" + (options.library || "");
			options.scriptSrcPrefix = options.scriptSrcPrefix || "";
			if (!options.outputDirectory) {
				options.outputDirectory = path.dirname(options.output);
				options.output = path.basename(options.output);
			}
			if (!options.outputPostfix) {
				options.outputPostfix = "." + options.output;
			}
			var fileSizeMap = {};
			var fileModulesMap = {};
			var chunksCount = 0;
			for (var chunkId in depTree.chunks) {
				var chunk = depTree.chunks[chunkId];
				if (chunk.empty) continue;
				if (chunk.equals !== undefined) continue;
				chunksCount++;
				var filename = path.join(options.outputDirectory,
					chunk.id === 0 ? options.output : chunk.id + options.outputPostfix);
				buffer = [];
				if (chunk.id === 0) {
					if (options.library) {
						buffer.push("/******/var ");
						buffer.push(options.library);
						buffer.push("=\n");
					}
					if (Object.keys(depTree.chunks).length > 1) {
						buffer.push(templateAsync);
						buffer.push("/******/({a:");
						buffer.push(JSON.stringify(options.outputPostfix));
						buffer.push(",b:");
						buffer.push(JSON.stringify(options.outputJsonpFunction));
						buffer.push(",c:");
						buffer.push(JSON.stringify(options.scriptSrcPrefix));
						buffer.push(",\n");
					} else {
						buffer.push(templateSingle);
						buffer.push("/******/({\n");
					}
				} else {
					buffer.push("/******/");
					buffer.push(options.outputJsonpFunction);
					buffer.push("(");
					buffer.push(chunk.id);
					buffer.push(", {\n");
				}
				buffer.push(writeChunk(depTree, chunk, options));
				buffer.push("/******/})");
				buffer = buffer.join("");
				try {
					if (options.minimize) buffer = uglify(buffer, filename);
				} catch (e) {
					callback(e);
					return;
				}
				fs.writeFile(filename, (buffer as string), "utf-8", function (err) {
					if (err) throw err;
				});
				fileSizeMap[path.basename(filename)] = (buffer as string).length;
				var modulesArray = [];
				for (var moduleId in chunk.modules) {
					var module = depTree.modules[moduleId];
					if (chunk.modules[moduleId] === "include") {
						modulesArray.push({
							id: module.realId,
							size: module.size,
							filename: module.filename,
							dirname: module.dirname,
							reasons: module.reasons
						});
					}
				}
				modulesArray.sort(function (a, b) {
					return a.id - b.id;
				});
				fileModulesMap[path.basename(filename)] = modulesArray;
			}
			buffer = {};
			buffer.chunkCount = chunksCount;
			buffer.modulesCount = Object.keys(depTree.modules).length;
			var sum = 0;
			for (var chunkId in depTree.chunks) {
				for (var moduleId in depTree.chunks[chunkId].modules) {
					if (depTree.chunks[chunkId].modules[moduleId] === "include")
						sum++;
				}
			}
			buffer.modulesIncludingDuplicates = sum;
			buffer.modulesPerChunk = Math.round(sum / chunksCount * 10) / 10;
			sum = 0;
			for (var moduleId in depTree.chunks[0].modules) {
				if (depTree.chunks[0].modules[moduleId] === "include")
					sum++;
			}
			buffer.modulesFirstChunk = sum;
			buffer.fileSizes = fileSizeMap;
			buffer.warnings = depTree.warnings;
			buffer.errors = depTree.errors;
			buffer.fileModules = fileModulesMap;
			callback(null, buffer);
		} else {
			if (options.library) {
				buffer.push("/******/var ");
				buffer.push(options.library);
				buffer.push("=\n");
			}
			buffer.push(templateSingle);
			buffer.push("/******/({\n");
			buffer.push(writeChunk(depTree, options));
			buffer.push("/******/})");
			buffer = buffer.join("");
			try {
				if (options.minimize) buffer = uglify(buffer, "output");
				callback(null, buffer);
			} catch (e) {
				callback(e);
			}
		}
	});
}

function uglify(input: string, filename: string) {
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