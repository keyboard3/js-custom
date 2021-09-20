/** @jsx React.h */
import React from './src/preact.mjs';

class Clock extends React.Component {
  constructor() {
    super(); // 设置初始时间

    this.state.time = Date.now();
  }

  componentDidMount() {
    // 每秒更新时间
    this.timer = setInterval(() => {
      this.setState({
        time: Date.now()
      });
    }, 1000);
  }

  componentWillUnmount() {
    // 当节点被移除之后移除监听
    clearInterval(this.timer);
  }

  render() {
    let time = new Date(this.state.time).toLocaleTimeString();
    return React.h("span", null, time);
  }

} // 渲染一个clock实例到 body中


React.render(React.h(Clock, null), document.body);
