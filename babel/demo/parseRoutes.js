const parser = require("@babel/parser");
const core = require("@babel/core");
const traverse = require("@babel/traverse").default;
const vm = require("vm");
const fs = require("fs");

async function main() {
  const pathConfigs = await getPathConfig();
  const devRoutes = await getDevRoutes(pathConfigs);
  //得到所有引用页面的原始值，然后按需生成我们的开发路由
  const code = `export const devRouterList = [${devRoutes.map(item => `{ page:require("${item.page}"), path:"${item.path}"}`).join(",")}];`;
  console.log(code);
}
main();
/**
 * 可能存在变量计算，需要得到模块运行时的对象
 */
async function getPathConfig() {
  const code = await fs.readFileSync("./path.config.ts").toString();
  const output = core.transformSync(code, {
    plugins: ["@babel/plugin-transform-modules-commonjs"],
  });
  const context = vm.createContext({ exports: {} });
  const script = new vm.Script(output.code);
  script.runInContext(context);
  return context.exports;
}
/**
 * 通过语法树分析出导出的页面列表
 * 分析列表中的描述的引用值
 */
async function getDevRoutes(pathConfigs) {
  const routesCode = await fs.readFileSync("./routes.ts").toString();
  const routesAst = parser.parse(routesCode, { sourceType: "module", plugins: ["typescript"] });

  let routeNames;
  let importMap = {};
  traverse(routesAst, {
    ImportDeclaration(path) {
      let key, value;
      traverse(path.node, {
        StringLiteral(path) {
          value = path.node.value;
        },
        ImportDefaultSpecifier(path) {
          key = path.node.local.name;
        }
      }, path.scope, path.state, path.parentPath);
      if (value.startsWith("app\/pages"))
        importMap[key] = value;
    },
    ArrayExpression(path) {
      const isOk = path.findParent((path) => path.isExportNamedDeclaration());
      if (!isOk) return;
      routeNames = path.node.elements.map(item => {
        let obj = {};
        item.properties.forEach(({ key, value }) => {
          obj[key.name] = value.name;
        })
        return obj;
      })
    }
  });
  return routeNames.slice().map(item => {
    item.page = importMap[item.page];
    item.path = pathConfigs[item.path];
    return item;
  })
}