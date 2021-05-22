function passthru(literals, ...values) {
  var output = "";
  for (var index = 0; index < values.length; index++) {
    output += literals[index] + values[index];
  }
  output += literals[index];
  return output;
}
function SaferHTML(templateData) {
  var s = templateData.raw[0];
  for (var i = 1; i < arguments.length; i++) {
    var arg = String(arguments[i]);
    s += arg.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    s += templateData[i];
  }
  return s;
}
let total = 30;
console.log(passthru`The total is ${total} (${total * 1.05} with tax)`);
let sender = '<script>alert("abc")</script>';
console.log(SaferHTML`<p>\n${sender} has sent you a message.</p>`)