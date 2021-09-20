/** @jsx React.h */
import React from './src/preact.mjs';
class ChildComponent extends React.Component {
  render() {
    return (
      <Link href="/" >{this.props.children}</Link>
    );
  }
}
class Clock extends React.Component {
  constructor() {
    super();
    // 设置初始时间
    this.state.time = Date.now();
  }

  componentDidMount() {
    // 每秒更新时间
    this.timer = setInterval(() => {
      this.setState({ time: Date.now() });
    }, 1000);
  }

  componentWillUnmount() {
    // 当节点被移除之后移除监听
    clearInterval(this.timer);
  }

  render() {
    let time = new Date(this.state.time).toLocaleTimeString();
    return (
      <ChildComponent >{time}</ChildComponent>
    );
  }
}
function Link({ children, ...props }) {
  return <a {...props}>{children}</a>
};

// 渲染一个clock实例到 body中
React.render(<Clock />, document.body);