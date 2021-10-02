
# example.js

``` javascript
var inc = require('./increment').increment;
var a = 1;
inc(a); // 2
```

# increment.js

``` javascript
var add = require('./math').add;
exports.increment = function(val) {
    return add(val, 1);
};
```

# math.js

``` javascript
exports.add = function() {
    var sum = 0, i = 0, args = arguments, l = args.length;
    while (i < l) {
        sum += args[i++];
    }
    return sum;
};
```

# js/output.js

``` javascript
/******/ (function webpackBootstrap(modules) {
/******/ 	var installedModules = {};
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
/******/ 		callback.call(null, require);
/******/ 	};
/******/ 	require.modules = modules;
/******/ 	require.cache = installedModules;
/******/ 	return require(0);
/******/ })({
/******/ c: "",

/***/ 0:
/*!********************!*\
  !*** ./example.js ***!
  \********************/
/***/ function(module, exports, require) {

	var inc = require(/*! ./increment */ 1).increment;
	var a = 1;
	inc(a); // 2

/***/ },

/***/ 1:
/*!**********************!*\
  !*** ./increment.js ***!
  \**********************/
/***/ function(module, exports, require) {

	var add = require(/*! ./math */ 2).add;
	exports.increment = function(val) {
	    return add(val, 1);
	};

/***/ },

/***/ 2:
/*!*****************!*\
  !*** ./math.js ***!
  \*****************/
/***/ function(module, exports, require) {

	exports.add = function() {
	    var sum = 0, i = 0, args = arguments, l = args.length;
	    while (i < l) {
	        sum += args[i++];
	    }
	    return sum;
	};

/***/ }
/******/ })

```

# Info

## Uncompressed

```
Hash: 994d4faf67fcae9300dabf091df49b37
Time: 22ms
    Asset  Size  Chunks  Chunk Names
output.js  1559       0  main       
chunk    {0} output.js (main) 318
    [0] ./example.js 67 [built] {0}
    [1] ./increment.js 95 [built] {0}
        cjs require ./increment [0] ./example.js 1:10-32
    [2] ./math.js 156 [built] {0}
        cjs require ./math [1] ./increment.js 1:10-27
```

## Minimized (uglify-js, no zip)

```
Hash: 994d4faf67fcae9300dabf091df49b37
Time: 39ms
    Asset  Size  Chunks  Chunk Names
output.js   460       0  main       
chunk    {0} output.js (main) 318
    [0] ./example.js 67 [built] {0}
    [1] ./increment.js 95 [built] {0}
        cjs require ./increment [0] ./example.js 1:10-32
    [2] ./math.js 156 [built] {0}
        cjs require ./math [1] ./increment.js 1:10-27
```