 /** @jsx h */
import { h, render, Component } from './preact.mjs';

class Clock extends Component {
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
    return <span>{time}</span>;
  }
}

// 渲染一个clock实例到 body中
render(<Clock />, document.body);