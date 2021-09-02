console.log("A-All：", Aall);
console.log("A：", A);
console.log("defaultVar：", defaultVar);
console.log("B-All：", Ball);
console.log("ns：", ns);
import * as Aall from "./resource/depenceA.mjs";
import * as Ball from "./resource/depenceB.mjs";
import defaultVar, { A } from "./resource/depenceA.mjs";
import { ns } from "./resource/depenceB.mjs";

import("./resource/depenceA.mjs").then(module => {
    //module会作为一个对象
    console.log("import()：", module)
    console.log("import()-default", module.default)
})
setTimeout(() => { console.log("延时A", A) }, 1);