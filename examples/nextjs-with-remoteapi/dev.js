const next = require("next");

const server = require("./server");

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({
  dev: process.env.NODE_ENV !== "production",
  quiet: false
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  // call nextjs server
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
