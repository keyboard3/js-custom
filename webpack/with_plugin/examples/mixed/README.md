# example.js

``` javascript
// CommonJs-style requires
var commonjs1 = require("./commonjs");
var amd1 = require("./amd");
var labeled1 = require("./labeled");

// AMD-style requires (with all webpack features)
require([
	"./commonjs", "./amd", "./labeled",
	"../require.context/templates/"+amd1+".js",
	Math.random() < 0.5 ? "./commonjs" : "./amd"],
	function(commonjs2, amd2, labeled2, template, randModule) {
		// Do something with it...
	}
);

// labeled modules requires
require: "./labeled";
// with the require label you are only allowed to import labeled modules
// the module needs static information about exports
```

# amd.js

``` javascript
// AMD Module Format
define(
	"app/amd", // anonym is also supported
	["./commonjs", "./labeled"],
	function(commonjs1, labeled1) {
		// but you can use CommonJs-style requires:
		var commonjs2 = require("./commonjs");
		var labeled2 = require("./labeled");
		// Do something...
		return 456;
	}
);
```

# commonjs.js

``` javascript
// CommonJs Module Format
module.exports = 123;

// but you can use amd style requires
require(
	["./amd", "./labeled"],
	function(amd1, labeled1) {
		var amd2 = require("./amd");
		var labeled2 = require("./labeled");
	}
);
```

# labeled.js

``` javascript
// Labeled Module Format
exports: var a = 123;

// but you can use amd and commonjs style requires
require(
	["./commonjs", "./amd"],
	function(amd1) {
		var commonjs2 = require("./commonjs");
		var amd2 = require("./amd");
	}
);
```


# js/output.js

``` javascript
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

```

# js/1.output.js

``` javascript
webpackJsonp([1], {

/***/ 4:
/*!*************************************************!*\
  !*** ../require.context/templates ^\.\/.*\.js$ ***!
  \*************************************************/
/***/ function(module, exports, require) {

	var map = {
		"./a.js": 5,
		"./b.js": 6,
		"./c.js": 7
	};
	function webpackContext(req) {
		return require(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	

/***/ },

/***/ 5:
/*!*****************************************!*\
  !*** ../require.context/templates/a.js ***!
  \*****************************************/
/***/ function(module, exports, require) {

	module.exports = function() {
		return "This text was generated by template A";
	}

/***/ },

/***/ 6:
/*!*****************************************!*\
  !*** ../require.context/templates/b.js ***!
  \*****************************************/
/***/ function(module, exports, require) {

	module.exports = function() {
		return "This text was generated by template B";
	}

/***/ },

/***/ 7:
/*!*****************************************!*\
  !*** ../require.context/templates/c.js ***!
  \*****************************************/
/***/ function(module, exports, require) {

	module.exports = function() {
		return "This text was generated by template C";
	}

/***/ }

})
```

# Info

## Uncompressed

```
Hash: b7406974070ee20ef3e7e82b8c051bec
Time: 27ms
      Asset  Size  Chunks  Chunk Names
  output.js  4786       0  main       
1.output.js  1565       1             
chunk    {0} output.js (main) 1346
    [0] ./example.js 595 [built] {0}
    [1] ./amd.js 298 [built] {0}
        amd require ./amd [2] ./commonjs.js 5:0-11:1
        cjs require ./amd [2] ./commonjs.js 8:13-29
        cjs require ./amd [0] ./example.js 3:11-27
        amd require ./amd [0] ./example.js 7:0-14:1
        amd require ./amd [0] ./example.js 7:0-14:1
        amd require ./amd [3] ./labeled.js 5:0-11:1
        cjs require ./amd [3] ./labeled.js 9:13-29
    [2] ./commonjs.js 224 [built] {0}
        cjs require ./commonjs [0] ./example.js 2:16-37
        amd require ./commonjs [0] ./example.js 7:0-14:1
        amd require ./commonjs [0] ./example.js 7:0-14:1
        amd require ./commonjs [1] ./amd.js 2:0-12:1
        cjs require ./commonjs [1] ./amd.js 7:18-39
        amd require ./commonjs [3] ./labeled.js 5:0-11:1
        cjs require ./commonjs [3] ./labeled.js 8:18-39
    [3] ./labeled.js 229 [built] {0}
        amd require ./labeled [2] ./commonjs.js 5:0-11:1
        cjs require ./labeled [2] ./commonjs.js 9:17-37
        amd require ./labeled [1] ./amd.js 2:0-12:1
        cjs require ./labeled [1] ./amd.js 8:17-37
        cjs require ./labeled [0] ./example.js 4:15-35
        labeled require ./labeled [0] ./example.js 17:0-21
        amd require ./labeled [0] ./example.js 7:0-14:1
chunk    {1} 1.output.js 433 {0} 
    [4] ../require.context/templates ^\.\/.*\.js$ 193 [built] {1}
        amd require context ../require.context/templates [0] ./example.js 7:0-14:1
    [5] ../require.context/templates/a.js 80 [built] {1}
        context element ./a.js [4] ../require.context/templates ^\.\/.*\.js$
    [6] ../require.context/templates/b.js 80 [built] {1}
        context element ./b.js [4] ../require.context/templates ^\.\/.*\.js$
    [7] ../require.context/templates/c.js 80 [built] {1}
        context element ./c.js [4] ../require.context/templates ^\.\/.*\.js$
```
