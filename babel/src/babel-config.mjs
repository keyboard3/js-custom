import * as babel from "@babel/core"
import * as fs from "fs"
import * as path from "path"
import { execSync } from 'child_process'
function Annotation(templateData) {
    var s = templateData.raw[0];
    console.log("".padStart(4, "=") + s + "".padEnd(4, "="));
}
/**
 * 来源：
 * https://babeljs.io/docs/en/configuration#using-the-api-babelcore
 * https://babeljs.io/docs/en/config-files
 */
const configJson = {
    "presets": [
        [
            "@babel/env",
            {
                /* 只会加载我们目标浏览器的 js 引擎不支持标准语法转化的插件 */
                "targets": {
                    "edge": "17",
                    "firefox": "60",
                    "chrome": "67",
                    "safari": "11.1"
                },
                /**
                 * useBuiltIns 选项，babel 会检查所有代码找到目标环境中缺少的运行时对象及方法，仅包含所需的 plyfill
                 * false: 表示不载入 polyfill 模块
                 * entry: 代码入口一次性载入 polyfill 模块
                 * usage: 表示按需载入 polyfill 的模块。在模块文件的顶层载入它
                 */
                "useBuiltIns": "usage"
            }
        ]
    ]
};
const configName = "babel.config";
const srcDir = "babel/src", outDir = "babel/build";
const compileFileName = "promise.js";

/** 通过 cli 来处理 */
Annotation`通过 cli 来处理`
execSync(`npx babel ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_cli_" + compileFileName)} --plugins=@babel/plugin-transform-arrow-functions`);

/** 通过 babel.config.json 来配置 babel */
Annotation`通过 babel.config.json 来配置 babel`
const babelJsonFilePath = path.resolve(__dirname, `../build/${configName}.json`);
fs.writeFileSync(babelJsonFilePath, JSON.stringify(configJson), { encoding: "utf8" });
execSync(`BABEL_SHOW_CONFIG_FOR=${path.resolve(srcDir, compileFileName)} npx babel --config-file ${babelJsonFilePath} ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_json_" + compileFileName)}`);

/** 通过 babel.config.js 来配置 babel */
Annotation`通过 babel.config.js 来配置 babel`
const babelJsFilePath = path.resolve(__dirname, `../build/${configName}.js`);
let babelJsContent = `
module.exports=(api)=>{
    api.cache(true);
    return ${JSON.stringify(configJson)}
}
`;
babelJsContent = `
module.exports=${JSON.stringify(configJson)}
`;
fs.writeFileSync(babelJsFilePath, babelJsContent, { encoding: "utf8" });
await execSync(`npx babel --config-file ${babelJsFilePath} ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_js_" + compileFileName)}`);

/** 通过 .babelrc.json 来配置 babel */
Annotation`通过 .babelrc.json 来配置 babel`
const babelrcFilePath = path.resolve(__dirname, `../build/.babelrc.json`);
fs.writeFileSync(babelrcFilePath, JSON.stringify(configJson), { encoding: "utf8" });
execSync(`npx babel --config-file ${babelrcFilePath} ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_rc_" + compileFileName)}`);

/** 通过 babel-core api 来设置 babel */
Annotation`通过 babel-core api 来设置 babel`
const srcFileContent = fs.readFileSync(path.resolve(__dirname, "../../", srcDir, compileFileName));
const apiRes = babel.transformSync(srcFileContent, configJson);
fs.writeFileSync(path.resolve(__dirname, "../../", outDir, "from_api_" + compileFileName), apiRes.code, { encoding: "utf8" });

/** 通过 package.json 来配置 babel */
Annotation`通过 package.json 来配置 babel`
const packageFilepath = path.resolve(__dirname, `../../package.json`);
const oldPckageJsonContent = fs.readFileSync(packageFilepath);
const packageJson = require(packageFilepath);
packageJson.babel = configJson;
fs.writeFileSync(packageFilepath, JSON.stringify(packageJson), { encoding: "utf8" })
execSync(`npx babel ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_package_" + compileFileName)}`);
fs.writeFileSync(packageFilepath, oldPckageJsonContent, { encoding: "utf8" });
/**
  entry js file:
  import "core-js/stable";
  import "regenerator-runtime/runtime";
  因为 @babel/polyfill 已经废弃，所以我们在入口文件需要模拟完整的 es2015+ 的环境。
  通过引入 core-js polyfill ECMAScript 的特性
  通过引入 regenerator-runtime 来转义生成器函数
 */