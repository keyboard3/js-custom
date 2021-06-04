function compile(template) {
  const evalExpr = /<%=(.+?)%>/g;
  const expr = /<%([\s\S]+?)%>/g;
  template = template
    .replace(evalExpr, '`); \n echo( $1 );\n echo(`')
    .replace(expr, '`); \n $1 \n echo(`');
  template = 'echo(`' + template + '`)';

  const script = `
  (function parse(data){
    var output = "";
    function echo(html){
      output += html;
    }
    ${template}
    return output;
  })`;
  return script;
}
let template = `
<ul>
  <% for(var i=0;i<data.supplies.length;i++) { %>
    <li><%= data.supplies[i] %></li>
  <% } %>
</ul>
`;
const parse = eval(compile(template));

console.log(parse({ supplies: ["broom", "mop", "cleaner"] }));



/**
(function parse(data) {
  var output = "";
  function echo(html) {
    output += html;
  }
  将非代码部分作为作为echo函数参数。代码逻辑部分作为正常js代码，%=输出部分代码也作为echo的参数拼接输出
  最后将模板的分割融入到js可操作逻辑内。parse函数被正常解析就成了
  echo(`<ul>`);
  for (var i = 0; i < data.supplies.length; i++) {
    echo(`<li>`);
    echo(data.supplies[i]);
    echo(`</li>`);
  }
  echo(`</ul>`)
  return output;
})  
 */
