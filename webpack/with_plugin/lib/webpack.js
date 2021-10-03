/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var Compiler = require("./Compiler");
var NodeEnvironmentPlugin = require("./node/NodeEnvironmentPlugin");
var WebpackOptionsApply = require("./WebpackOptionsApply");
var WebpackOptionsDefaulter = require("./WebpackOptionsDefaulter");

function webpack(options, callback) {
	// 设置 options 的默认值，如 output.path 的默认值为 process.cwd(), target 的默认值为 web
	new WebpackOptionsDefaulter().process(options);

	var compiler = new Compiler();
	compiler.options = options;
	/**
	 * 处理参数，例如为不同的 target 注册插件
	 * after-plugins: 所有非解析模块的 plugin 注册完成
	 * after-resolvers: 解析模块的插件注册完成。 NodeSourcePlugin 监听该消息
	 */
	compiler.options = new WebpackOptionsApply().process(options, compiler);
	// 注册 NodeEnvironmentPlugin 插件，触发 before-run 时执行
	new NodeEnvironmentPlugin(options.separate).apply(compiler);
	if(callback) {
		if(options.watch) {
			return compiler.watch(options.watchDelay, callback);
		} else {
			compiler.run(callback);
		}
	}
	return compiler;
}
module.exports = webpack;

webpack.WebpackOptionsDefaulter = WebpackOptionsDefaulter;
webpack.WebpackOptionsApply = WebpackOptionsApply;
webpack.Compiler = Compiler;
webpack.NodeEnvironmentPlugin = NodeEnvironmentPlugin;
