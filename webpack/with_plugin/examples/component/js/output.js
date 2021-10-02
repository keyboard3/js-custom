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
