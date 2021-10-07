import buildDeps from "./buildDeps"
import path from "path"
import writeChunk from "./writeChunk"
import fs, { readFileSync } from "fs"

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
	- libary
		 exports of input file are stored in this variable
	- minimize
		 minimize outputs with uglify-js
	- includeFilenames
		 add absolute filenames of input files as comments
*/
type Callback = (err, sourceOrStats?: string | Partial<Stat>) => void
function webpack(context: string, moduleName: string, options: Partial<Options>, callback: Callback): void;
function webpack(context: string, moduleName: string, callback: Callback): void;
function webpack(absoluteModulePath: string, options: Partial<Options>, callback: Callback): void;
function webpack(absoluteModulePath: string, callback: Callback): void;

function webpack(context: string, moduleNameOrOptionsOrCallback: string | Partial<Options> | Callback, optionsOrCallback?: Partial<Options> | Callback, callback?: Callback): void {
	let options: Partial<Options>, moduleName: string;
	if (typeof moduleNameOrOptionsOrCallback === "object") {
		callback = optionsOrCallback as Callback;
		options = moduleNameOrOptionsOrCallback as Partial<Options>;
		moduleName = "./" + path.basename(context);
		context = path.dirname(context);
	}
	if (typeof moduleName === "function") {
		callback = moduleName;
		options = {};
		moduleName = "./" + path.basename(context);
		context = path.dirname(context);
	}
	if (!callback) {
		callback = optionsOrCallback as Callback;
		options = {};
	}
	buildDeps(context, moduleName, options, function (err, depTree: DepTree) {
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
			var fileSizeMap: Stat["fileSizes"] = {};
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
						buffer.push(stringify(options.outputPostfix));
						buffer.push(",b:");
						buffer.push(stringify(options.outputJsonpFunction));
						buffer.push(",c:");
						buffer.push(stringify(options.scriptSrcPrefix));
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
				if (options.minimize) buffer = uglify(buffer, filename);
				fs.writeFile(filename, buffer as string, "utf-8", function (err) {
					if (err) throw err;
				});
				fileSizeMap[path.basename(filename)] = (buffer as string).length;
			}
			buffer = {};
			buffer.chunkCount = chunksCount;
			buffer.modulesCount = Object.keys(depTree.modulesById).length;
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
			callback(null, buffer as Partial<Stat>);
		} else {
			if (options.library) {
				buffer.push("/******/var ");
				buffer.push(options.library);
				buffer.push("=\n");
			}
			buffer.push(templateSingle);
			buffer.push("/******/({\n");
			buffer.push(writeChunk(depTree));
			buffer.push("/******/})");
			buffer = buffer.join("");
			if (options.minimize) buffer = uglify(buffer, "output");
			callback(null, buffer as string);
		}
	});
}

function uglify(input: string, filename: string) {
	var uglify = require("uglify-js");
	var source: any;
	try {
		source = uglify.parser.parse(input);
		source = uglify.uglify.ast_mangle(source);
		source = uglify.uglify.ast_squeeze(source);
		source = uglify.uglify.gen_code(source);
	} catch (e) {
		console.error(filename + " @ Line " + e.line + ", Col " + e.col + ", " + e.message);
		return input;
	}
	return source;
}

function stringify(str) {
	return '"' + str.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") + '"';
}

export default webpack;