/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var RequestShortener = require("./RequestShortener");

function Stats(compilation) {
	this.compilation = compilation;
}
module.exports = Stats;

Stats.prototype.hasWarnings = function() {
	return this.compilation.warnings.length > 0;
};

Stats.prototype.hasErrors = function() {
	return this.compilation.errors.length > 0;
};

Stats.prototype.toJson = function toJson(options, forToString) {
	if(!options) options = {};
	function d(v, d) { return v === undefined ? d : v }
	var compilation = this.compilation;
	var requestShortener = new RequestShortener(d(options.context, process.cwd()));
	var showHash = d(options.hash, true);
	var showTimings = d(options.timings, true);
	var showAssets = d(options.assets, true);
	var showChunks = d(options.chunks, true);
	var showChunkModules = d(options.chunkModules, !!forToString);
	var showModules = d(options.modules, !forToString);
	var showCachedModules = d(options.cached, true);
	var showReasons = d(options.reasons, !forToString);
	var showChildren = d(options.children, true);
	var showSource = d(options.source, !forToString);
	var sortModules = d(options.modulesSort, "id");
	var sortChunks = d(options.chunksSort, "id");
	var sortAssets = d(options.assetsSort, "");

	function sortByField(field) {
		if(!field) return function() { return 0; }
		if(field[0] == "!") {
			field = field.substr(1);
			return function(a, b) {
				if(a[field] == b[field]) return 0;
				return (a[field] < b[field]) ? 1 : -1;
			}
		}
		return function(a, b) {
			if(a[field] == b[field]) return 0;
			return (a[field] < b[field]) ? -1 : 1;
		}
	}
	function formatError(e) {
		var text = "";
		if(e.module && e.module.readableIdentifier && typeof e.module.readableIdentifier === "function") {
			text += e.module.readableIdentifier(requestShortener) + "\n";
		} else if(e.file) {
			text += e.file + "\n";
		}
		text += e.message;
		if(e.dependencies && e.origin) {
			text += "\n @ " + e.origin.readableIdentifier(requestShortener);
			e.dependencies.forEach(function(dep) {
				if(!dep.loc) return;
				if(!dep.loc.start) return;
				if(!dep.loc.end) return;
				text += " " + dep.loc.start.line + ":" + dep.loc.start.column + "-" + 
					(dep.loc.start.line != dep.loc.end.line ? dep.loc.end.line + ":" : "") + dep.loc.end.column;
			});
		}
		return text;
	}
	var obj = {
		errors: compilation.errors.map(formatError),
		warnings: compilation.warnings.map(formatError)
	};

	if(showHash) obj.hash = compilation.hash;
	if(showTimings && this.startTime && this.endTime) {
		obj.time = this.endTime - this.startTime;
	}
	if(showAssets) {
		var assetsByFile = {};
		obj.assets = Object.keys(compilation.assets).map(function(asset) {
			var obj = {
				name: asset,
				size: compilation.assets[asset].size(),
				chunks: [],
				chunkNames: []
			};
			assetsByFile[asset] = obj;
			return obj;
		});
		compilation.chunks.forEach(function(chunk) {
			chunk.files.forEach(function(asset) {
				if(assetsByFile[asset]) {
					chunk.ids.forEach(function(id) {
						assetsByFile[asset].chunks.push(id);
					});
					if(chunk.name)
						assetsByFile[asset].chunkNames.push(chunk.name);
				}
			});
		});
		obj.assets.sort(sortByField(sortAssets));
	}
	function fnModule(module) {
		var obj = {
			id: module.id,
			identifier: module.identifier(),
			name: module.readableIdentifier(requestShortener),
			size: module.size(),
			cacheable: !!module.cacheable,
			built: !!module.built,
			chunks: module.chunks.map(function(chunk) {
				return chunk.id;
			})
		};
		if(showReasons) {
			obj.reasons = module.reasons.filter(function(reason) {
				return reason.dependency && reason.dependency.module && reason.module;
			}).map(function(reason) {
				var obj = {
					moduleId: reason.module.id,
					module: reason.module.readableIdentifier(requestShortener),
					type: reason.dependency.type,
					userRequest: reason.dependency.userRequest
				}
				var dep = reason.dependency;
				if(dep.loc) obj.loc = dep.loc.start.line + ":" + dep.loc.start.column + "-" +
					(dep.loc.start.line != dep.loc.end.line ? dep.loc.end.line + ":" : "") + dep.loc.end.column
				return obj;
			});
		}
		if(showSource && module._source) {
			obj.source = module._source.source();
		}
		return obj;
	}
	if(showChunks) {
		obj.chunks = compilation.chunks.map(function(chunk) {
			var obj = {
				id: chunk.id,
				size: chunk.modules.reduce(function(size, module) { return size + module.size(); }, 0),
				names: chunk.name ? [chunk.name] : [],
				files: chunk.files.slice(),
				parents: chunk.parents.map(function(c) {
					return c.id;
				})
			};
			if(showChunkModules) {
				obj.modules = chunk.modules.map(fnModule);
				if(!showCachedModules) {
					obj.modules = obj.modules.filter(function(m) {
						return m.built;
					});
				}
				obj.modules.sort(sortByField(sortModules));
			}
			return obj;
		});
		obj.chunks.sort(sortByField(sortChunks));
	}
	if(showModules) {
		obj.modules = compilation.modules.map(fnModule);
		if(!showCachedModules) {
			obj.modules = obj.modules.filter(function(m) {
				return m.built;
			});
		}
		obj.modules.sort(sortByField(sortModules));
	}
	if(showChildren) {
		obj.children = compilation.children.map(function(child) {
			var obj = new Stats(child).toJson(options, forToString);
			obj.name = child.name;
			return obj;
		});
	}
	return obj;
};

