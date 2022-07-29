/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";
var fs = require('fs');
var profiler = require('v8-profiler-node8');
const webpack = require("../webpack/lib/webpack.js")

const extraArgs = "";

const targetArgs = ""//global.NO_TARGET_ARGS ? "" : " ./example.js -o dist/output.js ";
const displayReasons = ""// global.NO_REASONS ? "" : " --display-reasons --display-used-exports --display-provided-exports";
// const commonArgs = `--display-max-modules 99999 --display-origins --display-entrypoints --output-public-path "dist/" ${extraArgs} ${targetArgs}`;
// const commonArgs = `--output-public-path "dist/" ${extraArgs} ${targetArgs}`;
profiler.startProfiling('1', true);
webpack({ entry: "./example.js", output: { filename: "ouput.js", publicPath: "dist" }, mode: "development" }, (err, stat) => {
	var profile1 = profiler.stopProfiling();

	profile1.export()
		.pipe(fs.createWriteStream(`cpuprofile-${Date.now()}.cpuprofile`))
		.on('finish', () => profile1.delete());
		
	if (err) console.error(err.message);
	if (stat) {
		console.log(stat);
	}
});