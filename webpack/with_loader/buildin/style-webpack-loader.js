/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
module.exports = function (content) {
	this.cacheable && this.cacheable();
	this.clearDependencies && this.clearDependencies();
	// if(this.loaderType != "loader") throw new Error("style-loader do not work as pre or post loader");

	return `
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = ${content.replace("module.exports =", "")};
	} else {
		styleElement.appendChild(document.createTextNode(cssCode));
	}
	document.getElementsByTagName("head")[0].appendChild(styleElement);
	`
}
module.exports.seperable = true;