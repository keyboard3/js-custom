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
console.log(require(/* ./cup1.coffee */3));
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

/******/ /* WEBPACK FREE VAR INJECTION */ (function(console) {
(function() {
  console.log("yeah coffee-script");

  module.exports = 42;

}).call(this);

/******/ /* WEBPACK FREE VAR INJECTION */ }(require(/* __webpack_console */1)))

/******/},
/******/
/******/3: function(module, exports, require) {

(function() {
  module.exports = {
    cool: "stuff",
    answer: 42,
    external: require(/* ./cup2.coffee */2),
    again: require(/* ./cup2.coffee */2)
  };

}).call(this);


/******/},
/******/
/******/})