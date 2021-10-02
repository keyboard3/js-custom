
# example.js

``` javascript
console.log(require("a-component"));
console.log(require("b-component"));
console.log(require("c-component"));

```

# webpack.config.js

``` javascript
var ComponentPlugin = require("component-webpack-plugin");
module.exports = {
	module: {
		loaders: [
			{ test: /\.png$/, loader: "url-loader?limit=10000&minetype=image/png" }
		]
	},
	plugins: [
		new ComponentPlugin()
	]
}
```

# component.json

``` javascript
{
	"name": "component-webpack-example",
	"repo": "webpack/webpack",
	"version": "0.0.1",
	"dependencies": {
		"webpack/a-component": "*",
		"webpack/c-component": "*"
	},
	"local": [
		"b-component"
	],
	"paths": [
		"my-component"
	],
	"scripts": ["example.js"],
	"license": "MIT"
}
```

# component/webpack-a-component/component.json

``` javascript
{
	"name": "a-component",
	"repo": "webpack/a-component",
	"version": "0.0.1",
	"scripts": ["index.js"],
	"styles": ["style.css"],
	"images": ["image.png"],
	"license": "MIT"
}
```

# component/webpack-a-component/style.css

``` css
.a-component {
	display: inline;
	background: url(image.png) repeat;
}
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

	console.log(require(/*! a-component */ 1));
	console.log(require(/*! b-component */ 5));
	console.log(require(/*! c-component */ 3));
	

/***/ },

/***/ 1:
/*!***************************************************!*\
  !*** ./component/webpack-a-component (component) ***!
  \***************************************************/
/***/ function(module, exports, require) {

	require(/*! (webpack)/~/style-loader!(webpack)/~/component-webpack-plugin/~/css-loader!./style.css */ 9);
	module.exports = require(/*! ./index.js */ 2);

/***/ },

/***/ 2:
/*!************************************************!*\
  !*** ./component/webpack-a-component/index.js ***!
  \************************************************/
/***/ function(module, exports, require) {

	module.exports = "A";

/***/ },

/***/ 3:
/*!***************************************************!*\
  !*** ./component/webpack-c-component (component) ***!
  \***************************************************/
/***/ function(module, exports, require) {

	module.exports = require(/*! ./main.js */ 4);

/***/ },

/***/ 4:
/*!***********************************************!*\
  !*** ./component/webpack-c-component/main.js ***!
  \***********************************************/
/***/ function(module, exports, require) {

	module.exports = "C" + require(/*! a-component */ 1);

/***/ },

/***/ 5:
/*!**********************************************!*\
  !*** ./my-component/b-component (component) ***!
  \**********************************************/
/***/ function(module, exports, require) {

	module.exports = require(/*! ./main.js */ 6);

/***/ },

/***/ 6:
/*!******************************************!*\
  !*** ./my-component/b-component/main.js ***!
  \******************************************/
/***/ function(module, exports, require) {

	module.exports = "B";

/***/ },

/***/ 7:
/*!***************************************************************************************************!*\
  !*** (webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css ***!
  \***************************************************************************************************/
/***/ function(module, exports, require) {

	module.exports =
		".a-component {\n\tdisplay: inline;\n\tbackground: url("+require((function webpackMissingModule() { throw new Error("Cannot find module \"./image.png\""); }()))+") repeat;\n}";

/***/ },

/***/ 8:
/*!********************************************!*\
  !*** (webpack)/~/style-loader/addStyle.js ***!
  \********************************************/
/***/ function(module, exports, require) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function(cssCode) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = cssCode;
		} else {
			styleElement.appendChild(document.createTextNode(cssCode));
		}
		document.getElementsByTagName("head")[0].appendChild(styleElement);
	}

/***/ },

/***/ 9:
/*!****************************************************************************************************************************!*\
  !*** (webpack)/~/style-loader!(webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css ***!
  \****************************************************************************************************************************/
/***/ function(module, exports, require) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	require(/*! (webpack)/~/style-loader/addStyle.js */ 8)
		// The css code:
		(require(/*! !(webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css */ 7))

/***/ }
/******/ })

```

# Info

## Uncompressed

