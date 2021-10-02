/******/ (function webpackBootstrap(modules) {
/******/ 	var installedModules = {};
/******/ 	var installedChunks = {0:0};
/******/ 	function require(moduleId) {
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		modules[moduleId].call(null, module, module.exports, require);
/******/ 		module.loaded = true;
/******/ 		return module.exports;
/******/ 	}
/******/ 	require.e = function requireEnsure(chunkId, callback) {
/******/ 		if(installedChunks[chunkId] === 0) return callback.call(null, require);
/******/ 		if(installedChunks[chunkId] !== undefined)
/******/ 			installedChunks[chunkId].push(callback);
/******/ 		else {
/******/ 			installedChunks[chunkId] = [callback];
/******/ 			var head = document.getElementsByTagName('head')[0];
/******/ 			var script = document.createElement('script');
/******/ 			script.type = 'text/javascript';
/******/ 			script.charset = 'utf-8';
/******/ 			script.src = modules.c+""+chunkId+".output.js";
/******/ 			head.appendChild(script);
/******/ 		}
/******/ 	};
/******/ 	require.modules = modules;
/******/ 	require.cache = installedModules;
/******/ 	window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules) {
/******/ 		var moduleId, chunkId, callbacks = [];
/******/ 		while(chunkIds.length) {
/******/ 			chunkId = chunkIds.shift();
/******/ 			if(installedChunks[chunkId]) callbacks.push.apply(callbacks, installedChunks[chunkId]);
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules)
/******/ 			modules[moduleId] = moreModules[moduleId];
/******/ 		while(callbacks.length)
/******/ 			callbacks.shift().call(null, require);
/******/ 	};
/******/ 	return require(0);
/******/ })({
/******/ c: "",

/***/ 0:
/*!********************!*\
  !*** ./example.js ***!
  \********************/
/***/ function(module, exports, require) {

	// CommonJs-style requires
	var commonjs1 = require(/*! ./commonjs */ 2);
	var amd1 = require(/*! ./amd */ 1);
	var labeled1 = require(/*! ./labeled */ 3);
	
	// AMD-style requires (with all webpack features)
	require.e/* require */(1, function(require) { var __WEBPACK_AMD_REQUIRE_ARRAY__ = [
		(require(/*! ./commonjs */ 2)), (require(/*! ./amd */ 1)), (require(/*! ./labeled */ 3)),
		require(/*! ../require.context/templates */ 4)("./"+amd1+".js"),
		Math.random() < 0.5 ? (require(/*! ./commonjs */ 2)) : (require(/*! ./amd */ 1))]; (function(commonjs2, amd2, labeled2, template, randModule) {
			// Do something with it...
		}.apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));});
	
	// labeled modules requires
	var __WEBPACK_LABELED_MODULE__3 = require(/*! ./labeled */ 3), a = __WEBPACK_LABELED_MODULE__3.a;
	// with the require label you are only allowed to import labeled modules
	// the module needs static information about exports

/***/ },

/***/ 1:
/*!****************!*\
  !*** ./amd.js ***!
  \****************/
/***/ function(module, exports, require) {

	// AMD Module Format
	{var __WEBPACK_AMD_DEFINE_ARRAY__ = [(require(/*! ./commonjs */ 2)), (require(/*! ./labeled */ 3))]; var __WEBPACK_AMD_DEFINE_RESULT__ = (function(commonjs1, labeled1) {
			// but you can use CommonJs-style requires:
			var commonjs2 = require(/*! ./commonjs */ 2);
			var labeled2 = require(/*! ./labeled */ 3);
			// Do something...
			return 456;
		}.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)); if(__WEBPACK_AMD_DEFINE_RESULT__ !== undefined) module.exports = __WEBPACK_AMD_DEFINE_RESULT__;};

/***/ },

/***/ 2:
/*!*********************!*\
  !*** ./commonjs.js ***!
  \*********************/
/***/ function(module, exports, require) {

	// CommonJs Module Format
	module.exports = 123;
	
	// but you can use amd style requires
	require.e/* require */(0/* empty */, function(require) { var __WEBPACK_AMD_REQUIRE_ARRAY__ = [(require(/*! ./amd */ 1)), (require(/*! ./labeled */ 3))]; (function(amd1, labeled1) {
			var amd2 = require(/*! ./amd */ 1);
			var labeled2 = require(/*! ./labeled */ 3);
		}.apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));});

/***/ },

/***/ 3:
/*!********************!*\
  !*** ./labeled.js ***!
  \********************/
/***/ function(module, exports, require) {

	// Labeled Module Format
	exports: var a = exports["a"] = 123;
	
	// but you can use amd and commonjs style requires
	require.e/* require */(0/* empty */, function(require) { var __WEBPACK_AMD_REQUIRE_ARRAY__ = [(require(/*! ./commonjs */ 2)), (require(/*! ./amd */ 1))]; (function(amd1) {
			var commonjs2 = require(/*! ./commonjs */ 2);
			var amd2 = require(/*! ./amd */ 1);
		}.apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));});

/***/ }
/******/ })
