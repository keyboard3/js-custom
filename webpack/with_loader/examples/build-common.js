/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
require = require("../require-polyfill")(require.valueOf());

var cp = require('child_process');
var tc = require("./template-common");

var argv = process.argv;
argv.shift();
argv.shift();
var extraArgs = argv.join(" ");

console.log("node ../../bin/webpack.js --verbose --min "+extraArgs+" example.js js/output.js");

cp.exec("node ../../bin/webpack.js --verbose --min "+extraArgs+" example.js js/output.js", function (error, stdout, stderr) {
	if(stderr)
		console.log(stderr);
	if (error !== null)
		console.log(error);
});
