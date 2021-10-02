/******/(function(modules) {
/******/	var installedModules = {};
/******/	function require(moduleId) {
/******/		if(typeof moduleId !== "number") throw new Error("Cannot find module '"+moduleId+"'");
/******/		if(installedModules[moduleId])
/******/			return installedModules[moduleId].exports;
/******/		var module = installedModules[moduleId] = {
/******/			exports: {}
/******/		};
/******/		modules[moduleId](module, module.exports, require);
/******/		return module.exports;
/******/	}
/******/	require.ensure = function(chunkId, callback) {
/******/		callback(require);
/******/	};
/******/	return require(0);
/******/})
/******/({
/******/0: function(module, exports, require) {

/******/ /* WEBPACK FREE VAR INJECTION */ (function(console) {
// Polyfill require for node.js usage of loaders
require = require(/* ../../require-polyfill */4)(require.valueOf());

// use our loader
console.dir(require(/* ./loader!./file */3));

// use buildin json loader
console.dir(require(/* ./test.json */2)); // default by extension
console.dir(require(/* json!./test.json */2)); // manual
/******/ /* WEBPACK FREE VAR INJECTION */ }(require(/* __webpack_console */1)))

/******/},
/******/
/******/1: function(module, exports, require) {

var console = window.console;
module.exports = console;
for(var name in {log:1, info:1, error:1, warn:1, dir:1, trace:1, assert:1})
	if(!console[name])
		console[name] = function() {};
if(!console.time)
console.time = function(label) {
	times[label] = Date.now();
};
if(!console.timeEnd)
console.timeEnd = function() {
	var duration = Date.now() - times[label];
	console.log('%s: %dms', label, duration);
};

/******/},
/******/
/******/2: function(module, exports, require) {

module.exports = {
	"foobar": 1234
}

/******/},
/******/
/******/3: function(module, exports, require) {

exports.answer = 42;
exports.foo = "bar";

/******/},
/******/
/******/4: function(module, exports, require) {

// No polyfill needed when compiled with webpack
module.exports = function(r){return r}

/******/},
/******/
/******/})