Stats.prototype.toString = function toString(options) {
	function d(v, d) { return v === undefined ? d : v }
	var useColors = d(options.colors, false);

	var obj = this.toJson(options, true);

	return Stats.jsonToString(obj, useColors);
};

Stats.jsonToString = function jsonToString(obj, useColors) {
	var buf = [];
	function normal(str) {
		buf.push(str);
	}
	function bold(str) {
		if(useColors) buf.push("\033[1m");
		buf.push(str);
		if(useColors) buf.push("\033[22m");
	}
	function yellow(str) {
		if(useColors) buf.push("\033[1m\033[33m");
		buf.push(str);
		if(useColors) buf.push("\033[39m\033[22m");
	}
	function red(str) {
		if(useColors) buf.push("\033[1m\033[31m");
		buf.push(str);
		if(useColors) buf.push("\033[39m\033[22m");
	}
	function green(str) {
		if(useColors) buf.push("\033[1m\033[32m");
		buf.push(str);
		if(useColors) buf.push("\033[39m\033[22m");
	}
	function cyan(str) {
		if(useColors) buf.push("\033[1m\033[36m");
		buf.push(str);
		if(useColors) buf.push("\033[39m\033[22m");
	}
	function magenta(str) {
		if(useColors) buf.push("\033[1m\033[35m");
		buf.push(str);
		if(useColors) buf.push("\033[39m\033[22m");
	}
	function newline() {
		buf.push("\n");
	}
	function table(array, formats, align, splitter) {
		var rows = array.length;
		var cols = array[0].length;
		var colSizes = new Array(cols);
		for(var col = 0; col < cols; col++)
			colSizes[col] = 3;
		for(var row = 0; row < rows; row++) {
			for(var col = 0; col < cols; col++) {
				var value = array[row][col] + "";
				if(value.length > colSizes[col]) {
					colSizes[col] = value.length;
				}
			}
		}
		for(var row = 0; row < rows; row++) {
			for(var col = 0; col < cols; col++) {
				var format = row == 0 ? bold : formats[col];
				var value = array[row][col] + "";
				var l = value.length;
				if(align[col] == "l")
					format(value);
				for(; l < colSizes[col]; l++)
					normal(" ");
				if(align[col] == "r")
					format(value);
				if(col + 1 < cols)
					normal(splitter || "  ");
			}
			newline();
		}
	}

	if(obj.hash) {
		normal("Hash: ");
		bold(obj.hash);
		newline();
	}
	if(obj.time) {
		normal("Time: ");
		bold(obj.time);
		normal("ms");
		newline();
	}
	if(obj.assets) {
		var t = [["Asset", "Size", "Chunks", "Chunk Names"]]
		obj.assets.forEach(function(asset) {
			t.push([
				asset.name,
				asset.size,
				asset.chunks.join(", "),
				asset.chunkNames.join(", ")
			])
		});
		table(t, [green, normal, bold, normal], "rrrl");
	}
	if(obj.chunks) {
		obj.chunks.forEach(function(chunk) {
			normal("chunk ");
			if(chunk.id < 1000) normal(" ");
			if(chunk.id < 100) normal(" ");
			if(chunk.id < 10) normal(" ");
			normal("{");
			yellow(chunk.id);
			normal("} ");
			green(chunk.files.join(", "));
			if(chunk.names && chunk.names.length > 0) {
				normal(" (");
				normal(chunk.names.join(", "));
				normal(")");
			}
			normal(" ");
			normal(chunk.size);
			chunk.parents.forEach(function(id) {
				normal(" ");
				normal("{");
				yellow(id);
				normal("} ");
			});
			newline();
			if(chunk.modules) {
				chunk.modules.forEach(function(module) {
					normal(" ");
					if(module.id < 1000) normal(" ");
					if(module.id < 100) normal(" ");
					if(module.id < 10) normal(" ");
					normal("[");
					normal(module.id);
					normal("] ");
					bold(module.name);
					normal(" ");
					normal(module.size);
					if(!module.cacheable) {
						red(" [not cacheable]");
					}
					if(module.built) {
						green(" [built]");
					}
					if(module.chunks) {
						module.chunks.forEach(function(chunk) {
							normal(" {");
							yellow(chunk);
							normal("}");
						});
					}
					newline();
					if(module.reasons) {
						module.reasons.forEach(function(reason) {
							normal("        ");
							normal(reason.type);
							normal(" ");
							cyan(reason.userRequest);
							normal(" [");
							normal(reason.moduleId);
							normal("] ");
							magenta(reason.module);
							if(reason.loc) {
								normal(" ");
								normal(reason.loc)
							}
							newline();
						});
					}
				});
			}
		});
	}
	if(obj.modules) {
		obj.modules.forEach(function(module) {
			if(module.id < 1000) normal(" ");
			if(module.id < 100) normal(" ");
			if(module.id < 10) normal(" ");
			normal("[");
			normal(module.id);
			normal("] ");
			(module.size >= 0 ? bold : normal)(module.name);
			normal(" ");
			normal(module.size);
			if(!module.cacheable) {
				red(" [not cacheable]");
			}
			if(module.built) {
				green(" [built]");
			}
			if(module.chunks) {
				module.chunks.forEach(function(chunk) {
					normal(" {");
					yellow(chunk);
					normal("}");
				});
			}
			newline();
			if(module.reasons) {
				module.reasons.forEach(function(reason) {
					normal("       ");
					normal(reason.type);
					normal(" ");
					cyan(reason.userRequest);
					normal(" [");
					normal(reason.moduleId);
					normal("] ");
					magenta(reason.module);
					if(reason.loc) {
						normal(" ");
						normal(reason.loc)
					}
					newline();
				});
			}
		});
	}
	if(obj.warnings) {
		obj.warnings.forEach(function(warning) {
			newline();
			yellow("WARNING in " + warning);
			newline();
		});
	}
	if(obj.errors) {
		obj.errors.forEach(function(error) {
			newline();
			red("ERROR in " + error);
			newline();
		});
	}
	if(obj.children) {
		obj.children.forEach(function(child) {
			normal("Child ");
			bold(child.name);
			normal(":");
			newline();
			buf.push("    ");
			buf.push(Stats.jsonToString(child, useColors).replace(/\n/g, "\n    "));
		});
	}

	while(buf[buf.length-1] === "\n") buf.pop();
	return buf.join("");
};