```
Hash: 9bb920dcdf523e4a18b7e5f09aaaadf2
Time: 42ms
    Asset  Size  Chunks  Chunk Names
output.js  4717       0  main       
chunk    {0} output.js (main) 1570
    [0] ./example.js 111 [built] {0}
    [1] ./component/webpack-a-component (component) 280 [built] {0}
        cjs require a-component [0] ./example.js 1:12-34
        cjs require a-component [4] ./component/webpack-c-component/main.js 1:23-45
    [2] ./component/webpack-a-component/index.js 21 [built] {0}
        cjs require ./index.js [1] ./component/webpack-a-component (component) 2:17-38
    [3] ./component/webpack-c-component (component) 38 [built] {0}
        cjs require c-component [0] ./example.js 3:12-34
    [4] ./component/webpack-c-component/main.js 46 [built] {0}
        cjs require ./main.js [3] ./component/webpack-c-component (component) 1:17-37
    [5] ./my-component/b-component (component) 38 [built] {0}
        cjs require b-component [0] ./example.js 2:12-34
    [6] ./my-component/b-component/main.js 21 [built] {0}
        cjs require ./main.js [5] ./my-component/b-component (component) 1:17-37
    [7] (webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 113 [built] {0}
        cjs require !!(webpack)/node_modules/component-webpack-plugin/node_modules/css-loader/index.js!./component/webpack-a-component/style.css [9] (webpack)/~/style-loader!(webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 4:2-254
    [8] (webpack)/~/style-loader/addStyle.js 458 [built] {0}
        cjs require !(webpack)/node_modules/style-loader/addStyle.js [9] (webpack)/~/style-loader!(webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 2:0-104
    [9] (webpack)/~/style-loader!(webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 444 [built] {0}
        cjs require !(webpack)/node_modules/style-loader/index.js!(webpack)/node_modules/component-webpack-plugin/node_modules/css-loader/index.js!./style.css [1] ./component/webpack-a-component (component) 1:0-239

ERROR in (webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css
Module not found: Error: Cannot resolve module url-loader in ./component/webpack-a-component
 @ (webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 2:58-80
```

## Minimized (uglify-js, no zip)

```
Hash: 27414093263fee9bcc5616befdeaa69e
Time: 73ms
    Asset  Size  Chunks  Chunk Names
output.js   919       0  main       
chunk    {0} output.js (main) 1549
    [0] ./example.js 111 [built] {0}
    [1] ./component/webpack-a-component (component) 280 [built] {0}
        cjs require a-component [0] ./example.js 1:12-34
        cjs require a-component [4] ./component/webpack-c-component/main.js 1:23-45
    [2] ./component/webpack-a-component/index.js 21 [built] {0}
        cjs require ./index.js [1] ./component/webpack-a-component (component) 2:17-38
    [3] ./component/webpack-c-component (component) 38 [built] {0}
        cjs require c-component [0] ./example.js 3:12-34
    [4] ./component/webpack-c-component/main.js 46 [built] {0}
        cjs require ./main.js [3] ./component/webpack-c-component (component) 1:17-37
    [5] ./my-component/b-component (component) 38 [built] {0}
        cjs require b-component [0] ./example.js 2:12-34
    [6] ./my-component/b-component/main.js 21 [built] {0}
        cjs require ./main.js [5] ./my-component/b-component (component) 1:17-37
    [7] (webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 92 [built] {0}
        cjs require !!(webpack)/node_modules/component-webpack-plugin/node_modules/css-loader/index.js!./component/webpack-a-component/style.css [9] (webpack)/~/style-loader!(webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 4:2-254
    [8] (webpack)/~/style-loader/addStyle.js 458 [built] {0}
        cjs require !(webpack)/node_modules/style-loader/addStyle.js [9] (webpack)/~/style-loader!(webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 2:0-104
    [9] (webpack)/~/style-loader!(webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 444 [built] {0}
        cjs require !(webpack)/node_modules/style-loader/index.js!(webpack)/node_modules/component-webpack-plugin/node_modules/css-loader/index.js!./style.css [1] ./component/webpack-a-component (component) 1:0-239

ERROR in (webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css
Module not found: Error: Cannot resolve module url-loader in ./component/webpack-a-component
 @ (webpack)/~/component-webpack-plugin/~/css-loader!./component/webpack-a-component/style.css 2:47-69
```