var path = require("path");
var fs = require("fs");

// http://nodejs.org/docs/v0.4.8/api/all.html#all_Together...

/**
 * context: absolute filename of current file
 * identifier: module to find
 * options:
 *   paths: array of lookup paths
 * callback: function(err, absoluteFilename)
 */
module.exports = function resolve(context, identifier, options, callback) {
	if (!callback) {
		callback = options;
		options = {};
	}
	if (!options)
		options = {};
	if (!options.extensions)
		options.extensions = [".web.js", ".js"];
	if (!options.paths)
		options.paths = [];
	function finalResult(err, absoluteFilename) {
		if (err) {
			callback("Module \"" + identifier + "\" not found in context \"" + context + "\"");
			return;
		}
		callback(null, absoluteFilename);
	}
	var identArray = identifier.split("/");
	var contextArray = split(context);
	if (identArray[0] === "." || identArray[0] === ".." || identArray[0] === "") {
		var pathname = join(contextArray, identArray);
		loadAsFile(pathname, options, function (err, absoluteFilename) {
			if (err) {
				loadAsDirectory(pathname, options, finalResult);
				return;
			}
			callback(null, absoluteFilename);
		});
	} else {
		loadNodeModules(contextArray, identArray, options, finalResult);
	}
}

function split(a) {
	return a.split(/[\/\\]/g);
}

function join(a, b) {
	var c = [];
	a.forEach(function (x) { c.push(x) });
	b.forEach(function (x) { c.push(x) });
	return path.join.apply(path, c);
}

function loadAsFile(filename, options, callback) {
	filename = "/" + filename;
	var pos = -1, result;
	function tryCb(err, stats) {
		if (err || !stats || !stats.isFile()) {
			pos++;
			if (pos >= options.extensions.length) {
				callback(err);
				return;
			}
			fs.stat(result = filename + options.extensions[pos], tryCb);
			return;
		}
		callback(null, result);
	}
	fs.stat(result = filename, tryCb);
}

function loadAsDirectory(dirname, options, callback) {
	var packageJsonFile = join(split(dirname), ["package.json"]);
	fs.stat(packageJsonFile, function (err, stats) {
		var mainModule = "index";
		if (!err && stats.isFile()) {
			fs.readFile(packageJsonFile, "utf-8", function (err, content) {
				content = JSON.parse(content);
				if (content.main)
					mainModule = content.main;
				loadAsFile(join(split(dirname), [mainModule]), options, callback);
			});
		} else
			loadAsFile(join(split(dirname), [mainModule]), options, callback);
	});
}

function loadNodeModules(context, identifier, options, callback) {
	nodeModulesPaths(context, options, function (err, dirs) {
		function tryDir(dir) {
			var pathname = join(split(dir), identifier);
			loadAsFile(pathname, options, function (err, absoluteFilename) {
				if (err) {
					loadAsDirectory(pathname, options, function (err, absoluteFilename) {
						if (err) {
							if (dirs.length === 0) {
								callback(true);
								return;
							}
							tryDir(dirs.shift());
							return;
						}
						callback(null, absoluteFilename);
					});
					return;
				}
				callback(null, absoluteFilename);
			});
		}
		tryDir(dirs.shift());
	});
}

function nodeModulesPaths(context, options, callback) {
	var parts = context;
	var rootNodeModules = parts.indexOf("node_modules");
	var rootWebModules = parts.indexOf("web_modules");
	var root = 0;
	if (rootWebModules != -1 && rootNodeModules != -1)
		root = Math.min(rootWebModules, rootNodeModules) - 1;
	else if (rootWebModules != -1 || rootNodeModules != -1)
		root = Math.max(rootWebModules, rootNodeModules) - 1;
	var dirs = [];
	options.paths.forEach(function (path) { dirs.push(path) });
	for (var i = parts.length; i > root; i--) {
		if (parts[i - 1] === "node_modules" || parts[i - 1] === "web_modules")
			continue;
		var part = parts.slice(0, i);
		dirs.push(join(part, ["web_modules"]));
		dirs.push(join(part, ["node_modules"]));
	}
	callback(null, dirs);
}