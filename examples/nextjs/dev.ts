import express from "express";
import next from "next";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = next({
  dir: ".", // base directory where everything is, could move to src later
  dev: true,
});

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    let server = express();

    server.use(
      createProxyMiddleware("/api", {
        target: "http://localhost:3000/api",
        pathRewrite: { "^/api": "/" },
        changeOrigin: true,
      })
    );

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all("*", (req, res) => handle(req, res));

    server.listen(8000, () => {
      console.log(`> Ready on port http://localhost:8000 `);
    });
  })
  .catch((err) => {
    console.log("An error occurred, unable to start the server");
    console.log(err);
  });
