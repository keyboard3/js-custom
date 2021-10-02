# example.js

``` javascript
var a = require("a");

require.ensure(["b"], function(require) {
	// a named chuck
	var c = require("c");
}, "my own chuck");

require.ensure(["b"], function(require) {
	// another chuck with the same name
	var d = require("d");
}, "my own chuck");

require.ensure([], function(require) {
	// the same again
}, "my own chuck");

require.ensure(["b"], function(require) {
	// chuck without name
	var d = require("d");
});
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

	var a = require(/*! a */ 3);
	
	require.e/*nsure*/(1, function(require) {
		// a named chuck
		var c = require(/*! c */ 4);
	}, /*! my own chuck */ 0);
	
	require.e/*nsure*/(1, function(require) {
		// another chuck with the same name
		var d = require(/*! d */ 2);
	}, /*! my own chuck */ 0);
	
	require.e/*nsure*/(1, function(require) {
		// the same again
	}, /*! my own chuck */ 0);
	
	require.e/*nsure*/(2, function(require) {
		// chuck without name
		var d = require(/*! d */ 2);
	});

/***/ },

/***/ 3:
/*!****************!*\
  !*** ./~/a.js ***!
  \****************/
/***/ function(module, exports, require) {

	// module a

/***/ }
/******/ })

```

# js/1.output.js and js/my own chunk.js

``` javascript
webpackJsonp([1,2], {

/***/ 1:
/*!****************!*\
  !*** ./~/b.js ***!
  \****************/
/***/ function(module, exports, require) {

	// module b

/***/ },

/***/ 2:
/*!****************!*\
  !*** ./~/d.js ***!
  \****************/
/***/ function(module, exports, require) {

	// module d

/***/ },

/***/ 4:
/*!****************!*\
  !*** ./~/c.js ***!
  \****************/
/***/ function(module, exports, require) {

	// module c

/***/ }

})
```

# js/2.output.js

``` javascript
webpackJsonp([2], {

/***/ 1:
/*!****************!*\
  !*** ./~/b.js ***!
  \****************/
/***/ function(module, exports, require) {

	// module b

/***/ },

/***/ 2:
/*!****************!*\
  !*** ./~/d.js ***!
  \****************/
/***/ function(module, exports, require) {

	// module d

/***/ }

})
```

# Info

## Uncompressed

```
Hash: 27339560f7cbfdc7157accfa816a35f6
Time: 25ms
          Asset  Size  Chunks  Chunk Names 
      output.js  2706       0  main        
    1.output.js   450    1, 2  my own chuck
my own chuck.js   450    1, 2  my own chuck
    2.output.js   306       2              
chunk    {0} output.js (main) 431
    [0] ./example.js 420 [built] {0}
    [3] ./~/a.js 11 [built] {0}
        cjs require a [0] ./example.js 1:8-20
chunk    {1} 1.output.js, my own chuck.js (my own chuck) 33 {0} 
    [1] ./~/b.js 11 [built] {1} {2}
        require.ensure item b [0] ./example.js 3:0-6:18
        require.ensure item b [0] ./example.js 8:0-11:18
        require.ensure item b [0] ./example.js 17:0-20:2
    [2] ./~/d.js 11 [built] {1} {2}
        cjs require d [0] ./example.js 10:9-21
        cjs require d [0] ./example.js 19:9-21
    [4] ./~/c.js 11 [built] {1}
        cjs require c [0] ./example.js 5:9-21
chunk    {2} 2.output.js 22 {0} 
    [1] ./~/b.js 11 [built] {1} {2}
        require.ensure item b [0] ./example.js 3:0-6:18
        require.ensure item b [0] ./example.js 8:0-11:18
        require.ensure item b [0] ./example.js 17:0-20:2
    [2] ./~/d.js 11 [built] {1} {2}
        cjs require d [0] ./example.js 10:9-21
        cjs require d [0] ./example.js 19:9-21
```
