import * as babel from "@babel/core"
import * as fs from "fs"
import * as path from "path"
import { execSync } from 'child_process'
const __dirname = path.resolve() + "/babel/src";
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
                "useBuiltIns": "usage",
                "corejs": "2.6.5"
            }
        ]
    ]
};
const srcDir = "babel/src", outDir = "babel/build";
const compileFileName = "promise.js";

/** 基础工具-改变pacakge.json */
const packageFilepath = path.resolve(__dirname, `../../package.json`);
const oldPckageJsonContent = fs.readFileSync(packageFilepath);
const packageJson = JSON.parse(oldPckageJsonContent);
async function changePackageJson(babelJson) {
    packageJson.babel = babelJson;
    fs.writeFileSync(packageFilepath, JSON.stringify(packageJson), { encoding: "utf8" })
}
function rescoverPackageJson() {
    fs.writeFileSync(packageFilepath, oldPckageJsonContent, { encoding: "utf8" });
}
/** 基础工具-创建配置文件 babel.config.json,babe.config.js,.babelrc.json等 */
async function writeConfig(filename, config) {
    const configFilePath = path.resolve(__dirname, `../build/${filename}`);
    fs.writeFileSync(configFilePath, typeof config == "string" ? config : JSON.stringify(config), { encoding: "utf8" });
    return configFilePath;
}

/** 通过 cli 来处理 */
Annotation`通过 cli 来处理`
execSync(`npx babel ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_cli_" + compileFileName)} --plugins=@babel/plugin-transform-arrow-functions`);

/** 通过 babel.config.json 来配置 babel */
Annotation`通过 babel.config.json 来配置 babel`
var configFilpath = await writeConfig("babel.config.json", configJson);
execSync(`npx babel --config-file ${configFilpath} ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_json_" + compileFileName)}`);

/** 通过 babel.config.js 来配置 babel */
Annotation`通过 babel.config.js 来配置 babel`
let babelJsContent = `
module.exports=(api)=>{
    api.cache(true);
    return ${JSON.stringify(configJson)}
}
`;
babelJsContent = `
module.exports=${JSON.stringify(configJson)}
`;
var configFilpath = await writeConfig("babel.config.js", babelJsContent);
await execSync(`npx babel --config-file ${configFilpath} ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_js_" + compileFileName)}`);

/** 通过 .babelrc.json 来配置 babel */
Annotation`通过 .babelrc.json 来配置 babel`
var configFilpath = await writeConfig(".babelrc.json", configJson);
execSync(`npx babel --config-file ${configFilpath} ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_rc_" + compileFileName)}`);

/** 通过 babel-core api 来设置 babel */
Annotation`通过 babel-core api 来设置 babel`
const srcFileContent = fs.readFileSync(path.resolve(__dirname, "../../", srcDir, compileFileName));
const apiRes = babel.transformSync(srcFileContent, configJson);
fs.writeFileSync(path.resolve(__dirname, "../../", outDir, "from_api_" + compileFileName), apiRes.code, { encoding: "utf8" });

/** 通过 package.json 来配置 babel */
Annotation`通过 package.json 来配置 babel`
await changePackageJson(configJson);
try {
    var res = execSync(`npx babel ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_package_" + compileFileName)}`);
    console.log(res.toString());
} catch (err) {
    console.error(err);
}
rescoverPackageJson();

/**
 * BABEL_SHOW_CONFIG_FOR 打印出指定路径文件有效的配置，越上面优先级越低，优先级高的会覆盖优先级低的
 * 还会打印出被覆盖的项，.overrides[index]
 * Babel 的配置合并比较简单。选项将在存在时覆盖现有选项，并且它们的值不是未定义的。但是，有一些特殊情况：
 *      对于assumptions，parserOpts 和 generatorOpts，对象被合并，而不是被替换。
 *      对于 plugins 和 presets ，它们会根据 plugins/presets/object/function 的entry自身组合的名字作为身份标识进行替换。
 * 
 * package.json的"@babel/env"项覆盖了babel.config.json。即使 cli 中指定了 config-file(但通过--presets是最高的),优先级还是以 package.json 高
 * 最后结果是以 babelJson2 的配置为主
 **/
Annotation`多个配置项合并`
const babelJson2 = {
    "presets": [
        [
            "@babel/env",
            {
                "targets": {
                    "chrome": "92",
                },
                "useBuiltIns": "usage",
                "corejs": "2.6.5"
            }
        ]
    ]
}
var [_, configFilpath] = await Promise.all([changePackageJson(babelJson2), writeConfig("babel.config.json", configJson)])
try {
    var res = execSync(`BABEL_SHOW_CONFIG_FOR=${path.resolve(srcDir, compileFileName)} npx babel --config-file ${configFilpath} ${path.resolve(srcDir, compileFileName)} -o ${path.resolve(outDir, "from_merge_" + compileFileName)}`);
    console.log(res.toString());
} catch (err) {
    console.error(err);
}
rescoverPackageJson();
/**
  entry js file:
  import "core-js/stable";
  import "regenerator-runtime/runtime";
  因为 @babel/polyfill 已经废弃，所以我们在入口文件需要模拟完整的 es2015+ 的环境。
  通过引入 core-js polyfill ECMAScript 的特性
  通过引入 regenerator-runtime 来转义生成器函数
 */