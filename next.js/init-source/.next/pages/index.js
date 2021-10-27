const React = require("react");
class Hello extends React.Component {
  render() {
    return React.createElement("div", { dangerouslySetInnerHTML: { __html: "hello world" } });
  }
}
module.exports = {
  default: Hello
}