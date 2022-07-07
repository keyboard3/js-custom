const sass = require("./sass.js");
const res = sass.render(`
type: "solid"
size: 1
input
  :border { parseInt(size) + 1 }px {type} #000
`);
console.log("css:\n", res);