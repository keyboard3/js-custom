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

cp.exec("node --nolazy -r ~/.nvm/versions/node/v16.0.0/lib/node_modules/ts-node/register/transpile-only ../../bin/webpack.ts --verbose --min "+extraArgs+" example.js js/output.js", function (error, stdout, stderr) {
	if(stderr)
		console.log(stderr);
	if (error !== null)
		console.log(error);
});
