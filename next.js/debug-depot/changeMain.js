const fs = require("fs");
const package = require("./node_modules/next/package.json");
package.main = package.main.replace(".js", "");
fs.writeFileSync("./node_modules/next/package.json", JSON.stringify(package), { encoding: "utf-8" });