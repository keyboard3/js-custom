/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import path from "path"
import fs from "fs"

// http://nodejs.org/docs/v0.4.8/api/all.html#all_Together...

type Callback = (err: any, absoluteFilenameWithLoaders?: string) => void;
/**
 * context: absolute filename of current file
 * identifier: module to find
 * options:
 *   paths: array of lookup paths
 * callback: function(err, absoluteFilename)
 */
/** 解析的是普通的依赖模块 */
export default function (context: string, fullModuleName: string, options: Options["resolve"], callback: Callback) {
	return doResolve(context, fullModuleName, options, "normal", callback);
}
/** context 解析的是模块的目录 */
export function context(context: string, dirname: string, options: Options["resolve"], callback: Callback) {
	return doResolve(context, dirname, options, "context", callback);
}

function doResolve(context: string, fullModuleName: string, optionsOrCallback: Options["resolve"] | Callback, type: Exclude<ResolveType, "loader">, callback?: Callback) {
	let options = optionsOrCallback as Options["resolve"];
	if (!callback) {
		callback = optionsOrCallback as Callback;
		options = {};
	}
	if (!options)
		options = {};
	if (!options.extensions)
		options.extensions = ["", ".webpack.js", ".web.js", ".js"];
	if (!options.loaders)
		options.loaders = [];
	if (!options.postfixes)
		options.postfixes = ["", "-webpack", "-web"];
	if (!options.loaderExtensions)
		options.loaderExtensions = [".webpack-web-loader.js", ".webpack-loader.js", ".web-loader.js", ".loader.js", "", ".js"];
	if (!options.loaderPostfixes)
		options.loaderPostfixes = ["-webpack-web-loader", "-webpack-loader", "-web-loader", "-loader", ""];
	if (!options.paths)
		options.paths = [];
	if (!options.alias)
		options.alias = {};
	var moduleNames = fullModuleName?.replace(/^!|!$/g, "").replace(/!!/g, "!").split(/!/g) || [];
	if (fullModuleName?.indexOf("!") === -1) {
		var resource = moduleNames.pop();
		for (var i = 0; i < options.loaders.length; i++) {
			var line = options.loaders[i];
			if (line.test.test(resource)) {
				Array.prototype.push.apply(moduleNames, line.loader.split(/!/g));
				break;
			}
		}
		moduleNames.push(resource);
	}
	var errors = [];
	var count = moduleNames.length;
	/** 将所有相对的模块都替换成绝对有效的文件路径 */
	function endOne() {
		count--;
		if (count === 0) {
			if (errors.length > 0) {
				callback(errors.join("\n"));
				return;
			}
			callback(null, moduleNames.join("!"));
		}
	}
	moduleNames.forEach(function (ident, index) {
		resolve(context, ident, options, index === moduleNames.length - 1 ? type : "loader", function (err, filename) {
			if (err) {
				errors.push(err);
			} else {
				if (!filename) {
					throw new Error(JSON.stringify({ identifiers: moduleNames, from: ident, to: filename }));
				}

				moduleNames[index] = filename;
			}
			endOne()
		});
	});
}

/** 将模块的相对名通过可能的模块后缀和文件后缀并在搜索路径中检索到有效的路径 */
function resolve(context: string, moduleName: string, options: Options["resolve"], type: ResolveType, callback: Callback) {
	function finalResult(err: any, absoluteFilename?: string) {
		if (err) {
			callback("Module \"" + moduleName + "\" not found in context \"" +
				context + "\"\n  " + err);
			return;
		}
		callback(null, absoluteFilename);
	}
	var identArray = split(moduleName);
	var contextArray = split(context);
	/** 不断通过 alias 替换模块名，直到 alias 没有或者已经替换过 */
	while (options.alias[identArray[0]]) {
		var old = identArray[0];
		identArray[0] = options.alias[identArray[0]];
		identArray = split(path.join.apply(path, identArray));
		if (identArray[0] === old)
			break;
	}
	/** 找项目中的相对路径模块只需要一次就能确定最终结果 */
	if (identArray[0] === "." || identArray[0] === ".." || identArray[0] === "" || identArray[0].match(/^[A-Z]:$/i)) {
		/** 将模块名和目录结合成绝对路径 */
		var pathname = identArray[0][0] === "." ? join(contextArray, identArray) : path.join.apply(path, identArray);
		if (type === "context") {
			fs.stat(pathname, function (err, stat) {
				if (err) {
					finalResult(err);
					return;
				}
				if (!stat.isDirectory()) {
					finalResult("Context \"" + moduleName + "\" in not a directory");
					return;
				}
				callback(null, pathname);
			});
		} else {
			loadAsFile(pathname, options, type, function (err, absoluteFilename) {
				if (err) {
					loadAsDirectory(pathname, options, type, finalResult);
					return;
				}
				callback(null, absoluteFilename);
			});
		}
	} else {
		loadNodeModules(contextArray, identArray, options, type, finalResult);
	}
}

