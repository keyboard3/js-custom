import * as React from './src/index.mjs';
const { useEffect, useState } = React;
function Clock() {
  const [time, setTime] = useState(0);
  useEffect(() => {
    let timer = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    }
  }, []);
  return (<div>{new Date(time).toLocaleTimeString()}</div>);
}
// 渲染一个clock实例到 body中
React.render(<Clock />, document.body);