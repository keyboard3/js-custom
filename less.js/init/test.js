const { parser } = require("./parser");
let res = parser.parse(`.hello {
  background:red;
}

.world {
  background:blue;
}
`);

console.log("css:\n", res.toCSS());