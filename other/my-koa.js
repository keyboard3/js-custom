const http = require('http');

class MyServer {
  static privateListKey = Symbol("list");
  static privateServerKey = Symbol("server");
  constructor() {
    const handlers = this[MyServer.privateListKey] = [];
    this[MyServer.privateServerKey] = http.createServer((req, res) => {
      function wraperHandler(handler) {
        return async () => {
          if (!handler) return;

          let index = handlers.findIndex(item => item == handler);
          const nextHandler = handlers[index + 1];
          await handler(req, res, wraperHandler(nextHandler));
        }
      }
      wraperHandler(handlers[0])(req, res);
    });
  }
  use(handler) {
    this[MyServer.privateListKey].push(handler);
  }
  listen(port, path, callback) {
    this[MyServer.privateServerKey].listen(port, path, callback);
  }
}
const app = new MyServer();
app.use(async (req, res, next) => {
  console.log("1 start");
  await next();
  console.log("1 end");
})
app.use(async (req, res, next) => {
  console.log("2 start");
  await next();
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log("timeout 2秒 结束");
      resolve();
    }, 2000);
  });
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('okay');

  console.log("2 end");
})
app.use(async (req, res, next) => {
  console.log("3 start");
  await next();
  console.log("3 end");
})

// Now that server is running
app.listen(1337, '127.0.0.1', () => {

  http.get('http://127.0.0.1:1337/', (res) => {
    console.log("request end")
  });
});