function split(a) {
	return a.split(/[\/\\]/g);
}

function join(a, b) {
	var c = [];
	a.forEach(function (x) { c.push(x) });
	b.forEach(function (x) { c.push(x) });
	if (c[0] === "")
		c[0] = "/";
	return path.join.apply(path, c);
}
/** 确定了文件的绝对路径之后，不断通过尝试可能的文件后缀名 */
function loadAsFile(filename: string, options: Options["resolve"], type: Exclude<ResolveType, "context">, callback: Callback) {
	var pos = -1, result = "NOT SET";
	var extensions = type === "loader" ? options.loaderExtensions : options.extensions;
	function tryCb(err: any, stats?: any) {
		if (err || !stats || !stats.isFile()) {
			pos++;
			if (pos >= extensions.length) {
				callback(err || "Isn't a file");
				return;
			}
			fs.stat(result = "/" + filename + extensions[pos], tryCb);
			return;
		}
		if (!result) throw new Error("no result");
		callback(null, result);
	}
	tryCb(true);
}
/** 通过目录自动确定该入口模块，则尝试 module package.json 目录 或者 index 作为入口模块 */
function loadAsDirectory(dirname: string, options: Options["resolve"], type: Exclude<ResolveType, "context">, callback: Callback) {
	var packageJsonFile = join(split(dirname), ["package.json"]);
	fs.stat(packageJsonFile, function (err, stats) {
		var mainModule = "index";
		if (!err && stats.isFile()) {
			/** 从 package.json 中找到入口的模块 */
			fs.readFile(packageJsonFile, "utf-8", function (err, content: string & PackageJson) {
				if (err) {
					callback(err);
					return;
				}
				content = JSON.parse(content);
				if (content.webpackLoader && type === "loader")
					mainModule = content.webpackLoader;
				else if (content.webpack)
					mainModule = content.webpack;
				else if (content.browserify)
					mainModule = content.browserify;
				else if (content.main)
					mainModule = content.main;
				loadAsFile(join(split(dirname), [mainModule]), options, type, callback);
			});
		} else
			/** 默认认为模块目录下的 index 是入口模块  */
			loadAsFile(join(split(dirname), [mainModule]), options, type, callback);
	});
}
/** 加载 node 的模块 */
function loadNodeModules(contextArray: string[], moduleNames: string[], options: Options["resolve"], type: ResolveType, callback: Callback) {
	var moduleName = moduleNames.shift();
	var postfixes = type === "loader" ? options.loaderPostfixes : options.postfixes;
	nodeModulesPaths(contextArray, options, function (err, paths) {
		//准备所有可能的模块所在的目录
		var dirs = [];
		paths.forEach(function (path) {
			postfixes.forEach(function (postfix) {
				dirs.push(join(split(path), [moduleName + postfix]));
			});
		});
		function tryDir(dir: string) {
			var pathname = join(split(dir), moduleNames);
			if (type === "context") {
				fs.stat(pathname, function (err, stat) {
					if (err || !stat.isDirectory()) {
						if (dirs.length === 0) {
							callback("no directory in any path of paths");
							return;
						}
						tryDir(dirs.shift());
						return;
					}
					callback(null, pathname);
				});
			} else {
				loadAsFile(pathname, options, type, function (err, absoluteFilename) {
					if (err) {
						loadAsDirectory(pathname, options, type, function (err, absoluteFilename) {
							if (err) {
								if (dirs.length === 0) {
									callback("no module in any path of paths");
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
		}
		tryDir(dirs.shift());
	});
}
/** 给上下文的每个可能的路径结尾都加上 web_modules,node_modules */
function nodeModulesPaths(contextArray: string[], options: Options["resolve"], callback: (err: any, paths: string[]) => void) {
	var parts = contextArray;
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