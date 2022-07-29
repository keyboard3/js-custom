/** @jsx React.h */
import * as React from './src/index.mjs';
const { useEffect, useState } = React;
function Clock() {
  const [time, setTime] = useState(0);
  React.useLayoutEffect(() => {
    if (time > 20) return;
    setTime(time + 1);
  }, [time]);
  return (<div>{time}</div>);
}

// 渲染一个clock实例到 body中
React.render(<Clock />, document.body);